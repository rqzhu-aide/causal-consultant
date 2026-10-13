"use strict";

const { canonical } = require("./files.cjs");
const { COLLECTIONS } = require("./model.cjs");
const copy = value => structuredClone(value);
const requestFor = (record_ref, event_ref) => ({ mode: "record", records: [{ record_ref, ...(event_ref ? { event_ref } : {}) }] });

// Definitions, not mentions. Patches have already been expanded in the journal.
function definitionsInEvent(event) {
  const definitions = [], payload = event.payload || {};
  const add = (body, key, collection, kind, source_path) => {
    if (!body || !body[key]) return;
    definitions.push({ record_ref: body[key], event_ref: event.event_id, collection, kind,
      sequence: event.sequence, source_path, body: copy(body) });
  };
  for (const [collection, config] of Object.entries(COLLECTIONS)) {
    (payload.changes?.[collection] || []).forEach((body, index) =>
      add(body, config.id, collection, config.kind, "/payload/changes/" + collection + "/" + index));
  }
  add(payload.checkpoint, "checkpoint_id", "checkpoints", "checkpoint", "/payload/checkpoint");
  for (const [field, key, collection, kind] of [["review", "review_id", "specialist_reviews", "review"],
    ["run", "run_id", "runs", "run"], ["interpretation", "interpretation_id", "interpretations", "interpretation"],
    ["exchange", "exchange_id", "exchanges", "exchange"], ["delivery", "delivery_id", "deliveries", "delivery"]]) {
    add(payload[field], key, collection, kind, "/payload/" + field);
  }
  add(payload.changes?.consultation, "checkpoint_id", "checkpoints", "checkpoint", "/payload/changes/consultation");
  (payload.interpretation?.action_decisions || []).forEach((body, index) =>
    add(body, "decision_id", "action_decisions", "action_decision", "/payload/interpretation/action_decisions/" + index));
  return definitions;
}

