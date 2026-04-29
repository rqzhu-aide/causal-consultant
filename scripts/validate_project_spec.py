#!/usr/bin/env python3
"""Lightweight validator for a causal project specification YAML file.

Requires PyYAML. This is a checklist helper, not a causal-validity guarantee.
"""
from pathlib import Path
import argparse
import sys

REQUIRED_PATHS = [
    ("causal_question",),
    ("unit_of_analysis",),
    ("target_population",),
    ("intervention", "treatment_name"),
    ("intervention", "comparator_definition"),
    ("outcome", "outcome_name"),
    ("outcome", "follow_up_window"),
    ("time_zero",),
    ("estimand", "label"),
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

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("spec")
    args = parser.parse_args()
    try:
        import yaml
    except ImportError:
        print("PyYAML is required: pip install pyyaml", file=sys.stderr)
        sys.exit(2)

    data = yaml.safe_load(Path(args.spec).read_text(encoding="utf-8"))
    missing = []
    for path in REQUIRED_PATHS:
        val = get_path(data, path)
        if val in (None, "", [], {}):
            missing.append(".".join(path))

    if missing:
        print("Missing or empty fields:")
        for m in missing:
            print(f"- {m}")
        sys.exit(1)
    print("Minimum project specification fields are present.")

if __name__ == "__main__":
    main()
