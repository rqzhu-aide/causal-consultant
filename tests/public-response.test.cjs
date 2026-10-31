"use strict";
// Explicitly synthetic user/capture fixtures exercise saving and recovery.
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const store = require("../scripts/lib/store.cjs"), author = require("../scripts/lib/authoring.cjs");
const { renderExchange, RENDERER } = require("../scripts/lib/exchanges.cjs");
const { responseItems, visibleWords } = require("../scripts/lib/response-layout.cjs");
const { responseFeedback } = require("../scripts/lib/writing.cjs");
const f = require("./fixtures/consultation-loop.cjs");
function project(t) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-public-response-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), base);
    assert.ok(path.basename(root).startsWith("cc-public-response-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  store.init(root, { project_id: "public-response", event_id: "event-init" });
  return root;
}
const direct = { kind: "lead_only", scope: "Explain the supplied information.", reason: "No new scientific work is needed." };
const words = n => Array(n).fill("word").join(" ");
const outgoing = response => ({ renderer: RENDERER, response: { questions: [], next_steps: [], ...response } });
function exchangeInput(root, it, suffix, response) {
  return { at: store.context(root, { mode: "brief" }).state_token, op: "exchange_prepared", exchange: {
    exchange_id: "exchange-" + suffix, turn_id: it.turn_id, interpretation_ref: it.interpretation_id, basis_refs: [], completed_work_refs: [],
    reconciliation: { changes: [], limitations: [], unresolved: [], next_direction: "Wait for the user's next contribution." }, response } };
}

test("the current renderer preserves mixed answers, explanations and one qualified findings item in a deterministic map", () => {
  const value = outgoing({
    user_questions: [{ question_ref: "question-population", text: "Which population?", answer: "The study cohort.", echo_question: true, basis_refs: ["source-cohort"] }],
    explanations: [{ text: "An offer and attendance are different interventions.", basis_refs: [] }],
    findings: { summary: "The estimate remains uncertain.", diagnostics: ["Checked outcome timing."], limitations: ["Study cohort only."], work_refs: ["review-source"] },
    status: "Reviewed the assignment record.",
    questions: [{ question_ref: "question-note", text: "Can you share the allocation note?" }],
    next_steps: [{ option_id: "explain", label: "Discuss uncertainty", actor: "consultant", scope: "Explain the interval's meaning.", basis_refs: ["review-source"] }]
  });
  const before = structuredClone(value), rendered = renderExchange(value);
  assert.equal(rendered, ["[To answer your question]", "[A1] Which population?", "The study cohort.",
    "[A2] An offer and attendance are different interventions.", "[A3] The estimate remains uncertain.",
    "Checks: Checked outcome timing.", "Limits: Study cohort only.", "[What has been done]", "Reviewed the assignment record.",
    "[Questions for you]", "[Q1] Can you share the allocation note?", "[Next steps]", "[N1] Discuss uncertainty", "Explain the interval's meaning."].join("\n\n"));
  const items = responseItems(value);
  assert.deepEqual(items.map(item => [item.kind, item.position, item.source_path, item.refs]), [
    ["answer", 1, "response.user_questions[0]", ["question-population", "source-cohort"]],
    ["explanation", 2, "response.explanations[0]", []], ["findings", 3, "response.findings", ["review-source"]],
    ["summary", null, "response.status", []], ["question", 1, "response.questions[0]", ["question-note"]],
    ["option", 1, "response.next_steps[0]", ["review-source"]]
  ]);
  assert.deepEqual(value, before);
  assert.doesNotMatch(rendered, /^(?:[ \t]+\S|[-*+]\s|\d+[.)]\s)/m);
});

test("an explanation alone saves without inventing a question, findings or completed review", t => {
  const root = project(t), it = f.interpret(root, "information", direct, {}, "The assignment procedure is unknown.");
  const response = { explanations: [{ text: "A causal interpretation depends on how treatment was assigned.", basis_refs: [] }], questions: [], next_steps: [] };
  const receipt = f.exchange(root, it, "explanation", response);
  assert.equal(receipt.rendered_response, "[To answer your question]\n\n[A1] " + response.explanations[0].text);
  assert.equal(receipt.response_items[0].kind, "explanation");
  assert.deepEqual(f.state(root).questions, []);
  assert.equal(Object.values(f.state(root).history_index).some(item => item.kind === "review"), false);
  assert.deepEqual(f.state(root).runs, []);
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  store.recover(root);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
  assert.equal(renderExchange(store.readJournal(root).events.at(-1).payload.exchange), receipt.rendered_response);
});

