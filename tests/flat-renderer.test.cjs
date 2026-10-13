"use strict";
// These synthetic captures test binding and replay, not real host emission.
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const { renderExchange } = require("../scripts/lib/exchanges.cjs");
const FLAT_RENDERER = "lead-markdown-v7";
const { sha256 } = require("../scripts/lib/files.cjs");
const store = require("../scripts/lib/store.cjs"), author = require("../scripts/lib/authoring.cjs");
const runs = require("../scripts/lib/runs.cjs"), f = require("./fixtures/consultation-loop.cjs");
const historical = require("./fixtures/historical-renderers.json");

function project(t) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-flat-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("cc-flat-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  store.init(root, { project_id: "flat", event_id: "event-init" });
  return root;
}
const direct = { kind: "lead_only", scope: "Discuss the supported routes.", reason: "The user chooses the next direction." };
function plan(population) {
  return { kind: "analysis", objective: "Estimate the randomized offer effect in " + population,
    target: "Mean next-term score effect of an offer versus no offer", population,
    claim_boundary: "Offer effect only; no attendance effect or generalization beyond " + population,
    inputs: [], treatment: "Offer", comparator: "No offer", outcome: "Next-term score", timing: "Next term",
    estimand: "Intention-to-treat average effect", design_id: "randomized_assignment",
    estimator: "Difference of means with a 95% randomization-based interval", exclusions: [],
    diagnostics: ["Check assignment and missing outcomes by arm."] };
}

test("v1 through v6 retain bytes and hashes pinned from the v7.5.0 baseline", () => {
  for (const fixture of historical.cases) {
    const actual = renderExchange(fixture.exchange);
    assert.equal(actual, fixture.text, fixture.exchange.renderer);
    assert.equal(sha256(actual), fixture.sha256, fixture.exchange.renderer);
  }
});

test("historical v7 flat protected options retain terms, links, order and the selected scope", t => {
  const root = project(t);
  const first = f.prepareScope(root, plan("All randomized participants"), { renderer: FLAT_RENDERER });
  const second = f.prepareScope(root, plan("Randomized participants in the prespecified age stratum"), { renderer: FLAT_RENDERER });
  const interpretation = f.interpret(root, "both", direct);
  const response = { questions: [], next_steps: [first, second].map((offer, index) => ({
    option_id: index ? "age-stratum" : "all-participants", kind: "action", actor: "consultant",
    label: index ? "Estimate the prespecified stratum" : "Estimate the whole cohort (recommended)",
    scope: index ? "Answer the narrower stratum question." : "Answer the original cohort question.",
    basis_refs: [], scope_ref: offer.scope.scope_id
  })) };
  const receipt = f.exchange(root, interpretation, "both", response, [], FLAT_RENDERER);
  assert.equal(receipt.renderer, "lead-markdown-v7");
  assert.ok(receipt.rendered_response.indexOf("Option 1:") < receipt.rendered_response.indexOf("Option 2:"));
  assert.doesNotMatch(receipt.rendered_response, /^ +\S/m);
  for (const offer of [first, second]) {
    for (const term of Object.values(offer.scope.public_scope).flat()) assert.ok(receipt.rendered_response.includes(term), term);
    const link = path.join(root, "scopes", offer.scope.scope_id, "scope.json").replace(/\\/g, "/");
    assert.ok(receipt.rendered_response.includes("[Full saved scope](<" + link + ">)"));
    assert.equal(fs.existsSync(link), true);
  }
  const saved = store.readJournal(root).events.find(item => item.payload.exchange?.exchange_id === receipt.exchange_id).payload.exchange;
  assert.deepEqual(saved.response.next_steps.map(item => item.option_id), ["all-participants", "age-stratum"]);
  const delivery_ref = f.deliver(root, receipt.exchange_id, "both");
  const accepted = f.acceptScope(root, { ...second, exchange_ref: receipt.exchange_id, option_id: "age-stratum", delivery_ref },
    { user_text: "Proceed with option 2, the prespecified age stratum." });
  assert.deepEqual(f.state(root).action_decisions.filter(item => item.disposition === "accept").map(item => item.scope_ref), [second.scope.scope_id]);
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(() => runs.start(root, { ...f.ids(root, "event-wrong-scope"), run_id: "wrong", plan: { ...accepted, scope_ref: first.scope.scope_id } }),
    error => ["SCOPE_MISMATCH", "INVALID_AUTHORIZATION", "ASSIGNMENT_MISMATCH"].includes(error.code));
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  assert.equal(runs.start(root, { ...f.ids(root, "event-selected-start"), run_id: "selected", plan: accepted }).ok, true);
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  store.recover(root);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
  assert.equal(fs.readFileSync(path.join(root, receipt.response_path), "utf8"), receipt.rendered_response);
});

