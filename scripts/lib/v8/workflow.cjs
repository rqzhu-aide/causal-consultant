"use strict";

// Prospective v8 consultation checks. Historical replay does not reopen source
// files or reinterpret an old decision under today's scientific knowledge.
const fs = require("node:fs");
const path = require("node:path");
const { fail, canonical, sha256, safePath, ensureDirectory, readFile, writeNew } = require("../files.cjs");
const records = require("./records.cjs");
const layout = require("../response-layout.cjs");
const { validatePlanStructure } = require("../plan-validation.cjs");
const { validateAssignment } = require("../model.cjs");
const RENDERER = "lead-markdown-v11";
const array = value => value === undefined ? [] : Array.isArray(value) ? value : [value];
const sequence = ref => /^e[1-9]\d*$/.test(ref || "") ? Number(ref.slice(1)) : 0;
const base = ref => typeof ref === "string" ? ref.split("@")[0] : ref;
const entryFor = (loaded, ref) => loaded.entries.find(entry => entry.id === ref);
function object(value, label) { if (!value || typeof value !== "object" || Array.isArray(value)) fail("INVALID_INPUT", label + " must be an object."); }
function text(value, label) { if (typeof value !== "string" || !value.trim()) fail("INVALID_INPUT", label + " must be nonempty text."); }
function strings(value, label, nonempty = false) {
  if (!Array.isArray(value) || nonempty && !value.length || value.some(item => typeof item !== "string" || !item.trim())) fail("INVALID_INPUT", label + " must be an array of nonempty strings.");
}
function resolve(loaded, ref, expected) {
  text(ref, "reference");
  const found = records.resolve(loaded, ref);
  if (!found || expected && !array(expected).includes(found.kind)) fail("UNKNOWN_REFERENCE", "Reference has the wrong record kind: " + ref);
  return found;
}
function local(loaded, entry, ref) {
  const definition = records.definitions(entry).find(item => item.ref === ref);
  if (definition) return definition;
  return resolve(loaded, ref);
}
function overlay(loaded, entry) {
  const state = structuredClone(loaded.state);
  if (entry.type === "work" && entry.data.phase === "completed") {
    const index = state.runs.findIndex(run => run.ref === entry.data.run);
    if (index >= 0) state.runs[index] = { ...state.runs[index], ...entry.data };
  }
  for (const definition of records.definitions(entry).slice(1)) {
    const config = records.COLLECTIONS[definition.kind];
    const index = state[config.collection].findIndex(item => item[config.id] === definition.ref);
    if (index < 0) state[config.collection].push(definition.body); else state[config.collection][index] = definition.body;
    state.history_index[definition.ref] = { kind: definition.kind, event_ref: entry.id };
  }
  return { ...loaded, state, entries: [...loaded.entries, entry] };
}
function assignment(loaded, value) {
  validateAssignment(value, "assignment", { references(refs, label, kind) {
    strings(refs, label || "assignment references");
    for (const ref of refs) resolve(loaded, ref, kind === "strategy" ? "route" : kind);
  } });
}
function incoming(loaded, refs) {
  const values = array(refs);
  if (!values.length || new Set(values).size !== values.length) fail("MISSING_USER_SOURCE", "Handling requires distinct retained user messages.");
  for (const ref of values) {
    const entry = entryFor(loaded, ref);
    if (entry?.type !== "user_message") fail("MISSING_USER_SOURCE", "A retained original user message is required: " + ref);
  }
  return values;
}
function handles(loaded, refs) {
  const result = array(refs).map(ref => records.handling(loaded, ref));
  if (!result.length || result.some(item => !item?.entry || !item.incoming?.length)) fail("MISSING_HANDLING", "Work and replies require their committed source handling.");
  return result;
}
function sameRound(loaded, left, right) {
  const sources = new Set(handles(loaded, left).flatMap(item => item.incoming));
  return handles(loaded, right).some(item => item.incoming.some(ref => sources.has(ref)));
}
function latestDirection(loaded) {
  let result = null;
  for (const entry of loaded.entries) {
    if (!entry.data.next_action) continue;
    let source;
    try { source = entry.data.user_message ? incoming(loaded, entry.data.user_message) : handles(loaded, entry.data.responds_to).flatMap(item => item.incoming); }
    catch { continue; }
    const order = Math.max(...source.map(sequence));
    if (!result || order > result.order || order === result.order && sequence(entry.id) > sequence(result.ref)) result = { ref: entry.id, order, action: entry.data.next_action, incoming: source };
  }
  return result;
}
function direction(loaded, data) {
  if (!data.next_action) return;
  const action = data.next_action;
  object(action, "next_action");
  if (!["lead_only", "specialist", "wait", "close"].includes(action.kind)) fail("INVALID_INPUT", "Unsupported next_action kind.");
  for (const field of ["decision", "scope_ref", "authorization_ref"]) if (action[field]) resolve(loaded, action[field]);
  if (/^e[1-9]\d*$/.test(action.scope || "")) resolve(loaded, action.scope);
  for (const ref of action.question_refs || []) resolve(loaded, ref, "question");
  if (action.kind === "specialist") assignment(loaded, action.assignment);
  else if (action.assignment) fail("ASSIGNMENT_MISMATCH", "Only specialist direction selects a specialist assignment.");
  const timing = array(action.question_timing).map(item => typeof item === "string" ? { timing: item } : item);
  for (const item of timing) {
    object(item, "question_timing");
    if (item.question_ref) resolve(loaded, item.question_ref, "question");
    if (!["before_work", "after_work", "clarify_first"].includes(item.timing)) fail("INVALID_INPUT", "Unknown question answer timing.");
  }
  if (action.kind === "specialist" && (action.clarification_needed || timing.some(item => item.timing !== "after_work"))) fail("QUESTION_BEFORE_WORK", "Resolve the prerequisite answer or clarification before selecting work.");
}
function scopeFor(loaded, ref) {
  const entry = entryFor(loaded, ref);
  if (entry?.type !== "scope") fail("UNKNOWN_REFERENCE", "Expected an immutable scope: " + ref);
  return { ref, ...entry.data };
}
function planFor(loaded, scope, decision) {
  const terms = scope.terms;
  const plan = { ...structuredClone(scope.execution), kind: scope.action, objective: terms.target, claim_boundary: terms.claim_boundary };
  if (scope.action === "analysis") Object.assign(plan, { target: terms.target, population: terms.population, estimator: terms.approach, diagnostics: structuredClone(terms.checks) });
  else plan.purpose = terms.target;
  if (decision?.presentation_adjustment) plan.format = decision.presentation_adjustment.formats.join(", ");
  validatePlanStructure(plan);
  return plan;
}
function basisBindings(loaded, refs) {
  const found = new Map(), queue = [...refs];
  while (queue.length) {
    const ref = queue.shift(), record = resolve(loaded, ref), key = base(record.ref || ref);
    if (found.has(key)) {
      if (found.get(key).event_ref !== record.event_ref) fail("MIXED_BASIS", "A scope cannot bind different versions of " + key);
      continue;
    }
    found.set(key, { ref: key, event_ref: record.event_ref });
    const body = record.body;
    const dependency = ref => {
      if (record.kind !== "result_condition") return ref;
      const definition = records.resolveAt(loaded, ref, record.event_ref);
      return Object.hasOwn(records.COLLECTIONS, definition.kind)
        ? definition.ref + "@" + definition.event_ref : definition.ref;
    };
    for (const field of ["basis_refs", "evidence_refs", "assumption_refs", "user_refs", "user_contribution_refs", "assumptions_added_or_revised", "evidence_for", "evidence_against"]) queue.push(...array(body[field]).map(dependency));
    if (body.run_id) queue.push(body.run_id);
    if (body.evidence_ref) queue.push(dependency(body.evidence_ref));
    if (body.assumption_id && body.status === "retired") continue;
    if (body.evidence_id || ["evidence", "result", "fact"].includes(record.kind)) {
      const conditions = loaded.state.result_conditions || [];
      const superseded = new Set(conditions.map(item => item.supersedes).filter(Boolean));
      for (const condition of conditions) {
        if (superseded.has(condition.condition_id) || base(condition.evidence_ref) !== key) continue;
        const definition = resolve(loaded, condition.condition_id);
        const target = records.resolveAt(loaded, condition.evidence_ref, definition.event_ref);
        if (target.ref === record.ref && target.event_ref === record.event_ref) queue.push(condition.condition_id);
        else fail("STALE_RESULT_CONDITION", "A retained condition still describes another evidence version; reconcile " + condition.condition_id + " before binding new work.");
      }
    }
    const run = (loaded.state.runs || []).find(item => item.ref === key);
    if (run) for (const evidence of loaded.state.evidence || []) if (evidence.run_id === key && !(loaded.state.evidence || []).some(other => other.supersedes === evidence.evidence_id)) queue.push(evidence.evidence_id);
  }
  return [...found.values()];
}
function currentScope(loaded, scope) {
  if (scope.ref && (loaded.state.action_scopes || []).some(other => other.supersedes === scope.ref)) fail("STALE_SCOPE", "This proposal was replaced by a later scope.");
  const entities = Object.values(records.COLLECTIONS).flatMap(config => loaded.state[config.collection] || []);
  for (const binding of scope.basis_versions) {
    if (resolve(loaded, binding.ref).event_ref !== binding.event_ref) fail("STALE_SCOPE", "A bound scientific record changed: " + binding.ref);
    if (entities.some(record => record.supersedes === binding.ref)) fail("STALE_SCOPE", "A bound scientific record was superseded: " + binding.ref);
  }
  const bindings = basisBindings(loaded, scope.basis_versions.map(item => item.ref));
  if (canonical(bindings.slice().sort((a, b) => a.ref.localeCompare(b.ref))) !== canonical(scope.basis_versions.slice().sort((a, b) => a.ref.localeCompare(b.ref)))) fail("STALE_SCOPE", "The scope's scientific basis changed; reconcile the affected proposal.");
  return scope;
}
function retain(root, relative, bytes) {
  ensureDirectory(root, path.posix.dirname(relative));
  if (fs.existsSync(safePath(root, relative))) {
    if (!readFile(root, relative).equals(bytes)) fail("RETAINED_FILE_CONFLICT", "An interrupted operation left different retained bytes: " + relative);
  } else writeNew(root, relative, bytes);
}
function prepareCapture(loaded, data, id) {
  const source = data.source;
  if (source.kind !== "host_capture") return;
  let capture, bytes;
  if (source.claude_capture) {
    capture = require("../claude-capture.cjs").read(source.claude_capture);
    bytes = capture.bytes;
    source.locator = capture.source_ref;
    source.provenance = "claude-code-record-v1";
    source.native_identity = capture.capture_message;
    source.native_spec = { session_id: source.claude_capture.session_id, message_uuid: source.claude_capture.message_uuid };
    delete source.claude_capture;
  } else {
    text(source.message_path, "source.message_path"); text(source.locator, "source.locator");
    const target = fs.realpathSync.native(path.resolve(loaded.root, source.message_path));
    for (const prepared of loaded.entries.filter(entry => entry.type === "reply_prepared")) {
      const generated = path.resolve(loaded.root, "replies", prepared.id + ".md");
      if (path.relative(target, generated) === "" || fs.existsSync(generated) && fs.realpathSync.native(generated) === target) fail("PREPARED_CAPTURE_SOURCE", "A generated draft file is not actual-message evidence.");
    }
    bytes = fs.readFileSync(target);
    source.provenance = "attributed-host-export";
  }
  if (!bytes.length || !Buffer.from(bytes.toString("utf8"), "utf8").equals(bytes)) fail("INVALID_CAPTURE", "Actual capture must contain intact UTF-8 text.");
  source.retained_ref = "captures/" + sha256(bytes) + ".txt";
  source.sha256 = sha256(bytes);
  delete source.message_path;
  retain(loaded.root, source.retained_ref, bytes);
  if (capture) {
    source.native_record_ref = "captures/" + sha256(capture.record_bytes) + ".host-record.json";
    source.native_order_ref = "captures/" + sha256(capture.order_bytes) + ".host-order.json";
    retain(loaded.root, source.native_record_ref, capture.record_bytes);
    retain(loaded.root, source.native_order_ref, capture.order_bytes);
  }
}
function captureText(loaded, delivery) {
  const source = delivery.source;
  const bytes = readFile(loaded.root, source.retained_ref);
  if (sha256(bytes) !== source.sha256 || !Buffer.from(bytes.toString("utf8"), "utf8").equals(bytes)) fail("CAPTURE_CHANGED", "Retained actual reply does not match its saved bytes.");
  if (source.provenance === "claude-code-record-v1") {
    const captured = require("../claude-capture.cjs").read({ ...source.native_spec, transcript_path: safePath(loaded.root, source.native_record_ref) });
    if (!captured.bytes.equals(bytes) || captured.source_ref !== source.locator) fail("CAPTURE_CHANGED", "Retained native record and actual text disagree.");
    const orderBytes = readFile(loaded.root, source.native_order_ref);
    if (sha256(orderBytes) !== source.native_identity.order_sha256) fail("CAPTURE_CHANGED", "Retained native order proof changed.");
  }
  return bytes.toString("utf8");
}
const normalizeLines = value => value.replace(/\r\n/g, "\n");
function currentReply(loaded, ref) {
  const all = loaded.entries.filter(entry => entry.type === "reply_recorded").map(entry => ({ ref: entry.id, ...entry.data }));
  let members = all.filter(item => item.ref === ref);
  if (!members.length) members = all.filter(item => item.prepared === ref);
  if (!members.length) return { status: "unavailable", delivery: null, observation_refs: [], gaps: [{ code: "ACTUAL_REPLY_UNAVAILABLE", message: "No actual reply observation is retained." }] };
  const selected = new Set(members.map(item => item.ref));
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of all) if (!selected.has(item.ref) && [item.capture_ref, item.supersedes_recording_ref].some(link => selected.has(link)) || selected.has(item.ref) && [item.capture_ref, item.supersedes_recording_ref].some(link => link && !selected.has(link))) {
      selected.add(item.ref);
      for (const link of [item.capture_ref, item.supersedes_recording_ref]) if (link) selected.add(link);
      changed = true;
    }
  }
  members = all.filter(item => selected.has(item.ref));
  const result = { observation_refs: members.map(item => item.ref), gaps: [] };
  const conflict = message => ({ ...result, status: "conflict", delivery: null, gaps: [{ code: "ACTUAL_REPLY_CONFLICT", message }] });
  if (members.some(member => member.prepared && all.some(other => !selected.has(other.ref) && other.prepared === member.prepared
    && (!other.before_user || !member.before_user || other.before_user === member.before_user)))) return conflict("Another observation may concern the same reply; explicitly reconcile their identity before using its offer.");
  // A shared prepared draft alone does not identify two observations as one reply.
  if (!all.some(item => item.ref === ref) && members.length > 1) {
    const connected = new Set([members[0].ref]);
    let grew = true;
    while (grew) { grew = false; for (const item of members) if (connected.has(item.ref) || [item.capture_ref, item.supersedes_recording_ref].some(link => connected.has(link))) for (const link of [item.ref, item.capture_ref, item.supersedes_recording_ref].filter(Boolean)) if (!connected.has(link)) { connected.add(link); grew = true; } }
    if (members.some(item => !connected.has(item.ref))) return conflict("Multiple observations need explicit same-reply links.");
  }
  // A newly retained capture can confirm an existing interpretation without
  // requiring another copy of that interpretation. Empty capture items do not
  // silently retire the earlier semantic mapping.
  const superseded = new Set(members.filter(item => item.source.kind === "assistant_recorded" || item.items?.length).map(item => item.supersedes_recording_ref).filter(Boolean));
  const interpretations = members.filter(item => item.source.kind === "assistant_recorded" && !superseded.has(item.ref));
  if (interpretations.length > 1) return conflict("Competing actual-message interpretations remain unresolved.");
  let effective = interpretations[0] || members.at(-1);
  const anchors = [...new Set(members.map(item => item.before_user).filter(Boolean))];
  const drafts = [...new Set(members.map(item => item.prepared).filter(Boolean))];
  if (anchors.length > 1 || drafts.length > 1) return conflict("Same-reply observations disagree about conversation identity or order.");
  effective = { ...effective, ...(anchors.length ? { before_user: anchors[0] } : {}), ...(drafts.length ? { prepared: drafts[0] } : {}) };
  const captures = members.filter(item => item.source.kind === "host_capture");
  if (captures.length) {
    let textValue;
    try {
      const texts = captures.map(item => captureText(loaded, item));
      if (new Set(texts.map(normalizeLines)).size !== 1) return conflict("Linked host captures disagree about the actual reply.");
      textValue = texts[0];
    } catch (error) { return { ...result, status: "unavailable", delivery: null, gaps: [{ code: error.code || "CAPTURE_UNAVAILABLE", message: error.message }] }; }
    const mapped = effective.items || [];
    if (mapped.some(item => !normalizeLines(textValue).includes(normalizeLines(item.text)))) return conflict("The current item interpretation is not supported by the captured text. Record a corrected interpretation.");
    effective = { ...effective, actual_text: textValue, text_source_ref: captures.at(-1).ref };
  }
  return { ...result, status: "current", delivery: structuredClone(effective) };
}
function actualItem(delivery, locator) {
  const items = delivery.items || [];
  if (/^items\/\d+$/.test(locator || "")) return items[Number(locator.split("/")[1])] || null;
  const matches = items.filter(item => item.label === locator);
  return matches.length === 1 ? matches[0] : null;
}
function reportDiscussion(loaded, scope, before, atEntry = Infinity) {
  const discussed = new Set();
  for (const entry of loaded.entries.filter(item => item.type === "reply_recorded" && sequence(item.id) <= atEntry)) {
    const reply = currentReply({ ...loaded, entries: loaded.entries.filter(item => sequence(item.id) <= atEntry) }, entry.id);
    if (reply.status !== "current" || !reply.delivery.before_user || sequence(reply.delivery.before_user) > before) continue;
    for (const item of reply.delivery.items || []) if (["findings", "answer"].includes(item.kind)) for (const ref of item.work_refs || []) discussed.add(ref);
  }
  return scope.findings_refs.every(ref => discussed.has(ref));
}
function permission(loaded, scopeRef) {
  const scope = scopeFor(loaded, scopeRef);
  const decisions = loaded.entries.filter(entry => entry.type === "decision" && entry.data.scope === scopeRef).sort((left, right) =>
    Math.max(...array(left.data.user_message).map(sequence)) - Math.max(...array(right.data.user_message).map(sequence)) || sequence(left.id) - sequence(right.id));
  const latest = decisions.at(-1);
  if (!latest) return { status: "offered", scope_ref: scopeRef };
  const value = latest.data, common = { scope_ref: scopeRef, decision_ref: latest.id };
  if (value.choice !== "accept") return { ...common, status: { defer: "deferred", decline: "declined", withdraw: "withdrawn" }[value.choice] };
  try { currentScope(loaded, scope); } catch (error) { return { ...common, status: "stale", reason: error.message }; }
  const actual = currentReply(loaded, value.actual_reply);
  const item = actual.delivery && actualItem(actual.delivery, value.item);
  if (actual.status !== "current" || !item || item.kind !== "option" || item.scope_ref !== scopeRef) return { ...common, status: "unresolved", reason: "The original acceptance's complete actual offer needs reconciliation." };
  if (scope.action === "report") {
    const before = Math.min(...array(value.user_message).map(sequence));
    if (!reportDiscussion(loaded, scope, before, sequence(latest.id)) || !reportDiscussion(loaded, scope, before)) return { ...common, status: "unresolved", reason: "The original report discussion is not supported by the current actual-message evidence." };
  }
  return { ...common, status: "accepted" };
}
function prepare(loaded, type, value, id) {
  const data = structuredClone(value);
  if (type === "scope") {
    object(data.terms, "terms"); object(data.execution, "execution");
    if (!["analysis", "report"].includes(data.action)) fail("INVALID_INPUT", "Scopes protect analysis or report work.");
    if (Object.hasOwn(data, "scope_sha256")) fail("INVALID_INPUT", "The utility supplies scope integrity metadata.");
    const context = overlay(loaded, { id, type, data });
    strings(data.basis_refs, "basis_refs", true);
    if (data.basis_versions) fail("INVALID_INPUT", "Fresh scopes take basis_refs; the utility freezes exact versions.");
    data.findings_refs ||= [];
    data.basis_versions = basisBindings(context, [...data.basis_refs, ...data.findings_refs, ...(data.execution?.evidence_refs || [])]);
    delete data.basis_refs;
    const plan = planFor(loaded, data);
    const sources = require("./runs.cjs").resolveInputs(context, plan, { offer: true });
    data.execution.inputs = plan.inputs.map(input => input.deferred_release ? input : { ...input, sha256: sources.find(source => source.source_ref === input.source_ref && source.path === input.path).source_sha256 });
    data.scope_sha256 = sha256(canonical(data));
  }
  if (type === "reply_prepared") {
    data.renderer ||= RENDERER;
    data.response ||= {};
    object(data.response, "response");
    for (const key of ["user_questions", "explanations", "questions", "next_steps"]) {
      data.response[key] ||= [];
      if (!Array.isArray(data.response[key])) fail("INVALID_INPUT", "response." + key + " must be an array.");
    }
    for (const [index, option] of data.response.next_steps.entries()) {
      option.option_id ||= "N" + (index + 1);
      option.kind ||= option.scope_ref ? "action" : "discussion";
      option.actor ||= "consultant";
      option.basis_refs ||= [];
      if (option.proposal || option.execution_plan || option.scope_file) fail("INVALID_INPUT", "Prepared options reference one scope; its terms and link are generated.");
    }
  }
  if (type === "reply_recorded") { object(data.source, "source"); data.items ||= []; prepareCapture(loaded, data, id); }
  return data;
}
function render(loaded, entry) {
  if (entry.type !== "reply_prepared") return {};
  const exchange = structuredClone(entry.data);
  if (exchange.renderer !== RENDERER) fail("UNSUPPORTED_RENDERER", "Unsupported v8 response renderer: " + exchange.renderer);
  for (const option of exchange.response.next_steps) if (option.scope_ref) {
    const scope = scopeFor(loaded, option.scope_ref);
    option.proposal = scope.terms;
    option.scope_file = path.resolve(loaded.root, "scopes", option.scope_ref + ".md").replace(/\\/g, "/");
  }
  return { response_markdown: layout.renderV11Exchange(exchange), response_items: layout.responseItems(exchange),
    ...require("../writing.cjs").responseFeedback(exchange, { optionLimit: 50 }) };
}
function validate(loaded, entry) {
  const data = entry.data;
  const context = overlay(loaded, entry);
  direction(context, data);
  for (const definition of records.definitions(entry).slice(1)) if (definition.kind === "evidence" && definition.body.kind === "computed") require("./runs.cjs").assertComputedEvidence(context, definition.body);
  if (data.user_message) incoming(loaded, data.user_message);
  if (data.responds_to) handles(loaded, data.responds_to);
  if (entry.type === "scope") {
    if (!["analysis", "report"].includes(data.action)) fail("INVALID_INPUT", "Scopes protect analysis or report work.");
    object(data.terms, "scope terms");
    for (const field of ["target", "population", "evidence", "approach", "outputs", "claim_boundary"]) text(data.terms[field], "terms." + field);
    strings(data.terms.checks, "terms.checks"); assignment(context, data.assignment);
    const required = data.action === "analysis" ? ["design_worker", "execution"] : ["report_writer", "reporting"];
    if (data.assignment.specialist_id !== required[0] || data.assignment.operation !== required[1]) fail("ASSIGNMENT_MISMATCH", "Scope action and specialist operation disagree.");
    const plan = planFor(loaded, data);
    if (data.action === "analysis" && plan.design_id !== data.assignment.design_id) fail("ASSIGNMENT_MISMATCH", "Scope design must match its assignment.");
    for (const key of ["kind", "objective", "claim_boundary", "target", "population", "estimator", "diagnostics", "purpose", "interpretation_ref", "scope_ref", "authorization_ref"]) if (Object.hasOwn(data.execution, key)) fail("DUPLICATE_SCOPE_TERM", "Shared terms and work identity do not belong in execution: " + key);
    currentScope(context, data);
    if (!data.basis_versions.some(binding => { const body = resolve(context, binding.ref).body; return body.kind === "target" && body.status === "current" && [...array(body.basis_refs), ...array(body.user_contribution_refs)].length; })) fail("MISSING_TARGET_BINDING", "A protected scope must bind its current source-linked target decision.");
    if (data.action === "report") {
      strings(data.findings_refs, "findings_refs", true);
      for (const ref of data.findings_refs) validateFinding(context, ref);
    }
    if (data.supersedes) scopeFor(loaded, data.supersedes);
  }
  if (entry.type === "decision") {
    const sources = incoming(loaded, data.user_message), scope = scopeFor(loaded, data.scope);
    if (!["accept", "defer", "decline", "withdraw"].includes(data.choice)) fail("INVALID_INPUT", "Unknown decision disposition.");
    text(data.actual_reply, "actual_reply"); text(data.item, "item");
    const prior = loaded.entries.some(item => item.type === "decision" && item.data.scope === data.scope && item.data.choice === "accept");
    if (data.choice === "accept" || !prior) {
      const actual = currentReply(loaded, data.actual_reply), item = actual.delivery && actualItem(actual.delivery, data.item);
      if (actual.status !== "current" || item?.kind !== "option" || item.scope_ref !== data.scope) fail("INVALID_AUTHORIZATION", "Selection must identify an unambiguous actual option carrying the complete saved scope.");
      if (!actual.delivery.before_user || sources.some(ref => sequence(ref) < sequence(actual.delivery.before_user))) fail("EARLY_AUTHORIZATION", "The selected source must follow the actual offered reply.");
      if (data.choice === "accept") {
        if (sources.some(ref => entryFor(loaded, ref).data.complete !== true)) fail("INCOMPLETE_USER_SOURCE", "Acceptance requires the complete original message, including its conditions.");
        if (sources.some(ref => sequence(ref) <= sequence(data.scope))) fail("EARLY_AUTHORIZATION", "Acceptance must follow the saved offered scope.");
        currentScope(loaded, scope);
        if (sources.some(ref => loaded.entries.some(item => item.type === "decision" && item.data.choice === "accept" && array(item.data.user_message).includes(ref)))) fail("REUSED_USER_DECISION", "An already consumed acceptance source cannot authorize another action.");
        if (scope.action === "report" && !reportDiscussion(loaded, scope, Math.min(...sources.map(sequence)))) fail("FINDINGS_NOT_DISCUSSED", "Report acceptance requires the governing findings in actual prior communication.");
      }
    }
    if (data.presentation_adjustment) {
      const adjustment = data.presentation_adjustment;
      strings(adjustment.formats, "presentation_adjustment.formats", true);
      if (scope.action !== "report" || data.choice !== "accept" || !sources.includes(adjustment.user_message) || adjustment.formats.some(format => !["markdown", "html", "pdf", "docx", "text"].includes(format))) fail("INVALID_AUTHORIZATION", "A local report-format adjustment requires its retained acceptance source.");
    }
  }
  if (entry.type === "reply_recorded") validateRecording(loaded, entry);
  if (["review", "reply_prepared", "work"].includes(entry.type)) {
    handles(loaded, data.responds_to);
    if (entry.type === "review") {
      text(data.summary, "review.summary"); assignment(loaded, data.assignment);
      const selected = handles(loaded, data.responds_to).map(item => item.entry.data.next_action).filter(Boolean);
      if (!selected.some(action => action.kind === "specialist" && canonical(action.assignment) === canonical(data.assignment))) fail("ASSIGNMENT_MISMATCH", "Review must follow its prospective selected assignment.");
      if (loaded.entries.some(prior => prior.type === "review" && sameRound(loaded, prior.data.responds_to, data.responds_to))) fail("REVIEW_LIMIT", "This actual user round already has its bounded specialist review.");
      text(data.question_addressed, "review.question_addressed");
      strings(data.work_performed, "review.work_performed", true);
      strings(data.findings, "review.findings", true);
    }
    if (entry.type === "reply_prepared") validateResponse(loaded, entry, context);
    if (entry.type === "work") {
      if (data.phase === "started" && data.scope) currentScope(context, scopeFor(loaded, data.scope));
      require("./runs.cjs").validateEntry(loaded, entry);
    }
  }
}
function validateFinding(loaded, ref) {
  const value = resolve(loaded, ref), run = (loaded.state.runs || []).find(item => item.ref === base(ref));
  if (run) { if (run.phase !== "completed") fail("INVALID_FINDINGS", "Findings require a completed run."); return; }
  if (entryFor(loaded, base(ref))?.type === "review") return;
  if (value.body.kind === "computed") { require("./runs.cjs").assertComputedEvidence(loaded, value.body); return; }
  fail("INVALID_FINDINGS", "Findings must refer to a completed run, review or computed evidence.");
}
function linkedRunRefs(loaded, refs, at, onGap) {
  const visited = new Set(), runs = new Set();
  function visit(ref, owner) {
    let found;
    try { found = owner ? records.resolveAt(loaded, ref, owner) : records.resolve(loaded, ref); }
    catch (error) { if (!onGap) throw error; onGap(ref, error); return; }
    const key = found.ref + "@" + found.event_ref;
    if (visited.has(key)) return;
    visited.add(key);
    // Explicit assessed-work links carry review meaning; source citations do not.
    if (found.kind === "review") {
      for (const linked of array(found.body.work_refs)) visit(linked, found.event_ref);
      return;
    }
    const runRef = found.kind === "evidence" && found.body.kind === "computed" ? found.body.run_id
      : found.kind === "work" ? found.body.run || found.ref : null;
    if ((loaded.state.runs || []).some(run => run.ref === runRef)) runs.add(runRef);
  }
  for (const ref of array(refs)) visit(ref, at);
  return [...runs];
}
function validateRecording(loaded, entry) {
  const data = entry.data;
  if (!["assistant_recorded", "host_capture"].includes(data.source.kind)) fail("INVALID_INPUT", "Actual source must identify assistant recording or host capture.");
  text(data.source.locator, "actual source locator");
  if (data.prepared && entryFor(loaded, data.prepared)?.type !== "reply_prepared") fail("UNKNOWN_REFERENCE", "prepared must identify the saved draft.");
  if (data.before_user) {
    text(data.before_user, "before_user"); incoming(loaded, data.before_user);
    if (data.prepared && sequence(data.prepared) >= sequence(data.before_user)) fail("MESSAGE_ORDER_CONFLICT", "The actual reply's draft must precede its following user message.");
  }
  if (data.source.kind === "assistant_recorded" && !data.before_user) fail("MISSING_MESSAGE_ANCHOR", "Record which retained user message followed this actual reply.");
  if (!Array.isArray(data.items)) fail("INVALID_INPUT", "Actual items must be an array.");
  const captured = data.source.kind === "host_capture" ? captureText(loaded, data) : null;
  for (const item of data.items) {
    object(item, "actual item"); text(item.text, "actual item text");
    if (!["answer", "explanation", "findings", "summary", "question", "option", "other"].includes(item.kind)) fail("INVALID_INPUT", "Unsupported actual item kind.");
    if (item.scope_ref) {
      if (item.kind !== "option" && item.kind !== "answer") fail("INVALID_INPUT", "Only actual option/answer items map scope terms.");
      scopeFor(loaded, item.scope_ref);
      if (data.before_user && sequence(item.scope_ref) >= sequence(data.before_user)) fail("MESSAGE_ORDER_CONFLICT", "The mapped scope must have existed before the following user message.");
    }
    if (item.question_ref) resolve(loaded, item.question_ref, "question");
    for (const ref of item.work_refs || []) resolve(loaded, ref);
    if (captured && !normalizeLines(captured).includes(normalizeLines(item.text))) fail("CAPTURE_MAPPING_MISMATCH", "Mapped item text must be present in the genuine capture.");
  }
  for (const key of ["capture_ref", "supersedes_recording_ref"]) if (data[key]) {
    const prior = entryFor(loaded, data[key]);
    if (prior?.type !== "reply_recorded" || key === "capture_ref" && prior.data.source.kind !== "host_capture") fail("UNKNOWN_REFERENCE", "Same-reply links require the appropriate earlier observation.");
    if (prior.data.prepared && data.prepared && prior.data.prepared !== data.prepared || prior.data.before_user && data.before_user && prior.data.before_user !== data.before_user) fail("REPLY_IDENTITY_CONFLICT", "A replacement cannot change the original draft or following-message anchor.");
    if (key === "supersedes_recording_ref" && loaded.entries.some(item => item.type === "reply_recorded" && item.data.supersedes_recording_ref === data[key] && (item.data.source.kind === "assistant_recorded" || item.data.items?.length))) fail("RECORDING_SUPERSEDED", "Correct the current recording instead of creating competing replacement branches.");
  }
}
function validateResponse(loaded, entry, context) {
  const response = entry.data.response;
  const closingSources = new Set(handles(loaded, entry.data.responds_to).flatMap(item => item.incoming));
  const fromClosing = ref => {
    if (closingSources.has(ref)) return true;
    const record = local(loaded, entry, ref);
    return record.kind === "evidence" && record.body.kind === "user_statement" && closingSources.has(record.body.source_ref);
  };
  object(response, "response");
  for (const key of ["user_questions", "explanations", "questions", "next_steps"]) if (!Array.isArray(response[key])) fail("INVALID_INPUT", "response." + key + " must be an array.");
  for (const answer of response.user_questions) {
    const resolved = local(loaded, entry, answer.question_ref), question = resolved.body;
    if (resolved.kind !== "question" || question.origin !== "user") fail("INVALID_INPUT", "User-facing answers must refer to user-origin questions.");
    if (answer.echo_question !== undefined && typeof answer.echo_question !== "boolean") fail("INVALID_INPUT", "echo_question must be a boolean.");
    text(answer.answer, "answer");
    if (answer.echo_question || answer.text !== undefined) text(answer.text, "question text");
    if (!["answered", "pending", "withdrawn"].includes(answer.status)) fail("INVALID_INPUT", "Unknown answer disposition.");
    if (question.status !== { answered: "answered", pending: "open", withdrawn: "retired" }[answer.status]) fail("ANSWER_STATUS_MISMATCH", "The prepared answer must match the canonical question disposition.");
    for (const ref of answer.basis_refs || []) local(loaded, entry, ref);
    if (answer.scope_ref && (answer.status !== "answered" || !response.next_steps.some(option => option.scope_ref === answer.scope_ref))) fail("SCOPE_MISMATCH", "A scope answer must accompany its selectable option.");
    if (answer.scope_ref && !(question.basis_refs || []).some(fromClosing)) fail("MISSING_USER_SOURCE", "An extended scope answer requires the closing user's retained question.");
  }
  for (const item of response.explanations) { text(item.text, "explanation"); for (const ref of item.basis_refs || []) local(loaded, entry, ref); }
  for (const item of response.questions) {
    const question = local(loaded, entry, item.question_ref);
    if (question.kind !== "question" || question.body.origin === "user") fail("INVALID_INPUT", "Consultant questions require their own canonical question identity.");
    text(item.text, "question text");
  }
  if (response.status !== undefined) text(response.status, "preceding-turn summary");
  if (response.findings) {
    text(response.findings.summary, "findings.summary");
    strings(response.findings.diagnostics, "findings.diagnostics"); strings(response.findings.limitations, "findings.limitations"); strings(response.findings.work_refs, "findings.work_refs", true);
    for (const ref of response.findings.work_refs) validateFinding(context, ref);
  }
  for (const option of response.next_steps) {
    for (const key of ["option_id", "kind", "label", "actor", "scope"]) text(option[key], "option." + key);
    if (!["action", "discussion"].includes(option.kind)) fail("INVALID_INPUT", "Next-step kind must be action or discussion.");
    if (option.kind === "action" && !option.scope_ref)
      fail("MISSING_SCOPE", "Action options require their saved protected scope.");
    if (option.assignment) assignment(context, option.assignment);
    for (const ref of option.basis_refs || []) local(loaded, entry, ref);
    if (option.scope_ref) {
      // The offered scope must remain current after this reply's adopted updates.
      const scope = currentScope(context, scopeFor(loaded, option.scope_ref));
      if (option.kind !== "action" || option.actor !== "consultant") fail("INVALID_INPUT", "Protected options are consultant actions.");
      if (scope.action === "report") for (const ref of scope.findings_refs) if (!response.findings?.work_refs.includes(ref) && !reportDiscussion(loaded, { findings_refs: [ref] }, Infinity)) fail("FINDINGS_NOT_DISCUSSED", "A report offer must discuss its governing findings in this or an actual earlier reply.");
    } else if (option.assignment?.specialist_id === "report_writer" || option.assignment?.specialist_id === "design_worker" && option.assignment.operation === "execution") fail("MISSING_SCOPE", "Protected next steps require their saved scope.");
  }
  for (const values of [response.questions.map(item => item.question_ref), response.user_questions.map(item => item.question_ref), response.next_steps.map(item => item.option_id)]) if (new Set(values).size !== values.length) fail("DUPLICATE_ITEM", "A response repeats the same question or option identity.");
  const covered = new Set(response.user_questions.map(item => item.question_ref));
  for (const question of context.state.questions) if (question.origin === "user" && (question.basis_refs || []).some(fromClosing) && !covered.has(question.question_id)) fail("UNANSWERED_USER_QUESTION", "Answer or explicitly retain the closing user's question: " + question.question_id);
  const rendered = render(loaded, entry);
  if (!rendered.response_items.length) fail("EMPTY_RESPONSE", "A prepared reply must contain visible content.");
  const discussedRuns = new Set(linkedRunRefs(context, response.findings?.work_refs, entry.id));
  for (const run of loaded.state.runs || []) if (run.kind === "analysis" && run.phase === "completed" && sameRound(loaded, run.responds_to, entry.data.responds_to) && !discussedRuns.has(run.ref)) fail("FINDINGS_DISCUSSION_REQUIRED", "Closeout must present completed analysis findings and limits.");
}
function requireWorkDirection(loaded, respondsTo, scopeRef, decisionRef) {
  if (records.pendingMessages(loaded).length) fail("DIRECTION_PENDING", "Retained incoming messages must be handled before dependent work.");
  const source = handles(loaded, respondsTo), latest = latestDirection(loaded);
  if (!latest || latest.action.kind !== "specialist" || !source.some(item => item.incoming.some(ref => latest.incoming.includes(ref)))) fail("DIRECTION_CHANGED", "Work must follow the current prospectively recorded specialist direction.");
  if (loaded.entries.some(entry => entry.type === "reply_prepared" && sameRound(loaded, entry.data.responds_to, respondsTo))) fail("TURN_CLOSED", "The prior round returned control; further output needs later user steering.");
  if (scopeRef) {
    if (latest.incoming.some(ref => entryFor(loaded, ref).data.complete !== true)) fail("INCOMPLETE_USER_SOURCE", "Protected work must account for the complete current message.");
    const action = latest.action;
    const selectedScope = action.scope_ref || (/^e[1-9]\d*$/.test(action.scope || "") ? action.scope : null);
    if (selectedScope !== scopeRef || (action.decision || action.authorization_ref) !== decisionRef) fail("DIRECTION_CHANGED", "Current direction does not select this exact accepted scope.");
    const scope = scopeFor(loaded, scopeRef), selected = permission(loaded, scopeRef);
    if (selected.status !== "accepted" || selected.decision_ref !== decisionRef) fail("INVALID_AUTHORIZATION", selected.reason || "The scope is not currently accepted.");
    if (canonical(action.assignment) !== canonical(scope.assignment)) fail("ASSIGNMENT_MISMATCH", "Work must follow the accepted scope's assignment.");
  }
  return latest;
}
module.exports = { prepare, validate, render, currentReply, permission, planFor, scopeFor, currentScope, basisBindings, latestDirection, requireWorkDirection, captureText, validateFinding, linkedRunRefs };
