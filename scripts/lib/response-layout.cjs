"use strict";

// Derived presentation only. Saved response fields own identities and content;
// this map is shared by structured rendering, diagnostics and conversation readers.
const V9 = "lead-markdown-v9";
const V10 = "lead-markdown-v10";
const V11 = "lead-markdown-v11";
const paragraphs = values => values.filter(Boolean).join("\n\n");
const prose = values => values.filter(Boolean).map(value => /[.!?]$/.test(value.trimEnd()) ? value : value + ".").join(" ");
function findingsText(findings) {
  return paragraphs([findings.summary,
    findings.diagnostics.length ? "Checks: " + findings.diagnostics.join("; ") : "",
    findings.limitations.length ? "Limits: " + findings.limitations.join("; ") : ""]);
}
function publicScopeText(proposal) {
  return prose([proposal.target, proposal.population, proposal.claim_boundary, proposal.approach,
    "Evidence: " + proposal.evidence, proposal.checks.length ? "Checks: " + proposal.checks.join("; ") : "",
    "Output: " + proposal.outputs]);
}
function optionText(option, scopeAnswer) {
  const blocks = [option.label, option.actor === "consultant" ? option.scope : option.actor + ": " + option.scope];
  if (scopeAnswer) {
    blocks.push(`Use the complete scope in [${scopeAnswer.display_label ?? scopeAnswer.position}] under [To answer your question].`);
  } else if (option.proposal) {
    blocks.push(publicScopeText(option.proposal));
    blocks.push(`[Full saved scope](<${option.scope_file}>)`);
  }
  return paragraphs(blocks);
}
function responseItems(exchange) {
  const { response, renderer } = exchange;
  const v11 = renderer === V11, visibleScopeAnswers = renderer === V10 || v11;
  const v9 = renderer === V9 || visibleScopeAnswers, v8 = renderer === "lead-markdown-v8";
  // Before sectioned output, semantic references still identify the saved
  // content, but only numbered questions/options had public item positions.
  const conversational = ["lead-markdown-v5", "lead-markdown-v6", "lead-markdown-v7"].includes(renderer);
  const items = [], counts = new Map();
  function add(section, kind, source_path, text, refs, identity = {}, numbered = true) {
    const position = numbered ? (counts.get(section) || 0) + 1 : null;
    if (numbered) counts.set(section, position);
    const prefix = { answer: "A", explanation: "A", findings: "A", question: "Q", option: "N" }[kind];
    items.push({ section, position, ...(v11 ? { display_label: position === null ? null : prefix + position } : {}),
      kind, source_path, text, refs: [...new Set(refs)], ...identity });
  }
  const answerSection = v9 ? "To answer your question" : v8 ? "Answers to your questions" : conversational ? null : "Your Questions";
  for (const [index, answer] of (response.user_questions || []).entries()) {
    const scopeOption = visibleScopeAnswers && answer.scope_ref && response.next_steps.find(option => option.scope_ref === answer.scope_ref);
    add(answerSection, "answer", `response.user_questions[${index}]`,
      paragraphs([answer.echo_question || renderer === "lead-markdown-v5" ? answer.text : "", answer.answer,
        scopeOption ? publicScopeText(scopeOption.proposal) : "", scopeOption ? `[Full saved scope](<${scopeOption.scope_file}>)` : ""]),
      [answer.question_ref, ...(answer.basis_refs || []), ...(visibleScopeAnswers && answer.scope_ref ? [answer.scope_ref] : [])].filter(Boolean),
      { question_ref: answer.question_ref, ...(visibleScopeAnswers && answer.scope_ref ? { scope_ref: answer.scope_ref } : {}) }, !conversational);
  }
  if (v9) for (const [index, explanation] of (response.explanations || []).entries()) {
    add(answerSection, "explanation", `response.explanations[${index}]`, explanation.text, explanation.basis_refs || []);
  }
  if (v9 && response.findings) add(answerSection, "findings", "response.findings", findingsText(response.findings), response.findings.work_refs || []);
  const workSection = v9 || v8 ? "What has been done" : conversational ? null : "Status";
  if (response.status) add(workSection, "summary", "response.status", response.status, [], {}, v8);
  if (!v9 && response.findings) add(workSection, "findings", "response.findings", findingsText(response.findings), response.findings.work_refs || [], {}, v8);
  const questionSection = v9 || v8 ? "Questions for you" : conversational ? null : ["lead-markdown-v1", "lead-markdown-v2"].includes(renderer) ? "Questions" : "I want to know";
  for (const [index, question] of response.questions.entries()) {
    add(questionSection, "question", `response.questions[${index}]`, paragraphs([question.text, question.why, question.needed]),
      [question.question_ref].filter(Boolean), { question_ref: question.question_ref }, !conversational);
  }
  const optionSection = v9 || v8 ? "Next steps" : conversational ? null : ["lead-markdown-v1", "lead-markdown-v2"].includes(renderer) ? "Next Steps" : "Decide Next Steps";
  for (const [index, option] of response.next_steps.entries()) {
    const scopeAnswer = visibleScopeAnswers && option.scope_ref && items.find(item => item.kind === "answer" && item.scope_ref === option.scope_ref);
    add(optionSection, "option", `response.next_steps[${index}]`, optionText(option, scopeAnswer),
      [option.scope_ref, ...(option.basis_refs || [])].filter(Boolean), { option_id: option.option_id, ...(option.scope_ref ? { scope_ref: option.scope_ref } : {}) });
  }
  return items;
}
function renderV9Exchange(exchange) {
  const sections = [];
  for (const item of responseItems(exchange)) {
    let section = sections.at(-1);
    if (!section || section.label !== item.section) {
      section = { label: item.section, items: [] };
      sections.push(section);
    }
    section.items.push(item.position === null ? item.text : `[${item.display_label ?? item.position}] ${item.text}`);
  }
  return sections.map(section => `[${section.label}]\n\n` + section.items.join("\n\n")).join("\n\n");
}

