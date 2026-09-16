"use strict";
// Public recording paths for the Lead/worker handoffs found in the loop audit.
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/store.cjs"), runs = require("../scripts/lib/runs.cjs");
const f = require("./fixtures/consultation-loop.cjs");
const { PROTOCOL } = require("../scripts/lib/exchanges.cjs");

function project(t) {
  const base = fs.realpathSync(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-loop-authoring-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync(root)), base);
    assert.ok(path.basename(root).startsWith("cc-loop-authoring-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  store.init(root, { project_id: "loop-authoring", event_id: "event-init" });
  return root;
}
function rejectUnchanged(root, code, action) {
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(action, { code });
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
}
function reviewHistory(root, ref) {
  return store.history(root, { record_id: ref }).events.find(event => event.payload.review?.review_id === ref).payload.review;
}
function selectedReview(t, assignment = { specialist_id: "data_audit", operation: "review" }) {
  const root = project(t);
  const it = f.interpret(root, "work", { kind: "specialist", assignment,
    scope: "Assess what the register can establish.", reason: "Answer the user's bounded source question." });
  const checkpoint = { checkpoint_id: "checkpoint-work", status: "assessing",
    primary_uncertainty: "What can the supplied register establish?", why_it_matters: "Bound the conclusion." };
  f.record(root, "checkpoint", { checkpoint, changes: {
    evidence: [{ evidence_id: "data", kind: "file", source_ref: "register.csv", summary: "The supplied source register." }],
    decisions: [{ decision_id: "target", kind: "target", status: "current",
      statement: "Describe the register and its limitations.", basis_refs: it.incoming_refs }]
  } }, "event-basis");
  const review = { review_id: "review-work", summary: "The register supports a descriptive account only.", assignment,
    interpretation_ref: it.interpretation_id, selection_basis: { checkpoint_id: checkpoint.checkpoint_id, user_contribution_refs: it.incoming_refs },
    question_addressed: "What does the register establish?", work_performed: ["Inspected the record definitions."],
    findings: ["The register describes recorded participants."], limitations: ["The register does not establish treatment assignment."], evidence_refs: ["data"] };
  return { root, it, review, checkpoint };
}
const plan = { kind: "report", objective: "Describe the source register.", claim_boundary: "Descriptive evidence only.", inputs: [],
  purpose: "Summarize reviewed source evidence and its limitations.", evidence_refs: ["data"], format: "Markdown" };
function reportScope(root, review, freshEvent) {
  const state = f.state(root);
  const refs = ["data", "target", review.review_id];
  if (state.result_conditions?.length) refs.push("condition-register", "assumption-register");
  return { scope_id: "scope-report", action: "report", assignment: { specialist_id: "report_writer", operation: "reporting" },
    public_scope: { target: plan.purpose, population: "People described by the register", evidence: "The reviewed register",
      approach: "Summarize the reviewed findings", checks: [], outputs: "A Markdown report", claim_boundary: plan.claim_boundary },
    execution_plan: plan, findings_refs: [review.review_id],
    basis_versions: refs.map(ref => ({ ref, event_ref: state.history_index[ref]?.event_ref || freshEvent })) };
}
function closeout(it, review, scope) {
  const response = { ...f.emptyResponse(review.summary), findings: { work_refs: [review.review_id], summary: review.summary,
    diagnostics: ["Inspected the record definitions."], limitations: review.limitations } };
  if (scope) {
    delete response.next_steps_none;
    response.next_steps = [{ option_id: "write-report", kind: "action", actor: "consultant", label: "Write the descriptive report",
      scope: "Summarize these findings and their stated limitations.", basis_refs: [review.review_id, "data", "target"],
      assignment: scope.assignment, scope_ref: scope.scope_id, proposal: scope.public_scope, execution_plan: scope.execution_plan }];
  }
  return { exchange_id: "exchange-findings", turn_id: it.turn_id, interpretation_ref: it.interpretation_id,
    basis_refs: ["target", "data"], completed_work_refs: [review.review_id], renderer: "lead-markdown-v4",
    reconciliation: { changes: ["The bounded review is complete."], limitations: review.limitations, unresolved: [],
      next_direction: "The user may discuss the findings or choose further work." }, response };
}

test("prerecording review and conditions permits one findings-bound report offer, with later acceptance still required", t => {
  const { root, it, review } = selectedReview(t);
  const sameEvent = "event-bundled-closeout", freshScope = reportScope(root, review, sameEvent);
  rejectUnchanged(root, "STALE_SCOPE", () => f.record(root, "exchange_prepared", {
    protocol: PROTOCOL, review, changes: { action_scopes: [freshScope] }, exchange: closeout(it, review, freshScope)
  }, sameEvent));
  assert.equal(f.state(root).specialist_reviews.length, 0);
  assert.equal(f.state(root).exchanges.length, 0);

  // Both scientific records are committed before their versions bind the offer.
  const condition = { condition_id: "condition-register", evidence_ref: "data", result_locator: "Recorded participant coverage",
    claim: "The account describes the register's recorded participants.", target: "Recorded participants",
    assumption_refs: ["assumption-register"], basis_refs: ["data"], limitations: ["Coverage outside the register is unknown."] };
  f.record(root, "review_completed", { review, changes: {
    assumptions: [{ assumption_id: "assumption-register", statement: "The supplied register is the intended source version.",
      status: "active", basis_refs: ["data"] }], result_conditions: [condition]
  } }, "event-review-and-conditions");
  assert.equal(f.state(root).exchanges.length, 0);
  const scope = reportScope(root, review);
  assert.deepEqual(scope.basis_versions, [
    { ref: "data", event_ref: "event-basis" }, { ref: "target", event_ref: "event-basis" },
    { ref: "review-work", event_ref: "event-review-and-conditions" },
    { ref: "condition-register", event_ref: "event-review-and-conditions" },
    { ref: "assumption-register", event_ref: "event-review-and-conditions" }
  ]);
  const incomplete = { ...scope, basis_versions: scope.basis_versions.filter(binding => binding.ref !== "condition-register") };
  rejectUnchanged(root, "STALE_SCOPE", () => f.record(root, "exchange_prepared", { protocol: PROTOCOL,
    changes: { action_scopes: [incomplete] }, exchange: closeout(it, review, incomplete) }, "event-incomplete-basis"));
  rejectUnchanged(root, "STALE_SCOPE", () => f.record(root, "exchange_prepared", { protocol: PROTOCOL,
    changes: { action_scopes: [scope], result_conditions: [{ ...condition, limitations: [...condition.limitations, "Only one center was checked."] }] },
    exchange: closeout(it, review, scope) }, "event-changing-condition"));

  const receipt = f.record(root, "exchange_prepared", { protocol: PROTOCOL,
    changes: { action_scopes: [scope] }, exchange: closeout(it, review, scope) }, "event-offer");
  const delivery_ref = f.deliver(root, receipt.exchange_id, "offer");
  let state = f.state(root);
  assert.equal(state.specialist_reviews.length, 1);
  assert.equal(state.exchanges.length, 1);
  assert.equal(state.deliveries.length, 1);
  assert.equal(state.interpretations.length, 1);
  assert.equal(state.action_decisions.length, 0);
  assert.equal(state.runs.length, 0);
  assert.deepEqual(state.action_scopes[0].basis_versions, scope.basis_versions);
  rejectUnchanged(root, "MISSING_AUTHORIZATION", () => f.interpret(root, "premature-report", {
    kind: "specialist", assignment: scope.assignment, scope: "Write the report now.", reason: "The findings are already saved."
  }));

  const approved = f.acceptScope(root, { scope, exchange_ref: receipt.exchange_id, option_id: "write-report", delivery_ref },
    { suffix: "later-selection", user_text: "Write the descriptive report under the terms you just presented." });
  runs.start(root, { ...f.ids(root, "event-report-start"), run_id: "run-report", plan: approved });
  state = f.state(root);
  assert.equal(state.specialist_reviews.length, 1);
  assert.equal(state.exchanges.length, 1);
  assert.equal(state.action_decisions.length, 1);
  assert.equal(state.action_decisions[0].disposition, "accept");
  assert.deepEqual(state.action_decisions[0].user_refs, ["user-later-selection"]);
  assert.equal(state.runs[0].authorization_binding.authorization_ref, approved.authorization_ref);
  assert.deepEqual(state.runs[0].authorization_binding.basis_versions, scope.basis_versions);
});

test("a worker records additional in-scope guidance as performed work while preserving its frozen assignment", t => {
  const assignment = { specialist_id: "design_worker", operation: "feasibility", design_id: "single_time_observational" };
  const { root, it, review } = selectedReview(t, assignment);
  const work = [...review.work_performed, "Consulted statistical-validity support to qualify the same descriptive feasibility assessment."];
  rejectUnchanged(root, "ASSIGNMENT_MISMATCH", () => f.record(root, "review_completed", {
    review: { ...review, work_performed: work, assignment: { ...assignment, support_ids: ["statistical-validity"] } }
  }, "event-altered-assignment"));
  f.record(root, "review_completed", { review: { ...review, work_performed: work } }, "event-original-assignment");
  const saved = reviewHistory(root, review.review_id);
  assert.deepEqual(saved.assignment, assignment);
  assert.deepEqual(saved.work_performed, work);
  assert.deepEqual(f.state(root).interpretations.find(item => item.interpretation_id === it.interpretation_id).next_action.assignment, assignment);
  assert.equal(f.state(root).specialist_reviews.length, 1);
});

for (const operation of ["clear", "update"]) test("Lead can " + operation + " an answered checkpoint without retiring another pending question", t => {
  const root = project(t);
  const capacity = { question_id: "question-capacity", statement: "How many seats are available?", status: "open", origin: "consultant" };
  const pooling = { question_id: "question-pooling", statement: "May unused seats be pooled?", status: "open", origin: "consultant" };
  f.record(root, "checkpoint", { checkpoint: { checkpoint_id: "checkpoint-capacity", status: "awaiting_user",
    primary_uncertainty: capacity.statement, why_it_matters: "Establish capacity.", related_unresolved_question_refs: [capacity.question_id] },
    changes: { questions: [capacity, pooling] } }, "event-capacity-question");
  const words = "Seventeen seats are available.";
  const it = f.interpret(root, "capacity-answer", { kind: "lead_only", scope: "Reconcile the supplied capacity.", reason: "The user supplied the requested fact." },
    { components: [{ kind: "information", meaning: words, established: [words], unresolved: [] }] }, words);
  f.record(root, "memory_updated", { changes: { questions: [{ ...capacity, status: "answered", reason: "The user supplied capacity.",
    resolution: { answer_refs: it.incoming_refs, remaining: [] } }] } }, "event-capacity-answer");
  assert.equal(f.state(root).consultation.checkpoint_id, "checkpoint-capacity");
  assert.equal(f.state(root).consultation.status, "awaiting_user");
  const next = operation === "clear" ? null : { checkpoint_id: "checkpoint-pooling", status: "awaiting_user",
    primary_uncertainty: pooling.statement, why_it_matters: "Establish whether unused places transfer.", related_unresolved_question_refs: [pooling.question_id] };
  const receipt = f.record(root, "exchange_prepared", { protocol: PROTOCOL, changes: { consultation: next },
    exchange: { exchange_id: "exchange-capacity", turn_id: it.turn_id, interpretation_ref: it.interpretation_id,
      basis_refs: it.incoming_refs, completed_work_refs: [], renderer: "lead-markdown-v4",
      reconciliation: { changes: ["Capacity is answered."], limitations: ["Pooling is still unknown."], unresolved: [pooling.statement],
        next_direction: "Retain the independent pooling question." }, response: f.emptyResponse("Seventeen seats are available; pooling remains unresolved.") }
  }, "event-lead-closeout");
  f.deliver(root, receipt.exchange_id, "capacity");
  const state = f.state(root);
  assert.deepEqual(state.consultation, next);
  assert.equal(state.questions.find(item => item.question_id === capacity.question_id).status, "answered");
  assert.deepEqual(state.questions.find(item => item.question_id === pooling.question_id), pooling);
  assert.equal(state.history_index["checkpoint-capacity"].event_ref, "event-capacity-question");
});

test("an interrupted review retains its original selection checkpoint while Lead advances the current checkpoint", t => {
  const { root, it, review, checkpoint } = selectedReview(t);
  const question = { question_id: "question-coverage", statement: "Does the register include every center?", status: "open", origin: "consultant" };
  const fresh = f.interpret(root, "resume", { kind: "lead_only", scope: "Reconcile the finished review and current coverage question.",
    reason: "Resume under the user's new direction." }, {}, "Explain what the finished inspection supports before further work.");
  const current = { checkpoint_id: "checkpoint-current", status: "awaiting_user", primary_uncertainty: question.statement,
    why_it_matters: "Bound register coverage.", related_unresolved_question_refs: [question.question_id] };
  f.record(root, "memory_updated", { changes: { consultation: current, questions: [question] } }, "event-current-checkpoint");
  // The old review was finished before interruption; saving its handoff is not a new selection.
  f.record(root, "review_completed", { review }, "event-resumed-handoff");
  assert.deepEqual(f.state(root).consultation, current);
  assert.deepEqual(reviewHistory(root, review.review_id).selection_basis,
    { checkpoint_id: checkpoint.checkpoint_id, user_contribution_refs: it.incoming_refs });
  const next = { ...current, checkpoint_id: "checkpoint-next", primary_uncertainty: "Which centers are absent from the supplied register?" };
  const receipt = f.record(root, "exchange_prepared", { protocol: PROTOCOL, changes: { consultation: next },
    exchange: { ...closeout(fresh, review), reconciles: [it.interpretation_id] } }, "event-resumed-closeout");
  f.deliver(root, receipt.exchange_id, "resumed");
  const state = f.state(root);
  assert.deepEqual(state.consultation, next);
  assert.equal(state.history_index[checkpoint.checkpoint_id].event_ref, "event-basis");
  assert.equal(state.history_index[current.checkpoint_id].event_ref, "event-current-checkpoint");
  assert.equal(state.history_index[next.checkpoint_id].event_ref, "event-resumed-closeout");
  assert.equal(reviewHistory(root, review.review_id).selection_basis.checkpoint_id, checkpoint.checkpoint_id);
  assert.equal(state.specialist_reviews.length, 1);
  assert.equal(state.exchanges.length, 1);
  assert.ok(state.turns.every(turn => turn.exchange_ref === receipt.exchange_id));
  assert.deepEqual(state.questions[0], question);
});
