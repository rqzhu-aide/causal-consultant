"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {
  fail, canonical, sha256, rootPath, safePath, ensureDirectory, readFile,
  writeNew, withLock, assertNotLegacy
} = require("./files.cjs");
const { jsonValue, object, text, id, enumeration, array, strings } = require("./model.cjs");
const { validatePlanStructure } = require("./plan-validation.cjs");
const store = require("./store.cjs");
const authorizations = require("./authorizations.cjs");

const IDENTITIES = ["event_id", "expected_project_id", "expected_last_event_id"];
function requestShape(request, required, optional = [], withEvent = true) {
  jsonValue(request);
  object(request, "request", [...(withEvent ? IDENTITIES : IDENTITIES.slice(1)), ...required], optional);
  if (withEvent) id(request.event_id, "event_id");
  id(request.expected_project_id, "expected_project_id");
  if (request.expected_last_event_id !== null) id(request.expected_last_event_id, "expected_last_event_id");
  id(request.run_id, "run_id");
}
function runPrefix(runId) { id(runId, "run_id"); return "runs/" + runId; }
function getRun(state, runId, active = false) {
  id(runId, "run_id");
  const run = state.runs.find(value => value.run_id === runId);
  if (!run) fail("UNKNOWN_RUN", "No committed run has this ID: " + runId);
  if (active && run.status !== "in_progress") fail("RUN_IMMUTABLE", "Only an in-progress run accepts new files or finalization.");
  return run;
}
function knownEvidence(state, evidenceId) {
  id(evidenceId, "evidence_ref");
  const evidence = state.evidence.find(value => value.evidence_id === evidenceId);
  if (!evidence) fail("UNKNOWN_REFERENCE", "Unknown evidence reference: " + evidenceId);
  return evidence;
}
function validatePlan(plan, state) {
  validatePlanStructure(plan);
  validateRunInterpretation(plan, state);
  if (plan.kind === "report") for (const evidenceId of plan.evidence_refs) knownEvidence(state, evidenceId);
}
function validateRunInterpretation(plan, state) {
  if (!Object.hasOwn(plan, "interpretation_ref")) {
    if (state.state_meta.protocol) fail("MISSING_INTERPRETATION", "A new protocol run needs its prospectively recorded interpretation_ref.");
    return;
  }
  id(plan.interpretation_ref, "plan.interpretation_ref");
  const interpretation = (state.interpretations || []).find(item => item.interpretation_id === plan.interpretation_ref);
  const turn = (state.turns || []).find(item => item.interpretation_ref === plan.interpretation_ref);
  if (!interpretation || !turn) fail("UNKNOWN_REFERENCE", "Run interpretation must identify a committed consultation turn.");
  if (turn.exchange_ref) fail("TURN_CLOSED", "Record the new direction before starting more work for a closed turn.");
  const action = interpretation.next_action;
  if (action.kind !== "specialist") fail("ASSIGNMENT_MISMATCH", "A lead-only interpretation does not select output-producing specialist work.");
  const assignment = action.assignment;
  const required = { analysis: ["design_worker", "execution"], discovery: ["causal_discovery", "discovery"], report: ["report_writer", "reporting"] }[plan.kind];
  if (required && (assignment.specialist_id !== required[0] || assignment.operation !== required[1])) {
    fail("ASSIGNMENT_MISMATCH", "Run kind does not match the prospectively selected specialist operation.");
  }
  if (plan.kind === "analysis" && (plan.design_id !== assignment.design_id ||
      canonical([...(plan.additional_design_ids || [])].sort()) !== canonical([...(assignment.additional_design_ids || [])].sort()))) {
    fail("ASSIGNMENT_MISMATCH", "Run design guides do not match the recorded assignment.");
  }
  if (plan.kind === "audit" && plan.transformations && (assignment.specialist_id !== "data_audit" || assignment.operation !== "prepare")) {
    fail("ASSIGNMENT_MISMATCH", "A transformation run requires the recorded data preparation operation.");
  }
}
function fileDigestAbsolute(filePath) {
  const fd = fs.openSync(filePath, "r");
  try {
    const before = fs.fstatSync(fd);
    if (!before.isFile()) fail("INVALID_INPUT", "Input must be a regular file: " + filePath);
    const hash = crypto.createHash("sha256");
    const buffer = Buffer.allocUnsafe(64 * 1024);
    let bytes = 0;
    let read;
    while ((read = fs.readSync(fd, buffer, 0, buffer.length, null)) > 0) {
      hash.update(buffer.subarray(0, read));
      bytes += read;
    }
    const after = fs.fstatSync(fd);
    if (before.size !== after.size || before.mtimeMs !== after.mtimeMs || bytes !== after.size) fail("INPUT_CHANGED", "File changed while it was being hashed: " + filePath);
    return { sha256: hash.digest("hex"), bytes };
  } finally { fs.closeSync(fd); }
}
function fileDigest(root, relative) { return fileDigestAbsolute(safePath(root, relative)); }
function inputSource(root, input) {
  const source_path = path.resolve(root, input.path);
  const resolved_source_path = fs.realpathSync.native(source_path);
  const digest = fileDigestAbsolute(resolved_source_path);
  if (input.sha256 && input.sha256 !== digest.sha256) fail("INPUT_CHANGED", "Input does not match its expected hash: " + input.source_ref);
  return { source_ref: input.source_ref, path: input.path, source_path, resolved_source_path, source_sha256: digest.sha256, bytes: digest.bytes };
}
function extension(sourcePath) {
  const ext = path.extname(sourcePath);
  return /^\.[a-z0-9]{1,12}$/i.test(ext) ? ext.toLowerCase() : ".bin";
}
function parseFile(root, relative, label) { return store.parseJSON(readFile(root, relative), label); }
function frozenPlan(root, run) {
  const bytes = readFile(root, run.plan_ref);
  if (sha256(bytes) !== run.plan_sha256) fail("PLAN_CHANGED", "The frozen plan changed: " + run.plan_ref);
  const plan = store.parseJSON(bytes, "Run plan");
  if (plan.run_id !== run.run_id || plan.kind !== run.kind) fail("PLAN_CHANGED", "Plan identity does not match its committed run.");
  if (plan.interpretation_ref !== run.interpretation_ref) fail("PLAN_CHANGED", "Plan interpretation does not match its committed run attribution.");
  if (canonical(plan.authorization_binding || null) !== canonical(run.authorization_binding || null)) fail("PLAN_CHANGED", "Plan permission binding does not match its committed run.");
  return plan;
}
function checkInputs(root, plan, sourceCheck = true) {
  for (const input of plan.inputs) {
    const snapshot = fileDigest(root, input.snapshot_ref);
    if (snapshot.sha256 !== input.snapshot_sha256 || snapshot.bytes !== input.bytes) fail("INPUT_CHANGED", "Input snapshot changed: " + input.snapshot_ref);
    if (sourceCheck) {
      const actual = fs.realpathSync.native(input.source_path);
      if (actual !== input.resolved_source_path || fileDigestAbsolute(actual).sha256 !== input.source_sha256) {
        fail("SOURCE_CHANGED", "Original input changed after the snapshot: " + input.source_ref);
      }
    }
  }
}
function manifestFor(root, run) {
  if (run.status !== "completed" || !run.manifest_ref || !run.manifest_sha256) fail("INCOMPLETE_RUN", "Evidence requires a completed, manifested run.");
  const bytes = readFile(root, run.manifest_ref);
  if (sha256(bytes) !== run.manifest_sha256) fail("MANIFEST_CHANGED", "The committed manifest changed: " + run.manifest_ref);
  const manifest = store.parseJSON(bytes, "Run manifest");
  if (manifest.run_id !== run.run_id) fail("MANIFEST_CHANGED", "Manifest identity does not match its run.");
  return manifest;
}
function assertComputedEvidence(root, state, evidence) {
  if (evidence.kind !== "computed") return;
  if (evidence.legacy) fail("INVALID_INPUT", "Legacy findings are source evidence, not newly computed v7 results.");
  const run = getRun(state, evidence.run_id);
  const manifest = manifestFor(root, run);
  const plan = frozenPlan(root, run);
  checkInputs(root, plan, false);
  const prefix = runPrefix(run.run_id) + "/";
  if (typeof evidence.source_ref !== "string" || !evidence.source_ref.startsWith(prefix)) fail("UNKNOWN_REFERENCE", "Computed evidence must name a project-relative file in its completed run.");
  const relative = evidence.source_ref.slice(prefix.length);
  safePath(root, evidence.source_ref);
  if (!manifest.output_paths.includes(relative) && !manifest.diagnostic_paths.includes(relative)) fail("UNKNOWN_REFERENCE", "Computed evidence must identify a manifested output or diagnostic.");
  const entry = manifest.files.find(file => file.path === relative);
  if (!entry || fileDigest(root, evidence.source_ref).sha256 !== entry.sha256) fail("ARTIFACT_CHANGED", "Computed evidence file does not match its manifest.");
  if (evidence.source_sha256 && evidence.source_sha256 !== entry.sha256) fail("ARTIFACT_CHANGED", "Computed evidence hash does not match its manifested file.");
}
function evidenceBindings(root, state, plan) {
  return (plan.evidence_refs || []).map(evidenceId => {
    const record = knownEvidence(state, evidenceId);
    if (record.kind === "computed") assertComputedEvidence(root, state, record);
    const binding = {
      evidence_id: evidenceId, event_ref: state.history_index[evidenceId].event_ref,
      kind: record.kind, source_ref: record.source_ref, summary: record.summary
    };
    for (const key of ["source_sha256", "source_excerpt", "legacy", "limitations"]) if (Object.hasOwn(record, key)) binding[key] = structuredClone(record[key]);
    const conditions = state.result_conditions || [];
    const superseded = new Set(conditions.map(item => item.supersedes).filter(Boolean));
    const applicable = conditions.filter(item => item.evidence_ref === evidenceId && !superseded.has(item.condition_id));
    binding.condition_coverage = applicable.length ? "linked" : "unreviewed";
    binding.condition_bindings = applicable.map(condition => ({
      ...structuredClone(condition), event_ref: state.history_index[condition.condition_id].event_ref,
      assumption_bindings: condition.assumption_refs.map(assumptionId => {
        const assumption = state.assumptions.find(item => item.assumption_id === assumptionId);
        if (!assumption) fail("UNKNOWN_REFERENCE", "A result condition refers to a missing assumption: " + assumptionId);
        return { ...structuredClone(assumption), event_ref: state.history_index[assumptionId].event_ref };
      })
    }));
    if (record.run_id) {
      const run = getRun(state, record.run_id);
      const manifest = manifestFor(root, run);
      binding.run_id = run.run_id;
      binding.manifest_ref = run.manifest_ref;
      binding.manifest_sha256 = run.manifest_sha256;
      binding.plan_ref = run.plan_ref;
      binding.plan_sha256 = run.plan_sha256;
      binding.artifact_sha256 = manifest.files.find(file => runPrefix(run.run_id) + "/" + file.path === record.source_ref).sha256;
    }
    return binding;
  });
}
function checkBoundInputHashes(bindings, inputs) {
  for (const binding of bindings || []) {
    const expected = binding.artifact_sha256 || binding.source_sha256;
    if (!expected) continue;
    for (const input of inputs.filter(value => value.source_ref === binding.source_ref)) {
      if (input.source_sha256 !== expected || (input.snapshot_sha256 && input.snapshot_sha256 !== expected)) {
        fail("SOURCE_CHANGED", "Report input does not match its selected evidence version: " + binding.source_ref);
      }
    }
  }
}
// The same read-only resolution is used before presenting a fresh proposal and
// immediately before starting it. It neither grants permission nor writes files.
function resolvePlanSources(root, state, plan, { offer = false } = {}) {
  const sources = plan.inputs.flatMap(input => {
    if (offer && input.deferred_release) {
      if (fs.existsSync(path.resolve(root, input.path))) fail("UNBOUND_SCOPE_INPUT", "An available input must be hashed before its scope is offered: " + input.source_ref);
      return [];
    }
    return [inputSource(root, input)];
  });
  const bindings = evidenceBindings(root, state, plan);
  checkBoundInputHashes(bindings, sources);
  return { sources, bindings };
}
function checkEvidenceBindings(root, plan) {
  checkBoundInputHashes(plan.evidence_bindings, plan.inputs);
  for (const binding of plan.evidence_bindings || []) {
    if (binding.kind !== "computed") continue;
    const sourcePlanBytes = readFile(root, binding.plan_ref);
    if (sha256(sourcePlanBytes) !== binding.plan_sha256) fail("SOURCE_CHANGED", "A report's bound source plan changed: " + binding.plan_ref);
    const sourcePlan = store.parseJSON(sourcePlanBytes, "Bound source plan");
    checkInputs(root, sourcePlan, false);
    const manifestBytes = readFile(root, binding.manifest_ref);
    if (sha256(manifestBytes) !== binding.manifest_sha256) fail("SOURCE_CHANGED", "A report's bound source manifest changed: " + binding.manifest_ref);
    const manifest = store.parseJSON(manifestBytes, "Bound source manifest");
    const prefix = runPrefix(binding.run_id) + "/";
    if (!binding.source_ref.startsWith(prefix)) fail("UNKNOWN_REFERENCE", "Invalid bound report source reference.");
    const relative = binding.source_ref.slice(prefix.length);
    const entry = manifest.files.find(file => file.path === relative);
    if (manifest.run_id !== binding.run_id || !entry || entry.sha256 !== binding.artifact_sha256 ||
        (!manifest.output_paths.includes(relative) && !manifest.diagnostic_paths.includes(relative)) ||
        fileDigest(root, binding.source_ref).sha256 !== binding.artifact_sha256) {
      fail("SOURCE_CHANGED", "A report's bound source artifact no longer matches: " + binding.source_ref);
    }
  }
}

