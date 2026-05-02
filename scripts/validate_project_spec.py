#!/usr/bin/env python3
"""Lightweight validator for a causal project specification YAML file.

This is a checklist helper, not a causal-validity guarantee. It uses PyYAML
when available and falls back to a minimal parser for the bundled template
shape when PyYAML is unavailable.

Use --schema-only for blank templates where required paths should exist but
project-specific values are not filled yet.
"""
from pathlib import Path
import argparse

REQUIRED_PATHS = [
    ("interaction", "current_mode"),
    ("interaction", "user_goals"),
    ("interaction", "requested_deliverables"),
    ("interaction", "has_existing_data"),
    ("data", "domain_context"),
    ("data", "rows_represent"),
    ("data", "unit_of_observation"),
    ("intervention", "treatment_definition"),
    ("intervention", "comparator_definition"),
    ("outcomes", "primary"),
    ("study_design", "time_zero"),
    ("study_design", "target_population"),
    ("study_design", "inferred_design_family"),
    ("analysis_routes", "potential_goals"),
    ("analysis_routes", "candidate_routes"),
]

MISSING = object()

def get_path(d, path):
    cur = d
    for key in path:
        if not isinstance(cur, dict) or key not in cur:
            return MISSING
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
    parser.add_argument(
        "--schema-only",
        action="store_true",
        help="Check that required paths exist, but allow empty template values.",
    )
    args = parser.parse_args()
    data = load_spec(args.spec)
    missing = []
    for path in REQUIRED_PATHS:
        val = get_path(data, path)
        if args.schema_only:
            if val is MISSING:
                missing.append(".".join(path))
        elif val is MISSING or val in (None, "", [], {}):
            missing.append(".".join(path))

    if missing:
        label = "Missing fields" if args.schema_only else "Missing or empty fields"
        print(f"{label}:")
        for m in missing:
            print(f"- {m}")
        raise SystemExit(1)
    if args.schema_only:
        print("Minimum project specification paths are present.")
    else:
        print("Minimum project specification fields are present.")

if __name__ == "__main__":
    main()
