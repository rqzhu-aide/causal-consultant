"use strict";
// Complete synthetic trajectories exercise the reading loop, not a turn quota
// or a scientific correctness oracle for generated consulting prose.
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/store.cjs"), runs = require("../scripts/lib/runs.cjs");
const f = require("./fixtures/consultation-loop.cjs");
const { PROTOCOL } = require("../scripts/lib/exchanges.cjs");
function project(t) {
  const base = fs.realpathSync(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-brief-loop-"));
  t.after(() => { assert.equal(path.dirname(fs.realpathSync(root)), base); assert.ok(path.basename(root).startsWith("cc-brief-loop-")); fs.rmSync(root, { recursive: true, force: true }); });
  store.init(root, { project_id: "brief-loop", event_id: "event-init", project_understanding: { objective: "Investigate the supplied study." } });
  return root;
}
function read(root) { const result = store.context(root, { mode: "brief" }); assert.equal(result.brief.file_current, true); return result.brief; }
function incoming(root, suffix, words, next_action, components, changes = {}) {
  const it = { interpretation_id: "interpretation-" + suffix, turn_id: "turn-" + suffix, incoming_refs: ["source-" + suffix],
    basis_refs: [], next_action, components: components || [{ kind: "instruction", meaning: words, established: [words], unresolved: [] }] };
  f.record(root, "reply_interpreted", { protocol: PROTOCOL, interpretation: it, changes: { ...changes,
    evidence: [{ ...f.statement("source-" + suffix, words), complete_message: true }, ...(changes.evidence || [])] } }, "event-in-" + suffix);
  read(root);
  return it;
}
const direct = { kind: "lead_only", scope: "Discuss the current direction.", reason: "The user needs a response before further work." };
function observed(root, it, suffix, response, work = []) {
  const receipt = f.exchange(root, it, suffix, response, work);
  assert.ok(read(root).unfinished.some(item => item.reasons.includes("actual_response_unestablished")));
  f.deliver(root, receipt.exchange_id, suffix);
  read(root);
  return receipt;
}
function closeDirection(root, it, suffix, next_direction, extra = {}) {
  return f.record(root, "exchange_prepared", { protocol: PROTOCOL, exchange: {
    exchange_id: "exchange-" + suffix, turn_id: it.turn_id, interpretation_ref: it.interpretation_id,
    basis_refs: [], completed_work_refs: [], renderer: "lead-markdown-v4",
    reconciliation: { changes: [], limitations: [], unresolved: [], next_direction },
    response: f.emptyResponse("The current question has been discussed."), ...extra
  } }, "event-out-" + suffix);
}
function directionCard(brief) {
  return brief.markdown.split("### Latest Lead proposed direction\n")[1]?.split("\n### ")[0];
}

test("brief separates a reconciled incoming action from Lead's prepared and observed proposal", t => {
  const root = project(t);
  f.record(root, "checkpoint", { checkpoint: { checkpoint_id: "checkpoint-capacity", status: "assessing",
    primary_uncertainty: "The number of seats is unknown.", why_it_matters: "Capacity constrains the study." } }, "event-capacity");
  const it = incoming(root, "capacity", "Seventeen seats; I still do not know the pooling rule.", direct);
  let brief = read(root);
  assert.match(brief.markdown, /### Selected incoming action awaiting Lead closeout \(interpretation-capacity\)/);
  assert.equal(directionCard(brief), undefined);
  closeDirection(root, it, "capacity", "Ask only whether unused seats can be pooled.");
  brief = read(root);
  assert.match(brief.markdown, /### Incoming action reconciled by Lead \(interpretation-capacity\)/);
  assert.doesNotMatch(brief.markdown, /Current incoming direction|Selected incoming action awaiting Lead closeout/);
  assert.match(directionCard(brief), /Ask only whether unused seats can be pooled/);
  assert.match(directionCard(brief), /Latest incoming turn/);
  assert.match(directionCard(brief), /Proposed next direction, not a user selection or permission to execute/);
  assert.match(directionCard(brief), /"status":"unobserved"/);
  assert.match(directionCard(brief), /"record_id":"exchange-capacity"/);
  // Displaying a saved next direction cannot repair an omitted semantic update.
  assert.equal(f.state(root).consultation.primary_uncertainty, "The number of seats is unknown.");
  f.deliver(root, "exchange-capacity", "capacity");
  assert.match(directionCard(read(root)), /"status":"assistant_emission"/);
});

test("new input and reconciliation govern the proposal despite late older closeouts and observations", t => {
  const root = project(t);
  const old = incoming(root, "old", "Discuss the comparison.", direct);
  const latest = incoming(root, "latest", "Focus on the timing records first.", direct);
  closeDirection(root, old, "old", "OLD PROPOSAL: discuss the comparison again.");
  let brief = read(root);
  assert.match(brief.markdown, /Selected incoming action awaiting Lead closeout \(interpretation-latest\)/);
  assert.match(directionCard(brief), /Earlier turn; newer incoming direction awaits Lead closeout/);
  f.deliver(root, "exchange-old", "old");
  assert.match(directionCard(read(root)), /Earlier turn; newer incoming direction awaits Lead closeout/);
  closeDirection(root, latest, "latest", "NEW PROPOSAL: inspect the actual timing records.", { reconciles: [old.interpretation_id] });
  brief = read(root);
  assert.match(directionCard(brief), /NEW PROPOSAL/);
  assert.match(directionCard(brief), /Latest incoming turn/);
  assert.doesNotMatch(directionCard(brief), /OLD PROPOSAL/);
  assert.equal(f.state(root).turns.find(turn => turn.interpretation_ref === old.interpretation_id).exchange_ref, "exchange-latest");
  closeDirection(root, old, "old-revised", "LATE OLD PROPOSAL: a revised explanation.", { supersedes: "exchange-old" });
  f.deliver(root, "exchange-old-revised", "old-revised");
  brief = read(root);
  assert.match(directionCard(brief), /NEW PROPOSAL/);
  assert.match(directionCard(brief), /"status":"unobserved"/);
  assert.doesNotMatch(directionCard(brief), /LATE OLD PROPOSAL|assistant_emission/);
  f.deliver(root, "exchange-latest", "latest");
  assert.match(directionCard(read(root)), /"status":"assistant_emission"/);
});

test("closing a selected protected action removes current-direction labeling without inventing completed work", t => {
  const root = project(t);
  fs.writeFileSync(path.join(root, "data.json"), "[1,3,5]");
  const plan = f.authorizePlan(root, { kind: "analysis", objective: "Describe the supplied values", claim_boundary: "Descriptive only.",
    inputs: [{ path: "data.json", source_ref: "data.json" }], target: "Sample mean", population: "Three rows", treatment: "None",
    comparator: "None", outcome: "Recorded value", timing: "One collection", estimand: "Sample mean", design_id: "descriptive_association",
    estimator: "Arithmetic mean", exclusions: [], diagnostics: ["Count observed values."] });
  assert.match(read(root).markdown, /\*\*current direction:\*\* true/);
  const it = f.state(root).interpretations.find(item => item.interpretation_id === plan.interpretation_ref);
  closeDirection(root, it, "deferred", "The selected work was not performed; discuss the outstanding issue first.");
  const brief = read(root);
  assert.equal(f.state(root).runs.length, 0);
  assert.match(brief.markdown, /\*\*current direction:\*\* false/);
  assert.match(brief.markdown, /\*\*direction turn closed:\*\* true/);
  assert.match(brief.markdown, /saved closeout is not proof that every selected task was completed/);
  assert.match(directionCard(brief), /selected work was not performed/);
});

test("vague clarification loops preserve the original choice through rollover and finish on a clear answer", t => {
  const root = project(t), opening = incoming(root, "opening", "Help me choose the next investigation.", direct);
  f.record(root, "memory_updated", { changes: { questions: [{ question_id: "question-choice", statement: "Audit the records or explain the comparison first?", status: "open", origin: "consultant", basis_refs: opening.incoming_refs }], case_brief: { knowledge_refs: [], work_refs: [] } } }, "event-question");
  const response = { status: "Choose which of these two tasks should happen first.", questions: [{ question_ref: "question-choice", text: "Audit the records or explain the comparison first?", why: "They are different tasks.", needed: "Name either task." }],
    next_steps: [{ option_id: "audit", kind: "action", actor: "consultant", label: "Audit records", scope: "Inspect structure, without estimating effects.", basis_refs: opening.incoming_refs, assignment: { specialist_id: "data_audit", operation: "review" } },
      { option_id: "explain", kind: "discussion", actor: "consultant", label: "Explain comparison", scope: "Explain the comparison needed to assess effects.", basis_refs: opening.incoming_refs }] };
  observed(root, opening, "opening", response);
  for (let index = 0; index < 6; index++) {
    const it = incoming(root, "vague-" + index, "Yes, do it.", { ...direct, clarification_needed: "Which original task is intended?" },
      [{ kind: "answer", meaning: "Willingness to proceed, task unspecified.", established: ["The user wants to continue."], unresolved: ["Audit or explanation remains undecided."],
        exchange_ref: "exchange-opening", question_ref: "question-choice", delivery_ref: "delivery-opening" }],
      { questions: [{ ...f.state(root).questions[0], resolution: { answer_refs: [], remaining: ["Audit or explanation remains undecided."] } }] });
    observed(root, it, "vague-" + index, { ...response, status: "You want to continue. I still need to know which original task." });
  }
  const current = read(root);
  assert.equal(current.recent_intakes.length, 5);
  assert.ok(!current.recent_intakes.some(item => item.intake_id === opening.interpretation_id));
  assert.match(current.markdown, /Audit the records or explain the comparison first/);
  const old = store.history(root, { record_id: "exchange-opening" }).events.find(event => event.payload.exchange?.exchange_id === "exchange-opening");
  assert.deepEqual(old.payload.exchange.response.next_steps.map(item => item.option_id), ["audit", "explain"]);
  const question = f.state(root).questions[0];
  const clear = incoming(root, "clear", "Explain the comparison first.", direct,
    [{ kind: "answer", meaning: "The user chooses explanation.", established: ["Explain the comparison first."], unresolved: [], exchange_ref: "exchange-opening", question_ref: question.question_id, delivery_ref: "delivery-opening" }],
    { questions: [{ ...question, status: "answered", reason: "The user specified the task.", resolution: { answer_refs: ["source-clear"], remaining: [] } }] });
  observed(root, clear, "clear", f.emptyResponse("A credible comparison addresses what would happen without tutoring; a participant-only mean does not establish that counterfactual."));
  assert.equal(f.state(root).questions[0].status, "answered");
  assert.equal(f.state(root).runs.length, 0);
  assert.equal(read(root).unfinished.length, 0);
});

test("a partial answer and changed target survive independent selected work with one bundled review", t => {
  const root = project(t);
  f.record(root, "memory_updated", { changes: { questions: [{ question_id: "question-capacity", statement: "How many seats are available and can unused seats be pooled?", status: "open", origin: "consultant" }],
    evidence: [{ evidence_id: "source-file", kind: "file", source_ref: "records.csv", summary: "Available register columns require inspection." }] } }, "event-starting-facts");
  fs.writeFileSync(path.join(root, "records.csv"), "id,attendance\n1,\n2,10\n");
  const assignment = { specialist_id: "data_audit", operation: "review" };
  const it = incoming(root, "partial", "Twenty seats per center, but I do not know about pooling. Focus on attendance instead of scores. First inspect missing entries.",
    { kind: "specialist", assignment, scope: "Inspect missing register entries only.", reason: "The pooling gap cannot change this explicitly requested column inspection." },
    [{ kind: "information", meaning: "Twenty seats per center; pooling unknown.", established: ["Twenty seats per center."], unresolved: ["Can unused seats be pooled?"] },
      { kind: "correction", meaning: "The intended outcome is attendance.", established: ["Attendance replaces scores as the target."], unresolved: [] },
      { kind: "instruction", meaning: "Inspect missing entries first.", established: ["The user selects an independent missing-entry inspection."], unresolved: [] }],
    { questions: [{ ...f.state(root).questions[0], resolution: { answer_refs: ["source-partial"], remaining: ["Can unused seats be pooled?"] } }],
      decisions: [{ decision_id: "target-attendance", kind: "target", status: "current", statement: "Focus on attendance; current work only inspects recorded missing entries.", basis_refs: ["source-partial"] }],
      project_understanding: { causal_target: "Attendance" }, case_brief: { knowledge_refs: ["source-partial", "source-file"], work_refs: [] } });
  assert.match(read(root).markdown, /Twenty seats per center/);
  assert.match(read(root).markdown, /Can unused seats be pooled/);
  f.record(root, "checkpoint", { checkpoint: { checkpoint_id: "checkpoint-missing", status: "assessing", primary_uncertainty: "Which values are missing?", why_it_matters: "Bounds what the register describes." } }, "event-checkpoint");
  const rows = fs.readFileSync(path.join(root, "records.csv"), "utf8").trim().split("\n").slice(1);
  assert.equal(rows.filter(row => row.split(",")[1] === "").length, 1);
  const review = { review_id: "review-missing", summary: "One of two attendance entries is blank.", assignment, question_addressed: "Which attendance entries are missing?", interpretation_ref: it.interpretation_id,
    selection_basis: { checkpoint_id: "checkpoint-missing", user_contribution_refs: it.incoming_refs }, work_performed: ["Read both rows and checked the attendance column."],
    findings: ["One of two attendance entries is blank."], limitations: ["A blank does not establish zero attendance or a causal effect."], evidence_refs: ["source-file"] };
  const response = { ...f.emptyResponse("The requested entry check is complete; seat pooling remains unknown."), findings: { work_refs: [review.review_id], summary: review.summary, diagnostics: ["Two rows inspected."], limitations: review.limitations } };
  const receipt = f.record(root, "exchange_prepared", { protocol: PROTOCOL, review, changes: { case_brief: { work_refs: [review.review_id] } },
    exchange: { exchange_id: "exchange-missing", turn_id: it.turn_id, interpretation_ref: it.interpretation_id, completed_work_refs: [review.review_id], basis_refs: ["source-partial"], renderer: "lead-markdown-v4",
      reconciliation: { changes: ["Attendance is the target; missing entries were checked."], limitations: review.limitations, unresolved: ["Seat pooling remains unknown."], next_direction: "Discuss the findings or provide the pooling rule." }, response } }, "event-close");
  assert.equal(receipt.brief_written, true);
  f.deliver(root, receipt.exchange_id, "missing");
  const current = read(root);
  assert.match(current.markdown, /A blank does not establish zero attendance/);
  assert.match(current.markdown, /Can unused seats be pooled/);
  assert.equal(f.state(root).specialist_reviews.length, 1);
  assert.equal(f.state(root).project_understanding.causal_target, "Attendance");
});

test("completed analysis resumes under new input, saves its old handoff once and waits for later report selection", t => {
  const root = project(t);
  fs.writeFileSync(path.join(root, "data.json"), "[1,3,5]");
  f.record(root, "memory_updated", { changes: { evidence: [{ evidence_id: "data", kind: "file", source_ref: "data.json", summary: "Three values, without a causal comparison." }] } }, "event-data");
  const plan = f.authorizePlan(root, { kind: "analysis", objective: "Describe the supplied values", claim_boundary: "Descriptive only.", inputs: [{ path: "data.json", source_ref: "data.json" }],
    target: "Sample mean", population: "Three supplied rows", treatment: "None", comparator: "None", outcome: "Recorded value", timing: "One collection", estimand: "Sample mean", design_id: "descriptive_association", estimator: "Arithmetic mean", exclusions: [], diagnostics: ["Count observed values."] }, { basis_refs: ["data"] });
  runs.start(root, { ...f.ids(root, "event-analysis-start"), run_id: "run-analysis", plan });
  const values = JSON.parse(fs.readFileSync(path.join(root, "runs/run-analysis/inputs/0001.json"), "utf8"));
  const result = JSON.stringify({ mean: values.reduce((a, b) => a + b, 0) / values.length });
  const code = "const fs=require('node:fs');const x=JSON.parse(fs.readFileSync('inputs/0001.json'));fs.writeFileSync('result.json',JSON.stringify({mean:x.reduce((a,b)=>a+b,0)/x.length}));fs.writeFileSync('diagnostics.json',JSON.stringify({n:x.length,missing:x.filter(v=>v===null).length}));";
  const codeIds = f.ids(root, "unused-code"); delete codeIds.event_id;
  runs.write(root, { ...codeIds, run_id: "run-analysis", path: "analysis.cjs", content: code });
  const command = require("node:child_process").spawnSync(process.execPath, ["analysis.cjs"], { cwd: path.join(root, "runs/run-analysis"), windowsHide: true });
  assert.equal(command.status, 0, String(command.stderr));
  runs.finalize(root, { ...f.ids(root, "event-analysis-final"), run_id: "run-analysis", code_paths: ["analysis.cjs"], output_paths: ["result.json"], diagnostic_paths: ["diagnostics.json"], environment: { runtime: process.version }, deviations: [] });
  assert.ok(read(root).unfinished.some(item => item.reasons.includes("scientific_review_pending")));
  const fresh = incoming(root, "new-question", "Tell me what the completed analysis can establish before any report.", direct);
  const old = f.state(root).interpretations.find(item => item.interpretation_id === plan.interpretation_ref);
  f.record(root, "checkpoint", { checkpoint: { checkpoint_id: "checkpoint-summary", status: "assessing", primary_uncertainty: "What do the saved results support?", why_it_matters: "Keep causal and descriptive interpretations separate." } }, "event-checkpoint");
  const review = { review_id: "review-analysis", summary: "Mean 3 among three observed values.", assignment: { specialist_id: "design_worker", operation: "execution", design_id: "descriptive_association" },
    interpretation_ref: old.interpretation_id, question_addressed: "What does the completed descriptive analysis show?", selection_basis: { checkpoint_id: "checkpoint-summary", user_contribution_refs: old.incoming_refs },
    work_performed: ["Read the finalized result and count diagnostic."], findings: ["The saved mean is 3 and all three values are observed."], limitations: ["No treatment comparison or causal effect is established."], evidence_refs: ["data"] };
  // The explicitly assigned owner saves the original handoff before Lead resumes.
  f.record(root, "review_completed", { review, changes: { case_brief: { knowledge_refs: ["data"], work_refs: ["run-analysis", "review-analysis"] } } }, "event-review");
  const response = { ...f.emptyResponse("The completed analysis describes the three rows; a report has not been selected."), findings: { work_refs: ["run-analysis", "review-analysis"], summary: review.summary, diagnostics: ["Three observed values."], limitations: review.limitations } };
  const receipt = f.record(root, "exchange_prepared", { protocol: PROTOCOL, exchange: { exchange_id: "exchange-results", turn_id: fresh.turn_id, interpretation_ref: fresh.interpretation_id,
    reconciles: [old.interpretation_id], completed_work_refs: ["run-analysis", review.review_id], basis_refs: ["data"], renderer: "lead-markdown-v4",
    reconciliation: { changes: ["Accounted for the completed old work under the current question."], limitations: review.limitations, unresolved: [], next_direction: "The user can discuss further work or select a report." }, response } }, "event-results");
  f.deliver(root, receipt.exchange_id, "results");
  assert.equal(f.state(root).runs.length, 1);
  assert.equal(f.state(root).specialist_reviews.length, 1);
  const discussed = read(root);
  assert.match(discussed.markdown, /### Lead findings/);
  f.record(root, "memory_updated", { changes: { case_brief: { knowledge_refs: [], work_refs: [] } } }, "event-hide-discussed-narrative");
  const curated = read(root);
  assert.doesNotMatch(curated.markdown, /### Lead findings/);
  assert.deepEqual(curated.unfinished, discussed.unfinished);
  // Report eligibility uses the observed, version-current discussion in the
  // journal, even when its completed narrative is no longer displayed.
  const offer = f.prepareScope(root, { kind: "report", objective: "Report the discussed descriptive result", purpose: "Describe the supplied rows and limitations", claim_boundary: "No causal effect established.", inputs: [], evidence_refs: ["data"], format: "Markdown" }, { findings_refs: ["run-analysis", review.review_id] });
  assert.equal(f.state(root).runs.length, 1);
  const approved = f.acceptScope(root, offer, { user_text: "Write the descriptive report under those terms." });
  runs.start(root, { ...f.ids(root, "event-report-start"), run_id: "run-report", plan: approved });
  const { event_id, ...ids } = f.ids(root, "unused");
  runs.write(root, { ...ids, run_id: "run-report", path: "report.md", content: "Mean 3 among three supplied rows. No causal effect is established.\n" });
  runs.finalize(root, { ...f.ids(root, "event-report-final"), run_id: "run-report", code_paths: [], output_paths: ["report.md"], deliverable: { primary: "report.md" }, diagnostic_paths: [], environment: { runtime: process.version }, deviations: [] });
  const reportIt = f.state(root).interpretations.find(item => item.interpretation_id === approved.interpretation_ref);
  observed(root, reportIt, "report-final", f.emptyResponse("The selected descriptive report is saved. You may reopen the study later."), ["run-report"]);
  assert.equal(fs.readFileSync(path.join(root, "runs/run-analysis/result.json"), "utf8"), result);
  assert.equal(f.state(root).runs.filter(run => run.kind === "analysis").length, 1);
  assert.equal(f.state(root).specialist_reviews.filter(item => item.review_id === review.review_id).length, 1);
  assert.equal(read(root).file_current, true);
});
