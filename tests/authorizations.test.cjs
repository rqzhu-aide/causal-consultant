"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { createFixture, interpretation, exchange, review } = require("./fixtures/multiturn.cjs");
const { applyEvent, emptyState } = require("../scripts/lib/model.cjs");
const { renderExchange, PROTOCOL } = require("../scripts/lib/exchanges.cjs");
const policy = require("../scripts/lib/authorizations.cjs");
const assignment = { specialist_id: "design_worker", operation: "execution", design_id: "randomized_assignment" };
const basePlan = { kind: "analysis", objective: "Estimate treatment effects", claim_boundary: "Randomized sample only", inputs: [], target: "ATE", population: "Trial participants", treatment: "Assignment", comparator: "Control", outcome: "Score", timing: "One year", estimand: "Mean difference", design_id: "randomized_assignment", estimator: "Difference of means", exclusions: [], diagnostics: ["Missingness", "Balance"] };
function setup(action = "analysis", withDecisionSource = false) {
  const fixture = createFixture();
  fixture.append("consultation_policy_activated", { policy: policy.POLICY, reconciliation: "Legacy records remain evidence only; no unfinished runs." });
  const plan = action === "analysis" ? structuredClone(basePlan) : { kind: "report", objective: "Summarize current findings", claim_boundary: "Randomized sample only", inputs: [], purpose: "Current findings", evidence_refs: ["user-request"], format: "Markdown" };
  const scopedAssignment = action === "analysis" ? assignment : { specialist_id: "report_writer", operation: "reporting" };
  const scope = { scope_id: "scope-first", action, assignment: scopedAssignment, public_scope: { target: "ATE", population: "Trial participants", evidence: "User-supplied trial evidence", approach: "Estimate the agreed mean difference", checks: action === "analysis" ? plan.diagnostics : [], outputs: "Results and limitations", claim_boundary: plan.claim_boundary }, execution_plan: plan, basis_versions: [{ ref: "user-request", event_ref: fixture.state.history_index["user-request"].event_ref }], findings_refs: [] };
  if (withDecisionSource) {
    fixture.append("memory_updated", { changes: {
      evidence: [{ evidence_id: "source-target", kind: "user_statement", source_ref: "chat:target", source_excerpt: "Use only eligible baseline participants.", summary: "The user defines eligibility." }],
      decisions: [{ decision_id: "target-current", kind: "target", statement: "Trial-population ATE", status: "current", basis_refs: ["source-target"] }]
    } });
    // Deliberately historical: this scope predates decision-source traversal.
    scope.basis_versions.push({ ref: "target-current", event_ref: fixture.state.history_index["target-current"].event_ref });
  }
  if (action === "report") {
    fixture.append("run_started", { run: { run_id: "audit-one", kind: "audit", status: "in_progress" } });
    fixture.append("run_finalized", { run: { run_id: "audit-one", kind: "audit", status: "completed" } });
    scope.findings_refs = ["audit-one"];
    scope.basis_versions.push({ ref: "audit-one", event_ref: fixture.state.history_index["audit-one"].event_ref });
  }
  fixture.append("memory_updated", { changes: { action_scopes: [scope] } });
  fixture.interpret("proposal");
  const outgoing = exchange("proposal"); outgoing.renderer = "lead-markdown-v4";
  outgoing.response.next_steps = [{ option_id: "perform", kind: "action", label: "Perform this bounded action", actor: "consultant", scope: "Use the proposed scope", basis_refs: [scope.scope_id], assignment: structuredClone(scopedAssignment), scope_ref: scope.scope_id, proposal: structuredClone(scope.public_scope), execution_plan: structuredClone(plan) }];
  if (action === "report") outgoing.response.findings = { work_refs: ["audit-one"], summary: "Data audited; target is limited to the randomized sample", diagnostics: ["Missingness checked"], limitations: ["No transportability established"] };
  fixture.append("exchange_prepared", { protocol: PROTOCOL, exchange: outgoing });
  fixture.append("exchange_delivery", { protocol: PROTOCOL, delivery: { delivery_id: "delivery-proposal", exchange_ref: outgoing.exchange_id, observation: "assistant_emission", source_ref: "conversation:assistant-2", response_sha256: fixture.state.exchanges.at(-1).response_sha256 } });
  return { fixture, scope, plan, outgoing, scopedAssignment };
}
function acceptance(env, suffix = "accept", disposition = "accept") {
  const { fixture, scope, scopedAssignment } = env;
  const value = interpretation(suffix); value.incoming_refs = ["user-" + suffix]; value.basis_refs = [scope.scope_id];
  value.components = [{ kind: "selection", meaning: "User accepts the offered scope", established: ["The displayed action is selected"], unresolved: [], exchange_ref: "exchange-proposal", option_id: "perform", delivery_ref: "delivery-proposal" }];
  value.action_decisions = [{ decision_id: "decision-" + suffix, scope_ref: scope.scope_id, disposition, exchange_ref: "exchange-proposal", option_id: "perform", delivery_ref: "delivery-proposal", user_refs: ["user-" + suffix] }];
  value.focus_scope_ref = scope.scope_id;
  if (disposition === "accept") value.next_action = { kind: "specialist", scope: "Execute the accepted scope", reason: "Later user selection", assignment: structuredClone(scopedAssignment), scope_ref: scope.scope_id, authorization_ref: "decision-" + suffix };
  return { protocol: PROTOCOL, interpretation: value, changes: { evidence: [{ evidence_id: "user-" + suffix, kind: "user_statement", source_ref: "conversation:user-" + suffix, source_excerpt: "Please do option 1 as described.", summary: "User selects the presented scope" }] } };
}
function authorize(env) { env.fixture.append("reply_interpreted", acceptance(env)); return { ...env.plan, interpretation_ref: "interpretation-accept", scope_ref: env.scope.scope_id, authorization_ref: "decision-accept" }; }
const rejects = (fn, code) => assert.throws(fn, error => error.code === code);

