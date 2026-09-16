"use strict";
const { preparePlan } = require("./fixtures/consultation-loop.cjs");

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const store = require("../scripts/lib/store.cjs");
const runs = require("../scripts/lib/runs.cjs");
const { canonical, sha256 } = require("../scripts/lib/files.cjs");
const { PROTOCOL, renderExchange } = require("../scripts/lib/exchanges.cjs");
const { createFixture, interpretation, exchange, review } = require("./fixtures/multiturn.cjs");

function project(t, fixture = createFixture()) {
  const base = fs.realpathSync.native(os.tmpdir());
  const root = fs.mkdtempSync(path.join(base, "causal-multiturn-integration-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("causal-multiturn-integration-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  fs.writeFileSync(path.join(root, "journal.jsonl"), fixture.events.map(canonical).join("\n") + "\n");
  store.recover(root);
  return root;
}
function ids(root, event_id) {
  const state = store.readJournal(root).state;
  return { event_id, expected_project_id: state.state_meta.project_id, expected_last_event_id: state.state_meta.last_event_id };
}
function record(root, event, type, payload, options) {
  return store.record(root, { ...ids(root, event), type, payload }, options);
}
function journal(root) { return fs.readFileSync(path.join(root, "journal.jsonl")); }
function rejectUnchanged(root, code, fn) {
  const before = journal(root);
  assert.throws(fn, { code });
  assert.deepEqual(journal(root), before);
}
function auditPlan(interpretation_ref) {
  return { kind: "audit", objective: "Inspect the source inventory", claim_boundary: "No target effects computed",
    inputs: [], question: "What allocation records are present?", diagnostics: [],
    ...(interpretation_ref ? { interpretation_ref } : {}) };
}
function write(root, run_id, file, content) {
  const { event_id, ...identity } = ids(root, "unused");
  return runs.write(root, { ...identity, run_id, path: file, content });
}
function finalize(root, run_id, output) {
  return runs.finalize(root, { ...ids(root, "event-finalize-" + run_id), run_id,
    code_paths: [], output_paths: [output], diagnostic_paths: [], environment: { authoring: "structural regression fixture" }, deviations: [] });
}

test("capability preflight works without a project and rejects unsupported protocols without mutation", t => {
  const cli = path.resolve(__dirname, "../scripts/project.cjs");
  const result = spawnSync(process.execPath, [cli, "capabilities"], { encoding: "utf8", windowsHide: true });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(JSON.parse(result.stdout).capabilities.includes(PROTOCOL));
  const root = project(t);
  rejectUnchanged(root, "UNSUPPORTED_PROTOCOL", () => record(root, "event-future", "reply_interpreted",
    { protocol: "durable-exchanges-v2", interpretation: interpretation("first") }));
});

test("prepared receipt survives projection failure and retry after a newer exchange", t => {
  const root = project(t);
  const first = { ...ids(root, "event-prepare-first"), type: "exchange_prepared",
    payload: { protocol: PROTOCOL, interpretation: interpretation("first"), exchange: exchange("first") } };
  const receipt = store.record(root, first, { hooks: { beforeProjection() { throw new Error("interrupted projection delivery"); } } });
  assert.equal(receipt.committed, true);
  assert.equal(receipt.projection_written, false);
  assert.equal(receipt.rendered_response, renderExchange(first.payload.exchange));
  const afterFirst = journal(root);
  const second = exchange("second"); second.response.status = "A later response has different text.";
  record(root, "event-prepare-second", "exchange_prepared", { protocol: PROTOCOL, interpretation: interpretation("second"), exchange: second });
  const beforeRetry = journal(root);
  const replay = store.record(root, first);
  assert.equal(replay.replayed, true);
  assert.equal(replay.rendered_response, receipt.rendered_response);
  assert.equal(replay.response_sha256, receipt.response_sha256);
  assert.equal(replay.current_last_event_id, "event-prepare-second");
  assert.equal(replay.last_event_id, "event-prepare-first");
  assert.deepEqual(journal(root), beforeRetry);
  assert.deepEqual(beforeRetry.subarray(0, afterFirst.length), afterFirst);
  assert.equal(store.status(root).projection_current, true);
});

test("failed pre-append closeout cannot masquerade as saved or create an exchange", t => {
  const root = project(t);
  const before = journal(root);
  assert.throws(() => record(root, "event-prepare", "exchange_prepared", { protocol: PROTOCOL,
    interpretation: interpretation("first"), exchange: exchange("first") },
  { hooks: { beforeAppend() { throw new Error("injected before append"); } } }), /injected before append/);
  assert.deepEqual(journal(root), before);
  assert.equal(store.status(root).project.exchanges, undefined);
});

test("a saved audit run leaves lead closeout unfinished until its work is reconciled", t => {
  const fixture = createFixture(); fixture.interpret("worker", true);
  const root = project(t, fixture);
  runs.start(root, { ...ids(root, "event-start"), run_id: "run-audit", plan: auditPlan("interpretation-worker") });
  write(root, "run-audit", "audit.txt", "The fixture contains no allocation log. No effect was computed.\n");
  finalize(root, "run-audit", "audit.txt");
  const status = store.status(root);
  assert.equal(status.project.runs[0].status, "completed");
  assert.equal(status.project.runs[0].interpretation_ref, "interpretation-worker");
  assert.ok(status.views.work.unfinished_turns.some(turn => turn.turn_id === "turn-worker" && turn.reasons.includes("closeout_not_prepared")));
  const closeout = exchange("worker"); closeout.completed_work_refs = ["run-audit", "review-worker"];
  record(root, "event-closeout", "exchange_prepared", { protocol: PROTOCOL, review: review("worker"), exchange: closeout });
  const after = store.status(root);
  assert.equal(after.project.specialist_reviews.length, 1);
  assert.equal(after.project.turns[0].exchange_ref, "exchange-worker");
  assert.ok(after.views.work.unfinished_turns[0].reasons.includes("delivery_unobserved"));
  assert.equal(runs.verify(root).ok, true, "artifact verification is distinct from uncertain response delivery");
  rejectUnchanged(root, "TURN_CLOSED", () => runs.start(root,
    { ...ids(root, "event-stale-start"), run_id: "run-stale", plan: auditPlan("interpretation-worker") }));
  assert.equal(fs.existsSync(path.join(root, "runs/run-stale")), false);
});

test("missing or incompatible prospective run assignment rejects before any run files", t => {
  const fixture = createFixture(); fixture.interpret("worker", true);
  const root = project(t, fixture);
  rejectUnchanged(root, "MISSING_INTERPRETATION", () => runs.start(root,
    { ...ids(root, "event-missing"), run_id: "run-missing", plan: auditPlan() }));
  rejectUnchanged(root, "ASSIGNMENT_MISMATCH", () => runs.start(root,
    { ...ids(root, "event-wrong-role"), run_id: "run-wrong-role", plan: {
      kind: "report", objective: "A report", purpose: "Report", claim_boundary: "Fixture only", inputs: [],
      format: "Markdown", evidence_refs: ["user-request"], interpretation_ref: "interpretation-worker" } }));
  rejectUnchanged(root, "ASSIGNMENT_MISMATCH", () => runs.start(root,
    { ...ids(root, "event-wrong-operation"), run_id: "run-wrong-operation", plan: {
      ...auditPlan("interpretation-worker"), transformations: ["Aggregate rows"], diagnostics: ["Count rows"] } }));
  assert.equal(fs.existsSync(path.join(root, "runs")), false);
});

test("a pre-protocol unfinished run can finish after protocol adoption without rewriting its plan", t => {
  const root = project(t);
  runs.start(root, { ...ids(root, "event-old-start"), run_id: "run-old", plan: auditPlan() });
  const oldPlan = fs.readFileSync(path.join(root, "runs/run-old/plan.yaml"));
  record(root, "event-new-turn", "exchange_prepared", { protocol: PROTOCOL,
    interpretation: interpretation("first"), exchange: exchange("first") });
  write(root, "run-old", "audit.txt", "The earlier audit completed with a documented limitation.\n");
  finalize(root, "run-old", "audit.txt");
  assert.deepEqual(fs.readFileSync(path.join(root, "runs/run-old/plan.yaml")), oldPlan);
  assert.equal(store.status(root).project.runs[0].interpretation_ref, undefined);
  assert.equal(runs.verify(root).ok, true);
});

test("report bindings retain result and assumption versions through later corrections", t => {
  const root = project(t);
  const source = "A supplied result reports an interval conditional on a common additive effect.\n";
  fs.writeFileSync(path.join(root, "provided-result.txt"), source);
  const condition = { condition_id: "condition-interval", evidence_ref: "evidence-result", result_locator: "interval",
    claim: "The supplied interval is conditional on a common additive effect", target: "Common additive effect",
    assumption_refs: ["assumption-constant"], basis_refs: ["evidence-result"], limitations: ["The study documents do not establish constant effects."],
    inference: { kind: "interval", target: "Common additive effect", guarantee: "Exact only under the specified constant-effect model." } };
  record(root, "event-conditions", "memory_updated", { changes: {
    evidence: [{ evidence_id: "evidence-result", kind: "file", source_ref: "provided-result.txt", source_sha256: sha256(source), summary: source.trim() }],
    assumptions: [{ assumption_id: "assumption-constant", statement: "All units share one additive effect.", status: "active", basis_refs: ["evidence-result"] }],
    result_conditions: [condition]
  } });
  const prepared = preparePlan(root, {
    kind: "report", objective: "Explain the supplied interval", claim_boundary: "Conditional inference only", purpose: "Methods summary",
    inputs: [{ source_ref: "provided-result.txt", path: "provided-result.txt" }], evidence_refs: ["evidence-result"], format: "Markdown" });
  runs.start(root, { ...ids(root, "event-report-start"), run_id: "run-report", plan: prepared });
  const frozenBytes = fs.readFileSync(path.join(root, "runs/run-report/plan.yaml"));
  const binding = JSON.parse(frozenBytes).evidence_bindings[0];
  assert.equal(binding.condition_coverage, "linked");
  assert.equal(binding.condition_bindings[0].event_ref, "event-conditions");
  assert.equal(binding.condition_bindings[0].assumption_bindings[0].event_ref, "event-conditions");
  record(root, "event-correction", "memory_updated", { changes: {
    assumptions: [{ assumption_id: "assumption-constant", statement: "Constant effects are withdrawn for the current question.", status: "retired", basis_refs: ["evidence-result"] }],
    result_conditions: [{ ...condition, claim: "The old interval is not an unconditional interval for the average effect." }]
  } });
  assert.deepEqual(fs.readFileSync(path.join(root, "runs/run-report/plan.yaml")), frozenBytes);
  assert.equal(binding.condition_bindings[0].assumption_bindings[0].status, "active");
  assert.equal(store.status(root).project.assumptions[0].status, "retired");
  rejectUnchanged(root, "STALE_SCOPE", () => write(root, "run-report", "report.md", "An obsolete conditional interpretation.\n"));
  assert.equal(fs.existsSync(path.join(root, "runs/run-report/report.md")), false);
});

test("unlinked old report evidence is explicitly unreviewed for result conditions", t => {
  const root = project(t);
  const prepared = preparePlan(root, {
    kind: "report", objective: "Summarize the request", claim_boundary: "User account only", purpose: "Intake note", inputs: [],
    evidence_refs: ["user-request"], format: "Markdown" });
  runs.start(root, { ...ids(root, "event-report"), run_id: "run-report", plan: prepared });
  const binding = JSON.parse(fs.readFileSync(path.join(root, "runs/run-report/plan.yaml"))).evidence_bindings[0];
  assert.equal(binding.condition_coverage, "unreviewed");
  assert.deepEqual(binding.condition_bindings, []);
});

test("the documented lead-only JSON submission is accepted by the actual helper", t => {
  const source = fs.readFileSync(path.resolve(__dirname, "../references/memory-records.md"), "utf8");
  const block = source.match(/### Lead-Only First Round Example[\s\S]*?```json\s*([\s\S]*?)```/);
  assert.ok(block, "The authoring example must be discoverable.");
  const request = JSON.parse(block[1]);
  const root = project(t, { events: createFixture().events.slice(0, 1) });
  request.expected_project_id = store.readJournal(root).state.state_meta.project_id;
  request.expected_last_event_id = store.readJournal(root).state.state_meta.last_event_id;
  // A first-round authoring example starts before any other user source is saved.
  const result = store.record(root, request);
  assert.equal(result.committed, true);
  assert.equal(result.rendered_response, renderExchange(request.payload.exchange));
  assert.equal(result.response_sha256, sha256(result.rendered_response));
});
