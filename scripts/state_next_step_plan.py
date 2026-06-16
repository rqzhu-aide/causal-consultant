#!/usr/bin/env python3
"""Safely update only next_step_plan inside project_state.yaml."""

from __future__ import annotations

import argparse
import ast
import json
import re
import sys
from pathlib import Path
from typing import Any


OLD_OR_FORBIDDEN_FIELDS = {
    "stage",
    "action_type",
    "target_owner",
    "target_stage",
    "allowed_writable_sections",
    "expected_outputs",
    "agent_called",
    "action_goal",
    "refs",
    "status",
}


def find_skill_dir() -> Path:
    return Path(__file__).resolve().parents[1]


def scalar_from_text(value: str) -> Any:
    value = value.strip()
    if value in {"", "~", "null", "Null", "NULL"}:
        return None
    if value in {"true", "True", "TRUE"}:
        return True
    if value in {"false", "False", "FALSE"}:
        return False
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        return ast.literal_eval(value)
    return value


def scalar_to_text(value: Any) -> str:
    if value is None:
        return "null"
    if value is True:
        return "true"
    if value is False:
        return "false"
    text = str(value)
    if re.fullmatch(r"[A-Za-z0-9_.-]+", text):
        return text
    return json.dumps(text)


def parse_key_value(text: str, line_number: int) -> tuple[str, Any]:
    if ":" not in text:
        raise ValueError(f"Line {line_number}: expected 'key: value'.")
    key, value = text.split(":", 1)
    key = key.strip()
    if not key:
        raise ValueError(f"Line {line_number}: empty key.")
    return key, scalar_from_text(value)


def normalize_plan_lines(text: str) -> list[str]:
    raw_lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    lines = [line for line in raw_lines if line.strip() and not line.lstrip().startswith("#")]
    if not lines:
        raise ValueError("Plan fragment is empty.")

    first = lines[0].lstrip("\ufeff")
    lines[0] = first
    if first.startswith("next_step_plan:"):
        _, value = first.split(":", 1)
        if value.strip() == "[]":
            return ["[]"]
        lines = lines[1:]
        if not lines:
            raise ValueError("next_step_plan must contain a list.")
        if all(line.startswith("  ") for line in lines):
            lines = [line[2:] for line in lines]
    return lines


def parse_plan_fragment_text(text: str) -> list[dict[str, Any]]:
    lines = normalize_plan_lines(text)
    if lines == ["[]"]:
        return []

    items: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    for index, line in enumerate(lines, start=1):
        if line.startswith("- "):
            current = {}
            items.append(current)
            rest = line[2:].strip()
            if rest:
                key, value = parse_key_value(rest, index)
                current[key] = value
            continue

        if line.startswith("  ") and current is not None:
            rest = line.strip()
            if rest.startswith("- "):
                raise ValueError(f"Line {index}: nested lists are not allowed in next_step_plan.")
            key, value = parse_key_value(rest, index)
            current[key] = value
            continue

        raise ValueError(f"Line {index}: expected a list item or indented field.")

    return items


def parse_plan_fragment(path: Path) -> list[dict[str, Any]]:
    return parse_plan_fragment_text(path.read_text(encoding="utf-8"))


def dump_plan(plan: list[dict[str, Any]]) -> str:
    if not plan:
        return "next_step_plan: []\n"

    lines = ["next_step_plan:"]
    for item in plan:
        keys = list(item.keys())
        if not keys or keys[0] != "id":
            raise ValueError("Each next_step_plan entry must start with id.")
        lines.append(f"  - id: {scalar_to_text(item['id'])}")
        for key in keys[1:]:
            lines.append(f"    {key}: {scalar_to_text(item[key])}")
    return "\n".join(lines) + "\n"


