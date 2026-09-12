"use strict";
// Synthetic user/lead exchanges for tests of the current policy. Historical
// replay fixtures remain separate and never acquire retrospective permission.
const store = require("../../scripts/lib/store.cjs");
const { PROTOCOL } = require("../../scripts/lib/exchanges.cjs");
const state = root => store.readJournal(root).state;
function ids(root, event_id) { const value = state(root); return { event_id, expected_project_id: value.state_meta.project_id, expected_last_event_id: value.state_meta.last_event_id }; }
function record(root, type, payload, event_id) { return store.record(root, { ...ids(root, event_id), type, payload }); }
function unique(root) { return "fixture-" + state(root).state_meta.sequence; }
function statement(id, text) { return { evidence_id: id, kind: "user_statement", source_ref: "conversation:" + id, source_excerpt: text, summary: text }; }
function interpret(root, suffix, next_action, extra = {}, userText = "Please help with this bounded study question.") {
  const incoming = "user-" + suffix;
  const interpretation = { interpretation_id: "interpretation-" + suffix, turn_id: "turn-" + suffix, incoming_refs: [incoming],
    components: [{ kind: "instruction", meaning: userText, established: [userText], unresolved: [] }], basis_refs: [], next_action, ...extra };
  record(root, "reply_interpreted", { protocol: PROTOCOL, changes: { evidence: [statement(incoming, userText)] }, interpretation }, "event-in-" + suffix);
  return interpretation;
}
function exchange(root, interpretation, suffix, response, completed_work_refs = []) {
  return record(root, "exchange_prepared", { protocol: PROTOCOL, exchange: { exchange_id: "exchange-" + suffix, turn_id: interpretation.turn_id,
    interpretation_ref: interpretation.interpretation_id, basis_refs: [], completed_work_refs,
    reconciliation: { changes: [], limitations: ["Synthetic fixture only."], unresolved: [], next_direction: "The user chooses the next bounded action." }, renderer: "lead-markdown-v4", response } }, "event-out-" + suffix);
}
function deliver(root, exchange_ref, suffix, response_sha256) {
  const loaded = store.readJournal(root);
  const saved = loaded.state.exchanges.find(item => item.exchange_id === exchange_ref);
  if (response_sha256 && response_sha256 !== saved.response_sha256) throw new Error("Fixture received the wrong prepared-response hash.");
  const outgoing = loaded.events.find(event => event.payload.exchange?.exchange_id === exchange_ref).payload.exchange;
  const delivery_id = "delivery-" + suffix;
  // This synthetic host emits the rendered fixture reply exactly. Production
  // capture must instead come from the actual host message or transcript.
  const message_path = "fixture-message-" + suffix + ".txt";
  require("node:fs").writeFileSync(require("node:path").join(root, message_path), require("../../scripts/lib/exchanges.cjs").renderExchange(outgoing));
  require("../../scripts/lib/delivery.cjs").observe(root, { ...ids(root, "event-delivery-" + suffix),
    delivery_id, exchange_ref, observation: "assistant_emission", message_path, source_ref: "fixture-host:assistant-" + suffix });
  return delivery_id;
}
function emptyResponse(status) { return { status, questions: [], questions_none: "No additional information is needed for this bounded decision.", next_steps: [], next_steps_none: "You may pause or ask another question." }; }
function findingReview(root, refs, suffix) {
  const assignment = { specialist_id: "data_audit", operation: "review" };
  const it = interpret(root, suffix, { kind: "specialist", assignment, scope: "Review the selected source evidence.", reason: "Establish limitations before proposing a source-based report." });
  const checkpoint_id = "checkpoint-" + suffix;
  record(root, "checkpoint", { checkpoint: { checkpoint_id, status: "assessing", primary_uncertainty: "Source interpretation", why_it_matters: "Keep reporting limited to the actual source." } }, "event-checkpoint-" + suffix);
  const review_id = "review-" + suffix;
  record(root, "review_completed", { review: { review_id, summary: "The sources support a limited descriptive account.", assignment,
    question_addressed: "What can the selected sources support?", selection_basis: { checkpoint_id, user_contribution_refs: it.incoming_refs },
    interpretation_ref: it.interpretation_id, work_performed: ["Reviewed the selected fixture sources."], findings: ["A source account is available; no additional causal identification is established."],
    limitations: ["The selected sources do not establish causal effects."], evidence_refs: refs } }, "event-review-" + suffix);
  const response = emptyResponse("The source review is complete."); response.findings = { work_refs: [review_id], summary: "The sources permit only a limited descriptive account.", diagnostics: ["Inspected source provenance."], limitations: ["No causal identification established."] };
  exchange(root, it, suffix, response, [review_id]); deliver(root, "exchange-" + suffix, suffix);
  return review_id;
}
function prepareScope(root, original, options = {}) {
  if (!state(root).state_meta.consultation_policy) record(root, "consultation_policy_activated", { policy: "consultation-loop-v1", reconciliation: "Synthetic current-policy fixture; no historical approval is inferred." }, "event-activate-" + unique(root));
  const plan = structuredClone(original);
  for (const key of ["interpretation_ref", "scope_ref", "authorization_ref"]) delete plan[key];
  for (const input of plan.inputs) if (!input.sha256) {
    input.sha256 = require("../../scripts/lib/files.cjs").sha256(require("node:fs").readFileSync(require("node:path").resolve(root, input.path)));
  }
  let findings = options.findings_refs || [];
  if (plan.kind === "report" && !findings.length) {
    findings = state(root).runs.filter(run => run.status === "completed" && run.kind !== "report").map(run => run.run_id);
    if (!findings.length) findings = [findingReview(root, plan.evidence_refs, "finding-" + unique(root))];
  }
  const suffix = options.suffix || unique(root);
  const assignment = plan.kind === "analysis" ? { specialist_id: "design_worker", operation: "execution", design_id: plan.design_id,
    ...(plan.additional_design_ids ? { additional_design_ids: plan.additional_design_ids } : {}) } : { specialist_id: "report_writer", operation: "reporting" };
  const it = interpret(root, "proposal-" + suffix, { kind: "lead_only", scope: "Present a concrete action scope.", reason: "The user needs a reviewable proposal before choosing." });
  const current = state(root);
  const basis = [...new Set([...(options.basis_refs || plan.evidence_refs || []), ...findings])];
  if (!basis.length) basis.push(it.incoming_refs[0]);
  for (let index = 0; index < basis.length; index++) {
    const ref = basis[index];
    const source = current.evidence.find(item => item.evidence_id === ref);
    const related = source?.run_id ? [source.run_id] : [];
    const conditions = current.result_conditions || [];
    for (const condition of conditions.filter(item => item.evidence_ref === ref && !conditions.some(other => other.supersedes === item.condition_id))) {
      related.push(condition.condition_id, ...condition.assumption_refs);
    }
    for (const target of related) if (!basis.includes(target)) basis.push(target);
  }
  for (const ref of require("../../scripts/lib/authorizations.cjs").requiredBasisRefs(current, basis)) if (!basis.includes(ref)) basis.push(ref);
  const scope = { scope_id: "scope-" + suffix, action: plan.kind, assignment,
    public_scope: { target: plan.target || plan.purpose, population: plan.population || "Population described by the selected sources",
      evidence: plan.inputs.map(input => input.source_ref).join(", ") || (plan.evidence_refs || basis).join(", "),
      approach: plan.estimator || "Synthesize only the discussed evidence", checks: plan.diagnostics || [], outputs: plan.kind === "analysis" ? "Findings and planned diagnostics" : plan.format + " report",
      claim_boundary: plan.claim_boundary }, execution_plan: plan,
    basis_versions: basis.map(ref => ({ ref, event_ref: current.history_index[ref].event_ref })), findings_refs: findings,
    ...(options.supersedes ? { supersedes: options.supersedes } : {}) };
  record(root, "memory_updated", { changes: { action_scopes: [scope] } }, "event-scope-" + suffix);
  const response = emptyResponse("I understand the desired report. Here is the bounded work you can choose next.");
  delete response.next_steps_none;
  response.next_steps = [{ option_id: "choose-" + suffix, kind: "action", label: plan.kind === "report" ? "Produce the final report" : "Run the proposed analysis", actor: "consultant",
    scope: "Use this exact proposed scope and its limitations.", basis_refs: basis, assignment, scope_ref: scope.scope_id, proposal: scope.public_scope, execution_plan: plan }];
  if (findings.length) response.findings = { work_refs: findings, summary: "These are the current findings supporting the proposed report.", diagnostics: ["Reviewed the retained evidence."], limitations: [scope.public_scope.claim_boundary] };
  const receipt = exchange(root, it, suffix, response);
  const delivery_ref = deliver(root, receipt.exchange_id, suffix, receipt.response_sha256);
  return { scope, suffix, exchange_ref: receipt.exchange_id, option_id: response.next_steps[0].option_id, delivery_ref, rendered_response: receipt.rendered_response };
}
function acceptScope(root, offer, options = {}) {
  const suffix = options.suffix || "accept-" + unique(root);
  const decision_id = "decision-" + suffix;
  const user_ref = "user-" + suffix;
  const disposition = options.disposition || "accept";
  const next_action = disposition === "accept" && !options.lead_only ? { kind: "specialist", scope: "Execute only the selected action.", reason: "The user accepted the presented scope.",
    assignment: offer.scope.assignment, scope_ref: offer.scope.scope_id, authorization_ref: decision_id } : { kind: "lead_only", scope: "Retain the user's direction.", reason: "No protected work is being started.", adjustment_reason: "The user chose discussion or deferred work." };
  const it = interpret(root, suffix, next_action, { focus_scope_ref: offer.scope.scope_id,
    components: [{ kind: "selection", meaning: options.user_text || "I choose the proposed scope exactly as presented.", established: ["The user selected the current scope."], unresolved: [], exchange_ref: offer.exchange_ref, option_id: offer.option_id, delivery_ref: offer.delivery_ref }],
    action_decisions: [{ decision_id, scope_ref: offer.scope.scope_id, disposition, exchange_ref: offer.exchange_ref, option_id: offer.option_id, delivery_ref: offer.delivery_ref, user_refs: [user_ref] }] }, options.user_text || "I choose the proposed scope exactly as presented.");
  return { ...structuredClone(offer.scope.execution_plan), interpretation_ref: it.interpretation_id, scope_ref: offer.scope.scope_id, authorization_ref: decision_id };
}
function authorizePlan(root, plan, options = {}) { return acceptScope(root, prepareScope(root, plan, options)); }
function preparePlan(root, plan, options = {}) {
  if (["analysis", "report"].includes(plan.kind)) return authorizePlan(root, plan, options);
  const assignment = plan.kind === "discovery" ? { specialist_id: "causal_discovery", operation: "discovery" }
    : { specialist_id: "data_audit", operation: plan.transformations ? "prepare" : "review" };
  const it = interpret(root, "investigate-" + unique(root), { kind: "specialist", assignment, scope: "Perform the bounded investigation.", reason: "Inspect the provided data within the requested question." });
  return { ...structuredClone(plan), interpretation_ref: it.interpretation_id,
    operations: plan.kind === "discovery" ? ["graph_exploration"] : [plan.transformations ? "preparation" : "data_quality"] };
}
module.exports = { state, ids, record, statement, interpret, exchange, deliver, emptyResponse, prepareScope, acceptScope, authorizePlan, preparePlan };