function createRecordLookup(loaded) {
  const { state, events } = loaded;
  const byRef = new Map(), byEvent = new Map(), eventMap = new Map(events.map(event => [event.event_id, event]));
  for (const event of events) {
    const definitions = definitionsInEvent(event);
    byEvent.set(event.event_id, definitions);
    for (const definition of definitions) {
      if (!byRef.has(definition.record_ref)) byRef.set(definition.record_ref, []);
      byRef.get(definition.record_ref).push(definition);
    }
  }
  const latest = ref => byRef.get(ref)?.at(-1);
  const reference = (ref, eventRef) => ({ record_ref: ref, ...(eventRef ? { event_ref: eventRef } : {}), lookup: requestFor(ref, eventRef) });
  function resolve(ref, eventRef) {
    if (eventRef && !eventMap.has(eventRef)) return { status: "missing_event", ...reference(ref, eventRef) };
    const turn = (state.turns || []).find(value => value.turn_id === ref);
    if (turn) return { status: "derived", ...reference(ref, eventRef), collection: "turns", kind: "turn",
      reason: "A turn is derived from its interpretation, work and closeout; it has no single authored definition.",
      contributing_records: [turn.interpretation_ref, ...(turn.work_refs || []), turn.exchange_ref].filter(Boolean)
        .map(value => reference(value, latest(value)?.event_ref)) };
    const versions = byRef.get(ref);
    if (!versions?.length) return { status: eventMap.has(ref) ? "event_requires_history" : "missing_record", ...reference(ref, eventRef),
      ...(eventMap.has(ref) ? { history: { event_id: ref } } : {}) };
    const definition = eventRef ? versions.find(value => value.event_ref === eventRef) : versions.at(-1);
    if (!definition) return { status: "not_defined_at_event", ...reference(ref, eventRef), latest_event_ref: versions.at(-1).event_ref };
    const newest = versions.at(-1), notices = [];
    const successors = [...byRef.values()].map(values => values.at(-1))
      .filter(value => value.kind === definition.kind && value.body.supersedes === ref);
    if (successors.length) notices.push({ code: "superseded_record", successor_refs: successors.map(value => reference(value.record_ref, value.event_ref)),
      meaning: "This record has a replacement; the requested historical body remains unchanged." });
    for (const event of events) {
      if (event.type !== "correction") continue;
      const targets = (event.payload.corrects_refs || []).flatMap(value => eventMap.has(value)
        ? (byEvent.get(value) || []).map(item => item.record_ref) : [value]);
      if (targets.includes(ref)) notices.push({ code: "record_correction", event_ref: event.event_id,
        source_path: "/payload/reason", meaning: "A correction names this record. Read its reason and revised records before using the old account." });
    }
    const result = { status: "found", ...copy(definition), latest_event_ref: newest.event_ref,
      is_latest_saved: newest.event_ref === definition.event_ref, notices, lookup: requestFor(ref, definition.event_ref) };
    if (definition.body.status) result.recorded_status = definition.body.status;
    if (definition.kind === "run") {
      const current = (state.runs || []).find(value => value.run_id === ref);
      result.current_state = { kind: "run_lifecycle", status: current?.status || null,
        contributing_event_refs: versions.map(value => value.event_ref),
        meaning: "Current lifecycle metadata is separate from the selected authored run version; execution terms remain in its frozen plan." };
    } else if (definition.kind === "checkpoint") {
      const current = state.consultation?.checkpoint_id === ref ? state.consultation : null;
      const reviews = current ? events.filter(event => event.sequence >= newest.sequence
        && event.payload.review?.selection_basis?.checkpoint_id === ref).map(event => event.event_id) : [];
      const latestConsultation = events.filter(event => event.payload.checkpoint || Object.hasOwn(event.payload.changes || {}, "consultation")).at(-1);
      result.current_state = { kind: "checkpoint_status", active: Boolean(current), status: current?.status || null,
        contributing_event_refs: current ? [...new Set([newest.event_ref, ...reviews])] : latestConsultation ? [latestConsultation.event_id] : [],
        meaning: "Current checkpoint status may be derived from later work; it does not replace the selected authored checkpoint." };
    } else if (["exchange", "delivery"].includes(definition.kind)) {
      const utility = require("./exchanges.cjs");
      const resolution = definition.kind === "exchange" ? utility.resolvedDelivery(state, ref)
        : utility.resolveDeliveryReference(state, ref);
      result.current_state = { kind: "reply_applicability", status: resolution.status,
        ...(resolution.reason ? { reason: resolution.reason } : {}),
        ...(resolution.delivery ? { delivery: reference(resolution.delivery.delivery_id, latest(resolution.delivery.delivery_id)?.event_ref) } : {}),
        ...(resolution.capture ? { authoritative_capture: reference(resolution.capture.delivery_id, latest(resolution.capture.delivery_id)?.event_ref) } : {}),
        observation_refs: resolution.observation_refs || [],
        meaning: definition.kind === "exchange" ? "This body is the prepared draft. Actual communication belongs to its canonical delivery record."
          : "This exact historical observation is unchanged. Current actual content and interpretation may be established by the linked canonical records." };
    }
    return result;
  }
  function qualifications(resolution, { historical = false, bindings = [], owner_ref, owner_event_ref } = {}) {
    const bound = new Map(bindings.map(binding => [binding.ref, binding.event_ref]));
    const context = { owner_ref: owner_ref || resolution.record_ref, owner_event_ref: owner_event_ref || resolution.event_ref,
      temporal_scope: historical ? "historical" : "current", records: [], dependencies: [] };
    if (resolution.status !== "found") return context;
    const add = (ref, role, include = true) => {
      if (!ref || context.records.some(item => item.record_ref === ref && item.role === role)) return;
      const eventRef = bound.get(ref);
      const target = eventRef || (!historical && !bound.has(ref)) ? resolve(ref, eventRef) : null;
      context.records.push({ ...reference(ref, eventRef || target?.event_ref), role,
        version_status: eventRef ? "bound" : historical || bound.has(ref) ? "unbound" : "current",
        ...(bound.has(ref) && !eventRef ? { binding_status: "missing_event_ref" } : {}),
        ...(target ? { resolution_status: target.status } : {}), include: include && Boolean(target?.status === "found") });
    };
    const body = resolution.body;
    if (resolution.kind === "evidence") {
      const conditions = [...byRef.values()].map(values => values.at(-1))
        .filter(value => value.kind === "result_condition" && value.body.evidence_ref === resolution.record_ref
          && ![...byRef.values()].some(values => values.at(-1).body.supersedes === value.record_ref));
      for (const condition of conditions) add(condition.record_ref, "result_condition");
      // An explicitly selected scope/run can bind an earlier condition version.
      for (const binding of bindings) {
        const condition = resolve(binding.ref, binding.event_ref);
        if (condition.status === "found" && condition.kind === "result_condition" && condition.body.evidence_ref === resolution.record_ref) add(binding.ref, "result_condition");
      }
      if (context.records.length || body.kind === "computed") {
        context.condition_coverage = !context.records.length ? "unreviewed"
          : context.records.some(item => item.version_status === "bound" && item.resolution_status !== "found") ? "bound_versions_unavailable"
            : context.records.every(item => item.version_status === "unbound") ? "historical_versions_unbound" : "linked";
      }
    }
    if (resolution.kind === "result_condition") for (const ref of body.assumption_refs || []) add(ref, "assumption");
    if (["action_scope", "run"].includes(resolution.kind)) for (const binding of bindings) {
      const target = resolve(binding.ref, binding.event_ref);
      if (target.status === "found" && ["result_condition", "assumption"].includes(target.kind)) add(binding.ref, target.kind);
    }
    const dependencyRefs = new Set(require("./context.cjs").references(body, resolution.record_ref));
    if (["action_scope", "run"].includes(resolution.kind)) for (const binding of bindings) dependencyRefs.add(binding.ref);
    for (const ref of dependencyRefs) {
      const eventRef = bound.get(ref);
      const unbound = historical || bound.has(ref);
      context.dependencies.push({ ...reference(ref, eventRef || (!unbound ? latest(ref)?.event_ref : undefined)),
        version_status: eventRef ? "bound" : unbound ? "unbound" : "current",
        ...(eventRef ? { resolution_status: resolve(ref, eventRef).status } : {}),
        ...(bound.has(ref) && !eventRef ? { binding_status: "missing_event_ref" } : {}) });
    }
    return context;
  }
  return { resolve, qualifications, reference,
    versions: ref => (byRef.get(ref) || []).map(({ body, ...metadata }) => copy(metadata)),
    definitionsForEvent: ref => copy(byEvent.get(ref) || []) };
}

