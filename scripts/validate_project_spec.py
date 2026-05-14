#!/usr/bin/env python3
"""Validate the lean causal project state YAML.

This checks the live-state contract, not causal validity. The YAML is intended
to be a compact state ledger; detailed data profiles, DAG edge lists, model
diagnostics, and report drafts should live in analyses/ or artifacts/ and be
summarized here.
"""
from pathlib import Path
import argparse

MISSING = object()

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


def enum(name):
    return set(ENUMS[name])


READINESS = enum("foundation_reviewer_readiness")
PRODUCTION_REVIEW_PURPOSES = enum("production_review_purpose")
PRODUCTION_LOOP_READINESS = enum("production_loop_readiness")
PRODUCTION_LOOP_BREAK_ACTIONS = enum("production_loop_break_actions")
ACTIONS = enum("main_actions")
FOUNDATION_ACTIONS = enum("foundation_actions")
FOUNDATION_READINESS_EFFECT = enum("foundation_readiness_effect")
BLOCKING_SIGNAL_SEVERITY = enum("blocking_signal_severity")
FOUNDATION_RECHECK_SEVERITY = enum("foundation_recheck_severity")
FOUNDATION_RECHECK_DECISIONS = enum("foundation_recheck_decisions")
REPORT_WRITER_MODES = enum("report_writer_modes")
REPORT_WRITER_STATUSES = enum("report_writer_statuses")
METHOD_JOB_ROLES = enum("method_job_roles")
METHOD_JOB_STATUSES = enum("method_job_statuses")
DISCOVERY_PURPOSES = enum("discovery_sidecar_purpose")
DISCOVERY_SUBSKILL_ID = "18-causal-discovery"
DISCOVERY_RETURN_PHASES = {"foundation", "production", "reporting"}
PARKED_TASK_STATUSES = enum("parked_task_status")
FOUNDATION_HANDOFF_TARGETS = {
    "domain_helper_01",
    "data_technician_02",
    "design_planner_03",
    "dag_builder_04",
    "method_subskills",
    DISCOVERY_SUBSKILL_ID,
}

REQUIRED_PATHS = [
    ("project", "project_name"),
    ("project", "short_label"),
    ("project", "date_started"),
    ("project", "last_updated"),
    ("project", "state_folder"),
    ("project", "project_yaml"),
    ("project", "analyses_dir"),
    ("project", "artifacts_dir"),
    ("project", "current_phase"),
    ("main_skill", "user_goal"),
    ("main_skill", "primary_intent"),
    ("main_skill", "rigor_mode"),
    ("main_skill", "conversation_style"),
    ("main_skill", "selected_next_action"),
    ("main_skill", "open_questions"),
    ("main_skill", "task_parking_lot", "current_task"),
    ("main_skill", "task_parking_lot", "parked_tasks"),
    ("main_skill", "user_directed", "requested"),
    ("main_skill", "user_directed", "intent_basis"),
    ("main_skill", "user_directed", "acknowledged_limits"),
    ("main_skill", "user_directed", "requested_scope"),
    ("main_skill", "user_directed", "allowed_scope"),
    ("main_skill", "user_directed", "prohibited_claims"),
    ("main_skill", "user_directed", "warning"),
    ("foundation_gate", "status"),
    ("foundation_gate", "can_support_causal_commitment"),
    ("foundation_gate", "blockers"),
    ("foundation_gate", "unresolved_required_information"),
    ("foundation_gate", "assumptions_to_surface"),
    ("foundation_gate", "surfaced_or_acknowledged_assumptions"),
    ("foundation_gate", "deferred_assumptions"),
    ("foundation_gate", "claim_strength_allowed"),
    ("production_gate", "status"),
    ("production_gate", "can_handoff_to_report_writer"),
    ("production_gate", "blockers"),
    ("production_gate", "unresolved_required_materials"),
    ("production_gate", "required_outputs"),
    ("production_gate", "completed_outputs"),
    ("production_gate", "diagnostics_status"),
    ("production_gate", "reportable_evidence"),
    ("production_gate", "claim_strength_for_report"),
    ("production_gate", "handoff_summary"),
    ("evaluator_loop", "trigger"),
    ("evaluator_loop", "selected_next_action"),
    ("evaluator_loop", "selected_reviewers"),
    ("evaluator_loop", "review_purpose"),
    ("evaluator_loop", "action_queue"),
    ("evaluator_loop", "loop_control", "status"),
    ("evaluator_loop", "loop_control", "repeated_cycle_count"),
    ("evaluator_loop", "loop_control", "issue_signature"),
    ("evaluator_loop", "loop_control", "break_action"),
    ("evaluator_loop", "loop_control", "rationale"),
    ("evaluator_loop", "loop_control", "decisive_question_or_assumption"),
    ("evaluators", "domain_helper_01", "readiness"),
    ("evaluators", "domain_helper_01", "summary"),
    ("evaluators", "domain_helper_01", "key_findings"),
    ("evaluators", "domain_helper_01", "candidate_formulations"),
    ("evaluators", "domain_helper_01", "handoff_notes"),
    ("evaluators", "domain_helper_01", "requests_for_main_skill"),
    ("evaluators", "domain_helper_01", "load_bearing_assumptions"),
    ("evaluators", "data_technician_02", "readiness"),
    ("evaluators", "data_technician_02", "readiness_scope"),
    ("evaluators", "data_technician_02", "data_status"),
    ("evaluators", "data_technician_02", "summary"),
    ("evaluators", "data_technician_02", "key_findings"),
    ("evaluators", "data_technician_02", "data_enabled_opportunities"),
    ("evaluators", "data_technician_02", "method_fit_suggestions"),
    ("evaluators", "data_technician_02", "handoff_notes"),
    ("evaluators", "data_technician_02", "requests_for_main_skill"),
    ("evaluators", "data_technician_02", "load_bearing_assumptions"),
    ("evaluators", "design_planner_03", "readiness"),
    ("evaluators", "design_planner_03", "design_status"),
    ("evaluators", "design_planner_03", "preferred_route_id"),
    ("evaluators", "design_planner_03", "summary"),
    ("evaluators", "design_planner_03", "key_findings"),
    ("evaluators", "design_planner_03", "route_hypotheses"),
    ("evaluators", "design_planner_03", "handoff_notes"),
    ("evaluators", "design_planner_03", "requests_for_main_skill"),
    ("evaluators", "design_planner_03", "load_bearing_assumptions"),
    ("evaluators", "dag_builder_04", "readiness"),
    ("evaluators", "dag_builder_04", "supported_status"),
    ("evaluators", "dag_builder_04", "supported_scope"),
    ("evaluators", "dag_builder_04", "identification_status"),
    ("evaluators", "dag_builder_04", "summary"),
    ("evaluators", "dag_builder_04", "key_findings"),
    ("evaluators", "dag_builder_04", "causal_logic_hypotheses"),
    ("evaluators", "dag_builder_04", "handoff_notes"),
    ("evaluators", "dag_builder_04", "requests_for_main_skill"),
    ("evaluators", "dag_builder_04", "load_bearing_assumptions"),
    ("routes", "current_route_id"),
    ("routes", "hypotheses"),
    ("routes", "rejected_or_deferred"),
    ("analysis", "route_commitment_status"),
    ("analysis", "execution_stage"),
    ("analysis", "execution_confirmation", "plan_summary"),
    ("analysis", "execution_confirmation", "user_confirmed_plan"),
    ("analysis", "execution_confirmation", "confirmation_basis"),
    ("analysis", "recommended_method_job_subskills"),
    ("analysis", "activated_method_job_subskills"),
    ("analysis", "discovery_sidecar", "active"),
    ("analysis", "discovery_sidecar", "purpose"),
    ("analysis", "discovery_sidecar", "return_to_phase"),
    ("analysis", "discovery_sidecar", "affects_main_route"),
    ("analysis", "discovery_sidecar", "artifact_paths"),
    ("analysis", "analyses"),
    ("analysis", "first_pass_summary"),
    ("analysis", "recommended_diagnostics"),
    ("analysis", "production_loop", "selected_reviewers"),
    ("analysis", "production_loop", "review_purpose"),
    ("analysis", "production_loop", "action_queue"),
    ("analysis", "production_loop", "reviewer_summaries"),
    ("analysis", "production_loop", "readiness"),
    ("analysis", "production_loop", "recommended_next_action"),
    ("analysis", "production_loop", "foundation_recheck", "triggered"),
    ("analysis", "production_loop", "foundation_recheck", "reason"),
    ("analysis", "production_loop", "foundation_recheck", "severity"),
    ("analysis", "production_loop", "foundation_recheck", "affected_foundation_sections"),
    ("analysis", "production_loop", "foundation_recheck", "recommended_reviewers"),
    ("analysis", "production_loop", "foundation_recheck", "main_skill_decision"),
    ("analysis", "production_loop", "loop_control", "status"),
    ("analysis", "production_loop", "loop_control", "repeated_cycle_count"),
    ("analysis", "production_loop", "loop_control", "issue_signature"),
    ("analysis", "production_loop", "loop_control", "break_action"),
    ("analysis", "production_loop", "loop_control", "rationale"),
    ("analysis", "report_writer_20", "mode"),
    ("analysis", "report_writer_20", "status"),
    ("analysis", "report_writer_20", "production_feedback"),
    ("analysis", "report_writer_20", "summary"),
    ("analysis", "report_writer_20", "artifacts"),
    ("analysis", "claim_strength"),
    ("analysis", "limitations"),
    ("subskill_analyses",),
    ("artifacts",),
]

