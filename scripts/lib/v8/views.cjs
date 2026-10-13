"use strict";

// Read-only projections of a single committed snapshot. Selection changes what
// is shown, never the scientific status, permission or contents of a record.
const path = require("node:path");
const records = require("./records.cjs");
const { fail, readFile, sha256, safePath, canonical } = require("../files.cjs");
const { descriptor, INDEX_MARKER } = require("../deliverables.cjs");

const SECTIONS = [
  ["purpose", "Purpose"], ["user_context", "User context"],
  ["understanding", "Current understanding"], ["questions", "Open questions"],
  ["choices", "Analytic choices"], ["work", "Work and continuation"]
];
const array = value => Array.isArray(value) ? value : [];
const unique = values => [...new Set(values.filter(value => typeof value === "string" && value))];
const present = value => value !== undefined && value !== null && value !== ""
  && (!Array.isArray(value) || value.length > 0);
const pick = (value, names) => Object.fromEntries(names.filter(name => present(value?.[name]))
  .map(name => [name, structuredClone(value[name])]));
const number = ref => Number(String(ref || "").match(/^e(\d+)/)?.[1] || 0);
const exact = record => /^e\d+(?:\/|$)/.test(record.ref) ? record.ref : record.ref + "@" + record.event_ref;
const identity = value => typeof value === "string" ? value.split("@")[0] : value?.ref;

function snapshot(loaded) {
  return { format: "consultation-context-v8", case: structuredClone(loaded.header.case),
    journal_snapshot: loaded.state.state_meta.last_event_id || "e0" };
}

function reader(loaded) {
  const cache = new Map(), gaps = [];
  function get(ref) {
    if (!ref || typeof ref !== "string") return null;
    if (cache.has(ref)) return cache.get(ref);
    try {
      const found = ref === "e0" ? { ref: "e0", event_ref: "e0", kind: "header", body: loaded.header }
        : records.resolve(loaded, ref);
      cache.set(ref, found);
      return found;
    } catch (error) {
      gaps.push({ kind: "record_gap", ref, code: error.code || "RECORD_UNAVAILABLE", message: error.message });
      cache.set(ref, null);
      return null;
    }
  }
  function refs(values, at) {
    return unique(array(values).map(ref => {
      if (!at) { const found = get(ref); return found ? exact(found) : ref; }
      try { return exact(definitionBefore(loaded, ref, at)); }
      catch (error) { gaps.push({ kind: "record_gap", ref, code: error.code, message: error.message }); return ref; }
    }));
  }
  return { get, refs, gaps };
}

function definitionBefore(loaded, ref, eventRef) {
  return records.resolveAt(loaded, ref, eventRef);
}

function conditionLinks(loaded, evidence, read, historical = false) {
  const current = array(loaded.state.result_conditions);
  const superseded = new Set(current.map(value => identity(value.supersedes)).filter(Boolean));
  const candidates = historical ? loaded.entries.flatMap(entry => records.definitions(entry))
    .filter(record => record.kind === "result_condition")
    : current.filter(value => !superseded.has(value.condition_id)).map(value => read.get(value.condition_id)).filter(Boolean);
  const linked = new Map();
  for (const condition of candidates) {
    if (identity(condition.body.evidence_ref) !== evidence.ref) continue;
    let bound, gap;
    try { bound = definitionBefore(loaded, condition.body.evidence_ref, condition.event_ref); }
    catch (error) { gap = error.message; }
    const same = bound && exact(bound) === exact(evidence);
    if (historical && !same) continue;
    linked.set(condition.ref, { record: condition, binding: same ? "same_evidence_version" : "needs_reconciliation",
      ...(bound ? { evidence_version: exact(bound) } : {}), ...(gap ? { gap } : {}) });
  }
  return [...linked.values()];
}

function conditionItem(loaded, link, read) {
  const condition = link.record, body = condition.body;
  let evidence;
  try { evidence = definitionBefore(loaded, body.evidence_ref, condition.event_ref); }
  catch (error) { link = { ...link, gap: link.gap || error.message, binding: "needs_reconciliation" }; }
  const currentEvidence = evidence && read.get(evidence.ref);
  const currentCondition = read.get(condition.ref);
  const replacements = array(loaded.state.result_conditions)
    .filter(value => identity(value.supersedes) === condition.ref).map(value => value.condition_id);
  const assumptions = array(body.assumption_refs).map(ref => {
    let found;
    try { found = definitionBefore(loaded, ref, condition.event_ref); }
    catch (error) { return { ref, gap: error.message }; }
    const current = read.get(found.ref);
    return { ref: exact(found), ...pick(found.body, ["statement", "status"]),
      ...(current && current.event_ref !== found.event_ref ? { current_ref: exact(current), applicability: "needs_reconciliation" } : {}) };
  });
  return { ref: exact(condition), ...pick(body, ["claim", "target", "result_locator", "limitations", "inference"]),
    evidence_ref: evidence ? exact(evidence) : body.evidence_ref,
    ...(currentEvidence && currentEvidence.event_ref !== evidence.event_ref ? { current_evidence_ref: exact(currentEvidence) } : {}),
    ...(currentCondition && currentCondition.event_ref !== condition.event_ref ? { current_condition_ref: exact(currentCondition) } : {}),
    ...(replacements.length ? { superseded_by: read.refs(replacements) } : {}),
    ...((link.binding !== "same_evidence_version") ? { applicability: link.binding, evidence_version: link.evidence_version } : {}),
    ...(link.gap ? { gap: link.gap } : {}), ...(assumptions.length ? { assumptions } : {}),
    basis_refs: read.refs(body.basis_refs, condition.event_ref) };
}

