"use strict";
// Synthetic incoming requests and actual-message captures test the recorded
// contract. These fixtures do not establish native emission or request semantics.
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/store.cjs"), author = require("../scripts/lib/authoring.cjs");
const runs = require("../scripts/lib/runs.cjs"), delivery = require("../scripts/lib/delivery.cjs");
const { renderExchange, RENDERER } = require("../scripts/lib/exchanges.cjs");
const { responseItems, visibleWords } = require("../scripts/lib/response-layout.cjs");
const { sha256 } = require("../scripts/lib/files.cjs");
const historicalV9 = require("./fixtures/historical-v9-renderers.json");
const f = require("./fixtures/consultation-loop.cjs");
const direct = { kind: "lead_only", scope: "Answer the requested scope clarification.", reason: "The user needs the complete terms before choosing work." };
function project(t) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-scope-answer-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("cc-scope-answer-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  store.init(root, { project_id: "scope-answer", event_id: "event-init" });
  return root;
}
function plan(population = "Randomized applicants excluding prespecified ineligible records") {
  return { kind: "analysis", objective: "Estimate the randomized two-year offer effect", target: "Mean two-year score effect of an offer versus no offer", population,
    claim_boundary: "Offer effect only in the documented study cohort; no attendance effect or transport beyond that cohort. Retain the two-year horizon and the prespecified decision threshold.",
    inputs: [], treatment: "Offer", comparator: "No offer", outcome: "Two-year score", timing: "Two years",
    estimand: "Intention-to-treat average effect", design_id: "randomized_assignment", estimator: "Difference of means with a 95% randomization interval",
    exclusions: ["Prespecified ineligible records"], diagnostics: ["Check assignment implementation and missing outcomes by arm.", "Keep the holdout commitment and decision threshold fixed before seeing results."] };
}
function draft(root, offer, suffix = "detail") {
  const source = "user-" + suffix, question = "question-" + suffix;
  const request = "Please explain the complete analysis scope in detail, including all population exclusions, timing, checks and limits, before I decide whether to proceed.";
  return { at: store.context(root, { mode: "brief" }).state_token, op: "exchange_prepared",
    changes: { evidence: [{ ...f.statement(source, request), complete_message: true }],
      questions: [{ question_id: question, origin: "user", statement: request, status: "answered", reason: "The response supplies the complete requested terms.", basis_refs: [source] }] },
    interpretation: { interpretation_id: "interpretation-" + suffix, turn_id: "turn-" + suffix, incoming_refs: [source], basis_refs: [source, question],
      components: [{ kind: "question", meaning: "Explain the complete proposed scope in detail before any selection.", established: [], unresolved: [], user_question_ref: question, answer_timing: "before_work" }], next_action: direct },
    exchange: { exchange_id: "exchange-" + suffix, basis_refs: [source, question], completed_work_refs: [],
      reconciliation: { changes: [], limitations: [], unresolved: [], next_direction: "Let the user choose the visible scope." },
      response: { user_questions: [{ question_ref: question, text: request, answer: "Here are the complete terms for the requested analysis.", status: "answered", basis_refs: [source], scope_ref: offer.scope.scope_id }],
        questions: [], next_steps: [{ option_id: "analyze", kind: "action", actor: "consultant", label: "Run this analysis", scope: "Proceed under these exact terms.", basis_refs: [], scope_ref: offer.scope.scope_id }] } } };
}
function rejected(root, input, code) {
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(() => author.submit(root, input), { code });
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before, "A rejected scope answer must not append or consume the request.");
}

test("v9 golden replies preserve historical bytes and hashes after the v10 default", () => {
  assert.equal(historicalV9.source_sha256, "aff5f18d5948ec7d12de23026da6c278c7419f344b125250fc943763cdcf1708");
  for (const fixture of historicalV9.cases) {
    const before = structuredClone(fixture.exchange), text = renderExchange(fixture.exchange);
    assert.equal(text, fixture.text);
    assert.equal(sha256(text), fixture.sha256);
    assert.deepEqual(fixture.exchange, before);
  }
  assert.equal(RENDERER, "lead-markdown-v10");
  assert.ok(store.capabilities().capabilities.includes("visible-scope-answers-v1"));
});

