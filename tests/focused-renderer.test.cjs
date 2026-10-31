"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const store = require("../scripts/lib/store.cjs");
const runs = require("../scripts/lib/runs.cjs");
const { canonical, sha256 } = require("../scripts/lib/files.cjs");
const { PROTOCOL, renderExchange } = require("../scripts/lib/exchanges.cjs");
const f = require("./fixtures/consultation-loop.cjs");

function project(t) {
  const base = fs.realpathSync.native(os.tmpdir());
  const root = fs.mkdtempSync(path.join(base, "cc-focused-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("cc-focused-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  store.init(root, { project_id: "focused", event_id: "event-init" });
  return root;
}
function plan() {
  return { kind: "analysis", objective: "Estimate the effect of a randomized offer on next-term scores",
    claim_boundary: "The randomized study cohort; no effect of actual attendance or deployment claim.", inputs: [],
    target: "Mean next-term score effect of an offer versus no offer, using original assignment",
    population: "All randomized participants, including those who did not attend",
    treatment: "Offer", comparator: "No offer", outcome: "Next-term score", timing: "Next term",
    estimand: "Intention-to-treat average effect", design_id: "randomized_assignment",
    estimator: "Difference of means with a 95% randomization-based interval",
    exclusions: [], diagnostics: ["Check assignment records, missing outcomes by arm and contamination; retain original groups."] };
}
function requestFor(root, exchangeId) {
  const event = store.readJournal(root).events.find(item => item.payload.exchange?.exchange_id === exchangeId);
  const payload = structuredClone(event.payload);
  // Reconstruct this fixture's original submission, before the utility adds
  // its display locator. A production caller retains its original request.
  for (const option of payload.exchange.response.next_steps) delete option.scope_file;
  return { event_id: event.event_id, expected_project_id: event.project_id, expected_last_event_id: event.previous_event_id,
    type: event.type, payload };
}

test("v5 preserves the complete protected action while exposing one public scope and its exact saved plan", t => {
  const root = project(t), offer = f.prepareScope(root, plan(), { renderer: "lead-markdown-v5" });
  const req = requestFor(root, offer.exchange_ref);
  const receipt = store.record(root, req);
  assert.equal(receipt.renderer, "lead-markdown-v5");
  assert.equal(receipt.response_file_written, true);
  const relative = "scopes/" + offer.scope.scope_id + "/scope.json";
  assert.deepEqual(receipt.scope_paths, [relative]);
  assert.equal(fs.readFileSync(path.join(root, relative), "utf8"), canonical(offer.scope) + "\n");
  for (const value of Object.values(offer.scope.public_scope).flat()) assert.ok(receipt.rendered_response.includes(value));
  assert.ok(receipt.rendered_response.includes("[Full saved scope](<" + path.join(root, relative).replace(/\\/g, "/") + ">)"));
  assert.ok(!receipt.rendered_response.includes("estimand:"));
  assert.ok(!receipt.rendered_response.includes("[I want to know]"));
  const accepted = f.acceptScope(root, offer);
  assert.throws(() => runs.start(root, { ...f.ids(root, "event-wrong-plan"), run_id: "run-wrong", plan: { ...accepted, estimator: "Different estimator" } }), { code: "SCOPE_MISMATCH" });
  assert.equal(runs.start(root, { ...f.ids(root, "event-start"), run_id: "run-analysis", plan: accepted }).ok, true);
});

test("a fresh compact offer cannot link to a different project's plan", t => {
  const root = project(t), offer = f.prepareScope(root, plan(), { renderer: "lead-markdown-v5" });
  const saved = requestFor(root, offer.exchange_ref);
  const it = f.interpret(root, "bad-link", { kind: "lead_only", scope: "Offer the current work", reason: "Await a choice." });
  const response = structuredClone(saved.payload.exchange.response);
  response.next_steps[0].scope_file = path.join(root, "other-project", "scopes", offer.scope.scope_id, "scope.json").replace(/\\/g, "/");
  assert.throws(() => f.exchange(root, it, "bad-link", response), { code: "SCOPE_MISMATCH" });
});

test("v5 retains actual questions and findings without compulsory empty sections", t => {
  const root = project(t), it = f.interpret(root, "stop", { kind: "lead_only", scope: "End this consultation", reason: "The user asks to stop." });
  const receipt = f.exchange(root, it, "stop", { status: "We can stop here.", questions: [], next_steps: [] }, [], "lead-markdown-v5");
  assert.equal(receipt.rendered_response, "We can stop here.");
  const outgoing = { renderer: "lead-markdown-v5", response: { status: "The accepted analysis is complete.",
    user_questions: [{ text: "Does it estimate attendance?", answer: "It estimates the effect of the offer." }],
    findings: { summary: "The offer effect is uncertain.", diagnostics: ["Missing outcomes remain balanced."], limitations: ["Study cohort only."] },
    questions: [{ text: "Is the capacity note available?", why: "It determines which policy is feasible.", needed: "The actual allocation limit." }], next_steps: [] } };
  const rendered = renderExchange(outgoing);
  for (const value of ["Does it estimate attendance?", "The offer effect is uncertain.", "Study cohort only.", "The actual allocation limit."]) assert.equal(rendered.split(value).length - 1, 1);
  assert.equal(rendered, renderExchange(JSON.parse(canonical(outgoing))));
});

test("a saved scope export can be regenerated, while conflicting bytes prevent a ready-to-deliver receipt", t => {
  const root = project(t), offer = f.prepareScope(root, plan(), { renderer: "lead-markdown-v5" }), req = requestFor(root, offer.exchange_ref);
  const file = path.join(root, "scopes", offer.scope.scope_id, "scope.json");
  const original = fs.readFileSync(file), journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  fs.unlinkSync(file);
  assert.equal(store.record(root, req).response_file_written, true);
  assert.deepEqual(fs.readFileSync(file), original);
  fs.writeFileSync(file, "{}\n");
  const failed = store.record(root, req);
  assert.equal(failed.replayed, true);
  assert.equal(failed.response_file_written, false);
  assert.match(failed.response_file_error, /Retained message bytes differ/);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
});

test("a relocated project's historical reply remains exact but is not ready to re-emit with its old scope link", t => {
  const original = project(t), offer = f.prepareScope(original, plan(), { renderer: "lead-markdown-v5" }), req = requestFor(original, offer.exchange_ref);
  const relocated = project(t);
  const bytes = fs.readFileSync(path.join(original, "journal.jsonl"));
  fs.writeFileSync(path.join(relocated, "journal.jsonl"), bytes);
  assert.doesNotThrow(() => store.readJournal(relocated));
  const receipt = store.record(relocated, req);
  assert.equal(receipt.replayed, true);
  assert.equal(receipt.rendered_response, offer.rendered_response);
  assert.equal(receipt.response_file_written, false);
  assert.match(receipt.response_file_error, /original scope link/);
  assert.deepEqual(fs.readFileSync(path.join(relocated, "journal.jsonl")), bytes);
});

test("source preflight rejects missing or changed inputs before an offer but does not break historical replay or exact retry", t => {
  const root = project(t), file = path.join(root, "input.csv");
  fs.writeFileSync(file, "id,score\n1,4\n");
  const proposed = plan(); proposed.inputs = [{ source_ref: "input.csv", path: "input.csv", sha256: sha256(fs.readFileSync(file)) }];
  const offer = f.prepareScope(root, proposed, { renderer: "lead-markdown-v5" }), req = requestFor(root, offer.exchange_ref);
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  fs.unlinkSync(file);
  assert.doesNotThrow(() => store.readJournal(root));
  assert.equal(store.record(root, req).replayed, true);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
  const it = f.interpret(root, "reoffer", { kind: "lead_only", scope: "Review current scope", reason: "Check current source availability." });
  assert.throws(() => f.exchange(root, it, "missing", req.payload.exchange.response), { code: "ENOENT" });
  fs.writeFileSync(file, "id,score\n1,9\n");
  assert.throws(() => f.exchange(root, it, "changed", req.payload.exchange.response), { code: "INPUT_CHANGED" });
});

test("a frozen evaluation can be accepted when its held-out file arrives, without another approval", t => {
  const root = project(t), proposed = plan();
  proposed.inputs = [{ source_ref: "evaluation.csv", path: "evaluation.csv", deferred_release: true }];
  const offer = f.prepareScope(root, proposed);
  const accepted = f.acceptScope(root, offer, { user_text: "The evaluation file is attached; run the saved plan once." });
  const selection = { scope_ref: accepted.scope_ref, interpretation_ref: accepted.interpretation_ref,
    authorization_ref: accepted.authorization_ref };
  const request = { ...f.ids(root, "event-unreleased"), run_id: "run-unreleased", ...selection };
  assert.throws(() => runs.start(root, request), { code: "ENOENT" });
  assert.equal(fs.existsSync(path.join(root, "runs", "run-unreleased")), false);
  fs.writeFileSync(path.join(root, "evaluation.csv"), "id,score\n1,4\n");
  assert.throws(() => runs.start(root, { ...f.ids(root, "event-changed-plan"), run_id: "run-changed-plan",
    plan: { ...accepted, estimator: "Choose a new rule after inspecting outcomes" } }), { code: "SCOPE_MISMATCH" });
  const result = runs.start(root, { ...f.ids(root, "event-evaluation"), run_id: "run-evaluation", ...selection });
  const frozen = JSON.parse(fs.readFileSync(path.join(root, "runs", "run-evaluation", "plan.yaml"), "utf8"));
  assert.equal(frozen.inputs[0].source_sha256, sha256(fs.readFileSync(path.join(root, "evaluation.csv"))));
  assert.equal(frozen.inputs[0].snapshot_sha256, frozen.inputs[0].source_sha256);
  assert.equal(result.inputs.length, 1);
  assert.equal(f.state(root).action_decisions.length, 1);
});

test("a deferred input cannot bypass offer-time hashes for a file already available", t => {
  const root = project(t), proposed = plan();
  fs.writeFileSync(path.join(root, "evaluation.csv"), "id,score\n1,4\n");
  proposed.inputs = [{ source_ref: "evaluation.csv", path: "evaluation.csv", deferred_release: true }];
  assert.throws(() => f.prepareScope(root, proposed), { code: "UNBOUND_SCOPE_INPUT" });
  assert.equal(f.state(root).exchanges.length, 0);
});

test("a report scope with a review ID masquerading as evidence is rejected before presentation", t => {
  const root = project(t), source = "source-study";
  f.record(root, "memory_updated", { changes: { evidence: [f.statement(source, "A study protocol is available.")] } }, "event-source");
  const review = f.findingReview(root, [source], "source-review");
  const proposed = { kind: "report", objective: "Explain the source review", claim_boundary: "Design evidence only", inputs: [],
    purpose: "Explain the available evidence and its limits", evidence_refs: [review], format: "Markdown" };
  const before = f.state(root).exchanges.length;
  assert.throws(() => f.prepareScope(root, proposed, { findings_refs: [review] }), { code: "UNKNOWN_REFERENCE" });
  assert.equal(f.state(root).exchanges.length, before);
  assert.equal(f.state(root).action_scopes.length, 0);
});
