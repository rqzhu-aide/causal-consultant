"use strict";

// The v8 journal owns definitions. This module reconstructs disposable state;
// it never reads/writes files or infers scientific meaning from prose.
const { fail, canonical } = require("../files.cjs");
const { jsonValue, object, text, enumeration, strings, CATALOG, validateAdditionalDesigns } = require("../model.cjs");

const FORMAT = "consultation-journal-v8";
const TYPES = ["user_message", "knowledge", "interpretation", "scope", "decision", "review", "reply_prepared", "reply_recorded", "work", "correction"];
const COLLECTIONS = {
  question: { collection: "questions", id: "question_id", prefix: "q" },
  evidence: { collection: "evidence", id: "evidence_id", prefix: "f" },
  assumption: { collection: "assumptions", id: "assumption_id", prefix: "a" },
  scientific_decision: { collection: "decisions", id: "decision_id", prefix: "d" },
  route: { collection: "candidate_routes", id: "strategy_id", prefix: "r" },
  user_context: { collection: "user_context", id: "context_id", prefix: "p" },
  result_condition: { collection: "result_conditions", id: "condition_id", prefix: "c" }
};
const ENTRY = /^e[1-9][0-9]*$/;
const ENTITY = /^[qfadrpc][1-9][0-9]*$/;
const EXACT = /^([qfadrpc][1-9][0-9]*)@(e[1-9][0-9]*)$/;
const ITEM = /^(e[1-9][0-9]*)\/(?:([AQN][1-9][0-9]*)|items\/(0|[1-9][0-9]*))$/;
const REF_FIELDS = new Set(["basis_refs", "incoming_refs", "evidence_refs", "evidence_ref", "assumption_refs", "answer_refs",
  "user_contribution_refs", "user_refs", "user_ref", "related_unresolved_question_refs", "corrects_refs", "knowledge_refs", "work_refs",
  "completed_work_refs", "findings_refs", "strategy_ids", "strategy_ids_it_could_change", "evidence_for", "evidence_against", "last_review_id",
  "route_changes", "assumptions_added_or_revised", "supersedes", "reconciles", "question_ref", "user_question_ref", "scope_ref",
  "authorization_ref", "focus_scope_ref", "run_id", "parent_run_id", "before_user", "capture_ref", "supersedes_recording_ref",
  "user_message", "responds_to", "prepared", "actual_reply", "decision", "run", "question_refs"]);
const copy = value => structuredClone(value);
const own = (value, key) => Object.hasOwn(value || {}, key);
const asList = value => value === undefined ? [] : Array.isArray(value) ? value : [value];
const sequence = ref => Number(String(ref).slice(1));

function emptyState(header) {
  object(header, "journal header", ["format", "case", "created_at"], ["_meta"]);
  if (header.format !== FORMAT) fail("UNSUPPORTED_FORMAT", "Expected " + FORMAT + ".");
  text(header.case, "header.case"); text(header.created_at, "header.created_at");
  return {
    state_meta: { schema_version: 8, format: FORMAT, project_id: header.case, last_event_id: "e0", sequence: 0,
      created_at: header.created_at, updated_at: header.created_at },
    project_understanding: {}, consultation: null, questions: [], evidence: [], assumptions: [], decisions: [], candidate_routes: [],
    specialist_reviews: [], runs: [], history_index: {}, action_scopes: [], action_decisions: [], focus_scope_ref: null,
    case_brief: {}, user_context: [], interpretations: [], exchanges: [], deliveries: [], turns: [], result_conditions: []
  };
}

function current(state, entity) {
  const config = COLLECTIONS[state.history_index[entity]?.kind];
  return config && state[config.collection].find(record => record[config.id] === entity);
}
function projectBody(update) {
  const config = COLLECTIONS[update.kind];
  if (!config) fail("INVALID_INPUT", "Unknown entity kind: " + update.kind);
  for (const value of Object.values(COLLECTIONS)) if (own(update, value.id)) fail("INVALID_INPUT", "Use entity, not a second " + value.id + " identity.");
  const { entity, kind, as, ...body } = update;
  if (kind === "evidence") { body.kind = body.evidence_kind; delete body.evidence_kind; }
  if (kind === "scientific_decision") { body.kind = body.decision_kind; delete body.decision_kind; }
  if (kind === "user_context") { body.kind = body.context_kind; delete body.context_kind; }
  return { [config.id]: entity, ...body };
}
function refValue(value) { return typeof value === "string" && (ENTRY.test(value) || ENTITY.test(value) || EXACT.test(value) || ITEM.test(value)); }

