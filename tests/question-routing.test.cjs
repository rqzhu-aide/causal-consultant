"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const store = require("../scripts/lib/store.cjs");
const { canonical, sha256 } = require("../scripts/lib/files.cjs");
const { PROTOCOL, RENDERER, renderExchange } = require("../scripts/lib/exchanges.cjs");
const { createFixture, interpretation, exchange, review } = require("./fixtures/multiturn.cjs");

const QUESTION_ID = "question-user-causal";
const QUESTION_TEXT = "Can these records tell us whether the program helped?";
const ANSWER_TEXT = "The allocation record is missing, so these records alone do not establish a causal effect.";

function userQuestion(status = "open", question_id = QUESTION_ID) {
  return { question_id, origin: "user", statement: QUESTION_TEXT, status, basis_refs: ["user-request"],
    ...(status === "open" ? {} : { reason: status === "answered" ? ANSWER_TEXT : "The user withdrew this question." }) };
}
function questionComponent(timing = "after_work", question_ref = QUESTION_ID) {
  return { kind: "question", meaning: QUESTION_TEXT, established: ["The user asks about causal interpretation."],
    unresolved: ["The answer depends on the available allocation evidence."], user_question_ref: question_ref, answer_timing: timing };
}
function questionInterpretation(suffix, timing = "after_work", specialist = true) {
  const value = interpretation(suffix, specialist);
  value.components.push(questionComponent(timing));
  return value;
}
function outgoing(suffix, status = "answered", question_ref = QUESTION_ID) {
  const value = { ...exchange(suffix), renderer: "lead-markdown-v3" };
  value.response.user_questions = [{ question_ref, text: QUESTION_TEXT, answer: ANSWER_TEXT, status,
    basis_refs: ["user-request"] }];
  return value;
}
function fixture() {
  const value = createFixture();
  value.append("memory_updated", { changes: { questions: [userQuestion()] } });
  return value;
}
function project(t, value = fixture()) {
  const base = fs.realpathSync.native(os.tmpdir());
  const root = fs.mkdtempSync(path.join(base, "causal-question-routing-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("causal-question-routing-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  fs.writeFileSync(path.join(root, "journal.jsonl"), value.events.map(canonical).join("\n") + "\n");
  store.recover(root);
  return root;
}
function submission(root, event_id, type, payload) {
  const state = store.readJournal(root).state;
  return { event_id, expected_project_id: state.state_meta.project_id,
    expected_last_event_id: state.state_meta.last_event_id, type, payload };
}
function record(root, event_id, type, payload, options) {
  return store.record(root, submission(root, event_id, type, payload), options);
}
function capture(root, event_id, delivery_id, exchange_ref, receipt) {
  const message_path = "fixture-message-" + delivery_id + ".txt";
  fs.writeFileSync(path.join(root, message_path), receipt.rendered_response);
  const { type, payload, ...identities } = submission(root, event_id, "exchange_delivery", {});
  return require("../scripts/lib/delivery.cjs").observe(root, { ...identities, delivery_id, exchange_ref,
    observation: "assistant_emission", message_path, source_ref: "fixture-host:" + delivery_id });
}
function rejected(root, event_id, type, payload, code) {
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(() => record(root, event_id, type, payload), { code });
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal,
    "A rejected route or closeout must not partly alter the authoritative journal.");
}

test("question-routing capability advertises the preferred renderer without removing durable exchanges", () => {
  const value = store.capabilities();
  assert.equal(RENDERER, "lead-markdown-v10");
  assert.ok(value.renderers.includes("lead-markdown-v7"));
  assert.ok(value.renderers.includes("lead-markdown-v6"));
  assert.ok(value.renderers.includes(RENDERER));
  assert.ok(value.renderers.includes("lead-markdown-v5"));
  assert.ok(value.capabilities.includes("conversational-responses-v1"));
  assert.ok(value.renderers.includes("lead-markdown-v3"));
  assert.ok(value.capabilities.includes(PROTOCOL));
  assert.ok(value.capabilities.includes("user-question-routing-v1"));
});

test("user-origin questions require attributable nonempty basis references", t => {
  const root = project(t, createFixture());
  for (const [index, basis_refs] of [undefined, []].entries()) {
    const value = userQuestion();
    if (basis_refs === undefined) delete value.basis_refs;
    else value.basis_refs = basis_refs;
    rejected(root, "event-no-basis-" + index, "memory_updated", { changes: { questions: [value] } }, "INVALID_INPUT");
  }
  record(root, "event-user-question", "memory_updated", { changes: { questions: [userQuestion()] } });
  assert.equal(store.status(root).project.questions.find(value => value.question_id === QUESTION_ID).origin, "user");
});

test("the first lead-only reply can save a newly received question and its answer together", t => {
  const root = project(t, createFixture());
  const receipt = record(root, "event-first-question", "exchange_prepared", { protocol: PROTOCOL,
    changes: { questions: [userQuestion("answered")] },
    interpretation: questionInterpretation("first", "before_work", false), exchange: outgoing("first") });
  const saved = store.status(root);
  assert.equal(saved.project.questions.find(value => value.question_id === QUESTION_ID).status, "answered");
  assert.deepEqual(saved.project.interpretations[0].user_questions,
    [{ question_ref: QUESTION_ID, answer_timing: "before_work" }]);
  assert.ok(receipt.rendered_response.startsWith("[Your Questions]\n\n"));
});

for (const timing of ["before_work", "clarify_first"]) {
  test(timing + " user questions prevent a mixed instruction from routing specialist work", t => {
    const root = project(t);
    const value = questionInterpretation("first", timing);
    rejected(root, "event-blocked-route", "reply_interpreted", { protocol: PROTOCOL, interpretation: value }, "USER_QUESTION_BLOCKS_WORK");
    value.next_action = interpretation("first").next_action;
    record(root, "event-direct-response", "reply_interpreted", { protocol: PROTOCOL, interpretation: value });
    const state = store.status(root).project;
    assert.deepEqual(state.interpretations[0].user_questions, [{ question_ref: QUESTION_ID, answer_timing: timing }]);
    assert.equal(state.interpretations[0].next_action.kind, "lead_only");
    assert.deepEqual(state.specialist_reviews, []);
    assert.deepEqual(state.runs, []);
  });
}

test("an ambiguous instruction blocks specialist work even without a user question", t => {
  const root = project(t);
  const value = interpretation("ambiguous", true);
  value.next_action.clarification_needed = "The user refers to the earlier analysis, but two incompatible targets are still open.";
  rejected(root, "event-ambiguous-work", "reply_interpreted", { protocol: PROTOCOL, interpretation: value }, "USER_QUESTION_BLOCKS_WORK");
  value.next_action.kind = "lead_only";
  delete value.next_action.assignment;
  record(root, "event-ask-clarification", "reply_interpreted", { protocol: PROTOCOL, interpretation: value });
  assert.match(store.status(root).project.interpretations[0].next_action.clarification_needed, /two incompatible targets/);
});

test("question components identify user questions and cannot reuse the old answer-binding field", t => {
  const root = project(t);
  for (const [index, change] of [
    component => { delete component.user_question_ref; },
    component => { delete component.answer_timing; },
    component => { component.answer_timing = "whenever"; },
    component => { component.user_question_ref = "question-allocation"; },
    component => { component.question_ref = component.user_question_ref; delete component.user_question_ref; }
  ].entries()) {
    const value = questionInterpretation("invalid-" + index);
    change(value.components[1]);
    rejected(root, "event-invalid-component-" + index, "reply_interpreted", { protocol: PROTOCOL, interpretation: value }, "INVALID_INPUT");
  }
});

test("an after-work question persists through interruption, review and a later lead answer", t => {
  const root = project(t);
  record(root, "event-route", "reply_interpreted", { protocol: PROTOCOL, interpretation: questionInterpretation("worker") });
  // Read only the durable helper state after recovery, as a resumed host must do.
  store.recover(root);
  let current = store.context(root, { limit: 1 });
  assert.ok(current.context.questions.some(value => value.question_id === QUESTION_ID && value.status === "open"));
  assert.ok(current.views.work.pending_user_question_refs.includes(QUESTION_ID));
  assert.ok(current.context.evidence.some(value => value.evidence_id === "user-request"));
  assert.deepEqual(current.context.interpretations[0].user_questions,
    [{ question_ref: QUESTION_ID, answer_timing: "after_work" }]);
  record(root, "event-review", "review_completed", { review: review("worker") });
  const closeout = outgoing("worker");
  closeout.completed_work_refs = ["review-worker"];
  closeout.response.user_questions[0].basis_refs = ["review-worker"];
  const receipt = record(root, "event-answer", "exchange_prepared", { protocol: PROTOCOL,
    changes: { questions: [userQuestion("answered")] }, exchange: closeout });
  store.recover(root);
  current = store.context(root, { limit: 1 });
  assert.ok(!current.views.work.pending_user_question_refs.includes(QUESTION_ID));
  assert.equal(current.context.questions.find(value => value.question_id === QUESTION_ID).status, "answered");
  assert.equal(current.context.turns.find(value => value.turn_id === "turn-worker").exchange_ref, "exchange-worker");
  assert.match(receipt.rendered_response, /\[Your Questions\]/);
  assert.ok(receipt.rendered_response.includes(ANSWER_TEXT));
  assert.ok(current.context.specialist_reviews.some(value => value.review_id === "review-worker"));
});

test("an after-work question cannot disappear when the review and closeout are committed together", t => {
  const root = project(t);
  record(root, "event-route", "reply_interpreted", { protocol: PROTOCOL, interpretation: questionInterpretation("worker") });
  const closeout = { ...exchange("worker"), renderer: "lead-markdown-v3", completed_work_refs: ["review-worker"] };
  rejected(root, "event-silent-closeout", "exchange_prepared", { protocol: PROTOCOL,
    review: review("worker"), exchange: closeout }, "UNANSWERED_USER_QUESTION");
  assert.deepEqual(store.status(root).project.specialist_reviews, [], "A rejected closeout must not leave a partial review commit.");
});

test("a redirected lead closeout must account for questions from reconciled earlier work", t => {
  const root = project(t);
  record(root, "event-route", "reply_interpreted", { protocol: PROTOCOL, interpretation: questionInterpretation("worker") });
  record(root, "event-review", "review_completed", { review: review("worker") });
  record(root, "event-redirect", "reply_interpreted", { protocol: PROTOCOL, interpretation: interpretation("redirect") });
  const closeout = { ...exchange("redirect"), renderer: "lead-markdown-v3", completed_work_refs: ["review-worker"], reconciles: ["interpretation-worker"] };
  rejected(root, "event-missing-old-answer", "exchange_prepared", { protocol: PROTOCOL, exchange: closeout }, "UNANSWERED_USER_QUESTION");
  closeout.response.user_questions = outgoing("redirect").response.user_questions;
  record(root, "event-reconciled-answer", "exchange_prepared", { protocol: PROTOCOL,
    changes: { questions: [userQuestion("answered")] }, exchange: closeout });
  const state = store.status(root).project;
  assert.equal(state.turns.find(value => value.turn_id === "turn-worker").exchange_ref, "exchange-redirect");
});

test("answered, pending and withdrawn outgoing questions agree with their saved question status", t => {
  const root = project(t);
  for (const [index, [savedStatus, responseStatus]] of [
    ["open", "answered"], ["open", "withdrawn"], ["answered", "pending"], ["retired", "pending"], ["retired", "answered"]
  ].entries()) {
    const suffix = "mismatch-" + index;
    rejected(root, "event-mismatch-" + index, "exchange_prepared", { protocol: PROTOCOL,
      interpretation: questionInterpretation(suffix, "before_work", false),
      changes: { questions: [userQuestion(savedStatus)] }, exchange: outgoing(suffix, responseStatus) }, "INVALID_INPUT");
  }
  for (const [index, [savedStatus, responseStatus]] of [
    ["open", "pending"], ["answered", "answered"], ["retired", "withdrawn"]
  ].entries()) {
    const suffix = "consistent-" + index;
    const question = userQuestion(savedStatus);
    const evidence = savedStatus === "retired" ? [{ evidence_id: "user-withdrawal", kind: "user_statement", source_ref: "chat:withdrawal",
      source_excerpt: "Please drop my causal interpretation question for now.", summary: "The user withdraws the pending causal question." }] : [];
    if (evidence.length) question.basis_refs.push("user-withdrawal");
    record(root, "event-consistent-" + index, "exchange_prepared", { protocol: PROTOCOL,
      interpretation: questionInterpretation(suffix, "before_work", false),
      changes: { questions: [question], evidence }, exchange: outgoing(suffix, responseStatus) });
    assert.equal(store.status(root).project.questions.find(value => value.question_id === QUESTION_ID).status, savedStatus);
  }
});

test("pending remains allowed after a review when the answer is still scientifically unavailable", t => {
  const root = project(t);
  record(root, "event-route", "reply_interpreted", { protocol: PROTOCOL, interpretation: questionInterpretation("worker") });
  const closeout = outgoing("worker", "pending");
  closeout.completed_work_refs = ["review-worker"];
  closeout.response.user_questions[0].answer = "The inventory review found no allocation record. The causal interpretation remains pending until the allocation process is clarified.";
  record(root, "event-pending-closeout", "exchange_prepared", { protocol: PROTOCOL, review: review("worker"), exchange: closeout });
  const status = store.status(root);
  assert.equal(status.project.questions.find(value => value.question_id === QUESTION_ID).status, "open");
  assert.ok(status.views.work.pending_user_question_refs.includes(QUESTION_ID));
});

test("an open user question remains in minimal context after several unrelated closed exchanges", t => {
  const root = project(t);
  record(root, "event-question-source", "memory_updated", { changes: {
    evidence: [{ evidence_id: "user-question-source", kind: "user_statement", source_ref: "chat:user-causal-question",
      summary: "The user asks a causal question while discussing report formatting.", source_excerpt: QUESTION_TEXT }],
    questions: [{ ...userQuestion(), basis_refs: ["user-request", "user-question-source"] }]
  } });
  const first = record(root, "event-pending", "exchange_prepared", { protocol: PROTOCOL,
    interpretation: questionInterpretation("first", "clarify_first", false), exchange: outgoing("first", "pending") });
  capture(root, "event-first-delivery", "delivery-first", "exchange-first", first);
  for (let index = 0; index < 8; index++) {
    const suffix = "aside-" + index;
    const receipt = record(root, "event-aside-" + index, "exchange_prepared", { protocol: PROTOCOL,
      interpretation: interpretation(suffix), exchange: { ...exchange(suffix), renderer: "lead-markdown-v3" } });
    capture(root, "event-delivery-" + index, "delivery-" + suffix, "exchange-" + suffix, receipt);
  }
  store.recover(root);
  const selected = store.context(root, { limit: 1 });
  assert.ok(selected.context.questions.some(value => value.question_id === QUESTION_ID));
  assert.ok(selected.views.work.pending_user_question_refs.includes(QUESTION_ID));
  assert.ok(selected.context.evidence.some(value => value.evidence_id === "user-question-source"));
  assert.deepEqual(selected.views.work.unfinished_turns, [],
    "Question retention must not depend on an unclosed or unobserved old turn.");
});

test("the lead cannot turn the user's unanswered question into its own request for information", t => {
  const root = project(t);
  const closeout = outgoing("first", "pending");
  closeout.response.questions[0].question_ref = QUESTION_ID;
  rejected(root, "event-reversed-question", "exchange_prepared", { protocol: PROTOCOL,
    interpretation: questionInterpretation("first", "before_work", false), exchange: closeout }, "INVALID_INPUT");
});

test("older renderers reject user answers they cannot display", t => {
  const root = project(t);
  for (const [index, renderer] of ["lead-markdown-v1", "lead-markdown-v2"].entries()) {
    const suffix = "old-" + index, closeout = outgoing(suffix, "pending");
    closeout.renderer = renderer;
    rejected(root, "event-old-renderer-" + index, "exchange_prepared", { protocol: PROTOCOL,
      interpretation: questionInterpretation(suffix, "before_work", false), exchange: closeout }, "INVALID_INPUT");
  }
});

test("v3 presents user questions first and keeps all section labels separated from their content", () => {
  const value = outgoing("first", "pending");
  const rendered = renderExchange(value);
  assert.deepEqual(rendered.match(/^\[[^\]\n]+\]$/gm), ["[Your Questions]", "[Status]", "[I want to know]", "[Decide Next Steps]"]);
  for (const heading of ["Your Questions", "Status", "I want to know", "Decide Next Steps"]) {
    assert.ok(rendered.includes("[" + heading + "]\n\n"));
  }
  assert.ok(rendered.indexOf(QUESTION_TEXT) < rendered.indexOf("[Status]"));
  assert.ok(rendered.indexOf(ANSWER_TEXT) < rendered.indexOf("[Status]"));
  assert.ok(!rendered.includes(QUESTION_ID), "Internal question identities are not user-facing labels.");
  assert.equal(rendered,
    "[Your Questions]\n\n1. Can these records tell us whether the program helped?\n   The allocation record is missing, so these records alone do not establish a causal effect.\n\n[Status]\n\nThe allocation procedure remains unverified.\n\n[I want to know]\n\n1. Do you have the allocation record?\n   Why this matters: It would clarify how treatment was assigned.\n   Helpful information: The record or an account of the allocation process.\n\n[Decide Next Steps]\n\n1. Inspect the allocation record\n   consultant: Check the supplied record and its limitations.\n\n2. Explain why allocation matters\n   consultant: Explain assignment using the study context.");
  const noQuestion = { ...exchange("second"), renderer: "lead-markdown-v3" };
  assert.deepEqual(renderExchange(noQuestion).match(/^\[[^\]\n]+\]$/gm), ["[Status]", "[I want to know]", "[Decide Next Steps]"]);
  noQuestion.response.user_questions = [];
  assert.ok(!renderExchange(noQuestion).includes("[Your Questions]"));
});

