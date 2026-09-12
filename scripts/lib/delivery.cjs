"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { fail, sha256, ensureDirectory, readFile, writeNew, safePath } = require("./files.cjs");
const { object, text, id, enumeration, validateSemantic } = require("./model.cjs");
const { PROTOCOL, renderExchange } = require("./exchanges.cjs");

// Derived response files are disposable conveniences. The committed exchange
// remains authoritative and a failed export must not obscure a successful commit.
function savePrepared(root, event) {
  const relative = "exchanges/" + event.payload.exchange.exchange_id + "/response.md";
  try {
    retain(root, relative, Buffer.from(renderExchange(event.payload.exchange), "utf8"));
    return { response_path: relative, response_file_written: true };
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
function verifyCapture(root, delivery) {
  let actual;
  try { actual = readFile(root, delivery.source_ref); }
  catch (error) { fail("CAPTURE_UNAVAILABLE", "Cannot read the retained actual message: " + delivery.source_ref, { cause: error.code }); }
  if (sha256(actual) !== delivery.observed_response_sha256) {
    fail("CAPTURE_MISMATCH", "Retained actual message hash differs from its observation: " + delivery.source_ref);
  }
  if (delivery.response_span) verifySpan(actual, delivery);
  return true;
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
function validateWrite(root, delivery) {
  // New writes need retained message bytes. Replay and exact-event retries use
  // their historical contract and do not pass through this live preflight.
  if (!Object.hasOwn(delivery, "observed_response_sha256")) {
    fail("CAPTURE_REQUIRED", "New delivery observations require retained actual message text. Use observe-exchange; a copied prepared-response hash does not establish delivery.");
  }
  verifyCapture(root, delivery);
}
function observe(projectRoot, request, options = {}) {
  object(request, "observation request", ["event_id", "expected_project_id", "expected_last_event_id",
    "delivery_id", "exchange_ref", "message_path", "source_ref", "observation"], ["observed_at", "wrapper_review"]);
  id(request.delivery_id, "delivery_id"); id(request.exchange_ref, "exchange_ref");
  text(request.message_path, "message_path"); text(request.source_ref, "source_ref");
  enumeration(request.observation, ["assistant_emission", "host_confirmed"], "observation");
  if (Object.hasOwn(request, "observed_at")) text(request.observed_at, "observed_at");
  if (Object.hasOwn(request, "wrapper_review")) {
    text(request.wrapper_review, "wrapper_review");
    if (!request.wrapper_review.trim()) fail("INVALID_INPUT", "wrapper_review must explain the surrounding text, not merely mark it equivalent.");
  }
  return require("./store.cjs").transact(projectRoot, request, ({ root, state, events }) => {
    const exchange = (state.exchanges || []).find(item => item.exchange_id === request.exchange_ref);
    if (!exchange) fail("UNKNOWN_REFERENCE", "Capture requires an already committed exchange.");
    const source = path.resolve(root, request.message_path);
    let bytes;
    try {
      if (!fs.statSync(source).isFile()) fail("INVALID_INPUT", "message_path must name a plain-text message file.");
      bytes = fs.readFileSync(source);
    } catch (error) { fail("CAPTURE_UNAVAILABLE", "Cannot read the actual message file.", { cause: error.code }); }
    if (!Buffer.from(bytes.toString("utf8"), "utf8").equals(bytes)) fail("INVALID_INPUT", "Actual messages must be valid UTF-8 text; no decoding repair is performed.");
    const prepared = events.find(event => event.payload.exchange?.exchange_id === request.exchange_ref).payload.exchange;
    const response_span = recoveredSpan(bytes, Buffer.from(renderExchange(prepared), "utf8"), request.wrapper_review);
    const source_ref = "exchanges/" + request.exchange_ref + "/observations/" + request.delivery_id + ".txt";
    const delivery = { delivery_id: request.delivery_id, exchange_ref: request.exchange_ref,
      observation: request.observation, source_ref, capture_source_ref: request.source_ref,
      response_sha256: exchange.response_sha256, observed_response_sha256: sha256(bytes),
      ...(response_span ? { response_span } : {}),
      ...(request.observed_at ? { observed_at: request.observed_at } : {}) };
    const payload = { protocol: PROTOCOL, delivery };
    validateSemantic(state, { event_id: request.event_id, expected_project_id: request.expected_project_id,
      expected_last_event_id: request.expected_last_event_id, type: "exchange_delivery", payload });
    if (response_span) verifySpan(bytes, delivery);
    retain(root, source_ref, bytes);
    return { type: "exchange_delivery", payload };
  }, { ...options, eventType: "exchange_delivery" });
}

module.exports = { savePrepared, verifyCapture, validateWrite, observe };
