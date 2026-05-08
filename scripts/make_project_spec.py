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


ACTION_CHOICES = (
    "ask_user | inspect_data | literature_search | refresh_domain_helper_01 | "
    "refresh_data_inspector_02 | refresh_design_planner_03 | refresh_dag_builder_04 | "
    "activate_method_subskill | proceed_with_caveat | block_ready_gate | mark_ready | "
    "no_action | unknown"
)

READINESS_CHOICES = (
    "ready | sufficient_for_now | needs_information | blocks_ready_gate | not_needed | unknown"
)


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
        'project_status: "active | paused | completed | unknown"': 'project_status: "active"',
        'current_phase: "intake | foundation loop | method selection | analysis | reporting | unknown"': 'current_phase: "intake"',
        'primary_intent: "estimate effect | choose method | inspect data | design study | critique paper | review assumptions | interpret results | write report | debug code | learn concept | rescue analysis | unknown"': 'primary_intent: "unknown"',
        'rigor_mode: "not needed | exploratory | ready | blocked | user-directed | unknown"': 'rigor_mode: "unknown"',
        'conversation_style: "suggest-and-invite | suggest-and-confirm | direct answer | teaching | unknown"': 'conversation_style: "unknown"',
        f'selected_next_action: "{ACTION_CHOICES}"': 'selected_next_action: "unknown"',
        'intent_basis: "none | explicit user request | inferred urgency | repeated preference to continue | accepted caveated analysis | declined further gate work | unknown"': 'intent_basis: "none"',
        'status: "not needed | exploratory | ready | blocked | unknown"': 'status: "exploratory"',
        'claim_strength_allowed: "causal | cautious causal | associational | descriptive | exploratory | unknown"': 'claim_strength_allowed: "exploratory"',
        'trigger: "user_update | data_update | design_change | dag_feedback | route_commitment | user-directed | unknown"': 'trigger: "unknown"',
        'status: "not assessed | no loop | possible loop | loop detected | resolved | unknown"': 'status: "not assessed"',
        'break_action: "ask_decisive_user_question | make_nonharmful_working_assumption | surface_load_bearing_assumption | demote_or_block_route | choose_fallback | proceed_user_directed | no_action | unknown"': 'break_action: "unknown"',
        'status: "active | inactive | unknown"': 'status: "active"',
        f'readiness: "{READINESS_CHOICES}"': 'readiness: "unknown"',
        f'domain_helper_01: "{READINESS_CHOICES}"': 'domain_helper_01: "unknown"',
        f'data_inspector_02: "{READINESS_CHOICES}"': 'data_inspector_02: "unknown"',
        f'design_planner_03: "{READINESS_CHOICES}"': 'design_planner_03: "unknown"',
        f'dag_builder_04: "{READINESS_CHOICES}"': 'dag_builder_04: "unknown"',
        'readiness_scope: "not assessed | exploratory review | route comparison | design-data fit | dag-data fit | preprocessing | method-specific modeling | gate commitment | user-directed execution | unknown"': 'readiness_scope: "unknown"',
        'data_status: "existing | partially existing | conceptual | unknown"': 'data_status: "unknown"',
        'design_status: "promising | feasible | fragile | blocked | needs clarification | unknown"': 'design_status: "unknown"',
        'supported_status: "supported | fragile | blocked | needs design revision | unknown"': 'supported_status: "unknown"',
        'supported_scope: "not assessed | exploratory audit | route support | design revision | method handoff | gate commitment | user-directed execution | unknown"': 'supported_scope: "unknown"',
        'identification_status: "yes | no | partial | unknown"': 'identification_status: "unknown"',
        'route_commitment_status: "exploratory | ready | committed | blocked | user-directed | unknown"': 'route_commitment_status: "unknown"',
        'claim_strength: "causal | cautious causal | associational | descriptive | exploratory | unknown"': 'claim_strength: "unknown"',
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
