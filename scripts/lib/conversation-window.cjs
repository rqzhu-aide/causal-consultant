"use strict";

const { canonical, readFile, sha256 } = require("./files.cjs");
const { renderExchange, deliveryCorrespondence, deliveryMatches } = require("./exchanges.cjs");

const WINDOW = 5;
const history = event_ref => ({ event_id: event_ref });
const focus = ref => ({ focus_refs: [ref] });
const marked = source => source?.kind === "user_statement" && Object.hasOwn(source, "complete_message");

// Saved events already contain normalized retained fields. Replay only evidence
// replacements in journal order, not new merge rules or the current projection.
function indexConversation(events) {
  const sources = new Map(), groups = [], groupKeys = new Map(), sourceGroups = new Map();
  const interpretationGroups = new Map(), uncertainAssociations = new Map();
  const exchanges = new Map(), deliveries = new Map(), latestCaptures = new Map();
  for (const [offset, event] of events.entries()) {
    const payload = event.payload || {};
    for (const record of payload.changes?.evidence || []) {
      sources.set(record.evidence_id, { record, event_ref: event.event_id });
    }
    const interpretation = payload.interpretation;
    if (interpretation) {
      const incoming = interpretation.incoming_refs || [];
      const primary = incoming.filter(ref => marked(sources.get(ref)?.record));
      const refs = primary.length ? primary : incoming;
      const key = canonical(refs);
      // Only marked message sources establish a reusable intake identity.
      // Legacy turns can cite the same evidence without being the same input.
      let group = primary.length ? groupKeys.get(key) : null;
      const overlaps = [...new Set(refs.flatMap(ref => sourceGroups.get(ref) || []))];
      // A later attributed capture can repair a provisional source, but cannot
      // silently create another user turn from that already recorded source.
      if (primary.length && !group && overlaps.length === 1 && refs.every(ref => overlaps[0].incoming_refs.includes(ref))) {
        group = overlaps[0];
        group.warnings.push("A later interpretation uses a subset or reordered earlier sources; intake grouping is provisional.");
        group.grouping = "provisional";
      }
      const ambiguous = primary.length && !group && overlaps.length;
      if (ambiguous) uncertainAssociations.set(interpretation.interpretation_id, {
        interpretation_ref: interpretation.interpretation_id, turn_id: interpretation.turn_id,
        incoming_refs: [...refs], event_ref: event.event_id, candidate_intake_ids: overlaps.map(item => item.intake_id),
        outgoing_exchange_refs: [], retrieval: history(event.event_id),
        warning: "Later marked sources overlap provisional historical turns without identifying which intake they repair. Historical groups are preserved; no additional actual user turn is inferred." });
      if (!group && !ambiguous) {
        group = { intake_id: interpretation.interpretation_id, incoming_refs: [...refs],
          first_event_ref: event.event_id, sequence: event.sequence ?? offset + 1,
          grouping: primary.length && !overlaps.length ? "marked" : "provisional",
          incoming: refs.map(ref => ({ evidence_ref: ref, source: sources.get(ref) })),
          interpretations: [], outgoing: [], reconciling_exchange_refs: [], warnings: [] };
        if (!primary.length) group.warnings.push("Historical input grouping and message completeness were not explicitly recorded.");
        if (overlaps.length) group.warnings.push("Sources overlap earlier intakes; actual turn grouping is uncertain.");
        groups.push(group);
        for (const ref of refs) sourceGroups.set(ref, [...(sourceGroups.get(ref) || []), group]);
      }
      if (group) {
        if (primary.length) groupKeys.set(key, group);
        group.interpretations.push({ interpretation_ref: interpretation.interpretation_id,
          turn_id: interpretation.turn_id, event_ref: event.event_id, retrieval: history(event.event_id) });
        interpretationGroups.set(interpretation.interpretation_id, group);
      }
    }
    if (payload.exchange) exchanges.set(payload.exchange.exchange_id, { record: payload.exchange, event_ref: event.event_id });
    if (payload.delivery) {
      const delivery = { ...payload.delivery, event_ref: event.event_id };
      if (!deliveries.has(delivery.exchange_ref)) deliveries.set(delivery.exchange_ref, []);
      deliveries.get(delivery.exchange_ref).push(delivery);
      if (Object.hasOwn(delivery, "observed_response_sha256")) latestCaptures.set(delivery.exchange_ref, delivery);
    }
  }
  for (const exchange of exchanges.values()) {
    const group = interpretationGroups.get(exchange.record.interpretation_ref);
    if (group) group.outgoing.push(exchange);
    else uncertainAssociations.get(exchange.record.interpretation_ref)?.outgoing_exchange_refs.push(exchange.record.exchange_id);
    for (const ref of exchange.record.reconciles || []) {
      const earlier = interpretationGroups.get(ref);
      if (earlier && earlier !== group) earlier.reconciling_exchange_refs.push(exchange.record.exchange_id);
    }
  }
  return { sources, groups, interpretationGroups, uncertainAssociations, exchanges, deliveries, latestCaptures };
}

