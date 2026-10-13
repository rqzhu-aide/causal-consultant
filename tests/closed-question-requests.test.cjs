"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/store.cjs");
const { canonical, sha256 } = require("../scripts/lib/files.cjs");
const f = require("./fixtures/consultation-loop.cjs");
const direction = { kind: "lead_only", scope: "Reconcile the allocation account.", reason: "Discuss the evidence before proposing work." };
const statement = "How were offers assigned, and where is that procedure recorded?";
const remainder = "Where the allocation procedure is recorded.";
function project(t, status) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-closed-question-"));
  t.after(() => { assert.equal(path.dirname(fs.realpathSync.native(root)), base); assert.ok(path.basename(root).startsWith("cc-closed-question-")); fs.rmSync(root, { recursive: true, force: true }); });
  store.init(root, { project_id: "closed-question", event_id: "event-init", project_understanding: { objective: "Assess the offer allocation study." } });
  const quote = status === "retired" ? "I cannot obtain the allocation log. Please stop asking for it."
    : status === "answered" ? "The log says a fair coin determined offers before enrollment." : "Offers were assigned by coin toss; I do not know where that was recorded.";
  const interpretation = f.interpret(root, "account", direction, {
    components: [{ kind: "information", meaning: quote, established: [quote], unresolved: status === "answered" ? [] : [remainder] }]
  }, quote);
  f.record(root, "memory_updated", { changes: { questions: [{ question_id: "question-allocation", origin: "consultant", statement,
    status, reason: status === "retired" ? "The user declined further retrieval." : "Retain the extent of the user's account.", basis_refs: ["user-account"],
    resolution: { answer_refs: ["user-account"], remaining: status === "answered" ? [] : [remainder] }
  }] } }, "event-account");
  return { root, interpretation };
}
function outgoing(root, interpretation, suffix, ref = "question-allocation", changes) {
  const response = f.emptyResponse("Retained the user's account and its limits.");
  delete response.questions_none;
  response.questions = [{ question_ref: ref, text: "Can you clarify the remaining allocation detail?", why: "It determines which causal interpretation is supportable.", needed: "Only the unresolved detail, if available." }];
  return { ...f.ids(root, "event-out-" + suffix), type: "exchange_prepared", payload: {
    protocol: "durable-exchanges-v1", ...(changes ? { changes } : {}), exchange: { exchange_id: "exchange-" + suffix, turn_id: interpretation.turn_id,
      interpretation_ref: interpretation.interpretation_id, basis_refs: [ref], completed_work_refs: [], renderer: "lead-markdown-v4",
      reconciliation: { changes: [], limitations: [], unresolved: [remainder], next_direction: "Await the remaining information or the user's chosen alternative." }, response }
  } };
}
function rejectsWithoutCommit(root, request) {
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(() => store.record(root, request), { code: "CLOSED_QUESTION_REQUEST" });
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
}

for (const status of ["answered", "retired"]) {
  test("outgoing requests cannot repeat an already " + status + " question", t => {
    const { root, interpretation } = project(t, status);
    rejectsWithoutCommit(root, outgoing(root, interpretation, "repeat"));
    assert.equal(f.state(root).questions[0].status, status);
  });

  test("same-event " + status + " update cannot accompany a renewed information request", t => {
    const { root } = project(t, "open");
    const quote = status === "answered" ? "I found the log in the coordinator's dated allocation notebook." : "I will not seek that record; stop asking me for it.";
    const interpretation = f.interpret(root, "final", direction, { components: [{ kind: "information", meaning: quote, established: [quote], unresolved: [] }] }, quote);
    const question = f.state(root).questions[0];
    const changes = { questions: [{ ...question, status, reason: quote,
      resolution: { answer_refs: [...question.resolution.answer_refs, "user-final"], remaining: status === "answered" ? [] : [remainder] } }] };
    rejectsWithoutCommit(root, outgoing(root, interpretation, "same-event", question.question_id, changes));
    assert.equal(f.state(root).questions[0].status, "open", "The rejected exchange must not partially close the question.");
  });
}

test("a justified same-event reopening preserves the original question and supported answer", t => {
  const { root } = project(t, "answered");
  const quote = "The coordinator says the coin toss broke ties only; otherwise offers followed application scores.";
  const interpretation = f.interpret(root, "reopen", direction, { components: [{ kind: "information", meaning: quote, established: [quote], unresolved: ["Whether all applicants entered the coin toss."] }] }, quote);
  const before = f.state(root).questions[0];
  const question = { ...before, status: "open", reason: "The new account conflicts with the earlier description of a coin toss for all offers.",
    basis_refs: [...before.basis_refs, "user-reopen"], resolution: { answer_refs: before.resolution.answer_refs, remaining: ["Whether all applicants entered the coin toss."] } };
  const receipt = store.record(root, outgoing(root, interpretation, "reopen", question.question_id, { questions: [question] }));
  assert.equal(receipt.committed, true);
  const retained = store.context(root).context.questions[0];
  assert.equal(retained.statement, statement);
  assert.deepEqual(retained.resolution.answer_refs, ["user-account"]);
  assert.deepEqual(retained.resolution.remaining, ["Whether all applicants entered the coin toss."]);
  assert.deepEqual(retained.basis_refs, ["user-account", "user-reopen"]);
});

test("an open partial question can request its remaining detail without losing prior support", t => {
  const { root, interpretation } = project(t, "open"), before = f.state(root).questions[0];
  store.record(root, outgoing(root, interpretation, "partial"));
  assert.deepEqual(f.state(root).questions[0], before);
  assert.deepEqual(before.resolution, { answer_refs: ["user-account"], remaining: [remainder] });
});

test("a distinct follow-up question leaves the answered question closed", t => {
  const { root, interpretation } = project(t, "answered");
  const question = { question_id: "question-attendance", origin: "consultant", statement: "Did everyone offered a place attend?", status: "open", basis_refs: ["user-account"] };
  store.record(root, outgoing(root, interpretation, "follow-up", question.question_id, { questions: [question] }));
  assert.equal(f.state(root).questions.find(item => item.question_id === "question-allocation").status, "answered");
  assert.equal(f.state(root).questions.find(item => item.question_id === question.question_id).status, "open");
});

test("historical closed-question exchanges remain readable and exactly retryable", t => {
  const { root, interpretation } = project(t, "retired");
  const request = outgoing(root, interpretation, "historical"), loaded = store.readJournal(root);
  // Construct a historical fixture in the old accepted format. Live record now
  // rejects this request; journal replay must not reinterpret committed history.
  const fingerprint = { ...request };
  delete fingerprint.expected_last_event_id;
  const event = { schema_version: 7, project_id: loaded.state.state_meta.project_id, event_id: request.event_id,
    sequence: loaded.events.length + 1, previous_event_id: loaded.state.state_meta.last_event_id,
    timestamp: "2026-09-20T00:00:00.000Z", type: request.type, payload: request.payload, request_sha256: sha256(canonical(fingerprint)) };
  event.sha256 = sha256(canonical(event));
  fs.appendFileSync(path.join(root, "journal.jsonl"), canonical(event) + "\n");
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  store.recover(root);
  assert.equal(store.context(root).context.questions[0].status, "retired");
  assert.equal(store.history(root, { event_id: request.event_id }).events[0].payload.exchange.response.questions[0].question_ref, "question-allocation");
  const retry = store.record(root, request);
  assert.equal(retry.replayed, true);
  assert.match(retry.rendered_response, /Can you clarify/);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
  const next = f.interpret(root, "new", direction, {}, "Please pause here.");
  rejectsWithoutCommit(root, outgoing(root, next, "new-repeat"));
});
