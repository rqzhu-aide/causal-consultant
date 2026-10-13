"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/store.cjs"), author = require("../scripts/lib/authoring.cjs");
const { sha256 } = require("../scripts/lib/files.cjs");
const f = require("./fixtures/consultation-loop.cjs");
const at = root => store.context(root, { mode: "brief" }).state_token;

function setup(t) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-author-runs-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("cc-author-runs-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  store.init(root, { project_id: "project-author-runs", event_id: "event-init" });
  fs.writeFileSync(path.join(root, "data.csv"), "offer,outcome\n0,2\n1,4\n");
  f.record(root, "memory_updated", { changes: {
    evidence: [{ evidence_id: "data", kind: "file", source_ref: "data.csv", summary: "Synthetic randomized offer data." }],
    decisions: [{ decision_id: "target", kind: "target", status: "current", statement: "Compare the randomized offer groups.", basis_refs: ["data"] }]
  } }, "event-source");
  return root;
}
function analysisOffer(root) {
  const interpretation = f.interpret(root, "proposal", { kind: "lead_only", scope: "Offer the bounded comparison.", reason: "The user can choose an analysis." });
  const plan = { kind: "analysis", objective: "Compare offers", claim_boundary: "Synthetic trial only", inputs: [{ source_ref: "data", path: "data.csv" }],
    target: "Offer ATE", population: "Synthetic trial participants", treatment: "Offer", comparator: "No offer", outcome: "Outcome", timing: "One year",
    estimand: "Mean difference", design_id: "randomized_assignment", estimator: "Difference in means", exclusions: [], diagnostics: ["Missingness"] };
  const response = f.emptyResponse("A bounded offer comparison is available.");
  delete response.next_steps_none;
  response.next_steps = [{ option_id: "compare", kind: "action", actor: "consultant", label: "Compare offers", scope: "Use these exact terms.", basis_refs: ["target", "data"], scope_ref: "@analysis" }];
  return { at: at(root), op: "exchange_prepared", changes: { action_scopes: [{ as: "analysis", action: "analysis",
    assignment: { specialist_id: "design_worker", operation: "execution", design_id: "randomized_assignment" }, basis_refs: ["target", "data"], findings_refs: [],
    public_scope: { target: plan.target, population: plan.population, evidence: "Synthetic offer trial", approach: plan.estimator, checks: plan.diagnostics,
      outputs: "Estimate and diagnostics", claim_boundary: plan.claim_boundary }, execution_plan: plan }] },
    exchange: { as: "offer", interpretation_ref: interpretation.interpretation_id, basis_refs: ["target", "data"], completed_work_refs: [],
      reconciliation: { changes: [], limitations: [plan.claim_boundary], unresolved: [], next_direction: "The user can choose the comparison." }, response } };
}
function accept(root, receipt) {
  const scope = f.state(root).action_scopes.find(item => item.scope_id === receipt.authoring_refs.analysis);
  const delivery_ref = f.deliver(root, receipt.authoring_refs.offer, "offer");
  return f.acceptScope(root, { scope, exchange_ref: receipt.authoring_refs.offer, option_id: "compare", delivery_ref });
}
function referenceStart(root, plan) {
  return { at: at(root), op: "start-run", as: "computation", ...Object.fromEntries(
    ["scope_ref", "interpretation_ref", "authorization_ref"].map(key => [key, plan[key]])) };
}
function rejectedWithoutJournal(root, code, operation) {
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(operation, { code });
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
}

test("assisted proposal derives selected input hashes and binds dependency versions", t => {
  const root = setup(t), request = analysisOffer(root);
  request.changes.action_scopes[0].execution_plan.inputs[0].source_ref = "@analysis";
  const original = structuredClone(request);
  const receipt = author.submit(root, request), scope = f.state(root).action_scopes[0];
  assert.deepEqual(request, original);
  assert.equal(scope.scope_id, receipt.authoring_refs.analysis);
  assert.equal(scope.execution_plan.inputs[0].sha256, sha256(fs.readFileSync(path.join(root, "data.csv"))));
  assert.equal(scope.execution_plan.inputs[0].source_ref, "@analysis");
  assert.ok(scope.basis_versions.some(item => item.ref === "data" && item.event_ref === "event-source"));
  assert.equal(store.readJournal(root).events.at(-1).payload.exchange.response.next_steps[0].scope_ref, scope.scope_id);
});

