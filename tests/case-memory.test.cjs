"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const store = require("../scripts/lib/store.cjs");
const f = require("./fixtures/consultation-loop.cjs");
const { PROTOCOL } = require("../scripts/lib/exchanges.cjs");

function project(t) {
  const base = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(base, "cc-case-memory-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync(root)), base);
    fs.rmSync(root, { recursive: true, force: true });
  });
  store.init(root, { project_id: "case-memory", event_id: "event-init" });
  return root;
}
const message = (id, text = "Please inspect the design.", complete = true) => ({ ...f.statement(id, text), complete_message: complete });
function write(root, changes, suffix, correction) {
  return f.record(root, correction ? "correction" : "memory_updated", { changes,
    ...(correction ? { corrects_refs: correction, reason: "Repair the original captured source from the actual message." } : {}) }, "event-" + suffix);
}
function intake(root, suffix, refs, evidence = []) {
  const interpretation = { interpretation_id: "interpretation-" + suffix, turn_id: "turn-" + suffix, incoming_refs: refs,
    components: [{ kind: "information", meaning: "A source account arrived.", established: ["The user provided an account."], unresolved: [] }],
    basis_refs: [], next_action: { kind: "lead_only", scope: "Discuss the account.", reason: "Clarify its consequences before work." } };
  f.record(root, "reply_interpreted", { protocol: PROTOCOL, changes: { evidence }, interpretation }, "event-in-" + suffix);
  return interpretation;
}
const reject = (fn, code) => assert.throws(fn, error => error.code === code);

test("case brief selections are absent until supplied and independently replace only their own list", t => {
  const root = project(t);
  assert.equal(Object.hasOwn(f.state(root), "case_brief"), false);
  write(root, { evidence: [message("source-a"), message("source-b")], case_brief: { knowledge_refs: ["source-b", "source-a"] } }, "knowledge");
  assert.deepEqual(f.state(root).case_brief, { knowledge_refs: ["source-b", "source-a"] });
  write(root, { case_brief: { work_refs: [] } }, "work");
  write(root, { case_brief: { knowledge_refs: [] } }, "clear");
  assert.deepEqual(f.state(root).case_brief, { knowledge_refs: [], work_refs: [] });
  assert.equal(f.state(root).evidence.length, 2);
  assert.equal(f.state(root).history_index.case_brief, undefined);
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  store.recover(root);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
});

test("case brief rejects malformed, unknown, duplicate and wrong-kind selections without appending", t => {
  const root = project(t);
  write(root, { evidence: [message("source-a")] }, "source");
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  for (const value of [null, {}, [], { prose: "summary" }, { knowledge_refs: null }, { knowledge_refs: ["source-a", "source-a"] }, { work_refs: "source-a" }]) {
    reject(() => write(root, { case_brief: value }, "bad"), "INVALID_INPUT");
  }
  for (const value of [{ knowledge_refs: ["event-init"] }, { work_refs: ["source-a"] }, { knowledge_refs: ["unknown"] }]) {
    reject(() => write(root, { case_brief: value }, "bad"), "UNKNOWN_REFERENCE");
  }
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
});

test("a Lead bundled review can be selected immediately and its scientific limits survive a cold read", t => {
  const root = project(t);
  const assignment = { specialist_id: "data_audit", operation: "review" };
  const it = f.interpret(root, "audit", { kind: "specialist", assignment, scope: "Inspect recruitment records.", reason: "Determine the feasible claim." });
  f.record(root, "checkpoint", { checkpoint: { checkpoint_id: "checkpoint-audit", status: "assessing", primary_uncertainty: "How were participants selected?", why_it_matters: "Limits causal interpretation." } }, "event-checkpoint");
  const review = { review_id: "review-audit", summary: "Selection is unresolved.", assignment, question_addressed: "What do recruitment records establish?",
    selection_basis: { checkpoint_id: "checkpoint-audit", user_contribution_refs: it.incoming_refs }, interpretation_ref: it.interpretation_id,
    work_performed: ["Read the available recruitment notes."], findings: ["Notes omit the assignment mechanism."], limitations: ["Do not treat recruitment as randomized assignment."],
    remaining_uncertainty: ["The assignment log may exist elsewhere."], evidence_refs: it.incoming_refs };
  const response = { ...f.emptyResponse("The source review is complete."), findings: { work_refs: [review.review_id], summary: review.summary,
    diagnostics: ["Checked source scope."], limitations: review.limitations } };
  const result = f.record(root, "exchange_prepared", { protocol: PROTOCOL, review,
    changes: { case_brief: { knowledge_refs: it.incoming_refs, work_refs: [review.review_id] } },
    exchange: { exchange_id: "exchange-audit", turn_id: it.turn_id, interpretation_ref: it.interpretation_id, basis_refs: it.incoming_refs,
      completed_work_refs: [review.review_id], renderer: "lead-markdown-v4", reconciliation: { changes: [], limitations: review.limitations, unresolved: review.remaining_uncertainty,
        next_direction: "The user can recover the log or retain a descriptive scope." }, response } }, "event-close");
  assert.equal(result.brief_written, true);
  assert.equal(f.state(root).specialist_reviews[0].limitations, undefined);
  const brief = store.context(root, { mode: "brief" }).brief;
  assert.match(brief.markdown, /Do not treat recruitment as randomized assignment/);
  assert.match(brief.markdown, /The assignment log may exist elsewhere/);
  assert.ok(brief.unfinished.some(item => item.reasons.includes("actual_response_unestablished")));
});