test("report acceptance binds requested local formats while retaining exact scientific terms", () => {
  const env = setup("report"), payload = acceptance(env);
  payload.changes.evidence[0].source_excerpt = "Yes, write that report, and include HTML alongside Markdown.";
  payload.interpretation.action_decisions[0].presentation_adjustment = { formats: ["markdown", "html"], user_ref: "user-accept" };
  env.fixture.append("reply_interpreted", payload);
  const plan = { ...policy.executionPlanForAuthorization(env.fixture.state, env.scope, "decision-accept"),
    interpretation_ref: "interpretation-accept", scope_ref: env.scope.scope_id, authorization_ref: "decision-accept" };
  const binding = policy.validateRunStart(env.fixture.state, plan);
  assert.equal(plan.format, "markdown, html"); assert.equal(env.scope.execution_plan.format, "Markdown");
  assert.deepEqual(binding.presentation_adjustment, { formats: ["markdown", "html"], user_ref: "user-accept", source_event_ref: env.fixture.state.history_index["user-accept"].event_ref });
  for (const [field, value] of Object.entries({ objective: "Another population", claim_boundary: "Unconditional effects", inputs: [{ source_ref: "elsewhere", path: "other.csv" }], purpose: "Publication to another audience", evidence_refs: ["other"], format: "pdf" })) {
    rejects(() => policy.validateRunStart(env.fixture.state, { ...plan, [field]: value }), "SCOPE_MISMATCH");
  }
  const run = { run_id: "report-adjusted", kind: "report", status: "in_progress", interpretation_ref: plan.interpretation_ref, authorization_binding: binding };
  env.fixture.append("run_started", { run });
  assert.deepEqual(policy.validateRunContinuation(env.fixture.state, run, plan), binding);
  rejects(() => policy.validateRunContinuation(env.fixture.state, run, { ...plan, format: "pdf" }), "INVALID_AUTHORIZATION");
  let replay = emptyState(env.fixture.events[0].project_id, env.fixture.events[0].timestamp);
  for (const event of env.fixture.events) replay = applyEvent(replay, event);
  assert.deepEqual(replay, env.fixture.state);
  rejects(() => policy.validateRunStart(env.fixture.state, plan), "INVALID_AUTHORIZATION");
});

test("presentation adjustment requires actual acceptance evidence and admits only local formats", () => {
  for (const change of [
    { adjustment: { formats: ["html"], user_ref: "user-request" }, code: "MISSING_USER_SOURCE" },
    { adjustment: { formats: ["html"] }, code: "INVALID_INPUT" },
    { adjustment: { formats: ["publish"], user_ref: "user-accept" }, code: "INVALID_INPUT" },
    { adjustment: { formats: ["html", "html"], user_ref: "user-accept" }, code: "INVALID_INPUT" },
    { adjustment: { formats: [], user_ref: "user-accept" }, code: "INVALID_INPUT" },
    { adjustment: { formats: ["html"], user_ref: "user-accept", audience: "Public" }, code: "INVALID_INPUT" },
    { action: "analysis", adjustment: { formats: ["html"], user_ref: "user-accept" }, code: "INVALID_AUTHORIZATION" },
    { disposition: "defer", adjustment: { formats: ["html"], user_ref: "user-accept" }, code: "INVALID_AUTHORIZATION" },
    { quote: null, adjustment: { formats: ["html"], user_ref: "user-accept" }, code: "MISSING_USER_SOURCE" }
  ]) {
    const env = setup(change.action || "report"), payload = acceptance(env, "accept", change.disposition || "accept");
    payload.interpretation.action_decisions[0].presentation_adjustment = change.adjustment;
    if (Object.hasOwn(change, "quote")) delete payload.changes.evidence[0].source_excerpt;
    rejects(() => env.fixture.append("reply_interpreted", payload), change.code);
  }
});

test("changed format-request source requires reconciliation before start or continuation", () => {
  const env = setup("report"), payload = acceptance(env);
  payload.interpretation.action_decisions[0].presentation_adjustment = { formats: ["html"], user_ref: "user-accept" };
  env.fixture.append("reply_interpreted", payload);
  const plan = { ...env.plan, format: "html", interpretation_ref: "interpretation-accept", scope_ref: env.scope.scope_id, authorization_ref: "decision-accept" };
  const binding = policy.validateRunStart(env.fixture.state, plan);
  const run = { run_id: "report-adjusted", kind: "report", status: "in_progress", interpretation_ref: plan.interpretation_ref, authorization_binding: binding };
  env.fixture.append("memory_updated", { changes: { evidence: [{ ...payload.changes.evidence[0], source_excerpt: "Wait before making the report." }] } });
  rejects(() => policy.validateRunStart(env.fixture.state, plan), "INVALID_AUTHORIZATION");
  rejects(() => policy.validateRunContinuation(env.fixture.state, run, plan), "INVALID_AUTHORIZATION");
});

