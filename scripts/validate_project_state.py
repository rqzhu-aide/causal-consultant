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

from validate_subskill_record import validate_text as validate_subskill_record_text


REQUIRED_TOP_LEVEL = (
    "project_summary",
    "team_synthesis",
    "causal_gate",
    "production_gate",
    "working_agenda",
    "variable_roster",
    "bounded_continuation",
    "next_action",
    "domain_expert",
    "data_analyst",
    "method_lead",
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
    "data_analyst.status",
    "data_analyst.phase_role",
    "data_analyst.data_status",
    "data_analyst.method_support",
    "data_analyst.method_support.data_compatible_frameworks",
    "data_analyst.method_support.processing_pipeline_suggestions",
    "data_analyst.method_support.learner_plugin_handoffs",
    "data_analyst.method_support.diagnostic_artifact_suggestions",
    "data_analyst.method_support.feasibility_notes",
    "data_analyst.analysis_alignment",
    "data_analyst.analysis_alignment.status",
    "data_analyst.analysis_alignment.aligned_to",
    "data_analyst.analysis_alignment.checked_against",
    "data_analyst.analysis_alignment.requirement_checks",
    "data_analyst.analysis_alignment.data_simplifications_affecting_claims",
    "data_analyst.analysis_alignment.unsupported_or_overstated_claims",
    "data_analyst.analysis_alignment.data_supported_claim_ceiling",
    "data_analyst.analysis_alignment.requests_for_resolution",
    "data_analyst.analysis_dataset.construction_status",
    "method_lead.status",
    "method_lead.selected_framework.fit",
    "method_lead.causal_structure",
    "method_lead.causal_structure.identification_status",
    "analysis_state.report_working_draft_path",
    "analysis_state.report_structure_notes_path",
    "analysis_state.recommended_method_job_subskills",
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
CLAIM_STRENGTH_ORDER = {
    "unknown": 0,
    "no_causal_claim": 0,
    "exploratory": 1,
    "descriptive": 2,
    "associational": 3,
    "cautious_causal": 4,
    "supported_causal": 5,
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
IDENTIFICATION_STATUS = {"unknown", "not_assessed", "not_identified", "partially_identified", "identified", "blocked"}
VARIABLE_DATA_STATUS = {"available", "constructible", "proxy_only", "needs_inspection", "unavailable", "ambiguous"}
VARIABLE_METHOD_ROLE = {
    "exposure",
    "intervention",
    "comparator",
    "outcome",
    "confounder",
    "mediator",
    "collider",
    "instrument",
    "effect_modifier",
    "selection",
    "censoring",
    "id",
    "time",
    "cluster",
    "variable_family",
    "diagnostic_only",
    "unknown",
    "other",
}
DATA_STATUS = {"none", "user_described", "available_not_inspected", "inspected", "analysis_ready", "unavailable", "unknown"}
CONSTRUCTION_STATUS = {"not_started", "in_progress", "complete", "blocked", "deferred", "not_applicable"}
ALIGNMENT_STATUS = {"not_checked", "checked", "needs_update", "blocked", "deferred", "not_applicable"}
ALIGNMENT_DATA_SUPPORT = {
    "directly_supported",
    "constructible_with_processing",
    "proxy_only",
    "needs_inspection",
    "unsupported",
    "contradicted",
    "not_applicable",
}
ALIGNMENT_GAP_TYPE = {
    "missing_variable",
    "timing_unclear",
    "proxy_only",
    "support_problem",
    "selection_or_censoring",
    "provenance_unverified",
    "simplification",
    "diagnostic_missing",
    "none",
}
ALIGNMENT_CLAIM_IMPACT = {
    "no_material_impact",
    "weakens_claim",
    "blocks_causal_claim",
    "blocks_reportable_evidence",
    "requires_bounded_continuation",
}
ARTIFACT_INDEX_TYPE = {"subskill", "template", "reference", "script", "asset", "other"}
PACKAGE_PATH_PREFIXES = ("subskills/", "assets/", "references/", "scripts/")
PROJECT_OUTPUT_PATH_PREFIXES = (
    "artifact/",
    "artifacts/",
    "analysis/",
    "analyses/",
    "dataset/",
    "datasets/",
    "figure/",
    "figures/",
    "notebook/",
    "notebooks/",
    "output/",
    "outputs/",
    "report/",
    "reports/",
    "result/",
    "results/",
    "table/",
    "tables/",
)

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
    "method_lead.causal_structure.identification_status": IDENTIFICATION_STATUS,
    "data_analyst.phase_role": PHASES | {"unknown"},
    "data_analyst.data_status": DATA_STATUS,
    "data_analyst.analysis_alignment.status": ALIGNMENT_STATUS,
    "data_analyst.analysis_alignment.data_supported_claim_ceiling": CLAIM_STRENGTH,
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


def validate_variable_roster(path: Path, errors: list[str]) -> None:
    roster_indent: int | None = None
    in_roster = False

    for line_no, raw_line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = strip_comment(raw_line).rstrip()
        if not line.strip() or line.strip() == "---":
            continue

        indent = len(line) - len(line.lstrip(" "))
        text = line.strip()

        if text.startswith("variable_roster:"):
            roster_indent = indent
            in_roster = text not in {"variable_roster: []", "variable_roster: [ ]"}
            continue

        if not in_roster or roster_indent is None:
            continue

        if indent <= roster_indent and not text.startswith("- "):
            in_roster = False
            roster_indent = None
            continue

        item_text = text[2:].strip() if text.startswith("- ") else text
        if ":" not in item_text:
            continue

        key, raw_value = item_text.split(":", 1)
        key = key.strip()
        value = parse_scalar(raw_value)
        if value in (None, []):
            continue

        if key == "data_status" and value not in VARIABLE_DATA_STATUS:
            errors.append(
                f"Invalid value at variable_roster[].data_status (line {line_no}): {value!r}. "
                f"Allowed: {', '.join(sorted(VARIABLE_DATA_STATUS))}"
            )
        if key == "method_role" and value not in VARIABLE_METHOD_ROLE:
            errors.append(
                f"Invalid value at variable_roster[].method_role (line {line_no}): {value!r}. "
                f"Allowed: {', '.join(sorted(VARIABLE_METHOD_ROLE))}"
            )


def validate_analysis_alignment(path: Path, errors: list[str]) -> None:
    """Validate controlled values inside data_analyst.analysis_alignment lists."""

    alignment_indent: int | None = None
    checks_indent: int | None = None
    in_alignment = False
    in_checks = False

    allowed_by_key = {
        "data_support": ALIGNMENT_DATA_SUPPORT,
        "gap_type": ALIGNMENT_GAP_TYPE,
        "claim_impact": ALIGNMENT_CLAIM_IMPACT,
    }

    for line_no, raw_line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = strip_comment(raw_line).rstrip()
        if not line.strip() or line.strip() == "---":
            continue

        indent = len(line) - len(line.lstrip(" "))
        text = line.strip()

        if text.startswith("analysis_alignment:"):
            alignment_indent = indent
            in_alignment = text not in {"analysis_alignment: []", "analysis_alignment: [ ]"}
            in_checks = False
            checks_indent = None
            continue

        if in_alignment and alignment_indent is not None and indent <= alignment_indent:
            in_alignment = False
            in_checks = False
            alignment_indent = None
            checks_indent = None
            continue

        if not in_alignment:
            continue

        if text.startswith("requirement_checks:"):
            checks_indent = indent
            in_checks = text not in {"requirement_checks: []", "requirement_checks: [ ]"}
            continue

        if in_checks and checks_indent is not None and indent <= checks_indent and not text.startswith("- "):
            in_checks = False
            checks_indent = None

        if not in_checks:
            continue

        item_text = text[2:].strip() if text.startswith("- ") else text
        if ":" not in item_text:
            continue

        key, raw_value = item_text.split(":", 1)
        key = key.strip()
        if key not in allowed_by_key:
            continue

        value = parse_scalar(raw_value)
        if value in (None, []):
            continue

        allowed = allowed_by_key[key]
        if value not in allowed:
            errors.append(
                f"Invalid value at data_analyst.analysis_alignment.requirement_checks[].{key} "
                f"(line {line_no}): {value!r}. Allowed: {', '.join(sorted(allowed))}"
            )


def validate_artifact_index(path: Path, errors: list[str], warnings: list[str]) -> None:
    artifact_index_indent: int | None = None
    in_artifact_index = False
    entries: list[dict[str, tuple[Any, int]]] = []
    current: dict[str, tuple[Any, int]] | None = None

    for line_no, raw_line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = strip_comment(raw_line).rstrip()
        if not line.strip() or line.strip() == "---":
            continue

        indent = len(line) - len(line.lstrip(" "))
        text = line.strip()

        if text.startswith("artifact_index:"):
            artifact_index_indent = indent
            in_artifact_index = text not in {"artifact_index: []", "artifact_index: [ ]"}
            current = None
            continue

        if not in_artifact_index or artifact_index_indent is None:
            continue

        if indent <= artifact_index_indent and not text.startswith("- "):
            in_artifact_index = False
            artifact_index_indent = None
            current = None
            continue

        if text.startswith("- "):
            current = {}
            entries.append(current)
            item_text = text[2:].strip()
        else:
            item_text = text

        if current is None or ":" not in item_text:
            continue

        key, raw_value = item_text.split(":", 1)
        current[key.strip()] = (parse_scalar(raw_value), line_no)

    for index, entry in enumerate(entries, start=1):
        entry_label = entry.get("artifact_id", (f"entry {index}", 0))[0] or f"entry {index}"
        artifact_type, type_line = entry.get("artifact_type", (None, 0))
        artifact_path, path_line = entry.get("path", (None, 0))

        if not artifact_type:
            errors.append(f"Missing artifact_index[].artifact_type for {entry_label!r}.")
        elif artifact_type not in ARTIFACT_INDEX_TYPE:
            errors.append(
                f"Invalid artifact_index[].artifact_type for {entry_label!r} "
                f"(line {type_line}): {artifact_type!r}. Allowed: {', '.join(sorted(ARTIFACT_INDEX_TYPE))}"
            )

        if not artifact_path:
            errors.append(f"Missing artifact_index[].path for {entry_label!r}.")
            continue
        if not isinstance(artifact_path, str):
            errors.append(
                f"Expected artifact_index[].path for {entry_label!r} to be a string "
                f"(line {path_line}), found {artifact_path!r}"
            )
            continue

        normalized = artifact_path.replace("\\", "/").lstrip("./").lower()
        if normalized.startswith(PROJECT_OUTPUT_PATH_PREFIXES):
            errors.append(
                f"Project-output path used in artifact_index for {entry_label!r} "
                f"(line {path_line}): {artifact_path!r}. Record project outputs in analysis_state, "
                "subskill_records, reviewer output fields, or the working report instead."
            )
        elif not normalized.startswith(PACKAGE_PATH_PREFIXES):
            warnings.append(
                f"artifact_index path for {entry_label!r} is outside the usual package folders "
                f"(line {path_line}): {artifact_path!r}. Expected one of: "
                f"{', '.join(PACKAGE_PATH_PREFIXES)}"
            )


def has_content(value: Any) -> bool:
    return value not in (None, [], "")


def deindent_sequence_item(item_lines: list[str], start_line: int) -> str:
    record_lines: list[str] = []
    for index, line in enumerate(item_lines):
        if index == 0:
            marker_index = line.find("-")
            after_marker = line[marker_index + 1 :] if marker_index >= 0 else line
            if after_marker.startswith(" "):
                after_marker = after_marker[1:]
            if after_marker.strip():
                record_lines.append(after_marker)
            continue

        if line.startswith("    "):
            record_lines.append(line[4:])
        elif line.strip():
            record_lines.append(line.lstrip())
        else:
            record_lines.append("")

    return ("\n" * (start_line - 1)) + "\n".join(record_lines) + "\n"


def extract_top_level_sequence_items(
    project_path: Path,
    section_name: str,
    errors: list[str],
) -> list[tuple[int, str]]:
    raw_lines = project_path.read_text(encoding="utf-8").splitlines()

    section_index: int | None = None
    for index, raw_line in enumerate(raw_lines):
        line = strip_comment(raw_line).rstrip()
        if not line.strip():
            continue
        indent = len(line) - len(line.lstrip(" "))
        text = line.strip()
        if indent == 0 and text.startswith(f"{section_name}:"):
            section_index = index
            raw_value = text.split(":", 1)[1].strip()
            if raw_value in {"[]", "[ ]"}:
                return []
            if raw_value:
                errors.append(
                    f"{section_name} must be an empty list or block list "
                    f"(line {index + 1}), found {raw_value!r}."
                )
                return []
            break

    if section_index is None:
        return []

    items: list[tuple[int, str]] = []
    current_lines: list[str] = []
    current_start_line: int | None = None

    for index in range(section_index + 1, len(raw_lines)):
        raw_line = raw_lines[index]
        line = strip_comment(raw_line).rstrip()
        if not line.strip():
            if current_lines:
                current_lines.append(raw_line)
            continue

        indent = len(line) - len(line.lstrip(" "))
        text = line.strip()
        if indent == 0:
            break

        if indent == 2 and text.startswith("-"):
            if current_lines and current_start_line is not None:
                items.append(
                    (current_start_line, deindent_sequence_item(current_lines, current_start_line))
                )
            current_lines = [raw_line]
            current_start_line = index + 1
            continue

        if current_start_line is None:
            errors.append(
                f"{section_name} has content before its first list item "
                f"(line {index + 1})."
            )
            continue
        current_lines.append(raw_line)

    if current_lines and current_start_line is not None:
        items.append((current_start_line, deindent_sequence_item(current_lines, current_start_line)))

    return items


def validate_subskill_records(project_path: Path, errors: list[str]) -> None:
    records = extract_top_level_sequence_items(project_path, "subskill_records", errors)
    for index, (start_line, record_text) in enumerate(records, start=1):
        record_errors = validate_subskill_record_text(record_text)
        for error in record_errors:
            errors.append(f"subskill_records[{index}] starting line {start_line}: {error}")


def validate_gate_consistency(values: dict[str, Any], errors: list[str], warnings: list[str]) -> None:
    current_phase = values.get("project_summary.current_phase")
    causal_status = values.get("causal_gate.status")
    causal_blockers = values.get("causal_gate.blockers")
    causal_unresolved = values.get("causal_gate.unresolved_required_information")
    causal_claim = values.get("causal_gate.claim_strength_allowed")
    production_status = values.get("production_gate.status")
    production_blockers = values.get("production_gate.blockers")
    production_unresolved = values.get("production_gate.unresolved_required_materials")
    production_claim = values.get("production_gate.claim_strength_for_report")
    bounded_requested = values.get("bounded_continuation.requested") is True
    bounded_acknowledged = values.get("bounded_continuation.acknowledged_limits") is True
    alignment_status = values.get("data_analyst.analysis_alignment.status")
    alignment_ceiling = values.get("data_analyst.analysis_alignment.data_supported_claim_ceiling")
    missing_or_weak_alignment = values.get("data_analyst.analysis_alignment.unsupported_or_overstated_claims")
    data_simplifications = values.get("data_analyst.analysis_alignment.data_simplifications_affecting_claims")

    if causal_claim in CLAIM_STRENGTH_ORDER and production_claim in CLAIM_STRENGTH_ORDER:
        if CLAIM_STRENGTH_ORDER[production_claim] > CLAIM_STRENGTH_ORDER[causal_claim]:
            errors.append(
                "production_gate.claim_strength_for_report is stronger than "
                "causal_gate.claim_strength_allowed."
            )

    if alignment_ceiling in CLAIM_STRENGTH_ORDER and alignment_ceiling != "unknown":
        if causal_claim in CLAIM_STRENGTH_ORDER and CLAIM_STRENGTH_ORDER[causal_claim] > CLAIM_STRENGTH_ORDER[alignment_ceiling]:
            warnings.append(
                "causal_gate.claim_strength_allowed is stronger than "
                "data_analyst.analysis_alignment.data_supported_claim_ceiling."
            )
        if production_claim in CLAIM_STRENGTH_ORDER and CLAIM_STRENGTH_ORDER[production_claim] > CLAIM_STRENGTH_ORDER[alignment_ceiling]:
            warnings.append(
                "production_gate.claim_strength_for_report is stronger than "
                "data_analyst.analysis_alignment.data_supported_claim_ceiling."
            )

    if causal_status in {"ready", "complete"}:
        if has_content(causal_blockers):
            warnings.append(
                "causal_gate.status is ready/complete while causal_gate.blockers is non-empty. "
                "Keep blockers unresolved unless they are actually resolved or visibly deferred with claim limits."
            )
        if has_content(causal_unresolved):
            warnings.append(
                "causal_gate.status is ready/complete while causal_gate.unresolved_required_information is non-empty."
            )
        if alignment_status == "blocked":
            warnings.append(
                "causal_gate.status is ready/complete while data_analyst.analysis_alignment.status is blocked."
            )

    if production_status in {"ready", "complete"}:
        if has_content(production_blockers):
            warnings.append(
                "production_gate.status is ready/complete while production_gate.blockers is non-empty. "
                "Keep report limitations visible or lower the gate status."
            )
        if has_content(production_unresolved):
            warnings.append(
                "production_gate.status is ready/complete while production_gate.unresolved_required_materials is non-empty."
            )
        if alignment_status == "blocked":
            warnings.append(
                "production_gate.status is ready/complete while data_analyst.analysis_alignment.status is blocked."
            )

    if causal_status in {"blocked", "not_ready", "needs_information"} and causal_claim in {
        "cautious_causal",
        "supported_causal",
    }:
        warnings.append(
            "causal_gate has unresolved/not-ready status but allows causal claim language. "
            "Check whether claim_strength_allowed should be weaker."
        )

    if current_phase == "report_production":
        if alignment_status in {None, "not_checked", "needs_update"}:
            warnings.append(
                "current_phase is report_production but data_analyst.analysis_alignment is not checked/current. "
                "Check data support against the intended claim before reportable interpretation."
            )
        causal_ready = causal_status in {"ready", "complete"} and not has_content(causal_blockers)
        if not causal_ready:
            if bounded_requested and bounded_acknowledged:
                warnings.append(
                    "current_phase is report_production under bounded_continuation. "
                    "This is allowed only for qualified production work; keep causal_gate blockers visible."
                )
            else:
                warnings.append(
                    "current_phase is report_production but causal_gate is not ready/complete or has blockers, "
                    "and bounded_continuation is not acknowledged."
                )

    if values.get("production_gate.reportable_evidence") is True:
        if alignment_status in {None, "not_checked", "needs_update"}:
            warnings.append(
                "production_gate.reportable_evidence is true but data_analyst.analysis_alignment is not checked/current."
            )
        if alignment_status == "blocked":
            warnings.append(
                "production_gate.reportable_evidence is true while data_analyst.analysis_alignment.status is blocked."
            )

    if causal_status in {"ready", "complete"} and has_content(missing_or_weak_alignment):
        warnings.append(
            "causal_gate.status is ready/complete while data_analyst.analysis_alignment.unsupported_or_overstated_claims "
            "is non-empty. Keep claim limits visible or lower gate readiness."
        )

    if production_status in {"ready", "complete"} and (
        has_content(missing_or_weak_alignment) or has_content(data_simplifications)
    ):
        warnings.append(
            "production_gate.status is ready/complete while analysis_alignment records unsupported claims or "
            "claim-affecting data simplifications. Ensure the report explicitly reflects them."
        )

    if bounded_requested:
        if not bounded_acknowledged:
            warnings.append(
                "bounded_continuation.requested is true but acknowledged_limits is false. "
                "Do not continue beyond warning or clarification until limits are acknowledged."
            )
        if not has_content(values.get("bounded_continuation.allowed_scope")):
            warnings.append("bounded_continuation.requested is true but allowed_scope is empty.")
        if not has_content(values.get("bounded_continuation.prohibited_claims")):
            warnings.append("bounded_continuation.requested is true but prohibited_claims is empty.")
        if not has_content(values.get("bounded_continuation.warning")):
            warnings.append("bounded_continuation.requested is true but warning is empty.")


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

    validate_variable_roster(project_path, errors)
    validate_analysis_alignment(project_path, errors)
    validate_artifact_index(project_path, errors, warnings)
    validate_subskill_records(project_path, errors)
    validate_gate_consistency(values, errors, warnings)

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
