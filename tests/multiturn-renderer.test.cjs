"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const store = require("../scripts/lib/store.cjs");
const { canonical, sha256 } = require("../scripts/lib/files.cjs");
const { PROTOCOL, renderExchange, exchangeReceipt } = require("../scripts/lib/exchanges.cjs");
const { createFixture, interpretation, exchange } = require("./fixtures/multiturn.cjs");

const V1_RESPONSE = "[Status]\nThe allocation procedure remains unverified.\n\n[Questions]\n1. Do you have the allocation record?\n   Why this matters: It would clarify how treatment was assigned.\n   Helpful information: The record or an account of the allocation process.\n\n[Next Steps]\n1. Inspect the allocation record\n   consultant: Check the supplied record and its limitations.\n\n2. Explain why allocation matters\n   consultant: Explain assignment using the study context.";
const V1_HASH = "451426851b5c41ebe27494b5171008565f6911eee8a44e6c698797cb1a801c3e";
const V2_RESPONSE = "[Status]\n\nThe allocation procedure remains unverified.\n\n[Questions]\n\n1. Do you have the allocation record?\n   Why this matters: It would clarify how treatment was assigned.\n   Helpful information: The record or an account of the allocation process.\n\n[Next Steps]\n\n1. Inspect the allocation record\n   consultant: Check the supplied record and its limitations.\n\n2. Explain why allocation matters\n   consultant: Explain assignment using the study context.";

function project(t, fixture = createFixture()) {
  const base = fs.realpathSync.native(os.tmpdir());
  const root = fs.mkdtempSync(path.join(base, "causal-renderer-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("causal-renderer-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  fs.writeFileSync(path.join(root, "journal.jsonl"), fixture.events.map(canonical).join("\n") + "\n");
  store.recover(root);
  return root;
}

function request(state, event_id, payload) {
  return { event_id, expected_project_id: state.state_meta.project_id,
    expected_last_event_id: state.state_meta.last_event_id, type: "exchange_prepared", payload };
}

test("historical v2 gives every section label a blank line and preserves numbered option order", () => {
  const value = { ...exchange("first"), renderer: "lead-markdown-v2" };
  assert.equal(renderExchange(value), V2_RESPONSE);
  value.response.next_steps[0].scope = "Inspect the record.\n2. This line is source content, not another offered option.";
  assert.match(renderExchange(value), /\n   2\. This line is source content/);
});

test("v2 renders empty questions and next steps with the same section spacing", () => {
  const f = createFixture();
  const value = { ...exchange("first"), renderer: "lead-markdown-v2",
    response: { status: "The explanation is complete.", questions: [], next_steps: [],
      questions_none: "No further questions.", next_steps_none: "No further action is needed." } };
  const event = f.append("exchange_prepared", { protocol: PROTOCOL, interpretation: interpretation("first"), exchange: value });
  assert.equal(exchangeReceipt(event).rendered_response,
    "[Status]\n\nThe explanation is complete.\n\n[Questions]\n\nNo further questions.\n\n[Next Steps]\n\nNo further action is needed.");
});

test("v2 committed helper receipt and replay use the exact rendered response and renderer identity", t => {
  const f = createFixture(), root = project(t, f);
  const value = { ...exchange("first"), renderer: "lead-markdown-v2" };
  const submission = request(f.state, "event-v2", { protocol: PROTOCOL, interpretation: interpretation("first"), exchange: value });
  const receipt = store.record(root, submission);
  assert.equal(receipt.renderer, "lead-markdown-v2");
  assert.equal(receipt.rendered_response, V2_RESPONSE);
  assert.equal(receipt.rendered_response, renderExchange(value));
  assert.equal(receipt.response_sha256, sha256(V2_RESPONSE));
  const saved = store.readJournal(root);
  assert.equal(saved.state.exchanges[0].response_sha256, receipt.response_sha256);
  assert.deepEqual(exchangeReceipt(saved.events.at(-1)), {
    exchange_id: receipt.exchange_id, renderer: receipt.renderer,
    rendered_response: receipt.rendered_response, response_sha256: receipt.response_sha256
  });
  const replay = store.record(root, submission);
  assert.equal(replay.replayed, true);
  assert.equal(replay.renderer, receipt.renderer);
  assert.equal(replay.rendered_response, receipt.rendered_response);
  assert.equal(replay.response_sha256, receipt.response_sha256);
});

test("committed v1 response and delivery replay retain their original bytes and hash after v2 adoption", t => {
  const f = createFixture(); f.interpret("first");
  const prepared = f.prepare("first");
  assert.equal(exchangeReceipt(prepared).rendered_response, V1_RESPONSE);
  assert.equal(exchangeReceipt(prepared).response_sha256, V1_HASH);
  f.append("exchange_delivery", { protocol: PROTOCOL, delivery: {
    delivery_id: "delivery-first", exchange_ref: "exchange-first", observation: "assistant_emission",
    source_ref: "chat:assistant-1", response_sha256: V1_HASH
  } });
  const root = project(t, f), journalPath = path.join(root, "journal.jsonl");
  const originalBytes = fs.readFileSync(journalPath);
  let saved = store.readJournal(root);
  assert.equal(saved.state.exchanges[0].response_sha256, V1_HASH);
  assert.equal(saved.state.deliveries[0].response_sha256, V1_HASH);
  store.record(root, request(saved.state, "event-v2", { protocol: PROTOCOL,
    interpretation: interpretation("second"), exchange: { ...exchange("second"), renderer: "lead-markdown-v2" } }));
  saved = store.readJournal(root);
  const beforeRetry = fs.readFileSync(journalPath);
  assert.deepEqual(beforeRetry.subarray(0, originalBytes.length), originalBytes);
  const replay = store.record(root, { event_id: prepared.event_id, expected_project_id: prepared.project_id,
    expected_last_event_id: prepared.previous_event_id, type: prepared.type, payload: prepared.payload });
  assert.equal(replay.replayed, true);
  assert.equal(replay.renderer, "lead-markdown-v1");
  assert.equal(replay.rendered_response, V1_RESPONSE);
  assert.equal(replay.response_sha256, V1_HASH);
  assert.equal(replay.current_last_event_id, "event-v2");
  assert.equal(saved.state.deliveries[0].response_sha256, V1_HASH);
  assert.deepEqual(fs.readFileSync(journalPath), beforeRetry);
});

test("unknown renderer identities are rejected before commitment and by direct rendering", t => {
  const f = createFixture(), root = project(t, f);
  const value = { ...exchange("first"), renderer: "lead-markdown-v999" };
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(() => store.record(root, request(f.state, "event-unknown", {
    protocol: PROTOCOL, interpretation: interpretation("first"), exchange: value
  })), { code: "INVALID_INPUT" });
  assert.throws(() => renderExchange(value), { code: "UNSUPPORTED_PROTOCOL" });
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
});