test("protected execution requires policy and a later user choice, not initial report desire", () => {
  const legacy = createFixture(); rejects(() => policy.validateRunStart(legacy.state, basePlan), "POLICY_ACTIVATION_REQUIRED");
  const env = setup(); rejects(() => policy.validateRunStart(env.fixture.state, basePlan), "MISSING_AUTHORIZATION");
  const payload = acceptance(env); payload.interpretation.incoming_refs = ["user-request"]; payload.interpretation.action_decisions[0].user_refs = ["user-request"];
  rejects(() => env.fixture.append("reply_interpreted", payload), "EARLY_AUTHORIZATION");
});
test("rendered proposal includes exact methods, outcomes, exclusions and checks", () => {
  const env = setup(); const rendered = renderExchange(env.outgoing);
  for (const text of ["Trial participants", "Missingness", "Balance", "Difference of means", "Score", "One year", "Mean difference", "exclusions: None"]) assert.ok(rendered.includes(text), text);
  const revised = structuredClone(env.outgoing); revised.exchange_id = "exchange-revision"; revised.supersedes = env.outgoing.exchange_id; revised.response.next_steps[0].execution_plan.estimator = "Another method";
  rejects(() => env.fixture.append("exchange_prepared", { protocol: PROTOCOL, exchange: revised }), "SCOPE_MISMATCH");
});
test("accepted action binds exact plan, assignment and one execution only", () => {
  const env = setup(); const plan = authorize(env); const binding = policy.validateRunStart(env.fixture.state, plan);
  assert.equal(binding.authorization_ref, "decision-accept");
  rejects(() => policy.validateRunStart(env.fixture.state, { ...plan, outcome: "Another outcome" }), "SCOPE_MISMATCH");
  env.fixture.append("run_started", { run: { run_id: "analysis-one", kind: "analysis", status: "in_progress", interpretation_ref: plan.interpretation_ref, authorization_binding: binding } });
  rejects(() => policy.validateRunStart(env.fixture.state, plan), "INVALID_AUTHORIZATION");
  assert.equal(policy.validateRunContinuation(env.fixture.state, env.fixture.state.runs.at(-1), plan).scope_ref, env.scope.scope_id);
});
test("one clearly bound yes accepts the current offer without another confirmation", () => {
  const env = setup(); const payload = acceptance(env);
  payload.changes.evidence[0].source_excerpt = "Yes, do it.";
  env.fixture.append("reply_interpreted", payload);
  assert.equal(policy.validateRunStart(env.fixture.state, { ...env.plan, interpretation_ref: payload.interpretation.interpretation_id,
    scope_ref: env.scope.scope_id, authorization_ref: "decision-accept" }).authorization_ref, "decision-accept");
});
test("accepted scope can wait through clarification and resume without a second acceptance", () => {
  const env = setup(); const payload = acceptance(env);
  payload.changes.evidence[0].source_excerpt = "I approve this scope, but first let me check the allocation record.";
  payload.interpretation.next_action = { kind: "lead_only", scope: "Clarify the allocation record before execution.",
    reason: "The user approves the unchanged scope but asks to establish a prerequisite first.",
    adjustment_reason: "Hold the selected assignment while the prerequisite is clarified.", clarification_needed: "Confirm that the recorded assignment variable is the intended one." };
  env.fixture.append("reply_interpreted", payload);
  assert.equal(policy.eligibility(env.fixture.state, env.scope.scope_id).eligible, true);
  const approved = { ...env.plan, interpretation_ref: "interpretation-accept", scope_ref: env.scope.scope_id, authorization_ref: "decision-accept" };
  rejects(() => policy.validateRunStart(env.fixture.state, approved), "INVALID_AUTHORIZATION");
  assert.equal(env.fixture.state.runs.length, 0);
  const clarification = interpretation("clarification"); clarification.incoming_refs = ["user-clarification"];
  clarification.components = [{ kind: "information", meaning: "The user is still locating the record.", established: ["The record is not yet available."], unresolved: ["Which assignment variable the record identifies."] }];
  clarification.next_action = { kind: "lead_only", scope: "Retain the exact unanswered prerequisite.", reason: "The additional reply does not resolve it." };
  env.fixture.append("reply_interpreted", { protocol: PROTOCOL, interpretation: clarification,
    changes: { evidence: [{ evidence_id: "user-clarification", kind: "user_statement", source_ref: "conversation:clarification", source_excerpt: "I have not found it yet.", summary: "The prerequisite remains unresolved." }] } });
  assert.equal(policy.eligibility(env.fixture.state, env.scope.scope_id).eligible, true);
  const resumed = interpretation("resume"); resumed.incoming_refs = ["user-resume"];
  resumed.components = [{ kind: "answer", meaning: "The user directly resolves the sole stated blocker and supports the offered resumption.", established: ["The record identifies the same assignment variable."], unresolved: [] }];
  resumed.next_action = { kind: "specialist", scope: "Resume the unchanged accepted action.", reason: "The reply resolves the sole stated blocker to the offered resumption.",
    assignment: structuredClone(assignment), scope_ref: env.scope.scope_id, authorization_ref: "decision-accept" };
  env.fixture.append("reply_interpreted", { protocol: PROTOCOL, interpretation: resumed,
    changes: { evidence: [{ evidence_id: "user-resume", kind: "user_statement", source_ref: "conversation:resume", source_excerpt: "It names the assignment variable you proposed.", summary: "The sole prerequisite is resolved without changing the scope." }] } });
  assert.equal(policy.validateRunStart(env.fixture.state, { ...approved, interpretation_ref: resumed.interpretation_id }).authorization_ref, "decision-accept");
  assert.equal(env.fixture.state.action_decisions.length, 1);
  let replay = emptyState(env.fixture.events[0].project_id, env.fixture.events[0].timestamp);
  for (const event of env.fixture.events) replay = applyEvent(replay, event);
  assert.deepEqual(replay, env.fixture.state);
});
test("accepting paused analysis permits only independently selected different work", () => {
  const env = setup(); const payload = acceptance(env);
  payload.changes.evidence[0].source_excerpt = "I approve the analysis. While I check allocation, inspect the missing values only.";
  payload.interpretation.next_action = { kind: "specialist", scope: "Inspect missing values without interpreting causal effects.",
    reason: "The explicitly requested missingness check does not depend on the allocation answer.",
    adjustment_reason: "Preserve analysis approval while doing the separately requested data check.",
    assignment: { specialist_id: "data_audit", operation: "review" } };
  rejects(() => env.fixture.append("reply_interpreted", payload), "INVALID_AUTHORIZATION");
  payload.interpretation.components.push({ kind: "instruction", meaning: "The user separately requests a missing-value check.",
    established: ["Inspect missing values only while allocation is being checked."], unresolved: [] });
  env.fixture.append("reply_interpreted", payload);
  assert.equal(env.fixture.state.interpretations.at(-1).next_action.assignment.specialist_id, "data_audit");
  assert.equal(policy.eligibility(env.fixture.state, env.scope.scope_id).eligible, true);
  assert.equal(env.fixture.state.runs.length, 0);
});
test("paused acceptance retains observation, scope and single-selection constraints", () => {
  const env = setup(); const payload = acceptance(env);
  payload.interpretation.next_action = { kind: "lead_only", scope: "Explain the outstanding prerequisite.", reason: "Execution waits." };
  rejects(() => env.fixture.append("reply_interpreted", payload), "ASSIGNMENT_MISMATCH");
  payload.interpretation.next_action.adjustment_reason = "Clarification precedes the selected assignment.";
  payload.interpretation.action_decisions.push({ ...payload.interpretation.action_decisions[0], decision_id: "decision-second" });
  rejects(() => env.fixture.append("reply_interpreted", payload), "INVALID_AUTHORIZATION");
  payload.interpretation.action_decisions.pop();
  payload.changes.evidence.push({ ...env.fixture.state.evidence.find(item => item.evidence_id === "user-request"), summary: "Actually change the target population." });
  rejects(() => env.fixture.append("reply_interpreted", payload), "STALE_SCOPE");
});
test("same-ID material basis update invalidates affected permission", () => {
  const env = setup(); const plan = authorize(env);
  env.fixture.append("memory_updated", { changes: { evidence: [{ ...env.fixture.state.evidence.find(x => x.evidence_id === "user-request"), summary: "Corrected target population" }] } });
  rejects(() => policy.validateRunStart(env.fixture.state, plan), "INVALID_AUTHORIZATION");
});
test("superseding basis invalidates permission but unrelated preference does not", () => {
  const env = setup(); const plan = authorize(env);
  env.fixture.append("memory_updated", { changes: { user_context: [{ context_id: "preference-font", kind: "preference", statement: "Use large labels", basis_refs: ["user-accept"], status: "current" }] } });
  assert.equal(policy.validateRunStart(env.fixture.state, plan).scope_ref, env.scope.scope_id);
  env.fixture.append("memory_updated", { changes: { evidence: [{ evidence_id: "corrected-request", kind: "user_statement", source_ref: "conversation:user-4", summary: "Population changed", supersedes: "user-request" }] } });
  rejects(() => policy.validateRunStart(env.fixture.state, plan), "INVALID_AUTHORIZATION");
});
test("acceptance plus a changing basis in the same event cannot authorize stale work", () => {
  const env = setup(); const payload = acceptance(env); payload.changes.evidence.push({ ...env.fixture.state.evidence.find(x => x.evidence_id === "user-request"), summary: "Actually change the population" });
  rejects(() => env.fixture.append("reply_interpreted", payload), "STALE_SCOPE");
});
test("scope revisions are immutable and do not inherit acceptance", () => {
  const env = setup(); authorize(env);
  rejects(() => env.fixture.append("memory_updated", { changes: { action_scopes: [env.scope] } }), "DUPLICATE_ID");
  env.fixture.append("memory_updated", { changes: { action_scopes: [{ ...env.scope, scope_id: "scope-second", supersedes: env.scope.scope_id }] } });
  assert.equal(policy.eligibility(env.fixture.state, env.scope.scope_id).reason, "scope superseded");
  assert.equal(policy.eligibility(env.fixture.state, "scope-second").eligible, false);
});
test("withdrawal cancels continuing output but preserves historical attribution", () => {
  const env = setup(); const plan = authorize(env); const binding = policy.validateRunStart(env.fixture.state, plan);
  env.fixture.append("run_started", { run: { run_id: "analysis-one", kind: "analysis", status: "in_progress", interpretation_ref: plan.interpretation_ref, authorization_binding: binding } });
  env.fixture.append("reply_interpreted", acceptance(env, "withdraw", "withdraw"));
  rejects(() => policy.validateRunContinuation(env.fixture.state, env.fixture.state.runs.at(-1), plan), "INVALID_AUTHORIZATION");
  assert.deepEqual(env.fixture.state.runs.at(-1).authorization_binding, binding);
});
test("assignment adjustment reason cannot waive protected scope", () => {
  const env = setup(); const payload = acceptance(env); payload.interpretation.next_action.assignment.design_id = "single_time_observational"; payload.interpretation.next_action.adjustment_reason = "Prefer another estimator";
  rejects(() => env.fixture.append("reply_interpreted", payload), "INVALID_AUTHORIZATION");
});
test("report offers require displayed findings and later selection; analysis grants no report permission", () => {
  const env = setup("report"); const plan = authorize(env); assert.equal(policy.validateRunStart(env.fixture.state, plan).scope_ref, env.scope.scope_id);
  assert.ok(renderExchange(env.outgoing).includes("No transportability established"));
  const analysis = setup(); const analysisPlan = authorize(analysis);
  rejects(() => policy.validateRunStart(analysis.fixture.state, { ...analysisPlan, kind: "report" }), "SCOPE_MISMATCH");
});
test("report cannot be offered against undisclosed findings", () => {
  const env = setup("report"); const state = structuredClone(env.fixture.state); state.exchanges = []; state.deliveries = [];
  const response = structuredClone(env.outgoing.response); delete response.findings;
  rejects(() => policy.validateOffer(state, response.next_steps[0], response, {}), "FINDINGS_NOT_DISCUSSED");
});
test("activation is explicit for legacy history and refuses legacy ongoing work", () => {
  const env = createFixture(); const oldBytes = JSON.stringify(env.events);
  env.append("run_started", { run: { run_id: "legacy-analysis", kind: "analysis", status: "in_progress" } });
  rejects(() => env.append("consultation_policy_activated", { policy: policy.POLICY, reconciliation: "Try migration" }), "LEGACY_RUN_ACTIVE");
  const old = JSON.parse(oldBytes); let replay = emptyState(old[0].project_id, old[0].timestamp); for (const event of old) replay = applyEvent(replay, event);
  assert.equal(replay.state_meta.consultation_policy, undefined); assert.equal(JSON.stringify(old), oldBytes);
});
test("new policy history replays exact decisions, scope and delivery bindings", () => {
  const env = setup(); authorize(env); let replay = emptyState(env.fixture.events[0].project_id, env.fixture.events[0].timestamp);
  for (const event of env.fixture.events) replay = applyEvent(replay, event);
  assert.deepEqual(replay, env.fixture.state);
});
test("new offers bind a current sourced target while historical offers still replay", () => {
  const env = setup();
  const legacyRequest = { payload: { exchange: env.outgoing } };
  rejects(() => policy.validateProposalWrite(env.fixture.state, legacyRequest), "MISSING_TARGET_BINDING");
  // This guard is deliberately absent from validateOffer/applyEvent: old valid
  // journals did not require a target decision and must not change on replay.
  let replay = emptyState(env.fixture.events[0].project_id, env.fixture.events[0].timestamp);
  for (const event of env.fixture.events) replay = applyEvent(replay, event);
  assert.deepEqual(replay, env.fixture.state);
  const target = { decision_id: "target-current", kind: "target", status: "current", statement: "Estimate the trial-population ATE.", basis_refs: ["user-request"] };
  env.fixture.append("memory_updated", { changes: { decisions: [target] } });
  const scope = { ...env.scope, scope_id: "scope-target-bound", basis_versions: [...env.scope.basis_versions,
    { ref: target.decision_id, event_ref: env.fixture.state.history_index[target.decision_id].event_ref }] };
  env.fixture.append("memory_updated", { changes: { action_scopes: [scope] } });
  const request = { payload: { exchange: { ...env.outgoing, response: { ...env.outgoing.response,
    next_steps: [{ ...env.outgoing.response.next_steps[0], scope_ref: scope.scope_id }] } } } };
  assert.doesNotThrow(() => policy.validateProposalWrite(env.fixture.state, request));
  for (const status of ["withdrawn", "superseded"]) {
    const changed = structuredClone(env.fixture.state); changed.decisions[0].status = status;
    rejects(() => policy.validateProposalWrite(changed, request), "MISSING_TARGET_BINDING");
  }
  const unsourced = structuredClone(env.fixture.state); unsourced.decisions[0].basis_refs = ["question-allocation"];
  rejects(() => policy.validateProposalWrite(unsourced, request), "MISSING_TARGET_BINDING");
  const boundaryOnly = structuredClone(env.fixture.state); boundaryOnly.decisions[0].kind = "boundary";
  rejects(() => policy.validateProposalWrite(boundaryOnly, request), "MISSING_TARGET_BINDING");
  const stale = structuredClone(env.fixture.state); stale.history_index[target.decision_id].event_ref = "event-newer-target";
  rejects(() => policy.validateProposalWrite(stale, request), "MISSING_TARGET_BINDING");
});
test("new governing result conditions invalidate prior scopes and require their assumption closure", () => {
  const env = setup(); const plan = authorize(env);
  env.fixture.append("memory_updated", { changes: {
    assumptions: [{ assumption_id: "transport-assumption", statement: "No effect modification across settings", status: "active", basis_refs: ["user-request"] }],
    result_conditions: [{ condition_id: "target-condition", evidence_ref: "user-request", result_locator: "Target statement", claim: "ATE transported to another setting", target: "ATE", assumption_refs: ["transport-assumption"], basis_refs: ["user-request"], limitations: ["Assumed rather than empirically established"] }]
  } });
  rejects(() => policy.validateRunStart(env.fixture.state, plan), "INVALID_AUTHORIZATION");
  const revised = { ...env.scope, scope_id: "scope-with-conditions", supersedes: env.scope.scope_id };
  rejects(() => env.fixture.append("memory_updated", { changes: { action_scopes: [revised] } }), "STALE_SCOPE");
  revised.basis_versions = policy.requiredBasisRefs(env.fixture.state, ["user-request"]).map(ref => ({ ref, event_ref: env.fixture.state.history_index[ref].event_ref }));
  env.fixture.append("memory_updated", { changes: { action_scopes: [revised] } });
  assert.deepEqual(new Set(revised.basis_versions.map(x => x.ref)), new Set(["user-request", "target-condition", "transport-assumption"]));
  env.fixture.append("memory_updated", { changes: { assumptions: [{ ...env.fixture.state.assumptions[0], status: "retired" }] } });
  assert.equal(policy.eligibility(env.fixture.state, revised.scope_id).eligible, false);
});
test("previously discussed same-ID findings cannot stand in for revised findings", () => {
  const env = setup("report");
  env.fixture.append("memory_updated", { changes: { evidence: [{ evidence_id: "computed-findings", kind: "computed", run_id: "audit-one", source_ref: "runs/audit-one/results.json", summary: "Original findings" }] } });
  const revised = { ...env.scope, scope_id: "scope-computed", findings_refs: ["computed-findings"], basis_versions: policy.requiredBasisRefs(env.fixture.state, ["user-request", "computed-findings"]).map(ref => ({ ref, event_ref: env.fixture.state.history_index[ref].event_ref })) };
  env.fixture.append("memory_updated", { changes: { action_scopes: [revised] } });
  env.fixture.interpret("updated-findings");
  const outgoing = exchange("updated-findings"); outgoing.renderer = "lead-markdown-v4";
  outgoing.response.findings = { work_refs: ["computed-findings"], summary: "Original finding and uncertainty", diagnostics: [], limitations: ["Conditional on the same target"] };
  env.fixture.append("exchange_prepared", { protocol: PROTOCOL, exchange: outgoing });
  env.fixture.append("exchange_delivery", { protocol: PROTOCOL, delivery: { delivery_id: "delivery-findings", exchange_ref: outgoing.exchange_id, observation: "assistant_emission", source_ref: "conversation:assistant-findings", response_sha256: env.fixture.state.exchanges.at(-1).response_sha256 } });
  const option = { ...env.outgoing.response.next_steps[0], scope_ref: revised.scope_id, proposal: revised.public_scope, execution_plan: revised.execution_plan };
  policy.validateOffer(env.fixture.state, option, { next_steps: [option] }, {});
  env.fixture.append("memory_updated", { changes: { evidence: [{ ...env.fixture.state.evidence.find(x => x.evidence_id === "computed-findings"), summary: "Corrected finding" }] } });
  const newer = { ...revised, scope_id: "scope-corrected", supersedes: revised.scope_id, basis_versions: policy.requiredBasisRefs(env.fixture.state, ["user-request", "computed-findings"]).map(ref => ({ ref, event_ref: env.fixture.state.history_index[ref].event_ref })) };
  env.fixture.append("memory_updated", { changes: { action_scopes: [newer] } });
  rejects(() => policy.validateOffer(env.fixture.state, { ...option, scope_ref: newer.scope_id }, {}, {}), "FINDINGS_NOT_DISCUSSED");
});