function factItem(loaded, record, read) {
  const body = record.body;
  const currentVersion = loaded.state.history_index?.[record.ref]?.event_ref;
  const historical = currentVersion && currentVersion !== record.event_ref;
  const item = { kind: record.kind, ref: exact(record), ...pick(body,
    ["summary", "statement", "status", "reason", "limitations", "source_ref", "applicability", "attribution"]),
    ...(body.kind ? { support: body.kind } : {}), basis_refs: read.refs(body.basis_refs, record.event_ref),
    ...(historical ? { current_ref: record.ref + "@" + currentVersion, version_status: "historical_selected_version" } : {}) };
  if (record.kind === "evidence") {
    const links = conditionLinks(loaded, record, read, historical);
    if (links.length) item.conditions = links.map(link => conditionItem(loaded, link, read));
    else if (body.kind === "computed") item.condition_coverage = "No linked result conditions are recorded; do not infer unconditional validity.";
  }
  return item;
}

function replyEntries(loaded, read) {
  const workflow = require("./workflow.cjs");
  const prepared = array(loaded.state.exchanges).map(row => {
    const saved = read.get(row.ref);
    if (!saved) return null;
    let actual;
    try { actual = workflow.currentReply(loaded, row.ref); }
    catch (error) { actual = { status: "unavailable", gaps: [{ code: error.code, message: error.message }] }; }
    let sourceOrder = 0;
    try { sourceOrder = records.handling(loaded, saved.body.responds_to).source_sequence; }
    catch (error) { read.gaps.push({ kind: "handling_gap", ref: row.ref, code: error.code, message: error.message }); }
    return { ref: row.ref, saved, actual, source_order: sourceOrder, question_version_at: row.ref,
      items: actual.status === "current" ? array(actual.delivery?.items || actual.delivery?.agent_recording?.items) : [] };
  }).filter(Boolean);
  const covered = new Set(prepared.flatMap(reply => reply.actual.observation_refs || []));
  // A reply can be retained without an associated draft. Its incoming-message
  // anchor, not its later recording entry, supplies the conversation position.
  for (const row of array(loaded.state.deliveries)) {
    if (row.prepared || covered.has(row.ref)) continue;
    let actual;
    try { actual = workflow.currentReply(loaded, row.ref); }
    catch (error) { actual = { status: "unavailable", gaps: [{ code: error.code, message: error.message }] }; }
    for (const ref of actual.observation_refs || [row.ref]) covered.add(ref);
    const saved = read.get(row.ref), before = actual.delivery?.before_user || row.before_user;
    if (saved) prepared.push({ ref: row.ref, saved, actual,
      source_order: before ? number(before) - 0.5 : -1, question_version_at: before || row.ref,
      items: actual.status === "current" ? array(actual.delivery?.items) : [] });
  }
  return prepared.sort((a, b) => a.source_order - b.source_order || number(a.ref) - number(b.ref));
}

function answerCommunication(loaded, question, reply) {
  const ref = question.question_id;
  const actual = reply.items.filter(item => item.kind === "answer" && identity(item.question_ref) === ref);
  const base = { reply_ref: reply.ref, actual_refs: unique(reply.actual.observation_refs || []),
    ...(reply.actual.delivery?.ref ? { delivery_ref: reply.actual.delivery.ref } : {}) };
  if (reply.actual.status !== "current") return { ...base, status: "unconfirmed",
    reason: "The prepared answer's actual reply is not established. Inspect the actual conversation before repeating it." };
  if (actual.length !== 1) return { ...base, status: "needs_reconciliation",
    reason: actual.length ? "The actual reply has multiple answer mappings for this question."
      : "The actual reply has no mapped answer for this prepared answer." };
  const answer = actual[0];
  const answerStatus = answer.answer_status ?? answer.status;
  let previous;
  try { previous = definitionBefore(loaded, answer.question_ref, reply.question_version_at); } catch (_) { /* Specific gap below. */ }
  const currentVersion = loaded.state.history_index?.[ref]?.event_ref;
  if (!previous || previous.event_ref !== currentVersion) return { ...base, status: "unconfirmed",
    reason: "The recorded answer concerns an earlier or unavailable question definition; reconcile applicability before relying on it.",
    ...(previous ? { answered_question_ref: exact(previous) } : {}) };
  const status = answerStatus === "answered" && question.status === "answered" ? "answered"
    : answerStatus === "pending" && question.status === "open" ? "pending"
    : answerStatus === "withdrawn" && question.status === "retired" ? "withdrawn" : "needs_reconciliation";
  return { ...base, answered_question_ref: exact(previous), status,
    ...(!answerStatus ? { reason: "This actual answer records no disposition; completeness remains unconfirmed." }
      : status === "needs_reconciliation" ? { reason: "Actual and canonical answer dispositions differ. Inspect the actual words before repeating an answer or changing its recorded status." }
      : answerStatus === "pending" ? { reason: "The actual reply records this answer as pending." } : {}) };
}

// A later recording does not move the message forward in the work lifecycle.
function workVersion(loaded, ref, at, before = false) {
  if (!at) return null;
  const limit = number(at) - (before ? 1 : 0);
  let found;
  try { found = definitionBefore(loaded, ref, at); } catch (_) { return null; }
  if (number(found.event_ref) > limit) return null;
  if (found.kind === "work") {
    const runRef = found.body.run || found.ref;
    const lifecycle = loaded.entries.filter(entry => entry.type === "work" && number(entry.id) <= limit
      && (entry.data.run || entry.id) === runRef).at(-1);
    return lifecycle?.data.phase === "completed" ? "run:" + runRef + ":" + lifecycle.id : null;
  }
  return found.kind === "review" || found.kind === "evidence" && found.body.kind === "computed"
    ? found.kind + ":" + exact(found) : null;
}

