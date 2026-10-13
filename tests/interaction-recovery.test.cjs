"use strict";
// Public-store trajectories for the documented two-save correction path.
// These verify representability/recovery, not the model's semantic judgment.
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/store.cjs");
const f = require("./fixtures/consultation-loop.cjs");
const PROTOCOL = "durable-exchanges-v1";
const direct = { kind: "lead_only", scope: "Reconcile the user's current account.", reason: "Discuss the implications before choosing further work." };
const remaining = "Whether the two sites can pool unused seats.";
const raw = "Twenty seats at North; pooling is unknown; please keep replies brief.";
const correctionText = "My earlier count was wrong: North has seventeen seats, not twenty. I still do not know about pooling.";
const source = (id, text) => ({ ...f.statement(id, text), complete_message: true });
function interpretation(id, incoming, kind = "information", unresolved = []) {
  return { interpretation_id: "interpretation-" + id, turn_id: "turn-" + id, incoming_refs: incoming,
    components: [{ kind, meaning: kind === "correction" ? "Replace only the North capacity account; pooling remains unknown." : "Record the attributed account or current direction.",
      established: [], unresolved }], basis_refs: ["question-capacity"], next_action: direct };
}
function project(t) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-interaction-recovery-"));
  t.after(() => { assert.equal(path.dirname(fs.realpathSync.native(root)), base); assert.ok(path.basename(root).startsWith("cc-interaction-recovery-")); fs.rmSync(root, { recursive: true, force: true }); });
  store.init(root, { project_id: "interaction-recovery", event_id: "event-init", project_understanding: { objective: "Assess the seat allocation study." } });
  f.record(root, "reply_interpreted", { protocol: PROTOCOL,
    changes: { evidence: [source("user-initial", raw)],
      questions: [
        { question_id: "question-capacity", origin: "consultant", statement: "How many North seats are available?", status: "answered",
          reason: "The user reports twenty seats.", basis_refs: ["user-initial"], resolution: { answer_refs: ["user-initial"], remaining: [] } },
        { question_id: "question-pooling", origin: "consultant", statement: remaining, status: "open", basis_refs: ["user-initial"],
          resolution: { answer_refs: [], remaining: [remaining] } }
      ], user_context: [{ context_id: "preference-brief", kind: "communication", statement: "Keep replies brief.", status: "current", basis_refs: ["user-initial"] }],
      case_brief: { knowledge_refs: ["user-initial"], work_refs: [] } },
    interpretation: interpretation("initial", ["user-initial"])
  }, "event-initial");
  const response = f.emptyResponse("You report twenty North seats. Pooling remains unknown.");
  f.exchange(root, interpretation("initial", ["user-initial"]), "initial", response);
  return root;
}
function saveCorrection(root) {
  const previous = f.state(root).questions.find(item => item.question_id === "question-capacity");
  const request = { ...f.ids(root, "event-correction"), type: "correction", payload: {
    corrects_refs: ["question-capacity"], reason: "The user explicitly corrects only the North seat count.", changes: {
      evidence: [source("user-correction", correctionText)],
      questions: [{ ...previous, reason: "The corrected user account is seventeen seats.", resolution: { answer_refs: ["user-correction"], remaining: [] } }]
    }
  } };
  store.record(root, request);
  return request;
}
function recoverMissingIntake(root, afterEvent) {
  // Simulate the documented exceptional paginated-history read after the last
  // accounted closeout. The utility intentionally does not infer a new intake.
  let cursor, gap = [], found = false;
  do {
    const page = store.history(root, { limit: 2, ...(cursor ? { cursor } : {}) });
    for (const event of page.events) {
      if (found) gap.push(event);
      if (event.event_id === afterEvent) found = true;
    }
    cursor = page.next_cursor;
  } while (cursor);
  assert.equal(found, true);
  const interpreted = new Set(store.readJournal(root).events.flatMap(event => event.payload.interpretation?.incoming_refs || []));
  return gap.flatMap(event => (event.payload.changes?.evidence || []).filter(item => Object.hasOwn(item, "complete_message") && !interpreted.has(item.evidence_id)));
}
function interpretCorrection(root) {
  const recovered = interpretation("correction", ["user-correction"], "correction", [remaining]);
  f.record(root, "reply_interpreted", { protocol: PROTOCOL, interpretation: recovered }, "event-interpret-correction");
  return recovered;
}

test("scoped answer correction preserves the mixed raw intake and recovers an interrupted interpretation exactly once", t => {
  const root = project(t), before = f.state(root), request = saveCorrection(root);
  let brief = store.context(root, { mode: "brief" }).brief;
  assert.equal(brief.coverage.conversation.total_saved_intakes, 2, "A prospectively captured raw message remains a pending intake.");
  assert.deepEqual(brief.recent_intakes.at(-1).unfinished[0].reasons, ["awaiting_interpretation"]);
  assert.deepEqual(f.state(root).evidence.find(item => item.evidence_id === "user-initial"), before.evidence[0]);
  assert.deepEqual(f.state(root).questions.find(item => item.question_id === "question-pooling"), before.questions[1]);
  assert.deepEqual(f.state(root).user_context, before.user_context);
  assert.deepEqual(recoverMissingIntake(root, "event-out-initial").map(item => item.evidence_id), ["user-correction"]);
  const recovered = interpretCorrection(root);
  f.exchange(root, recovered, "correction", f.emptyResponse("Seventeen seats is the corrected count. Pooling remains unknown."));
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.equal(store.record(root, request).replayed, true);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
  store.recover(root);
  brief = store.context(root, { mode: "brief" }).brief;
  assert.equal(brief.coverage.conversation.total_saved_intakes, 2);
  assert.deepEqual(recoverMissingIntake(root, "event-out-initial"), []);
  assert.deepEqual(f.state(root).questions[0].resolution.answer_refs, ["user-correction"]);
  assert.equal(f.state(root).evidence.some(item => item.supersedes === "user-initial"), false);
  assert.deepEqual(store.history(root, { event_id: "event-initial" }).events[0].payload.changes.questions[0].resolution.answer_refs, ["user-initial"]);
  assert.equal(f.state(root).runs.length, 0);
});

