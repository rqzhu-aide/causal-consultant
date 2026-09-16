"use strict";

const { canonical, sha256, fail } = require("./files.cjs");
const { object, text, id, enumeration, array, strings, validateAssignment } = require("./model.cjs");

const PROTOCOL = "durable-exchanges-v1";
const RENDERER = "lead-markdown-v4";
const RENDERERS = ["lead-markdown-v1", "lead-markdown-v2", "lead-markdown-v3", RENDERER];
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
  if (!Object.hasOwn(value, "observed_response_sha256") || value.observed_response_sha256 === value.response_sha256) return "exact";
  return value.response_span ? "wrapped" : "different";
}
function deliveryMatches(value, state, payload = {}) {
  if (deliveryCorrespondence(value) === "different") return false;
  const latest = [...(state?.deliveries || []), ...(payload.delivery ? [payload.delivery] : [])]
    .filter(item => item.exchange_ref === value.exchange_ref && Object.hasOwn(item, "observed_response_sha256")).at(-1);
  return !latest || deliveryCorrespondence(latest) !== "different";
}
function validateDelivery(value, context, state) {
  object(value, "delivery", ["delivery_id", "exchange_ref", "observation", "source_ref", "response_sha256"], ["observed_at", "observed_response_sha256", "capture_source_ref", "response_span"]);
  id(value.delivery_id, "delivery.delivery_id");
  context.reference(value.exchange_ref, "delivery.exchange_ref", "exchange");
  enumeration(value.observation, ["assistant_emission", "host_confirmed"], "delivery.observation");
  text(value.source_ref, "delivery.source_ref");
  if (Object.hasOwn(value, "observed_at")) text(value.observed_at, "delivery.observed_at");
  const exchange = list(state, "exchanges").find(entry => entry.exchange_id === value.exchange_ref);
  if (!exchange) fail("UNKNOWN_REFERENCE", "Delivery requires an already committed exchange.");
  if (value.response_sha256 !== exchange.response_sha256) fail("DELIVERY_MISMATCH", "Delivery hash must identify the prepared response.");
  if (Object.hasOwn(value, "observed_response_sha256")) {
    if (!/^[a-f0-9]{64}$/.test(value.observed_response_sha256)) fail("INVALID_INPUT", "Observed message hash must be a SHA-256 hash.");
    text(value.capture_source_ref, "delivery.capture_source_ref");
  } else if (Object.hasOwn(value, "capture_source_ref")) fail("INVALID_INPUT", "A captured message requires its observed hash.");
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
  object(value, "interpretation", ["interpretation_id", "turn_id", "incoming_refs", "components", "basis_refs", "next_action"], ["action_decisions", "focus_scope_ref"]);
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
    const exchange = component.exchange_ref && list(state, "exchanges").find(entry => entry.exchange_id === component.exchange_ref);
    if (component.exchange_ref && !exchange) fail("UNKNOWN_REFERENCE", "Incoming reply requires an already committed exchange.");
    if (component.question_ref && !exchange.question_refs.includes(component.question_ref)) fail("UNKNOWN_REFERENCE", "The question was not included in the referenced exchange.");
    if (component.option_id && !exchange.options.some(entry => entry.option_id === component.option_id)) fail("UNKNOWN_REFERENCE", "The option was not included in the referenced exchange.");
    if ((component.question_ref || component.option_id) && !component.delivery_ref) fail("UNOBSERVED_EXCHANGE", "Question and option binding require an observed delivery reference.");
    if (component.delivery_ref) {
      const delivery = payload.delivery?.delivery_id === component.delivery_ref ? payload.delivery : list(state, "deliveries").find(entry => entry.delivery_id === component.delivery_ref);
      if (!delivery || delivery.exchange_ref !== component.exchange_ref) fail("UNKNOWN_REFERENCE", "The observation must identify the referenced exchange.");
      if (!deliveryMatches(delivery, state, payload)) fail("UNOBSERVED_EXCHANGE", "The captured message differs from the prepared exchange. Reconcile the actual reply before binding its questions or options.");
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
    const exchange = list(state, "exchanges").find(entry => entry.exchange_id === component.exchange_ref);
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
function interpretationFor(state, payload, interpretationId) {
  return payload.interpretation?.interpretation_id === interpretationId ? payload.interpretation : list(state, "interpretations").find(entry => entry.interpretation_id === interpretationId);
}
// New writes only. Historical interpretations and question closures keep their
// original meaning on replay. A review can answer an uncertainty carried into work.
function validateResolutionWrite(state, payload, interpretation) {
  const questions = new Map(state.questions.map(question => [question.question_id, question]));
  for (const question of payload.changes?.questions || []) questions.set(question.question_id, question);
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
  object(response, "exchange.response", ["status", "questions", "next_steps"], ["questions_none", "next_steps_none", "user_questions", "findings"]);
  if (response.findings) {
    if (value.renderer !== RENDERER || !require("./authorizations.cjs").active(state)) fail("UNSUPPORTED_PROTOCOL", "Structured findings require the consultation loop and lead-markdown-v4.");
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
  text(response.status, "exchange.response.status");
  if (Object.hasOwn(response, "user_questions")) {
    if (!["lead-markdown-v3", RENDERER].includes(value.renderer)) fail("INVALID_INPUT", "User-question answers require a renderer that displays the saved answers.");
    array(response.user_questions, "exchange.response.user_questions", (answer, label) => {
      object(answer, label, ["question_ref", "text", "answer", "status", "basis_refs"]);
      context.reference(answer.question_ref, label + ".question_ref", "question");
      const question = questionRecord(answer.question_ref, state, payload);
      if (question?.origin !== "user") fail("INVALID_INPUT", "Your Questions answers require user-origin question records.");
      for (const key of ["text", "answer"]) text(answer[key], label + "." + key);
      enumeration(answer.status, ["answered", "pending", "withdrawn"], label + ".status");
      if (question.status !== { answered: "answered", pending: "open", withdrawn: "retired" }[answer.status]) {
        fail("INVALID_INPUT", "The answer disposition must match the saved user question status.");
      }
      context.references(answer.basis_refs, label + ".basis_refs");
    });
    distinct(response.user_questions.map(answer => answer.question_ref), "exchange.response.user_questions");
  }
  const covered = new Set((response.user_questions || []).map(answer => answer.question_ref));
  for (const interpretationId of closing) {
    for (const question of userQuestions(interpretationFor(state, payload, interpretationId))) {
      if (!covered.has(question.question_ref)) fail("UNANSWERED_USER_QUESTION", "Closeout must answer or explicitly retain the pending user question: " + question.question_ref);
    }
  }
  array(response.questions, "exchange.response.questions", (question, label) => {
    object(question, label, ["question_ref", "text", "why", "needed"]);
    context.reference(question.question_ref, label + ".question_ref", "question");
    if (questionRecord(question.question_ref, state, payload)?.origin === "user") fail("INVALID_INPUT", "The consultant's information requests must not reuse a user-question record.");
    for (const key of ["text", "why", "needed"]) text(question[key], label + "." + key);
  });
  distinct(response.questions.map(entry => entry.question_ref), "exchange.response.questions");
  array(response.next_steps, "exchange.response.next_steps", (option, label) => {
    object(option, label, ["option_id", "kind", "label", "actor", "scope", "basis_refs"], ["assignment", "scope_ref", "proposal", "execution_plan"]);
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
      if (value.renderer !== RENDERER) fail("UNSUPPORTED_PROTOCOL", "Protected proposals require lead-markdown-v4.");
      context.reference(option.scope_ref, label + ".scope_ref", "action_scope");
      require("./authorizations.cjs").validateOffer(state, option, response, payload);
    } else if (require("./authorizations.cjs").active(state) && (option.assignment?.specialist_id === "report_writer" || (option.assignment?.specialist_id === "design_worker" && option.assignment.operation === "execution"))) {
      fail("MISSING_SCOPE", "A protected action offer requires its concrete current scope and reporting requires findings discussion.");
    }
  });
  distinct(response.next_steps.map(entry => entry.option_id), "exchange.response.next_steps");
  for (const key of ["questions", "next_steps"]) {
    if (!response[key].length || Object.hasOwn(response, key + "_none")) text(response[key + "_none"], "exchange.response." + key + "_none");
    if (response[key].length && Object.hasOwn(response, key + "_none")) fail("INVALID_INPUT", key + "_none is only allowed for an empty section.");
  }
  if (require("./authorizations.cjs").active(state)) {
    for (const run of state.runs.filter(record => record.kind === "analysis" && record.status === "completed" && record.authorization_binding && closing.includes(record.interpretation_ref))) {
      if (!require("./authorizations.cjs").findingsCoverRun(state, response.findings, run, payload)) fail("FINDINGS_DISCUSSION_REQUIRED", "Closing completed analysis must present its findings, diagnostics and limitations before returning the next decision to the user.");
    }
  }
}
function renderExchange(exchange) {
  if (!RENDERERS.includes(exchange.renderer)) fail("UNSUPPORTED_PROTOCOL", "Unknown exchange renderer.");
  const { response } = exchange;
  const continuation = value => value.replace(/\r\n?|\n/g, "\n   ");
  const questions = response.questions.length ? response.questions.map((question, index) =>
    `${index + 1}. ${continuation(question.text)}\n   Why this matters: ${continuation(question.why)}\n   Helpful information: ${continuation(question.needed)}`).join("\n\n") : response.questions_none;
  const steps = response.next_steps.length ? response.next_steps.map((option, index) => {
    let rendered = `${index + 1}. ${option.label}\n   ${continuation(option.actor + ": " + option.scope)}`;
    if (exchange.renderer === RENDERER && option.proposal) {
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
  if (!["lead-markdown-v3", RENDERER].includes(exchange.renderer)) {
    return `[Status]${afterLabel}${response.status}\n\n[Questions]${afterLabel}${questions}\n\n[Next Steps]${afterLabel}${steps}`;
  }
  const answers = (response.user_questions || []).map((entry, index) =>
    `${index + 1}. ${continuation(entry.text)}\n   ${continuation(entry.answer)}`).join("\n\n");
  const findings = response.findings ? `\n\nFindings: ${response.findings.summary}\n\nDiagnostics: ${response.findings.diagnostics.join("; ") || "No additional diagnostics for this work."}\n\nLimitations: ${response.findings.limitations.join("; ") || "No additional limitations recorded."}` : "";
  return (answers ? `[Your Questions]\n\n${answers}\n\n` : "")
    + `[Status]\n\n${response.status}${findings}\n\n[I want to know]\n\n${questions}\n\n[Decide Next Steps]\n\n${steps}`;
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
    rendered_response: response, response_sha256: sha256(response) };
}

module.exports = { PROTOCOL, RENDERER, renderExchange, exchangeReceipt, validateDelivery, deliveryMatches, deliveryCorrespondence,
  validateInterpretation, validateExchange, validateReviewInterpretation, validateResolutionWrite, validateIncomingGroups, userQuestions };