function questionCommunication(loaded, question, replies) {
  const ref = question.question_id;
  const related = replies.filter(reply => array(reply.saved.body.response?.user_questions)
    .some(item => identity(item.question_ref) === ref) || reply.items.some(item => identity(item.question_ref) === ref));
  const latest = related.filter(reply => array(reply.saved.body.response?.user_questions)
    .some(item => identity(item.question_ref) === ref)
    || reply.items.some(item => item.kind === "answer" && identity(item.question_ref) === ref)).at(-1);
  if (!latest) return question.status === "answered" ? { status: "unconfirmed",
    reason: "A supported answer is recorded; actual communication has not been established." } : null;
  const current = answerCommunication(loaded, question, latest);
  if (current.status === "answered" || latest.actual.status === "current") return current;

  // Keep an earlier observed answer as history even when the latest draft or
  // changed question cannot be confirmed. Later actual dispositions still win.
  const earlier = related.slice(0, related.indexOf(latest)).filter(reply => reply.actual.status === "current"
    && reply.items.some(item => item.kind === "answer" && identity(item.question_ref) === ref)).at(-1);
  if (!earlier) return current;
  const prior = answerCommunication(loaded, question, earlier);
  const observedAnswers = earlier.items.filter(item => item.kind === "answer" && identity(item.question_ref) === ref);
  const previousActual = { ...prior, ...(observedAnswers.length === 1
    ? { recorded_answer_status: observedAnswers[0].answer_status ?? observedAnswers[0].status ?? "unspecified" } : {}) };

  const normalizeText = value => typeof value === "string" ? value.trim().replace(/\r\n/g, "\n") : null;
  const signature = reply => {
    const answers = array(reply.saved.body.response?.user_questions).filter(item => identity(item.question_ref) === ref);
    if (answers.length !== 1 || answers[0].status !== "answered") return null;
    const answer = answers[0];
    try {
      return JSON.stringify({ text: normalizeText(answer.answer),
        echo_question: Boolean(answer.echo_question), question_text: answer.echo_question ? normalizeText(answer.text) : null,
        question: exact(definitionBefore(loaded, answer.question_ref, reply.question_version_at)),
        basis: array(answer.basis_refs).map(value => exact(definitionBefore(loaded, value, reply.question_version_at))).sort(),
        scope: answer.scope_ref || null });
    } catch (_) { return null; }
  };
  const draft = array(earlier.saved.body.response?.user_questions).find(item => identity(item.question_ref) === ref);
  const observed = earlier.items.find(item => item.kind === "answer" && identity(item.question_ref) === ref);
  const oldSignature = signature(earlier);
  const relevant = new Set([ref, earlier.ref, ...array(earlier.actual.observation_refs), ...array(draft?.basis_refs), draft?.scope_ref]
    .filter(Boolean).map(value => identity(value).split("/")[0]));
  const corrected = loaded.entries.some(entry => entry.type === "correction" && number(entry.id) > number(earlier.question_version_at)
    && array(entry.data.corrects_refs).some(value => relevant.has(identity(value).split("/")[0])));
  const repeatedOnly = related.slice(related.indexOf(earlier) + 1).every(reply => reply.actual.status === "unavailable"
    && !array(reply.actual.observation_refs).length && signature(reply) === oldSignature);
  if (question.status === "answered" && prior.status === "answered" && oldSignature && !corrected && repeatedOnly
    && normalizeText(observed.text) === normalizeText(draft?.answer)) {
    return { ...prior, latest_prepared_reply: latest.ref, latest_reply_status: "unconfirmed",
      reason: "This answer was already communicated. Delivery of the later unchanged draft is not yet recorded." };
  }
  return { ...current, previous_actual: previousActual,
    reason: "The previous actual answer is retained separately; it does not confirm the newer response. " + (current.reason || "") };
}