test("review findings bind source, run and assumption closure and require redisclosure after correction", () => {
  const env = setup("report"); const fixture = env.fixture;
  fixture.append("memory_updated", { changes: {
    evidence: [{ evidence_id: "review-evidence", kind: "computed", run_id: "audit-one", source_ref: "runs/audit-one/results.json", summary: "Audit evidence" }],
    assumptions: [{ assumption_id: "review-assumption", statement: "The recorded allocation describes this sample", status: "active", basis_refs: ["user-request"] }],
    result_conditions: [{ condition_id: "review-condition", evidence_ref: "review-evidence", result_locator: "Audit result", claim: "The sample follows the recorded allocation", target: "Study design", assumption_refs: ["review-assumption"], basis_refs: ["user-request"], limitations: ["The allocation is based on the supplied account."] }]
  } });
  fixture.interpret("source-review", true);
  const reviewed = { ...review("source-review"), evidence_refs: ["review-evidence"], assumptions_added_or_revised: ["review-assumption"] };
  fixture.append("review_completed", { review: reviewed });
  const findings = { work_refs: [reviewed.review_id], summary: "The audit findings depend on the supplied allocation account.", diagnostics: ["Reviewed the recorded allocation."], limitations: ["This is a conditional design assessment."] };
  const discussion = exchange("source-review"); discussion.renderer = "lead-markdown-v4";
  discussion.completed_work_refs = [reviewed.review_id]; discussion.response.findings = findings;
  fixture.append("exchange_prepared", { protocol: PROTOCOL, exchange: discussion });
  fixture.append("exchange_delivery", { protocol: PROTOCOL, delivery: { delivery_id: "delivery-source-review", exchange_ref: discussion.exchange_id, observation: "assistant_emission", source_ref: "conversation:source-review", response_sha256: fixture.state.exchanges.at(-1).response_sha256 } });
  const refs = policy.requiredBasisRefs(fixture.state, [reviewed.review_id]);
  assert.deepEqual(new Set(refs), new Set([reviewed.review_id, "review-evidence", "review-assumption", "audit-one", "review-condition", "user-request"]));
  const scope = { ...env.scope, scope_id: "scope-review-report", findings_refs: [reviewed.review_id],
    execution_plan: { ...env.plan, evidence_refs: ["review-evidence"] },
    basis_versions: refs.map(ref => ({ ref, event_ref: fixture.state.history_index[ref].event_ref })) };
  fixture.append("memory_updated", { changes: { action_scopes: [scope] } });
  const option = { ...env.outgoing.response.next_steps[0], scope_ref: scope.scope_id, execution_plan: scope.execution_plan };
  policy.validateOffer(fixture.state, option, {}, {});
  for (const field of ["evidence", "assumptions"]) {
    const record = field === "evidence" ? { ...fixture.state.evidence.find(item => item.evidence_id === "user-request"), summary: "Correction: allocation was voluntary." }
      : { ...fixture.state.assumptions.find(item => item.assumption_id === "review-assumption"), status: "retired" };
    fixture.append("memory_updated", { changes: { [field]: [record] } });
    const corrected = { ...scope, scope_id: "scope-review-" + field,
      basis_versions: refs.map(ref => ({ ref, event_ref: fixture.state.history_index[ref].event_ref })) };
    fixture.append("memory_updated", { changes: { action_scopes: [corrected] } });
    const correctedOption = { ...option, scope_ref: corrected.scope_id };
    rejects(() => policy.validateOffer(fixture.state, correctedOption, {}, {}), "FINDINGS_NOT_DISCUSSED");
    const updated = { ...findings, summary: "The earlier allocation assessment no longer applies after the correction.", limitations: ["The old premise is not maintained; no causal effect is established."] };
    policy.validateOffer(fixture.state, correctedOption, { findings: updated }, {});
    fixture.interpret("redisclose-" + field);
    const outgoing = exchange("redisclose-" + field); outgoing.renderer = "lead-markdown-v4";
    outgoing.response.findings = updated; outgoing.response.next_steps = [correctedOption];
    fixture.append("exchange_prepared", { protocol: PROTOCOL, exchange: outgoing });
    fixture.append("exchange_delivery", { protocol: PROTOCOL, delivery: { delivery_id: "delivery-redisclose-" + field, exchange_ref: outgoing.exchange_id, observation: "assistant_emission", source_ref: "conversation:redisclose-" + field, response_sha256: fixture.state.exchanges.at(-1).response_sha256 } });
    policy.validateOffer(fixture.state, correctedOption, {}, {});
  }
});

