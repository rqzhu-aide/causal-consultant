"use strict";
// Deliberately synthetic exports and host records. These test the conversation
// contract without claiming evidence from a live host or executing analysis.
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/store.cjs"), delivery = require("../scripts/lib/delivery.cjs");
const policy = require("../scripts/lib/authorizations.cjs"), exchanges = require("../scripts/lib/exchanges.cjs");
const { canonical, sha256 } = require("../scripts/lib/files.cjs");
const { pendingPrimarySources } = require("../scripts/lib/model.cjs");
const f = require("./fixtures/consultation-loop.cjs");
const plan = { kind: "analysis", objective: "Estimate offer effect.", claim_boundary: "Randomized sample only.", inputs: [],
  target: "Offer effect", population: "Randomized sample", treatment: "Offer", comparator: "No offer", outcome: "Score",
  timing: "One year", estimand: "Mean difference", design_id: "randomized_assignment", estimator: "Difference of means",
  exclusions: [], diagnostics: ["Missingness", "Balance"] };
function setup(t) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-delivery-continuity-"));
  t.after(() => { assert.equal(path.dirname(fs.realpathSync.native(root)), base); assert.ok(path.basename(root).startsWith("cc-delivery-continuity-")); fs.rmSync(root, { recursive: true, force: true }); });
  store.init(root, { project_id: "delivery-continuity", event_id: "event-init" });
  return { root, offer: f.prepareScope(root, plan, { suffix: "first" }) };
}
function capture(root, offer, suffix, text, ordinal, source = suffix, extra = {}) {
  const message_path = suffix + ".txt"; fs.writeFileSync(path.join(root, message_path), text);
  return delivery.observe(root, { ...f.ids(root, "event-observe-" + suffix), delivery_id: "delivery-" + suffix,
    exchange_ref: offer.exchange_ref, observation: "assistant_emission", message_path, source_ref: "fixture-host:" + source,
    ...(ordinal ? { capture_message: { conversation_ref: "fixture-host:conversation", message_ref: source, ordinal } } : {}), ...extra });
}
function raw(root, id, text) {
  return f.record(root, "memory_updated", { changes: { evidence: [{ ...f.statement(id, text), complete_message: true }] } }, "event-raw-" + id);
}
function control(root, offer, suffix, disposition, userRef, text) {
  const it = { interpretation_id: "interpretation-" + suffix, turn_id: "turn-" + suffix, incoming_refs: [userRef], basis_refs: [],
    components: [{ kind: "instruction", meaning: text, established: ["Protected work must stop."], unresolved: [],
      exchange_ref: offer.exchange_ref, option_id: offer.option_id, delivery_ref: offer.delivery_ref }],
    next_action: { kind: "lead_only", scope: "Honor the current control direction.", reason: "The user paused or withdrew existing permission." },
    action_decisions: [{ decision_id: "decision-" + suffix, scope_ref: offer.scope.scope_id, disposition,
      exchange_ref: offer.exchange_ref, option_id: offer.option_id, delivery_ref: offer.delivery_ref, user_refs: [userRef] }] };
  return f.record(root, "reply_interpreted", { protocol: exchanges.PROTOCOL, interpretation: it }, "event-control-" + suffix);
}

test("prepared response paths and hard-link aliases fail through both live delivery APIs", t => {
  const { root, offer } = setup(t), relative = "exchanges/" + offer.exchange_ref + "/response.md";
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  const observe = message_path => delivery.observe(root, { ...f.ids(root, "event-forged-observe"), delivery_id: "delivery-forged-observe",
    exchange_ref: offer.exchange_ref, observation: "assistant_emission", message_path, source_ref: "fixture-host:pretend" });
  assert.throws(() => observe(relative), { code: "PREPARED_CAPTURE_SOURCE" });
  fs.linkSync(path.join(root, relative), path.join(root, "prepared-alias.txt"));
  assert.throws(() => observe("prepared-alias.txt"), { code: "PREPARED_CAPTURE_SOURCE" });
  for (const source_ref of [relative, "prepared-alias.txt"]) assert.throws(() => f.record(root, "exchange_delivery", {
    protocol: exchanges.PROTOCOL, delivery: { delivery_id: "delivery-forged-direct", exchange_ref: offer.exchange_ref,
      observation: "assistant_emission", source_ref, capture_source_ref: "fixture-host:pretend", response_sha256: sha256(offer.rendered_response), observed_response_sha256: sha256(offer.rendered_response) }
  }, "event-forged-direct"), { code: "PREPARED_CAPTURE_SOURCE" });
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
});

