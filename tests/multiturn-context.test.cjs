"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { selectContext } = require("../scripts/lib/context.cjs");
const { buildViews } = require("../scripts/lib/views.cjs");

function fixture(protocol = true) {
  return { state: { state_meta: { project_id: "project-views", last_event_id: "event-init", sequence: 1,
    ...(protocol ? { protocol: "durable-exchanges-v1" } : {}) }, project_understanding: { objective: "Advise the board." },
  consultation: null, evidence: [], questions: [], assumptions: [], decisions: [], candidate_routes: [], specialist_reviews: [], runs: [],
  ...(protocol ? { interpretations: [], exchanges: [], deliveries: [], turns: [], user_context: [], result_conditions: [] } : {}) },
  events: [{ event_id: "event-init", type: "project_initialized", payload: {} }] };
}

function event(loaded, event_id, payload, type = "memory_updated") {
  loaded.events.push({ event_id, type, payload: structuredClone(payload) });
  loaded.state.state_meta.last_event_id = event_id;
  loaded.state.state_meta.sequence++;
  for (const [name, records] of Object.entries(payload.changes || {})) {
    const keys = { evidence: "evidence_id", assumptions: "assumption_id", result_conditions: "condition_id",
      decisions: "decision_id", questions: "question_id", user_context: "context_id" };
    for (const record of records) {
      const existing = loaded.state[name].findIndex(item => item[keys[name]] === record[keys[name]]);
      if (existing < 0) loaded.state[name].push(structuredClone(record));
      else loaded.state[name][existing] = structuredClone(record);
    }
  }
}

function turn(loaded, suffix, { previous, delivered = false, prepared = true, work = [] } = {}) {
  const incoming = "incoming-" + suffix, interpretationId = "interpretation-" + suffix, turnId = "turn-" + suffix;
  const exchangeId = "exchange-" + suffix, eventId = "event-interpretation-" + suffix;
  const interpretation = { interpretation_id: interpretationId, turn_id: turnId, incoming_refs: [incoming], basis_refs: [],
    components: [{ kind: previous ? "answer" : "instruction", meaning: previous ? "The record exists." : "Explain the evidence.",
      established: [], unresolved: ["Its contents have not been inspected."], ...(previous ? { exchange_ref: "exchange-" + previous,
        delivery_ref: "delivery-" + previous } : {}) }],
    next_action: { kind: "lead_only", scope: "Explain the available evidence.", reason: "No new investigation is requested." } };
  event(loaded, eventId, { interpretation, changes: { evidence: [{ evidence_id: incoming, kind: "user_statement",
    source_ref: "chat:" + suffix, summary: previous ? "Yes." : "Explain the evidence." }] } }, "reply_interpreted");
  loaded.state.interpretations.push({ interpretation_id: interpretationId, turn_id: turnId, event_ref: eventId,
    incoming_refs: [incoming], basis_refs: [], next_action: structuredClone(interpretation.next_action) });
  loaded.state.turns.push({ turn_id: turnId, interpretation_ref: interpretationId, work_refs: work, exchange_ref: prepared ? exchangeId : null });
  if (!prepared) return;
  const exchange = { exchange_id: exchangeId, turn_id: turnId, interpretation_ref: interpretationId, basis_refs: [],
    completed_work_refs: work, reconciliation: { changes: [], limitations: ["Design remains unverified."], unresolved: [], next_direction: "Request an accessible record." },
    renderer: "lead-markdown-v1", response: { status: "We have a reported source, whose contents remain uninspected.",
      questions: [], questions_none: "No factual question is needed now.", next_steps: [{ option_id: "send-record", kind: "action",
        label: "Supply the allocation record", actor: "user", scope: "Provide the existing record for inspection.", basis_refs: [] }] } };
  event(loaded, "event-exchange-" + suffix, { exchange }, "exchange_prepared");
  loaded.state.exchanges.push({ exchange_id: exchangeId, turn_id: turnId, interpretation_ref: interpretationId,
    event_ref: "event-exchange-" + suffix, renderer: exchange.renderer, response_sha256: "a".repeat(64), question_refs: [], options: [{ option_id: "send-record" }] });
  if (delivered) {
    const delivery = { delivery_id: "delivery-" + suffix, exchange_ref: exchangeId, observation: "assistant_emission",
      source_ref: incoming, response_sha256: "a".repeat(64) };
    event(loaded, "event-delivery-" + suffix, { delivery }, "exchange_delivery");
    loaded.state.deliveries.push({ ...delivery, event_ref: "event-delivery-" + suffix });
  }
}

