"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { emptyState, applyEvent, createReplayBuilder, validateSemantic } = require("../scripts/lib/model.cjs");
const { canonical, sha256 } = require("../scripts/lib/files.cjs");
const { PROTOCOL, renderExchange, exchangeReceipt } = require("../scripts/lib/exchanges.cjs");
const { createFixture, interpretation, exchange, review, TIME } = require("./fixtures/multiturn.cjs");

function request(fixture, type, payload, eventId = "event-next") {
  return { event_id: eventId, expected_project_id: fixture.state.state_meta.project_id,
    expected_last_event_id: fixture.state.state_meta.last_event_id, type, payload };
}
function reject(fixture, type, payload, code) {
  const before = canonical(fixture.state);
  assert.throws(() => validateSemantic(fixture.state, request(fixture, type, payload)), { code });
  assert.equal(canonical(fixture.state), before);
}
function delivered(fixture, suffix) {
  const record = fixture.state.exchanges.find(entry => entry.exchange_id === "exchange-" + suffix);
  return { delivery_id: "delivery-" + suffix, exchange_ref: record.exchange_id, observation: "assistant_emission",
    source_ref: "conversation:assistant-message-" + suffix, response_sha256: record.response_sha256 };
}
function condition() {
  return { condition_id: "condition-interval", evidence_ref: "user-request", result_locator: "source:reported-interval", claim: "An interval was reported.", target: "Constant additive effect", assumption_refs: ["assumption-constant"], basis_refs: ["user-request"], limitations: ["The assumption is adopted, not observed."],
    inference: { kind: "interval", target: "Common additive effect", guarantee: "Coverage conditional on the constant-effect model." } };
}

test("old histories retain their exact projection shape and no invented conversation coverage", () => {
  const f = createFixture();
  assert.equal(f.state.state_meta.protocol, undefined);
  for (const name of ["interpretations", "exchanges", "deliveries", "turns", "user_context", "result_conditions"]) assert.equal(f.state[name], undefined);
  const old = canonical(f.events);
  f.interpret("first");
  assert.equal(canonical(f.events.slice(0, 2)), old);
  assert.equal(f.state.state_meta.protocol, PROTOCOL);
});

test("lead-only intake batches interpretation, questions and exact outgoing response", () => {
  const f = createFixture();
  const event = f.append("exchange_prepared", { protocol: PROTOCOL, interpretation: interpretation("first"), exchange: exchange("first") });
  const receipt = exchangeReceipt(event);
  assert.equal(receipt.rendered_response, "[Status]\nThe allocation procedure remains unverified.\n\n[Questions]\n1. Do you have the allocation record?\n   Why this matters: It would clarify how treatment was assigned.\n   Helpful information: The record or an account of the allocation process.\n\n[Next Steps]\n1. Inspect the allocation record\n   consultant: Check the supplied record and its limitations.\n\n2. Explain why allocation matters\n   consultant: Explain assignment using the study context.");
  assert.equal(receipt.response_sha256, sha256(receipt.rendered_response));
  assert.deepEqual(f.state.turns[0], { turn_id: "turn-first", interpretation_ref: "interpretation-first", work_refs: [], exchange_ref: "exchange-first" });
  assert.equal(f.state.interpretations[0].components, undefined);
  assert.equal(f.state.exchanges[0].response, undefined);
  assert.deepEqual(f.state.deliveries, []);
});

test("unknown protocols and renderer versions are rejected", () => {
  const f = createFixture();
  reject(f, "reply_interpreted", { protocol: "durable-exchanges-v2", interpretation: interpretation("first") }, "UNSUPPORTED_PROTOCOL");
  f.interpret("first");
  reject(f, "exchange_prepared", { protocol: PROTOCOL, exchange: { ...exchange("first"), renderer: "lead-markdown-v999" } }, "INVALID_INPUT");
});

test("required record objects cannot be skipped with null or false payloads", () => {
  const f = createFixture();
  for (const [type, key] of [["reply_interpreted", "interpretation"], ["exchange_prepared", "exchange"], ["exchange_delivery", "delivery"]]) {
    for (const value of [null, false]) reject(f, type, { protocol: PROTOCOL, [key]: value }, "INVALID_INPUT");
  }
  reject(f, "review_completed", { review: null }, "INVALID_INPUT");
});

test("unobserved preparation cannot bind an option or answer to a question", () => {
  const f = createFixture(); f.interpret("first"); f.prepare("first");
  for (const referent of [{ option_id: "inspect-record", kind: "selection" }, { question_ref: "question-allocation", kind: "answer" }]) {
    const next = interpretation("second");
    next.components = [{ meaning: "Yes", established: [], unresolved: [], exchange_ref: "exchange-first", ...referent }];
    reject(f, "reply_interpreted", { protocol: PROTOCOL, interpretation: next }, "UNOBSERVED_EXCHANGE");
  }
});

