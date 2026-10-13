"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/store.cjs"), runs = require("../scripts/lib/runs.cjs");
const policy = require("../scripts/lib/authorizations.cjs"), { sha256 } = require("../scripts/lib/files.cjs");
const { PROTOCOL, RENDERER, renderExchange } = require("../scripts/lib/exchanges.cjs");
const f = require("./fixtures/consultation-loop.cjs");

function project(t) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-concise-"));
  t.after(() => { assert.equal(path.dirname(fs.realpathSync.native(root)), base); assert.ok(path.basename(root).startsWith("cc-concise-")); fs.rmSync(root, { recursive: true, force: true }); });
  store.init(root, { project_id: "project-concise", event_id: "event-init" });
  return root;
}
function request(root, event_id, payload, type = "memory_updated") { return { ...f.ids(root, event_id), type, payload }; }
function reject(root, code, action) {
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(action, { code }); assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
}
function proposal(t) {
  const root = project(t);
  const it = f.interpret(root, "proposal", { kind: "lead_only", scope: "Offer a bounded trial analysis.", reason: "The user can select concrete terms." });
  fs.writeFileSync(path.join(root, "trial.csv"), "offer,score\n1,4\n0,3\n");
  f.record(root, "memory_updated", { changes: {
    evidence: [{ evidence_id: "data", kind: "file", source_ref: "trial.csv", summary: "Synthetic offer trial; attendance is optional." }],
    assumptions: [{ assumption_id: "assumption-outcome", status: "active", statement: "Outcome missingness does not depend on unobserved potential scores, conditional on baseline.", basis_refs: ["data"] }],
    result_conditions: [{ condition_id: "condition-source", evidence_ref: "data", result_locator: "Source scope", claim: "Synthetic trial supports a within-sample offer comparison.", target: "Trial population", assumption_refs: ["assumption-outcome"], basis_refs: ["data"], limitations: ["No real deployment or attendance effect is established."] }],
    decisions: [{ decision_id: "target", kind: "target", status: "current", statement: "Estimate the offer effect on one-year score in the synthetic trial.", basis_refs: ["data", ...it.incoming_refs] }]
  } }, "event-basis");
  const plan = { kind: "analysis", objective: "Estimate the offer effect", claim_boundary: "Synthetic randomized sample; effect of offer, not attendance", inputs: [{ source_ref: "data", path: "trial.csv", sha256: sha256(fs.readFileSync(path.join(root, "trial.csv"))) }], target: "Offer ATE", population: "Trial population", treatment: "Offer", comparator: "No offer", outcome: "Score", timing: "One year", estimand: "Mean difference", design_id: "randomized_assignment", estimator: "Difference of means", exclusions: [], diagnostics: ["Missingness", "Balance"] };
  const assignment = { specialist_id: "design_worker", operation: "execution", design_id: plan.design_id };
  const scope = { scope_id: "scope-analysis", action: "analysis", assignment, public_scope: { target: plan.target, population: plan.population, evidence: "Synthetic offer trial", approach: plan.estimator, checks: plan.diagnostics, outputs: "Estimate, interval and diagnostics", claim_boundary: plan.claim_boundary }, execution_plan: plan,
    basis_versions: policy.requiredBasisRefs(f.state(root), ["target", "data"], { current: true }).map(ref => ({ ref, event_ref: f.state(root).history_index[ref].event_ref })), findings_refs: [] };
  const exchange = { exchange_id: "exchange-proposal", turn_id: it.turn_id, interpretation_ref: it.interpretation_id, basis_refs: ["target", "data"], completed_work_refs: [], renderer: RENDERER,
    reconciliation: { changes: ["The target and source are established."], limitations: [plan.claim_boundary], unresolved: [], next_direction: "The user may choose this analysis or discuss its terms." },
    response: { status: "Here is the bounded analysis you can choose.", questions: [], next_steps: [{ option_id: "analyze", kind: "action", actor: "consultant", label: "Run the offer comparison", scope: "Execute the displayed terms.", basis_refs: ["target", "data"], scope_ref: scope.scope_id, assignment, proposal: scope.public_scope, execution_plan: plan }] } };
  return { root, it, scope, exchange };
}
function input(env, concise = true, event = "event-offer") {
  const value = request(env.root, event, { protocol: PROTOCOL, changes: { action_scopes: [structuredClone(env.scope)] }, exchange: structuredClone(env.exchange) }, "exchange_prepared");
  if (concise) {
    delete value.payload.changes.action_scopes[0].basis_versions;
    value.payload.changes.action_scopes[0].basis_refs = ["target", "data"];
    for (const key of ["proposal", "execution_plan", "assignment"]) delete value.payload.exchange.response.next_steps[0][key];
  }
  return value;
}
function accept(env, options = {}) {
  store.record(env.root, input(env));
  const delivery_ref = f.deliver(env.root, env.exchange.exchange_id, "proposal");
  return f.acceptScope(env.root, { scope: env.scope, exchange_ref: env.exchange.exchange_id, option_id: "analyze", delivery_ref }, { suffix: "accepted", ...options });
}
function startInput(root, plan, event = "event-start", run = "run-analysis") {
  return { ...f.ids(root, event), run_id: run, ...Object.fromEntries(["scope_ref", "interpretation_ref", "authorization_ref"].map(key => [key, plan[key]])) };
}

