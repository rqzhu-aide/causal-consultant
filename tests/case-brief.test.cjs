"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { emptyState } = require("../scripts/lib/model.cjs");
const { buildCaseBrief } = require("../scripts/lib/case-brief.cjs");
const { canonical } = require("../scripts/lib/files.cjs");

function fixture() {
  const state = emptyState("brief-project", "2026-09-14T00:00:00Z"), events = [];
  Object.assign(state, { interpretations: [], exchanges: [], deliveries: [], turns: [], user_context: [], result_conditions: [], action_scopes: [], action_decisions: [] });
  state.state_meta.protocol = "durable-exchanges-v1";
  return { state, events };
}
function append(loaded, event_id, payload, type = "memory_updated") {
  const { state, events } = loaded;
  const sequence = events.length + 1;
  events.push({ event_id, sequence, type, payload: structuredClone(payload) });
  state.state_meta.last_event_id = event_id; state.state_meta.sequence = sequence;
  const ids = { evidence: "evidence_id", questions: "question_id", assumptions: "assumption_id", decisions: "decision_id", candidate_routes: "strategy_id", result_conditions: "condition_id", action_scopes: "scope_id", user_context: "context_id" };
  for (const [key, id] of Object.entries(ids)) for (const record of payload.changes?.[key] || []) {
    const index = state[key].findIndex(value => value[id] === record[id]);
    if (index < 0) state[key].push(structuredClone(record)); else state[key][index] = structuredClone(record);
    state.history_index[record[id]] = { kind: key, event_ref: event_id, sequence };
  }
  if (payload.review) {
    const review = payload.review;
    state.specialist_reviews.push({ review_id: review.review_id, summary: review.summary, event_ref: event_id,
      ...(review.interpretation_ref ? { interpretation_ref: review.interpretation_ref } : {}) });
    state.history_index[review.review_id] = { kind: "review", event_ref: event_id, sequence };
  }
  if (payload.exchange) {
    const exchange = payload.exchange;
    state.exchanges.push({ exchange_id: exchange.exchange_id, interpretation_ref: exchange.interpretation_ref, turn_id: exchange.turn_id,
      question_refs: exchange.response.questions.map(value => value.question_ref), options: exchange.response.next_steps,
      event_ref: event_id, response_sha256: "a".repeat(64) });
    state.history_index[exchange.exchange_id] = { kind: "exchange", event_ref: event_id, sequence };
  }
}
const source = (evidence_id, summary, extra = {}) => ({ evidence_id, kind: "user_statement", summary, source_ref: "chat:" + evidence_id, ...extra });
function review(extra = {}) {
  return { review_id: "review-source", summary: "Evidence supports a descriptive account.", assignment: { specialist_id: "data_audit", operation: "review" },
    question_addressed: "Which rows describe eligible participants?", selection_basis: { checkpoint_id: "checkpoint", user_contribution_refs: ["user-source"] },
    work_performed: ["Compared participant IDs and recruitment records."], findings: ["Twelve rows are duplicate observations, not twelve additional participants."],
    limitations: ["Recruitment records do not establish random assignment."], remaining_uncertainty: ["Treatment dates are still unknown."], ...extra };
}
function exchange(extra = {}) {
  return { exchange_id: "exchange-close", turn_id: "turn-work", interpretation_ref: "interpretation-work", completed_work_refs: ["review-source"],
    reconciliation: { changes: [], limitations: ["No causal claim."], unresolved: [], next_direction: "The user chooses whether to investigate further." },
    response: { status: "The review is complete.", questions: [], next_steps: [], findings: { work_refs: ["review-source"],
      summary: "The retained review supports a descriptive account only.", diagnostics: ["Checked duplicate IDs."], limitations: ["No assignment mechanism established."] } }, ...extra };
}

