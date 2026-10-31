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

function journalBodies(events, state) {
  const interpretations = new Map(), exchanges = new Map();
  for (const event of events) {
    for (const [name, key, target] of [["interpretation", "interpretation_id", interpretations], ["exchange", "exchange_id", exchanges]]) {
      const record = event.payload?.[name];
      if (record) target.set(record[key], { ...structuredClone(record), event_ref: event.event_id });
    }
  }
  if (state) for (const [ref, exchange] of exchanges) {
    exchanges.set(ref, require("./exchanges.cjs").effectiveExchange(state, exchange));
  }
  return { interpretations, exchanges };
}

// Attribution identifies explicit navigation candidates at the overview's last
// write. It does not infer agreement from wording or choose a newer decision.
function overviewOwnership({ state, events }) {
  const historical = { evidence: [], assumptions: [], decisions: [], specialist_reviews: [] };
  const keys = { evidence: "evidence_id", assumptions: "assumption_id", decisions: "decision_id", specialist_reviews: "review_id" };
  const versions = new Map(), decisionEvents = new Map(), sourceRecords = new Map(), sourceEvents = new Map(), ownership = {};
  for (const event of events) {
    const writtenDecisions = [];
    for (const [name, key] of Object.entries(keys)) {
      const written = name === "specialist_reviews" ? (event.payload.review ? [event.payload.review] : [])
        : event.payload.changes?.[name] || [];
      for (const record of written) {
        const index = historical[name].findIndex(value => value[key] === record[key]);
        if (index < 0) historical[name].push(record); else historical[name][index] = record;
        if (name === "decisions") { versions.set(record.decision_id, event.event_id); writtenDecisions.push(record.decision_id); }
      }
    }
    decisionEvents.set(event.event_id, writtenDecisions);
    sourceEvents.set(event.event_id, event);
    for (const [name, key] of [["interpretation", "interpretation_id"], ["exchange", "exchange_id"]]) {
      const record = event.payload[name];
      if (record) sourceRecords.set(record[key], record);
    }
    const update = event.type === "init" ? event.payload.project_understanding : event.payload.changes?.project_understanding;
    if (!update) continue;
    const refs = new Set([...writtenDecisions, ...(event.payload.interpretation?.basis_refs || []),
      ...(event.payload.exchange?.basis_refs || []), event.payload.exchange?.interpretation_ref,
      ...(event.payload.exchange?.reconciles || []), ...(event.payload.corrects_refs || [])].filter(Boolean));
    // Referenced interpretation/exchange events can explicitly cite decisions;
    // unrelated records in those events do not become overview owners.
    for (const ref of refs) {
      for (const decision of decisionEvents.get(ref) || []) refs.add(decision);
      const sourceEvent = sourceEvents.get(ref);
      const linked = sourceRecords.has(ref) ? [sourceRecords.get(ref)]
        : [sourceEvent?.payload.interpretation, sourceEvent?.payload.exchange].filter(Boolean);
      for (const record of linked) {
        for (const basis of [...(record.basis_refs || []), record.interpretation_ref, ...(record.reconciles || [])].filter(Boolean)) refs.add(basis);
      }
    }
    for (const field of Object.keys(update)) {
      const kinds = ["objective", "causal_target"].includes(field) ? ["target"]
        : field === "current_claim_boundary" ? ["target", "boundary"] : [];
      const candidates = historical.decisions.filter(decision => refs.has(decision.decision_id)
        && decision.status === "current" && kinds.includes(decision.kind)
        && require("./model.cjs").decisionHasSource(historical, {}, decision)).map(decision => {
        const event_ref = versions.get(decision.decision_id);
        const current = (state.decisions || []).find(value => value.decision_id === decision.decision_id);
        const current_event_ref = state.history_index[decision.decision_id]?.event_ref || null;
        return { record_ref: decision.decision_id, event_ref, kind: decision.kind,
          then_status: decision.status, current_status: current?.status || "unavailable", current_event_ref,
          version_relation: !current_event_ref ? "unavailable" : current_event_ref === event_ref ? "same" : "later_version",
          lookup: { mode: "record", records: [{ record_ref: decision.decision_id, event_ref }] } };
      });
      ownership[field] = { status: candidates.length === 1 ? "linked" : candidates.length ? "ambiguous" : "unlinked",
        last_written_event_ref: event.event_id,
        source_path: (event.type === "init" ? "payload.project_understanding." : "payload.changes.project_understanding.") + field,
        decision_candidates: candidates,
        meaning: "Explicit compatible sourced candidates at the last write; navigation attribution does not prove semantic agreement." };
    }
  }
  return ownership;
}

