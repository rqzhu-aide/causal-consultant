"use strict";

// Authoring shorthand only. Expanded records use the existing journal and validators.
const fs = require("node:fs");
const path = require("node:path");
const { canonical, sha256, fail } = require("./files.cjs");
const { jsonValue, id, PUBLIC_TYPES } = require("./model.cjs");
const { PROTOCOL, RENDERER } = require("./exchanges.cjs");

function stateToken(project, event) { return project + ":" + event; }
function parseToken(value) {
  if (typeof value !== "string" || value.split(":").length !== 2) fail("INVALID_INPUT", "at must be the state_token from the context or last fresh receipt.");
  const [project, event] = value.split(":");
  id(project, "at project"); id(event, "at event");
  return { expected_project_id: project, expected_last_event_id: event };
}
const COLLECTION_IDS = { questions: "question_id", evidence: "evidence_id", assumptions: "assumption_id", decisions: "decision_id",
  candidate_routes: "strategy_id", user_context: "context_id", result_conditions: "condition_id", action_scopes: "scope_id" };
const RUN_OPS = { "start-run": "start", "write-run-file": "write", "finalize-run": "finalize", "fail-run": "failRun", "abandon-run": "abandon" };
// These fields name journal records, unlike source_ref/source_refs, which are
// external locators, or catalog IDs, which are literal choices. Environment and
// legacy/source-description objects are opaque even when their keys look alike.
const REFERENCE_FIELDS = new Set([
  "basis_refs", "incoming_refs", "evidence_refs", "evidence_ref", "assumption_refs", "answer_refs",
  "user_contribution_refs", "user_refs", "user_ref", "related_unresolved_question_refs", "corrects_refs",
  "knowledge_refs", "work_refs", "completed_work_refs", "findings_refs", "strategy_ids", "strategy_ids_it_could_change",
  "evidence_for", "evidence_against", "last_review_id", "route_changes", "assumptions_added_or_revised",
  "supersedes", "reconciles", "interpretation_ref", "exchange_ref", "question_ref", "user_question_ref",
  "delivery_ref", "scope_ref", "authorization_ref", "focus_scope_ref", "run_id", "parent_run_id", "ref", "event_ref", "before_incoming_ref",
  "capture_ref", "supersedes_recording_ref"
]);
const OPAQUE_FIELDS = new Set(["environment", "legacy", "identification_basis"]);

function build(input) { return expand(input, false); }
function expand(input, legacyAliases, defaultRenderer = RENDERER) {
  jsonValue(input);
  if (!input || typeof input !== "object" || Array.isArray(input)) fail("INVALID_INPUT", "submit needs an object.");
  const { at, op, ...body } = structuredClone(input);
  const identity = parseToken(at);
  if (!PUBLIC_TYPES.includes(op) && !Object.hasOwn(RUN_OPS, op) && op !== "observe-exchange") fail("INVALID_INPUT", "Unknown submit operation: " + op);
  for (const key of ["event_id", "expected_project_id", "expected_last_event_id", "type", "payload"]) {
    if (Object.hasOwn(body, key)) fail("INVALID_INPUT", "submit constructs " + key + "; use the low-level command for an explicit envelope.");
  }
  const digest = sha256(canonical(input));
  const refs = {};
  function allocate(record, key, location) {
    if (!record || typeof record !== "object" || Array.isArray(record)) return;
    if (Object.hasOwn(record, "patch") && !Object.hasOwn(record, key)) fail("INVALID_INPUT", "A patch must explicitly select the existing " + key + ".");
    if (!Object.hasOwn(record, key)) record[key] = key.replace(/_id$/, "").replace(/_/g, "-") + "-" + sha256(digest + ":" + location).slice(0, 24);
    if (Object.hasOwn(record, "as")) {
      id(record.as, location + ".as");
      if (Object.hasOwn(refs, record.as)) fail("INVALID_INPUT", "Duplicate local alias: " + record.as);
      refs[record.as] = record[key]; delete record.as;
    }
  }
  if (PUBLIC_TYPES.includes(op)) {
    for (const [collection, key] of Object.entries(COLLECTION_IDS)) {
      if (Array.isArray(body.changes?.[collection])) body.changes[collection].forEach((record, index) => allocate(record, key, collection + "." + index));
    }
    for (const [name, key] of Object.entries({ interpretation: "interpretation_id", exchange: "exchange_id", checkpoint: "checkpoint_id", review: "review_id", delivery: "delivery_id" })) allocate(body[name], key, name);
    if (body.interpretation) {
      allocate(body.interpretation, "turn_id", "turn");
      if (Array.isArray(body.interpretation.action_decisions)) body.interpretation.action_decisions.forEach((record, index) => allocate(record, "decision_id", "action_decisions." + index));
    }
    if (["reply_interpreted", "exchange_prepared", "exchange_delivery"].includes(op) && !Object.hasOwn(body, "protocol")) body.protocol = PROTOCOL;
    if (body.exchange && !Object.hasOwn(body.exchange, "renderer")) body.exchange.renderer = defaultRenderer;
    if (body.exchange && body.interpretation) {
      if (!Object.hasOwn(body.exchange, "interpretation_ref")) body.exchange.interpretation_ref = body.interpretation.interpretation_id;
      if (!Object.hasOwn(body.exchange, "turn_id")) body.exchange.turn_id = body.interpretation.turn_id;
    }
  } else if (op === "start-run") allocate(body, "run_id", "run");
  else if (op === "observe-exchange") allocate(body, "delivery_id", "delivery");

  function resolve(value, key = "", parent = "") {
    if (!legacyAliases && OPAQUE_FIELDS.has(key)) return value;
    const isReference = legacyAliases ? /(?:_ref|_refs|_id)$/.test(key)
      : REFERENCE_FIELDS.has(key) || (key === "checkpoint_id" && parent === "selection_basis");
    if (typeof value === "string" && isReference && value.startsWith("@")) {
      const alias = value.slice(1);
      if (!Object.hasOwn(refs, alias)) fail("UNKNOWN_REFERENCE", "Unknown local alias: " + value);
      return refs[alias];
    }
    if (Array.isArray(value)) return value.map(item => resolve(item, key, parent));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([name, entry]) => [name, resolve(entry, name, key)]));
    return value;
  }
  const resolved = resolve(body);
  const envelope = { ...identity, ...(op === "write-run-file" ? {} : { event_id: "event-" + digest.slice(0, 40) }) };
  return { op, refs, request: PUBLIC_TYPES.includes(op) ? { ...envelope, type: op, payload: resolved } : { ...envelope, ...resolved } };
}