test("concise scope and offer expand to the full canonical payload and exact public bytes", t => {
  const env = proposal(t), submitted = input(env), before = structuredClone(submitted);
  const receipt = store.record(env.root, submitted);
  const payload = store.readJournal(env.root).events.at(-1).payload;
  const expected = input(env, false).payload;
  // Use the utility's established export locator, not a new authoring-only field.
  expected.exchange.response.next_steps[0].scope_file = path.resolve(env.root, require("../scripts/lib/exchanges.cjs").scopePath(env.scope.scope_id)).replace(/\\/g, "/");
  assert.deepEqual(submitted, before); assert.deepEqual(payload, expected);
  assert.equal(receipt.rendered_response, renderExchange(expected.exchange));
  assert.ok(payload.changes.action_scopes[0].basis_versions.some(binding => binding.ref === "condition-source"));
  assert.ok(payload.changes.action_scopes[0].basis_versions.some(binding => binding.ref === "assumption-outcome"));
  assert.ok(payload.changes.action_scopes[0].basis_versions.some(binding => binding.ref === "user-proposal"));
  assert.equal(JSON.stringify(payload).includes('"patch"'), false);
  assert.equal(Object.hasOwn(payload.changes.action_scopes[0], "basis_refs"), false);
  assert.ok(store.capabilities().capabilities.includes("concise-authoring-v1"));
});

test("offer references also expand already committed scopes; explicit conflicts and older renderers are not repaired", t => {
  const env = proposal(t); f.record(env.root, "memory_updated", { changes: { action_scopes: [env.scope] } }, "event-scope");
  const value = input(env); delete value.payload.changes;
  for (const [key, wrong] of [["proposal", { ...env.scope.public_scope, population: "Everyone" }], ["execution_plan", { ...env.scope.execution_plan, outcome: "Another outcome" }], ["assignment", { specialist_id: "data_audit", operation: "review" }]]) {
    const bad = structuredClone(value); bad.payload.exchange.response.next_steps[0][key] = wrong;
    reject(env.root, "SCOPE_MISMATCH", () => store.record(env.root, bad));
  }
  const historical = structuredClone(value); historical.payload.exchange.renderer = "lead-markdown-v4";
  reject(env.root, "INVALID_INPUT", () => store.record(env.root, historical));
  store.record(env.root, value);
});