// A current operational reading, not an authored scientific conclusion. Input
// metadata is supplied by the caller from hash-checked frozen plans; this view
// never opens files or treats a recorded source as inspected/available.
function buildOperationalSummary({ state, events, frozen_inputs = [], frozen_input_issues = [] }, unfinished = []) {
  const runs = (state.runs || []).map(run => ({ run_id: run.run_id, kind: run.kind, status: run.status,
    event_ref: state.history_index[run.run_id]?.event_ref || null }));
  const counts = {};
  for (const run of runs) counts[run.status] = (counts[run.status] || 0) + 1;
  const materials = new Map();
  const material = (source_ref, source_sha256) => {
    const key = JSON.stringify([source_ref, source_sha256 || null]);
    if (!materials.has(key)) materials.set(key, { source_ref,
      ...(source_sha256 ? { source_sha256 } : {}), evidence: [], snapshots: [] });
    return materials.get(key);
  };
  for (const evidence of state.evidence || []) if (evidence.kind === "file") {
    material(evidence.source_ref, evidence.source_sha256).evidence.push({ evidence_ref: evidence.evidence_id,
      event_ref: state.history_index[evidence.evidence_id]?.event_ref || null });
  }
  for (const input of frozen_inputs) {
    material(input.source_ref, input.source_sha256).snapshots.push({ run_id: input.run_id, snapshot_ref: input.snapshot_ref,
      ...(input.snapshot_sha256 ? { snapshot_sha256: input.snapshot_sha256 } : {}), ...(input.bytes !== undefined ? { bytes: input.bytes } : {}) });
  }
  const understanding_sources = {};
  for (const event of events) {
    const update = event.type === "init" ? event.payload.project_understanding : event.payload.changes?.project_understanding;
    for (const key of Object.keys(update || {})) understanding_sources[key] = event.event_id;
  }
  return { runs, run_counts: counts, unfinished: structuredClone(unfinished), materials: [...materials.values()],
    route_execution_meaning: "Route links show explicitly assigned runs, each with its own lifecycle. Completion does not update the scientific assessment; missing links do not establish that no work ran.",
    input_metadata_issues: structuredClone(frozen_input_issues), understanding_sources,
    understanding_ownership: overviewOwnership({ state, events }) };
}

function deliveryState(state, exchangeRef) {
  const utility = require("./exchanges.cjs");
  const observations = (state.deliveries || []).filter(record => record.exchange_ref === exchangeRef);
  const discrepancies = observations.filter(record => Object.hasOwn(record, "observed_response_sha256")
    && utility.deliveryCorrespondence(record) === "different");
  const resolution = utility.resolvedDelivery(state, exchangeRef);
  const applicable = resolution.status === "current" && utility.deliveryMatches(resolution.delivery, state);
  const legacy = resolution.status === "unverified" ? observations.filter(record => utility.deliveryMatches(record, state)) : [];
  const content = applicable && (resolution.capture || resolution.delivery)
    || legacy.find(record => record.observation === "host_confirmed")
    || legacy.find(record => record.observation === "assistant_emission");
  return { status: content?.observation || "unobserved",
  observation_refs: observations.map(record => record.delivery_id),
  applicability: resolution.status, ...(resolution.reason ? { applicability_reason: resolution.reason } : {}),
  ...(resolution.delivery ? { applicable_delivery_ref: resolution.delivery.delivery_id, correspondence: resolution.correspondence } : {}),
  ...(resolution.capture ? { evidence_kind: "native_capture", capture_ref: resolution.capture.delivery_id,
    ...(utility.isAgentRecorded(resolution.delivery) ? { recording_ref: resolution.delivery.delivery_id } : {}) }
    : utility.isAgentRecorded(resolution.delivery) ? { evidence_kind: "agent_attributed_record", native_identity_verified: false } : {}),
  ...(discrepancies.length ? { discrepancy_refs: discrepancies.map(record => record.delivery_id) } : {}) };
}