function selection(loaded) {
  const state = loaded.state, read = reader(loaded), seen = new Set();
  const sections = SECTIONS.map(([id, title]) => ({ id, title, items: [] }));
  const section = Object.fromEntries(sections.map(item => [item.id, item.items]));
  const selected = state.case_brief || {};
  const knowledge = array(selected.knowledge_refs), work = array(selected.work_refs);
  const selectedVersions = (kind, values, idField) => {
    const current = values.map(value => read.get(value[idField])).filter(Boolean);
    const versions = new Map(current.map(record => [exact(record), record]));
    for (const ref of knowledge) {
      const record = read.get(ref);
      if (record?.kind === kind) versions.set(exact(record), record);
    }
    return [...versions.values()];
  };
  const versionNote = record => {
    const current = state.history_index?.[record.ref]?.event_ref;
    return current && current !== record.event_ref
      ? { current_ref: record.ref + "@" + current, version_status: "historical_selected_version" } : {};
  };
  const addFact = ref => {
    const found = read.get(ref);
    if (!found || seen.has(exact(found))) return;
    if (["evidence", "assumption", "scientific_decision", "result_condition"].includes(found.kind)) {
      if (found.kind === "scientific_decision" && Object.values(state.state_meta.overview_sources || {})
        .some(owner => owner.record_ref === found.ref && owner.event_ref === found.event_ref)) return;
      if (found.kind === "result_condition" && knowledge.some(value => {
        const evidence = read.get(value);
        if (evidence?.kind !== "evidence") return false;
        const historical = state.history_index?.[evidence.ref]?.event_ref !== evidence.event_ref;
        return conditionLinks(loaded, evidence, read, historical).some(link => exact(link.record) === exact(found));
      })) return;
      seen.add(exact(found));
      let conditionBinding = "same_evidence_version";
      if (found.kind === "result_condition") {
        try {
          const evidence = definitionBefore(loaded, found.body.evidence_ref, found.event_ref);
          if (read.get(evidence.ref)?.event_ref !== evidence.event_ref) conditionBinding = "needs_reconciliation";
        } catch (_) { conditionBinding = "needs_reconciliation"; }
      }
      section.understanding.push(found.kind === "result_condition"
        ? { kind: found.kind, ...conditionItem(loaded, { record: found, binding: conditionBinding }, read) }
        : factItem(loaded, found, read));
    } else if (!["question", "route", "user_context", "review", "work"].includes(found.kind)) {
      section.understanding.push({ kind: "selected_source", ref: exact(found), record_kind: found.kind,
        text: "Selected source retained for exact lookup; its original content is not paraphrased into the brief." });
    }
  };

  const labels = { objective: "Objective", causal_target: "Current target", intended_use: "Intended use",
    audience: "Audience", current_claim_boundary: "Claim boundary" };
  for (const [field, label] of Object.entries(labels)) {
    const raw = state.project_understanding?.[field];
    const text = typeof raw === "string" ? raw : raw?.text;
    if (!present(text)) continue;
    const owner = state.state_meta.overview_sources?.[field] || raw;
    const refs = read.refs(Array.isArray(owner) ? owner : owner?.basis_refs || owner?.refs || [], owner?.event_ref);
    if (owner?.event_ref) refs.push(owner.event_ref);
    section.purpose.push({ kind: "overview", field, label, text, refs: unique(refs),
      ...(!refs.length ? { gap: "The overview's source relationship is not recorded." } : {}) });
  }
  if (!section.purpose.length) section.purpose.push({ kind: "gap", text: "The research objective and current target are not yet recorded." });

  const activeContext = array(state.user_context).filter(item => !["superseded", "withdrawn", "retired"].includes(item.status));
  for (const [kind, label, unknown] of [["domain_expertise", "Domain expertise", "Not yet established"],
    ["statistical_expertise", "Statistical expertise", "Not yet established"],
    ["communication", "Communication preferences", "Not separately recorded"]]) {
    const facts = activeContext.filter(item => item.kind === kind).map(item => {
      const saved = read.get(item.context_id);
      return { ...pick(item, ["statement", "attribution", "applicability", "status"]),
        ref: saved ? exact(saved) : item.context_id, basis_refs: read.refs(item.basis_refs, saved?.event_ref) };
    });
    section.user_context.push({ kind: "profile", label, ...(facts.length ? { facts } : { text: unknown }) });
  }
  for (const item of activeContext.filter(item => !["domain_expertise", "statistical_expertise", "communication"].includes(item.kind))) {
    const saved = read.get(item.context_id);
    section.purpose.push({ kind: item.kind, ref: saved ? exact(saved) : item.context_id,
      ...pick(item, ["statement", "attribution", "applicability"]), basis_refs: read.refs(item.basis_refs, saved?.event_ref) });
  }
  if (!Object.hasOwn(selected, "knowledge_refs")) section.understanding.push({ kind: "gap",
    text: "Knowledge selection is not initialized; an empty brief does not establish that no relevant knowledge exists." });
  knowledge.forEach(addFact);

  const replies = replyEntries(loaded, read);
  for (const saved of selectedVersions("question", array(state.questions), "question_id")) {
    const question = saved.body, version = versionNote(saved);
    const communication = question.origin === "user" && !version.current_ref ? questionCommunication(loaded, question, replies) : null;
    const unresolved = !version.current_ref && (question.status === "open" || array(question.resolution?.remaining).length > 0);
    const communicationGap = question.status !== "retired" && communication && communication.status !== "answered";
    const selectedQuestion = knowledge.some(ref => { const record = read.get(ref); return record && exact(record) === exact(saved); });
    if (!unresolved && !communicationGap && !selectedQuestion) continue;
    const support = read.refs(question.resolution?.answer_refs, saved?.event_ref).map(ref => {
      const record = read.get(ref);
      if (!record) return { ref, gap: "The recorded answer source is unavailable." };
      if (record.kind === "user_message") return { ref: exact(record), kind: "original_user_message" };
      if (seen.has(exact(record))) return { ref: exact(record) };
      return factItem(loaded, record, read);
    });
    (unresolved || communicationGap ? section.questions : section.understanding).push({ kind: "question", ref: exact(saved), ...version,
      ...pick(question, ["origin", "statement", "status", "reason"]),
      ...(support.length ? { supported_by: support } : {}),
      ...(Object.hasOwn(question, "resolution") ? { remaining: structuredClone(question.resolution.remaining || []) } : {}),
      ...(communication ? { communication } : {}), basis_refs: read.refs(question.basis_refs, saved?.event_ref) });
  }

  for (const saved of selectedVersions("route", array(state.candidate_routes), "strategy_id")) {
    const route = saved.body;
    if (["not_relevant", "superseded", "retired"].includes(route.status)
      && !knowledge.some(ref => { const record = read.get(ref); return record && exact(record) === exact(saved); })) continue;
    section.choices.push({ kind: "route", ref: exact(saved), ...versionNote(saved),
      ...pick(route, ["target", "approach", "status", "reason", "data_requirements", "claim_boundary",
        "unmet_requirements", "reopen_or_promote_when"]),
      evidence_for: read.refs(route.evidence_for, saved?.event_ref), evidence_against: read.refs(route.evidence_against, saved?.event_ref),
      ...(route.last_review_id ? { assessment_ref: route.last_review_id } : {}) });
  }

  const workflow = require("./workflow.cjs");
  const latestReply = replies.at(-1), offered = new Map();
  if (latestReply) {
    const items = latestReply.actual.status === "current" ? latestReply.items.filter(item => item.kind === "option")
      : array(latestReply.saved.body.response?.next_steps);
    for (const item of items) if (item.scope_ref) offered.set(item.scope_ref, {
      reply_ref: latestReply.ref, communication: latestReply.actual.status === "current" ? "actual_offer_recorded" : "prepared_only",
      ...(item.label || item.option_id ? { item: item.label || item.option_id } : {}) });
  }
  const completedSuccessor = scopeRef => {
    const descendants = new Set(), pending = [scopeRef];
    while (pending.length) {
      const predecessor = pending.pop();
      for (const scope of array(state.action_scopes)) {
        if (identity(scope.supersedes) !== predecessor || descendants.has(scope.ref)) continue;
        descendants.add(scope.ref); pending.push(scope.ref);
      }
    }
    return array(state.runs).some(run => run.phase === "completed"
      && descendants.has(identity(run.scope_ref || run.scope))
      && array(state.action_decisions).some(decision => decision.ref === (run.authorization_ref || run.decision)
        && decision.choice === "accept" && identity(decision.scope_ref || decision.scope) === identity(run.scope_ref || run.scope)));
  };
  for (const scope of array(state.action_scopes)) {
    const linked = array(state.action_decisions).filter(decision => identity(decision.scope_ref || decision.scope) === scope.ref);
    const runs = array(state.runs).filter(run => identity(run.scope_ref || run.scope) === scope.ref);
    let permission;
    try { permission = workflow.permission(loaded, scope.ref); }
    catch (error) { permission = { status: "unresolved", scope_ref: scope.ref, reason: error.message }; }
    const decisionRun = runs.find(run => (run.authorization_ref || run.decision) === permission.decision_ref);
    const outstandingRun = runs.some(run => ["started", "failed"].includes(run.phase));
    const replacedAndCompleted = permission.status === "stale" && !outstandingRun && completedSuccessor(scope.ref);
    const live = outstandingRun || permission.status === "deferred"
      || ["accepted", "stale", "unresolved"].includes(permission.status) && linked.length
        && !replacedAndCompleted && (!decisionRun || decisionRun.phase === "started");
    if (!live && state.focus_scope_ref !== scope.ref && !work.includes(scope.ref) && !knowledge.includes(scope.ref) && !offered.has(scope.ref)) continue;
    section.work.push({ kind: "permission", ...permission, run_refs: runs.map(run => run.ref),
      ...(offered.has(scope.ref) ? offered.get(scope.ref) : {}),
      ...(permission.status === "offered" && offered.get(scope.ref)?.communication === "prepared_only" ? { status: "prepared" } : {}),
      ...(scope.terms?.target ? { target: scope.terms.target } : {}),
      ...(permission.status === "accepted" ? { meaning: "Acceptance is recorded; current direction separately controls execution." } : {}) });
  }
  const direction = state.consultation;
  if (direction) section.work.push({ kind: "direction", ref: direction.ref || direction.source,
    ...pick(direction, ["next_action", "incoming_refs", "question_timing", "answer_timing", "question_dependencies"]) });
  else {
    const closed = read.get(state.state_meta.direction_ref);
    section.work.push(closed?.body.next_action?.kind === "close"
      ? { kind: "direction", ref: exact(closed), next_action: structuredClone(closed.body.next_action) }
      : { kind: "direction", text: "No active continuation is recorded." });
  }

  const linkedRuns = (refs, at) => workflow.linkedRunRefs(loaded, refs, at, (ref, error) => {
    read.gaps.push({ kind: "record_gap", ref, code: error.code || "RECORD_UNAVAILABLE", message: error.message });
  });
  const reviewedRuns = new Set(array(state.specialist_reviews).flatMap(review =>
    linkedRuns(array(review.work_refs), review.ref)));
  const closedRuns = new Set(array(state.exchanges).flatMap(reply =>
    linkedRuns(array(reply.work_refs || reply.completed_work_refs), reply.ref)));
  for (const run of array(state.runs)) {
    const selectedRun = work.includes(run.ref) || direction?.next_action?.run_ref === run.ref;
    const reviewed = reviewedRuns.has(run.ref);
    const closed = closedRuns.has(run.ref);
    if (!selectedRun && run.phase !== "started" && (run.phase === "completed" ? reviewed && closed : closed)) continue;
    const relatedReviews = unique(array(state.turns).filter(turn => array(turn.work_refs).includes(run.ref))
      .flatMap(turn => array(turn.work_refs).filter(ref => read.get(ref)?.kind === "review")));
    section.work.push({ kind: "run", work_kind: run.kind, ...pick(run, ["ref", "event_ref", "phase", "assignment", "responds_to",
      "scope", "decision", "scope_ref", "authorization_ref", "plan_ref", "manifest_ref", "reason", "failure", "claim_boundary"]),
      ...(!reviewed && run.phase === "completed" ? { assessment: "Scientific assessment is not explicitly linked to this run.",
        ...(relatedReviews.length ? { related_review_refs: relatedReviews } : {}) } : {}),
      ...(!closed && ["completed", "failed", "abandoned"].includes(run.phase) ? { communication: "Prepared closeout is not explicitly linked to this run." } : {}) });
  }
  for (const ref of work) {
    const found = read.get(ref);
    if (!found || array(state.runs).some(run => run.ref === found.ref) || array(state.action_scopes).some(scope => scope.ref === found.ref)) continue;
    section.work.push({ kind: "work_record", ref: exact(found), record_kind: found.kind,
      ...pick(found.body, ["summary", "assignment", "responds_to", "work_refs", "limitations"]) });
  }
  if (!Object.hasOwn(selected, "work_refs")) section.work.push({ kind: "gap", text: "Work selection is not initialized; live obligations are still included." });
  for (const message of records.pendingMessages(loaded)) section.work.push({ kind: "pending_message", ref: message.id || message.ref,
    text: "A retained original user message awaits handling." });

  const discussedWork = new Set();
  for (const reply of replies) {
    if (reply.actual.status !== "current") continue;
    const at = reply.actual.delivery?.prepared || reply.actual.delivery?.before_user;
    const before = !reply.actual.delivery?.prepared;
    for (const ref of reply.items.filter(item => ["findings", "answer"].includes(item.kind))
      .flatMap(item => array(item.work_refs))) {
      const key = workVersion(loaded, ref, at, before);
      if (!key) continue;
      discussedWork.add(key);
      const found = definitionBefore(loaded, ref, at);
      // A review can return its assessed completed runs, never another review.
      if (found.kind === "review") for (const runRef of linkedRuns(array(found.body.work_refs), found.event_ref)) {
        const runKey = workVersion(loaded, runRef, found.event_ref);
        if (runKey) discussedWork.add(runKey);
      }
    }
  }

  const runCovered = run => run?.phase === "completed" && array(state.exchanges).some(reply =>
    number(reply.ref) > number(run.event_ref)
    && linkedRuns(array(reply.work_refs || reply.completed_work_refs), reply.ref).includes(run.ref)
    && (run.kind !== "analysis" || array(state.specialist_reviews).some(review => number(review.ref) > number(run.event_ref)
      && number(review.ref) < number(reply.ref) && linkedRuns(array(review.work_refs), review.ref).includes(run.ref))));
  const workCovered = ref => {
    const found = read.get(ref);
    if (!found) return false;
    if (found.kind === "work") return runCovered(array(state.runs).find(run => run.ref === (found.body.run || found.ref)));
    if (found.kind !== "review") return false;
    if (discussedWork.has("review:" + exact(found)) || array(state.exchanges).some(reply =>
      number(reply.ref) > number(found.event_ref) && array(reply.work_refs || reply.completed_work_refs).includes(ref))) return true;
    // Only the original execution assessment accompanies a direct run closeout.
    const refs = array(found.body.work_refs);
    if (found.body.assignment?.operation !== "execution" || !refs.length
      || refs.some(value => read.get(value)?.kind !== "work")) return false;
    const assessed = linkedRuns(refs, found.event_ref);
    const origins = canonical(records.handling(loaded, found.body.responds_to).incoming.sort());
    if (!assessed.length || !assessed.every(runRef => {
      const run = array(state.runs).find(value => value.ref === runRef);
      if (!runCovered(run) || number(found.event_ref) <= number(run.event_ref)
        || canonical(records.handling(loaded, run.responds_to).incoming.sort()) !== origins) return false;
      const selected = workflow.latestDirection({ ...loaded,
        entries: loaded.entries.filter(entry => number(entry.id) < number(run.ref)) });
      return selected?.action.kind === "specialist" && canonical(selected.action.assignment) === canonical(found.body.assignment);
    })) return false;
    return array(state.exchanges).some(reply => number(reply.ref) > number(found.event_ref)
      && assessed.every(runRef => array(reply.work_refs || reply.completed_work_refs).includes(runRef)));
  };
  for (const turn of array(state.turns)) {
    if (turn.exchange_ref) continue;
    const uncovered = array(turn.work_refs).filter(ref => !workCovered(ref));
    if (array(turn.work_refs).length && !uncovered.length) continue;
    const reviews = uncovered.filter(ref => read.get(ref)?.kind === "review");
    section.work.push({ kind: "unfinished_handling", ref: turn.handling_ref || turn.ref,
      user_message_refs: array(turn.user_message), work_refs: array(turn.work_refs),
      text: reviews.length ? "Assessment coverage is not explicit for " + reviews.join(", ")
        + ". Inspect the actual reply and its work references before repeating findings or recording another closeout."
        : "Handling is recorded without a prepared closeout; inspect the current direction before continuing." });
  }
  const pendingWork = new Set();
  for (const reply of replies) {
    const missing = array(reply.saved.body.response?.findings?.work_refs)
      .filter(ref => { const key = workVersion(loaded, ref, reply.ref) || ref;
        return !discussedWork.has(key) && !pendingWork.has(key); });
    if (!missing.length) continue;
    missing.forEach(ref => pendingWork.add(workVersion(loaded, ref, reply.ref) || ref));
    section.work.push({ kind: "communication_gap", prepared_ref: reply.ref, work_refs: missing,
      status: reply.actual.status === "current" ? "needs_reconciliation" : "unconfirmed",
      text: "Prepared findings have no corresponding actual discussion recorded. Inspect the actual reply; recover communication without repeating completed work." });
  }
  const latest = replies.at(-1);
  if (latest) section.work.push({ kind: "conversation_anchor",
    ...(latest.saved.kind === "reply_prepared" ? { prepared_ref: latest.ref } : { recorded_ref: latest.ref }),
    actual_status: latest.actual.status, actual_refs: unique(latest.actual.observation_refs || []),
    ...(latest.actual.delivery?.ref ? { delivery_ref: latest.actual.delivery.ref } : {}),
    ...(latest.actual.status !== "current" ? { text: "Actual content is not established. A prepared final reply awaiting next-turn recording is not evidence of failed delivery." } : {}),
    ...(array(latest.actual.gaps).length ? { gaps: latest.actual.gaps } : {}) });
  const lastMessage = loaded.entries.filter(entry => entry.type === "user_message").at(-1);
  if (lastMessage) section.work.push({ kind: "message_anchor", ref: lastMessage.id, text: "Latest retained original user message." });
  section.work.push(...read.gaps);
  return sections.filter(item => ["purpose", "user_context"].includes(item.id) || item.items.length);
}