test("message coverage uses boolean presence, permits empty captured text, and rejects other evidence kinds", t => {
  const root = project(t);
  write(root, { evidence: [message("full", "Full message."), message("partial", "A retained part.", false), { ...message("attachment-only", ""), summary: "An attachment arrived with no message text." }] }, "messages");
  for (const evidence of [{ ...message("bad"), complete_message: null }, { ...message("bad"), complete_message: "true" },
    { ...message("bad"), kind: "file" }, { ...message("bad"), source_excerpt: undefined }]) {
    reject(() => write(root, { evidence: [evidence] }, "bad"), "INVALID_INPUT");
  }
  assert.equal(f.state(root).evidence.find(item => item.evidence_id === "partial").complete_message, false);
});

test("marked capture updates retain coverage only when original source identity and text are unchanged", t => {
  const root = project(t);
  write(root, { evidence: [message("source")] }, "source");
  write(root, { evidence: [{ evidence_id: "source", kind: "user_statement", source_ref: "conversation:source", summary: "User requests design inspection." }] }, "summary");
  assert.equal(f.state(root).evidence[0].complete_message, true);
  for (const change of [{ source_excerpt: "Corrected actual text." }, { source_ref: "actual-chat:message-1" }, { source_sha256: "a".repeat(64) }]) {
    const source = { ...f.state(root).evidence[0], ...change };
    delete source.complete_message;
    reject(() => write(root, { evidence: [source] }, "invalid", ["source"]), "MESSAGE_COVERAGE_REQUIRED");
  }
  const corrected = { ...f.state(root).evidence[0], source_excerpt: "The initial export clipped this message.", complete_message: false };
  reject(() => write(root, { evidence: [corrected] }, "uncited"), "MEMORY_SOURCE_CHANGED");
  write(root, { evidence: [corrected] }, "correction", ["source"]);
  assert.equal(f.state(root).evidence[0].complete_message, false);
});

test("marked batches have stable ordered identities, while auxiliary facts and exact reinterpreting stay legal", t => {
  const root = project(t);
  intake(root, "first", ["message-a", "message-b"], [message("message-a"), message("message-b", "One more detail.", false)]);
  intake(root, "again", ["message-a", "message-b", "fact"], [f.statement("fact", "A separate extracted fact.")]);
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  for (const refs of [["message-a"], ["message-b", "message-a"], ["message-a", "new-message"]]) {
    reject(() => intake(root, "bad", refs, [message("new-message")]), "INCOMING_GROUP_CONFLICT");
  }
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  intake(root, "new", ["new-message"], [message("new-message", "Please inspect the design.")]);
  const recent = store.context(root, { mode: "brief" }).brief.recent_intakes;
  assert.equal(recent.length, 2);
  assert.equal(recent[0].interpretations.length, 2);
  assert.equal(recent[0].incoming.find(item => item.evidence_ref === "message-b").completeness, "incomplete");
});

test("a source repair is shown beside its original intake and never consumes a new conversation slot", t => {
  const root = project(t);
  intake(root, "first", ["source"], [message("source", "I do not know", false)]);
  write(root, { evidence: [message("source", "I do not know the assignment dates, but I can retrieve the log.")] }, "repair", ["source"]);
  intake(root, "reinterpret", ["source"]);
  const conversation = store.context(root, { mode: "brief" }).brief;
  assert.equal(conversation.recent_intakes.length, 1);
  assert.equal(conversation.recent_intakes[0].incoming[0].record.source_excerpt, "I do not know");
  assert.match(JSON.stringify(conversation.recent_intakes[0].incoming[0]), /retrieve the log/);
});

