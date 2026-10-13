"use strict";

// Transport-only readings. Journal bodies and internal authorization adapters
// stay unchanged; response-local locators share their included content.
const { createRecordLookup, createRecordCollector } = require("./record-lookup.cjs");
const exchanges = require("./exchanges.cjs");
const { canonical } = require("./files.cjs");
const FORMAT = "memory-compact-v1";
const clone = value => structuredClone(value);
const without = (value, names) => Object.fromEntries(Object.entries(value || {})
  .filter(([key]) => !names.includes(key)).map(([key, entry]) => [key, clone(entry)]));
const fields = (value, names) => Object.fromEntries(names.filter(key => Object.hasOwn(value || {}, key))
  .map(key => [key, clone(value[key])]));
const pointer = value => String(value).replaceAll("~", "~0").replaceAll("/", "~1");
const lookupRequest = (record_ref, event_ref) => ({ mode: "record", records: [{ record_ref, ...(event_ref ? { event_ref } : {}) }] });
function selectedFields(value, original) {
  if (value === undefined || original === undefined) return false;
  if (canonical(value) === canonical(original)) return true;
  if (!value || !original || typeof value !== "object" || typeof original !== "object" || Array.isArray(value) || Array.isArray(original)) return false;
  return Object.entries(value).every(([key, entry]) => Object.hasOwn(original, key) && selectedFields(entry, original[key]));
}
function assembly(loaded) {
  const lookup = createRecordLookup(loaded), collector = createRecordCollector(lookup);
  const captures = [], captureIndexes = new Map(), captureResults = new Map();
  const state = loaded.state;
  function link(ref, eventRef, include = false, options = {}) {
    if (!ref) return null;
    const result = lookup.resolve(ref, eventRef);
    if (include && result.kind === "delivery") {
      const actual = exchanges.resolveDeliveryReference(state, ref);
      if (actual.status !== "current" || actual.delivery.delivery_id !== ref && actual.capture?.delivery_id !== ref) include = false;
      else if (actual.capture && exchanges.isAgentRecorded(actual.delivery) && actual.delivery.delivery_id === ref) {
        options = { ...options, body: captureMappingBody(actual.delivery), body_mode: "brief" };
      }
    }
    if (include) return collector.addResolved(result, options);
    const index = collector.records.findIndex(record => record.record_ref === ref && record.event_ref === result.event_ref);
    return { record_ref: ref, ...(result.event_ref || eventRef ? { event_ref: result.event_ref || eventRef } : {}),
      status: result.status, ...(index >= 0 ? { body_locator: "#/records/" + index + "/body" } : {}),
      lookup: result.lookup || lookupRequest(ref, eventRef),
      ...(result.status !== "found" ? without(result, ["body", "record_ref", "event_ref", "lookup", "status"]) : {}) };
  }
  const field = (reference, path) => reference && ({ ...reference, field_path: path,
    ...(reference.body_locator ? { body_locator: reference.body_locator + "/" + path.map(pointer).join("/") } : {}) });
  function capture(delivery, retained) {
    let result = retained || captureResults.get(delivery.delivery_id);
    if (!result || result.status === "available" && typeof result.text !== "string") {
      result = require("./conversation-window.cjs").capturedText(loaded.root, delivery);
    }
    captureResults.set(delivery.delivery_id, result);
    if (result.status !== "available") return { capture_status: result.status,
      ...(result.error ? { capture_error: result.error } : {}), ...(result.error_code ? { capture_error_code: result.error_code } : {}) };
    // Identity remains part of the key: equal bytes do not identify an emission.
    const identity = exchanges.deliveryIdentity(delivery);
    const key = canonical([identity, delivery.observed_response_sha256]);
    let index = captureIndexes.get(key);
    if (index === undefined) {
      index = captures.length; captureIndexes.set(key, index);
      captures.push({ message_identity: identity, sha256: delivery.observed_response_sha256,
        text: result.text, source_refs: [], observation_refs: [],
        verification: "retained_bytes_and_capture_contract_checked",
        meaning: "Verified retained bytes do not independently verify native message identity or emission order." });
    }
    const entry = captures[index];
    if (!entry.source_refs.includes(delivery.source_ref)) entry.source_refs.push(delivery.source_ref);
    if (!entry.observation_refs.includes(delivery.delivery_id)) entry.observation_refs.push(delivery.delivery_id);
    return { capture_status: "available", capture_locator: "#/captures/" + index };
  }
  function delivery(value, retainedCapture) {
    if (!value) return null;
    value = (state.deliveries || []).find(item => item.delivery_id === value.delivery_id) || value;
    const resolution = exchanges.resolveDeliveryReference(state, value.delivery_id);
    const current = resolution.status === "current" && resolution.delivery;
    const authoritative = resolution.capture || (current?.observed_response_sha256 ? current : null);
    const isCurrent = current?.delivery_id === value.delivery_id;
    const reference = isCurrent && exchanges.isAgentRecorded(current) ? mappingReference(current, resolution)
      : link(value.delivery_id, value.event_ref, isCurrent || authoritative?.delivery_id === value.delivery_id);
    const metadata = { ...reference, observation: value.observation,
      ...(!isCurrent ? { provenance_only: true,
        ...(current ? { current_delivery: link(current.delivery_id, current.event_ref) } : {}) } : {}),
      ...(isCurrent && authoritative ? { evidence_kind: "native_capture", capture_ref: authoritative.delivery_id,
        ...capture(authoritative, value.delivery_id === authoritative.delivery_id ? retainedCapture : undefined),
        ...(exchanges.isAgentRecorded(current) ? { item_attribution: "agent_interpretation_of_capture" } : {}) }
        : authoritative?.delivery_id === value.delivery_id ? { evidence_kind: "native_capture", ...capture(authoritative, retainedCapture) }
          : exchanges.isAgentRecorded(value) ? { evidence_kind: "agent_attributed_record", native_identity_verified: false }
            : { capture_status: "provenance_only" }) };
    return metadata;
  }
  function mappingReference(value, resolution) {
    if (!resolution.capture) return link(value.delivery_id, value.event_ref, true);
    // Captured text is the only full current message body. Keep semantic labels
    // and links as annotations, with exact authored wording retrievable in history.
    return link(value.delivery_id, value.event_ref, true, { body: captureMappingBody(value), body_mode: "brief" });
  }
  function captureMappingBody(value) {
    return { ...without(value, ["event_ref", "agent_recording"]),
      agent_recording: { ...without(value.agent_recording, ["items"]),
        items: value.agent_recording.items.map(item => without(item, ["text"])) } };
  }
  function items(value, filter) {
    if (!value) return [];
    const resolution = exchanges.resolveDeliveryReference(state, value.delivery_id);
    value = resolution.status === "current" ? resolution.delivery : null;
    if (!exchanges.isAgentRecorded(value)) return [];
    const reference = mappingReference(value, resolution);
    const content = resolution.capture ? capture(resolution.capture) : null;
    return exchanges.recordedItems(value).map((item, index) => ({ ...without(item, ["text", "source_path", "status"]),
      ...(Object.hasOwn(item, "status") ? { answer_status: item.status } : {}),
      ...(content ? { content_source: content, item_attribution: "agent_interpretation_of_capture" } : {}),
      ...field(reference, ["agent_recording", "items", index]) })).filter(filter || (() => true));
  }
  function exchange(ref, supplied = {}) {
    const original = lookup.resolve(ref, supplied.event_ref);
    const observations = (state.deliveries || []).filter(value => value.exchange_ref === ref);
    const hasActual = observations.some(value => exchanges.isAgentRecorded(value) || value.observed_response_sha256);
    const prepared = link(ref, original.event_ref, !hasActual);
    const resolution = exchanges.resolvedDelivery(state, ref);
    const actual = resolution.status === "current" ? resolution.delivery : null;
    return { exchange_ref: ref, event_ref: original.event_ref || supplied.event_ref || null,
      prepared: { ...prepared, attribution: "prepared_draft", renderer: supplied.renderer || original.body?.renderer,
        response_sha256: supplied.response_sha256 || (state.exchanges || []).find(value => value.exchange_id === ref)?.response_sha256,
        response_sha256_role: "prepared_response_link" },
      delivery_resolution: { ...without(resolution, ["delivery", "capture"]),
        ...(actual ? { delivery: delivery(actual) } : {}),
        ...(resolution.capture ? { capture_ref: resolution.capture.delivery_id } : {}) },
      observations: observations.map(value => delivery(value)),
      ...(exchanges.isAgentRecorded(actual) ? { actual_items: items(actual),
        reply_attribution: resolution.capture ? "capture_with_agent_interpretation" : "agent_recorded" }
        : observations.some(exchanges.isAgentRecorded) ? { reply_attribution: "prepared_draft", actual_reply_status: resolution.status,
          actual_recording_refs: observations.filter(exchanges.isAgentRecorded).map(value => value.delivery_id) } : {}) };
  }
  function offer(value) {
    const resolution = exchanges.resolvedDelivery(state, value.exchange_ref);
    const actual = resolution.status === "current" ? resolution.delivery : null;
    const result = without(value, ["label", "proposal", "execution_plan"]);
    if (exchanges.isAgentRecorded(actual)) {
      result.item = items(actual, item => item.option_id === value.option_id)[0] || null;
      if (!result.item) result.actual_item_status = "unmapped_or_omitted";
    } else {
      const prepared = lookup.resolve(value.exchange_ref);
      const index = prepared.body?.response?.next_steps?.findIndex(option => option.option_id === value.option_id);
      result.prepared_option = index >= 0 ? field(link(value.exchange_ref, prepared.event_ref), ["response", "next_steps", index])
        : link(value.exchange_ref, prepared.event_ref);
    }
    return result;
  }
  function actions(value) {
    if (!value) return value;
    return { ...without(value, ["scopes", "decisions", "offers", "exact_basis"]),
      scopes: (value.scopes || []).map(scope => link(scope.scope_id, undefined, true)),
      decisions: (value.decisions || []).map(decision => link(decision.decision_id, decision.event_ref, true)),
      offers: (value.offers || []).map(offer),
      exact_basis: (value.exact_basis || []).map(scope => ({ scope_ref: scope.scope_ref,
        versions: scope.versions.map(binding => ({ ...without(binding, ["recorded_body"]),
          record: link(binding.ref, binding.event_ref, true) })) })) };
  }
  function conversation(value) {
    // Reuse the conversation reader's existing byte/span checks rather than
    // reading those same captures again while formatting outgoing references.
    for (const intake of value.recent_intakes || []) for (const message of intake.actual_messages || []) {
      for (const observation of message.observations || []) {
        if (!observation.capture_status || observation.capture_status === "provenance_only") continue;
        const retained = (message.captures || []).find(item => item.observation_refs.includes(observation.delivery_id));
        if (observation.capture_status === "available" && typeof retained?.text === "string") {
          captureResults.set(observation.delivery_id, { status: "available", text: retained.text });
        } else if (observation.capture_status !== "available") {
          captureResults.set(observation.delivery_id, { status: observation.capture_status,
            error: observation.capture_error, error_code: observation.capture_error_code });
        }
      }
    }
    return { ...without(value, ["recent_intakes"]), recent_intakes: (value.recent_intakes || []).map(intake => ({
      ...without(intake, ["incoming", "outgoing", "actual_messages"]),
      incoming: (intake.incoming || []).map(source => ({ ...without(source, ["record", "later_source_version"]),
        source_record: source.record ? link(source.evidence_ref, source.source_event_ref, true) : null,
        ...(source.later_source_version ? { later_source_version: { ...without(source.later_source_version, ["record"]),
          ...(source.later_source_version.record ? { source_record: link(source.evidence_ref, source.later_source_version.source_event_ref, true) } : {}) } } : {}) })),
      outgoing: (intake.outgoing || []).map(value => ({ ...fields(value, ["interpretation_ref", "supersedes", "reconciles",
        "response_items_source", "response_items_status", "observation_refs", "retrieval"]),
        ...exchange(value.exchange_ref, value) })),
      actual_messages: (intake.actual_messages || []).map(message => ({ ...without(message, ["observations", "captures", "agent_recordings"]),
        observations: (message.observations || []).map(observation => ({
          ...delivery(observation, observation.capture_status === "available"
            ? { status: "available", text: (message.captures || []).find(value => value.observation_refs.includes(observation.delivery_id))?.text }
            : observation.capture_status ? { status: observation.capture_status, error: observation.capture_error, error_code: observation.capture_error_code } : undefined),
          ...fields(observation, ["correspondence", "binding_compatible", "current",
            "capture_status", "capture_error", "capture_error_code", "retrieval"]) })),
        captures: (message.captures || []).map(retained => {
          const observation = message.observations.find(value => retained.observation_refs.includes(value.delivery_id));
          return observation ? capture(observation, { status: "available", text: retained.text }) : { capture_status: "unavailable" };
        }),
        agent_recordings: (message.agent_recordings || []).map(recording => ({ ...without(recording, ["items"]),
          deliveries: recording.observation_refs.map(ref => {
            const observation = message.observations.find(value => value.delivery_id === ref);
            return observation ? { delivery: delivery(observation), items: items(observation) } : link(ref);
          }) })) })) })) };
  }
  function card(value) {
    const result = without(value, ["value", "omitted_fields", "body_mode", "authored_fields", "derived_fields"]);
    const projection = value.value || {}, actualRef = value.actual_delivery_ref || projection.actual_delivery_ref;
    if (actualRef) {
      const actual = (state.deliveries || []).find(item => item.delivery_id === actualRef);
      result.actual_delivery = actual ? delivery(actual) : link(actualRef);
      if (actual) result.actual_items = items(actual, (_, index) => !value.item_indexes || value.item_indexes.includes(index));
    }
    if (value.record_ref && value.source_kind === "authored_projection") {
      const resolution = lookup.resolve(value.record_ref, value.event_ref || undefined);
      const authored = {}, derived = {};
      for (const [key, entry] of Object.entries(projection)) {
        if (Object.hasOwn(resolution.body || {}, key) && selectedFields(entry, resolution.body[key])) authored[key] = clone(entry);
        else derived[key] = clone(entry);
      }
      result.record = link(value.record_ref, resolution.event_ref, true, { body: authored, body_mode: value.body_mode === "full" ? "full" : "brief" });
      if (Object.keys(derived).length) result.derived = cardMetadata(derived, Boolean(actualRef));
    } else if (value.record_ref) {
      result.record = link(value.record_ref, value.event_ref || undefined);
      result.derived = cardMetadata(projection, Boolean(actualRef));
    } else result.derived = cardMetadata(projection, Boolean(actualRef));
    return result;
  }
  function cardMetadata(value, actualContent = false) {
    const result = without(value, actualContent ? ["actual_reply_items", "summary", "diagnostics", "limitations", "text", "answer"] : ["actual_reply_items"]);
    if (result.actual_items) result.actual_items = result.actual_items.map(item => {
      const resolution = lookup.resolve(item.record_ref, item.event_ref);
      const value = resolution.status === "found" ? { ...resolution.body, event_ref: resolution.event_ref } : null;
      return exchanges.isAgentRecorded(value) ? items(value)[item.item_index] || { ...item, status: "missing_item" } : link(item.record_ref, item.event_ref);
    });
    if (result.source?.evidence_id) result.source = link(result.source.evidence_id, undefined, true);
    if (result.latest_decision?.decision_id) result.latest_decision = link(result.latest_decision.decision_id, result.latest_decision.event_ref, true);
    if (result.recorded_target && result.authorization?.scope_ref) {
      const scope = lookup.resolve(result.authorization.scope_ref);
      if (scope.status === "found" && selectedFields(result.recorded_target, scope.body.public_scope)) {
        result.recorded_target = field(link(scope.record_ref, scope.event_ref, true, {
          body: { public_scope: clone(result.recorded_target) }, body_mode: "brief" }), ["public_scope"]);
      }
    }
    if (result.offers) result.offers = result.offers.map(offer);
    if (result.recorded_execution) result.recorded_execution = result.recorded_execution.map(runLink);
    if (result.communication) result.communication = communication(result.communication);
    if (result.latest_saved_request) {
      const request = result.latest_saved_request;
      const actual = (state.deliveries || []).find(value => value.delivery_id === request.actual_delivery_ref);
      if (exchanges.isAgentRecorded(actual)) {
        result.latest_saved_request = { ...without(request, ["text", "why", "needed"]),
          actual_items: items(actual, item => item.kind === "question" && item.question_ref === request.question_ref) };
      } else if (request.prepared_request) {
        result.latest_saved_request.prepared_request = field(link(request.prepared_request.record_ref,
          request.prepared_request.event_ref), request.prepared_request.source_path);
      }
    }
    return result;
  }
  function runLink(value) {
    return { ...without(value, ["retrieval"]), run: link(value.run_ref, value.event_ref) };
  }
  function communication(value) {
    const result = clone(value), location = value.answer_location;
    if (location) result.answer_location = field(link(location.record_ref, location.event_ref), location.source_path);
    return result;
  }
  return { lookup, collector, captures, link, field, delivery, items, exchange, offer, actions, conversation, card, runLink, communication };
}

