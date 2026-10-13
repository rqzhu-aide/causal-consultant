"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const { spawnSync } = require("node:child_process");
const { main } = require("../scripts/project.cjs");
const store = require("../scripts/lib/store.cjs");
const runs = require("../scripts/lib/runs.cjs");
const delivery = require("../scripts/lib/delivery.cjs");

function project(t) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-cli-examples-"));
  t.after(() => { assert.equal(path.dirname(fs.realpathSync.native(root)), base); assert.ok(path.basename(root).startsWith("cc-cli-examples-")); fs.rmSync(root, { recursive: true, force: true }); });
  store.init(root, { project_id: "project-example", event_id: "event-init" });
  return root;
}
function submit(root, value, command = "record") {
  const file = path.join(root, "request.json"); fs.writeFileSync(file, JSON.stringify(value));
  return main([command, "--project-root", root, "--input", file]);
}
function rejectWithoutWrite(root, code, action) {
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(action, { code }); assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
}

test("CLI names bad commands and arguments, gives valid options, and does not mutate the project", t => {
  const root = project(t), journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  for (const [argv, rejected, options] of [
    [["record", "--file", "intake.json"], "--file", ["--project-root", "--input"]],
    [["record", "intake.json"], "intake.json", ["--project-root", "--input"]],
    [["record", "--event", "intake.json"], "--event", ["--project-root", "--input"]],
    [["record", "--input"], "--input", ["--project-root", "--input"]],
    [["record", "--project-root", root], "--input", ["--project-root", "--input"]],
    [["record", "--input", "a", "--input", "b"], "--input", ["--project-root", "--input"]],
    [["status", "--input", "a"], "--input", ["--project-root"]],
    [["capabilities", "--project-root", root], "--project-root", []]
  ]) {
    assert.throws(() => main(argv), error => {
      assert.equal(error.code, "INVALID_INPUT"); assert.ok(error.message.includes(rejected));
      assert.deepEqual(error.details.allowed_options, options); assert.ok(error.details.usage.startsWith("node scripts/project.cjs "));
      return true;
    });
  }
  for (const command of ["record-event", "constructor", "__proto__"]) {
    assert.throws(() => main([command, "--project-root", root]), error => {
      assert.equal(error.code, "INVALID_INPUT"); assert.ok(error.message.includes(command));
      assert.ok(error.details.allowed_commands.includes("record")); return true;
    });
  }
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
  const processResult = spawnSync(process.execPath, [path.resolve(__dirname, "../scripts/project.cjs"), "record", "--file", "intake.json"], { encoding: "utf8", windowsHide: true });
  assert.equal(processResult.status, 1);
  assert.deepEqual(JSON.parse(processResult.stdout).details.allowed_options, ["--project-root", "--input"]);
  assert.equal(main(["capabilities"]).ok, true);
});

test("conventional help forms are project-free and the patch example preserves actual source attribution", t => {
  for (const argv of [["help"], ["--help"]]) assert.equal(main(argv).ok, true);
  for (const command of main(["help"]).commands) {
    assert.deepEqual(main(["help", command]), main([command, "--help"]));
    assert.equal(main([command, "--help"]).command, command);
  }
  assert.throws(() => main(["help", "not-a-command"]), { code: "INVALID_INPUT" });
  const root = project(t);
  submit(root, { at: store.context(root, { mode: "brief" }).state_token, op: "memory_updated", changes: { evidence: [{ evidence_id: "source-help", kind: "user_statement", source_ref: "chat:source", source_excerpt: "We allocated offers by lottery.", summary: "User account of assignment." }] } }, "submit");
  const before = store.status(root).project.evidence[0];
  const patch = main(["submit", "--help"]).example_input;
  patch.at = store.context(root, { mode: "brief" }).state_token;
  patch.changes.evidence[0].evidence_id = before.evidence_id;
  submit(root, patch, "submit");
  const after = store.status(root).project.evidence[0];
  assert.equal(after.source_ref, before.source_ref);
  assert.equal(after.source_excerpt, before.source_excerpt);
  assert.deepEqual(after.limitations, patch.changes.evidence[0].patch.limitations);
});