REQUIRED_NONEMPTY_PATHS = [
    ("project", "project_name"),
    ("project", "short_label"),
    ("project", "date_started"),
    ("project", "last_updated"),
    ("project", "state_folder"),
    ("project", "project_yaml"),
    ("project", "analyses_dir"),
    ("project", "artifacts_dir"),
    ("project", "current_phase"),
    ("main_skill", "primary_intent"),
    ("main_skill", "rigor_mode"),
    ("main_skill", "conversation_style"),
    ("main_skill", "selected_next_action"),
    ("main_skill", "user_directed", "requested"),
    ("main_skill", "user_directed", "intent_basis"),
    ("main_skill", "user_directed", "acknowledged_limits"),
    ("foundation_gate", "status"),
    ("foundation_gate", "can_support_causal_commitment"),
    ("foundation_gate", "claim_strength_allowed"),
    ("production_gate", "status"),
    ("production_gate", "can_handoff_to_report_writer"),
    ("production_gate", "diagnostics_status"),
    ("production_gate", "reportable_evidence"),
    ("production_gate", "claim_strength_for_report"),
    ("evaluator_loop", "trigger"),
    ("evaluator_loop", "selected_next_action"),
    ("evaluator_loop", "loop_control", "status"),
    ("evaluator_loop", "loop_control", "repeated_cycle_count"),
    ("evaluator_loop", "loop_control", "break_action"),
    ("evaluators", "domain_helper_01", "readiness"),
    ("evaluators", "data_technician_02", "readiness"),
    ("evaluators", "data_technician_02", "readiness_scope"),
    ("evaluators", "data_technician_02", "data_status"),
    ("evaluators", "design_planner_03", "readiness"),
    ("evaluators", "design_planner_03", "design_status"),
    ("evaluators", "dag_builder_04", "readiness"),
    ("evaluators", "dag_builder_04", "supported_status"),
    ("evaluators", "dag_builder_04", "supported_scope"),
    ("evaluators", "dag_builder_04", "identification_status"),
    ("analysis", "route_commitment_status"),
    ("analysis", "execution_stage"),
    ("analysis", "execution_confirmation", "user_confirmed_plan"),
    ("analysis", "discovery_sidecar", "active"),
    ("analysis", "discovery_sidecar", "affects_main_route"),
    ("analysis", "production_loop", "readiness"),
    ("analysis", "production_loop", "foundation_recheck", "triggered"),
    ("analysis", "production_loop", "foundation_recheck", "severity"),
    ("analysis", "production_loop", "foundation_recheck", "main_skill_decision"),
    ("analysis", "production_loop", "loop_control", "status"),
    ("analysis", "production_loop", "loop_control", "repeated_cycle_count"),
    ("analysis", "production_loop", "loop_control", "break_action"),
    ("analysis", "report_writer_20", "mode"),
    ("analysis", "report_writer_20", "status"),
    ("analysis", "claim_strength"),
]

ALLOWED_VALUES = {
    ("project", "current_phase"): enum("project_phase"),
    ("main_skill", "primary_intent"): enum("primary_intent"),
    ("main_skill", "rigor_mode"): enum("rigor_mode"),
    ("main_skill", "conversation_style"): enum("conversation_style"),
    ("main_skill", "selected_next_action"): ACTIONS,
    ("main_skill", "user_directed", "intent_basis"): enum("user_directed_intent_basis"),
    ("foundation_gate", "status"): enum("foundation_gate_status"),
    ("foundation_gate", "claim_strength_allowed"): enum("claim_strength"),
    ("production_gate", "status"): enum("production_gate_status"),
    ("production_gate", "diagnostics_status"): enum("production_diagnostics_status"),
    ("production_gate", "claim_strength_for_report"): enum("claim_strength"),
    ("evaluator_loop", "trigger"): enum("evaluator_loop_trigger"),
    ("evaluator_loop", "selected_next_action"): FOUNDATION_ACTIONS,
    ("evaluator_loop", "loop_control", "status"): enum("loop_status"),
    ("evaluator_loop", "loop_control", "break_action"): enum("foundation_loop_break_actions"),
    ("evaluators", "domain_helper_01", "readiness"): READINESS,
    ("evaluators", "data_technician_02", "readiness"): READINESS,
    ("evaluators", "data_technician_02", "readiness_scope"): enum("data_readiness_scope"),
    ("evaluators", "data_technician_02", "data_status"): enum("data_status"),
    ("evaluators", "design_planner_03", "readiness"): READINESS,
    ("evaluators", "design_planner_03", "design_status"): enum("design_status"),
    ("evaluators", "dag_builder_04", "readiness"): READINESS,
    ("evaluators", "dag_builder_04", "supported_status"): enum("dag_supported_status"),
    ("evaluators", "dag_builder_04", "supported_scope"): enum("dag_supported_scope"),
    ("evaluators", "dag_builder_04", "identification_status"): enum("dag_identification_status"),
    ("analysis", "route_commitment_status"): enum("route_commitment_status"),
    ("analysis", "execution_stage"): enum("execution_stage"),
    ("analysis", "report_writer_20", "mode"): REPORT_WRITER_MODES,
    ("analysis", "report_writer_20", "status"): REPORT_WRITER_STATUSES,
    ("analysis", "execution_confirmation", "confirmation_basis"): enum("execution_confirmation_basis"),
    ("analysis", "production_loop", "review_purpose"): PRODUCTION_REVIEW_PURPOSES,
    ("analysis", "production_loop", "readiness"): PRODUCTION_LOOP_READINESS,
    ("analysis", "production_loop", "recommended_next_action"): ACTIONS,
    ("analysis", "production_loop", "foundation_recheck", "severity"): FOUNDATION_RECHECK_SEVERITY,
    ("analysis", "production_loop", "foundation_recheck", "main_skill_decision"): FOUNDATION_RECHECK_DECISIONS,
    ("analysis", "production_loop", "loop_control", "status"): enum("loop_status"),
    ("analysis", "production_loop", "loop_control", "break_action"): PRODUCTION_LOOP_BREAK_ACTIONS,
    ("analysis", "claim_strength"): enum("claim_strength"),
}

NULLABLE_ENUM_PATHS = {
    ("analysis", "production_loop", "review_purpose"),
    ("analysis", "production_loop", "recommended_next_action"),
}


def get_path(d, path):
    cur = d
    for key in path:
        if not isinstance(cur, dict) or key not in cur:
            return MISSING
        cur = cur[key]
    return cur


def has_recorded_value(value):
    if value is MISSING or value is None:
        return False
    if isinstance(value, str):
        return value.strip().lower() not in {"", "unknown", "none", "not assessed"}
    if isinstance(value, (list, tuple, set, dict)):
        return len(value) > 0
    return True


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