function compactBrief(loaded, assembled, recent, baseEnvelope = {}) {
  const view = assembly(loaded);
  const cards = (assembled.cards || []).map(view.card);
  const conversation = view.conversation(recent);
  const coverage = clone(assembled.coverage), corrections = clone(assembled.corrections || []);
  for (const warning of coverage.warnings || []) {
    if (warning.code !== "relevant_correction") continue;
    const index = corrections.findIndex(correction => warning.related_refs?.includes(correction.event_ref));
    if (index < 0 || typeof corrections[index].reason !== "string") continue;
    warning.message = "Read the saved correction reason before using this affected record.";
    warning.reason_locator = "#/brief/corrections/" + index + "/reason";
  }
  return { ...without(baseEnvelope, ["brief", "views", "context", "project", "records", "captures", "capabilities", "renderers", "compatibility"]), format: FORMAT,
    records: view.collector.records, captures: view.captures,
    brief: { format: "case-brief-compact-v1", cards, recent_intakes: conversation.recent_intakes,
      unfinished: clone(assembled.unfinished),
      operational: { ...without(assembled.operational, ["unfinished"]), unfinished_locator: "#/brief/unfinished" },
      coverage: { case: coverage, conversation: clone(conversation.coverage) },
      ...(assembled.file_current !== undefined ? { file_current: assembled.file_current } : {}),
      corrections,
      expanded_export: { path: "case-brief.md", meaning: "Generated readable export; the journal remains authoritative." } } };
}