const label = key => key.replace(/_/g, " ").replace(/^./, char => char.toUpperCase());
function itemText(item) {
  const refs = unique([item.ref, ...array(item.refs), ...array(item.basis_refs)]);
  if (item.kind === "profile") return item.label + ": " + (item.text || array(item.facts)
    .map(fact => [fact.statement, fact.attribution && "Attribution: " + valueText(fact.attribution),
      fact.applicability && "Applies to: " + valueText(fact.applicability), "[" + unique([fact.ref, ...array(fact.basis_refs)]).join(", ") + "]"]
      .filter(Boolean).join(" ")).join(" "));
  const skip = new Set(["kind", "ref", "refs", "basis_refs", "label", "field"]);
  const fields = Object.entries(item).filter(([key, value]) => !skip.has(key) && present(value))
    .map(([key, value]) => ["text", "statement", "summary"].includes(key) ? valueText(value) : label(key) + ": " + valueText(value));
  return (item.label ? item.label + ": " : "") + fields.join(" ") + (refs.length ? " [" + refs.join(", ") + "]" : "");
}
function valueText(value) {
  if (Array.isArray(value)) return value.map(valueText).join("; ");
  if (value && typeof value === "object") return Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .filter(([, item]) => present(item))
    .map(([key, item]) => label(key) + ": " + valueText(item)).join("; ");
  return String(value);
}
function build(loaded) {
  const sections = selection(loaded), header = loaded.header.case;
  const caseName = typeof header === "string" ? header : header?.name || header?.title || "Untitled case";
  const caseId = typeof header === "object" ? header?.id || header?.key || loaded.state.state_meta.project_id : loaded.state.state_meta.project_id;
  const markdown = ["# Case brief", "", "Case: " + caseName + (caseId && caseId !== caseName ? " (" + caseId + ")" : ""),
    "Journal snapshot: " + (loaded.state.state_meta.last_event_id || "e0"), "",
    ...sections.flatMap(section => ["## " + section.title, "", ...section.items.flatMap(item => ["- " + itemText(item).replace(/\r?\n/g, "\n  "), ""])])].join("\n");
  return { markdown, sections };
}

