"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/store.cjs"), author = require("../scripts/lib/authoring.cjs");
const f = require("./fixtures/consultation-loop.cjs");
function project(t) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-author-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("cc-author-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  store.init(root, { project_id: "project-author", event_id: "event-init" }); return root;
}
const at = root => store.context(root, { mode: "brief" }).state_token;
function intake(root) {
  return { at: at(root), op: "reply_interpreted", changes: { evidence: [{ as: "user", kind: "user_statement", source_ref: "chat:1", source_excerpt: "Explain what is missing.", complete_message: true, summary: "The user requests an explanation." }] },
    interpretation: { as: "intake", incoming_refs: ["@user"], basis_refs: ["@user"], components: [{ kind: "instruction", meaning: "Explain the current evidence gap.", established: [], unresolved: ["The collection process is unknown."] }],
      next_action: { kind: "lead_only", scope: "Explain the evidence gap.", reason: "No new computation is needed." } } };
}
test("authoring constructs identities and exact selected references; prose is preserved", t => {
  const root = project(t), input = intake(root), original = structuredClone(input), receipt = author.submit(root, input);
  assert.deepEqual(input, original);
  assert.equal(receipt.authoring_refs.user, f.state(root).evidence[0].evidence_id);
  assert.equal(f.state(root).interpretations[0].incoming_refs[0], receipt.authoring_refs.user);
  const close = author.submit(root, { at: receipt.state_token, op: "exchange_prepared", exchange: { as: "reply", interpretation_ref: receipt.authoring_refs.intake, basis_refs: [receipt.authoring_refs.user], completed_work_refs: [],
    reconciliation: { changes: [], limitations: ["Collection unknown."], unresolved: ["Collection process"], next_direction: "Ask about collection." }, response: f.emptyResponse("@user is literal prose, not a reference.") } });
  assert.match(close.rendered_response, /@user is literal prose/);
  assert.equal(store.readJournal(root).events.at(-1).payload.exchange.turn_id, f.state(root).interpretations[0].turn_id);
  assert.equal(JSON.stringify(store.readJournal(root).events).includes('"as"'), false);
});

test("authoring resolves route evidence aliases while preserving external source locators", t => {
  const root = project(t);
  fs.writeFileSync(path.join(root, "@note"), "The sample was selected by region.\n");
  const request = { at: at(root), op: "memory_updated", changes: {
    evidence: [{ as: "note", kind: "file", source_ref: "@note", summary: "A selection record." },
      { as: "limit", kind: "user_statement", source_ref: "@host-message", source_excerpt: "Eligibility was not randomized.", summary: "Eligibility was not randomized." }],
    candidate_routes: [{ as: "adjustment", target: "Effect in the observed sample", approach: "Assess measured-confounder adjustment",
      status: "conditional", reason: "The collection record may explain selection.", evidence_for: ["@note"], evidence_against: ["@limit"] }]
  } };
  const original = structuredClone(request), receipt = author.submit(root, request), state = f.state(root);
  assert.deepEqual(request, original);
  assert.equal(state.evidence[0].source_ref, "@note");
  assert.equal(state.evidence[1].source_ref, "@host-message");
  assert.deepEqual(state.candidate_routes[0].evidence_for, [receipt.authoring_refs.note]);
  assert.deepEqual(state.candidate_routes[0].evidence_against, [receipt.authoring_refs.limit]);
  const unknown = structuredClone(request);
  unknown.changes.candidate_routes[0].evidence_for = ["@missing"];
  assert.throws(() => author.build(unknown), { code: "UNKNOWN_REFERENCE" });
});

test("authoring expands review and supersession references without interpreting source descriptions", t => {
  const root = project(t), request = { at: at(root), op: "review_completed", changes: {
    evidence: [{ as: "old", kind: "file", source_ref: "@old", summary: "Initial source." },
      { as: "new", kind: "file", source_ref: "@new", summary: "Revised source.", supersedes: "@old",
        legacy: { source_project: "@old", source_version: "@new", verification: "reviewed_summary" } },
      { as: "user", kind: "user_statement", source_ref: "chat:1", source_excerpt: "Please compare the source records.", summary: "A source comparison was requested." }],
    candidate_routes: [{ as: "route", target: "Observed sample", approach: "Document selection", status: "conditional", reason: "Selection is incompletely documented." }],
    assumptions: [{ as: "assumption", statement: "The revised source describes the study sample.", status: "active", basis_refs: ["@new"] }]
  }, checkpoint: { as: "checkpoint", status: "specialist_complete", primary_uncertainty: "Source consistency",
    why_it_matters: "Sampling records affect the interpretation.", strategy_ids_it_could_change: ["@route"] },
  review: { summary: "The revised source clarifies sample selection.", question_addressed: "What changed between the sources?",
    assignment: { specialist_id: "data_audit", operation: "review", strategy_ids: ["@route"] },
    selection_basis: { checkpoint_id: "@checkpoint", user_contribution_refs: ["@user"] },
    work_performed: ["Compared the two source descriptions."], findings: ["The revised description gives more detail on selection."],
    route_changes: ["@route"], assumptions_added_or_revised: ["@assumption"] } };
  const receipt = author.submit(root, request), refs = receipt.authoring_refs, payload = store.readJournal(root).events.at(-1).payload;
  assert.equal(payload.changes.evidence[1].supersedes, refs.old);
  assert.equal(payload.changes.evidence[1].source_ref, "@new");
  assert.deepEqual(payload.changes.evidence[1].legacy, request.changes.evidence[1].legacy);
  assert.deepEqual(payload.checkpoint.strategy_ids_it_could_change, [refs.route]);
  assert.deepEqual(payload.review.assignment.strategy_ids, [refs.route]);
  assert.equal(payload.review.selection_basis.checkpoint_id, refs.checkpoint);
  assert.deepEqual(payload.review.route_changes, [refs.route]);
  assert.deepEqual(payload.review.assumptions_added_or_revised, [refs.assumption]);
});
test("lost-receipt retries precede later state; a new stale operation is rejected", t => {
  const root = project(t), request = intake(root);
  author.submit(root, request, { hooks: { afterAppend() { throw new Error("lost response"); } } });
  const first = store.readJournal(root).events.at(-1);
  author.submit(root, { at: at(root), op: "memory_updated", changes: { project_understanding: { materials: ["Later context"] } } });
  const before = store.readJournal(root).events.length;
  const retry = author.submit(root, request);
  assert.equal(retry.replayed, true); assert.equal(retry.last_event_id, first.event_id);
  assert.equal(store.readJournal(root).events.length, before);
  assert.throws(() => author.submit(root, { ...request, interpretation: { ...request.interpretation, basis_refs: [] } }), { code: "STALE_WRITE" });
});

