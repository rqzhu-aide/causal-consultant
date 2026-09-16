"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const store = require("../scripts/lib/store.cjs");
const runs = require("../scripts/lib/runs.cjs");
const policy = require("../scripts/lib/authorizations.cjs");
const f = require("./fixtures/consultation-loop.cjs");
function project(t) {
  const base = fs.realpathSync.native(os.tmpdir());
  const root = fs.mkdtempSync(path.join(base, "cc-loop-"));
  t.after(() => { assert.equal(path.dirname(fs.realpathSync.native(root)), base); assert.ok(path.basename(root).startsWith("cc-loop-")); fs.rmSync(root, { recursive: true, force: true }); });
  store.init(root, { event_id: "event-init", project_id: "project-loop" });
  fs.writeFileSync(path.join(root, "data.json"), "[1,3,5]");
  f.record(root, "memory_updated", { changes: { evidence: [{ evidence_id: "data-source", kind: "file", source_ref: "data.json", summary: "Three synthetic observations, not a causal identification argument.", limitations: ["Descriptive example only."] }] } }, "event-data");
  return root;
}
function plan(label = "primary") {
  return { kind: "analysis", objective: "Describe the sample: " + label, claim_boundary: "Sample description only; no causal conclusion.", inputs: [{ source_ref: "data.json", path: "data.json" }], target: "The observed mean", population: "Three observed rows", treatment: "None", comparator: "None", outcome: "Recorded value", timing: "One collection", estimand: "Sample arithmetic mean", design_id: "descriptive_association", estimator: "Arithmetic mean", exclusions: [], diagnostics: ["Check completeness and row count."] };
}
function start(root, value, run_id) { return runs.start(root, { ...f.ids(root, "event-start-" + run_id), run_id, plan: value }); }
function write(root, run_id, file, content) { const { event_id, ...ids } = f.ids(root, "unused"); return runs.write(root, { ...ids, run_id, path: file, content }); }
function finish(root, approved, run_id) {
  start(root, approved, run_id);
  if (approved.kind === "analysis") {
    const code = "const fs=require('node:fs'); const x=JSON.parse(fs.readFileSync('inputs/0001.json','utf8')); fs.writeFileSync('result.json',JSON.stringify({mean:x.reduce((a,b)=>a+b,0)/x.length})); fs.writeFileSync('diagnostics.json',JSON.stringify({n:x.length,missing:x.filter(v=>v===null).length}));";
    write(root, run_id, "analysis.cjs", code);
    const command = spawnSync(process.execPath, ["analysis.cjs"], { cwd: path.join(root, "runs", run_id), encoding: "utf8", windowsHide: true });
    assert.equal(command.status, 0, command.stderr);
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, "runs", run_id, "result.json"))).mean, 3);
  } else write(root, run_id, "report.md", "The observed mean is 3. This describes three rows and does not identify a causal effect.\n");
  runs.finalize(root, { ...f.ids(root, "event-finish-" + run_id), run_id, code_paths: approved.kind === "analysis" ? ["analysis.cjs"] : [], output_paths: [approved.kind === "analysis" ? "result.json" : "report.md"], diagnostic_paths: approved.kind === "analysis" ? ["diagnostics.json"] : [], environment: { runtime: process.version, authoring: "Independent synthetic loop regression" }, deviations: [] });
}
function discuss(root, approved, run_id, suffix, delivered = true) {
  const it = f.state(root).interpretations.find(item => item.interpretation_id === approved.interpretation_ref);
  const response = f.emptyResponse("The bounded work is complete. You can discuss limitations, choose another investigation, or pause.");
  response.findings = { work_refs: [run_id], summary: "The sample mean is 3.", diagnostics: ["All three values are observed."], limitations: ["No causal comparison is identified."] };
  const receipt = f.exchange(root, it, suffix, response, [run_id]);
  if (delivered) f.deliver(root, receipt.exchange_id, suffix);
  return receipt;
}
function unchanged(root, code, action, run_id) {
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(action, error => error.code === code);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
  if (run_id) assert.equal(fs.existsSync(path.join(root, "runs", run_id)), false);
}

