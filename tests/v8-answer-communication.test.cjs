"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/v8/store.cjs");
const views = require("../scripts/lib/v8/views.cjs");
const QUESTION = "Did the rollout improve village living standards and household consumption?";
const PARTIAL = "Village measurements showed no detectable change. Household consumption remains unknown, and a moderate improvement remains possible.";
const disposition = { open: "pending", answered: "answered", retired: "withdrawn" };

function project(t, options = {}) {
  const base = fs.realpathSync.native(os.tmpdir());
  const root = fs.mkdtempSync(path.join(base, "cc-v8-answer-"));
  t.after(() => {
    const resolved = fs.realpathSync.native(root);
    assert.equal(path.dirname(resolved), base);
    assert.ok(path.basename(resolved).startsWith("cc-v8-answer-"));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  store.init(root, { case: "answer-communication" });
  const requests = [];
  const save = (op, content) => {
    const request = { at: store.token(store.read(root)), op, ...content };
    requests.push(request);
    store.submit(root, request);
    return store.read(root).state.state_meta.last_event_id;
  };
  const user = save("user_message", { text: options.userText || QUESTION,
    source: "synthetic:user-1", complete: true });
  const status = options.canonical || "open";
  const handling = save("knowledge", { user_message: user, updates: [{ as: "question", kind: "question",
    origin: "user", statement: QUESTION, status, reason: status === "open" ? "Household consumption remains unknown."
      : "The supplied source or explicit withdrawal establishes this disposition.", basis_refs: [user] }],
    selection: { knowledge_refs: ["@question"], work_refs: [] },
    next_action: { kind: "lead_only", reason: "Explain the source boundary." } });
  const prepare = (respondsTo, answerStatus = "pending", answer = PARTIAL, basis = user) =>
    save("reply_prepared", { responds_to: respondsTo, response: { user_questions: [{ question_ref: "q1",
      status: answerStatus, answer, basis_refs: [basis] }] } });
  const prepared = options.noPrepared ? undefined : prepare(handling, disposition[status]);
  const before = save("user_message", { text: options.nextText || "Continue with the relevant next step.",
    source: "synthetic:user-2", complete: true });
  const record = (draft, anchor, items, locator = "synthetic:assistant-1") => save("reply_recorded", {
    ...(draft ? { prepared: draft } : {}), before_user: anchor,
    source: { kind: "assistant_recorded", locator }, items });
  const actual = options.deferActual ? undefined : record(prepared, before, options.items || [{ kind: "answer",
    label: "A1", text: PARTIAL, question_ref: "q1", answer_status: options.actual || disposition[status] }]);
  return { root, save, requests, user, handling, prepared, before, actual, prepare, record };
}
const brief = f => views.build(store.read(f.root));
const question = view => view.sections.flatMap(section => section.items)
  .find(item => item.kind === "question" && item.ref.startsWith("q1@") && !item.current_ref);
const communication = f => question(brief(f)).communication;
const journal = f => fs.readFileSync(path.join(f.root, "journal.jsonl"));

test("current mapped pending answer stays visible with its open remainder", t => {
  const f = project(t), loaded = store.read(f.root), before = journal(f);
  const view = views.build(loaded), item = question(view);
  assert.equal(item.status, "open");
  assert.equal(item.reason, "Household consumption remains unknown.");
  assert.equal(item.communication.status, "pending");
  assert.equal(item.communication.answered_question_ref, "q1@e2");
  assert.ok(view.sections.find(section => section.id === "questions").items.includes(item));
  const focused = views.context(loaded, { mode: "focused", focus_refs: ["q1"] });
  assert.match(JSON.stringify(focused), /"communication":\{[^}]*"status":"pending"/);
  assert.deepEqual(journal(f), before);
  assert.deepEqual(store.read(f.root).state, loaded.state);
});

for (const [name, options] of [
  ["without a prepared draft", { noPrepared: true }],
  ["using the retained status alias", { items: [{ kind: "answer", text: PARTIAL, question_ref: "q1", status: "pending" }] }]
]) test("pending actual answer is recognized " + name, t => {
  const f = project(t, options);
  assert.equal(communication(f).status, "pending");
  assert.equal(question(brief(f)).status, "open");
});

for (const [name, options] of [
  ["missing question mapping", { items: [{ kind: "answer", text: PARTIAL, answer_status: "pending" }] }],
  ["missing disposition", { items: [{ kind: "answer", text: PARTIAL, question_ref: "q1" }] }],
  ["duplicate question mappings", { items: [
    { kind: "answer", text: PARTIAL, question_ref: "q1", answer_status: "pending" },
    { kind: "answer", text: "Consumption is unknown.", question_ref: "q1", answer_status: "pending" }] }],
  ["pending against an answered question", { canonical: "answered", actual: "pending" }],
  ["pending against a retired question", { canonical: "retired", actual: "pending" }],
  ["withdrawn against an open question", { actual: "withdrawn" }],
  ["answered against an open question", { actual: "answered" }],
  ["answered against a retired question", { canonical: "retired", actual: "answered" }],
  ["withdrawn against an answered question", { canonical: "answered", actual: "withdrawn" }]
]) test(name + " still needs reconciliation", t => {
  assert.equal(communication(project(t, options)).status, "needs_reconciliation");
});

for (const delayed of [false, true]) test("sourced question correction leaves " +
  (delayed ? "a delayed" : "an existing") + " old answer unconfirmed", t => {
  const correctedQuestion = "Did household consumption improve separately from village measures?";
  const f = project(t, { userText: correctedQuestion, deferActual: delayed,
    nextText: "My original question was about consumption separately. Please correct the combined question record." });
  const handling = f.save("knowledge", { user_message: f.before,
    next_action: { kind: "lead_only", reason: "Correct the question against its retained source." } });
  const correction = f.save("correction", { responds_to: handling, corrects_refs: ["q1"],
    reason: "The combined question record did not preserve the original consumption request.",
    updates: [{ entity: "q1", kind: "question", origin: "user", statement: correctedQuestion,
      status: "open", reason: "Consumption measurements are unavailable.", basis_refs: [f.user, f.before] }] });
  if (delayed) f.record(f.prepared, f.before, [{ kind: "answer", text: PARTIAL,
    question_ref: "q1", answer_status: "pending" }]);
  const item = question(brief(f));
  assert.equal(item.ref, "q1@" + correction);
  assert.equal(item.status, "open");
  assert.equal(item.communication.status, "unconfirmed");
  assert.equal(item.communication.answered_question_ref, "q1@e2");
});

for (const [status, answerStatus, text] of [
  ["answered", "answered", "Both measurements showed no detectable improvement."],
  ["retired", "withdrawn", "Your consumption question is withdrawn."]
]) test("pending becomes " + answerStatus + " only after the new actual reply is recorded", t => {
  const f = project(t, { nextText: status === "answered"
    ? "The additional source says both measurements showed no detectable improvement. Please answer on that basis."
    : "Please withdraw my consumption question. I do not need an answer now." });
  assert.equal(communication(f).status, "pending");
  const handling = f.save("knowledge", { user_message: f.before, updates: [{ entity: "q1", kind: "question",
    origin: "user", statement: QUESTION, status, reason: status === "answered"
      ? "The additional source supports the bounded answer." : "The user explicitly withdrew this question.",
    basis_refs: [f.user, f.before] }] });
  assert.equal(communication(f).status, "unconfirmed");
  const prepared = f.prepare(handling, answerStatus, text, f.before);
  assert.equal(communication(f).status, "unconfirmed");
  const before = f.save("user_message", { text: "Thank you.", source: "synthetic:user-3", complete: true });
  f.record(prepared, before, [{ kind: "answer", text, question_ref: "q1", answer_status: answerStatus }], "synthetic:assistant-2");
  assert.equal(communication(f).status, answerStatus);
  assert.equal(store.read(f.root).state.questions[0].status, status);
  assert.equal(store.read(f.root).entries.find(entry => entry.id === f.actual).data.items[0].answer_status, "pending");
});

test("new unrecorded draft retains earlier actual pending answer separately", t => {
  const f = project(t);
  const handling = f.save("knowledge", { user_message: f.before,
    next_action: { kind: "lead_only", reason: "Explain the unresolved source boundary." } });
  f.prepare(handling);
  const current = communication(f);
  assert.equal(current.status, "unconfirmed");
  assert.equal(current.previous_actual.status, "pending");
  assert.equal(current.previous_actual.recorded_answer_status, "pending");
});

test("an older question can be answered under current handling without repeating a delivered answer", t => {
  const f = project(t, { noPrepared: true, canonical: "answered", actual: "answered",
    userText: QUESTION + " Does clustering change the uncertainty calculation?" });
  const oldHandling = f.save("knowledge", { user_message: f.user, updates: [{ kind: "question", origin: "user",
    statement: "Does clustering change the uncertainty calculation?", status: "open", basis_refs: [f.user] }],
    next_action: { kind: "lead_only", reason: "Retain the second question." } });
  const current = f.save("knowledge", { user_message: f.before,
    next_action: { kind: "lead_only", reason: "Answer the retained question." } });
  const answer = { updates: [{ entity: "q2", kind: "question", origin: "user",
    statement: "Does clustering change the uncertainty calculation?", status: "answered",
    reason: "The conceptual answer is provided.", basis_refs: [f.user] }],
    response: { user_questions: [{ question_ref: "q2", status: "answered",
      answer: "Dependence within clusters affects uncertainty calculations.", basis_refs: [f.user] }] } };
  f.save("reply_prepared", { responds_to: current, ...answer });
  assert.equal(communication(f).status, "answered");
  const before = journal(f);
  assert.throws(() => f.save("reply_prepared", { responds_to: [oldHandling, current], ...answer }), { code: "UNANSWERED_USER_QUESTION" });
  assert.deepEqual(journal(f), before);
});

test("an erroneous actual answered disposition does not settle an open question or revive a retired one", t => {
  const f = project(t, { actual: "answered" });
  assert.match(communication(f).reason, /Inspect the actual words/);
  const handling = f.save("knowledge", { user_message: f.before,
    next_action: { kind: "lead_only", reason: "Explain the remainder." } });
  f.prepare(handling);
  assert.equal(communication(f).status, "unconfirmed");
  assert.equal(communication(f).previous_actual.status, "needs_reconciliation");
  assert.equal(question(brief(f)).status, "open");
  const retired = project(t, { canonical: "retired", actual: "answered" });
  retired.save("knowledge", { user_message: retired.before, selection: { knowledge_refs: [], work_refs: [] } });
  assert.equal(store.read(retired.root).state.questions[0].status, "retired");
  assert.equal(brief(retired).sections.flatMap(section => section.items).some(item => item.kind === "question"), false);
});

test("fresh and recovered nested display agree while actual item order and history stay intact", t => {
  const f = project(t, { items: [
    { kind: "other", label: "A2", text: "Second point first." },
    { kind: "answer", label: "A1", text: PARTIAL, question_ref: "q1", answer_status: "pending" }
  ] });
  const loaded = store.read(f.root), before = journal(f);
  const shuffled = structuredClone(loaded);
  const reverseKeys = value => Array.isArray(value) ? value.map(reverseKeys)
    : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).reverse().map(([key, item]) => [key, reverseKeys(item)])) : value;
  shuffled.state = reverseKeys(shuffled.state);
  const original = views.build(loaded).markdown;
  assert.equal(views.build(shuffled).markdown, original);
  store.recover(f.root);
  assert.equal(fs.readFileSync(path.join(f.root, "case-brief.md"), "utf8"), original);
  assert.deepEqual(store.read(f.root).entries.find(entry => entry.id === f.actual).data.items.map(item => item.label), ["A2", "A1"]);
  assert.deepEqual(journal(f), before);
});

test("exact retry and export recovery preserve pending state and journal bytes", t => {
  const f = project(t), before = journal(f), state = store.read(f.root).state;
  assert.equal(store.submit(f.root, f.requests.at(-1)).replayed, true);
  assert.deepEqual(journal(f), before);
  fs.unlinkSync(path.join(f.root, "case-brief.md"));
  store.recover(f.root);
  const generated = fs.readFileSync(path.join(f.root, "case-brief.md"), "utf8");
  assert.equal(generated, brief(f).markdown);
  assert.equal(communication(f).status, "pending");
  store.recover(f.root);
  assert.equal(fs.readFileSync(path.join(f.root, "case-brief.md"), "utf8"), generated);
  assert.deepEqual(store.read(f.root).state, state);
  assert.deepEqual(journal(f), before);
});