function omittedFields(original, projection, prefix = "") {
  return Object.keys(original || {}).flatMap(key => {
    const path = prefix + key;
    if (!Object.hasOwn(projection || {}, key)) return [path];
    const value = original[key], selected = projection[key];
    return value && selected && typeof value === "object" && typeof selected === "object" && !Array.isArray(value) && !Array.isArray(selected)
      ? omittedFields(value, selected, path + ".") : [];
  });
}

function mergeProjection(left, right) {
  if (canonical(left) === canonical(right)) return copy(left);
  if (!left || !right || typeof left !== "object" || typeof right !== "object" || Array.isArray(left) || Array.isArray(right)) return undefined;
  const result = copy(left);
  for (const [key, value] of Object.entries(right)) {
    if (!Object.hasOwn(result, key)) result[key] = copy(value);
    else {
      const merged = mergeProjection(result[key], value);
      if (merged === undefined) return undefined;
      result[key] = merged;
    }
  }
  return result;
}
function createRecordCollector(lookup) {
  const records = [], indexes = new Map();
  function addResolved(resolution, options = {}) {
    if (resolution.status !== "found") return copy(resolution);
    const key = JSON.stringify([resolution.record_ref, resolution.event_ref]);
    const mode = options.body_mode || "full";
    const selected = mode === "brief" && options.body !== undefined ? options.body : resolution.body;
    // Presentation metadata cannot replace the canonical body or its identity.
    const extra = Object.fromEntries(Object.entries(options.metadata || {}).filter(([field]) =>
      !Object.hasOwn(resolution, field) && !["body_mode", "omitted_fields"].includes(field)).map(([field, value]) => [field, copy(value)]));
    let index = indexes.get(key);
    if (index === undefined) {
      index = records.length; indexes.set(key, index);
      const { status, body, ...metadata } = resolution;
      records.push({ ...metadata, ...extra, record_ref: resolution.record_ref,
        event_ref: resolution.event_ref, body_mode: mode, body: copy(selected),
        ...(mode === "brief" ? { omitted_fields: omittedFields(body, selected) } : {}) });
    } else {
      const entry = records[index];
      Object.assign(entry, extra);
      if (entry.body_mode === "brief") {
        const merged = mode === "brief" ? mergeProjection(entry.body, selected) : undefined;
        if (mode === "full" || merged === undefined) {
          entry.body = copy(resolution.body); entry.body_mode = "full"; delete entry.omitted_fields;
        } else {
          entry.body = merged;
          entry.omitted_fields = omittedFields(resolution.body, merged);
        }
      }
      entry.record_ref = resolution.record_ref; entry.event_ref = resolution.event_ref;
    }
    return { status: "found", record_ref: resolution.record_ref, event_ref: resolution.event_ref,
      body_locator: "#/records/" + index + "/body", lookup: requestFor(resolution.record_ref, resolution.event_ref) };
  }
  return { records, addResolved, add: (ref, eventRef, options) => addResolved(lookup.resolve(ref, eventRef), options) };
}