test("mixed reply keeps selection, uncertain availability and fresh instruction separate", () => {
  const f = createFixture(); f.interpret("first"); f.prepare("first");
  const next = interpretation("second", true);
  next.components = [
    { kind: "selection", meaning: "Choose inspection", established: ["Inspection requested"], unresolved: [], exchange_ref: "exchange-first", option_id: "inspect-record", delivery_ref: "delivery-first" },
    { kind: "answer", meaning: "The user thinks the record exists.", established: ["Possible availability reported"], unresolved: ["Record contents have not been provided."], exchange_ref: "exchange-first", question_ref: "question-allocation", delivery_ref: "delivery-first" },
    { kind: "instruction", meaning: "Explain the result in domain language.", established: ["Communication preference"], unresolved: [] }
  ];
  const event = f.append("reply_interpreted", { protocol: PROTOCOL, delivery: delivered(f, "first"), interpretation: next });
  assert.equal(event.payload.interpretation.components.length, 3);
  assert.equal(f.state.deliveries[0].observation, "assistant_emission");
  assert.equal(f.state.questions[0].status, "open");
});

test("option, question and delivery identities must belong to the actual cited exchange", () => {
  const f = createFixture(); f.interpret("first"); f.prepare("first");
  f.append("exchange_delivery", { protocol: PROTOCOL, delivery: delivered(f, "first") });
  f.interpret("second");
  const other = exchange("second"); other.response.next_steps[0].option_id = "other-option";
  f.append("exchange_prepared", { protocol: PROTOCOL, exchange: other });
  const next = interpretation("third");
  next.components = [{ kind: "selection", meaning: "Choose option", established: [], unresolved: [], exchange_ref: "exchange-first", option_id: "other-option", delivery_ref: "delivery-first" }];
  reject(f, "reply_interpreted", { protocol: PROTOCOL, interpretation: next }, "UNKNOWN_REFERENCE");
  next.components[0].option_id = "inspect-record"; next.components[0].exchange_ref = "exchange-second";
  reject(f, "reply_interpreted", { protocol: PROTOCOL, interpretation: next }, "UNKNOWN_REFERENCE");
});

test("selected assigned offers require either matching work or an explicit routing adjustment", () => {
  const f = createFixture(); f.interpret("first"); f.prepare("first");
  f.append("exchange_delivery", { protocol: PROTOCOL, delivery: delivered(f, "first") });
  const next = interpretation("second", true);
  next.components = [{ kind: "selection", meaning: "Inspect the record", established: ["The requested inspection is selected."], unresolved: [], exchange_ref: "exchange-first", option_id: "inspect-record", delivery_ref: "delivery-first" }];
  validateSemantic(f.state, request(f, "reply_interpreted", { protocol: PROTOCOL, interpretation: next }));
  next.next_action.assignment = { specialist_id: "domain_expert", operation: "review" };
  reject(f, "reply_interpreted", { protocol: PROTOCOL, interpretation: next }, "ASSIGNMENT_MISMATCH");
  next.next_action = { kind: "lead_only", scope: "Explain why inspection cannot proceed yet.", reason: "The selected record has not been supplied." };
  reject(f, "reply_interpreted", { protocol: PROTOCOL, interpretation: next }, "ASSIGNMENT_MISMATCH");
  next.next_action.adjustment_reason = "The offer presupposed an available record; the current source only establishes the user's request. Clarify availability before dependent inspection.";
  const event = f.append("reply_interpreted", { protocol: PROTOCOL, interpretation: next });
  assert.deepEqual(event.payload.interpretation.basis_refs, ["user-request"]);
  assert.equal(event.payload.interpretation.components[0].kind, "selection");
  assert.equal(f.state.interpretations.at(-1).next_action.kind, "lead_only");
});