// Only semantic reference fields are inspected. Paths, quotations, labels and
// catalog identities must not become accidental links because of their spelling.
function references(body) {
  const result = new Set();
  function add(value, label) {
    for (const ref of asList(value)) {
      if (!refValue(ref)) fail("INVALID_REFERENCE", label + " needs a local entry/entity reference: " + String(ref));
      result.add(ref);
    }
  }
  function visit(value, key = "") {
    if (value === null || value === undefined) return;
    if (REF_FIELDS.has(key)) { add(value, key); return; }
    if (key === "basis_versions") {
      if (!Array.isArray(value)) fail("INVALID_INPUT", "basis_versions must be an array.");
      for (const binding of value) {
        object(binding, "basis version", ["ref", "event_ref"]);
        if (typeof binding.event_ref !== "string" || !ENTRY.test(binding.event_ref)) fail("INVALID_REFERENCE", "A basis version needs its defining entry.");
        if (typeof binding.ref !== "string") fail("INVALID_REFERENCE", "A basis version needs a local record reference.");
        const item = ITEM.exec(binding.ref);
        if (ENTITY.test(binding.ref)) add(binding.ref + "@" + binding.event_ref, "basis_versions");
        else if (item) {
          if (item[1] !== binding.event_ref) fail("INVALID_REFERENCE", "An actual-item basis names its containing reply entry.");
          add(binding.ref, "basis_versions");
        }
        else {
          if (binding.ref !== binding.event_ref || !ENTRY.test(binding.ref)) fail("INVALID_REFERENCE", "An immutable basis names its own defining entry.");
          add(binding.ref, "basis_versions");
        }
      }
      return;
    }
    if (key === "overview") {
      if (!value || typeof value !== "object" || Array.isArray(value)) fail("INVALID_INPUT", "overview must contain source-field bindings.");
      for (const binding of Object.values(value)) add(binding?.ref, "overview.ref");
      return;
    }
    if (["source", "environment", "legacy", "identification_basis"].includes(key)) return;
    // Scope is prose in a prepared option, and a reference in a decision/action.
    if (["scope", "question"].includes(key) && refValue(value)) { add(value, key); return; }
    if (key === "source_ref") { if (refValue(value)) add(value, key); return; }
    if (Array.isArray(value)) { value.forEach(item => visit(item)); return; }
    if (typeof value === "object") for (const [name, item] of Object.entries(value)) visit(item, name);
  }
  visit(body);
  return [...result];
}

function allocate(state, data, entryId) {
  jsonValue(data); object(data, "entry data", [], Object.keys(data || {}));
  if (!ENTRY.test(entryId) || sequence(entryId) !== state.state_meta.sequence + 1) fail("INVALID_REFERENCE", "Allocate against the next committed entry identity.");
  const next = copy(data), refs = {}, reserved = new Set();
  const counters = {};
  for (const config of Object.values(COLLECTIONS)) counters[config.prefix] = Math.max(0,
    ...Object.keys(state.history_index).filter(ref => new RegExp("^" + config.prefix + "[1-9][0-9]*$").test(ref)).map(sequence));
  if (own(next, "updates") && !Array.isArray(next.updates)) fail("INVALID_INPUT", "updates must be an array.");
  for (const update of next.updates || []) {
    if (!update || typeof update !== "object" || Array.isArray(update)) fail("INVALID_INPUT", "Each update is a complete typed entity definition.");
    const config = COLLECTIONS[update.kind];
    if (!config) fail("INVALID_INPUT", "Unknown entity kind: " + update.kind);
    if (own(update, "entity")) {
      if (!ENTITY.test(update.entity) || state.history_index[update.entity]?.kind !== update.kind) fail("UNKNOWN_REFERENCE", "Select an existing entity, or omit entity to allocate a new one.");
    } else update.entity = config.prefix + (++counters[config.prefix]);
    if (reserved.has(update.entity)) fail("DUPLICATE_ID", "An entity may be defined only once in one save: " + update.entity);
    reserved.add(update.entity);
    if (own(update, "as")) {
      if (typeof update.as !== "string" || !/^[a-z][a-z0-9_-]*$/.test(update.as) || ["__proto__", "constructor", "prototype", "entry"].includes(update.as)) fail("INVALID_INPUT", "Invalid local authoring alias; entry is reserved for the containing entry.");
      if (own(refs, update.as)) fail("DUPLICATE_ID", "Duplicate local authoring alias: " + update.as);
      refs[update.as] = update.entity; delete update.as;
    }
  }
  function aliases(value, key = "") {
    if (["source", "environment", "legacy", "identification_basis"].includes(key)) return value;
    const reference = REF_FIELDS.has(key) || ["scope", "question", "source_ref", "ref"].includes(key);
    if (typeof value === "string" && reference && value.startsWith("@")) {
      if (value === "@entry") return entryId;
      if (!own(refs, value.slice(1))) fail("UNKNOWN_REFERENCE", "Unknown local authoring alias: " + value);
      return refs[value.slice(1)];
    }
    if (Array.isArray(value)) return value.map(item => aliases(item, key));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, aliases(item, name)]));
    return value;
  }
  return { data: aliases(next), refs };
}

function normalize(state, data) {
  jsonValue(data);
  const result = copy(data), seen = new Set();
  if (own(result, "updates")) {
    if (!Array.isArray(result.updates)) fail("INVALID_INPUT", "updates must be an array.");
    result.updates = result.updates.filter(update => {
      if (!update || !COLLECTIONS[update.kind] || !ENTITY.test(update.entity)) fail("INVALID_INPUT", "An allocated update needs a known kind and entity.");
      if (seen.has(update.entity)) fail("DUPLICATE_ID", "An entity may be defined only once in one save: " + update.entity);
      seen.add(update.entity);
      const before = current(state, update.entity);
      return !before || canonical(before) !== canonical(projectBody(update));
    });
    if (!result.updates.length) delete result.updates;
  }
  return result;
}

