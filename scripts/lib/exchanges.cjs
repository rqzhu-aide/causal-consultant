"use strict";

const { canonical, sha256, fail } = require("./files.cjs");
const { object, text, id, enumeration, array, strings, validateAssignment } = require("./model.cjs");
const { isAgentRecorded, validateRecording, recordedItems, recordedExchange, recordedBeforeSequence,
  primarySourceSequence, validateIncomingChronology } = require("./recorded-reply.cjs");

const PROTOCOL = "durable-exchanges-v1";
const RENDERER = "lead-markdown-v11";
const VISIBLE_SCOPE_ANSWER_RENDERERS = ["lead-markdown-v10", RENDERER];
const FOUR_SECTION_RENDERERS = ["lead-markdown-v9", ...VISIBLE_SCOPE_ANSWER_RENDERERS];
const CONVERSATIONAL_RENDERERS = ["lead-markdown-v6", "lead-markdown-v7", "lead-markdown-v8", ...FOUR_SECTION_RENDERERS];
const COMPACT_RENDERERS = ["lead-markdown-v5", ...CONVERSATIONAL_RENDERERS];
const RENDERERS = ["lead-markdown-v1", "lead-markdown-v2", "lead-markdown-v3", "lead-markdown-v4", ...COMPACT_RENDERERS];
const LOOP_RENDERERS = ["lead-markdown-v4", ...COMPACT_RENDERERS];
const ANSWER_RENDERERS = ["lead-markdown-v3", ...LOOP_RENDERERS];
const list = (state, name) => state[name] || [];
function userQuestions(interpretation) {
  return interpretation?.user_questions || (interpretation?.components || [])
    .filter(component => component.kind === "question")
    .map(component => ({ question_ref: component.user_question_ref, answer_timing: component.answer_timing }));
}
function questionRecord(ref, state, payload) {
  return payload.changes?.questions?.find(question => question.question_id === ref)
    || state.questions.find(question => question.question_id === ref);
}
function distinct(values, label) {
  if (new Set(values).size !== values.length) fail("INVALID_INPUT", label + " contains duplicates.");
}
// A span is checked against retained capture bytes on write and verification.
// Historical mismatches have no span and retain their original meaning.
function deliveryCorrespondence(value) {
  if (!value) return "different";
  if (isAgentRecorded(value)) return "agent_recorded";
  if (!Object.hasOwn(value, "observed_response_sha256") || value.observed_response_sha256 === value.response_sha256) return "exact";
  if (value.response_equivalence === "lf-crlf-v1") return "line_endings_equivalent";
  return value.response_span ? "wrapped" : "different";
}
function deliveryIdentity(value) {
  if (isAgentRecorded(value)) return "agent-source:" + value.source_ref;
  if (value.capture_message) return canonical([value.capture_message.conversation_ref, value.capture_message.message_ref]);
  // The record hash is provenance for a capture, not part of native identity.
  const native = /^claude-code:([^/]+)\/([^#]+)#record-sha256=[a-f0-9]{64}$/.exec(value.capture_source_ref || "");
  if (native) return canonical(["claude-code:" + native[1], native[2]]);
  return value.capture_source_ref ? "source:" + value.capture_source_ref : "observation:" + value.delivery_id;
}
// Current interpretation is derived from immutable observations. Only source
// identity and explicit same-reply links group them; equal text does not.
function actualReplyGroups(state, payload = {}) {
  const observations = [...(state?.deliveries || []), ...(payload.delivery ? [payload.delivery] : [])]
    .filter(item => Object.hasOwn(item, "observed_response_sha256") || isAgentRecorded(item));
  const byId = new Map(observations.map(item => [item.delivery_id, item]));
  const parents = new Map(observations.map(item => [item.delivery_id, item.delivery_id]));
  const root = ref => { while (parents.get(ref) !== ref) ref = parents.get(ref); return ref; };
  const join = (left, right) => { if (parents.has(right)) parents.set(root(right), root(left)); };
  const identities = new Map();
  for (const item of observations) {
    const identity = deliveryIdentity(item);
    if (identities.has(identity)) join(item.delivery_id, identities.get(identity));
    else identities.set(identity, item.delivery_id);
    if (isAgentRecorded(item)) for (const ref of [item.agent_recording.capture_ref, item.agent_recording.supersedes_recording_ref]) {
      if (ref) join(item.delivery_id, ref);
    }
  }
  const groups = new Map();
  for (const item of observations) {
    const key = root(item.delivery_id);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.values()].map(items => {
    const recordings = items.filter(isAgentRecorded), captures = items.filter(item => !isAgentRecorded(item));
    const observation_refs = items.map(item => item.delivery_id), exchange_refs = [...new Set(items.map(item => item.exchange_ref))];
    let capture = captures.find(item => deliveryCorrespondence(item) !== "different") || captures[0];
    const common = { observation_refs, exchange_refs, ...(capture ? { capture } : {}) };
    const conflict = (reason, disputedCapture = false) => {
      const { capture: retainedCapture, ...provenance } = common;
      return { ...provenance, ...(!disputedCapture && retainedCapture ? { capture: retainedCapture } : {}),
        ...(disputedCapture ? { capture_refs: captures.map(item => item.delivery_id) } : {}),
        status: "identity_conflict", applicable: false, reason };
    };
    if (new Set(captures.map(deliveryIdentity)).size > 1
      || new Set(captures.map(item => item.observed_response_sha256)).size > 1
      || new Set(captures.map(item => canonical(item.capture_message ? [item.capture_message.conversation_ref,
        item.capture_message.message_ref, item.capture_message.ordinal ?? null, item.capture_message.order_path ?? null] : null))).size > 1) {
      return conflict("The same attributed reply has conflicting captured identity, bytes or order. Preserve the evidence and reconcile that message.", true);
    }
    if (exchange_refs.length !== 1) return conflict("The same attributed reply is linked to different prepared exchanges. Reconcile its exchange association.");
    const meaning = item => canonical({ before_incoming_ref: item.agent_recording.before_incoming_ref,
      before_incoming_event_ref: item.agent_recording.before_incoming_event_ref, items: item.agent_recording.items });
    const replaced = new Set(recordings.map(item => item.agent_recording.supersedes_recording_ref).filter(Boolean));
    // Identical earlier observations are aliases of the explicitly replaced
    // interpretation. Their journal order describes revision, never emission.
    recordings.forEach((item, index) => {
      const previous = byId.get(item.agent_recording.supersedes_recording_ref);
      if (isAgentRecorded(previous)) for (const prior of recordings.slice(0, index)) {
        if (meaning(prior) === meaning(previous)) replaced.add(prior.delivery_id);
      }
    });
    const current = recordings.filter(item => !replaced.has(item.delivery_id));
    if (recordings.length && (!current.length || new Set(current.map(meaning)).size !== 1
      || new Set(recordings.map(item => canonical([item.agent_recording.before_incoming_ref, item.agent_recording.before_incoming_event_ref]))).size !== 1)) {
      return conflict("The same reply has conflicting interpretations or following-user relations. Use an explicit same-reply recording correction.");
    }
    const mapping = current.find(item => item.agent_recording.capture_ref) || current[0];
    if (capture && mapping && !mapping.agent_recording.capture_ref) {
      return conflict("A recording correction cannot discard the authoritative capture associated with that reply.");
    }
    if (mapping?.agent_recording.capture_ref) capture = byId.get(mapping.agent_recording.capture_ref);
    const delivery = mapping || capture;
    const correspondence = capture ? deliveryCorrespondence(capture) : "agent_recorded";
    return { ...common, ...(capture ? { capture } : {}), status: "current", delivery,
      message_identity: deliveryIdentity(capture || delivery), correspondence,
      applicable: !!mapping || correspondence !== "different",
      ...(mapping ? { recording_ref: mapping.delivery_id,
        before_incoming_ref: mapping.agent_recording.before_incoming_ref,
        before_incoming_event_ref: mapping.agent_recording.before_incoming_event_ref } : {}),
      order: mapping ? "agent_attributed_incoming_order" : "attributed_conversation_order" };
  });
}
function resolveDeliveryReference(state, deliveryRef, payload = {}) {
  return actualReplyGroups(state, payload).find(group => group.observation_refs.includes(deliveryRef))
    || { status: "unverified", applicable: false, observation_refs: [] };
}
function selectLatestReply(state, groups) {
  if (!groups.length) return { status: "unverified", applicable: false, observation_refs: [] };
  const refs = groups.flatMap(group => group.observation_refs);
  const conflict = groups.find(group => group.status !== "current");
  if (conflict) return { ...conflict, observation_refs: refs };
  if (groups.length === 1) return { ...groups[0], order: "single_attributed_message" };
  const before = groups.map(() => new Set());
  let inconsistent = false;
  for (let left = 0; left < groups.length; left++) for (let right = left + 1; right < groups.length; right++) {
    const a = groups[left], b = groups[right], directions = [];
    const aSequence = recordedBeforeSequence(state, a.delivery), bSequence = recordedBeforeSequence(state, b.delivery);
    if (Number.isSafeInteger(aSequence) && Number.isSafeInteger(bSequence)) {
      if (aSequence === bSequence) inconsistent = true;
      else directions.push(aSequence < bSequence ? -1 : 1);
    }
    const ac = a.capture?.capture_message, bc = b.capture?.capture_message;
    if (ac && bc && ac.conversation_ref === bc.conversation_ref && Number.isSafeInteger(ac.ordinal) && Number.isSafeInteger(bc.ordinal)) {
      const nativePaths = [ac, bc].filter(item => item.order_sha256).map(item => item.order_path);
      const compatible = nativePaths.every(path => Array.isArray(path) && nativePaths.every(other => Array.isArray(other)
        && path.slice(0, Math.min(path.length, other.length)).every((ref, index) => ref === other[index])));
      if (!compatible || ac.ordinal === bc.ordinal) inconsistent = true;
      else directions.push(ac.ordinal < bc.ordinal ? -1 : 1);
    }
    if (new Set(directions).size > 1) inconsistent = true;
    else if (directions.length) before[directions[0] < 0 ? right : left].add(directions[0] < 0 ? left : right);
  }
  // A reply carrying both native order and a following-user relation can bridge
  // the two forms of evidence. Append order never supplies a missing relation.
  for (let bridge = 0; bridge < groups.length; bridge++) for (let later = 0; later < groups.length; later++) {
    if (before[later].has(bridge)) for (const earlier of before[bridge]) before[later].add(earlier);
  }
  const latest = before.map((earlier, index) => earlier.size === groups.length - 1 ? index : -1).filter(index => index >= 0);
  if (inconsistent || before.some((earlier, index) => earlier.has(index)) || latest.length !== 1) {
    return { status: "order_unknown", applicable: false, observation_refs: refs,
      reason: "Actual message order is unavailable or conflicting. Reconcile the relevant reply identities and conversational relations; observation append order does not establish emission order." };
  }
  return { ...groups[latest[0]], observation_refs: refs, order: "attributed_conversation_order" };
}
function latestActualDelivery(state, payload = {}) {
  return selectLatestReply(state, actualReplyGroups(state, payload));
}
function resolvedDelivery(state, exchangeRef, payload = {}) {
  return selectLatestReply(state, actualReplyGroups(state, payload).filter(group => group.exchange_refs.includes(exchangeRef)));
}
function deliveryMatches(value, state, payload = {}, { legacy = false } = {}) {
  if (!value) return false;
  const observations = [...(state?.deliveries || []), ...(payload.delivery ? [payload.delivery] : [])];
  const hasAgent = observations.some(item => item.exchange_ref === value.exchange_ref && isAgentRecorded(item));
  if (!hasAgent) {
    if (deliveryCorrespondence(value) === "different") return false;
    if (legacy) {
      const latest = observations.filter(item => item.exchange_ref === value.exchange_ref && Object.hasOwn(item, "observed_response_sha256")).at(-1);
      return !latest || deliveryCorrespondence(latest) !== "different";
    }
    const current = resolvedDelivery(state, value.exchange_ref, payload);
    return current.status === "unverified" || (current.status === "current" && current.applicable);
  }
  const actual = resolveDeliveryReference(state, value.delivery_id, payload), current = resolvedDelivery(state, value.exchange_ref, payload);
  return actual.status === "current" && actual.applicable && current.status === "current"
    && actual.message_identity === current.message_identity;
}
function effectiveExchange(state, exchange, payload = {}, deliveryRef) {
  if (!exchange) return exchange;
  const resolved = deliveryRef ? resolveDeliveryReference(state, deliveryRef, payload) : resolvedDelivery(state, exchange.exchange_id, payload);
  const delivery = resolved.status === "current" ? resolved.delivery : null;
  if (isAgentRecorded(delivery) && delivery.exchange_ref === exchange.exchange_id) {
    return { ...recordedExchange(exchange, delivery),
      ...(resolved.capture ? { reply_attribution: "capture_with_agent_interpretation", actual_capture_ref: resolved.capture.delivery_id } : {}),
      actual_observation_refs: resolved.observation_refs };
  }
  if (resolved.status !== "current" && [...(state?.deliveries || []), ...(payload.delivery ? [payload.delivery] : [])]
    .some(item => item.exchange_ref === exchange.exchange_id && isAgentRecorded(item))) {
    return { ...exchange, reply_attribution: "prepared_draft", response_sha256_role: "prepared_response_link",
      actual_reply_status: resolved.status, actual_recording_refs: resolved.observation_refs };
  }
  return exchange;
}
function validateDelivery(value, context, state) {
  object(value, "delivery", ["delivery_id", "exchange_ref", "observation", "source_ref", "response_sha256"], ["observed_at", "observed_response_sha256", "capture_source_ref", "response_span", "capture_protocol", "capture_message", "response_equivalence", "agent_recording"]);
  id(value.delivery_id, "delivery.delivery_id");
  context.reference(value.exchange_ref, "delivery.exchange_ref", "exchange");
  enumeration(value.observation, ["assistant_emission", "host_confirmed", "agent_recorded"], "delivery.observation");
  text(value.source_ref, "delivery.source_ref");
  if (Object.hasOwn(value, "observed_at")) text(value.observed_at, "delivery.observed_at");
  const exchange = list(state, "exchanges").find(entry => entry.exchange_id === value.exchange_ref);
  if (!exchange) fail("UNKNOWN_REFERENCE", "Delivery requires an already committed exchange.");
  if (value.response_sha256 !== exchange.response_sha256) fail("DELIVERY_MISMATCH", "Delivery hash must identify the prepared response.");
  if (value.observation === "agent_recorded" || Object.hasOwn(value, "agent_recording") || value.capture_protocol === "agent-recorded-reply-v1") {
    if (!isAgentRecorded(value)) fail("INVALID_INPUT", "Agent recordings require agent_recorded attribution and agent-recorded-reply-v1.");
    for (const key of ["observed_response_sha256", "capture_source_ref", "capture_message", "response_span", "response_equivalence"]) {
      if (Object.hasOwn(value, key)) fail("INVALID_INPUT", "An agent recording does not claim retained exact message bytes or native host evidence.");
    }
    validateRecording(value.agent_recording, context, state, exchange, value);
    return;
  }
  if (Object.hasOwn(value, "observed_response_sha256")) {
    if (!/^[a-f0-9]{64}$/.test(value.observed_response_sha256)) fail("INVALID_INPUT", "Observed message hash must be a SHA-256 hash.");
    text(value.capture_source_ref, "delivery.capture_source_ref");
  } else if (Object.hasOwn(value, "capture_source_ref")) fail("INVALID_INPUT", "A captured message requires its observed hash.");
  if (Object.hasOwn(value, "capture_protocol")) enumeration(value.capture_protocol, ["captured-delivery-v2"], "delivery.capture_protocol");
  if (Object.hasOwn(value, "capture_message")) {
    object(value.capture_message, "delivery.capture_message", ["conversation_ref", "message_ref"], ["ordinal", "order_sha256", "order_path"]);
    text(value.capture_message.conversation_ref, "delivery.capture_message.conversation_ref");
    text(value.capture_message.message_ref, "delivery.capture_message.message_ref");
    if (!value.observed_response_sha256) fail("INVALID_INPUT", "Message identity requires retained captured bytes.");
    if (Object.hasOwn(value.capture_message, "ordinal") && (!Number.isSafeInteger(value.capture_message.ordinal) || value.capture_message.ordinal < 1)) fail("INVALID_INPUT", "Message ordinal must be a positive host conversation position.");
    if (Object.hasOwn(value.capture_message, "order_sha256") && (!value.capture_message.ordinal || !/^[a-f0-9]{64}$/.test(value.capture_message.order_sha256)
      || !/^claude-code:[^/]+\/[^#]+#record-sha256=[a-f0-9]{64}$/.test(value.capture_source_ref || ""))) fail("INVALID_INPUT", "Native order evidence requires a structured captured host record, its SHA-256 and message ordinal.");
    if (Object.hasOwn(value.capture_message, "order_path")) {
      strings(value.capture_message.order_path, "delivery.capture_message.order_path", true);
      if (!value.capture_message.order_sha256 || value.capture_message.order_path.length !== value.capture_message.ordinal
        || value.capture_message.order_path.at(-1) !== value.capture_message.message_ref || new Set(value.capture_message.order_path).size !== value.capture_message.order_path.length) fail("INVALID_INPUT", "A native order path must be a distinct retained prefix ending at the selected message.");
    } else if (value.capture_message.order_sha256) fail("INVALID_INPUT", "Native order evidence requires its retained conversation prefix path.");
  }
  if (Object.hasOwn(value, "response_equivalence")) {
    enumeration(value.response_equivalence, ["lf-crlf-v1"], "delivery.response_equivalence");
    if (!value.observed_response_sha256 || value.observed_response_sha256 === value.response_sha256 || value.response_span) fail("INVALID_INPUT", "Line-ending equivalence requires distinct raw hashes and no recovered wrapper span.");
  }
  if (Object.hasOwn(value, "response_span")) {
    const span = value.response_span;
    object(span, "delivery.response_span", ["start_byte", "end_byte"], ["wrapper_review"]);
    if (!value.observed_response_sha256 || value.observed_response_sha256 === value.response_sha256
      || !Number.isSafeInteger(span.start_byte) || span.start_byte < 0
      || !Number.isSafeInteger(span.end_byte) || span.end_byte <= span.start_byte) {
      fail("INVALID_INPUT", "A recovered response span requires a different captured message and valid byte boundaries.");
    }
    if (Object.hasOwn(span, "wrapper_review")) {
      text(span.wrapper_review, "delivery.response_span.wrapper_review");
      if (!span.wrapper_review.trim()) fail("INVALID_INPUT", "A wrapper review must explain why the surrounding text leaves the reply applicable.");
    }
  }
}
function validateInterpretation(value, context, state, payload) {
  object(value, "interpretation", ["interpretation_id", "turn_id", "incoming_refs", "components", "basis_refs", "next_action"], ["action_decisions", "focus_scope_ref", "delivery_binding"]);
  if (Object.hasOwn(value, "delivery_binding")) enumeration(value.delivery_binding, ["message-bound-delivery-v2"], "interpretation.delivery_binding");
  id(value.interpretation_id, "interpretation.interpretation_id");
  id(value.turn_id, "interpretation.turn_id");
  context.contributionRefs(value.incoming_refs, "interpretation.incoming_refs", true);
  context.references(value.basis_refs, "interpretation.basis_refs");
  array(value.components, "interpretation.components", (component, label) => {
    object(component, label, ["kind", "meaning", "established", "unresolved"], ["exchange_ref", "question_ref", "option_id", "delivery_ref", "user_question_ref", "answer_timing"]);
    enumeration(component.kind, ["question", "answer", "selection", "correction", "information", "instruction", "clarification", "delegation", "unknown"], label + ".kind");
    text(component.meaning, label + ".meaning");
    strings(component.established, label + ".established");
    strings(component.unresolved, label + ".unresolved");
    if (component.kind === "question") {
      context.reference(component.user_question_ref, label + ".user_question_ref", "question");
      if (questionRecord(component.user_question_ref, state, payload)?.origin !== "user") fail("INVALID_INPUT", "An incoming user question requires a user-origin question record.");
      enumeration(component.answer_timing, ["before_work", "after_work", "clarify_first"], label + ".answer_timing");
    } else if (Object.hasOwn(component, "user_question_ref") || Object.hasOwn(component, "answer_timing")) {
      fail("INVALID_INPUT", "Only user-question components carry user_question_ref and answer_timing.");
    }
    for (const key of ["exchange_ref", "question_ref", "option_id", "delivery_ref"]) if (Object.hasOwn(component, key)) id(component[key], label + "." + key);
    if (component.kind === "selection" && !component.option_id) fail("INVALID_INPUT", "A selection component requires its option_id.");
    if ((component.question_ref || component.option_id || component.delivery_ref) && !component.exchange_ref) fail("INVALID_INPUT", "A reply referent requires its exchange_ref.");
    const prepared = component.exchange_ref && list(state, "exchanges").find(entry => entry.exchange_id === component.exchange_ref);
    const delivery = component.delivery_ref && (payload.delivery?.delivery_id === component.delivery_ref ? payload.delivery
      : list(state, "deliveries").find(entry => entry.delivery_id === component.delivery_ref));
    const control = component.delivery_ref && require("./authorizations.cjs").isExistingActionControl(state, value, component, payload);
    const exchange = control ? prepared : effectiveExchange(state, prepared, payload, component.delivery_ref);
    if (component.exchange_ref && !exchange) fail("UNKNOWN_REFERENCE", "Incoming reply requires an already committed exchange.");
    if (component.question_ref && !exchange.question_refs.includes(component.question_ref)) fail("UNKNOWN_REFERENCE", "The question was not included in the referenced exchange.");
    if (component.option_id && !exchange.options.some(entry => entry.option_id === component.option_id)) fail("UNKNOWN_REFERENCE", "The option was not included in the referenced exchange.");
    if ((component.question_ref || component.option_id) && !component.delivery_ref) fail("UNOBSERVED_EXCHANGE", "Question and option binding require an observed delivery reference.");
    if (component.delivery_ref) {
      if (!delivery || delivery.exchange_ref !== component.exchange_ref) fail("UNKNOWN_REFERENCE", "The observation must identify the referenced exchange.");
      if (!control && !deliveryMatches(delivery, state, payload, { legacy: value.delivery_binding !== "message-bound-delivery-v2" })) fail("UNOBSERVED_EXCHANGE", "The actual reply requires delivery reconciliation before binding questions or options. Preserve the complete incoming message through memory_updated with source_excerpt and complete_message, then interpret that same source without changing its answer or selection meaning.");
      const actual = !control && resolveDeliveryReference(state, component.delivery_ref, payload).delivery;
      if (isAgentRecorded(actual)) {
        const anchor = recordedBeforeSequence(state, actual);
        const following = value.incoming_refs.some(ref => primarySourceSequence(state, ref, payload) >= anchor);
        if (!following) fail("EARLY_AUTHORIZATION", "An incoming reply must follow the actual agent-recorded offer's retained conversational relation.");
      }
    }
  }, true);
  distinct(userQuestions(value).map(question => question.question_ref), "interpretation user questions");
  object(value.next_action, "interpretation.next_action", ["kind", "scope", "reason"], ["assignment", "adjustment_reason", "clarification_needed", "scope_ref", "authorization_ref"]);
  enumeration(value.next_action.kind, ["lead_only", "specialist"], "interpretation.next_action.kind");
  text(value.next_action.scope, "interpretation.next_action.scope");
  text(value.next_action.reason, "interpretation.next_action.reason");
  if (value.next_action.kind === "specialist") validateAssignment(value.next_action.assignment, "interpretation.next_action.assignment", context);
  else if (Object.hasOwn(value.next_action, "assignment")) fail("INVALID_INPUT", "Lead-only work has no specialist assignment.");
  if (Object.hasOwn(value.next_action, "adjustment_reason")) text(value.next_action.adjustment_reason, "interpretation.next_action.adjustment_reason");
  if (Object.hasOwn(value.next_action, "clarification_needed")) text(value.next_action.clarification_needed, "interpretation.next_action.clarification_needed");
  if (value.next_action.kind === "specialist" && (value.next_action.clarification_needed
    || userQuestions(value).some(question => question.answer_timing !== "after_work"))) {
    fail("USER_QUESTION_BLOCKS_WORK", "Prerequisite questions or necessary clarification require a lead-only response before specialist work.");
  }
  for (const component of value.components.filter(entry => entry.option_id)) {
    if (require("./authorizations.cjs").active(state) && value.action_decisions?.some(decision => decision.exchange_ref === component.exchange_ref && decision.option_id === component.option_id && decision.disposition !== "accept")) continue;
    const prepared = list(state, "exchanges").find(entry => entry.exchange_id === component.exchange_ref);
    const control = require("./authorizations.cjs").isExistingActionControl(state, value, component, payload);
    const exchange = control ? prepared : effectiveExchange(state, prepared, payload, component.delivery_ref);
    const option = exchange.options.find(entry => entry.option_id === component.option_id);
    const changedWork = option.assignment
      ? value.next_action.kind !== "specialist" || canonical(value.next_action.assignment) !== canonical(option.assignment)
      : value.next_action.kind === "specialist";
    if (changedWork && !value.next_action.adjustment_reason) {
      fail("ASSIGNMENT_MISMATCH", "Specialist work outside the selected offer's assignment requires an explicit adjustment_reason.");
    }
  }
  if (payload.exchange && value.next_action.kind !== "lead_only") fail("INVALID_INPUT", "An inline interpretation can only select lead-only work.");
  require("./authorizations.cjs").validateDecisions(state, value, context, payload);
}
function validateInterpretationWrite(state, payload, events = []) {
  const value = payload.interpretation;
  if (!value) return;
  if (value.next_action.kind === "specialist" && value.next_action.authorization_ref
    && require("./model.cjs").pendingPrimarySources(state, value.incoming_refs).length) fail("DIRECTION_PENDING", "Another retained user message awaits interpretation; reconcile it before selecting protected work.");
  for (const component of value.components || []) {
    if (!component.delivery_ref || require("./authorizations.cjs").isExistingActionControl(state, value, component, payload)) continue;
    const delivery = payload.delivery?.delivery_id === component.delivery_ref ? payload.delivery
      : list(state, "deliveries").find(item => item.delivery_id === component.delivery_ref);
    if (!delivery || !deliveryMatches(delivery, state, payload)) fail("UNOBSERVED_EXCHANGE", "Reconcile the applicable actual message. Save the full source through memory_updated first if binding fails, then interpret that same source with its original meaning.");
  }
  validateIncomingChronology(state, payload, events);
}
function interpretationFor(state, payload, interpretationId) {
  return payload.interpretation?.interpretation_id === interpretationId ? payload.interpretation : list(state, "interpretations").find(entry => entry.interpretation_id === interpretationId);
}
// New writes only. Historical exchanges and question closures keep their original
// meaning on replay. A review can answer an uncertainty carried into work.
function validateResolutionWrite(state, payload, interpretation) {
  const questions = new Map(state.questions.map(question => [question.question_id, question]));
  for (const question of payload.changes?.questions || []) questions.set(question.question_id, question);
  for (const request of payload.exchange?.response.questions || []) {
    if (questions.get(request.question_ref)?.status !== "open") {
      fail("CLOSED_QUESTION_REQUEST", "An outgoing information request requires an open question: " + request.question_ref + ". Reopen it with the current reason and remaining uncertainty, or record a distinct new question.");
    }
  }
  for (const component of interpretation?.components || []) {
    if (!component.question_ref) continue;
    const question = questions.get(component.question_ref);
    if (!question || question.origin === "user") continue;
    const changed = (payload.changes?.questions || []).some(item => item.question_id === question.question_id);
    if (!payload.interpretation && !changed) continue;
    if (!question.resolution) fail("MISSING_QUESTION_RESOLUTION", "Reconcile the supported answer and remaining part of " + question.question_id + " before closing the reply.");
    const before = state.questions.find(item => item.question_id === question.question_id);
    const newSources = question.resolution.answer_refs.filter(ref => !before?.resolution?.answer_refs.includes(ref));
    const findings = newSources.some(ref => ref === payload.review?.review_id
      || state.history_index[ref]?.kind === "review"
      || [...state.evidence, ...(payload.changes?.evidence || [])].some(source => source.evidence_id === ref && source.kind !== "user_statement"));
    if (question.status === "answered" && component.unresolved.length
      && (payload.interpretation || !findings) && !payload.corrects_refs?.includes(question.question_id)) {
      fail("QUESTION_RESOLUTION_CONFLICT", "The interpreted reply leaves part of " + question.question_id + " unresolved; it cannot simultaneously close that question as answered.");
    }
  }
}
function validateReviewInterpretation(review, context, state, payload) {
  const protectedReview = require("./authorizations.cjs").active(state) && (review.assignment.specialist_id === "report_writer" || (review.assignment.specialist_id === "design_worker" && review.assignment.operation === "execution"));
  if (!review.interpretation_ref) {
    if (state.state_meta.protocol || payload.protocol || protectedReview) fail("MISSING_INTERPRETATION", "A review requires its prospectively recorded interpretation_ref.");
    return;
  }
  context.reference(review.interpretation_ref, "review.interpretation_ref", "interpretation");
  const interpretation = list(state, "interpretations").find(entry => entry.interpretation_id === review.interpretation_ref);
  if (!interpretation || interpretation.next_action.kind !== "specialist") fail("MISSING_INTERPRETATION", "Specialist work requires an already committed specialist interpretation.");
  if (canonical(interpretation.next_action.assignment) !== canonical(review.assignment)) fail("ASSIGNMENT_MISMATCH", "The review must match its prospectively selected assignment.");
  const turn = list(state, "turns").find(entry => entry.interpretation_ref === review.interpretation_ref);
  if (turn?.exchange_ref) fail("TURN_CLOSED", "This turn has already closed; record a new interpretation before new specialist work.");
  if (turn?.work_refs.some(ref => state.history_index[ref]?.kind === "review")) fail("DUPLICATE_REVIEW", "One interpretation can complete at most one substantive specialist review.");
  if (protectedReview) {
    const kind = review.assignment.specialist_id === "report_writer" ? "report" : "analysis";
    const run = state.runs.find(record => record.interpretation_ref === review.interpretation_ref && record.kind === kind && record.status !== "in_progress" && record.authorization_binding?.authorization_ref === interpretation.next_action.authorization_ref);
    if (!run) fail("UNACCOUNTED_PROTECTED_WORK", "An execution/reporting review must reconcile its finished authorized run, including a failed attempt when applicable.");
  }
}
function validateExchange(value, context, state, payload) {
  object(value, "exchange", ["exchange_id", "turn_id", "interpretation_ref", "basis_refs", "completed_work_refs", "reconciliation", "response", "renderer"], ["supersedes", "reconciles"]);
  id(value.exchange_id, "exchange.exchange_id");
  id(value.turn_id, "exchange.turn_id");
  context.reference(value.interpretation_ref, "exchange.interpretation_ref", "interpretation");
  const interpretation = interpretationFor(state, payload, value.interpretation_ref);
  if (!interpretation || interpretation.turn_id !== value.turn_id) fail("UNKNOWN_REFERENCE", "Exchange and interpretation must identify the same turn.");
  context.references(value.basis_refs, "exchange.basis_refs");
  context.references(value.completed_work_refs, "exchange.completed_work_refs");
  for (const ref of value.completed_work_refs) {
    const kind = ref === payload.review?.review_id ? "review" : state.history_index[ref]?.kind;
    if (!["review", "run"].includes(kind)) fail("UNKNOWN_REFERENCE", "completed_work_refs accepts reviews and runs.");
    if (kind === "run" && context.runStatus(ref) === "in_progress") fail("INCOMPLETE_RUN", "An in-progress run is not completed work.");
  }
  const closing = [value.interpretation_ref];
  if (Object.hasOwn(value, "reconciles")) {
    context.references(value.reconciles, "exchange.reconciles", "interpretation");
    if (value.reconciles.includes(value.interpretation_ref)) fail("INVALID_INPUT", "reconciles lists other interpretations only.");
    closing.push(...value.reconciles);
  }
  for (const interpretationId of closing) {
    const turn = list(state, "turns").find(entry => entry.interpretation_ref === interpretationId);
    const work = [...(turn?.work_refs || [])];
    if (payload.review?.interpretation_ref === interpretationId) work.push(payload.review.review_id);
    for (const ref of work) if (context.runStatus(ref) !== "in_progress" && !value.completed_work_refs.includes(ref)) {
      fail("UNRECONCILED_WORK", "Closeout must account for recorded work: " + ref);
    }
  }
  if (Object.hasOwn(value, "supersedes")) {
    context.reference(value.supersedes, "exchange.supersedes", "exchange");
    const prior = list(state, "exchanges").find(entry => entry.exchange_id === value.supersedes);
    if (!prior || prior.turn_id !== value.turn_id) fail("UNKNOWN_REFERENCE", "Exchange revisions must refer to a committed exchange of this turn.");
  } else if (list(state, "exchanges").some(entry => entry.turn_id === value.turn_id)) fail("MISSING_SUPERSESSION", "A revised outgoing exchange requires its supersedes reference.");
  enumeration(value.renderer, RENDERERS, "exchange.renderer");
  object(value.reconciliation, "exchange.reconciliation", ["changes", "limitations", "unresolved", "next_direction"]);
  for (const key of ["changes", "limitations", "unresolved"]) strings(value.reconciliation[key], "exchange.reconciliation." + key);
  text(value.reconciliation.next_direction, "exchange.reconciliation.next_direction");
  const response = value.response;
  const conversational = CONVERSATIONAL_RENDERERS.includes(value.renderer);
  object(response, "exchange.response", [...(conversational ? [] : ["status"]), "questions", "next_steps"],
    [...(conversational ? ["status"] : []), "questions_none", "next_steps_none", "user_questions", "findings",
      ...(FOUR_SECTION_RENDERERS.includes(value.renderer) ? ["explanations"] : [])]);
  if (Object.hasOwn(response, "explanations")) {
    array(response.explanations, "exchange.response.explanations", (explanation, label) => {
      object(explanation, label, ["text", "basis_refs"]);
      text(explanation.text, label + ".text");
      context.references(explanation.basis_refs, label + ".basis_refs");
    });
  }
  if (response.findings) {
    if (!LOOP_RENDERERS.includes(value.renderer) || !require("./authorizations.cjs").active(state)) fail("UNSUPPORTED_PROTOCOL", "Structured findings require the consultation loop and a supported loop renderer.");
    object(response.findings, "exchange.response.findings", ["work_refs", "summary", "diagnostics", "limitations"]);
    context.references(response.findings.work_refs, "exchange.response.findings.work_refs", undefined, true);
    text(response.findings.summary, "exchange.response.findings.summary");
    strings(response.findings.diagnostics, "exchange.response.findings.diagnostics");
    strings(response.findings.limitations, "exchange.response.findings.limitations");
    for (const ref of response.findings.work_refs) {
      const kind = state.history_index[ref]?.kind || (payload.review?.review_id === ref ? "review" : null);
      if (!["review", "run", "evidence"].includes(kind) || (kind === "run" && context.runStatus(ref) !== "completed")) fail("INVALID_FINDINGS", "Presented findings require completed work.");
      if (kind === "evidence" && state.evidence.find(record => record.evidence_id === ref)?.kind !== "computed") fail("INVALID_FINDINGS", "Evidence findings require computed evidence; source-only findings belong to an actual review.");
    }
  }
  if (Object.hasOwn(response, "status")) text(response.status, "exchange.response.status");
  if (Object.hasOwn(response, "user_questions")) {
    if (!ANSWER_RENDERERS.includes(value.renderer)) fail("INVALID_INPUT", "User-question answers require a renderer that displays the saved answers.");
    array(response.user_questions, "exchange.response.user_questions", (answer, label) => {
      object(answer, label, ["question_ref", "text", "answer", "status", "basis_refs"],
        [...(conversational ? ["echo_question"] : []), ...(VISIBLE_SCOPE_ANSWER_RENDERERS.includes(value.renderer) ? ["scope_ref"] : [])]);
      if (Object.hasOwn(answer, "echo_question") && typeof answer.echo_question !== "boolean") fail("INVALID_INPUT", label + ".echo_question must be a boolean.");
      context.reference(answer.question_ref, label + ".question_ref", "question");
      const question = questionRecord(answer.question_ref, state, payload);
      if (question?.origin !== "user") fail("INVALID_INPUT", "Your Questions answers require user-origin question records.");
      for (const key of ["text", "answer"]) text(answer[key], label + "." + key);
      enumeration(answer.status, ["answered", "pending", "withdrawn"], label + ".status");
      if (question.status !== { answered: "answered", pending: "open", withdrawn: "retired" }[answer.status]) {
        fail("INVALID_INPUT", "The answer disposition must match the saved user question status.");
      }
      context.references(answer.basis_refs, label + ".basis_refs");
      if (Object.hasOwn(answer, "scope_ref")) {
        context.reference(answer.scope_ref, label + ".scope_ref", "action_scope");
        if (answer.status !== "answered" || !Array.isArray(response.next_steps) || !response.next_steps.some(option => option?.scope_ref === answer.scope_ref)) {
          fail("SCOPE_MISMATCH", "A complete scope answer must answer the user's question and bind a protected option in this same exchange.");
        }
        // The retained question and incoming quotation make the detail request
        // inspectable. The lead assesses its meaning, as for other long answers.
        const sources = [...state.evidence, ...(payload.changes?.evidence || [])];
        const requested = closing.some(ref => {
          const intake = interpretationFor(state, payload, ref);
          return userQuestions(intake).some(item => item.question_ref === answer.question_ref)
            && (question.basis_refs || []).some(sourceRef => intake.incoming_refs.includes(sourceRef)
              && sources.some(source => source.evidence_id === sourceRef && source.kind === "user_statement"
                && typeof source.source_excerpt === "string" && source.source_excerpt.trim()));
        });
        if (!requested) fail("MISSING_USER_SOURCE", "A complete scope answer requires the closing user's question and its retained incoming request in that question's basis_refs.");
      }
    });
    distinct(response.user_questions.map(answer => answer.question_ref), "exchange.response.user_questions");
    distinct(response.user_questions.filter(answer => answer.scope_ref).map(answer => answer.scope_ref), "exchange.response scope answers");
  }
  const covered = new Set((response.user_questions || []).map(answer => answer.question_ref));
  for (const interpretationId of closing) {
    for (const question of userQuestions(interpretationFor(state, payload, interpretationId))) {
      if (!covered.has(question.question_ref)) fail("UNANSWERED_USER_QUESTION", "Closeout must answer or explicitly retain the pending user question: " + question.question_ref);
    }
  }
  array(response.questions, "exchange.response.questions", (question, label) => {
    object(question, label, ["question_ref", "text", ...(conversational ? [] : ["why", "needed"])], conversational ? ["why", "needed"] : []);
    context.reference(question.question_ref, label + ".question_ref", "question");
    if (questionRecord(question.question_ref, state, payload)?.origin === "user") fail("INVALID_INPUT", "The consultant's information requests must not reuse a user-question record.");
    for (const key of ["text", "why", "needed"]) if (Object.hasOwn(question, key)) text(question[key], label + "." + key);
  });
  distinct(response.questions.map(entry => entry.question_ref), "exchange.response.questions");
  array(response.next_steps, "exchange.response.next_steps", (option, label) => {
    object(option, label, ["option_id", "kind", "label", "actor", "scope", "basis_refs"], ["assignment", "scope_ref", "proposal", "execution_plan", "scope_file"]);
    id(option.option_id, label + ".option_id");
    enumeration(option.kind, ["action", "discussion"], label + ".kind");
    for (const key of ["label", "actor", "scope"]) text(option[key], label + "." + key);
    if (/[\r\n]/.test(option.label)) fail("INVALID_INPUT", "A numbered option label must fit on one line.");
    context.references(option.basis_refs, label + ".basis_refs");
    if (Object.hasOwn(option, "assignment")) {
      if (option.kind !== "action" || option.actor !== "consultant") fail("INVALID_INPUT", "Only consultant actions carry specialist assignments.");
      validateAssignment(option.assignment, label + ".assignment", context);
    }
    if (option.scope_ref || option.proposal || option.execution_plan) {
      if (!LOOP_RENDERERS.includes(value.renderer)) fail("UNSUPPORTED_PROTOCOL", "Protected proposals require a supported loop renderer.");
      if (COMPACT_RENDERERS.includes(value.renderer)) {
        text(option.scope_file, label + ".scope_file");
        if (/[\r\n<>]/.test(option.scope_file) || !/^(?:[A-Za-z]:\/|\/)/.test(option.scope_file) || !option.scope_file.endsWith("/" + scopePath(option.scope_ref))) fail("INVALID_INPUT", "A compact offer needs its saved absolute scope-file locator.");
      }
      context.reference(option.scope_ref, label + ".scope_ref", "action_scope");
      require("./authorizations.cjs").validateOffer(state, option, response, payload);
    } else if (require("./authorizations.cjs").active(state) && (option.assignment?.specialist_id === "report_writer" || (option.assignment?.specialist_id === "design_worker" && option.assignment.operation === "execution"))) {
      fail("MISSING_SCOPE", "A protected action offer requires its concrete current scope and reporting requires findings discussion.");
    }
    if (Object.hasOwn(option, "scope_file") && (!COMPACT_RENDERERS.includes(value.renderer) || !option.scope_ref)) fail("INVALID_INPUT", "Only a compact protected offer has a scope-file locator.");
  });
  distinct(response.next_steps.map(entry => entry.option_id), "exchange.response.next_steps");
  for (const key of ["questions", "next_steps"]) {
    if ((!response[key].length && !COMPACT_RENDERERS.includes(value.renderer)) || Object.hasOwn(response, key + "_none")) text(response[key + "_none"], "exchange.response." + key + "_none");
    if (response[key].length && Object.hasOwn(response, key + "_none")) fail("INVALID_INPUT", key + "_none is only allowed for an empty section.");
  }
  if (conversational && !response.status && !response.user_questions?.length && !response.explanations?.length && !response.findings
    && !response.questions.length && !response.next_steps.length) fail("INVALID_INPUT", "A response requires visible answer, explanation, findings, status, question or next-step content.");
  if (require("./authorizations.cjs").active(state)) {
    for (const run of state.runs.filter(record => record.kind === "analysis" && record.status === "completed" && record.authorization_binding && closing.includes(record.interpretation_ref))) {
      if (!require("./authorizations.cjs").findingsCoverRun(state, response.findings, run, payload)) fail("FINDINGS_DISCUSSION_REQUIRED", "Closing completed analysis must present its findings, diagnostics and limitations before returning the next decision to the user.");
    }
  }
}
function renderExchange(exchange) {
  if (!RENDERERS.includes(exchange.renderer)) fail("UNSUPPORTED_PROTOCOL", "Unknown exchange renderer.");
  if (exchange.renderer === RENDERER) return require("./response-layout.cjs").renderV11Exchange(exchange);
  if (exchange.renderer === "lead-markdown-v10") return require("./response-layout.cjs").renderV10Exchange(exchange);
  if (exchange.renderer === "lead-markdown-v9") return require("./response-layout.cjs").renderV9Exchange(exchange);
  if (exchange.renderer === "lead-markdown-v8") return renderSectionedExchange(exchange);
  if (exchange.renderer === "lead-markdown-v7") return renderFlatExchange(exchange);
  if (exchange.renderer === "lead-markdown-v6") return renderConversationalExchange(exchange);
  if (exchange.renderer === "lead-markdown-v5") return renderFocusedExchange(exchange);
  const { response } = exchange;
  const continuation = value => value.replace(/\r\n?|\n/g, "\n   ");
  const questions = response.questions.length ? response.questions.map((question, index) =>
    `${index + 1}. ${continuation(question.text)}\n   Why this matters: ${continuation(question.why)}\n   Helpful information: ${continuation(question.needed)}`).join("\n\n") : response.questions_none;
  const steps = response.next_steps.length ? response.next_steps.map((option, index) => {
    let rendered = `${index + 1}. ${option.label}\n   ${continuation(option.actor + ": " + option.scope)}`;
    if (exchange.renderer === "lead-markdown-v4" && option.proposal) {
      // Journal serialization sorts object keys. Use explicit/stable field order
      // and canonical nested values so a fresh read reproduces the exact receipt.
      for (const key of ["target", "population", "evidence", "approach", "checks", "outputs", "claim_boundary"]) {
        const entry = option.proposal[key];
        rendered += `\n   ${key.replace(/_/g, " ")}: ${continuation(Array.isArray(entry) ? (entry.join("; ") || "None required.") : entry)}`;
      }
      for (const key of Object.keys(option.execution_plan).sort()) {
        if (["inputs", "kind", "claim_boundary", "target", "population", "diagnostics", "design_id", "additional_design_ids", "evidence_refs"].includes(key)) continue;
        const entry = option.execution_plan[key];
        if (key === "estimator" && entry === option.proposal.approach) continue;
        const display = typeof entry === "string" ? entry : (Array.isArray(entry) && !entry.length ? "None" : canonical(entry));
        rendered += `\n   ${key.replace(/_/g, " ")}: ${continuation(display)}`;
      }
    }
    return rendered;
  }).join("\n\n") : response.next_steps_none;
  // Renderer identity owns whitespace because delivered responses bind its exact hash.
  const afterLabel = exchange.renderer === "lead-markdown-v1" ? "\n" : "\n\n";
  if (!["lead-markdown-v3", "lead-markdown-v4"].includes(exchange.renderer)) {
    return `[Status]${afterLabel}${response.status}\n\n[Questions]${afterLabel}${questions}\n\n[Next Steps]${afterLabel}${steps}`;
  }
  const answers = (response.user_questions || []).map((entry, index) =>
    `${index + 1}. ${continuation(entry.text)}\n   ${continuation(entry.answer)}`).join("\n\n");
  const findings = response.findings ? `\n\nFindings: ${response.findings.summary}\n\nDiagnostics: ${response.findings.diagnostics.join("; ") || "No additional diagnostics for this work."}\n\nLimitations: ${response.findings.limitations.join("; ") || "No additional limitations recorded."}` : "";
  return (answers ? `[Your Questions]\n\n${answers}\n\n` : "")
    + `[Status]\n\n${response.status}${findings}\n\n[I want to know]\n\n${questions}\n\n[Decide Next Steps]\n\n${steps}`;
}
function scopePath(scopeId) { id(scopeId, "scope_ref"); return "scopes/" + scopeId + "/scope.json"; }
// Section and item labels come from the saved fields and their array order.
// Each item is flat prose; qualifiers and scope links stay with the item they govern.
function renderSectionedExchange({ response }) {
  const sections = [];
  const paragraphs = values => values.filter(Boolean).join("\n\n");
  const prose = values => values.filter(Boolean).map(value => /[.!?]$/.test(value.trimEnd()) ? value : value + ".").join(" ");
  function section(label, items) {
    if (items.length) sections.push(`[${label}]\n\n` + items.map((item, index) => `[${index + 1}] ${item}`).join("\n\n"));
  }
  section("Answers to your questions", (response.user_questions || []).map(entry =>
    paragraphs([entry.echo_question ? entry.text : "", entry.answer])));
  const work = response.status ? [response.status] : [];
  if (response.findings) {
    work.push(paragraphs([response.findings.summary,
      response.findings.diagnostics.length ? "Checks: " + response.findings.diagnostics.join("; ") : "",
      response.findings.limitations.length ? "Limits: " + response.findings.limitations.join("; ") : ""]));
  }
  section("What has been done", work);
  section("Questions for you", response.questions.map(question =>
    paragraphs([question.text, question.why, question.needed])));
  section("Next steps", response.next_steps.map(option => {
    const blocks = [option.label, option.actor === "consultant" ? option.scope : option.actor + ": " + option.scope];
    if (option.proposal) {
      const proposal = option.proposal;
      blocks.push(prose([proposal.target, proposal.population, proposal.claim_boundary, proposal.approach,
        "Evidence: " + proposal.evidence, proposal.checks.length ? "Checks: " + proposal.checks.join("; ") : "",
        "Output: " + proposal.outputs]));
      blocks.push(`[Full saved scope](<${option.scope_file}>)`);
    }
    return paragraphs(blocks);
  }));
  return sections.join("\n\n");
}
// Historical v6 bytes are immutable, including option indentation.
function renderConversationalExchange({ response }) {
  const parts = (response.user_questions || []).map(entry => entry.echo_question ? `${entry.text}\n\n${entry.answer}` : entry.answer);
  if (response.status) parts.push(response.status);
  if (response.findings) {
    parts.push(response.findings.summary);
    if (response.findings.diagnostics.length) parts.push("Checks: " + response.findings.diagnostics.join("; "));
    if (response.findings.limitations.length) parts.push("Limits: " + response.findings.limitations.join("; "));
  }
  for (const question of response.questions) {
    parts.push([question.text, question.why, question.needed].filter(Boolean).join("\n\n"));
  }
  // Scope fields remain verbatim; punctuation only separates authored fragments.
  // Explicit paragraphs survive Markdown soft-break handling. Indent by the
  // actual marker width so multi-digit option numbers keep the same hierarchy.
  const prose = values => values.filter(Boolean).map(value => /[.!?]$/.test(value.trimEnd()) ? value : value + ".").join(" ");
  if (response.next_steps.length) parts.push(response.next_steps.map((option, index) => {
    const marker = `${index + 1}. `, indent = " ".repeat(marker.length);
    const blocks = [option.actor === "consultant" ? option.scope : option.actor + ": " + option.scope];
    if (option.proposal) {
      const proposal = option.proposal;
      blocks.push(prose([proposal.target, proposal.population, proposal.claim_boundary]));
      blocks.push(prose([proposal.approach, "Evidence: " + proposal.evidence]));
      blocks.push(prose([proposal.checks.length ? "Checks: " + proposal.checks.join("; ") : "", "Output: " + proposal.outputs]));
      blocks.push(`[Full saved scope](<${option.scope_file}>)`);
    }
    return marker + option.label + "\n\n" + blocks.join("\n\n").replace(/\r\n?|\n/g, "\n" + indent).replace(/^/, indent);
  }).join("\n\n"));
  return parts.join("\n\n");
}
function renderFlatExchange(exchange) {
  const { response } = exchange;
  const body = renderConversationalExchange({ response: { ...response, next_steps: [] } });
  const prose = values => values.filter(Boolean).map(value => /[.!?]$/.test(value.trimEnd()) ? value : value + ".").join(" ");
  const options = response.next_steps.map((option, index) => {
    const blocks = [option.actor === "consultant" ? option.scope : option.actor + ": " + option.scope];
    if (option.proposal) {
      const proposal = option.proposal;
      blocks.push(prose([proposal.target, proposal.population, proposal.claim_boundary, proposal.approach,
        "Evidence: " + proposal.evidence, proposal.checks.length ? "Checks: " + proposal.checks.join("; ") : "",
        "Output: " + proposal.outputs]));
      blocks.push(`[Full saved scope](<${option.scope_file}>)`);
    }
    return `Option ${index + 1}: ${option.label}\n\n` + blocks.join("\n\n");
  }).join("\n\n");
  return [body, options].filter(Boolean).join("\n\n");
}
// Historical v5 bytes are immutable, including its original field labels.
function renderFocusedExchange({ response }) {
  const continuation = value => value.replace(/\r\n?|\n/g, "\n   ");
  const parts = (response.user_questions || []).map(entry => `${entry.text}\n\n${entry.answer}`);
  parts.push(response.status);
  if (response.findings) {
    parts.push(response.findings.summary);
    if (response.findings.diagnostics.length) parts.push("Checks: " + response.findings.diagnostics.join("; "));
    if (response.findings.limitations.length) parts.push("Limits: " + response.findings.limitations.join("; "));
  }
  for (const question of response.questions) {
    parts.push(`${question.text}\n\n${question.why} Helpful information: ${question.needed}`);
  }
  if (response.next_steps.length) parts.push(response.next_steps.map((option, index) => {
    let rendered = `${index + 1}. ${option.label}\n   ${continuation(option.actor + ": " + option.scope)}`;
    if (option.proposal) {
      for (const key of ["target", "population", "evidence", "approach", "checks", "outputs", "claim_boundary"]) {
        const entry = option.proposal[key];
        if (Array.isArray(entry) && !entry.length) continue;
        rendered += `\n   ${key.replace(/_/g, " ")}: ${continuation(Array.isArray(entry) ? entry.join("; ") : entry)}`;
      }
      rendered += `\n   [Full saved scope](<${option.scope_file}>)`;
    }
    return rendered;
  }).join("\n\n"));
  return parts.join("\n\n");
}
// Live-write check only. Historical journals retain their original semantics.
// Evidence is replaced in journal order so a later capture repair cannot rewrite
// which primary message batch an older interpretation actually saw.
function validateIncomingGroups(state, payload, events) {
  if (!payload.interpretation) return;
  const evidence = new Map();
  const groups = [];
  const primary = interpretation => (interpretation?.incoming_refs || [])
    .filter(ref => typeof evidence.get(ref)?.complete_message === "boolean");
  for (const event of events) {
    for (const record of event.payload.changes?.evidence || []) evidence.set(record.evidence_id, record);
    const refs = primary(event.payload.interpretation);
    if (refs.length) groups.push(refs);
  }
  // Include the effective state for callers that supply a saved projection as
  // well as the event history, then apply this event's proposed source changes.
  for (const record of state.evidence) evidence.set(record.evidence_id, record);
  for (const record of payload.changes?.evidence || []) evidence.set(record.evidence_id, record);
  const refs = primary(payload.interpretation);
  if (!refs.length) return;
  for (const group of groups) if (refs.some(ref => group.includes(ref))
    && (refs.length !== group.length || refs.some((ref, index) => ref !== group[index]))) {
    fail("INCOMING_GROUP_CONFLICT", "Reuse the same ordered primary incoming_refs for a saved message batch. Partial overlaps or reordered batches would change its intake identity; new user messages need new evidence IDs.");
  }
}

function exchangeReceipt(event) {
  if (!event.payload.exchange) return {};
  const response = renderExchange(event.payload.exchange);
  return { exchange_id: event.payload.exchange.exchange_id, renderer: event.payload.exchange.renderer,
    rendered_response: response, response_sha256: sha256(response),
    ...(FOUR_SECTION_RENDERERS.includes(event.payload.exchange.renderer)
      ? { response_items: require("./response-layout.cjs").responseItems(event.payload.exchange) } : {}) };
}

module.exports = { PROTOCOL, RENDERER, RENDERERS, FOUR_SECTION_RENDERERS, VISIBLE_SCOPE_ANSWER_RENDERERS, COMPACT_RENDERERS, scopePath, renderExchange, exchangeReceipt, validateDelivery, deliveryMatches, deliveryCorrespondence,
  validateInterpretation, validateExchange, validateReviewInterpretation, validateResolutionWrite, validateIncomingGroups, userQuestions,
  resolvedDelivery, resolveDeliveryReference, actualReplyGroups, latestActualDelivery, deliveryIdentity, validateInterpretationWrite, isAgentRecorded, recordedItems, recordedExchange, effectiveExchange,
  recordedBeforeSequence, primarySourceSequence };