test("wrapped approval and recovered findings finish one action without reapproval or recomputation", t => {
  const root = project(t);
  const offer = f.prepareScope(root, plan(), { basis_refs: ["data-source"] });
  const capture = (exchange_ref, suffix, actual, wrapper_review) => {
    fs.writeFileSync(path.join(root, "actual-reply.txt"), actual);
    return require("../scripts/lib/delivery.cjs").observe(root, { ...f.ids(root, "event-capture-" + suffix),
      delivery_id: "delivery-" + suffix, exchange_ref, message_path: "actual-reply.txt",
      source_ref: "fixture-host:assistant-" + suffix, observation: "assistant_emission", wrapper_review });
  };
  const proposed = capture(offer.exchange_ref, "wrapped-offer", "Here is the proposal.\n\n" + offer.rendered_response,
    "The added introduction identifies the proposal; its full terms and option ordering are unchanged.");
  assert.equal(proposed.correspondence, "wrapped");
  offer.delivery_ref = "delivery-wrapped-offer";
  const approved = f.acceptScope(root, offer);
  finish(root, approved, "run-once");
  const saved = discuss(root, approved, "run-once", "saved-findings", false);
  const beforeResult = fs.readFileSync(path.join(root, "runs/run-once/result.json"));
  // A new process has no session memory of the finished computation or reply.
  const command = spawnSync(process.execPath, [path.resolve(__dirname, "../scripts/project.cjs"), "context", "--project-root", root], { encoding: "utf8", windowsHide: true });
  assert.equal(command.status, 0, command.stdout);
  const resumed = JSON.parse(command.stdout);
  assert.ok(resumed.views.work.actions.findings_awaiting_discussion.some(item => item.run_ref === "run-once"));
  assert.ok(resumed.views.work.exchanges.some(item => item.exchange_id === saved.exchange_id));
  capture(saved.exchange_id, "recovered-findings", saved.rendered_response + "\n\nThe saved results remain available.",
    "The closing sentence only identifies saved results; all findings, limitations and next steps are intact.");
  assert.equal(store.status(root).views.work.actions.findings_awaiting_discussion.length, 0);
  assert.equal(f.state(root).action_decisions.filter(item => item.disposition === "accept").length, 1);
  assert.equal(f.state(root).runs.length, 1);
  assert.deepEqual(fs.readFileSync(path.join(root, "runs/run-once/result.json")), beforeResult);
  assert.equal(runs.verify(root).ok, true);
});

test("report desire and a saved proposal grant no work permission and create no artifacts", t => {
  const root = project(t);
  unchanged(root, "MISSING_AUTHORIZATION", () => start(root, plan(), "run-shortcut"), "run-shortcut");
  const offer = f.prepareScope(root, plan(), { basis_refs: ["data-source"] });
  assert.match(offer.rendered_response, /Three observed rows/);
  assert.match(offer.rendered_response, /Sample arithmetic mean/);
  unchanged(root, "MISSING_INTERPRETATION", () => start(root, { ...plan(), scope_ref: offer.scope.scope_id }, "run-unselected"), "run-unselected");
  assert.equal(store.status(root).views.work.actions.eligibility[0].reason, "awaiting user selection");
});

