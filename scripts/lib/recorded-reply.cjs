"use strict";

const { fail } = require("./files.cjs");
const { object, text, id, enumeration, array } = require("./model.cjs");

const PROTOCOL = "agent-recorded-reply-v1";
const KINDS = ["answer", "explanation", "findings", "summary", "question", "option"];
function isAgentRecorded(delivery) {
  return delivery?.observation === "agent_recorded" && delivery.capture_protocol === PROTOCOL;
}
function firstPrimaryEvent(events, ref) {
  return events.find(event => (event.payload.changes?.evidence || []).some(source => source.evidence_id === ref
    && source.kind === "user_statement" && source.source_intake === "primary-message-v1"));
}
function prepareRecording(delivery, events) {
  if (!isAgentRecorded(delivery)) return;
  const recording = delivery.agent_recording;
  object(recording, "agent_recording", ["before_incoming_ref", "items"], ["before_incoming_event_ref", "capture_ref", "supersedes_recording_ref"]);
  const sourceEvent = firstPrimaryEvent(events, recording.before_incoming_ref);
  if (!sourceEvent) fail("MISSING_USER_SOURCE", "An agent recording requires an already retained primary user intake.");
  if (Object.hasOwn(recording, "before_incoming_event_ref") && recording.before_incoming_event_ref !== sourceEvent.event_id) {
    fail("INVALID_INPUT", "The following-user event must identify its first retained primary intake; later source edits do not move an actual reply.");
  }
  recording.before_incoming_event_ref = sourceEvent.event_id;
}
function recordedBeforeSequence(state, delivery) {
  return isAgentRecorded(delivery) ? state?.history_index?.[delivery.agent_recording.before_incoming_event_ref]?.sequence : undefined;
}
function primarySourceSequence(state, ref, payload = {}) {
  if (!state.history_index[ref] && (payload.changes?.evidence || []).some(source => source.evidence_id === ref && source.kind === "user_statement")) {
    return state.state_meta.sequence + 1;
  }
  // Existing anchors and earlier interpretations prevent a later summary edit
  // from turning a previously received source into a new user message. Live
  // writes additionally check the exact first intake in the immutable journal.
  const positions = [state.history_index[ref]?.sequence,
    ...(state.deliveries || []).filter(delivery => isAgentRecorded(delivery) && delivery.agent_recording.before_incoming_ref === ref)
      .map(delivery => recordedBeforeSequence(state, delivery)),
    ...(state.interpretations || []).filter(interpretation => interpretation.incoming_refs.includes(ref))
      .map(interpretation => state.history_index[interpretation.event_ref]?.sequence)].filter(Number.isSafeInteger);
  return positions.length ? Math.min(...positions) : undefined;
}
function validateIncomingChronology(state, payload, events) {
  const interpretation = payload.interpretation;
  if (!interpretation) return;
  const firstSequence = ref => {
    const sourceEvent = firstPrimaryEvent(events, ref) || events.find(event => (event.payload.changes?.evidence || [])
      .some(source => source.evidence_id === ref && source.kind === "user_statement"));
    return sourceEvent?.sequence ?? primarySourceSequence(state, ref, payload);
  };
  for (const component of interpretation.components || []) {
    const delivery = require("./exchanges.cjs").resolveDeliveryReference(state, component.delivery_ref, payload).delivery;
    if (!isAgentRecorded(delivery) || require("./authorizations.cjs").isExistingActionControl(state, interpretation, component, payload)) continue;
    const anchor = recordedBeforeSequence(state, delivery);
    if (!interpretation.incoming_refs.some(ref => firstSequence(ref) >= anchor)) {
      fail("EARLY_AUTHORIZATION", "The original retained incoming user message must follow this actual reply; source updates do not establish a new message.");
    }
    for (const decision of (interpretation.action_decisions || []).filter(item => item.delivery_ref === component.delivery_ref && item.disposition === "accept")) {
      if (!decision.user_refs.every(ref => firstSequence(ref) >= anchor)) {
        fail("EARLY_AUTHORIZATION", "Only user messages first retained after this actual reply can accept its offer.");
      }
      const scope = (state.action_scopes || []).find(item => item.scope_id === decision.scope_ref);
      const acceptanceSequence = Math.min(...decision.user_refs.map(firstSequence));
      if (scope?.action === "report" && !require("./authorizations.cjs").actualReportFindingsDiscussed(state, scope, decision, payload, acceptanceSequence)) {
        fail("FINDINGS_NOT_DISCUSSED", "The actual findings discussion must precede the original retained report acceptance message; source updates do not create later consent.");
      }
    }
  }
}
function validateRecording(recording, context, state, exchange, delivery) {
  object(recording, "agent_recording", ["before_incoming_ref", "before_incoming_event_ref", "items"], ["capture_ref", "supersedes_recording_ref"]);
  context.contributionRefs([recording.before_incoming_ref], "agent_recording.before_incoming_ref", true);
  context.reference(recording.before_incoming_event_ref, "agent_recording.before_incoming_event_ref", "event");
  const incoming = (state.evidence || []).find(item => item.evidence_id === recording.before_incoming_ref);
  const sourceSequence = state.history_index[recording.before_incoming_event_ref]?.sequence;
  const exchangeSequence = exchange.sequence || state.history_index[exchange.exchange_id]?.sequence;
  if (incoming?.source_intake !== "primary-message-v1" || incoming.complete_message !== true
    || typeof incoming.source_excerpt !== "string" || !incoming.source_excerpt.trim()
    || !sourceSequence || !exchangeSequence || sourceSequence <= exchangeSequence) {
    fail("MISSING_USER_SOURCE", "An agent recording requires the complete retained primary user message that follows this prepared exchange.");
  }
  if (Object.hasOwn(recording, "capture_ref")) {
    context.reference(recording.capture_ref, "agent_recording.capture_ref", "delivery");
    const capture = (state.deliveries || []).find(item => item.delivery_id === recording.capture_ref);
    if (!capture || isAgentRecorded(capture) || !capture.observed_response_sha256 || capture.exchange_ref !== exchange.exchange_id) {
      fail("INVALID_INPUT", "A capture-backed interpretation requires an earlier captured delivery of this exchange.");
    }
  }
  if (Object.hasOwn(recording, "supersedes_recording_ref")) {
    context.reference(recording.supersedes_recording_ref, "agent_recording.supersedes_recording_ref", "delivery");
    const previous = (state.deliveries || []).find(item => item.delivery_id === recording.supersedes_recording_ref);
    if (!isAgentRecorded(previous) || previous.exchange_ref !== exchange.exchange_id
      || previous.source_ref !== delivery?.source_ref
      || previous.agent_recording.before_incoming_ref !== recording.before_incoming_ref
      || previous.agent_recording.before_incoming_event_ref !== recording.before_incoming_event_ref) {
      fail("INVALID_INPUT", "Recording correction must retain the same reply locator, exchange and original following-user relation.");
    }
    const previousReply = require("./exchanges.cjs").resolveDeliveryReference(state, previous.delivery_id);
    const captureRef = previousReply.capture?.delivery_id || previous.agent_recording.capture_ref;
    if (captureRef && recording.capture_ref !== captureRef) {
      fail("INVALID_INPUT", "Recording correction must retain the existing authoritative capture; omission cannot downgrade captured content.");
    }
  }
  const mappings = new Set();
  array(recording.items, "agent_recording.items", (item, label) => {
    object(item, label, ["kind", "text"], ["display_label", "question_ref", "option_id", "scope_ref", "work_refs", "basis_refs", "status"]);
    enumeration(item.kind, KINDS, label + ".kind");
    text(item.text, label + ".text");
    if (Object.hasOwn(item, "display_label") && item.display_label !== null) {
      text(item.display_label, label + ".display_label");
    }
    if (Object.hasOwn(item, "question_ref")) {
      if (!["answer", "question"].includes(item.kind)) fail("INVALID_INPUT", "Only an actual answer or question maps a question reference.");
      context.reference(item.question_ref, label + ".question_ref", "question");
      const question = (state.questions || []).find(value => value.question_id === item.question_ref);
      if (item.kind === "question" && !(exchange.question_refs || []).includes(item.question_ref)) fail("UNKNOWN_REFERENCE", "A mapped actual question must identify this prepared exchange's question.");
      if (item.kind === "answer" && question?.origin !== "user") fail("INVALID_INPUT", "An actual answer must map a user-origin question.");
      const key = item.kind + ":" + item.question_ref;
      if (mappings.has(key)) fail("INVALID_INPUT", "An actual question or answer mapping must be distinct.");
      mappings.add(key);
    }
    if (Object.hasOwn(item, "status")) {
      if (item.kind !== "answer" || !Object.hasOwn(item, "question_ref")) fail("INVALID_INPUT", "Only a mapped actual answer carries an answer disposition.");
      enumeration(item.status, ["answered", "pending", "withdrawn"], label + ".status");
    }
    if (Object.hasOwn(item, "option_id")) {
      if (item.kind !== "option") fail("INVALID_INPUT", "Only actual options map option identities.");
      id(item.option_id, label + ".option_id");
      if (!(exchange.options || []).some(option => option.option_id === item.option_id)) fail("UNKNOWN_REFERENCE", "A mapped actual option must identify this prepared exchange's option.");
      if (mappings.has(item.option_id)) fail("INVALID_INPUT", "An actual option mapping must be distinct.");
      mappings.add(item.option_id);
    }
    if (Object.hasOwn(item, "scope_ref")) {
      context.reference(item.scope_ref, label + ".scope_ref", "action_scope");
      const option = (exchange.options || []).find(value => value.option_id === item.option_id);
      if (item.kind !== "option" || !option || option.scope_ref !== item.scope_ref) fail("SCOPE_MISMATCH", "An actual scope mapping must identify the saved scope of its mapped option.");
    }
    if (Object.hasOwn(item, "work_refs")) {
      if (item.kind !== "findings") fail("INVALID_INPUT", "Only actual findings carry work references.");
      context.references(item.work_refs, label + ".work_refs");
      for (const ref of item.work_refs) {
        const kind = state.history_index[ref]?.kind;
        if (!["review", "run", "evidence"].includes(kind)
          || (kind === "run" && context.runStatus(ref) !== "completed")
          || (kind === "evidence" && !(state.evidence || []).some(value => value.evidence_id === ref && value.kind === "computed"))) {
          fail("INVALID_FINDINGS", "Actual findings references must identify known completed work.");
        }
      }
    }
    if (Object.hasOwn(item, "basis_refs")) context.references(item.basis_refs, label + ".basis_refs");
  }, true);
}
function sectionFor(kind) {
  return kind === "summary" ? "What has been done" : kind === "question" ? "Questions for you"
    : kind === "option" ? "Next steps" : "To answer your question";
}
function recordedItems(delivery) {
  if (!isAgentRecorded(delivery)) return [];
  const positions = new Map();
  return delivery.agent_recording.items.map((item, index) => {
    const section = sectionFor(item.kind), position = item.kind === "summary" ? null : (positions.get(section) || 0) + 1;
    if (position !== null) positions.set(section, position);
    return { ...structuredClone(item), section, position, display_label: item.display_label ?? null,
      source_path: "agent_recording.items[" + index + "]",
      refs: [...new Set([item.question_ref, item.scope_ref, ...(item.work_refs || []), ...(item.basis_refs || [])].filter(Boolean))] };
  });
}
function recordedExchange(exchange, delivery) {
  if (!isAgentRecorded(delivery)) return exchange;
  const items = recordedItems(delivery), originalOptions = exchange.response?.next_steps || exchange.options || [];
  const questions = items.filter(item => item.kind === "question").map(item => ({ text: item.text,
    ...(item.question_ref ? { question_ref: item.question_ref } : {}) }));
  const options = items.filter(item => item.kind === "option").map(item => {
    const original = item.option_id && originalOptions.find(option => option.option_id === item.option_id);
    return { ...(original ? { kind: original.kind, actor: original.actor,
      ...(original.assignment ? { assignment: structuredClone(original.assignment) } : {}) } : {}),
      label: item.text, scope: item.text, basis_refs: [...(item.basis_refs || [])],
      ...(item.option_id ? { option_id: item.option_id } : {}), ...(item.scope_ref ? { scope_ref: item.scope_ref } : {}) };
  });
  const findingsItems = items.filter(item => item.kind === "findings");
  const findings = findingsItems.length ? { work_refs: [...new Set(findingsItems.flatMap(item => item.work_refs || []))],
    summary: findingsItems.map(item => item.text).join("\n\n"), diagnostics: [], limitations: [] } : null;
  const response = { questions, next_steps: options,
    user_questions: items.filter(item => item.kind === "answer").map(item => ({ answer: item.text,
      text: item.text, basis_refs: [...(item.basis_refs || [])], ...(item.question_ref ? { question_ref: item.question_ref } : {}),
      ...(Object.hasOwn(item, "status") ? { status: item.status } : {}) })),
    explanations: items.filter(item => item.kind === "explanation").map(item => ({ text: item.text, basis_refs: [...(item.basis_refs || [])] })),
    ...(items.some(item => item.kind === "summary") ? { status: items.filter(item => item.kind === "summary").map(item => item.text).join("\n\n") } : {}),
    ...(findings ? { findings } : {}) };
  return { ...exchange, response, response_items: items, question_refs: questions.map(item => item.question_ref).filter(Boolean),
    options, findings, actual_delivery_ref: delivery.delivery_id, reply_attribution: "agent_recorded",
    response_sha256_role: "prepared_response_link" };
}

module.exports = { PROTOCOL, isAgentRecorded, prepareRecording, recordedBeforeSequence, primarySourceSequence,
  validateIncomingChronology, validateRecording, recordedItems, recordedExchange };
