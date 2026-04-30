#!/usr/bin/env python3
"""Lightweight validator for a causal project specification YAML file.

This is a checklist helper, not a causal-validity guarantee. It uses PyYAML
when available and falls back to a minimal parser for the bundled template
shape when PyYAML is unavailable.
"""
from pathlib import Path
import argparse

REQUIRED_PATHS = [
    ("interaction", "current_mode"),
    ("causal_question",),
    ("unit_of_analysis",),
    ("target_population",),
    ("intervention", "treatment_name"),
    ("intervention", "comparator_definition"),
    ("outcome", "outcome_name"),
    ("outcome", "follow_up_window"),
    ("time_zero",),
    ("data_structure", "inferred_design_family"),
    ("data_structure", "rows_represent"),
    ("data_structure", "assignment_mechanism"),
    ("estimand", "label"),
    ("route_decision", "primary_route"),
    ("variables", "treatment_variable"),
    ("variables", "outcome_variable"),
    ("analysis_plan", "primary_method"),
]

def get_path(d, path):
    cur = d
    for key in path:
        if not isinstance(cur, dict) or key not in cur:
            return None
        cur = cur[key]
    return cur


def parse_scalar(value):
    if value == "null":
        return None
    if value == "[]":
        return []
    if value == "{}":
        return {}
    if value == "true":
        return True
    if value == "false":
        return False
    return value.strip("\"'")


def parse_simple_yaml(text):
    """Parse the simple nested mapping shape used by the project-spec template."""
    root = {}
    stack = [(-1, root)]
    for raw_line in text.splitlines():
        if not raw_line.strip() or raw_line.lstrip().startswith("#"):
            continue
        if ":" not in raw_line:
            continue

        indent = len(raw_line) - len(raw_line.lstrip(" "))
        key, value = raw_line.strip().split(":", 1)

        while indent <= stack[-1][0]:
            stack.pop()

        parent = stack[-1][1]
        value = value.strip()
        if value == "":
            child = {}
            parent[key] = child
            stack.append((indent, child))
        else:
            parent[key] = parse_scalar(value)
    return root


def load_spec(path):
    text = Path(path).read_text(encoding="utf-8")
    try:
        import yaml
    except ImportError:
        return parse_simple_yaml(text)
    return yaml.safe_load(text)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("spec")
    args = parser.parse_args()
    data = load_spec(args.spec)
    missing = []
    for path in REQUIRED_PATHS:
        val = get_path(data, path)
        if val in (None, "", [], {}):
            missing.append(".".join(path))

    if missing:
        print("Missing or empty fields:")
        for m in missing:
            print(f"- {m}")
        raise SystemExit(1)
    print("Minimum project specification fields are present.")

if __name__ == "__main__":
    main()