function resultFixture() {
  const loaded = fixture();
  event(loaded, "event-science", { changes: {
    evidence: [{ evidence_id: "result-interval", kind: "computed", source_ref: "runs/run-analysis/results.json", run_id: "run-analysis",
      summary: "Interval needle-result: -10 to 9." }, { evidence_id: "evidence-claim", kind: "user_statement", source_ref: "chat:design",
      summary: "I think allocation was random.", source_excerpt: "I think", limitations: ["Unverified recollection."] }],
    assumptions: [{ assumption_id: "assumption-constant", statement: "Every unit has the same additive effect.", status: "active", basis_refs: ["evidence-claim"] }],
    result_conditions: [{ condition_id: "condition-interval", evidence_ref: "result-interval", result_locator: "interval",
      claim: "The interval is conditional on a common effect.", target: "Common additive effect", assumption_refs: ["assumption-constant"],
      basis_refs: ["evidence-claim"], limitations: ["Not established for unrestricted heterogeneous average effects."] }],
    decisions: [{ decision_id: "decision-report", kind: "scope", statement: "Use the interval conditionally.", status: "current", basis_refs: ["condition-interval"] }]
  } });
  loaded.state.runs.push({ run_id: "run-analysis", kind: "analysis", status: "completed" });
  return loaded;
}

test("legacy context keeps its old shape and has no invented exchange views", () => {
  const loaded = fixture(false), result = selectContext(loaded);
  assert.equal(buildViews(loaded, result), null);
  assert.equal(Object.hasOwn(result.context, "exchanges"), false);
  assert.equal(Object.hasOwn(result.context, "user_context"), false);
});

test("a selected result carries its target, governing condition, assumption and qualified source", () => {
  const loaded = resultFixture();
  const before = JSON.stringify(loaded);
  const result = selectContext(loaded, { focus_refs: ["result-interval"], limit: 1 });
  assert.equal(result.context.result_conditions[0].target, "Common additive effect");
  assert.match(result.context.result_conditions[0].limitations[0], /heterogeneous/);
  assert.equal(result.context.assumptions[0].assumption_id, "assumption-constant");
  assert.equal(result.context.evidence.find(record => record.evidence_id === "evidence-claim").source_excerpt, "I think");
  assert.equal(result.coverage.exceeds_requested_limit, true);
  assert.equal(JSON.stringify(loaded), before, "Retrieval must not amend an assumption or create a memory file.");
});

test("a result discovered by query still carries conditions while unrelated query hits remain discovery", () => {
  const loaded = resultFixture();
  const result = selectContext(loaded, { query: "needle-result", limit: 1 });
  assert.equal(result.context.result_conditions[0].condition_id, "condition-interval");
  assert.equal(result.context.assumptions[0].assumption_id, "assumption-constant");
  assert.ok(result.context.evidence.some(record => record.evidence_id === "evidence-claim"));
});

test("corrected conditions expose affected report decisions without silently changing their status", () => {
  const loaded = resultFixture();
  event(loaded, "event-correction", { corrects_refs: ["condition-interval"], reason: "The earlier scientific guarantee was too broad.",
    changes: { result_conditions: [{ ...loaded.state.result_conditions[0], claim: "Only constant-effect inversion is supported.",
      limitations: ["An arbitrary average-effect coverage guarantee remains unreviewed."] }] } }, "correction");
  const result = selectContext(loaded, { focus_refs: ["result-interval"] });
  assert.equal(result.context.decisions[0].decision_id, "decision-report");
  assert.equal(result.context.decisions[0].status, "current");
  assert.match(result.context.result_conditions[0].claim, /Only constant/);
  assert.ok(result.coverage.omission_reasons.some(reason => reason.includes("condition-interval") && reason.includes("Earlier versions")));
});

