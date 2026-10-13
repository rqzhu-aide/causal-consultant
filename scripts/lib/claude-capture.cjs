"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { fail, sha256, canonical } = require("./files.cjs");
const { object, text } = require("./model.cjs");

// Verified against Claude Code's persisted main-session JSONL. No latest-message
// fallback: identical text and timestamps do not establish message identity.
function read(spec) {
  object(spec, "claude_capture", ["transcript_path", "session_id", "message_uuid"]);
  for (const key of Object.keys(spec)) text(spec[key], "claude_capture." + key);
  if (!path.isAbsolute(spec.transcript_path)) fail("INVALID_INPUT", "claude_capture.transcript_path must be an absolute host path.");
  const source = path.resolve(spec.transcript_path);
  let raw;
  try { raw = fs.readFileSync(source); }
  catch (error) { fail("CAPTURE_UNAVAILABLE", "Cannot read the selected Claude transcript.", { cause: error.code }); }
  if (!Buffer.from(raw.toString("utf8"), "utf8").equals(raw)) fail("INVALID_CAPTURE", "Claude transcript must be intact UTF-8.");
  const matches = [], messages = [];
  for (const line of raw.toString("utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    let record;
    try { record = JSON.parse(line); }
    catch { fail("INVALID_CAPTURE", "Claude transcript contains an incomplete or invalid JSON record; retry after the host finishes writing."); }
    if (!record || typeof record !== "object" || Array.isArray(record)) fail("INVALID_CAPTURE", "Claude transcript records must be JSON objects.");
    if (record.sessionId === spec.session_id && record.type === "assistant" && record.isSidechain === false && typeof record.uuid === "string") {
      messages.push({ message_uuid: record.uuid, record_sha256: sha256(Buffer.from(line, "utf8")) });
    }
    if (record.uuid === spec.message_uuid) matches.push({ record, line, ordinal: messages.length });
  }
  if (matches.length !== 1) fail("CAPTURE_IDENTITY", "Expected exactly one record with the selected message_uuid.");
  const { record, line, ordinal } = matches[0];
  if (record.sessionId !== spec.session_id || record.type !== "assistant" || record.isSidechain !== false
      || record.message?.role !== "assistant" || !Array.isArray(record.message.content)) {
    fail("CAPTURE_IDENTITY", "Selected record is not an assistant message in the specified main session.");
  }
  const content = record.message.content;
  const blocks = content.filter(item => item.type === "text");
  if (blocks.length !== 1 || typeof blocks[0].text !== "string" || !blocks[0].text.trim()
      || content.some(item => !["text", "thinking", "redacted_thinking"].includes(item.type))) {
    fail("UNSUPPORTED_CAPTURE", "Select one complete text reply; tool messages or ambiguous multi-text records require another verified host export.");
  }
  const prefix = messages.slice(0, ordinal);
  if (new Set(prefix.map(item => item.message_uuid)).size !== prefix.length) fail("CAPTURE_IDENTITY", "Main-session message order contains repeated identities.");
  // A compact integrity record retains the source order without copying other
  // users' or assistants' message bodies into this project.
  const order_bytes = Buffer.from(canonical({ session_id: spec.session_id, transcript_sha256: sha256(raw), messages: prefix }) + "\n", "utf8");
  return { bytes: Buffer.from(blocks[0].text, "utf8"),
    source_ref: "claude-code:" + spec.session_id + "/" + spec.message_uuid + "#record-sha256=" + sha256(Buffer.from(line, "utf8")),
    record_bytes: Buffer.from(line + "\n", "utf8"), order_bytes,
    capture_message: { conversation_ref: "claude-code:" + spec.session_id, message_ref: spec.message_uuid,
      ordinal, order_path: prefix.map(item => item.message_uuid), order_sha256: sha256(order_bytes) } };
}
module.exports = { read };