test("assisted proposal retry preserves original bindings after lost receipt, later history and source deletion", t => {
  const root = setup(t), request = analysisOffer(root);
  const first = author.submit(root, request, { hooks: { afterAppend() { throw new Error("lost receipt"); } } });
  assert.equal(first.committed, true);
  author.submit(root, { at: at(root), op: "memory_updated", changes: { evidence: [{ evidence_id: "data", patch: { summary: "A changed source interpretation." } }] } });
  fs.unlinkSync(path.join(root, "data.csv"));
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  const retry = author.submit(root, request);
  assert.equal(retry.replayed, true);
  assert.equal(retry.last_event_id, first.last_event_id);
  assert.deepEqual(retry.authoring_refs, first.authoring_refs);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  const changed = structuredClone(request); changed.exchange.response.status = "A new request.";
  rejectedWithoutJournal(root, "STALE_WRITE", () => author.submit(root, changed));
});

test("assisted protected start allocates one run and retries without rebinding deleted inputs", t => {
  const root = setup(t), offer = author.submit(root, analysisOffer(root)), accepted = accept(root, offer);
  const request = referenceStart(root, accepted);
  const missing = structuredClone(request); delete missing.authorization_ref;
  rejectedWithoutJournal(root, "INVALID_INPUT", () => author.submit(root, missing));
  const mismatch = { ...request, scope_ref: "unknown-scope" };
  rejectedWithoutJournal(root, "UNKNOWN_REFERENCE", () => author.submit(root, mismatch));
  const first = author.submit(root, request, { hooks: { afterAppend() { throw new Error("lost receipt"); } } });
  assert.equal(first.run_id, first.authoring_refs.computation);
  const frozen = JSON.parse(fs.readFileSync(path.join(root, first.plan_ref), "utf8"));
  assert.equal(frozen.authorization_binding.scope_ref, accepted.scope_ref);
  assert.equal(frozen.inputs[0].source_sha256, frozen.inputs[0].snapshot_sha256);
  author.submit(root, { at: at(root), op: "memory_updated", changes: { project_understanding: { materials: ["Later note"] } } });
  fs.unlinkSync(path.join(root, "data.csv"));
  const retry = author.submit(root, request);
  assert.equal(retry.replayed, true); assert.equal(retry.run_id, first.run_id);
  assert.equal(retry.run_path, first.run_path);
  assert.equal(retry.plan_ref, first.plan_ref);
  assert.deepEqual(retry.inputs, first.inputs);
  assert.equal(Object.hasOwn(retry, "receipt_recovery_error"), false);
  assert.equal(f.state(root).runs.length, 1);
  rejectedWithoutJournal(root, "STALE_WRITE", () => author.submit(root, { ...request, as: "another" }));
});