test("line-ending equivalence preserves raw hashes and does not admit substantive edits", t => {
  const { root, offer } = setup(t), actual = offer.rendered_response.replaceAll("\n", "\r\n");
  const result = capture(root, offer, "crlf", actual, 2);
  assert.equal(result.correspondence, "line_endings_equivalent");
  const value = f.state(root).deliveries.at(-1);
  assert.notEqual(value.observed_response_sha256, value.response_sha256);
  assert.equal(fs.readFileSync(path.join(root, value.source_ref), "utf8"), actual);
  assert.equal(exchanges.deliveryMatches(value, f.state(root)), true);
  assert.equal(require("../scripts/lib/runs.cjs").verify(root).ok, true);
  for (const [index, edited] of [offer.rendered_response.replace(/\n\n/, "\n"), offer.rendered_response.replace("Randomized sample only.", "All populations."), offer.rendered_response.replace("Full saved scope", "Other saved scope"), offer.rendered_response.replace("\n", "\r")].entries()) {
    assert.equal(capture(root, offer, "changed-" + index, edited, index + 3).correspondence, "different");
  }
  const forged = { ...value, delivery_id: "delivery-forged-equivalence", source_ref: "changed-1.txt", observed_response_sha256: sha256(fs.readFileSync(path.join(root, "changed-1.txt"))) };
  delete forged.event_ref;
  assert.throws(() => f.record(root, "exchange_delivery", { protocol: exchanges.PROTOCOL, delivery: forged }, "event-forged-equivalence"), { code: "CAPTURE_MISMATCH" });
});

test("direct equivalence cannot repair malformed UTF-8 through replacement-character decoding", t => {
  const { root } = setup(t);
  const it = f.interpret(root, "unicode", { kind: "lead_only", scope: "Explain text.", reason: "Direct answer." });
  const reply = f.exchange(root, it, "unicode", f.emptyResponse("The symbol is \uFFFD.\nRetain it exactly."));
  const prepared = Buffer.from(reply.rendered_response), replacement = Buffer.from("\uFFFD"), offset = prepared.indexOf(replacement);
  assert.ok(offset >= 0);
  const bytes = Buffer.concat([prepared.subarray(0, offset), Buffer.from([255]), prepared.subarray(offset + replacement.length)]);
  assert.equal(delivery.lineEndingsEquivalent(Buffer.from([255]), replacement), false);
  fs.writeFileSync(path.join(root, "invalid.txt"), bytes);
  assert.throws(() => f.record(root, "exchange_delivery", { protocol: exchanges.PROTOCOL, delivery: {
    delivery_id: "delivery-invalid", exchange_ref: reply.exchange_id, observation: "assistant_emission", source_ref: "invalid.txt",
    capture_source_ref: "fixture-host:invalid", response_sha256: reply.response_sha256, observed_response_sha256: sha256(bytes), response_equivalence: "lf-crlf-v1"
  } }, "event-invalid"), { code: "CAPTURE_MISMATCH" });
});

test("known native order prevents older recapture from reactivating an offer in every reader", t => {
  const { root, offer } = setup(t);
  capture(root, offer, "newer", offer.rendered_response + "\nIgnore that offer.", 2, "message-newer");
  const initial = f.state(root).deliveries[0];
  capture(root, offer, "older-again", offer.rendered_response, 1, "assistant-first", { capture_message: initial.capture_message });
  const state = f.state(root), resolution = exchanges.resolvedDelivery(state, offer.exchange_ref);
  assert.equal(resolution.delivery.delivery_id, "delivery-newer");
  assert.equal(exchanges.deliveryMatches(initial, state), false);
  assert.equal(store.status(root).views.work.exchanges.find(item => item.exchange_id === offer.exchange_ref).delivery.applicable_delivery_ref, "delivery-newer");
  const brief = store.context(root, { mode: "brief" }).brief;
  assert.equal(brief.recent_intakes[0].outgoing[0].delivery_resolution.delivery.delivery_id, "delivery-newer");
  assert.throws(() => f.acceptScope(root, offer, { suffix: "bad-choice" }), { code: "UNOBSERVED_EXCHANGE" });
  const journal = fs.readFileSync(path.join(root, "journal.jsonl")); store.recover(root);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
});

