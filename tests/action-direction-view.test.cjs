"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/store.cjs"), runs = require("../scripts/lib/runs.cjs");
const f = require("./fixtures/consultation-loop.cjs");

test("public action views close the direction while preserving unused approval for a later clear resume", t => {
  const base = fs.realpathSync(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-direction-view-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync(root)), base);
    assert.ok(path.basename(root).startsWith("cc-direction-view-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  store.init(root, { project_id: "direction-view", event_id: "event-init" });
  const offer = f.prepareScope(root, { kind: "analysis", objective: "Describe the supplied sample", claim_boundary: "Descriptive only",
    inputs: [], target: "Sample mean", population: "Supplied observations", treatment: "None", comparator: "None",
    outcome: "Recorded score", timing: "One collection", estimand: "Sample mean", design_id: "descriptive_association",
    estimator: "Arithmetic mean", exclusions: [], diagnostics: [] });
  const approved = f.acceptScope(root, offer);
  const acceptedDecisions = structuredClone(f.state(root).action_decisions);
  const original = f.state(root).interpretations.find(item => item.interpretation_id === approved.interpretation_ref);
  const assertViews = (current, executable) => {
    for (const result of [store.status(root), store.context(root, { focus_refs: [offer.scope.scope_id] })]) {
      const permission = result.views.work.actions.eligibility.find(item => item.scope_ref === offer.scope.scope_id);
      assert.equal(permission.eligible, true, "Ending a turn does not withdraw or consume unused approval.");
      assert.equal(permission.authorization_ref, approved.authorization_ref);
      assert.equal(permission.current_direction, current);
      assert.equal(permission.executable_now, executable);
      assert.deepEqual(result.views.work.actions.decisions, acceptedDecisions);
    }
  };
  assertViews(true, true);
  f.exchange(root, original, "paused", f.emptyResponse("The accepted work has not run; it remains paused before execution."));
  assertViews(false, false);
  const status = store.status(root);
  assert.equal(status.project.runs.length, 0, "A prepared closeout does not claim completed work.");
  assert.ok(status.views.work.unfinished_turns.some(turn => turn.interpretation_ref === approved.interpretation_ref
    && turn.reasons.includes("delivery_unobserved")), "Preparing the closeout does not establish delivery.");
  const beforeRejectedStart = fs.readFileSync(path.join(root, "journal.jsonl"), "utf8");
  assert.throws(() => runs.start(root, { ...f.ids(root, "event-closed-start"), run_id: "run-closed", plan: approved }),
    error => error.code === "TURN_CLOSED");
  assert.equal(fs.readFileSync(path.join(root, "journal.jsonl"), "utf8"), beforeRejectedStart);
  f.deliver(root, "exchange-paused", "paused");
  assertViews(false, false);

  const resume = f.interpret(root, "resume", { ...original.next_action,
    reason: "The user clearly requests the unchanged, previously accepted analysis." },
  { basis_refs: [approved.scope_ref, approved.authorization_ref], focus_scope_ref: approved.scope_ref },
  "Resume the exact analysis I already accepted, with the same scope and limitations.");
  assertViews(true, true);
  const resumedPlan = { ...approved, interpretation_ref: resume.interpretation_id };
  runs.start(root, { ...f.ids(root, "event-resumed-start"), run_id: "run-resumed", plan: resumedPlan });
  const resumed = store.status(root);
  assert.equal(resumed.project.runs.length, 1);
  assert.equal(resumed.project.runs[0].authorization_binding.authorization_ref, approved.authorization_ref);
  assert.deepEqual(resumed.project.action_decisions, acceptedDecisions, "Resume does not manufacture another acceptance.");
  const used = resumed.views.work.actions.eligibility.find(item => item.scope_ref === approved.scope_ref);
  assert.equal(used.eligible, false);
  assert.equal(used.executable_now, false, "The existing start guard consumes approval for additional starts.");
});
