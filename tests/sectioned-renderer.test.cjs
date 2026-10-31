"use strict";
// Synthetic captures exercise saved output and reply binding, not host emission.
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const { renderExchange, RENDERER } = require("../scripts/lib/exchanges.cjs");
const { sha256 } = require("../scripts/lib/files.cjs");
const store = require("../scripts/lib/store.cjs"), author = require("../scripts/lib/authoring.cjs");
const runs = require("../scripts/lib/runs.cjs"), f = require("./fixtures/consultation-loop.cjs");
const historicalV8 = require("./fixtures/historical-v8-renderers.json");

function project(t) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-sectioned-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("cc-sectioned-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  store.init(root, { project_id: "sectioned", event_id: "event-init" });
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

test("historical v8 retains response bytes and hashes pinned from the audited v7.5.2 source", () => {
  assert.equal(historicalV8.source_sha256, "83e261afcae2092da960622de3100d6cb6d0eb22ded9005f5efcb48e6b70515e");
  for (const fixture of historicalV8.cases) {
    const rendered = renderExchange(fixture.exchange);
    assert.equal(rendered, fixture.text);
    assert.equal(sha256(rendered), fixture.sha256);
  }
});

test("historical v8 has four ordered sections with flat numbering, preserving each question and findings item", () => {
  const exchange = { renderer: "lead-markdown-v8", response: {
    user_questions: [
      { question_ref: "question-population", text: "Does the result generalize?", answer: "Only to the studied cohort.", echo_question: true },
      { question_ref: "question-uncertainty", text: "Is the estimate precise?", answer: "The interval remains wide." }
    ],
    status: "The assignment record has been reviewed.",
    findings: { summary: "The estimate is positive but uncertain.", diagnostics: ["Checked outcome timing.", "Checked missingness."], limitations: ["Study cohort only.", "No attendance effect."] },
    questions: [
      { question_ref: "question-note", text: "Is the allocation note available?", why: "It resolves the remaining uncertainty.", needed: "The dated note." },
      { question_ref: "question-codebook", text: "Can you share the existing codebook?" }
    ],
    next_steps: [
      { option_id: "explain", label: "Explain the conditional finding", actor: "consultant", scope: "Discuss its limit." },
      { option_id: "pause", label: "Pause", actor: "user", scope: "Return when the source is available." }
    ]
  } };
  const original = structuredClone(exchange);
  const expected = [
    "[Answers to your questions]", "[1] Does the result generalize?", "Only to the studied cohort.", "[2] The interval remains wide.",
    "[What has been done]", "[1] The assignment record has been reviewed.", "[2] The estimate is positive but uncertain.",
    "Checks: Checked outcome timing.; Checked missingness.", "Limits: Study cohort only.; No attendance effect.",
    "[Questions for you]", "[1] Is the allocation note available?", "It resolves the remaining uncertainty.", "The dated note.", "[2] Can you share the existing codebook?",
    "[Next steps]", "[1] Explain the conditional finding", "Discuss its limit.", "[2] Pause", "user: Return when the source is available."
  ].join("\n\n");
  const rendered = renderExchange(exchange);
  assert.equal(RENDERER, "lead-markdown-v10");
  assert.equal(rendered, expected);
  assert.deepEqual([...rendered.matchAll(/^\[(\d+)\] /gm)].map(match => match[1]), ["1", "2", "1", "2", "1", "2", "1", "2"]);
  assert.doesNotMatch(rendered, /^(?:[ \t]+\S|[-*+]\s|\d+[.)]\s)/m, "The renderer must not generate another list level.");
  assert.deepEqual(exchange, original, "Rendering must preserve the saved field values, IDs and array order.");
});

test("historical v8 omits empty sections and keeps a short reply in its populated section", () => {
  const render = response => renderExchange({ renderer: "lead-markdown-v8", response: { questions: [], next_steps: [], ...response } });
  assert.equal(render({ status: "Paused.", questions_none: "No question.", next_steps_none: "No action." }), "[What has been done]\n\n[1] Paused.");
  assert.equal(render({ user_questions: [{ text: "What is identified?", answer: "The offer effect." }] }), "[Answers to your questions]\n\n[1] The offer effect.");
  assert.equal(render({ questions: [{ text: "Is the dated source available?" }] }), "[Questions for you]\n\n[1] Is the dated source available?");
  assert.equal(render({ findings: { summary: "The estimate is uncertain.", diagnostics: [], limitations: ["Small study."] } }), "[What has been done]\n\n[1] The estimate is uncertain.\n\nLimits: Small study.");
});

