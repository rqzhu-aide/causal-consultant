"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const store = require("../scripts/lib/store.cjs");
const { observe } = require("../scripts/lib/delivery.cjs");
const { main } = require("../scripts/project.cjs");
const { canonical, sha256 } = require("../scripts/lib/files.cjs");
const { PROTOCOL, renderExchange } = require("../scripts/lib/exchanges.cjs");
const { createFixture, exchange, interpretation } = require("./fixtures/multiturn.cjs");

function project(t, fixture = createFixture()) {
  const parent = fs.realpathSync.native(os.tmpdir());
  const root = fs.mkdtempSync(path.join(parent, "cc-capture-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), parent);
    assert.ok(path.basename(root).startsWith("cc-capture-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  fs.writeFileSync(path.join(root, "journal.jsonl"), fixture.events.map(canonical).join("\n") + "\n");
  store.recover(root);
  return root;
}
function setup(t) {
  const root = project(t);
  const outgoing = exchange("first");
  const request = { ...ids(root, "event-prepare"), type: "exchange_prepared",
    payload: { protocol: PROTOCOL, interpretation: interpretation("first"), exchange: outgoing } };
  const prepared = store.record(root, request);
  return { root, outgoing, prepared, request };
}
function ids(root, event_id) {
  const state = store.readJournal(root).state;
  return { event_id, expected_project_id: state.state_meta.project_id, expected_last_event_id: state.state_meta.last_event_id };
}
function captureRequest(root, suffix = "first") {
  return { ...ids(root, "event-capture-" + suffix), delivery_id: "delivery-" + suffix,
    exchange_ref: "exchange-first", message_path: "actual.txt", source_ref: "test-host:actual-assistant-message",
    observation: "assistant_emission" };
}

test("prepared response export is exact, recoverable and never a delivery", t => {
  const { root, prepared, outgoing, request } = setup(t);
  assert.equal(prepared.response_file_written, true);
  assert.equal(fs.readFileSync(path.join(root, prepared.response_path), "utf8"), renderExchange(outgoing));
  assert.equal(store.readJournal(root).state.deliveries.length, 0);
  fs.unlinkSync(path.join(root, prepared.response_path));
  const replay = store.record(root, request);
  assert.equal(replay.replayed, true);
  assert.equal(replay.response_file_written, true);
  assert.equal(fs.readFileSync(path.join(root, replay.response_path), "utf8"), prepared.rendered_response);
  fs.writeFileSync(path.join(root, replay.response_path), "changed cache");
  const conflict = store.record(root, request);
  assert.equal(conflict.committed, true);
  assert.equal(conflict.response_file_written, false);
  assert.equal(conflict.rendered_response, prepared.rendered_response);
  assert.equal(fs.readFileSync(path.join(root, replay.response_path), "utf8"), "changed cache");
});

test("capture compares actual bytes, retains attribution, and supports exact retries", t => {
  const { root, prepared } = setup(t);
  fs.writeFileSync(path.join(root, "actual.txt"), prepared.rendered_response);
  const request = captureRequest(root);
  fs.writeFileSync(path.join(root, "capture.json"), JSON.stringify(request));
  const result = main(["observe-exchange", "--project-root", root, "--input", path.join(root, "capture.json")]);
  assert.equal(result.correspondence, "exact");
  assert.equal(result.observed_response_sha256, prepared.response_sha256);
  const delivery = store.readJournal(root).state.deliveries[0];
  assert.equal(delivery.capture_source_ref, request.source_ref);
  assert.equal(fs.readFileSync(path.join(root, delivery.source_ref), "utf8"), prepared.rendered_response);
  fs.unlinkSync(path.join(root, "actual.txt"));
  assert.equal(observe(root, request).replayed, true);
  assert.equal(require("../scripts/lib/runs.cjs").verify(root).ok, true);
  fs.writeFileSync(path.join(root, delivery.source_ref), "tampered capture");
  const check = require("../scripts/lib/runs.cjs").verify(root);
  assert.equal(check.ok, false);
  assert.ok(check.issues.some(issue => issue.code === "CAPTURE_MISMATCH"));
});

test("rewritten or wrapped messages remain visible but cannot bind unseen options", t => {
  const { root, prepared } = setup(t);
  const actual = "The following was revised.\n" + prepared.rendered_response;
  fs.writeFileSync(path.join(root, "actual.txt"), actual);
  const result = observe(root, captureRequest(root));
  assert.equal(result.correspondence, "different");
  assert.equal(result.observed_response_sha256, sha256(actual));
  const view = store.status(root).views.work.unfinished_turns.find(item => item.turn_id === "turn-first");
  assert.ok(view.reasons.includes("delivery_unobserved"));
  const incoming = interpretation("second", true);
  incoming.components = [{ kind: "selection", meaning: "Inspect the record", established: [], unresolved: [],
    exchange_ref: "exchange-first", option_id: "inspect-record", delivery_ref: "delivery-first" }];
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(() => store.record(root, { ...ids(root, "event-selection"), type: "reply_interpreted",
    payload: { protocol: PROTOCOL, interpretation: incoming } }), { code: "UNOBSERVED_EXCHANGE" });
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
});

test("missing capture and failed observation commit cannot create confirmed delivery", t => {
  const { root, prepared } = setup(t);
  const request = captureRequest(root);
  assert.throws(() => observe(root, request), { code: "CAPTURE_UNAVAILABLE" });
  fs.writeFileSync(path.join(root, "actual.txt"), prepared.rendered_response);
  assert.throws(() => observe(root, request, { hooks: { beforeAppend() { throw new Error("interrupted capture commit"); } } }), /interrupted capture commit/);
  assert.equal(store.readJournal(root).state.deliveries.length, 0);
  assert.equal(observe(root, request).correspondence, "exact");
});

test("manually supplied captured hashes are checked against the retained source", t => {
  const { root, prepared } = setup(t);
  fs.writeFileSync(path.join(root, "actual.txt"), "Different reply");
  assert.throws(() => store.record(root, { ...ids(root, "event-forged"), type: "exchange_delivery", payload: {
    protocol: PROTOCOL, delivery: { delivery_id: "delivery-false", exchange_ref: "exchange-first",
      observation: "assistant_emission", source_ref: "actual.txt", capture_source_ref: "test-host:message",
      response_sha256: prepared.response_sha256, observed_response_sha256: prepared.response_sha256 }
  } }), { code: "CAPTURE_MISMATCH" });
  assert.equal(store.readJournal(root).state.deliveries.length, 0);
});

test("new hash-only delivery observations cannot claim that prepared text was emitted", t => {
  const { root, prepared } = setup(t);
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(() => store.record(root, { ...ids(root, "event-hash-only"), type: "exchange_delivery", payload: {
    protocol: PROTOCOL, delivery: { delivery_id: "delivery-hash-only", exchange_ref: "exchange-first",
      observation: "assistant_emission", source_ref: "chat:assistant-first", response_sha256: prepared.response_sha256 }
  } }), { code: "CAPTURE_REQUIRED" });
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  assert.equal(store.readJournal(root).state.deliveries.length, 0);
});

test("a hash-only receipt embedded in a new interpretation is rejected atomically", t => {
  const { root, prepared } = setup(t);
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(() => store.record(root, { ...ids(root, "event-embedded-hash"), type: "reply_interpreted", payload: {
    protocol: PROTOCOL, interpretation: interpretation("second"), delivery: {
      delivery_id: "delivery-embedded", exchange_ref: "exchange-first", observation: "host_confirmed",
      source_ref: "chat:assistant-first", response_sha256: prepared.response_sha256 }
  } }), { code: "CAPTURE_REQUIRED" });
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  assert.equal(store.readJournal(root).state.interpretations.length, 1);
});

test("historical hash-only delivery replays and retries without acquiring a fabricated capture", t => {
  const fixture = createFixture();
  fixture.interpret("historical");
  const outgoing = exchange("historical");
  fixture.append("exchange_prepared", { protocol: PROTOCOL, exchange: outgoing });
  const old = fixture.append("exchange_delivery", { protocol: PROTOCOL, delivery: {
    delivery_id: "delivery-historical", exchange_ref: outgoing.exchange_id, observation: "assistant_emission",
    source_ref: "chat:historical-message", response_sha256: sha256(renderExchange(outgoing))
  } });
  const root = project(t, fixture);
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.deepEqual(store.readJournal(root).state, fixture.state);
  const result = store.record(root, { event_id: old.event_id, expected_project_id: old.project_id,
    expected_last_event_id: old.previous_event_id, type: old.type, payload: old.payload });
  assert.equal(result.replayed, true);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  const historical = store.readJournal(root).state.deliveries[0];
  assert.equal(Object.hasOwn(historical, "observed_response_sha256"), false);
  assert.equal(historical.source_ref, "chat:historical-message");
  assert.equal(require("../scripts/lib/runs.cjs").verify(root).ok, true);
});