test("analysis, two extensions, report, and reopened analysis each require their own user choice", t => {
  const root = project(t);
  for (const [index, name] of ["primary", "first-extension", "second-extension"].entries()) {
    const offer = f.prepareScope(root, plan(name), { basis_refs: ["data-source"] });
    const approved = f.acceptScope(root, offer);
    const run_id = "run-" + index;
    finish(root, approved, run_id);
    const status = store.status(root);
    assert.equal(status.project.runs.length, index + 1);
    assert.equal(status.project.runs.some(run => run.kind === "report"), false);
    assert.ok(status.views.work.actions.findings_awaiting_discussion.some(item => item.run_ref === run_id));
    const context = store.context(root, { limit: 1 });
    assert.ok(context.views.work.unfinished_turns.some(turn => turn.work_refs.includes(run_id)));
    assert.ok(context.context.runs.some(run => run.run_id === run_id));
    discuss(root, approved, run_id, "results-" + index);
    assert.equal(store.status(root).views.work.actions.findings_awaiting_discussion.length, 0);
  }
  f.record(root, "memory_updated", { changes: { evidence: [{ evidence_id: "last-result", kind: "computed", run_id: "run-2", source_ref: "runs/run-2/result.json", summary: "Observed mean is 3, with no causal interpretation." }] } }, "event-evidence-result");
  const reportPlan = { kind: "report", objective: "Save the discussed sample results", claim_boundary: "Descriptive only.", inputs: [], purpose: "Study discussion", evidence_refs: ["last-result"], format: "Markdown" };
  const reportOffer = f.prepareScope(root, reportPlan, { findings_refs: ["run-2"] });
  assert.equal(fs.existsSync(path.join(root, "runs/run-report")), false);
  const reportApproval = f.acceptScope(root, reportOffer);
  finish(root, reportApproval, "run-report");
  discuss(root, reportApproval, "run-report", "report-delivered");
  const oldBytes = fs.readFileSync(path.join(root, "runs/run-report/report.md"));
  const reopened = f.authorizePlan(root, plan("reopened"), { basis_refs: ["data-source"] });
  finish(root, reopened, "run-reopened");
  discuss(root, reopened, "run-reopened", "reopened-results");
  assert.deepEqual(fs.readFileSync(path.join(root, "runs/run-report/report.md")), oldBytes);
  assert.equal(f.state(root).runs.length, 5);
  assert.equal(Object.hasOwn(f.state(root), "phase"), false);
  assert.equal(runs.verify(root).ok, true);
  const restored = spawnSync(process.execPath, [path.resolve(__dirname, "../scripts/project.cjs"), "context", "--project-root", root], { encoding: "utf8", windowsHide: true });
  assert.equal(restored.status, 0, restored.stdout);
  assert.equal(JSON.parse(restored.stdout).views.work.actions.focus_scope_ref, reopened.scope_ref);
});

test("switching focus and deferring preserves an older exact option across a fresh read", t => {
  const root = project(t);
  const a = f.prepareScope(root, plan("a"), { basis_refs: ["data-source"] });
  f.acceptScope(root, a, { disposition: "defer", user_text: "Keep this for later; I want to consider a different question." });
  const b = f.prepareScope(root, { ...plan("b"), population: "A different future population" }, { basis_refs: ["data-source"] });
  f.acceptScope(root, b, { disposition: "defer", user_text: "Pause this too. I may return to the first scope." });
  const context = store.context(root, { limit: 1 });
  for (const offered of [a, b]) {
    assert.ok(context.context.action_scopes.some(scope => scope.scope_id === offered.scope.scope_id));
    assert.ok(context.views.work.exchanges.some(exchange => exchange.exchange_id === offered.exchange_ref));
    assert.ok(context.views.work.actions.offers.some(offer => offer.option_id === offered.option_id && offer.option_number === 1));
  }
  assert.equal(f.state(root).runs.length, 0);
  const approved = f.acceptScope(root, a, { user_text: "Resume the first scope exactly as you proposed it." });
  finish(root, approved, "run-resumed");
  assert.equal(policy.eligibility(f.state(root), b.scope.scope_id).reason, "defer");
});

test("completed work with undelivered findings resumes its closeout without a second run", t => {
  const root = project(t);
  const approved = f.authorizePlan(root, plan(), { basis_refs: ["data-source"] });
  finish(root, approved, "run-complete");
  const receipt = discuss(root, approved, "run-complete", "interrupted", false);
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  store.recover(root);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  const resumed = store.context(root, { limit: 1 }).views.work;
  assert.equal(resumed.actions.findings_awaiting_discussion[0].next_action, "recover_or_confirm_delivery");
  assert.equal(resumed.exchanges.find(item => item.exchange_id === receipt.exchange_id).delivery.status, "unobserved");
  f.deliver(root, receipt.exchange_id, "recovered");
  assert.equal(store.status(root).views.work.actions.findings_awaiting_discussion.length, 0);
  assert.equal(f.state(root).runs.length, 1);
});
test("a material correction blocks new files while retaining exact prior basis in focused memory", t => {
  const root = project(t);
  const offer = f.prepareScope(root, plan(), { basis_refs: ["data-source"] });
  const approved = f.acceptScope(root, offer);
  start(root, approved, "run-correction");
  const beforePlan = fs.readFileSync(path.join(root, "runs/run-correction/plan.yaml"));
  f.record(root, "correction", { corrects_refs: ["data-source"], reason: "Source inspection changes the recorded population limitation.", changes: { evidence: [{ evidence_id: "data-source", kind: "file", source_ref: "data.json", summary: "Correction: one row belongs to a different population.", limitations: ["Population membership needs clarification."] }] } }, "event-correction");
  unchanged(root, "STALE_SCOPE", () => write(root, "run-correction", "result.json", "{}"));
  assert.equal(fs.existsSync(path.join(root, "runs/run-correction/result.json")), false);
  assert.deepEqual(fs.readFileSync(path.join(root, "runs/run-correction/plan.yaml")), beforePlan);
  const context = store.context(root, { focus_refs: [offer.scope.scope_id], limit: 1 });
  const old = context.views.work.actions.exact_basis.find(item => item.scope_ref === offer.scope.scope_id).versions.find(item => item.ref === "data-source");
  assert.match(old.recorded_body.summary, /Three synthetic observations/);
  assert.equal(old.current_event_ref, "event-correction");
  assert.match(context.context.evidence.find(item => item.evidence_id === "data-source").summary, /Correction/);
  runs.abandon(root, { ...f.ids(root, "event-abandon"), run_id: "run-correction", reason: "Revise the affected population scope before new work." });
  const revised = f.prepareScope(root, { ...plan(), population: "The two eligible rows, pending a corrected file" }, { basis_refs: ["data-source"], supersedes: offer.scope.scope_id });
  assert.equal(policy.eligibility(f.state(root), revised.scope.scope_id).eligible, false);
});

