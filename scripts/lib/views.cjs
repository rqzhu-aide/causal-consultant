"use strict";

// Views are disposable readings of one already loaded journal, never stores.
const BASE_COLLECTIONS = { questions: "question_id", evidence: "evidence_id", assumptions: "assumption_id",
  decisions: "decision_id", candidate_routes: "strategy_id", specialist_reviews: "review_id", runs: "run_id" };
const EXTENSION_COLLECTIONS = { user_context: "context_id", result_conditions: "condition_id",
  interpretations: "interpretation_id", exchanges: "exchange_id", deliveries: "delivery_id", turns: "turn_id" };

function hasExtension(state) {
  return Boolean(state.state_meta.protocol || Object.keys(EXTENSION_COLLECTIONS).some(name => Object.hasOwn(state, name)));
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
  return { status: observations.some(record => record.observation === "host_confirmed") ? "host_confirmed"
    : observations.some(record => record.observation === "assistant_emission") ? "assistant_emission" : "unobserved",
  observation_refs: observations.map(record => record.delivery_id) };
}

function conversationRoots(state) {
  const currentExchange = (state.exchanges || []).at(-1);
  const currentInterpretation = (state.interpretations || []).at(-1);
  const lastObservation = (state.deliveries || []).at(-1);
  const roots = new Map();
  const add = (ref, reason) => { if (ref && !roots.has(ref)) roots.set(ref, reason); };
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
  const needed = new Set(info.roots.keys());
  if (selected) for (const name of ["interpretations", "exchanges", "deliveries", "turns"]) {
    for (const record of data[name] || []) needed.add(record[EXTENSION_COLLECTIONS[name]]);
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
    delivery: "Observations are attributed records, not proof of reading. The latest observation is ordered by journal commit, not assumed to be the immediately preceding displayed response.",
    legacy_continuity: state.state_meta.protocol ? "Earlier unrecorded exchanges remain unavailable." : "No durable exchange protocol has been recorded; recover prior questions from attributable conversation evidence." },
    protocol: state.state_meta.protocol || null, checkpoint_source_path: prefix + ".consultation",
    collections: Object.fromEntries(["specialist_reviews", "runs", "turns", "deliveries"].map(name => [name, collection(name)])),
    current_interpretation_ref: info.current_interpretation_ref, current_exchange_ref: info.current_exchange_ref,
    latest_delivery_observation_ref: info.latest_delivery_observation_ref, latest_observed_exchange_ref: info.latest_observed_exchange_ref,
    unfinished_turns: info.unfinished, pending_user_question_refs: info.pending_user_question_refs, interpretations, exchanges };
  return { user, study, work };
}

module.exports = { buildViews, collectionIds, hasExtension, journalBodies, conversationRoots };