// Count whitespace-delimited visible tokens. Keep code and math opaque when
// scanning links; delimiters/fence lines are formatting, destinations are not
// visible prose, and a displayed bare URL still counts as one token.
function closing(value, start, open, close) {
  let depth = 1;
  for (let index = start + 1; index < value.length; index++) {
    if (value[index] === "\\") { index++; continue; }
    if (value[index] === open) depth++;
    else if (value[index] === close && --depth === 0) return index;
  }
  return -1;
}
function inlineVisible(value) {
  let result = "";
  for (let index = 0; index < value.length;) {
    const rest = value.slice(index);
    const opaque = rest.match(/^(`+|\$\$?|\\\(|\\\[)/)?.[0];
    if (opaque) {
      const endMarker = opaque === "\\(" ? "\\)" : opaque === "\\[" ? "\\]" : opaque;
      const end = value.indexOf(endMarker, index + opaque.length);
      if (end >= 0) { result += value.slice(index + opaque.length, end); index = end + endMarker.length; continue; }
    }
    const image = value[index] === "!" && value[index + 1] === "[";
    const start = image ? index + 1 : index;
    if (value[start] === "[") {
      const end = closing(value, start, "[", "]");
      if (end >= 0 && ["(", "["].includes(value[end + 1])) {
        const open = value[end + 1], destinationEnd = closing(value, end + 1, open, open === "(" ? ")" : "]");
        if (destinationEnd >= 0) { result += inlineVisible(value.slice(start + 1, end)); index = destinationEnd + 1; continue; }
      }
    }
    result += value[index++];
  }
  return result;
}
function visibleWords(value) {
  let fence = null;
  const visible = [], block = [];
  const flush = () => { if (block.length) { visible.push(inlineVisible(block.join("\n"))); block.length = 0; } };
  for (const line of value.split(/\r\n?|\n/)) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (marker && (!fence || marker[1][0] === fence[0] && marker[1].length >= fence.length)) {
      flush();
      fence = fence ? null : marker[1];
      continue;
    }
    if (fence || /^(?: {4}|\t)/.test(line)) { flush(); visible.push(line); }
    else if (!/^ {0,3}\[[^\]]+\]:\s*\S/.test(line)) block.push(line);
  }
  flush();
  return (visible.join("\n").match(/\S+/g) || []).filter(token => !/^(?:\*+|_+|~+|#+|\$+|\\[\[\]()])$/.test(token)).length;
}
function authoredStructure(value, renderer) {
  const issues = [];
  let fence = null, math = null;
  for (const [index, line] of value.split(/\r\n?|\n/).entries()) {
    const trimmed = line.trim();
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (marker && (!fence || marker[1][0] === fence[0] && marker[1].length >= fence.length)) {
      fence = fence ? null : marker[1];
      continue;
    }
    if (fence) continue;
    if (math) { if (trimmed.includes(math)) math = null; continue; }
    if (trimmed.startsWith("$$") && !trimmed.slice(2).includes("$$")) { math = "$$"; continue; }
    if (trimmed.startsWith("\\[") && !trimmed.slice(2).includes("\\]")) { math = "\\]"; continue; }
    // Four-space indentation is an authored code block, not generated nesting.
    if (/^(?: {4}|\t)/.test(line)) continue;
    const kind = /^ {0,3}(?:[-*+]\s+|\d+[.)]\s+|(?:>\s*)+(?:[-*+]\s+|\d+[.)]\s+))/.test(line) ? "list"
      : /^ {0,3}(?:#{1,6}\s+|\[(?:To answer your question|What has been done|Questions for you|Next steps|Answers to your questions|Status|Questions|Next Steps|Your Questions|I want to know|Decide Next Steps)\]\s*$)/i.test(line) ? "heading"
      : (/^ {0,3}\[\d+\]\s+\S/.test(line) || renderer === V11 && /^ {0,3}\[(?:A|Q|N)\d+\]\s+\S/.test(line)) ? "item"
      : /^ {0,3}<\/?(?:ul|ol|li|h[1-6])\b/i.test(line) ? "list_or_heading" : null;
    if (kind) issues.push({ line: index + 1, marker: kind });
  }
  return issues;
}
module.exports = { responseItems, renderV9Exchange, renderV10Exchange: renderV9Exchange, renderV11Exchange: renderV9Exchange,
  visibleWords, authoredStructure };