for (const exact of [true, false]) {
  test("7.4.0 alias expansion " + (exact ? "replays unchanged after later history" : "does not excuse a different committed fingerprint"), t => {
    const root = project(t), request = { at: at(root), op: "memory_updated", changes: {
      evidence: [{ as: "note", kind: "file", source_ref: "@note", summary: "The original external source." }]
    } };
    // Pinned expansion and fingerprint from the preserved 7.4.0 distribution.
    // Its mistaken source attribution must remain historical data on retry.
    store.record(root, { expected_project_id: "project-author", expected_last_event_id: "event-init",
      event_id: "event-3ebfc784a2d80ce28d726cb22d8dfbb69c4ef953", type: "memory_updated", payload: { changes: {
        evidence: [{ evidence_id: "evidence-d54bf3d2a67063eaf2c68130", kind: "file", source_ref: "evidence-d54bf3d2a67063eaf2c68130",
          summary: exact ? "The original external source." : "Different committed content." }]
      } } });
    const committed = store.readJournal(root).events.at(-1);
    if (exact) assert.equal(committed.request_sha256, "3aed569a7476f6a1ac84cf62e4e19bf38380830ecf19c595f5123063aa483bb2");
    author.submit(root, { at: at(root), op: "memory_updated", changes: { project_understanding: { materials: ["Later context"] } } });
    const before = fs.readFileSync(path.join(root, "journal.jsonl"));
    if (exact) {
      const retry = author.submit(root, request);
      assert.equal(retry.replayed, true); assert.equal(retry.last_event_id, committed.event_id);
      assert.equal(retry.authoring_refs.note, "evidence-d54bf3d2a67063eaf2c68130");
    } else assert.throws(() => author.submit(root, request), { code: "EVENT_CONFLICT" });
    assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
    assert.equal(f.state(root).evidence[0].source_ref, "evidence-d54bf3d2a67063eaf2c68130");
  });
}
test("partial question patches retain source attribution and unresolved remainder", t => {
  const root = project(t);
  const receipt = author.submit(root, { at: at(root), op: "memory_updated", changes: {
    evidence: [{ as: "source", kind: "user_statement", source_ref: "chat:1", source_excerpt: "Costs are unknown.", summary: "Costs remain unknown." }],
    questions: [{ as: "question", origin: "consultant", statement: "What are costs and capacity?", status: "open", basis_refs: ["@source"] }]
  } });
  author.submit(root, { at: receipt.state_token, op: "reply_interpreted", changes: {
    evidence: [{ as: "answer", kind: "user_statement", source_ref: "chat:2", source_excerpt: "Capacity is 100; costs remain unknown.", summary: "Capacity is 100; costs unknown." }],
    questions: [{ question_id: receipt.authoring_refs.question, patch: { reason: "Only capacity is known.", status: "open", resolution: { answer_refs: ["@answer"], remaining: ["Costs"] } } }]
  }, interpretation: { incoming_refs: ["@answer"], basis_refs: [receipt.authoring_refs.question],
    components: [{ kind: "information", meaning: "Capacity is known; costs remain unknown.", established: ["Capacity is 100."], unresolved: ["Costs"] }],
    next_action: { kind: "lead_only", scope: "Retain the partial answer.", reason: "Costs remain needed." } } });
  assert.deepEqual(f.state(root).questions[0].basis_refs, [receipt.authoring_refs.source]);
  assert.deepEqual(f.state(root).questions[0].resolution.remaining, ["Costs"]);
  assert.throws(() => author.submit(root, { at: at(root), op: "memory_updated", changes: { questions: [{ patch: { status: "answered" } }] } }), { code: "INVALID_INPUT" });
});
test("capture retries reuse committed bytes after the external source disappears", t => {
  const root = project(t), first = author.submit(root, intake(root));
  const exchange = author.submit(root, { at: first.state_token, op: "exchange_prepared", exchange: { as: "reply", interpretation_ref: first.authoring_refs.intake, basis_refs: [], completed_work_refs: [],
    reconciliation: { changes: [], limitations: [], unresolved: [], next_direction: "Pause." }, response: f.emptyResponse("The collection process is unknown.") } });
  const source = path.join(root, "actual.txt"); fs.writeFileSync(source, exchange.rendered_response);
  const request = { at: exchange.state_token, op: "observe-exchange", as: "delivery", exchange_ref: exchange.authoring_refs.reply, message_path: source, source_ref: "test-host:1", observation: "assistant_emission" };
  const captured = author.submit(root, request); fs.unlinkSync(source);
  author.submit(root, { at: captured.state_token, op: "memory_updated", changes: { project_understanding: { materials: ["Later context"] } } });
  assert.equal(author.submit(root, request).replayed, true);
});