test("old review projections remain unchanged and require source-bound reconciliation after activation", () => {
  const fixture = createFixture(); fixture.interpret("legacy-review", true);
  fixture.append("review_completed", { review: review("legacy-review") });
  const prior = structuredClone(fixture.state.specialist_reviews);
  assert.equal(Object.hasOwn(prior[0], "evidence_refs"), false);
  fixture.append("consultation_policy_activated", { policy: policy.POLICY, reconciliation: "Reconcile historical findings before using them for current work." });
  assert.deepEqual(fixture.state.specialist_reviews, prior);
  rejects(() => policy.requiredBasisRefs(fixture.state, ["review-legacy-review"]), "LEGACY_REVIEW_RECONCILIATION");
});

test("protected continuation stops at lead closeout and resumes only on a later user direction", () => {
  const env = setup(); const plan = authorize(env);
  const run = { run_id: "run-incomplete", kind: "analysis", status: "in_progress", interpretation_ref: plan.interpretation_ref, authorization_binding: policy.validateRunStart(env.fixture.state, plan) };
  env.fixture.append("run_started", { run });
  const outgoing = exchange("accept"); outgoing.renderer = "lead-markdown-v4";
  env.fixture.append("exchange_prepared", { protocol: PROTOCOL, exchange: outgoing });
  rejects(() => policy.validateRunContinuation(env.fixture.state, run, plan), "TURN_CLOSED");
  const resumed = interpretation("resume-incomplete"); resumed.incoming_refs = ["user-resume-incomplete"];
  resumed.next_action = structuredClone(env.fixture.state.interpretations.find(item => item.interpretation_id === plan.interpretation_ref).next_action);
  env.fixture.append("reply_interpreted", { protocol: PROTOCOL, interpretation: resumed,
    changes: { evidence: [{ evidence_id: "user-resume-incomplete", kind: "user_statement", source_ref: "conversation:resume", source_excerpt: "Please resume the already approved work.", summary: "Resume the same bounded action." }] } });
  assert.deepEqual(policy.validateRunContinuation(env.fixture.state, run, plan), run.authorization_binding);
});

