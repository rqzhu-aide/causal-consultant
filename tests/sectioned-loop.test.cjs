"use strict";

// These supplied interpretations test record representability and continuity.
// Synthetic captures do not establish live-host fidelity or model comprehension.
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/store.cjs"), author = require("../scripts/lib/authoring.cjs");
const { renderExchange } = require("../scripts/lib/exchanges.cjs");
const f = require("./fixtures/consultation-loop.cjs");

function project(t) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-sectioned-loop-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("cc-sectioned-loop-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  store.init(root, { project_id: "sectioned-loop", event_id: "event-init" });
  return root;
}
const direct = { kind: "lead_only", scope: "Discuss the available evidence.", reason: "The user needs an explanation before further analysis." };
const submit = (root, op, body) => author.submit(root, { at: store.context(root, { mode: "brief" }).state_token, op, ...body });
function incoming(root, suffix, words, components, changes = {}) {
  const interpretation = { interpretation_id: "interpretation-" + suffix, turn_id: "turn-" + suffix,
    incoming_refs: ["source-" + suffix], basis_refs: [], next_action: direct, components };
  submit(root, "reply_interpreted", { interpretation, changes: { ...changes,
    evidence: [{ ...f.statement("source-" + suffix, words), complete_message: true }] } });
  return interpretation;
}
function close(root, interpretation, suffix, response) {
  const receipt = submit(root, "exchange_prepared", { exchange: { exchange_id: "exchange-" + suffix,
    interpretation_ref: interpretation.interpretation_id, basis_refs: [], completed_work_refs: [],
    reconciliation: { changes: [], limitations: [], unresolved: [], next_direction: "Follow the user's direction while retaining unresolved questions." }, response } });
  assert.equal(receipt.renderer, "lead-markdown-v10");
  assert.equal(fs.readFileSync(path.join(root, receipt.response_path), "utf8"), receipt.rendered_response);
  const delivery_ref = f.deliver(root, receipt.exchange_id, suffix);
  return { receipt, delivery_ref };
}
const component = (kind, meaning, established, unresolved, refs = {}) => ({ kind, meaning, established, unresolved, ...refs });
const question = (root, ref) => f.state(root).questions.find(item => item.question_id === ref);
const exact = (root, ref, field) => store.history(root, { record_id: ref }).events
  .find(event => event.payload[field]?.[field + "_id"] === ref).payload[field];