def validate_blocking_signal(signal, label):
    errors = []
    if signal in (MISSING, None, {}):
        return errors
    if not isinstance(signal, dict):
        return [f"{label} is not a mapping"]

    blocks_current_phase = signal.get("blocks_current_phase", False)
    requires_previous_phase_recheck = signal.get("requires_previous_phase_recheck", False)
    target_phase = signal.get("target_phase")
    severity = signal.get("severity", "unknown")
    affected_sections = signal.get("affected_sections", [])

    if not isinstance(blocks_current_phase, bool):
        errors.append(f"{label}.blocks_current_phase is not a boolean")
    if not isinstance(requires_previous_phase_recheck, bool):
        errors.append(f"{label}.requires_previous_phase_recheck is not a boolean")
    if target_phase is not None and target_phase not in {"foundation", "production"}:
        errors.append(f"{label}.target_phase has unsupported value {target_phase!r}")
    if severity not in BLOCKING_SIGNAL_SEVERITY:
        errors.append(f"{label}.severity has unsupported value {severity!r}")
    if affected_sections is not None and not isinstance(affected_sections, list):
        errors.append(f"{label}.affected_sections is not a list")
    if (blocks_current_phase is True or requires_previous_phase_recheck is True) and not has_recorded_value(
        signal.get("reason")
    ):
        errors.append(f"{label} is active but reason is not recorded")
    if requires_previous_phase_recheck is True and target_phase != "foundation":
        errors.append(f"{label}.requires_previous_phase_recheck is true but target_phase is not foundation")
    return errors


def blocking_signal_state(signal):
    if not isinstance(signal, dict):
        return False, False, None
    return (
        signal.get("blocks_current_phase") is True,
        signal.get("requires_previous_phase_recheck") is True,
        signal.get("target_phase"),
    )


def item_blocks_foundation(item):
    if not isinstance(item, dict):
        return False
    blocks, _recheck, target_phase = blocking_signal_state(item.get("blocking_signal"))
    return blocks and target_phase in {None, "foundation"}


def collect_blocking_signal_states(items, label):
    errors = []
    blocks_foundation = False
    blocks_production = False
    requires_foundation_recheck = False
    if not isinstance(items, list):
        return errors, blocks_foundation, blocks_production, requires_foundation_recheck
    for idx, item in enumerate(items):
        if not isinstance(item, dict):
            continue
        signal = item.get("blocking_signal")
        signal_label = f"{label}[{idx}].blocking_signal"
        errors.extend(validate_blocking_signal(signal, signal_label))
        blocks, recheck, target_phase = blocking_signal_state(signal)
        if blocks and target_phase == "foundation":
            blocks_foundation = True
        if blocks and target_phase == "production":
            blocks_production = True
        if recheck:
            requires_foundation_recheck = True
    return errors, blocks_foundation, blocks_production, requires_foundation_recheck


def blocking_items(items):
    found = []
    if not isinstance(items, list):
        return found
    for idx, item in enumerate(items):
        if not isinstance(item, dict):
            continue
        if item_blocks_foundation(item) and item.get("status", "open") in {"open", "selected"}:
            found.append(str(item.get("request_id") or item.get("note") or idx))
    return found


def collect_load_bearing(data):
    paths = [
        ("foundation_gate", "assumptions_to_surface"),
        ("evaluators", "domain_helper_01", "load_bearing_assumptions"),
        ("evaluators", "data_technician_02", "load_bearing_assumptions"),
        ("evaluators", "design_planner_03", "load_bearing_assumptions"),
        ("evaluators", "dag_builder_04", "load_bearing_assumptions"),
    ]
    entries = []
    for path in paths:
        value = get_path(data, path)
        if isinstance(value, list):
            entries.extend([str(v) for v in value if has_recorded_value(v)])
        elif has_recorded_value(value):
            entries.append(str(value))
    return entries


def validate_handoff_notes(value, label):
    errors = []
    if value in (MISSING, None):
        return errors
    if not isinstance(value, list):
        return [f"{label} is not a list"]
    for idx, item in enumerate(value):
        if not isinstance(item, dict):
            errors.append(f"{label}[{idx}] is not a mapping")
            continue
        target = item.get("target")
        if not has_recorded_value(target):
            errors.append(f"{label}[{idx}].target is not recorded")
        elif target not in FOUNDATION_HANDOFF_TARGETS and not is_method_job_subskill_id(str(target)):
            errors.append(
                f"{label}[{idx}].target has unsupported value {target!r}; expected a foundation evaluator, method_subskills, or method/job subskill id"
            )
        if not has_recorded_value(item.get("note")):
            errors.append(f"{label}[{idx}].note is not recorded")
    return errors


def validate_route_hypotheses(value, label):
    errors = []
    if value in (MISSING, None):
        return errors
    if not isinstance(value, list):
        return [f"{label} is not a list"]
    allowed_status = enum("route_hypothesis_status")
    for idx, item in enumerate(value):
        if isinstance(item, str):
            continue
        if not isinstance(item, dict):
            errors.append(f"{label}[{idx}] is neither a string nor mapping")
            continue
        if not has_recorded_value(item.get("route_id")):
            errors.append(f"{label}[{idx}] is missing route_id")
        if not has_recorded_value(item.get("summary")) and not has_recorded_value(
            item.get("design_summary")
        ):
            errors.append(f"{label}[{idx}] is missing summary/design_summary")
        status = item.get("status", "unknown")
        if status not in allowed_status:
            errors.append(f"{label}[{idx}].status has unsupported value {status!r}")
        action = item.get("recommended_next_action")
        if action is not None and action not in ACTIONS:
            errors.append(
                f"{label}[{idx}].recommended_next_action has unsupported value {action!r}"
            )
    return errors


def validate_subskill_analyses(value):
    errors = []
    if value in (MISSING, None):
        return errors
    if not isinstance(value, list):
        return ["subskill_analyses is not a list"]
    for idx, item in enumerate(value):
        label = f"subskill_analyses[{idx}]"
        if not isinstance(item, dict):
            errors.append(f"{label} is not a mapping")
            continue
        if not has_recorded_value(item.get("subskill_id")):
            errors.append(f"{label}.subskill_id is missing")
        elif not is_subskill_analysis_id(str(item.get("subskill_id"))):
            errors.append(f"{label}.subskill_id is not a method/job or discovery subskill ID")
        role = item.get("role")
        if not has_recorded_value(role):
            errors.append(f"{label}.role is not recorded")
        elif role not in METHOD_JOB_ROLES:
            errors.append(f"{label}.role has unsupported value {role!r}")
        status = item.get("status")
        if not has_recorded_value(status):
            errors.append(f"{label}.status is not recorded")
        elif status not in METHOD_JOB_STATUSES:
            errors.append(f"{label}.status has unsupported value {status!r}")
        readiness = item.get("readiness")
        if not has_recorded_value(readiness):
            errors.append(f"{label}.readiness is not recorded")
        elif readiness not in PRODUCTION_LOOP_READINESS:
            errors.append(f"{label}.readiness has unsupported value {readiness!r}")
        action = item.get("recommended_next_action")
        if not has_recorded_value(action):
            errors.append(f"{label}.recommended_next_action is not recorded")
        elif action not in ACTIONS:
            errors.append(f"{label}.recommended_next_action has unsupported value {action!r}")
        signal = item.get("blocking_signal")
        errors.extend(validate_blocking_signal(signal, f"{label}.blocking_signal"))
        blocks, recheck, _target_phase = blocking_signal_state(signal)
        if is_discovery_subskill_id(str(item.get("subskill_id"))) and (blocks or recheck):
            errors.append(
                f"{label} is a discovery sidecar record but its blocking_signal is active; route implications through an existing owner instead"
            )
        if recheck and action != "return_to_foundation":
            errors.append(
                f"{label}.blocking_signal.requires_previous_phase_recheck is true but recommended_next_action is not return_to_foundation"
            )
    return errors