function definitions(entry) {
  const result = [{ ref: entry.id, event_ref: entry.id, kind: entry.type, body: copy(entry.data) }];
  for (const update of entry.data.updates || []) result.push({ ref: update.entity, event_ref: entry.id, kind: update.kind, body: projectBody(update) });
  return result;
}

function resolve(loaded, ref) {
  if (!refValue(ref)) fail("INVALID_REFERENCE", "Invalid local record reference: " + String(ref));
  const item = ITEM.exec(ref);
  if (item) {
    const parent = resolve(loaded, item[1]);
    if (parent.kind !== "reply_recorded" || !Array.isArray(parent.body.items)) fail("UNKNOWN_REFERENCE", "An actual item locator requires recorded reply items.");
    const matches = item[3] !== undefined ? parent.body.items.filter((_, i) => i === Number(item[3]))
      : parent.body.items.filter(value => String(value.label || "").replace(/^\[|\]$/g, "") === item[2]);
    if (matches.length !== 1) fail("AMBIGUOUS_REFERENCE", "The actual reply item is missing or its observed label is ambiguous: " + ref);
    return { ref, event_ref: parent.event_ref, kind: "reply_item", body: copy(matches[0]) };
  }
  const exact = EXACT.exec(ref), recordRef = exact ? exact[1] : ref;
  const eventRef = exact ? exact[2] : ENTRY.test(recordRef) ? recordRef : loaded.state.history_index[recordRef]?.event_ref;
  const entry = loaded.entries.find(value => value.id === eventRef);
  const found = entry && definitions(entry).find(value => value.ref === recordRef);
  if (!found) fail("UNKNOWN_REFERENCE", "No definition exists at " + ref + ". A mention does not define a version.");
  return copy(found);
}

function resolveAt(loaded, ref, eventRef) {
  // Bare dependencies mean the definition available when their owner was saved.
  // Explicit exact references and immutable entries already identify their body.
  if (EXACT.test(ref) || ENTRY.test(ref) || ITEM.test(ref)) return resolve(loaded, ref);
  if (!ENTITY.test(ref) || !ENTRY.test(eventRef)) fail("INVALID_REFERENCE", "Historical dependency lookup needs an entity and owner entry.");
  let found;
  for (const entry of loaded.entries) {
    if (sequence(entry.id) > sequence(eventRef)) break;
    for (const definition of definitions(entry)) if (definition.ref === ref) found = definition;
  }
  if (!found) fail("UNKNOWN_REFERENCE", "No definition of " + ref + " exists at " + eventRef + ".");
  return copy(found);
}

function overviewSource(loaded, binding) {
  object(binding, "overview binding", ["ref"], ["field"]);
  const field = binding.field || "statement";
  if (typeof field !== "string" || !/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*$/.test(field)
    || field.split(".").some(key => ["__proto__", "prototype", "constructor"].includes(key))) fail("INVALID_INPUT", "An overview binding names a scalar content field.");
  const source = resolve(loaded, binding.ref);
  let value = source.body;
  for (const key of field.split(".")) {
    if (!value || typeof value !== "object" || !own(value, key)) fail("UNKNOWN_REFERENCE", "The overview source does not define " + field + ".");
    value = value[key];
  }
  text(value, "overview source " + binding.ref + "." + field);
  const exact = ENTITY.test(source.ref) ? source.ref + "@" + source.event_ref : binding.ref;
  return { text: value, source: { ref: binding.ref, record_ref: source.ref, field, event_ref: source.event_ref, basis_refs: [exact] } };
}

function handling(loaded, ref) {
  const seen = new Set(), origins = new Set();
  if (!asList(ref).length) fail("MISSING_HANDLING", "Select at least one source handling entry.");
  function visit(link) {
    if (!ENTRY.test(link)) fail("INVALID_REFERENCE", "Handling attribution requires a committed entry.");
    if (seen.has(link)) return;
    seen.add(link);
    const entry = loaded.entries.find(value => value.id === link);
    if (!entry) fail("UNKNOWN_REFERENCE", "Unknown handling entry: " + link);
    if (["knowledge", "interpretation", "decision"].includes(entry.type) && entry.data.user_message) {
      for (const message of asList(entry.data.user_message)) {
        if (resolve(loaded, message).kind !== "user_message") fail("UNKNOWN_REFERENCE", "Whole-message handling must name an original user_message.");
        origins.add(message);
      }
    } else if (entry.data.responds_to) for (const prior of asList(entry.data.responds_to)) visit(prior);
    else fail("MISSING_HANDLING", "The entry has no attributed incoming handling: " + link);
  }
  for (const link of asList(ref)) visit(link);
  return { entry: Array.isArray(ref) ? null : loaded.entries.find(value => value.id === ref), incoming: [...origins],
    source_sequence: Math.max(0, ...[...origins].map(sequence)) };
}
function pendingMessages(loaded) {
  const handled = new Set();
  for (const entry of loaded.entries) if (["knowledge", "interpretation", "decision"].includes(entry.type)) {
    for (const ref of asList(entry.data.user_message)) handled.add(ref);
  }
  return loaded.entries.filter(entry => entry.type === "user_message" && !handled.has(entry.id)).map(copy);
}