test("global latest actual exchange follows known message order while latest observation remains append-based", t => {
  const { root, offer } = setup(t), first = f.state(root).deliveries[0];
  const it = f.interpret(root, "later", { kind: "lead_only", scope: "Explain a later question.", reason: "Current user direction." });
  const later = f.exchange(root, it, "later", f.emptyResponse("This is the later actual reply."));
  f.deliver(root, later.exchange_id, "later");
  capture(root, offer, "old-recaptured", offer.rendered_response, 1, "assistant-first", { capture_message: first.capture_message });
  let work = store.status(root).views.work;
  assert.equal(work.latest_delivery_observation_ref, "delivery-old-recaptured");
  assert.equal(work.latest_observed_exchange_ref, later.exchange_id);
  assert.equal(work.latest_actual_message.delivery_ref, "delivery-later");
  capture(root, offer, "missing-global-order", offer.rendered_response, null, "different-unordered-message");
  work = store.status(root).views.work;
  assert.equal(work.latest_observed_exchange_ref, null);
  assert.equal(work.latest_actual_message.status, "order_unknown");
});

test("timestamps cannot establish missing message order and conflicting identities cannot be repaired by recapture", t => {
  const { root, offer } = setup(t);
  capture(root, offer, "unknown-order", offer.rendered_response, null, "other-message", { observed_at: "2099-01-01T00:00:00Z" });
  assert.equal(exchanges.resolvedDelivery(f.state(root), offer.exchange_ref).status, "order_unknown");
  assert.equal(exchanges.deliveryMatches(f.state(root).deliveries[0], f.state(root)), false);
  const first = f.state(root).deliveries[0];
  capture(root, offer, "identity-conflict", "A contradictory captured body.", 1, "assistant-first", { capture_message: first.capture_message });
  capture(root, offer, "identity-old-again", offer.rendered_response, 1, "assistant-first", { capture_message: first.capture_message });
  assert.equal(exchanges.resolvedDelivery(f.state(root), offer.exchange_ref).status, "identity_conflict");
});

test("review of the same retained wrapper refines applicability without manufacturing a later emission", t => {
  const { root, offer } = setup(t), actual = "Here is the proposal.\n" + offer.rendered_response;
  const first = capture(root, offer, "wrapped-unreviewed", actual, 2, "wrapped-message");
  assert.equal(first.correspondence, "different");
  const second = capture(root, offer, "wrapped-reviewed", actual, 2, "wrapped-message", { wrapper_review: "The introduction only identifies the proposal; it changes no terms." });
  assert.equal(second.correspondence, "wrapped");
  const resolution = exchanges.resolvedDelivery(f.state(root), offer.exchange_ref);
  assert.equal(resolution.delivery.delivery_id, "delivery-wrapped-reviewed");
  assert.equal(resolution.delivery.capture_message.ordinal, 2);
  assert.equal(exchanges.deliveryMatches(f.state(root).deliveries.at(-1), f.state(root)), true);
});

for (const disposition of ["defer", "withdraw"]) test(disposition + " of accepted work succeeds after delivery discrepancy", t => {
  const { root, offer } = setup(t); f.acceptScope(root, offer, { suffix: "accept" });
  capture(root, offer, "discrepant", "A different actual reply.", 2);
  const text = disposition === "withdraw" ? "Stop. I withdraw my earlier approval." : "Pause this analysis until I return.";
  raw(root, "user-control", text); control(root, offer, disposition, disposition, "user-control", text);
  assert.equal(policy.eligibility(f.state(root), offer.scope.scope_id).reason, disposition);
  assert.equal(pendingPrimarySources(f.state(root)).length, 0);
  assert.equal(f.state(root).action_decisions.at(-1).disposition, disposition);
  assert.equal(f.state(root).evidence.find(item => item.evidence_id === "user-control").source_excerpt, text);
  assert.equal(f.state(root).runs.length, 0);
});