test("scope roots cannot be missing, mixed, changing, superseded, or silently repair explicit bindings", t => {
  const env = proposal(t);
  for (const [change, code] of [
    [value => value.payload.changes.action_scopes[0].basis_refs.push("missing"), "STALE_SCOPE"],
    [value => value.payload.changes.action_scopes[0].basis_versions = env.scope.basis_versions, "INVALID_INPUT"],
    [value => value.payload.changes.evidence = [{ evidence_id: "data", patch: { summary: "Revised source interpretation." } }], "STALE_SCOPE"],
    [value => value.payload.changes.evidence = [{ evidence_id: "data-new", kind: "file", source_ref: "trial.csv", summary: "A replacement source.", supersedes: "data" }], "STALE_SCOPE"],
    [value => { value.payload.changes.action_scopes[0].basis_refs = ["new-target"]; value.payload.changes.decisions = [{ decision_id: "new-target", kind: "target", status: "current", statement: "A different target.", basis_refs: ["data"] }]; }, "STALE_SCOPE"],
    [value => value.payload.changes.action_scopes[0].basis_refs = ["data"], "MISSING_TARGET_BINDING"]
  ]) { const value = input(env); change(value); reject(env.root, code, () => store.record(env.root, value)); }
  const explicit = input(env, false); explicit.payload.changes.action_scopes[0].basis_versions = explicit.payload.changes.action_scopes[0].basis_versions.filter(binding => binding.ref !== "condition-source");
  reject(env.root, "STALE_SCOPE", () => store.record(env.root, explicit));
  f.record(env.root, "memory_updated", { changes: { evidence: [{ evidence_id: "data-new", kind: "file", source_ref: "trial.csv", summary: "A replacement source.", supersedes: "data" }] } }, "event-replacement");
  reject(env.root, "STALE_SCOPE", () => store.record(env.root, input(env)));
});

test("scope and offer retries precede current bindings, source checks and repairs", t => {
  const env = proposal(t), value = input(env), receipt = store.record(env.root, value, { hooks: { afterAppend() { throw new Error("export interrupted"); } } });
  assert.equal(receipt.committed, true); assert.equal(receipt.projection_written, false);
  f.record(env.root, "memory_updated", { changes: { evidence: [{ evidence_id: "data", patch: { summary: "A changed interpretation stales the original scope." } }] } }, "event-change");
  fs.unlinkSync(path.join(env.root, "trial.csv"));
  const retry = store.record(env.root, value); assert.equal(retry.replayed, true); assert.equal(retry.rendered_response, receipt.rendered_response);
  assert.equal(retry.projection_written, true); assert.equal(retry.writing_warnings, undefined);
  reject(env.root, "EVENT_CONFLICT", () => store.record(env.root, input(env, false)));
  const stale = structuredClone(value); stale.event_id = "event-stale"; stale.payload.changes.action_scopes[0].basis_refs = ["missing"];
  reject(env.root, "STALE_WRITE", () => store.record(env.root, stale));
});

test("reference start freezes exactly the accepted plan and retry does not rebind or require external inputs", t => {
  const env = proposal(t), plan = accept(env), value = startInput(env.root, plan), before = structuredClone(value);
  const receipt = runs.start(env.root, value), frozen = JSON.parse(fs.readFileSync(path.join(env.root, receipt.plan_ref), "utf8"));
  assert.deepEqual(value, before);
  const restored = policy.normalizedPlan(frozen);
  restored.inputs = frozen.inputs.map(item => ({ source_ref: item.source_ref, path: item.path, sha256: item.source_sha256 }));
  assert.deepEqual(restored, env.scope.execution_plan);
  f.record(env.root, "memory_updated", { changes: { evidence: [{ evidence_id: "data", patch: { summary: "A new interpretation." } }] } }, "event-later");
  fs.unlinkSync(path.join(env.root, "trial.csv"));
  assert.equal(runs.start(env.root, value).replayed, true);
  reject(env.root, "EVENT_CONFLICT", () => runs.start(env.root, { ...f.ids(env.root, value.event_id), run_id: value.run_id, plan }));
  assert.equal(f.state(env.root).runs.length, 1);
});