test("intervening delivery and new direction recover separate intakes without executing the earlier task", t => {
  const root = project(t);
  saveCorrection(root);
  f.deliver(root, "exchange-initial", "late-initial");
  assert.deepEqual(recoverMissingIntake(root, "event-out-initial").map(item => item.evidence_id), ["user-correction"]);
  // Current host input is read first. Recover the earlier meaning before saving
  // this new intake, so journal order remains honest and the old task is not run.
  const recovered = interpretCorrection(root);
  const current = interpretation("pause", ["user-pause"], "instruction");
  current.next_action = { ...direct, scope: "Pause work and acknowledge the corrected count.", reason: "New user direction supersedes unfinished work." };
  f.record(root, "exchange_prepared", { protocol: PROTOCOL,
    changes: { evidence: [source("user-pause", "Please pause the study now. Keep the corrected count for when I return.")] }, interpretation: current,
    exchange: { exchange_id: "exchange-pause", turn_id: current.turn_id, interpretation_ref: current.interpretation_id,
      reconciles: [recovered.interpretation_id], basis_refs: ["user-pause", "user-correction"], completed_work_refs: [], renderer: "lead-markdown-v4",
      reconciliation: { changes: ["Kept seventeen as the corrected user account and paused work."], limitations: [], unresolved: [remaining], next_direction: "Await the user's return." },
      response: f.emptyResponse("Paused. The corrected count is seventeen; pooling remains unknown.") }
  }, "event-pause");
  const brief = store.context(root, { mode: "brief" }).brief, state = f.state(root);
  assert.deepEqual(brief.recent_intakes.map(item => item.incoming_refs), [["user-initial"], ["user-correction"], ["user-pause"]]);
  assert.equal(state.turns.find(item => item.interpretation_ref === recovered.interpretation_id).exchange_ref, "exchange-pause");
  assert.equal(state.runs.length, 0);
  assert.equal(state.action_decisions?.length || 0, 0);
  assert.equal(brief.recent_intakes[1].actual_messages.length, 0, "A prepared reconciliation must not invent actual delivery.");
});

test("transcription repair preserves intake identity and its original captured representation", t => {
  const root = project(t);
  const old = f.state(root).evidence[0];
  f.record(root, "correction", { corrects_refs: ["user-initial"], reason: "Repair the saved transcription from the actual earlier host message, not a new user account.",
    changes: { evidence: [{ ...old, source_excerpt: "Twenty seats at North; pooling is unknown; please keep responses brief.", complete_message: true }] }
  }, "event-repair-transcription");
  const brief = store.context(root, { mode: "brief" }).brief;
  assert.equal(brief.coverage.conversation.total_saved_intakes, 1);
  assert.equal(store.history(root, { event_id: "event-initial" }).events[0].payload.changes.evidence[0].source_excerpt, raw);
  assert.equal(f.state(root).evidence.length, 1);
  assert.equal(f.state(root).turns.length, 1);
});

test("an already saved newer intake can regain direction after older correction recovery without a duplicate intake", t => {
  const root = project(t);
  saveCorrection(root);
  const current = interpretation("newer", ["user-newer"], "instruction");
  current.next_action = { ...direct, scope: "Pause and keep the current study account.", reason: "The user asks to pause." };
  f.record(root, "reply_interpreted", { protocol: PROTOCOL, interpretation: current,
    changes: { evidence: [source("user-newer", "Pause here; keep what we know for later.")] } }, "event-newer");
  const recovered = interpretCorrection(root);
  const restored = { ...current, interpretation_id: "interpretation-restored", turn_id: "turn-restored" };
  f.record(root, "exchange_prepared", { protocol: PROTOCOL, interpretation: restored,
    exchange: { exchange_id: "exchange-restored", turn_id: restored.turn_id, interpretation_ref: restored.interpretation_id,
      reconciles: [recovered.interpretation_id, current.interpretation_id], basis_refs: ["user-newer", "user-correction"], completed_work_refs: [],
      renderer: "lead-markdown-v4", reconciliation: { changes: ["Recovered the corrected account and retained the current pause."],
        limitations: [], unresolved: [remaining], next_direction: "Wait for the user to resume." }, response: f.emptyResponse("Paused; seventeen seats remains the corrected account.") }
  }, "event-restored");
  const state = f.state(root), brief = store.context(root, { mode: "brief" }).brief;
  assert.equal(brief.coverage.conversation.total_saved_intakes, 3);
  assert.equal(brief.recent_intakes.find(item => item.incoming_refs.includes("user-newer")).interpretations.length, 2);
  assert.equal(state.interpretations.at(-1).interpretation_id, restored.interpretation_id);
  assert.equal(state.interpretations.at(-1).next_action.scope, current.next_action.scope);
  assert.match(brief.markdown, /Wait for the user to resume/);
  assert.equal(state.turns.every(turn => turn.exchange_ref), true);
  assert.equal(state.runs.length, 0);
});