def validate_task_parking_lot(value):
    errors = []
    if value in (MISSING, None):
        return errors
    if not isinstance(value, dict):
        return ["main_skill.task_parking_lot is not a mapping"]

    current_task = value.get("current_task")
    parked_tasks = value.get("parked_tasks")
    if current_task is not None and not isinstance(current_task, str):
        errors.append("main_skill.task_parking_lot.current_task is not a string or null")
    if parked_tasks in (MISSING, None):
        return errors
    if not isinstance(parked_tasks, list):
        return ["main_skill.task_parking_lot.parked_tasks is not a list"]
    if len(parked_tasks) > 3:
        errors.append("main_skill.task_parking_lot.parked_tasks has more than 3 entries")

    for idx, item in enumerate(parked_tasks):
        label = f"main_skill.task_parking_lot.parked_tasks[{idx}]"
        if not isinstance(item, dict):
            errors.append(f"{label} is not a mapping")
            continue
        if not has_recorded_value(item.get("summary")):
            errors.append(f"{label}.summary is not recorded")
        status = item.get("status")
        if status not in PARKED_TASK_STATUSES:
            errors.append(
                f"{label}.status has unsupported value {status!r}; expected one of {sorted(PARKED_TASK_STATUSES)}"
            )
        if not has_recorded_value(item.get("resume_if")):
            errors.append(f"{label}.resume_if is not recorded")
        artifact_paths = item.get("artifact_paths", [])
        if artifact_paths is not None and not isinstance(artifact_paths, list):
            errors.append(f"{label}.artifact_paths is not a list")
    return errors


def validate_discovery_sidecar(value):
    errors = []
    if value in (MISSING, None):
        return errors
    if not isinstance(value, dict):
        return ["analysis.discovery_sidecar is not a mapping"]

    active = value.get("active")
    purpose = value.get("purpose")
    return_to_phase = value.get("return_to_phase")
    affects_main_route = value.get("affects_main_route")
    artifact_paths = value.get("artifact_paths")

    if not isinstance(active, bool):
        errors.append("analysis.discovery_sidecar.active is not a boolean")
    if not isinstance(affects_main_route, bool):
        errors.append("analysis.discovery_sidecar.affects_main_route is not a boolean")
    if artifact_paths is not None and not isinstance(artifact_paths, list):
        errors.append("analysis.discovery_sidecar.artifact_paths is not a list")
    if has_recorded_value(purpose) and purpose not in DISCOVERY_PURPOSES:
        errors.append(
            "analysis.discovery_sidecar.purpose has unsupported value "
            f"{purpose!r}; expected one of {sorted(DISCOVERY_PURPOSES)}"
        )
    if (
        active is not True
        and return_to_phase is not None
        and return_to_phase not in DISCOVERY_RETURN_PHASES
    ):
        errors.append(
            "analysis.discovery_sidecar.return_to_phase has unsupported value "
            f"{return_to_phase!r}; expected one of {sorted(DISCOVERY_RETURN_PHASES)}"
        )
    if active is True:
        if not has_recorded_value(purpose):
            errors.append("analysis.discovery_sidecar is active but purpose is not recorded")
        if return_to_phase not in DISCOVERY_RETURN_PHASES:
            errors.append(
                "analysis.discovery_sidecar is active but return_to_phase is not concrete; "
                "use foundation, production, or reporting, and ask the user before activating "
                "if the destination is unclear"
            )
    if affects_main_route is True and active is True:
        errors.append(
            "analysis.discovery_sidecar.affects_main_route is true while sidecar is active; "
            "pause/close the sidecar and route the implication through an existing owner"
        )
    return errors


def validate_production_reviewer_summaries(value):
    errors = []
    data_technician_summary_seen = False
    report_writer_summary_seen = False
    foundation_recheck_needed = False
    production_blocking_signal_seen = False
    allowed_reviewer_ids = {"02-data-technician", "20-report-writer"}

    if value in (MISSING, None):
        return errors, data_technician_summary_seen, report_writer_summary_seen, foundation_recheck_needed, production_blocking_signal_seen
    if not isinstance(value, list):
        return ["analysis.production_loop.reviewer_summaries is not a list"], False, False, False, False

    for idx, item in enumerate(value):
        label = f"analysis.production_loop.reviewer_summaries[{idx}]"
        if not isinstance(item, dict):
            errors.append(f"{label} is not a mapping")
            continue

        reviewer_id = item.get("reviewer_id")
        if not has_recorded_value(reviewer_id):
            errors.append(f"{label}.reviewer_id is missing")
        elif reviewer_id not in allowed_reviewer_ids:
            if is_method_job_subskill_id(str(reviewer_id)):
                errors.append(
                    f"{label}.reviewer_id is a method/job subskill; activated method/job feedback belongs in subskill_analyses"
                )
            else:
                errors.append(
                    f"{label}.reviewer_id has unsupported value {reviewer_id!r}; expected one of {sorted(allowed_reviewer_ids)}"
                )
        if item.get("phase_context") != "production":
            errors.append(f"{label}.phase_context must be 'production'")

        purpose = item.get("review_purpose")
        if purpose not in PRODUCTION_REVIEW_PURPOSES:
            errors.append(f"{label}.review_purpose has unsupported value {purpose!r}")
        readiness = item.get("production_readiness")
        if readiness not in PRODUCTION_LOOP_READINESS:
            errors.append(f"{label}.production_readiness has unsupported value {readiness!r}")
        effect = item.get("foundation_readiness_effect")
        if effect not in FOUNDATION_READINESS_EFFECT:
            errors.append(f"{label}.foundation_readiness_effect has unsupported value {effect!r}")
        if not has_recorded_value(item.get("summary")):
            errors.append(f"{label}.summary is not recorded")
        signal = item.get("blocking_signal")
        if signal is None:
            errors.append(f"{label}.blocking_signal is missing")
        errors.extend(validate_blocking_signal(signal, f"{label}.blocking_signal"))
        blocks, recheck, target_phase = blocking_signal_state(signal)
        if blocks and target_phase == "production":
            production_blocking_signal_seen = True
        if recheck:
            foundation_recheck_needed = True
        action = item.get("recommended_next_action")
        if action not in ACTIONS:
            errors.append(f"{label}.recommended_next_action has unsupported value {action!r}")
        if recheck and action != "return_to_foundation":
            errors.append(
                f"{label}.blocking_signal.requires_previous_phase_recheck is true but recommended_next_action is not return_to_foundation"
            )
        artifact_paths = item.get("artifact_paths")
        if artifact_paths is not None and not isinstance(artifact_paths, list):
            errors.append(f"{label}.artifact_paths is not a list")

        if reviewer_id == "02-data-technician":
            data_technician_summary_seen = True
            if effect == "recheck_needed":
                foundation_recheck_needed = True
        if reviewer_id == "20-report-writer":
            report_writer_summary_seen = True

    return errors, data_technician_summary_seen, report_writer_summary_seen, foundation_recheck_needed, production_blocking_signal_seen


def compact_list_ids(value, key="subskill_id"):
    if not isinstance(value, list):
        return []
    ids = []
    for item in value:
        if isinstance(item, str) and has_recorded_value(item):
            ids.append(item)
        elif isinstance(item, dict) and has_recorded_value(item.get(key)):
            ids.append(str(item[key]))
    return ids


def is_method_job_subskill_id(value):
    if not isinstance(value, str):
        return False
    if value == DISCOVERY_SUBSKILL_ID:
        return False
    prefix = value.split("-", 1)[0]
    if not prefix.isdigit():
        return False
    number = int(prefix)
    return 5 <= number <= 19 or number == 21


def is_discovery_subskill_id(value):
    return value == DISCOVERY_SUBSKILL_ID


def is_subskill_analysis_id(value):
    return is_method_job_subskill_id(value) or is_discovery_subskill_id(value)