test("unrelated user preferences preserve scope permission but changed execution terms do not", t => {
  const root = project(t);
  const approved = f.authorizePlan(root, plan(), { basis_refs: ["data-source"] });
  f.record(root, "memory_updated", { changes: { evidence: [f.statement("user-style", "Use concise explanations in English.")] } }, "event-style");
  assert.equal(policy.eligibility(f.state(root), approved.scope_ref).eligible, true);
  unchanged(root, "SCOPE_MISMATCH", () => start(root, { ...approved, population: "An unapproved larger population" }, "run-expanded"), "run-expanded");
  finish(root, approved, "run-current");
  unchanged(root, "INVALID_AUTHORIZATION", () => start(root, approved, "run-repeat"), "run-repeat");
});

test("withdrawal stops in-progress output while identical file retry and cancellation remain possible", t => {
  const root = project(t);
  const offer = f.prepareScope(root, plan(), { basis_refs: ["data-source"] });
  const approved = f.acceptScope(root, offer);
  start(root, approved, "run-withdrawn");
  write(root, "run-withdrawn", "notes.txt", "A retained work note.");
  f.acceptScope(root, offer, { disposition: "withdraw", user_text: "Stop this analysis. I withdraw that choice." });
  assert.equal(write(root, "run-withdrawn", "notes.txt", "A retained work note.").replayed, true);
  unchanged(root, "INVALID_AUTHORIZATION", () => write(root, "run-withdrawn", "result.json", "{}"));
  runs.abandon(root, { ...f.ids(root, "event-stop"), run_id: "run-withdrawn", reason: "The user withdrew this action." });
  assert.equal(runs.verify(root).ok, true);
});