test("a later captured discrepancy prevents an older hash-only receipt authorizing new work", () => {
  const env = setup();
  env.fixture.append("exchange_delivery", { protocol: PROTOCOL, delivery: {
    delivery_id: "delivery-actual-different", exchange_ref: env.outgoing.exchange_id,
    observation: "host_confirmed", source_ref: "exchanges/actual-different.txt", capture_source_ref: "test-host:actual-message",
    response_sha256: env.fixture.state.exchanges.at(-1).response_sha256, observed_response_sha256: "b".repeat(64)
  } });
  rejects(() => env.fixture.append("reply_interpreted", acceptance(env)), "UNOBSERVED_EXCHANGE");
  assert.equal(env.fixture.state.action_decisions.length, 0);
  assert.equal(Object.hasOwn(env.fixture.state.deliveries[0], "observed_response_sha256"), false);
});

test("a later captured discrepancy prevents old findings supporting an undisclosed report offer", () => {
  const env = setup("report");
  env.fixture.append("exchange_delivery", { protocol: PROTOCOL, delivery: {
    delivery_id: "delivery-findings-different", exchange_ref: env.outgoing.exchange_id,
    observation: "host_confirmed", source_ref: "exchanges/findings-different.txt", capture_source_ref: "test-host:actual-findings",
    response_sha256: env.fixture.state.exchanges.at(-1).response_sha256, observed_response_sha256: "b".repeat(64)
  } });
  rejects(() => policy.validateOffer(env.fixture.state, env.outgoing.response.next_steps[0], {}, {}), "FINDINGS_NOT_DISCUSSED");
  assert.doesNotThrow(() => policy.validateOffer(env.fixture.state, env.outgoing.response.next_steps[0], env.outgoing.response, {}));
});

