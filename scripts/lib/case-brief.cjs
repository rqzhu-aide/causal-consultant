"use strict";

// A disposable reading of validated records. No filesystem access, transcript
// synthesis, permission decisions, or summarization of the previous brief.
const { collectionIds, journalBodies, questionMemoryLinks, questionCommunicationGaps, buildOperationalSummary, deliveryState: recordedDeliveryState } = require("./views.cjs");
const { isAgentRecorded, resolvedDelivery, resolveDeliveryReference, recordedItems } = require("./exchanges.cjs");
const { canonical } = require("./files.cjs");
const policy = require("./authorizations.cjs");
const list = (state, key) => state[key] || [];
const unique = values => [...new Set(values.filter(Boolean))];
const copy = value => structuredClone(value);
const fields = (record, names) => Object.fromEntries(names.filter(key => Object.hasOwn(record, key)).map(key => [key, copy(record[key])]));
const recordRequest = ref => ({ mode: "record", records: [{ record_ref: ref }] });
const retrieval = ref => ({ context: recordRequest(ref) });
const recordRead = ref => "context --input containing " + JSON.stringify(recordRequest(ref));
function deliveryState(state, ref) {
  const recorded = recordedDeliveryState(state, ref);
  const resolution = resolvedDelivery(state, ref);
  const actual = resolution.capture || resolution.delivery;
  const established = actual && (actual.observed_response_sha256 || isAgentRecorded(actual));
  const status = established ? recorded.status : recorded.status !== "unobserved" ? "unverified" : "unobserved";
  return { ...recorded, status, ...(recorded.status !== status ? { recorded_status: recorded.status } : {}),
    capture_verification: isAgentRecorded(actual) ? "not_applicable_agent_record" : actual?.observed_response_sha256 ? "not_checked_by_brief" : "unavailable" };
}
const observed = value => ["assistant_emission", "host_confirmed", "agent_recorded"].includes(value.status);
const REF_FIELDS = ["basis_refs", "evidence_refs", "evidence_for", "evidence_against", "assumption_refs",
  "user_contribution_refs", "assumptions_added_or_revised", "route_changes", "related_unresolved_question_refs", "findings_refs"];
