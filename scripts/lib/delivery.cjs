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
  return true;
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
    "delivery_id", "exchange_ref", "message_path", "source_ref", "observation"], ["observed_at"]);
  id(request.delivery_id, "delivery_id"); id(request.exchange_ref, "exchange_ref");
  text(request.message_path, "message_path"); text(request.source_ref, "source_ref");
  enumeration(request.observation, ["assistant_emission", "host_confirmed"], "observation");
  if (Object.hasOwn(request, "observed_at")) text(request.observed_at, "observed_at");
  return require("./store.cjs").transact(projectRoot, request, ({ root, state }) => {
    const exchange = (state.exchanges || []).find(item => item.exchange_id === request.exchange_ref);
    if (!exchange) fail("UNKNOWN_REFERENCE", "Capture requires an already committed exchange.");
    const source = path.resolve(root, request.message_path);
    let bytes;
    try {
      if (!fs.statSync(source).isFile()) fail("INVALID_INPUT", "message_path must name a plain-text message file.");
      bytes = fs.readFileSync(source);
    } catch (error) { fail("CAPTURE_UNAVAILABLE", "Cannot read the actual message file.", { cause: error.code }); }
    if (!Buffer.from(bytes.toString("utf8"), "utf8").equals(bytes)) fail("INVALID_INPUT", "Actual messages must be valid UTF-8 text; no decoding repair is performed.");
    const source_ref = "exchanges/" + request.exchange_ref + "/observations/" + request.delivery_id + ".txt";
    const delivery = { delivery_id: request.delivery_id, exchange_ref: request.exchange_ref,
      observation: request.observation, source_ref, capture_source_ref: request.source_ref,
      response_sha256: exchange.response_sha256, observed_response_sha256: sha256(bytes),
      ...(request.observed_at ? { observed_at: request.observed_at } : {}) };
    const payload = { protocol: PROTOCOL, delivery };
    validateSemantic(state, { event_id: request.event_id, expected_project_id: request.expected_project_id,
      expected_last_event_id: request.expected_last_event_id, type: "exchange_delivery", payload });
    retain(root, source_ref, bytes);
    return { type: "exchange_delivery", payload };
  }, { ...options, eventType: "exchange_delivery" });
}

module.exports = { savePrepared, verifyCapture, validateWrite, observe };
