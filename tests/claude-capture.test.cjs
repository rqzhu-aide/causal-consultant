"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const capture = require("../scripts/lib/claude-capture.cjs"), store = require("../scripts/lib/store.cjs"), delivery = require("../scripts/lib/delivery.cjs"), f = require("./fixtures/consultation-loop.cjs");
function setup(t) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-capture-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("cc-capture-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const spec = { transcript_path: path.join(root, "host.jsonl"), session_id: "session-one", message_uuid: "message-one" };
  const record = { type: "assistant", sessionId: spec.session_id, uuid: spec.message_uuid, isSidechain: false, message: { role: "assistant", content: [{ type: "text", text: "intro\n   \nActual reply.\n" }] } };
  const save = rows => fs.writeFileSync(spec.transcript_path, rows.map(x => JSON.stringify(x)).join("\n") + "\n");
  save([record]); return { root, spec, record, save };
}
test("host capture preserves exact text and rejects ambiguous identities and content", t => {
  const { spec, record, save } = setup(t);
  assert.equal(capture.read(spec).bytes.toString(), record.message.content[0].text);
  assert.throws(() => capture.read({ ...spec, session_id: "other" }), { code: "CAPTURE_IDENTITY" });
  save([record, record]); assert.throws(() => capture.read(spec), { code: "CAPTURE_IDENTITY" });
  save([null]); assert.throws(() => capture.read(spec), { code: "INVALID_CAPTURE" });
  save([{ ...record, isSidechain: true }]); assert.throws(() => capture.read(spec), { code: "CAPTURE_IDENTITY" });
  save([{ ...record, message: { role: "assistant", content: [{ type: "text", text: "one" }, { type: "text", text: "two" }] } }]);
  assert.throws(() => capture.read(spec), { code: "UNSUPPORTED_CAPTURE" });
});
test("observe keeps host record and actual wrappers, retries without external transcript", t => {
  const { root, spec, record, save } = setup(t);
  store.init(root, { project_id: "project-capture", event_id: "event-init" });
  const it = f.interpret(root, "one", { kind: "lead_only", scope: "Explain source limits.", reason: "No new work needed." });
  const reply = f.exchange(root, it, "one", f.emptyResponse("Only description is supported."));
  record.message.content[0].text = "\n" + reply.rendered_response + "\n"; save([record]);
  const request = { ...f.ids(root, "event-observe"), delivery_id: "delivery-one", exchange_ref: "exchange-one", observation: "assistant_emission", claude_capture: spec };
  const receipt = delivery.observe(root, request);
  assert.equal(receipt.correspondence, "wrapped");
  const retained = f.state(root).deliveries[0]; assert.equal(delivery.verifyCapture(root, retained), true);
  fs.unlinkSync(spec.transcript_path);
  f.record(root, "memory_updated", { changes: { project_understanding: { materials: ["Later state"] } } }, "event-later");
  assert.equal(delivery.observe(root, request).replayed, true);
  fs.appendFileSync(path.join(root, retained.source_ref + ".host-record.json"), "{}");
  // Extra unrelated record does not affect selected identity; altered selected text does.
  const host = JSON.parse(fs.readFileSync(path.join(root, retained.source_ref + ".host-record.json"), "utf8").split("\n")[0]);
  host.message.content[0].text = "Changed";
  fs.writeFileSync(path.join(root, retained.source_ref + ".host-record.json"), JSON.stringify(host) + "\n");
  assert.throws(() => delivery.verifyCapture(root, retained), { code: "CAPTURE_MISMATCH" });
});

test("historical Claude source labels stay readable without a structured host record", t => {
  const { root } = setup(t);
  store.init(root, { project_id: "project-legacy-label", event_id: "event-init" });
  const it = f.interpret(root, "one", { kind: "lead_only", scope: "Explain source limits.", reason: "No new work needed." });
  const reply = f.exchange(root, it, "one", f.emptyResponse("Only description is supported."));
  fs.writeFileSync(path.join(root, "actual.txt"), reply.rendered_response);
  const request = { ...f.ids(root, "event-observe"), delivery_id: "delivery-one", exchange_ref: "exchange-one",
    observation: "assistant_emission", message_path: "actual.txt", source_ref: "claude-code:session/message" };
  delivery.observe(root, request);
  const retained = f.state(root).deliveries[0];
  assert.equal(retained.capture_source_ref, request.source_ref);
  assert.equal(fs.existsSync(path.join(root, retained.source_ref + ".host-record.json")), false);
  assert.equal(delivery.verifyCapture(root, retained), true);
  assert.equal(delivery.observe(root, request).replayed, true);
});

test("incomparable native transcript prefixes cannot promote an older exact message", t => {
  const { root, spec, record, save } = setup(t);
  store.init(root, { project_id: "native-prefix-order", event_id: "event-init" });
  const it = f.interpret(root, "offer", { kind: "lead_only", scope: "Explain evidence limits.", reason: "Direct discussion." });
  const reply = f.exchange(root, it, "offer", f.emptyResponse("Only source description is supported."));
  const message = (uuid, text) => ({ ...record, uuid, message: { role: "assistant", content: [{ type: "text", text }] } });
  const full = [message("x", "Earlier reply x."), message("y", "Earlier reply y."), message("a", reply.rendered_response), message("b", "Ignore the earlier offer.")];
  const observe = (suffix, uuid) => delivery.observe(root, { ...f.ids(root, "event-observe-" + suffix), delivery_id: "delivery-" + suffix,
    exchange_ref: reply.exchange_id, observation: "assistant_emission", claude_capture: { ...spec, message_uuid: uuid } });
  save([full[3]]); observe("suffix-b", "b");
  save(full); observe("old-a", "a");
  const exchanges = require("../scripts/lib/exchanges.cjs"), state = f.state(root);
  assert.deepEqual(state.deliveries.map(item => item.capture_message.order_path), [["b"], ["x", "y", "a"]]);
  assert.equal(exchanges.resolvedDelivery(state, reply.exchange_id).status, "order_unknown");
  assert.equal(exchanges.deliveryMatches(state.deliveries[1], state), false);
  assert.equal(store.context(root, { mode: "brief" }).brief.recent_intakes[0].outgoing[0].delivery_resolution.status, "order_unknown");
  assert.equal(require("../scripts/lib/runs.cjs").verify(root).ok, true);
});