test("discussion and user-information choices cannot silently become specialist assignments", () => {
  for (const option of [
    { option_id: "explain", kind: "discussion", label: "Explain why allocation matters", actor: "consultant", scope: "Explain assignment in this study.", basis_refs: [] },
    { option_id: "share", kind: "action", label: "Share the record", actor: "user", scope: "Supply the allocation record.", basis_refs: [] }
  ]) {
    const f = createFixture(); f.interpret("first");
    const outgoing = exchange("first"); outgoing.response.next_steps = [option];
    f.append("exchange_prepared", { protocol: PROTOCOL, exchange: outgoing });
    f.append("exchange_delivery", { protocol: PROTOCOL, delivery: delivered(f, "first") });
    assert.equal(f.state.exchanges[0].options[0].kind, option.kind);
    assert.equal(f.state.exchanges[0].options[0].actor, option.actor);
    const next = interpretation("second");
    next.components = [{ kind: "selection", meaning: option.label, established: ["The displayed option was selected."], unresolved: [], exchange_ref: "exchange-first", option_id: option.option_id, delivery_ref: "delivery-first" }];
    validateSemantic(f.state, request(f, "reply_interpreted", { protocol: PROTOCOL, interpretation: next }));
    next.next_action = interpretation("second", true).next_action;
    reject(f, "reply_interpreted", { protocol: PROTOCOL, interpretation: next }, "ASSIGNMENT_MISMATCH");
    next.components.push({ kind: "instruction", meaning: "Also inspect the newly supplied record now.", established: ["The user directly requests the inspection."], unresolved: [] });
    next.next_action.adjustment_reason = "The current message separately requests inspection and supplies the record; the selected discussion or sharing option alone did not request a specialist.";
    f.append("reply_interpreted", { protocol: PROTOCOL, interpretation: next });
    assert.equal(f.state.interpretations.at(-1).next_action.kind, "specialist");
  }
});

test("delivery identifies an earlier committed response and its exact content hash", () => {
  const f = createFixture(); f.interpret("first"); f.prepare("first");
  reject(f, "exchange_delivery", { protocol: PROTOCOL, delivery: { ...delivered(f, "first"), response_sha256: "a".repeat(64) } }, "DELIVERY_MISMATCH");
  reject(f, "exchange_delivery", { protocol: PROTOCOL, delivery: { ...delivered(f, "first"), observation: "user_understood" } }, "INVALID_INPUT");
  f.append("exchange_delivery", { protocol: PROTOCOL, delivery: { ...delivered(f, "first"), observation: "host_confirmed", observed_at: TIME } });
  assert.equal(f.state.deliveries[0].observation, "host_confirmed");
  reject(f, "exchange_delivery", { protocol: PROTOCOL, delivery: delivered(f, "first") }, "DUPLICATE_ID");
});

test("clear new instruction proceeds without a prior exchange or delivery", () => {
  const f = createFixture(); f.interpret("direct", true);
  assert.equal(f.state.interpretations[0].next_action.kind, "specialist");
  assert.equal(f.state.turns[0].exchange_ref, null);
});

test("specialist review requires a prospectively committed matching assignment", () => {
  const f = createFixture(); f.interpret("first", true);
  const missing = review("first"); delete missing.interpretation_ref;
  reject(f, "review_completed", { review: missing }, "MISSING_INTERPRETATION");
  const wrong = review("first"); wrong.assignment = { specialist_id: "domain_expert", operation: "review" };
  reject(f, "review_completed", { review: wrong }, "ASSIGNMENT_MISMATCH");
  f.append("review_completed", { review: review("first") });
  assert.deepEqual(f.state.turns[0].work_refs, ["review-first"]);
  reject(f, "review_completed", { review: { ...review("first"), review_id: "review-again" } }, "DUPLICATE_REVIEW");
});

test("specialist interpretation cannot be batched after its work in closeout", () => {
  const f = createFixture();
  reject(f, "exchange_prepared", { protocol: PROTOCOL, interpretation: interpretation("first", true), exchange: exchange("first"), review: review("first") }, "INVALID_INPUT");
});

test("a prepared closeout cannot authorize later unrecorded specialist work on the same turn", () => {
  const f = createFixture(); f.interpret("first", true); f.prepare("first");
  reject(f, "review_completed", { review: review("first") }, "TURN_CLOSED");
});

test("combined specialist handoff and lead closeout stores and accounts for the review once", () => {
  const f = createFixture(); f.interpret("first", true);
  reject(f, "exchange_prepared", { protocol: PROTOCOL, exchange: exchange("first"), review: review("first") }, "UNRECONCILED_WORK");
  f.append("exchange_prepared", { protocol: PROTOCOL, exchange: { ...exchange("first"), completed_work_refs: ["review-first"] }, review: review("first") });
  assert.equal(f.state.specialist_reviews.length, 1);
  assert.equal(f.state.specialist_reviews[0].interpretation_ref, "interpretation-first");
  assert.equal(f.state.turns[0].exchange_ref, "exchange-first");
});