test("v3 committed response retries preserve its exact user answer after newer messages and projection recovery", t => {
  const root = project(t);
  const first = submission(root, "event-first-answer", "exchange_prepared", { protocol: PROTOCOL,
    interpretation: questionInterpretation("first", "before_work", false),
    changes: { questions: [userQuestion("answered")] }, exchange: outgoing("first") });
  const receipt = store.record(root, first, { hooks: { beforeProjection() { throw new Error("interrupted after journal commit"); } } });
  assert.equal(receipt.committed, true);
  assert.equal(receipt.projection_written, false);
  assert.equal(receipt.renderer, "lead-markdown-v3");
  assert.equal(receipt.response_sha256, sha256(receipt.rendered_response));
  record(root, "event-later", "exchange_prepared", { protocol: PROTOCOL,
    interpretation: interpretation("later"), exchange: { ...exchange("later"), renderer: "lead-markdown-v3" } });
  const original = fs.readFileSync(path.join(root, "journal.jsonl"));
  const replay = store.record(root, first);
  assert.equal(replay.replayed, true);
  assert.equal(replay.current_last_event_id, "event-later");
  assert.equal(replay.rendered_response, receipt.rendered_response);
  assert.equal(replay.response_sha256, receipt.response_sha256);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), original);
  store.recover(root);
  const state = store.status(root);
  assert.equal(state.project.questions.find(value => value.question_id === QUESTION_ID).status, "answered");
  assert.equal(state.project.exchanges.find(value => value.exchange_id === "exchange-first").response_sha256, receipt.response_sha256);
});