test("reference start rejects mixed input, preflight drift, stale heads and paused direction before making a directory", t => {
  const env = proposal(t), plan = accept(env), value = startInput(env.root, plan);
  reject(env.root, "INVALID_INPUT", () => runs.start(env.root, { ...value, plan }));
  const stale = { ...value, expected_last_event_id: "event-init", scope_ref: "missing" };
  reject(env.root, "STALE_WRITE", () => runs.start(env.root, stale));
  fs.appendFileSync(path.join(env.root, "trial.csv"), "1,9\n");
  reject(env.root, "INPUT_CHANGED", () => runs.start(env.root, value));
  assert.equal(fs.existsSync(path.join(env.root, "runs/run-analysis")), false);
  const paused = proposal(t), accepted = accept(paused, { lead_only: true, user_text: "Yes, but explain the outcome assumption first." });
  assert.throws(() => runs.start(paused.root, startInput(paused.root, accepted)), error => ["ASSIGNMENT_MISMATCH", "INVALID_AUTHORIZATION"].includes(error.code));
  assert.equal(fs.existsSync(path.join(paused.root, "runs/run-analysis")), false);
  const direction = f.interpret(paused.root, "resume", { kind: "specialist", scope: "Resume the unchanged accepted analysis.", reason: "The user is ready after the explanation.", assignment: paused.scope.assignment, scope_ref: paused.scope.scope_id, authorization_ref: accepted.authorization_ref });
  runs.start(paused.root, startInput(paused.root, { ...accepted, interpretation_ref: direction.interpretation_id }));
  assert.equal(f.state(paused.root).action_decisions.length, 1);
});

test("a reference start preserves the existing mid-copy orphan behavior", t => {
  const env = proposal(t), plan = accept(env), value = startInput(env.root, plan);
  const original = fs.copyFileSync;
  fs.copyFileSync = (source, destination, flags) => { fs.appendFileSync(source, "0,9\n"); return original(source, destination, flags); };
  try { reject(env.root, "INPUT_CHANGED", () => runs.start(env.root, value)); } finally { fs.copyFileSync = original; }
  assert.equal(f.state(env.root).runs.length, 0); assert.equal(fs.existsSync(path.join(env.root, "runs/run-analysis")), true);
  reject(env.root, "ORPHAN_RUN", () => runs.start(env.root, value));
});

for (const condition of ["closed", "withdrawn", "used", "changed premise"]) test("reference start still rejects " + condition + " permission", t => {
  const env = proposal(t), plan = accept(env);
  if (condition === "closed") f.exchange(env.root, f.state(env.root).interpretations.at(-1), "closed", f.emptyResponse("The accepted work remains unperformed."));
  if (condition === "withdrawn") f.acceptScope(env.root, { scope: env.scope, exchange_ref: env.exchange.exchange_id, option_id: "analyze", delivery_ref: "delivery-proposal" }, { suffix: "withdrawn", disposition: "withdraw", user_text: "Withdraw permission for this analysis." });
  if (condition === "used") runs.start(env.root, startInput(env.root, plan));
  if (condition === "changed premise") f.record(env.root, "memory_updated", { changes: { evidence: [{ evidence_id: "data", patch: { summary: "The source supports a different population." } }] } }, "event-revised-source");
  reject(env.root, condition === "closed" ? "TURN_CLOSED" : "INVALID_AUTHORIZATION", () => runs.start(env.root, startInput(env.root, plan, "event-fresh-start", "run-second")));
  assert.equal(fs.existsSync(path.join(env.root, "runs/run-second")), false);
});

