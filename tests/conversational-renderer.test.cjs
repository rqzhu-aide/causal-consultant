"use strict";
// These are synthetic host conversations. Captured fixture messages prove the
// saved/rendered delivery contract, not emission by a real consultant host.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const store = require("../scripts/lib/store.cjs");
const runs = require("../scripts/lib/runs.cjs");
const { PROTOCOL, RENDERER, renderExchange } = require("../scripts/lib/exchanges.cjs");
const f = require("./fixtures/consultation-loop.cjs");

const direct = { kind: "lead_only", scope: "Explain the current scientific meaning.", reason: "The user needs an answer before further work." };
function project(t) {
  const base = fs.realpathSync.native(os.tmpdir());
  const root = fs.mkdtempSync(path.join(base, "cc-conversational-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("cc-conversational-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  store.init(root, { project_id: "conversational", event_id: "event-init" });
  return root;
}
function questionTurn(root, suffix, words, answer, status = "answered", otherComponents = []) {
  const question = { question_id: "question-" + suffix, origin: "user", statement: words,
    status: status === "pending" ? "open" : "answered", basis_refs: ["user-" + suffix],
    ...(status === "answered" ? { reason: answer } : {}) };
  f.record(root, "memory_updated", { changes: { evidence: [f.statement("user-" + suffix, words)], questions: [question] } }, "event-question-" + suffix);
  const it = f.interpret(root, suffix, direct, { components: [{ kind: "question", meaning: words,
    established: ["The user asks for the interpretation before further work."], unresolved: status === "pending" ? [words] : [],
    user_question_ref: question.question_id, answer_timing: "before_work" }, ...otherComponents] }, words);
  return { it, answer: { question_ref: question.question_id, text: words, answer, status, basis_refs: ["user-" + suffix] } };
}
function unchanged(root, action, code = "INVALID_INPUT") {
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(action, { code });
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
}
function submission(root, it, suffix, response, renderer = RENDERER) {
  return { ...f.ids(root, "event-out-" + suffix), type: "exchange_prepared", payload: { protocol: PROTOCOL,
    exchange: { exchange_id: "exchange-" + suffix, turn_id: it.turn_id, interpretation_ref: it.interpretation_id,
      basis_refs: [], completed_work_refs: [], renderer,
      reconciliation: { changes: [], limitations: ["Synthetic fixture only."], unresolved: [], next_direction: "Discuss the answer or pause." }, response } } };
}

test("a direct answer closes and survives recovery without an echoed question or status paragraph", t => {
  const root = project(t);
  const words = "Does an offer effect also measure the effect of attendance?";
  const answer = "No. An offer effect compares original offer groups, including people who did not attend. Attendance needs additional identification assumptions.";
  const first = questionTurn(root, "meaning", words, answer);
  const response = { user_questions: [first.answer], questions: [], next_steps: [] };
  unchanged(root, () => f.exchange(root, first.it, "missing-answer", { questions: [], next_steps: [], status: "The question was received." }), "UNANSWERED_USER_QUESTION");
  unchanged(root, () => f.exchange(root, first.it, "bad-echo", { ...response, user_questions: [{ ...first.answer, echo_question: "true" }] }));
  const receipt = f.exchange(root, first.it, "meaning", response);
  assert.equal(receipt.renderer, "lead-markdown-v10");
  assert.equal(receipt.rendered_response, "[To answer your question]\n\n[1] " + answer);
  f.deliver(root, receipt.exchange_id, "meaning");
  store.recover(root);
  const saved = store.readJournal(root);
  const outgoing = saved.events.find(event => event.payload.exchange?.exchange_id === receipt.exchange_id).payload.exchange;
  assert.equal(outgoing.response.user_questions[0].text, words, "The hidden question remains available to future readers.");
  assert.equal(renderExchange(outgoing), "[To answer your question]\n\n[1] " + answer);
  assert.equal(saved.state.questions.find(item => item.question_id === first.answer.question_ref).status, "answered");
  assert.equal(saved.state.runs.length, 0);
  const next = questionTurn(root, "echo", "Which contrast are you discussing?", "The original offer contrast, under the study's assignment assumptions.");
  const echoed = f.exchange(root, next.it, "echo", { user_questions: [{ ...next.answer, echo_question: true }], questions: [], next_steps: [] });
  assert.equal(echoed.rendered_response, "[To answer your question]\n\n[1] " + next.answer.text + "\n\n" + next.answer.answer);
});

test("empty replies cannot close a turn, while a short acknowledgement needs no extra sections", t => {
  const root = project(t), it = f.interpret(root, "pause", direct, {}, "Pause here while I find the source record.");
  for (const [index, response] of [
    { questions: [], next_steps: [] },
    { questions: [], next_steps: [], user_questions: [], questions_none: "No question.", next_steps_none: "No action." },
    { status: " \n ", questions: [], next_steps: [] }
  ].entries()) unchanged(root, () => f.exchange(root, it, "empty-" + index, response));
  const receipt = f.exchange(root, it, "pause", { status: "Paused. The accepted scope remains available when you return.", questions: [], next_steps: [] });
  assert.equal(receipt.rendered_response, "[What has been done]\n\nPaused. The accepted scope remains available when you return.");
  assert.equal(f.state(root).exchanges.length, 1);
});

test("v5 retains its required fields, labels, exact saved bytes and retry behavior", t => {
  const root = project(t), it = f.interpret(root, "historical", direct);
  f.record(root, "memory_updated", { changes: { questions: [{ question_id: "question-log", origin: "consultant", statement: "Is the allocation log available?", status: "open" }] } }, "event-log");
  const response = { status: "The allocation account is still conditional.", questions: [{ question_ref: "question-log", text: "Is the allocation log available?", why: "It records the procedure.", needed: "The dated allocation entry." }], next_steps: [{ option_id: "discuss", kind: "discussion", label: "Discuss the limitation", actor: "consultant", scope: "Explain the conditional interpretation.", basis_refs: [] }] };
  const missingStatus = structuredClone(response); delete missingStatus.status;
  unchanged(root, () => store.record(root, submission(root, it, "old-no-status", missingStatus, "lead-markdown-v5")));
  const missingWhy = structuredClone(response); delete missingWhy.questions[0].why;
  unchanged(root, () => store.record(root, submission(root, it, "old-no-why", missingWhy, "lead-markdown-v5")));
  const request = submission(root, it, "historical", response, "lead-markdown-v5");
  const receipt = store.record(root, request);
  const expected = "The allocation account is still conditional.\n\nIs the allocation log available?\n\nIt records the procedure. Helpful information: The dated allocation entry.\n\n1. Discuss the limitation\n   consultant: Explain the conditional interpretation.";
  assert.equal(receipt.rendered_response, expected);
  f.deliver(root, receipt.exchange_id, "historical");
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  store.recover(root);
  const retry = store.record(root, request);
  assert.equal(retry.replayed, true);
  assert.equal(retry.response_sha256, receipt.response_sha256);
  assert.equal(retry.rendered_response, expected);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
});

test("a partial allocation account stays conditional and requests only the useful unresolved record", t => {
  const root = project(t);
  const words = "The coordinator says offers used a coin toss, but I do not know where it was recorded. Can we treat that as randomized?";
  const answer = "The coordinator's account is consistent with random assignment, but the procedure remains unverified. A causal interpretation is conditional on that account being correct.";
  const { it, answer: retained } = questionTurn(root, "allocation", words, answer, "pending", [{ kind: "information",
    meaning: "The coordinator reports a coin toss, with no located allocation record.", established: ["A coordinator reports coin-toss allocation."],
    unresolved: ["The record identifying how offers were assigned."] }]);
  const question = { question_id: "question-allocation-record", origin: "consultant", statement: "How were offers assigned, and where is that recorded?", status: "open", basis_refs: it.incoming_refs,
    resolution: { answer_refs: it.incoming_refs, remaining: ["The record identifying how offers were assigned."] } };
  f.record(root, "memory_updated", { changes: { questions: [question] } }, "event-partial");
  const receipt = f.exchange(root, it, "allocation", { user_questions: [retained], questions: [{ question_ref: question.question_id,
    text: "Can you share the allocation record, if available?", why: "It would let us check whether the coin toss determined every offer." }], next_steps: [] });
  assert.equal(receipt.rendered_response, "[To answer your question]\n\n[1] " + answer + "\n\n[Questions for you]\n\n[1] Can you share the allocation record, if available?\n\nIt would let us check whether the coin toss determined every offer.");
  assert.doesNotMatch(receipt.rendered_response, /Helpful information:|Why this matters:|How were offers assigned/);
  f.deliver(root, receipt.exchange_id, "allocation");
  store.recover(root);
  assert.deepEqual(f.state(root).questions.find(item => item.question_id === question.question_id).resolution, question.resolution);
  assert.equal(f.state(root).questions.find(item => item.question_id === retained.question_ref).status, "open");
  assert.equal(f.state(root).runs.length, 0);
  const follow = f.interpret(root, "record-later", direct, {}, "I will look for that record later.");
  const brief = f.exchange(root, follow, "record-later", { questions: [{ question_ref: question.question_id, text: "Please share the allocation entry when available." }], next_steps: [] });
  assert.equal(brief.rendered_response, "[Questions for you]\n\n[1] Please share the allocation entry when available.");
});

function analysisPlan() {
  return { kind: "analysis", objective: "Describe the supplied rows", claim_boundary: "Sample description only; no causal conclusion.",
    inputs: [{ source_ref: "data.json", path: "data.json" }], target: "The observed mean", population: "Three observed rows",
    treatment: "None", comparator: "None", outcome: "Recorded value", timing: "One collection", estimand: "Sample arithmetic mean",
    design_id: "descriptive_association", estimator: "Arithmetic mean", exclusions: [], diagnostics: ["Check completeness and row count."] };
}
function finish(root, approved, run_id) {
  runs.start(root, { ...f.ids(root, "event-start-" + run_id), run_id, plan: approved });
  const write = (file, content) => {
    const { event_id, ...ids } = f.ids(root, "unused");
    runs.write(root, { ...ids, run_id, path: file, content });
  };
  if (approved.kind === "analysis") {
    write("analysis.cjs", "const fs=require('node:fs');const x=JSON.parse(fs.readFileSync('inputs/0001.json','utf8'));fs.writeFileSync('result.json',JSON.stringify({mean:x.reduce((a,b)=>a+b,0)/x.length}));fs.writeFileSync('diagnostics.json',JSON.stringify({n:x.length,missing:x.filter(v=>v===null).length}));");
    const command = spawnSync(process.execPath, ["analysis.cjs"], { cwd: path.join(root, "runs", run_id), encoding: "utf8", windowsHide: true });
    assert.equal(command.status, 0, command.stderr);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, "runs", run_id, "result.json"))), { mean: 3 });
  } else write("report.md", "The observed mean is 3 across three complete rows. This is a sample description, not a causal effect or a population estimate.\n");
  runs.finalize(root, { ...f.ids(root, "event-finish-" + run_id), run_id,
    code_paths: approved.kind === "analysis" ? ["analysis.cjs"] : [], output_paths: [approved.kind === "analysis" ? "result.json" : "report.md"], ...(approved.kind === "report" ? { deliverable: { primary: "report.md" } } : {}),
    diagnostic_paths: approved.kind === "analysis" ? ["diagnostics.json"] : [], environment: { runtime: process.version, authoring: "Synthetic conversational renderer regression" }, deviations: [] });
}