function validateEntity(update, state, loaded, entry) {
  const config = COLLECTIONS[update.kind], record = projectBody(update), label = update.kind + " " + update.entity;
  if (!new RegExp("^" + config.prefix + "[1-9][0-9]*$").test(update.entity)) fail("INVALID_INPUT", label + " has an incompatible entity identity.");
  if (state.history_index[update.entity] && state.history_index[update.entity].kind !== update.kind) fail("DUPLICATE_ID", "An entity cannot change kind.");
  const ref = (value, kind) => {
    const found = resolve(loaded, value);
    if (kind && found.kind !== kind) fail("UNKNOWN_REFERENCE", label + " requires " + kind + ": " + value);
    return found;
  };
  const refs = (values, kind, nonempty = false) => {
    if (!Array.isArray(values) || (nonempty && !values.length)) fail("INVALID_INPUT", label + " requires " + (nonempty ? "nonempty " : "") + "reference lists.");
    if (new Set(values).size !== values.length) fail("INVALID_INPUT", label + " contains repeated references.");
    values.forEach(value => ref(value, kind));
  };
  const optionalRefs = fields => { for (const [field, kind] of Object.entries(fields)) if (own(record, field)) refs(record[field], kind); };
  const optionalStrings = fields => { for (const field of fields) if (own(record, field)) strings(record[field], label + "." + field); };
  if (update.kind === "question") {
    object(record, label, ["question_id", "statement", "status"], ["reason", "basis_refs", "origin", "resolution"]);
    text(record.statement, label + ".statement"); enumeration(record.status, ["open", "answered", "retired"], label + ".status");
    if (record.status !== "open" || own(record, "reason")) text(record.reason, label + ".reason");
    if (own(record, "origin")) enumeration(record.origin, ["user", "consultant"], label + ".origin");
    optionalRefs({ basis_refs: undefined });
    if (record.origin === "user") {
      refs(record.basis_refs, undefined, true);
      if (!record.basis_refs.some(value => {
        const source = ref(value);
        return source.kind === "user_message" || source.kind === "evidence" && source.body.kind === "user_statement";
      })) fail("MISSING_USER_SOURCE", "A user question needs its originating retained user message.");
    }
    if (own(record, "resolution")) {
      if (record.origin === "user") fail("INVALID_INPUT", "User questions retain the existing status, reason and answer-evidence contract.");
      object(record.resolution, label + ".resolution", ["answer_refs", "remaining"]);
      refs(record.resolution.answer_refs); strings(record.resolution.remaining, label + ".resolution.remaining");
      if (record.status === "answered" && (!record.resolution.answer_refs.length || record.resolution.remaining.length)) fail("MISSING_ANSWER_SUPPORT", "An answered consultant question needs support and no unresolved remainder.");
      if (record.status === "open" && !record.resolution.remaining.length) fail("INVALID_INPUT", "An open partial question retains its exact remainder.");
    } else if (record.origin !== "user" && record.status !== "open") fail("MISSING_QUESTION_RESOLUTION", "A closed consultant question retains support and remaining uncertainty.");
  } else if (update.kind === "evidence") {
    object(record, label, ["evidence_id", "kind", "source_ref", "summary"], ["limitations", "source_sha256", "source_excerpt", "supersedes", "legacy", "run_id"]);
    enumeration(record.kind, ["user_statement", "file", "literature", "computed"], label + ".evidence_kind");
    text(record.source_ref, label + ".source_ref"); text(record.summary, label + ".summary"); optionalStrings(["limitations"]);
    if (own(record, "source_sha256") && !/^[a-f0-9]{64}$/.test(record.source_sha256)) fail("INVALID_INPUT", "source_sha256 must be a SHA-256 hash.");
    if (record.kind === "user_statement") {
      ref(record.source_ref, "user_message");
      if (own(record, "source_excerpt")) fail("INVALID_INPUT", "Original user words belong to user_message; cite its entry instead of duplicating them.");
    } else if (own(record, "source_excerpt")) text(record.source_excerpt, label + ".source_excerpt");
    if (record.kind === "computed") {
      const run = loaded.state.runs.find(item => item.ref === record.run_id);
      if (!run || run.phase !== "completed") fail("INCOMPLETE_RUN", "Computed evidence requires a completed work identity.");
      if (!record.source_ref.startsWith("runs/" + record.run_id + "/")) fail("UNKNOWN_REFERENCE", "Computed evidence must locate an artifact in its recorded run.");
      if (record.legacy) fail("INVALID_INPUT", "Historical imported findings are source evidence, not a new computed result.");
    } else if (own(record, "run_id")) fail("INVALID_INPUT", "Only computed evidence has run_id.");
    if (own(record, "legacy")) {
      object(record.legacy, label + ".legacy", ["source_project", "source_version", "verification"]);
      text(record.legacy.source_project, label + ".legacy.source_project"); text(record.legacy.source_version, label + ".legacy.source_version");
      enumeration(record.legacy.verification, ["legacy_unverified", "reviewed_summary"], label + ".legacy.verification");
    }
  } else if (update.kind === "assumption") {
    object(record, label, ["assumption_id", "statement", "status"], ["basis_refs", "supersedes"]);
    text(record.statement, label + ".statement"); enumeration(record.status, ["active", "revised", "retired"], label + ".status"); optionalRefs({ basis_refs: undefined });
  } else if (update.kind === "scientific_decision") {
    object(record, label, ["decision_id", "kind", "statement", "status"], ["basis_refs", "user_contribution_refs", "supersedes"]);
    text(record.statement, label + ".statement"); enumeration(record.kind, ["target", "investigation", "design", "execution", "reporting", "boundary"], label + ".decision_kind");
    enumeration(record.status, ["current", "superseded", "withdrawn"], label + ".status"); optionalRefs({ basis_refs: undefined, user_contribution_refs: "user_message" });
  } else if (update.kind === "route") {
    object(record, label, ["strategy_id", "target", "approach", "status", "reason"], ["design_id", "additional_design_ids", "support_ids", "data_requirements", "claim_boundary", "evidence_for", "evidence_against", "unmet_requirements", "reopen_or_promote_when", "last_review_id"]);
    for (const key of ["target", "approach", "reason"]) text(record[key], label + "." + key);
    enumeration(record.status, ["possible", "conditional", "preferred", "unsupported_with_current_evidence", "not_relevant"], label + ".status");
    if (own(record, "design_id") && record.design_id !== null) enumeration(record.design_id, CATALOG.designs, label + ".design_id");
    validateAdditionalDesigns(record, label);
    if (own(record, "support_ids")) { strings(record.support_ids, label + ".support_ids"); record.support_ids.forEach(value => enumeration(value, CATALOG.supports, label + ".support_ids")); }
    optionalStrings(["data_requirements", "unmet_requirements"]);
    for (const key of ["claim_boundary", "reopen_or_promote_when"]) if (own(record, key)) text(record[key], label + "." + key);
    optionalRefs({ evidence_for: "evidence", evidence_against: "evidence" }); if (own(record, "last_review_id")) ref(record.last_review_id, "review");
  } else if (update.kind === "user_context") {
    object(record, label, ["context_id", "kind", "statement", "basis_refs", "status"], ["supersedes"]);
    enumeration(record.kind, ["preference", "constraint", "communication", "domain_expertise", "statistical_expertise"], label + ".context_kind");
    text(record.statement, label + ".statement"); refs(record.basis_refs, undefined, true); enumeration(record.status, ["current", "superseded"], label + ".status");
  } else if (update.kind === "result_condition") {
    object(record, label, ["condition_id", "evidence_ref", "result_locator", "claim", "target", "assumption_refs", "basis_refs", "limitations"], ["inference", "supersedes"]);
    ref(record.evidence_ref, "evidence"); for (const key of ["result_locator", "claim", "target"]) text(record[key], label + "." + key);
    refs(record.assumption_refs, "assumption"); refs(record.basis_refs); strings(record.limitations, label + ".limitations");
    if (own(record, "inference")) {
      object(record.inference, label + ".inference", ["kind", "target", "guarantee"], ["hypothesis"]);
      enumeration(record.inference.kind, ["test", "interval", "estimate"], label + ".inference.kind");
      text(record.inference.target, label + ".inference.target"); text(record.inference.guarantee, label + ".inference.guarantee");
      if (record.inference.kind === "test" || own(record.inference, "hypothesis")) text(record.inference.hypothesis, label + ".inference.hypothesis");
    }
  }
  if (own(record, "supersedes")) {
    const prior = ref(record.supersedes, update.kind);
    if (prior.ref === update.entity) fail("INVALID_INPUT", "A new definition of the same entity does not supersede itself.");
  }
  validateContinuity(state, loaded, entry, update, record);
}