function recordRequests(request) {
  const result = [...array(request.refs), ...array(request.records).map(item => {
    if (typeof item === "string") return item;
    if (!item || typeof item.record_ref !== "string") fail("INVALID_INPUT", "Each record lookup needs record_ref.");
    return item.event_ref && item.event_ref !== item.record_ref ? item.record_ref + "@" + item.event_ref : item.record_ref;
  })];
  if (result.some(ref => typeof ref !== "string" || !ref)) fail("INVALID_INPUT", "Record references must be nonempty strings.");
  return result;
}

function expanded(loaded, refs, includeSources = false) {
  const read = reader(loaded), bodies = new Map(), links = [], roots = unique(refs);
  const add = ref => {
    const found = read.get(ref);
    if (!found) return null;
    const key = exact(found);
    if (!bodies.has(key)) {
      const currentVersion = loaded.state.history_index?.[found.ref]?.event_ref;
      const run = array(loaded.state.runs).find(value => value.ref === found.ref);
      bodies.set(key, { ref: key, kind: found.kind, body: structuredClone(found.body),
        ...(currentVersion && currentVersion !== found.event_ref && !/^e\d/.test(found.ref)
          ? { current_ref: found.ref + "@" + currentVersion } : {}),
        ...(run ? { current_work: { phase: run.phase, event_ref: run.event_ref } } : {}) });
    }
    return found;
  };
  const queue = [...roots], processed = new Set();
  while (queue.length) {
    const ref = queue.shift();
    const found = add(ref);
    if (!found || processed.has(exact(found))) continue;
    processed.add(exact(found));
    const dependencies = read.refs(records.references(found.body), found.event_ref);
    const related = [];
    if (found.kind === "evidence") {
      for (const link of conditionLinks(loaded, found, read, true)) {
        const condition = add(exact(link.record));
        if (!condition) continue;
        related.push(exact(condition));
        if (includeSources) queue.push(exact(condition));
        for (const assumption of array(condition.body.assumption_refs)) {
          try { const bound = definitionBefore(loaded, assumption, condition.event_ref); add(exact(bound)); related.push(exact(bound)); }
          catch (error) { read.gaps.push({ kind: "record_gap", ref: assumption, code: error.code, message: error.message }); }
        }
      }
    }
    if (found.kind === "result_condition") for (const assumption of array(found.body.assumption_refs)) {
      try { const bound = definitionBefore(loaded, assumption, found.event_ref); add(exact(bound)); related.push(exact(bound)); }
      catch (error) { read.gaps.push({ kind: "record_gap", ref: assumption, code: error.code, message: error.message }); }
    }
    if (includeSources) queue.push(...dependencies);
    links.push({ ref: exact(found), ...(related.length ? { conditions_and_assumptions: unique(related) } : {}),
      ...(dependencies.length ? { lookup_refs: dependencies } : {}) });
  }
  return { requested: roots, records: [...bodies.values()], links, ...(read.gaps.length ? { gaps: read.gaps } : {}) };
}