test("historical v7 flat rendering preserves multiline conditions and equations across more than two options", () => {
  const exchange = structuredClone(historical.cases.at(-1).exchange);
  exchange.renderer = FLAT_RENDERER;
  exchange.response.next_steps[0].proposal.claim_boundary = "Conditional on transport.\n\n$$\\tau = E[Y(1)-Y(0)]$$\nKeep the 95% interval and two-year horizon.";
  const original = structuredClone(exchange);
  exchange.response.next_steps.push(...Array.from({ length: 10 }, (_, index) => ({
    option_id: "discussion-" + index, kind: "discussion", label: "Discussion " + index, actor: "consultant",
    scope: "Discuss the corresponding interpretation.", basis_refs: []
  })));
  const rendered = renderExchange(exchange);
  assert.ok(rendered.includes(original.response.next_steps[0].proposal.claim_boundary));
  assert.ok(rendered.includes("Option 10: Discussion 7"));
  assert.ok(rendered.includes("Option 12: Discussion 9"));
  assert.deepEqual(exchange.response.next_steps[0], original.response.next_steps[0]);
});

test("v6 optional status and ordered options still validate, export and retry independently of the new default", t => {
  const root = project(t), interpretation = f.interpret(root, "old", direct);
  const response = { questions: [], next_steps: [{ option_id: "discuss", kind: "discussion", label: "Discuss interpretation", actor: "consultant",
    scope: "Explain the conditional claim.", basis_refs: [] }] };
  const receipt = f.exchange(root, interpretation, "old", response, [], "lead-markdown-v6");
  assert.equal(receipt.rendered_response, "1. Discuss interpretation\n\n   Explain the conditional claim.");
  const event = store.readJournal(root).events.find(item => item.event_id === receipt.last_event_id);
  const request = { event_id: event.event_id, expected_project_id: event.project_id, expected_last_event_id: event.previous_event_id,
    type: event.type, payload: event.payload };
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  const retry = store.record(root, request);
  assert.equal(retry.replayed, true);
  assert.equal(retry.response_sha256, receipt.response_sha256);
  store.recover(root);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
});

test("an exact pre-upgrade submit retry with an omitted renderer retains v6 while new submissions default to v10", t => {
  const root = project(t), interpretation = f.interpret(root, "old-submit", direct);
  const input = { at: store.context(root, { mode: "brief" }).state_token, op: "exchange_prepared",
    exchange: { turn_id: interpretation.turn_id, interpretation_ref: interpretation.interpretation_id, basis_refs: [], completed_work_refs: [],
      reconciliation: { changes: [], limitations: [], unresolved: [], next_direction: "Wait for the user." },
      response: { status: "The conclusion remains conditional.", questions: [], next_steps: [] } } };
  const oldRequest = author.build(input).request;
  oldRequest.payload.exchange.renderer = "lead-markdown-v6";
  const committed = store.record(root, oldRequest);
  f.record(root, "memory_updated", { changes: { evidence: [f.statement("later", "An unrelated note.")] } }, "event-later");
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  const retry = author.submit(root, input);
  assert.equal(retry.replayed, true);
  assert.equal(retry.renderer, "lead-markdown-v6");
  assert.equal(retry.response_sha256, committed.response_sha256);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  assert.equal(author.build({ ...input, at: store.context(root, { mode: "brief" }).state_token }).request.payload.exchange.renderer, "lead-markdown-v10");
});
