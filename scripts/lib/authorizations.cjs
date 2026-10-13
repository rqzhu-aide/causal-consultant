"use strict";

const { fail, canonical } = require("./files.cjs");
const { object, text, id, enumeration, array, strings, validateAssignment } = require("./model.cjs");
const { validatePlanStructure } = require("./plan-validation.cjs");
const POLICY = "consultation-loop-v1";
const LOCAL_REPORT_FORMATS = ["markdown", "html", "pdf", "docx", "text"];
const list = (state, name) => state[name] || [];
const active = state => state.state_meta.consultation_policy?.policy === POLICY;
const scopeFor = (state, ref, payload = {}) => payload.changes?.action_scopes?.find(x => x.scope_id === ref) || list(state, "action_scopes").find(x => x.scope_id === ref);
const actualExchange = (state, exchange, payload = {}, deliveryRef) => exchange && require("./exchanges.cjs").effectiveExchange(state, exchange, payload, deliveryRef);
function acceptedOffer(state, decision, payload = {}) {
  const exchange = actualExchange(state, list(state, "exchanges").find(item => item.exchange_id === decision.exchange_ref), payload, decision.delivery_ref);
  if (!exchange?.options.some(option => option.option_id === decision.option_id && option.scope_ref === decision.scope_ref)) return false;
  const resolution = require("./exchanges.cjs").resolveDeliveryReference(state, decision.delivery_ref, payload);
  if (!["current", "unverified"].includes(resolution.status)) return false;
  const delivery = resolution.delivery || list(state, "deliveries").find(item => item.delivery_id === decision.delivery_ref);
  const scope = scopeFor(state, decision.scope_ref, payload);
  return !require("./exchanges.cjs").isAgentRecorded(delivery) || scope?.action !== "report"
    || actualReportFindingsDiscussed(state, scope, decision, payload);
}
function actualReportFindingsDiscussed(state, scope, decision, payload = {}, exactIncomingSequence) {
  const utility = require("./exchanges.cjs");
  const offerSequence = list(state, "exchanges").find(exchange => exchange.exchange_id === decision.exchange_ref)?.sequence;
  const positions = decision.user_refs.map(ref => utility.primarySourceSequence(state, ref, payload));
  const acceptanceSequence = exactIncomingSequence ?? (positions.every(Number.isSafeInteger) ? Math.min(...positions) : undefined);
  if (!Number.isSafeInteger(acceptanceSequence)) return false;
  const decisionSequence = state.history_index[decision.decision_id]?.sequence;
  const observations = [...list(state, "deliveries"), ...(payload.delivery ? [payload.delivery] : [])];
  const discussed = new Set();
  for (const prepared of list(state, "exchanges")) {
    const exchange = actualExchange(state, prepared, payload);
    const resolution = utility.resolvedDelivery(state, exchange.exchange_id, payload);
    const actual = resolution.delivery;
    let priorDiscussion;
    if (utility.isAgentRecorded(actual)) {
      if (utility.recordedBeforeSequence(state, actual) > acceptanceSequence) continue;
      const recordedSequence = state.history_index[actual.delivery_id]?.sequence;
      if (Number.isSafeInteger(decisionSequence) && (!Number.isSafeInteger(recordedSequence) || recordedSequence > decisionSequence)) {
        // A later interpretation can confirm an earlier discussion. It cannot
        // add findings to the discussion that established this old acceptance.
        priorDiscussion = new Set();
        const priorRefs = utility.resolveDeliveryReference(state, actual.delivery_id, payload).observation_refs || [];
        const atAcceptance = { ...state, deliveries: observations.filter(value =>
          Number.isSafeInteger(state.history_index[value.delivery_id]?.sequence)
          && state.history_index[value.delivery_id].sequence <= decisionSequence) };
        const prior = utility.resolvedDelivery(atAcceptance, prepared.exchange_id);
        if (prior.status === "current" && utility.deliveryMatches(prior.delivery, atAcceptance)
          && utility.resolveDeliveryReference(atAcceptance, prior.delivery.delivery_id).observation_refs.some(ref => priorRefs.includes(ref))) {
          const refs = utility.isAgentRecorded(prior.delivery)
            ? utility.recordedItems(prior.delivery).filter(item => item.kind === "findings").flatMap(item => item.work_refs || [])
            : prepared.findings?.work_refs || [];
          for (const ref of refs) priorDiscussion.add(ref);
        }
      }
    } else if (prepared.sequence > offerSequence) continue;
    if (!observations.some(delivery => delivery.exchange_ref === exchange.exchange_id
      && utility.deliveryMatches(delivery, state, payload))) continue;
    for (const ref of exchange.findings?.work_refs || []) {
      if (priorDiscussion && !priorDiscussion.has(ref)) continue;
      const fresh = requiredBasisRefs(state, [ref]).every(dependency => exchange.findings_basis_versions?.some(binding =>
        binding.ref === dependency && binding.event_ref === state.history_index[dependency]?.event_ref));
      if (fresh) discussed.add(ref);
    }
  }
  return scope.findings_refs.every(ref => discussed.has(ref));
}
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
// Called on a cloned live request, inside transact after retry/head checks.
// Canonical history keeps the full scopes and options understood by old readers.
function prepareProposalWrite(state, request) {
  const payload = request.payload;
  if (payload?.changes && Object.hasOwn(payload.changes, "action_scopes")) array(payload.changes.action_scopes, "action_scopes", (scope, label) => {
    if (!scope || typeof scope !== "object" || Array.isArray(scope)) fail("INVALID_INPUT", label + " must be an object.");
  });
  if (Array.isArray(payload?.changes?.action_scopes)) for (const scope of payload.changes.action_scopes) {
    if (!scope || !Object.hasOwn(scope, "basis_refs")) continue;
    if (Object.hasOwn(scope, "basis_versions")) fail("INVALID_INPUT", "A fresh scope takes either basis_refs or basis_versions, not both.");
    if (state.history_index[scope.scope_id]) fail("DUPLICATE_ID", "A scope's basis cannot be rebound: " + scope.scope_id);
    strings(scope.basis_refs, "scope.basis_refs");
    strings(scope.findings_refs, "scope.findings_refs");
    if (scope.execution_plan && Object.hasOwn(scope.execution_plan, "evidence_refs")) strings(scope.execution_plan.evidence_refs, "scope.execution_plan.evidence_refs");
    if (new Set(scope.basis_refs).size !== scope.basis_refs.length) fail("INVALID_INPUT", "Scope basis_refs must be distinct.");
    const refs = requiredBasisRefs(state, [...scope.basis_refs, ...scope.findings_refs, ...(scope.execution_plan?.evidence_refs || [])], { current: true });
    scope.basis_versions = refs.map(ref => {
      id(ref, "scope basis reference");
      const event_ref = state.history_index[ref]?.event_ref;
      if (!event_ref) fail("STALE_SCOPE", "Scope basis must already be committed: " + ref);
      return { ref, event_ref };
    });
    delete scope.basis_refs;
  }
  if (require("./exchanges.cjs").COMPACT_RENDERERS.includes(payload?.exchange?.renderer) && Array.isArray(payload.exchange.response?.next_steps)) {
    for (const option of payload.exchange.response.next_steps) if (option?.scope_ref) {
      const scope = scopeFor(state, option.scope_ref, payload);
      if (!scope) fail("UNKNOWN_REFERENCE", "An offer requires its action scope.");
      for (const [field, source] of [["proposal", "public_scope"], ["execution_plan", "execution_plan"], ["assignment", "assignment"]]) {
        if (!Object.hasOwn(option, field)) option[field] = structuredClone(scope[source]);
      }
    }
  }
}
function validateProposalWrite(state, request, root) {
  // Call only for a new public write, after semantic validation. Historical
  // events and exact retries must retain their original acceptance rules.
  const payload = request.payload;
  for (const option of payload.exchange?.response.next_steps || []) if (option.scope_ref) {
    const scope = scopeFor(state, option.scope_ref, payload);
    if (scope?.action === "report") for (const ref of scope.findings_refs) {
      const inline = payload.exchange.response.findings?.work_refs.includes(ref);
      const observed = list(state, "exchanges").some(exchange => actualExchange(state, exchange, payload)?.findings?.work_refs.includes(ref)
        && list(state, "deliveries").some(delivery => delivery.exchange_ref === exchange.exchange_id && require("./exchanges.cjs").deliveryMatches(delivery, state, payload)));
      if (!inline && !observed) fail("FINDINGS_NOT_DISCUSSED", "Reconcile the applicable actual discussion before proposing a report from " + ref + ".");
    }
  }
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
  // Current writes follow decision provenance as well as the historical
  // findings closure. Replay below retains the original contract.
  const refs = new Set([
    ...(payload.changes?.action_scopes || []).map(scope => scope.scope_id),
    ...(payload.exchange?.response.next_steps || []).map(option => option.scope_ref),
    ...(payload.interpretation?.action_decisions || []).filter(decision => decision.disposition === "accept").map(decision => decision.scope_ref),
    payload.interpretation?.next_action.scope_ref
  ].filter(Boolean));
  for (const ref of refs) {
    requireCurrentScope(state, scopeFor(state, ref, payload), payload);
  }
  if (root) {
    const proposed = new Set([...(payload.changes?.action_scopes || []).map(scope => scope.scope_id),
      ...(payload.exchange?.response.next_steps || []).map(option => option.scope_ref)].filter(Boolean));
    for (const ref of proposed) require("./runs.cjs").resolvePlanSources(root, state, scopeFor(state, ref, payload).execution_plan, { offer: true });
  }
}
// The default also derives historical findings bindings. Only live scope
// authoring/currentness opts into decision provenance; never rewrite replay.
function requiredBasisRefs(state, refs, { current = false } = {}) {
  const found = new Set(refs), queue = [...refs];
  const add = ref => { if (ref && !found.has(ref)) { found.add(ref); queue.push(ref); } };
  while (queue.length) {
    const ref = queue.shift();
    for (const dependency of basisDependencies(state, ref, { current })) add(dependency);
  }
  return [...found];
}
function basisDependencies(state, ref, { current = false, checkLegacy = true } = {}) {
  const dependencies = [];
  const add = ref => { if (ref) dependencies.push(ref); };
  const review = list(state, "specialist_reviews").find(record => record.review_id === ref);
  if (checkLegacy && review && active(state) && (!Object.hasOwn(review, "evidence_refs") || !Object.hasOwn(review, "assumptions_added_or_revised"))) fail("LEGACY_REVIEW_RECONCILIATION", "Reconcile a historical review through a new source-bound review before using it as current findings or scope basis.");
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
  const decision = current && list(state, "decisions").find(record => record.decision_id === ref);
  if (decision) for (const dependency of [...(decision.basis_refs || []), ...(decision.user_contribution_refs || [])]) add(dependency);
  return [...new Set(dependencies)];
}
function dependencyPath(state, scope, target, options) {
  const seeds = [...new Set([...scope.basis_versions.map(binding => binding.ref), ...(scope.execution_plan.evidence_refs || [])])];
  const dependedOn = new Set(seeds.flatMap(ref => basisDependencies(state, ref, options)));
  // Prefer a governing decision/review over its already expanded leaf binding.
  const roots = seeds.filter(ref => !dependedOn.has(ref));
  for (const starts of [roots, seeds]) {
    const queue = starts.map(ref => [ref]), seen = new Set(starts);
    while (queue.length) {
      const path = queue.shift(), ref = path.at(-1);
      if (ref === target) return path;
      for (const dependency of basisDependencies(state, ref, options)) if (!seen.has(dependency)) {
        seen.add(dependency); queue.push([...path, dependency]);
      }
    }
  }
  return [target];
}
function staleIssue(state, scope, payload = {}, { current = true } = {}) {
  // Diagnostic paths may expose source ancestry without broadening the checks
  // used to accept historical scopes during replay.
  const options = { current: true, checkLegacy: false };
  const issue = (reason, ref, extra = {}) => {
    const dependency_path = ref ? dependencyPath(state, scope, ref, options) : [scope.scope_id];
    return { reason: reason + (ref ? "; dependency path: " + dependency_path.join(" -> ") : ""),
      scope_ref: scope.scope_id, ...(ref ? { blocking_ref: ref } : {}), dependency_path, ...extra };
  };
  const successor = [...list(state, "action_scopes"), ...(payload.changes?.action_scopes || [])].find(other => other.supersedes === scope.scope_id);
  if (successor) return issue("scope superseded", null, { superseded_by: successor.scope_id });
  const records = Object.values(state).filter(Array.isArray).flat().concat(changedRecords(payload));
  for (const binding of scope.basis_versions) {
    if (state.history_index[binding.ref]?.event_ref !== binding.event_ref) return issue("basis version changed: " + binding.ref, binding.ref,
      { expected_event_ref: binding.event_ref, current_event_ref: state.history_index[binding.ref]?.event_ref || null });
    const replacement = records.find(record => record?.supersedes === binding.ref);
    if (replacement) return issue("basis superseded: " + binding.ref, binding.ref,
      { superseded_by: Object.entries(replacement).find(([key]) => key.endsWith("_id"))?.[1] || null });
    if (changedRecords(payload).some(record => Object.values(record).includes(binding.ref) && Object.keys(record).some(key => key.endsWith("_id") && record[key] === binding.ref))) return issue("basis changing in this event: " + binding.ref, binding.ref);
  }
  const refs = scope.basis_versions.map(binding => binding.ref);
  const required = requiredBasisRefs(state, [...refs, ...(scope.execution_plan.evidence_refs || [])], { current });
  const missing = required.filter(ref => !refs.includes(ref));
  if (missing.length) return issue("governing evidence, result conditions, assumptions or decision sources are not version-bound: " + missing.join(", "), missing[0],
    { missing_refs: missing, dependency_paths: missing.map(ref => dependencyPath(state, scope, ref, options)) });
  const condition = (payload.changes?.result_conditions || []).find(condition => refs.includes(condition.evidence_ref));
  if (condition) return issue("governing result conditions are changing in this event", condition.evidence_ref, { changing_condition_ref: condition.condition_id });
  return null;
}
function staleReason(state, scope, payload = {}, options = {}) { return staleIssue(state, scope, payload, options)?.reason || null; }
function requireCurrentScope(state, scope, payload = {}, options = {}) {
  const issue = staleIssue(state, scope, payload, options);
  if (issue) { const { reason, ...details } = issue; fail("STALE_SCOPE", reason, details); }
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
      object(input, name, ["source_ref", "path"], ["sha256", "deferred_release"]);
      text(input.source_ref, name + ".source_ref"); text(input.path, name + ".path");
      if (input.deferred_release === true && scope.action === "analysis" && !Object.hasOwn(input, "sha256")) return;
      if (!Object.hasOwn(input, "sha256")) fail("INVALID_INPUT", "Protected scope inputs require sha256 unless one unreleased analysis input is explicitly deferred.");
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
      if (state.history_index[binding.ref]?.event_ref !== binding.event_ref) requireCurrentScope(state, scope, payload, { current: false });
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
    requireCurrentScope(state, scope, payload, { current: false });
  });
}
function validateOffer(state, option, response, payload) {
  requirePolicy(state);
  const scope = scopeFor(state, option.scope_ref, payload);
  if (!scope) fail("UNKNOWN_REFERENCE", "An offer requires its action scope.");
  requireCurrentScope(state, scope, payload, { current: false });
  if (canonical(option.assignment) !== canonical(scope.assignment) || canonical(option.proposal) !== canonical(scope.public_scope) || canonical(option.execution_plan) !== canonical(scope.execution_plan)) fail("SCOPE_MISMATCH", "The rendered offer must contain the exact scope, execution terms and assignment being proposed.");
  if (scope.action === "report") {
    const discussed = new Set(response.findings?.work_refs || []);
    const prior = new Map();
    for (const prepared of list(state, "exchanges")) {
      const exchange = actualExchange(state, prepared, payload);
      const deliveries = list(state, "deliveries").filter(delivery => delivery.exchange_ref === exchange.exchange_id);
      const binding = payload.interpretation?.delivery_binding || list(state, "interpretations").at(-1)?.delivery_binding;
      const observed = deliveries.some(delivery => require("./exchanges.cjs").deliveryMatches(delivery, state, payload, { legacy: binding !== "message-bound-delivery-v2" }));
      for (const ref of exchange.findings?.work_refs || []) {
        const dependencies = observed ? requiredBasisRefs(state, [ref]) : [];
        const stale = dependencies.filter(dependency => !exchange.findings_basis_versions?.some(binding => binding.ref === dependency && binding.event_ref === state.history_index[dependency]?.event_ref));
        if (observed && !stale.length) discussed.add(ref);
        if (!prior.has(ref)) prior.set(ref, []);
        prior.get(ref).push({ exchange_ref: exchange.exchange_id, delivery_refs: deliveries.map(delivery => delivery.delivery_id),
          observation: observed ? "observed" : "unobserved", stale_refs: stale });
      }
    }
    const missing = scope.findings_refs.filter(ref => !discussed.has(ref));
    if (missing.length) {
      const findings = missing.map(ref => {
        const exchanges = prior.get(ref) || [];
        return { ref, status: !exchanges.length ? "absent" : exchanges.some(exchange => exchange.observation === "observed") ? "stale" : "unobserved", prior_exchanges: exchanges };
      });
      fail("FINDINGS_NOT_DISCUSSED", "Findings not discussed with current observed support: " + findings.map(item => item.ref + " (" + item.status + ")").join(", ")
        + ". Present findings and limitations for these exact references, or correct the scope to identify the findings actually discussed.",
      { scope_ref: scope.scope_id, missing_findings_refs: missing, current_work_refs: [...(response.findings?.work_refs || [])], findings });
    }
  }
}
function selectsQuestionInvestigation(state, interpretation, component, payload) {
  if (component.kind !== "question" || component.answer_timing !== "after_work" || component.option_id) return false;
  const question = payload.changes?.questions?.find(item => item.question_id === component.user_question_ref)
    || list(state, "questions").find(item => item.question_id === component.user_question_ref);
  if (question?.origin !== "user" || question.status !== "open") return false;
  const linked = interpretation.basis_refs.includes(question.question_id)
    || payload.checkpoint?.related_unresolved_question_refs?.includes(question.question_id);
  if (!linked) return false;
  if (payload.checkpoint?.selected_assignment && canonical(payload.checkpoint.selected_assignment) !== canonical(interpretation.next_action.assignment)) return false;
  const source = (question.basis_refs || []).some(ref => interpretation.incoming_refs.includes(ref)
    && [...list(state, "evidence"), ...(payload.changes?.evidence || [])].some(record => record.evidence_id === ref
      && record.kind === "user_statement" && typeof record.source_excerpt === "string" && record.source_excerpt.trim()));
  // The lead interprets whether the source actually requests this bounded work.
  // These links establish attribution, not a natural-language permission test.
  return source;
}
function validatePresentationAdjustment(state, decision, payload, label) {
  const adjustment = decision.presentation_adjustment;
  object(adjustment, label, ["formats", "user_ref"]);
  strings(adjustment.formats, label + ".formats", true);
  if (new Set(adjustment.formats).size !== adjustment.formats.length) fail("INVALID_INPUT", "Requested report formats must be distinct.");
  for (const format of adjustment.formats) enumeration(format, LOCAL_REPORT_FORMATS, label + ".formats");
  id(adjustment.user_ref, label + ".user_ref");
  if (decision.disposition !== "accept" || scopeFor(state, decision.scope_ref, payload)?.action !== "report") fail("INVALID_AUTHORIZATION", "A presentation adjustment applies only when accepting a report.");
  const source = [...(payload.changes?.evidence || []), ...list(state, "evidence")].find(record => record.evidence_id === adjustment.user_ref);
  if (!decision.user_refs.includes(adjustment.user_ref) || source?.kind !== "user_statement" || !source.source_excerpt?.trim()) {
    fail("MISSING_USER_SOURCE", "A presentation adjustment must cite the acceptance's incoming user evidence and its exact request, including conditions.");
  }
}
function executionPlanForAuthorization(state, scope, authorizationRef) {
  const plan = structuredClone(scope.execution_plan);
  const decision = list(state, "action_decisions").find(item => item.decision_id === authorizationRef && item.scope_ref === scope.scope_id);
  if (decision?.presentation_adjustment) plan.format = decision.presentation_adjustment.formats.join(", ");
  return plan;
}
function presentationBinding(state, decision) {
  if (!decision?.presentation_adjustment) return null;
  const source = state.history_index[decision.presentation_adjustment.user_ref];
  const accepted = state.history_index[decision.decision_id];
  if (!source || !accepted || source.sequence > accepted.sequence) fail("INVALID_AUTHORIZATION", "The recorded format request changed after acceptance; reconcile the user's current direction.");
  return { ...structuredClone(decision.presentation_adjustment), source_event_ref: source.event_ref };
}
function existingActionControl(state, decision, payload = {}) {
  return decision.disposition !== "accept" && list(state, "action_decisions").some(prior => prior.disposition === "accept"
    && prior.scope_ref === decision.scope_ref && prior.exchange_ref === decision.exchange_ref
    && prior.option_id === decision.option_id && (prior.delivery_ref === decision.delivery_ref
      || require("./exchanges.cjs").resolveDeliveryReference(state, prior.delivery_ref, payload).observation_refs?.includes(decision.delivery_ref)));
}
function isExistingActionControl(state, interpretation, component, payload = {}) {
  return (interpretation.action_decisions || []).some(decision => existingActionControl(state, decision, payload)
    && decision.exchange_ref === component.exchange_ref && decision.option_id === component.option_id
    && decision.delivery_ref === component.delivery_ref);
}
function validateDecisions(state, interpretation, context, payload) {
  if (!active(state)) {
    if (interpretation.action_decisions || Object.hasOwn(interpretation, "focus_scope_ref") || interpretation.next_action.scope_ref || interpretation.next_action.authorization_ref) requirePolicy(state);
    return;
  }
  if (Object.hasOwn(interpretation, "focus_scope_ref") && interpretation.focus_scope_ref !== null) context.reference(interpretation.focus_scope_ref, "interpretation.focus_scope_ref", "action_scope");
  array(interpretation.action_decisions || [], "interpretation.action_decisions", (decision, label) => {
    object(decision, label, ["decision_id", "scope_ref", "disposition", "exchange_ref", "option_id", "delivery_ref", "user_refs"], ["presentation_adjustment"]);
    id(decision.decision_id, label + ".decision_id"); context.reference(decision.scope_ref, label + ".scope_ref", "action_scope");
    enumeration(decision.disposition, ["accept", "defer", "decline", "withdraw"], label + ".disposition");
    context.contributionRefs(decision.user_refs, label + ".user_refs", true);
    if (Object.hasOwn(decision, "presentation_adjustment")) {
      validatePresentationAdjustment(state, decision, payload, label + ".presentation_adjustment");
    }
    const prepared = list(state, "exchanges").find(x => x.exchange_id === decision.exchange_ref);
    const exchange = existingActionControl(state, decision, payload) ? prepared : actualExchange(state, prepared, payload, decision.delivery_ref);
    const option = exchange?.options.find(x => x.option_id === decision.option_id);
    const delivery = payload.delivery?.delivery_id === decision.delivery_ref ? payload.delivery : list(state, "deliveries").find(x => x.delivery_id === decision.delivery_ref);
    if (!exchange || !option || option.scope_ref !== decision.scope_ref || !delivery || delivery.exchange_ref !== decision.exchange_ref
      || (!existingActionControl(state, decision, payload) && !require("./exchanges.cjs").deliveryMatches(delivery, state, payload, { legacy: interpretation.delivery_binding !== "message-bound-delivery-v2" }))) fail("INVALID_AUTHORIZATION", "An acceptance must bind its exact offered scope and applicable observed delivery. A pause or withdrawal may bind the existing accepted action.");
    const actualDelivery = require("./exchanges.cjs").resolveDeliveryReference(state, decision.delivery_ref, payload).delivery || delivery;
    for (const ref of decision.user_refs) {
      const fresh = (payload.changes?.evidence || []).some(x => x.evidence_id === ref && !state.history_index[ref]);
      const sequence = state.history_index[ref]?.sequence;
      if (!interpretation.incoming_refs.includes(ref) || (!fresh && (!sequence || sequence <= exchange.sequence))) fail("EARLY_AUTHORIZATION", "Only subsequent incoming user evidence can select a presented offer; an early report request is not consent.");
      const utility = require("./exchanges.cjs");
      if (utility.isAgentRecorded(actualDelivery)) {
        const originalSequence = utility.primarySourceSequence(state, ref, payload);
        if (!Number.isSafeInteger(originalSequence) || originalSequence < utility.recordedBeforeSequence(state, actualDelivery)) fail("EARLY_AUTHORIZATION", "An acceptance must come from the user message following the recorded actual offer or a later incoming message.");
      }
      if (list(state, "action_decisions").some(prior => prior.user_refs.includes(ref))) fail("REUSED_USER_DECISION", "A previously consumed user decision cannot authorize another action.");
    }
    const matched = interpretation.components.some(component => (decision.disposition !== "accept" || component.kind === "selection") && component.exchange_ref === decision.exchange_ref && component.option_id === decision.option_id && component.delivery_ref === decision.delivery_ref);
    if (!matched) fail("INVALID_AUTHORIZATION", "The interpretation must preserve the actual selected offer and observation.");
    if (decision.disposition === "accept") {
      const scope = scopeFor(state, decision.scope_ref, payload);
      requireCurrentScope(state, scope, payload, { current: false });
      if (require("./exchanges.cjs").isAgentRecorded(actualDelivery) && scope.action === "report"
        && !actualReportFindingsDiscussed(state, scope, decision, payload)) fail("FINDINGS_NOT_DISCUSSED", "The actual reply must present the report scope's current findings and limitations before the offer is accepted.");
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
          if (selectsQuestionInvestigation(state, interpretation, component, payload)) return true;
          if (component.kind !== "selection") return false;
          const other = actualExchange(state, list(state, "exchanges").find(item => item.exchange_id === component.exchange_ref), payload, component.delivery_ref)?.options.find(item => item.option_id === component.option_id);
          return other?.assignment && canonical(other.assignment) === canonical(next.assignment)
            && (other.scope_ref || null) === (next.scope_ref || null);
        });
        if (next.kind === "specialist" && !separatelySelected) fail("INVALID_AUTHORIZATION", "Work independent of a paused acceptance requires a sourced work-dependent question linked to the investigation, an explicit user instruction or an observed selection.");
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
    requireCurrentScope(state, scope, payload, { current: false });
  }
  if (next.kind === "specialist" && (next.assignment.specialist_id === "report_writer" || (next.assignment.specialist_id === "design_worker" && next.assignment.operation === "execution")) && !next.authorization_ref) fail("MISSING_AUTHORIZATION", "Protected work requires selection of a presented current action offer.");
}
function eligibility(state, scopeId, { current = true } = {}) {
  const scope = scopeFor(state, scopeId);
  if (!active(state) || !scope) return { eligible: false, reason: "policy or scope missing" };
  const reason = staleReason(state, scope, {}, { current }); if (reason) return { eligible: false, reason };
  const decisions = list(state, "action_decisions").filter(x => x.scope_ref === scopeId);
  const decision = decisions.at(-1);
  if (!decision || decision.disposition !== "accept") return { eligible: false, reason: decision?.disposition || "awaiting user selection" };
  if (current) {
    const pending = require("./model.cjs").pendingPrimarySources(state);
    if (pending.length) return { eligible: false, reason: "awaiting interpretation of current user message", pending_incoming_refs: pending.map(item => item.evidence_ref) };
    const delivery = list(state, "deliveries").find(item => item.delivery_id === decision.delivery_ref);
    if (!delivery || !require("./exchanges.cjs").deliveryMatches(delivery, state) || !acceptedOffer(state, decision)) return { eligible: false, reason: "accepted offer delivery requires reconciliation", authorization_ref: decision.decision_id };
  }
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
  if (scope.action !== plan.kind || canonical(executionPlanForAuthorization(state, scope, plan.authorization_ref)) !== canonical(normalizedPlan(plan))) fail("SCOPE_MISMATCH", "The execution plan must match the accepted offer and any sourced local-format adjustment; all other terms remain exact.");
  const interpretation = list(state, "interpretations").find(x => x.interpretation_id === plan.interpretation_ref);
  if (!interpretation || interpretation.next_action.scope_ref !== scope.scope_id || interpretation.next_action.authorization_ref !== plan.authorization_ref || canonical(interpretation.next_action.assignment) !== canonical(scope.assignment)) fail("INVALID_AUTHORIZATION", "Run attribution must identify its prospectively committed selection of this protected action.");
  if (list(state, "interpretations").at(-1)?.interpretation_id !== plan.interpretation_ref) fail("DIRECTION_CHANGED", "New work must follow the latest interpreted user direction; recover an older permission explicitly before resuming it.");
  if (list(state, "turns").find(x => x.interpretation_ref === plan.interpretation_ref)?.exchange_ref) fail("TURN_CLOSED", "A returned reply cannot execute further protected work without new user steering.");
  const adjustment = presentationBinding(state, list(state, "action_decisions").find(item => item.decision_id === plan.authorization_ref));
  return { policy: POLICY, scope_ref: scope.scope_id, authorization_ref: plan.authorization_ref, basis_versions: structuredClone(scope.basis_versions), ...(adjustment ? { presentation_adjustment: adjustment } : {}) };
}
function validateRunContinuation(state, run, plan) {
  if (!["analysis", "report"].includes(run.kind)) return null;
  requirePolicy(state);
  if (require("./model.cjs").pendingPrimarySources(state).length) fail("DIRECTION_PENDING", "The latest retained user message awaits interpretation. Reconcile its original direction before continuing protected work.");
  const binding = run.authorization_binding;
  if (!binding || binding.policy !== POLICY) fail("LEGACY_RUN_ACTIVE", "This legacy run must continue under its original runtime or be reconciled before the new policy is activated.");
  const scope = scopeFor(state, binding.scope_ref);
  if (!scope) fail("INVALID_AUTHORIZATION", "Run scope is missing.");
  requireCurrentScope(state, scope);
  const decision = list(state, "action_decisions").filter(x => x.scope_ref === scope.scope_id).at(-1);
  if (decision?.disposition !== "accept" || decision.decision_id !== binding.authorization_ref) fail("INVALID_AUTHORIZATION", "The action permission has been changed or withdrawn.");
  const delivery = list(state, "deliveries").find(item => item.delivery_id === decision.delivery_ref);
  if (!delivery || !require("./exchanges.cjs").deliveryMatches(delivery, state) || !acceptedOffer(state, decision)) fail("INVALID_AUTHORIZATION", "The accepted offer's applicable actual message requires reconciliation before further protected output.");
  if (decision.presentation_adjustment && (canonical(binding.presentation_adjustment || null) !== canonical(presentationBinding(state, decision)) || plan.format !== decision.presentation_adjustment.formats.join(", "))) fail("INVALID_AUTHORIZATION", "The run's accepted local formats and request source must remain frozen.");
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
    const status = eligibility(state, scope?.scope_id, { current: false });
    if (!scope || !status.eligible || status.authorization_ref !== run.authorization_binding?.authorization_ref || run.authorization_binding.policy !== POLICY || canonical(run.authorization_binding.basis_versions) !== canonical(scope.basis_versions)) fail("INVALID_AUTHORIZATION", "A new protected run must preserve its current unused action permission.");
    const adjustment = presentationBinding(state, list(state, "action_decisions").find(item => item.decision_id === status.authorization_ref));
    if (canonical(run.authorization_binding.presentation_adjustment || null) !== canonical(adjustment)) fail("INVALID_AUTHORIZATION", "A report run must preserve its accepted local-format adjustment and source.");
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
module.exports = { POLICY, active, validateActivation, validateScopes, prepareProposalWrite, validateProposalWrite, validateOffer, validateDecisions, isExistingActionControl, validateRunStart, validateRunContinuation, validateRunRecord, eligibility, normalizedPlan, executionPlanForAuthorization, staleReason, requiredBasisRefs, findingsCoverRun, actualReportFindingsDiscussed };