test("documented requests execute from intake to findings and preserve scope and closeout rejections", t => {
  const root = project(t);
  const documentation = fs.readFileSync(path.resolve(__dirname, "../references/record-examples.md"), "utf8");
  const requests = [...documentation.matchAll(/```json\r?\n([\s\S]*?)\r?\n```/g)].map(match => JSON.parse(match[1]));
  assert.equal(requests.length, 5);
  const [intake, offer, accepted, start, closeout] = requests;
  fs.writeFileSync(path.join(root, "values.json"), "[1,3,5]\n");
  submit(root, intake);
  const incomplete = structuredClone(offer); delete incomplete.payload.changes.action_scopes[0].findings_refs;
  rejectWithoutWrite(root, "INVALID_INPUT", () => submit(root, incomplete));
  const mismatched = structuredClone(offer); mismatched.payload.changes.action_scopes[0].execution_plan.population = "A different population.";
  rejectWithoutWrite(root, "SCOPE_MISMATCH", () => submit(root, mismatched));
  const receipt = submit(root, offer);
  assert.equal(receipt.response_file_written, true);
  assert.equal(submit(root, offer).rendered_response, receipt.rendered_response);
  const saved = store.readJournal(root).events.at(-1).payload.exchange.response.next_steps[0];
  assert.deepEqual(saved.execution_plan, offer.payload.changes.action_scopes[0].execution_plan);
  assert.equal(store.status(root).project.runs.length, 0);
  const premature = { ...start, expected_last_event_id: "event-offer" };
  assert.throws(() => submit(root, premature, "start-run"), error => ["MISSING_INTERPRETATION", "INVALID_AUTHORIZATION", "UNKNOWN_REFERENCE"].includes(error.code));
  assert.equal(fs.existsSync(path.join(root, "runs/run-mean")), false);
  // The synthetic host emitted these exact bytes. Production uses actual host capture.
  fs.writeFileSync(path.join(root, "actual-message.txt"), receipt.rendered_response);
  delivery.observe(root, { event_id: "event-delivery", expected_project_id: "project-example", expected_last_event_id: "event-offer", delivery_id: "delivery-proposal", exchange_ref: "exchange-proposal", observation: "assistant_emission", message_path: "actual-message.txt", source_ref: "fixture-host:assistant-1" });
  const noProtocol = structuredClone(accepted); delete noProtocol.payload.protocol;
  rejectWithoutWrite(root, "INVALID_INPUT", () => submit(root, noProtocol));
  const misplacedAssignment = structuredClone(accepted); misplacedAssignment.payload.interpretation.next_action.specialist_id = "design_worker";
  rejectWithoutWrite(root, "INVALID_INPUT", () => submit(root, misplacedAssignment));
  submit(root, accepted);
  fs.appendFileSync(path.join(root, "values.json"), " ");
  rejectWithoutWrite(root, "INPUT_CHANGED", () => submit(root, start, "start-run"));
  assert.equal(fs.existsSync(path.join(root, "runs/run-mean")), false);
  fs.writeFileSync(path.join(root, "values.json"), "[1,3,5]\n");
  submit(root, start, "start-run");
  const code = "const fs=require('node:fs');const values=JSON.parse(fs.readFileSync('inputs/0001.json','utf8'));fs.writeFileSync('result.json',JSON.stringify({mean:values.reduce((a,b)=>a+b,0)/values.length}));fs.writeFileSync('diagnostics.json',JSON.stringify({rows:values.length,missing:values.filter(x=>x===null).length}));";
  runs.write(root, { expected_project_id: "project-example", expected_last_event_id: "event-start", run_id: "run-mean", path: "analysis.cjs", content: code });
  const execution = spawnSync(process.execPath, ["analysis.cjs"], { cwd: path.join(root, "runs/run-mean"), encoding: "utf8", windowsHide: true });
  assert.equal(execution.status, 0, execution.stderr);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, "runs/run-mean/result.json"))), { mean: 3 });
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, "runs/run-mean/diagnostics.json"))), { rows: 3, missing: 0 });
  runs.finalize(root, { event_id: "event-finalize", expected_project_id: "project-example", expected_last_event_id: "event-start", run_id: "run-mean", code_paths: ["analysis.cjs"], output_paths: ["result.json"], diagnostic_paths: ["diagnostics.json"], environment: { runtime: process.version, command: "node analysis.cjs", exit_code: execution.status }, deviations: [] });
  const omittedRun = structuredClone(closeout); omittedRun.payload.exchange.completed_work_refs = ["review-mean"];
  rejectWithoutWrite(root, "UNRECONCILED_WORK", () => submit(root, omittedRun));
  const omittedFindings = structuredClone(closeout); delete omittedFindings.payload.exchange.response.findings; omittedFindings.payload.exchange.response.status = "The work is complete.";
  rejectWithoutWrite(root, "FINDINGS_DISCUSSION_REQUIRED", () => submit(root, omittedFindings));
  const finished = submit(root, closeout);
  assert.equal(finished.response_file_written, true);
  const retried = submit(root, closeout); assert.equal(retried.replayed, true); assert.equal(retried.rendered_response, finished.rendered_response);
  assert.equal(store.status(root).project.runs.length, 1);
  assert.equal(runs.verify(root).ok, true);
});

