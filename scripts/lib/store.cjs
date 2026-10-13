"use strict";

const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");
const {
  fail, canonical, sha256, rootPath, safePath, ensureDirectory, readFile,
  writeNew, atomicWrite, assertNotLegacy, withLock
} = require("./files.cjs");
const { PUBLIC_TYPES, emptyState, validateSemantic, applyEvent, createReplayBuilder } = require("./model.cjs");

const TYPES = new Set(["init", ...PUBLIC_TYPES,
  "run_started", "run_finalized", "run_failed", "run_abandoned"]);
const ID = /^[a-z][a-z0-9_-]{0,79}$/;
function id(value, label) {
  if (typeof value !== "string" || !ID.test(value)) fail("INVALID_INPUT", label + " must be a lowercase project-local ID.");
}
function parseJSON(bytes, label) {
  try { return JSON.parse(bytes.toString("utf8")); }
  catch { fail("CORRUPT_STATE", label + " is not valid JSON."); }
}
function payloadHash(request) {
  const copy = { ...request };
  delete copy.expected_last_event_id;
  return sha256(canonical(copy));
}
function readJournal(root, allowTail = false) {
  assertNotLegacy(root);
  let bytes;
  try { bytes = readFile(root, "journal.jsonl"); }
  catch (error) {
    if (error.code === "ENOENT") fail("NO_PROJECT", "No v7 journal exists. Initialize a new v7 project explicitly.");
    throw error;
  }
  const end = bytes.lastIndexOf(10) + 1;
  const tail = bytes.subarray(end);
  if (tail.length && !allowTail) fail("INCOMPLETE_JOURNAL", "Uncommitted trailing bytes need explicit recovery.", { trailing_bytes: tail.length });
  const lines = bytes.subarray(0, end).toString("utf8").split("\n");
  lines.pop();
  if (!lines.length) fail("CORRUPT_STATE", "The journal has no committed initialization event.");
  const events = [];
  const seen = new Set();
  let state, replay;
  for (let index = 0; index < lines.length; index++) {
    const event = parseJSON(Buffer.from(lines[index]), "Journal record " + (index + 1));
    if (!event || typeof event !== "object" || Array.isArray(event)) fail("CORRUPT_STATE", "Invalid journal envelope.");
    const { sha256: hash, ...unsigned } = event;
    if (hash !== sha256(canonical(unsigned))) fail("CORRUPT_STATE", "Journal content hash mismatch at record " + (index + 1));
    if (event.schema_version !== 7 || event.sequence !== index + 1 || !TYPES.has(event.type) ||
        !ID.test(event.event_id) || seen.has(event.event_id) || typeof event.timestamp !== "string" ||
        !/^[a-f0-9]{64}$/.test(event.request_sha256 || "")) {
      fail("CORRUPT_STATE", "Invalid journal identity, sequence, or event type.");
    }
    if (index === 0) {
      if (event.type !== "init" || event.previous_event_id !== null || !ID.test(event.project_id)) {
        fail("CORRUPT_STATE", "The first event must initialize one project.");
      }
      state = emptyState(event.project_id, event.timestamp);
      replay = createReplayBuilder(event.project_id, event.timestamp);
    } else if (event.type === "init" || event.project_id !== state.state_meta.project_id ||
        event.previous_event_id !== events[index - 1].event_id) {
      fail("CORRUPT_STATE", "Journal predecessor or project identity mismatch.");
    }
    try {
      state = replay.apply(event);
    } catch (error) {
      fail("CORRUPT_STATE", "Invalid committed event " + event.event_id + ": " + error.message);
    }
    seen.add(event.event_id);
    events.push(event);
  }
  let projection = null;
  try { projection = parseJSON(readFile(root, "project.yaml"), "Projection"); }
  catch (error) {
    if (!["ENOENT", "CORRUPT_STATE"].includes(error.code)) throw error;
  }
  return { root, state, events, tail, committed_bytes: bytes.subarray(0, end),
    projection_current: projection !== null && canonical(projection) === canonical(state) };
}