test("old review-backed partial answers stay visible while their question remains open", t => {
  const root = project(t), assignment = { specialist_id: "data_audit", operation: "review" };
  write(root, { questions: [{ question_id: "question-seats", origin: "consultant", status: "open",
    statement: "How many seats are available and may unused seats be pooled?" }],
    evidence: [{ evidence_id: "register", kind: "file", source_ref: "register.csv", summary: "Capacity register for Center A.",
      limitations: ["This register does not cover Center B."] }], case_brief: { knowledge_refs: [], work_refs: [] } }, "seed");
  const source = message("source-audit", "Inspect capacity in the available register.");
  const it = { interpretation_id: "interpretation-audit", turn_id: "turn-audit", incoming_refs: [source.evidence_id],
    components: [{ kind: "instruction", meaning: source.source_excerpt, established: [], unresolved: [] }], basis_refs: [],
    next_action: { kind: "specialist", assignment, scope: "Inspect register capacity.", reason: "Resolve the capacity part." } };
  f.record(root, "reply_interpreted", { protocol: PROTOCOL, interpretation: it, changes: { evidence: [source] },
    checkpoint: { checkpoint_id: "checkpoint-audit", status: "assessing", primary_uncertainty: "Capacity", why_it_matters: "Bound available places." } }, "event-in-audit");
  const review = { review_id: "review-seats", assignment, interpretation_ref: it.interpretation_id,
    summary: "Seventeen seats are available at Center A.", question_addressed: "How many seats are available?",
    selection_basis: { checkpoint_id: "checkpoint-audit", user_contribution_refs: it.incoming_refs },
    work_performed: ["Inspected the capacity register."], findings: ["Seventeen seats are available at Center A."],
    limitations: ["Center B was not inspected; pooling is not documented."], evidence_refs: ["register"] };
  f.record(root, "exchange_prepared", { protocol: PROTOCOL, review,
    changes: { questions: [{ ...f.state(root).questions[0], resolution: { answer_refs: [review.review_id], remaining: ["May unused seats be pooled?"] } }], consultation: null },
    exchange: { exchange_id: "exchange-audit", interpretation_ref: it.interpretation_id, turn_id: it.turn_id,
      basis_refs: [], completed_work_refs: [review.review_id], renderer: "lead-markdown-v4",
      reconciliation: { changes: ["Capacity is partly resolved."], limitations: review.limitations, unresolved: ["Pooling remains unknown."], next_direction: "Keep the pooling question open." },
      response: f.emptyResponse(review.summary) } }, "event-close-audit");
  f.deliver(root, "exchange-audit", "audit");
  for (let i = 0; i < 5; i++) {
    const suffix = "later-" + i, later = intake(root, suffix, ["source-" + suffix], [message("source-" + suffix, "Please explain the general idea.")]);
    const receipt = f.exchange(root, later, suffix, f.emptyResponse("The explanation is complete."));
    f.deliver(root, receipt.exchange_id, suffix);
  }
  const resolution = structuredClone(f.state(root).questions[0].resolution);
  const assertCurrentSupport = () => {
    const journal = fs.readFileSync(path.join(root, "journal.jsonl")), current = store.context(root, { mode: "brief" }).brief;
    assert.equal(current.recent_intakes.length, 5);
    assert.ok(!current.recent_intakes.some(item => item.intake_id === it.interpretation_id));
    assert.match(current.markdown, /May unused seats be pooled/);
    assert.match(current.markdown, /Seventeen seats/);
    assert.match(current.markdown, /Center B was not inspected; pooling is not documented/);
    assert.ok(!current.coverage.case.warnings.some(item => item.code === "answer_review_not_displayed"));
    assert.match(current.markdown, /specialist reviews \(review-seats\)/);
    assert.match(current.markdown, /For any card ID, use history record_id=<ID>/);
    assert.ok(current.coverage.case.work.included_refs.includes(review.review_id));
    const saved = store.history(root, { record_id: review.review_id }).events.find(event => event.payload.review?.review_id === review.review_id).payload.review;
    assert.deepEqual(saved.findings, review.findings);
    assert.deepEqual(saved.limitations, review.limitations);
    assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
  };
  assertCurrentSupport();
  write(root, { case_brief: { work_refs: [review.review_id] } }, "select-review");
  const selected = store.context(root, { mode: "brief" }).brief;
  assert.match(selected.markdown, /Seventeen seats|Center B was not inspected/);
  assert.ok(!selected.coverage.case.warnings.some(item => item.code === "answer_review_not_displayed"));
  write(root, { case_brief: { work_refs: [] } }, "deselect-review");
  assertCurrentSupport();
  assert.deepEqual(f.state(root).questions[0].resolution, resolution);
  assert.deepEqual(f.state(root).case_brief, { knowledge_refs: [], work_refs: [] });
  write(root, { questions: [{ ...f.state(root).questions[0], status: "retired", reason: "The user stopped pursuing the pooling question." }] }, "retire-question");
  const retired = store.context(root, { mode: "brief" }).brief;
  assert.ok(!retired.coverage.case.work.included_refs.includes(review.review_id));
  assert.doesNotMatch(retired.markdown, /Seventeen seats|Center B was not inspected/);
  assert.deepEqual(f.state(root).questions[0].resolution, resolution);
});
