"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { fail, canonical, sha256, ensureDirectory, readFile, writeNew, safePath } = require("./files.cjs");
const { object, text, id, enumeration, validateSemantic } = require("./model.cjs");
const { PROTOCOL, COMPACT_RENDERERS, scopePath, renderExchange } = require("./exchanges.cjs");
const { isAgentRecorded, prepareRecording } = require("./recorded-reply.cjs");

// Derived response files are disposable conveniences. The committed exchange
// retains scientific state and the reply draft; actual replies are recorded
// separately. A failed export must not obscure a successful commit.
function savePrepared(root, event) {
  const relative = "exchanges/" + event.payload.exchange.exchange_id + "/response.md";
  try {
    const scope_paths = [];
    const exchange = event.payload.exchange;
    if (COMPACT_RENDERERS.includes(exchange.renderer) && exchange.response.next_steps.some(option => option.scope_ref)) {
      const { state } = require("./store.cjs").readJournal(root);
      for (const option of exchange.response.next_steps.filter(option => option.scope_ref)) {
        const scope = state.action_scopes.find(item => item.scope_id === option.scope_ref);
        if (!scope) fail("UNKNOWN_REFERENCE", "The saved scope is unavailable: " + option.scope_ref);
        const scope_path = scopePath(scope.scope_id);
        const current_file = path.resolve(root, scope_path).replace(/\\/g, "/");
        if (option.scope_file !== current_file) fail("SCOPE_LOCATION_CHANGED", "This saved reply retains its original scope link. Read history unchanged; prepare a new exchange at this project location before re-emitting the offer.");
        retain(root, scope_path, Buffer.from(canonical(scope) + "\n", "utf8"));
        scope_paths.push(scope_path);
      }
    }
    retain(root, relative, Buffer.from(renderExchange(event.payload.exchange), "utf8"));
    return { response_path: relative, response_file_written: true, ...(scope_paths.length ? { scope_paths } : {}) };
  } catch (error) {
    return { response_path: relative, response_file_written: false,
      response_file_error: error.message };
  }
}
function retain(root, relative, bytes) {
  ensureDirectory(root, path.posix.dirname(relative));
  if (fs.existsSync(safePath(root, relative))) {
    if (!readFile(root, relative).equals(bytes)) fail("CAPTURE_CONFLICT", "Retained message bytes differ; no file was replaced: " + relative);
  } else writeNew(root, relative, bytes);
}
function reuseNativeProof(root, sourceRef, capture) {
  const relative = sourceRef + ".host-order.json";
  if (!fs.existsSync(safePath(root, relative))) return;
  const retained = readFile(root, relative);
  let prior, current;
  try { prior = JSON.parse(retained.toString("utf8")); current = JSON.parse(capture.order_bytes.toString("utf8")); }
  catch { fail("CAPTURE_CONFLICT", "An interrupted native capture retains invalid order evidence; no file was replaced."); }
  if (prior.session_id !== current.session_id || !/^[a-f0-9]{64}$/.test(prior.transcript_sha256 || "")
    || canonical(prior.messages) !== canonical(current.messages)) fail("CAPTURE_CONFLICT", "An interrupted native capture's message prefix changed; no evidence was replaced.");
  // Later rows may grow after a failed append. Reuse the original immutable
  // prefix proof and source snapshot when every native UUID/record hash agrees.
  capture.order_bytes = retained;
  capture.capture_message.order_sha256 = sha256(retained);
}
function verifyCapture(root, delivery) {
  let actual;
  try { actual = readFile(root, delivery.source_ref); }
  catch (error) { fail("CAPTURE_UNAVAILABLE", "Cannot read the retained actual message: " + delivery.source_ref, { cause: error.code }); }
  if (sha256(actual) !== delivery.observed_response_sha256) {
    fail("CAPTURE_MISMATCH", "Retained actual message hash differs from its observation: " + delivery.source_ref);
  }
  if (!Buffer.from(actual.toString("utf8"), "utf8").equals(actual)) fail("CAPTURE_MISMATCH", "Retained actual message is not intact UTF-8 text.");
  // Historical source locators were free text, including the claude-code scheme.
  // Only the complete new structured locator declares a retained host record.
  const match = /^claude-code:([^/]+)\/([^#]+)#record-sha256=[a-f0-9]{64}$/.exec(delivery.capture_source_ref || "");
  if (match) {
    const captured = require("./claude-capture.cjs").read({ transcript_path: safePath(root, delivery.source_ref + ".host-record.json"), session_id: match[1], message_uuid: match[2] });
    if (captured.source_ref !== delivery.capture_source_ref || !captured.bytes.equals(actual)) fail("CAPTURE_MISMATCH", "Retained Claude record and captured text disagree.");
    if (delivery.capture_message?.order_sha256) {
      const proof = readFile(root, delivery.source_ref + ".host-order.json");
      let order;
      try { order = JSON.parse(proof.toString("utf8")); } catch { fail("CAPTURE_MISMATCH", "Retained native message order is invalid."); }
      const message = delivery.capture_message, entries = order.messages;
      if (sha256(proof) !== message.order_sha256 || order.session_id !== match[1]
        || message.conversation_ref !== "claude-code:" + match[1] || message.message_ref !== match[2]
        || !/^[a-f0-9]{64}$/.test(order.transcript_sha256 || "") || !Array.isArray(entries) || entries.length !== message.ordinal
        || !entries.every(item => item && typeof item.message_uuid === "string" && /^[a-f0-9]{64}$/.test(item.record_sha256 || ""))
        || new Set(entries.map(item => item.message_uuid)).size !== entries.length
        || entries.at(-1)?.message_uuid !== match[2] || entries.at(-1)?.record_sha256 !== /record-sha256=([a-f0-9]{64})$/.exec(captured.source_ref)?.[1]) fail("CAPTURE_MISMATCH", "Native identity and retained conversation order disagree.");
      if (canonical(message.order_path) !== canonical(entries.map(item => item.message_uuid))) fail("CAPTURE_MISMATCH", "The native message order path differs from retained prefix evidence.");
    }
  }
  if (delivery.response_span) verifySpan(actual, delivery);
  if (delivery.response_equivalence) {
    const event = require("./store.cjs").readJournal(root).events.find(item => item.payload.exchange?.exchange_id === delivery.exchange_ref);
    if (!event || !lineEndingsEquivalent(actual, Buffer.from(renderExchange(event.payload.exchange), "utf8"))) fail("CAPTURE_MISMATCH", "The claimed LF/CRLF equivalence changes more than line endings.");
  }
  return true;
}
function lineEndingsEquivalent(actual, prepared) {
  // Only paired CRLF becomes LF. Lone carriage returns, blank lines and all
  // remaining content stay significant, and original bytes are never rewritten.
  const normalize = bytes => {
    const result = Buffer.allocUnsafe(bytes.length); let size = 0;
    for (let index = 0; index < bytes.length; index++) {
      if (bytes[index] === 13 && bytes[index + 1] === 10) continue;
      result[size++] = bytes[index];
    }
    return result.subarray(0, size);
  };
  return normalize(actual).equals(normalize(prepared));
}
function rejectPreparedSource(root, source, state) {
  const target = path.resolve(root, source);
  const same = (left, right) => {
    if (path.relative(left, right) === "") return true;
    try {
      if (path.relative(fs.realpathSync.native(left), fs.realpathSync.native(right)) === "") return true;
      const a = fs.statSync(left), b = fs.statSync(right);
      return a.ino !== 0 && a.dev === b.dev && a.ino === b.ino;
    } catch { return false; }
  };
  for (const exchange of state.exchanges || []) {
    if (same(target, path.resolve(root, "exchanges", exchange.exchange_id, "response.md"))) fail("PREPARED_CAPTURE_SOURCE", "The generated response file is prepared text, not actual delivery evidence. Capture an identified host message or an attributed actual-message export.");
  }
}
function verifySpan(actual, delivery) {
  const span = delivery.response_span;
  const body = actual.subarray(span.start_byte, span.end_byte);
  if (!Number.isSafeInteger(span.start_byte) || !Number.isSafeInteger(span.end_byte)
    || span.start_byte < 0 || span.end_byte <= span.start_byte || span.end_byte > actual.length
    || sha256(body) !== delivery.response_sha256
    || actual.indexOf(body) !== span.start_byte || actual.lastIndexOf(body) !== span.start_byte) {
    fail("RESPONSE_SPAN_MISMATCH", "Recovery requires one exact complete prepared reply at the recorded byte boundaries.");
  }
  const outside = Buffer.concat([actual.subarray(0, span.start_byte), actual.subarray(span.end_byte)]).toString("utf8");
  if (outside.trim() && (typeof span.wrapper_review !== "string" || !span.wrapper_review.trim())) {
    fail("WRAPPER_REVIEW_REQUIRED", "Review the complete surrounding text before using this wrapped reply; its body alone does not establish that the offer remains applicable.");
  }
}
function recoveredSpan(actual, prepared, review) {
  if (actual.equals(prepared)) return undefined;
  const start = actual.indexOf(prepared);
  if (start < 0 || actual.lastIndexOf(prepared) !== start) {
    if (review !== undefined) fail("RESPONSE_NOT_INTACT", "A wrapper review cannot recover an edited, truncated or duplicated prepared reply.");
    return undefined;
  }
  const end = start + prepared.length;
  const outside = Buffer.concat([actual.subarray(0, start), actual.subarray(end)]).toString("utf8");
  if (outside.trim() && review === undefined) return undefined;
  return { start_byte: start, end_byte: end, ...(review !== undefined ? { wrapper_review: review } : {}) };
}
function validateWrite(root, delivery, state, events) {
  // Agent records are retained in the immutable journal. Their source locator
  // identifies a visible conversation reply, not a local exact-byte capture.
  if (isAgentRecorded(delivery)) {
    prepareRecording(delivery, events || require("./store.cjs").readJournal(root).events);
    const superseded = delivery.agent_recording.supersedes_recording_ref;
    if (superseded && (state?.deliveries || []).some(item => isAgentRecorded(item)
      && item.agent_recording.supersedes_recording_ref === superseded)) {
      fail("RECORDING_SUPERSEDED", "This recording already has a replacement. Correct its current interpretation instead of adding a competing replacement branch.");
    }
    if (superseded) {
      const previous = (state?.deliveries || []).find(item => item.delivery_id === superseded);
      const current = require("./exchanges.cjs").resolveDeliveryReference(state, superseded).delivery;
      if (isAgentRecorded(previous) && isAgentRecorded(current)
        && canonical(previous.agent_recording.items) !== canonical(current.agent_recording.items)) {
        fail("RECORDING_SUPERSEDED", "The selected recording is an older interpretation of this reply. Correct its current recording instead.");
      }
    }
    if (delivery.agent_recording.capture_ref) {
      const capture = (state?.deliveries || []).find(item => item.delivery_id === delivery.agent_recording.capture_ref);
      if (!capture || isAgentRecorded(capture) || capture.exchange_ref !== delivery.exchange_ref) fail("INVALID_INPUT", "The interpretation must reference an earlier capture of this exchange.");
      verifyCapture(root, capture);
    }
    return;
  }
  // New writes need retained message bytes. Replay and exact-event retries use
  // their historical contract and do not pass through this live preflight.
  if (!Object.hasOwn(delivery, "observed_response_sha256")) {
    fail("CAPTURE_REQUIRED", "New delivery observations require retained actual message text. Use observe-exchange; a copied prepared-response hash does not establish delivery.");
  }
  rejectPreparedSource(root, delivery.source_ref, state || require("./store.cjs").readJournal(root).state);
  delivery.capture_protocol = "captured-delivery-v2";
  verifyCapture(root, delivery);
}
function observe(projectRoot, request, options = {}) {
  object(request, "observation request", ["event_id", "expected_project_id", "expected_last_event_id",
    "delivery_id", "exchange_ref", "observation"], ["message_path", "source_ref", "claude_capture", "capture_message", "observed_at", "wrapper_review", "agent_recording"]);
  id(request.delivery_id, "delivery_id"); id(request.exchange_ref, "exchange_ref");
  if (request.observation === "agent_recorded") {
    text(request.source_ref, "source_ref");
    for (const key of ["message_path", "claude_capture", "capture_message", "wrapper_review"]) {
      if (Object.hasOwn(request, key)) fail("INVALID_INPUT", "An agent recording must not mix actual-reply interpretation with exact-byte host capture.");
    }
    object(request.agent_recording, "agent_recording", ["before_incoming_ref", "items"], ["capture_ref", "supersedes_recording_ref"]);
  } else if (Object.hasOwn(request, "claude_capture")) {
    if (Object.hasOwn(request, "message_path") || Object.hasOwn(request, "source_ref") || Object.hasOwn(request, "capture_message")) fail("INVALID_INPUT", "claude_capture supplies the actual message and source identity; do not mix capture mechanisms.");
    object(request.claude_capture, "claude_capture", ["transcript_path", "session_id", "message_uuid"]);
  } else { text(request.message_path, "message_path"); text(request.source_ref, "source_ref"); }
  enumeration(request.observation, ["assistant_emission", "host_confirmed", "agent_recorded"], "observation");
  if (request.observation !== "agent_recorded" && Object.hasOwn(request, "agent_recording")) fail("INVALID_INPUT", "An agent recording requires agent_recorded attribution.");
  if (Object.hasOwn(request, "observed_at")) text(request.observed_at, "observed_at");
  if (Object.hasOwn(request, "wrapper_review")) {
    text(request.wrapper_review, "wrapper_review");
    if (!request.wrapper_review.trim()) fail("INVALID_INPUT", "wrapper_review must explain the surrounding text, not merely mark it equivalent.");
  }
  return require("./store.cjs").transact(projectRoot, request, ({ root, state, events }) => {
    const exchange = (state.exchanges || []).find(item => item.exchange_id === request.exchange_ref);
    if (!exchange) fail("UNKNOWN_REFERENCE", "Capture requires an already committed exchange.");
    if (request.observation === "agent_recorded") {
      const delivery = { delivery_id: request.delivery_id, exchange_ref: request.exchange_ref,
        observation: "agent_recorded", source_ref: request.source_ref, response_sha256: exchange.response_sha256,
        capture_protocol: "agent-recorded-reply-v1", agent_recording: structuredClone(request.agent_recording),
        ...(request.observed_at ? { observed_at: request.observed_at } : {}) };
      prepareRecording(delivery, events);
      const payload = { protocol: PROTOCOL, delivery };
      validateSemantic(state, { event_id: request.event_id, expected_project_id: request.expected_project_id,
        expected_last_event_id: request.expected_last_event_id, type: "exchange_delivery", payload });
      validateWrite(root, delivery, state, events);
      return { type: "exchange_delivery", payload };
    }
    let bytes, capture;
    if (request.claude_capture) {
      capture = require("./claude-capture.cjs").read(request.claude_capture);
      bytes = capture.bytes;
    } else {
      const source = path.resolve(root, request.message_path);
      rejectPreparedSource(root, source, state);
      try {
        if (!fs.statSync(source).isFile()) fail("INVALID_INPUT", "message_path must name a plain-text message file.");
        bytes = fs.readFileSync(source);
      } catch (error) { fail("CAPTURE_UNAVAILABLE", "Cannot read the actual message file.", { cause: error.code }); }
    }
    if (!Buffer.from(bytes.toString("utf8"), "utf8").equals(bytes)) fail("INVALID_INPUT", "Actual messages must be valid UTF-8 text; no decoding repair is performed.");
    const prepared = events.find(event => event.payload.exchange?.exchange_id === request.exchange_ref).payload.exchange;
    const preparedBytes = Buffer.from(renderExchange(prepared), "utf8");
    const equivalent = !bytes.equals(preparedBytes) && lineEndingsEquivalent(bytes, preparedBytes);
    const response_span = equivalent ? undefined : recoveredSpan(bytes, preparedBytes, request.wrapper_review);
    const source_ref = "exchanges/" + request.exchange_ref + "/observations/" + request.delivery_id + ".txt";
    if (capture) reuseNativeProof(root, source_ref, capture);
    const delivery = { delivery_id: request.delivery_id, exchange_ref: request.exchange_ref,
      observation: request.observation, source_ref, capture_source_ref: capture?.source_ref || request.source_ref,
      response_sha256: exchange.response_sha256, observed_response_sha256: sha256(bytes),
      capture_protocol: "captured-delivery-v2",
      ...(capture?.capture_message || request.capture_message ? { capture_message: capture?.capture_message || request.capture_message } : {}),
      ...(equivalent ? { response_equivalence: "lf-crlf-v1" } : {}),
      ...(response_span ? { response_span } : {}),
      ...(request.observed_at ? { observed_at: request.observed_at } : {}) };
    const payload = { protocol: PROTOCOL, delivery };
    validateSemantic(state, { event_id: request.event_id, expected_project_id: request.expected_project_id,
      expected_last_event_id: request.expected_last_event_id, type: "exchange_delivery", payload });
    if (response_span) verifySpan(bytes, delivery);
    retain(root, source_ref, bytes);
    if (capture) retain(root, source_ref + ".host-record.json", capture.record_bytes);
    if (capture) retain(root, source_ref + ".host-order.json", capture.order_bytes);
    return { type: "exchange_delivery", payload };
  }, { ...options, eventType: "exchange_delivery" });
}

module.exports = { savePrepared, verifyCapture, validateWrite, observe, lineEndingsEquivalent };