function validateContinuity(state, loaded, entry, update, record) {
  const before = current(state, update.entity);
  const corrected = entry.type === "correction" && (entry.data.corrects_refs || []).some(ref => ref === update.entity || ref.startsWith(update.entity + "@"));
  if (corrected) {
    text(entry.data.reason, "correction.reason");
    if (!references(record).some(ref => resolve(loaded, ref).kind !== "question")) fail("MISSING_SOURCE", "A correction needs attributable support.");
  }
  if (update.kind !== "question") return;
  if (before && !corrected && (record.statement !== before.statement || (record.origin || "consultant") !== (before.origin || "consultant"))) fail("QUESTION_IDENTITY_CHANGED", "Keep the original question meaning/origin; use a sourced correction for a recording error.");
  if (before?.resolution && !record.resolution && !corrected) fail("MISSING_QUESTION_RESOLUTION", "A replacement question must retain its supported answer and remainder.");
  if (record.origin === "user") {
    if (record.status === "retired" && before?.status !== "retired") {
      const added = (record.basis_refs || []).filter(ref => !(before?.basis_refs || []).includes(ref));
      if (!added.some(ref => resolve(loaded, ref).kind === "user_message")) fail("MISSING_USER_SOURCE", "Withdrawing a user question needs the user's distinct withdrawal source.");
    }
    if (record.status === "answered" && before?.status !== "answered" && !(record.basis_refs || []).some(ref => ["review", "evidence", "user_message"].includes(resolve(loaded, ref).kind))) fail("MISSING_ANSWER_SUPPORT", "A user-question answer requires retained support.");
    return;
  }
  const resolution = record.resolution;
  if (!resolution) return;
  const old = before?.resolution;
  const added = resolution.answer_refs.filter(ref => !(old?.answer_refs || []).includes(ref));
  if (old && !corrected && old.answer_refs.some(ref => !resolution.answer_refs.includes(ref))) fail("MEMORY_SOURCE_CHANGED", "Retain existing question support or explain its correction.");
  const reduced = (old?.remaining || []).some(part => !resolution.remaining.includes(part));
  if (!corrected && (reduced || (record.status === "answered" && before?.status !== "answered")) && !added.length) fail("MISSING_ANSWER_SUPPORT", "Resolving a question or reducing its remainder needs new support or a sourced correction.");
  const handled = asList(entry.data.user_message);
  for (const source of added) {
    const found = resolve(loaded, source);
    const user = found.kind === "user_message" ? found.ref : found.kind === "evidence" && found.body.kind === "user_statement" ? found.body.source_ref : null;
    if (user && !corrected && !handled.includes(user)) fail("MISSING_HANDLING", "Apply an incoming answer through the save that handles its original user message.");
  }
}

