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

function askQuestion(loaded, suffix, questionRef, wording) {
  const record = loaded.state.exchanges.find(exchange => exchange.exchange_id === "exchange-" + suffix);
  const body = loaded.events.find(event => event.event_id === "event-exchange-" + suffix).payload.exchange;
  record.question_refs = [questionRef];
  body.response.questions = [{ question_ref: questionRef, text: wording, why: "This determines the available work.", needed: "An answer or an explicit unknown." }];
  delete body.response.questions_none;
}

test("an older pending consultant question survives focus changes without expanding unrelated dialogue", () => {
  const loaded = fixture();
  event(loaded, "event-question", { changes: { questions: [{ question_id: "q-pooling", statement: "Are seats fixed or transferable?", status: "open",
    resolution: { answer_refs: [], remaining: ["Can unused seats move between centers?"] } }] } });
  for (let index = 0; index < 3; index++) {
    turn(loaded, "pooling-" + index, { delivered: true });
    askQuestion(loaded, "pooling-" + index, "q-pooling", index ? "Can unused seats move between centers?" : "Are seats fixed or transferable?");
  }
  for (let index = 0; index < 25; index++) turn(loaded, "other-" + index, { delivered: true });
  const current = selectContext(loaded, { limit: 1 }), compact = buildViews(loaded, current);
  assert.equal(compact.work.pending_consultant_questions.length, 1);
  assert.deepEqual(compact.work.pending_consultant_questions[0].retrieval, { focus_refs: ["q-pooling"] });
  assert.deepEqual(compact.work.pending_consultant_questions[0].remaining, ["Can unused seats move between centers?"]);
  assert.ok(!current.context.questions.some(question => question.question_id === "q-pooling"));
  const focused = selectContext(loaded, { focus_refs: ["q-pooling"], limit: 1 }), views = buildViews(loaded, focused);
  const memory = views.work.question_memory.find(question => question.question_ref === "q-pooling");
  assert.equal(memory.original_exchange_ref, "exchange-pooling-0");
  assert.equal(memory.latest_exchange_ref, "exchange-pooling-2");
  assert.ok(views.work.exchanges.some(exchange => exchange.exchange_id === "exchange-pooling-0"));
  assert.ok(views.work.exchanges.some(exchange => exchange.exchange_id === "exchange-pooling-2"));
  assert.ok(!views.work.exchanges.some(exchange => exchange.exchange_id === "exchange-pooling-1"));
  assert.ok(views.work.exchanges.length < 6);
  assert.equal(focused.coverage.exceeds_requested_limit, true);
});

test("partial resolution restores qualified answer sources and the latest related interpretation", () => {
  const loaded = fixture();
  event(loaded, "event-question", { changes: { questions: [{ question_id: "q-allocation", origin: "consultant",
    statement: "How were seats allocated, and can they move?", status: "open", basis_refs: [],
    resolution: { answer_refs: [], remaining: ["How were seats allocated?", "Can seats move?"] } }] } });
  turn(loaded, "ask", { delivered: true });
  askQuestion(loaded, "ask", "q-allocation", "How were seats allocated, and can they move?");
  turn(loaded, "answer", { delivered: true });
  const evidence = loaded.state.evidence.find(record => record.evidence_id === "incoming-answer");
  evidence.summary = "The user tentatively recalls 20 seats per center; transferability is unanswered.";
  evidence.source_excerpt = "I think each center got 20 seats.";
  evidence.limitations = ["Unverified recollection; transferability was not answered."];
  // Self-contained answer uses its source, without a fictional public binding.
  event(loaded, "event-resolution", { changes: { questions: [{ question_id: "q-allocation", origin: "consultant",
    statement: "How were seats allocated, and can they move?", status: "open", basis_refs: [],
    resolution: { answer_refs: ["incoming-answer"], remaining: ["Can seats move?"] } }] } });
  turn(loaded, "unrelated", { delivered: true });
  const selected = selectContext(loaded, { focus_refs: ["q-allocation"], limit: 1 }), views = buildViews(loaded, selected);
  const answer = selected.context.evidence.find(record => record.evidence_id === "incoming-answer");
  assert.equal(answer.source_excerpt, "I think each center got 20 seats.");
  assert.match(answer.limitations[0], /Unverified recollection/);
  const memory = views.work.question_memory.find(record => record.question_ref === "q-allocation");
  assert.equal(memory.latest_interpretation_ref, "interpretation-answer");
  assert.deepEqual(memory.resolution.remaining, ["Can seats move?"]);
  assert.equal(views.work.interpretations.find(record => record.interpretation_id === "interpretation-answer").components[0].question_ref, undefined);
});

