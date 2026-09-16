"use strict";

// Views are disposable readings of one already loaded journal, never stores.
const BASE_COLLECTIONS = { questions: "question_id", evidence: "evidence_id", assumptions: "assumption_id",
  decisions: "decision_id", candidate_routes: "strategy_id", specialist_reviews: "review_id", runs: "run_id" };
const EXTENSION_COLLECTIONS = { user_context: "context_id", result_conditions: "condition_id",
  interpretations: "interpretation_id", exchanges: "exchange_id", deliveries: "delivery_id", turns: "turn_id",
  action_scopes: "scope_id", action_decisions: "decision_id" };

function hasExtension(state) {
  return Boolean(state.state_meta.protocol || state.state_meta.consultation_policy || Object.keys(EXTENSION_COLLECTIONS).some(name => Object.hasOwn(state, name)));
}

function collectionIds(state) {
  return { ...BASE_COLLECTIONS, ...Object.fromEntries(Object.entries(EXTENSION_COLLECTIONS)
    .filter(([name]) => state.state_meta.protocol || Object.hasOwn(state, name))) };
}

function journalBodies(events) {
  const interpretations = new Map(), exchanges = new Map();
  for (const event of events) {
    for (const [name, key, target] of [["interpretation", "interpretation_id", interpretations], ["exchange", "exchange_id", exchanges]]) {
      const record = event.payload?.[name];
      if (record) target.set(record[key], { ...structuredClone(record), event_ref: event.event_id });
    }
  }
  return { interpretations, exchanges };
}

function deliveryState(state, exchangeRef) {
  const observations = (state.deliveries || []).filter(record => record.exchange_ref === exchangeRef);
  const matching = observations.filter(record => require("./exchanges.cjs").deliveryMatches(record, state));
  const discrepancies = observations.filter(record => Object.hasOwn(record, "observed_response_sha256")
    && record.observed_response_sha256 !== record.response_sha256);
  return { status: matching.some(record => record.observation === "host_confirmed") ? "host_confirmed"
    : matching.some(record => record.observation === "assistant_emission") ? "assistant_emission" : "unobserved",
  observation_refs: observations.map(record => record.delivery_id),
  ...(discrepancies.length ? { discrepancy_refs: discrepancies.map(record => record.delivery_id) } : {}) };
}

// Derive question continuity from recorded exchanges, not model-maintained
// pointers. An old prepared offer is never upgraded into an observed one.
function questionMemoryLinks(state, events, bodies = journalBodies(events)) {
  const result = new Map();
  for (const question of state.questions.filter(record => record.origin !== "user")) {
    const mentions = (state.exchanges || []).filter(exchange => exchange.question_refs.includes(question.question_id)
      || (question.basis_refs || []).includes(exchange.exchange_id));
    const observed = mentions.filter(exchange => deliveryState(state, exchange.exchange_id).status !== "unobserved");
    const original = observed[0], latest = observed.at(-1);
    const interpretations = events.filter(event => {
      const interpretation = event.payload?.interpretation;
      return interpretation && ((event.payload.changes?.questions || []).some(record => record.question_id === question.question_id)
        || interpretation.basis_refs.includes(question.question_id)
        || interpretation.components.some(component => component.question_ref === question.question_id)
        || interpretation.incoming_refs.some(ref => (question.resolution?.answer_refs || []).includes(ref)));
    });
    const latestInterpretation = interpretations.at(-1)?.payload.interpretation;
    const exchangeRefs = [...new Set([original?.exchange_id, latest?.exchange_id].filter(Boolean))];
    const deliveryRefs = exchangeRefs.flatMap(ref => {
      const observations = (state.deliveries || []).filter(record => record.exchange_ref === ref);
      const matching = observations.filter(record => require("./exchanges.cjs").deliveryMatches(record, state));
      return [...new Set([matching.at(-1)?.delivery_id, observations.at(-1)?.delivery_id].filter(Boolean))];
    });
    result.set(question.question_id, {
      original_exchange_ref: original?.exchange_id || null,
      latest_exchange_ref: latest?.exchange_id || null,
      latest_interpretation_ref: latestInterpretation?.interpretation_id || null,
      delivery_refs: deliveryRefs,
      unobserved_exchange_refs: mentions.filter(exchange => !observed.includes(exchange)).map(exchange => exchange.exchange_id),
      missing_body_refs: exchangeRefs.filter(ref => !bodies.exchanges.has(ref)),
      related_scope_refs: (state.action_scopes || []).filter(scope => (scope.basis_versions || []).some(binding => binding.ref === question.question_id)
        || (scope.basis_refs || []).includes(question.question_id)).map(scope => scope.scope_id),
      related_checkpoint_refs: (state.consultation?.related_unresolved_question_refs || []).includes(question.question_id)
        ? [state.consultation.checkpoint_id] : []
    });
  }
  return result;
}

