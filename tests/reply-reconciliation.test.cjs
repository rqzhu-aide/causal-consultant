"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const store = require("../scripts/lib/store.cjs");
const { canonical } = require("../scripts/lib/files.cjs");
const { createFixture, exchange } = require("./fixtures/multiturn.cjs");
const f = require("./fixtures/consultation-loop.cjs");
const QUESTION = "question-allocation";
const REMAINING = "Can unused seats be transferred between centers?";

function project(t) {
  const base = fs.realpathSync.native(os.tmpdir());
  const root = fs.mkdtempSync(path.join(base, "cc-reply-reconciliation-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("cc-reply-reconciliation-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const fixture = createFixture();
  fixture.append("memory_updated", { changes: { questions: [{ question_id: QUESTION, origin: "consultant",
    statement: "Are seats fixed per center, or can they be pooled?", status: "open", basis_refs: ["user-request"] }] } });
  fixture.interpret("offer");
  const offered = exchange("offer");
  offered.response.questions[0].text = "Are seats fixed per center, or can they be pooled?";
  fixture.append("exchange_prepared", { protocol: "durable-exchanges-v1", exchange: offered });
  fs.writeFileSync(path.join(root, "journal.jsonl"), fixture.events.map(canonical).join("\n") + "\n");
  store.recover(root);
  const rendered = require("../scripts/lib/exchanges.cjs").renderExchange(offered);
  fs.writeFileSync(path.join(root, "actual-offer.txt"), rendered);
  require("../scripts/lib/delivery.cjs").observe(root, { ...f.ids(root, "event-observed"), delivery_id: "delivery-offer",
    exchange_ref: "exchange-offer", observation: "assistant_emission", message_path: "actual-offer.txt", source_ref: "fixture:actual-offer" });
  return root;
}
function question(root) { return f.state(root).questions.find(item => item.question_id === QUESTION); }
function reply(root, suffix, quote, remaining, status = "open", bound = true) {
  const source = "user-" + suffix;
  return { ...f.ids(root, "event-" + suffix), type: "reply_interpreted", payload: {
    protocol: "durable-exchanges-v1", changes: {
      evidence: [f.statement(source, quote)], questions: [{ ...question(root), status, reason: quote,
        resolution: { answer_refs: [...(question(root).resolution?.answer_refs || []), source], remaining } }]
    }, interpretation: { interpretation_id: "interpretation-" + suffix, turn_id: "turn-" + suffix, incoming_refs: [source], basis_refs: [QUESTION],
      components: [{ kind: bound ? "answer" : "information", meaning: quote, established: [quote], unresolved: remaining,
        ...(bound ? { exchange_ref: "exchange-offer", question_ref: QUESTION, delivery_ref: "delivery-offer" } : {}) }],
      next_action: { kind: "lead_only", scope: "Reconcile the seat rule before selecting a design.",
        reason: remaining.length ? "Pooling remains unresolved." : "The current seat rule is now recorded." }
    }
  } };
}
function reject(root, value, code) {
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(() => store.record(root, value), { code });
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
}

test("a partial answer cannot close its unanswered remainder, even when the user requests completion", t => {
  const root = project(t);
  const partial = reply(root, "partial", "Each center receives 20 seats. Nothing else is open; finish.", [REMAINING]);
  const falseClosure = structuredClone(partial);
  falseClosure.payload.changes.questions[0].status = "answered";
  falseClosure.payload.changes.questions[0].resolution.remaining = [];
  reject(root, falseClosure, "QUESTION_RESOLUTION_CONFLICT");
  store.record(root, partial);
  assert.equal(question(root).status, "open");
  assert.deepEqual(question(root).resolution.remaining, [REMAINING]);
  assert.equal(f.state(root).runs.length, 0);
});

test("a remainder survives an omitted update and clears only with a reconciled answer; retry is exact", t => {
  const root = project(t);
  store.record(root, reply(root, "partial", "Each center has 20 seats; I do not know whether they can move.", [REMAINING]));
  const retained = structuredClone(question(root).resolution);
  const omitted = { ...question(root), reason: "Waiting for the office to check transferability." };
  delete omitted.resolution;
  f.record(root, "memory_updated", { changes: { questions: [omitted] } }, "event-wait");
  assert.deepEqual(question(root).resolution, retained);
  const precise = reply(root, "precise", "The office confirmed unused seats must stay within their original center.", [], "answered");
  store.record(root, precise);
  assert.deepEqual(question(root).resolution.remaining, []);
  assert.deepEqual(question(root).resolution.answer_refs, ["user-partial", "user-precise"]);
  store.recover(root);
  f.record(root, "memory_updated", { changes: { project_understanding: { audience: "Study office" } } }, "event-later");
  const bytes = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.equal(store.record(root, precise).replayed, true);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), bytes);
});