test("v9 section numbers preserve question answers, explicit choice, pause and corrected answers through a saved conversation", t => {
  const root = project(t);
  // A protected option makes accidental authorization consequential. The user
  // supplies facts and later chooses only the independent explanation option.
  const offer = f.prepareScope(root, { kind: "analysis", objective: "Estimate the randomized offer effect.",
    target: "Mean next-term score effect of an offer", population: "Randomized applicants", inputs: [],
    claim_boundary: "Offer effect in the randomized cohort only.", treatment: "Offer", comparator: "No offer",
    outcome: "Next-term score", timing: "Next term", estimand: "Intention-to-treat mean difference",
    design_id: "randomized_assignment", estimator: "Difference of means", exclusions: [],
    diagnostics: ["Check assignment and missing outcomes by arm."] });
  const seats = { question_id: "question-seats", origin: "consultant", status: "open",
    statement: "How many seats are allocated per center, and can unused seats be pooled?" };
  const rule = { question_id: "question-rule", origin: "consultant", status: "open",
    statement: "Is the dated allocation rule available?" };
  const opening = incoming(root, "opening", "Ask about the allocation records before I choose further work.",
    [component("instruction", "Clarify the allocation records before any analysis selection.", [], [])],
    { questions: [seats, rule] });
  const response = { status: "The offer-effect analysis is proposed; allocation details remain unresolved.",
    questions: [{ question_ref: seats.question_id, text: seats.statement }, { question_ref: rule.question_id, text: rule.statement }],
    next_steps: [{ option_id: "estimate", kind: "action", actor: "consultant", label: "Run the proposed offer-effect analysis",
      scope: "Use the saved analysis scope.", basis_refs: [], scope_ref: offer.scope.scope_id },
    { option_id: "explain", kind: "discussion", actor: "consultant", label: "Explain why allocation details matter",
      scope: "Discuss the design without estimating an effect.", basis_refs: [] }] };
  const first = close(root, opening, "opening", response);
  assert.match(first.receipt.rendered_response, /\[Questions for you\]\n\n\[1\] How many seats/);
  assert.match(first.receipt.rendered_response, /\[Next steps\]\n\n\[1\] Run the proposed/);
  const replyTo = { exchange_ref: first.receipt.exchange_id, delivery_ref: first.delivery_ref };
  const originalExchange = exact(root, first.receipt.exchange_id, "exchange");
  const originalDelivery = structuredClone(f.state(root).deliveries.find(item => item.delivery_id === first.delivery_ref));

  const partialWords = "Under Questions for you: [1] Twenty seats per center, but I do not know whether unused seats can be pooled. [2] I do not know whether the dated rule is available. I am only answering the questions.";
  const partial = incoming(root, "partial", partialWords, [
    component("answer", "Twenty seats per center; pooling is unknown.", ["Twenty seats per center."], ["Can unused seats be pooled?"],
      { ...replyTo, question_ref: seats.question_id }),
    component("unknown", "Availability of the dated rule is unknown.", [], ["Is the dated allocation rule available?"],
      { ...replyTo, question_ref: rule.question_id })
  ], { questions: [
    { ...seats, resolution: { answer_refs: ["source-partial"], remaining: ["Can unused seats be pooled?"] } },
    { ...rule, resolution: { answer_refs: ["source-partial"], remaining: ["Is the dated allocation rule available?"] } }
  ] });
  assert.deepEqual(question(root, seats.question_id).resolution, { answer_refs: ["source-partial"], remaining: ["Can unused seats be pooled?"] });
  assert.deepEqual(question(root, rule.question_id).resolution.remaining, [rule.statement]);
  assert.deepEqual(exact(root, partial.interpretation_id, "interpretation").components.map(item => item.question_ref), [seats.question_id, rule.question_id]);
  assert.ok(exact(root, partial.interpretation_id, "interpretation").components.every(item => !item.option_id));
  assert.deepEqual(f.state(root).action_decisions, [], "An answer numbered [1] must not accept Next steps [1].");
  assert.equal(f.state(root).runs.length, 0);
  close(root, partial, "partial", { status: "Twenty seats per center is your current account. Pooling and the dated rule remain unknown.",
    questions: [], next_steps: [] });

  const choice = incoming(root, "choice", "Choose [2] under Next steps in your original message: explain why allocation details matter. I still do not know about pooling or the rule.", [
    component("selection", "Explain the design; no effect analysis is selected.", ["Explain why allocation details matter."],
      ["Pooling and the dated rule remain unknown."], { ...replyTo, option_id: "explain" })
  ]);
  close(root, choice, "choice", { explanations: [{ text: "A fixed allocation and transferable places can imply different assignment mechanisms. Your current account does not establish which mechanism applied.", basis_refs: [] }],
    questions: [], next_steps: [] });
  assert.deepEqual(f.state(root).action_decisions, []);
  assert.equal(f.state(root).runs.length, 0);
  assert.equal(question(root, seats.question_id).status, "open");
  assert.equal(question(root, rule.question_id).status, "open");
  assert.equal(exact(root, choice.interpretation_id, "interpretation").components[0].option_id, "explain");

  const pause = incoming(root, "pause", "Pause here. I will return when I have checked the records.",
    [component("instruction", "Pause without resolving the outstanding allocation questions.", ["Pause the consultation."], [])]);
  close(root, pause, "pause", { status: "Paused. Pooling and availability of the dated allocation rule remain unresolved.", questions: [], next_steps: [] });
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  const before = f.state(root);
  store.recover(root);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal, "Resume must not rewrite prior turns.");
  assert.deepEqual(f.state(root), before);
  const resumed = store.context(root, { focus_refs: [seats.question_id], limit: 1 });
  const memory = resumed.views.work.question_memory.find(item => item.question_ref === seats.question_id);
  assert.equal(memory.original_exchange_ref, first.receipt.exchange_id);
  assert.deepEqual(memory.resolution.remaining, ["Can unused seats be pooled?"]);
  assert.ok(resumed.views.work.exchanges.some(item => item.exchange_id === first.receipt.exchange_id
    && item.response.questions[0].question_ref === seats.question_id));

  const correctedWords = "Resume. Correction to Questions for you [1] in your original message: it was seventeen seats per center, not twenty. Pooling is still unknown, and I still do not know whether the dated rule is available.";
  const corrected = incoming(root, "corrected", correctedWords, [
    component("correction", "Seventeen replaces twenty; pooling remains unknown.", ["Seventeen seats per center."], ["Can unused seats be pooled?"],
      { ...replyTo, question_ref: seats.question_id })
  ]);
  submit(root, "correction", { corrects_refs: [seats.question_id], reason: "The user corrected the earlier capacity count while retaining the unresolved pooling question.",
    changes: { questions: [{ question_id: seats.question_id, patch: { reason: "The corrected user account reports seventeen seats.",
      resolution: { answer_refs: ["source-corrected"], remaining: ["Can unused seats be pooled?"] } } }] } });
  const last = close(root, corrected, "corrected", { status: "The current count is seventeen seats per center according to your correction. Pooling and the dated rule remain unknown.",
    questions: [], next_steps: [] });
  assert.equal(question(root, seats.question_id).statement, seats.statement, "The original question identity survives clarified answers.");
  assert.deepEqual(question(root, seats.question_id).resolution, { answer_refs: ["source-corrected"], remaining: ["Can unused seats be pooled?"] });
  assert.deepEqual(question(root, rule.question_id).resolution, { answer_refs: ["source-partial"], remaining: [rule.statement] });
  assert.equal(f.state(root).evidence.find(item => item.evidence_id === "source-partial").source_excerpt, partialWords);
  assert.equal(f.state(root).evidence.find(item => item.evidence_id === "source-corrected").source_excerpt, correctedWords);
  assert.deepEqual(exact(root, first.receipt.exchange_id, "exchange"), originalExchange);
  assert.deepEqual(f.state(root).deliveries.find(item => item.delivery_id === first.delivery_ref), originalDelivery);
  assert.equal(renderExchange(originalExchange), first.receipt.rendered_response);
  assert.equal(renderExchange(exact(root, last.receipt.exchange_id, "exchange")), last.receipt.rendered_response);
  const versions = store.history(root, { record_id: seats.question_id }).events
    .filter(event => event.payload.changes?.questions?.some(item => item.question_id === seats.question_id));
  assert.equal(versions.length, 3, "One question has its original, partial-answer and corrected-answer versions.");
  assert.equal(versions.at(-1).type, "correction");
  assert.deepEqual(versions.at(-1).payload.corrects_refs, [seats.question_id]);
  const brief = store.context(root, { mode: "brief" }).brief;
  assert.equal(brief.unfinished.length, 0);
  const actual = brief.recent_intakes.flatMap(item => item.actual_messages)
    .find(item => item.observations.some(observation => observation.delivery_id === last.delivery_ref));
  assert.equal(actual.captures[0].text, last.receipt.rendered_response);
  assert.equal(actual.observations[0].binding_compatible, true);
  const focused = store.context(root, { focus_refs: [seats.question_id], limit: 1 });
  const currentQuestion = focused.views.work.question_memory.find(item => item.question_ref === seats.question_id);
  assert.equal(currentQuestion.original_exchange_ref, first.receipt.exchange_id);
  assert.equal(currentQuestion.latest_interpretation_ref, corrected.interpretation_id);
  assert.deepEqual(currentQuestion.resolution.answer_refs, ["source-corrected"]);
  assert.deepEqual(focused.views.work.pending_consultant_questions.map(item => item.question_ref), [seats.question_id, rule.question_id]);
  assert.deepEqual(f.state(root).action_decisions, []);
  assert.equal(f.state(root).runs.length, 0);
});

