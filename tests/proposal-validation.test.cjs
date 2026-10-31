"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const store = require("../scripts/lib/store.cjs");
const runs = require("../scripts/lib/runs.cjs");
const { validatePlanStructure } = require("../scripts/lib/plan-validation.cjs");
const { canonical } = require("../scripts/lib/files.cjs");
const { createFixture, exchange: legacyExchange } = require("./fixtures/multiturn.cjs");
const { PROTOCOL } = require("../scripts/lib/exchanges.cjs");
const f = require("./fixtures/consultation-loop.cjs");

const analysis = () => ({ kind: "analysis", objective: "Estimate the agreed effect", claim_boundary: "Study participants only",
  inputs: [], target: "ATE", population: "Study participants", treatment: "Randomized offer", comparator: "No offer",
  outcome: "Score", timing: "One year", estimand: "Mean difference", design_id: "randomized_assignment",
  estimator: "Difference of means", exclusions: [], diagnostics: ["Check arm balance"] });
const report = () => ({ kind: "report", objective: "Summarize discussed findings", claim_boundary: "Study participants only",
  inputs: [], purpose: "The discussed study findings", evidence_refs: ["user-request"], format: "Markdown" });

function project(t, kind) {
  const parent = fs.realpathSync.native(os.tmpdir());
  const root = fs.mkdtempSync(path.join(parent, "cc-proposal-validation-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), parent);
    assert.ok(path.basename(root).startsWith("cc-proposal-validation-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const fixture = createFixture();
  fixture.append("consultation_policy_activated", { policy: "consultation-loop-v1", reconciliation: "Retain historical meaning." });
  if (kind === "report") {
    fixture.append("run_started", { run: { run_id: "audit-one", kind: "audit", status: "in_progress" } });
    fixture.append("run_finalized", { run: { run_id: "audit-one", kind: "audit", status: "completed" } });
  }
  function saveHistory() {
    fs.writeFileSync(path.join(root, "journal.jsonl"), fixture.events.map(event => canonical(event) + "\n").join(""));
    fs.writeFileSync(path.join(root, "project.yaml"), JSON.stringify(fixture.state, null, 2) + "\n");
  }
  saveHistory();
  return { root, fixture, saveHistory };
}
function scopeFor(plan, state) {
  const assignment = plan.kind === "analysis" ? { specialist_id: "design_worker", operation: "execution", design_id: plan.design_id }
    : { specialist_id: "report_writer", operation: "reporting" };
  const basis = plan.kind === "analysis" ? ["user-request"] : ["user-request", "audit-one"];
  return { scope_id: "scope-original", action: plan.kind, assignment, public_scope: {
    target: plan.target || plan.purpose, population: plan.population || "Study participants", evidence: "Discussed study evidence",
    approach: plan.estimator || "Summarize existing findings", checks: plan.diagnostics || [], outputs: "Results and limitations", claim_boundary: plan.claim_boundary
  }, execution_plan: plan, basis_versions: basis.map(ref => ({ ref, event_ref: state.history_index[ref].event_ref })),
  findings_refs: plan.kind === "report" ? ["audit-one"] : [] };
}
function rejectedWithoutWrite(root, action, field) {
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(action, error => error.code === "INVALID_INPUT" && error.message.includes(field));
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  assert.equal(fs.existsSync(path.join(root, "runs")), false);
}

for (const kind of ["analysis", "report"]) {
  test(kind + " proposal rejects its missing objective before any new record or offer", t => {
    const { root } = project(t, kind);
    const plan = kind === "analysis" ? analysis() : report();
    delete plan.objective;
    const scope = scopeFor(plan, f.state(root));
    const before = structuredClone(scope);
    rejectedWithoutWrite(root, () => f.record(root, "memory_updated", { changes: { action_scopes: [scope] } }, "event-bad-scope"), "objective");
    assert.deepEqual(scope, before);
    assert.equal(f.state(root).action_scopes.length, 0);
    assert.equal((f.state(root).exchanges || []).length, 0);
  });
}
test("analysis proposal requires an exclusions array without fabricating defaults", t => {
  const { root } = project(t, "analysis");
  const plan = analysis(); plan.exclusions = "None";
  const scope = scopeFor(plan, f.state(root));
  rejectedWithoutWrite(root, () => f.record(root, "memory_updated", { changes: { action_scopes: [scope] } }, "event-bad-exclusions"), "exclusions");
  assert.equal(scope.execution_plan.exclusions, "None");
});

test("valid structural preflight needs no execution permission and does not grant it", t => {
  const { root } = project(t, "analysis");
  const plan = analysis();
  assert.doesNotThrow(() => validatePlanStructure(plan));
  const offer = f.prepareScope(root, plan);
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(() => runs.start(root, { ...f.ids(root, "event-no-choice"), run_id: "run-no-choice", plan }), error => error.code === "MISSING_INTERPRETATION");
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  assert.equal(fs.existsSync(path.join(root, "runs", "run-no-choice")), false);
  const accepted = f.acceptScope(root, offer);
  const result = runs.start(root, { ...f.ids(root, "event-start-approved"), run_id: "run-approved", plan: accepted });
  assert.equal(result.ok, true);
  assert.equal(f.state(root).runs.at(-1).authorization_binding.scope_ref, offer.scope.scope_id);
});

test("proposal and run start share structural errors, without reading files or references", () => {
  for (const [base, mutate, field] of [
    [analysis, plan => { plan.exclusions = "None"; }, "exclusions"],
    [report, plan => { delete plan.objective; }, "objective"],
    [analysis, plan => { plan.design_id = "custom_identification"; }, "identification_basis"]
  ]) {
    const plan = base(); mutate(plan);
    const before = structuredClone(plan);
    for (const validate of [validatePlanStructure, value => runs.validatePlan(value, { state_meta: {}, evidence: [] })]) {
      assert.throws(() => validate(plan), error => error.code === "INVALID_INPUT" && error.message.includes(field));
    }
    assert.deepEqual(plan, before);
  }
  assert.doesNotThrow(() => validatePlanStructure(report()));
  assert.throws(() => runs.validatePlan(report(), { state_meta: {}, evidence: [] }), error => error.code === "UNKNOWN_REFERENCE");
});

for (const kind of ["analysis", "report"]) {
  test("historical malformed " + kind + " scope replays and retries unchanged, but cannot be newly offered", t => {
    const env = project(t, kind);
    const bad = kind === "analysis" ? analysis() : report();
    if (kind === "analysis") bad.exclusions = "None";
    else delete bad.objective;
    const scope = scopeFor(bad, env.fixture.state);
    // applyEvent represents the historical v7.0.7 acceptance contract, not a new write.
    const old = env.fixture.append("memory_updated", { changes: { action_scopes: [scope] } });
    env.fixture.interpret("old-proposal");
    const outgoing = legacyExchange("old-proposal"); outgoing.renderer = "lead-markdown-v4";
    outgoing.response.next_steps = [{ option_id: "choose-old", kind: "action", label: "Use this scope", actor: "consultant",
      scope: "Perform the presented work", basis_refs: [], assignment: scope.assignment, scope_ref: scope.scope_id,
      proposal: scope.public_scope, execution_plan: scope.execution_plan }];
    if (kind === "report") outgoing.response.findings = { work_refs: ["audit-one"], summary: "Discussed audit findings", diagnostics: [], limitations: [bad.claim_boundary] };
    env.fixture.append("exchange_prepared", { protocol: PROTOCOL, exchange: outgoing });
    env.saveHistory();
    const bytes = fs.readFileSync(path.join(env.root, "journal.jsonl"));
    assert.deepEqual(store.readJournal(env.root).state, env.fixture.state);
    const retried = store.record(env.root, { event_id: old.event_id, expected_project_id: old.project_id,
      expected_last_event_id: old.previous_event_id, type: old.type, payload: old.payload });
    assert.equal(retried.replayed, true);
    assert.deepEqual(fs.readFileSync(path.join(env.root, "journal.jsonl")), bytes);
    const it = f.interpret(env.root, "reoffer", { kind: "lead_only", scope: "Discuss the old scope", reason: "No execution is authorized." });
    const response = structuredClone(outgoing.response);
    rejectedWithoutWrite(env.root, () => f.exchange(env.root, it, "reoffer", response), kind === "analysis" ? "exclusions" : "objective");
    const corrected = kind === "analysis" ? analysis() : report();
    const offer = f.prepareScope(env.root, corrected, { supersedes: scope.scope_id });
    assert.equal(offer.scope.supersedes, scope.scope_id);
    assert.deepEqual(f.state(env.root).action_scopes.find(item => item.scope_id === scope.scope_id), scope);
    assert.deepEqual(f.state(env.root).action_scopes.at(-1).execution_plan, corrected);
  });
}
