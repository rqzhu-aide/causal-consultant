"use strict";

const { emptyState, applyEvent } = require("../../scripts/lib/model.cjs");
const { canonical, sha256 } = require("../../scripts/lib/files.cjs");
const { PROTOCOL } = require("../../scripts/lib/exchanges.cjs");
const TIME = "2026-09-09T15:00:00.000Z";
const ASSIGNMENT = { specialist_id: "data_audit", operation: "review" };

function interpretation(suffix, specialist = false) {
  return { interpretation_id: "interpretation-" + suffix, turn_id: "turn-" + suffix, incoming_refs: ["user-request"],
    components: [{ kind: "instruction", meaning: "Inspect the available design evidence.", established: ["The user requests help."], unresolved: ["The allocation procedure is not verified."] }],
    basis_refs: ["user-request"], next_action: { kind: specialist ? "specialist" : "lead_only", scope: "Inspect allocation evidence.", reason: "Assignment determines the scope of causal inference.",
      ...(specialist ? { assignment: structuredClone(ASSIGNMENT) } : {}) } };
}
function exchange(suffix, interpretationId = "interpretation-" + suffix) {
  return { exchange_id: "exchange-" + suffix, turn_id: "turn-" + suffix, interpretation_ref: interpretationId,
    basis_refs: ["user-request"], completed_work_refs: [],
    reconciliation: { changes: [], limitations: ["Assignment remains unverified."], unresolved: ["Allocation procedure."], next_direction: "Obtain the allocation record." },
    renderer: "lead-markdown-v1", response: { status: "The allocation procedure remains unverified.",
      questions: [{ question_ref: "question-allocation", text: "Do you have the allocation record?", why: "It would clarify how treatment was assigned.", needed: "The record or an account of the allocation process." }],
      next_steps: [{ option_id: "inspect-record", kind: "action", label: "Inspect the allocation record", actor: "consultant", scope: "Check the supplied record and its limitations.", basis_refs: ["user-request"], assignment: structuredClone(ASSIGNMENT) },
        { option_id: "explain", kind: "discussion", label: "Explain why allocation matters", actor: "consultant", scope: "Explain assignment using the study context.", basis_refs: [] }] } };
}
function review(suffix) {
  return { review_id: "review-" + suffix, summary: "Allocation remains unverified.", assignment: structuredClone(ASSIGNMENT), question_addressed: "What allocation evidence is available?",
    selection_basis: { checkpoint_id: "checkpoint-intake", user_contribution_refs: ["user-request"] },
    interpretation_ref: "interpretation-" + suffix, work_performed: ["Inspected the source inventory."], findings: ["The allocation record is missing."], limitations: ["Missing evidence does not establish assignment."], evidence_refs: ["user-request"] };
}
function createFixture() {
  let state = emptyState("project-multiturn", TIME);
  const events = [];
  function append(type, payload, eventId = "event-" + (events.length + 1)) {
    const request = { event_id: eventId, expected_project_id: state.state_meta.project_id, expected_last_event_id: state.state_meta.last_event_id, type, payload };
    const fingerprint = { ...request };
    delete fingerprint.expected_last_event_id;
    const event = { schema_version: 7, project_id: state.state_meta.project_id, event_id: eventId, sequence: events.length + 1,
      previous_event_id: state.state_meta.last_event_id, timestamp: TIME, type, payload: structuredClone(payload), request_sha256: sha256(canonical(fingerprint)) };
    event.sha256 = sha256(canonical(event));
    state = applyEvent(state, event);
    events.push(event);
    return event;
  }
  append("init", { project_understanding: { objective: "Inspect allocation evidence." } });
  append("checkpoint", { checkpoint: { checkpoint_id: "checkpoint-intake", status: "awaiting_user", primary_uncertainty: "Allocation procedure", why_it_matters: "It determines the claim boundary." }, changes: {
    evidence: [{ evidence_id: "user-request", kind: "user_statement", source_ref: "conversation:user-message-1", source_excerpt: "Please help me understand the study.", summary: "The user requests study help." }],
    questions: [{ question_id: "question-allocation", statement: "Do you have the allocation record?", status: "open" }] } });
  return { get state() { return state; }, events, append,
    interpret(suffix, specialist = false) { return append("reply_interpreted", { protocol: PROTOCOL, interpretation: interpretation(suffix, specialist) }); },
    prepare(suffix, options = {}) { return append("exchange_prepared", { protocol: PROTOCOL, exchange: { ...exchange(suffix), ...options } }); } };
}

module.exports = { createFixture, interpretation, exchange, review, ASSIGNMENT, TIME };