function compactRead(loaded, legacy) {
  const view = assembly(loaded), data = legacy.context || legacy.project || loaded.state;
  const collections = {};
  for (const [name, key] of Object.entries(require("./views.cjs").collectionIds(loaded.state))) {
    if (!Object.hasOwn(data, name)) continue;
    collections[name] = (data[name] || []).map(record => name === "exchanges" ? view.exchange(record[key], record)
      : name === "deliveries" ? view.delivery(record)
      : name === "turns" ? { ...view.link(record[key]), derived_state: clone(record) }
        : view.link(record[key], record.event_ref, true));
  }
  const originalViews = legacy.views || {};
  const work = without(originalViews.work, ["interpretations", "exchanges", "actions", "pending_consultant_questions", "question_memory"]);
  work.interpretations = (originalViews.work?.interpretations || []).map(record => view.link(record.interpretation_id, record.event_ref, true));
  work.exchanges = (originalViews.work?.exchanges || []).map(record => view.exchange(record.exchange_id, record));
  work.pending_consultant_questions = (originalViews.work?.pending_consultant_questions || []).map(record => {
    const resolution = view.lookup.resolve(record.question_ref);
    if (resolution.status !== "found") return { ...clone(record), question: view.link(record.question_ref) };
    // Preserve useful prompts across focus without loading every answer/basis.
    // Selected questions already have full collector bodies; these brief fields
    // share their locator rather than introducing another copy of the text.
    const body = fields(resolution.body, ["question_id", "origin", "statement", "status"]);
    if (resolution.body.resolution) body.resolution = fields(resolution.body.resolution, ["remaining"]);
    return { ...without(record, ["statement", "remaining"]), question: view.link(record.question_ref, resolution.event_ref, true,
      { body, body_mode: "brief" }) };
  });
  work.question_memory = (originalViews.work?.question_memory || []).map(record => ({
    ...without(record, ["statement", "reason", "resolution"]), question: view.link(record.question_ref, undefined, true),
    ...(record.communication ? { communication: view.communication(record.communication) } : {}) }));
  if (originalViews.work?.actions) work.actions = view.actions(originalViews.work.actions);
  const collectionPaths = value => {
    const result = clone(value || {});
    if (result.collections) for (const [name, descriptor] of Object.entries(result.collections)) descriptor.source_path = "#/views/collections/" + pointer(name);
    if (result.coverage) {
      delete result.coverage.omissions;
      result.coverage.coverage_locator = "#/coverage";
    }
    return result;
  };
  const user = collectionPaths(originalViews.user), study = collectionPaths(originalViews.study);
  if (study.route_execution) study.route_execution = study.route_execution.map(route => ({ ...route, runs: route.runs.map(view.runLink) }));
  if (work.coverage) {
    delete work.coverage.omissions;
    work.coverage.coverage_locator = "#/coverage";
  }
  if (user.context) user.context.source_path = "#/views/collections/user_context";
  if (study.understanding_source_path) study.understanding_source_path = "#/views/project_understanding";
  if (work.checkpoint_source_path) work.checkpoint_source_path = "#/views/consultation";
  if (work.collections) for (const [name, descriptor] of Object.entries(work.collections)) descriptor.source_path = "#/views/collections/" + pointer(name);
  const coverage = clone(legacy.coverage || { scope: "complete_current_projection", omission_reasons: [] });
  coverage.omission_reasons = (coverage.omission_reasons || []).filter(reason =>
    !reason.startsWith("Full review findings and limitations: ") && !reason.startsWith("Conversation body source: "));
  coverage.record_body_navigation = "Included bodies use response-local locators; exact definitions and older versions use context mode=record. Prepared drafts and actual delivery bodies remain distinct.";
  return { ...without(legacy, ["project", "context", "views", "records", "captures", "capabilities", "renderers", "compatibility", "coverage"]), format: FORMAT,
    project_id: loaded.state.state_meta.project_id, last_event_id: loaded.state.state_meta.last_event_id,
    sequence: loaded.state.state_meta.sequence,
    state_token: require("./authoring.cjs").stateToken(loaded.state.state_meta.project_id, loaded.state.state_meta.last_event_id),
    records: view.collector.records, captures: view.captures, coverage,
    views: { collections, project_understanding: clone(data.project_understanding),
      ...(data.case_brief ? { case_selection: clone(data.case_brief) } : {}),
      ...(data.focus_scope_ref !== undefined ? { focus_scope_ref: data.focus_scope_ref } : {}),
      consultation: data.consultation ? { record: view.link(data.consultation.checkpoint_id, undefined, true),
        derived_status: data.consultation.status, meaning: "Current operational status is separate from the authored checkpoint." } : null,
      user, study, work } };
}

function compactReceipt(receipt) {
  const result = without(receipt, ["response_items", "recorded_response_items"]);
  result.format = FORMAT;
  result.committed_records = (receipt.committed_records || []).map(record => ({ ...clone(record),
    lookup: lookupRequest(record.record_ref, record.event_ref) }));
  const actual = result.committed_records.find(record => record.collection === "deliveries")
    || (receipt.delivery_id ? { record_ref: receipt.delivery_id, event_ref: receipt.last_event_id,
      lookup: lookupRequest(receipt.delivery_id, receipt.last_event_id) } : null);
  if (actual) result.delivery = actual;
  return result;
}

module.exports = { FORMAT, compactBrief, compactRead, compactReceipt };