test("choice clarification retains the original unprotected alternatives across later clarifications", () => {
  const loaded = fixture();
  turn(loaded, "offer", { delivered: true });
  const offer = loaded.events.find(event => event.event_id === "event-exchange-offer").payload.exchange;
  offer.response.next_steps = [
    { option_id: "audit", label: "Inspect missing data", kind: "action", actor: "consultant", scope: "Audit completeness.", basis_refs: [] },
    { option_id: "explain", label: "Explain the study design", kind: "action", actor: "consultant", scope: "Explain allocation.", basis_refs: [] }
  ];
  loaded.state.exchanges.find(record => record.exchange_id === "exchange-offer").options = offer.response.next_steps.map(option => ({ option_id: option.option_id }));
  event(loaded, "event-choice", { changes: { questions: [{ question_id: "q-choice", status: "open", statement: "Which work should proceed?",
    basis_refs: ["exchange-offer"], resolution: { answer_refs: [], remaining: ["Missing-data audit or design explanation?"] } }] } });
  turn(loaded, "clarify", { delivered: true });
  askQuestion(loaded, "clarify", "q-choice", "Previously I offered an audit or an explanation. Which did you mean?");
  turn(loaded, "clarify-again", { delivered: true });
  askQuestion(loaded, "clarify-again", "q-choice", "I still need to know which task you want.");
  const views = buildViews(loaded, selectContext(loaded, { focus_refs: ["q-choice"], limit: 1 }));
  const memory = views.work.question_memory.find(record => record.question_ref === "q-choice");
  assert.equal(memory.original_exchange_ref, "exchange-offer");
  assert.equal(memory.latest_exchange_ref, "exchange-clarify-again");
  assert.deepEqual(views.work.exchanges.find(record => record.exchange_id === "exchange-offer").response.next_steps.map(option => option.option_id), ["audit", "explain"]);
  assert.ok(!views.work.exchanges.some(record => record.exchange_id === "exchange-clarify"));
});

test("retired uncertainty is retrieved with dependent work without returning to the pending questionnaire", () => {
  const loaded = fixture();
  event(loaded, "event-retired", { changes: { questions: [{ question_id: "q-unavailable", origin: "consultant", statement: "Was participation voluntary?",
    status: "retired", reason: "The user cannot obtain the record.", resolution: { answer_refs: [], remaining: ["Assignment remains unknown."] } }],
  decisions: [{ decision_id: "decision-limited-report", kind: "scope", statement: "A descriptive report only.", status: "current", basis_refs: ["q-unavailable"] }] } });
  const selected = selectContext(loaded, { focus_refs: ["decision-limited-report"], limit: 1 }), views = buildViews(loaded, selected);
  assert.deepEqual(views.work.pending_consultant_questions, []);
  assert.equal(views.work.question_memory[0].status, "retired");
  assert.deepEqual(views.work.question_memory[0].resolution.remaining, ["Assignment remains unknown."]);
});

test("prepared or mismatched question wording is not an observed answer referent", () => {
  const loaded = fixture();
  event(loaded, "event-unobserved-question", { changes: { questions: [{ question_id: "q-ambiguous", status: "open", statement: "Which option?" }] } });
  turn(loaded, "mismatched", { delivered: true });
  askQuestion(loaded, "mismatched", "q-ambiguous", "Choose A or B.");
  loaded.state.deliveries[0].observed_response_sha256 = "b".repeat(64);
  turn(loaded, "prepared");
  askQuestion(loaded, "prepared", "q-ambiguous", "Choose C or D.");
  const views = buildViews(loaded, selectContext(loaded, { focus_refs: ["q-ambiguous"], limit: 1 }));
  const memory = views.work.question_memory[0];
  assert.equal(memory.original_exchange_ref, null);
  assert.equal(memory.latest_exchange_ref, null);
  assert.deepEqual(memory.delivery_refs, []);
  assert.deepEqual(memory.unobserved_exchange_refs, ["exchange-mismatched", "exchange-prepared"]);
});

test("a computational answer retrieves its governing conditions through nested answer references", () => {
  const loaded = resultFixture();
  event(loaded, "event-computed-answer", { changes: { questions: [{ question_id: "q-interval", origin: "consultant",
    statement: "What interval is supported under the constant-effect assumption?", status: "answered", reason: "The inversion has been computed.",
    resolution: { answer_refs: ["result-interval"], remaining: [] } }] } });
  const selected = selectContext(loaded, { focus_refs: ["q-interval"], limit: 1 });
  assert.equal(selected.context.result_conditions[0].condition_id, "condition-interval");
  assert.equal(selected.context.assumptions[0].assumption_id, "assumption-constant");
  assert.ok(selected.context.evidence.some(record => record.evidence_id === "evidence-claim"));
  assert.equal(buildViews(loaded, selected).work.question_memory.find(record => record.question_ref === "q-interval").latest_interpretation_ref, null,
    "A computed answer does not invent a user reply interpretation.");
});