function start(projectRoot, request, options = {}) {
  requestShape(request, ["run_id"], ["plan", "scope_ref", "interpretation_ref", "authorization_ref", "parent_run_id"]);
  return store.transact(projectRoot, request, ({ root, state }) => {
    const refs = ["scope_ref", "interpretation_ref", "authorization_ref"];
    let executionPlan;
    if (Object.hasOwn(request, "plan")) {
      if (refs.some(key => Object.hasOwn(request, key))) fail("INVALID_INPUT", "start-run takes either plan or the three scope/interpretation/authorization references, not both.");
      executionPlan = request.plan;
    } else {
      for (const key of refs) id(request[key], key);
      const scope = (state.action_scopes || []).find(item => item.scope_id === request.scope_ref);
      if (!scope) fail("UNKNOWN_REFERENCE", "start-run requires a committed protected scope.");
      executionPlan = { ...authorizations.executionPlanForAuthorization(state, scope, request.authorization_ref), ...Object.fromEntries(refs.map(key => [key, request[key]])) };
    }
    validatePlan(executionPlan, state);
    const authorization_binding = authorizations.validateRunStart(state, executionPlan);
    if (state.runs.some(run => run.run_id === request.run_id)) fail("RUN_EXISTS", "Run identity is already committed.");
    if (request.run_id === request.event_id || Object.hasOwn(state.history_index, request.run_id)) {
      fail("DUPLICATE_ID", "Run identity conflicts with another project record: " + request.run_id);
    }
    if (request.parent_run_id !== undefined) {
      id(request.parent_run_id, "parent_run_id");
      if (request.parent_run_id === request.run_id) fail("INVALID_INPUT", "A run cannot be its own parent.");
      getRun(state, request.parent_run_id);
    }
    const prefix = runPrefix(request.run_id);
    const target = safePath(root, prefix);
    if (fs.existsSync(target)) fail("ORPHAN_RUN", "Run directory already exists and will not be adopted: " + prefix);
    const { sources, bindings } = resolvePlanSources(root, state, executionPlan);
    ensureDirectory(root, "runs");
    fs.mkdirSync(target);
    ensureDirectory(root, prefix + "/inputs");
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      source.snapshot_ref = prefix + "/inputs/" + String(i + 1).padStart(4, "0") + extension(source.source_path);
      const destination = safePath(root, source.snapshot_ref);
      fs.copyFileSync(source.resolved_source_path, destination, fs.constants.COPYFILE_EXCL);
      const fd = fs.openSync(safePath(root, source.snapshot_ref), "r+");
      try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
      const snapshot = fileDigest(root, source.snapshot_ref);
      if (snapshot.sha256 !== source.source_sha256 || snapshot.bytes !== source.bytes) fail("INPUT_CHANGED", "Input changed during snapshot creation: " + source.source_ref);
      source.snapshot_sha256 = snapshot.sha256;
    }
    const started_at = new Date().toISOString();
    const plan = { ...structuredClone(executionPlan), plan_schema_version: 1, run_id: request.run_id, frozen_at: started_at, inputs: sources };
    if (plan.kind === "report") plan.report_contract = require("./deliverables.cjs").CONTRACT;
    if (authorization_binding) plan.authorization_binding = structuredClone(authorization_binding);
    if (bindings.length) plan.evidence_bindings = bindings;
    checkInputs(root, plan);
    const plan_ref = prefix + "/plan.yaml";
    const serialized = JSON.stringify(plan, null, 2) + "\n";
    writeNew(root, plan_ref, serialized);
    const run = { run_id: request.run_id, kind: plan.kind, status: "in_progress", plan_ref, plan_sha256: sha256(serialized), claim_boundary: plan.claim_boundary, started_at };
    if (plan.interpretation_ref) run.interpretation_ref = plan.interpretation_ref;
    if (authorization_binding) run.authorization_binding = structuredClone(authorization_binding);
    if (request.parent_run_id !== undefined) run.parent_run_id = request.parent_run_id;
    return { type: "run_started", payload: { run }, result: { run_path: safePath(root, prefix), plan_ref, inputs: sources } };
  }, { ...options, eventType: "run_started" });
}