function context(loaded, request = {}) {
  if (!request || typeof request !== "object" || Array.isArray(request)) fail("INVALID_INPUT", "Context request must be an object.");
  for (const field of ["refs", "records", "focus_refs"]) {
    if (Object.hasOwn(request, field) && !Array.isArray(request[field])) fail("INVALID_INPUT", field + " must be an array.");
  }
  const mode = Object.hasOwn(request, "mode") ? request.mode
    : Object.hasOwn(request, "focus_refs") ? "focused" : "brief";
  if (mode === "brief") return { ...snapshot(loaded), mode, sections: selection(loaded),
    lookup: { mode: "record", exact_references: true, header_ref: "e0" } };
  if (mode === "record") {
    const refs = recordRequests(request);
    if (!refs.length) fail("INVALID_INPUT", "Record context requires refs or records.");
    return { ...snapshot(loaded), mode, ...expanded(loaded, refs) };
  }
  if (mode === "focused") {
    if (array(request.focus_refs).some(ref => typeof ref !== "string" || !ref)) fail("INVALID_INPUT", "focus_refs must contain nonempty references.");
    const refs = unique([...array(request.focus_refs), ...recordRequests(request)]);
    if (!refs.length) fail("INVALID_INPUT", "Focused context requires focus_refs.");
    const selected = selection(loaded);
    return { ...snapshot(loaded), mode, ...expanded(loaded, refs, true),
      continuation: selected.filter(section => ["purpose", "user_context", "questions", "work"].includes(section.id)) };
  }
  if (mode === "status") return { ...snapshot(loaded), mode, state: structuredClone(loaded.state),
    user_messages: loaded.entries.filter(entry => entry.type === "user_message").map(entry => ({ ref: entry.id })),
    pending_user_messages: records.pendingMessages(loaded).map(entry => entry.id || entry.ref) };
  fail("INVALID_INPUT", "Unknown v8 context mode: " + mode + ".");
}