test("question resolution rejects assumption-as-answer and unquoted or uninterpreted user sources", t => {
  const root = project(t);
  f.record(root, "memory_updated", { changes: { assumptions: [{ assumption_id: "assumption-fixed", status: "active",
    statement: "Seats stay per center as a working assumption.", basis_refs: ["user-request"] }] } }, "event-assumption");
  const value = reply(root, "answer", "I think seats stay per center, but I am not sure.", [REMAINING]);
  value.payload.changes.questions[0].resolution.answer_refs = ["assumption-fixed"];
  reject(root, value, "INVALID_ANSWER_SOURCE");
  const noQuote = reply(root, "answer", "Not yet confirmed.", [REMAINING]);
  delete noQuote.payload.changes.evidence[0].source_excerpt;
  reject(root, noQuote, "MISSING_USER_SOURCE");
  const noInterpretation = reply(root, "answer", "Each center has 20 seats.", [REMAINING]);
  noInterpretation.type = "memory_updated";
  delete noInterpretation.payload.interpretation;
  delete noInterpretation.payload.protocol;
  reject(root, noInterpretation, "MISSING_ANSWER_INTERPRETATION");
});

test("unknown then declined stops asking without establishing the missing fact", t => {
  const root = project(t);
  store.record(root, reply(root, "unknown", "I do not know the seat-transfer rule.", [REMAINING]));
  store.record(root, reply(root, "declined", "Please stop asking me about seat transfers; the office cannot check this now.", [REMAINING], "retired"));
  const current = question(root);
  assert.equal(current.status, "retired");
  assert.deepEqual(current.resolution.remaining, [REMAINING]);
  assert.equal(f.state(root).assumptions.length, 0);
  assert.equal(f.state(root).action_decisions?.length || 0, 0);
});

test("a standalone fact resolves a question without fabricating a delivered-question binding", t => {
  const root = project(t);
  const fact = reply(root, "office", "Office policy: each center gets 20 seats and unused seats cannot be transferred.", [], "answered", false);
  store.record(root, fact);
  const event = store.history(root, { event_id: fact.event_id }).events[0];
  assert.equal(event.payload.interpretation.components[0].question_ref, undefined);
  assert.equal(event.payload.interpretation.components[0].delivery_ref, undefined);
  assert.equal(question(root).status, "answered");
});

test("separated closeout sees the committed unresolved interpretation, while a later source can answer it", t => {
  const root = project(t);
  store.record(root, reply(root, "partial", "I know the allocation count but not the transfer rule.", [REMAINING]));
  const current = question(root);
  reject(root, { ...f.ids(root, "event-close"), type: "memory_updated", payload: { changes: { questions: [{ ...current,
    status: "answered", resolution: { ...current.resolution, remaining: [] } }] } } }, "MISSING_ANSWER_SUPPORT");
  f.record(root, "memory_updated", { changes: {
    evidence: [{ evidence_id: "file-policy", kind: "file", source_ref: "seat-policy.md", summary: "Unused seats must stay at the allocated center." }],
    questions: [{ ...current, status: "answered", reason: "The policy answers the missing transfer rule.",
      resolution: { answer_refs: [...current.resolution.answer_refs, "file-policy"], remaining: [] } }]
  } }, "event-policy");
  assert.equal(question(root).status, "answered");
});

test("question identity and support survive clarification and explicit corrections preserve historical versions", t => {
  const root = project(t);
  store.record(root, reply(root, "partial", "Each center has 20 seats.", [REMAINING]));
  const current = question(root);
  reject(root, { ...f.ids(root, "event-renamed"), type: "memory_updated", payload: { changes: {
    questions: [{ ...current, statement: "Are you ready for a report?" }]
  } } }, "QUESTION_IDENTITY_CHANGED");
  reject(root, { ...f.ids(root, "event-forget"), type: "memory_updated", payload: { changes: {
    questions: [{ ...current, resolution: { answer_refs: [], remaining: [REMAINING] } }]
  } } }, "MEMORY_SOURCE_CHANGED");
  f.record(root, "correction", { corrects_refs: [QUESTION], reason: "The earlier source was for a different region; retain its provenance in history.", changes: {
    evidence: [f.statement("user-region", "That 20-seat figure was for South, not North. North's allocation is unknown.")],
    questions: [{ ...current, reason: "Neither the North allocation nor transferability is established.",
      basis_refs: [...current.basis_refs, "user-region"], resolution: { answer_refs: ["user-region"], remaining: ["North seat allocation.", REMAINING] } }]
  } }, "event-correct-region");
  assert.deepEqual(question(root).resolution.answer_refs, ["user-region"]);
  assert.deepEqual(store.history(root, { event_id: "event-partial" }).events[0].payload.changes.questions[0].resolution.answer_refs, ["user-partial"]);
});