function write(projectRoot, request) {
  requestShape(request, ["run_id", "path", "content"], [], false);
  text(request.path, "path");
  if (typeof request.content !== "string") fail("INVALID_INPUT", "content must be text.");
  const relative = request.path.replace(/\\/g, "/");
  const protectedPath = relative.toLowerCase();
  if (["plan.yaml", "manifest.json"].includes(protectedPath) || protectedPath === "inputs" || protectedPath.startsWith("inputs/")) fail("RUN_IMMUTABLE", "Plans, snapshots, and manifests cannot be written through this helper.");
  const root = rootPath(projectRoot);
  return withLock(root, () => {
    const { state } = store.readJournal(root);
    if (request.expected_project_id !== state.state_meta.project_id) fail("WRONG_PROJECT", "This write belongs to a different project.");
    if (request.expected_last_event_id !== state.state_meta.last_event_id) fail("STALE_WRITE", "Reload state before writing the run file.");
    const run = getRun(state, request.run_id, true);
    const plan = frozenPlan(root, run);
    const destination = runPrefix(run.run_id) + "/" + relative;
    const target = safePath(root, destination);
    const digest = sha256(request.content);
    if (fs.existsSync(target)) {
      if (fileDigest(root, destination).sha256 !== digest) fail("FILE_EXISTS", "Use a new filename for changed content; this file was not overwritten.");
      return { ok: true, run_id: run.run_id, path: destination, sha256: digest, replayed: true };
    }
    authorizations.validateRunContinuation(state, run, plan);
    checkInputs(root, plan);
    checkEvidenceBindings(root, plan);
    const parent = path.posix.dirname(destination);
    ensureDirectory(root, parent);
    writeNew(root, destination, request.content);
    return { ok: true, run_id: run.run_id, path: destination, sha256: digest, replayed: false };
  });
}