function receipt(event, extra = {}, root) {
  return { ok: true, project_id: event.project_id, last_event_id: event.event_id,
    state_token: require("./authoring.cjs").stateToken(event.project_id, event.event_id),
    sequence: event.sequence, committed: true,
    committed_records: require("./record-lookup.cjs").definitionsInEvent(event).map(({ record_ref, event_ref, collection }) => ({ record_ref, event_ref, collection })),
    ...(extra.replayed && event.payload.run && root ? require("./runs.cjs").replayReceipt(root, event) : {}), ...extra,
    ...(event.type === "exchange_prepared" ? require("./exchanges.cjs").exchangeReceipt(event) : {}),
    ...(event.type === "exchange_prepared" && root ? require("./delivery.cjs").savePrepared(root, event) : {}),
    ...(event.payload.delivery?.observed_response_sha256 ? {
      correspondence: require("./exchanges.cjs").deliveryCorrespondence(event.payload.delivery),
      observed_response_sha256: event.payload.delivery.observed_response_sha256,
      observed_response_path: event.payload.delivery.source_ref,
      ...(event.payload.delivery.response_span ? { response_span: event.payload.delivery.response_span } : {})
    } : {}),
    ...(require("./exchanges.cjs").isAgentRecorded(event.payload.delivery) ? {
      correspondence: "agent_recorded", reply_attribution: "agent_recorded",
      actual_source_ref: event.payload.delivery.source_ref,
      before_incoming_ref: event.payload.delivery.agent_recording.before_incoming_ref,
      before_incoming_event_ref: event.payload.delivery.agent_recording.before_incoming_event_ref,
      ...(event.payload.delivery.agent_recording.capture_ref ? {
        capture_ref: event.payload.delivery.agent_recording.capture_ref,
        recorded_items_role: "agent_interpretation_of_captured_message"
      } : {}),
      ...(event.payload.delivery.agent_recording.supersedes_recording_ref ? {
        supersedes_recording_ref: event.payload.delivery.agent_recording.supersedes_recording_ref
      } : {}),
      recorded_response_items: require("./exchanges.cjs").recordedItems(event.payload.delivery)
    } : {}) };
}
function capabilities() {
  return { ok: true, version: require("../../package.json").version, journal_schema: 7,
    capabilities: ["compact-memory-views-v1", "exact-record-read-v1", "assisted-authoring-v1", "agent-recorded-reply-v1", "actual-reply-reconciliation-v1", "claude-transcript-capture-v1", "four-section-responses-v1", "visible-scope-answers-v1", "section-item-labels-v1", "message-bound-delivery-v2", "pending-intake-v1", "durable-exchanges-v1", "user-question-routing-v1", "consultation-loop-v1", "captured-delivery-v1", "proposal-preflight-v1", "intact-reply-recovery-v1", "source-attributed-memory-v1", "reply-reconciliation-v1", "case-brief-v1", "compact-proposals-v1", "concise-authoring-v1", "conversational-responses-v1", "deferred-release-v1", "operational-summary-v1", "report-deliverables-v1", "report-presentation-adjustment-v1"],
    renderers: [...require("./exchanges.cjs").RENDERERS],
    compatibility: { minimum_extension_reader: "7.0.7", historical_events: "replayed unchanged",
      additional_reader_requirements: { captured_observations: "captured-delivery-v1", recovered_observations: "intact-reply-recovery-v1", reconciled_questions_and_paused_acceptance: "reply-reconciliation-v1", case_brief_selections_and_message_coverage: "case-brief-v1", compact_proposal_exchanges: "compact-proposals-v1 (7.0.11); full saved scope export with lead-markdown-v5", conversational_exchanges: "conversational-responses-v1 (7.0.13); lead-markdown-v6", flat_option_exchanges: "7.5.1; lead-markdown-v7", sectioned_exchanges: "7.5.2; lead-markdown-v8", four_section_exchanges: "7.5.3; lead-markdown-v9; response explanations and derived items", message_bound_delivery: "7.5.3; captured-delivery-v2 and message-bound-delivery-v2", pending_intakes: "7.5.3; primary-message-v1 source marker", deferred_analysis_inputs: "deferred-release-v1 (7.2.0); one unreleased analysis input" },
      new_report_reader: "7.5.0 for report-deliverables-v1 and report-presentation-adjustment-v1; legacy plans and manifests retain their frozen contracts",
      visible_scope_answer_reader: "7.5.4 for visible-scope-answers-v1; lead-markdown-v10 links a sourced user-question answer to the same exchange's selectable scope",
      section_item_label_reader: "7.5.5 for section-item-labels-v1; lead-markdown-v11 displays A/Q/N labels and advisory item limits of 50, requested answers up to 200 and necessary public scope terms up to 100.",
      agent_recorded_reply_reader: "7.5.6 for agent-recorded-reply-v1; actual visible reply items and their following retained primary user message, with agent attribution and semantic scope mappings.",
      actual_reply_reconciliation_reader: "7.5.12 for actual-reply-reconciliation-v1; optional capture_ref and supersedes_recording_ref link interpretations of the same actual reply. Captured content and agent interpretation retain separate provenance; current views reconcile them while exact history and original acceptance stay unchanged.",
      agent_recorded_answer_disposition_reader: "7.5.9 for optional mapped answer status; older recordings remain readable. Current views separate question resolution from actual communication and route assessment from recorded execution.",
      compact_memory_reader: "7.5.7; --output-format compact-v1 returns memory-compact-v1 with shared record-version bodies and local locators. 7.5.10 preserves actual answer disposition as answer_status separately from lookup status. Legacy output remains the default; history remains full event search.",
      exact_record_reader: "7.5.7; context mode:record retrieves batched definitions, optionally at an exact defining event. Always compact; historical unbound dependencies are not silently replaced by current versions.",
      protected_work_enforcement: "helper identities, order, scope and current record versions; semantic consent and host bypass require observation",
      host_closeout_enforcement: "instruction_only", delivery: "observe-exchange records an agent's faithful reading of the actual visible reply or compares retained native capture bytes; agent recordings claim no exact-byte or host proof; historical hash-only observations are unverified" } };
}
function writeProjection(root, state, hooks = {}) {
  if (hooks.beforeProjection) hooks.beforeProjection();
  atomicWrite(root, "project.yaml", JSON.stringify(state, null, 2) + "\n");
}
function refreshDerived(loaded, hooks = {}, afterAppendError) {
  const result = { current_last_event_id: loaded.state.state_meta.last_event_id,
    projection_written: false, brief_path: "case-brief.md", brief_written: false,
    index_path: "index.html", index_written: false };
  try {
    if (afterAppendError) throw afterAppendError;
    writeProjection(loaded.root, loaded.state, hooks);
    result.projection_written = true;
  } catch (error) { result.projection_error = error.message; }
  try {
    if (hooks.beforeBrief) hooks.beforeBrief();
    atomicWrite(loaded.root, result.brief_path, require("./case-brief.cjs").buildCaseBrief(withFrozenInputs(loaded)).markdown);
    result.brief_written = true;
  } catch (error) { result.brief_error = error.message; }
  try {
    if (hooks.beforeIndex) hooks.beforeIndex();
    const deliverables = require("./deliverables.cjs");
    if (fs.existsSync(safePath(loaded.root, result.index_path)) && !readFile(loaded.root, result.index_path).toString("utf8").startsWith(deliverables.INDEX_MARKER)) {
      fail("FILE_EXISTS", "index.html belongs to another author; preserve it and choose a clear path before rebuilding the report index.");
    }
    atomicWrite(loaded.root, result.index_path, deliverables.indexHtml(loaded));
    result.index_written = true;
  } catch (error) { result.index_error = error.message; }
  if (!result.projection_written || !result.brief_written || !result.index_written) {
    result.warning = "History is committed, but a derived memory file could not be refreshed. Read current context or recover the files; do not repeat the work.";
  }
  return result;
}
// Read only known immutable plans once per loaded view, not the run tree.
function withFrozenInputs(loaded) {
  if (loaded.frozen_inputs) return loaded;
  loaded.frozen_inputs = []; loaded.frozen_input_issues = [];
  for (const run of loaded.state.runs) {
    if (!run.plan_ref) continue;
    try {
      const bytes = readFile(loaded.root, run.plan_ref);
      if (sha256(bytes) !== run.plan_sha256) fail("PLAN_CHANGED", "Plan hash differs.");
      const plan = parseJSON(bytes, "Frozen plan");
      if (plan.run_id !== run.run_id) fail("PLAN_CHANGED", "Plan run identity differs.");
      loaded.frozen_inputs.push(...(plan.inputs || []).map(input => ({ ...input, run_id: run.run_id })));
    } catch (error) { loaded.frozen_input_issues.push({ run_id: run.run_id, code: error.code || "IO_ERROR" }); }
  }
  return loaded;
}
function append(root, event) {
  const target = safePath(root, "journal.jsonl");
  const flags = fs.existsSync(target)
    ? fs.constants.O_WRONLY | fs.constants.O_APPEND | (fs.constants.O_NOFOLLOW || 0)
    : fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL;
  const fd = fs.openSync(target, flags, 0o600);
  try {
    const bytes = Buffer.from(canonical(event) + "\n");
    let written = 0;
    while (written < bytes.length) written += fs.writeSync(fd, bytes, written, bytes.length - written);
    fs.fsyncSync(fd);
  } finally { fs.closeSync(fd); }
}

