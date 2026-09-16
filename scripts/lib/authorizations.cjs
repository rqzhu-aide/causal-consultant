"use strict";

const { fail, canonical } = require("./files.cjs");
const { object, text, id, enumeration, array, strings, validateAssignment } = require("./model.cjs");
const { validatePlanStructure } = require("./plan-validation.cjs");
const POLICY = "consultation-loop-v1";
const list = (state, name) => state[name] || [];
const active = state => state.state_meta.consultation_policy?.policy === POLICY;
const scopeFor = (state, ref, payload = {}) => payload.changes?.action_scopes?.find(x => x.scope_id === ref) || list(state, "action_scopes").find(x => x.scope_id === ref);
function requirePolicy(state) { if (!active(state)) fail("POLICY_ACTIVATION_REQUIRED", "Activate consultation-loop-v1 before new protected work; historical work supplies no retrospective permission."); }
function validateActivation(state, payload) {
  enumeration(payload.policy, [POLICY], "policy"); text(payload.reconciliation, "reconciliation");
  if (active(state)) fail("POLICY_ALREADY_ACTIVE", "The consultation loop policy is already active.");
  if (state.runs.some(run => run.status === "in_progress")) fail("LEGACY_RUN_ACTIVE", "Resolve existing runs with their original runtime before activating the new policy.");
}
function normalizedPlan(plan) {
  const result = structuredClone(plan);
  for (const key of ["interpretation_ref", "scope_ref", "authorization_ref", "authorization_binding", "plan_schema_version", "run_id", "frozen_at", "evidence_bindings"]) delete result[key];
  for (const input of result.inputs || []) for (const key of ["snapshot_ref", "source_sha256", "snapshot_sha256", "size_bytes"]) delete input[key];
  return result;
}
function changedRecords(payload) { return Object.values(payload.changes || {}).filter(Array.isArray).flat(); }
function validateProposalWrite(state, request) {
  // Call only for a new public write, after semantic validation. Historical
  // events and exact retries must retain their original acceptance rules.
  const payload = request.payload;
  for (const scope of payload.changes?.action_scopes || []) validatePlanStructure(scope.execution_plan);
  for (const option of payload.exchange?.response.next_steps || []) {
    if (option.scope_ref) {
      const scope = scopeFor(state, option.scope_ref, payload);
      validatePlanStructure(scope.execution_plan);
      const target = scope.basis_versions.some(binding => {
        const decision = list(state, "decisions").find(item => item.decision_id === binding.ref);
        return decision?.kind === "target" && decision.status === "current"
          && state.history_index[binding.ref]?.event_ref === binding.event_ref
          && require("./model.cjs").decisionHasSource(state, payload, decision);
      });
      if (!target) fail("MISSING_TARGET_BINDING", "A new protected offer must bind a current source-linked target decision; the lead checks its relevance to this scope.");
    }
  }
}
function requiredBasisRefs(state, refs) {
  const found = new Set(refs), queue = [...refs];
  const add = ref => { if (ref && !found.has(ref)) { found.add(ref); queue.push(ref); } };
  while (queue.length) {
    const ref = queue.shift();
    const review = list(state, "specialist_reviews").find(record => record.review_id === ref);
    if (review && active(state) && (!Object.hasOwn(review, "evidence_refs") || !Object.hasOwn(review, "assumptions_added_or_revised"))) fail("LEGACY_REVIEW_RECONCILIATION", "Reconcile a historical review through a new source-bound review before using it as current findings or scope basis.");
    if (review) for (const dependency of [...(review.evidence_refs || []), ...(review.assumptions_added_or_revised || [])]) add(dependency);
    if (state.runs.some(run => run.run_id === ref)) for (const record of state.evidence) if (record.run_id === ref && !state.evidence.some(other => other.supersedes === record.evidence_id)) add(record.evidence_id);
    const evidence = state.evidence.find(record => record.evidence_id === ref);
    if (evidence) {
      add(evidence.run_id);
      for (const condition of list(state, "result_conditions")) if (condition.evidence_ref === ref && !list(state, "result_conditions").some(other => other.supersedes === condition.condition_id)) add(condition.condition_id);
    }
    const condition = list(state, "result_conditions").find(record => record.condition_id === ref);
    if (condition) for (const dependency of [condition.evidence_ref, ...condition.assumption_refs, ...condition.basis_refs]) add(dependency);
    const assumption = state.assumptions.find(record => record.assumption_id === ref);
    if (assumption) for (const dependency of assumption.basis_refs || []) add(dependency);
  }
  return [...found];
}
function staleReason(state, scope, payload = {}) {
  if (list(state, "action_scopes").some(other => other.supersedes === scope.scope_id) || (payload.changes?.action_scopes || []).some(other => other.supersedes === scope.scope_id)) return "scope superseded";
  const records = Object.values(state).filter(Array.isArray).flat().concat(changedRecords(payload));
  for (const binding of scope.basis_versions) {
    if (state.history_index[binding.ref]?.event_ref !== binding.event_ref) return "basis version changed: " + binding.ref;
    if (records.some(record => record?.supersedes === binding.ref)) return "basis superseded: " + binding.ref;
    if (changedRecords(payload).some(record => Object.values(record).includes(binding.ref) && Object.keys(record).some(key => key.endsWith("_id") && record[key] === binding.ref))) return "basis changing in this event: " + binding.ref;
  }
  const refs = scope.basis_versions.map(binding => binding.ref);
  const required = requiredBasisRefs(state, [...refs, ...(scope.execution_plan.evidence_refs || [])]);
  if (required.some(ref => !refs.includes(ref))) return "governing evidence, result conditions or assumptions are not version-bound";
  if ((payload.changes?.result_conditions || []).some(condition => refs.includes(condition.evidence_ref))) return "governing result conditions are changing in this event";
  return null;
}
function validateScopes(state, scopes, context, payload) {
  requirePolicy(state);
  array(scopes, "action_scopes", (scope, label) => {
    object(scope, label, ["scope_id", "action", "assignment", "public_scope", "execution_plan", "basis_versions", "findings_refs"], ["supersedes"]);
    id(scope.scope_id, label + ".scope_id"); enumeration(scope.action, ["analysis", "report"], label + ".action");
    validateAssignment(scope.assignment, label + ".assignment", context);
    const expected = scope.action === "analysis" ? "design_worker" : "report_writer";
    if (scope.assignment.specialist_id !== expected) fail("SCOPE_MISMATCH", "The protected scope and assigned specialist disagree.");
    object(scope.public_scope, label + ".public_scope", ["target", "population", "evidence", "approach", "checks", "outputs", "claim_boundary"]);
    for (const key of ["target", "population", "evidence", "approach", "outputs", "claim_boundary"]) text(scope.public_scope[key], label + ".public_scope." + key);
    strings(scope.public_scope.checks, label + ".public_scope.checks");
    if (!scope.execution_plan || typeof scope.execution_plan !== "object" || Array.isArray(scope.execution_plan)) fail("INVALID_INPUT", "execution_plan must be an object.");
    array(scope.execution_plan.inputs, label + ".execution_plan.inputs", (input, name) => {
      object(input, name, ["source_ref", "path", "sha256"]);
      text(input.source_ref, name + ".source_ref"); text(input.path, name + ".path");
      if (!/^[a-f0-9]{64}$/.test(input.sha256)) fail("UNBOUND_SCOPE_INPUT", "Protected proposals bind each input file's SHA-256 before presentation; changed source bytes require reconciliation.");
    });
    if (canonical(normalizedPlan(scope.execution_plan)) !== canonical(scope.execution_plan)) fail("INVALID_INPUT", "Scope execution_plan excludes transient interpretation, authorization and frozen-run fields.");
    if (scope.execution_plan.kind !== scope.action || scope.execution_plan.claim_boundary !== scope.public_scope.claim_boundary) fail("SCOPE_MISMATCH", "The proposed execution plan must match its action and public claim boundary.");
    if (scope.action === "analysis") {
      if (scope.execution_plan.target !== scope.public_scope.target || scope.execution_plan.population !== scope.public_scope.population || canonical(scope.execution_plan.diagnostics) !== canonical(scope.public_scope.checks)) fail("SCOPE_MISMATCH", "Analysis target, population and checks must match the rendered public scope.");
      if (scope.execution_plan.design_id !== scope.assignment.design_id) fail("SCOPE_MISMATCH", "Plan and assignment must select the same design.");
    }
    array(scope.basis_versions, label + ".basis_versions", (binding, name) => {
      object(binding, name, ["ref", "event_ref"]); context.reference(binding.ref, name + ".ref"); context.reference(binding.event_ref, name + ".event_ref", "event");
      if (state.history_index[binding.ref]?.event_ref !== binding.event_ref) fail("STALE_SCOPE", "Bind each scope basis to its already committed current record version.");
    }, true);
    if (new Set(scope.basis_versions.map(x => x.ref)).size !== scope.basis_versions.length) fail("INVALID_INPUT", "Scope basis references must be distinct.");
    context.references(scope.findings_refs, label + ".findings_refs", undefined, scope.action === "report");
    for (const ref of scope.findings_refs) {
      const kind = state.history_index[ref]?.kind;
      if (!["run", "review", "evidence"].includes(kind)) fail("INVALID_FINDINGS", "Findings refer to completed work or computed evidence.");
      if (kind === "run" && state.runs.find(run => run.run_id === ref)?.status !== "completed") fail("INVALID_FINDINGS", "Findings cannot use unfinished runs.");
      if (kind === "evidence" && state.evidence.find(record => record.evidence_id === ref)?.kind !== "computed") fail("INVALID_FINDINGS", "Evidence findings require computed evidence from completed work.");
      if (!scope.basis_versions.some(binding => binding.ref === ref)) fail("INVALID_FINDINGS", "Report findings must be version-bound scope basis.");
    }
    if (scope.supersedes) { context.reference(scope.supersedes, label + ".supersedes", "action_scope"); if (scope.supersedes === scope.scope_id) fail("INVALID_INPUT", "A scope cannot supersede itself."); }
    const reason = staleReason(state, scope, payload); if (reason) fail("STALE_SCOPE", reason);
  });
}
function validateOffer(state, option, response, payload) {
  requirePolicy(state);
  const scope = scopeFor(state, option.scope_ref, payload);
  if (!scope) fail("UNKNOWN_REFERENCE", "An offer requires its action scope.");
  const reason = staleReason(state, scope, payload); if (reason) fail("STALE_SCOPE", reason);
  if (canonical(option.assignment) !== canonical(scope.assignment) || canonical(option.proposal) !== canonical(scope.public_scope) || canonical(option.execution_plan) !== canonical(scope.execution_plan)) fail("SCOPE_MISMATCH", "The rendered offer must contain the exact scope, execution terms and assignment being proposed.");
  if (scope.action === "report") {
    const discussed = new Set(response.findings?.work_refs || []);
    for (const exchange of list(state, "exchanges")) if (list(state, "deliveries").some(delivery => delivery.exchange_ref === exchange.exchange_id && require("./exchanges.cjs").deliveryMatches(delivery, state, payload))) {
      for (const ref of exchange.findings?.work_refs || []) {
        const dependencies = requiredBasisRefs(state, [ref]);
        if (dependencies.every(dependency => exchange.findings_basis_versions?.some(binding => binding.ref === dependency && binding.event_ref === state.history_index[dependency]?.event_ref))) discussed.add(ref);
      }
    }
    if (scope.findings_refs.some(ref => !discussed.has(ref))) fail("FINDINGS_NOT_DISCUSSED", "Offer a report only with current findings and limitations presented now or in a prior observed reply.");
  }
}
function validateDecisions(state, interpretation, context, payload) {
  if (!active(state)) {
    if (interpretation.action_decisions || Object.hasOwn(interpretation, "focus_scope_ref") || interpretation.next_action.scope_ref || interpretation.next_action.authorization_ref) requirePolicy(state);
    return;
  }
  if (Object.hasOwn(interpretation, "focus_scope_ref") && interpretation.focus_scope_ref !== null) context.reference(interpretation.focus_scope_ref, "interpretation.focus_scope_ref", "action_scope");
  array(interpretation.action_decisions || [], "interpretation.action_decisions", (decision, label) => {
    object(decision, label, ["decision_id", "scope_ref", "disposition", "exchange_ref", "option_id", "delivery_ref", "user_refs"]);
    id(decision.decision_id, label + ".decision_id"); context.reference(decision.scope_ref, label + ".scope_ref", "action_scope");
    enumeration(decision.disposition, ["accept", "defer", "decline", "withdraw"], label + ".disposition");
    context.contributionRefs(decision.user_refs, label + ".user_refs", true);
    const exchange = list(state, "exchanges").find(x => x.exchange_id === decision.exchange_ref);
    const option = exchange?.options.find(x => x.option_id === decision.option_id);
    const delivery = payload.delivery?.delivery_id === decision.delivery_ref ? payload.delivery : list(state, "deliveries").find(x => x.delivery_id === decision.delivery_ref);
    if (!exchange || !option || option.scope_ref !== decision.scope_ref || !delivery || delivery.exchange_ref !== decision.exchange_ref || !require("./exchanges.cjs").deliveryMatches(delivery, state, payload)) fail("INVALID_AUTHORIZATION", "A decision must bind its exact previously offered scope, option and observed delivery.");
    for (const ref of decision.user_refs) {
      const fresh = (payload.changes?.evidence || []).some(x => x.evidence_id === ref && !state.history_index[ref]);
      const sequence = state.history_index[ref]?.sequence;
      if (!interpretation.incoming_refs.includes(ref) || (!fresh && (!sequence || sequence <= exchange.sequence))) fail("EARLY_AUTHORIZATION", "Only subsequent incoming user evidence can select a presented offer; an early report request is not consent.");
      if (list(state, "action_decisions").some(prior => prior.user_refs.includes(ref))) fail("REUSED_USER_DECISION", "A previously consumed user decision cannot authorize another action.");
    }
    const matched = interpretation.components.some(component => (decision.disposition !== "accept" || component.kind === "selection") && component.exchange_ref === decision.exchange_ref && component.option_id === decision.option_id && component.delivery_ref === decision.delivery_ref);
    if (!matched) fail("INVALID_AUTHORIZATION", "The interpretation must preserve the actual selected offer and observation.");
    if (decision.disposition === "accept") {
      const scope = scopeFor(state, decision.scope_ref, payload);
      const reason = staleReason(state, scope, payload); if (reason) fail("STALE_SCOPE", reason);
      const next = interpretation.next_action;
      if (next.kind === "specialist" && next.scope_ref === scope.scope_id) {
        if (next.authorization_ref !== decision.decision_id || canonical(next.assignment) !== canonical(scope.assignment)) fail("INVALID_AUTHORIZATION", "Executing the accepted action requires its exact assignment, scope and decision.");
      } else {
        if (!next.adjustment_reason) fail("INVALID_AUTHORIZATION", "Retaining acceptance without executing it requires an explicit postponement reason.");
        // A valid choice may wait for clarification. Doing something else also
        // needs a separate user direction; an adjustment alone cannot invent work.
        const separatelySelected = next.kind !== "specialist" || interpretation.components.some(component => {
          if (component.exchange_ref === decision.exchange_ref && component.option_id === decision.option_id) return false;
          if (component.kind === "instruction" && component.established.length && !component.option_id) return true;
          if (component.kind !== "selection") return false;
          const other = list(state, "exchanges").find(item => item.exchange_id === component.exchange_ref)?.options.find(item => item.option_id === component.option_id);
          return other?.assignment && canonical(other.assignment) === canonical(next.assignment)
            && (other.scope_ref || null) === (next.scope_ref || null);
        });
        if (next.kind === "specialist" && !separatelySelected) fail("INVALID_AUTHORIZATION", "Work independent of a paused acceptance requires its own explicit user instruction or observed selection.");
      }
    }
  });
  if ((interpretation.action_decisions || []).filter(x => x.disposition === "accept").length > 1) fail("INVALID_AUTHORIZATION", "One reply selects at most one protected action.");
  const next = interpretation.next_action;
  if (next.scope_ref || next.authorization_ref) {
    if (!next.scope_ref || !next.authorization_ref || next.kind !== "specialist") fail("INVALID_AUTHORIZATION", "Protected work requires both scope and authorization on its specialist interpretation.");
    const scope = scopeFor(state, next.scope_ref, payload);
    const decision = (interpretation.action_decisions || []).find(x => x.decision_id === next.authorization_ref) || list(state, "action_decisions").find(x => x.decision_id === next.authorization_ref);
    if (!scope || !decision || decision.disposition !== "accept" || decision.scope_ref !== scope.scope_id || canonical(next.assignment) !== canonical(scope.assignment)) fail("INVALID_AUTHORIZATION", "An assignment explanation cannot expand the selected protected scope.");
    const reason = staleReason(state, scope, payload); if (reason) fail("STALE_SCOPE", reason);
  }
  if (next.kind === "specialist" && (next.assignment.specialist_id === "report_writer" || (next.assignment.specialist_id === "design_worker" && next.assignment.operation === "execution")) && !next.authorization_ref) fail("MISSING_AUTHORIZATION", "Protected work requires selection of a presented current action offer.");
}
function eligibility(state, scopeId) {
  const scope = scopeFor(state, scopeId);
  if (!active(state) || !scope) return { eligible: false, reason: "policy or scope missing" };
  const reason = staleReason(state, scope); if (reason) return { eligible: false, reason };
  const decisions = list(state, "action_decisions").filter(x => x.scope_ref === scopeId);
  const decision = decisions.at(-1);
  if (!decision || decision.disposition !== "accept") return { eligible: false, reason: decision?.disposition || "awaiting user selection" };
  if (state.runs.some(run => run.authorization_binding?.authorization_ref === decision.decision_id)) return { eligible: false, reason: "authorization already used", authorization_ref: decision.decision_id };
  return { eligible: true, authorization_ref: decision.decision_id };
}
function validateRunStart(state, plan) {
  if (!["analysis", "report"].includes(plan.kind)) return null;
  requirePolicy(state);
  const scope = scopeFor(state, plan.scope_ref);
  if (!scope || !plan.authorization_ref) fail("MISSING_AUTHORIZATION", "Protected execution requires a previously offered scope and a later user acceptance.");
  const current = eligibility(state, scope.scope_id);
  if (!current.eligible || current.authorization_ref !== plan.authorization_ref) fail("INVALID_AUTHORIZATION", current.reason || "The authorization does not match the current scope selection.");
  if (scope.action !== plan.kind || canonical(scope.execution_plan) !== canonical(normalizedPlan(plan))) fail("SCOPE_MISMATCH", "The execution plan must exactly match the substantive terms in the accepted offer.");
  const interpretation = list(state, "interpretations").find(x => x.interpretation_id === plan.interpretation_ref);
  if (!interpretation || interpretation.next_action.scope_ref !== scope.scope_id || interpretation.next_action.authorization_ref !== plan.authorization_ref || canonical(interpretation.next_action.assignment) !== canonical(scope.assignment)) fail("INVALID_AUTHORIZATION", "Run attribution must identify its prospectively committed selection of this protected action.");
  if (list(state, "interpretations").at(-1)?.interpretation_id !== plan.interpretation_ref) fail("DIRECTION_CHANGED", "New work must follow the latest interpreted user direction; recover an older permission explicitly before resuming it.");
  if (list(state, "turns").find(x => x.interpretation_ref === plan.interpretation_ref)?.exchange_ref) fail("TURN_CLOSED", "A returned reply cannot execute further protected work without new user steering.");
  return { policy: POLICY, scope_ref: scope.scope_id, authorization_ref: plan.authorization_ref, basis_versions: structuredClone(scope.basis_versions) };
}
function validateRunContinuation(state, run, plan) {
  if (!["analysis", "report"].includes(run.kind)) return null;
  requirePolicy(state);
  const binding = run.authorization_binding;
  if (!binding || binding.policy !== POLICY) fail("LEGACY_RUN_ACTIVE", "This legacy run must continue under its original runtime or be reconciled before the new policy is activated.");
  const scope = scopeFor(state, binding.scope_ref);
  if (!scope) fail("INVALID_AUTHORIZATION", "Run scope is missing.");
  const reason = staleReason(state, scope); if (reason) fail("STALE_SCOPE", reason);
  const decision = list(state, "action_decisions").filter(x => x.scope_ref === scope.scope_id).at(-1);
  if (decision?.disposition !== "accept" || decision.decision_id !== binding.authorization_ref) fail("INVALID_AUTHORIZATION", "The action permission has been changed or withdrawn.");
  const currentInterpretation = list(state, "interpretations").at(-1);
  const currentDirection = currentInterpretation?.next_action;
  if (currentDirection?.kind !== "specialist" || currentDirection.scope_ref !== scope.scope_id || currentDirection.authorization_ref !== binding.authorization_ref) fail("DIRECTION_CHANGED", "The latest user turn steered away from this work. Reconcile that direction before further output.");
  if (list(state, "turns").find(turn => turn.interpretation_ref === currentInterpretation.interpretation_id)?.exchange_ref) fail("TURN_CLOSED", "A returned reply cannot emit further protected output without new user steering.");
  if (canonical(binding.basis_versions) !== canonical(scope.basis_versions) || plan.scope_ref !== scope.scope_id || plan.authorization_ref !== binding.authorization_ref) fail("INVALID_AUTHORIZATION", "Run permission identity must remain frozen.");
  return binding;
}
function validateRunRecord(state, run, type) {
  if (!active(state) || !["analysis", "report"].includes(run.kind)) return;
  if (type === "run_started") {
    const scope = scopeFor(state, run.authorization_binding?.scope_ref);
    const status = eligibility(state, scope?.scope_id);
    if (!scope || !status.eligible || status.authorization_ref !== run.authorization_binding?.authorization_ref || run.authorization_binding.policy !== POLICY || canonical(run.authorization_binding.basis_versions) !== canonical(scope.basis_versions)) fail("INVALID_AUTHORIZATION", "A new protected run must preserve its current unused action permission.");
    const interpretation = list(state, "interpretations").find(x => x.interpretation_id === run.interpretation_ref);
    if (scope.action !== run.kind || interpretation?.next_action.scope_ref !== scope.scope_id || interpretation?.next_action.authorization_ref !== status.authorization_ref) fail("INVALID_AUTHORIZATION", "Run action and interpretation must match the recorded permission.");
  } else {
    const prior = state.runs.find(x => x.run_id === run.run_id);
    if (canonical(prior?.authorization_binding) !== canonical(run.authorization_binding)) fail("INVALID_AUTHORIZATION", "A run lifecycle event cannot change its original permission binding.");
  }
}
function findingsCoverRun(state, findings, run, payload = {}) {
  return (findings?.work_refs || []).some(ref => ref === run.run_id
    || state.evidence.some(record => record.evidence_id === ref && record.kind === "computed" && record.run_id === run.run_id)
    || [...list(state, "specialist_reviews"), ...(payload.review ? [payload.review] : [])].some(review => review.review_id === ref && review.interpretation_ref && review.interpretation_ref === run.interpretation_ref));
}
module.exports = { POLICY, active, validateActivation, validateScopes, validateProposalWrite, validateOffer, validateDecisions, validateRunStart, validateRunContinuation, validateRunRecord, eligibility, normalizedPlan, staleReason, requiredBasisRefs, findingsCoverRun };