function validateCommon(state, entry, priorEntries) {
  jsonValue(entry);
  object(entry, "entry", ["id", "recorded_at", "type", "data", "_meta"]);
  if (!ENTRY.test(entry.id) || sequence(entry.id) !== state.state_meta.sequence + 1) fail("INVALID_EVENT", "Entry identity must be the next local sequence.");
  text(entry.recorded_at, "entry.recorded_at"); enumeration(entry.type, TYPES, "entry.type");
  object(entry.data, "entry.data", [], Object.keys(entry.data || {}));
  object(entry._meta, "entry._meta", ["request_hash", "previous_hash", "integrity_hash"], ["aliases"]);
  for (const key of ["request_hash", "previous_hash", "integrity_hash"]) if (!/^[a-f0-9]{64}$/.test(entry._meta[key])) fail("INVALID_EVENT", "Entry integrity and request metadata must contain SHA-256 hashes.");
  if (own(entry._meta, "aliases")) {
    object(entry._meta.aliases, "entry aliases", [], Object.keys(entry._meta.aliases || {}));
    for (const [alias, value] of Object.entries(entry._meta.aliases)) if (!/^[a-z][a-z0-9_-]*$/.test(alias) || !ENTITY.test(value)) fail("INVALID_EVENT", "Invalid generated authoring alias.");
  }
  const data = entry.data, entries = [...priorEntries, entry];
  if (entry.type === "work") {
    enumeration(data.phase, ["started", "completed", "failed", "abandoned"], "work.phase");
    if (!ENTRY.test(data.run)) fail("INVALID_INPUT", "work.run names its starting work entry.");
    if (!asList(data.responds_to).length) fail("MISSING_HANDLING", "Work retains its prospective handling attribution.");
    if (data.phase === "started") {
      if (data.run !== entry.id || state.runs.some(run => run.ref === data.run)) fail("INVALID_EVENT", "New work uses its own unique starting entry identity.");
      enumeration(data.kind, ["audit", "analysis", "discovery", "report"], "work.kind");
      for (const field of ["plan_ref", "claim_boundary", "started_at"]) text(data[field], "work." + field);
      if (!/^[a-f0-9]{64}$/.test(data.plan_sha256 || "")) fail("INVALID_INPUT", "A work start needs its frozen plan identity.");
    } else {
      const previous = state.runs.find(run => run.ref === data.run);
      if (!previous || previous.phase !== "started") fail("INVALID_EVENT", "A terminal entry requires an existing unfinished run.");
      if (canonical(data.responds_to) !== canonical(previous.responds_to)) fail("INVALID_EVENT", "A run's lifecycle preserves its original handling attribution.");
      text(data.completed_at, "work.completed_at");
      if (data.phase === "completed") {
        text(data.manifest_ref, "work.manifest_ref");
        if (!/^[a-f0-9]{64}$/.test(data.manifest_sha256 || "")) fail("INVALID_INPUT", "Completed work needs its retained manifest identity.");
      } else text(data.reason, "work.reason");
    }
  }
  const provisional = copy(state), seen = new Set();
  provisional.history_index[entry.id] = { kind: entry.type, event_ref: entry.id };
  if (own(data, "updates") && !Array.isArray(data.updates)) fail("INVALID_INPUT", "updates must be an array.");
  for (const update of data.updates || []) {
    if (!update || !COLLECTIONS[update.kind] || !ENTITY.test(update.entity)) fail("INVALID_INPUT", "Each update needs an allocated entity and known kind.");
    if (own(update, "as")) fail("INVALID_INPUT", "Resolve local aliases before commitment.");
    if (seen.has(update.entity)) fail("DUPLICATE_ID", "Duplicate entity definition in one entry.");
    seen.add(update.entity);
    provisional.history_index[update.entity] = { kind: update.kind, event_ref: entry.id };
  }
  // A completed run can adopt the results that were established by that run.
  if (entry.type === "work" && data.phase === "completed") {
    const index = provisional.runs.findIndex(run => run.ref === data.run);
    if (index >= 0) provisional.runs[index] = { ...provisional.runs[index], ...copy(data), ref: data.run };
  }
  const loaded = { entries, state: provisional };
  for (const ref of references(data)) resolve(loaded, ref);
  for (const update of data.updates || []) validateEntity(update, state, loaded, entry);
  if (entry.type === "user_message") {
    object(data, "user_message", ["text", "source", "complete"], ["attachments"]);
    if (typeof data.text !== "string" || (!data.text.trim() && !data.attachments?.length)) fail("INVALID_INPUT", "Retain the original message text; an attachment-only message needs its attachment references.");
    if (typeof data.source === "string") text(data.source, "user_message.source");
    else { object(data.source, "user_message.source", ["locator"], ["kind", "native_id", "sent_at"]); text(data.source.locator, "source.locator"); }
    if (typeof data.complete !== "boolean") fail("INVALID_INPUT", "user_message.complete must state whether all original words were retained.");
    if (own(data, "attachments") && !Array.isArray(data.attachments)) fail("INVALID_INPUT", "attachments must be an array.");
  }
  if (own(data, "user_message")) {
    if (!["knowledge", "interpretation", "decision"].includes(entry.type)) fail("INVALID_INPUT", "Whole-message handling belongs to knowledge, interpretation or decision.");
    const incoming = asList(data.user_message);
    if (!incoming.length || new Set(incoming).size !== incoming.length) fail("INVALID_INPUT", "Handling needs distinct incoming message references.");
    incoming.forEach(ref => { if (resolve(loaded, ref).kind !== "user_message") fail("UNKNOWN_REFERENCE", "Handling names original user_message entries."); });
  }
  if (own(data, "responds_to")) {
    if (!asList(data.responds_to).length) fail("MISSING_HANDLING", "responds_to cannot be empty.");
    handling({ entries: priorEntries, state }, data.responds_to);
  }
  if (own(data, "overview")) {
    object(data.overview, "overview", [], ["objective", "use", "intended_use", "audience", "causal_target", "current_claim_boundary"]);
    if (own(data.overview, "use") && own(data.overview, "intended_use")) fail("INVALID_INPUT", "Use one overview use field.");
    for (const value of Object.values(data.overview)) overviewSource(loaded, value);
  }
  if (own(data, "selection")) {
    object(data.selection, "selection", [], ["knowledge_refs", "work_refs"]);
    for (const [field, values] of Object.entries(data.selection)) {
      if (!Array.isArray(values) || new Set(values).size !== values.length) fail("INVALID_INPUT", "Selections must contain distinct references.");
      if (field === "work_refs") values.forEach(ref => { if (!["review", "work"].includes(resolve(loaded, ref).kind)) fail("UNKNOWN_REFERENCE", "work_refs selects reviews or work."); });
    }
  }
  if (own(data, "next_action")) {
    if (!["knowledge", "interpretation", "decision", "reply_prepared", "correction"].includes(entry.type)) fail("INVALID_INPUT", "This entry cannot update current direction.");
    object(data.next_action, "next_action", ["kind"], ["scope", "decision", "reason", "assignment", "question_refs", "scope_ref", "question_timing", "authorization_ref"]);
    enumeration(data.next_action.kind, ["lead_only", "specialist", "wait", "close"], "next_action.kind");
    if (!data.user_message && !data.responds_to) fail("MISSING_HANDLING", "A direction update needs incoming handling attribution.");
    if (own(data.next_action, "reason")) text(data.next_action.reason, "next_action.reason");
    if (own(data.next_action, "question_timing")) {
      const timing = data.next_action.question_timing;
      if (typeof timing === "string") enumeration(timing, ["before_work", "after_work", "clarify_first"], "question_timing");
      else {
        if (!Array.isArray(timing)) fail("INVALID_INPUT", "question_timing is a timing value or a list of question/timing bindings.");
        for (const item of timing) {
          object(item, "question timing", ["question_ref", "timing"]);
          enumeration(item.timing, ["before_work", "after_work", "clarify_first"], "question timing");
          if (resolve(loaded, item.question_ref).kind !== "question") fail("UNKNOWN_REFERENCE", "Question timing must name a retained question.");
        }
      }
    }
  }
  if (entry.type === "correction") { text(data.reason, "correction.reason"); if (!Array.isArray(data.corrects_refs) || !data.corrects_refs.length) fail("INVALID_INPUT", "A correction identifies the affected records."); }
  return loaded;
}