test("redirection preserves interrupted work until the new closeout explicitly reconciles it", () => {
  const f = createFixture(); f.interpret("first", true);
  f.append("review_completed", { review: review("first") });
  f.interpret("second");
  assert.equal(f.state.turns[0].exchange_ref, null);
  const next = { ...exchange("second"), reconciles: ["interpretation-first"] };
  reject(f, "exchange_prepared", { protocol: PROTOCOL, exchange: next }, "UNRECONCILED_WORK");
  next.completed_work_refs = ["review-first"];
  f.append("exchange_prepared", { protocol: PROTOCOL, exchange: next });
  assert.equal(f.state.turns[0].exchange_ref, "exchange-second");
  assert.equal(f.state.turns[1].exchange_ref, "exchange-second");
  assert.deepEqual(f.state.turns[0].work_refs, ["review-first"]);
});

test("run progress remains linked and later completion reopens previously prepared closeout", () => {
  const f = createFixture(); f.interpret("first", true);
  const run = { run_id: "run-first", kind: "audit", status: "in_progress", interpretation_ref: "interpretation-first" };
  f.append("run_started", { run });
  reject(f, "exchange_prepared", { protocol: PROTOCOL, exchange: { ...exchange("first"), completed_work_refs: ["run-first"] } }, "INCOMPLETE_RUN");
  f.prepare("first");
  f.append("run_finalized", { run: { ...run, status: "completed" } });
  assert.equal(f.state.turns[0].exchange_ref, null);
  assert.deepEqual(f.state.turns[0].work_refs, ["run-first"]);
  reject(f, "exchange_prepared", { protocol: PROTOCOL, exchange: { ...exchange("first"), exchange_id: "exchange-revised", supersedes: "exchange-first" } }, "UNRECONCILED_WORK");
});

test("run lifecycle replay cannot change, remove or retroactively add interpretation attribution", () => {
  const f = createFixture(); f.interpret("first", true); f.interpret("second", true);
  const attributed = { run_id: "run-first", kind: "audit", status: "in_progress", interpretation_ref: "interpretation-first" };
  f.append("run_started", { run: attributed });
  for (const type of ["run_finalized", "run_failed", "run_abandoned"]) {
    const terminalStatus = { run_finalized: "completed", run_failed: "failed", run_abandoned: "abandoned" }[type];
    const changed = { ...attributed, status: terminalStatus, interpretation_ref: "interpretation-second" };
    const removed = { ...attributed, status: terminalStatus }; delete removed.interpretation_ref;
    for (const run of [changed, removed]) {
      const before = canonical(f.state);
      assert.throws(() => f.append(type, { run }), { code: "INVALID_EVENT" });
      assert.equal(canonical(f.state), before);
    }
  }
  const legacy = { run_id: "run-legacy", kind: "audit", status: "in_progress" };
  f.append("run_started", { run: legacy });
  const before = canonical(f.state);
  assert.throws(() => f.append("run_finalized", { run: { ...legacy, status: "completed", interpretation_ref: "interpretation-first" } }), { code: "INVALID_EVENT" });
  assert.equal(canonical(f.state), before);
  f.append("run_finalized", { run: { ...legacy, status: "completed" } });
  f.append("run_finalized", { run: { ...attributed, status: "completed" } });
  assert.deepEqual(f.state.turns[0].work_refs, ["run-first"]);
  assert.deepEqual(f.state.turns[1].work_refs, []);
  assert.equal(f.state.runs.find(run => run.run_id === "run-legacy").interpretation_ref, undefined);
});

test("exchange revisions preserve history and require a same-turn supersession reference", () => {
  const f = createFixture(); f.interpret("first"); const original = f.prepare("first");
  const oldReceipt = exchangeReceipt(original);
  const revised = { ...exchange("first"), exchange_id: "exchange-revised" };
  revised.response.status = "The user clarified that the record is unavailable.";
  reject(f, "exchange_prepared", { protocol: PROTOCOL, exchange: revised }, "MISSING_SUPERSESSION");
  revised.supersedes = "exchange-first";
  f.append("exchange_prepared", { protocol: PROTOCOL, exchange: revised });
  assert.equal(f.state.exchanges.length, 2);
  assert.deepEqual(exchangeReceipt(original), oldReceipt);
  assert.notEqual(f.state.exchanges[0].response_sha256, f.state.exchanges[1].response_sha256);
});

test("finished lead-only rounds require explicit empty-section wording and no filler", () => {
  const f = createFixture(); f.interpret("first");
  const complete = exchange("first");
  complete.response = { status: "The requested explanation is complete.", questions: [], next_steps: [], questions_none: "No further questions.", next_steps_none: "The explanation is complete." };
  f.append("exchange_prepared", { protocol: PROTOCOL, exchange: complete });
  assert.equal(renderExchange(complete), "[Status]\nThe requested explanation is complete.\n\n[Questions]\nNo further questions.\n\n[Next Steps]\nThe explanation is complete.");
  const missing = structuredClone(complete); missing.exchange_id = "exchange-missing"; missing.supersedes = "exchange-first"; delete missing.response.questions_none;
  reject(f, "exchange_prepared", { protocol: PROTOCOL, exchange: missing }, "INVALID_INPUT");
});

