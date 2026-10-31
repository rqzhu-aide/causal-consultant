"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/store.cjs");
const f = require("./fixtures/consultation-loop.cjs");
const { PROTOCOL } = require("../scripts/lib/exchanges.cjs");
const raw = "Twenty seats at North; pooling is unknown; keep replies brief.";
const source = (id, text) => ({ ...f.statement(id, text), complete_message: true });
const action = { kind: "lead_only", scope: "Reconcile the user's information.", reason: "Discuss current understanding before work." };
function project(t) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-brief-answer-"));
  t.after(() => { assert.equal(path.dirname(fs.realpathSync.native(root)), base); assert.ok(path.basename(root).startsWith("cc-brief-answer-")); fs.rmSync(root, { recursive: true, force: true }); });
  store.init(root, { project_id: "brief-answer", event_id: "event-init", project_understanding: { objective: "Assess the seat allocation study." } });
  const it = interpretation("initial", "user-initial");
  f.record(root, "reply_interpreted", { protocol: PROTOCOL, interpretation: it, changes: {
    evidence: [source("user-initial", raw)],
    questions: [{ question_id: "question-capacity", origin: "consultant", statement: "How many North seats are available?", status: "answered",
      reason: "The user reports twenty seats.", basis_refs: ["user-initial"], resolution: { answer_refs: ["user-initial"], remaining: [] } },
    { question_id: "question-pooling", origin: "consultant", statement: "Can unused seats be pooled?", status: "open",
      basis_refs: ["user-initial"], resolution: { answer_refs: [], remaining: ["Whether unused seats can be pooled."] } }],
    user_context: [{ context_id: "preference-brief", kind: "communication", statement: "Keep replies brief.", status: "current", basis_refs: ["user-initial"] }],
    case_brief: { knowledge_refs: ["user-initial"], work_refs: [] }
  } }, "event-initial");
  f.exchange(root, it, "initial", f.emptyResponse("The user reports twenty seats; pooling is unknown."));
  return root;
}
function interpretation(suffix, ref) {
  return { interpretation_id: "interpretation-" + suffix, turn_id: "turn-" + suffix, incoming_refs: [ref],
    components: [{ kind: "information", meaning: "Reconcile the attributed user account.", established: [], unresolved: [] }], basis_refs: [], next_action: action };
}
const question = root => f.state(root).questions.find(q => q.question_id === "question-capacity");
const read = root => store.context(root, { mode: "brief" }).brief;
const warnings = brief => brief.coverage.case.warnings.filter(w => w.code === "answer_support_replaced");
function correct(root, suffix, words, status, answers, remaining) {
  f.record(root, "correction", { corrects_refs: ["question-capacity"], reason: words, changes: {
    evidence: [source("user-" + suffix, words)],
    questions: [{ ...question(root), status, reason: words, resolution: { answer_refs: answers, remaining } }]
  } }, "event-correction-" + suffix);
  const it = interpretation(suffix, "user-" + suffix);
  f.record(root, "reply_interpreted", { protocol: PROTOCOL, interpretation: it }, "event-in-" + suffix);
  f.exchange(root, it, suffix, f.emptyResponse(words));
}

test("scoped correction surfaces current answer before the retained mixed source without mutating it", t => {
  const root = project(t), original = f.state(root).evidence[0], preference = f.state(root).user_context[0];
  correct(root, "seventeen", "My earlier North count was wrong: seventeen, not twenty. Pooling is still unknown.", "answered", ["user-seventeen"], []);
  const beforeRead = ["journal.jsonl", "project.yaml", "case-brief.md"].map(file => fs.readFileSync(path.join(root, file)));
  const brief = read(root), notices = warnings(brief);
  assert.equal(notices.length, 1);
  assert.equal(notices[0].record_ref, "user-initial");
  assert.deepEqual(notices[0].retrieval.context.focus_refs, ["question-capacity"]);
  assert.ok(notices[0].related_refs.includes("user-seventeen"));
  const questionPosition = brief.markdown.indexOf("### Question (question-capacity)");
  const correctedPosition = brief.markdown.indexOf("### evidence (user-seventeen)");
  const oldPosition = brief.markdown.indexOf("### evidence (user-initial)");
  assert.ok(questionPosition >= 0 && questionPosition < correctedPosition && correctedPosition < oldPosition);
  assert.equal(brief.markdown.split("### Question (question-capacity)").length - 1, 1);
  assert.ok(brief.coverage.case.knowledge.included_refs.includes("user-seventeen"));
  assert.deepEqual(f.state(root).evidence.find(item => item.evidence_id === "user-initial"), original);
  assert.deepEqual(f.state(root).user_context[0], preference);
  assert.equal(f.state(root).questions.find(q => q.question_id === "question-pooling").status, "open");
  ["journal.jsonl", "project.yaml", "case-brief.md"].forEach((file, i) => assert.deepEqual(fs.readFileSync(path.join(root, file)), beforeRead[i]));
});