test("a synthetic proposal, explain-first pause, findings-only closeout and separately selected report preserve the loop", t => {
  const root = project(t);
  fs.writeFileSync(path.join(root, "data.json"), "[1,3,5]");
  f.record(root, "memory_updated", { changes: { evidence: [{ evidence_id: "source-data", kind: "file", source_ref: "data.json", summary: "Three synthetic values without a causal design." }] } }, "event-source");
  const offer = f.prepareScope(root, analysisPlan(), { basis_refs: ["source-data"] });
  for (const term of Object.values(offer.scope.public_scope).flat()) assert.ok(offer.rendered_response.includes(term), "A protected public term disappeared: " + term);
  assert.doesNotMatch(offer.rendered_response, /consultant:|claim boundary:|\n\s+target:/);
  assert.match(offer.rendered_response, /\n\n\[Next steps\]\n\n\[1\] /);
  assert.doesNotMatch(offer.rendered_response, /\n {3}\S/, "Flat option paragraphs must not acquire list indentation.");
  assert.match(offer.rendered_response, /\[Full saved scope\]\(<.*\/scope\.json>\)/);
  unchanged(root, () => runs.start(root, { ...f.ids(root, "event-unselected"), run_id: "run-unselected", plan: { ...offer.scope.execution_plan, scope_ref: offer.scope.scope_id } }), "MISSING_INTERPRETATION");
  const accepted = f.acceptScope(root, offer, { lead_only: true, user_text: "I approve this scope, but explain what the population means before running it." });
  unchanged(root, () => runs.start(root, { ...f.ids(root, "event-paused-start"), run_id: "run-paused", plan: accepted }), "ASSIGNMENT_MISMATCH");
  const explanation = "The population here is only the three supplied rows. The mean describes those rows; it does not establish a causal effect or support inference to a wider population. I will wait for your direction before running it.";
  const paused = f.exchange(root, f.state(root).interpretations.at(-1), "explain-first", { explanations: [{ text: explanation, basis_refs: [] }], questions: [], next_steps: [] });
  assert.equal(paused.rendered_response, "[To answer your question]\n\n[1] " + explanation);
  f.deliver(root, paused.exchange_id, "explain-first");
  store.recover(root);
  const eligibility = store.status(root).views.work.actions.eligibility.find(item => item.scope_ref === offer.scope.scope_id);
  assert.equal(eligibility.eligible, true);
  assert.equal(eligibility.executable_now, false);
  assert.equal(f.state(root).runs.length, 0);
  const resume = f.interpret(root, "resume", { kind: "specialist", assignment: offer.scope.assignment,
    scope: "Run the accepted descriptive analysis.", reason: "The user understands the population and explicitly resumes the unchanged scope.",
    scope_ref: accepted.scope_ref, authorization_ref: accepted.authorization_ref }, {}, "Understood. Run the same scope now.");
  const approved = { ...accepted, interpretation_ref: resume.interpretation_id };
  unchanged(root, () => runs.start(root, { ...f.ids(root, "event-changed-plan"), run_id: "run-changed", plan: { ...approved, estimator: "Population regression" } }), "SCOPE_MISMATCH");
  finish(root, approved, "run-analysis");
  unchanged(root, () => f.exchange(root, resume, "missing-findings", { explanations: [{ text: "The computation completed.", basis_refs: [] }], questions: [], next_steps: [] }, ["run-analysis"]), "FINDINGS_DISCUSSION_REQUIRED");
  const findings = { work_refs: ["run-analysis"], summary: "The observed mean is 3. This is a sample description; no population interval or causal effect is established.",
    diagnostics: ["All three values are observed; row count and completeness were checked."], limitations: ["These rows provide no sampling or treatment-assignment argument."] };
  const discussion = f.exchange(root, resume, "results", { findings, questions: [], next_steps: [] }, ["run-analysis"]);
  assert.ok(discussion.rendered_response.startsWith("[To answer your question]\n\n[1] " + findings.summary));
  for (const detail of [...findings.diagnostics, ...findings.limitations]) assert.ok(discussion.rendered_response.includes(detail));
  assert.ok(store.status(root).views.work.actions.findings_awaiting_discussion.length);
  f.deliver(root, discussion.exchange_id, "results");
  assert.equal(store.status(root).views.work.actions.findings_awaiting_discussion.length, 0);
  assert.equal(f.state(root).runs.length, 1);
  f.record(root, "memory_updated", { changes: { evidence: [{ evidence_id: "result-mean", kind: "computed", run_id: "run-analysis", source_ref: "runs/run-analysis/result.json", summary: "Observed mean 3, descriptive only." }] } }, "event-result");
  const reportOffer = f.prepareScope(root, { kind: "report", objective: "Save the discussed description", claim_boundary: "Three observed rows only; no causal effect.", inputs: [],
    purpose: "Explain the observed mean and its limits", evidence_refs: ["result-mean"], format: "Markdown" }, { findings_refs: ["run-analysis"] });
  assert.equal(f.state(root).runs.length, 1, "A report proposal must not start reporting.");
  const reportApproval = f.acceptScope(root, reportOffer);
  finish(root, reportApproval, "run-report");
  const reportPath = path.join(root, "runs", "run-report", "report.md").replace(/\\/g, "/");
  const final = f.exchange(root, f.state(root).interpretations.at(-1), "report", { status: "The [report](<" + reportPath + ">) is ready. It describes the three observed rows and retains the limits on causal and population interpretation.", questions: [], next_steps: [] }, ["run-report"]);
  assert.ok(final.rendered_response.includes("[report](<" + reportPath + ">)"));
  assert.ok(fs.readFileSync(reportPath, "utf8").includes("not a causal effect"));
  f.deliver(root, final.exchange_id, "report");
  store.recover(root);
  assert.equal(f.state(root).runs.length, 2);
  assert.equal(f.state(root).action_decisions.filter(item => item.disposition === "accept").length, 2, "Resuming an accepted analysis must not create a second acceptance for it.");
  assert.equal(runs.verify(root).ok, true);
});
