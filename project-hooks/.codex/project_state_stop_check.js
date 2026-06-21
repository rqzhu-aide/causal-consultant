#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function emit(obj) {
  process.stdout.write(`${JSON.stringify(obj)}\n`);
}

function readHookInput() {
  try {
    const raw = fs.readFileSync(0, "utf8").trim();
    return raw ? JSON.parse(raw) : {};
  } catch (_error) {
    return {};
  }
}

function findProjectRoot(input) {
  const candidates = [
    input && typeof input.cwd === "string" ? input.cwd : null,
    input && typeof input.projectRoot === "string" ? input.projectRoot : null,
    process.env.CLAUDE_PROJECT_DIR,
    process.env.CODEX_PROJECT_DIR,
    process.env.PWD,
    process.cwd(),
  ];

  const selected = candidates.find((value) => typeof value === "string" && value.trim());
  return path.resolve(selected || process.cwd());
}

function truncate(text, limit = 300) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length <= limit ? clean : `${clean.slice(0, limit - 3)}...`;
}

function stripComment(text) {
  let single = false;
  let double = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const prev = i > 0 ? text[i - 1] : "";
    if (ch === "'" && !double) single = !single;
    if (ch === '"' && !single && prev !== "\\") double = !double;
    if (ch === "#" && !single && !double) return text.slice(0, i).trimEnd();
  }

  return text.trimEnd();
}

function checkInlineSyntax(text) {
  let single = false;
  let double = false;
  const stack = [];
  const pairs = { "]": "[", "}": "{", ")": "(" };

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const prev = i > 0 ? text[i - 1] : "";
    if (ch === "'" && !double) {
      single = !single;
      continue;
    }
    if (ch === '"' && !single && prev !== "\\") {
      double = !double;
      continue;
    }
    if (single || double) continue;
    if (ch === "[" || ch === "{" || ch === "(") stack.push(ch);
    if (ch === "]" || ch === "}" || ch === ")") {
      if (stack.pop() !== pairs[ch]) return "unbalanced inline brackets";
    }
  }

  if (single || double) return "unbalanced quotes";
  if (stack.length) return "unbalanced inline brackets";
  return null;
}

function validateWithInstalledParser(text) {
  const parserNames = ["yaml", "js-yaml"];

  for (const name of parserNames) {
    try {
      const parser = require(name);
      if (name === "yaml") parser.parse(text);
      else parser.load(text);
      return null;
    } catch (error) {
      if (error && error.code === "MODULE_NOT_FOUND") continue;
      return truncate(error && error.message ? error.message : error);
    }
  }

  return undefined;
}

function validateTolerantTextShape(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];
    if (!raw.trim() || raw.trimStart().startsWith("#")) continue;
    if (/^\s*\t/.test(raw)) return `line ${index + 1}: tab indentation`;

    const content = stripComment(raw);
    if (!content) continue;

    const inlineError = checkInlineSyntax(content);
    if (inlineError) return `line ${index + 1}: ${inlineError}`;
  }

  return null;
}

function lineIndent(line) {
  return line.match(/^ */)[0].length;
}

function isIgnorableLine(line) {
  return !line.trim() || line.trimStart().startsWith("#");
}

function blockForPath(lines, pathParts) {
  let start = -1;
  let end = lines.length;
  let searchStart = 0;
  let searchEnd = lines.length;

  for (let depth = 0; depth < pathParts.length; depth += 1) {
    const key = pathParts[depth];
    const indent = depth * 2;
    start = -1;

    for (let i = searchStart; i < searchEnd; i += 1) {
      const line = lines[i];
      if (isIgnorableLine(line)) continue;
      if (lineIndent(line) === indent && line.trimStart().startsWith(`${key}:`)) {
        start = i;
        break;
      }
    }

    if (start < 0) return null;

    end = lines.length;
    for (let i = start + 1; i < searchEnd; i += 1) {
      const line = lines[i];
      if (isIgnorableLine(line)) continue;
      if (lineIndent(line) <= indent) {
        end = i;
        break;
      }
    }

    searchStart = start + 1;
    searchEnd = end;
  }

  return { start, end };
}

function scalarAtPath(lines, pathParts) {
  if (!pathParts.length) return undefined;
  const parentPath = pathParts.slice(0, -1);
  const key = pathParts[pathParts.length - 1];
  const indent = parentPath.length * 2;
  const parentBlock = parentPath.length
    ? blockForPath(lines, parentPath)
    : { start: -1, end: lines.length };

  if (!parentBlock) return undefined;

  for (let i = parentBlock.start + 1; i < parentBlock.end; i += 1) {
    const line = lines[i];
    if (isIgnorableLine(line)) continue;
    if (lineIndent(line) !== indent) continue;
    const content = stripComment(line.trimStart());
    if (!content.startsWith(`${key}:`)) continue;
    return content.slice(key.length + 1).trim();
  }

  return undefined;
}