test("current exchange, prior observed response and unfinished work survive a one-record page", () => {
  const loaded = fixture();
  turn(loaded, "earlier", { delivered: true });
  loaded.state.runs.push({ run_id: "run-interrupted", status: "completed", kind: "analysis" });
  turn(loaded, "unfinished", { prepared: false, work: ["run-interrupted"] });
  turn(loaded, "current", { previous: "earlier" });
  const result = selectContext(loaded, { limit: 1 });
  const views = buildViews(loaded, result);
  assert.equal(views.work.current_exchange_ref, "exchange-current");
  assert.equal(views.work.latest_observed_exchange_ref, "exchange-earlier");
  assert.equal(views.work.exchanges.find(record => record.exchange_id === "exchange-current").delivery.status, "unobserved");
  assert.equal(views.work.exchanges.find(record => record.exchange_id === "exchange-earlier").delivery.status, "assistant_emission");
  assert.ok(views.work.unfinished_turns.some(record => record.turn_id === "turn-unfinished" && record.reasons.includes("closeout_not_prepared")));
  assert.ok(result.context.runs.some(record => record.run_id === "run-interrupted"));
  assert.equal(result.coverage.exceeds_requested_limit, true);
  assert.equal(Object.hasOwn(result.context.exchanges[0], "response"), false, "Full response is materialized once in work view.");
  assert.ok(views.work.exchanges.every(record => record.event_ref && record.response && record.response_sha256));
});

test("generated memory views share journal identity and keep user scientific statements in evidence", () => {
  const loaded = resultFixture();
  event(loaded, "event-user-context", { changes: { user_context: [{ context_id: "context-register", kind: "statistical_expertise",
    statement: "Tentative: explanations should begin with study concepts.", basis_refs: ["evidence-claim"], status: "current" }] } });
  const selected = selectContext(loaded, { limit: 1 }), views = buildViews(loaded, selected);
  for (const view of Object.values(views)) assert.deepEqual(view.source, views.user.source);
  assert.equal(views.user.source.last_event_id, "event-user-context");
  assert.equal(views.user.context.source_path, "context.user_context");
  assert.ok(views.user.attributed_evidence_refs.includes("evidence-claim"));
  assert.equal(Object.hasOwn(views.user, "evidence"), false);
  assert.equal(views.study.collections.evidence.selected, selected.context.evidence.length);
  assert.equal(views.study.collections.evidence.omitted, loaded.state.evidence.length - selected.context.evidence.length);
  assert.equal(selected.context.user_context[0].context_id, "context-register", "Current communication context is mandatory even with a tiny page.");
});

test("missing result links and historical delivery coverage remain explicit", () => {
  const loaded = resultFixture();
  loaded.state.result_conditions = [];
  const views = buildViews(loaded);
  assert.deepEqual(views.study.result_condition_coverage.unreviewed_computed_evidence_refs, ["result-interval"]);
  assert.equal(views.work.current_exchange_ref, null);
  assert.equal(views.work.latest_observed_exchange_ref, null);
  assert.match(views.work.coverage.legacy_continuity, /unrecorded.*unavailable/);
});

test("long dialogue retrieves the current binding without recursively reproducing every closed exchange", () => {
  const loaded = fixture();
  for (let index = 0; index < 30; index++) turn(loaded, String(index), { previous: index ? String(index - 1) : undefined, delivered: true });
  const selected = selectContext(loaded, { limit: 1 });
  const views = buildViews(loaded, selected);
  assert.ok(views.work.exchanges.length < 5, "Prior-response provenance must not replay the entire dialogue.");
  assert.ok(views.work.exchanges.some(record => record.exchange_id === "exchange-28"));
  assert.ok(views.work.exchanges.some(record => record.exchange_id === "exchange-29"));
  assert.ok(selected.coverage.collections.exchanges.omitted > 20);
  const older = selectContext(loaded, { focus_refs: ["exchange-3"], limit: 1 });
  assert.ok(older.context.interpretations.some(record => record.interpretation_id === "interpretation-3"));
  assert.ok(older.context.evidence.some(record => record.evidence_id === "incoming-3"));
});

test("projection body omissions are disclosed rather than invented by generated views", () => {
  const loaded = fixture();
  turn(loaded, "current");
  loaded.events = loaded.events.filter(record => record.event_id !== "event-exchange-current");
  const views = buildViews(loaded);
  assert.equal(views.work.exchanges[0].body_available, false);
  assert.deepEqual(views.work.coverage.missing_bodies, [{ record_ref: "exchange-current", event_ref: "event-exchange-current" }]);
});