function conversationRoots(state) {
  const currentExchange = (state.exchanges || []).at(-1);
  const currentInterpretation = (state.interpretations || []).at(-1);
  const lastObservation = (state.deliveries || []).at(-1);
  const roots = new Map();
  const add = (ref, reason) => { if (ref && !roots.has(ref)) roots.set(ref, reason); };
  add(state.focus_scope_ref, "current user focus");
  const supersededScopes = new Set((state.action_scopes || []).map(scope => scope.supersedes).filter(Boolean));
  for (const scope of state.action_scopes || []) {
    const decision = (state.action_decisions || []).filter(item => item.scope_ref === scope.scope_id).at(-1);
    const consumed = decision && state.runs.some(run => run.authorization_binding?.authorization_ref === decision.decision_id);
    if (scope.scope_id !== state.focus_scope_ref && (supersededScopes.has(scope.scope_id)
      || ["decline", "withdraw"].includes(decision?.disposition) || consumed)) continue;
    add(scope.scope_id, decision?.disposition === "defer" ? "deferred action scope" : "pending action scope");
    add(decision?.decision_id, "latest scoped user decision");
    for (const exchange of state.exchanges || []) if (exchange.options.some(option => option.scope_ref === scope.scope_id)) {
      add(exchange.exchange_id, "exact action offer and option ordering");
      for (const delivery of state.deliveries || []) if (delivery.exchange_ref === exchange.exchange_id) add(delivery.delivery_id, "action offer presentation observation");
    }
  }
  add(currentInterpretation?.interpretation_id, "current incoming interpretation");
  add(currentExchange?.exchange_id, "latest prepared outgoing exchange");
  add(lastObservation?.delivery_id, "latest recorded delivery observation");
  add(lastObservation?.exchange_ref, "exchange linked to latest delivery observation");
  const pendingUserQuestions = state.questions.filter(question => question.origin === "user" && question.status === "open");
  for (const question of pendingUserQuestions) add(question.question_id, "unanswered user question");
  const unfinished = [];
  for (const turn of state.turns || []) {
    const reasons = [];
    if (!turn.exchange_ref) reasons.push("closeout_not_prepared");
    else if (deliveryState(state, turn.exchange_ref).status === "unobserved") reasons.push("delivery_unobserved");
    if ((turn.work_refs || []).some(ref => (state.runs || []).some(run => run.run_id === ref && run.status === "in_progress"))) reasons.push("work_incomplete");
    if (reasons.length) {
      unfinished.push({ ...structuredClone(turn), reasons });
      add(turn.turn_id, "unfinished conversational turn");
      add(turn.interpretation_ref, "unfinished turn interpretation");
      add(turn.exchange_ref, "unfinished turn prepared exchange");
      for (const ref of turn.work_refs || []) add(ref, "unfinished turn work");
    }
  }
  return { roots, unfinished, pending_user_question_refs: pendingUserQuestions.map(question => question.question_id),
    current_exchange_ref: currentExchange?.exchange_id || null,
    current_interpretation_ref: currentInterpretation?.interpretation_id || null,
    latest_delivery_observation_ref: lastObservation?.delivery_id || null,
    latest_observed_exchange_ref: lastObservation?.exchange_ref || null };
}