test("v1 and v2 committed responses and delivery hashes replay unchanged after v3 adoption", t => {
  const historical = fixture(), older = [];
  for (const [index, renderer] of ["lead-markdown-v1", "lead-markdown-v2"].entries()) {
    const suffix = "historical-" + index;
    const payload = { protocol: PROTOCOL, interpretation: interpretation(suffix), exchange: { ...exchange(suffix), renderer } };
    const event = historical.append("exchange_prepared", payload, "event-historical-" + index);
    const request = { event_id: event.event_id, expected_project_id: event.project_id,
      expected_last_event_id: event.previous_event_id, type: event.type, payload };
    const receipt = require("../scripts/lib/exchanges.cjs").exchangeReceipt(event);
    historical.append("exchange_delivery", { protocol: PROTOCOL, delivery: {
      delivery_id: "delivery-" + suffix, exchange_ref: "exchange-" + suffix, observation: "assistant_emission",
      source_ref: "chat:assistant-historical-" + index, response_sha256: receipt.response_sha256 } }, "event-historical-delivery-" + index);
    older.push({ request, receipt, suffix });
  }
  const root = project(t, historical);
  const historicalBytes = fs.readFileSync(path.join(root, "journal.jsonl"));
  record(root, "event-current-v3", "exchange_prepared", { protocol: PROTOCOL,
    interpretation: questionInterpretation("current", "before_work", false),
    changes: { questions: [userQuestion("answered")] }, exchange: outgoing("current") });
  const committed = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.deepEqual(committed.subarray(0, historicalBytes.length), historicalBytes);
  for (const { request, receipt, suffix } of older) {
    const replay = store.record(root, request);
    assert.equal(replay.replayed, true);
    assert.equal(replay.renderer, receipt.renderer);
    assert.equal(replay.rendered_response, receipt.rendered_response);
    assert.equal(replay.response_sha256, receipt.response_sha256);
    assert.equal(replay.current_last_event_id, "event-current-v3");
    assert.equal(store.status(root).project.deliveries.find(value => value.delivery_id === "delivery-" + suffix).response_sha256, receipt.response_sha256);
  }
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), committed);
});
