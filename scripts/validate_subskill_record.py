#!/usr/bin/env python3
"""Validate a standalone method/task subskill record.

The validator is dependency-light and intended for records based on
assets/method_job_subskill_record_template.yaml.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any


COMMON_REQUIRED_PATHS = (
    "subskill_id",
    "module_type",
    "role",
    "status",
    "activation_reason",
    "inputs_reviewed",
    "provenance_summary",
    "fit_summary",
    "fit_summary.fit",
    "fit_summary.reason",
    "type_specific",
    "assumptions_or_requirements",
    "statistical_evidence",
    "statistical_evidence.status",
    "statistical_evidence.claim_scope",
    "statistical_evidence.inference_or_validation_route",
    "statistical_evidence.method_specific_limits",
    "diagnostics_needed",
    "diagnostics_reviewed",
    "sensitivity_or_robustness",
    "limitations",
    "requests",
    "requests.domain_expert",
    "requests.data_analyst",
    "requests.method_lead",
    "requests.user",
    "requests.other_subskills",
    "report_support",
    "readiness",
    "method_lead_recheck",
    "method_lead_recheck.required",
    "method_lead_recheck.reason",
    "blocking_signal",
    "blocking_signal.blocks_current_phase",
    "blocking_signal.target_phase",
    "blocking_signal.severity",
    "blocking_signal.reason",
    "blocking_signal.affected_sections",
    "recommended_next_action",
    "artifact_paths",
)

TYPE_SPECIFIC_REQUIRED_PATHS = {
    "design_route": (
        "type_specific.design_route",
        "type_specific.design_route.causal_comparison",
        "type_specific.design_route.design_route",
        "type_specific.design_route.identification_status",
        "type_specific.design_route.required_timing",
        "type_specific.design_route.comparison_group_logic",
        "type_specific.design_route.key_identification_assumptions",
        "type_specific.design_route.invalidating_conditions",
        "type_specific.design_route.estimands_supported",
    ),
    "target_goal": (
        "type_specific.target_goal",
        "type_specific.target_goal.target_goal",
        "type_specific.target_goal.estimand_targets",
        "type_specific.target_goal.target_population",
        "type_specific.target_goal.effect_scale",
        "type_specific.target_goal.decision_or_interpretation_goal",
        "type_specific.target_goal.design_route_needed",
        "type_specific.target_goal.reporting_boundary",
    ),
    "implementation_support": (
        "type_specific.implementation_support",
        "type_specific.implementation_support.implementation_role",
        "type_specific.implementation_support.estimator_or_model_family",
        "type_specific.implementation_support.required_data_shape",
        "type_specific.implementation_support.nuisance_or_prediction_components",
        "type_specific.implementation_support.diagnostic_outputs",
        "type_specific.implementation_support.reproducibility_outputs",
        "type_specific.implementation_support.package_or_code_options",
    ),
}

PHASES = {"project_exploration", "causal_specification", "report_production"}
MODULE_TYPES = {
    "design_route",
    "target_goal",
    "implementation_support",
    "discovery_sidecar",
}
ROLES = {
    "primary_route",
    "target_module",
    "implementation_support",
    "diagnostic_module",
    "discovery_module",
    "estimation_module",
    "early_method_advisor",
    "support_module",
}
STATUSES = {
    "candidate",
    "activated",
    "reviewing",
    "plan_proposed",
    "first_pass_supported",
    "diagnostics_reviewed",
    "materials_ready",
    "blocked",
    "deferred",
}
FIT_VALUES = {"unknown", "direct", "adapted", "exploratory", "blocked", "not_applicable"}
READINESS = {
    "unknown",
    "candidate_only",
    "plan_ready",
    "diagnostics_needed",
    "diagnostics_deferred",
    "materials_ready",
    "blocked",
}
STATISTICAL_EVIDENCE_STATUS = {
    "not_assessed",
    "exploratory_only",
    "descriptive_only",
    "internally_validated",
    "inference_supported",
    "externally_validated",
    "blocked",
    "not_applicable",
}
STATISTICAL_EVIDENCE_CLAIM_SCOPE = {
    "unknown",
    "in_sample_only",
    "model_implied",
    "internally_validated",
    "target_sample",
    "target_population",
    "exploratory_only",
    "not_applicable",
}
SEVERITY = {"none", "low", "medium", "high"}
NEXT_ACTIONS = {
    "ask_user",
    "clarify_specification",
    "run_exploratory_analysis",
    "confirm_analysis_plan",
    "run_first_pass",
    "run_diagnostics",
    "activate_specialist",
    "refresh_domain_expert",
    "refresh_data_analyst",
    "refresh_method_lead",
    "refresh_report_writer",
    "proceed_with_caveat",
    "return_to_causal_specification",
    "draft_report",
    "revise_report",
    "pause",
}

ALLOWED_VALUES = {
    "module_type": MODULE_TYPES,
    "role": ROLES,
    "status": STATUSES,
    "fit_summary.fit": FIT_VALUES,
    "readiness": READINESS,
    "statistical_evidence.status": STATISTICAL_EVIDENCE_STATUS,
    "statistical_evidence.claim_scope": STATISTICAL_EVIDENCE_CLAIM_SCOPE,
    "blocking_signal.target_phase": PHASES,
    "blocking_signal.severity": SEVERITY,
    "recommended_next_action": NEXT_ACTIONS,
}

BOOLEAN_PATHS = {
    "method_lead_recheck.required",
    "blocking_signal.blocks_current_phase",
}


def strip_comment(line: str) -> str:
    quote: str | None = None
    for index, char in enumerate(line):
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


def scan_yaml_text(text: str) -> tuple[dict[str, Any], dict[str, int], set[str]]:
    values: dict[str, Any] = {}
    lines: dict[str, int] = {}
    present: set[str] = set()
    stack: list[tuple[int, str]] = []

    for line_no, raw_line in enumerate(text.splitlines(), start=1):
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
        values[current_path] = parse_scalar(raw_value) if raw_value else None
        stack.append((indent, key))

    return values, lines, present


def scan_yaml(path: Path) -> tuple[dict[str, Any], dict[str, int], set[str]]:
    return scan_yaml_text(path.read_text(encoding="utf-8"))


def format_path(path: str, lines: dict[str, int]) -> str:
    line = lines.get(path)
    return f"{path} (line {line})" if line else path


def has_content(value: Any) -> bool:
    return value not in (None, [], "")


def validate_statistical_evidence(values: dict[str, Any], lines: dict[str, int]) -> list[str]:
    errors: list[str] = []
    status = values.get("statistical_evidence.status")
    claim_scope = values.get("statistical_evidence.claim_scope")
    route = values.get("statistical_evidence.inference_or_validation_route")
    limits = values.get("statistical_evidence.method_specific_limits")

    if status in {None, "", "not_assessed", "not_applicable"} or status == []:
        return errors

    if not has_content(claim_scope) or claim_scope == "unknown":
        errors.append(
            f"statistical_evidence.status is {status!r}, but "
            f"{format_path('statistical_evidence.claim_scope', lines)} is empty or unknown."
        )

    if not has_content(limits):
        errors.append(
            f"statistical_evidence.status is {status!r}, but "
            f"{format_path('statistical_evidence.method_specific_limits', lines)} is empty."
        )

    if status in {"internally_validated", "inference_supported", "externally_validated"}:
        if not has_content(route):
            errors.append(
                f"statistical_evidence.status is {status!r}, but "
                f"{format_path('statistical_evidence.inference_or_validation_route', lines)} "
                "is empty."
            )

    return errors


def validate_values(values: dict[str, Any], lines: dict[str, int], present: set[str]) -> list[str]:
    errors: list[str] = []

    for required_path in COMMON_REQUIRED_PATHS:
        if required_path not in present:
            errors.append(f"Missing required path: {required_path}")

    module_type = values.get("module_type")
    if module_type in TYPE_SPECIFIC_REQUIRED_PATHS:
        for required_path in TYPE_SPECIFIC_REQUIRED_PATHS[module_type]:
            if required_path not in present:
                errors.append(
                    f"Missing required path for module_type {module_type!r}: {required_path}"
                )

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

    if values.get("method_lead_recheck.required") is True and not has_content(
        values.get("method_lead_recheck.reason")
    ):
        errors.append(
            "method_lead_recheck.required is true, but method_lead_recheck.reason is empty."
        )

    errors.extend(validate_statistical_evidence(values, lines))

    return errors


def validate_text(text: str) -> list[str]:
    values, lines, present = scan_yaml_text(text)
    return validate_values(values, lines, present)


def validate(record_path: Path) -> list[str]:
    values, lines, present = scan_yaml(record_path)
    return validate_values(values, lines, present)


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a method/task subskill record YAML file.")
    parser.add_argument("--record", required=True, help="Path to a standalone subskill record YAML file.")
    args = parser.parse_args()

    record_path = Path(args.record)
    if not record_path.exists():
        print(f"Record file not found: {record_path}", file=sys.stderr)
        return 2

    errors = validate(record_path)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    print(f"OK: {record_path} passed method/task subskill record validation.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