test("each omitted answer review has a precise cue while displayed and unrelated work do not", () => {
  const loaded = fixture();
  for (const suffix of ["a", "b", "c"]) append(loaded, "event-review-" + suffix, { review: review({ review_id: "review-" + suffix,
    findings: ["Finding " + suffix], limitations: ["Limitation " + suffix] }) }, "review_completed");
  append(loaded, "event-question", { changes: { questions: [{ question_id: "question-recruitment", status: "open",
    statement: "What is established about recruitment and which dates remain unknown?",
    resolution: { answer_refs: ["review-a", "review-b"], remaining: ["Treatment dates remain unknown."] } }] } });
  loaded.state.case_brief = { knowledge_refs: [], work_refs: ["review-a"] };
  const before = structuredClone(loaded), brief = buildCaseBrief(loaded);
  const warnings = brief.coverage.warnings.filter(item => item.code === "answer_review_not_displayed");
  assert.equal(warnings.length, 1);
  assert.deepEqual(warnings[0].retrieval.history, { record_id: "review-b" });
  assert.match(brief.markdown, /history record_id=review-b/);
  assert.doesNotMatch(brief.markdown, /Finding b|Limitation b|Finding c|Limitation c/);
  assert.deepEqual(brief.coverage.work.included_refs, ["review-a"]);
  assert.deepEqual(loaded, before);
  loaded.state.case_brief.work_refs = [];
  const bothOmitted = buildCaseBrief(loaded).coverage.warnings.filter(item => item.code === "answer_review_not_displayed");
  assert.deepEqual(bothOmitted.map(item => item.retrieval.history.record_id), ["review-a", "review-b"]);
});

test("standalone brief retains every pending identity, reason and related record after compact rendering", () => {
  const loaded = fixture();
  loaded.state.turns.push({ turn_id: "turn-review", interpretation_ref: "interpretation-review", work_refs: ["review-source"], exchange_ref: null },
    { turn_id: "turn-execution", interpretation_ref: "interpretation-execution", work_refs: ["run-pending"], exchange_ref: null });
  append(loaded, "event-review", { review: review({ interpretation_ref: "interpretation-review" }) }, "review_completed");
  loaded.state.runs.push({ run_id: "run-pending", kind: "analysis", status: "in_progress", interpretation_ref: "interpretation-execution" });
  const before = structuredClone(loaded), brief = buildCaseBrief(loaded);
  assert.deepEqual(brief.unfinished.map(item => [item.kind, item.record_ref, item.reasons]), [
    ["turn", "turn-review", ["lead_closeout_pending"]], ["turn", "turn-execution", ["lead_closeout_pending"]],
    ["run", "run-pending", ["work_incomplete"]], ["review", "review-source", ["lead_reply_pending"]]
  ]);
  for (const pending of brief.unfinished) {
    const line = brief.markdown.split("\n").find(text => text.includes("`" + pending.record_ref + "`"));
    assert.ok(line, pending.record_ref);
    for (const value of [...pending.reasons, ...(pending.related_refs || [])]) assert.ok(line.includes(value), value);
    assert.deepEqual(pending.retrieval.history, { record_id: pending.record_ref });
    assert.deepEqual(pending.retrieval.context, { focus_refs: [pending.record_ref] });
  }
  assert.match(brief.markdown, /history record_id=<ID> or context focus_refs=\[<ID>\]/);
  assert.deepEqual(loaded, before);
});

test("brief curation keeps uninitialized, explicitly empty and independently supplied sections distinct", () => {
  const loaded = fixture();
  let brief = buildCaseBrief(loaded);
  assert.equal(brief.coverage.knowledge.status, "uninitialized");
  assert.equal(brief.coverage.work.status, "uninitialized");
  loaded.state.case_brief = { work_refs: [] };
  brief = buildCaseBrief(loaded);
  assert.equal(brief.coverage.knowledge.status, "uninitialized");
  assert.equal(brief.coverage.work.status, "initialized");
  loaded.state.case_brief.knowledge_refs = [];
  brief = buildCaseBrief(loaded);
  assert.equal(brief.coverage.knowledge.status, "initialized");
  assert.match(brief.markdown, /intentionally empty/);
});