test("explanation references validate, old renderers reject the field, and required question answers remain required", t => {
  const root = project(t), it = f.interpret(root, "references", direct);
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  for (const [response, renderer, code] of [
    [{ explanations: [{ text: "A supported explanation.", basis_refs: ["missing"] }], questions: [], next_steps: [] }, RENDERER, "UNKNOWN_REFERENCE"],
    [{ explanations: [{ text: "A conceptual explanation.", basis_refs: [] }], questions: [], next_steps: [] }, "lead-markdown-v8", "INVALID_INPUT"]
  ]) assert.throws(() => f.exchange(root, it, "bad", response, [], renderer), { code });
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  f.record(root, "memory_updated", { changes: { questions: [{ question_id: "user-question", origin: "user", status: "open", statement: "Is attendance identified?", basis_refs: it.incoming_refs }] } }, "event-question");
  const asked = f.interpret(root, "asked", direct, { components: [{ kind: "question", meaning: "Explain identification.", established: [], unresolved: ["Attendance effect"], user_question_ref: "user-question", answer_timing: "before_work" }] });
  assert.throws(() => f.exchange(root, asked, "unanswered", { explanations: [{ text: "Assignment matters.", basis_refs: [] }], questions: [], next_steps: [] }), { code: "UNANSWERED_USER_QUESTION" });
});

test("49, 50 and 51 complete visible words are advisory and cannot mutate a saved response or retry", t => {
  const root = project(t);
  for (const count of [49, 50, 51]) {
    const it = f.interpret(root, "length-" + count, direct);
    // Link labels contribute two words; the long destination contributes none.
    const text = words(count - 2) + " [allocation record](<https://example.invalid/an/extremely/long/destination>)";
    const input = exchangeInput(root, it, "length-" + count, { explanations: [{ text, basis_refs: [] }], questions: [], next_steps: [] });
    const receipt = author.submit(root, input);
    assert.equal(visibleWords(text), count);
    assert.equal(receipt.response_diagnostics?.length || 0, count === 51 ? 1 : 0);
    if (count === 51) assert.deepEqual(receipt.response_diagnostics[0], { path: "payload.exchange.response.explanations[0]", section: "To answer your question", position: 1, display_label: "A1", item_kind: "explanation", rule: "public_item_words", words: 51, budget: 50 });
    assert.equal(store.readJournal(root).events.at(-1).payload.exchange.response.explanations[0].text, text);
    assert.equal(receipt.rendered_response, "[To answer your question]\n\n[A1] " + text);
    const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
    assert.equal(journal.includes(Buffer.from("response_diagnostics")), false);
    const retry = author.submit(root, input);
    assert.equal(retry.replayed, true);
    assert.equal(retry.response_diagnostics, undefined);
    assert.equal(retry.rendered_response, receipt.rendered_response);
    assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
  }
});

test("echoed questions and each unrelated item count separately from a requested long answer", () => {
  const value = outgoing({ user_questions: [{ question_ref: "long", text: "Explain in detail", answer: words(50), echo_question: true, basis_refs: [] }],
    explanations: [{ text: words(51), basis_refs: [] }], questions: [{ text: words(51) }],
    next_steps: [{ label: "Discuss", actor: "consultant", scope: words(50), basis_refs: [] }] });
  const diagnostics = responseFeedback(value).response_diagnostics;
  assert.deepEqual(diagnostics.map(item => [item.item_kind, item.words, !!item.review_request]), [
    ["answer", 53, true], ["explanation", 51, false], ["question", 51, false], ["option", 51, false]
  ]);
  assert.equal(responseFeedback({ ...value, renderer: "lead-markdown-v8" }).response_diagnostics, undefined);
});

test("the summary stays unnumbered and has paragraph and normal-item word advisories", () => {
  const brief = outgoing({ status: "Paused while the allocation source is obtained." });
  assert.equal(renderExchange(brief), "[What has been done]\n\nPaused while the allocation source is obtained.");
  assert.deepEqual(responseFeedback(brief), {});
  assert.deepEqual(responseFeedback(outgoing({ status: words(80) })), { response_diagnostics: [{ path: "payload.exchange.response.status", section: "What has been done", position: null, display_label: null, item_kind: "summary", rule: "public_item_words", words: 80, budget: 50 }] });
  const multi = outgoing({ status: "Reviewed the source.\n\nRetained the unresolved assignment question." });
  assert.deepEqual(responseFeedback(multi), { response_diagnostics: [{ path: "payload.exchange.response.status", section: "What has been done", position: null, display_label: null, item_kind: "summary", rule: "summary_paragraphs" }] });
  assert.ok(renderExchange(multi).includes(multi.response.status));
});

