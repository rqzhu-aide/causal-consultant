"use strict";

// A disposable reading of validated records. No filesystem access, transcript
// synthesis, permission decisions, or summarization of the previous brief.
const { collectionIds, journalBodies, questionMemoryLinks, deliveryState: recordedDeliveryState } = require("./views.cjs");
const { deliveryMatches } = require("./exchanges.cjs");
const { canonical } = require("./files.cjs");
const policy = require("./authorizations.cjs");
const list = (state, key) => state[key] || [];
const unique = values => [...new Set(values.filter(Boolean))];
const copy = value => structuredClone(value);
const retrieval = ref => ({ context: { focus_refs: [ref] }, history: { record_id: ref } });
function deliveryState(state, ref) {
  const recorded = recordedDeliveryState(state, ref);
  const captured = list(state, "deliveries").filter(record => record.exchange_ref === ref && Object.hasOwn(record, "observed_response_sha256"));
  const matching = captured.filter(record => deliveryMatches(record, state));
  const status = matching.some(record => record.observation === "host_confirmed") ? "host_confirmed"
    : matching.some(record => record.observation === "assistant_emission") ? "assistant_emission"
      : recorded.status !== "unobserved" ? "unverified" : "unobserved";
  return { ...recorded, status, ...(recorded.status !== status ? { recorded_status: recorded.status } : {}),
    capture_verification: captured.length ? "not_checked_by_brief" : "unavailable" };
}
const observed = value => ["assistant_emission", "host_confirmed"].includes(value.status);
const REF_FIELDS = ["basis_refs", "evidence_refs", "evidence_for", "evidence_against", "assumption_refs",
  "assumptions_added_or_revised", "route_changes", "related_unresolved_question_refs", "findings_refs"];