test("a review saved with closeout retains full findings and limitations absent from the projection", () => {
  const loaded = fixture();
  append(loaded, "event-close", { review: review(), exchange: exchange() }, "exchange_prepared");
  loaded.state.case_brief = { knowledge_refs: [], work_refs: ["review-source"] };
  assert.equal(loaded.state.specialist_reviews[0].limitations, undefined);
  const brief = buildCaseBrief(loaded);
  assert.match(brief.markdown, /Twelve rows are duplicate observations, not twelve additional participants/);
  assert.match(brief.markdown, /Recruitment records do not establish random assignment/);
  assert.match(brief.markdown, /Treatment dates are still unknown/);
  assert.match(brief.markdown, /No assignment mechanism established/);
  assert.match(brief.markdown, /"status":"unobserved"/);
  assert.equal((brief.markdown.match(/### specialist reviews \(review-source\)/g) || []).length, 1);
  assert.match(brief.markdown, /event_id=event-close/);
});

test("a completed run without scientific findings remains pending review and does not acquire a result", () => {
  const loaded = fixture();
  loaded.state.case_brief = { knowledge_refs: [], work_refs: [] };
  loaded.state.runs.push({ run_id: "run-complete", kind: "analysis", status: "completed", plan_ref: "runs/run-complete/plan.yaml", manifest_ref: "runs/run-complete/manifest.json", claim_boundary: "Descriptive only." });
  const brief = buildCaseBrief(loaded);
  assert.ok(brief.coverage.work.automatically_included_refs.includes("run-complete"));
  assert.ok(brief.unfinished.find(item => item.record_ref === "run-complete").reasons.includes("scientific_review_pending"));
  assert.match(brief.markdown, /runs\/run-complete\/manifest.json/);
  assert.match(brief.markdown, /Retrieve its frozen plan/);
  assert.doesNotMatch(brief.markdown, /### Lead findings/);
});

test("selected run and review are rendered once with target, result conditions and related retired uncertainty", () => {
  const loaded = fixture();
  append(loaded, "event-source", { changes: {
    evidence: [{ evidence_id: "effect", kind: "computed", run_id: "run-analysis", source_ref: "runs/run-analysis/effect.json", summary: "Estimated effect is 0.4 points." }],
    assumptions: [{ assumption_id: "assume-dates", status: "active", statement: "Recorded treatment dates are correct.", basis_refs: ["question-dates"] }],
    questions: [{ question_id: "question-dates", statement: "Were these the actual treatment dates?", status: "retired", reason: "The user cannot recover the records.",
      resolution: { answer_refs: [], remaining: ["Actual treatment timing remains unverified."] } }],
    result_conditions: [{ condition_id: "condition-effect", evidence_ref: "effect", result_locator: "table-1", claim: "Conditional effect estimate only.", target: "ATE among eligible centers",
      assumption_refs: ["assume-dates"], basis_refs: [], limitations: ["Treatment timing was not independently verified."] }]
  } });
  append(loaded, "event-review", { review: review({ interpretation_ref: "interpretation-work", evidence_refs: ["effect"] }) }, "review_completed");
  loaded.state.runs.push({ run_id: "run-analysis", kind: "analysis", status: "completed", interpretation_ref: "interpretation-work", plan_ref: "runs/run-analysis/plan.yaml" });
  loaded.state.case_brief = { knowledge_refs: ["effect"], work_refs: ["run-analysis", "review-source"] };
  const brief = buildCaseBrief(loaded);
  assert.match(brief.markdown, /ATE among eligible centers/);
  assert.match(brief.markdown, /Treatment timing was not independently verified/);
  assert.match(brief.markdown, /Actual treatment timing remains unverified/);
  assert.match(brief.markdown, /Retired means no repeated request, not that the premise was established/);
  assert.equal((brief.markdown.match(/### evidence \(effect\)/g) || []).length, 1);
  assert.equal((brief.markdown.match(/### specialist reviews \(review-source\)/g) || []).length, 1);
  assert.equal(brief.coverage.warnings.filter(item => item.code === "missing_result_conditions").length, 0);
});

test("conditions on supplied source findings follow selected evidence even without a computed run", () => {
  const loaded = fixture();
  append(loaded, "event-source", { changes: {
    evidence: [{ evidence_id: "source-estimate", kind: "file", source_ref: "external-estimate.json", summary: "The supplied report estimates an effect of two points." }],
    assumptions: [{ assumption_id: "source-assignment", status: "retired", statement: "The source assumed random assignment.", basis_refs: [] }],
    result_conditions: [{ condition_id: "source-conditions", evidence_ref: "source-estimate", result_locator: "Estimate table", target: "Eligible participants in the supplied study",
      claim: "A supplied conditional estimate, not an independently verified causal result.", assumption_refs: ["source-assignment"], basis_refs: [], limitations: ["The assignment premise was withdrawn and this estimate cannot be treated as causally identified."] }]
  } });
  loaded.state.case_brief = { knowledge_refs: ["source-estimate"], work_refs: [] };
  const brief = buildCaseBrief(loaded);
  assert.match(brief.markdown, /cannot be treated as causally identified/);
  assert.match(brief.markdown, /source-assignment/);
  assert.match(brief.markdown, /retired/);
});

test("old constraints and rejected routes stay visible without relying on a new fact's graph links", () => {
  const loaded = fixture();
  append(loaded, "event-old", { changes: { evidence: [source("capacity", "Only 20 seats per center are available.")], candidate_routes: [{ strategy_id: "route-randomize", target: "Assignment effect", approach: "Randomize allocation.", status: "unsupported_with_current_evidence",
    reason: "Allocation records are missing.", evidence_for: ["capacity"], unmet_requirements: ["Recover the assignment log."], reopen_or_promote_when: "The original assignment log becomes available." }] } });
  append(loaded, "event-new", { changes: { evidence: [source("new-log", "I found a document that may be the assignment log.", { limitations: ["Its contents have not been inspected."] })] } });
  loaded.state.case_brief = { knowledge_refs: ["new-log"], work_refs: [] };
  const brief = buildCaseBrief(loaded);
  assert.match(brief.markdown, /Only 20 seats per center/);
  assert.match(brief.markdown, /original assignment log becomes available/);
  assert.match(brief.markdown, /Its contents have not been inspected/);
  assert.match(brief.markdown, /unsupported_with_current_evidence/);
});

test("open questions preserve the exact remaining answer and saved return condition across old exchanges", () => {
  const loaded = fixture();
  append(loaded, "event-question", { changes: { questions: [{ question_id: "question-dates", statement: "Which date marks treatment?", status: "open", reason: "The causal ordering depends on treatment timing.",
    resolution: { answer_refs: [], remaining: ["Whether the January date is assignment or actual receipt."] } }] } });
  const asked = exchange({ response: { status: "Timing needs clarification.", next_steps: [], questions: [{ question_ref: "question-dates", text: "Was January assignment or treatment receipt?", why: "These imply different exposure windows.", needed: "Identify the date field's operational definition before estimation." }] } });
  append(loaded, "event-question-out", { exchange: asked }, "exchange_prepared");
  const brief = buildCaseBrief(loaded);
  assert.match(brief.markdown, /Whether the January date is assignment or actual receipt/);
  assert.match(brief.markdown, /operational definition before estimation/);
  assert.match(brief.markdown, /These imply different exposure windows/);
  assert.match(brief.markdown, /"status":"unobserved"/);
});

test("supersession and later source corrections are visible beside a retained old finding", () => {
  const loaded = fixture();
  append(loaded, "event-old", { changes: { evidence: [source("old-date", "The date was believed to be January.")] } });
  append(loaded, "event-review", { review: review({ evidence_refs: ["old-date"] }) }, "review_completed");
  append(loaded, "event-correct", { corrects_refs: ["old-date"], reason: "Original timing was mistaken.", changes: {
    evidence: [source("old-date", "The original date is now disputed."), source("new-date", "The date was February.", { supersedes: "old-date" })]
  } }, "correction");
  loaded.state.case_brief = { knowledge_refs: ["old-date"], work_refs: ["review-source"] };
  const brief = buildCaseBrief(loaded);
  assert.ok(brief.coverage.warnings.some(item => item.record_ref === "old-date" && item.code === "superseded_record" && item.related_refs.includes("new-date")));
  assert.ok(brief.coverage.warnings.some(item => item.record_ref === "review-source" && item.code === "premise_changed_after_work"));
  assert.match(brief.markdown, /Original timing was mistaken/);
  assert.match(brief.markdown, /Current records do not prove the old findings were re-reviewed/);
});

test("current scopes distinguish recorded acceptance from a later discussion-only direction", () => {
  const loaded = fixture();
  loaded.state.state_meta.consultation_policy = { policy: "consultation-loop-v1" };
  const scope = { scope_id: "scope-analysis", action: "analysis", assignment: { specialist_id: "design_worker", operation: "execution" },
    public_scope: { target: "ATE", population: "Eligible centers", claim_boundary: "Under stated conditions." }, execution_plan: { evidence_refs: [] }, basis_versions: [], findings_refs: [] };
  loaded.state.action_scopes.push(scope);
  loaded.state.action_decisions.push({ decision_id: "accept-analysis", scope_ref: scope.scope_id, disposition: "accept" });
  loaded.state.interpretations.push({ interpretation_id: "interpretation-discussion", next_action: { kind: "lead_only", scope: "Explain the limitations.", reason: "The user requested an explanation first." } });
  const brief = buildCaseBrief(loaded);
  assert.match(brief.markdown, /Eligible centers/);
  assert.match(brief.markdown, /"eligible":true/);
  assert.match(brief.markdown, /\*\*current direction:\*\* false/);
  assert.match(brief.markdown, /The user requested an explanation first/);
});

test("unfinished review, prepared response and discrepant actual response retain distinct pending steps", () => {
  const loaded = fixture();
  append(loaded, "event-review", { review: review({ interpretation_ref: "interpretation-work" }) }, "review_completed");
  loaded.state.turns.push({ turn_id: "turn-work", interpretation_ref: "interpretation-work", work_refs: ["review-source"], exchange_ref: null });
  let brief = buildCaseBrief(loaded);
  assert.ok(brief.unfinished.some(item => item.record_ref === "review-source" && item.reasons.includes("lead_reply_pending")));
  append(loaded, "event-close", { exchange: exchange() }, "exchange_prepared");
  loaded.state.turns[0].exchange_ref = "exchange-close";
  brief = buildCaseBrief(loaded);
  assert.ok(brief.unfinished.some(item => item.reasons.includes("actual_response_unestablished")));
  assert.ok(!brief.unfinished.some(item => item.reasons.includes("lead_reply_pending")));
  loaded.state.deliveries.push({ delivery_id: "capture-different", exchange_ref: "exchange-close", observation: "assistant_emission", response_sha256: "a".repeat(64), observed_response_sha256: "b".repeat(64) });
  brief = buildCaseBrief(loaded);
  assert.ok(brief.unfinished.some(item => item.reasons.includes("actual_response_requires_reconciliation")));
});

test("hash-only historical delivery does not establish completion or results discussion in the brief", () => {
  const loaded = fixture();
  loaded.state.case_brief = { knowledge_refs: [], work_refs: ["review-source"] };
  append(loaded, "event-review", { review: review({ interpretation_ref: "interpretation-work" }) }, "review_completed");
  append(loaded, "event-close", { exchange: exchange() }, "exchange_prepared");
  loaded.state.turns.push({ turn_id: "turn-work", interpretation_ref: "interpretation-work", work_refs: ["review-source", "run-analysis"], exchange_ref: "exchange-close" });
  loaded.state.runs.push({ run_id: "run-analysis", kind: "analysis", status: "completed", interpretation_ref: "interpretation-work", plan_ref: "runs/run-analysis/plan.yaml" });
  loaded.state.deliveries.push({ delivery_id: "legacy-observation", exchange_ref: "exchange-close", observation: "host_confirmed", response_sha256: "a".repeat(64) });
  let brief = buildCaseBrief(loaded);
  assert.ok(brief.unfinished.some(item => item.reasons.includes("actual_response_requires_reconciliation")));
  assert.ok(brief.unfinished.some(item => item.reasons.includes("results_discussion_unestablished")));
  assert.match(brief.markdown, /"status":"unverified"/);
  assert.match(brief.markdown, /"capture_verification":"unavailable"/);
  loaded.state.deliveries.push({ delivery_id: "captured-observation", exchange_ref: "exchange-close", observation: "assistant_emission", response_sha256: "a".repeat(64), observed_response_sha256: "a".repeat(64) });
  brief = buildCaseBrief(loaded);
  assert.ok(!brief.unfinished.some(item => item.reasons.includes("results_discussion_unestablished")));
  assert.match(brief.markdown, /does not verify capture files/);
  assert.match(brief.markdown, /"capture_verification":"not_checked_by_brief"/);
});

test("a displayed joint finding retains every cited review's unique limitations without cascading through later blocks", () => {
  const loaded = fixture();
  for (const suffix of ["a", "b", "c"]) append(loaded, "event-review-" + suffix, { review: review({ review_id: "review-" + suffix,
    summary: "Study " + suffix + " improved.", limitations: ["Unique limitation of study " + suffix + "."] }) }, "review_completed");
  const together = exchange({ exchange_id: "exchange-ab", response: { status: "Two studies reviewed.", questions: [], next_steps: [],
    findings: { work_refs: ["review-a", "review-b"], summary: "Both study A and study B improved.", diagnostics: [], limitations: ["Descriptive account only."] } } });
  append(loaded, "event-ab", { exchange: together }, "exchange_prepared");
  append(loaded, "event-bc", { exchange: exchange({ exchange_id: "exchange-bc", response: { status: "Other work.", questions: [], next_steps: [],
    findings: { work_refs: ["review-b", "review-c"], summary: "Unrelated later comparison of B and C.", diagnostics: [], limitations: ["Different scope."] } } }) }, "exchange_prepared");
  loaded.state.case_brief = { knowledge_refs: [], work_refs: ["review-a"] };
  const brief = buildCaseBrief(loaded);
  assert.deepEqual(brief.coverage.work.included_refs, ["review-a", "review-b"]);
  assert.match(brief.markdown, /Both study A and study B improved/);
  assert.match(brief.markdown, /Unique limitation of study b/);
  assert.equal((brief.markdown.match(/### specialist reviews \(review-b\)/g) || []).length, 1);
  assert.doesNotMatch(brief.markdown, /Unrelated later comparison of B and C|Unique limitation of study c/);
});

test("the brief excludes full incoming messages, ignores unrelated old records and leaves inputs unchanged", () => {
  const loaded = fixture();
  append(loaded, "event-user", { changes: { evidence: [source("full-message", "User prefers an accessible explanation.", { source_excerpt: "FULL PRIVATE CONVERSATION\nwith extra details\n第三行", complete_message: true }), source("unrelated", "Unrelated old fact.")] } });
  loaded.state.case_brief = { knowledge_refs: ["full-message"], work_refs: [] };
  const before = structuredClone(loaded), brief = buildCaseBrief(loaded);
  assert.doesNotMatch(brief.markdown, /FULL PRIVATE CONVERSATION|第三行|Unrelated old fact/);
  assert.match(brief.markdown, /User prefers an accessible explanation/);
  assert.equal(brief.coverage.omitted.evidence, 1);
  assert.deepEqual(loaded, before);
  assert.deepEqual(buildCaseBrief(loaded), brief);
});

test("canonical journal serialization leaves Markdown and semantic change detection unchanged", () => {
  const loaded = fixture();
  loaded.state.project_understanding = { objective: "Estimate the effect.", causal_target: "ATE" };
  const fact = source("source", "The allocation mechanism is unknown.", { limitations: ["User recollection only."] });
  append(loaded, "event-source", { changes: { evidence: [fact] } });
  append(loaded, "event-review", { review: review({ evidence_refs: ["source"] }) }, "review_completed");
  append(loaded, "event-reordered", { changes: { evidence: [Object.fromEntries(Object.entries(fact).reverse())] } });
  const outgoing = exchange();
  outgoing.reconciliation = { next_direction: "The user selects the next direction.", unresolved: [], limitations: ["Retain source qualifications."], changes: [] };
  append(loaded, "event-close", { exchange: outgoing }, "exchange_prepared");
  loaded.state.case_brief = { work_refs: ["review-source"], knowledge_refs: ["source"] };
  const fresh = buildCaseBrief(loaded), replayed = buildCaseBrief(JSON.parse(canonical(loaded)));
  assert.equal(fresh.markdown, replayed.markdown);
  assert.deepEqual(fresh, replayed);
  assert.ok(!fresh.coverage.warnings.some(item => item.code === "premise_changed_after_work"), "Property order alone does not alter a scientific premise.");
});