test("a changed causal target needs a sourced decision, while a cosmetic summary can retain its decision version", t => {
  const root = project(t);
  const changes = { project_understanding: { causal_target: "Effect on completion, not test scores." },
    evidence: [f.statement("user-completion", "My outcome is course completion.")] };
  reject(root, { ...f.ids(root, "event-target"), type: "memory_updated", payload: { changes } }, "UNRECONCILED_UNDERSTANDING");
  changes.decisions = [{ decision_id: "decision-completion", kind: "target", status: "current", statement: "Target course completion.", basis_refs: ["user-completion"] }];
  f.record(root, "memory_updated", { changes }, "event-target");
  const prior = store.readJournal(root).state.history_index["decision-completion"].event_ref;
  f.record(root, "reply_interpreted", { protocol: "durable-exchanges-v1", changes: { project_understanding: { causal_target: "Effect on course completion." } },
    interpretation: { interpretation_id: "interpretation-cosmetic", turn_id: "turn-cosmetic", incoming_refs: ["user-completion"], basis_refs: ["decision-completion"],
      components: [{ kind: "information", meaning: "Use the same completion target in clearer wording.", established: [], unresolved: [] }],
      next_action: { kind: "lead_only", scope: "Clarify wording.", reason: "No change in the selected outcome." } }
  }, "event-cosmetic");
  assert.equal(store.readJournal(root).state.history_index["decision-completion"].event_ref, prior);
  assert.equal(f.state(root).project_understanding.causal_target, "Effect on course completion.");
});

test("a later instruction to finish cannot clear a prior gap, with either reused or instruction-only new evidence", t => {
  const root = project(t);
  store.record(root, reply(root, "partial", "Each center has 20 seats, but transferability is unknown.", [REMAINING]));
  const finish = reply(root, "finish", "Nothing else is open; finish.", [], "answered", false);
  finish.payload.interpretation.components[0].kind = "instruction";
  finish.payload.changes.questions[0].resolution.answer_refs = question(root).resolution.answer_refs;
  reject(root, finish, "MISSING_ANSWER_SUPPORT");
  finish.payload.changes.questions[0].resolution.answer_refs = [...question(root).resolution.answer_refs, "user-finish"];
  reject(root, finish, "MISSING_ANSWER_INTERPRETATION");
  assert.equal(question(root).status, "open");
});

test("legacy question identity is preserved before the first structured answer", t => {
  const root = project(t);
  reject(root, { ...f.ids(root, "event-replace-question"), type: "memory_updated", payload: { changes: {
    questions: [{ ...question(root), statement: "Are you ready to write the report?" }]
  } } }, "QUESTION_IDENTITY_CHANGED");
});

test("a question correction can use its answer sources without duplicating them in basis_refs", t => {
  const root = project(t);
  f.record(root, "memory_updated", { changes: {
    evidence: [{ evidence_id: "file-first", kind: "file", source_ref: "first-policy.md", summary: "Initial partial policy." }],
    questions: [{ question_id: "question-policy", origin: "consultant", statement: "What allocation and transfer rules apply?", status: "open",
      resolution: { answer_refs: ["file-first"], remaining: ["Transfer rule."] } }]
  } }, "event-first-policy");
  f.record(root, "correction", { corrects_refs: ["question-policy"], reason: "The first policy was for a different program; use the correct policy.", changes: {
    evidence: [{ evidence_id: "file-correct", kind: "file", source_ref: "correct-policy.md", summary: "The allocation and transfer rules for this program." }],
    questions: [{ question_id: "question-policy", origin: "consultant", statement: "What allocation and transfer rules apply?", status: "answered",
      reason: "The correct policy answers both parts.", resolution: { answer_refs: ["file-correct"], remaining: [] } }]
  } }, "event-correct-policy");
  const resolved = f.state(root).questions.find(item => item.question_id === "question-policy");
  assert.equal(resolved.basis_refs, undefined);
  assert.deepEqual(resolved.resolution.answer_refs, ["file-correct"]);
});