test("requested complete scope terms appear once in a typed answer and its short selectable option points to that item", t => {
  const root = project(t), offer = f.prepareScope(root, plan()), input = draft(root, offer);
  input.exchange.response.next_steps.push({ option_id: "discuss", kind: "discussion", actor: "consultant", label: "Discuss the evidence limits", scope: "Clarify the remaining uncertainty before choosing work.", basis_refs: [] });
  const originalScope = fs.readFileSync(path.join(root, "scopes", offer.scope.scope_id, "scope.json"));
  const receipt = author.submit(root, input), saved = store.readJournal(root).events.at(-1).payload.exchange;
  assert.equal(receipt.renderer, RENDERER);
  const [answer, option, alternate] = receipt.response_items;
  assert.equal(answer.kind, "answer");
  assert.equal(answer.scope_ref, offer.scope.scope_id);
  assert.deepEqual(answer.refs, ["question-detail", "user-detail", offer.scope.scope_id]);
  assert.ok(visibleWords(answer.text) > 50);
  assert.ok(visibleWords(option.text) <= 50);
  assert.deepEqual(receipt.response_diagnostics.filter(item => item.rule === "public_item_words").map(item => [item.item_kind, item.review_request]), [["answer", true]]);
  assert.ok(option.text.endsWith("Use the complete scope in [1] under [To answer your question]."));
  assert.equal(alternate.text, "Discuss the evidence limits\n\nClarify the remaining uncertainty before choosing work.");
  const answerSection = receipt.rendered_response.split("[Next steps]")[0], optionSection = receipt.rendered_response.split("[Next steps]")[1];
  for (const term of Object.values(offer.scope.public_scope).flat()) {
    assert.ok(answerSection.includes(term), term);
    assert.equal(optionSection.includes(term), false, term);
  }
  assert.equal((receipt.rendered_response.match(/\[Full saved scope\]/g) || []).length, 1);
  assert.deepEqual(saved.response.next_steps[0].proposal, offer.scope.public_scope);
  assert.deepEqual(saved.response.next_steps[0].execution_plan, offer.scope.execution_plan);
  assert.deepEqual(saved.response.next_steps[0].assignment, offer.scope.assignment);
  assert.deepEqual(fs.readFileSync(path.join(root, "scopes", offer.scope.scope_id, "scope.json")), originalScope);
  assert.equal(fs.readFileSync(path.join(root, receipt.response_path), "utf8"), receipt.rendered_response);
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  store.recover(root);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  const retry = author.submit(root, input);
  assert.equal(retry.replayed, true);
  assert.equal(retry.rendered_response, receipt.rendered_response);
  assert.equal(retry.response_sha256, receipt.response_sha256);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  assert.deepEqual(store.context(root, { focus_refs: ["question-detail"], limit: 1 }).views.work.exchanges.find(item => item.exchange_id === receipt.exchange_id).response_items, receipt.response_items);
});

test("ordinary complete offers retain the v9 bytes when no scope answer is present", t => {
  const root = project(t), offer = f.prepareScope(root, plan());
  const saved = store.readJournal(root).events.find(event => event.payload.exchange?.exchange_id === offer.exchange_ref).payload.exchange;
  assert.equal(renderExchange(saved), renderExchange({ ...saved, renderer: "lead-markdown-v9" }));
  const option = responseItems(saved).find(item => item.kind === "option");
  for (const term of Object.values(offer.scope.public_scope).flat()) assert.ok(option.text.includes(term), term);
  assert.doesNotMatch(option.text, /Use the complete scope in/);
});