test("historical v8 keeps double-digit items flat and restarts numbering in the next section", () => {
  const response = { questions: Array.from({ length: 12 }, (_, index) => ({ question_ref: "question-" + index, text: "Source detail " + (index + 1) + "?" })),
    next_steps: [{ option_id: "discuss", label: "Discuss the available evidence", actor: "consultant", scope: "Retain its qualifications." }] };
  const before = structuredClone(response);
  const rendered = renderExchange({ renderer: "lead-markdown-v8", response });
  assert.ok(rendered.includes("\n\n[10] Source detail 10?\n\n[11] Source detail 11?\n\n[12] Source detail 12?"));
  assert.ok(rendered.includes("\n\n[Next steps]\n\n[1] Discuss the available evidence\n\nRetain its qualifications."));
  assert.doesNotMatch(rendered, /^[ \t]+\S/m);
  assert.deepEqual(response, before);
});

test("historical v8 protected options preserve terms, equations and selection through export, capture and recovery", t => {
  const root = project(t);
  const firstPlan = plan("All randomized participants");
  firstPlan.claim_boundary += ".\n\n$$\\tau = E[Y(1)-Y(0)]$$\nKeep the 95% interval and two-year horizon.";
  const first = f.prepareScope(root, firstPlan, { renderer: "lead-markdown-v8" });
  const second = f.prepareScope(root, plan("Randomized participants in the prespecified age stratum"), { renderer: "lead-markdown-v8" });
  const interpretation = f.interpret(root, "both", direct);
  const receipt = f.exchange(root, interpretation, "both", { status: "Choose the population for the next analysis.", questions: [],
    next_steps: [first, second].map((offer, index) => ({ option_id: index ? "age-stratum" : "all-participants", kind: "action", actor: "consultant",
      label: index ? "Estimate the prespecified stratum" : "Estimate the whole cohort", scope: index ? "Answer the narrower question." : "Answer the original question.",
      basis_refs: [], scope_ref: offer.scope.scope_id })) }, [], "lead-markdown-v8");
  assert.equal(receipt.response_file_written, true);
  assert.match(receipt.rendered_response, /^\[What has been done\]\n\n\[1\] /);
  assert.match(receipt.rendered_response, /\n\n\[Next steps\]\n\n\[1\] Estimate the whole cohort/);
  assert.ok(receipt.rendered_response.indexOf("[1] Estimate the whole cohort") < receipt.rendered_response.indexOf("[2] Estimate the prespecified stratum"));
  assert.doesNotMatch(receipt.rendered_response, /^(?:[ \t]+\S|[-*+]\s|\d+[.)]\s)/m);
  for (const offer of [first, second]) {
    for (const term of Object.values(offer.scope.public_scope).flat()) assert.ok(receipt.rendered_response.includes(term), term);
    const link = path.join(root, "scopes", offer.scope.scope_id, "scope.json").replace(/\\/g, "/");
    assert.ok(receipt.rendered_response.includes("[Full saved scope](<" + link + ">)"));
    assert.deepEqual(JSON.parse(fs.readFileSync(link, "utf8")), offer.scope);
  }
  assert.equal(fs.readFileSync(path.join(root, receipt.response_path), "utf8"), receipt.rendered_response);
  const delivery_ref = f.deliver(root, receipt.exchange_id, "both");
  const captured = f.state(root).deliveries.find(item => item.delivery_id === delivery_ref);
  assert.equal(captured.observed_response_sha256, receipt.response_sha256);
  assert.equal(fs.readFileSync(path.join(root, captured.source_ref), "utf8"), receipt.rendered_response);
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  store.recover(root);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  const loaded = store.readJournal(root), saved = loaded.events.find(event => event.payload.exchange?.exchange_id === receipt.exchange_id).payload.exchange;
  assert.deepEqual(saved.response.next_steps.map(item => item.option_id), ["all-participants", "age-stratum"]);
  assert.equal(renderExchange(saved), receipt.rendered_response);
  const actual = store.context(root, { mode: "brief" }).brief.recent_intakes.flatMap(item => item.actual_messages)
    .find(message => message.observations.some(item => item.delivery_id === delivery_ref));
  assert.equal(actual.captures[0].text, receipt.rendered_response);
  assert.equal(actual.observations[0].binding_compatible, true);
  const accepted = f.acceptScope(root, { ...second, exchange_ref: receipt.exchange_id, option_id: "age-stratum", delivery_ref },
    { user_text: "Proceed with [2] under Next steps, the prespecified age stratum." });
  assert.deepEqual(f.state(root).action_decisions.filter(item => item.disposition === "accept").map(item => item.scope_ref), [second.scope.scope_id]);
  assert.throws(() => runs.start(root, { ...f.ids(root, "event-wrong-scope"), run_id: "wrong", plan: { ...accepted, scope_ref: first.scope.scope_id } }),
    error => ["SCOPE_MISMATCH", "INVALID_AUTHORIZATION", "ASSIGNMENT_MISMATCH"].includes(error.code));
  assert.equal(runs.start(root, { ...f.ids(root, "event-selected-start"), run_id: "selected", plan: accepted }).ok, true);
});