const matches = (delivery, index) => deliveryMatches(delivery,
  { deliveries: [index.latestCaptures.get(delivery.exchange_ref)].filter(Boolean) });

function incomingBody(item, sources) {
  const original = item.source;
  const result = { evidence_ref: item.evidence_ref, source_event_ref: original?.event_ref || null,
    record: original ? structuredClone(original.record) : null,
    completeness: typeof original?.record.source_excerpt !== "string" ? "missing" : !marked(original.record) ? "unrecorded"
      : original.record.complete_message ? "complete" : "incomplete",
    retrieval: original ? history(original.event_ref) : focus(item.evidence_ref) };
  const current = sources.get(item.evidence_ref);
  if (current && original && canonical(current.record) !== canonical(original.record)) {
    result.later_source_version = { source_event_ref: current.event_ref, retrieval: history(current.event_ref),
      warning: "This source changed after the original intake; the original capture above is preserved." };
    if (current.record.source_excerpt !== original.record.source_excerpt || current.record.complete_message !== original.record.complete_message
      || current.record.source_ref !== original.record.source_ref) {
      result.later_source_version.record = structuredClone(current.record);
      result.later_source_version.warning += " The later attributed capture is shown separately, not substituted for the original.";
    }
  }
  if (result.completeness !== "complete") result.warning = "Do not treat this retained source as a verified full incoming message.";
  return result;
}

function capturedText(root, delivery) {
  if (!Object.hasOwn(delivery, "observed_response_sha256")) {
    return { status: "unavailable", error: "Historical observation did not retain hashed actual-message bytes." };
  }
  try {
    const bytes = readFile(root, delivery.source_ref);
    if (sha256(bytes) !== delivery.observed_response_sha256) {
      return { status: "corrupt", error: "Retained actual-message bytes differ from their recorded hash." };
    }
    const text = bytes.toString("utf8");
    if (!Buffer.from(text, "utf8").equals(bytes)) return { status: "corrupt", error: "Retained actual message is not valid UTF-8." };
    // Reuse the existing span verification for wrapped captures and the normal
    // path-containment/hash contract; never recover text from a prepared file.
    require("./delivery.cjs").verifyCapture(root, delivery);
    return { status: "available", text };
  } catch (error) {
    return { status: ["CAPTURE_MISMATCH", "RESPONSE_SPAN_MISMATCH", "WRAPPER_REVIEW_REQUIRED"].includes(error.code) ? "corrupt" : "unavailable",
      error: error.message, error_code: error.code || "CAPTURE_UNAVAILABLE" };
  }
}

function outgoingBodies(loaded, group, index) {
  const actual = new Map(), outgoing = [];
  for (const item of group.outgoing) {
    const exchange = item.record, observations = index.deliveries.get(exchange.exchange_id) || [];
    const preparedText = renderExchange(exchange);
    let intactActual = false;
    for (const delivery of observations) {
      // A source locator attributes message identity. An observation ID or hash
      // alone never identifies the same emission, even when bytes are equal.
      const key = delivery.capture_source_ref ? "source:" + delivery.capture_source_ref : "observation:" + delivery.delivery_id;
      if (!actual.has(key)) actual.set(key, { identity: delivery.capture_source_ref
        ? { status: "source_attributed", source_ref: delivery.capture_source_ref }
        : { status: "uncertain", observation_ref: delivery.delivery_id },
        emission_order: "unknown", observations: [], captures: [] });
      const message = actual.get(key), capture = capturedText(loaded.root, delivery);
      index.captureStatuses.set(delivery.delivery_id, capture.status);
      const correspondence = Object.hasOwn(delivery, "observed_response_sha256") ? deliveryCorrespondence(delivery) : "unverified";
      message.observations.push({ ...structuredClone(delivery), correspondence,
        binding_compatible: capture.status === "available" && matches(delivery, index), capture_status: capture.status,
        ...(capture.error ? { capture_error: capture.error, ...(capture.error_code ? { capture_error_code: capture.error_code } : {}) } : {}),
        retrieval: history(delivery.event_ref) });
      if (capture.status === "available") {
        let retained = message.captures.find(value => value.sha256 === delivery.observed_response_sha256);
        if (!retained) {
          retained = { sha256: delivery.observed_response_sha256, text: capture.text, observation_refs: [] };
          message.captures.push(retained);
        }
        retained.observation_refs.push(delivery.delivery_id);
        if (["exact", "wrapped"].includes(correspondence)) intactActual = true;
      }
    }
    outgoing.push({ exchange_ref: exchange.exchange_id, interpretation_ref: exchange.interpretation_ref,
      event_ref: item.event_ref, ...(exchange.supersedes ? { supersedes: exchange.supersedes } : {}),
      ...(exchange.reconciles?.length ? { reconciles: [...exchange.reconciles] } : {}),
      prepared: { label: "Prepared response; preparation does not establish delivery.",
        response_sha256: sha256(preparedText), ...(intactActual ? {} : { text: preparedText }) },
      observation_refs: observations.map(value => value.delivery_id), retrieval: history(item.event_ref) });
  }
  for (const message of actual.values()) {
    if (message.captures.length > 1) message.warning = "The same attributed message locator has conflicting retained captures; reconcile their source identity and content.";
    else if (message.identity.status === "uncertain") message.warning = "This observation does not establish whether another observation represents the same actual message.";
  }
  return { outgoing, actual_messages: [...actual.values()] };
}