test("one reply can answer Questions [1], select Next steps [1], and correct Answers [2] without conflating their records", t => {
  const root = project(t);
  const cohort = { question_id: "user-question-cohort", origin: "user", status: "answered",
    statement: "Which cohort does this describe?", reason: "The recorded 2024 applicant cohort.", basis_refs: ["source-start"] };
  const timing = { question_id: "user-question-timing", origin: "user", status: "answered",
    statement: "What does the outcome timing mean?", reason: "One year after attendance.", basis_refs: ["source-start"] };
  const note = { question_id: "consultant-question-note", origin: "consultant", status: "open", statement: "Do you have the original allocation note?" };
  const start = incoming(root, "start", "Which cohort does this describe, and what does the outcome timing mean? The records cover 2024 applicants and outcomes one year after the offer.",
    [cohort, timing].map(item => ({ ...component("question", item.statement, [], []), user_question_ref: item.question_id, answer_timing: "before_work" })),
    { questions: [cohort, timing, note] });
  const original = close(root, start, "start", {
    user_questions: [cohort, timing].map(item => ({ question_ref: item.question_id, text: item.statement, answer: item.reason,
      status: "answered", basis_refs: item.basis_refs })),
    questions: [{ question_ref: note.question_id, text: note.statement }],
    next_steps: [{ option_id: "explain-allocation", kind: "discussion", actor: "consultant", label: "Explain the allocation mechanism",
      scope: "Discuss the mechanism before estimating effects.", basis_refs: [] }]
  });
  assert.match(original.receipt.rendered_response, /\[To answer your question\]\n\n\[1\] The recorded 2024 applicant cohort\.\n\n\[2\] One year after attendance\./);
  const referent = { exchange_ref: original.receipt.exchange_id, delivery_ref: original.delivery_ref };
  const words = "Questions for you [1]: yes, I have the allocation note. Please do Next steps [1], explain the allocation mechanism. Correction to To answer your question [2]: the outcome is one year after the offer, not after attendance.";
  const correctedAnswer = "The outcome is recorded one year after the offer, not after attendance.";
  const interpretation = { interpretation_id: "interpretation-mixed", turn_id: "turn-mixed", incoming_refs: ["source-mixed"],
    basis_refs: [timing.question_id], next_action: direct,
    components: [
      component("answer", "The user has the original allocation note.", ["The note is available."], [], { ...referent, question_ref: note.question_id }),
      component("selection", "Explain allocation before any effect estimation.", ["Explain the allocation mechanism."], [], { ...referent, option_id: "explain-allocation" }),
      // question_ref binds consultant requests, not the answer section. A
      // correction to a user-question answer cites its record in basis_refs.
      component("correction", "Correct the second saved answer: the outcome is measured one year after the offer.", [correctedAnswer], [], referent)
    ] };
  submit(root, "reply_interpreted", { interpretation, changes: {
    evidence: [{ ...f.statement("source-mixed", words), complete_message: true }],
    questions: [{ question_id: note.question_id, patch: { status: "answered", reason: "The user confirms availability, not the note's contents.",
      resolution: { answer_refs: ["source-mixed"], remaining: [] } } },
    { question_id: timing.question_id, patch: { reason: correctedAnswer, basis_refs: ["source-start", "source-mixed"] } }]
  } });
  const changed = close(root, interpretation, "mixed", { user_questions: [{ question_ref: timing.question_id, text: timing.statement,
    answer: correctedAnswer, status: "answered", basis_refs: ["source-mixed"] }],
    status: "The allocation mechanism describes how applicants received offers. Having the note permits inspection; its contents and whether assignment was random remain unverified.",
    questions: [], next_steps: [] });
  const saved = exact(root, interpretation.interpretation_id, "interpretation");
  assert.equal(saved.components[0].question_ref, note.question_id);
  assert.equal(saved.components[1].option_id, "explain-allocation");
  assert.equal(saved.components[2].question_ref, undefined);
  assert.equal(saved.components[2].option_id, undefined);
  assert.deepEqual(saved.basis_refs, [timing.question_id]);
  assert.ok(saved.components.every(item => item.exchange_ref === referent.exchange_ref && item.delivery_ref === referent.delivery_ref));
  assert.equal(question(root, cohort.question_id).reason, cohort.reason);
  assert.equal(question(root, timing.question_id).reason, correctedAnswer);
  assert.equal(question(root, note.question_id).status, "answered");
  const previous = exact(root, original.receipt.exchange_id, "exchange"), current = exact(root, changed.receipt.exchange_id, "exchange");
  assert.equal(previous.response.user_questions[1].answer, timing.reason, "A later correction does not rewrite the original answer.");
  assert.equal(previous.response.user_questions[1].question_ref, current.response.user_questions[0].question_ref,
    "The original [2] and the new [1] refer to the same saved user question.");
  assert.equal(renderExchange(previous), original.receipt.rendered_response);
  assert.match(changed.receipt.rendered_response, /^\[To answer your question\]\n\n\[1\] The outcome is recorded one year after the offer/);
  store.recover(root);
  const resumed = store.context(root, { focus_refs: [timing.question_id], limit: 1 });
  assert.equal(resumed.context.questions.find(item => item.question_id === timing.question_id).reason, correctedAnswer);
  assert.equal(f.state(root).runs.length, 0);
});