// Derive question continuity from recorded exchanges, not model-maintained
// pointers. An old prepared offer is never upgraded into an observed one.
function questionMemoryLinks(state, events, bodies = journalBodies(events, state)) {
  const result = new Map();
  const prepared = journalBodies(events).exchanges;
  for (const question of state.questions) {
    if (question.origin === "user") {
      result.set(question.question_id, userQuestionMemory(state, events, question, prepared));
      continue;
    }
    const utility = require("./exchanges.cjs");
    const mentions = (state.exchanges || []).map(exchange => utility.effectiveExchange(state, exchange))
      .filter(exchange => exchange.question_refs.includes(question.question_id)
        || (!utility.isAgentRecorded(utility.resolvedDelivery(state, exchange.exchange_id).delivery)
          && (question.basis_refs || []).includes(exchange.exchange_id)));
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
      const resolution = utility.resolvedDelivery(state, ref);
      return resolution.status === "current" ? [resolution.delivery.delivery_id]
        : resolution.observation_refs;
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

// Resolution belongs to the question; communication belongs to the actual
// reply. Only explicit mappings establish answer disposition, never prose or
// an answer item's kind alone. This view writes no question state.
function userQuestionMemory(state, events, question, prepared) {
  const utility = require("./exchanges.cjs"), ref = question.question_id;
  const sequence = new Map(events.map((event, index) => [event.event_id, event.sequence ?? index + 1]));
  const definitions = [], episodes = [], sourceEvents = new Map(), primarySources = new Set();
  let episodeStart = 0, retirementStart = 0, previous;
  for (const event of events) {
    const priorEpisodeStart = episodeStart;
    for (const source of event.payload?.changes?.evidence || []) {
      if (source.kind === "user_statement" && !sourceEvents.has(source.evidence_id)) sourceEvents.set(source.evidence_id, event.event_id);
      if (source.kind === "user_statement" && Object.hasOwn(source, "complete_message")) primarySources.add(source.evidence_id);
    }
    for (const record of event.payload?.changes?.questions || []) if (record.question_id === ref) {
      definitions.push({ event_ref: event.event_id, record });
      if (!previous || record.status === "open" && previous.status !== "open") episodeStart = sequence.get(event.event_id);
      if (record.status === "retired") retirementStart = sequence.get(event.event_id);
      previous = record;
    }
    const interpretation = event.payload?.interpretation;
    if (utility.userQuestions(interpretation).some(item => item.question_ref === ref)) {
      const primary = interpretation.incoming_refs.filter(source => primarySources.has(source));
      const sources = (primary.length ? primary : interpretation.incoming_refs).map(source => sourceEvents.get(source)).filter(Boolean);
      if (sources.length) episodeStart = Math.max(episodeStart, Math.min(...sources.map(source => sequence.get(source))));
    }
    if (episodeStart !== priorEpisodeStart) episodes.push(episodeStart);
  }
  const answer = exchange => exchange?.response?.user_questions?.find(item => item.question_ref === ref);
  const mentions = [...prepared.values()].filter(exchange => answer(exchange)
    || (state.deliveries || []).some(delivery => delivery.exchange_ref === exchange.exchange_id
      && utility.isAgentRecorded(delivery) && delivery.agent_recording.items.some(item => item.kind === "answer" && item.question_ref === ref)));
  const applicable = mentions.filter(exchange => sequence.get(exchange.event_ref) >= episodeStart);
  const refs = new Set(applicable.map(exchange => exchange.exchange_id));
  const observations = (state.deliveries || []).filter(delivery => refs.has(delivery.exchange_ref));
  const currentDefinition = definitions.at(-1);
  const definitionFor = exchange => exchange && definitions.filter(item => sequence.get(item.event_ref) <= sequence.get(exchange.event_ref)).at(-1);
  const resolutionKey = record => require("./files.cjs").canonical({ statement: record.statement,
    reason: record.reason || null, basis_refs: [...(record.basis_refs || [])].sort() });
  const questionCorrections = events.filter(event => event.type === "correction"
    && (event.payload.corrects_refs || []).some(target => target === ref
      || definitions.some(item => item.event_ref === target)));
  const correctionsAfter = exchange => questionCorrections.filter(event => sequence.get(event.event_id) > sequence.get(exchange.event_ref));
  const answerVersion = exchange => {
    const definition = definitionFor(exchange);
    const correction = questionCorrections.filter(event => sequence.get(event.event_id) <= sequence.get(exchange.event_ref)).at(-1);
    return { key: definition && resolutionKey(definition.record), correction: correction?.event_id,
      episode: episodes.filter(start => start <= sequence.get(exchange.event_ref)).at(-1) || 0,
      sequence: Math.max(sequence.get(definition?.event_ref) || 0, sequence.get(correction?.event_id) || 0) };
  };
  // Reuse actual-message order. A recapture appended today cannot replace a
  // genuinely later answer, and incomparable native/agent orders stay unknown.
  let latest = latestActualMessage(state, observations);
  const explicit = observations.filter(delivery => utility.deliveryMatches(delivery, state)
    && answer(utility.effectiveExchange(state, prepared.get(delivery.exchange_ref), {}, delivery.delivery_id))?.status
    && (utility.isAgentRecorded(delivery) || delivery.observed_response_sha256));
  const disposition = latestActualMessage(state, explicit);
  // A repeated draft does not renew a fulfilled request. Use explicit actual
  // answer dispositions; omissions and legacy no-status items cannot revoke it.
  const explicitExchange = prepared.get(disposition.exchange_ref);
  const explicitDefinition = definitionFor(explicitExchange);
  const latestExchange = prepared.get(latest.exchange_ref), latestDefinition = definitionFor(latestExchange);
  if (latest.status === "current" && disposition.status === "current" && explicitDefinition && currentDefinition
    && utility.deliveryMatches((state.deliveries || []).find(delivery => delivery.delivery_id === latest.delivery_ref), state)
    && (resolutionKey(explicitDefinition.record) === resolutionKey(currentDefinition.record) && !correctionsAfter(explicitExchange).length
      || latestDefinition && resolutionKey(explicitDefinition.record) === resolutionKey(latestDefinition.record)
        && !correctionsAfter(explicitExchange).some(event => sequence.get(event.event_id) <= sequence.get(latestExchange.event_ref)))) latest = disposition;
  const actual = (state.deliveries || []).find(delivery => delivery.delivery_id === latest.delivery_ref);
  const actualResolution = actual && utility.resolveDeliveryReference(state, actual.delivery_id);
  const exchange = prepared.get(latest.exchange_ref);
  const intended = answer(exchange);
  const recorded = actual && latest.status === "current" && utility.deliveryMatches(actual, state)
    ? answer(utility.effectiveExchange(state, exchange, {}, actual.delivery_id)) : null;
  const latestPrepared = applicable.filter(exchange => answer(exchange)).at(-1);
  const communication = {
    status: recorded?.status || "unconfirmed",
    ...(exchange ? { exchange_ref: exchange.exchange_id, prepared_event_ref: exchange.event_ref } : {}),
    ...(actual ? { delivery_ref: actual.delivery_id,
      evidence_kind: actualResolution?.capture || !utility.isAgentRecorded(actual) ? "native_capture" : "agent_attributed_record",
      ...(actualResolution?.capture ? { capture_ref: actualResolution.capture.delivery_id } : {}) } : {}),
    ...(latestPrepared ? { latest_prepared_answer_ref: latestPrepared.exchange_id } : {})
  };
  if (recorded) {
    const itemIndex = utility.isAgentRecorded(actual)
      ? actual.agent_recording.items.findIndex(item => item.kind === "answer" && item.question_ref === ref)
      : exchange.response.user_questions.indexOf(recorded);
    communication.answer_location = utility.isAgentRecorded(actual)
      ? { record_ref: actual.delivery_id, event_ref: state.history_index[actual.delivery_id]?.event_ref,
        source_path: ["agent_recording", "items", itemIndex] }
      : { record_ref: exchange.exchange_id, event_ref: exchange.event_ref,
        source_path: ["response", "user_questions", itemIndex] };
  }
  if (actual && latest.status === "current" && utility.deliveryMatches(actual, state)) {
    if (!recorded && intended?.status === "answered") {
      communication.status = "needs_reconciliation";
      communication.reason = "The actual reply has no mapped answer for this prepared answer; reconcile omission or unmapped wording.";
    } else if (recorded && !recorded.status) {
      communication.reason = "This historical answer mapping records no disposition; completeness is unconfirmed.";
    } else if (recorded?.status === "pending") {
      communication.reason = "The actual reply records this answer as pending.";
    } else if (recorded?.status === "withdrawn" && question.status !== "retired") {
      communication.status = "needs_reconciliation";
      communication.reason = "The actual reply acknowledges withdrawal, but the question has no current sourced retirement.";
    }
  } else if (observations.length) {
    communication.reason = "The applicable actual answer is unconfirmed; reconcile delivery identity, order or correspondence.";
  }
  const answeredDefinition = definitionFor(exchange);
  const laterCorrections = answeredDefinition ? correctionsAfter(exchange) : [];
  // Version differences establish uncertainty, not a semantic rewrite or a
  // command to repeat an answer. Keep the actual historical answer inspectable.
  if (communication.status === "answered" && answeredDefinition && currentDefinition
    && (resolutionKey(answeredDefinition.record) !== resolutionKey(currentDefinition.record) || laterCorrections.length)) {
    communication.status = "unconfirmed";
    communication.answer_applicability = "earlier_question_definition";
    communication.answered_question_event_ref = answeredDefinition.event_ref;
    communication.current_question_event_ref = currentDefinition.event_ref;
    communication.revision_refs = [...new Set([currentDefinition.event_ref, ...laterCorrections.map(event => event.event_id)])];
    communication.reason = "This answer was communicated under an earlier question definition. Reconcile the current resolution with that actual answer before relying on it; a record edit alone does not require repeating it.";
  }
  if (communication.status === "unconfirmed") {
    // Unknown order or a later legacy item without disposition cannot settle a
    // known discrepancy. Look only at explicit meaning, still in actual order.
    const signals = mentions.filter(candidate => sequence.get(candidate.event_ref) >= retirementStart).flatMap(candidate => {
      const resolution = utility.resolvedDelivery(state, candidate.exchange_id);
      const current = resolution.status === "current" && utility.deliveryMatches(resolution.delivery, state);
      const replaced = new Set((state.deliveries || []).map(delivery => delivery.agent_recording?.supersedes_recording_ref).filter(Boolean));
      const candidates = current ? [resolution.delivery]
        : (state.deliveries || []).filter(delivery => delivery.exchange_ref === candidate.exchange_id
          && utility.isAgentRecorded(delivery) && !replaced.has(delivery.delivery_id));
      return candidates.flatMap(delivery => {
        const individual = utility.resolveDeliveryReference(state, delivery.delivery_id);
        const entry = answer(individual.status === "current"
          ? utility.effectiveExchange(state, candidate, {}, delivery.delivery_id)
          : utility.recordedExchange(candidate, delivery));
        const status = entry?.status || (!entry && answer(candidate)?.status === "answered" ? "needs_reconciliation" : null);
        // Conflicting recordings can retain a discrepancy, never establish a
        // completed answer by selecting the convenient side of that conflict.
        return status && (current || !["answered", "withdrawn"].includes(status))
          ? [{ delivery, status, omitted: !entry, version: answerVersion(candidate),
            related_refs: current ? [] : resolution.observation_refs }] : [];
      });
    });
    // A completed older answer can settle its own earlier gap, not a revised
    // question's gap. An omitted repeat follows the compatible explicit
    // disposition; explicit pending needs a later completed answer.
    const discrepancies = signals
      .filter(item => item.status !== "answered" && !(item.status === "withdrawn" && question.status === "retired"))
      .filter(item => {
        const compatible = signals.filter(other => !other.omitted && other.version.episode >= item.version.episode
          && (other.version.sequence >= item.version.sequence
            || other.version.key === item.version.key && other.version.correction === item.version.correction));
        const candidates = item.omitted ? compatible : [item, ...compatible.filter(other => other.status === "answered")];
        const known = latestActualMessage(state, candidates.map(other => other.delivery));
        return candidates.find(other => other.delivery.delivery_id === known.delivery_ref)?.status !== "answered";
      })
      .flatMap(item => [item.delivery.exchange_ref, item.delivery.delivery_id, ...item.related_refs]);
    if (discrepancies.length) {
      communication.status = "needs_reconciliation";
      communication.related_refs = [...new Set(discrepancies)];
      communication.reason = "Recorded pending or unmapped answers still need reconciliation; uncertain later content or order does not establish completion.";
    }
  }
  // Open/retired state already supplies its own continuity. Historical records
  // without the additive disposition field do not create a new backlog.
  communication.needs_reconciliation = question.status === "answered"
    && ["pending", "needs_reconciliation"].includes(communication.status);
  const interpretation = [...events].reverse().find(event => event.payload?.interpretation
    && ((event.payload.changes?.questions || []).some(record => record.question_id === ref)
      || event.payload.interpretation.basis_refs.includes(ref)
      || event.payload.interpretation.components.some(component => component.user_question_ref === ref)));
  return {
    original_exchange_ref: mentions[0]?.exchange_id || null,
    latest_exchange_ref: exchange?.exchange_id || latestPrepared?.exchange_id || null,
    latest_interpretation_ref: interpretation?.payload.interpretation.interpretation_id || null,
    delivery_refs: [...new Set([actual?.delivery_id, ...(state.deliveries || [])
      .filter(delivery => communication.related_refs?.includes(delivery.delivery_id)).map(delivery => delivery.delivery_id)].filter(Boolean))],
    unobserved_exchange_refs: applicable.filter(exchange => deliveryState(state, exchange.exchange_id).status === "unobserved").map(exchange => exchange.exchange_id),
    communication
  };
}

function questionCommunicationGaps(links) {
  return [...links].flatMap(([ref, memory]) => memory.communication?.needs_reconciliation ? [{
    kind: "question_communication", record_ref: ref, reasons: ["answer_communication_needs_reconciliation"],
    related_refs: [...new Set([memory.communication.exchange_ref, memory.communication.delivery_ref,
      ...(memory.communication.related_refs || [])].filter(Boolean))],
    retrieval: { context: { mode: "record", records: [{ record_ref: ref }] } }
  }] : []);
}

function latestActualMessage(state, observations = state.deliveries || []) {
  const utility = require("./exchanges.cjs");
  const captured = observations.filter(item => item.observed_response_sha256 || utility.isAgentRecorded(item));
  const legacy = observations.filter(item => !item.observed_response_sha256 && !utility.isAgentRecorded(item));
  if (!captured.length) {
    const refs = [...new Set(legacy.map(item => item.exchange_ref))];
    return { status: refs.length === 1 ? "single_unverified_exchange" : "order_unknown", exchange_ref: refs.length === 1 ? refs[0] : null };
  }
  // Select complete canonical groups before comparing their actual positions.
  // A filtered question view must not detach a mapping from its capture or
  // supersession links and revive an obsolete interpretation.
  const selected = new Set(captured.map(item => item.delivery_id));
  const refsInGroups = new Set(utility.actualReplyGroups(state)
    .filter(group => group.observation_refs.some(ref => selected.has(ref)))
    .flatMap(group => group.observation_refs));
  const resolution = utility.latestActualDelivery({ ...state,
    deliveries: (state.deliveries || []).filter(item => refsInGroups.has(item.delivery_id)) });
  if (resolution.status !== "current") return { status: resolution.status, exchange_ref: null };
  const selectedReply = utility.resolveDeliveryReference(state, resolution.delivery.delivery_id);
  const refs = [...new Set((state.deliveries || []).filter(item => selectedReply.observation_refs.includes(item.delivery_id))
    .map(item => item.exchange_ref))];
  if (refs.length !== 1 || legacy.some(item => item.exchange_ref !== refs[0])) return { status: "exchange_binding_uncertain", exchange_ref: null };
  return { status: "current", exchange_ref: refs[0], delivery_ref: resolution.delivery.delivery_id,
    message_identity: resolution.message_identity, order: resolution.order,
    ...(resolution.capture ? { evidence_kind: "native_capture", capture_ref: resolution.capture.delivery_id } : {}),
    ...(utility.isAgentRecorded(resolution.delivery) ? { ...(!resolution.capture ? { evidence_kind: "agent_attributed_record", native_identity_verified: false } : {}),
      before_incoming_ref: resolution.delivery.agent_recording.before_incoming_ref,
      before_incoming_event_ref: resolution.delivery.agent_recording.before_incoming_event_ref } : {}) };
}
function conversationRoots(state, questionLinks = new Map()) {
  const currentExchange = (state.exchanges || []).at(-1);
  const currentInterpretation = (state.interpretations || []).at(-1);
  const lastObservation = (state.deliveries || []).at(-1);
  const latestActual = latestActualMessage(state);
  const roots = new Map();
  const add = (ref, reason) => { if (ref && !roots.has(ref)) roots.set(ref, reason); };
  const pending = require("./model.cjs").pendingPrimarySources(state);
  for (const source of pending) add(source.evidence_ref, "incoming message awaiting interpretation");
  add(state.focus_scope_ref, "current user focus");
  const supersededScopes = new Set((state.action_scopes || []).map(scope => scope.supersedes).filter(Boolean));
  for (const scope of state.action_scopes || []) {
    const decision = (state.action_decisions || []).filter(item => item.scope_ref === scope.scope_id).at(-1);
    const consumed = decision && state.runs.some(run => run.authorization_binding?.authorization_ref === decision.decision_id);
    if (scope.scope_id !== state.focus_scope_ref && (supersededScopes.has(scope.scope_id)
      || ["decline", "withdraw"].includes(decision?.disposition) || consumed)) continue;
    add(scope.scope_id, decision?.disposition === "defer" ? "deferred action scope" : "pending action scope");
    add(decision?.decision_id, "latest scoped user decision");
    for (const prepared of state.exchanges || []) {
      const exchange = require("./exchanges.cjs").effectiveExchange(state, prepared);
      if (!exchange.options.some(option => option.scope_ref === scope.scope_id)) continue;
      add(exchange.exchange_id, "exact action offer and option ordering");
      for (const delivery of state.deliveries || []) if (delivery.exchange_ref === exchange.exchange_id) add(delivery.delivery_id, "action offer presentation observation");
    }
  }
  add(currentInterpretation?.interpretation_id, "current incoming interpretation");
  add(currentExchange?.exchange_id, "latest prepared outgoing exchange");
  add(lastObservation?.delivery_id, "latest recorded delivery observation");
  add(lastObservation?.exchange_ref, "exchange linked to latest delivery observation");
  add(latestActual.delivery_ref, "latest applicable actual message observation");
  add(latestActual.exchange_ref, "exchange linked to latest actual message");
  const pendingUserQuestions = state.questions.filter(question => question.origin === "user" && question.status === "open");
  for (const question of pendingUserQuestions) add(question.question_id, "unanswered user question");
  const communicationGaps = questionCommunicationGaps(questionLinks);
  for (const gap of communicationGaps) add(gap.record_ref, "answer communication needs reconciliation");
  for (const [ref, memory] of questionLinks) if (memory.communication?.answer_applicability === "earlier_question_definition") {
    add(ref, "current answer applicability needs review");
  }
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
  return { roots, unfinished, communication_gaps: communicationGaps, pending_intakes: pending, pending_user_question_refs: pendingUserQuestions.map(question => question.question_id),
    current_exchange_ref: currentExchange?.exchange_id || null,
    current_interpretation_ref: currentInterpretation?.interpretation_id || null,
    latest_delivery_observation_ref: lastObservation?.delivery_id || null,
    latest_observed_exchange_ref: latestActual.exchange_ref, latest_actual_message: latestActual };
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
    const displayItem = (exchange.response_items || (exchange.renderer === "lead-markdown-v11"
      ? require("./response-layout.cjs").responseItems(exchange) : [])).find(item => item.option_id === option.option_id);
    offers.push({ exchange_ref: exchange.exchange_id, option_id: option.option_id, scope_ref: option.scope_ref,
      option_number: exchange.response.next_steps.indexOf(option) + 1, label: option.label,
      ...(displayItem ? { display_label: displayItem.display_label } : {}),
      proposal: structuredClone(option.proposal), execution_plan: structuredClone(option.execution_plan),
      ...(exchange.reply_attribution === "prepared_draft" ? { reply_attribution: "prepared_draft", actual_reply_status: exchange.actual_reply_status } : {}),
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
  const interpretation = (state.interpretations || []).at(-1);
  const direction = interpretation?.next_action;
  const directionTurn = (state.turns || []).find(turn => turn.interpretation_ref === interpretation?.interpretation_id);
  return { policy: structuredClone(state.state_meta.consultation_policy), focus_scope_ref: state.focus_scope_ref || null,
    scopes: structuredClone(scopes), decisions: structuredClone(decisions), offers, exact_basis: basis,
    eligibility: scopes.map(scope => {
      const permission = policy.eligibility(state, scope.scope_id);
      const current = !directionTurn?.exchange_ref && direction?.kind === "specialist"
        && direction.scope_ref === scope.scope_id && direction.authorization_ref === permission.authorization_ref;
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
  const routeRuns = require("./route-runs.cjs").routeRunLinks(loaded);
  const sharedCoverage = { scope, historical_bodies: "Exact historical versions remain in history; current records do not replace historical evidence.",
    omissions: selected ? [...selected.coverage.omission_reasons] : [] };
  const bodies = journalBodies(events, state);
  const questionLinks = questionMemoryLinks(state, events, bodies);
  const info = conversationRoots(state, questionLinks);
  const pendingConsultantQuestions = state.questions.filter(question => question.origin !== "user" && question.status === "open")
    .map(question => ({ question_ref: question.question_id, statement: question.statement,
      ...(question.resolution ? { remaining: structuredClone(question.resolution.remaining) } : {}),
      resolution_recorded: Boolean(question.resolution), retrieval: { mode: "record", records: [{ record_ref: question.question_id }] } }));
  const relevantQuestions = (data.questions || []).map(question => ({
    question_ref: question.question_id, statement: question.statement, status: question.status,
    ...(question.reason ? { reason: question.reason } : {}),
    ...(question.resolution ? { resolution: structuredClone(question.resolution) } : {}),
    ...structuredClone(questionLinks.get(question.question_id)), retrieval: { mode: "record", records: [{ record_ref: question.question_id }] }
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
    if (name === "exchanges") {
      full.response_sha256 = record.response_sha256; full.delivery = deliveryState(state, record.exchange_id);
      if (!full.response_items && require("./exchanges.cjs").FOUR_SECTION_RENDERERS.includes(full.renderer)) full.response_items = require("./response-layout.cjs").responseItems(full);
      if (full.reply_attribution === "prepared_draft") {
        full.response_items_source = "prepared_draft";
        full.response_items_status = "applicability_unresolved";
      }
    }
    return full;
  });
  const interpretations = materialize("interpretations", "interpretation_id");
  const exchanges = materialize("exchanges", "exchange_id");
  const user = { source: structuredClone(source), coverage: { ...structuredClone(sharedCoverage),
    user_context: counts("user_context"), attribution: "Study claims stay in evidence; these references do not verify their truth." },
  context: collection("user_context"), attributed_evidence_refs: (data.evidence || []).filter(record => record.kind === "user_statement").map(record => record.evidence_id) };
  const study = { source: structuredClone(source), coverage: structuredClone(sharedCoverage),
    understanding_source_path: prefix + ".project_understanding",
    understanding_ownership: overviewOwnership(loaded),
    route_execution: (data.candidate_routes || []).map(route => ({ strategy_ref: route.strategy_id,
      assessment_event_ref: state.history_index[route.strategy_id]?.event_ref || null,
      runs: structuredClone(routeRuns.get(route.strategy_id) || []) })),
    collections: Object.fromEntries(["evidence", "questions", "assumptions", "result_conditions", "candidate_routes", "decisions"].map(name => [name, collection(name)])),
    result_condition_coverage: { linked_evidence_refs: [...new Set((data.result_conditions || []).map(record => record.evidence_ref))],
      unreviewed_computed_evidence_refs: (data.evidence || []).filter(record => record.kind === "computed"
        && !(state.result_conditions || []).some(condition => condition.evidence_ref === record.evidence_id)).map(record => record.evidence_id),
      meaning: "These computed records lack linked result conditions. Establish appropriate conditions when using them for a scientific claim; administrative artifacts need no invented causal target." } };
  const work = { source: structuredClone(source), coverage: { ...structuredClone(sharedCoverage),
    interpretations: { total: (state.interpretations || []).length, materialized: interpretations.length },
    exchanges: { total: (state.exchanges || []).length, materialized: exchanges.length }, missing_bodies: missing,
    question_memory: "The pending inventory lists open consultant questions. Selected question continuity also links user answers and communication gaps; question resolution and actual communication are distinct. Retired uncertainty is not a request to ask again.",
    delivery: "Observations are attributed records, not proof of reading. Agent records preserve structured actual reply content and its attributed relation to a later incoming source; they do not establish native message identity or host order. Journal append order and supplied timestamps do not establish actual emission order.",
    legacy_continuity: state.state_meta.protocol ? "Earlier unrecorded exchanges remain unavailable." : "No durable exchange protocol has been recorded; recover prior questions from attributable conversation evidence." },
    protocol: state.state_meta.protocol || null, checkpoint_source_path: prefix + ".consultation",
    collections: Object.fromEntries(["specialist_reviews", "runs", "turns", "deliveries"].map(name => [name, collection(name)])),
    current_interpretation_ref: info.current_interpretation_ref, current_exchange_ref: info.current_exchange_ref,
    latest_delivery_observation_ref: info.latest_delivery_observation_ref, latest_observed_exchange_ref: info.latest_observed_exchange_ref,
    latest_actual_message: info.latest_actual_message,
    unfinished_turns: info.unfinished, question_communication_gaps: info.communication_gaps,
    pending_intakes: info.pending_intakes, pending_user_question_refs: info.pending_user_question_refs,
    pending_consultant_questions: pendingConsultantQuestions, question_memory: relevantQuestions,
    interpretations, exchanges };
  const actions = actionMemory(loaded, data, bodies);
  if (actions) work.actions = actions;
  return { user, study, work };
}

module.exports = { buildViews, buildOperationalSummary, overviewOwnership, collectionIds, hasExtension, journalBodies, conversationRoots, questionMemoryLinks, questionCommunicationGaps, deliveryState };
