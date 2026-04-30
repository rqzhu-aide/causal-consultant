#!/usr/bin/env python3
"""Create a blank causal project specification YAML file.

This script does not analyze data. It copies the canonical project-spec
template and fills in the project name and date.
"""
from pathlib import Path
import argparse
import datetime


def load_template() -> str:
    repo_root = Path(__file__).resolve().parents[1]
    template_path = repo_root / "assets" / "causal_project_spec_template.yaml"
    return template_path.read_text(encoding="utf-8")


def fill_template(text: str, project_name: str, date: str) -> str:
    text = text.replace("project_name: null", f"project_name: {project_name}", 1)
    text = text.replace("date: null", f"date: {date}", 1)
    return text


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project-name", default="causal_project")
    parser.add_argument("--out", default="causal_project_spec.yaml")
    args = parser.parse_args()

    text = fill_template(
        load_template(),
        project_name=args.project_name,
        date=datetime.date.today().isoformat(),
    )
    out = Path(args.out)
    out.write_text(text, encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