test("a separately committed original request can be answered through explicit reconciliation", t => {
  const root = project(t), offer = f.prepareScope(root, plan()), received = draft(root, offer, "retained");
  received.op = "reply_interpreted";
  delete received.exchange;
  received.changes.questions[0].status = "open";
  delete received.changes.questions[0].reason;
  author.submit(root, received);
  const input = draft(root, offer, "reconciled"), source = input.changes.evidence[0];
  source.source_excerpt = "Please finish the scope explanation requested earlier.";
  source.summary = source.source_excerpt;
  input.changes.questions = [{ ...received.changes.questions[0], status: "answered", reason: "The response supplies the complete scope requested in the original retained message." }];
  input.interpretation.components = [{ kind: "instruction", meaning: source.source_excerpt, established: ["Finish the pending explanation."], unresolved: [] }];
  input.interpretation.basis_refs = ["user-reconciled", "question-retained"];
  input.exchange.reconciles = ["interpretation-retained"];
  input.exchange.basis_refs = ["question-retained", "user-retained", "user-reconciled"];
  input.exchange.response.user_questions[0] = { ...input.exchange.response.user_questions[0], question_ref: "question-retained", text: received.changes.questions[0].statement, basis_refs: ["user-retained"] };
  const receipt = author.submit(root, input);
  assert.equal(receipt.response_items[0].scope_ref, offer.scope.scope_id);
  assert.deepEqual(receipt.response_items[0].refs, ["question-retained", "user-retained", offer.scope.scope_id]);
  for (const ref of ["interpretation-retained", "interpretation-reconciled"]) assert.equal(f.state(root).turns.find(item => item.interpretation_ref === ref).exchange_ref, receipt.exchange_id);
  assert.equal(f.state(root).evidence.find(item => item.evidence_id === "user-retained").source_excerpt, received.changes.evidence[0].source_excerpt);
});

test("two requested scopes have separate complete answers and independently selectable short options", t => {
  const root = project(t), whole = f.prepareScope(root, plan()), narrow = f.prepareScope(root, plan("Prespecified age stratum"));
  const input = draft(root, whole), request = "Please explain the complete terms of both the whole-cohort and age-stratum analyses in detail before I select one.";
  input.changes.evidence[0].source_excerpt = request;
  input.changes.evidence[0].summary = request;
  input.changes.questions[0].statement = request;
  input.changes.questions.push({ ...input.changes.questions[0], question_id: "question-narrow", statement: "What are the complete age-stratum analysis terms?" });
  input.interpretation.components.push({ ...input.interpretation.components[0], user_question_ref: "question-narrow", meaning: "Explain the complete age-stratum scope." });
  input.exchange.response.user_questions[0].text = request;
  input.exchange.response.user_questions.push({ ...input.exchange.response.user_questions[0], question_ref: "question-narrow", answer: "Here are the complete age-stratum analysis terms.", scope_ref: narrow.scope.scope_id });
  input.exchange.response.next_steps.push({ ...input.exchange.response.next_steps[0], option_id: "narrow", label: "Run the age-stratum analysis", scope_ref: narrow.scope.scope_id });
  const receipt = author.submit(root, input), answers = receipt.response_items.filter(item => item.kind === "answer"), options = receipt.response_items.filter(item => item.kind === "option");
  assert.deepEqual(answers.map(item => item.scope_ref), [whole.scope.scope_id, narrow.scope.scope_id]);
  for (const [index, offer] of [whole, narrow].entries()) {
    for (const term of Object.values(offer.scope.public_scope).flat()) assert.ok(answers[index].text.includes(term), term);
    assert.ok(options[index].text.endsWith(`Use the complete scope in [${index + 1}] under [To answer your question].`));
    assert.ok(visibleWords(options[index].text) <= 50);
  }
  const delivery_ref = f.deliver(root, receipt.exchange_id, "alternatives");
  const accepted = f.acceptScope(root, { ...narrow, exchange_ref: receipt.exchange_id, option_id: "narrow", delivery_ref }, { user_text: "Proceed with [2] under Next steps using its complete age-stratum terms." });
  assert.throws(() => runs.start(root, { ...f.ids(root, "event-wrong-start"), run_id: "wrong-analysis", plan: { ...accepted, scope_ref: whole.scope.scope_id } }), error => ["SCOPE_MISMATCH", "INVALID_AUTHORIZATION", "ASSIGNMENT_MISMATCH"].includes(error.code));
  assert.equal(runs.start(root, { ...f.ids(root, "event-narrow-start"), run_id: "narrow-analysis", plan: accepted }).ok, true);
});

