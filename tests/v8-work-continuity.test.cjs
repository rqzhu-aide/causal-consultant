"use strict";
// Synthetic persisted work and messages; no scientific computation or live host.
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/v8/store.cjs"), views = require("../scripts/lib/v8/views.cjs");
const workflow = require("../scripts/lib/v8/workflow.cjs");
const assignment = { specialist_id: "design_worker", operation: "execution", design_id: "descriptive_association" };
function project(t, options = {}) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-v8-work-"));
  t.after(() => {
    const resolved = fs.realpathSync.native(root);
    assert.equal(path.dirname(resolved), base);
    assert.ok(path.basename(resolved).startsWith("cc-v8-work-"));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  store.init(root, { case: "work-continuity" });
  const load = () => store.read(root);
  const save = (op, content) => store.submit(root, { at: store.token(load()), op, ...content });
  const user = text => save("user_message", { text, source: "synthetic:user", complete: true }).entry_ref;
  const first = user("Describe the supplied rows, preserving the unresolved outcome definition.");
  fs.writeFileSync(path.join(root, "source.csv"), "x,y\n0,1\n1,2\n");
  const initial = save("knowledge", { user_message: first, updates: [
    { kind: "scientific_decision", decision_kind: "target", statement: "Describe the synthetic contrast.", status: "current", basis_refs: [first] },
    { kind: "evidence", evidence_kind: "file", source_ref: "source.csv", summary: "Two synthetic rows.", limitations: ["No estimation is performed."] },
    { kind: "question", origin: "consultant", statement: "How was the outcome defined?", status: "open", basis_refs: [first] }
  ], selection: { knowledge_refs: [], work_refs: [] }, next_action: { kind: "lead_only", reason: "Offer the bounded work." } }).entry_ref;
  const scope = save("scope", { action: "analysis", assignment,
    terms: { target: "Synthetic contrast.", population: "Two rows.", evidence: "source.csv.", approach: "Description.", checks: [], outputs: "Notes.", claim_boundary: "No causal claim." },
    execution: { inputs: [{ source_ref: "f1", path: "source.csv" }], treatment: "x=1", comparator: "x=0", outcome: "y", timing: "synthetic", estimand: "Difference", design_id: "descriptive_association", exclusions: [] }, basis_refs: ["d1", "f1"] }).entry_ref;
  const offer = save("reply_prepared", { responds_to: initial, response: { next_steps: [{ kind: "action", actor: "consultant", label: "Describe rows", scope: "Proceed.", scope_ref: scope }] } });
  const acceptedUser = user("Yes to N1. Continue.");
  const additionalUser = options.multipleSources ? user("Keep the original descriptive limit.") : null;
  const actual = save("reply_recorded", { prepared: offer.entry_ref, before_user: acceptedUser,
    source: { kind: "assistant_recorded", locator: "synthetic:offer" }, items: [{ kind: "option", label: "N1",
      text: offer.response_markdown.split("[N1] ")[1].trim(), scope_ref: scope }] }).entry_ref;
  const action = decision => ({ kind: "specialist", assignment, scope_ref: scope, decision, reason: "Continue accepted work." });
  const handling = save("decision", { user_message: additionalUser ? [acceptedUser, additionalUser] : acceptedUser,
    actual_reply: actual, item: "N1", scope, choice: "accept", next_action: action("@entry") }).entry_ref;
  const run = save("start-run", { responds_to: handling, scope, decision: handling }).entry_ref;
  save("write-run-file", { run, path: "notes.txt", content: "Synthetic output; no estimation.\n" });
  save("write-run-file", { run, path: "config.txt", content: "Synthetic configuration.\n" });
  const before = user("Continue this work after the interruption.");
  const resume = save("knowledge", { user_message: before, next_action: action(handling) }).entry_ref;
  const reviewHandling = options.alias || additionalUser ? save("knowledge", {
    user_message: additionalUser || acceptedUser, next_action: action(handling) }).entry_ref : handling;
  const finish = () => save("finalize-run", { run, code_paths: ["config.txt"], output_paths: ["notes.txt"], diagnostic_paths: [], environment: { node: process.version }, deviations: [] }).entry_ref;
  const review = (respondsTo = handling, workRefs = [run], assigned = assignment) => save("review", { responds_to: respondsTo, assignment: assigned,
    summary: "Synthetic assessment.", question_addressed: "What does the recorded work establish?", work_performed: ["Read synthetic output."],
    findings: ["The output is retained."], limitations: ["No scientific computation."], ...(workRefs.length ? { work_refs: workRefs } : {}) }).entry_ref;
  const prepare = (workRefs, respondsTo = resume) => save("reply_prepared", { responds_to: respondsTo, next_action: { kind: "wait", reason: "Return control." },
    response: { findings: { summary: "Synthetic findings.", diagnostics: [], limitations: ["No causal claim."], work_refs: workRefs } } }).entry_ref;
  const record = (refs, draft, anchor, extra = {}) => save("reply_recorded", { ...(draft ? { prepared: draft } : {}), ...(anchor ? { before_user: anchor } : {}),
    source: { kind: "assistant_recorded", locator: "synthetic:actual-findings" }, items: [{ kind: "findings", text: "The qualified findings.", work_refs: refs }], ...extra }).entry_ref;
  const f = { root, load, save, user, action, initial, scope, handling, run, before, resume, finish, review, prepare, record };
  if (options.interim) f.assessment = review(reviewHandling);
  if (options.complete !== false) f.completed = finish();
  if (options.review !== false && !options.interim) f.assessment = review(reviewHandling);
  if (options.prepare !== false) f.prepared = prepare([run]);
  return f;
}
const items = f => views.build(f.load()).sections.flatMap(section => section.items);
const marker = (f, ref = f.handling) => items(f).find(item => item.kind === "unfinished_handling" && item.ref === ref);
const gap = (f, ref = f.prepared) => items(f).find(item => item.kind === "communication_gap" && item.prepared_ref === ref);
function newReview(f) {
  const user = f.user("Assess a newly noticed limitation.");
  const handling = f.save("knowledge", { user_message: user, next_action: { kind: "specialist", assignment, reason: "Assess the new limitation." } }).entry_ref;
  const review = f.review(handling), before = f.user("Resume explanation.");
  const resume = f.save("knowledge", { user_message: before, next_action: { kind: "lead_only", reason: "Explain." } }).entry_ref;
  return { handling, review, before, resume };
}

for (const alias of [false, true]) test("resumed completed run covers its original assessment" + (alias ? " through a handling alias" : ""), t => {
  const f = project(t, { alias }), before = fs.readFileSync(path.join(f.root, "journal.jsonl")), state = f.load().state;
  assert.equal(marker(f), undefined);
  assert.ok(gap(f));
  assert.ok(items(f).some(item => item.kind === "question" && item.status === "open"));
  assert.equal(workflow.permission(f.load(), f.scope).decision_ref, f.handling);
  assert.equal(workflow.latestDirection(f.load()).action.kind, "wait");
  assert.deepEqual(f.load().state, state);
  assert.deepEqual(fs.readFileSync(path.join(f.root, "journal.jsonl")), before);
});

test("one shared source and equal latest source sequence do not establish original assessment equivalence", t => {
  const f = project(t, { multipleSources: true });
  assert.ok(marker(f));
  assert.match(marker(f).text, /Assessment coverage/);
  assert.ok(marker(f).text.includes(f.assessment));
});

test("later reviews stay distinct, and exact actual mapping needs no new prepared reply", t => {
  const f = project(t), newer = newReview(f);
  f.prepare([f.run], newer.resume);
  assert.ok(marker(f, newer.handling));
  const beforeCount = f.load().state.exchanges.length;
  const recorded = f.record([newer.review], undefined, newer.before);
  assert.equal(marker(f, newer.handling), undefined);
  assert.equal(f.load().state.exchanges.length, beforeCount);
  f.record([f.assessment], undefined, newer.before, { supersedes_recording_ref: recorded });
  assert.ok(marker(f, newer.handling));
});

test("an older prepared anchor cannot import a future review from a later save", t => {
  const f = project(t), newer = newReview(f);
  f.prepare([f.assessment], newer.resume);
  f.record([newer.review], f.prepared, newer.before);
  assert.ok(marker(f, newer.handling));
});

test("exact prepared findings cover a later review without broadening handling", t => {
  const f = project(t), newer = newReview(f);
  f.prepare([newer.review], newer.resume);
  assert.equal(marker(f, newer.handling), undefined);
});

test("precompletion progress cannot cover final findings after another topic", t => {
  const f = project(t);
  f.record([f.run], undefined, f.before);
  const user = f.user("Explain an unrelated concept.");
  const handling = f.save("knowledge", { user_message: user, next_action: { kind: "lead_only", reason: "Explain." } }).entry_ref;
  f.save("reply_prepared", { responds_to: handling, response: { explanations: [{ text: "A conceptual explanation.", basis_refs: [] }] } });
  assert.equal(marker(f), undefined);
  assert.ok(gap(f));
  assert.equal(items(f).some(item => item.kind === "conversation_anchor" && item.prepared_ref === f.prepared), false);
});

test("a returned postcompletion review covers its run and repeated unchanged drafts", t => {
  const f = project(t), before = f.user("Continue discussing the findings.");
  f.record([f.assessment], f.prepared, before);
  const handling = f.save("knowledge", { user_message: before, next_action: { kind: "lead_only", reason: "Discuss." } }).entry_ref;
  const repeated = f.prepare([f.run], handling);
  assert.equal(gap(f), undefined);
  assert.equal(gap(f, repeated), undefined);
});

test("an interim review does not stand in for completed findings or retire implicitly", t => {
  const f = project(t, { interim: true }), before = f.user("Continue.");
  assert.ok(marker(f));
  f.record([f.assessment], f.prepared, before);
  assert.ok(marker(f), "The completed analysis still lacks a postcompletion assessment.");
  assert.ok(gap(f));
});

test("no-output reviews and reviews later than their run findings need exact coverage", t => {
  const f = project(t, { review: false });
  f.assessment = f.review(f.handling, []);
  assert.ok(marker(f));
  const g = project(t, { review: false });
  g.assessment = g.review();
  assert.ok(marker(g));
});

for (const phase of ["started", "failed", "abandoned"]) test(phase + " work remains visible", t => {
  const f = project(t, { complete: false, review: false, prepare: false });
  if (phase !== "started") f.save(phase === "failed" ? "fail-run" : "abandon-run", { run: f.run, reason: "Synthetic interruption." });
  f.save("reply_prepared", { responds_to: f.resume, response: { explanations: [{ text: "Work is " + phase + ".", basis_refs: [] }] } });
  assert.ok(marker(f));
  assert.equal(f.load().state.runs[0].phase, phase);
});

test("multiple assessed runs all need direct closeout, without hiding partially covered work", t => {
  const f = project(t), loaded = f.load();
  // This boundary is a view projection; it does not claim a second authorized run.
  const other = structuredClone(loaded.state.runs[0]);
  other.ref = f.resume; other.run = f.resume;
  loaded.state.runs.push(other);
  const entry = loaded.entries.find(entry => entry.id === other.ref);
  entry.type = "work"; entry.data = { ...structuredClone(loaded.entries.find(entry => entry.id === f.run).data), run: other.ref };
  loaded.state.history_index[other.ref] = { kind: "work", event_ref: other.ref };
  loaded.entries.find(entry => entry.id === f.assessment).data.work_refs.push(other.ref);
  loaded.state.specialist_reviews.find(review => review.ref === f.assessment).work_refs.push(other.ref);
  const projected = { load: () => loaded, handling: f.handling };
  assert.ok(marker(projected));
  loaded.state.exchanges.find(reply => reply.ref === f.prepared).work_refs.push(other.ref);
  assert.equal(marker(projected), undefined);
});

test("changed computed evidence stays distinct while explicit historical versions reuse delivery", t => {
  const f = project(t), before = f.user("Discuss the qualified result.");
  const evidence = { kind: "evidence", evidence_kind: "computed", source_ref: "runs/" + f.run + "/notes.txt", summary: "Original qualified result.", limitations: ["Synthetic only."], run_id: f.run };
  const first = f.save("knowledge", { user_message: before, updates: [evidence], next_action: { kind: "lead_only", reason: "Discuss." } }).entry_ref;
  const draft = f.prepare(["f2"], first), changedUser = f.user("The result needs a different qualification.");
  f.record(["f2"], draft, changedUser);
  const second = f.save("knowledge", { user_message: changedUser, updates: [{ entity: "f2", ...evidence, summary: "Changed qualification." }], next_action: { kind: "lead_only", reason: "Clarify." } }).entry_ref;
  const changed = f.prepare(["f2"], second), historical = f.prepare(["f2@" + first], second);
  assert.equal(gap(f, draft), undefined);
  assert.ok(gap(f, changed));
  assert.equal(gap(f, historical), undefined);
  const pending = structuredClone(f.load());
  pending.entries.find(entry => entry.type === "reply_recorded" && entry.data.prepared === draft).data.items = [{ kind: "other", text: "No result was returned." }];
  // Rebuild the changed recording projection through the real replay function.
  const records = require("../scripts/lib/v8/records.cjs");
  pending.state = records.emptyState(pending.header);
  const seen = [];
  for (const entry of pending.entries) { pending.state = records.apply(pending.state, entry, seen); seen.push(entry); }
  assert.ok(gap({ load: () => pending }, draft));
  assert.ok(gap({ load: () => pending }, changed));
  assert.equal(gap({ load: () => pending }, historical), undefined);
});

test("host captures require an existing conversation anchor to establish work applicability", t => {
  const f = project(t);
  fs.writeFileSync(path.join(f.root, "actual.txt"), "The qualified findings.");
  const source = { kind: "host_capture", locator: "synthetic:export", message_path: "actual.txt" };
  f.record([f.run], undefined, undefined, { source });
  assert.ok(gap(f));
  f.record([f.run], f.prepared, undefined, { source: { ...source, locator: "synthetic:anchored-export" } });
  assert.equal(gap(f), undefined);
});