test("withdrawn certainty shows the open remainder without inventing a replacement answer", t => {
  const root = project(t);
  correct(root, "unknown", "The twenty-seat count was for another site. I do not know North's capacity.", "open", [], ["North's actual capacity."]);
  const brief = read(root);
  assert.equal(warnings(brief).length, 1);
  assert.deepEqual(question(root).resolution, { answer_refs: [], remaining: ["North's actual capacity."] });
  assert.match(brief.markdown, /North's actual capacity/);
  assert.equal(question(root).status, "open");
});

test("restored support removes its obsolete warning while retaining the later correction history", t => {
  const root = project(t);
  correct(root, "seventeen", "Correction: seventeen North seats.", "answered", ["user-seventeen"], []);
  assert.equal(warnings(read(root)).length, 1);
  correct(root, "restored", "I checked the original North notice. The initial twenty-seat account was correct.", "answered", ["user-initial", "user-restored"], []);
  assert.ok(!warnings(read(root)).some(w => w.record_ref === "user-initial"));
  assert.ok(f.state(root).evidence.some(item => item.evidence_id === "user-seventeen"));
});

test("additional corroboration does not label the retained original answer as replaced", t => {
  const root = project(t), it = interpretation("confirmed", "user-confirmed");
  f.record(root, "reply_interpreted", { protocol: PROTOCOL, interpretation: it, changes: {
    evidence: [source("user-confirmed", "The current notice also says twenty seats at North.")],
    questions: [{ ...question(root), resolution: { answer_refs: ["user-initial", "user-confirmed"], remaining: [] } }]
  } }, "event-confirmed");
  assert.deepEqual(warnings(read(root)), []);
});

test("unselected unrelated corrected history does not expand into the brief", t => {
  const root = project(t);
  // These are imported historical excerpts, not fresh primary intake messages.
  f.record(root, "memory_updated", { changes: { evidence: [f.statement("user-old-site", "The old study had ten schools.")],
    questions: [{ question_id: "question-old-site", origin: "consultant", statement: "How many schools were in the old study?", status: "open",
      resolution: { answer_refs: [], remaining: ["The number of schools."] } }] } }, "event-old-site");
  f.record(root, "correction", { corrects_refs: ["question-old-site"], reason: "Recover the historical answer.", changes: {
    questions: [{ question_id: "question-old-site", origin: "consultant", statement: "How many schools were in the old study?", status: "answered", reason: "Historical source says ten.",
      resolution: { answer_refs: ["user-old-site"], remaining: [] } }]
  } }, "event-old-answer");
  f.record(root, "correction", { corrects_refs: ["question-old-site"], reason: "The old study count was corrected.", changes: {
    evidence: [f.statement("user-old-site-corrected", "The old study actually had eleven schools.")],
    questions: [{ ...f.state(root).questions.find(q => q.question_id === "question-old-site"), reason: "Historical corrected count.",
      resolution: { answer_refs: ["user-old-site-corrected"], remaining: [] } }]
  } }, "event-old-correction");
  const brief = read(root);
  assert.deepEqual(warnings(brief), []);
  assert.ok(!brief.coverage.case.knowledge.included_refs.includes("user-old-site"));
  assert.ok(!brief.coverage.case.knowledge.included_refs.includes("user-old-site-corrected"));
  assert.doesNotMatch(brief.markdown, /### Question \(question-old-site\)/);
});