test("a scoped answer needs its genuine closing question and retained incoming request", t => {
  const root = project(t), offer = f.prepareScope(root, plan());
  for (const [mutate, code] of [
    [input => { input.interpretation.components = [{ kind: "information", meaning: "Unrelated information.", established: [], unresolved: [] }]; }, "MISSING_USER_SOURCE"],
    [input => { input.changes.questions[0].basis_refs = [offer.scope.scope_id]; }, "MISSING_USER_SOURCE"],
    [input => { delete input.changes.evidence[0].source_excerpt; delete input.changes.evidence[0].complete_message; }, "MISSING_USER_SOURCE"],
    [input => { input.changes.evidence[0].kind = "file"; delete input.changes.evidence[0].complete_message; }, "UNKNOWN_REFERENCE"],
    [input => { input.changes.evidence.push(f.statement("unrelated", "A separate message.")); input.interpretation.incoming_refs = ["unrelated"]; }, "MISSING_USER_SOURCE"]
  ]) {
    const input = draft(root, offer); mutate(input);
    rejected(root, input, code);
  }
  const consultantQuestion = draft(root, offer);
  consultantQuestion.changes.questions[0].origin = "consultant";
  rejected(root, consultantQuestion, "INVALID_INPUT");
});

test("missing or different same-exchange scope answers cannot suppress full offer terms", t => {
  const root = project(t), offer = f.prepareScope(root, plan()), other = f.prepareScope(root, plan("Prespecified age stratum"));
  const missingOption = draft(root, offer); missingOption.exchange.response.next_steps = [];
  rejected(root, missingOption, "SCOPE_MISMATCH");
  const otherScope = draft(root, offer); otherScope.exchange.response.user_questions[0].scope_ref = other.scope.scope_id;
  rejected(root, otherScope, "SCOPE_MISMATCH");
  const pending = draft(root, offer); pending.changes.questions[0].status = "open"; pending.exchange.response.user_questions[0].status = "pending";
  rejected(root, pending, "SCOPE_MISMATCH");
  const v9 = draft(root, offer); v9.exchange.renderer = "lead-markdown-v9";
  rejected(root, v9, "INVALID_INPUT");
  const arbitraryExplanation = draft(root, offer);
  delete arbitraryExplanation.exchange.response.user_questions[0].scope_ref;
  arbitraryExplanation.exchange.response.explanations = [{ text: "Use long terms here.", basis_refs: [], scope_ref: offer.scope.scope_id }];
  rejected(root, arbitraryExplanation, "INVALID_INPUT");
  const altered = draft(root, offer); altered.exchange.response.next_steps[0].proposal = { ...offer.scope.public_scope, claim_boundary: "Unlimited transport." };
  rejected(root, altered, "SCOPE_MISMATCH");
});

test("one scope cannot acquire multiple answer items, and the generated pointer follows actual answer order", t => {
  const root = project(t), offer = f.prepareScope(root, plan());
  const duplicate = draft(root, offer), first = duplicate.exchange.response.user_questions[0];
  duplicate.changes.questions.push({ ...duplicate.changes.questions[0], question_id: "question-second" });
  duplicate.interpretation.components.push({ ...duplicate.interpretation.components[0], user_question_ref: "question-second" });
  duplicate.exchange.response.user_questions.push({ ...first, question_ref: "question-second" });
  rejected(root, duplicate, "INVALID_INPUT");
  const input = draft(root, offer);
  input.changes.questions.push({ ...input.changes.questions[0], question_id: "question-first", statement: "Will this generalize?" });
  input.interpretation.components.unshift({ ...input.interpretation.components[0], user_question_ref: "question-first", meaning: "Clarify generalization." });
  input.exchange.response.user_questions.unshift({ question_ref: "question-first", text: "Will this generalize?", answer: "Only to the documented study cohort.", status: "answered", basis_refs: ["user-detail"] });
  const receipt = author.submit(root, input);
  assert.ok(receipt.response_items.find(item => item.kind === "option").text.endsWith("Use the complete scope in [2] under [To answer your question]."));
  const saved = store.readJournal(root).events.at(-1).payload.exchange;
  const reordered = structuredClone(saved); reordered.response.user_questions.reverse();
  assert.ok(responseItems(reordered).find(item => item.kind === "option").text.endsWith("Use the complete scope in [1] under [To answer your question]."));
  assert.equal(renderExchange(saved), receipt.rendered_response);
});

