"use strict";

// Prospective, advisory prose diagnostics. This runs only after a fresh request
// has passed validation. Never truncate records or add warnings to the journal.
const { canonical } = require("./files.cjs");
const words = value => typeof value === "string" ? (value.trim().match(/\S+/g) || []).length
  : Array.isArray(value) ? value.reduce((sum, item) => sum + words(item), 0) : 0;
const same = (a, b) => a === undefined || b === undefined ? a === b : canonical(a) === canonical(b);
const UNDERSTANDING = ["objective", "intended_use", "audience", "causal_target", "current_claim_boundary"];
const RESPONSE_ITEM_BUDGETS = Object.freeze({ normal: 50, requested_answer: 200, necessary_scope: 100 });
function writingFeedback(state, payload) {
  const warnings = [];
  function check(submitted, previous, fields, path, rule, budget, combined = submitted) {
    if (!submitted || !fields.some(field => Object.hasOwn(submitted, field) && !same(submitted[field], previous?.[field]))) return;
    const count = fields.reduce((sum, field) => sum + words(combined[field]), 0);
    if (count > budget) warnings.push({ path, rule, words: count, budget });
  }
  const changes = payload.changes || {};
  for (const [name, key, field, budget] of [
    ["evidence", "evidence_id", "summary", 80], ["decisions", "decision_id", "statement", 80],
    ["assumptions", "assumption_id", "statement", 60]
  ]) for (const [index, record] of (changes[name] || []).entries()) {
    const submitted = record.patch || record;
    check(submitted, (state[name] || []).find(prior => prior[key] === record[key]), [field],
      "payload.changes." + name + "[" + index + "]" + (record.patch ? ".patch" : "") + "." + field, field, budget);
  }
  const checkpointFields = ["primary_uncertainty", "why_it_matters", "ways_user_can_help", "consultant_led_options_if_unknown"];
  for (const [checkpoint, path] of [[payload.checkpoint, "payload.checkpoint"], [changes.consultation, "payload.changes.consultation"]]) {
    check(checkpoint, state.consultation?.checkpoint_id === checkpoint?.checkpoint_id ? state.consultation : undefined,
      checkpointFields, path, "checkpoint_narrative", 60);
  }
  check(payload.review, undefined, ["summary"], "payload.review.summary", "summary", 150);
  check(payload.exchange?.reconciliation, undefined, ["changes", "limitations", "unresolved", "next_direction"],
    "payload.exchange.reconciliation", "reconciliation_narrative", 120);
  const understanding = payload.project_understanding || changes.project_understanding;
  check(understanding, state.project_understanding, UNDERSTANDING,
    payload.project_understanding ? "project_understanding" : "payload.changes.project_understanding", "project_understanding_narrative", 300,
    { ...state.project_understanding, ...understanding });
  return warnings.length ? { writing_warnings: warnings } : {};
}
// Use the prepared exchange, after public scope expansion. These advisories
// never establish an exception, change content or block save. A review marker
// asks the lead to assess the user's request or the necessity of public terms.
function responseFeedback(exchange, { optionLimit } = {}) {
  if (!require("./exchanges.cjs").FOUR_SECTION_RENDERERS.includes(exchange?.renderer)) return {};
  const { responseItems, visibleWords, authoredStructure } = require("./response-layout.cjs");
  const diagnostics = [], items = responseItems(exchange), v11 = exchange.renderer === "lead-markdown-v11";
  for (const item of items) {
    const location = { path: "payload.exchange." + item.source_path, section: item.section,
      position: item.position, ...(v11 ? { display_label: item.display_label } : {}), item_kind: item.kind };
    const count = visibleWords(item.text);
    if ((item.position !== null || v11 && item.kind === "summary") && count > RESPONSE_ITEM_BUDGETS.normal) {
      const option = v11 && item.kind === "option" && exchange.response.next_steps.find(option => option.option_id === item.option_id);
      const fullScope = option?.scope_ref && option.proposal
        && !items.some(answer => answer.kind === "answer" && answer.scope_ref === option.scope_ref);
      const maximum = item.kind === "option" && optionLimit !== undefined ? optionLimit
        : v11 && item.kind === "answer" ? RESPONSE_ITEM_BUDGETS.requested_answer
        : fullScope ? RESPONSE_ITEM_BUDGETS.necessary_scope : null;
      diagnostics.push({ ...location, rule: "public_item_words", words: count, budget: RESPONSE_ITEM_BUDGETS.normal,
        ...(item.kind === "answer" ? { review_request: true } : {}),
        ...(fullScope && optionLimit === undefined ? { review_scope: true } : {}),
        ...(maximum !== null ? { maximum_budget: maximum, ...(count > maximum ? { exceeds_maximum: true } : {}) } : {}) });
    }
    if (item.kind === "summary" && /\r?\n[ \t]*\r?\n/.test(item.text)) diagnostics.push({ ...location, rule: "summary_paragraphs" });
    for (const issue of authoredStructure(item.text, exchange.renderer)) diagnostics.push({ ...location, rule: "authored_structure", ...issue });
  }
  return diagnostics.length ? { response_diagnostics: diagnostics } : {};
}
module.exports = { writingFeedback, responseFeedback, RESPONSE_ITEM_BUDGETS };