def parse_route_index(path: Path) -> tuple[set[str], set[str], set[str]]:
    core_routes: set[str] = set()
    design_routes: set[str] = set()
    support_routes: set[str] = set()
    section: str | None = None
    current_method_id: str | None = None

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        if not raw_line.strip() or raw_line.lstrip().startswith("#"):
            continue
        if not raw_line.startswith(" ") and raw_line.endswith(":"):
            section = raw_line[:-1].strip()
            current_method_id = None
            continue

        stripped = raw_line.strip()
        if section == "core_routes" and stripped.startswith("- id:"):
            core_routes.add(stripped.split(":", 1)[1].strip())
            continue

        if section == "method_routes":
            if stripped.startswith("- id:"):
                current_method_id = stripped.split(":", 1)[1].strip()
            elif stripped.startswith("category:") and current_method_id:
                category = stripped.split(":", 1)[1].strip()
                if category == "design":
                    design_routes.add(current_method_id)
                elif category == "support":
                    support_routes.add(current_method_id)

    return core_routes, design_routes, support_routes


def ensure_only_fields(item: dict[str, Any], allowed: set[str], label: str) -> None:
    fields = set(item)
    forbidden = fields & OLD_OR_FORBIDDEN_FIELDS
    if forbidden:
        raise ValueError(f"{label} contains old or forbidden fields: {sorted(forbidden)}")
    extra = fields - allowed
    if extra:
        raise ValueError(f"{label} contains unsupported fields: {sorted(extra)}")


def require_string(item: dict[str, Any], field: str, label: str) -> None:
    value = item.get(field)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{label} requires non-empty string field '{field}'.")


def validate_mode(item: dict[str, Any], label: str) -> None:
    if item.get("mode") not in {"shallow", "deep"}:
        raise ValueError(f"{label} mode must be shallow or deep.")


def validate_team_lead(item: dict[str, Any]) -> None:
    ensure_only_fields(item, {"id", "task"}, "team_lead entry")
    if item.get("id") != "team_lead":
        raise ValueError("Final entry must be team_lead.")
    require_string(item, "task", "team_lead entry")


def validate_core_entry(item: dict[str, Any], core_routes: set[str]) -> None:
    route_id = item.get("id")
    valid_core = core_routes - {"team_lead"}
    if route_id not in valid_core:
        raise ValueError(f"Unknown core route id: {route_id}")

    allowed = {"id", "request", "task", "mode"}
    if route_id == "report_writer":
        allowed.add("report_precheck")
    ensure_only_fields(item, allowed, f"{route_id} entry")
    require_string(item, "request", f"{route_id} entry")
    require_string(item, "task", f"{route_id} entry")
    validate_mode(item, f"{route_id} entry")

    if route_id != "report_writer" and "report_precheck" in item:
        raise ValueError("report_precheck is allowed only on report_writer entries.")
    if "report_precheck" in item and not isinstance(item["report_precheck"], bool):
        raise ValueError("report_precheck must be true or false.")


def validate_analysis_entry(
    item: dict[str, Any], design_routes: set[str], support_routes: set[str]
) -> None:
    ensure_only_fields(
        item,
        {"id", "design", "support", "task", "mode", "analysis_precheck"},
        "analysis_execution entry",
    )
    if item.get("id") != "analysis_execution":
        raise ValueError("Analysis plans must start with analysis_execution.")
    design = item.get("design")
    if design not in design_routes:
        raise ValueError(f"Unknown analysis design route: {design}")
    support = item.get("support")
    if support is not None and support not in support_routes:
        raise ValueError(f"Unknown analysis support route: {support}")
    require_string(item, "task", "analysis_execution entry")
    validate_mode(item, "analysis_execution entry")
    if "analysis_precheck" in item and not isinstance(item["analysis_precheck"], bool):
        raise ValueError("analysis_precheck must be true or false.")


def validate_active_plan(
    plan: list[dict[str, Any]], core_routes: set[str], design_routes: set[str], support_routes: set[str]
) -> None:
    if not plan:
        raise ValueError("set-active requires a non-empty plan. Use clear for next_step_plan: [].")
    if not all(isinstance(item, dict) for item in plan):
        raise ValueError("next_step_plan must be a list of mappings.")

    if len(plan) == 1:
        validate_team_lead(plan[0])
        return

    if len(plan) != 2:
        raise ValueError("Active next_step_plan must have one or two entries.")
    validate_team_lead(plan[1])

    first_id = plan[0].get("id")
    if first_id == "analysis_execution":
        validate_analysis_entry(plan[0], design_routes, support_routes)
    else:
        validate_core_entry(plan[0], core_routes)