test("interruption after raw stop capture blocks start and continuation until the same intake is reconciled", t => {
  const { root, offer } = setup(t), execution = f.acceptScope(root, offer, { suffix: "accept" });
  const binding = policy.validateRunStart(f.state(root), execution), run = { kind: "analysis", authorization_binding: binding };
  const text = "Stop the analysis now. Keep my earlier factual answer, but withdraw permission.";
  const request = { ...f.ids(root, "event-raw-stop"), type: "memory_updated", payload: { changes: { evidence: [{ ...f.statement("user-stop", text), complete_message: true }] } } };
  store.record(root, request);
  assert.throws(() => policy.validateRunStart(f.state(root), execution), { code: "INVALID_AUTHORIZATION" });
  assert.throws(() => policy.validateRunContinuation(f.state(root), run, execution), { code: "DIRECTION_PENDING" });
  store.recover(root); assert.equal(store.record(root, request).replayed, true);
  const context = store.context(root, { limit: 1 }); assert.ok(context.context.evidence.some(item => item.evidence_id === "user-stop"));
  let brief = store.context(root, { mode: "brief" }).brief;
  assert.deepEqual(brief.recent_intakes.at(-1).unfinished[0].reasons, ["awaiting_interpretation"]);
  const before = brief.coverage.conversation.total_saved_intakes;
  control(root, offer, "stop", "withdraw", "user-stop", text);
  brief = store.context(root, { mode: "brief" }).brief;
  assert.equal(brief.coverage.conversation.total_saved_intakes, before);
  assert.equal(brief.recent_intakes.at(-1).incoming[0].record.source_excerpt, text);
  assert.equal(pendingPrimarySources(f.state(root)).length, 0);
  assert.equal(policy.eligibility(f.state(root), offer.scope.scope_id).reason, "withdraw");
});

test("failed mixed reply binding preserves original answer and selection source through explicit source-only recovery", t => {
  const { root, offer } = setup(t);
  capture(root, offer, "changed", "The actual reply replaced the saved proposal.", 2);
  const text = "The allocation record exists. I choose the first option, using only the randomized sample.";
  const source = { ...f.statement("user-mixed", text), complete_message: true };
  const it = { interpretation_id: "interpretation-mixed", turn_id: "turn-mixed", incoming_refs: [source.evidence_id], basis_refs: [],
    components: [{ kind: "information", meaning: "The allocation record exists.", established: ["Record available."], unresolved: [] },
      { kind: "selection", meaning: "Choose the first offered scope only for the randomized sample.", established: [], unresolved: [], exchange_ref: offer.exchange_ref, option_id: offer.option_id, delivery_ref: offer.delivery_ref }],
    next_action: { kind: "lead_only", scope: "Retain and reconcile the original reply.", reason: "The captured delivery requires reconciliation.", adjustment_reason: "No protected work starts." } };
  assert.throws(() => f.record(root, "reply_interpreted", { protocol: exchanges.PROTOCOL, changes: { evidence: [source] }, interpretation: it }, "event-mixed"), { code: "UNOBSERVED_EXCHANGE" });
  assert.equal(f.state(root).evidence.some(item => item.evidence_id === source.evidence_id), false);
  raw(root, source.evidence_id, text);
  const pendingCount = store.context(root, { mode: "brief" }).brief.coverage.conversation.total_saved_intakes;
  // A new identified synthetic host message supplies the immutable offer.
  capture(root, offer, "reconciled", offer.rendered_response, 3);
  it.components[1].delivery_ref = "delivery-reconciled";
  f.record(root, "reply_interpreted", { protocol: exchanges.PROTOCOL, interpretation: it }, "event-mixed-recovered");
  assert.equal(store.context(root, { mode: "brief" }).brief.coverage.conversation.total_saved_intakes, pendingCount);
  assert.equal(store.history(root, { record_id: it.interpretation_id }).events.at(-1).payload.interpretation.components[1].kind, "selection");
  assert.equal(f.state(root).evidence.find(item => item.evidence_id === source.evidence_id).source_excerpt, text);
  assert.equal(f.state(root).runs.length, 0);
});

