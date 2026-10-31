"use strict";

// v8 artifact operations are called only inside the store's writer lock. This
// module never commits the journal and never executes analytical code.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { fail, canonical, sha256, safePath, ensureDirectory, readFile, writeNew } = require("../files.cjs");
const { validatePlanStructure } = require("../plan-validation.cjs");
const deliverables = require("../deliverables.cjs");
const records = require("./records.cjs");
const workflow = () => require("./workflow.cjs");
const values = value => value === undefined ? [] : Array.isArray(value) ? value : [value];
function prospective(loaded, id, data) {
  // Validate the complete prospective payload before creating manager-owned
  // files. Placeholder digests are used only by this in-memory shape check;
  // the committed entry always contains the actual artifact digests.
  const emptyHash = "0".repeat(64);
  const entry = { id, recorded_at: new Date().toISOString(), type: "work", data,
    _meta: { request_hash: emptyHash, previous_hash: emptyHash, integrity_hash: emptyHash } };
  return { ...loaded, state: records.apply(loaded.state, entry, loaded.entries), entries: [...loaded.entries, entry] };
}
function text(value, name) { if (typeof value !== "string" || !value.trim()) fail("INVALID_INPUT", name + " must be nonempty text."); }
function strings(value, name) { if (!Array.isArray(value) || value.some(item => typeof item !== "string" || !item.trim())) fail("INVALID_INPUT", name + " must be an array of nonempty strings."); }
function prefix(ref) { if (!/^e[1-9]\d*$/.test(ref || "")) fail("INVALID_REFERENCE", "A run is identified by its starting work entry."); return "runs/" + ref; }
function getRun(loaded, ref, active = false) {
  prefix(ref);
  const run = loaded.state.runs.find(item => item.ref === ref);
  if (!run) fail("UNKNOWN_RUN", "No committed run has this identity: " + ref);
  if (active && run.phase !== "started") fail("RUN_IMMUTABLE", "Only a started run accepts files or a terminal transition.");
  return run;
}
function digestAbsolute(file) {
  const descriptor = fs.openSync(file, "r");
  try {
    const before = fs.fstatSync(descriptor);
    if (!before.isFile()) fail("INVALID_INPUT", "Input must be a regular file.");
    const hash = crypto.createHash("sha256"), buffer = Buffer.allocUnsafe(65536);
    let count = 0, size = 0;
    while ((count = fs.readSync(descriptor, buffer, 0, buffer.length, null)) > 0) { hash.update(buffer.subarray(0, count)); size += count; }
    const after = fs.fstatSync(descriptor);
    if (before.size !== after.size || before.mtimeMs !== after.mtimeMs || size !== after.size) fail("INPUT_CHANGED", "Input changed while it was being retained.");
    return { sha256: hash.digest("hex"), bytes: size };
  } finally { fs.closeSync(descriptor); }
}
const digest = (root, relative) => digestAbsolute(safePath(root, relative));
function parse(bytes, label) { try { return JSON.parse(bytes.toString("utf8")); } catch { fail("INVALID_ARTIFACT", label + " is not valid JSON."); } }
function resolveInputs(loaded, plan, { offer = false } = {}) {
  const seen = new Set();
  const sources = plan.inputs.flatMap(input => {
    const identity = canonical([input.source_ref, input.path]);
    if (seen.has(identity)) fail("INVALID_INPUT", "The plan repeats an input source/path.");
    seen.add(identity);
    const source_path = path.resolve(loaded.root, input.path);
    if (offer && input.deferred_release) {
      if (fs.existsSync(source_path)) fail("UNBOUND_SCOPE_INPUT", "An available input must be hashed before its offer.");
      return [];
    }
    const resolved_source_path = fs.realpathSync.native(source_path), hash = digestAbsolute(resolved_source_path);
    if (input.sha256 && input.sha256 !== hash.sha256) fail("INPUT_CHANGED", "The source no longer matches the offered input: " + input.source_ref);
    return [{ source_ref: input.source_ref, path: input.path, source_path, resolved_source_path, source_sha256: hash.sha256, bytes: hash.bytes }];
  });
  for (const binding of evidenceBindings(loaded, plan)) {
    const expected = binding.artifact_sha256 || binding.source_sha256;
    if (expected) for (const source of sources.filter(item => item.source_ref === binding.source_ref)) if (source.source_sha256 !== expected) fail("SOURCE_CHANGED", "A report input does not match its selected evidence version.");
  }
  return sources;
}
function frozenPlan(loaded, run) {
  if (run.plan_ref !== prefix(run.ref) + "/plan.yaml") fail("PLAN_CHANGED", "A run's managed plan must remain in its own directory.");
  const bytes = readFile(loaded.root, run.plan_ref);
  if (sha256(bytes) !== run.plan_sha256) fail("PLAN_CHANGED", "The immutable plan changed: " + run.plan_ref);
  const plan = parse(bytes, "Frozen plan");
  if (plan.run_id !== run.ref || plan.kind !== run.kind || canonical(plan.responds_to) !== canonical(run.responds_to) || (plan.scope || null) !== (run.scope || null) || (plan.decision || null) !== (run.decision || null)) fail("PLAN_CHANGED", "The plan's identity or permission does not match its start.");
  validatePlanStructure(plan.authored_plan);
  for (const key of Object.keys(plan.authored_plan).filter(key => key !== "inputs")) if (canonical(plan[key]) !== canonical(plan.authored_plan[key])) fail("PLAN_CHANGED", "A frozen plan differs from its declared execution terms: " + key);
  if (!Array.isArray(plan.inputs) || plan.inputs.length !== plan.authored_plan.inputs.length) fail("PLAN_CHANGED", "Frozen inputs differ from the declared input inventory.");
  for (const [index, input] of plan.inputs.entries()) {
    const original = plan.authored_plan.inputs[index];
    if (input.source_ref !== original.source_ref || input.path !== original.path || original.sha256 && (input.source_sha256 !== original.sha256 || input.snapshot_sha256 !== original.sha256)) fail("PLAN_CHANGED", "Frozen inputs differ from the originally bound sources.");
  }
  return plan;
}
function checkInputs(loaded, plan, originals = true) {
  for (const input of plan.inputs) {
    const hash = digest(loaded.root, input.snapshot_ref);
    if (hash.sha256 !== input.snapshot_sha256 || hash.bytes !== input.bytes) fail("INPUT_CHANGED", "Frozen input bytes changed: " + input.snapshot_ref);
    if (originals && (fs.realpathSync.native(input.source_path) !== input.resolved_source_path || digestAbsolute(input.resolved_source_path).sha256 !== input.source_sha256)) fail("SOURCE_CHANGED", "Original input changed after the snapshot: " + input.source_ref);
  }
}
function manifestFor(loaded, run) {
  if (run.phase !== "completed" || !run.manifest_ref) fail("INCOMPLETE_RUN", "Evidence requires a completed manifested run.");
  if (run.manifest_ref !== prefix(run.ref) + "/manifest.json") fail("MANIFEST_CHANGED", "A run manifest must remain in its own directory.");
  const bytes = readFile(loaded.root, run.manifest_ref);
  if (sha256(bytes) !== run.manifest_sha256) fail("MANIFEST_CHANGED", "The committed manifest changed.");
  const manifest = parse(bytes, "Run manifest");
  if (manifest.run_id !== run.ref || manifest.plan_ref !== run.plan_ref || manifest.plan_sha256 !== run.plan_sha256) fail("MANIFEST_CHANGED", "Manifest identity does not match its run.");
  return manifest;
}
function assertComputedEvidence(loaded, evidence) {
  if (evidence.kind !== "computed" && evidence.evidence_kind !== "computed") return;
  const run = getRun(loaded, evidence.run_id), manifest = manifestFor(loaded, run), plan = frozenPlan(loaded, run);
  checkInputs(loaded, plan, false);
  const root = prefix(run.ref) + "/";
  if (typeof evidence.source_ref !== "string" || !evidence.source_ref.startsWith(root)) fail("UNKNOWN_REFERENCE", "Computed evidence must locate an output in its completed run.");
  const local = evidence.source_ref.slice(root.length), file = manifest.files.find(item => item.path === local);
  if (!file || ![...manifest.output_paths, ...manifest.diagnostic_paths].includes(local) || digest(loaded.root, evidence.source_ref).sha256 !== file.sha256 || evidence.source_sha256 && evidence.source_sha256 !== file.sha256) fail("ARTIFACT_CHANGED", "Computed evidence is not an intact manifested output.");
}
function evidenceBindings(loaded, plan) {
  return (plan.evidence_refs || []).map(ref => {
    const resolved = records.resolve(loaded, ref), evidence = resolved.body;
    if (resolved.kind !== "evidence") fail("INVALID_INPUT", "Report evidence_refs must identify evidence records.");
    assertComputedEvidence(loaded, evidence);
    const binding = { ref: resolved.ref, event_ref: resolved.event_ref, ...structuredClone(evidence) };
    const conditions = loaded.state.result_conditions || [], superseded = new Set(conditions.map(item => item.supersedes).filter(Boolean));
    binding.condition_bindings = conditions.filter(item => {
      if (superseded.has(item.condition_id)) return false;
      const definition = records.resolve(loaded, item.condition_id);
      const target = records.resolveAt(loaded, item.evidence_ref, definition.event_ref);
      return target.ref === resolved.ref && target.event_ref === resolved.event_ref;
    }).map(condition => {
      const definition = records.resolve(loaded, condition.condition_id);
      return { ref: definition.ref, event_ref: definition.event_ref, ...structuredClone(condition),
        assumption_bindings: condition.assumption_refs.map(ref => records.resolveAt(loaded, ref, definition.event_ref)),
        basis_bindings: (condition.basis_refs || []).map(ref => records.resolveAt(loaded, ref, definition.event_ref)) };
    });
    binding.condition_coverage = binding.condition_bindings.length ? "linked" : "unreviewed";
    if (evidence.run_id) {
      const run = getRun(loaded, evidence.run_id), manifest = manifestFor(loaded, run);
      Object.assign(binding, { plan_ref: run.plan_ref, plan_sha256: run.plan_sha256, manifest_ref: run.manifest_ref, manifest_sha256: run.manifest_sha256,
        artifact_sha256: manifest.files.find(item => prefix(run.ref) + "/" + item.path === evidence.source_ref).sha256 });
    }
    return binding;
  });
}
function checkEvidence(loaded, plan) {
  for (const binding of plan.evidence_bindings || []) {
    const expected = binding.artifact_sha256 || binding.source_sha256;
    if (expected) for (const input of plan.inputs.filter(item => item.source_ref === binding.source_ref)) if (input.snapshot_sha256 !== expected || input.source_sha256 !== expected) fail("SOURCE_CHANGED", "Report inputs no longer match their selected evidence.");
    if (binding.kind !== "computed") continue;
    const planBytes = readFile(loaded.root, binding.plan_ref), manifestBytes = readFile(loaded.root, binding.manifest_ref);
    if (sha256(planBytes) !== binding.plan_sha256 || sha256(manifestBytes) !== binding.manifest_sha256 || digest(loaded.root, binding.source_ref).sha256 !== binding.artifact_sha256) fail("SOURCE_CHANGED", "A report's retained computational source changed.");
    checkInputs(loaded, parse(planBytes, "Bound source plan"), false);
  }
}
function validateAssignmentForPlan(action, plan) {
  const expected = { analysis: ["design_worker", "execution"], discovery: ["causal_discovery", "discovery"], report: ["report_writer", "reporting"] }[plan.kind];
  if (expected && (action.assignment.specialist_id !== expected[0] || action.assignment.operation !== expected[1])) fail("ASSIGNMENT_MISMATCH", "The plan kind differs from its selected specialist operation.");
  if (plan.kind === "analysis" && (action.assignment.design_id !== plan.design_id || canonical([...(action.assignment.additional_design_ids || [])].sort()) !== canonical([...(plan.additional_design_ids || [])].sort()))) fail("ASSIGNMENT_MISMATCH", "The analytical design differs from the recorded assignment.");
  if (plan.kind === "audit" && plan.transformations && (action.assignment.specialist_id !== "data_audit" || action.assignment.operation !== "prepare")) fail("ASSIGNMENT_MISMATCH", "Transformations require the selected preparation operation.");
}
function continuation(loaded, run, plan) {
  if (["analysis", "report"].includes(run.kind)) {
    const latest = workflow().latestDirection(loaded);
    workflow().requireWorkDirection(loaded, latest?.ref, run.scope, run.decision);
    const scope = workflow().scopeFor(loaded, run.scope), decision = records.resolve(loaded, run.decision).body;
    if (canonical(scope.basis_versions) !== canonical(plan.basis_versions) || canonical(workflow().planFor(loaded, scope, decision)) !== canonical(plan.authored_plan)) fail("SCOPE_MISMATCH", "The run must retain its original accepted terms and exact basis.");
  } else {
    const selected = workflow().requireWorkDirection(loaded, run.responds_to);
    validateAssignmentForPlan(selected.action, plan);
  }
  checkInputs(loaded, plan); checkEvidence(loaded, plan);
}
function start(loaded, data, id) {
  let authored, scope, decision;
  if (data.scope) {
    if (data.plan) fail("INVALID_INPUT", "Protected work derives its plan from the scope; do not supply another plan.");
    scope = workflow().scopeFor(loaded, data.scope);
    decision = records.resolve(loaded, data.decision).body;
    authored = workflow().planFor(loaded, scope, decision);
    if (loaded.state.runs.some(run => run.decision === data.decision)) fail("AUTHORIZATION_USED", "This acceptance already started a run. Resume that run or record later steering for new work.");
  } else {
    authored = structuredClone(data.plan);
    validatePlanStructure(authored);
    if (["analysis", "report"].includes(authored.kind)) fail("MISSING_AUTHORIZATION", "Analysis/report work requires its accepted scope and decision.");
  }
  const selected = workflow().requireWorkDirection(loaded, data.responds_to, data.scope, data.decision);
  validateAssignmentForPlan(selected.action, authored);
  if (data.parent_run_id) getRun(loaded, data.parent_run_id);
  const started_at = new Date().toISOString(), plan_ref = prefix(id) + "/plan.yaml";
  const work = { phase: "started", run: id, kind: authored.kind, responds_to: structuredClone(data.responds_to), plan_ref,
    plan_sha256: "0".repeat(64), claim_boundary: authored.claim_boundary, started_at };
  if (scope) Object.assign(work, { scope: data.scope, decision: data.decision });
  if (data.parent_run_id) work.parent_run_id = data.parent_run_id;
  for (const key of ["updates", "selection", "overview"]) if (data[key]) work[key] = structuredClone(data[key]);
  const candidate = prospective(loaded, id, work);
  if (scope) workflow().currentScope(candidate, scope);
  const sources = resolveInputs(loaded, authored), bindings = evidenceBindings(loaded, authored);
  const runPrefix = prefix(id), target = safePath(loaded.root, runPrefix);
  if (fs.existsSync(target)) fail("ORPHAN_RUN", "An uncommitted run directory already exists; it is preserved for explicit recovery: " + runPrefix);
  ensureDirectory(loaded.root, runPrefix + "/inputs");
  for (const [index, source] of sources.entries()) {
    const extension = path.extname(source.source_path), suffix = /^\.[a-z0-9]{1,12}$/i.test(extension) ? extension.toLowerCase() : ".bin";
    source.snapshot_ref = runPrefix + "/inputs/" + String(index + 1).padStart(4, "0") + suffix;
    const destination = safePath(loaded.root, source.snapshot_ref);
    fs.copyFileSync(source.resolved_source_path, destination, fs.constants.COPYFILE_EXCL);
    const descriptor = fs.openSync(destination, "r+"); try { fs.fsyncSync(descriptor); } finally { fs.closeSync(descriptor); }
    const captured = digest(loaded.root, source.snapshot_ref);
    if (captured.sha256 !== source.source_sha256 || captured.bytes !== source.bytes) fail("INPUT_CHANGED", "Input changed while its snapshot was being copied.");
    source.snapshot_sha256 = captured.sha256;
  }
  const plan = { ...structuredClone(authored), plan_schema_version: 8, run_id: id, responds_to: structuredClone(data.responds_to), frozen_at: started_at,
    authored_plan: structuredClone(authored), inputs: sources, evidence_bindings: bindings };
  if (scope) Object.assign(plan, { scope: data.scope, decision: data.decision, basis_versions: structuredClone(scope.basis_versions) });
  if (authored.kind === "report") plan.report_contract = deliverables.CONTRACT;
  checkInputs(loaded, plan); checkEvidence(loaded, plan);
  const bytes = JSON.stringify(plan, null, 2) + "\n";
  writeNew(loaded.root, plan_ref, bytes);
  work.plan_sha256 = sha256(bytes);
  return { type: "work", data: work, result: { run: id, run_id: id, run_path: target, plan_ref, inputs: sources } };
}
function declared(loaded, runPrefix, paths, label) {
  strings(paths, label);
  const result = paths.map(file => file.replace(/\\/g, "/"));
  if (new Set(result).size !== result.length) fail("INVALID_INPUT", label + " contains duplicate paths.");
  for (const file of result) {
    const lower = file.toLowerCase();
    if (["plan.yaml", "manifest.json", "inputs"].includes(lower) || lower.startsWith("inputs/")) fail("RUN_IMMUTABLE", "Managed plans, inputs and manifests are not declared work outputs.");
    if (!fs.statSync(safePath(loaded.root, runPrefix + "/" + file)).isFile()) fail("INVALID_INPUT", "Declared output must be a regular file.");
  }
  return result;
}
function inventory(loaded, runPrefix, excludeManifest = false) {
  const files = [];
  function visit(relative) {
    for (const item of fs.readdirSync(safePath(loaded.root, relative), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const child = relative + "/" + item.name, stat = fs.lstatSync(safePath(loaded.root, child));
      if (stat.isDirectory()) visit(child);
      else if (stat.isFile()) {
        const local = child.slice(runPrefix.length + 1);
        if (excludeManifest && local === "manifest.json") continue;
        files.push({ path: local, ...digest(loaded.root, child) });
      } else fail("UNSAFE_PATH", "Run contains a nonregular file.");
    }
  }
  visit(runPrefix); return files.sort((a, b) => a.path.localeCompare(b.path));
}
function finalize(loaded, data, id) {
  const run = getRun(loaded, data.run, true), plan = frozenPlan(loaded, run), runPrefix = prefix(run.ref);
  continuation(loaded, run, plan);
  const code_paths = declared(loaded, runPrefix, data.code_paths, "code_paths"), output_paths = declared(loaded, runPrefix, data.output_paths, "output_paths"), diagnostic_paths = declared(loaded, runPrefix, data.diagnostic_paths, "diagnostic_paths");
  if (!output_paths.length) fail("INVALID_INPUT", "A completed artifact run needs a declared output.");
  if ((["analysis", "discovery"].includes(plan.kind) || plan.transformations) && !code_paths.length) fail("MISSING_REPRODUCTION", "Computational work must retain its code or executable configuration.");
  if (plan.diagnostics?.length && !diagnostic_paths.length) fail("MISSING_DIAGNOSTICS", "Declared checks need retained diagnostic evidence.");
  if (!data.environment || typeof data.environment !== "object" || Array.isArray(data.environment) || !Object.keys(data.environment).length) fail("INVALID_INPUT", "environment must retain authoring/runtime details.");
  if (!Array.isArray(data.deviations)) fail("INVALID_INPUT", "deviations must be an array.");
  for (const deviation of data.deviations) { text(deviation.description, "deviation description"); text(deviation.reason, "deviation reason"); if (!["pre_result", "post_result"].includes(deviation.timing)) fail("INVALID_INPUT", "Deviation timing must distinguish pre-result from post-result."); }
  const manifest_ref = runPrefix + "/manifest.json";
  if (fs.existsSync(safePath(loaded.root, manifest_ref))) fail("ORPHAN_MANIFEST", "An uncommitted manifest is retained and will not be silently adopted or replaced.");
  const files = inventory(loaded, runPrefix), names = new Set(files.map(file => file.path));
  for (const name of [...code_paths, ...output_paths, ...diagnostic_paths]) if (!names.has(name)) fail("INVALID_INPUT", "Declared paths must match retained filename casing exactly.");
  const completed_at = new Date().toISOString();
  const result = { phase: "completed", run: run.ref, responds_to: run.responds_to, manifest_ref,
    manifest_sha256: "0".repeat(64), completed_at };
  for (const key of ["updates", "selection", "overview"]) if (data[key]) result[key] = structuredClone(data[key]);
  const candidate = prospective(loaded, id, result);
  const manifest = { manifest_version: 8, run_id: run.ref, kind: run.kind, parent_run_id: run.parent_run_id || null, started_at: run.started_at, completed_at,
    plan_ref: run.plan_ref, plan_sha256: run.plan_sha256, responds_to: run.responds_to, inputs: plan.inputs, code_paths, output_paths, diagnostic_paths,
    environment: structuredClone(data.environment), deviations: structuredClone(data.deviations), claim_boundary: run.claim_boundary, evidence_bindings: plan.evidence_bindings, files };
  if (run.scope) Object.assign(manifest, { scope: run.scope, decision: run.decision, basis_versions: plan.basis_versions });
  if (data.result_condition_refs) {
    strings(data.result_condition_refs, "result_condition_refs");
    manifest.result_condition_bindings = data.result_condition_refs.map(ref => { const definition = records.resolve(candidate, ref); if (definition.kind !== "result_condition") fail("UNKNOWN_REFERENCE", "Result conditions require exact condition records."); return definition; });
  }
  for (const definition of records.definitions(candidate.entries.at(-1)).slice(1)) if (definition.kind === "evidence" && definition.body.kind === "computed") {
    const evidence = definition.body;
    if (evidence.run_id !== run.ref) { assertComputedEvidence(loaded, evidence); continue; }
    const local = evidence.source_ref.slice((runPrefix + "/").length), file = files.find(item => item.path === local);
    if (!file || ![...output_paths, ...diagnostic_paths].includes(local) || evidence.source_sha256 && evidence.source_sha256 !== file.sha256) fail("ARTIFACT_CHANGED", "Adopted result evidence must identify an intact declared output.");
  }
  if (plan.kind === "report") {
    manifest.deliverable = deliverables.descriptor(data.deliverable, manifest);
    const decision = run.decision && records.resolve(loaded, run.decision).body;
    const formats = decision?.presentation_adjustment?.formats || [];
    const check = deliverables.check(loaded.root, runPrefix, manifest.deliverable, manifest, formats);
    if (!check.ok) fail("INVALID_DELIVERABLE", "Report dependencies or requested formats are incomplete.", check);
    manifest.report_contract = deliverables.CONTRACT; manifest.delivery_validation = check;
  } else if (data.deliverable) fail("INVALID_DELIVERABLE", "A report descriptor belongs only to report work.");
  const bytes = JSON.stringify(manifest, null, 2) + "\n";
  writeNew(loaded.root, manifest_ref, bytes);
  result.manifest_sha256 = sha256(bytes);
  return { type: "work", data: result, result: { run: run.ref, run_id: run.ref, manifest_ref, manifest_sha256: result.manifest_sha256 } };
}
function prepare(loaded, op, data, id) {
  if (op === "start-run") return start(loaded, data, id);
  if (op === "finalize-run") return finalize(loaded, data, id);
  if (["fail-run", "abandon-run"].includes(op)) {
    const run = getRun(loaded, data.run, true); text(data.reason, "reason");
    const phase = op === "fail-run" ? "failed" : "abandoned";
    const terminal = { phase, run: run.ref, responds_to: run.responds_to, reason: data.reason, completed_at: new Date().toISOString() };
    for (const key of ["updates", "selection", "overview"]) if (data[key]) terminal[key] = structuredClone(data[key]);
    return { type: "work", data: terminal, result: { run: run.ref, run_id: run.ref, status: phase } };
  }
  fail("INVALID_OPERATION", "Unknown v8 run operation: " + op);
}
function write(loaded, data) {
  const run = getRun(loaded, data.run, true), plan = frozenPlan(loaded, run);
  text(data.path, "path"); if (typeof data.content !== "string") fail("INVALID_INPUT", "Run content must be text.");
  const relative = data.path.replace(/\\/g, "/"), lower = relative.toLowerCase();
  if (["plan.yaml", "manifest.json", "inputs"].includes(lower) || lower.startsWith("inputs/")) fail("RUN_IMMUTABLE", "This helper cannot write plans, frozen inputs or manifests.");
  const destination = prefix(run.ref) + "/" + relative, target = safePath(loaded.root, destination), hash = sha256(data.content);
  if (fs.existsSync(target)) {
    if (digest(loaded.root, destination).sha256 !== hash) fail("FILE_EXISTS", "Existing content is immutable; use a new file name for changed work.");
    return { ok: true, run: run.ref, path: destination, sha256: hash, replayed: true };
  }
  continuation(loaded, run, plan);
  ensureDirectory(loaded.root, path.posix.dirname(destination)); writeNew(loaded.root, destination, data.content);
  return { ok: true, run: run.ref, path: destination, sha256: hash, replayed: false };
}
function validateEntry(loaded, entry) {
  const data = entry.data;
  if (!["started", "completed", "failed", "abandoned"].includes(data.phase)) fail("INVALID_INPUT", "Unknown work phase.");
  if (data.phase === "started") {
    if (data.run !== entry.id) fail("INVALID_REFERENCE", "A run's start entry is its stable identity.");
    const run = { ...data, ref: entry.id }, plan = frozenPlan(loaded, run);
    const selected = workflow().requireWorkDirection(loaded, data.responds_to, data.scope, data.decision);
    validateAssignmentForPlan(selected.action, plan);
    if (["analysis", "report"].includes(data.kind) && (!data.scope || !data.decision)) fail("MISSING_AUTHORIZATION", "Protected run starts require their accepted scope.");
    continuation(loaded, run, plan);
  } else {
    const run = getRun(loaded, data.run, true);
    if (canonical(run.responds_to) !== canonical(data.responds_to)) fail("WORK_ATTRIBUTION_CHANGED", "A terminal event must retain its start attribution.");
    for (const key of ["kind", "scope", "decision", "plan_ref", "plan_sha256", "claim_boundary", "started_at", "parent_run_id"]) if (Object.hasOwn(data, key) && canonical(data[key]) !== canonical(run[key])) fail("WORK_BINDING_CHANGED", "A terminal event cannot change its original run binding: " + key);
    if (data.phase === "completed") {
      const completed = { ...run, ...data }, manifest = manifestFor(loaded, completed), plan = frozenPlan(loaded, run);
      continuation(loaded, run, plan);
      if (canonical(inventory(loaded, prefix(run.ref), true)) !== canonical(manifest.files)) fail("ARTIFACT_CHANGED", "Run files changed after the manifest was prepared.");
    } else text(data.reason, "terminal reason");
  }
}
function receipt(loaded, entry) {
  const data = entry.data, ref = data.phase === "started" ? entry.id : data.run;
  const result = { run: ref, run_id: ref };
  if (data.phase === "started") {
    Object.assign(result, { run_path: path.resolve(loaded.root, prefix(ref)), plan_ref: data.plan_ref });
    try { result.inputs = frozenPlan(loaded, { ...data, ref }).inputs; }
    catch (error) { result.receipt_recovery_error = { code: error.code || "IO_ERROR", message: error.message }; }
  } else if (data.phase === "completed") Object.assign(result, { manifest_ref: data.manifest_ref, manifest_sha256: data.manifest_sha256 });
  else result.status = data.phase;
  return result;
}
function verify(loaded, options = {}) {
  const source_check = options.source_check || "originals", issues = [];
  if (!["originals", "snapshots"].includes(source_check)) fail("INVALID_INPUT", "source_check must be originals or snapshots.");
  const attempt = (ref, fn) => { try { return fn(); } catch (error) { issues.push({ run: ref, code: error.code || "IO_ERROR", message: error.message }); return null; } };
  for (const run of loaded.state.runs) {
    if (run.phase === "started") issues.push({ run: run.ref, code: "INCOMPLETE_RUN", message: "No terminal work entry is recorded." });
    const plan = attempt(run.ref, () => frozenPlan(loaded, run));
    if (plan) { attempt(run.ref, () => checkInputs(loaded, plan, source_check === "originals")); attempt(run.ref, () => checkEvidence(loaded, plan)); }
    if (run.phase === "completed") {
      const manifest = attempt(run.ref, () => manifestFor(loaded, run));
      const actual = attempt(run.ref, () => inventory(loaded, prefix(run.ref), true));
      if (manifest && actual && canonical(actual) !== canonical(manifest.files)) issues.push({ run: run.ref, code: "ARTIFACT_CHANGED", message: "Run files are changed, missing or unmanifested." });
      if (manifest?.deliverable) attempt(run.ref, () => { const result = deliverables.check(loaded.root, prefix(run.ref), manifest.deliverable, manifest); if (!result.ok) fail("INVALID_DELIVERABLE", "A report dependency is missing.", result); });
    } else attempt(run.ref, () => { if (fs.existsSync(safePath(loaded.root, prefix(run.ref) + "/manifest.json"))) fail("UNCOMMITTED_MANIFEST", "A retained manifest has no committed completion."); });
  }
  for (const entry of loaded.entries.filter(item => item.type === "reply_recorded" && item.data.source.kind === "host_capture")) attempt(entry.id, () => workflow().captureText(loaded, entry.data));
  const directory = path.resolve(loaded.root, "runs");
  if (fs.existsSync(directory)) for (const name of fs.readdirSync(safePath(loaded.root, "runs"))) if (!loaded.state.runs.some(run => run.ref === name)) issues.push({ code: "ORPHAN_RUN", path: "runs/" + name, message: "The directory has no committed work start." });
  return { ok: !issues.length, source_check, checked_runs: loaded.state.runs.length, issues };
}
module.exports = { prepare, write, verify, receipt, validateEntry, resolveInputs, frozenPlan, manifestFor, assertComputedEvidence, inventory };