// Producer runs inside the short writer lock. It performs only bookkeeping/file
// checks, never model reasoning or target computation. Public record cannot emit runs.
function transact(projectRoot, request, producer, options = {}) {
  if (!request || typeof request !== "object" || Array.isArray(request)) fail("INVALID_INPUT", "A mutation request must be an object.");
  if (!TYPES.has(options.eventType)) fail("INVALID_INPUT", "A transaction requires its expected event type.");
  const root = rootPath(projectRoot, options.initializing === true);
  assertNotLegacy(root);
  id(request.event_id, "event_id");
  const fingerprint = payloadHash(request);
  return withLock(root, () => {
    let loaded;
    if (options.initializing && !fs.existsSync(safePath(root, "journal.jsonl"))) {
      if (["project.yaml", "case-brief.md"].some(file => fs.existsSync(safePath(root, file)))) {
        fail("ORPHAN_PROJECTION", "A generated memory file exists without its authoritative journal.");
      }
      id(request.project_id, "project_id");
      loaded = { root, state: emptyState(request.project_id, new Date().toISOString()), events: [] };
    } else {
      loaded = readJournal(root);
    }
    const prior = loaded.events.find(e => e.event_id === request.event_id);
    if (prior) {
      // Keep the original request hash format so rc.1 events remain replayable.
      let matches = prior.request_sha256 === fingerprint;
      if (prior.type === options.eventType && !matches && options.legacyReplayRequest) {
        const legacy = options.legacyReplayRequest(prior);
        matches = legacy && legacy.event_id === request.event_id && legacy.expected_project_id === request.expected_project_id
          && prior.request_sha256 === payloadHash(legacy);
      }
      if (prior.type !== options.eventType || !matches) {
        fail("EVENT_CONFLICT", "This event ID was committed for a different operation or content.");
      }
      return receipt(prior, { replayed: true, ...refreshDerived(loaded, options.hooks) }, root);
    }
    if (options.initializing && loaded.events.length) fail("ALREADY_INITIALIZED", "This project is already initialized; no files were replaced.");
    if (!options.initializing) {
      if (request.expected_project_id !== loaded.state.state_meta.project_id) fail("WRONG_PROJECT", "The request belongs to a different project.");
      if (request.expected_last_event_id !== loaded.state.state_meta.last_event_id) {
        const known = loaded.events.findIndex(event => event.event_id === request.expected_last_event_id);
        const later = new Set(loaded.events.slice(known + 1).map(event => event.event_id));
        const changed = known < 0 ? [] : Object.entries(loaded.state.history_index)
          .filter(([, item]) => later.has(item.event_ref)).map(([ref, item]) => ({ ref, kind: item.kind, event_ref: item.event_ref }));
        fail("STALE_WRITE", "Project history changed. Read current state before revising the request.", {
          current_last_event_id: loaded.state.state_meta.last_event_id,
          expected_last_event_id: request.expected_last_event_id,
          changed_refs: changed.slice(0, 20), changed_ref_count: changed.length,
          ...(known < 0 ? { expected_event_unknown: true } : {})
        });
      }
    }
    if (Object.hasOwn(loaded.state.history_index, request.event_id)) {
      fail("DUPLICATE_ID", "Event identity is already present: " + request.event_id);
    }
    const prepared = producer(loaded);
    if (!prepared || !TYPES.has(prepared.type)) fail("INVALID_INPUT", "Unknown event type.");
    if (prepared.type !== options.eventType) fail("INVALID_EVENT", "Produced event does not match the requested operation.");
    const event = {
      schema_version: 7, project_id: loaded.state.state_meta.project_id,
      event_id: request.event_id, sequence: loaded.events.length + 1,
      previous_event_id: loaded.events.length ? loaded.events.at(-1).event_id : null,
      timestamp: new Date().toISOString(), type: prepared.type, payload: prepared.payload,
      request_sha256: fingerprint
    };
    event.sha256 = sha256(canonical(event));
    const next = applyEvent(loaded.state, event);
    if (options.hooks && options.hooks.beforeAppend) options.hooks.beforeAppend();
    try { append(root, event); }
    catch (error) {
      fail("COMMIT_UNCERTAIN", "Journal write did not finish normally. Inspect history before retrying this event.", {
        event_id: event.event_id, cause: error.message
      });
    }
    let afterAppendError;
    try { if (options.hooks?.afterAppend) options.hooks.afterAppend(); }
    catch (error) { afterAppendError = error; }
    return receipt(event, { replayed: false, ...(prepared.result || {}),
      ...refreshDerived({ root, state: next, events: [...loaded.events, event] }, options.hooks, afterAppendError) }, root);
  });
}
function init(projectRoot, request, options = {}) {
  if (!request || typeof request !== "object" || Array.isArray(request)) fail("INVALID_INPUT", "Initialization needs an object.");
  const allowed = ["project_id", "event_id", "project_understanding"];
  if (Object.keys(request).some(k => !allowed.includes(k))) fail("INVALID_INPUT", "Unknown initialization field.");
  return transact(projectRoot, request, ({ state }) => {
    const changes = { project_understanding: request.project_understanding || {} };
    validateSemantic(state, { event_id: request.event_id, expected_project_id: request.project_id,
      expected_last_event_id: null, type: "memory_updated", payload: { changes } });
    return { type: "init", payload: { project_understanding: changes.project_understanding, consultation_policy: require("./authorizations.cjs").POLICY },
      result: require("./writing.cjs").writingFeedback(state, { project_understanding: changes.project_understanding }) };
  }, { ...options, initializing: true, eventType: "init" });
}
function record(projectRoot, request, options = {}) {
  return transact(projectRoot, request, ({ root, state, events }) => {
    const authored = options.prepareRequest ? options.prepareRequest(root, state, request) : request;
    const submitted = require("./model.cjs").prepareMemoryWrite(state, authored);
    const prepared = require("./model.cjs").effectiveEvidenceWrite(state, submitted);
    require("./authorizations.cjs").prepareProposalWrite(state, prepared);
    if (require("./exchanges.cjs").COMPACT_RENDERERS.includes(prepared.payload?.exchange?.renderer) && Array.isArray(prepared.payload.exchange.response?.next_steps)) {
      for (const option of prepared.payload.exchange.response.next_steps) if (option?.scope_ref) {
        const scope_file = path.resolve(root, require("./exchanges.cjs").scopePath(option.scope_ref)).replace(/\\/g, "/");
        if (Object.hasOwn(option, "scope_file") && option.scope_file !== scope_file) fail("SCOPE_MISMATCH", "The scope-file locator must identify this project's derived saved scope.");
        option.scope_file = scope_file;
      }
    }
    if (prepared.payload.delivery) require("./recorded-reply.cjs").prepareRecording(prepared.payload.delivery, events);
    validateSemantic(state, prepared);
    require("./model.cjs").validateMemoryWrite(state, submitted, events);
    require("./exchanges.cjs").validateInterpretationWrite(state, prepared.payload, events);
    require("./authorizations.cjs").validateProposalWrite(state, prepared, root);
    if (prepared.payload.delivery) require("./delivery.cjs").validateWrite(root, prepared.payload.delivery, state, events);
    for (const evidence of submitted.payload.changes?.evidence || []) {
      if (evidence.kind === "computed") require("./runs.cjs").assertComputedEvidence(root, state, evidence);
    }
    return { type: prepared.type, payload: prepared.payload,
      result: { ...require("./writing.cjs").writingFeedback(state, request.payload),
        ...require("./writing.cjs").responseFeedback(prepared.payload.exchange) } };
  }, { ...options, eventType: request?.type });
}
function orphanRuns(root, state) {
  const directory = safePath(root, "runs");
  if (!fs.existsSync(directory)) return [];
  if (!fs.statSync(directory).isDirectory()) fail("UNSAFE_PATH", "runs must be a directory.");
  const known = new Set(state.runs.map(r => r.run_id));
  return fs.readdirSync(directory).filter(name => !known.has(name));
}
function readFormat(value) {
  if (value !== undefined && !["legacy", "compact-v1"].includes(value)) fail("INVALID_INPUT", "Output format must be legacy or compact-v1.");
  return value === "compact-v1";
}
function readEnvelope(loaded) {
  return { ok: true, version: require("../../package.json").version, journal_schema: 7,
    project_id: loaded.state.state_meta.project_id,
    last_event_id: loaded.state.state_meta.last_event_id, sequence: loaded.state.state_meta.sequence,
    state_token: require("./authoring.cjs").stateToken(loaded.state.state_meta.project_id, loaded.state.state_meta.last_event_id),
    projection_current: loaded.projection_current };
}
function status(projectRoot, outputFormat) {
  const compact = readFormat(outputFormat);
  const loaded = readJournal(rootPath(projectRoot));
  const { history_index, ...context } = loaded.state;
  const result = { ...capabilities(), project: context, projection_current: loaded.projection_current,
    orphan_run_paths: orphanRuns(loaded.root, loaded.state),
    incomplete_run_ids: loaded.state.runs.filter(r => r.status === "in_progress").map(r => r.run_id),
    ...memoryViews(loaded) };
  return compact ? require("./compact-memory.cjs").compactRead(loaded, { ...result, ...readEnvelope(loaded) }) : result;
}
function memoryViews(loaded, selected) {
  if (!loaded.state.state_meta.protocol && !loaded.state.state_meta.consultation_policy && !loaded.state.user_context?.length && !loaded.state.result_conditions?.length) return {};
  return { views: require("./views.cjs").buildViews(loaded, selected) };
}
function context(projectRoot, request = {}, outputFormat) {
  const compact = readFormat(outputFormat);
  const loaded = readJournal(rootPath(projectRoot));
  if (request?.mode === "record") {
    if (outputFormat === "legacy") fail("INVALID_INPUT", "Exact record mode always returns compact output; omit --output-format or use compact-v1.");
    return { ...readEnvelope(loaded), ...require("./record-lookup.cjs").exactContext(loaded, request) };
  }
  if (request && Object.hasOwn(request, "mode")) {
    require("./context.cjs").briefRequestShape(request, loaded.state);
    const assembled = require("./case-brief.cjs").buildCaseBrief(withFrozenInputs(loaded));
    const conversation = require("./conversation-window.cjs").buildRecentConversation(loaded);
    const unfinished = structuredClone(assembled.unfinished);
    for (const intake of conversation.recent_intakes) for (const pending of intake.unfinished) {
      if (!pending.reasons.includes("actual_capture_unavailable")) continue;
      const recordRef = loaded.state.turns?.find(turn => turn.interpretation_ref === pending.interpretation_ref)?.turn_id || pending.interpretation_ref;
      const retained = unfinished.find(item => item.record_ref === recordRef);
      if (retained) retained.reasons = [...new Set([...retained.reasons, ...pending.reasons])];
      else unfinished.push({ kind: "turn", record_ref: recordRef, reasons: pending.reasons,
        related_refs: [pending.interpretation_ref, pending.exchange_ref].filter(Boolean), retrieval: pending.retrieval });
    }
    let fileCurrent = false;
    try { fileCurrent = readFile(loaded.root, "case-brief.md").equals(Buffer.from(assembled.markdown, "utf8")); }
    catch { /* Missing, unreadable or stale exports do not change journal-derived context. */ }
    if (compact) return require("./compact-memory.cjs").compactBrief(loaded,
      { ...assembled, unfinished, file_current: fileCurrent }, conversation,
      { ...readEnvelope(loaded), consultation_policy: loaded.state.state_meta.consultation_policy || null,
        orphan_run_paths: orphanRuns(loaded.root, loaded.state) });
    return { ...capabilities(), project_id: loaded.state.state_meta.project_id,
      last_event_id: loaded.state.state_meta.last_event_id, sequence: loaded.state.state_meta.sequence,
      state_token: require("./authoring.cjs").stateToken(loaded.state.state_meta.project_id, loaded.state.state_meta.last_event_id),
      consultation_policy: loaded.state.state_meta.consultation_policy || null,
      projection_current: loaded.projection_current, orphan_run_paths: orphanRuns(loaded.root, loaded.state),
      brief: { format: "case-brief-v1", markdown: assembled.markdown, recent_intakes: conversation.recent_intakes,
        unfinished, coverage: { case: assembled.coverage, conversation: conversation.coverage }, file_current: fileCurrent } };
  }
  const selected = require("./context.cjs").selectContext(loaded, request);
  const result = { ...capabilities(), project_id: loaded.state.state_meta.project_id,
    last_event_id: loaded.state.state_meta.last_event_id, sequence: loaded.state.state_meta.sequence,
    state_token: require("./authoring.cjs").stateToken(loaded.state.state_meta.project_id, loaded.state.state_meta.last_event_id),
    projection_current: loaded.projection_current, orphan_run_paths: orphanRuns(loaded.root, loaded.state), ...selected,
    ...memoryViews(loaded, selected) };
  return compact ? require("./compact-memory.cjs").compactRead(loaded, result) : result;
}
function history(projectRoot, options = {}) {
  const { events } = readJournal(rootPath(projectRoot));
  const cursor = Number(options.cursor || 0);
  const limit = Number(options.limit || 10);
  if (!Number.isSafeInteger(cursor) || cursor < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    fail("INVALID_INPUT", "History needs a nonnegative cursor and a limit from 1 to 100.");
  }
  const chosen = events.filter(e => {
    if (options.event_id && e.event_id !== options.event_id) return false;
    if (options.type && e.type !== options.type) return false;
    if (options.record_id && !canonical(e.payload).includes(JSON.stringify(options.record_id))) return false;
    if (options.query && !canonical(e).toLowerCase().includes(String(options.query).toLowerCase())) return false;
    return true;
  });
  const page = chosen.slice(cursor, cursor + limit);
  return { ok: true, events: page, total: chosen.length,
    next_cursor: cursor + page.length < chosen.length ? cursor + page.length : null };
}
function recover(projectRoot, options = {}) {
  const root = rootPath(projectRoot);
  return withLock(root, () => {
    const loaded = readJournal(root, options.repair_tail === true);
    let preservedTail;
    if (loaded.tail.length) {
      if (!options.repair_tail) fail("INCOMPLETE_JOURNAL", "Explicit trailing-byte repair is required.");
      ensureDirectory(root, "recovery");
      preservedTail = "recovery/journal-tail-" + crypto.randomUUID() + ".bin";
      writeNew(root, preservedTail, loaded.tail);
      atomicWrite(root, "journal.jsonl", loaded.committed_bytes);
    }
    return { ok: true, project_id: loaded.state.state_meta.project_id,
      last_event_id: loaded.state.state_meta.last_event_id,
      ...refreshDerived(loaded, options.hooks), ...(preservedTail ? { preserved_tail: preservedTail } : {}) };
  });
}

module.exports = { id, parseJSON, readJournal, transact, init, record, status, context, history, recover, orphanRuns, capabilities };