function inventory(root, prefix, excludeManifest = false) {
  const files = [];
  function visit(relative) {
    const target = safePath(root, relative);
    for (const entry of fs.readdirSync(target, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const child = relative + "/" + entry.name;
      const checked = safePath(root, child);
      const stat = fs.lstatSync(checked);
      if (stat.isDirectory()) visit(child);
      else if (stat.isFile()) {
        const local = child.slice(prefix.length + 1);
        if (excludeManifest && local === "manifest.json") continue;
        files.push({ path: local, ...fileDigest(root, child) });
      } else fail("UNSAFE_PATH", "Run contains a nonregular file: " + child);
    }
  }
  visit(prefix);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}
function declaredPaths(root, prefix, value, label) {
  strings(value, label);
  const normalized = value.map(item => item.replace(/\\/g, "/"));
  if (new Set(normalized).size !== normalized.length) fail("INVALID_INPUT", label + " contains duplicate paths.");
  for (const relative of normalized) {
    const protectedPath = relative.toLowerCase();
    if (protectedPath === "plan.yaml" || protectedPath === "manifest.json" || protectedPath.startsWith("inputs/")) fail("INVALID_INPUT", label + " cannot classify a frozen plan, snapshot, or manifest as an output.");
    safePath(root, prefix + "/" + relative);
    if (!fs.statSync(safePath(root, prefix + "/" + relative)).isFile()) fail("INVALID_INPUT", label + " must identify regular files.");
  }
  return normalized;
}
function finalize(projectRoot, request, options = {}) {
  requestShape(request, ["run_id", "code_paths", "output_paths", "diagnostic_paths", "environment", "deviations"], ["deliverable"]);
  return store.transact(projectRoot, request, ({ root, state }) => {
    const run = getRun(state, request.run_id, true);
    const prefix = runPrefix(run.run_id);
    const plan = frozenPlan(root, run);
    authorizations.validateRunContinuation(state, run, plan);
    checkInputs(root, plan);
    checkEvidenceBindings(root, plan);
    const code_paths = declaredPaths(root, prefix, request.code_paths, "code_paths");
    const output_paths = declaredPaths(root, prefix, request.output_paths, "output_paths");
    const diagnostic_paths = declaredPaths(root, prefix, request.diagnostic_paths, "diagnostic_paths");
    if (!output_paths.length) fail("INVALID_INPUT", "Finalization requires at least one reported output.");
    const preparation = plan.kind === "audit" && Object.hasOwn(plan, "transformations");
    if ((["analysis", "discovery"].includes(plan.kind) || preparation) && !code_paths.length) fail("INVALID_INPUT", "A computation must retain executable code or configuration.");
    if (plan.diagnostics?.length && !diagnostic_paths.length) fail("INVALID_INPUT", "The plan names diagnostics; retain their evidence files.");
    if (!request.environment || typeof request.environment !== "object" || Array.isArray(request.environment) || !Object.keys(request.environment).length) fail("INVALID_INPUT", "environment must record nonempty runtime or authoring details.");
    array(request.deviations, "deviations", (deviation, label) => {
      object(deviation, label, ["description", "reason", "timing"]);
      text(deviation.description, label + ".description"); text(deviation.reason, label + ".reason");
      enumeration(deviation.timing, ["pre_result", "post_result"], label + ".timing");
    });
    const manifest_ref = prefix + "/manifest.json";
    if (fs.existsSync(safePath(root, manifest_ref))) fail("ORPHAN_MANIFEST", "A manifest exists without committed completion. It will not be adopted or replaced.");
    const files = inventory(root, prefix);
    const exactPaths = new Set(files.map(file => file.path));
    for (const declared of [...code_paths, ...output_paths, ...diagnostic_paths]) {
      if (!exactPaths.has(declared)) fail("INVALID_INPUT", "Declared paths must match saved filename casing exactly: " + declared);
    }
    const completed_at = new Date().toISOString();
    const manifest = {
      manifest_version: 1, run_id: run.run_id, kind: run.kind,
      parent_run_id: run.parent_run_id || null, started_at: run.started_at, completed_at,
      plan_ref: run.plan_ref, plan_sha256: run.plan_sha256, inputs: plan.inputs,
      code_paths, output_paths, diagnostic_paths, environment: structuredClone(request.environment),
      deviations: structuredClone(request.deviations), claim_boundary: run.claim_boundary,
      evidence_bindings: plan.evidence_bindings || [], files
    };
    if (plan.report_contract || request.deliverable !== undefined) {
      if (plan.kind !== "report" || (plan.report_contract && plan.report_contract !== require("./deliverables.cjs").CONTRACT)) fail("INVALID_DELIVERABLE", "Unsupported report deliverable contract.");
      manifest.deliverable = require("./deliverables.cjs").descriptor(request.deliverable, manifest);
      const validation = require("./deliverables.cjs").check(root, prefix, manifest.deliverable, manifest, run.authorization_binding?.presentation_adjustment?.formats);
      if (!validation.ok) fail("INVALID_DELIVERABLE", "Report dependencies are incomplete. Repair the named references before finalizing.", validation);
      manifest.manifest_version = 2;
      manifest.report_contract = require("./deliverables.cjs").CONTRACT;
      manifest.delivery_validation = validation;
    }
    if (run.authorization_binding) manifest.authorization_binding = structuredClone(run.authorization_binding);
    const serialized = JSON.stringify(manifest, null, 2) + "\n";
    writeNew(root, manifest_ref, serialized);
    const completed = { ...run, status: "completed", manifest_ref, manifest_sha256: sha256(serialized), completed_at };
    return { type: "run_finalized", payload: { run: completed }, result: { run_id: run.run_id, manifest_ref, manifest_sha256: completed.manifest_sha256 } };
  }, { ...options, eventType: "run_finalized" });
}
function terminal(projectRoot, request, status, options = {}) {
  requestShape(request, ["run_id", "reason"]);
  text(request.reason, "reason");
  return store.transact(projectRoot, request, ({ state }) => {
    const run = getRun(state, request.run_id, true);
    return { type: status === "failed" ? "run_failed" : "run_abandoned", payload: { run: { ...run, status, reason: request.reason, completed_at: new Date().toISOString() } }, result: { run_id: run.run_id, status } };
  }, { ...options, eventType: status === "failed" ? "run_failed" : "run_abandoned" });
}
const failRun = (root, request, options = {}) => terminal(root, request, "failed", options);
const abandon = (root, request, options = {}) => terminal(root, request, "abandoned", options);

// Reconstruct receipt data from the committed operation, not the current run
// status or external source files. Missing artifacts cannot undo its commit.
function replayReceipt(root, event) {
  const run = event.payload.run;
  if (event.type === "run_started") {
    const result = { run_id: run.run_id, run_path: path.resolve(root, runPrefix(run.run_id)), plan_ref: run.plan_ref };
    try { result.inputs = structuredClone(frozenPlan(root, run).inputs); }
    catch (error) {
      result.receipt_recovery_error = { code: error.code || "IO_ERROR",
        message: "The run start is committed, but its frozen input details could not be recovered: " + error.message };
    }
    return result;
  }
  if (event.type === "run_finalized") return { run_id: run.run_id, manifest_ref: run.manifest_ref, manifest_sha256: run.manifest_sha256 };
  if (["run_failed", "run_abandoned"].includes(event.type)) return { run_id: run.run_id, status: run.status };
  return {};
}

function verify(projectRoot, options = {}) {
  object(options, "verification options", [], ["source_check"]);
  const source_check = options.source_check === undefined ? "originals" : options.source_check;
  enumeration(source_check, ["originals", "snapshots"], "source_check");
  const root = rootPath(projectRoot);
  assertNotLegacy(root);
  let loaded;
  try { loaded = store.readJournal(root); }
  catch (error) { return { ok: false, source_check, issues: [{ code: error.code || "IO_ERROR", message: error.message }] }; }
  const issues = [];
  const capture = (runId, action) => { try { return action(); } catch (error) { issues.push({ run_id: runId, code: error.code || "IO_ERROR", message: error.message }); return null; } };
  if (!loaded.projection_current) issues.push({ code: "STALE_PROJECTION", message: "Current state is reconstructible, but the saved projection is not current." });
  capture(undefined, () => {
    for (const runPath of store.orphanRuns(root, loaded.state)) issues.push({ code: "ORPHAN_RUN", path: "runs/" + runPath, message: "This directory has no committed run start." });
  });
  for (const delivery of loaded.state.deliveries || []) if (Object.hasOwn(delivery, "observed_response_sha256")) {
    try { require("./delivery.cjs").verifyCapture(root, delivery); }
    catch (error) { issues.push({ delivery_id: delivery.delivery_id, code: error.code || "IO_ERROR", message: error.message }); }
  }
  for (const run of loaded.state.runs) {
    if (run.status === "in_progress") issues.push({ run_id: run.run_id, code: "INCOMPLETE_RUN", message: "The run has no committed terminal event." });
    const plan = capture(run.run_id, () => frozenPlan(root, run));
    if (plan) {
      capture(run.run_id, () => checkInputs(root, plan, source_check === "originals"));
      capture(run.run_id, () => checkEvidenceBindings(root, plan));
    }
    const prefix = runPrefix(run.run_id);
    if (run.status === "completed") {
      const manifest = capture(run.run_id, () => manifestFor(root, run));
      if (manifest && canonical(manifest.authorization_binding || null) !== canonical(run.authorization_binding || null)) {
        issues.push({ run_id: run.run_id, code: "MANIFEST_CHANGED", message: "Manifest permission binding differs from the committed run." });
      }
      const actual = capture(run.run_id, () => inventory(root, prefix, true));
      if (manifest && actual && canonical(actual) !== canonical(manifest.files)) issues.push({ run_id: run.run_id, code: "ARTIFACT_CHANGED", message: "Run files are missing, changed, or unmanifested." });
      if (manifest && plan && (plan.report_contract || manifest.deliverable)) capture(run.run_id, () => {
        if (manifest.report_contract !== require("./deliverables.cjs").CONTRACT) fail("INVALID_DELIVERABLE", "Report manifest is missing its declared deliverable contract.");
        const validation = require("./deliverables.cjs").check(root, prefix, manifest.deliverable, manifest, run.authorization_binding?.presentation_adjustment?.formats);
        if (!validation.ok) issues.push({ run_id: run.run_id, code: "INVALID_DELIVERABLE", ...validation });
      });
    } else capture(run.run_id, () => {
      inventory(root, prefix);
      if (fs.existsSync(safePath(root, prefix + "/manifest.json"))) issues.push({ run_id: run.run_id, code: "UNCOMMITTED_MANIFEST", message: "A manifest exists without a committed completed run." });
    });
  }
  return { ok: issues.length === 0, source_check, project_id: loaded.state.state_meta.project_id, last_event_id: loaded.state.state_meta.last_event_id, checked_runs: loaded.state.runs.length, issues };
}

module.exports = { start, write, finalize, failRun, abandon, verify, validatePlan, resolvePlanSources, assertComputedEvidence, frozenPlan, manifestFor, inventory, replayReceipt };
