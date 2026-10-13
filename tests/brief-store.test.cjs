"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");
const store = require("../scripts/lib/store.cjs");
const f = require("./fixtures/consultation-loop.cjs");
const { selectContext } = require("../scripts/lib/context.cjs");
const { buildViews } = require("../scripts/lib/views.cjs");
const { buildCaseBrief } = require("../scripts/lib/case-brief.cjs");

function project(t) {
  const base = fs.realpathSync(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-brief-store-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync(root)), base);
    assert.ok(path.basename(root).startsWith("cc-brief-store-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  store.init(root, { project_id: "brief-store", event_id: "event-init" });
  return root;
}
const brief = root => store.context(root, { mode: "brief" });
const update = (root, suffix) => ({ ...f.ids(root, "event-" + suffix), type: "memory_updated",
  payload: { changes: { evidence: [f.statement("source-" + suffix, "A source account: " + suffix)], case_brief: { knowledge_refs: ["source-" + suffix] } } } });
const reject = (fn, code) => assert.throws(fn, error => error.code === code);
function close(root, suffix, hooks) {
  const it = f.interpret(root, suffix, { kind: "lead_only", scope: "Explain what is known.", reason: "No additional work was selected." });
  const request = { ...f.ids(root, "event-close-" + suffix), type: "exchange_prepared", payload: { protocol: "durable-exchanges-v1",
    exchange: { exchange_id: "exchange-" + suffix, turn_id: it.turn_id, interpretation_ref: it.interpretation_id,
      basis_refs: [], completed_work_refs: [], renderer: "lead-markdown-v4", reconciliation: { changes: [], limitations: [], unresolved: [], next_direction: "Wait for the user's direction." },
      response: f.emptyResponse("The question remains available for further discussion.") } } };
  return { request, result: store.record(root, request, { hooks }) };
}

test("brief is an additive context mode and never invokes the legacy selector or memory views", t => {
  const root = project(t);
  const loaded = store.readJournal(root), selected = selectContext(loaded, {}), result = store.context(root);
  for (const [key, value] of Object.entries(selected)) assert.deepEqual(result[key], value);
  assert.deepEqual(result.views, buildViews(loaded, selected));
  assert.equal(result.brief, undefined);
  const selector = require("../scripts/lib/context.cjs"), views = require("../scripts/lib/views.cjs");
  t.mock.method(selector, "selectContext", () => { throw Error("Legacy selector invoked."); });
  t.mock.method(views, "buildViews", () => { throw Error("Legacy memory views invoked."); });
  const current = brief(root);
  assert.equal(current.views, undefined);
  assert.equal(current.brief.format, "case-brief-v1");
  assert.equal(current.brief.markdown, fs.readFileSync(path.join(root, "case-brief.md"), "utf8"));
  assert.equal(current.brief.file_current, true);
  assert.ok(current.capabilities.includes("case-brief-v1"));
});

test("an attributed file-arrival update replaces stale current understanding while preserving its historical record", t => {
  const root = project(t);
  store.record(root, { ...f.ids(root, "event-await-file"), type: "memory_updated", payload: { changes: {
    project_understanding: { materials: ["The evaluation file has not arrived."] }
  } } });
  const original = fs.readFileSync(path.join(root, "journal.jsonl"), "utf8");
  const source = f.statement("source-file-arrived", "Here is the evaluation file.");
  store.record(root, { ...f.ids(root, "event-file-arrived"), type: "memory_updated", payload: { changes: {
    evidence: [source], project_understanding: { materials: ["The evaluation file has been received; it has not been inspected."] },
    case_brief: { knowledge_refs: [source.evidence_id] }
  } } });
  const current = brief(root).brief.markdown;
  assert.match(current, /evaluation file has been received; it has not been inspected/);
  assert.doesNotMatch(current, /evaluation file has not arrived/);
  assert.ok(fs.readFileSync(path.join(root, "journal.jsonl"), "utf8").startsWith(original));
});

test("brief distinguishes utility support from project activation without changing legacy history", t => {
  const root = project(t);
  assert.deepEqual(brief(root).consultation_policy, { policy: "consultation-loop-v1", event_ref: "event-init" });
  const legacyRoot = path.join(root, "historical-project");
  // Write an authentic inactive initialization shape, not a current init with
  // fabricated activation. Its history must remain readable and unchanged.
  store.transact(legacyRoot, { project_id: "legacy-brief", event_id: "event-legacy-init" },
    () => ({ type: "init", payload: { project_understanding: {} } }), { eventType: "init", initializing: true });
  const before = fs.readFileSync(path.join(legacyRoot, "journal.jsonl"));
  const inactive = brief(legacyRoot);
  assert.ok(inactive.capabilities.includes("consultation-loop-v1"));
  assert.equal(inactive.consultation_policy, null);
  assert.deepEqual(fs.readFileSync(path.join(legacyRoot, "journal.jsonl")), before);
  f.record(legacyRoot, "consultation_policy_activated", { policy: "consultation-loop-v1",
    reconciliation: "No unfinished historical work or authorization to carry forward." }, "event-activate");
  assert.deepEqual(brief(legacyRoot).consultation_policy, { policy: "consultation-loop-v1", event_ref: "event-activate" });
  assert.ok(fs.readFileSync(path.join(legacyRoot, "journal.jsonl")).subarray(0, before.length).equals(before));
});

test("brief request rejects mixed selectors, unknown modes, invalid options and stale expected history", t => {
  const root = project(t), before = fs.readFileSync(path.join(root, "journal.jsonl"));
  for (const request of [{ mode: "focus" }, { mode: null }, { mode: "brief", limit: 5 }, { mode: "brief", cursor: 0 },
    { mode: "brief", focus_refs: [] }, { mode: "brief", query: "date" }, { mode: "brief", unexpected: true }]) {
    reject(() => store.context(root, request), "INVALID_INPUT");
  }
  reject(() => store.context(root, { mode: "brief", expected_last_event_id: "old-event" }), "STALE_CONTEXT");
  assert.equal(store.context(root, { mode: "brief", expected_last_event_id: "event-init" }).sequence, 1);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
});

test("fresh brief bytes stay current across journal canonicalization of arbitrarily ordered records", t => {
  const root = project(t);
  const request = update(root, "ordering");
  request.payload.changes.evidence[0] = { summary: "A qualified supplied account.", source_ref: "conversation:ordering", kind: "user_statement",
    evidence_id: "source-ordering", limitations: ["Unverified account."], source_excerpt: "I think those records are complete.", complete_message: true };
  request.payload.changes.user_context = [{ context_id: "context-language", statement: "Prefer plain language.", kind: "preference", status: "current", basis_refs: ["source-ordering"] }];
  const result = store.record(root, request);
  assert.equal(result.brief_written, true);
  assert.equal(brief(root).brief.file_current, true);
  const before = fs.readFileSync(path.join(root, "case-brief.md"));
  store.recover(root);
  assert.deepEqual(fs.readFileSync(path.join(root, "case-brief.md")), before);
});

test("read-only brief detects altered content with a correct header, missing files and stale exports", t => {
  const root = project(t), file = path.join(root, "case-brief.md"), original = fs.readFileSync(file, "utf8");
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  fs.appendFileSync(file, "\nAn invented finding.\n");
  assert.equal(brief(root).brief.file_current, false);
  assert.equal(brief(root).brief.markdown, original);
  assert.match(fs.readFileSync(file, "utf8"), /invented finding/);
  fs.unlinkSync(file);
  assert.equal(brief(root).brief.file_current, false);
  assert.equal(fs.existsSync(file), false);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  assert.equal(store.recover(root).brief_written, true);
  const request = update(root, "new");
  store.record(root, request);
  fs.writeFileSync(file, original);
  assert.equal(brief(root).brief.file_current, false);
  assert.match(brief(root).brief.markdown, /source-new/);
});

test("an orphan brief cannot be overwritten by initializing after journal loss", t => {
  const root = project(t), before = fs.readFileSync(path.join(root, "case-brief.md"));
  fs.unlinkSync(path.join(root, "journal.jsonl"));
  fs.unlinkSync(path.join(root, "project.yaml"));
  reject(() => store.init(root, { project_id: "another-project", event_id: "event-reinitialize" }), "ORPHAN_PROJECTION");
  assert.equal(fs.existsSync(path.join(root, "journal.jsonl")), false);
  assert.deepEqual(fs.readFileSync(path.join(root, "case-brief.md")), before);
});

test("projection and brief exports fail independently after commitment and recover without another event", t => {
  const root = project(t);
  let result = store.record(root, update(root, "projection-failure"), { hooks: { beforeProjection() { throw Error("Projection export blocked."); } } });
  assert.equal(result.committed, true);
  assert.equal(result.projection_written, false);
  assert.equal(result.brief_written, true);
  assert.equal(brief(root).brief.file_current, true);
  result = store.record(root, update(root, "brief-failure"), { hooks: { beforeBrief() { throw Error("Brief export blocked."); } } });
  assert.equal(result.projection_written, true);
  assert.equal(result.brief_written, false);
  assert.match(result.brief_error, /Brief export blocked/);
  assert.equal(brief(root).brief.file_current, false);
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  result = store.recover(root, { hooks: { beforeProjection() { throw Error("Still blocked."); } } });
  assert.equal(result.projection_written, false);
  assert.equal(result.brief_written, true);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
});

test("prepared response export is attempted independently of both memory projections", t => {
  const root = project(t);
  const first = close(root, "memory-failure", { beforeProjection() { throw Error("Projection blocked."); }, beforeBrief() { throw Error("Brief blocked."); } }).result;
  assert.equal(first.committed, true);
  assert.equal(first.projection_written, false);
  assert.equal(first.brief_written, false);
  assert.equal(first.response_file_written, true);
  assert.equal(fs.readFileSync(path.join(root, first.response_path), "utf8"), first.rendered_response);
  const blockedPath = path.join(root, "exchanges", "exchange-response-failure");
  fs.mkdirSync(blockedPath);
  fs.writeFileSync(path.join(blockedPath, "response.md"), "Different previously retained bytes.");
  const second = close(root, "response-failure").result;
  assert.equal(second.projection_written, true);
  assert.equal(second.brief_written, true);
  assert.equal(second.response_file_written, false);
  assert.match(fs.readFileSync(path.join(blockedPath, "response.md"), "utf8"), /Different previously retained/);
});

test("retrying an old event returns its original receipt while refreshing memory to the latest event", t => {
  const root = project(t), first = close(root, "old");
  store.record(root, update(root, "newer"));
  const count = store.history(root).total, oldResponse = first.result.rendered_response;
  fs.writeFileSync(path.join(root, "case-brief.md"), "stale");
  const retry = store.record(root, first.request);
  assert.equal(retry.last_event_id, first.request.event_id);
  assert.equal(retry.current_last_event_id, "event-newer");
  assert.equal(retry.rendered_response, oldResponse);
  assert.equal(retry.brief_written, true);
  assert.equal(store.history(root).total, count);
  assert.equal(brief(root).last_event_id, "event-newer");
  assert.equal(brief(root).brief.file_current, true);
});

test("the five-intake boundary is based on saved input, not the current unsaved host turn", t => {
  const root = project(t);
  for (let index = 0; index < 6; index++) f.interpret(root, "message-" + index, { kind: "lead_only", scope: "Discuss the new information.", reason: "No work requested." });
  const before = brief(root).brief;
  assert.equal(before.recent_intakes.length, 5);
  assert.equal(before.coverage.conversation.total_saved_intakes, 6);
  assert.equal(before.recent_intakes[0].intake_id, "interpretation-message-1");
  assert.equal(before.recent_intakes.at(-1).intake_id, "interpretation-message-5");
  assert.ok(before.coverage.conversation.older_unfinished.some(item => item.intake_id === "interpretation-message-0"));
  // A fresh process receives the same saved window; host input is not fabricated.
  const command = spawnSync(process.execPath, [path.resolve(__dirname, "../scripts/project.cjs"), "context", "--project-root", root, "--input", "-"],
    { input: JSON.stringify({ mode: "brief" }), encoding: "utf8", windowsHide: true });
  assert.equal(command.status, 0, command.stdout);
  assert.deepEqual(JSON.parse(command.stdout).brief, before);
  f.interpret(root, "new-host", { kind: "lead_only", scope: "Clarify the new message.", reason: "Need a clear current direction." });
  assert.equal(brief(root).brief.recent_intakes[0].intake_id, "interpretation-message-2");
  assert.equal(brief(root).brief.recent_intakes.at(-1).intake_id, "interpretation-new-host");
});

test("recovery never overwrites retained actual replies and a bad capture remains an explicit gap", t => {
  const root = project(t), first = close(root, "capture");
  f.deliver(root, first.result.exchange_id, "capture");
  const saved = f.state(root).deliveries.at(-1), capturePath = path.join(root, saved.source_ref);
  fs.writeFileSync(capturePath, "Corrupted actual capture.");
  const result = brief(root).brief;
  assert.ok(result.coverage.conversation.capture_problems.length > 0);
  assert.ok(result.recent_intakes[0].unfinished.some(item => item.reasons.includes("actual_capture_unavailable")));
  assert.ok(result.unfinished.some(item => item.reasons.includes("actual_capture_unavailable")));
  store.recover(root);
  assert.equal(fs.readFileSync(capturePath, "utf8"), "Corrupted actual capture.");
  assert.equal(brief(root).brief.markdown, buildCaseBrief(store.readJournal(root)).markdown);
});