function actionMemory(loaded, data, bodies) {
  const { state, events } = loaded;
  if (!state.state_meta.consultation_policy) return null;
  const policy = require("./authorizations.cjs");
  const scopes = data.action_scopes || [];
  const scopeIds = new Set(scopes.map(scope => scope.scope_id));
  const decisions = (state.action_decisions || []).filter(decision => scopeIds.has(decision.scope_ref));
  const offers = [];
  for (const exchange of bodies.exchanges.values()) for (const option of exchange.response.next_steps) {
    if (!scopeIds.has(option.scope_ref)) continue;
    offers.push({ exchange_ref: exchange.exchange_id, option_id: option.option_id, scope_ref: option.scope_ref,
      option_number: exchange.response.next_steps.indexOf(option) + 1, label: option.label,
      proposal: structuredClone(option.proposal), execution_plan: structuredClone(option.execution_plan),
      delivery: deliveryState(state, exchange.exchange_id) });
  }
  const exactRecord = binding => {
    const event = events.find(item => item.event_id === binding.event_ref);
    if (!event) return null;
    for (const [name, key] of Object.entries(collectionIds(state))) {
      const record = event.payload.changes?.[name]?.find(item => item[key] === binding.ref);
      if (record) return structuredClone(record);
    }
    for (const key of ["review", "run", "interpretation", "exchange"]) {
      const record = event.payload[key];
      if (record && [record.review_id, record.run_id, record.interpretation_id, record.exchange_id].includes(binding.ref)) return structuredClone(record);
    }
    return null;
  };
  const basis = scopes.map(scope => ({ scope_ref: scope.scope_id, versions: scope.basis_versions.map(binding => ({
    ...structuredClone(binding), current_event_ref: state.history_index[binding.ref]?.event_ref || null,
    recorded_body: exactRecord(binding)
  })) }));
  const obligations = [];
  for (const run of state.runs) {
    if (run.status !== "completed") continue;
    const discussions = [...bodies.exchanges.values()].filter(exchange => policy.findingsCoverRun(state, exchange.response.findings, run));
    const presented = discussions.some(exchange => deliveryState(state, exchange.exchange_id).status !== "unobserved");
    if (!presented && run.authorization_binding) obligations.push({ run_ref: run.run_id,
      scope_ref: run.authorization_binding.scope_ref, interpretation_ref: run.interpretation_ref,
      prepared_exchange_refs: discussions.map(exchange => exchange.exchange_id),
      next_action: discussions.length ? "recover_or_confirm_delivery" : "present_saved_findings_without_recomputation" });
  }
  return { policy: structuredClone(state.state_meta.consultation_policy), focus_scope_ref: state.focus_scope_ref || null,
    scopes: structuredClone(scopes), decisions: structuredClone(decisions), offers, exact_basis: basis,
    eligibility: scopes.map(scope => {
      const permission = policy.eligibility(state, scope.scope_id);
      const direction = (state.interpretations || []).at(-1)?.next_action;
      const current = direction?.kind === "specialist" && direction.scope_ref === scope.scope_id && direction.authorization_ref === permission.authorization_ref;
      return { scope_ref: scope.scope_id, ...permission, current_direction: current,
        executable_now: permission.eligible && current };
    }),
    findings_awaiting_discussion: obligations,
    enforcement: "Recorded permissions and version bindings; natural-language meaning and actual host actions require independent observation." };
}