test("question identities and option IDs cannot be duplicated or promoted from discussion", () => {
  const f = createFixture(); f.interpret("first");
  for (const section of ["questions", "next_steps"]) {
    const value = exchange("first"); value.response[section].push(structuredClone(value.response[section][0]));
    reject(f, "exchange_prepared", { protocol: PROTOCOL, exchange: value }, "INVALID_INPUT");
  }
  const value = exchange("first"); value.response.next_steps[0].kind = "discussion";
  reject(f, "exchange_prepared", { protocol: PROTOCOL, exchange: value }, "INVALID_INPUT");
});

test("multiline scope remains nested beneath its real numbered option", () => {
  const f = createFixture(); f.interpret("first");
  const value = exchange("first");
  value.response.next_steps[0].scope = "Inspect the record.\n2. This is a quoted source item, not another offered option.";
  const event = f.append("exchange_prepared", { protocol: PROTOCOL, exchange: value });
  assert.match(exchangeReceipt(event).rendered_response, /\n   2\. This is a quoted/);
  const invalid = exchange("first"); invalid.exchange_id = "exchange-revised"; invalid.supersedes = "exchange-first";
  invalid.response.next_steps[0].label = "Inspect\n3. Another choice";
  reject(f, "exchange_prepared", { protocol: PROTOCOL, exchange: invalid }, "INVALID_INPUT");
});

test("user context and per-result conditions retain attribution and separate adopted assumptions", () => {
  const f = createFixture();
  f.append("memory_updated", { changes: {
    assumptions: [{ assumption_id: "assumption-constant", statement: "Treatment effects are constant.", status: "active", basis_refs: ["user-request"] }],
    result_conditions: [condition()],
    user_context: [{ context_id: "context-domain", kind: "domain_expertise", statement: "Tentatively familiar with allocation logistics.", basis_refs: ["user-request"], status: "current" }] } });
  assert.equal(f.state.result_conditions[0].inference.guarantee, "Coverage conditional on the constant-effect model.");
  assert.equal(f.state.user_context[0].basis_refs[0], "user-request");
  assert.equal(f.state.state_meta.protocol, undefined);
  const replacement = { ...condition(), assumption_refs: [], limitations: ["A new scientific review explicitly judged no listed governing assumptions."] };
  f.append("memory_updated", { changes: { result_conditions: [replacement] } });
  assert.equal(f.state.result_conditions.length, 1);
  assert.deepEqual(f.state.result_conditions[0].assumption_refs, []);
  assert.equal(f.events.at(-2).payload.changes.result_conditions[0].assumption_refs[0], "assumption-constant");
});

test("result conditions reject wrong reference kinds and tests require the actual hypothesis", () => {
  const f = createFixture();
  const invalid = condition(); invalid.assumption_refs = ["user-request"];
  reject(f, "memory_updated", { changes: { result_conditions: [invalid] } }, "UNKNOWN_REFERENCE");
  invalid.assumption_refs = []; invalid.inference.kind = "test";
  reject(f, "memory_updated", { changes: { result_conditions: [invalid] } }, "INVALID_INPUT");
  invalid.inference.hypothesis = "No unit has any treatment effect.";
  f.append("memory_updated", { changes: { result_conditions: [invalid] } });
  assert.equal(f.state.result_conditions[0].inference.hypothesis, "No unit has any treatment effect.");
});

test("all extended events replay without changing source bytes or duplicating reviews", () => {
  const f = createFixture(); f.interpret("first", true);
  f.append("exchange_prepared", { protocol: PROTOCOL, exchange: { ...exchange("first"), completed_work_refs: ["review-first"] }, review: review("first") });
  f.append("exchange_delivery", { protocol: PROTOCOL, delivery: delivered(f, "first") });
  const before = canonical(f.events);
  const builder = createReplayBuilder("project-multiturn", TIME);
  let copy = emptyState("project-multiturn", TIME), replay;
  for (const event of f.events) {
    copy = applyEvent(copy, event); replay = builder.apply(event);
    assert.deepEqual(replay, copy);
  }
  assert.deepEqual(replay, f.state);
  assert.equal(canonical(f.events), before);
  assert.equal(replay.specialist_reviews.length, 1);
});
