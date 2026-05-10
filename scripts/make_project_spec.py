#!/usr/bin/env python3
"""Create a lean causal project state folder.

By default this creates:

  causal-projects/YYYY-MM-DD-short-project-label/
    project.yaml
    analyses/
    artifacts/

The script copies the lean project-state template and initializes only the
status fields needed for a usable live state. Detailed data profiles, DAGs, and
method outputs should go under analyses/ or artifacts/ and be summarized in
project.yaml.
"""
from pathlib import Path
import argparse
import datetime
import re


def load_enum_values():
    repo_root = Path(__file__).resolve().parents[1]
    enum_path = repo_root / "assets" / "workflow_enums.yaml"
    values = {}
    current = None
    for raw_line in enum_path.read_text(encoding="utf-8").splitlines():
        stripped = raw_line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if not raw_line.startswith(" ") and stripped.endswith(":"):
            current = stripped[:-1]
            values[current] = []
            continue
        if current and stripped.startswith("- "):
            values[current].append(stripped[2:].strip("\"'"))
    return values


ENUMS = load_enum_values()


def choices(enum_name: str) -> str:
    return " | ".join(ENUMS[enum_name])


def load_template() -> str:
    repo_root = Path(__file__).resolve().parents[1]
    template_path = repo_root / "assets" / "causal_project_spec_template.yaml"
    return template_path.read_text(encoding="utf-8")


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "causal-project"


def yaml_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def fill_template(
    text: str,
    project_name: str,
    short_label: str,
    date_started: str,
    state_folder: Path,
) -> str:
    folder_text = state_folder.as_posix()
    metadata_replacements = {
        "project_name: null": f"project_name: {yaml_quote(project_name)}",
        "short_label: null": f"short_label: {yaml_quote(short_label)}",
        "date_started: null": f"date_started: {yaml_quote(date_started)}",
        "last_updated: null": f"last_updated: {yaml_quote(date_started)}",
        "state_folder: null": f"state_folder: {yaml_quote(folder_text)}",
    }
    for old, new in metadata_replacements.items():
        text = text.replace(old, new, 1)

    replacements = {
        f'project_status: "{choices("project_status")}"': 'project_status: "active"',
        f'current_phase: "{choices("project_phase")}"': 'current_phase: "foundation"',
        f'primary_intent: "{choices("primary_intent")}"': 'primary_intent: "unknown"',
        f'rigor_mode: "{choices("rigor_mode")}"': 'rigor_mode: "unknown"',
        f'conversation_style: "{choices("conversation_style")}"': 'conversation_style: "unknown"',
        f'selected_next_action: "{choices("main_actions")}"': 'selected_next_action: "unknown"',
        f'selected_next_action: "{choices("foundation_actions")}"': 'selected_next_action: "unknown"',
        f'intent_basis: "{choices("user_directed_intent_basis")}"': 'intent_basis: "none"',
        f'status: "{choices("foundation_gate_status")}"': 'status: "exploratory"',
        f'claim_strength_allowed: "{choices("claim_strength")}"': 'claim_strength_allowed: "exploratory"',
        f'status: "{choices("production_gate_status")}"': 'status: "not ready"',
        f'diagnostics_status: "{choices("production_diagnostics_status")}"': 'diagnostics_status: "not started"',
        f'claim_strength_for_report: "{choices("claim_strength")}"': 'claim_strength_for_report: "unknown"',
        f'trigger: "{choices("evaluator_loop_trigger")}"': 'trigger: "unknown"',
        f'status: "{choices("loop_status")}"': 'status: "not assessed"',
        f'break_action: "{choices("foundation_loop_break_actions")}"': 'break_action: "unknown"',
        f'readiness: "{choices("foundation_reviewer_readiness")}"': 'readiness: "unknown"',
        f'readiness_scope: "{choices("data_readiness_scope")}"': 'readiness_scope: "unknown"',
        f'data_status: "{choices("data_status")}"': 'data_status: "unknown"',
        f'design_status: "{choices("design_status")}"': 'design_status: "unknown"',
        f'supported_status: "{choices("dag_supported_status")}"': 'supported_status: "unknown"',
        f'supported_scope: "{choices("dag_supported_scope")}"': 'supported_scope: "unknown"',
        f'identification_status: "{choices("dag_identification_status")}"': 'identification_status: "unknown"',
        f'route_commitment_status: "{choices("route_commitment_status")}"': 'route_commitment_status: "unknown"',
        f'execution_stage: "{choices("execution_stage")}"': 'execution_stage: "not started"',
        f'review_purpose: "{choices("production_review_purpose")}"': 'review_purpose: "not needed"',
        f'readiness: "{choices("production_loop_readiness")}"': 'readiness: "not started"',
        f'recommended_next_action: "{choices("main_actions")}"': 'recommended_next_action: "unknown"',
        f'severity: "{choices("foundation_recheck_severity")}"': 'severity: "none"',
        f'main_skill_decision: "{choices("foundation_recheck_decisions")}"': 'main_skill_decision: "none"',
        f'break_action: "{choices("production_loop_break_actions")}"': 'break_action: "unknown"',
        f'mode: "{choices("report_writer_modes")}"': 'mode: "not selected"',
        f'status: "{choices("report_writer_statuses")}"': 'status: "not needed"',
        f'confirmation_basis: "{choices("execution_confirmation_basis")}"': 'confirmation_basis: "unknown"',
        f'claim_strength: "{choices("claim_strength")}"': 'claim_strength: "unknown"',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def resolve_paths(args):
    date_started = args.date_started or datetime.date.today().isoformat()
    short_label = args.project_label or slugify(args.project_name)

    if args.out:
        project_path = Path(args.out)
        state_folder = project_path.parent
    else:
        state_folder = (
            Path(args.state_folder)
            if args.state_folder
            else Path(args.base_dir) / f"{date_started}-{short_label}"
        )
        project_path = state_folder / "project.yaml"

    return date_started, short_label, state_folder, project_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project-name", default="causal_project")
    parser.add_argument("--project-label", default=None, help="Short non-sensitive label used in the state-folder name.")
    parser.add_argument("--date-started", default=None, help="YYYY-MM-DD date for the state folder and project metadata.")
    parser.add_argument("--base-dir", default="causal-projects", help="Parent folder for dated project state folders.")
    parser.add_argument("--state-folder", default=None, help="Explicit state-folder path to create or reuse.")
    parser.add_argument("--out", default=None, help="Optional explicit project.yaml path; parent becomes the state folder.")
    parser.add_argument("--force", action="store_true", help="Overwrite an existing project.yaml.")
    args = parser.parse_args()

    date_started, short_label, state_folder, project_path = resolve_paths(args)
    analyses_dir = state_folder / "analyses"
    artifacts_dir = state_folder / "artifacts"

    state_folder.mkdir(parents=True, exist_ok=True)
    analyses_dir.mkdir(exist_ok=True)
    artifacts_dir.mkdir(exist_ok=True)

    if project_path.exists() and not args.force:
        print(f"Project YAML already exists: {project_path}")
        print(f"State folder ready: {state_folder}")
        return

    text = fill_template(
        load_template(),
        project_name=args.project_name,
        short_label=short_label,
        date_started=date_started,
        state_folder=state_folder,
    )
    project_path.write_text(text, encoding="utf-8")
    print(f"Wrote {project_path}")
    print(f"Created/reused {analyses_dir}")
    print(f"Created/reused {artifacts_dir}")


if __name__ == "__main__":
    main()