for (const changed of [false, true]) {
  test("assisted start retry retains its commit but reports a " + (changed ? "changed" : "missing") + " frozen plan", t => {
    const root = setup(t), accepted = accept(root, author.submit(root, analysisOffer(root)));
    const request = referenceStart(root, accepted), started = author.submit(root, request);
    author.submit(root, { at: at(root), op: "memory_updated", changes: { project_understanding: { materials: ["Later context"] } } });
    fs.unlinkSync(path.join(root, "data.csv"));
    if (changed) fs.appendFileSync(path.join(root, started.plan_ref), " ");
    else fs.unlinkSync(path.join(root, started.plan_ref));
    const before = fs.readFileSync(path.join(root, "journal.jsonl")), retry = author.submit(root, request);
    assert.equal(retry.ok, true); assert.equal(retry.committed, true); assert.equal(retry.replayed, true);
    assert.equal(retry.last_event_id, started.last_event_id); assert.equal(retry.run_id, started.run_id);
    assert.equal(retry.run_path, started.run_path); assert.equal(retry.plan_ref, started.plan_ref);
    assert.equal(Object.hasOwn(retry, "inputs"), false);
    assert.equal(retry.receipt_recovery_error.code, changed ? "PLAN_CHANGED" : "ENOENT");
    assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
    assert.equal(f.state(root).runs.length, 1);
    if (!changed) assert.equal(fs.existsSync(path.join(root, started.plan_ref)), false);
  });
}

test("assisted proposal and protected start preserve explicit hash and source-change errors", t => {
  const root = setup(t), request = analysisOffer(root);
  const wrong = structuredClone(request); wrong.changes.action_scopes[0].execution_plan.inputs[0].sha256 = "0".repeat(64);
  rejectedWithoutJournal(root, "INPUT_CHANGED", () => author.submit(root, wrong));
  const accepted = accept(root, author.submit(root, request));
  fs.appendFileSync(path.join(root, "data.csv"), "1,9\n");
  rejectedWithoutJournal(root, "INPUT_CHANGED", () => author.submit(root, referenceStart(root, accepted)));
  assert.equal(f.state(root).runs.length, 0);
});

test("assisted in-progress report correction uses a new file and cannot change completed work", t => {
  const root = setup(t);
  const accepted = f.authorizePlan(root, { kind: "report", objective: "Summarize the available source", claim_boundary: "Descriptive only",
    inputs: [], purpose: "Explain source limitations", evidence_refs: ["data"], format: "Markdown" });
  const started = author.submit(root, referenceStart(root, accepted));
  const firstWrite = { at: started.state_token, op: "write-run-file", run_id: started.run_id, path: "draft.md", content: "# Report\nA source account.\n" };
  author.submit(root, firstWrite);
  assert.equal(author.submit(root, firstWrite).replayed, true);
  rejectedWithoutJournal(root, "FILE_EXISTS", () => author.submit(root, { ...firstWrite, content: "Changed draft" }));
  author.submit(root, { at: at(root), op: "memory_updated", changes: { project_understanding: { materials: ["Readback found a missing descriptive qualifier."] } } });
  rejectedWithoutJournal(root, "STALE_WRITE", () => author.submit(root, firstWrite));
  author.submit(root, { ...firstWrite, at: at(root), path: "report.md", content: "# Report\nA descriptive source account.\n" });
  const environment = { authoring: "Synthetic test", run_id: "@external-run", nested: { evidence_refs: ["@external-evidence"] } };
  const finalizeRequest = { at: at(root), op: "finalize-run", run_id: started.run_id,
    code_paths: [], output_paths: ["report.md"], diagnostic_paths: [], environment, deviations: [],
    deliverable: { primary: "report.md", companions: [], assets: [] } };
  const finalized = author.submit(root, finalizeRequest);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, finalized.manifest_ref), "utf8"));
  assert.deepEqual(manifest.output_paths, ["report.md"]);
  assert.deepEqual(manifest.environment, environment);
  assert.equal(f.state(root).runs[0].status, "completed");
  author.submit(root, { at: at(root), op: "memory_updated", changes: { project_understanding: { materials: ["Later report discussion"] } } });
  const before = fs.readFileSync(path.join(root, "journal.jsonl")), retry = author.submit(root, finalizeRequest);
  assert.equal(retry.replayed, true); assert.equal(retry.last_event_id, finalized.last_event_id);
  assert.equal(retry.manifest_ref, finalized.manifest_ref); assert.equal(retry.manifest_sha256, finalized.manifest_sha256);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  rejectedWithoutJournal(root, "RUN_IMMUTABLE", () => author.submit(root, { ...firstWrite, at: at(root), path: "later.md" }));
  rejectedWithoutJournal(root, "INVALID_AUTHORIZATION", () => author.submit(root, referenceStart(root, accepted)));
});