function exactContext(loaded, request) {
  require("./context.cjs").recordRequestShape(request, loaded.state);
  const lookup = createRecordLookup(loaded), collector = createRecordCollector(lookup);
  const resolutions = request.records.map(selector => lookup.resolve(selector.record_ref, selector.event_ref));
  // Navigation is current and separate from an exact historical definition.
  // These links do not expand conversation or run bodies into a record read.
  const questionLinks = resolutions.some(item => item.kind === "question" && item.body?.origin === "user")
    ? require("./views.cjs").questionMemoryLinks(loaded.state, loaded.events) : new Map();
  const routeRuns = resolutions.some(item => item.kind === "strategy")
    ? require("./route-runs.cjs").routeRunLinks(loaded) : new Map();
  const owners = [];
  resolutions.forEach((resolution, index) => {
    if (resolution.status !== "found" || !["action_scope", "run"].includes(resolution.kind)) return;
    const bindings = [...(resolution.body.basis_versions || []), ...(resolution.body.authorization_binding?.basis_versions || [])];
    const owner = { owner_ref: resolution.record_ref, owner_event_ref: resolution.event_ref, bindings, selector_index: index };
    if (resolution.kind === "run" && resolution.body.plan_ref && loaded.root) {
      try {
        const plan = require("./runs.cjs").frozenPlan(loaded.root, resolution.body);
        for (const evidence of plan.evidence_bindings || []) {
          bindings.push({ ref: evidence.evidence_id, event_ref: evidence.event_ref });
          for (const condition of evidence.condition_bindings || []) {
            bindings.push({ ref: condition.condition_id, event_ref: condition.event_ref });
            for (const assumption of condition.assumption_bindings || []) bindings.push({ ref: assumption.assumption_id, event_ref: assumption.event_ref });
          }
        }
      } catch (error) { owner.binding_issue = { code: error.code || "PLAN_UNAVAILABLE", message: error.message, source_ref: resolution.body.plan_ref }; }
    }
    owners.push(owner);
  });
  const additional = [];
  const includeContext = (context, historical) => {
    for (const link of [...context.records]) {
      if (!link.include) continue;
      const resolution = lookup.resolve(link.record_ref, link.event_ref);
      Object.assign(link, collector.addResolved(resolution)); delete link.include;
      if (resolution.status === "found") {
        additional.push({ record_ref: link.record_ref, event_ref: link.event_ref, owner_ref: context.owner_ref, role: link.role });
        if (resolution.kind === "result_condition") {
          const nested = lookup.qualifications(resolution, { historical, bindings: context.bindings || [], owner_ref: context.owner_ref, owner_event_ref: context.owner_event_ref });
          for (const assumption of nested.records) {
            if (context.records.some(value => value.record_ref === assumption.record_ref && value.event_ref === assumption.event_ref && value.role === assumption.role)) continue;
            if (assumption.include) {
              Object.assign(assumption, collector.add(assumption.record_ref, assumption.event_ref));
              additional.push({ record_ref: assumption.record_ref, event_ref: assumption.event_ref, owner_ref: context.owner_ref, role: assumption.role });
            }
            delete assumption.include; context.records.push(assumption);
          }
        }
      }
    }
    for (const link of context.records) delete link.include;
    delete context.bindings;
    return context;
  };
  const outcomes = resolutions.map((resolution, index) => {
    const selector = request.records[index], result = { selector: copy(selector), ...collector.addResolved(resolution) };
    if (resolution.status !== "found") return result;
    result.current_notices = copy(resolution.notices);
    if (resolution.current_state) result.current_state = copy(resolution.current_state);
    if (questionLinks.has(resolution.record_ref)) result.current_question_continuity = copy(questionLinks.get(resolution.record_ref));
    if (resolution.kind === "strategy") result.current_recorded_execution = copy(routeRuns.get(resolution.record_ref) || []);
    const historical = Boolean(selector.event_ref);
    const own = owners.find(owner => owner.selector_index === index);
    const contexts = [{ ...lookup.qualifications(resolution, { historical, bindings: own?.bindings || [] }), bindings: own?.bindings || [],
      ...(own?.binding_issue ? { binding_issue: own.binding_issue } : {}) }];
    for (const owner of owners) {
      if (owner.selector_index === index || !owner.bindings.some(binding => binding.ref === resolution.record_ref && binding.event_ref === resolution.event_ref)) continue;
      contexts.push({ ...lookup.qualifications(resolution, { historical: true, bindings: owner.bindings,
        owner_ref: owner.owner_ref, owner_event_ref: owner.owner_event_ref }), bindings: owner.bindings,
        ...(owner.binding_issue ? { binding_issue: owner.binding_issue } : {}) });
    }
    result.qualification_contexts = contexts.map(context => includeContext(context, context.temporal_scope === "historical"));
    return result;
  });
  return { format: "memory-compact-v1", records: collector.records, outcomes,
    coverage: { mode: "record", requested: copy(request.records), additional_qualification_records: additional,
      unrelated_roots_included: false, history_expanded: false,
      meaning: "Exact committed definitions and direct qualifications, with current question and explicit run navigation where relevant. Navigation does not replace historical definitions or certify scientific applicability." } };
}

module.exports = { definitionsInEvent, createRecordLookup, createRecordCollector, exactContext };
