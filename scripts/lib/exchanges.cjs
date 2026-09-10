"use strict";

const { canonical, sha256, fail } = require("./files.cjs");
const { object, text, id, enumeration, array, strings, validateAssignment } = require("./model.cjs");

const PROTOCOL = "durable-exchanges-v1";
const RENDERER = "lead-markdown-v3";
const RENDERERS = ["lead-markdown-v1", "lead-markdown-v2", RENDERER];
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
function validateDelivery(value, context, state) {
  object(value, "delivery", ["delivery_id", "exchange_ref", "observation", "source_ref", "response_sha256"], ["observed_at"]);
  id(value.delivery_id, "delivery.delivery_id");
  context.reference(value.exchange_ref, "delivery.exchange_ref", "exchange");
  enumeration(value.observation, ["assistant_emission", "host_confirmed"], "delivery.observation");
  text(value.source_ref, "delivery.source_ref");
  if (Object.hasOwn(value, "observed_at")) text(value.observed_at, "delivery.observed_at");
  const exchange = list(state, "exchanges").find(entry => entry.exchange_id === value.exchange_ref);
  if (!exchange) fail("UNKNOWN_REFERENCE", "Delivery requires an already committed exchange.");
  if (value.response_sha256 !== exchange.response_sha256) fail("DELIVERY_MISMATCH", "Delivery hash must identify the prepared response.");
}
function validateInterpretation(value, context, state, payload) {
  object(value, "interpretation", ["interpretation_id", "turn_id", "incoming_refs", "components", "basis_refs", "next_action"]);
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
    }
  }, true);
  distinct(userQuestions(value).map(question => question.question_ref), "interpretation user questions");
  object(value.next_action, "interpretation.next_action", ["kind", "scope", "reason"], ["assignment", "adjustment_reason", "clarification_needed"]);
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
}
function interpretationFor(state, payload, interpretationId) {
  return payload.interpretation?.interpretation_id === interpretationId ? payload.interpretation : list(state, "interpretations").find(entry => entry.interpretation_id === interpretationId);
}
function validateReviewInterpretation(review, context, state, payload) {
  if (!review.interpretation_ref) {
    if (state.state_meta.protocol || payload.protocol) fail("MISSING_INTERPRETATION", "A review requires its prospectively recorded interpretation_ref.");
    return;
  }
  context.reference(review.interpretation_ref, "review.interpretation_ref", "interpretation");
  const interpretation = list(state, "interpretations").find(entry => entry.interpretation_id === review.interpretation_ref);
  if (!interpretation || interpretation.next_action.kind !== "specialist") fail("MISSING_INTERPRETATION", "Specialist work requires an already committed specialist interpretation.");
  if (canonical(interpretation.next_action.assignment) !== canonical(review.assignment)) fail("ASSIGNMENT_MISMATCH", "The review must match its prospectively selected assignment.");
  const turn = list(state, "turns").find(entry => entry.interpretation_ref === review.interpretation_ref);
  if (turn?.exchange_ref) fail("TURN_CLOSED", "This turn has already closed; record a new interpretation before new specialist work.");
  if (turn?.work_refs.some(ref => state.history_index[ref]?.kind === "review")) fail("DUPLICATE_REVIEW", "One interpretation can complete at most one substantive specialist review.");
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
  object(response, "exchange.response", ["status", "questions", "next_steps"], ["questions_none", "next_steps_none", "user_questions"]);
  text(response.status, "exchange.response.status");
  if (Object.hasOwn(response, "user_questions")) {
    if (value.renderer !== "lead-markdown-v3") fail("INVALID_INPUT", "User-question answers require lead-markdown-v3 so the saved answers are rendered.");
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
    object(option, label, ["option_id", "kind", "label", "actor", "scope", "basis_refs"], ["assignment"]);
    id(option.option_id, label + ".option_id");
    enumeration(option.kind, ["action", "discussion"], label + ".kind");
    for (const key of ["label", "actor", "scope"]) text(option[key], label + "." + key);
    if (/[\r\n]/.test(option.label)) fail("INVALID_INPUT", "A numbered option label must fit on one line.");
    context.references(option.basis_refs, label + ".basis_refs");
    if (Object.hasOwn(option, "assignment")) {
      if (option.kind !== "action" || option.actor !== "consultant") fail("INVALID_INPUT", "Only consultant actions carry specialist assignments.");
      validateAssignment(option.assignment, label + ".assignment", context);
    }
  });
  distinct(response.next_steps.map(entry => entry.option_id), "exchange.response.next_steps");
  for (const key of ["questions", "next_steps"]) {
    if (!response[key].length || Object.hasOwn(response, key + "_none")) text(response[key + "_none"], "exchange.response." + key + "_none");
    if (response[key].length && Object.hasOwn(response, key + "_none")) fail("INVALID_INPUT", key + "_none is only allowed for an empty section.");
  }
}
function renderExchange(exchange) {
  if (!RENDERERS.includes(exchange.renderer)) fail("UNSUPPORTED_PROTOCOL", "Unknown exchange renderer.");
  const { response } = exchange;
  const continuation = value => value.replace(/\r\n?|\n/g, "\n   ");
  const questions = response.questions.length ? response.questions.map((question, index) =>
    `${index + 1}. ${continuation(question.text)}\n   Why this matters: ${continuation(question.why)}\n   Helpful information: ${continuation(question.needed)}`).join("\n\n") : response.questions_none;
  const steps = response.next_steps.length ? response.next_steps.map((option, index) =>
    `${index + 1}. ${option.label}\n   ${continuation(option.actor + ": " + option.scope)}`).join("\n\n") : response.next_steps_none;
  // Renderer identity owns whitespace because delivered responses bind its exact hash.
  const afterLabel = exchange.renderer === "lead-markdown-v1" ? "\n" : "\n\n";
  if (exchange.renderer !== "lead-markdown-v3") {
    return `[Status]${afterLabel}${response.status}\n\n[Questions]${afterLabel}${questions}\n\n[Next Steps]${afterLabel}${steps}`;
  }
  const answers = (response.user_questions || []).map((entry, index) =>
    `${index + 1}. ${continuation(entry.text)}\n   ${continuation(entry.answer)}`).join("\n\n");
  return (answers ? `[Your Questions]\n\n${answers}\n\n` : "")
    + `[Status]\n\n${response.status}\n\n[I want to know]\n\n${questions}\n\n[Decide Next Steps]\n\n${steps}`;
}
function exchangeReceipt(event) {
  if (!event.payload.exchange) return {};
  const response = renderExchange(event.payload.exchange);
  return { exchange_id: event.payload.exchange.exchange_id, renderer: event.payload.exchange.renderer,
    rendered_response: response, response_sha256: sha256(response) };
}

module.exports = { PROTOCOL, RENDERER, renderExchange, exchangeReceipt, validateDelivery,
  validateInterpretation, validateExchange, validateReviewInterpretation, userQuestions };