// Runs only after exact-retry lookup and stale-write checks, inside store.record.
function prepare(root, state, request) {
  const prepared = structuredClone(request), payload = prepared.payload;
  if (payload.exchange && !Object.hasOwn(payload.exchange, "turn_id")) {
    const interpretation = state.interpretations?.find(item => item.interpretation_id === payload.exchange.interpretation_ref);
    if (!interpretation) fail("UNKNOWN_REFERENCE", "Select an existing interpretation_ref for this exchange.");
    payload.exchange.turn_id = interpretation.turn_id;
  }
  for (const scope of payload.changes?.action_scopes || []) {
    for (const input of scope.execution_plan?.inputs || []) {
      if (!input.deferred_release && !Object.hasOwn(input, "sha256") && typeof input.path === "string") {
        const source = path.resolve(root, input.path);
        try { input.sha256 = sha256(fs.readFileSync(source)); }
        catch (error) { fail("INPUT_UNAVAILABLE", "Cannot hash selected input: " + input.path, { cause: error.code }); }
      }
    }
  }
  return prepared;
}

function submit(root, input, options = {}) {
  const { op, refs, request } = build(input);
  // Only store's already-committed retry branch may inspect this historical
  // expansion. Fresh writes always use the corrected reference semantics.
  const replayOptions = { ...options, legacyReplayRequest: prior => {
    try {
      const defaultRenderer = !Object.hasOwn(input.exchange || {}, "renderer")
        ? prior.payload.exchange?.renderer || RENDERER : RENDERER;
      const historical = expand(input, false, defaultRenderer).request;
      const { expected_last_event_id, ...fingerprintRequest } = historical;
      if (sha256(canonical(fingerprintRequest)) === prior.request_sha256) return historical;
      return expand(input, true, defaultRenderer).request;
    }
    catch { return null; }
  } };
  let receipt;
  if (PUBLIC_TYPES.includes(op)) receipt = require("./store.cjs").record(root, request, { ...replayOptions, prepareRequest: prepare });
  else if (op === "observe-exchange") receipt = require("./delivery.cjs").observe(root, request, replayOptions);
  else receipt = require("./runs.cjs")[RUN_OPS[op]](root, request, replayOptions);
  return { ...receipt, ...(op === "write-run-file" ? { state_token: input.at } : {}), authoring_refs: refs,
    ...(request.run_id ? { run_id: request.run_id } : {}), ...(request.delivery_id ? { delivery_id: request.delivery_id } : {}) };
}

module.exports = { stateToken, parseToken, build, submit };