function plan(complex) {
  return { kind: "analysis", objective: "Estimate offer effect", target: "Offer effect", population: "Applicants", inputs: [],
    claim_boundary: complex ? "Applicants only, conditional on the documented assignment mechanism and complete outcome follow-up; no attendance effect, subgroup transport or unmeasured intervention effect is established." : "Applicants only",
    treatment: "Offer", comparator: "No offer", outcome: "Score", timing: "One term", estimand: "Mean difference", design_id: "randomized_assignment",
    estimator: "Mean difference", exclusions: [], diagnostics: complex ? ["Check assignment implementation, outcome timing, loss to follow-up and uncertainty under the original assignment mechanism."] : ["Check assignment"] };
}
test("expanded simple and complex protected scopes retain every public term and receive complete-item diagnostics", t => {
  const root = project(t);
  for (const complex of [false, true]) {
    const offer = f.prepareScope(root, plan(complex), { suffix: complex ? "complex" : "simple" });
    const it = f.interpret(root, complex ? "complex-offer" : "simple-offer", direct);
    const receipt = f.exchange(root, it, complex ? "complex-offer" : "simple-offer", { questions: [], next_steps: [{ option_id: "analyze", kind: "action", actor: "consultant", label: "Analyze", scope: "Use this scope.", basis_refs: [], scope_ref: offer.scope.scope_id }] });
    const saved = store.readJournal(root).events.at(-1).payload.exchange;
    for (const term of Object.values(offer.scope.public_scope).flat()) assert.ok(receipt.rendered_response.includes(term), term);
    assert.deepEqual(saved.response.next_steps[0].proposal, offer.scope.public_scope);
    assert.equal((receipt.response_diagnostics?.some(item => item.rule === "public_item_words")) || false, complex);
    const count = visibleWords(responseItems(saved)[0].text);
    if (complex) assert.equal(receipt.response_diagnostics[0].words, count); else assert.ok(count <= 50);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, "scopes", offer.scope.scope_id, "scope.json"))), offer.scope);
  }
});

test("authored lists and counterfeit labels are diagnosed while fenced code, equations and citations survive", () => {
  const bad = "A qualified claim.\n\n- A nested detail.\n[2] A counterfeit item.\n[Next steps]\n# Another heading";
  const good = "See [the study](<https://example.invalid/study>) and citation [12].\n\n$$\n- x + y = 0\n$$\n\n```text\n- literal code\n[Next steps]\n[2] literal marker\n```\n\n`[a](literal)` remains code.";
  const value = outgoing({ explanations: [{ text: bad, basis_refs: [] }, { text: good, basis_refs: [] }] });
  const original = structuredClone(value), diagnostics = responseFeedback(value).response_diagnostics;
  assert.deepEqual(diagnostics.filter(item => item.rule === "authored_structure").map(item => [item.position, item.line, item.marker]), [[1, 3, "list"], [1, 4, "item"], [1, 5, "heading"], [1, 6, "heading"]]);
  assert.equal(diagnostics.some(item => item.position === 2), false);
  assert.ok(renderExchange(value).includes(good));
  assert.deepEqual(value, original);
  assert.equal(visibleWords("See [the study](<https://example.invalid/study>) and `a b` with $x + y$"), 10);
});

test("indented link-shaped code and reference-shaped code each count all 55 literal words", () => {
  for (const indent of ["    ", "\t"]) {
    for (const literal of ["[literal code]( " + words(53) + ")", "[literal]: " + words(54)]) {
      const text = indent + literal;
      assert.equal(visibleWords(text), 55);
      const feedback = responseFeedback(outgoing({ explanations: [{ text, basis_refs: [] }] }));
      assert.equal(feedback.response_diagnostics[0].words, 55);
      assert.equal(feedback.response_diagnostics.some(item => item.rule === "authored_structure"), false);
      assert.ok(renderExchange(outgoing({ explanations: [{ text, basis_refs: [] }] })).includes(text));
    }
  }
  assert.equal(visibleWords("[literal]: " + words(54)), 0, "An ordinary reference definition remains invisible metadata.");
  assert.equal(visibleWords("[literal code](" + words(53) + ")"), 2, "An ordinary inline link counts only its visible label.");
});

