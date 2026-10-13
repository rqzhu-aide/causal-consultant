#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const crypto = require("node:crypto");
const { version } = require("../package.json");
const store = require("./lib/store.cjs");
const v8 = require("./lib/v8/store.cjs");
const { fail, rootPath, recoverLock } = require("./lib/files.cjs");

const COMMAND_OPTIONS = {
  capabilities: [], init: ["project-root", "input"], status: ["project-root"], context: ["project-root", "input"], record: ["project-root", "input"], submit: ["project-root", "input"],
  history: ["project-root", "event-id", "record-id", "type", "query", "cursor", "limit"],
  recover: ["project-root", "repair-tail"], "recover-lock": ["project-root", "token"],
  "start-run": ["project-root", "input"], "write-run-file": ["project-root", "input"],
  "finalize-run": ["project-root", "input"], "fail-run": ["project-root", "input"],
  "abandon-run": ["project-root", "input"], "observe-exchange": ["project-root", "input"], verify: ["project-root", "source-check"]
};
for (const command of ["init", "status", "context", "record", "submit", "observe-exchange",
  "start-run", "write-run-file", "finalize-run", "fail-run", "abandon-run"]) COMMAND_OPTIONS[command].push("output-format");
function commandError(command, message) {
  const options = Object.hasOwn(COMMAND_OPTIONS, command) ? COMMAND_OPTIONS[command] : null;
  const usage = "node scripts/project.cjs " + (options ? command : "<command>") +
    (command === "capabilities" ? "" : " --project-root <folder>") + (options?.includes("input") ? " --input <json-file|->" : "");
  fail("INVALID_INPUT", message + (options ? " Valid options: " + (options.map(key => "--" + key).join(", ") || "none") + "." :
    " Valid commands: " + Object.keys(COMMAND_OPTIONS).join(", ") + ", help.") + " Usage: " + usage,
  { command, ...(options ? { allowed_options: options.map(key => "--" + key) } : { allowed_commands: [...Object.keys(COMMAND_OPTIONS), "help"] }), usage });
}
function args(argv) {
  const result = { command: argv[0], options: {} };
  if (result.command && result.command !== "help" && !Object.hasOwn(COMMAND_OPTIONS, result.command)) commandError(result.command, "Unknown command: " + result.command + ".");
  for (let i = 1; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith("--")) commandError(result.command, "Unexpected positional argument: " + key + ". Pass JSON files with --input <json-file|->.");
    if (Object.hasOwn(result.options, key.slice(2))) commandError(result.command, "Duplicate option: " + key + ".");
    if (result.command !== "help" && !COMMAND_OPTIONS[result.command].includes(key.slice(2))) commandError(result.command, "Unknown option: " + key + ".");
    if (key === "--repair-tail") { result.options["repair-tail"] = true; continue; }
    if (argv[i + 1] === undefined || argv[i + 1].startsWith("--")) commandError(result.command, "Missing value: " + key + ".");
    result.options[key.slice(2)] = argv[++i];
  }
  return result;
}
function readInput(file, command) {
  if (!file) commandError(command, "--input <json-file|-> is required for this operation.");
  try { return JSON.parse(fs.readFileSync(file === "-" ? 0 : file, "utf8")); }
  catch (error) { fail("INVALID_INPUT", "Could not read JSON input: " + error.message); }
}
function operationHelp(command) {
  if (!Object.hasOwn(COMMAND_OPTIONS, command)) commandError(command, "Unknown help command: " + command + ".");
  const examples = {
    context: { mode: "brief" },
    submit: { at: "<state_token>", op: "memory_updated", changes: { evidence: [{ evidence_id: "<existing-evidence-id>", patch: { limitations: ["The source describes assignment but does not independently verify it."] } }] } },
    "observe-exchange": { at: "<state_token>", op: "observe-exchange", exchange_ref: "<previous-exchange>", observation: "agent_recorded", source_ref: "conversation:<previous-assistant-reply>", agent_recording: { before_incoming_ref: "<retained-new-user-source>", items: [{ kind: "question", display_label: "Q1", text: "<complete question actually asked>", question_ref: "<matching-saved-question>" }] } },
    "start-run": { at: "<state_token>", op: "start-run", scope_ref: "<accepted-scope>", interpretation_ref: "<selection-interpretation>", authorization_ref: "<accepted-decision>" },
    "write-run-file": { at: "<state_token>", op: "write-run-file", run_id: "<run-id>", path: "outputs/report.md", content: "<report text>" },
    "finalize-run": { at: "<state_token>", op: "finalize-run", run_id: "<run-id>", code_paths: [], output_paths: ["outputs/report.md"], diagnostic_paths: [], deliverable: { primary: "outputs/report.md" }, environment: { authoring: "<tools and checks actually used>" }, deviations: [] },
    "fail-run": { at: "<state_token>", op: "fail-run", run_id: "<run-id>", reason: "<failure>" },
    "abandon-run": { at: "<state_token>", op: "abandon-run", run_id: "<run-id>", reason: "<reason>" }
  };
  const currentExamples = {
    init: { case: "case-example" }, context: { mode: "brief" },
    submit: { at: "<state_token>", op: "user_message", text: "<complete original user message>", source: "conversation:<source>", complete: true },
    "observe-exchange": { at: "<state_token>", op: "reply_recorded", prepared: "<prepared-entry>", before_user: "<new-user-message-entry>",
      source: { kind: "assistant_recorded", locator: "conversation:<actual-previous-reply>" },
      items: [{ kind: "question", label: "Q1", text: "<complete question actually asked>", question_ref: "<question-id>" }] },
    "start-run": { at: "<state_token>", op: "start-run", responds_to: "<handling-entry>", scope: "<accepted-scope>", decision: "<acceptance-entry>" },
    "write-run-file": { at: "<state_token>", op: "write-run-file", run: "<start-entry>", path: "outputs/report.md", content: "<report text>" },
    "finalize-run": { at: "<state_token>", op: "finalize-run", run: "<start-entry>", code_paths: [], output_paths: ["outputs/report.md"],
      diagnostic_paths: [], deliverable: { primary: "outputs/report.md" }, environment: { authoring: "<actual tools>" }, deviations: [] },
    "fail-run": { at: "<state_token>", op: "fail-run", run: "<start-entry>", reason: "<failure>" },
    "abandon-run": { at: "<state_token>", op: "abandon-run", run: "<start-entry>", reason: "<reason>" }
  };
  const input = currentExamples[command];
  const viaSubmit = input?.op !== undefined;
  const invoked = viaSubmit ? "submit" : command;
  return { ok: true, version, command, options: COMMAND_OPTIONS[command].map(key => "--" + key),
    usage: "node scripts/project.cjs " + invoked + (command === "capabilities" ? "" : " --project-root <folder>") + (input || COMMAND_OPTIONS[command].includes("input") ? " --input <project>/scratch/request.json" : ""),
    ...(input ? { example_input: input } : {}),
    ...(examples[command] ? { legacy_v7_example: examples[command] } : {}),
    ...(COMMAND_OPTIONS[command].includes("output-format") ? { output_formats: ["compact-v2", "compact-v1", "legacy"], default_output_format: "compact-v2 for v8; legacy for v7" } : {}),
    ...(command === "context" ? { exact_record_example: { mode: "record", records: ["q1@e12"] },
      exact_record_output: "v8 returns the exact saved definition; v7 keeps its record_ref/event_ref interface in references/v7/memory.md." } : {}),
    reference: ["start-run", "write-run-file", "finalize-run", "fail-run", "abandon-run", "verify"].includes(command) ? "references/runs.md" : "references/authoring.md" };
}
function main(argv) {
  if (argv.length === 1 && argv[0] === "--help") argv = ["help"];
  if (argv.length === 2 && argv[0] === "help") return operationHelp(argv[1]);
  if (argv.length === 2 && argv[1] === "--help") return operationHelp(argv[0]);
  const { command, options } = args(argv);
  if (!command || command === "help") {
    return { ok: true, version, commands: [
      "capabilities", "init", "status", "context", "record", "submit", "history", "recover", "recover-lock",
      "observe-exchange", "start-run", "write-run-file", "finalize-run", "fail-run", "abandon-run", "verify"
    ], usage: "node scripts/project.cjs <command> --project-root <folder> [--input <json-file|->]",
    authoring: "New cases use consultation-journal-v8. Submit at: state_token, op: entry type or run command, and meaningful content. The utility allocates identities under the lock and derives project/brief/index. Read references/authoring.md. Existing v7 cases retain their format and references/v7 contracts. New v8 public replies keep four sections and flat A/Q/N labels. Options have a 50-word maximum; other complete items normally stay within 50 words, with up to 200 for explicitly requested answers or clarification.",
    guidance: 'Resume through context with {"mode":"brief"}; use exact refs such as q1@e12 when needed. Helper saves incoming words and consequential handling before dependent work; specialists return one bounded assessment; Lead adopts changes and prepares the reply. Only the utility writes generated memory. Actual preceding replies are recorded at the next appropriate resume; native capture is optional. Tests and scientific validity are separate from successful recording.' };
  }
  if (command === "capabilities") {
    if (Object.keys(options).length) fail("INVALID_INPUT", "capabilities takes no options and needs no project root.");
    return { ...v8.capabilities(), legacy: store.capabilities() };
  }
  const root = options["project-root"];
  if (!root) commandError(command, "--project-root is required.");
  const outputFormat = options["output-format"];
  if (outputFormat !== undefined && !["legacy", "compact-v1", "compact-v2"].includes(outputFormat)) commandError(command, "--output-format must be legacy, compact-v1 or compact-v2.");
  const input = command === "init" && options.input ? readInput(options.input, command) : undefined;
  const format = v8.formatAt(root);
  const legacyInit = input?.format === "v7" || input?.project_id !== undefined || input?.event_id !== undefined;
  if (format === v8.FORMAT || command === "init" && format === null && !legacyInit) {
    if (outputFormat !== undefined && outputFormat !== "compact-v2") commandError(command, "v8 cases support --output-format compact-v2; omit the option for the default.");
    if (command === "init") return v8.init(root, input || {});
    if (command === "status") return v8.status(root);
    if (command === "context") return v8.context(root, options.input ? readInput(options.input, command) : { mode: "brief" });
    if (command === "history") return v8.history(root, { event_id: options["event-id"], record_id: options["record-id"], type: options.type,
      query: options.query, cursor: options.cursor, limit: options.limit });
    if (command === "recover") return v8.recover(root, { repair_tail: options["repair-tail"] === true });
    if (command === "recover-lock") return { ok: true, ...recoverLock(rootPath(root), options.token) };
    if (command === "verify") return v8.verify(root, options["source-check"] === undefined ? {} : { source_check: options["source-check"] });
    const submitted = readInput(options.input, command);
    if (command === "submit" || command === "record") return v8.submit(root, submitted);
    return v8.submit(root, { ...submitted, op: command === "observe-exchange" ? "reply_recorded" : command });
  }
  if (outputFormat === "compact-v2") commandError(command, "v7 cases support --output-format legacy or compact-v1.");
  // Formatting is outside mutation input and request fingerprints, including retries.
  const finish = value => outputFormat === "compact-v1" ? require("./lib/compact-memory.cjs").compactReceipt(value) : value;
  if (command === "init") {
    if (input) { const { format: ignoredFormat, ...legacyInput } = input; return finish(store.init(root, legacyInput)); }
    try {
      const existing = store.status(root);
      return finish({ ok: true, already_initialized: true, project_id: existing.project.state_meta.project_id,
        last_event_id: existing.project.state_meta.last_event_id, sequence: existing.project.state_meta.sequence,
        state_token: require("./lib/authoring.cjs").stateToken(existing.project.state_meta.project_id, existing.project.state_meta.last_event_id) });
    } catch (error) {
      if (error.code !== "NO_PROJECT") throw error;
    }
    return finish(store.init(root, { project_id: "project-" + crypto.randomUUID(), event_id: "event-" + crypto.randomUUID() }));
  }
  if (command === "status") return store.status(root, outputFormat);
  if (command === "context") return store.context(root, options.input ? readInput(options.input, command) : {}, outputFormat);
  if (command === "record") return finish(store.record(root, readInput(options.input, command)));
  if (command === "submit") return finish(require("./lib/authoring.cjs").submit(root, readInput(options.input, command)));
  if (command === "observe-exchange") return finish(require("./lib/delivery.cjs").observe(root, readInput(options.input, command)));
  if (command === "history") return store.history(root, {
    event_id: options["event-id"], record_id: options["record-id"], type: options.type,
    query: options.query, cursor: options.cursor, limit: options.limit
  });
  if (command === "recover") return store.recover(root, { repair_tail: options["repair-tail"] === true });
  if (command === "recover-lock") return { ok: true, ...recoverLock(rootPath(root), options.token) };
  const runs = require("./lib/runs.cjs");
  if (command === "verify") return runs.verify(root, options["source-check"] === undefined ? {} : { source_check: options["source-check"] });
  const operation = { "start-run": "start", "write-run-file": "write",
    "finalize-run": "finalize", "fail-run": "failRun", "abandon-run": "abandon" }[command];
  return finish(runs[operation](root, readInput(options.input, command)));
}

if (require.main === module) {
  try {
    const result = main(process.argv.slice(2));
    process.stdout.write(JSON.stringify(result) + "\n");
    if (result.ok === false) process.exitCode = 1;
  } catch (error) {
    process.stdout.write(JSON.stringify({ ok: false, code: error.code || "INTERNAL_ERROR",
      message: error.message, ...(error.details === undefined ? {} : { details: error.details }) }) + "\n");
    process.exitCode = 1;
  }
}
module.exports = { main };