test("audit declarations cannot hide effect estimation or policy optimization", t => {
  const root = project(t);
  for (const operation of ["effect_estimation", "policy_learning", "reporting"]) {
    unchanged(root, "PROTECTED_OPERATION", () => start(root, { kind: "audit", objective: "Inspect source data", claim_boundary: "Inspection only", inputs: [], question: "Is the source usable?", diagnostics: [], operations: [operation] }, "run-mislabelled"), "run-mislabelled");
  }
});
test("new user steering suspends an old open action until explicitly resumed", t => {
  const root = project(t);
  const approved = f.authorizePlan(root, plan(), { basis_refs: ["data-source"] });
  f.interpret(root, "pause-before-start", { kind: "lead_only", scope: "Pause this work.", reason: "The user wants to discuss the population first." }, {}, "Pause. Explain the population before running this.");
  unchanged(root, "DIRECTION_CHANGED", () => start(root, approved, "run-old-direction"), "run-old-direction");
  const resume = f.interpret(root, "resume-current", { kind: "specialist", assignment: { specialist_id: "design_worker", operation: "execution", design_id: approved.design_id }, scope: "Resume the unchanged accepted scope.", reason: "The user has resolved the question and resumed this action.", scope_ref: approved.scope_ref, authorization_ref: approved.authorization_ref }, {}, "Resume the original scope without changing its population.");
  const resumed = { ...approved, interpretation_ref: resume.interpretation_id };
  start(root, resumed, "run-resume");
  f.interpret(root, "pause-in-progress", { kind: "lead_only", scope: "Pause pending clarification.", reason: "The user changed direction while work was incomplete." }, {}, "Stop here for now. I will check the records.");
  unchanged(root, "DIRECTION_CHANGED", () => write(root, "run-resume", "more.txt", "Do not continue automatically."));
  assert.equal(f.state(root).runs[0].status, "in_progress");
});
test("paused acceptance survives a fresh process without executing or asking for the same approval again", t => {
  const root = project(t);
  const offer = f.prepareScope(root, plan(), { basis_refs: ["data-source"] });
  const accepted = f.acceptScope(root, offer, { lead_only: true, user_text: "I approve this scope, but wait while I confirm that this is the intended extract." });
  unchanged(root, "ASSIGNMENT_MISMATCH", () => start(root, accepted, "run-before-clarification"), "run-before-clarification");
  const interpreted = f.state(root).interpretations.at(-1);
  const receipt = f.exchange(root, interpreted, "paused-approval", f.emptyResponse("Your approval is recorded. The selected work will wait for confirmation of the extract."));
  f.deliver(root, receipt.exchange_id, "paused-approval");
  const command = spawnSync(process.execPath, [path.resolve(__dirname, "../scripts/project.cjs"), "context", "--project-root", root], { encoding: "utf8", windowsHide: true });
  assert.equal(command.status, 0, command.stdout);
  const resumed = JSON.parse(command.stdout);
  const permission = resumed.views.work.actions.eligibility.find(item => item.scope_ref === offer.scope.scope_id);
  assert.equal(permission.eligible, true);
  assert.equal(permission.executable_now, false);
  assert.ok(resumed.views.work.exchanges.some(item => item.exchange_id === offer.exchange_ref));
  assert.equal(f.state(root).runs.length, 0);
  const direction = f.interpret(root, "extract-confirmed", { kind: "specialist", assignment: offer.scope.assignment,
    scope: "Resume the unchanged approved scope.", reason: "The user confirms the extract and explicitly resumes the accepted action.",
    scope_ref: accepted.scope_ref, authorization_ref: accepted.authorization_ref }, {}, "It is the same extract. Go ahead with the scope I approved.");
  const approved = { ...accepted, interpretation_ref: direction.interpretation_id };
  finish(root, approved, "run-after-clarification");
  discuss(root, approved, "run-after-clarification", "resumed-findings");
  assert.equal(f.state(root).action_decisions.filter(item => item.disposition === "accept").length, 1);
  assert.equal(f.state(root).runs.length, 1);
  assert.equal(runs.verify(root).ok, true);
});
test("correcting the bound target prevents an unchanged approval starting the old outcome analysis", t => {
  const root = project(t);
  const offer = f.prepareScope(root, plan(), { basis_refs: ["data-source"] });
  const accepted = f.acceptScope(root, offer, { user_text: "I approve the scope as described." });
  const target = f.state(root).decisions.find(item => offer.scope.basis_versions.some(binding => binding.ref === item.decision_id) && item.kind === "target");
  f.record(root, "memory_updated", { changes: {
    evidence: [f.statement("user-target-correction", "The outcome should be completion, not the recorded score.")],
    decisions: [{ ...target, statement: "Describe completion in the observed sample; no causal conclusion.", basis_refs: [...target.basis_refs, "user-target-correction"] }]
  } }, "event-target-correction");
  assert.equal(policy.eligibility(f.state(root), offer.scope.scope_id).eligible, false);
  unchanged(root, "INVALID_AUTHORIZATION", () => start(root, accepted, "run-old-outcome"), "run-old-outcome");
  const context = store.context(root, { focus_refs: [offer.scope.scope_id], limit: 1 });
  const targetVersions = context.views.work.actions.exact_basis.find(item => item.scope_ref === offer.scope.scope_id).versions.find(item => item.ref === target.decision_id);
  assert.match(targetVersions.recorded_body.statement, /Describe the sample/);
  assert.equal(targetVersions.current_event_ref, "event-target-correction");
});

