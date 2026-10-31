"use strict";
// Synthetic saved records and messages; no live consultation or scientific computation.
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/v8/store.cjs"), records = require("../scripts/lib/v8/records.cjs");
const views = require("../scripts/lib/v8/views.cjs");
const { canonical, sha256 } = require("../scripts/lib/files.cjs");
const CATEGORIES = ["study_goal", "design_comparison", "data_collection", "measurement_quality", "data_processing",
  "analysis_modeling", "precision_feasibility", "interpretation_alternatives", "others"];
const QUESTION = "What do the supplied outcome measurements establish?";
const ANSWER = "The synthetic measurements support the stated bounded description.";

function project(t) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-v8-category-"));
  t.after(() => {
    const resolved = fs.realpathSync.native(root);
    assert.equal(path.dirname(resolved), base);
    assert.ok(path.basename(resolved).startsWith("cc-v8-category-"));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  store.init(root, { case: "question-categories" });
  const load = () => store.read(root), requests = [];
  const save = (op, content) => {
    const request = { at: store.token(load()), op, ...content };
    requests.push(request);
    return store.submit(root, request);
  };
  const user = text => save("user_message", { text, source: "synthetic:user", complete: true }).entry_ref;
  return { root, load, save, user, requests };
}
const journal = f => fs.readFileSync(path.join(f.root, "journal.jsonl"));
const snapshot = f => Object.fromEntries(["journal.jsonl", "project.yaml", "case-brief.md"]
  .map(name => [name, fs.readFileSync(path.join(f.root, name))]));
const briefQuestion = (f, ref = "q1") => views.build(f.load()).sections.flatMap(section => section.items)
  .find(item => item.kind === "question" && item.ref.startsWith(ref + "@") && !item.current_ref);
const communication = f => briefQuestion(f).communication;
function replacement(f, overrides = {}, ref = "q1") {
  const { question_id, ...body } = f.load().state.questions.find(item => item.question_id === ref);
  return { entity: question_id, kind: "question", ...body, ...overrides };
}
function replace(f, overrides, extra = {}) {
  return f.save("knowledge", { updates: [replacement(f, overrides)], ...extra }).entry_ref;
}
function answeredProject(t, options = {}) {
  const f = project(t), user = f.user(QUESTION);
  const handling = f.save("knowledge", { user_message: user, updates: [
    { as: "source", kind: "evidence", evidence_kind: "user_statement", source_ref: user, summary: "Synthetic outcome source." },
    { as: "question", kind: "question", origin: "user", category: "study_goal", statement: QUESTION,
      status: options.pending ? "open" : "answered", reason: options.pending ? "An outcome remains unknown." : "The bounded answer has support.",
      basis_refs: [user, "@source"] }
  ], selection: { knowledge_refs: ["@question"], work_refs: [] },
  next_action: { kind: "lead_only", reason: "Explain the supported description." } }).entry_ref;
  const status = options.pending ? "pending" : "answered";
  const prepare = (respondsTo, overrides = {}) => f.save("reply_prepared", { responds_to: respondsTo,
    response: { user_questions: [{ question_ref: "q1", status, answer: ANSWER, basis_refs: ["f1@" + handling], ...overrides }] } }).entry_ref;
  const prepared = prepare(handling), before = f.user("Continue with the relevant next step.");
  const actual = f.save("reply_recorded", { prepared, before_user: before,
    source: { kind: "assistant_recorded", locator: "synthetic:assistant-1" }, items: [{ kind: "answer", text: ANSWER,
      question_ref: options.exact ? "q1@" + handling : "q1", answer_status: status }] }).entry_ref;
  const nextHandling = () => f.save("knowledge", { user_message: before,
    next_action: { kind: "lead_only", reason: "Continue the explanation." } }).entry_ref;
  return { ...f, handling, userRef: user, prepared, actual, before, prepare, nextHandling };
}
// Write an integrity-checked pre-category entry without passing through fresh authoring.
function historicalQuestion(f, origin, category) {
  const user = f.user(QUESTION), loaded = f.load();
  const update = { entity: "q1", kind: "question", origin, statement: QUESTION, status: "open", basis_refs: [user] };
  if (category !== undefined) update.category = category;
  const request = { at: store.token(loaded), op: "knowledge", user_message: user, updates: [update],
    selection: { knowledge_refs: ["q1"], work_refs: [] } };
  const { at, op, ...data } = request;
  const entry = { id: "e2", recorded_at: "2026-10-28T00:00:00.000Z", type: op, data,
    _meta: { request_hash: sha256(canonical(request)), previous_hash: loaded.entries.at(-1)._meta.integrity_hash } };
  entry._meta.integrity_hash = sha256(canonical(entry));
  fs.appendFileSync(path.join(f.root, "journal.jsonl"), canonical(entry) + "\n");
  return request;
}

for (const origin of ["consultant", "user"]) test("all categories persist in current, exact, focused and brief views for " + origin, t => {
  const f = project(t), user = f.user(QUESTION);
  const receipt = f.save("knowledge", { user_message: user, updates: CATEGORIES.map((category, index) => ({
    as: "question-" + index, kind: "question", origin, category, statement: QUESTION + " Purpose " + index + ".",
    status: "open", basis_refs: [user]
  })) });
  const loaded = f.load(), saved = JSON.parse(fs.readFileSync(path.join(f.root, "project.yaml"), "utf8"));
  assert.deepEqual(loaded.state.questions.map(item => item.category), CATEGORIES);
  assert.deepEqual(saved.questions, loaded.state.questions);
  const refs = loaded.state.questions.map(item => item.question_id + "@" + receipt.entry_ref);
  for (const request of [{ mode: "record", refs }, { mode: "focused", focus_refs: refs }]) {
    assert.deepEqual(views.context(loaded, request).records.filter(item => item.kind === "question")
      .map(item => item.body.category), CATEGORIES);
  }
  assert.deepEqual(views.build(loaded).sections.flatMap(section => section.items).filter(item => item.kind === "question")
    .map(item => item.category), CATEGORIES);
  assert.match(fs.readFileSync(path.join(f.root, "case-brief.md"), "utf8"), /Category: others/);
  const corrected = replace(f, { category: "others" });
  assert.equal(briefQuestion(f).category, "others");
  const versions = views.context(f.load(), { mode: "record", refs: [refs[0], "q1@" + corrected] }).records;
  assert.deepEqual(versions.map(item => item.body.category), ["study_goal", "others"]);
});

for (const origin of ["consultant", "user"]) test("missing and invalid fresh categories reject creation and replacement for " + origin, t => {
  const f = project(t), user = f.user(QUESTION);
  f.save("knowledge", { user_message: user, updates: [{ kind: "question", origin, category: "study_goal",
    statement: QUESTION, status: "open", basis_refs: [user] }] });
  const invalid = [undefined, "", " ", "unknown", null, 1, false, [], ["study_goal"], { category: "study_goal" }];
  for (const replacing of [false, true]) for (const category of invalid) {
    const update = replacing ? replacement(f, { reason: "A newly saved detail." })
      : { kind: "question", origin, statement: QUESTION, status: "open", basis_refs: [user] };
    if (category === undefined) delete update.category; else update.category = category;
    const before = snapshot(f), state = f.load().state;
    assert.throws(() => f.save("knowledge", { updates: [update] }), { code: "INVALID_INPUT" });
    assert.deepEqual(snapshot(f), before);
    assert.deepEqual(f.load().state, state);
  }
});

test("an implicit consultant origin still requires an explicit category", t => {
  const f = project(t), before = snapshot(f);
  assert.throws(() => f.save("knowledge", { updates: [{ kind: "question", statement: QUESTION, status: "open" }] }), { code: "INVALID_INPUT" });
  assert.deepEqual(snapshot(f), before);
  f.save("knowledge", { updates: [{ kind: "question", category: "others", statement: QUESTION, status: "open" }] });
  assert.equal(f.load().state.questions[0].category, "others");
});

for (const origin of ["consultant", "user"]) test("uncategorized historical " + origin + " questions remain readable, retryable and unchanged on no-op", t => {
  const f = project(t), request = historicalQuestion(f, origin), before = journal(f);
  assert.equal(Object.hasOwn(f.load().state.questions[0], "category"), false);
  assert.equal(Object.hasOwn(briefQuestion(f), "category"), false);
  assert.equal(store.submit(f.root, request).replayed, true);
  assert.equal(f.load().projection_current, true);
  const unchanged = replacement(f);
  assert.equal(f.save("knowledge", { updates: [unchanged] }).no_op, true);
  assert.deepEqual(journal(f), before);
  assert.throws(() => replace(f, { reason: "A changed legacy record must be classified." }), { code: "INVALID_INPUT" });
  assert.deepEqual(journal(f), before);
  const adopted = replace(f, { category: "measurement_quality" });
  assert.equal(briefQuestion(f).category, "measurement_quality");
  assert.equal(Object.hasOwn(records.resolve(f.load(), "q1@e2").body, "category"), false);
  assert.equal(records.resolve(f.load(), "q1@" + adopted).body.category, "measurement_quality");
  assert.deepEqual(journal(f).subarray(0, before.length), before);
});

test("historical replay validates a category whenever one is present", t => {
  const f = project(t);
  historicalQuestion(f, "consultant", "not_a_category");
  assert.throws(() => f.load(), { code: "CORRUPT_STATE" });
});

for (const exact of [false, true]) test("category-only chains retain an actual answer and its exact historical mapping" + (exact ? " from an exact reference" : ""), t => {
  const f = answeredProject(t, { exact }), original = f.load().entries.find(entry => entry.id === f.actual);
  replace(f, { category: "measurement_quality" });
  replace(f, { category: "others" });
  replace(f, { category: "study_goal" });
  const current = communication(f);
  assert.equal(current.status, "answered");
  assert.equal(current.answered_question_ref, "q1@" + f.handling);
  assert.deepEqual(current.actual_refs, [f.actual]);
  assert.equal(current.reply_ref, f.prepared);
  assert.deepEqual(f.load().entries.find(entry => entry.id === f.actual), original);
});

test("category metadata preserves a pending actual answer without settling its remainder", t => {
  const f = answeredProject(t, { pending: true });
  replace(f, { category: "measurement_quality" });
  assert.equal(communication(f).status, "pending");
  assert.equal(briefQuestion(f).status, "open");
  assert.equal(briefQuestion(f).reason, "An outcome remains unknown.");
});

test("category-only changes preserve an earlier communicated answer across later unchanged drafts", t => {
  const f = answeredProject(t), source = "f1@" + f.handling;
  replace(f, { category: "measurement_quality" });
  const handling = f.nextHandling(), draft1 = f.prepare(handling);
  replace(f, { category: "others" });
  const draft2 = f.prepare(handling);
  const current = communication(f);
  assert.equal(current.status, "answered");
  assert.equal(current.answered_question_ref, "q1@" + f.handling);
  assert.equal(current.latest_prepared_reply, draft2);
  assert.equal(current.latest_reply_status, "unconfirmed");
  assert.deepEqual(current.actual_refs, [f.actual]);
  assert.deepEqual(f.load().entries.filter(entry => [f.prepared, draft1, draft2].includes(entry.id))
    .map(entry => entry.data.response.user_questions[0].basis_refs), [[source], [source], [source]]);
});

for (const change of ["reason", "source", "source_binding", "status", "statement"]) test(change + " change followed by reversion cannot become a category-only chain", t => {
  const f = answeredProject(t), original = replacement(f);
  if (change === "reason") replace(f, { reason: "A consequential qualification changed." });
  if (change === "source") replace(f, { basis_refs: [...original.basis_refs, f.before] });
  if (change === "source_binding") {
    f.save("knowledge", { updates: [{ entity: "f1", kind: "evidence", evidence_kind: "user_statement",
      source_ref: f.userRef, summary: "A changed synthetic source definition." }] });
    replace(f, { category: "measurement_quality" });
    f.save("knowledge", { updates: [{ entity: "f1", kind: "evidence", evidence_kind: "user_statement",
      source_ref: f.userRef, summary: "Synthetic outcome source." }] });
  }
  if (change === "status") replace(f, { status: "open" });
  if (change === "statement") f.save("correction", { reason: "Correct a synthetic recording error.", corrects_refs: ["q1"],
    updates: [replacement(f, { statement: "What do the separate outcome measurements establish?" })] });
  if (change === "statement") f.save("correction", { reason: "Restore the original question against its retained source.", corrects_refs: ["q1"],
    updates: [{ ...original, category: "measurement_quality" }] });
  else f.save("knowledge", { updates: [{ ...original, category: "measurement_quality" }] });
  assert.equal(communication(f).status, "unconfirmed");
  const prepared = f.prepare(f.nextHandling());
  const current = communication(f);
  assert.equal(current.status, "unconfirmed");
  assert.equal(current.reply_ref, prepared);
  assert.equal(current.previous_actual.status, "unconfirmed");
  assert.equal(current.previous_actual.answered_question_ref, "q1@" + f.handling);
});

for (const change of ["answer", "basis", "correction"]) test("a later " + change + " change still requires communication reconciliation", t => {
  const f = answeredProject(t), handling = f.nextHandling();
  replace(f, { category: "measurement_quality" });
  const overrides = change === "answer" ? { answer: "A materially revised answer." }
    : change === "basis" ? { basis_refs: [f.before] } : {};
  if (change === "correction") f.save("correction", { reason: "Flag the previous answer mapping for reconciliation.", corrects_refs: [f.actual] });
  f.prepare(handling, overrides);
  const current = communication(f);
  assert.equal(current.status, "unconfirmed");
  assert.equal(current.previous_actual.status, "answered");
});
