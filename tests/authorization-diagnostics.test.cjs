"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/store.cjs");
const policy = require("../scripts/lib/authorizations.cjs");
const { PROTOCOL } = require("../scripts/lib/exchanges.cjs");
const f = require("./fixtures/consultation-loop.cjs");

function project(t) {
  const base = fs.realpathSync.native(os.tmpdir());
  const root = fs.mkdtempSync(path.join(base, "cc-auth-diagnostics-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("cc-auth-diagnostics-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  store.init(root, { project_id: "project-diagnostics", event_id: "event-init" });
  f.record(root, "memory_updated", { changes: { evidence: [{ evidence_id: "source-note", kind: "file",
    source_ref: "office-note.md", summary: "The office describes the available study records." }] } }, "event-source");
  return root;
}
function reportOffer(root, options = {}) {
  return f.prepareScope(root, { kind: "report", objective: "Summarize the available study records", claim_boundary: "Descriptive account only",
    inputs: [], purpose: "An accurate board summary", evidence_refs: ["source-note"], format: "Markdown" }, { suffix: "report", ...options });
}
function mixedRequest(root, offer) {
  const text = "Yes, write that report. Before you write it, does the supplied office note give us a comparison group?";
  return { ...f.ids(root, "event-mixed"), type: "reply_interpreted", payload: { protocol: PROTOCOL,
    changes: { evidence: [f.statement("user-mixed", text)], questions: [{ question_id: "question-comparison", origin: "user",
      statement: "Does the office note provide a comparison group?", status: "open", basis_refs: ["user-mixed", "source-note"] }] },
    checkpoint: { checkpoint_id: "checkpoint-comparison", status: "ready_for_specialist", primary_uncertainty: "Whether the note supports a comparison",
      why_it_matters: "The answer determines the report's claim boundary.", related_unresolved_question_refs: ["question-comparison"] },
    interpretation: { interpretation_id: "interpretation-mixed", turn_id: "turn-mixed", incoming_refs: ["user-mixed"], basis_refs: ["user-mixed", "source-note", offer.scope.scope_id],
      components: [
        { kind: "selection", meaning: "The user accepts the report but asks a question first.", established: ["The displayed report is accepted."], unresolved: [],
          exchange_ref: offer.exchange_ref, option_id: offer.option_id, delivery_ref: offer.delivery_ref },
        { kind: "question", meaning: "Investigate whether the supplied note provides a comparison.", established: ["The user supplied the note and requests its assessment."],
          unresolved: ["The note's causal implications."], user_question_ref: "question-comparison", answer_timing: "after_work" }
      ], action_decisions: [{ decision_id: "decision-report", scope_ref: offer.scope.scope_id, disposition: "accept", exchange_ref: offer.exchange_ref,
        option_id: offer.option_id, delivery_ref: offer.delivery_ref, user_refs: ["user-mixed"] }], focus_scope_ref: offer.scope.scope_id,
      next_action: { kind: "specialist", scope: "Assess the note for an available comparison without estimating effects.", reason: "Answer the user's supplied-note question.",
        adjustment_reason: "Keep the report acceptance unused until the requested investigation is complete.", assignment: { specialist_id: "causal_check", operation: "readiness" } }
    }
  } };
}
function rejectedUnchanged(root, request, code, check = () => {}) {
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(() => store.record(root, request), error => {
    assert.equal(error.code, code, error.message); check(error); return true;
  });
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
}

test("a sourced work-dependent question with no established answer selects investigation while report permission waits unused", t => {
  const root = project(t), offer = reportOffer(root), request = mixedRequest(root, offer);
  request.payload.interpretation.components[1].established = [];
  store.record(root, request);
  const state = f.state(root);
  assert.equal(state.interpretations.at(-1).next_action.assignment.specialist_id, "causal_check");
  assert.deepEqual(store.readJournal(root).events.at(-1).payload.interpretation.components[1].established, []);
  assert.equal(state.questions.find(question => question.question_id === "question-comparison").status, "open");
  assert.equal(policy.eligibility(state, offer.scope.scope_id).authorization_ref, "decision-report");
  assert.equal(state.runs.length, 0);
  assert.deepEqual(store.recover(root).last_event_id, "event-mixed");
  assert.deepEqual(f.state(root), state, "Committed question routing replays without rewriting its source or direction.");
});

test("question routing requires current source, open question, after-work timing and explicit work linkage", t => {
  const root = project(t), offer = reportOffer(root), original = mixedRequest(root, offer);
  const cases = [
    [request => { delete request.payload.checkpoint; }, "INVALID_AUTHORIZATION"],
    [request => { request.payload.changes.questions[0].basis_refs = ["user-proposal-report"]; }, "INVALID_AUTHORIZATION"],
    [request => { request.payload.changes.questions[0].status = "answered"; request.payload.changes.questions[0].reason = "Already explained."; }, "INVALID_AUTHORIZATION"],
    [request => { request.payload.interpretation.components[1].answer_timing = "before_work"; }, "USER_QUESTION_BLOCKS_WORK"],
    [request => { request.payload.checkpoint.selected_assignment = { specialist_id: "data_audit", operation: "review" }; }, "INVALID_AUTHORIZATION"],
    [request => { request.payload.interpretation.next_action.assignment = { specialist_id: "design_worker", operation: "execution", design_id: "single_time_observational" }; }, "MISSING_AUTHORIZATION"]
  ];
  for (const [change, code] of cases) { const request = structuredClone(original); change(request); rejectedUnchanged(root, request, code); }
  const linkedInInterpretation = structuredClone(original);
  delete linkedInInterpretation.payload.checkpoint;
  linkedInInterpretation.payload.interpretation.basis_refs.push("question-comparison");
  store.record(root, linkedInInterpretation);
});

test("findings diagnostics distinguish exact-reference absence, unobserved replies and stale discussions", t => {
  const root = project(t), offer = reportOffer(root), state = f.state(root);
  const ref = offer.scope.findings_refs[0];
  const option = store.readJournal(root).events.find(event => event.payload.exchange?.exchange_id === offer.exchange_ref).payload.exchange.response.next_steps[0];
  const proposal = payload => ({ ...f.ids(root, "event-repeat-offer"), type: "exchange_prepared", payload });
  for (const [status, transform] of [
    ["absent", value => { value.exchanges.forEach(exchange => { if (exchange.findings) exchange.findings.work_refs = ["another-finding"]; }); }],
    ["unobserved", value => { value.deliveries = []; }],
    ["stale", value => { value.history_index[ref].event_ref = "event-new-review-version"; }]
  ]) {
    const view = structuredClone(state); transform(view);
    // Keep the scope fresh to isolate discussion freshness, rather than failing
    // earlier at the independent stale-scope guard.
    if (status === "stale") view.action_scopes[0].basis_versions.find(binding => binding.ref === ref).event_ref = "event-new-review-version";
    assert.throws(() => policy.validateOffer(view, option, {}, {}), error => {
      assert.equal(error.code, "FINDINGS_NOT_DISCUSSED");
      assert.deepEqual(error.details.missing_findings_refs, [ref]);
      assert.equal(error.details.findings[0].status, status);
      assert.ok(error.message.includes(ref));
      if (status === "stale") assert.ok(error.details.findings[0].prior_exchanges.every(exchange => exchange.stale_refs.includes(ref)));
      return true;
    });
  }
  // A same-response discussion may cover one finding while another exact ID is
  // missing, as in runs011/015. Rejected submission must be atomic.
  const freshReview = f.findingReview(root, ["source-note"], "additional");
  const it = f.interpret(root, "offer-again", { kind: "lead_only", scope: "Offer the report with all current findings.", reason: "The final summary needs both reviews." });
  const scope = structuredClone(offer.scope); scope.scope_id = "scope-two-findings";
  scope.findings_refs.push(freshReview); scope.basis_versions.push({ ref: freshReview, event_ref: f.state(root).history_index[freshReview].event_ref });
  // A later discrepant capture removes this review's prior observed support.
  const current = f.state(root), delivered = current.deliveries.find(delivery => delivery.exchange_ref === "exchange-additional");
  const deliveryPath = path.join(root, "different-message.txt"); fs.writeFileSync(deliveryPath, "A different message.");
  require("../scripts/lib/delivery.cjs").observe(root, { ...f.ids(root, "event-different"), delivery_id: "delivery-different", exchange_ref: delivered.exchange_ref,
    observation: "assistant_emission", message_path: deliveryPath, source_ref: "fixture-host:discrepant-message" });
  const response = f.emptyResponse("The original review is discussed.");
  delete response.next_steps_none;
  response.findings = { work_refs: [ref], summary: "The original review remains limited.", diagnostics: ["Sources reviewed."], limitations: ["No effect established."] };
  response.next_steps = [{ ...option, scope_ref: scope.scope_id }];
  delete response.next_steps[0].scope_file;
  rejectedUnchanged(root, proposal({ protocol: PROTOCOL, changes: { action_scopes: [scope] }, exchange: {
    exchange_id: "exchange-offer-again", turn_id: it.turn_id, interpretation_ref: it.interpretation_id, basis_refs: [], completed_work_refs: [], renderer: "lead-markdown-v6",
    reconciliation: { changes: [], limitations: [], unresolved: [], next_direction: "Choose the report." }, response
  } }), "FINDINGS_NOT_DISCUSSED", error => {
    assert.deepEqual(error.details.missing_findings_refs, [freshReview]);
    assert.deepEqual(error.details.current_work_refs, [ref]);
    assert.equal(error.details.findings[0].status, "unobserved");
  });
});

test("stale-scope diagnostic traces a design decision through its review to the superseded premise", t => {
  const root = project(t);
  f.record(root, "memory_updated", { changes: { assumptions: [{ assumption_id: "assumption-no-spillover", statement: "No cross-center spillover.", status: "active", basis_refs: ["source-note"] }] } }, "event-assumption");
  const assignment = { specialist_id: "causal_check", operation: "readiness" };
  const it = f.interpret(root, "design", { kind: "specialist", scope: "Assess the stated design premises.", reason: "Determine the supportable comparison.", assignment });
  f.record(root, "checkpoint", { checkpoint: { checkpoint_id: "checkpoint-design", status: "assessing", primary_uncertainty: "Whether centers are independent", why_it_matters: "This limits interpretation." } }, "event-checkpoint");
  f.record(root, "review_completed", { review: { review_id: "review-design", assignment, summary: "The design depends on no spillover.", question_addressed: "Which conditions govern this comparison?",
    selection_basis: { checkpoint_id: "checkpoint-design", user_contribution_refs: it.incoming_refs }, interpretation_ref: it.interpretation_id,
    work_performed: ["Checked the stated conditions."], findings: ["The no-spillover premise governs interpretation."], limitations: ["The premise is not independently verified."],
    evidence_refs: ["source-note"], assumptions_added_or_revised: ["assumption-no-spillover"] } }, "event-review");
  f.record(root, "memory_updated", { changes: { decisions: [{ decision_id: "decision-design", kind: "design", status: "current", statement: "Use the comparison conditional on the reviewed assumptions.", basis_refs: ["review-design"] }] } }, "event-decision");
  const response = f.emptyResponse("The comparison remains conditional."); response.findings = { work_refs: ["review-design"], summary: "No spillover is needed.", diagnostics: ["Read source conditions."], limitations: ["Unverified condition."] };
  f.exchange(root, it, "design", response, ["review-design"]); f.deliver(root, "exchange-design", "design");
  const offer = reportOffer(root, { findings_refs: ["review-design"], basis_refs: ["decision-design"] });
  for (const missing of [false, true]) {
    const state = f.state(root), scope = state.action_scopes.find(scope => scope.scope_id === offer.scope.scope_id);
    if (missing) scope.basis_versions = scope.basis_versions.filter(binding => binding.ref !== "assumption-no-spillover");
    else state.history_index["assumption-no-spillover"].event_ref = "event-premise-edited";
    assert.throws(() => policy.validateOffer(state, { scope_ref: scope.scope_id }, {}, {}), error => {
      assert.equal(error.code, "STALE_SCOPE");
      assert.deepEqual(error.details.dependency_path, ["decision-design", "review-design", "assumption-no-spillover"]);
      if (missing) assert.deepEqual(error.details.missing_refs, ["assumption-no-spillover"]);
      else assert.equal(error.details.current_event_ref, "event-premise-edited");
      return true;
    });
  }
  f.record(root, "memory_updated", { changes: { assumptions: [{ assumption_id: "assumption-spillover-possible", statement: "Spillover may occur.", status: "active", basis_refs: ["source-note"], supersedes: "assumption-no-spillover" }] } }, "event-revised-premise");
  const scope = structuredClone(offer.scope); scope.scope_id = "scope-still-stale";
  rejectedUnchanged(root, { ...f.ids(root, "event-stale-scope"), type: "memory_updated", payload: { changes: { action_scopes: [scope] } } }, "STALE_SCOPE", error => {
    assert.equal(error.details.blocking_ref, "assumption-no-spillover");
    assert.equal(error.details.superseded_by, "assumption-spillover-possible");
    assert.deepEqual(error.details.dependency_path, ["decision-design", "review-design", "assumption-no-spillover"]);
    assert.match(error.message, /decision-design -> review-design -> assumption-no-spillover/);
  });
});