test("current decision closure follows nested basis and user sources once without binding unrelated records", () => {
  const env = setup("analysis", true);
  env.fixture.append("memory_updated", { changes: {
    evidence: [{ evidence_id: "user-boundary", kind: "user_statement", source_ref: "chat:boundary", summary: "The stated reporting boundary." },
      { evidence_id: "user-preference", kind: "user_statement", source_ref: "chat:preference", summary: "A style preference." }],
    decisions: [{ decision_id: "boundary-nested", kind: "boundary", status: "current", statement: "The eligible sample only.",
      basis_refs: ["target-current"], user_contribution_refs: ["user-boundary"] },
    { ...env.fixture.state.decisions[0], basis_refs: ["source-target", "boundary-nested"] }]
  } });
  assert.deepEqual(policy.requiredBasisRefs(env.fixture.state, ["target-current"]), ["target-current"]);
  assert.deepEqual(new Set(policy.requiredBasisRefs(env.fixture.state, ["target-current"], { current: true })),
    new Set(["target-current", "source-target", "boundary-nested", "user-boundary"]));
});

test("new scope, offer, acceptance and resumption writes reject unbound decision provenance", () => {
  const env = setup("analysis", true);
  const sourceRequests = [
    { payload: { changes: { action_scopes: [{ ...env.scope, scope_id: "scope-new" }] } } },
    { payload: { exchange: env.outgoing } },
    { payload: acceptance(env) }
  ];
  for (const request of sourceRequests) rejects(() => policy.validateProposalWrite(env.fixture.state, request), "STALE_SCOPE");
  const plan = authorize(env);
  const accepted = structuredClone(env.fixture.state.action_decisions[0]);
  assert.equal(policy.eligibility(env.fixture.state, env.scope.scope_id).eligible, false);
  rejects(() => policy.validateRunStart(env.fixture.state, plan), "INVALID_AUTHORIZATION");
  const resumed = { payload: { interpretation: { next_action: structuredClone(env.fixture.state.interpretations.at(-1).next_action) } } };
  rejects(() => policy.validateProposalWrite(env.fixture.state, resumed), "STALE_SCOPE");
  assert.deepEqual(env.fixture.state.action_decisions[0], accepted);
  const reconciled = { ...env.scope, scope_id: "scope-reconciled", supersedes: env.scope.scope_id,
    basis_versions: policy.requiredBasisRefs(env.fixture.state, env.scope.basis_versions.map(binding => binding.ref), { current: true })
      .map(ref => ({ ref, event_ref: env.fixture.state.history_index[ref].event_ref })) };
  assert.doesNotThrow(() => policy.validateProposalWrite(env.fixture.state, { payload: { changes: { action_scopes: [reconciled] } } }));
  env.fixture.append("memory_updated", { changes: { action_scopes: [reconciled] } });
  assert.deepEqual(policy.eligibility(env.fixture.state, reconciled.scope_id), { eligible: false, reason: "awaiting user selection" });
});