test("a report reference start preserves its discussed evidence bindings", t => {
  const root = project(t);
  f.record(root, "memory_updated", { changes: { evidence: [{ evidence_id: "register", kind: "file", source_ref: "register.md", summary: "A descriptive register; no causal effect established." }] } }, "event-register");
  const plan = f.authorizePlan(root, { kind: "report", objective: "Summarize the source review", claim_boundary: "Descriptive source account only", inputs: [], purpose: "Explain the reviewed register and its limitations", evidence_refs: ["register"], format: "Markdown" });
  const receipt = runs.start(root, startInput(root, plan, "event-report-start", "run-report"));
  const frozen = JSON.parse(fs.readFileSync(path.join(root, receipt.plan_ref), "utf8"));
  assert.equal(frozen.kind, "report"); assert.equal(frozen.evidence_bindings[0].evidence_id, "register");
  assert.equal(frozen.evidence_bindings[0].summary, "A descriptive register; no causal effect established.");
  assert.equal(frozen.authorization_binding.authorization_ref, plan.authorization_ref);
});

function questionCase(t) {
  const root = project(t), source = { ...f.statement("request", "Capacity and offer cost are needed before freezing the rule."), complete_message: true, limitations: ["User account only."] };
  const question = { question_id: "question-capacity", origin: "consultant", statement: "What are the capacity and offer cost?", status: "open", basis_refs: ["request"] };
  f.record(root, "memory_updated", { changes: { evidence: [source], questions: [question] } }, "event-question");
  return { root, source, question };
}
test("patches replace only requested fields and preserve partial answers, exact captures and versions", t => {
  const { root, source, question } = questionCase(t);
  const patch = { status: "open", reason: "Capacity is known; cost remains unknown.", basis_refs: ["request", "answer"], resolution: { answer_refs: ["answer"], remaining: ["Offer cost"] } };
  const value = request(root, "event-partial", { changes: { evidence: [f.statement("answer", "Capacity is 37.5%; I cannot yet confirm cost."), { evidence_id: "request", patch: { summary: "The user needs capacity and cost to freeze the rule." } }], questions: [{ question_id: question.question_id, patch }] } });
  value.type = "reply_interpreted"; value.payload.protocol = PROTOCOL;
  value.payload.interpretation = { interpretation_id: "interpretation-answer", turn_id: "turn-answer", incoming_refs: ["answer"], basis_refs: [question.question_id],
    components: [{ kind: "information", meaning: "Capacity is established but cost is unknown.", established: ["Capacity is 37.5%."], unresolved: ["Offer cost"] }],
    next_action: { kind: "lead_only", scope: "Retain the partial constraint answer.", reason: "Cost is still needed before freezing the rule." } };
  const before = structuredClone(value); store.record(root, value);
  assert.deepEqual(value, before); assert.deepEqual(f.state(root).questions[0], { ...question, ...patch });
  assert.deepEqual(f.state(root).evidence.find(item => item.evidence_id === source.evidence_id), { ...source, source_intake: "primary-message-v1", summary: value.payload.changes.evidence[1].patch.summary });
  const canonicalEvent = store.readJournal(root).events.at(-1); assert.equal(JSON.stringify(canonicalEvent.payload).includes('"patch"'), false);
  const next = request(root, "event-same", { changes: { questions: [{ question_id: question.question_id, patch: { reason: patch.reason } }] } });
  store.record(root, next); assert.equal(f.state(root).history_index[question.question_id].event_ref, "event-same");
  assert.equal(store.record(root, value).replayed, true);
  reject(root, "EVENT_CONFLICT", () => store.record(root, { ...value, payload: canonicalEvent.payload }));
  store.recover(root); assert.deepEqual(f.state(root).questions[0].resolution.remaining, ["Offer cost"]);
});

