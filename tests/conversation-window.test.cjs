"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { buildRecentConversation } = require("../scripts/lib/conversation-window.cjs");
const { renderExchange } = require("../scripts/lib/exchanges.cjs");
const { sha256 } = require("../scripts/lib/files.cjs");

function fixture(t) {
  const base = fs.realpathSync.native(os.tmpdir());
  const root = fs.mkdtempSync(path.join(base, "cc-conversation-window-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("cc-conversation-window-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  return { root, state: { evidence: [], turns: [], deliveries: [] }, events: [] };
}
function append(loaded, suffix, payload) {
  const event = { event_id: "event-" + suffix, sequence: loaded.events.length + 1, payload: structuredClone(payload) };
  loaded.events.push(event);
  for (const record of payload.changes?.evidence || []) {
    const found = loaded.state.evidence.findIndex(item => item.evidence_id === record.evidence_id);
    if (found < 0) loaded.state.evidence.push(structuredClone(record));
    else loaded.state.evidence[found] = structuredClone(record);
  }
  return event;
}
function source(suffix, text, complete = true) {
  return { evidence_id: "user-" + suffix, kind: "user_statement", source_ref: "host:user:" + suffix,
    summary: "User request " + suffix, source_excerpt: text, ...(complete === undefined ? {} : { complete_message: complete }) };
}
function interpret(loaded, suffix, incoming = [source(suffix, "Please explain " + suffix + ".")]) {
  const refs = incoming.map(value => typeof value === "string" ? value : value.evidence_id);
  const interpretation = { interpretation_id: "interpretation-" + suffix, turn_id: "turn-" + suffix,
    incoming_refs: refs, components: [], basis_refs: [], next_action: { kind: "lead_only", scope: "Explain", reason: "User request" } };
  append(loaded, suffix, { changes: { evidence: incoming.filter(value => typeof value !== "string") }, interpretation });
  loaded.state.turns.push({ turn_id: interpretation.turn_id, interpretation_ref: interpretation.interpretation_id,
    work_refs: [], exchange_ref: null });
  return interpretation;
}
function prepare(loaded, suffix, interpretation, reconciles = []) {
  const exchange = { exchange_id: "exchange-" + suffix, interpretation_ref: interpretation.interpretation_id,
    turn_id: interpretation.turn_id, reconciles, renderer: "lead-markdown-v4", response: {
      status: "Answer " + suffix, questions: [], questions_none: "No questions now.", next_steps: [], next_steps_none: "You choose the next direction." } };
  append(loaded, "prepare-" + suffix, { exchange });
  for (const ref of [interpretation.interpretation_id, ...reconciles]) {
    const turn = loaded.state.turns.find(item => item.interpretation_ref === ref);
    if (turn) turn.exchange_ref = exchange.exchange_id;
  }
  return exchange;
}
function observe(loaded, suffix, exchange, options = {}) {
  const text = options.text ?? renderExchange(exchange);
  const relative = "exchanges/" + exchange.exchange_id + "/observations/delivery-" + suffix + ".txt";
  fs.mkdirSync(path.dirname(path.join(loaded.root, relative)), { recursive: true });
  fs.writeFileSync(path.join(loaded.root, relative), text);
  const delivery = { delivery_id: "delivery-" + suffix, exchange_ref: exchange.exchange_id,
    source_ref: relative, observation: "assistant_emission", response_sha256: sha256(renderExchange(exchange)),
    ...(options.legacy ? {} : { observed_response_sha256: sha256(text),
      capture_source_ref: options.source_ref ?? "host:assistant:" + suffix }),
    ...(options.observed_at ? { observed_at: options.observed_at } : {}),
    ...(options.response_span ? { response_span: options.response_span } : {}) };
  append(loaded, "observed-" + suffix, { delivery });
  loaded.state.deliveries.push(delivery);
  return delivery;
}

test("five intake window is unaffected by repeated interpretations, draft revisions and late observations", t => {
  const loaded = fixture(t), records = [];
  for (let i = 1; i <= 6; i++) {
    const incoming = interpret(loaded, String(i));
    records.push({ incoming, exchange: prepare(loaded, String(i), incoming) });
  }
  interpret(loaded, "reconsider-first", ["user-1"]);
  prepare(loaded, "revised-first", records[0].incoming);
  observe(loaded, "late-first", records[0].exchange, { observed_at: "after the sixth turn" });
  const before = JSON.stringify(loaded), filesBefore = fs.readdirSync(loaded.root, { recursive: true });
  const result = buildRecentConversation(loaded);
  assert.deepEqual(result.recent_intakes.map(item => item.intake_id), [2, 3, 4, 5, 6].map(i => "interpretation-" + i));
  assert.equal(result.coverage.total_saved_intakes, 6);
  assert.equal(result.coverage.omitted_older_intakes, 1);
  assert.match(result.coverage.outgoing_order, /unknown/);
  assert.ok(result.coverage.older_unfinished.some(item => item.intake_id === "interpretation-1"));
  assert.equal(JSON.stringify(loaded), before);
  assert.deepEqual(fs.readdirSync(loaded.root, { recursive: true }), filesBefore, "Context reads must not write transcript or projection files.");
});

test("marked contiguous input batch is one slot; an incomplete Unicode message stays visible", t => {
  const loaded = fixture(t), text = "我想知道\n  β = 0? 🙂\r\nI am not sure...";
  interpret(loaded, "batch", [source("one", "First message"), source("two", text, false), source("three", "Third message")]);
  interpret(loaded, "reinterpret-batch", ["user-one", "user-two", "user-three"]);
  const result = buildRecentConversation(loaded), intake = result.recent_intakes[0];
  assert.equal(result.coverage.total_saved_intakes, 1);
  assert.equal(intake.interpretations.length, 2);
  assert.deepEqual(intake.incoming_refs, ["user-one", "user-two", "user-three"]);
  assert.equal(intake.incoming[1].record.source_excerpt, text);
  assert.equal(intake.incoming[1].completeness, "incomplete");
  assert.equal(intake.grouping, "marked");
  assert.deepEqual(result.coverage.incomplete_or_unrecorded_sources.map(item => item.evidence_ref), ["user-two"]);
  assert.equal(Object.hasOwn(intake.interpretations[0], "components"), false);
});

test("fact evidence does not create slots or become the primary message when a marker is present", t => {
  const loaded = fixture(t), fact = source("fact", "Twenty seats per center.");
  delete fact.complete_message;
  interpret(loaded, "message", [fact, source("message", "Can we use that design?")]);
  append(loaded, "more-facts", { changes: { evidence: [source("not-interpreted", "Another recorded fact.")] } });
  const result = buildRecentConversation(loaded);
  assert.equal(result.coverage.total_saved_intakes, 1);
  assert.deepEqual(result.recent_intakes[0].incoming_refs, ["user-message"]);
});

test("an explicitly complete attachment-only message has empty text without a fabricated capture gap", t => {
  const loaded = fixture(t);
  interpret(loaded, "attachment", [source("attachment", "", true)]);
  const result = buildRecentConversation(loaded);
  assert.equal(result.recent_intakes[0].incoming[0].record.source_excerpt, "");
  assert.equal(result.recent_intakes[0].incoming[0].completeness, "complete");
  assert.deepEqual(result.coverage.incomplete_or_unrecorded_sources, []);
});

test("separate equal-text user messages keep separate source identities", t => {
  const loaded = fixture(t);
  interpret(loaded, "first", [source("first", "yes")]);
  interpret(loaded, "second", [source("second", "yes")]);
  const result = buildRecentConversation(loaded);
  assert.equal(result.coverage.total_saved_intakes, 2);
  assert.deepEqual(result.recent_intakes.map(item => item.incoming_refs), [["user-first"], ["user-second"]]);
});

test("original effective source survives a later sourced correction without using latest projection text", t => {
  const loaded = fixture(t), original = source("initial", "I think assignment was random.");
  original.limitations = ["Unverified recollection."];
  append(loaded, "source", { changes: { evidence: [original] } });
  // This is a normalized replacement: the earlier quote and limitations have
  // been retained by the writer and are now authoritative in this event.
  append(loaded, "summary-update", { changes: { evidence: [{ ...original, summary: "Tentative account of assignment." }] } });
  interpret(loaded, "original", ["user-initial"]);
  append(loaded, "corrected", { corrects_refs: ["user-initial"], reason: "Correct miscaptured source.",
    changes: { evidence: [{ ...original, source_excerpt: "I do not know how assignment happened.", summary: "Assignment is unknown." }] } });
  interpret(loaded, "recheck", ["user-initial"]);
  const result = buildRecentConversation(loaded), incoming = result.recent_intakes[0].incoming[0];
  assert.equal(result.coverage.total_saved_intakes, 1);
  assert.equal(incoming.source_event_ref, "event-summary-update");
  assert.equal(incoming.record.source_excerpt, original.source_excerpt);
  assert.deepEqual(incoming.record.limitations, ["Unverified recollection."]);
  assert.equal(incoming.later_source_version.record.source_excerpt, "I do not know how assignment happened.");
  assert.equal(incoming.later_source_version.source_event_ref, "event-corrected");
});

test("historical evidence replacement is not retroactively merged with omitted old fields", t => {
  const loaded = fixture(t), original = source("old", "Original quotation");
  delete original.complete_message;
  append(loaded, "source", { changes: { evidence: [original] } });
  const replacement = { evidence_id: original.evidence_id, kind: original.kind, source_ref: original.source_ref, summary: "Historical replacement without excerpt." };
  append(loaded, "replace", { changes: { evidence: [replacement] } });
  interpret(loaded, "legacy", ["user-old"]);
  const intake = buildRecentConversation(loaded).recent_intakes[0];
  assert.equal(intake.grouping, "provisional");
  assert.equal(intake.incoming[0].completeness, "missing");
  assert.equal(Object.hasOwn(intake.incoming[0].record, "source_excerpt"), false);
});

test("provisional legacy source gains a separately labeled attributed capture without moving its intake", t => {
  const loaded = fixture(t), old = source("old", "Relevant excerpt");
  delete old.complete_message;
  interpret(loaded, "old", [old]);
  interpret(loaded, "next");
  append(loaded, "repair", { changes: { evidence: [{ ...old, complete_message: true, source_excerpt: "Full relevant excerpt, including uncertainty." }] } });
  interpret(loaded, "repaired", ["user-old"]);
  const result = buildRecentConversation(loaded), intake = result.recent_intakes[0];
  assert.equal(result.coverage.total_saved_intakes, 2);
  assert.equal(intake.intake_id, "interpretation-old");
  assert.equal(intake.grouping, "provisional");
  assert.equal(intake.incoming[0].completeness, "unrecorded");
  assert.equal(intake.incoming[0].later_source_version.record.complete_message, true);
});

test("distinct legacy turn associations sharing unmarked evidence retain a provisional five-turn window", t => {
  const loaded = fixture(t), original = source("shared", "Please help with the study.");
  delete original.complete_message;
  append(loaded, "source", { changes: { evidence: [original] } });
  for (let i = 0; i < 8; i++) {
    const incoming = interpret(loaded, "legacy-" + i, [original.evidence_id]);
    prepare(loaded, "legacy-" + i, incoming);
  }
  const result = buildRecentConversation(loaded);
  assert.equal(result.coverage.total_saved_intakes, 8);
  assert.equal(result.coverage.omitted_older_intakes, 3);
  assert.deepEqual(result.recent_intakes.map(item => item.intake_id), [3, 4, 5, 6, 7].map(i => "interpretation-legacy-" + i));
  assert.ok(result.recent_intakes.every(item => item.grouping === "provisional"));
  assert.equal(result.recent_intakes.flatMap(item => item.outgoing).length, 5);
});

test("a marker repair cannot merge several ambiguous legacy turn associations or invent another turn", t => {
  const loaded = fixture(t), original = source("shared", "Relevant excerpt.");
  delete original.complete_message;
  interpret(loaded, "first", [original]);
  interpret(loaded, "second", [original.evidence_id]);
  append(loaded, "repair", { changes: { evidence: [{ ...original, complete_message: true, source_excerpt: "Full original message, including qualification." }] } });
  const repaired = interpret(loaded, "repair", [original.evidence_id]);
  prepare(loaded, "repair", repaired);
  const result = buildRecentConversation(loaded);
  assert.equal(result.coverage.total_saved_intakes, 2);
  assert.deepEqual(result.recent_intakes.map(item => item.intake_id), ["interpretation-first", "interpretation-second"]);
  const gap = result.coverage.uncertain_interpretation_associations[0];
  assert.equal(gap.interpretation_ref, repaired.interpretation_id);
  assert.deepEqual(gap.candidate_intake_ids, ["interpretation-first", "interpretation-second"]);
  assert.deepEqual(gap.outgoing_exchange_refs, ["exchange-repair"]);
  assert.deepEqual(gap.retrieval, { event_id: "event-repair" });
  assert.ok(result.recent_intakes.every(item => item.incoming[0].record.source_excerpt === original.source_excerpt));
});

test("a new closeout can reconcile old work without merging input groups", t => {
  const loaded = fixture(t), old = interpret(loaded, "old"), current = interpret(loaded, "current");
  const exchange = prepare(loaded, "current", current, [old.interpretation_id]);
  observe(loaded, "current", exchange);
  const result = buildRecentConversation(loaded);
  assert.equal(result.recent_intakes.length, 2);
  assert.deepEqual(result.recent_intakes[0].outgoing, []);
  assert.deepEqual(result.recent_intakes[0].reconciling_exchange_refs, [exchange.exchange_id]);
  assert.deepEqual(result.recent_intakes[0].unfinished, []);
  assert.equal(result.recent_intakes[1].actual_messages[0].captures[0].text, renderExchange(exchange));
});

test("repeated observations consolidate only an attributed same message; identical distinct replies remain separate", t => {
  const loaded = fixture(t), incoming = interpret(loaded, "one"), exchange = prepare(loaded, "one", incoming);
  observe(loaded, "one", exchange, { source_ref: "host:message-a" });
  observe(loaded, "repeat", exchange, { source_ref: "host:message-a" });
  observe(loaded, "separate", exchange, { source_ref: "host:message-b" });
  const intake = buildRecentConversation(loaded).recent_intakes[0];
  assert.equal(intake.actual_messages.length, 2);
  assert.equal(intake.actual_messages[0].observations.length, 2);
  assert.equal(intake.actual_messages[0].captures.length, 1);
  assert.equal(intake.actual_messages[1].observations.length, 1);
  assert.equal(intake.actual_messages[0].captures[0].text, intake.actual_messages[1].captures[0].text);
  assert.equal(Object.hasOwn(intake.outgoing[0].prepared, "text"), false, "Do not repeat a prepared body already available in actual capture.");
  assert.ok(intake.actual_messages.every(item => item.emission_order === "unknown"));
});

test("one actual message observed against two prepared revisions appears once", t => {
  const loaded = fixture(t), incoming = interpret(loaded, "one");
  const first = prepare(loaded, "first", incoming), second = prepare(loaded, "second", incoming);
  observe(loaded, "first", first, { source_ref: "host:message-a" });
  observe(loaded, "second", second, { source_ref: "host:message-a", text: renderExchange(first) });
  const intake = buildRecentConversation(loaded).recent_intakes[0];
  assert.equal(intake.actual_messages.length, 1);
  assert.equal(intake.actual_messages[0].captures.length, 1);
  assert.deepEqual(intake.actual_messages[0].observations.map(item => item.correspondence), ["exact", "different"]);
  assert.equal(intake.outgoing[1].prepared.text, renderExchange(second));
});

test("differing and wrapped actual captures retain their full text and correspondence restrictions", t => {
  const loaded = fixture(t), incoming = interpret(loaded, "one"), exchange = prepare(loaded, "one", incoming);
  const prepared = renderExchange(exchange), prefix = "Host note: response follows.\n", text = prefix + prepared + "\nEnd of response.";
  observe(loaded, "wrapped", exchange, { text, response_span: { start_byte: Buffer.byteLength(prefix),
    end_byte: Buffer.byteLength(prefix + prepared), wrapper_review: "Wrapper labels only, without changing the response." } });
  observe(loaded, "different", exchange, { text: "Actually, the outcome is unknown." });
  const intake = buildRecentConversation(loaded).recent_intakes[0];
  assert.equal(intake.actual_messages[0].captures[0].text, text);
  assert.equal(intake.actual_messages[0].observations[0].correspondence, "wrapped");
  assert.equal(intake.actual_messages[0].observations[0].binding_compatible, false, "A later conflicting capture retains the existing restriction.");
  assert.equal(intake.actual_messages[1].captures[0].text, "Actually, the outcome is unknown.");
  assert.equal(intake.actual_messages[1].observations[0].binding_compatible, false);
});

test("capture failures remain explicit and never fabricate actual text from prepared output", t => {
  const loaded = fixture(t), incoming = interpret(loaded, "one"), exchange = prepare(loaded, "one", incoming);
  const missing = observe(loaded, "missing", exchange), corrupt = observe(loaded, "corrupt", exchange);
  fs.unlinkSync(path.join(loaded.root, missing.source_ref));
  fs.writeFileSync(path.join(loaded.root, corrupt.source_ref), "Changed capture.");
  const result = buildRecentConversation(loaded), intake = result.recent_intakes[0];
  assert.deepEqual(result.coverage.capture_problems.map(item => item.status), ["unavailable", "corrupt"]);
  assert.ok(intake.actual_messages.every(item => item.captures.length === 0));
  assert.ok(intake.actual_messages.every(item => item.observations[0].binding_compatible === false));
  assert.equal(intake.outgoing[0].prepared.text, renderExchange(exchange));
  assert.deepEqual(intake.unfinished[0].reasons, ["actual_capture_unavailable"]);
});

test("legacy delivery without capture identity or hash remains uncertain even if a path exists", t => {
  const loaded = fixture(t), incoming = interpret(loaded, "one"), exchange = prepare(loaded, "one", incoming);
  observe(loaded, "first", exchange, { legacy: true });
  observe(loaded, "second", exchange, { legacy: true });
  const intake = buildRecentConversation(loaded).recent_intakes[0];
  assert.equal(intake.actual_messages.length, 2);
  assert.ok(intake.actual_messages.every(item => item.identity.status === "uncertain"));
  assert.ok(intake.actual_messages.every(item => item.captures.length === 0));
  assert.ok(intake.actual_messages.every(item => item.observations[0].correspondence === "unverified"));
  assert.equal(intake.unfinished[0].reasons[0], "actual_response_requires_reconciliation");
});

test("late observations stay with original intake without claiming capture-time order", t => {
  const loaded = fixture(t), first = interpret(loaded, "first"), firstReply = prepare(loaded, "first", first);
  const second = interpret(loaded, "second"), secondReply = prepare(loaded, "second", second);
  observe(loaded, "second", secondReply, { observed_at: "1900-01-01", source_ref: "z:second" });
  observe(loaded, "first", firstReply, { observed_at: "2099-01-01", source_ref: "a:first" });
  const result = buildRecentConversation(loaded);
  assert.deepEqual(result.recent_intakes.map(item => item.intake_id), ["interpretation-first", "interpretation-second"]);
  assert.equal(result.recent_intakes[0].actual_messages[0].identity.source_ref, "a:first");
  assert.equal(result.recent_intakes[0].actual_messages[0].emission_order, "unknown");
});

test("conflicting retained bodies for the same attributed message remain separately visible", t => {
  const loaded = fixture(t), incoming = interpret(loaded, "one"), exchange = prepare(loaded, "one", incoming);
  observe(loaded, "original", exchange, { source_ref: "host:same" });
  observe(loaded, "conflict", exchange, { source_ref: "host:same", text: "A conflicting source capture." });
  const message = buildRecentConversation(loaded).recent_intakes[0].actual_messages[0];
  assert.equal(message.captures.length, 2);
  assert.match(message.warning, /conflicting retained captures/);
});

test("live normalized journal updates preserve the source marker and exact input at its original intake", t => {
  const loaded = fixture(t), store = require("../scripts/lib/store.cjs"), f = require("./fixtures/consultation-loop.cjs");
  store.init(loaded.root, { project_id: "project-window", event_id: "event-init", project_understanding: { objective: "Discuss the study." } });
  const original = { ...source("live", "I think 20 seats were assigned.\nI do not know whether they can move."), limitations: ["User recollection only."] };
  f.record(loaded.root, "memory_updated", { changes: { evidence: [original] } }, "event-source");
  f.record(loaded.root, "memory_updated", { changes: { evidence: [{ evidence_id: original.evidence_id, kind: original.kind,
    source_ref: original.source_ref, summary: "Tentative seat count; transferability unknown." }] } }, "event-summary");
  f.record(loaded.root, "reply_interpreted", { protocol: "durable-exchanges-v1", interpretation: {
    interpretation_id: "interpretation-live", turn_id: "turn-live", incoming_refs: [original.evidence_id],
    components: [{ kind: "information", meaning: "Tentative count, unresolved transferability.", established: ["The user recalls 20 seats."], unresolved: ["Transferability."] }],
    basis_refs: [], next_action: { kind: "lead_only", scope: "Clarify transferability.", reason: "Do not turn a tentative account into a verified design fact." }
  } }, "event-intake");
  const result = buildRecentConversation(store.readJournal(loaded.root)), incoming = result.recent_intakes[0].incoming[0];
  assert.equal(incoming.source_event_ref, "event-source");
  assert.equal(incoming.later_source_version.source_event_ref, "event-summary");
  assert.equal(incoming.record.source_excerpt, original.source_excerpt);
  assert.equal(incoming.record.complete_message, true);
  assert.deepEqual(incoming.record.limitations, original.limitations);
});
