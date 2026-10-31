"use strict";

// Format-specific persistence. The v7 store remains the reader/writer of v7 cases.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const files = require("../files.cjs");
const { fail, canonical, sha256, rootPath, safePath, readFile, writeNew, atomicWrite, ensureDirectory, withLock, assertNotLegacy } = files;
const records = require("./records.cjs");
const FORMAT = "consultation-journal-v8";
const TYPES = new Set(["user_message", "knowledge", "interpretation", "scope", "decision", "review", "reply_prepared", "reply_recorded", "work", "correction"]);
const RUN_OPS = new Set(["start-run", "write-run-file", "finalize-run", "fail-run", "abandon-run"]);
const ID = /^[a-z][a-z0-9_-]{0,79}$/;
const HASH = /^[a-f0-9]{64}$/;
const clone = value => structuredClone(value);

function parse(bytes, label) {
  try { return JSON.parse(Buffer.isBuffer(bytes) ? bytes.toString("utf8") : bytes); }
  catch { fail("CORRUPT_STATE", label + " is not valid JSON."); }
}
function object(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("INVALID_INPUT", label + " must be an object.");
}
function formatAt(projectRoot) {
  const candidate = path.resolve(projectRoot);
  if (!fs.existsSync(candidate)) return null;
  const root = rootPath(candidate);
  assertNotLegacy(root);
  let bytes;
  try { bytes = readFile(root, "journal.jsonl"); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
  const end = bytes.indexOf(10);
  if (end < 0) fail("INCOMPLETE_JOURNAL", "The journal has no complete opening record.");
  const first = parse(bytes.subarray(0, end), "Journal opening record");
  if (first.format === FORMAT) return FORMAT;
  if (first.schema_version === 7 && first.type === "init") return "v7";
  fail("UNSUPPORTED_FORMAT", "The journal format is not supported; no files were changed.");
}
function unsigned(value) {
  const copy = clone(value);
  delete copy._meta.integrity_hash;
  return copy;
}
function checkHash(value, label) {
  if (!value._meta || !HASH.test(value._meta.integrity_hash || "") || !HASH.test(value._meta.request_hash || "") ||
      sha256(canonical(unsigned(value))) !== value._meta.integrity_hash) fail("CORRUPT_STATE", label + " failed its integrity check.");
}
function read(projectRoot, allowTail = false) {
  const root = rootPath(projectRoot);
  assertNotLegacy(root);
  let bytes;
  try { bytes = readFile(root, "journal.jsonl"); }
  catch (error) { if (error.code === "ENOENT") fail("NO_PROJECT", "No journal exists in this folder."); throw error; }
  const end = bytes.lastIndexOf(10) + 1;
  const tail = bytes.subarray(end);
  if (tail.length && !allowTail) fail("INCOMPLETE_JOURNAL", "Uncommitted trailing bytes need explicit recovery.");
  const lines = bytes.subarray(0, end).toString("utf8").split("\n").slice(0, -1);
  if (!lines.length) fail("CORRUPT_STATE", "No committed journal header exists.");
  const header = parse(lines[0], "Journal header");
  if (header.format !== FORMAT || !ID.test(header.case || "") || typeof header.created_at !== "string") fail("UNSUPPORTED_FORMAT", "Expected a v8 journal header.");
  checkHash(header, "Journal header");
  const entries = [];
  const requests = new Set();
  let state = records.emptyState(header), previousHash = header._meta.integrity_hash;
  for (let index = 1; index < lines.length; index++) {
    const entry = parse(lines[index], "Journal entry " + index);
    if (entry.id !== "e" + index || !TYPES.has(entry.type) || typeof entry.recorded_at !== "string" || !entry.data || typeof entry.data !== "object" || Array.isArray(entry.data)) {
      fail("CORRUPT_STATE", "Invalid identity, type or content at journal entry " + index + ".");
    }
    checkHash(entry, entry.id);
    if (entry._meta.previous_hash !== previousHash || requests.has(entry._meta.request_hash)) fail("CORRUPT_STATE", "Journal order or request identity is inconsistent at " + entry.id + ".");
    try { state = records.apply(state, entry, entries); }
    catch (error) { fail("CORRUPT_STATE", entry.id + ": " + error.message); }
    entries.push(entry);
    requests.add(entry._meta.request_hash);
    previousHash = entry._meta.integrity_hash;
  }
  const loaded = { root, header, entries, state, tail, committed_bytes: bytes.subarray(0, end) };
  let projected;
  try { projected = parse(readFile(root, "project.yaml"), "Project export"); }
  catch (error) { if (!["ENOENT", "CORRUPT_STATE"].includes(error.code)) throw error; }
  loaded.projection_current = projected !== undefined && canonical(projected) === canonical(project(loaded));
  return loaded;
}
function project(loaded) { return loaded.state; }
function token(loaded, head = loaded.state.state_meta.last_event_id) { return loaded.header.case + ":" + head; }
function envelope(loaded) {
  return { ok: true, version: require("../../../package.json").version, journal_schema: 8, journal_format: FORMAT,
    project_id: loaded.header.case, last_event_id: loaded.state.state_meta.last_event_id,
    state_token: token(loaded), projection_current: loaded.projection_current };
}
function checkToken(loaded, at) {
  if (typeof at !== "string" || !at.includes(":")) fail("INVALID_INPUT", "Use the at state_token from the latest read or successful write.");
  const split = at.lastIndexOf(":");
  if (at.slice(0, split) !== loaded.header.case) fail("WRONG_PROJECT", "This request belongs to another case.");
  if (at.slice(split + 1) !== loaded.state.state_meta.last_event_id) fail("STALE_WRITE", "Read current context before submitting a new operation.", { current_state_token: token(loaded) });
}
function append(root, entry) {
  const fd = fs.openSync(safePath(root, "journal.jsonl"), fs.constants.O_WRONLY | fs.constants.O_APPEND | (fs.constants.O_NOFOLLOW || 0));
  try {
    const bytes = Buffer.from(canonical(entry) + "\n");
    let offset = 0;
    while (offset < bytes.length) offset += fs.writeSync(fd, bytes, offset, bytes.length - offset);
    fs.fsyncSync(fd);
  } finally { fs.closeSync(fd); }
}
function refresh(loaded) {
  const result = { current_last_event_id: loaded.state.state_meta.last_event_id, projection_written: false, brief_written: false, index_written: false };
  const exportOne = (flag, relative, build) => {
    try { atomicWrite(loaded.root, relative, build()); result[flag] = true; }
    catch (error) { result[flag.replace("_written", "_error")] = { code: error.code || "IO_ERROR", message: error.message }; }
  };
  exportOne("projection_written", "project.yaml", () => JSON.stringify(project(loaded), null, 2) + "\n");
  exportOne("brief_written", "case-brief.md", () => require("./views.cjs").build(loaded).markdown);
  exportOne("index_written", "index.html", () => {
    const marker = require("../deliverables.cjs").INDEX_MARKER;
    if (fs.existsSync(safePath(loaded.root, "index.html")) && !readFile(loaded.root, "index.html").toString("utf8").startsWith(marker)) {
      fail("FILE_EXISTS", "index.html belongs to another author; it was not replaced.");
    }
    return require("./views.cjs").indexHtml(loaded);
  });
  try {
    const scopes = loaded.state.action_scopes || [];
    if (scopes.length) ensureDirectory(loaded.root, "scopes");
    for (const scope of scopes) {
      const destination = "scopes/" + scope.ref + ".md";
      const body = "# Saved work scope " + scope.ref + "\n\nGenerated from " + loaded.header.case + ":" + scope.ref + ".\n\n```json\n" + JSON.stringify(scope, null, 2) + "\n```\n";
      atomicWrite(loaded.root, destination, body);
    }
  } catch (error) { result.scope_export_error = { code: error.code || "IO_ERROR", message: error.message }; }
  if (!result.projection_written || !result.brief_written || !result.index_written || result.scope_export_error) {
    result.warning = "History is committed. Rebuild stale exports with recover; do not repeat the intake, decision or work.";
  }
  if (result.projection_written) loaded.projection_current = true;
  result.projection_current = loaded.projection_current;
  return result;
}
function receipt(loaded, entry, extra = {}) {
  const result = { ...envelope(loaded),
    committed: true, entry_ref: entry.id, type: entry.type, ...extra };
  if (entry._meta.aliases) result.authoring_refs = clone(entry._meta.aliases);
  if (entry.type === "reply_prepared") {
    try {
      Object.assign(result, require("./workflow.cjs").render(loaded, entry));
      const relative = "replies/" + entry.id + ".md";
      ensureDirectory(loaded.root, "replies");
      const rendered = result.response_markdown ?? result.markdown;
      if (typeof rendered !== "string") fail("INVALID_RESPONSE", "The prepared response renderer returned no Markdown.");
      atomicWrite(loaded.root, relative, rendered + "\n");
      result.response_path = path.resolve(loaded.root, relative);
    } catch (error) { result.response_export_error = { code: error.code || "IO_ERROR", message: error.message }; }
  }
  if (entry.type === "work") {
    try { Object.assign(result, require("./runs.cjs").receipt(loaded, entry)); }
    catch (error) { result.receipt_recovery_error = { code: error.code || "IO_ERROR", message: error.message }; }
  }
  return result;
}
function init(projectRoot, input = {}) {
  object(input, "Initialization");
  if (Object.keys(input).some(key => !["format", "case"].includes(key)) || input.format && input.format !== FORMAT) fail("INVALID_INPUT", "New-case initialization accepts only format and optional case. Record purpose with its source after initialization.");
  const root = rootPath(projectRoot, true);
  return withLock(root, () => {
    if (fs.existsSync(safePath(root, "journal.jsonl"))) {
      const loaded = read(root);
      if (input.case && input.case !== loaded.header.case) fail("WRONG_PROJECT", "The folder already contains another case.");
      return { ...envelope(loaded), already_initialized: true };
    }
    if (["project.yaml", "case-brief.md"].some(name => fs.existsSync(safePath(root, name)))) fail("ORPHAN_PROJECTION", "Generated memory exists without its journal; preserve it and recover the original history.");
    const caseId = input.case || "case-" + crypto.randomUUID();
    if (!ID.test(caseId)) fail("INVALID_INPUT", "case must be a lowercase local case identity.");
    const header = { format: FORMAT, case: caseId, created_at: new Date().toISOString(), _meta: { request_hash: sha256(canonical(input)) } };
    header._meta.integrity_hash = sha256(canonical(header));
    writeNew(root, "journal.jsonl", canonical(header) + "\n");
    const loaded = { root, header, entries: [], state: records.emptyState(header), projection_current: false };
    return { ...envelope(loaded), initialized: true, ...refresh(loaded) };
  });
}
function submit(projectRoot, input) {
  object(input, "Submission");
  const { at, op, ...authored } = input;
  if (!TYPES.has(op) && !RUN_OPS.has(op)) fail("INVALID_INPUT", "Unknown v8 operation: " + op);
  if (op === "work") fail("INVALID_INPUT", "Use the managed start/finalize/fail/abandon-run operations for work lifecycle.");
  const requestHash = sha256(canonical(input));
  const root = rootPath(projectRoot);
  return withLock(root, () => {
    const loaded = read(root);
    const prior = loaded.entries.find(entry => entry._meta.request_hash === requestHash);
    if (prior) return receipt(loaded, prior, { replayed: true, ...refresh(loaded) });
    checkToken(loaded, at);
    if (op === "write-run-file") return { ...envelope(loaded), ...require("./runs.cjs").write(loaded, authored) };
    const id = "e" + (loaded.entries.length + 1);
    const allocated = records.allocate(loaded.state, clone(authored), id);
    let data = records.normalize(loaded.state, allocated.data), type = op, additional = {};
    const workflow = require("./workflow.cjs");
    if (RUN_OPS.has(op)) {
      const prepared = require("./runs.cjs").prepare(loaded, op, data, id);
      type = prepared.type; data = prepared.data; additional = prepared.result || {};
    } else data = workflow.prepare(loaded, type, data, id);
    // A no-op receipt does not assert handling, a new observation or a new decision.
    if (type === "knowledge" && Object.keys(data).every(key => key === "updates") && !(data.updates || []).length) {
      return { ...envelope(loaded), committed: false, no_op: true, authoring_refs: allocated.refs };
    }
    const entry = { id, recorded_at: new Date().toISOString(), type, data,
      _meta: { request_hash: requestHash, previous_hash: loaded.entries.at(-1)?._meta.integrity_hash || loaded.header._meta.integrity_hash,
        ...(Object.keys(allocated.refs || {}).length ? { aliases: allocated.refs } : {}) } };
    entry._meta.integrity_hash = sha256(canonical(entry));
    workflow.validate(loaded, entry);
    const next = records.apply(loaded.state, entry, loaded.entries);
    try { append(root, entry); }
    catch (error) { fail("COMMIT_UNCERTAIN", "The append did not finish normally. Read history before retrying the exact request.", { entry_ref: id, cause: error.message }); }
    const committed = { ...loaded, state: next, entries: [...loaded.entries, entry], projection_current: false };
    return receipt(committed, entry, { replayed: false, ...additional, ...refresh(committed) });
  });
}
function context(projectRoot, request = {}) {
  const loaded = read(projectRoot);
  return { ...envelope(loaded), ...require("./views.cjs").context(loaded, request) };
}
function status(projectRoot) { return context(projectRoot, { mode: "status" }); }
function history(projectRoot, options = {}) {
  const loaded = read(projectRoot);
  const limit = options.limit === undefined ? 20 : Number(options.limit), offset = options.cursor === undefined ? 0 : Number(options.cursor);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset) || offset < 0) fail("INVALID_INPUT", "Use a nonnegative cursor and limit between 1 and 100.");
  let entries = loaded.entries;
  if (options.event_id) entries = entries.filter(entry => entry.id === options.event_id);
  if (options.type) entries = entries.filter(entry => entry.type === options.type);
  if (options.record_id) entries = entries.filter(entry => entry.id === options.record_id || records.definitions(entry).some(item => [item.ref, item.record_ref, item.entity].includes(options.record_id)));
  if (options.query) entries = entries.filter(entry => JSON.stringify(entry.data).toLowerCase().includes(String(options.query).toLowerCase()));
  return { ...envelope(loaded), entries: entries.slice(offset, offset + limit), next_cursor: offset + limit < entries.length ? String(offset + limit) : null };
}
function recover(projectRoot, options = {}) {
  const root = rootPath(projectRoot);
  return withLock(root, () => {
    const loaded = read(root, options.repair_tail === true);
    let preserved_tail;
    if (loaded.tail.length) {
      ensureDirectory(root, "recovery");
      preserved_tail = "recovery/uncommitted-" + crypto.randomUUID() + ".bin";
      writeNew(root, preserved_tail, loaded.tail);
      atomicWrite(root, "journal.jsonl", loaded.committed_bytes);
    }
    const exports = refresh(loaded), response_export_errors = [];
    let responses_written = 0;
    for (const entry of loaded.entries.filter(value => value.type === "reply_prepared")) {
      const rebuilt = receipt(loaded, entry);
      if (rebuilt.response_export_error) response_export_errors.push({ entry_ref: entry.id, ...rebuilt.response_export_error });
      else responses_written++;
    }
    return { ...envelope(loaded), recovered: true, ...(preserved_tail ? { preserved_tail } : {}), ...exports,
      responses_written, ...(response_export_errors.length ? { response_export_errors,
        warning: "Committed history remains intact, but some prepared-response exports still need repair." } : {}) };
  });
}
function verify(projectRoot, options = {}) { return require("./runs.cjs").verify(read(projectRoot), options); }
function capabilities() {
  return { ok: true, version: require("../../../package.json").version, journal_schema: 8,
    default_journal_format: FORMAT, supported_journal_formats: [FORMAT, "v7"],
    capabilities: ["canonical-memory-v8", "content-authoring-v8", "six-section-brief-v8", "exact-record-read-v8", "agent-recorded-reply-v1", "actual-reply-reconciliation-v1", "four-section-responses-v1"],
    compatibility: "Existing v7 journals use their unchanged codec and instructions; no in-place conversion.",
    verification: "Capability declarations do not establish runtime or scientific validity; consult the release's recorded validation evidence." };
}

module.exports = { FORMAT, formatAt, read, project, envelope, token, checkToken, refresh, init, submit, status, context, history, recover, verify, capabilities };