test("source-only batches reconcile one intake and keep an uninterpreted remainder visible", t => {
  const { root } = setup(t);
  f.record(root, "memory_updated", { changes: { evidence: [
    { ...f.statement("user-part-a", "The allocation record exists."), complete_message: true },
    { ...f.statement("user-part-b", "Pause until I check the exclusions."), complete_message: true }
  ] } }, "event-raw-batch");
  let brief = store.context(root, { mode: "brief" }).brief, count = brief.coverage.conversation.total_saved_intakes;
  assert.deepEqual(brief.recent_intakes.at(-1).incoming_refs, ["user-part-a", "user-part-b"]);
  const interpret = (suffix, incoming_refs) => f.record(root, "reply_interpreted", { protocol: exchanges.PROTOCOL, interpretation: {
    interpretation_id: "interpretation-batch-" + suffix, turn_id: "turn-batch-" + suffix, incoming_refs, basis_refs: [],
    components: [{ kind: "information", meaning: "Retain these exact source statements.", established: [], unresolved: [] }],
    next_action: { kind: "lead_only", scope: "Reconcile the captured batch.", reason: "No protected work starts." }
  } }, "event-batch-" + suffix);
  interpret("part-a", ["user-part-a"]);
  brief = store.context(root, { mode: "brief" }).brief;
  assert.equal(brief.coverage.conversation.total_saved_intakes, count);
  assert.deepEqual(brief.recent_intakes.at(-1).unfinished.find(item => item.reasons.includes("awaiting_interpretation")).incoming_refs, ["user-part-b"]);
  interpret("part-b", ["user-part-b"]);
  assert.equal(store.context(root, { mode: "brief" }).brief.coverage.conversation.total_saved_intakes, count);
  assert.equal(pendingPrimarySources(f.state(root)).length, 0);
});

test("historical append-order acceptance, raw sources, event hashes and interpretation retries remain unchanged", t => {
  const { createFixture, exchange, interpretation } = require("./fixtures/multiturn.cjs");
  const fixture = createFixture(); fixture.append("consultation_policy_activated", { policy: policy.POLICY, reconciliation: "Synthetic legacy history." });
  fixture.interpret("first"); const outgoing = exchange("first"); outgoing.renderer = "lead-markdown-v8";
  fixture.append("exchange_prepared", { protocol: exchanges.PROTOCOL, exchange: outgoing });
  const hash = sha256(exchanges.renderExchange(outgoing));
  for (const [suffix, observed_response_sha256, capture_source_ref] of [["old", hash, "fixture:old"], ["new", sha256("different"), "fixture:new"], ["old-again", hash, "fixture:old"]]) fixture.append("exchange_delivery", {
    protocol: exchanges.PROTOCOL, delivery: { delivery_id: "delivery-" + suffix, exchange_ref: outgoing.exchange_id, observation: "assistant_emission", source_ref: suffix + ".txt", response_sha256: hash, observed_response_sha256, capture_source_ref } });
  const reply = interpretation("legacy-reply"); reply.components = [{ kind: "selection", meaning: "Explain allocation.", established: [], unresolved: [], exchange_ref: outgoing.exchange_id, option_id: "explain", delivery_ref: "delivery-old" }];
  fixture.append("reply_interpreted", { protocol: exchanges.PROTOCOL, interpretation: reply });
  fixture.append("memory_updated", { changes: { evidence: [{ ...f.statement("legacy-uninterpreted", "A historical retained note."), complete_message: true }] } });
  const { root } = setup(t); fs.writeFileSync(path.join(root, "journal.jsonl"), fixture.events.map(canonical).join("\n") + "\n");
  const before = fs.readFileSync(path.join(root, "journal.jsonl")); store.recover(root);
  assert.deepEqual(store.readJournal(root).state, fixture.state);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  assert.equal(pendingPrimarySources(f.state(root)).length, 0);
  assert.equal(exchanges.deliveryMatches(f.state(root).deliveries[0], f.state(root)), false);
  const event = fixture.events.find(item => item.payload.interpretation?.interpretation_id === reply.interpretation_id);
  assert.equal(store.record(root, { event_id: event.event_id, expected_project_id: event.project_id, expected_last_event_id: event.previous_event_id, type: event.type, payload: event.payload }).replayed, true);
});