test("historical missing decision bindings replay runs and findings unchanged but block current continuation", t => {
  const fs = require("node:fs"), os = require("node:os"), path = require("node:path");
  const store = require("../scripts/lib/store.cjs");
  const env = setup("analysis", true), plan = authorize(env);
  const acceptedEvent = env.fixture.events.at(-1);
  const binding = { policy: policy.POLICY, scope_ref: env.scope.scope_id, authorization_ref: plan.authorization_ref,
    basis_versions: structuredClone(env.scope.basis_versions) };
  const run = { run_id: "analysis-historical", kind: "analysis", status: "in_progress",
    interpretation_ref: plan.interpretation_ref, authorization_binding: binding };
  env.fixture.append("run_started", { run });
  rejects(() => policy.validateRunContinuation(env.fixture.state, run, plan), "STALE_SCOPE");
  env.fixture.append("run_finalized", { run: { ...run, status: "completed" } });
  env.fixture.append("memory_updated", { changes: {
    evidence: [{ evidence_id: "historical-result", kind: "computed", run_id: run.run_id, source_ref: "runs/analysis-historical/result.json", summary: "Historical result." }],
    result_conditions: [{ condition_id: "historical-condition", evidence_ref: "historical-result", result_locator: "Sample result", claim: "Trial mean contrast", target: "ATE",
      assumption_refs: [], basis_refs: ["target-current"], limitations: ["Conditional on recorded eligibility."] }]
  } });
  const outgoing = exchange("accept"); outgoing.renderer = "lead-markdown-v4"; outgoing.completed_work_refs = [run.run_id];
  outgoing.response.findings = { work_refs: [run.run_id], summary: "Historical result discussion.", diagnostics: [], limitations: ["Conditional on eligibility."] };
  env.fixture.append("exchange_prepared", { protocol: PROTOCOL, exchange: outgoing });
  const findings = env.fixture.state.exchanges.at(-1).findings_basis_versions;
  assert.ok(findings.some(item => item.ref === "target-current"));
  assert.equal(findings.some(item => item.ref === "source-target"), false);
  const bytes = env.fixture.events.map(event => JSON.stringify(event)).join("\n") + "\n";
  let replay = emptyState(env.fixture.events[0].project_id, env.fixture.events[0].timestamp);
  for (const event of env.fixture.events) replay = applyEvent(replay, event);
  assert.deepEqual(replay, env.fixture.state);
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-historical-decision-"));
  t.after(() => { assert.equal(path.dirname(fs.realpathSync.native(root)), base); assert.ok(path.basename(root).startsWith("cc-historical-decision-")); fs.rmSync(root, { recursive: true, force: true }); });
  fs.writeFileSync(path.join(root, "journal.jsonl"), bytes);
  assert.deepEqual(store.readJournal(root).state, env.fixture.state);
  const retry = { event_id: acceptedEvent.event_id, expected_project_id: acceptedEvent.project_id,
    expected_last_event_id: acceptedEvent.previous_event_id, type: acceptedEvent.type, payload: acceptedEvent.payload };
  assert.equal(store.record(root, retry).replayed, true);
  assert.equal(fs.readFileSync(path.join(root, "journal.jsonl"), "utf8"), bytes);
  assert.deepEqual(store.readJournal(root).state, env.fixture.state);
});