test("invalid or ambiguous patches and dropped provenance cannot become partial full writes", t => {
  const { root, question } = questionCase(t);
  for (const [entry, code] of [
    [{ question_id: "unknown", patch: { status: "open" } }, "UNKNOWN_REFERENCE"],
    [{ question_id: question.question_id, patch: {} }, "INVALID_INPUT"],
    [{ question_id: question.question_id, patch: null }, "INVALID_INPUT"],
    [{ question_id: question.question_id, status: "open", patch: { reason: "Mixed" } }, "INVALID_INPUT"],
    [{ question_id: question.question_id, patch: { origin: "user" } }, "INVALID_INPUT"],
    [{ question_id: question.question_id, patch: { resolution: { answer_refs: [] } } }, "INVALID_INPUT"],
    [{ question_id: question.question_id, patch: { status: null } }, "INVALID_INPUT"],
    [{ question_id: question.question_id, patch: { basis_refs: [] } }, "MEMORY_SOURCE_CHANGED"]
  ]) reject(root, code, () => store.record(root, request(root, "event-bad", { changes: { questions: [entry] } })));
  reject(root, "DUPLICATE_ID", () => store.record(root, request(root, "event-duplicate", { changes: { questions: [question, { question_id: question.question_id, patch: { status: "open" } }] } })));
  for (const patch of [{ source_excerpt: "Changed capture" }, { complete_message: false }, { source_sha256: "b".repeat(64) }, { limitations: null }]) reject(root, "INVALID_INPUT", () => store.record(root, request(root, "event-source", { changes: { evidence: [{ evidence_id: "request", patch }] } })));
});

for (const committed of [false, true]) test("question withdrawal patch can use a distinct " + (committed ? "committed" : "same-event") + " quoted source", t => {
  const root = project(t), original = f.statement("request", "Please explain attendance effects."), withdrawal = f.statement("withdrawal", "Drop my attendance-effects question.");
  const question = { question_id: "question-user", origin: "user", statement: "What is the attendance effect?", status: "open", basis_refs: ["request"] };
  f.record(root, "memory_updated", { changes: { evidence: [original, ...(committed ? [withdrawal] : [])], questions: [question] } }, "event-question");
  reject(root, "MISSING_USER_SOURCE", () => store.record(root, request(root, "event-no-source", { changes: { questions: [{ question_id: question.question_id, patch: { status: "retired", reason: "User withdrew the question." } }] } })));
  store.record(root, request(root, "event-withdraw", { changes: { ...(committed ? {} : { evidence: [withdrawal] }), questions: [{ question_id: question.question_id, patch: { status: "retired", reason: "User withdrew the question.", basis_refs: ["request", "withdrawal"] } }] } }));
  assert.deepEqual(f.state(root).questions[0], { ...question, status: "retired", reason: "User withdrew the question.", basis_refs: ["request", "withdrawal"] });
});

test("writing warnings count designated prose, preserve content, and never induce a second event or replay warning", t => {
  const root = project(t), long = "word ".repeat(81).trim();
  const value = request(root, "event-long", { changes: { evidence: [{ ...f.statement("source", "exact ".repeat(500)), summary: long }] } });
  const receipt = store.record(root, value);
  assert.deepEqual(receipt.writing_warnings, [{ path: "payload.changes.evidence[0].summary", rule: "summary", words: 81, budget: 80 }]);
  assert.equal(f.state(root).evidence[0].summary, long); assert.equal(f.state(root).state_meta.sequence, 2);
  assert.equal(JSON.stringify(store.readJournal(root).events).includes("writing_warnings"), false);
  assert.equal(store.record(root, value).writing_warnings, undefined);
  const unchanged = f.record(root, "memory_updated", { changes: { evidence: [f.state(root).evidence[0]] } }, "event-unchanged");
  assert.equal(unchanged.writing_warnings, undefined);
  const patch = f.record(root, "memory_updated", { changes: { evidence: [{ evidence_id: "source", patch: { limitations: ["A preserved limitation."] } }] } }, "event-limit");
  assert.equal(patch.writing_warnings, undefined);
  assert.equal(f.record(root, "memory_updated", { changes: { evidence: [{ evidence_id: "source", patch: { summary: long + " changed" } }] } }, "event-long-patch").writing_warnings[0].words, 82);
});