def read_state(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(f"State file not found: {path}")
    return path.read_text(encoding="utf-8")


def section_bounds(text: str, key: str) -> tuple[int, int]:
    lines = text.splitlines(keepends=True)
    start: int | None = None
    for index, line in enumerate(lines):
        if line.startswith(f"{key}:"):
            start = index
            break
    if start is None:
        raise ValueError(f"Top-level section not found: {key}")

    end = len(lines)
    for index in range(start + 1, len(lines)):
        line = lines[index]
        if line.strip() and not line.startswith((" ", "\t")) and re.match(r"^[A-Za-z_][A-Za-z0-9_]*:", line):
            end = index
            break
    return start, end


def extract_next_step_plan(text: str) -> list[dict[str, Any]]:
    start, end = section_bounds(text, "next_step_plan")
    section_text = "".join(text.splitlines(keepends=True)[start:end])
    return parse_plan_fragment_text(section_text)


def write_next_step_plan(state_path: Path, plan: list[dict[str, Any]]) -> None:
    text = read_state(state_path)
    start, end = section_bounds(text, "next_step_plan")
    lines = text.splitlines(keepends=True)
    new_text = "".join(lines[:start]) + dump_plan(plan) + "".join(lines[end:])
    state_path.write_text(new_text, encoding="utf-8")


def is_pending_report_scope(item: dict[str, Any]) -> bool:
    return (
        item.get("id") == "report_writer"
        and item.get("mode") == "shallow"
        and item.get("report_precheck", False) is False
    )


def is_pending_analysis_scope(item: dict[str, Any]) -> bool:
    return (
        item.get("id") == "analysis_execution"
        and item.get("mode") == "shallow"
        and item.get("analysis_precheck", False) is False
    )


def preserve_gated_plan(state_path: Path) -> list[dict[str, Any]]:
    plan = extract_next_step_plan(read_state(state_path))
    gated = [item for item in plan if is_pending_report_scope(item) or is_pending_analysis_scope(item)]
    if len(gated) > 1:
        raise ValueError("Refusing to preserve more than one pending gated scope.")
    if gated:
        core_routes, design_routes, support_routes = load_route_sets()
        if gated[0].get("id") == "report_writer":
            validate_core_entry(gated[0], core_routes)
        else:
            validate_analysis_entry(gated[0], design_routes, support_routes)
    return gated


def load_route_sets() -> tuple[set[str], set[str], set[str]]:
    route_index = find_skill_dir() / "references" / "route_index.yaml"
    if not route_index.exists():
        raise FileNotFoundError(f"Route index not found: {route_index}")
    return parse_route_index(route_index)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Safely update only next_step_plan inside project_state.yaml."
    )
    parser.add_argument("--state", required=True, help="Path to project_state.yaml.")
    subparsers = parser.add_subparsers(dest="operation", required=True)

    set_active = subparsers.add_parser(
        "set-active", help="Replace next_step_plan with a complete active plan."
    )
    set_active.add_argument("--from-file", required=True, help="YAML file containing next_step_plan.")

    subparsers.add_parser(
        "preserve-gated",
        help="Keep one pending shallow report/analysis scope if present; otherwise clear.",
    )
    subparsers.add_parser("clear", help="Set next_step_plan: [].")

    args = parser.parse_args()
    state_path = Path(args.state).resolve()

    if args.operation == "set-active":
        core_routes, design_routes, support_routes = load_route_sets()
        plan = parse_plan_fragment(Path(args.from_file).resolve())
        validate_active_plan(plan, core_routes, design_routes, support_routes)
        write_next_step_plan(state_path, plan)
        print(f"set-active: {state_path}")
    elif args.operation == "preserve-gated":
        plan = preserve_gated_plan(state_path)
        write_next_step_plan(state_path, plan)
        status = "preserved-gated" if plan else "cleared"
        print(f"{status}: {state_path}")
    elif args.operation == "clear":
        write_next_step_plan(state_path, [])
        print(f"cleared: {state_path}")
    else:
        raise ValueError(f"Unknown operation: {args.operation}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        sys.exit(1)