function normalizeScalar(raw) {
  if (raw === undefined) return undefined;
  const value = String(raw).trim();
  if (!value) return "";
  if (value === "~" || value.toLowerCase() === "null") return null;
  if (value.toLowerCase() === "true") return "true";
  if (value.toLowerCase() === "false") return "false";
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function hasTopLevelSection(lines, key) {
  return Boolean(blockForPath(lines, [key]));
}

function validateStateStructure(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const issues = [];
  const requiredSections = [
    "project_summary",
    "council_chamber",
    "next_step_plan",
    "data_facts",
    "domain_knowledge",
    "causal_facts",
    "discovery_sidecar",
    "report_assembly",
    "artifact_records",
  ];

  for (const section of requiredSections) {
    if (!hasTopLevelSection(lines, section)) issues.push(`missing top-level section: ${section}`);
  }

  function value(pathParts) {
    return normalizeScalar(scalarAtPath(lines, pathParts));
  }

  function requireEnum(pathParts, allowed) {
    const current = value(pathParts);
    const label = pathParts.join(".");
    if (current === undefined) {
      issues.push(`missing key: ${label}`);
      return undefined;
    }
    if (!allowed.includes(current)) {
      issues.push(`${label} must be one of ${allowed.join(", ")}`);
    }
    return current;
  }

  function requireBoolean(pathParts) {
    return requireEnum(pathParts, ["true", "false"]);
  }

  const dataComplete = requireBoolean(["project_summary", "data_audit_complete"]);
  const domainComplete = requireBoolean(["project_summary", "domain_knowledge_complete"]);
  const causalComplete = requireBoolean(["project_summary", "causal_check_complete"]);
  const explorationComplete = requireBoolean(["project_summary", "exploration_complete"]);
  requireEnum(["project_summary", "phase"], ["exploration", "analysis", "reporting"]);
  const analysisOutput = requireEnum(["project_summary", "analysis_output"], ["exist", "non_exist"]);
  requireEnum(["project_summary", "discovery_sidecar_output"], ["exist", "non_exist"]);
  const reportOutput = requireEnum(["project_summary", "report_output"], ["exist", "non_exist"]);

  const dataChecked = requireEnum(
    ["data_facts", "data_checked"],
    ["not_checked", "passing", "limited", "imagined", "blocked"],
  );
  const domainChecked = requireEnum(
    ["domain_knowledge", "domain_checked"],
    ["not_checked", "passing", "limited", "blocked"],
  );
  const causalChecked = requireEnum(
    ["causal_facts", "causal_checked"],
    ["not_checked", "passing", "limited", "blocked"],
  );
  requireEnum(["causal_facts", "analysis_readiness"], ["ready", "limited", "not_ready", "blocked"]);
  requireEnum(["discovery_sidecar", "status"], [
    "not_started",
    "scoped",
    "artifact_created",
    "reviewed",
    "blocked",
  ]);

  const reportFormat = requireEnum(["report_assembly", "current_format"], [null, "md", "html"]);
  const reportStatus = value(["council_chamber", "report_writer", "current_status"]);

  if (dataComplete === "true" && !["passing", "limited"].includes(dataChecked)) {
    issues.push("project_summary.data_audit_complete is true but data_facts.data_checked is not passing or limited");
  }
  if (domainComplete === "true" && !["passing", "limited"].includes(domainChecked)) {
    issues.push("project_summary.domain_knowledge_complete is true but domain_knowledge.domain_checked is not passing or limited");
  }
  if (causalComplete === "true" && !["passing", "limited"].includes(causalChecked)) {
    issues.push("project_summary.causal_check_complete is true but causal_facts.causal_checked is not passing or limited");
  }
  if (explorationComplete === "true" && [dataComplete, domainComplete, causalComplete].some((flag) => flag !== "true")) {
    issues.push("project_summary.exploration_complete is true but one or more core completion flags are false");
  }
  if (reportOutput === "exist" && !["md", "html"].includes(reportFormat)) {
    issues.push("project_summary.report_output is exist but report_assembly.current_format is not md or html");
  }
  if (reportOutput === "exist" && reportStatus !== "done") {
    issues.push("project_summary.report_output is exist but council_chamber.report_writer.current_status is not done");
  }
  if (reportOutput === "non_exist" && ["md", "html"].includes(reportFormat)) {
    issues.push("project_summary.report_output is non_exist but report_assembly.current_format is md or html");
  }
  if (analysisOutput === "non_exist") {
    // No further consistency check. Some preparatory artifacts are intentionally not analysis output.
  }

  return issues;
}

function validateYamlFile(projectStatePath) {
  const text = fs.readFileSync(projectStatePath, "utf8");
  const parserError = validateWithInstalledParser(text);
  if (parserError === null) {
    const structureIssues = validateStateStructure(text);
    return structureIssues.length ? structureIssues.join("; ") : null;
  }
  if (parserError) return parserError;
  const textError = validateTolerantTextShape(text);
  if (textError) return textError;
  const structureIssues = validateStateStructure(text);
  return structureIssues.length ? structureIssues.join("; ") : null;
}

function main() {
  const input = readHookInput();
  const projectRoot = findProjectRoot(input);
  const projectStatePath = path.join(projectRoot, "project_state.yaml");

  if (!fs.existsSync(projectStatePath)) {
    emit({
      systemMessage:
        "project_state.yaml does not exist; causal-consultant performance will not be ensured.",
      suppressOutput: true,
    });
    return;
  }

  const error = validateYamlFile(projectStatePath);
  if (!error) {
    emit({ suppressOutput: true });
    return;
  }

  emit({
    decision: "block",
    reason: `project_state.yaml structure or state check failed: ${truncate(error)}`,
    systemMessage: "project_state.yaml needs structure or state-flag repair.",
  });
}

main();