test("assisted report acceptance adds sourced local formats through start, finalization and exact retries", t => {
  const root = setup(t);
  const offer = f.prepareScope(root, { kind: "report", objective: "Summarize the available source", claim_boundary: "Descriptive only",
    inputs: [], purpose: "Explain source limitations", evidence_refs: ["data"], format: "Markdown" });
  const selection = author.submit(root, { at: at(root), op: "reply_interpreted",
    changes: { evidence: [{ as: "request", kind: "user_statement", source_ref: "fixture-host:user-request",
      source_excerpt: "Yes, write that report, and include HTML alongside Markdown.", summary: "Accepts the offered report with an HTML companion." }] },
    interpretation: { as: "selection", incoming_refs: ["@request"], basis_refs: [offer.scope.scope_id],
      components: [{ kind: "selection", meaning: "Accepts this report with the requested local formats.", established: ["Markdown and HTML requested."], unresolved: [],
        exchange_ref: offer.exchange_ref, option_id: offer.option_id, delivery_ref: offer.delivery_ref }],
      action_decisions: [{ as: "acceptance", scope_ref: offer.scope.scope_id, disposition: "accept", exchange_ref: offer.exchange_ref,
        option_id: offer.option_id, delivery_ref: offer.delivery_ref, user_refs: ["@request"], presentation_adjustment: { formats: ["markdown", "html"], user_ref: "@request" } }],
      next_action: { kind: "specialist", scope: "Write the accepted report in its requested formats.", reason: "The user requested both local formats.",
        assignment: offer.scope.assignment, scope_ref: offer.scope.scope_id, authorization_ref: "@acceptance" } } });
  const chosen = { scope_ref: offer.scope.scope_id, interpretation_ref: selection.authoring_refs.selection, authorization_ref: selection.authoring_refs.acceptance };
  const startRequest = referenceStart(root, chosen), started = author.submit(root, startRequest);
  const frozen = JSON.parse(fs.readFileSync(path.join(root, started.plan_ref), "utf8"));
  assert.equal(frozen.format, "markdown, html");
  assert.equal(frozen.authorization_binding.presentation_adjustment.user_ref, selection.authoring_refs.request);
  assert.equal(frozen.authorization_binding.presentation_adjustment.source_event_ref, selection.last_event_id);
  assert.equal(f.state(root).action_scopes.find(scope => scope.scope_id === offer.scope.scope_id).execution_plan.format, "Markdown");
  for (const [name, content] of [["report.md", "# Report\nDescriptive only.\n"], ["report.html", "<!doctype html><h1>Report</h1><p>Descriptive only.</p>"]]) {
    author.submit(root, { at: at(root), op: "write-run-file", run_id: started.run_id, path: "outputs/" + name, content });
  }
  const finalRequest = { at: at(root), op: "finalize-run", run_id: started.run_id, code_paths: [],
    output_paths: ["outputs/report.md", "outputs/report.html"], diagnostic_paths: [], environment: { authoring: "Synthetic fixture" }, deviations: [],
    deliverable: { primary: "outputs/report.html", companions: ["outputs/report.md"], assets: [] } };
  const finished = author.submit(root, finalRequest);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, finished.manifest_ref), "utf8"));
  assert.deepEqual(manifest.authorization_binding, frozen.authorization_binding);
  assert.deepEqual(manifest.deliverable, finalRequest.deliverable);
  assert.equal(author.submit(root, startRequest).replayed, true);
  assert.equal(author.submit(root, finalRequest).replayed, true);
  assert.equal(f.state(root).action_decisions.length, 1);
  assert.equal(f.state(root).runs.filter(run => run.kind === "report").length, 1);
  assert.equal(require("../scripts/lib/runs.cjs").verify(root).ok, true);
});