def validate_workflow_invariants(data):
    errors = []

    current_phase = get_path(data, ("project", "current_phase"))
    main_action = get_path(data, ("main_skill", "selected_next_action"))
    gate_status = get_path(data, ("foundation_gate", "status"))
    can_support = get_path(data, ("foundation_gate", "can_support_causal_commitment"))
    foundation_selected_reviewers = get_path(data, ("evaluator_loop", "selected_reviewers"))
    action_queue = get_path(data, ("evaluator_loop", "action_queue"))
    blocking_actions = blocking_items(action_queue)
    action_signal_errors, _action_blocks_foundation, _action_blocks_production, _action_requires_recheck = (
        collect_blocking_signal_states(action_queue, "evaluator_loop.action_queue")
    )
    errors.extend(action_signal_errors)
    blocking_requests = []
    blocking_evaluator_readiness = []
    for evaluator_id in (
        "domain_helper_01",
        "data_technician_02",
        "design_planner_03",
        "dag_builder_04",
    ):
        errors.extend(
            validate_handoff_notes(
                get_path(data, ("evaluators", evaluator_id, "handoff_notes")),
                f"evaluators.{evaluator_id}.handoff_notes",
            )
        )
        if get_path(data, ("evaluators", evaluator_id, "readiness")) == "blocks_foundation_gate":
            blocking_evaluator_readiness.append(evaluator_id)
        requests = get_path(data, ("evaluators", evaluator_id, "requests_for_main_skill"))
        request_signal_errors, _req_blocks_foundation, _req_blocks_production, _req_requires_recheck = (
            collect_blocking_signal_states(requests, f"evaluators.{evaluator_id}.requests_for_main_skill")
        )
        errors.extend(request_signal_errors)
        blocking_requests.extend([f"{evaluator_id}:{x}" for x in blocking_items(requests)])

    load_bearing = collect_load_bearing(data)
    surfaced = get_path(data, ("foundation_gate", "surfaced_or_acknowledged_assumptions"))
    deferred = get_path(data, ("foundation_gate", "deferred_assumptions"))
    current_route_id = get_path(data, ("routes", "current_route_id"))
    preferred_route_id = get_path(
        data, ("evaluators", "design_planner_03", "preferred_route_id")
    )

    if gate_status == "ready":
        if not (
            has_recorded_value(current_route_id)
            or has_recorded_value(preferred_route_id)
        ):
            errors.append(
                "foundation_gate.status is 'ready' but no current or preferred route_id is recorded"
            )
        if can_support is not True:
            errors.append("foundation_gate.status is 'ready' but can_support_causal_commitment is not true")
        if has_recorded_value(get_path(data, ("foundation_gate", "blockers"))):
            errors.append("foundation_gate.status is 'ready' but blockers are recorded")
        if has_recorded_value(get_path(data, ("foundation_gate", "unresolved_required_information"))):
            errors.append("foundation_gate.status is 'ready' but unresolved_required_information is recorded")
        if blocking_actions:
            errors.append(
                "foundation_gate.status is 'ready' but blocking action_queue items remain: "
                + ", ".join(blocking_actions)
            )
        if blocking_requests:
            errors.append(
                "foundation_gate.status is 'ready' but blocking evaluator requests remain: "
                + ", ".join(blocking_requests)
            )
        if blocking_evaluator_readiness:
            errors.append(
                "foundation_gate.status is 'ready' but evaluator readiness blocks remain: "
                + ", ".join(blocking_evaluator_readiness)
            )
        if load_bearing and not (has_recorded_value(surfaced) or has_recorded_value(deferred)):
            errors.append(
                "foundation_gate.status is 'ready' but load-bearing assumptions are not surfaced, acknowledged, or deferred"
            )
    elif can_support is not False:
        errors.append(
            "foundation_gate.status is not 'ready' but can_support_causal_commitment is not false"
        )

    loop_status = get_path(data, ("evaluator_loop", "loop_control", "status"))
    repeated_count = get_path(data, ("evaluator_loop", "loop_control", "repeated_cycle_count"))
    break_action = get_path(data, ("evaluator_loop", "loop_control", "break_action"))
    break_rationale = get_path(data, ("evaluator_loop", "loop_control", "rationale"))
    decisive = get_path(data, ("evaluator_loop", "loop_control", "decisive_question_or_assumption"))
    if loop_status == "loop detected":
        if not isinstance(repeated_count, int) or isinstance(repeated_count, bool) or repeated_count < 2:
            errors.append("loop detected but repeated_cycle_count is not an integer >= 2")
        if break_action in {"unknown", MISSING}:
            errors.append("loop detected but break_action does not break the loop")
        if not has_recorded_value(break_rationale):
            errors.append("loop detected but rationale is not recorded")
        if break_action in {
            "ask_decisive_user_question",
            "make_nonharmful_working_assumption",
            "surface_load_bearing_assumption",
        } and not has_recorded_value(decisive):
            errors.append("loop detected but decisive_question_or_assumption is not recorded")

    user_directed = get_path(data, ("main_skill", "user_directed", "requested"))
    route_status = get_path(data, ("analysis", "route_commitment_status"))
    claim_strength = get_path(data, ("analysis", "claim_strength"))
    gate_claim_strength = get_path(data, ("foundation_gate", "claim_strength_allowed"))
    if user_directed is True:
        if gate_status == "ready":
            errors.append("user-directed continuation is active but foundation_gate.status is ready")
        if can_support is not False:
            errors.append("user-directed continuation is active but can_support_causal_commitment is not false")
        if route_status != "user-directed":
            errors.append("user-directed continuation is active but analysis.route_commitment_status is not user-directed")
        if get_path(data, ("main_skill", "user_directed", "acknowledged_limits")) is not True:
            errors.append("user-directed continuation is active but acknowledged_limits is not true")
        if get_path(data, ("main_skill", "user_directed", "intent_basis")) in {"none", "unknown", MISSING}:
            errors.append("user-directed continuation is active but intent_basis is not recorded")
        for path, label in [
            (("main_skill", "user_directed", "requested_scope"), "requested_scope"),
            (("main_skill", "user_directed", "allowed_scope"), "allowed_scope"),
            (("main_skill", "user_directed", "prohibited_claims"), "prohibited_claims"),
            (("main_skill", "user_directed", "warning"), "warning"),
        ]:
            if not has_recorded_value(get_path(data, path)):
                errors.append(f"user-directed continuation is active but {label} is empty")

    if route_status == "user-directed":
        if user_directed is not True:
            errors.append("analysis.route_commitment_status is user-directed but main_skill.user_directed.requested is not true")
        if claim_strength == "causal":
            errors.append("analysis.route_commitment_status is user-directed but analysis.claim_strength is causal")
        if gate_claim_strength == "causal":
            errors.append("analysis.route_commitment_status is user-directed but foundation_gate.claim_strength_allowed is causal")

    if route_status in {"ready", "committed"} and gate_status != "ready":
        errors.append("analysis.route_commitment_status is ready/committed but foundation_gate.status is not ready")

    execution_stage = get_path(data, ("analysis", "execution_stage"))
    user_confirmed_plan = get_path(data, ("analysis", "execution_confirmation", "user_confirmed_plan"))
    confirmation_basis = get_path(data, ("analysis", "execution_confirmation", "confirmation_basis"))
    stages_after_confirmation = {
        "plan confirmed",
        "first pass run",
        "diagnostics proposed",
        "diagnostics confirmed",
        "diagnostics complete",
        "report writer activated",
        "final report delivered",
    }
    if (
        execution_stage in stages_after_confirmation
        and user_confirmed_plan is not True
        and confirmation_basis != "not required"
    ):
        errors.append(
            "analysis.execution_stage indicates execution moved past planning but "
            "analysis.execution_confirmation.user_confirmed_plan is not true and confirmation_basis is not 'not required'"
        )
    if route_status == "committed" and user_confirmed_plan is not True:
        errors.append("analysis.route_commitment_status is committed but the analysis plan is not user-confirmed")

    data_readiness = get_path(data, ("evaluators", "data_technician_02", "readiness"))
    data_scope = get_path(data, ("evaluators", "data_technician_02", "readiness_scope"))
    method_fit_suggestions = get_path(data, ("evaluators", "data_technician_02", "method_fit_suggestions"))
    recommended_method_job_subskills = get_path(data, ("analysis", "recommended_method_job_subskills"))
    activated_method_job_subskills = get_path(data, ("analysis", "activated_method_job_subskills"))
    active_method_subskills = activated_method_job_subskills
    errors.extend(validate_task_parking_lot(get_path(data, ("main_skill", "task_parking_lot"))))
    errors.extend(validate_discovery_sidecar(get_path(data, ("analysis", "discovery_sidecar"))))
    if data_readiness == "ready" and not has_recorded_value(data_scope):
        errors.append("data_technician_02.readiness is ready but readiness_scope is not recorded")
    stages_after_method_fit = stages_after_confirmation
    if (
        (
            route_status in {"ready", "committed", "user-directed"}
            and (
                has_recorded_value(activated_method_job_subskills)
                or has_recorded_value(recommended_method_job_subskills)
            )
        )
        or execution_stage in stages_after_method_fit
    ) and not has_recorded_value(method_fit_suggestions):
        errors.append(
            "analysis has method execution or recommended/activated method-job subskills but "
            "data_technician_02.method_fit_suggestions is not recorded"
        )
    stages_after_first_pass = {
        "first pass run",
        "diagnostics proposed",
        "diagnostics confirmed",
        "diagnostics complete",
        "report writer activated",
        "final report delivered",
    }
    if execution_stage in stages_after_first_pass and not has_recorded_value(active_method_subskills):
        errors.append("analysis.execution_stage indicates modeling/diagnostics but no activated method-job subskill is recorded")

    production_review_purpose = get_path(data, ("analysis", "production_loop", "review_purpose"))
    production_readiness = get_path(data, ("analysis", "production_loop", "readiness"))
    production_recommended_action = get_path(data, ("analysis", "production_loop", "recommended_next_action"))
    production_selected_reviewers = get_path(data, ("analysis", "production_loop", "selected_reviewers"))
    production_reviewer_summaries = get_path(data, ("analysis", "production_loop", "reviewer_summaries"))
    production_action_queue = get_path(data, ("analysis", "production_loop", "action_queue"))
    foundation_recheck_triggered = get_path(
        data, ("analysis", "production_loop", "foundation_recheck", "triggered")
    )
    foundation_recheck_reason = get_path(
        data, ("analysis", "production_loop", "foundation_recheck", "reason")
    )
    foundation_recheck_decision = get_path(
        data, ("analysis", "production_loop", "foundation_recheck", "main_skill_decision")
    )
    foundation_recheck_reviewers = get_path(
        data, ("analysis", "production_loop", "foundation_recheck", "recommended_reviewers")
    )
    production_loop_status = get_path(data, ("analysis", "production_loop", "loop_control", "status"))
    production_repeated_count = get_path(data, ("analysis", "production_loop", "loop_control", "repeated_cycle_count"))
    production_break_action = get_path(data, ("analysis", "production_loop", "loop_control", "break_action"))
    production_break_rationale = get_path(data, ("analysis", "production_loop", "loop_control", "rationale"))
    (
        reviewer_summary_errors,
        data_technician_summary_seen,
        report_writer_summary_seen,
        reviewer_foundation_recheck_needed,
        reviewer_production_block,
    ) = (
        validate_production_reviewer_summaries(production_reviewer_summaries)
    )
    errors.extend(reviewer_summary_errors)
    production_action_errors, _action_blocks_foundation, action_blocks_production, action_requires_recheck = (
        collect_blocking_signal_states(production_action_queue, "analysis.production_loop.action_queue")
    )
    errors.extend(production_action_errors)
    subskill_signal_errors, _subskill_blocks_foundation, subskill_blocks_production, subskill_requires_recheck = (
        collect_blocking_signal_states(
            get_path(data, ("subskill_analyses",)), "subskill_analyses"
        )
    )
    errors.extend(subskill_signal_errors)
    production_blocking_signal_seen = (
        reviewer_production_block or action_blocks_production or subskill_blocks_production
    )
    foundation_recheck_needed_by_signal = (
        reviewer_foundation_recheck_needed or action_requires_recheck or subskill_requires_recheck
    )
    production_reviewer_ids = set(compact_list_ids(production_selected_reviewers))
    production_reviewer_ids.update(compact_list_ids(production_selected_reviewers, key="reviewer_id"))
    foundation_reviewer_ids = set(compact_list_ids(foundation_selected_reviewers))
    foundation_reviewer_ids.update(compact_list_ids(foundation_selected_reviewers, key="reviewer_id"))

    if DISCOVERY_SUBSKILL_ID in foundation_reviewer_ids:
        errors.append(
            "18-causal-discovery is a sidecar and must not be recorded in evaluator_loop.selected_reviewers; use analysis.discovery_sidecar"
        )
    if DISCOVERY_SUBSKILL_ID in production_reviewer_ids:
        errors.append(
            "18-causal-discovery is a sidecar and must not be recorded in analysis.production_loop.selected_reviewers; use analysis.discovery_sidecar"
        )

    if (
        "02-data-technician" in production_reviewer_ids
        and not data_technician_summary_seen
        and not has_recorded_value(production_action_queue)
    ):
        errors.append(
            "02-data-technician is selected for production but no Data Technician reviewer summary or action_queue item is recorded"
        )
    if (
        "20-report-writer" in production_reviewer_ids
        and not report_writer_summary_seen
        and not has_recorded_value(get_path(data, ("analysis", "report_writer_20", "production_feedback")))
        and not has_recorded_value(production_action_queue)
    ):
        errors.append(
            "20-report-writer is selected for production but no Report Writer reviewer summary, production_feedback, or action_queue item is recorded"
        )
    if foundation_recheck_needed_by_signal and foundation_recheck_triggered is not True:
        errors.append(
            "production blocking_signal requires foundation recheck but production_loop.foundation_recheck is not triggered"
        )

    production_loop_required_stages = {
        "plan confirmed",
        "first pass run",
        "diagnostics proposed",
        "diagnostics confirmed",
        "diagnostics complete",
        "report writer activated",
        "final report delivered",
    }
    if (
        execution_stage in production_loop_required_stages
        or has_recorded_value(active_method_subskills)
    ):
        if not has_recorded_value(production_review_purpose):
            errors.append(
                "analysis has production work active or underway but analysis.production_loop.review_purpose is not recorded"
            )
        if production_readiness in {"not started", "unknown", MISSING}:
            errors.append(
                "analysis has production work active or underway but analysis.production_loop.readiness is not recorded"
            )
        if not has_recorded_value(production_recommended_action):
            errors.append(
                "analysis has production work active or underway but analysis.production_loop.recommended_next_action is not recorded"
            )
        if not (
            has_recorded_value(production_selected_reviewers)
            or has_recorded_value(production_reviewer_summaries)
            or has_recorded_value(production_action_queue)
        ):
            errors.append(
                "analysis has production work active or underway but analysis.production_loop has no selected reviewers, reviewer summaries, or action queue"
            )

    if production_loop_status == "loop detected":
        if (
            not isinstance(production_repeated_count, int)
            or isinstance(production_repeated_count, bool)
            or production_repeated_count < 2
        ):
            errors.append("production loop detected but repeated_cycle_count is not an integer >= 2")
        if production_break_action in {"unknown", MISSING}:
            errors.append("production loop detected but break_action does not break the loop")
        if not has_recorded_value(production_break_rationale):
            errors.append("production loop detected but rationale is not recorded")

    if foundation_recheck_triggered is True:
        if not has_recorded_value(foundation_recheck_reason):
            errors.append("foundation_recheck is triggered but reason is not recorded")
        if foundation_recheck_decision in {"none", "unknown", MISSING}:
            errors.append("foundation_recheck is triggered but main_skill_decision is not recorded")
        if production_readiness == "reportable":
            errors.append("foundation_recheck is triggered but production_loop.readiness is reportable")
        if production_recommended_action == "mark_production_ready":
            errors.append("foundation_recheck is triggered but production_loop recommends mark_production_ready")
        if foundation_recheck_decision == "return_to_foundation":
            if get_path(data, ("project", "current_phase")) != "foundation":
                errors.append("foundation_recheck decision is return_to_foundation but project.current_phase is not foundation")
            if gate_status == "ready":
                errors.append("foundation_recheck decision is return_to_foundation but foundation_gate.status is still ready")
            if production_readiness not in {"foundation recheck needed", "blocked"}:
                errors.append(
                    "foundation_recheck decision is return_to_foundation but production_loop.readiness is not foundation recheck needed/blocked"
                )
            if not has_recorded_value(foundation_recheck_reviewers):
                errors.append("foundation_recheck decision is return_to_foundation but recommended_reviewers is empty")

    production_gate_status = get_path(data, ("production_gate", "status"))
    production_can_handoff = get_path(data, ("production_gate", "can_handoff_to_report_writer"))
    production_blockers = get_path(data, ("production_gate", "blockers"))
    unresolved_materials = get_path(data, ("production_gate", "unresolved_required_materials"))
    completed_outputs = get_path(data, ("production_gate", "completed_outputs"))
    diagnostics_status = get_path(data, ("production_gate", "diagnostics_status"))
    reportable_evidence = get_path(data, ("production_gate", "reportable_evidence"))
    handoff_summary = get_path(data, ("production_gate", "handoff_summary"))
    production_ready_readiness = {
        "diagnostics complete",
        "diagnostics deferred",
        "diagnostics not needed",
        "materials ready",
        "reportable",
    }
    if production_gate_status == "ready":
        if gate_status != "ready":
            errors.append("production_gate.status is ready but foundation_gate.status is not ready")
        if route_status not in {"ready", "committed"}:
            errors.append("production_gate.status is ready but analysis.route_commitment_status is not ready/committed")
        if production_can_handoff is not True:
            errors.append("production_gate.status is ready but can_handoff_to_report_writer is not true")
        if has_recorded_value(production_blockers):
            errors.append("production_gate.status is ready but blockers are recorded")
        if has_recorded_value(unresolved_materials):
            errors.append("production_gate.status is ready but unresolved_required_materials are recorded")
        if reportable_evidence is not True:
            errors.append("production_gate.status is ready but reportable_evidence is not true")
        if diagnostics_status not in {"complete", "deferred", "not needed"}:
            errors.append("production_gate.status is ready but diagnostics_status is not complete/deferred/not needed")
        if production_readiness not in production_ready_readiness:
            errors.append("production_gate.status is ready but analysis.production_loop.readiness is not report-ready")
        if foundation_recheck_triggered is True:
            errors.append("production_gate.status is ready but foundation_recheck is triggered")
        if foundation_recheck_needed_by_signal:
            errors.append("production_gate.status is ready but a production blocking_signal requested foundation recheck")
        if production_blocking_signal_seen:
            errors.append("production_gate.status is ready but a production blocking_signal blocks the current phase")
        if not (
            has_recorded_value(completed_outputs)
            or has_recorded_value(get_path(data, ("analysis", "first_pass_summary")))
            or has_recorded_value(get_path(data, ("analysis", "analyses")))
            or has_recorded_value(get_path(data, ("artifacts",)))
        ):
            errors.append("production_gate.status is ready but no completed output, first-pass summary, analysis, or artifact is recorded")
        if not has_recorded_value(handoff_summary):
            errors.append("production_gate.status is ready but handoff_summary is not recorded")
    elif production_can_handoff is not False:
        errors.append("production_gate.status is not ready but can_handoff_to_report_writer is not false")
    if production_gate_status == "blocked" and not has_recorded_value(production_blockers):
        errors.append("production_gate.status is blocked but no blockers are recorded")

    report_writer_mode = get_path(data, ("analysis", "report_writer_20", "mode"))
    report_writer_status = get_path(data, ("analysis", "report_writer_20", "status"))
    discovery_purpose = get_path(data, ("analysis", "discovery_sidecar", "purpose"))
    discovery_artifacts = get_path(data, ("analysis", "discovery_sidecar", "artifact_paths"))
    report_writer_statuses_by_mode = {
        "not selected": {"not ready"},
        "production reviewer": {
            "not ready",
            "production feedback recorded",
            "blocked",
        },
        "handoff writer": {
            "not ready",
            "activated",
            "final report delivered",
            "blocked",
        },
        "discovery report writer": {
            "not ready",
            "activated",
            "discovery report delivered",
            "blocked",
        },
    }
    allowed_report_writer_statuses = report_writer_statuses_by_mode.get(report_writer_mode)
    if (
        allowed_report_writer_statuses is not None
        and report_writer_status not in allowed_report_writer_statuses
    ):
        errors.append(
            "analysis.report_writer_20.status is not compatible with "
            f"analysis.report_writer_20.mode {report_writer_mode!r}: {report_writer_status!r}"
        )
    delivered_report_status = report_writer_status in {
        "discovery report delivered",
        "final report delivered",
    }
    delivered_report_stage = execution_stage == "final report delivered"
    report_writer_execution_stages = {
        "report writer activated",
        "final report delivered",
    }
    discovery_report_active = (
        report_writer_mode == "discovery report writer"
        or report_writer_status == "discovery report delivered"
    )
    effect_report_handoff_active = (
        report_writer_mode == "handoff writer"
        or report_writer_status in {"activated", "final report delivered"}
        or execution_stage in report_writer_execution_stages
    )
    if discovery_report_active:
        if report_writer_mode != "discovery report writer":
            errors.append("Discovery Report Writer is active but analysis.report_writer_20.mode is not discovery report writer")
        if report_writer_status in {"final report delivered"}:
            errors.append("Discovery Report Writer is active but report_writer_20.status is an effect-report status")
        if execution_stage in report_writer_execution_stages:
            errors.append("Discovery Report Writer is active but analysis.execution_stage records effect-report handoff or delivery")
        if not delivered_report_status and current_phase != "reporting":
            errors.append("Discovery Report Writer is active before delivery but project.current_phase is not reporting")
        if report_writer_status == "discovery report delivered" and current_phase != "post_delivery":
            errors.append("Discovery report is delivered but project.current_phase is not post_delivery")
        if report_writer_status == "discovery report delivered" and main_action != "ask_user":
            errors.append("Discovery report is delivered but main_skill.selected_next_action is not ask_user")
        if report_writer_status == "discovery report delivered" and not (
            has_recorded_value(discovery_artifacts)
            or has_recorded_value(get_path(data, ("artifacts",)))
        ):
            errors.append("Discovery report is delivered but no discovery artifact or report artifact is recorded")
        if report_writer_status != "final report delivered":
            if discovery_purpose != "discovery-only report":
                errors.append("Discovery Report Writer is active but discovery_sidecar.purpose is not discovery-only report")
            if gate_status != "not needed":
                errors.append("Discovery Report Writer is active but foundation_gate.status is not not needed")
            if production_gate_status != "not needed":
                errors.append("Discovery Report Writer is active but production_gate.status is not not needed")
            if production_can_handoff is not False:
                errors.append("Discovery Report Writer is active but production_gate.can_handoff_to_report_writer must be false")
    elif effect_report_handoff_active:
        if not (delivered_report_status or delivered_report_stage) and current_phase != "reporting":
            errors.append("Report Writer handoff is active before delivery but project.current_phase is not reporting")
        if report_writer_status == "discovery report delivered":
            errors.append("Report Writer handoff is active but report_writer_20.status is a discovery-report status")
        if report_writer_mode != "handoff writer":
            errors.append("Report Writer handoff is active but analysis.report_writer_20.mode is not handoff writer")
        if gate_status != "ready":
            errors.append("Report Writer handoff is active but foundation_gate.status is not ready")
        if production_gate_status != "ready":
            errors.append("Report Writer handoff is active but production_gate.status is not ready")
        if production_can_handoff is not True:
            errors.append("Report Writer handoff is active but production_gate.can_handoff_to_report_writer must be true")
        if route_status not in {"ready", "committed"}:
            errors.append("Report Writer handoff is active but analysis.route_commitment_status is not ready/committed")
        if not (
            has_recorded_value(get_path(data, ("analysis", "first_pass_summary")))
            or has_recorded_value(get_path(data, ("analysis", "analyses")))
            or has_recorded_value(get_path(data, ("artifacts",)))
        ):
            errors.append("Report Writer handoff is active but no first-pass summary, analysis artifact, or artifact is recorded")
        if production_readiness not in {
            "diagnostics complete",
            "diagnostics deferred",
            "diagnostics not needed",
            "materials ready",
            "reportable",
        }:
            errors.append(
                "Report Writer handoff is active but analysis.production_loop.readiness does not show diagnostics complete/deferred/not needed, materials ready, or reportable"
            )
        if execution_stage == "report writer activated" and report_writer_status != "activated":
            errors.append(
                "analysis.execution_stage is report writer activated but analysis.report_writer_20.status is not activated"
            )
        if report_writer_status == "activated" and execution_stage != "report writer activated":
            errors.append(
                "analysis.report_writer_20.status is activated but analysis.execution_stage is not report writer activated"
            )
        if delivered_report_stage and report_writer_status != "final report delivered":
            errors.append(
                "analysis.execution_stage is final report delivered but analysis.report_writer_20.status is not final report delivered"
            )
        if report_writer_status == "final report delivered" and execution_stage != "final report delivered":
            errors.append(
                "analysis.report_writer_20.status is final report delivered but analysis.execution_stage is not final report delivered"
            )
    if delivered_report_status or delivered_report_stage:
        if current_phase != "post_delivery":
            errors.append(
                "Report Writer delivery is recorded but project.current_phase is not post_delivery"
            )
        if main_action != "ask_user":
            errors.append(
                "Report Writer delivery is recorded but main_skill.selected_next_action is not ask_user"
            )
    if current_phase == "post_delivery":
        if main_action != "ask_user":
            errors.append("project.current_phase is post_delivery but main_skill.selected_next_action is not ask_user")
        if not (
            delivered_report_status
            or delivered_report_stage
            or has_recorded_value(get_path(data, ("analysis", "report_writer_20", "artifacts")))
            or has_recorded_value(get_path(data, ("artifacts",)))
        ):
            errors.append(
                "project.current_phase is post_delivery but no delivered report status or artifact is recorded"
            )

    design_status = get_path(data, ("evaluators", "design_planner_03", "design_status"))
    dag_supported_status = get_path(data, ("evaluators", "dag_builder_04", "supported_status"))
    dag_readiness = get_path(data, ("evaluators", "dag_builder_04", "readiness"))
    if design_status == "feasible":
        if data_readiness == "blocks_foundation_gate":
            errors.append("design_planner_03.design_status is feasible but data_technician_02 readiness blocks the foundation gate")
        if dag_readiness == "blocks_foundation_gate":
            errors.append("design_planner_03.design_status is feasible but dag_builder_04 readiness blocks the foundation gate")
        if dag_supported_status in {"blocked", "needs design revision"}:
            errors.append(
                "design_planner_03.design_status is feasible but dag_builder_04.supported_status is "
                f"{dag_supported_status!r}"
            )

    dag_identification = get_path(data, ("evaluators", "dag_builder_04", "identification_status"))
    dag_scope = get_path(data, ("evaluators", "dag_builder_04", "supported_scope"))
    dag_summary = get_path(data, ("evaluators", "dag_builder_04", "summary"))
    dag_key_findings = get_path(data, ("evaluators", "dag_builder_04", "key_findings"))
    dag_handoff_notes = get_path(data, ("evaluators", "dag_builder_04", "handoff_notes"))
    if dag_supported_status == "supported":
        if dag_identification != "yes":
            errors.append("dag_builder_04.supported_status is supported but identification_status is not yes")
        if not has_recorded_value(dag_scope):
            errors.append("dag_builder_04.supported_status is supported but supported_scope is not recorded")
        if not (has_recorded_value(dag_summary) or has_recorded_value(dag_key_findings)):
            errors.append("dag_builder_04.supported_status is supported but neither summary nor key_findings is recorded")
    if dag_supported_status in {"blocked", "needs design revision"}:
        if dag_readiness == "ready":
            errors.append(
                f"dag_builder_04.supported_status is {dag_supported_status!r} but readiness is ready"
            )
        if not has_recorded_value(dag_handoff_notes):
            errors.append(
                f"dag_builder_04.supported_status is {dag_supported_status!r} but handoff_notes are empty"
            )

    errors.extend(validate_route_hypotheses(get_path(data, ("routes", "hypotheses")), "routes.hypotheses"))
    errors.extend(
        validate_route_hypotheses(
            get_path(data, ("evaluators", "design_planner_03", "route_hypotheses")),
            "evaluators.design_planner_03.route_hypotheses",
        )
    )
    subskill_analyses = get_path(data, ("subskill_analyses",))
    errors.extend(validate_subskill_analyses(subskill_analyses))

    recommended_ids = compact_list_ids(recommended_method_job_subskills)
    activated_ids = compact_list_ids(activated_method_job_subskills)
    analysis_record_ids = compact_list_ids(subskill_analyses)
    non_method_recommendations = [item for item in recommended_ids if not is_method_job_subskill_id(item)]
    if non_method_recommendations:
        errors.append(
            "analysis.recommended_method_job_subskills contains non-method/job subskill IDs: "
            + ", ".join(non_method_recommendations)
        )
    non_method_activations = [item for item in activated_ids if not is_method_job_subskill_id(item)]
    if non_method_activations:
        errors.append(
            "analysis.activated_method_job_subskills contains non-method/job subskill IDs: "
            + ", ".join(non_method_activations)
        )
    if activated_ids:
        missing_records = [item for item in activated_ids if item not in analysis_record_ids]
        if missing_records:
            errors.append(
                "activated method/job subskills are missing subskill_analyses records: "
                + ", ".join(missing_records)
            )
    if analysis_record_ids:
        unactivated_records = [
            item
            for item in analysis_record_ids
            if item not in activated_ids and not is_discovery_subskill_id(item)
        ]
        if unactivated_records:
            errors.append(
                "subskill_analyses contains records for method/job subskills not listed in analysis.activated_method_job_subskills: "
                + ", ".join(unactivated_records)
            )
    selected_method_jobs = [
        item
        for item in compact_list_ids(production_selected_reviewers, key="subskill_id")
        if is_method_job_subskill_id(item)
    ]
    if selected_method_jobs:
        missing_activated = [item for item in selected_method_jobs if item not in activated_ids]
        if missing_activated:
            errors.append(
                "production selected method/job reviewers are not recorded in analysis.activated_method_job_subskills: "
                + ", ".join(missing_activated)
            )

    return errors


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("spec")
    parser.add_argument(
        "--schema-only",
        action="store_true",
        help="Check required paths only; allow blank template enum placeholders.",
    )
    args = parser.parse_args()
    data = load_spec(args.spec)

    missing = [".".join(path) for path in REQUIRED_PATHS if get_path(data, path) is MISSING]
    if missing:
        print("Missing fields:")
        for item in missing:
            print(f"- {item}")
        raise SystemExit(1)

    if not args.schema_only:
        empty = [
            ".".join(path)
            for path in REQUIRED_NONEMPTY_PATHS
            if get_path(data, path) in (MISSING, None, "", [], {})
        ]
        if empty:
            print("Missing or empty initialized fields:")
            for item in empty:
                print(f"- {item}")
            raise SystemExit(1)

        invalid = []
        for path, allowed in ALLOWED_VALUES.items():
            value = get_path(data, path)
            if value is MISSING:
                continue
            if isinstance(value, str) and "|" in value:
                invalid.append(f"{'.'.join(path)} still contains placeholder choices: {value!r}")
            elif value is None and path in NULLABLE_ENUM_PATHS:
                continue
            elif value not in allowed:
                invalid.append(
                    f"{'.'.join(path)} has unsupported value {value!r}; expected one of {sorted(allowed)}"
                )
        if invalid:
            print("Invalid initialized values:")
            for item in invalid:
                print(f"- {item}")
            raise SystemExit(1)

        workflow_errors = validate_workflow_invariants(data)
        if workflow_errors:
            print("Invalid workflow state:")
            for item in workflow_errors:
                print(f"- {item}")
            raise SystemExit(1)

    if args.schema_only:
        print("Lean project specification paths are present.")
    else:
        print("Lean project specification paths and workflow invariants are valid.")


if __name__ == "__main__":
    main()