function dependencies(record) {
  return unique([...REF_FIELDS.flatMap(key => record[key] || []), ...(record.resolution?.answer_refs || []),
    ...(record.basis_versions || []).map(binding => binding.ref), record.evidence_ref,
    ...(record.execution_plan?.evidence_refs || []), ...(record.authorization_binding?.basis_versions || []).map(binding => binding.ref)]);
}
function buildCaseBrief({ state, events }) {
  const bodies = journalBodies(events), records = new Map(), reviews = new Map();
  const eventOrder = new Map(events.map((event, index) => [event.event_id, event.sequence ?? index + 1]));
  const revisions = new Map(), eventMembers = new Map();
  for (const [collection, id] of Object.entries(collectionIds(state))) {
    for (const record of list(state, collection)) records.set(record[id], { collection, record });
  }
  for (const event of events) {
    const members = [];
    for (const [collection, id] of Object.entries(collectionIds(state))) for (const record of event.payload?.changes?.[collection] || []) {
      members.push(record[id]);
      if (!revisions.has(record[id])) revisions.set(record[id], []);
      revisions.get(record[id]).push({ event_ref: event.event_id, record });
    }
    if (event.payload?.review) {
      const review = event.payload.review;
      reviews.set(review.review_id, { ...copy(review), event_ref: event.event_id });
      members.push(review.review_id);
    }
    if (event.payload?.run) members.push(event.payload.run.run_id);
    eventMembers.set(event.event_id, members);
  }
  for (const [ref, record] of reviews) records.set(ref, { collection: "specialist_reviews", record });
  const superseders = new Map();
  for (const [ref, { record }] of records) if (record.supersedes) {
    if (!superseders.has(record.supersedes)) superseders.set(record.supersedes, []);
    superseders.get(record.supersedes).push(ref);
  }
  const sectionCoverage = key => Object.hasOwn(state.case_brief || {}, key)
    ? { status: "initialized", selected_refs: copy(state.case_brief[key]) }
    : { status: "uninitialized", selected_refs: [], fallback: { command: "status" } };
  const coverage = { knowledge: sectionCoverage("knowledge_refs"), work: sectionCoverage("work_refs"), warnings: [],
    discovery: { history: { query: "literal words from the earlier fact, route or option", record_id: "exact record ID when known" },
      context: { focus_refs: ["record ID whose dependencies need expansion"] }, fallback: "status", meaning: "Use history query or a known record ID to locate exact wording, then focused context only for missing dependencies. Unselected history remains available. The brief is not execution permission." } };
  const notes = new Map();
  function warn(ref, code, message, related = [], lookupRef = ref) {
    const value = { record_ref: ref, code, message, ...(related.length ? { related_refs: unique(related) } : {}), retrieval: retrieval(lookupRef) };
    coverage.warnings.push(value);
    if (!notes.has(ref)) notes.set(ref, []);
    notes.get(ref).push(value);
  }
  const unfinished = [], work = new Set(coverage.work.selected_refs), included = new Set(coverage.knowledge.selected_refs);
  const addUnfinished = (kind, ref, reasons, related = []) => unfinished.push({ kind, record_ref: ref, reasons,
    ...(related.length ? { related_refs: unique(related) } : {}), retrieval: retrieval(ref) });
  const closing = ref => [...bodies.exchanges.values()].filter(exchange => exchange.interpretation_ref === ref || exchange.reconciles?.includes(ref));
  for (const turn of list(state, "turns")) {
    const reasons = [];
    if (!turn.exchange_ref) reasons.push("lead_closeout_pending");
    else {
      const delivery = deliveryState(state, turn.exchange_ref);
      if (!observed(delivery)) reasons.push(delivery.status === "unverified" || delivery.discrepancy_refs?.length ? "actual_response_requires_reconciliation" : "actual_response_unestablished");
    }
    if (reasons.length) {
      addUnfinished("turn", turn.turn_id, reasons, [turn.interpretation_ref, turn.exchange_ref, ...(turn.work_refs || [])]);
      for (const ref of turn.work_refs || []) work.add(ref);
    }
  }
  for (const run of state.runs) {
    const relatedReviews = [...reviews.values()].filter(review => run.interpretation_ref && review.interpretation_ref === run.interpretation_ref);
    const discussions = [...bodies.exchanges.values()].filter(exchange => policy.findingsCoverRun(state, exchange.response.findings, run));
    const reasons = [];
    if (run.status === "in_progress") reasons.push("work_incomplete");
    else if (run.status === "completed" && !relatedReviews.length && !discussions.length) reasons.push("scientific_review_pending");
    if (run.interpretation_ref && !closing(run.interpretation_ref).length && run.status !== "in_progress") reasons.push("lead_reconciliation_pending");
    if (run.status === "completed" && run.kind === "analysis" && !discussions.some(exchange => observed(deliveryState(state, exchange.exchange_id)))) reasons.push("results_discussion_unestablished");
    if (reasons.length) { work.add(run.run_id); addUnfinished("run", run.run_id, reasons, [run.interpretation_ref, ...discussions.map(exchange => exchange.exchange_id)]); }
  }
  for (const review of reviews.values()) if (review.interpretation_ref && !closing(review.interpretation_ref).length) {
    work.add(review.review_id); addUnfinished("review", review.review_id, ["lead_reply_pending"], [review.interpretation_ref]);
  }
  // A selected run includes its actual review once, not just a projection index.
  for (const ref of [...work]) {
    const run = state.runs.find(record => record.run_id === ref);
    if (run?.interpretation_ref) for (const review of reviews.values()) if (review.interpretation_ref === run.interpretation_ref) work.add(review.review_id);
  }
  const current = (name, status) => list(state, name).filter(record => record.status === status);
  for (const ref of work) included.add(ref);
  for (const [name, id, status] of [["user_context", "context_id", "current"], ["assumptions", "assumption_id", "active"],
    ["decisions", "decision_id", "current"], ["questions", "question_id", "open"]]) {
    for (const record of current(name, status)) included.add(record[id]);
  }
  // Candidate routes, including rejected ones, carry reasons and reopening terms.
  for (const route of state.candidate_routes) included.add(route.strategy_id);
  if (state.consultation) for (const ref of dependencies(state.consultation)) included.add(ref);
  const scopes = list(state, "action_scopes").filter(scope => {
    const decision = list(state, "action_decisions").filter(value => value.scope_ref === scope.scope_id).at(-1);
    return scope.scope_id === state.focus_scope_ref || state.runs.some(run => run.status === "in_progress" && run.authorization_binding?.scope_ref === scope.scope_id)
      || (!superseders.has(scope.scope_id) && !["decline", "withdraw"].includes(decision?.disposition)
        && !(decision && state.runs.some(run => run.authorization_binding?.authorization_ref === decision.decision_id)));
  });
  for (const scope of scopes) included.add(scope.scope_id);
  // Only scientific/control dependencies expand. Conversation links remain
  // locators; they must not cause old transcript or all old offers to expand.
  function expandConditions() {
    for (const ref of included) {
      const entry = records.get(ref);
      if (!entry) continue;
      for (const linked of dependencies(entry.record)) {
        const kind = records.get(linked)?.collection;
        if (["evidence", "assumptions", "questions", "result_conditions", "decisions", "candidate_routes"].includes(kind)) included.add(linked);
      }
      if (entry.collection === "evidence") for (const condition of list(state, "result_conditions")) if (condition.evidence_ref === ref) included.add(condition.condition_id);
      if (entry.collection === "runs") for (const evidence of state.evidence) if (evidence.run_id === ref && !superseders.has(evidence.evidence_id)) included.add(evidence.evidence_id);
    }
  }
  expandConditions();
  const findingsExchanges = new Set();
  for (const ref of included) {
    const latest = [...bodies.exchanges.values()].filter(exchange => exchange.response.findings?.work_refs.includes(ref)).at(-1);
    if (latest) findingsExchanges.add(latest.exchange_id);
  }
  // A displayed joint finding needs all of its cited work's qualifications.
  // Expand this selected block once; newly included work must not recursively
  // select unrelated later Lead blocks and rebuild the conversation history.
  for (const exchangeRef of findingsExchanges) for (const ref of bodies.exchanges.get(exchangeRef).response.findings.work_refs) {
    included.add(ref);
    if (["runs", "specialist_reviews"].includes(records.get(ref)?.collection)) work.add(ref);
    const run = state.runs.find(record => record.run_id === ref);
    if (run?.interpretation_ref) for (const review of reviews.values()) if (review.interpretation_ref === run.interpretation_ref) {
      work.add(review.review_id); included.add(review.review_id);
    }
  }
  expandConditions();
  // Retired questions stay retired, but unknown premises must accompany live
  // routes/claims even when their only connection points toward those records.
  for (const question of current("questions", "retired")) if ((question.basis_refs || []).some(ref => included.has(ref))) included.add(question.question_id);
  for (const ref of included) {
    const entry = records.get(ref);
    if (!entry) { warn(ref, "missing_record", "The selected record is unavailable; retrieve its history before relying on it."); continue; }
    if (superseders.has(ref)) warn(ref, "superseded_record", "This retained record has a replacement. Reconcile the selection before treating it as current uncontested knowledge.", superseders.get(ref));
    const { record, collection } = entry;
    if (collection === "questions") for (const answerRef of record.resolution?.answer_refs || []) {
      if (records.get(answerRef)?.collection === "specialist_reviews" && !work.has(answerRef)) {
        warn(ref, "answer_review_not_displayed", "Recorded answer support is outside this brief. Read history record_id=" + answerRef
          + " for the established answer and its limitations before relying on this question or asking for the answer again.", [answerRef], answerRef);
      }
    }
    if (collection === "specialist_reviews" && !reviews.has(ref)) warn(ref, "missing_review_body", "Only a review index is available. Full findings and limitations require the committed review event.");
    if (record.kind === "computed" && !list(state, "result_conditions").some(condition => condition.evidence_ref === ref && !superseders.has(condition.condition_id))) {
      warn(ref, "missing_result_conditions", "Computed evidence has no current linked target/condition record; its scientific conditions remain unreviewed.", [record.run_id]);
    }
    if (collection === "questions" && record.status === "retired") warn(ref, "retired_uncertainty", "Retired means no repeated request, not that the premise was established. Retain the recorded unknown and its consequences.");
    for (const event of events.filter(value => value.type === "correction")) {
      const corrected = unique(event.payload.corrects_refs.flatMap(value => eventMembers.get(value) || [value]));
      if (corrected.includes(ref) || dependencies(record).some(value => corrected.includes(value))) {
        warn(ref, "relevant_correction", event.payload.reason, [event.event_id, ...corrected]);
      }
    }
    if (["specialist_reviews", "runs", "result_conditions"].includes(collection)) {
      const savedAt = eventOrder.get(record.event_ref || state.history_index[ref]?.event_ref);
      for (const dependency of dependencies(record)) {
        if (superseders.has(dependency)) warn(ref, "superseded_premise", "A linked premise has a replacement. The saved finding has not thereby been reviewed against that replacement.", [dependency, ...superseders.get(dependency)]);
        const history = revisions.get(dependency) || [];
        const bound = record.authorization_binding?.basis_versions?.find(value => value.ref === dependency);
        const first = bound ? history.find(value => value.event_ref === bound.event_ref)
          : history.filter(value => eventOrder.get(value.event_ref) <= savedAt).at(-1);
        const last = history.at(-1);
        if (first && last && eventOrder.get(last.event_ref) > eventOrder.get(first.event_ref) && canonical(first.record) !== canonical(last.record)) {
          warn(ref, "premise_changed_after_work", "A linked premise changed after this work/claim was saved. Current records do not prove the old findings were re-reviewed.", [dependency, last.event_ref]);
        }
      }
    }
  }
  coverage.knowledge.included_refs = [...included].filter(ref => records.get(ref)?.collection === "evidence");
  coverage.work.included_refs = [...work];
  coverage.work.automatically_included_refs = [...work].filter(ref => !coverage.work.selected_refs.includes(ref));
  coverage.omitted = { evidence: state.evidence.length - coverage.knowledge.included_refs.length,
    work: state.runs.length + state.specialist_reviews.length - work.size };
  const lines = ["# Consulting case brief", "", "Format: case-brief-v1", "Project: " + state.state_meta.project_id,
    "Last event: " + (state.state_meta.last_event_id || "none"), "Sequence: " + state.state_meta.sequence, "",
    "Generated from journal records. Source attribution is not independent verification; this reading is not execution permission.",
    "Delivery statuses describe journal-attributed observations only. This pure brief does not verify capture files; inspect recent-intake capture status or expand the historical capture before binding a reply. Hash-only historical observations remain unverified.", ""];
  const rendered = new Set();
  function card(title, ref, value) {
    if (ref && rendered.has(ref)) return;
    if (ref) rendered.add(ref);
    lines.push("### " + title + (ref ? " (" + ref + ")" : ""), "");
    for (const key of Object.keys(value).sort()) {
      const item = value[key];
      if (item !== undefined) lines.push("- **" + key.replaceAll("_", " ") + ":** " + (typeof item === "string" ? item.replaceAll("\n", "\n  ") : canonical(item)));
    }
    for (const note of notes.get(ref) || []) lines.push("- **Attention:** " + note.message + (note.related_refs?.length ? " References: " + note.related_refs.join(", ") + "." : ""));
    if (ref) lines.push("- **Retrieve:** context focus_refs=[\"" + ref + "\"]; history record_id=" + ref + (state.history_index[ref]?.event_ref ? "; event_id=" + state.history_index[ref].event_ref : ""));
    lines.push("");
  }
  function recordCard(ref) {
    const entry = records.get(ref);
    if (!entry) { card("Unavailable record", ref, {}); return; }
    const value = copy(entry.record);
    // Full incoming messages are returned once by the conversation window.
    delete value.source_excerpt; delete value.complete_message;
    if (entry.collection === "evidence") value.attribution = { user_statement: "user account", file: "file evidence", literature: "literature source", computed: "computed finding" }[value.kind];
    if (entry.collection === "runs") {
      const scope = list(state, "action_scopes").find(item => item.scope_id === value.authorization_binding?.scope_ref);
      if (scope) value.recorded_scope = scope.public_scope;
      else value.target_coverage = "Run metadata has no explicit target/population. Retrieve its frozen plan before using a scientific claim.";
      value.findings_status = unfinished.find(item => item.kind === "run" && item.record_ref === ref)?.reasons || [];
    }
    card(entry.collection.replaceAll("_", " "), ref, value);
  }
  lines.push("## User and objective", "");
  card("Current project understanding", null, state.project_understanding);
  for (const record of current("user_context", "current")) recordCard(record.context_id);
  lines.push("## Study knowledge", "");
  if (coverage.knowledge.status === "uninitialized") lines.push("Knowledge selection is uninitialized. Use broad status/history to curate it from existing records; absence here is not absence of knowledge.", "");
  else if (!coverage.knowledge.selected_refs.length) lines.push("Knowledge selection is intentionally empty; live controls and their evidence remain visible.", "");
  for (const ref of included) if (["evidence", "assumptions", "result_conditions", "decisions"].includes(records.get(ref)?.collection)) recordCard(ref);
  lines.push("## Work and findings", "");
  if (coverage.work.status === "uninitialized") lines.push("Work selection is uninitialized. Use broad status/history before treating this inventory as the retained completed work.", "");
  for (const ref of work) recordCard(ref);
  // Lead findings are their saved exact content, with delivery separate. A
  // prepared closeout never establishes that its findings were presented.
  for (const exchange of bodies.exchanges.values()) {
    const findings = exchange.response.findings;
    if (!findings || !findingsExchanges.has(exchange.exchange_id)) continue;
    card("Lead findings", exchange.exchange_id, { ...findings, reconciliation: exchange.reconciliation,
      delivery: deliveryState(state, exchange.exchange_id), findings_basis_versions: list(state, "exchanges").find(value => value.exchange_id === exchange.exchange_id)?.findings_basis_versions });
  }
  lines.push("## Open consultation", "");
  if (state.consultation) card("Current checkpoint", state.consultation.checkpoint_id, state.consultation);
  const questionLinks = questionMemoryLinks(state, events, bodies);
  for (const question of state.questions) if (included.has(question.question_id)) {
    const continuity = questionLinks.get(question.question_id);
    const latestRef = continuity?.latest_exchange_ref || continuity?.unobserved_exchange_refs.at(-1);
    const request = bodies.exchanges.get(latestRef)?.response.questions.find(item => item.question_ref === question.question_id);
    card("Question", question.question_id, { ...copy(question), continuity,
      ...(request ? { latest_saved_request: { exchange_ref: latestRef, ...copy(request), delivery: deliveryState(state, latestRef) } } : {}) });
  }
  for (const route of state.candidate_routes) recordCard(route.strategy_id);
  const direction = list(state, "interpretations").at(-1);
  if (direction) card("Current incoming direction", direction.interpretation_id, { next_action: direction.next_action });
  for (const scope of scopes) {
    const permission = policy.eligibility(state, scope.scope_id);
    const decision = list(state, "action_decisions").filter(value => value.scope_ref === scope.scope_id).at(-1);
    const currentDirection = direction?.next_action.kind === "specialist" && direction.next_action.scope_ref === scope.scope_id
      && direction.next_action.authorization_ref === permission.authorization_ref;
    const offers = [...bodies.exchanges.values()].flatMap(exchange => exchange.response.next_steps.flatMap((option, index) => option.scope_ref === scope.scope_id
      ? [{ exchange_ref: exchange.exchange_id, option_id: option.option_id, option_number: index + 1, label: option.label, delivery: deliveryState(state, exchange.exchange_id) }] : []));
    card("Action scope", scope.scope_id, { action: scope.action, assignment: scope.assignment, public_scope: scope.public_scope,
      basis_versions: scope.basis_versions, findings_refs: scope.findings_refs, latest_decision: decision,
      permission, current_direction: currentDirection, direction_turn_closed: Boolean(list(state, "turns").find(turn => turn.interpretation_ref === direction?.interpretation_id)?.exchange_ref),
      offers, execution_plan: "Retrieve the exact scope record before protected work." });
  }
  if (unfinished.length) {
    lines.push("### Unfinished handoffs", "", "Each pending record retains its reasons and related IDs below. Retrieve with history record_id=<ID> or context focus_refs=[<ID>].", "");
    for (const item of unfinished) lines.push("- " + item.kind + " `" + item.record_ref + "`: " + item.reasons.join(", ")
      + (item.related_refs?.length ? "; related: " + item.related_refs.join(", ") : "") + ".");
    lines.push("");
  }
  lines.push("For exact older wording, use history query or record_id/event_id first; use context focus_refs to expand missing governing dependencies. Expand older terms before binding a context-dependent reply.", "");
  return { markdown: lines.join("\n"), unfinished, coverage };
}

module.exports = { buildCaseBrief };