function dependencies(record) {
  return unique([...REF_FIELDS.flatMap(key => record[key] || []), ...(record.resolution?.answer_refs || []),
    ...(record.basis_versions || []).map(binding => binding.ref), record.evidence_ref,
    ...(record.assignment?.strategy_ids || []), ...(record.strategy_ids_it_could_change || []),
    ...(record.execution_plan?.evidence_refs || []), ...(record.authorization_binding?.basis_versions || []).map(binding => binding.ref), record.last_review_id]);
}
function buildCaseBrief(loaded, options = {}) {
  const { state, events } = loaded;
  const attribution = delivery => {
    const resolution = delivery && resolveDeliveryReference(state, delivery.delivery_id);
    return resolution?.capture ? { evidence_kind: "native_capture", capture_ref: resolution.capture.delivery_id,
      recording_ref: delivery.delivery_id }
      : { evidence_kind: "agent_attributed_record" };
  };
  const bodies = journalBodies(events, state), records = new Map(), reviews = new Map();
  const questionLinks = questionMemoryLinks(state, events, bodies);
  const routeRuns = require("./route-runs.cjs").routeRunLinks(loaded);
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
      if (!revisions.has(review.review_id)) revisions.set(review.review_id, []);
      revisions.get(review.review_id).push({ event_ref: event.event_id, record: review });
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
    discovery: { context: recordRequest("known record ID"), history: { query: "literal words from the earlier fact, route or option" },
      dependencies: { focus_refs: ["record ID whose dependencies need expansion"] }, fallback: "status", meaning: "Use exact record context for known IDs; use history --query to discover an ID or history --event-id for a whole event. Use focused context only for missing dependencies. Unselected history remains available. The brief is not execution permission." } };
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
  for (const gap of questionCommunicationGaps(questionLinks)) {
    unfinished.push(gap);
    included.add(gap.record_ref);
  }
  for (const [ref, memory] of questionLinks) if (memory.communication?.answer_applicability === "earlier_question_definition") included.add(ref);
  const pending = require("./model.cjs").pendingPrimarySources(state);
  for (const source of pending) {
    work.add(source.evidence_ref);
    addUnfinished("incoming_message", source.evidence_ref, ["awaiting_interpretation"]);
  }
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
  // Completed narrative follows explicit curation or unfinished work, never
  // incidental dependency expansion. The full-history control scans above
  // remain independent of this display selection.
  const narrativeRoots = new Set([...coverage.knowledge.selected_refs, ...work]);
  const current = (name, status) => list(state, name).filter(record => record.status === status);
  for (const ref of work) included.add(ref);
  for (const [name, id, status] of [["user_context", "context_id", "current"], ["assumptions", "assumption_id", "active"],
    ["decisions", "decision_id", "current"], ["questions", "question_id", "open"]]) {
    for (const record of current(name, status)) included.add(record[id]);
  }
  // A dismissed route retains its disposition below without pulling its old
  // evidence into current knowledge. A live dependency can still bring it back.
  for (const route of state.candidate_routes) if (route.status !== "not_relevant") included.add(route.strategy_id);
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
  function expandConditions(selection = included, includeWork = false) {
    for (const ref of selection) {
      const entry = records.get(ref);
      if (!entry) continue;
      for (const linked of dependencies(entry.record)) {
        const kind = records.get(linked)?.collection;
        if (["evidence", "assumptions", "questions", "result_conditions", "decisions", "candidate_routes"].includes(kind)
          || (includeWork && ["runs", "specialist_reviews"].includes(kind))) selection.add(linked);
      }
      if (entry.collection === "evidence") for (const condition of list(state, "result_conditions")) if (condition.evidence_ref === ref) selection.add(condition.condition_id);
      if (entry.collection === "runs") for (const evidence of state.evidence) if (evidence.run_id === ref && !superseders.has(evidence.evidence_id)) selection.add(evidence.evidence_id);
    }
  }
  expandConditions();
  // Detail follows current use, not age. Paused accepted scopes and old open
  // questions retain their governing conditions even outside the recent window.
  const detailed = new Set(current("questions", "open").map(question => question.question_id));
  for (const scope of scopes) if (!state.runs.some(run => run.authorization_binding?.scope_ref === scope.scope_id && run.status !== "in_progress")) detailed.add(scope.scope_id);
  for (const pending of unfinished) for (const ref of [pending.record_ref, ...(pending.related_refs || [])]) detailed.add(ref);
  expandConditions(detailed, true);
  for (const ref of detailed) if (records.has(ref)) {
    included.add(ref);
    if (["runs", "specialist_reviews"].includes(records.get(ref).collection)) work.add(ref);
  }
  expandConditions();
  const findingsExchanges = new Set();
  for (const ref of narrativeRoots) {
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
  // A mixed historical message can remain useful after one supported answer
  // changes. Show that question's current resolution before its old source;
  // infer no contradiction or whole-message supersession from source wording.
  const revisedAnswers = [];
  const retainedBeforeAnswerExpansion = new Set(included);
  for (const question of state.questions) {
    if (!question.resolution) continue;
    const formerSources = unique((revisions.get(question.question_id) || [])
      .flatMap(version => version.record.resolution?.answer_refs || []))
      .filter(ref => retainedBeforeAnswerExpansion.has(ref) && records.get(ref)?.record.kind === "user_statement"
        && !question.resolution.answer_refs.includes(ref));
    if (!formerSources.length) continue;
    revisedAnswers.push(question);
    included.add(question.question_id);
    for (const ref of formerSources) warn(ref, "answer_support_replaced",
      "This historical account is no longer in the current answer support for: " + question.statement
        + " Use that question's current resolution and cited sources. Other parts of this source retain their separate status.",
      [question.question_id, ...question.resolution.answer_refs], question.question_id);
  }
  expandConditions();
  // Retired questions stay retired, but unknown premises must accompany live
  // routes/claims even when their only connection points toward those records.
  for (const question of current("questions", "retired")) if ((question.basis_refs || []).some(ref => included.has(ref))) included.add(question.question_id);
  for (const ref of included) {
    const entry = records.get(ref);
    if (!entry) { warn(ref, "missing_record", "The selected record is unavailable; use its exact lookup before relying on it, then history to investigate an unresolved identity."); continue; }
    if (superseders.has(ref)) warn(ref, "superseded_record", "This retained record has a replacement. Reconcile the selection before treating it as current uncontested knowledge.", superseders.get(ref));
    const { record, collection } = entry;
    if (collection === "questions") for (const answerRef of record.resolution?.answer_refs || []) {
      if (records.get(answerRef)?.collection === "specialist_reviews" && !work.has(answerRef)) {
        warn(ref, "answer_review_not_displayed", "Recorded answer support is outside this brief. Read " + recordRead(answerRef)
          + " for the established answer and its limitations before relying on this question or asking for the answer again.", [answerRef], answerRef);
      }
    }
    if (collection === "specialist_reviews" && !reviews.has(ref)) warn(ref, "missing_review_body", "Only a review index is available. Full findings and limitations require the committed review event.");
    if (record.kind === "computed" && !list(state, "result_conditions").some(condition => condition.evidence_ref === ref && !superseders.has(condition.condition_id))) {
      warn(ref, "missing_result_conditions", "No current linked result-condition record. Establish appropriate conditions when using this record for a scientific claim; administrative artifacts need no invented causal target.", [record.run_id]);
    }
    if (collection === "questions" && record.status === "retired") warn(ref, "retired_uncertainty", "Retired means no repeated request, not that the premise was established. Retain the recorded unknown and its consequences.");
    for (const event of events.filter(value => value.type === "correction")) {
      const corrected = unique(event.payload.corrects_refs.flatMap(value => eventMembers.get(value) || [value]));
      if (corrected.includes(ref) || dependencies(record).some(value => corrected.includes(value))) {
        warn(ref, "relevant_correction", event.payload.reason, [event.event_id, ...corrected]);
      }
    }
    const currentAssessment = (collection === "assumptions" && record.status === "active")
      || (collection === "decisions" && record.status === "current")
      || (collection === "candidate_routes" && record.status !== "not_relevant");
    if (["specialist_reviews", "runs", "result_conditions"].includes(collection) || currentAssessment) {
      const savedAt = eventOrder.get(record.event_ref || state.history_index[ref]?.event_ref);
      const supporting = new Set(dependencies(record));
      // Follow only explicit source links of the assessment's then-current
      // support. Review route_changes describe consequences, not its premises.
      if (currentAssessment) for (const dependency of supporting) {
        const version = (revisions.get(dependency) || []).filter(value => eventOrder.get(value.event_ref) <= savedAt).at(-1);
        const source = version?.record;
        const kind = records.get(dependency)?.collection;
        if (["specialist_reviews", "assumptions", "decisions"].includes(kind)) {
          for (const linked of [...(source?.basis_refs || []), ...(source?.user_contribution_refs || []),
            ...(source?.evidence_refs || []), ...(source?.assumptions_added_or_revised || [])]) supporting.add(linked);
        }
      }
      for (const dependency of supporting) {
        if (superseders.has(dependency)) warn(ref, "superseded_premise", currentAssessment
          ? "A supporting record has a replacement; this current assessment may need review. Its scientific status has not been changed."
          : "A linked premise has a replacement. The saved finding has not thereby been reviewed against that replacement.", [dependency, ...superseders.get(dependency)]);
        const history = revisions.get(dependency) || [];
        const bound = [...(record.basis_versions || []), ...(record.authorization_binding?.basis_versions || [])].find(value => value.ref === dependency);
        const first = bound ? history.find(value => value.event_ref === bound.event_ref)
          : history.filter(value => eventOrder.get(value.event_ref) <= savedAt).at(-1);
        const last = history.at(-1);
        if (first && last && eventOrder.get(last.event_ref) > eventOrder.get(first.event_ref) && canonical(first.record) !== canonical(last.record)) {
          warn(ref, currentAssessment ? "premise_changed_after_assessment" : "premise_changed_after_work", currentAssessment
            ? "A supporting record changed after this current assessment was written; review its implications. This notice does not change the assumption, decision, route or authorization status."
            : "A linked premise changed after this work/claim was saved. Current records do not prove the old findings were re-reviewed.",
          [dependency, ...(currentAssessment ? [first.event_ref] : []), last.event_ref]);
        }
      }
    }
  }
  coverage.knowledge.included_refs = [...included].filter(ref => records.get(ref)?.collection === "evidence");
  coverage.work.included_refs = [...work];
  coverage.work.automatically_included_refs = [...work].filter(ref => !coverage.work.selected_refs.includes(ref));
  coverage.omitted = { evidence: state.evidence.length - coverage.knowledge.included_refs.length,
    work: state.runs.length + state.specialist_reviews.length - work.size };
  const operational = buildOperationalSummary(loaded, unfinished);
  const lines = ["# Consulting case brief", "", "Format: case-brief-v1", "Project: " + state.state_meta.project_id,
    "Last event: " + (state.state_meta.last_event_id || "none"), "Sequence: " + state.state_meta.sequence, "",
    "Journal-derived view; attribution is not verification or execution permission.",
    "Delivery is journal-attributed; this brief does not verify capture files. Check recent-intake or historical captures before binding replies; hash-only observations remain unverified.",
    "For a known card ID, use " + recordRead("<ID>") + "; add event_ref to its selector only for a specific historical definition. Use focused context for missing dependencies or history --event-id for a whole event. Retrieve omitted claims, inference guarantees, provenance and execution terms before relying on them.", ""];
  const rendered = new Set();
  const shownNotices = new Set(), shownCards = new Map(), cards = [];
  let section = "Recorded progress and materials";
  function card(title, ref, value, metadata = {}) {
    if (ref && rendered.has(ref)) return;
    if (ref) { rendered.add(ref); shownCards.set(ref, value); }
    const recordRef = Object.hasOwn(metadata, "record_ref") ? metadata.record_ref : ref;
    const entry = records.get(recordRef), source = entry?.record;
    const selected = metadata.value || value;
    const authoredFields = source ? Object.keys(selected).filter(key => Object.hasOwn(source, key)
      && canonical(source[key]) === canonical(selected[key])) : [];
    cards.push({ title, section, record_ref: recordRef || null,
      event_ref: metadata.event_ref || state.history_index[recordRef]?.event_ref || source?.event_ref || null,
      ...(entry ? { collection: entry.collection } : {}), body_mode: metadata.body_mode || "brief",
      source_kind: metadata.source_kind || (entry ? "authored_projection" : "derived_view"),
      value: copy(selected), authored_fields: authoredFields,
      omitted_fields: source ? Object.keys(source).filter(key => !authoredFields.includes(key)) : [],
      derived_fields: Object.keys(selected).filter(key => !authoredFields.includes(key)),
      ...(metadata.item_indexes ? { item_indexes: [...metadata.item_indexes] } : {}),
      ...(metadata.actual_delivery_ref ? { actual_delivery_ref: metadata.actual_delivery_ref } : {}) });
    if (options.compact) return;
    lines.push("### " + title + (ref ? " (" + ref + ")" : ""), "");
    for (const key of Object.keys(value).sort()) {
      const item = value[key];
      if (item !== undefined) lines.push("- **" + key.replaceAll("_", " ") + ":** " + (typeof item === "string" ? item.replaceAll("\n", "\n  ") : canonical(item)));
    }
    for (const note of notes.get(ref) || []) {
      const key = JSON.stringify([note.code, note.message]);
      lines.push("- **Attention:** " + (note.code === "relevant_correction" ? "See correction " + note.related_refs[0] + "."
        : shownNotices.has(key) ? "See " + note.code + " notice above." : note.code + ": " + note.message)
        + (note.related_refs?.length ? " References: " + note.related_refs.join(", ") + "." : ""));
      shownNotices.add(key);
    }
    if (ref && state.history_index[ref]?.event_ref) lines.push("- **Saved version:** " + state.history_index[ref].event_ref);
    lines.push("");
  }
  function actualItemRefs(delivery, matches = () => true) {
    if (!isAgentRecorded(delivery)) return [];
    return delivery.agent_recording.items.flatMap((item, item_index) => matches(item) ? [{
      record_ref: delivery.delivery_id,
      event_ref: delivery.event_ref || state.history_index[delivery.delivery_id]?.event_ref || null,
      item_index }] : []);
  }
  function recordCard(ref) {
    const entry = records.get(ref);
    if (!entry) { card("Unavailable record", ref, {}); return; }
    // Select fields, never truncate or paraphrase scientific text. Full records
    // remain available by exact lookup; full incoming messages stay in the conversation window.
    const keys = {
      evidence: ["summary", "limitations", "source_ref", "legacy", "run_id", "supersedes"],
      user_context: ["kind", "statement", "status", "basis_refs", "supersedes"],
      assumptions: ["statement", "status", "basis_refs", "supersedes"],
      decisions: ["kind", "statement", "status", "basis_refs", "user_contribution_refs", "supersedes"],
      result_conditions: ["evidence_ref", "result_locator", "claim", "target", "inference", "assumption_refs", "limitations", "supersedes"],
      candidate_routes: ["target", "approach", "status", "reason", "claim_boundary", "unmet_requirements", "reopen_or_promote_when", "data_requirements", "evidence_for", "evidence_against", "last_review_id"],
      specialist_reviews: ["limitations", "remaining_uncertainty", "noise_or_invalid_information", "evidence_refs"],
      runs: ["kind", "status", "claim_boundary", "plan_ref", "manifest_ref", "reason"]
    }[entry.collection];
    const value = fields(entry.record, keys || []);
    if (entry.collection === "candidate_routes") Object.assign(value, routeProgress(ref));
    if (entry.collection === "evidence") value.attribution = { user_statement: "user account", file: "file evidence", literature: "literature source", computed: "computed finding" }[entry.record.kind];
    if (entry.collection === "specialist_reviews") {
      const discussion = [...findingsExchanges].find(exchangeRef => bodies.exchanges.get(exchangeRef).response.findings.work_refs.includes(ref));
      if (discussion) value.findings_discussion_ref = discussion;
      else if (detailed.has(ref)) value.findings = copy(entry.record.findings || []);
      else value.summary = entry.record.summary;
      if (discussion || !detailed.has(ref)) value.findings_detail = "Full findings: " + recordRead(ref) + ". Expand before relying on a particular result.";
    }
    if (entry.collection === "result_conditions" && !detailed.has(ref)) {
      delete value.claim; delete value.inference;
      value.detail = "Exact claim and inference guarantee: " + recordRead(ref) + ". Expand before using the linked result.";
    }
    if (entry.collection === "runs") {
      const binding = entry.record.authorization_binding;
      const scope = list(state, "action_scopes").find(item => item.scope_id === binding?.scope_ref);
      if (binding) value.authorization = fields(binding, ["scope_ref", "authorization_ref"]);
      if (scope) value.recorded_target = fields(scope.public_scope, ["target", "population"]);
      else value.target_coverage = "Run metadata has no explicit target/population. Retrieve its frozen plan before using a scientific claim.";
      value.findings_status = unfinished.find(item => item.kind === "run" && item.record_ref === ref)?.reasons || [];
    }
    card(entry.collection === "candidate_routes" ? "Last recorded scientific assessment" : entry.collection.replaceAll("_", " "), ref, value);
  }
  function routeProgress(ref) {
    return { assessment_event_ref: state.history_index[ref]?.event_ref || null,
      recorded_execution: copy(routeRuns.get(ref) || []) };
  }
  function questionCard(question) {
    const continuity = questionLinks.get(question.question_id);
    const latestRef = continuity?.latest_exchange_ref || continuity?.unobserved_exchange_refs.at(-1);
    const request = question.status === "open" && bodies.exchanges.get(latestRef)?.response.questions.find(item => item.question_ref === question.question_id);
    const actualItem = bodies.exchanges.get(latestRef)?.response_items?.find(item => item.kind === "question" && item.question_ref === question.question_id);
    const exchange = bodies.exchanges.get(latestRef);
    const delivery = request && resolvedDelivery(state, latestRef).delivery;
    const value = { ...fields(question, ["origin", "statement", "status", "reason", "resolution", "basis_refs"]),
      ...(continuity?.communication ? { communication: copy(continuity.communication) } : {}),
      ...(request ? { latest_saved_request: { exchange_ref: latestRef, ...(!options.compact ? copy(request) : {}),
        ...(actualItem ? { display_label: actualItem.display_label } : {}),
        ...(bodies.exchanges.get(latestRef).reply_attribution === "prepared_draft" ? { reply_attribution: "prepared_draft", actual_reply_status: bodies.exchanges.get(latestRef).actual_reply_status } : {}),
        ...(bodies.exchanges.get(latestRef).actual_delivery_ref ? { actual_delivery_ref: bodies.exchanges.get(latestRef).actual_delivery_ref } : {}),
        delivery: deliveryState(state, latestRef) } } : {}) };
    const selected = { ...value };
    if (request) selected.latest_saved_request = { exchange_ref: latestRef, question_ref: question.question_id,
      ...(actualItem ? { display_label: actualItem.display_label } : {}),
      ...(isAgentRecorded(delivery) ? { actual_delivery_ref: delivery.delivery_id,
        actual_items: actualItemRefs(delivery, item => item.kind === "question" && item.question_ref === question.question_id) }
        : { prepared_request: { record_ref: latestRef, event_ref: exchange.event_ref,
          source_path: ["response", "questions", exchange.response.questions.indexOf(request)] } }),
      ...(exchange.reply_attribution === "prepared_draft" ? { reply_attribution: "prepared_draft", actual_reply_status: exchange.actual_reply_status } : {}),
      delivery: deliveryState(state, latestRef) };
    card("Question", question.question_id, value, { value: selected });
  }
  lines.push("## Recorded progress and materials", "",
    "Run lifecycle: " + (Object.entries(operational.run_counts).map(([status, count]) => count + " " + status).join(", ") || "no runs recorded") + ". Completion records execution, not scientific correctness or resolution of every question.",
    operational.route_execution_meaning, "");
  for (const run of operational.runs.filter(run => !work.has(run.run_id))) lines.push("- `" + run.run_id + "`: " + run.kind + ", " + run.status + "; full record: " + recordRead(run.run_id) + ".");
  if (operational.runs.some(run => !work.has(run.run_id))) lines.push("");
  lines.push("Recorded sources and frozen inputs below do not imply inspection, current availability or scientific validity. Exact hashes/provenance remain in the cited evidence and run plans.", "");
  for (const material of operational.materials) {
    lines.push("- **" + material.source_ref + "**"
      + (material.evidence.length ? "; evidence: " + material.evidence.map(item => item.evidence_ref).join(", ") : "")
      + (material.snapshots.length ? "; snapshots: " + material.snapshots.map(item => item.snapshot_ref).join(", ") : "") + ".");
  }
  if (!operational.materials.length) lines.push("No file evidence or frozen input metadata recorded in this view.");
  for (const issue of operational.input_metadata_issues) lines.push("- Input metadata unavailable for `" + issue.run_id + "`: " + issue.code + ".");
  lines.push("", "## User and objective", "");
  section = "User and objective";
  card("Recorded project understanding", null, { ...fields(state.project_understanding, ["objective", "intended_use", "audience", "causal_target"]),
    ownership: fields(operational.understanding_ownership, ["objective", "intended_use", "audience", "causal_target"]) });
  if (Object.hasOwn(state.project_understanding, "current_claim_boundary")) card("Last recorded scientific boundary", null, {
    statement: state.project_understanding.current_claim_boundary,
    saved_event: operational.understanding_sources.current_claim_boundary || "unavailable",
    ownership: operational.understanding_ownership.current_claim_boundary,
    meaning: "Operational phrases may be stale. Scientific restrictions remain until explicitly reconciled." });
  // Exact locators already in the inventory add no qualification. Preserve all
  // other authored notes verbatim, including obsolete operational prose.
  const inventorySources = new Set(operational.materials.map(material => material.source_ref));
  const legacyNotes = (state.project_understanding.materials || []).filter(note => !inventorySources.has(note));
  if (legacyNotes.length) card("Legacy material notes", null, {
    notes: legacyNotes, saved_event: operational.understanding_sources.materials || "unavailable",
    meaning: "Authored notes retained for qualifications; not a current inventory." });
  for (const record of current("user_context", "current")) recordCard(record.context_id);
  lines.push("## Study knowledge", "");
  section = "Study knowledge";
  if (coverage.knowledge.status === "uninitialized") lines.push("Knowledge selection is uninitialized. Use broad status/history to curate it from existing records; absence here is not absence of knowledge.", "");
  else if (!coverage.knowledge.selected_refs.length) lines.push("Knowledge selection is intentionally empty; live controls and their evidence remain visible.", "");
  for (const question of revisedAnswers) {
    if (question.status === "open") questionCard(question);
    else card("Question", question.question_id, copy(question));
    for (const ref of question.resolution.answer_refs) if (records.get(ref)?.collection === "evidence") recordCard(ref);
  }
  for (const ref of included) if (["evidence", "assumptions", "result_conditions", "decisions"].includes(records.get(ref)?.collection)) recordCard(ref);
  lines.push("## Work and findings", "");
  section = "Work and findings";
  if (coverage.work.status === "uninitialized") lines.push("Work selection is uninitialized. Use broad status/history before treating this inventory as the retained completed work.", "");
  for (const ref of work) recordCard(ref);
  // Lead findings are their saved exact content, with delivery separate. A
  // prepared closeout never establishes that its findings were presented.
  for (const exchange of bodies.exchanges.values()) {
    const findings = exchange.response.findings;
    if (!findings || !findingsExchanges.has(exchange.exchange_id)) continue;
    const actualDelivery = resolvedDelivery(state, exchange.exchange_id).delivery;
    const agentRecorded = isAgentRecorded(actualDelivery);
    const findingCard = fields(findings, options.compact && agentRecorded ? ["work_refs"] : ["work_refs", "summary", "limitations"]);
    // Only identical prose about explicitly linked work is shared. Distinct
    // wording, results and qualifications remain separate; no semantic matching.
    const linked = unique(findings.work_refs.flatMap(ref => [ref, ...(reviews.get(ref)?.evidence_refs || [])]));
    const summarySource = findingCard.summary && linked.find(ref => shownCards.get(ref)?.summary === findingCard.summary);
    if (summarySource) { delete findingCard.summary; findingCard.summary_ref = summarySource; }
    const repeatedLimits = [];
    if (findingCard.limitations) findingCard.limitations = findingCard.limitations.filter(text => {
      const source = linked.find(ref => shownCards.get(ref)?.limitations?.includes(text));
      if (!source) return true;
      repeatedLimits.push(source); return false;
    });
    if (repeatedLimits.length) findingCard.shared_limitation_refs = unique(repeatedLimits);
    const value = { ...findingCard,
      ...(agentRecorded ? { actual_delivery_ref: exchange.actual_delivery_ref } : {}),
      ...(exchange.reply_attribution === "prepared_draft" ? { reply_attribution: "prepared_draft", actual_reply_status: exchange.actual_reply_status } : {}),
      ...(findings.work_refs.some(ref => detailed.has(ref)) && !(options.compact && agentRecorded) ? { diagnostics: findings.diagnostics }
        : { diagnostics_detail: recordRead(exchange.actual_delivery_ref || exchange.exchange_id) }),
      ...(!agentRecorded && exchange.reconciliation.limitations.length ? { reconciliation_limitations: exchange.reconciliation.limitations } : {}),
      ...(!agentRecorded && exchange.reconciliation.unresolved.length ? { unresolved: exchange.reconciliation.unresolved } : {}),
      delivery: deliveryState(state, exchange.exchange_id) };
    const actualItems = actualItemRefs(actualDelivery, item => item.kind === "findings");
    card("Lead findings", exchange.exchange_id, value, { source_kind: "derived_view",
      ...(agentRecorded ? { record_ref: actualDelivery.delivery_id, event_ref: actualDelivery.event_ref,
        actual_delivery_ref: actualDelivery.delivery_id, item_indexes: actualItems.map(item => item.item_index),
        value: { exchange_ref: exchange.exchange_id, work_refs: copy(findings.work_refs),
          ...attribution(actualDelivery), delivery: deliveryState(state, exchange.exchange_id) } } : {}) });
  }
  lines.push("## Open consultation", "");
  section = "Open consultation";
  if (state.consultation) card("Current checkpoint", state.consultation.checkpoint_id,
    fields(state.consultation, ["status", "primary_uncertainty", "why_it_matters", "related_unresolved_question_refs", "strategy_ids_it_could_change", "selected_assignment"]));
  for (const question of state.questions) if (included.has(question.question_id)) questionCard(question);
  for (const route of state.candidate_routes) {
    if (included.has(route.strategy_id)) recordCard(route.strategy_id);
    else card("Route disposition", route.strategy_id,
      { ...fields(route, ["target", "status", "reason", "claim_boundary", "unmet_requirements", "reopen_or_promote_when", "evidence_for", "evidence_against", "last_review_id"]),
        ...routeProgress(route.strategy_id) });
  }
  const direction = list(state, "interpretations").at(-1);
  const directionTurn = list(state, "turns").find(turn => turn.interpretation_ref === direction?.interpretation_id);
  for (const source of pending) {
    const record = records.get(source.evidence_ref)?.record;
    const meaning = "Interpret this same retained source before protected work; its raw text does not grant permission.";
    card("Incoming message awaiting interpretation", source.evidence_ref, { source: record, meaning },
      { value: { ...copy(record), meaning }, body_mode: "full" });
  }
  if (direction) card(directionTurn?.exchange_ref ? "Incoming action reconciled by Lead" : "Selected incoming action awaiting Lead closeout",
    direction.interpretation_id, { next_action: direction.next_action,
      ...(directionTurn?.exchange_ref ? { closeout_ref: directionTurn.exchange_ref,
        meaning: "A saved closeout is not proof that every selected task was completed; retrieve its work and limitations." } : {}) });
  // Turn order follows incoming interpretations. A late observation or revision
  // of an older reply must not displace the closeout governing a newer turn.
  const leadTurn = list(state, "turns").findLast(turn => turn.exchange_ref);
  const leadDirection = bodies.exchanges.get(leadTurn?.exchange_ref);
  const leadResolution = leadDirection && resolvedDelivery(state, leadDirection.exchange_id);
  const leadDelivery = leadResolution?.delivery;
  if (leadDirection) {
    const value = {
      exchange_ref: leadDirection.exchange_id,
      ...(isAgentRecorded(leadDelivery) ? { ...(!options.compact ? { actual_reply_items: recordedItems(leadDelivery).map(item => {
        if (!leadResolution.capture) return item;
        const { text, ...annotation } = item;
        return annotation;
      }) } : {}), ...attribution(leadDelivery) }
        : { next_direction: leadDirection.reconciliation.next_direction }),
      ...(leadDirection.reply_attribution === "prepared_draft" ? { reply_attribution: "prepared_draft", actual_reply_status: leadDirection.actual_reply_status } : {}),
      applies_to: leadTurn.interpretation_ref === direction?.interpretation_id ? "Latest incoming turn."
        : "Earlier turn; newer incoming direction awaits Lead closeout.",
      meaning: isAgentRecorded(leadDelivery) ? "Current interpretation of the actual prior reply; captured text, when linked, is authoritative. Mapped actual options govern later reply binding."
        : "Proposed next direction, not a user selection or permission to execute.",
      delivery: deliveryState(state, leadDirection.exchange_id), retrieval: retrieval(leadDirection.exchange_id) };
    const selected = { ...value };
    delete selected.actual_reply_items;
    card(isAgentRecorded(leadDelivery) ? "Latest recorded Lead reply"
      : leadDirection.reply_attribution === "prepared_draft" ? "Latest Lead response plan" : "Latest Lead proposed direction", null, value,
      { value: selected, ...(isAgentRecorded(leadDelivery) ? { record_ref: leadDelivery.delivery_id,
        event_ref: leadDelivery.event_ref, actual_delivery_ref: leadDelivery.delivery_id, source_kind: "derived_view" } : {}) });
  }
  for (const scope of scopes) {
    const permission = policy.eligibility(state, scope.scope_id);
    const decision = list(state, "action_decisions").filter(value => value.scope_ref === scope.scope_id).at(-1);
    const currentDirection = !directionTurn?.exchange_ref && direction?.next_action.kind === "specialist" && direction.next_action.scope_ref === scope.scope_id
      && direction.next_action.authorization_ref === permission.authorization_ref;
    const offers = [...bodies.exchanges.values()].flatMap(exchange => exchange.response.next_steps.flatMap((option, index) => {
      if (option.scope_ref !== scope.scope_id) return [];
      const item = exchange.response_items?.find(item => item.option_id === option.option_id);
      const actual = resolvedDelivery(state, exchange.exchange_id).delivery;
      return [{ exchange_ref: exchange.exchange_id, option_id: option.option_id, option_number: index + 1,
        ...(!options.compact ? { label: option.label } : {}),
        ...(options.compact && isAgentRecorded(actual) ? { actual_delivery_ref: actual.delivery_id,
          actual_items: actualItemRefs(actual, value => value.kind === "option" && value.option_id === option.option_id) } : {}),
        ...(exchange.reply_attribution === "prepared_draft" ? { reply_attribution: "prepared_draft", actual_reply_status: exchange.actual_reply_status } : {}),
        ...(item ? { display_label: item.display_label } : {}), delivery: deliveryState(state, exchange.exchange_id) }];
    }));
    const value = { action: scope.action, assignment: scope.assignment,
      public_scope: detailed.has(scope.scope_id) ? scope.public_scope : fields(scope.public_scope, ["target", "population", "claim_boundary"]),
      findings_refs: scope.findings_refs, latest_decision: decision,
      permission, current_direction: currentDirection, direction_turn_closed: Boolean(directionTurn?.exchange_ref),
      offers, execution_plan: "Retrieve the exact scope record before protected work." };
    const selectedOffers = offers.map(({ label, ...offer }) => {
      const actual = resolvedDelivery(state, offer.exchange_ref).delivery;
      return { ...offer, ...(isAgentRecorded(actual) ? { actual_delivery_ref: actual.delivery_id,
        actual_items: actualItemRefs(actual, item => item.kind === "option" && item.option_id === offer.option_id) } : {}) };
    });
    card("Action scope", scope.scope_id, value, { value: { ...value, offers: selectedOffers } });
  }
  if (unfinished.length) {
    lines.push("### Unfinished handoffs", "", "Each pending record retains its reasons and related IDs below. Retrieve with " + recordRead("<ID>") + "; derived turns point to their contributing records.", "");
    for (const item of unfinished) lines.push("- " + item.kind + " `" + item.record_ref + "`: " + item.reasons.join(", ")
      + (item.related_refs?.length ? "; related: " + item.related_refs.join(", ") : "") + ".");
    lines.push("");
  }
  const correctionRefs = unique(coverage.warnings.filter(note => note.code === "relevant_correction").map(note => note.related_refs[0]));
  if (correctionRefs.length) {
    lines.push("## Relevant corrections", "", "Affected cards cite these correction events. Each reason is the exact saved wording; different corrections retain separate entries.", "");
    for (const ref of correctionRefs) {
      const event = events.find(value => value.event_id === ref);
      lines.push("### Correction (" + ref + ")", "", event.payload.reason, "");
    }
  }
  return { markdown: options.compact ? null : lines.join("\n"), cards,
    notes: [...notes.values()].flat().map(copy),
    corrections: correctionRefs.map(ref => ({ event_ref: ref, source_path: "payload.reason",
      reason: events.find(event => event.event_id === ref).payload.reason })),
    unfinished, operational, coverage };
}

module.exports = { buildCaseBrief };