function buildViews(loaded, selected) {
  const { state, events } = loaded;
  if (!hasExtension(state)) return null;
  const data = selected ? selected.context : state;
  const prefix = selected ? "context" : "project";
  const source = { project_id: state.state_meta.project_id, last_event_id: state.state_meta.last_event_id,
    sequence: state.state_meta.sequence, authority: "journal.jsonl" };
  const counts = name => ({ total: (state[name] || []).length, selected: (data[name] || []).length,
    omitted: (state[name] || []).length - (data[name] || []).length });
  const collection = name => ({ source_path: Object.hasOwn(data, name) ? prefix + "." + name : null, ...counts(name) });
  const scope = selected ? "selected_context" : "complete_current_projection";
  const sharedCoverage = { scope, historical_bodies: "Exact historical versions remain in history; current records do not replace historical evidence.",
    omissions: selected ? [...selected.coverage.omission_reasons] : [] };
  const info = conversationRoots(state), bodies = journalBodies(events);
  const questionLinks = questionMemoryLinks(state, events, bodies);
  const pendingConsultantQuestions = state.questions.filter(question => question.origin !== "user" && question.status === "open")
    .map(question => ({ question_ref: question.question_id, statement: question.statement,
      ...(question.resolution ? { remaining: structuredClone(question.resolution.remaining) } : {}),
      resolution_recorded: Boolean(question.resolution), retrieval: { focus_refs: [question.question_id] } }));
  const relevantQuestions = (data.questions || []).filter(question => question.origin !== "user").map(question => ({
    question_ref: question.question_id, statement: question.statement, status: question.status,
    ...(question.reason ? { reason: question.reason } : {}),
    ...(question.resolution ? { resolution: structuredClone(question.resolution) } : {}),
    ...structuredClone(questionLinks.get(question.question_id)), retrieval: { focus_refs: [question.question_id] }
  }));
  const needed = new Set(info.roots.keys());
  if (selected) for (const name of ["interpretations", "exchanges", "deliveries", "turns"]) {
    for (const record of data[name] || []) needed.add(record[EXTENSION_COLLECTIONS[name]]);
  }
  // Complete status expands every current question; selected context expands
  // only its recorded neighborhood. The compact inventory remains discoverable.
  if (!selected) for (const question of relevantQuestions) {
    for (const ref of [question.original_exchange_ref, question.latest_exchange_ref, question.latest_interpretation_ref]) if (ref) needed.add(ref);
  }
  const missing = [];
  const materialize = (name, key) => (state[name] || []).filter(record => needed.has(record[key])).map(record => {
    const body = bodies[name].get(record[key]);
    if (!body) { missing.push({ record_ref: record[key], event_ref: record.event_ref }); return { ...structuredClone(record), body_available: false }; }
    const full = structuredClone(body);
    if (name === "exchanges") { full.response_sha256 = record.response_sha256; full.delivery = deliveryState(state, record.exchange_id); }
    return full;
  });
  const interpretations = materialize("interpretations", "interpretation_id");
  const exchanges = materialize("exchanges", "exchange_id");
  const user = { source: structuredClone(source), coverage: { ...structuredClone(sharedCoverage),
    user_context: counts("user_context"), attribution: "Study claims stay in evidence; these references do not verify their truth." },
  context: collection("user_context"), attributed_evidence_refs: (data.evidence || []).filter(record => record.kind === "user_statement").map(record => record.evidence_id) };
  const study = { source: structuredClone(source), coverage: structuredClone(sharedCoverage),
    understanding_source_path: prefix + ".project_understanding",
    collections: Object.fromEntries(["evidence", "questions", "assumptions", "result_conditions", "candidate_routes", "decisions"].map(name => [name, collection(name)])),
    result_condition_coverage: { linked_evidence_refs: [...new Set((data.result_conditions || []).map(record => record.evidence_ref))],
      unreviewed_computed_evidence_refs: (data.evidence || []).filter(record => record.kind === "computed"
        && !(state.result_conditions || []).some(condition => condition.evidence_ref === record.evidence_id)).map(record => record.evidence_id),
      meaning: "A missing condition record is unreviewed. Recorded conditions, including an empty assumption list, require scientific judgment." } };
  const work = { source: structuredClone(source), coverage: { ...structuredClone(sharedCoverage),
    interpretations: { total: (state.interpretations || []).length, materialized: interpretations.length },
    exchanges: { total: (state.exchanges || []).length, materialized: exchanges.length }, missing_bodies: missing,
    question_memory: "The pending inventory lists all open consultant questions. Detailed records follow selected context; focus a question for its original/latest observed exchanges, answer sources and latest interpretation. Retired uncertainty is not a request to ask again.",
    delivery: "Observations are attributed records, not proof of reading. The latest observation is ordered by journal commit, not assumed to be the immediately preceding displayed response.",
    legacy_continuity: state.state_meta.protocol ? "Earlier unrecorded exchanges remain unavailable." : "No durable exchange protocol has been recorded; recover prior questions from attributable conversation evidence." },
    protocol: state.state_meta.protocol || null, checkpoint_source_path: prefix + ".consultation",
    collections: Object.fromEntries(["specialist_reviews", "runs", "turns", "deliveries"].map(name => [name, collection(name)])),
    current_interpretation_ref: info.current_interpretation_ref, current_exchange_ref: info.current_exchange_ref,
    latest_delivery_observation_ref: info.latest_delivery_observation_ref, latest_observed_exchange_ref: info.latest_observed_exchange_ref,
    unfinished_turns: info.unfinished, pending_user_question_refs: info.pending_user_question_refs,
    pending_consultant_questions: pendingConsultantQuestions, question_memory: relevantQuestions,
    interpretations, exchanges };
  const actions = actionMemory(loaded, data, bodies);
  if (actions) work.actions = actions;
  return { user, study, work };
}

module.exports = { buildViews, collectionIds, hasExtension, journalBodies, conversationRoots, questionMemoryLinks, deliveryState };