function unfinishedFor(group, index) {
  const pending = [];
  for (const interpretation of group.interpretations) {
    const turn = index.turns.get(interpretation.interpretation_ref);
    const exchangeRef = turn?.exchange_ref;
    const observations = index.deliveries.get(exchangeRef) || [];
    const compatible = observations.filter(item => Object.hasOwn(item, "observed_response_sha256") && matches(item, index));
    const reasons = !exchangeRef ? ["closeout_not_prepared"] : !observations.length ? ["actual_response_unestablished"]
      : !compatible.length ? ["actual_response_requires_reconciliation"]
        : compatible.every(item => index.captureStatuses.has(item.delivery_id) && index.captureStatuses.get(item.delivery_id) !== "available")
          ? ["actual_capture_unavailable"] : [];
    if (reasons.length) pending.push({ interpretation_ref: interpretation.interpretation_ref, reasons,
      ...(exchangeRef ? { exchange_ref: exchangeRef } : {}), retrieval: interpretation.retrieval });
  }
  return pending;
}

function buildRecentConversation(loaded) {
  const index = indexConversation(loaded.events), recent = index.groups.slice(-WINDOW);
  index.turns = new Map((loaded.state.turns || []).map(turn => [turn.interpretation_ref, turn]));
  index.captureStatuses = new Map();
  const outgoing = new Map(recent.map(group => [group.intake_id, outgoingBodies(loaded, group, index)]));
  const recent_intakes = recent.map(group => ({ intake_id: group.intake_id, incoming_refs: [...group.incoming_refs],
    first_event_ref: group.first_event_ref, sequence: group.sequence, grouping: group.grouping,
    incoming: group.incoming.map(item => incomingBody(item, index.sources)),
    interpretations: structuredClone(group.interpretations), ...outgoing.get(group.intake_id),
    reconciling_exchange_refs: [...new Set(group.reconciling_exchange_refs)],
    unfinished: unfinishedFor(group, index), warnings: [...new Set(group.warnings)] }));
  const old = index.groups.slice(0, -WINDOW);
  return { recent_intakes, coverage: { window_size: WINDOW, total_saved_intakes: index.groups.length,
    returned_intakes: recent.length, omitted_older_intakes: old.length,
    grouping: index.groups.some(group => group.grouping !== "marked") ? "includes_provisional_history" : "marked_sources",
    uncertain_interpretation_associations: [...index.uncertainAssociations.values()],
    incoming_order: "First saved intake sequence; later interpretations, drafts and observations do not reorder it.",
    outgoing_order: "Actual emission order, including order across intakes, is unknown unless established by source evidence; journal observations are not chronology.",
    incomplete_or_unrecorded_sources: recent_intakes.flatMap(group => group.incoming.filter(item => item.completeness !== "complete")
      .map(item => ({ intake_id: group.intake_id, evidence_ref: item.evidence_ref, completeness: item.completeness, retrieval: item.retrieval }))),
    capture_problems: recent_intakes.flatMap(group => group.actual_messages.flatMap(message => message.observations
      .filter(item => item.capture_status !== "available").map(item => ({ delivery_ref: item.delivery_id,
        status: item.capture_status, retrieval: item.retrieval })))),
    older_unfinished: old.flatMap(group => { const pending = unfinishedFor(group, index);
      return pending.length ? [{ intake_id: group.intake_id, incoming_refs: group.incoming_refs,
        unfinished: pending, retrieval: history(group.first_event_ref) }] : []; }),
    retrieval: "Use context focus_refs or history event_id for older exact messages and governing options. The current unsaved host message is not acquired by this read." } };
}

module.exports = { buildRecentConversation };
