#!/usr/bin/env python3
"""Validate a causal-consultant project YAML state.

This is intentionally dependency-light. It validates the skill's simple state
shape and controlled scalar values without requiring PyYAML.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Any


REQUIRED_TOP_LEVEL = (
    "project_summary",
    "team_synthesis",
    "causal_gate",
    "production_gate",
    "working_agenda",
    "bounded_continuation",
    "next_action",
    "domain_expert",
    "method_lead",
    "data_analyst",
    "analysis_state",
    "subskill_records",
    "retired_tasks",
    "artifact_index",
)

REQUIRED_PATHS = (
    "project_summary.current_phase",
    "team_synthesis.user_turn_summary",
    "team_synthesis.turn_goal",
    "causal_gate.status",
    "causal_gate.blockers",
    "production_gate.status",
    "production_gate.blockers",
    "working_agenda.intent",
    "bounded_continuation.requested",
    "next_action.type",
    "domain_expert.status",
    "method_lead.status",
    "method_lead.selected_framework.fit",
    "data_analyst.status",
    "data_analyst.phase_role",
    "data_analyst.data_status",
    "data_analyst.method_support",
    "data_analyst.method_support.data_compatible_frameworks",
    "data_analyst.method_support.processing_pipeline_suggestions",
    "data_analyst.method_support.learner_plugin_handoffs",
    "data_analyst.method_support.diagnostic_artifact_suggestions",
    "data_analyst.method_support.feasibility_notes",
    "data_analyst.analysis_dataset.construction_status",
    "analysis_state.report_working_draft_path",
    "analysis_state.recommended_method_job_subskills",
    "analysis_state.activated_method_job_subskills",
    "analysis_state.discovery_sidecar.active",
    "analysis_state.discovery_sidecar.return_to_phase",
    "analysis_state.limitations",
)

PHASES = {"project_exploration", "causal_specification", "report_production"}
PROJECT_STATUS = {"active", "paused", "blocked", "complete", "revised", "abandoned"}
GATE_STATUS = {"exploratory", "not_ready", "needs_information", "blocked", "ready", "complete", "deferred"}
PRODUCTION_STATUS = {"not_ready", "blocked", "ready", "complete", "deferred"}
DIAGNOSTICS_STATUS = {"not_started", "planned", "partially_complete", "complete", "deferred", "not_applicable", "unknown"}
CLAIM_STRENGTH = {
    "unknown",
    "exploratory",
    "descriptive",
    "associational",
    "cautious_causal",
    "supported_causal",
    "no_causal_claim",
}
REVIEWER_STATUS = {"not_reviewed", "needs_information", "reviewed", "blocked", "deferred", "unknown"}
AGENDA_PRIORITY = {"low", "medium", "high", "urgent", "unknown"}
NEXT_ACTION_TYPE = {
    "answer",
    "question",
    "summarize",
    "explain_tension",
    "propose_analysis",
    "run_analysis",
    "activate_subskill",
    "update_gate",
    "deliver_artifact",
    "revise_artifact",
    "pause",
    "wait",
}
FRAMEWORK_FIT = {"unknown", "direct", "adapted", "exploratory", "blocked", "not_applicable"}
DATA_STATUS = {"none", "user_described", "available_not_inspected", "inspected", "analysis_ready", "unavailable", "unknown"}
CONSTRUCTION_STATUS = {"not_started", "in_progress", "complete", "blocked", "deferred", "not_applicable"}

ALLOWED_VALUES = {
    "project_summary.current_phase": PHASES,
    "project_summary.project_status": PROJECT_STATUS,
    "causal_gate.status": GATE_STATUS,
    "production_gate.status": PRODUCTION_STATUS,
    "production_gate.diagnostics_status": DIAGNOSTICS_STATUS,
    "causal_gate.claim_strength_allowed": CLAIM_STRENGTH,
    "production_gate.claim_strength_for_report": CLAIM_STRENGTH,
    "domain_expert.status": REVIEWER_STATUS,
    "method_lead.status": REVIEWER_STATUS,
    "data_analyst.status": REVIEWER_STATUS,
    "working_agenda.priority": AGENDA_PRIORITY,
    "next_action.type": NEXT_ACTION_TYPE,
    "method_lead.selected_framework.fit": FRAMEWORK_FIT,
    "data_analyst.phase_role": PHASES | {"unknown"},
    "data_analyst.data_status": DATA_STATUS,
    "data_analyst.analysis_dataset.construction_status": CONSTRUCTION_STATUS,
    "analysis_state.discovery_sidecar.return_to_phase": PHASES,
}

BOOLEAN_PATHS = {
    "team_synthesis.ready_to_reply",
    "production_gate.reportable_evidence",
    "bounded_continuation.requested",
    "bounded_continuation.acknowledged_limits",
    "next_action.needs_user_response",
    "analysis_state.discovery_sidecar.active",
    "analysis_state.discovery_sidecar.affects_main_framework",
}


def strip_comment(line: str) -> str:
    quote: str | None = None
    escaped = False
    for index, char in enumerate(line):
        if escaped:
            escaped = False
            continue
        if char == "\\":
            escaped = True
            continue
        if quote:
            if char == quote:
                quote = None
            continue
        if char in {"'", '"'}:
            quote = char
            continue
        if char == "#":
            return line[:index]
    return line


def parse_scalar(raw: str) -> Any:
    value = raw.strip()
    if not value:
        return None
    if value in {"[]", "[ ]"}:
        return []
    if value in {"{}", "{ }"}:
        return {}
    lowered = value.lower()
    if lowered in {"null", "~"}:
        return None
    if lowered == "true":
        return True
    if lowered == "false":
        return False
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        return value[1:-1]
    return value


def scan_yaml(path: Path) -> tuple[dict[str, Any], dict[str, int], set[str]]:
    values: dict[str, Any] = {}
    lines: dict[str, int] = {}
    present: set[str] = set()
    stack: list[tuple[int, str]] = []

    for line_no, raw_line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = strip_comment(raw_line).rstrip()
        if not line.strip() or line.strip() == "---":
            continue

        indent = len(line) - len(line.lstrip(" "))
        text = line.strip()

        while stack and stack[-1][0] >= indent:
            stack.pop()

        if text.startswith("- "):
            current_path = ".".join(key for _, key in stack)
            item = text[2:].strip()
            if ":" in item:
                continue
            values.setdefault(current_path, [])
            if not isinstance(values[current_path], list):
                values[current_path] = [values[current_path]]
            values[current_path].append(parse_scalar(item))
            lines.setdefault(current_path, line_no)
            continue

        if ":" not in text:
            continue

        key, raw_value = text.split(":", 1)
        key = key.strip()
        current_path = ".".join([*(key for _, key in stack), key])
        present.add(current_path)
        lines[current_path] = line_no

        raw_value = raw_value.strip()
        if raw_value:
            values[current_path] = parse_scalar(raw_value)
        else:
            values.setdefault(current_path, None)
        stack.append((indent, key))

    return values, lines, present


def format_path(path: str, lines: dict[str, int]) -> str:
    line = lines.get(path)
    return f"{path} (line {line})" if line else path


def validate(project_path: Path) -> tuple[list[str], list[str]]:
    values, lines, present = scan_yaml(project_path)
    errors: list[str] = []
    warnings: list[str] = []

    for top_level in REQUIRED_TOP_LEVEL:
        if top_level not in present:
            errors.append(f"Missing top-level section: {top_level}")

    for required_path in REQUIRED_PATHS:
        if required_path not in present:
            errors.append(f"Missing required path: {required_path}")

    for path, allowed in ALLOWED_VALUES.items():
        if path not in present:
            continue
        value = values.get(path)
        if value is None or value == []:
            continue
        check_values = value if isinstance(value, list) else [value]
        for item in check_values:
            if item not in allowed:
                errors.append(
                    f"Invalid value at {format_path(path, lines)}: {item!r}. "
                    f"Allowed: {', '.join(sorted(allowed))}"
                )

    for path in BOOLEAN_PATHS:
        if path in present:
            value = values.get(path)
            if value is not None and not isinstance(value, bool):
                errors.append(f"Expected boolean at {format_path(path, lines)}, found {value!r}")

    if values.get("project_summary.current_phase") == "report_production":
        causal_status = values.get("causal_gate.status")
        causal_blockers = values.get("causal_gate.blockers")
        if causal_status not in {"ready", "complete"}:
            warnings.append("current_phase is report_production but causal_gate.status is not ready/complete.")
        if causal_blockers not in (None, []):
            warnings.append("current_phase is report_production but causal_gate.blockers is non-empty.")

    if values.get("analysis_state.discovery_sidecar.active") is True and not values.get(
        "analysis_state.discovery_sidecar.return_to_phase"
    ):
        errors.append("discovery_sidecar.active is true, but return_to_phase is empty.")

    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a causal-consultant project YAML state.")
    parser.add_argument("--project", required=True, help="Path to the project YAML state file.")
    args = parser.parse_args()

    project_path = Path(args.project)
    if not project_path.exists():
        print(f"Project file not found: {project_path}", file=sys.stderr)
        return 2

    errors, warnings = validate(project_path)
    for warning in warnings:
        print(f"WARNING: {warning}", file=sys.stderr)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    print(f"OK: {project_path} passed causal-consultant state validation.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