test("double-digit mixed items preserve identity when later response order changes", () => {
  const explanations = Array.from({ length: 12 }, (_, index) => ({ text: "Explanation " + (index + 1) + ".", basis_refs: ["source-" + index] }));
  const value = outgoing({ explanations }), original = responseItems(value);
  assert.ok(renderExchange(value).includes("\n\n[A10] Explanation 10.\n\n[A11] Explanation 11.\n\n[A12] Explanation 12."));
  const revised = outgoing({ explanations: [explanations[11], explanations[0]] });
  assert.deepEqual(responseItems(revised).map(item => [item.position, item.refs]), [[1, ["source-11"]], [2, ["source-0"]]]);
  assert.deepEqual(original[11].refs, ["source-11"]);
  assert.equal(original[11].position, 12);
});

test("explanation bases and findings work references retrieve their original items beyond the five-intake window", t => {
  const root = project(t);
  f.record(root, "memory_updated", { changes: { evidence: [f.statement("source-concept", "An offer differs from attendance."), f.statement("source-reviewed", "The assignment note is incomplete.")] } }, "event-bases");
  const it = f.interpret(root, "old-explanation", direct);
  const explanation = "An offer effect concerns the offer itself. Attendance requires a separate identification argument.";
  const receipt = f.exchange(root, it, "old-explanation", { explanations: [{ text: explanation, basis_refs: ["source-concept"] }], questions: [], next_steps: [] });
  const review = f.findingReview(root, ["source-reviewed"], "old-findings");
  for (let index = 0; index < 6; index++) {
    const follow = f.interpret(root, "later-" + index, direct, {}, "Pause this discussion while I check another source.");
    f.exchange(root, follow, "later-" + index, { status: "Paused pending the user's source check.", questions: [], next_steps: [] });
  }
  const brief = store.context(root, { mode: "brief" }).brief;
  assert.equal(brief.recent_intakes.length, 5);
  assert.equal(brief.recent_intakes.flatMap(item => item.outgoing).some(item => [receipt.exchange_id, "exchange-old-findings"].includes(item.exchange_ref)), false);
  const focusedExplanation = store.context(root, { focus_refs: ["source-concept"], limit: 1 }).views.work.exchanges.find(item => item.exchange_id === receipt.exchange_id);
  assert.ok(focusedExplanation, "The saved explanation basis must keep its original exchange discoverable.");
  assert.equal(focusedExplanation.response_items[0].text, explanation);
  assert.deepEqual(focusedExplanation.response_items[0].refs, ["source-concept"]);
  const focusedFindings = store.context(root, { focus_refs: [review], limit: 1 }).views.work.exchanges.find(item => item.exchange_id === "exchange-old-findings");
  assert.ok(focusedFindings);
  const item = focusedFindings.response_items.find(item => item.kind === "findings");
  assert.equal(item.position, 1);
  assert.equal(item.section, "To answer your question");
  assert.deepEqual(item.refs, [review]);
  assert.equal(item.source_path, "response.findings");
});

test("an omitted-renderer retry replays the historical v8 draft after the new default", t => {
  const root = project(t), it = f.interpret(root, "historical-v8", direct);
  const input = exchangeInput(root, it, "historical-v8", { status: "The conclusion remains conditional.", questions: [], next_steps: [] });
  const request = author.build(input).request;
  request.payload.exchange.renderer = "lead-markdown-v8";
  const receipt = store.record(root, request, { hooks: { afterAppend() { throw new Error("Interrupted export"); } } });
  assert.equal(receipt.committed, true);
  assert.equal(receipt.projection_written, false);
  assert.equal(receipt.rendered_response, "[What has been done]\n\n[1] The conclusion remains conditional.");
  f.record(root, "memory_updated", { changes: { project_understanding: { materials: ["Later note"] } } }, "event-later");
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  const retry = author.submit(root, input);
  assert.equal(retry.replayed, true);
  assert.equal(retry.renderer, "lead-markdown-v8");
  assert.equal(retry.rendered_response, receipt.rendered_response);
  assert.equal(retry.response_sha256, receipt.response_sha256);
  assert.equal(retry.response_diagnostics, undefined);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
  assert.equal(author.build({ ...input, at: store.context(root, { mode: "brief" }).state_token }).request.payload.exchange.renderer, RENDERER);
});