const escape = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const href = value => value.replace(/\\/g, "/").split("/").map(encodeURIComponent).join("/");
function indexHtml(loaded) {
  const reports = array(loaded.state.runs).filter(run => run.kind === "report" && run.phase === "completed");
  const sections = reports.map(run => {
    let body;
    try {
      const bytes = readFile(loaded.root, run.manifest_ref);
      if (sha256(bytes) !== run.manifest_sha256) fail("MANIFEST_CHANGED", "Recorded manifest does not match.");
      const manifest = JSON.parse(bytes);
      if (![manifest.run_ref, manifest.run_id, manifest.ref].includes(run.ref)) fail("MANIFEST_CHANGED", "Manifest work identity differs.");
      const prefix = path.posix.dirname(run.manifest_ref.replace(/\\/g, "/")) + "/";
      const link = (file, text) => {
        safePath(loaded.root, prefix + file);
        return '<a href="' + href(prefix + file) + '">' + escape(text || file) + "</a>";
      };
      if (manifest.deliverable) {
        const delivered = descriptor(manifest.deliverable, manifest);
        body = '<p class="primary">' + link(delivered.primary, "Open report") + "</p>";
        if (delivered.companions.length) body += "<p>Companions: " + delivered.companions.map(file => link(file)).join(" · ") + "</p>";
        if (delivered.reproduction_entrypoint) body += "<p>Reproduction entrypoint: " + link(delivered.reproduction_entrypoint) + " (use a fresh copy with the saved inputs)</p>";
      } else body = "<p>Primary not designated in this historical manifest.</p><ul>" + array(manifest.output_paths).map(file => "<li>" + link(file) + "</li>").join("") + "</ul>";
      if (manifest.claim_boundary) body += "<p>Claim boundary: " + escape(manifest.claim_boundary) + "</p>";
      body += '<p><a href="' + href(run.manifest_ref) + '">Files and provenance</a></p>';
    } catch (error) { body = "<p>Manifest unavailable: " + escape(error.message) + "</p>"; }
    const parentRef = run.parent_run_ref || run.parent_run_id;
    const parentRun = array(loaded.state.runs).find(item => item.ref === parentRef);
    const parentHref = parentRun && (reports.includes(parentRun) ? "#" + parentRun.ref : href(parentRun.manifest_ref || parentRun.plan_ref));
    const parent = parentRef ? "<p>Parent run: " + (parentHref ? '<a href="' + parentHref + '">' + escape(parentRef) + "</a>" : escape(parentRef)) + "</p>" : "";
    return '<section id="' + escape(run.ref) + '"><h2>' + escape(run.ref) + "</h2>" + parent + body + "</section>";
  });
  return INDEX_MARKER + '\n<!doctype html>\n<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Project reports</title><style>body{font:17px/1.55 system-ui,sans-serif;max-width:850px;margin:3rem auto;padding:0 1.5rem;color:#182333;background:#fafbfd}section{border-top:1px solid #d6dce5;padding:1rem 0}h2{font-size:1rem;overflow-wrap:anywhere}a{color:#1556a2}.primary{font-size:1.2rem}p,li{overflow-wrap:anywhere}</style><h1>Project reports</h1><p>' + escape(loaded.state.state_meta.project_id) + '</p><p><a href="case-brief.md">Case brief</a> · <a href="project.yaml">Recorded state</a></p>' + (sections.join("\n") || "<p>No completed reports are recorded.</p>") + '<footer>Generated from committed report manifests. Completion and file checks do not establish scientific validity. Revisions retain their original sources.</footer></html>\n';
}

module.exports = { build, context, indexHtml };