function apply(state, entry, priorEntries) {
  const checked = validateCommon(state, entry, priorEntries), next = copy(state), data = entry.data;
  const { updates, overview, selection, ...primary } = data;
  const index = (ref, kind) => { next.history_index[ref] = { kind, event_ref: entry.id }; };
  const upsert = (collection, record, key = "ref") => {
    const position = next[collection].findIndex(value => value[key] === record[key]);
    if (position < 0) next[collection].push(record); else next[collection][position] = record;
  };
  index(entry.id, entry.type);
  for (const update of data.updates || []) {
    const config = COLLECTIONS[update.kind]; upsert(config.collection, projectBody(update), config.id); index(update.entity, update.kind);
  }
  const overviewBindings = Object.fromEntries(Object.entries(next.state_meta.overview_sources || {})
    .map(([field, source]) => [field, { ref: source.ref, field: source.field }]));
  for (const [field, value] of Object.entries(data.overview || {})) overviewBindings[field === "use" ? "intended_use" : field] = copy(value);
  for (const [field, binding] of Object.entries(overviewBindings)) {
    const value = overviewSource({ ...checked, state: next }, binding);
    next.project_understanding[field] = value.text;
    if (!next.state_meta.overview_sources) next.state_meta.overview_sources = {};
    next.state_meta.overview_sources[field] = value.source;
  }
  for (const [key, value] of Object.entries(data.selection || {})) next.case_brief[key] = copy(value);
  if (["knowledge", "interpretation", "decision"].includes(entry.type) && data.user_message) {
    next.turns.push({ ref: entry.id, handling_ref: entry.id, user_message: copy(asList(data.user_message)), work_refs: [], exchange_ref: null, actual_refs: [] });
  }
  if (entry.type === "interpretation") next.interpretations.push({ ref: entry.id, user_message: copy(asList(data.user_message)),
    ...(data.actual_reply ? { actual_reply: data.actual_reply } : {}), ...(data.next_action ? { next_action: copy(data.next_action) } : {}) });
  if (entry.type === "scope") next.action_scopes.push({ ...copy(primary), ref: entry.id });
  if (entry.type === "decision") next.action_decisions.push({ ...copy(primary), ref: entry.id });
  if (entry.type === "review") next.specialist_reviews.push({ ref: entry.id, responds_to: copy(data.responds_to), summary: data.summary,
    assignment: copy(data.assignment), ...(data.work_refs ? { work_refs: copy(data.work_refs) } : {}), ...(data.evidence_refs ? { evidence_refs: copy(data.evidence_refs) } : {}) });
  if (entry.type === "work") {
    const ref = data.phase === "started" ? entry.id : data.run;
    const previous = next.runs.find(run => run.ref === ref) || {};
    upsert("runs", { ...previous, ...copy(primary), ref, event_ref: entry.id,
      status: { started: "in_progress", completed: "completed", failed: "failed", abandoned: "abandoned" }[data.phase] });
  }
  if (entry.type === "reply_prepared") next.exchanges.push({ ref: entry.id, responds_to: copy(data.responds_to), renderer: data.renderer,
    question_refs: (data.response?.questions || []).map(item => item.question_ref),
    user_question_refs: (data.response?.user_questions || []).map(item => item.question_ref),
    options: (data.response?.next_steps || []).map((item, number) => ({ label: "N" + (number + 1), ...(item.option_id ? { option_id: item.option_id } : {}), ...(item.scope_ref ? { scope_ref: item.scope_ref } : {}) })),
    work_refs: copy(data.response?.findings?.work_refs || []) });
  if (entry.type === "reply_recorded") next.deliveries.push({ ...copy(primary), ref: entry.id });
  if (data.responds_to) {
    const origins = handling(checked, data.responds_to).incoming;
    for (const turn of next.turns.filter(turn => turn.user_message.some(ref => origins.includes(ref)))) {
      if (["review", "work"].includes(entry.type)) {
        const ref = entry.type === "work" ? (data.phase === "started" ? entry.id : data.run) : entry.id;
        if (!turn.work_refs.includes(ref)) turn.work_refs.push(ref);
        turn.exchange_ref = null;
      }
      if (entry.type === "reply_prepared") turn.exchange_ref = entry.id;
    }
  }
  if (entry.type === "reply_recorded" && data.prepared) for (const turn of next.turns) {
    if (turn.exchange_ref === data.prepared && !turn.actual_refs.includes(entry.id)) turn.actual_refs.push(entry.id);
  }
  if (data.next_action) {
    const attribution = data.user_message ? { incoming: asList(data.user_message), source_sequence: Math.max(...asList(data.user_message).map(sequence)) }
      : handling(checked, data.responds_to);
    const newestInput = Math.max(0, ...checked.entries.filter(value => value.type === "user_message").map(value => sequence(value.id)));
    const previousSource = next.state_meta.direction_source_sequence || 0;
    if (attribution.source_sequence >= previousSource && attribution.source_sequence >= newestInput) {
      next.state_meta.direction_source_sequence = attribution.source_sequence;
      next.state_meta.direction_ref = entry.id;
      next.consultation = data.next_action.kind === "close" ? null : { ref: entry.id, source: entry.id,
        incoming_refs: copy(attribution.incoming), next_action: copy(data.next_action) };
      next.focus_scope_ref = data.next_action.scope_ref || (ENTRY.test(data.next_action.scope || "") ? data.next_action.scope : null);
    }
  }
  next.state_meta.last_event_id = entry.id; next.state_meta.sequence = sequence(entry.id); next.state_meta.updated_at = entry.recorded_at;
  return next;
}

module.exports = { FORMAT, TYPES, COLLECTIONS, emptyState, allocate, normalize, apply, resolve, resolveAt, definitions, references, pendingMessages, handling };
