"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const store = require("../scripts/lib/store.cjs");
const model = require("../scripts/lib/model.cjs");
const policy = require("../scripts/lib/authorizations.cjs");
const runs = require("../scripts/lib/runs.cjs");
const f = require("./fixtures/consultation-loop.cjs");
function project(t) {
  const base = fs.realpathSync.native(os.tmpdir());
  const root = fs.mkdtempSync(path.join(base, "cc-memory-sources-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("cc-memory-sources-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  store.init(root, { event_id: "event-init", project_id: "project-memory" });
  return root;
}
function request(root, event_id, type, payload) { return { ...f.ids(root, event_id), type, payload }; }
function unchanged(root, value, code) {
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(() => store.record(root, value), { code });
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
}
function plan() {
  return { kind: "analysis", objective: "Describe the supplied sample", claim_boundary: "Descriptive only", inputs: [],
    target: "Sample mean", population: "Supplied observations", treatment: "None", comparator: "None", outcome: "Recorded score",
    timing: "One collection", estimand: "Sample mean", design_id: "descriptive_association", estimator: "Arithmetic mean", exclusions: [], diagnostics: [] };
}
function decision(root, offer, suffix, disposition = "accept", source_excerpt) {
  const user_ref = "user-" + suffix;
  return request(root, "event-" + suffix, "reply_interpreted", { protocol: "durable-exchanges-v1",
    changes: { evidence: [{ evidence_id: user_ref, kind: "user_statement", source_ref: "chat:" + suffix,
      summary: "Recorded user direction", ...(source_excerpt === undefined ? {} : { source_excerpt }) }] },
    interpretation: { interpretation_id: "interpretation-" + suffix, turn_id: "turn-" + suffix, incoming_refs: [user_ref], basis_refs: [],
      components: [{ kind: "selection", meaning: "The user selects a direction for this scope.", established: [], unresolved: [],
        exchange_ref: offer.exchange_ref, option_id: offer.option_id, delivery_ref: offer.delivery_ref }],
      next_action: disposition === "accept" ? { kind: "specialist", scope: "Execute this accepted bounded scope.", reason: "The user accepted this proposal.",
        assignment: offer.scope.assignment, scope_ref: offer.scope.scope_id, authorization_ref: "decision-" + suffix }
        : { kind: "lead_only", scope: "Record the direction and discuss it.", reason: "No computation in this turn.", adjustment_reason: "The user also needs an explanation." },
      action_decisions: [{ decision_id: "decision-" + suffix, scope_ref: offer.scope.scope_id, disposition,
        exchange_ref: offer.exchange_ref, option_id: offer.option_id, delivery_ref: offer.delivery_ref, user_refs: [user_ref] }] } });
}

test("new action acceptances, deferrals, declines and withdrawals require quoted user words", t => {
  const root = project(t), offer = f.prepareScope(root, plan());
  for (const disposition of ["accept", "defer", "decline", "withdraw"]) {
    unchanged(root, decision(root, offer, disposition, disposition), "MISSING_USER_SOURCE");
  }
  unchanged(root, decision(root, offer, "empty", "accept", "   "), "INVALID_INPUT");
  const accepted = decision(root, offer, "quoted", "accept", "Yes, use that scope.");
  store.record(root, accepted);
  assert.equal(policy.eligibility(f.state(root), offer.scope.scope_id).eligible, true);
  assert.equal(f.state(root).evidence.find(item => item.evidence_id === "user-quoted").source_excerpt, "Yes, use that scope.");
});

test("routine same-ID edits carry attribution and qualifications without mutating the request or breaking retries", t => {
  const root = project(t);
  const source = { ...f.statement("user-assignment", "I think assignment was random, but I need to check the roster."),
    summary: "The user tentatively recalls random assignment.", source_sha256: "a".repeat(64), limitations: ["Unverified recollection; roster confirmation remains pending."] };
  f.record(root, "memory_updated", { changes: { evidence: [source], questions: [{ question_id: "question-roster", origin: "user",
    statement: "Can you explain why the roster matters?", status: "open", basis_refs: [source.evidence_id] }] } }, "event-source");
  const edit = request(root, "event-update", "memory_updated", { changes: {
    evidence: [{ evidence_id: source.evidence_id, kind: "user_statement", summary: "The user still needs to check the roster." }],
    questions: [{ question_id: "question-roster", statement: "Can you explain why the roster matters?", status: "open", reason: "Retain this for the next lead reply." }]
  } });
  const input = structuredClone(edit);
  store.record(root, edit);
  assert.deepEqual(edit, input);
  store.recover(root);
  const retained = f.state(root);
  assert.equal(retained.evidence[0].source_excerpt, source.source_excerpt);
  assert.equal(retained.evidence[0].source_ref, source.source_ref);
  assert.equal(retained.evidence[0].source_sha256, source.source_sha256);
  assert.deepEqual(retained.evidence[0].limitations, source.limitations);
  assert.deepEqual(retained.questions[0].basis_refs, [source.evidence_id]);
  assert.equal(retained.questions[0].origin, "user");
  f.record(root, "memory_updated", { changes: { project_understanding: { audience: "Study team" } } }, "event-later");
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.equal(store.record(root, edit).replayed, true);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
});

test("explicit provenance loss needs a sourced correction while ordinary file updates remain possible", t => {
  const root = project(t);
  const source = { ...f.statement("user-origin", "The assignment may have been random."), limitations: ["Not yet verified."] };
  f.record(root, "memory_updated", { changes: { evidence: [source], assumptions: [{ assumption_id: "assumption-origin",
    statement: "Random assignment remains a working assumption.", status: "active", basis_refs: [source.evidence_id] }] } }, "event-source");
  for (const [suffix, change] of [["quote", { source_excerpt: "The assignment was random." }], ["limit", { limitations: [] }], ["locator", { source_ref: "chat:another-turn" }]]) {
    unchanged(root, request(root, "event-loss-" + suffix, "memory_updated", { changes: { evidence: [{ ...source, ...change }] } }), "MEMORY_SOURCE_CHANGED");
  }
  unchanged(root, request(root, "event-basis-loss", "memory_updated", { changes: { assumptions: [{ ...f.state(root).assumptions[0], basis_refs: [] }] } }), "MEMORY_SOURCE_CHANGED");
  f.record(root, "correction", { corrects_refs: [source.evidence_id], reason: "The earlier summary miscopied the user's qualification; retain the actual words.",
    changes: { evidence: [{ ...source, source_excerpt: "I am certain it was not randomized.", summary: "The user says assignment was not randomized.", limitations: ["User account, not an independently inspected roster."] }] } }, "event-correct-source");
  assert.equal(f.state(root).evidence[0].source_excerpt, "I am certain it was not randomized.");
  const assumption = f.state(root).assumptions[0];
  f.record(root, "correction", { corrects_refs: [assumption.assumption_id], reason: "The newly inspected assignment file replaces the provisional account.", changes: {
    evidence: [{ evidence_id: "file-roster", kind: "file", source_ref: "roster.csv", summary: "Inspected assignment flags." }],
    assumptions: [{ ...assumption, status: "revised", basis_refs: ["file-roster"] }]
  } }, "event-correct-assumption");
  assert.deepEqual(f.state(root).assumptions[0].basis_refs, ["file-roster"]);
  f.record(root, "memory_updated", { changes: { evidence: [{ evidence_id: "file-roster", kind: "file", source_ref: "updated-roster.csv", summary: "A newly supplied roster revision." }] } }, "event-file-update");
  assert.equal(f.state(root).evidence.find(item => item.evidence_id === "file-roster").source_ref, "updated-roster.csv");
});

test("a user question withdrawal needs its own source; an answered question can cite consultant findings", t => {
  const root = project(t);
  const question = { question_id: "question-meaning", origin: "user", statement: "What does this comparison mean?", status: "open", basis_refs: ["user-question"] };
  f.record(root, "memory_updated", { changes: { evidence: [f.statement("user-question", question.statement)], questions: [question] } }, "event-question");
  unchanged(root, request(root, "event-unsourced-withdrawal", "memory_updated", { changes: {
    questions: [{ ...question, status: "retired", reason: "The user no longer needs this answer." }]
  } }), "MISSING_USER_SOURCE");
  f.record(root, "memory_updated", { changes: { evidence: [f.statement("user-withdrawal", "Please drop the comparison question for now.")],
    questions: [{ ...question, status: "retired", reason: "The user explicitly withdrew it.", basis_refs: [...question.basis_refs, "user-withdrawal"] }]
  } }, "event-withdrawal");
  assert.equal(f.state(root).questions[0].status, "retired");
  const second = { ...question, question_id: "question-second" };
  f.record(root, "memory_updated", { changes: { questions: [second] } }, "event-second");
  f.record(root, "memory_updated", { changes: { evidence: [{ evidence_id: "file-explanation", kind: "file", source_ref: "design-notes.md", summary: "Meaning and limitations of the comparison." }],
    questions: [{ ...second, status: "answered", reason: "Explained using the saved design notes.", basis_refs: [...second.basis_refs, "file-explanation"] }]
  } }, "event-answer");
  assert.equal(f.state(root).questions[1].status, "answered");
});

test("new file identities do not inherit old excerpts or legacy attribution", t => {
  const root = project(t);
  for (const mode of ["path", "hash"]) {
    const original = { evidence_id: "file-" + mode, kind: "file", source_ref: "data/original.txt", source_sha256: "a".repeat(64),
      summary: "Original file", source_excerpt: "The original source's text.", limitations: ["Assignment remains unverified."],
      legacy: { source_project: "older-project", source_version: "6", verification: "reviewed_summary" } };
    f.record(root, "memory_updated", { changes: { evidence: [original] } }, "event-file-" + mode);
    const replacement = { evidence_id: original.evidence_id, kind: "file", source_ref: mode === "path" ? "data/replacement.txt" : original.source_ref,
      source_sha256: "b".repeat(64), summary: "Replacement source awaiting excerpt review." };
    f.record(root, "memory_updated", { changes: { evidence: [replacement] } }, "event-file-new-" + mode);
    const actual = f.state(root).evidence.find(item => item.evidence_id === original.evidence_id);
    assert.equal(Object.hasOwn(actual, "source_excerpt"), false);
    assert.equal(Object.hasOwn(actual, "legacy"), false);
    assert.deepEqual(actual.limitations, original.limitations);
  }
});

test("a changed user source cannot inherit the old quotation or hash", t => {
  const root = project(t);
  for (const mode of ["locator", "hash", "kind"]) {
    const original = { ...f.statement("source-" + mode, "I think offers were randomized."), source_sha256: "a".repeat(64),
      limitations: ["An unverified recollection."] };
    f.record(root, "memory_updated", { changes: { evidence: [original] } }, "event-old-" + mode);
    const revised = { evidence_id: original.evidence_id, kind: mode === "kind" ? "file" : "user_statement",
      source_ref: mode === "locator" ? "chat:corrected-message" : original.source_ref, summary: "Corrected source attribution.",
      ...(mode === "hash" ? { source_sha256: "b".repeat(64) } : {}) };
    const change = request(root, "event-correction-" + mode, "correction", { corrects_refs: [original.evidence_id],
      reason: "Use the actual revised source rather than the earlier account.", changes: { evidence: [revised] } });
    const prepared = model.prepareMemoryWrite(f.state(root), change).payload.changes.evidence[0];
    assert.equal(Object.hasOwn(prepared, "source_excerpt"), false);
    assert.equal(prepared.source_sha256, mode === "hash" ? "b".repeat(64) : undefined);
    if (mode !== "kind") {
      unchanged(root, change, "MISSING_USER_SOURCE");
      change.payload.changes.evidence[0].source_excerpt = "I checked: the offers were not randomized.";
    }
    store.record(root, change);
    const current = f.state(root).evidence.find(item => item.evidence_id === original.evidence_id);
    assert.equal(current.source_excerpt, mode === "kind" ? undefined : "I checked: the offers were not randomized.");
    assert.equal(current.source_sha256, mode === "hash" ? "b".repeat(64) : undefined);
    assert.deepEqual(current.limitations, original.limitations);
    const retained = store.history(root, { event_id: "event-old-" + mode }).events[0].payload.changes.evidence[0];
    assert.equal(retained.source_excerpt, original.source_excerpt);
    assert.equal(retained.source_sha256, original.source_sha256);
  }
});

test("new user corrections need an excerpt but unrelated memories do not", t => {
  const root = project(t);
  f.record(root, "memory_updated", { changes: { evidence: [{ evidence_id: "user-account", kind: "user_statement", source_ref: "chat:1", summary: "Initial tentative account." }] } }, "event-account");
  unchanged(root, request(root, "event-unsourced-correction", "correction", { corrects_refs: ["user-account"], reason: "Correct the recorded user account.", changes: {
    evidence: [{ ...f.state(root).evidence[0], summary: "The earlier account was incorrect." }]
  } }), "MISSING_USER_SOURCE");
  const correction = request(root, "event-correction", "reply_interpreted", { protocol: "durable-exchanges-v1", interpretation: {
    interpretation_id: "interpretation-correction", turn_id: "turn-correction", incoming_refs: ["user-account"], basis_refs: [],
    components: [{ kind: "correction", meaning: "The user corrects assignment timing.", established: [], unresolved: ["Reassess the timing-dependent analysis."] }],
    next_action: { kind: "lead_only", scope: "Reconcile the correction.", reason: "Timing changes the available analysis." }
  } });
  unchanged(root, correction, "MISSING_USER_SOURCE");
  correction.payload.changes = { evidence: [{ ...f.state(root).evidence[0], source_excerpt: "Sorry, the roster was collected after assignment." }] };
  correction.payload.changes.evidence.push({ evidence_id: "user-style", kind: "user_statement", source_ref: "chat:2", summary: "The same turn also asks for shorter explanations." });
  correction.payload.interpretation.incoming_refs.push("user-style");
  correction.payload.interpretation.components.push({ kind: "information", meaning: "The user prefers concise replies.", established: ["A style preference."], unresolved: [] });
  store.record(root, correction);
  assert.equal(f.state(root).interpretations[0].next_action.kind, "lead_only");
  assert.equal(Object.hasOwn(f.state(root).evidence.find(item => item.evidence_id === "user-style"), "source_excerpt"), false);
});

test("a qualified yes preserves its prerequisite through a fresh context read and does not start work", t => {
  const root = project(t), offer = f.prepareScope(root, plan());
  const words = "Yes, but explain the comparison before we decide.";
  const value = decision(root, offer, "qualified", "defer", words);
  value.payload.changes.questions = [{ question_id: "question-comparison", origin: "user", statement: "Explain the comparison before deciding.", status: "open", basis_refs: ["user-qualified"] }];
  value.payload.interpretation.components.push({ kind: "question", meaning: "The explanation comes before the analysis decision.",
    established: ["The user has not yet decided to run the analysis."], unresolved: ["Explain the comparison."], user_question_ref: "question-comparison", answer_timing: "before_work" });
  const unsafe = structuredClone(value);
  unsafe.payload.interpretation.next_action = { kind: "specialist", assignment: offer.scope.assignment, scope: "Start immediately.", reason: "Read only the yes." };
  unchanged(root, unsafe, "USER_QUESTION_BLOCKS_WORK");
  store.record(root, value);
  store.recover(root);
  const current = store.context(root, { limit: 1 });
  assert.ok(current.views.work.pending_user_question_refs.includes("question-comparison"));
  assert.equal(current.context.evidence.find(item => item.evidence_id === "user-qualified").source_excerpt, words);
  assert.equal(policy.eligibility(f.state(root), offer.scope.scope_id).reason, "defer");
  assert.equal(f.state(root).runs.length, 0);
  assert.throws(() => runs.start(root, { ...f.ids(root, "event-start"), run_id: "run-premature", plan: {
    ...offer.scope.execution_plan, scope_ref: offer.scope.scope_id, interpretation_ref: "interpretation-qualified", authorization_ref: "decision-qualified"
  } }), { code: "ASSIGNMENT_MISMATCH" });
  assert.equal(fs.existsSync(path.join(root, "runs/run-premature")), false);
});

test("historical same-ID replacement replays unchanged while subsequent live updates carry provenance", () => {
  let state = model.emptyState("project-old", "2026-01-01T00:00:00Z");
  function event(event_id, changes) {
    return { schema_version: 7, project_id: "project-old", event_id, sequence: state.state_meta.sequence + 1,
      previous_event_id: state.state_meta.last_event_id, timestamp: "2026-01-01T00:00:00Z", type: "memory_updated", payload: { changes } };
  }
  state = model.applyEvent(state, event("event-original", { evidence: [f.statement("user-old", "I think this may be randomized.")] }));
  state = model.applyEvent(state, event("event-historical-replacement", { evidence: [{ evidence_id: "user-old", kind: "user_statement", source_ref: "chat:1", summary: "Historical summary without excerpt." }] }));
  assert.equal(Object.hasOwn(state.evidence[0], "source_excerpt"), false);
  const prepared = model.prepareMemoryWrite(state, { payload: { changes: { evidence: [{ ...state.evidence[0], summary: "No fabricated historical quotation." }] } } });
  assert.equal(Object.hasOwn(prepared.payload.changes.evidence[0], "source_excerpt"), false);
});

test("brief route updates preserve omitted cautions while explicit revisions and exact retries remain valid", t => {
  const root = project(t);
  const route = { strategy_id: "strategy-did", target: "ATT", approach: "Compare outcome changes", status: "conditional",
    reason: "Follow-up timing needs reconciliation.", design_id: "difference_in_differences", support_ids: [model.CATALOG.supports[0]],
    data_requirements: ["Comparable follow-up windows"], claim_boundary: "No causal estimate until timing is reconciled.",
    evidence_for: [], evidence_against: ["user-timing"], unmet_requirements: ["Follow-up timing"],
    reopen_or_promote_when: "Document comparable follow-up periods." };
  f.record(root, "memory_updated", { changes: { evidence: [f.statement("user-timing", "Some outcomes were measured later in the treated group.")],
    candidate_routes: [route] } }, "event-route");
  const short = { strategy_id: route.strategy_id, target: route.target, approach: route.approach, status: route.status,
    reason: "Awaiting the promised timing records." };
  const update = request(root, "event-route-update", "memory_updated", { changes: { candidate_routes: [short] } });
  const original = structuredClone(update);
  store.record(root, update);
  assert.deepEqual(update, original);
  assert.deepEqual(f.state(root).candidate_routes[0], { ...route, reason: short.reason });
  assert.match(store.context(root, { mode: "brief" }).brief.markdown, /user-timing/);
  f.record(root, "memory_updated", { changes: { candidate_routes: [{ ...short, status: "not_relevant",
    reason: "The user chose a purely descriptive comparison; causal follow-up requirements do not govern that task.",
    evidence_against: [], unmet_requirements: [], data_requirements: [], support_ids: [], design_id: null,
    claim_boundary: "Descriptive differences only.", reopen_or_promote_when: "Reconsider only if causal estimation is requested." }] } }, "event-route-explicit");
  const revised = f.state(root).candidate_routes[0];
  assert.deepEqual(revised.evidence_against, []);
  assert.deepEqual(revised.unmet_requirements, []);
  assert.equal(revised.design_id, null);
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.equal(store.record(root, update).replayed, true);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
  assert.deepEqual(f.state(root).candidate_routes[0], revised);
  assert.deepEqual(store.history(root, { event_id: "event-route" }).events[0].payload.changes.candidate_routes[0], route);
});

test("historical route omissions retain replacement semantics on replay", () => {
  let state = model.emptyState("project-old-route", "2026-01-01T00:00:00Z");
  const route = { strategy_id: "strategy-old", target: "ATE", approach: "Study comparison", status: "conditional",
    reason: "A historical strategy", claim_boundary: "Conditional only", evidence_against: [], unmet_requirements: ["Timing"] };
  for (const [index, record] of [route, { strategy_id: route.strategy_id, target: route.target, approach: route.approach,
    status: route.status, reason: "Historical replacement omitted optional cautions." }].entries()) {
    state = model.applyEvent(state, { schema_version: 7, project_id: state.state_meta.project_id, event_id: "event-route-" + index,
      sequence: index + 1, previous_event_id: state.state_meta.last_event_id, timestamp: "2026-01-01T00:00:00Z",
      type: "memory_updated", payload: { changes: { candidate_routes: [record] } } });
  }
  assert.equal(Object.hasOwn(state.candidate_routes[0], "claim_boundary"), false);
  assert.equal(Object.hasOwn(state.candidate_routes[0], "unmet_requirements"), false);
});

test("live scopes bind governing decision sources while unrelated preferences leave permission usable", t => {
  const root = project(t);
  f.record(root, "memory_updated", { changes: {
    evidence: [f.statement("user-target", "Estimate the sample mean for eligible baseline entrants."), f.statement("user-style", "Use short replies.")],
    decisions: [{ decision_id: "boundary-current", kind: "boundary", status: "current", statement: "Baseline entrants only.", user_contribution_refs: ["user-target"] }]
  } }, "event-governing-source");
  const offer = f.prepareScope(root, plan(), { basis_refs: ["boundary-current"] });
  assert.ok(offer.scope.basis_versions.some(binding => binding.ref === "user-target"));
  assert.equal(offer.scope.basis_versions.some(binding => binding.ref === "user-style"), false);
  unchanged(root, request(root, "event-unbound-scope", "memory_updated", { changes: { action_scopes: [{ ...offer.scope,
    scope_id: "scope-without-governing-source", basis_versions: offer.scope.basis_versions.filter(binding => binding.ref !== "user-target") }] } }), "STALE_SCOPE");
  const approved = f.acceptScope(root, offer);
  f.record(root, "memory_updated", { changes: { evidence: [{ ...f.state(root).evidence.find(item => item.evidence_id === "user-style"),
    summary: "The user still prefers concise explanations." }] } }, "event-style-edit");
  assert.equal(policy.eligibility(f.state(root), offer.scope.scope_id).eligible, true);
  assert.equal(policy.validateRunStart(f.state(root), approved).scope_ref, offer.scope.scope_id);
  const source = f.state(root).evidence.find(item => item.evidence_id === "user-target");
  f.record(root, "correction", { corrects_refs: [source.evidence_id], reason: "Repair a truncated source quotation by restoring the eligibility restriction.",
    changes: { evidence: [{ ...source, source_excerpt: "Estimate the sample mean for eligible baseline entrants, excluding late enrollees.",
      summary: "Late enrollees are excluded from the target population." }] } }, "event-target-source-correction");
  assert.equal(policy.eligibility(f.state(root), offer.scope.scope_id).reason,
    "basis version changed: user-target; dependency path: boundary-current -> user-target");
  assert.throws(() => policy.validateRunStart(f.state(root), approved), { code: "INVALID_AUTHORIZATION" });
  assert.equal(f.state(root).action_decisions.at(-1).disposition, "accept");
  assert.deepEqual(f.state(root).action_scopes[0].basis_versions, offer.scope.basis_versions);
});