test("aggregate budgets include only changed designated fields and resulting project narrative", t => {
  const root = project(t), prose = n => Array(n).fill("word").join(" ");
  const checkpoint = { checkpoint_id: "checkpoint-one", status: "assessing", primary_uncertainty: prose(20), why_it_matters: prose(20), ways_user_can_help: [prose(21)], consultant_led_options_if_unknown: [prose(10)] };
  const a = f.record(root, "checkpoint", { checkpoint, changes: { project_understanding: { intended_use: prose(200), audience: prose(101), materials: [prose(1000)] } } }, "event-aggregate");
  assert.deepEqual(a.writing_warnings.map(w => [w.rule, w.words, w.budget]), [["checkpoint_narrative", 71, 60], ["project_understanding_narrative", 301, 300]]);
  assert.equal(f.record(root, "memory_updated", { changes: { project_understanding: { materials: ["new.csv"] }, consultation: checkpoint } }, "event-unchanged-prose").writing_warnings, undefined);
  assert.equal(f.record(root, "memory_updated", { changes: { project_understanding: { audience: prose(103) } } }, "event-partial-understanding").writing_warnings[0].words, 303);
  const b = f.record(root, "memory_updated", { changes: { consultation: { ...checkpoint, why_it_matters: prose(21) } } }, "event-changed-checkpoint");
  assert.equal(b.writing_warnings[0].path, "payload.changes.consultation"); assert.equal(b.writing_warnings[0].words, 72);
  const second = project(t); // Init feedback uses the actual initialization path.
  const initRoot = path.join(second, "nested");
  const initial = store.init(initRoot, { project_id: "nested", event_id: "init", project_understanding: { objective: prose(301), materials: [prose(1000)] } });
  assert.equal(initial.writing_warnings[0].path, "project_understanding"); assert.equal(initial.writing_warnings[0].words, 301);
  assert.equal(store.init(initRoot, { project_id: "nested", event_id: "init", project_understanding: { objective: prose(301), materials: [prose(1000)] } }).writing_warnings, undefined);
});

test("review and reconciliation warnings are advisory and separate from exact emitted proposal bytes", t => {
  const env = proposal(t), value = input(env);
  value.payload.exchange.reconciliation.changes = [Array(121).fill("word").join(" ")];
  const receipt = store.record(env.root, value);
  assert.equal(receipt.writing_warnings[0].rule, "reconciliation_narrative");
  assert.equal(receipt.rendered_response, renderExchange(store.readJournal(env.root).events.at(-1).payload.exchange));
  assert.equal(f.deliver(env.root, env.exchange.exchange_id, "long-reconciliation"), "delivery-long-reconciliation");
  const root = project(t), assignment = { specialist_id: "data_audit", operation: "review" };
  const it = f.interpret(root, "review", { kind: "specialist", scope: "Inspect the supplied source.", reason: "Bound the source account.", assignment });
  f.record(root, "checkpoint", { checkpoint: { checkpoint_id: "checkpoint-review", status: "assessing", primary_uncertainty: "What does the source establish?", why_it_matters: "Avoid extending its claims." } }, "event-checkpoint");
  const review = { review_id: "review-source", summary: Array(151).fill("word").join(" "), assignment, interpretation_ref: it.interpretation_id, selection_basis: { checkpoint_id: "checkpoint-review", user_contribution_refs: it.incoming_refs }, question_addressed: "What does the source establish?", work_performed: ["Read the supplied account."], findings: ["The account establishes only the user's stated objective."], evidence_refs: it.incoming_refs };
  const saved = f.record(root, "review_completed", { review, changes: {
    assumptions: [{ assumption_id: "long-assumption", statement: Array(61).fill("word").join(" "), status: "active", basis_refs: it.incoming_refs }],
    decisions: [{ decision_id: "long-decision", statement: Array(81).fill("word").join(" "), kind: "target", status: "current", basis_refs: it.incoming_refs }]
  } }, "event-review");
  assert.deepEqual(saved.writing_warnings.map(w => [w.path, w.words, w.budget]), [
    ["payload.changes.decisions[0].statement", 81, 80], ["payload.changes.assumptions[0].statement", 61, 60], ["payload.review.summary", 151, 150]
  ]);
  assert.equal(store.history(root, { record_id: review.review_id }).events.at(-1).payload.review.summary, review.summary);
});