test("historical v7 retains the bytes and hash captured before the sectioned renderer", () => {
  const exchange = { renderer: "lead-markdown-v7", response: {
    user_questions: [{ text: "Does the offer identify attendance?", answer: "Only the randomized offer contrast is identified.", echo_question: false }],
    status: "The assignment record has been reviewed.", findings: { summary: "The estimate remains uncertain.", diagnostics: ["Checked outcome timing."], limitations: ["Study cohort only."] },
    questions: [{ text: "Is the allocation note available?", why: "It resolves the remaining uncertainty.", needed: "The dated note." }],
    next_steps: [{ label: "Explain the conditional finding", actor: "consultant", scope: "Discuss its limit." },
      { label: "Pause", actor: "user", scope: "Return when the source is available." }]
  } };
  const expected = "Only the randomized offer contrast is identified.\n\nThe assignment record has been reviewed.\n\nThe estimate remains uncertain.\n\nChecks: Checked outcome timing.\n\nLimits: Study cohort only.\n\nIs the allocation note available?\n\nIt resolves the remaining uncertainty.\n\nThe dated note.\n\nOption 1: Explain the conditional finding\n\nDiscuss its limit.\n\nOption 2: Pause\n\nuser: Return when the source is available.";
  const rendered = renderExchange(exchange);
  assert.equal(rendered, expected);
  assert.equal(sha256(rendered), "8a79ce3700c8d49ba9baa6cb5add5c633197079bbc29745225fd7b7958c03ec2");
});

test("a pre-upgrade submit retry with omitted renderer retains v7 and its captured reply", t => {
  const root = project(t), interpretation = f.interpret(root, "old-submit", direct);
  const input = { at: store.context(root, { mode: "brief" }).state_token, op: "exchange_prepared",
    exchange: { turn_id: interpretation.turn_id, interpretation_ref: interpretation.interpretation_id, basis_refs: [], completed_work_refs: [],
      reconciliation: { changes: [], limitations: [], unresolved: [], next_direction: "Wait for the user." },
      response: { status: "The conclusion remains conditional.", questions: [], next_steps: [] } } };
  const oldRequest = author.build(input).request;
  oldRequest.payload.exchange.renderer = "lead-markdown-v7";
  const committed = store.record(root, oldRequest);
  const delivery_ref = f.deliver(root, committed.exchange_id, "old-submit");
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  const retry = author.submit(root, input);
  assert.equal(retry.replayed, true);
  assert.equal(retry.renderer, "lead-markdown-v7");
  assert.equal(retry.rendered_response, "The conclusion remains conditional.");
  assert.equal(retry.response_sha256, committed.response_sha256);
  assert.equal(f.state(root).deliveries.find(item => item.delivery_id === delivery_ref).observed_response_sha256, retry.response_sha256);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  assert.equal(author.build({ ...input, at: store.context(root, { mode: "brief" }).state_token }).request.payload.exchange.renderer, "lead-markdown-v10");
});