test("a later offer without a same-exchange scope answer repeats its complete visible terms", t => {
  const root = project(t), offer = f.prepareScope(root, plan()), receipt = author.submit(root, draft(root, offer));
  const it = f.interpret(root, "later", direct, {}, "Please offer that work again.");
  const later = f.exchange(root, it, "later", { questions: [], next_steps: [{ option_id: "later-analysis", kind: "action", actor: "consultant", label: "Run this analysis", scope: "Proceed under these terms.", basis_refs: [], scope_ref: offer.scope.scope_id }] });
  for (const term of Object.values(offer.scope.public_scope).flat()) assert.ok(later.response_items[0].text.includes(term), term);
  assert.doesNotMatch(later.rendered_response, /Use the complete scope in/);
  assert.notEqual(later.response_sha256, receipt.response_sha256);
});

test("scope selection still requires the actual complete delivered exchange before protected work starts", t => {
  const root = project(t), offer = f.prepareScope(root, plan()), receipt = author.submit(root, draft(root, offer));
  const offered = { ...offer, exchange_ref: receipt.exchange_id, option_id: "analyze", delivery_ref: "missing-delivery" };
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.throws(() => f.acceptScope(root, offered), error => ["UNKNOWN_REFERENCE", "UNOBSERVED_EXCHANGE", "INVALID_AUTHORIZATION"].includes(error.code));
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  const message = "actual-incomplete.txt";
  fs.writeFileSync(path.join(root, message), receipt.rendered_response.replace(offer.scope.public_scope.claim_boundary, ""));
  delivery.observe(root, { ...f.ids(root, "event-incomplete"), delivery_id: "delivery-incomplete", exchange_ref: receipt.exchange_id, observation: "assistant_emission",
    message_path: message, source_ref: "fixture-host:incomplete", capture_message: { conversation_ref: "fixture-host:conversation", message_ref: "incomplete", ordinal: f.state(root).deliveries.length + 1 } });
  offered.delivery_ref = "delivery-incomplete";
  assert.throws(() => f.acceptScope(root, offered), { code: "UNOBSERVED_EXCHANGE" });
  assert.equal(f.state(root).action_decisions.length, 0);
  const delivery_ref = f.deliver(root, receipt.exchange_id, "complete-detail");
  const actual = f.state(root).deliveries.find(item => item.delivery_id === delivery_ref);
  assert.equal(actual.observed_response_sha256, receipt.response_sha256);
  assert.equal(fs.readFileSync(path.join(root, actual.source_ref), "utf8"), receipt.rendered_response);
  const accepted = f.acceptScope(root, { ...offered, delivery_ref }, { user_text: "Proceed with [1] under Next steps and the complete scope in [1] under To answer your question." });
  const started = runs.start(root, { ...f.ids(root, "event-start-selected"), run_id: "selected-analysis", plan: accepted });
  assert.equal(started.ok, true);
  assert.equal(f.state(root).runs.find(item => item.run_id === "selected-analysis").authorization_binding.scope_ref, offer.scope.scope_id);
});

test("an omitted-renderer v9 submit retry retains its response and journal after interrupted export and later history", t => {
  const root = project(t), it = f.interpret(root, "old-v9", direct);
  const input = { at: store.context(root, { mode: "brief" }).state_token, op: "exchange_prepared", exchange: { turn_id: it.turn_id, interpretation_ref: it.interpretation_id,
    basis_refs: [], completed_work_refs: [], reconciliation: { changes: [], limitations: [], unresolved: [], next_direction: "Wait for the user." },
    response: { explanations: [{ text: "The conclusion remains conditional.", basis_refs: [] }], questions: [], next_steps: [] } } };
  const old = author.build(input).request; old.payload.exchange.renderer = "lead-markdown-v9";
  const saved = store.record(root, old, { hooks: { afterAppend() { throw new Error("Interrupted export"); } } });
  assert.equal(saved.committed, true);
  assert.equal(saved.projection_written, false);
  f.record(root, "memory_updated", { changes: { project_understanding: { materials: ["A later source note."] } } }, "event-later-note");
  const journal = fs.readFileSync(path.join(root, "journal.jsonl")), retry = author.submit(root, input);
  assert.equal(retry.replayed, true);
  assert.equal(retry.renderer, "lead-markdown-v9");
  assert.equal(retry.rendered_response, saved.rendered_response);
  assert.equal(retry.response_sha256, saved.response_sha256);
  assert.equal(retry.response_diagnostics, undefined);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
  assert.equal(author.build({ ...input, at: store.context(root, { mode: "brief" }).state_token }).request.payload.exchange.renderer, RENDERER);
});