test("the documented ordinary turn commits intake and reply together without manual identities or links", t => {
  const root = project(t);
  submit(root, { event_id: "event-current", expected_project_id: "project-example", expected_last_event_id: "event-init", type: "memory_updated", payload: { changes: { project_understanding: { materials: ["User context is available."] } } } });
  const documentation = fs.readFileSync(path.resolve(__dirname, "../references/authoring.md"), "utf8");
  const section = documentation.split("## One ordinary incoming turn")[1].split("## Selected work and corrections")[0];
  const requests = [...section.matchAll(/```json\r?\n([\s\S]*?)\r?\n```/g)].map(match => JSON.parse(match[1]));
  assert.equal(requests.length, 1);
  const request = requests[0];
  request.at = main(["context", "--project-root", root]).state_token;
  assert.notEqual(request.at, "project-example:event-init");
  assert.equal(request.op, "exchange_prepared");
  for (const [object, fields] of [
    [request, ["event_id", "expected_project_id", "expected_last_event_id", "protocol"]],
    [request.changes.evidence[0], ["evidence_id"]],
    [request.interpretation, ["interpretation_id", "turn_id"]],
    [request.exchange, ["exchange_id", "turn_id", "interpretation_ref", "renderer"]]
  ]) for (const field of fields) assert.equal(Object.hasOwn(object, field), false, field);
  const before = store.readJournal(root).events.length;
  const receipt = submit(root, request, "submit");
  const events = store.readJournal(root).events;
  assert.equal(events.length, before + 1);
  const { changes, interpretation, exchange } = events.at(-1).payload;
  assert.equal(events.at(-1).type, "exchange_prepared");
  assert.equal(changes.evidence[0].evidence_id, receipt.authoring_refs.incoming);
  assert.equal(interpretation.interpretation_id, receipt.authoring_refs.intake);
  assert.deepEqual(interpretation.incoming_refs, [receipt.authoring_refs.incoming]);
  assert.equal(exchange.exchange_id, receipt.authoring_refs.reply);
  assert.equal(exchange.interpretation_ref, interpretation.interpretation_id);
  assert.equal(exchange.turn_id, interpretation.turn_id);
  assert.deepEqual(exchange.basis_refs.map(item => typeof item === "string" ? item : item.ref), [receipt.authoring_refs.incoming]);
  assert.equal(receipt.response_file_written, true);
  assert.equal(fs.readFileSync(path.resolve(root, receipt.response_path), "utf8"), receipt.rendered_response);
  assert.equal(store.status(root).project.runs.length, 0);
});

test("the CLI still rejects an unsourced consultant question closure without a journal write", t => {
  const root = project(t);
  submit(root, { event_id: "event-question", expected_project_id: "project-example", expected_last_event_id: "event-init", type: "memory_updated", payload: { changes: { questions: [{ question_id: "question-capacity", origin: "consultant", statement: "What is the capacity?", status: "open" }] } } });
  rejectWithoutWrite(root, "MISSING_QUESTION_RESOLUTION", () => submit(root, { event_id: "event-answer", expected_project_id: "project-example", expected_last_event_id: "event-question", type: "memory_updated", payload: { changes: { questions: [{ question_id: "question-capacity", patch: { status: "answered", reason: "The user supplied a number." } }] } } }));
});