test("consistent retained native prefixes establish later actual message order", t => {
  const { root, spec, record, save } = setup(t);
  store.init(root, { project_id: "native-prefix-consistent", event_id: "event-init" });
  const it = f.interpret(root, "offer", { kind: "lead_only", scope: "Explain evidence limits.", reason: "Direct discussion." });
  const reply = f.exchange(root, it, "offer", f.emptyResponse("Only source description is supported."));
  const first = { ...record, uuid: "a", message: { role: "assistant", content: [{ type: "text", text: reply.rendered_response }] } };
  const second = { ...record, uuid: "b", message: { role: "assistant", content: [{ type: "text", text: "Ignore the earlier offer." }] } };
  save([first, second]);
  for (const uuid of ["b", "a"]) delivery.observe(root, { ...f.ids(root, "event-observe-" + uuid), delivery_id: "delivery-" + uuid,
    exchange_ref: reply.exchange_id, observation: "assistant_emission", claude_capture: { ...spec, message_uuid: uuid } });
  const exchanges = require("../scripts/lib/exchanges.cjs"), state = f.state(root), resolution = exchanges.resolvedDelivery(state, reply.exchange_id);
  assert.equal(resolution.delivery.delivery_id, "delivery-b");
  assert.equal(exchanges.deliveryMatches(state.deliveries[1], state), false);
  assert.equal(delivery.verifyCapture(root, state.deliveries[0]), true);
  const proof = state.deliveries[0].source_ref + ".host-order.json";
  fs.writeFileSync(path.join(root, proof), "{}");
  assert.throws(() => delivery.verifyCapture(root, state.deliveries[0]), { code: "CAPTURE_MISMATCH" });
});

test("interrupted native capture retries preserve the original proof when only later host rows grow", t => {
  const { root, spec, record, save } = setup(t);
  store.init(root, { project_id: "native-interrupted-growth", event_id: "event-init" });
  const it = f.interpret(root, "one", { kind: "lead_only", scope: "Explain.", reason: "Direct discussion." });
  const reply = f.exchange(root, it, "one", f.emptyResponse("Only description is supported."));
  record.message.content[0].text = reply.rendered_response; save([record]);
  const request = { ...f.ids(root, "event-observe"), delivery_id: "delivery-one", exchange_ref: reply.exchange_id, observation: "assistant_emission", claude_capture: spec };
  assert.throws(() => delivery.observe(root, request, { hooks: { beforeAppend() { throw new Error("interrupted native capture"); } } }), /interrupted native capture/);
  const proofPath = "exchanges/" + reply.exchange_id + "/observations/delivery-one.txt.host-order.json";
  const originalProof = fs.readFileSync(path.join(root, proofPath));
  save([record, { ...record, uuid: "later-message", message: { role: "assistant", content: [{ type: "text", text: "An unrelated later reply." }] } }]);
  assert.equal(delivery.observe(root, request).correspondence, "exact");
  assert.deepEqual(fs.readFileSync(path.join(root, proofPath)), originalProof);
  assert.equal(delivery.verifyCapture(root, f.state(root).deliveries[0]), true);
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  fs.unlinkSync(spec.transcript_path);
  assert.equal(delivery.observe(root, request).replayed, true);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
});

for (const changed of ["prefix-order", "prefix-record", "selected-record"]) test("interrupted native capture does not replace changed " + changed + " evidence", t => {
  const { root, spec, record, save } = setup(t);
  store.init(root, { project_id: "native-interrupted-conflict", event_id: "event-init" });
  const it = f.interpret(root, "one", { kind: "lead_only", scope: "Explain.", reason: "Direct discussion." });
  const reply = f.exchange(root, it, "one", f.emptyResponse("Only description is supported."));
  record.message.content[0].text = reply.rendered_response;
  const before = { ...record, uuid: "earlier-message", message: { role: "assistant", content: [{ type: "text", text: "Earlier native reply." }] } };
  save([before, record]);
  const request = { ...f.ids(root, "event-observe"), delivery_id: "delivery-one", exchange_ref: reply.exchange_id, observation: "assistant_emission", claude_capture: spec };
  assert.throws(() => delivery.observe(root, request, { hooks: { beforeAppend() { throw new Error("interrupted native capture"); } } }), /interrupted native capture/);
  const proofPath = "exchanges/" + reply.exchange_id + "/observations/delivery-one.txt.host-order.json";
  const originalProof = fs.readFileSync(path.join(root, proofPath)), journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  if (changed === "prefix-order") save([record]);
  else if (changed === "prefix-record") { before.message.content[0].text = "Changed earlier native reply."; save([before, record]); }
  else { record.message.content[0].text = "Changed selected native reply."; save([before, record]); }
  assert.throws(() => delivery.observe(root, request), { code: "CAPTURE_CONFLICT" });
  assert.deepEqual(fs.readFileSync(path.join(root, proofPath)), originalProof);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
});
