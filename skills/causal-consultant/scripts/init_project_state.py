#!/usr/bin/env python3
"""Initialize project_state.yaml from the bundled template if it is missing."""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path


def find_skill_dir() -> Path:
    return Path(__file__).resolve().parents[1]


def init_project_state(project_root: Path, overwrite: bool = False) -> tuple[Path, str]:
    skill_dir = find_skill_dir()
    template_path = skill_dir / "assets" / "project_state_template.yaml"
    state_path = project_root / "project_state.yaml"

    if not template_path.exists():
        raise FileNotFoundError(f"Template not found: {template_path}")

    if state_path.exists() and not overwrite:
        return state_path, "exists"

    project_root.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(template_path, state_path)
    return state_path, "created"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create project_state.yaml from the causal-consultant template if missing."
    )
    parser.add_argument(
        "--project-root",
        default=".",
        help="Project or workspace root where project_state.yaml should live.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace an existing project_state.yaml. Do not use during normal skill startup.",
    )
    args = parser.parse_args()

    state_path, status = init_project_state(Path(args.project_root).resolve(), args.overwrite)
    print(f"{status}: {state_path}")


if __name__ == "__main__":
    main()