test("presenting computed evidence satisfies its completed run's discussion obligation", t => {
  const root = project(t);
  const approved = f.authorizePlan(root, plan(), { basis_refs: ["data-source"] });
  finish(root, approved, "run-evidence");
  f.record(root, "memory_updated", { changes: { evidence: [{ evidence_id: "result-view", kind: "computed", run_id: "run-evidence", source_ref: "runs/run-evidence/result.json", summary: "Observed mean is 3." }] } }, "event-result-view");
  const response = f.emptyResponse("The mean is 3; the sample does not identify a causal effect.");
  response.findings = { work_refs: ["result-view"], summary: "Observed mean is 3.", diagnostics: ["Three complete values."], limitations: ["Descriptive only."] };
  const it = f.state(root).interpretations.find(item => item.interpretation_id === approved.interpretation_ref);
  const receipt = f.exchange(root, it, "evidence-discussion", response, ["run-evidence"]);
  f.deliver(root, receipt.exchange_id, "evidence-discussion");
  assert.equal(store.status(root).views.work.actions.findings_awaiting_discussion.length, 0);
});
test("a new report scope can explain a retired assumption without adopting it as true", t => {
  const root = project(t);
  f.record(root, "memory_updated", { changes: {
    assumptions: [{ assumption_id: "withdrawn-premise", statement: "Treatment was randomized.", status: "retired", basis_refs: ["data-source"] }],
    result_conditions: [{ condition_id: "no-identification", evidence_ref: "data-source", result_locator: "Design interpretation", claim: "The sources do not establish randomization.", target: "Study design", assumption_refs: ["withdrawn-premise"], basis_refs: ["data-source"], limitations: ["No causal effect is identified."] }]
  } }, "event-negative-finding");
  const approved = f.authorizePlan(root, { kind: "report", objective: "Explain why estimation is unsupported", claim_boundary: "Document missing identification; no treatment effect estimate.", inputs: [], purpose: "Design limitations", evidence_refs: ["data-source"], format: "Markdown" });
  start(root, approved, "run-design-report");
  write(root, "run-design-report", "report.md", "The sources do not establish randomization. The earlier assumption is retired; no causal effect is identified.\n");
  runs.finalize(root, { ...f.ids(root, "event-design-finish"), run_id: "run-design-report", code_paths: [], output_paths: ["report.md"], diagnostic_paths: [], environment: { authoring: "Design discussion regression" }, deviations: [] });
  assert.equal(runs.verify(root).ok, true);
  assert.ok(f.state(root).runs.every(run => run.kind === "report"));
});
test("v4 receipt survives unordered JSON input, canonical journal serialization and exact delivery", t => {
  const root = project(t);
  const candidate = plan();
  candidate.identification_basis = { source_refs: ["data.json"], assumptions: ["The values describe the observed rows only."], argument: "No causal identification is claimed." };
  const offer = f.prepareScope(root, candidate, { basis_refs: ["data-source"] });
  assert.equal(store.status(root).projection_current, true);
  const { renderExchange } = require("../scripts/lib/exchanges.cjs");
  const { canonical, sha256 } = require("../scripts/lib/files.cjs");
  const body = store.history(root, { record_id: offer.exchange_ref, type: "exchange_prepared" }).events[0].payload.exchange;
  const reverse = value => Array.isArray(value) ? value.map(reverse) : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).reverse().map(key => [key, reverse(value[key])])) : value;
  assert.equal(renderExchange(body), offer.rendered_response);
  assert.equal(renderExchange(reverse(body)), renderExchange(JSON.parse(canonical(body))));
  assert.equal(f.state(root).exchanges.find(item => item.exchange_id === offer.exchange_ref).response_sha256, sha256(offer.rendered_response));
  assert.doesNotMatch(offer.rendered_response, /design id:|descriptive_association/);
  const approved = f.acceptScope(root, offer);
  start(root, approved, "run-exact-delivery");
});
test("source bytes changed between proposal and execution cannot silently inherit approval", t => {
  const root = project(t);
  const offer = f.prepareScope(root, plan(), { basis_refs: ["data-source"] });
  fs.writeFileSync(path.join(root, "data.json"), "[1,3,500]");
  const approved = f.acceptScope(root, offer);
  unchanged(root, "INPUT_CHANGED", () => start(root, approved, "run-changed-file"), "run-changed-file");
  assert.equal(f.state(root).runs.length, 0);
  const proposed = structuredClone(offer.scope);
  proposed.scope_id = "scope-unbound-input";
  delete proposed.execution_plan.inputs[0].sha256;
  unchanged(root, "INVALID_INPUT", () => f.record(root, "memory_updated", { changes: { action_scopes: [proposed] } }, "event-unbound-input"));
});
