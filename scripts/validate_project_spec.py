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

READINESS = {
    "ready",
    "sufficient_for_now",
    "needs_information",
    "blocks_ready_gate",
    "not_needed",
    "unknown",
}

ACTIONS = {
    "ask_user",
    "inspect_data",
    "literature_search",
    "refresh_domain_helper_01",
    "refresh_data_technician_02",
    "refresh_design_planner_03",
    "refresh_dag_builder_04",
    "confirm_analysis_plan",
    "activate_method_subskill",
    "run_first_pass",
    "run_diagnostics",
    "prepare_final_report",
    "proceed_with_caveat",
    "block_ready_gate",
    "mark_ready",
    "no_action",
    "unknown",
}

REQUIRED_PATHS = [
    ("project", "project_name"),
    ("project", "short_label"),
    ("project", "analyst"),
    ("project", "date_started"),
    ("project", "last_updated"),
    ("project", "state_folder"),
    ("project", "project_yaml"),
    ("project", "analyses_dir"),
    ("project", "artifacts_dir"),
    ("project", "project_status"),
    ("project", "current_phase"),
    ("main_skill", "user_goal"),
    ("main_skill", "primary_intent"),
    ("main_skill", "rigor_mode"),
    ("main_skill", "conversation_style"),
    ("main_skill", "selected_next_action"),
    ("main_skill", "summary_for_user"),
    ("main_skill", "open_questions"),
    ("main_skill", "assumptions_to_surface"),
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
    ("evaluator_loop", "trigger"),
    ("evaluator_loop", "selected_next_action"),
    ("evaluator_loop", "action_queue"),
    ("evaluator_loop", "readiness_signals", "domain_helper_01"),
    ("evaluator_loop", "readiness_signals", "data_technician_02"),
    ("evaluator_loop", "readiness_signals", "design_planner_03"),
    ("evaluator_loop", "readiness_signals", "dag_builder_04"),
    ("evaluator_loop", "summaries", "domain_helper_01"),
    ("evaluator_loop", "summaries", "data_technician_02"),
    ("evaluator_loop", "summaries", "design_planner_03"),
    ("evaluator_loop", "summaries", "dag_builder_04"),
    ("evaluator_loop", "loop_control", "status"),
    ("evaluator_loop", "loop_control", "repeated_cycle_count"),
    ("evaluator_loop", "loop_control", "issue_signature"),
    ("evaluator_loop", "loop_control", "break_action"),
    ("evaluator_loop", "loop_control", "rationale"),
    ("evaluator_loop", "loop_control", "decisive_question_or_assumption"),
    ("evaluators", "domain_helper_01", "status"),
    ("evaluators", "domain_helper_01", "readiness"),
    ("evaluators", "domain_helper_01", "summary"),
    ("evaluators", "domain_helper_01", "key_findings"),
    ("evaluators", "domain_helper_01", "candidate_formulations"),
    ("evaluators", "domain_helper_01", "implications", "data_technician_02"),
    ("evaluators", "domain_helper_01", "implications", "design_planner_03"),
    ("evaluators", "domain_helper_01", "implications", "dag_builder_04"),
    ("evaluators", "domain_helper_01", "requests_for_main_skill"),
    ("evaluators", "domain_helper_01", "nonharmful_assumptions"),
    ("evaluators", "domain_helper_01", "load_bearing_assumptions"),
    ("evaluators", "data_technician_02", "status"),
    ("evaluators", "data_technician_02", "readiness"),
    ("evaluators", "data_technician_02", "readiness_scope"),
    ("evaluators", "data_technician_02", "data_status"),
    ("evaluators", "data_technician_02", "summary"),
    ("evaluators", "data_technician_02", "key_findings"),
    ("evaluators", "data_technician_02", "data_enabled_opportunities"),
    ("evaluators", "data_technician_02", "method_fit_suggestions"),
    ("evaluators", "data_technician_02", "implications", "domain_helper_01"),
    ("evaluators", "data_technician_02", "implications", "design_planner_03"),
    ("evaluators", "data_technician_02", "implications", "dag_builder_04"),
    ("evaluators", "data_technician_02", "requests_for_main_skill"),
    ("evaluators", "data_technician_02", "nonharmful_assumptions"),
    ("evaluators", "data_technician_02", "load_bearing_assumptions"),
    ("evaluators", "design_planner_03", "status"),
    ("evaluators", "design_planner_03", "readiness"),
    ("evaluators", "design_planner_03", "design_status"),
    ("evaluators", "design_planner_03", "preferred_route_id"),
    ("evaluators", "design_planner_03", "summary"),
    ("evaluators", "design_planner_03", "key_findings"),
    ("evaluators", "design_planner_03", "route_hypotheses"),
    ("evaluators", "design_planner_03", "implications", "domain_helper_01"),
    ("evaluators", "design_planner_03", "implications", "data_technician_02"),
    ("evaluators", "design_planner_03", "implications", "dag_builder_04"),
    ("evaluators", "design_planner_03", "requests_for_main_skill"),
    ("evaluators", "design_planner_03", "nonharmful_assumptions"),
    ("evaluators", "design_planner_03", "load_bearing_assumptions"),
    ("evaluators", "dag_builder_04", "status"),
    ("evaluators", "dag_builder_04", "readiness"),
    ("evaluators", "dag_builder_04", "supported_status"),
    ("evaluators", "dag_builder_04", "supported_scope"),
    ("evaluators", "dag_builder_04", "identification_status"),
    ("evaluators", "dag_builder_04", "summary"),
    ("evaluators", "dag_builder_04", "key_findings"),
    ("evaluators", "dag_builder_04", "causal_logic_hypotheses"),
    ("evaluators", "dag_builder_04", "implications", "domain_helper_01"),
    ("evaluators", "dag_builder_04", "implications", "design_planner_03"),
    ("evaluators", "dag_builder_04", "implications", "data_technician_02"),
    ("evaluators", "dag_builder_04", "implications", "method_subskills"),
    ("evaluators", "dag_builder_04", "requests_for_main_skill"),
    ("evaluators", "dag_builder_04", "nonharmful_assumptions"),
    ("evaluators", "dag_builder_04", "load_bearing_assumptions"),
    ("routes", "current_route_id"),
    ("routes", "hypotheses"),
    ("routes", "rejected_or_deferred"),
    ("analysis", "route_commitment_status"),
    ("analysis", "execution_stage"),
    ("analysis", "execution_confirmation", "plan_summary"),
    ("analysis", "execution_confirmation", "user_confirmed_plan"),
    ("analysis", "execution_confirmation", "confirmation_basis"),
    ("analysis", "execution_confirmation", "confirmed_at"),
    ("analysis", "active_or_recommended_subskills"),
    ("analysis", "analyses"),
    ("analysis", "first_pass_summary"),
    ("analysis", "recommended_diagnostics"),
    ("analysis", "claim_strength"),
    ("analysis", "limitations"),
    ("subskill_analyses",),
    ("artifacts",),
    ("limitations",),
    ("open_questions",),
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
    ("project", "project_status"),
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
    ("evaluator_loop", "trigger"),
    ("evaluator_loop", "selected_next_action"),
    ("evaluator_loop", "readiness_signals", "domain_helper_01"),
    ("evaluator_loop", "readiness_signals", "data_technician_02"),
    ("evaluator_loop", "readiness_signals", "design_planner_03"),
    ("evaluator_loop", "readiness_signals", "dag_builder_04"),
    ("evaluator_loop", "loop_control", "status"),
    ("evaluator_loop", "loop_control", "repeated_cycle_count"),
    ("evaluator_loop", "loop_control", "break_action"),
    ("evaluators", "domain_helper_01", "status"),
    ("evaluators", "domain_helper_01", "readiness"),
    ("evaluators", "data_technician_02", "status"),
    ("evaluators", "data_technician_02", "readiness"),
    ("evaluators", "data_technician_02", "readiness_scope"),
    ("evaluators", "data_technician_02", "data_status"),
    ("evaluators", "design_planner_03", "status"),
    ("evaluators", "design_planner_03", "readiness"),
    ("evaluators", "design_planner_03", "design_status"),
    ("evaluators", "dag_builder_04", "status"),
    ("evaluators", "dag_builder_04", "readiness"),
    ("evaluators", "dag_builder_04", "supported_status"),
    ("evaluators", "dag_builder_04", "supported_scope"),
    ("evaluators", "dag_builder_04", "identification_status"),
    ("analysis", "route_commitment_status"),
    ("analysis", "execution_stage"),
    ("analysis", "execution_confirmation", "user_confirmed_plan"),
    ("analysis", "claim_strength"),
]

ALLOWED_VALUES = {
    ("project", "project_status"): {"active", "paused", "completed", "unknown"},
    ("project", "current_phase"): {
        "intake",
        "foundation loop",
        "method selection",
        "analysis",
        "reporting",
        "unknown",
    },
    ("main_skill", "primary_intent"): {
        "estimate effect",
        "choose method",
        "inspect data",
        "design study",
        "critique paper",
        "review assumptions",
        "interpret results",
        "write report",
        "debug code",
        "learn concept",
        "rescue analysis",
        "unknown",
    },
    ("main_skill", "rigor_mode"): {
        "not needed",
        "exploratory",
        "ready",
        "blocked",
        "user-directed",
        "unknown",
    },
    ("main_skill", "conversation_style"): {
        "suggest-and-invite",
        "suggest-and-confirm",
        "direct answer",
        "teaching",
        "unknown",
    },
    ("main_skill", "selected_next_action"): ACTIONS,
    ("main_skill", "user_directed", "intent_basis"): {
        "none",
        "explicit user request",
        "inferred urgency",
        "repeated preference to continue",
        "accepted caveated analysis",
        "declined further gate work",
        "unknown",
    },
    ("foundation_gate", "status"): {"not needed", "exploratory", "ready", "blocked", "unknown"},
    ("foundation_gate", "claim_strength_allowed"): {
        "causal",
        "cautious causal",
        "associational",
        "descriptive",
        "exploratory",
        "unknown",
    },
    ("evaluator_loop", "trigger"): {
        "user_update",
        "data_update",
        "design_change",
        "dag_feedback",
        "route_commitment",
        "user-directed",
        "unknown",
    },
    ("evaluator_loop", "selected_next_action"): ACTIONS,
    ("evaluator_loop", "readiness_signals", "domain_helper_01"): READINESS,
    ("evaluator_loop", "readiness_signals", "data_technician_02"): READINESS,
    ("evaluator_loop", "readiness_signals", "design_planner_03"): READINESS,
    ("evaluator_loop", "readiness_signals", "dag_builder_04"): READINESS,
    ("evaluator_loop", "loop_control", "status"): {
        "not assessed",
        "no loop",
        "possible loop",
        "loop detected",
        "resolved",
        "unknown",
    },
    ("evaluator_loop", "loop_control", "break_action"): {
        "ask_decisive_user_question",
        "make_nonharmful_working_assumption",
        "surface_load_bearing_assumption",
        "demote_or_block_route",
        "choose_fallback",
        "proceed_user_directed",
        "no_action",
        "unknown",
    },
    ("evaluators", "domain_helper_01", "status"): {"active", "inactive", "unknown"},
    ("evaluators", "domain_helper_01", "readiness"): READINESS,
    ("evaluators", "data_technician_02", "status"): {"active", "inactive", "unknown"},
    ("evaluators", "data_technician_02", "readiness"): READINESS,
    ("evaluators", "data_technician_02", "readiness_scope"): {
        "not assessed",
        "exploratory review",
        "route comparison",
        "design-data fit",
        "dag-data fit",
        "preprocessing",
        "method-specific modeling",
        "gate commitment",
        "user-directed execution",
        "unknown",
    },
    ("evaluators", "data_technician_02", "data_status"): {
        "existing",
        "partially existing",
        "conceptual",
        "unknown",
    },
    ("evaluators", "design_planner_03", "status"): {"active", "inactive", "unknown"},
    ("evaluators", "design_planner_03", "readiness"): READINESS,
    ("evaluators", "design_planner_03", "design_status"): {
        "promising",
        "feasible",
        "fragile",
        "blocked",
        "needs clarification",
        "unknown",
    },
    ("evaluators", "dag_builder_04", "status"): {"active", "inactive", "unknown"},
    ("evaluators", "dag_builder_04", "readiness"): READINESS,
    ("evaluators", "dag_builder_04", "supported_status"): {
        "supported",
        "fragile",
        "blocked",
        "needs design revision",
        "unknown",
    },
    ("evaluators", "dag_builder_04", "supported_scope"): {
        "not assessed",
        "exploratory audit",
        "route support",
        "design revision",
        "method handoff",
        "gate commitment",
        "user-directed execution",
        "unknown",
    },
    ("evaluators", "dag_builder_04", "identification_status"): {
        "yes",
        "no",
        "partial",
        "unknown",
    },
    ("analysis", "route_commitment_status"): {
        "exploratory",
        "ready",
        "committed",
        "blocked",
        "user-directed",
        "unknown",
    },
    ("analysis", "execution_stage"): {
        "not started",
        "plan proposed",
        "plan confirmed",
        "first pass run",
        "diagnostics proposed",
        "diagnostics confirmed",
        "diagnostics complete",
        "final reporting proposed",
        "final report approved",
        "completed",
        "unknown",
    },
    ("analysis", "execution_confirmation", "confirmation_basis"): {
        "explicit user approval",
        "user-directed continuation",
        "not required",
        "unknown",
    },
    ("analysis", "claim_strength"): {
        "causal",
        "cautious causal",
        "associational",
        "descriptive",
        "exploratory",
        "unknown",
    },
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


def blocking_items(items):
    found = []
    if not isinstance(items, list):
        return found
    for idx, item in enumerate(items):
        if not isinstance(item, dict):
            continue
        if item.get("readiness_impact") == "blocks_ready_gate" and item.get(
            "status", "open"
        ) in {"open", "selected"}:
            found.append(str(item.get("request_id") or item.get("note") or idx))
    return found


def collect_load_bearing(data):
    paths = [
        ("foundation_gate", "assumptions_to_surface"),
        ("main_skill", "assumptions_to_surface"),
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


def validate_route_hypotheses(value, label):
    errors = []
    if value in (MISSING, None):
        return errors
    if not isinstance(value, list):
        return [f"{label} is not a list"]
    allowed_status = {
        "promising",
        "feasible",
        "fragile",
        "blocked",
        "needs clarification",
        "rejected",
        "unknown",
    }
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


def validate_workflow_invariants(data):
    errors = []

    gate_status = get_path(data, ("foundation_gate", "status"))
    can_support = get_path(data, ("foundation_gate", "can_support_causal_commitment"))
    action_queue = get_path(data, ("evaluator_loop", "action_queue"))
    readiness_signals = [
        ("domain_helper_01", get_path(data, ("evaluator_loop", "readiness_signals", "domain_helper_01"))),
        ("data_technician_02", get_path(data, ("evaluator_loop", "readiness_signals", "data_technician_02"))),
        ("design_planner_03", get_path(data, ("evaluator_loop", "readiness_signals", "design_planner_03"))),
        ("dag_builder_04", get_path(data, ("evaluator_loop", "readiness_signals", "dag_builder_04"))),
    ]
    blocking_signals = [name for name, signal in readiness_signals if signal == "blocks_ready_gate"]
    blocking_actions = blocking_items(action_queue)
    blocking_requests = []
    for evaluator_id in (
        "domain_helper_01",
        "data_technician_02",
        "design_planner_03",
        "dag_builder_04",
    ):
        requests = get_path(data, ("evaluators", evaluator_id, "requests_for_main_skill"))
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
        if blocking_signals:
            errors.append(
                "foundation_gate.status is 'ready' but blocking readiness signals remain: "
                + ", ".join(blocking_signals)
            )
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
        if break_action in {"no_action", "unknown", MISSING}:
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
    stages_after_confirmation = {
        "plan confirmed",
        "first pass run",
        "diagnostics proposed",
        "diagnostics confirmed",
        "diagnostics complete",
        "final reporting proposed",
        "final report approved",
        "completed",
    }
    if execution_stage in stages_after_confirmation and user_confirmed_plan is not True:
        errors.append(
            "analysis.execution_stage indicates execution moved past planning but "
            "analysis.execution_confirmation.user_confirmed_plan is not true"
        )
    if route_status == "committed" and user_confirmed_plan is not True:
        errors.append("analysis.route_commitment_status is committed but the analysis plan is not user-confirmed")

    data_readiness = get_path(data, ("evaluators", "data_technician_02", "readiness"))
    data_scope = get_path(data, ("evaluators", "data_technician_02", "readiness_scope"))
    method_fit_suggestions = get_path(data, ("evaluators", "data_technician_02", "method_fit_suggestions"))
    active_method_subskills = get_path(data, ("analysis", "active_or_recommended_subskills"))
    if data_readiness == "ready" and not has_recorded_value(data_scope):
        errors.append("data_technician_02.readiness is ready but readiness_scope is not recorded")
    stages_after_method_fit = stages_after_confirmation
    if (
        (
            route_status in {"ready", "committed", "user-directed"}
            and has_recorded_value(active_method_subskills)
        )
        or execution_stage in stages_after_method_fit
    ) and not has_recorded_value(method_fit_suggestions):
        errors.append(
            "analysis has method execution or active/recommended method subskills but "
            "data_technician_02.method_fit_suggestions is not recorded"
        )
    stages_after_first_pass = {
        "first pass run",
        "diagnostics proposed",
        "diagnostics confirmed",
        "diagnostics complete",
        "final reporting proposed",
        "final report approved",
        "completed",
    }
    if execution_stage in stages_after_first_pass and not has_recorded_value(active_method_subskills):
        errors.append("analysis.execution_stage indicates modeling/diagnostics but no method subskill is active or recommended")

    design_status = get_path(data, ("evaluators", "design_planner_03", "design_status"))
    data_signal = get_path(data, ("evaluator_loop", "readiness_signals", "data_technician_02"))
    dag_supported_status = get_path(data, ("evaluators", "dag_builder_04", "supported_status"))
    dag_readiness = get_path(data, ("evaluators", "dag_builder_04", "readiness"))
    if design_status == "feasible":
        if data_signal == "blocks_ready_gate":
            errors.append("design_planner_03.design_status is feasible but data_technician_02 signal blocks the ready gate")
        if data_readiness == "blocks_ready_gate":
            errors.append("design_planner_03.design_status is feasible but data_technician_02 readiness blocks the ready gate")
        if dag_readiness == "blocks_ready_gate":
            errors.append("design_planner_03.design_status is feasible but dag_builder_04 readiness blocks the ready gate")
        if dag_supported_status in {"blocked", "needs design revision"}:
            errors.append(
                "design_planner_03.design_status is feasible but dag_builder_04.supported_status is "
                f"{dag_supported_status!r}"
            )

    dag_identification = get_path(data, ("evaluators", "dag_builder_04", "identification_status"))
    dag_scope = get_path(data, ("evaluators", "dag_builder_04", "supported_scope"))
    dag_summary = get_path(data, ("evaluators", "dag_builder_04", "summary"))
    dag_key_findings = get_path(data, ("evaluators", "dag_builder_04", "key_findings"))
    dag_design_implications = get_path(
        data, ("evaluators", "dag_builder_04", "implications", "design_planner_03")
    )
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
        if not has_recorded_value(dag_design_implications):
            errors.append(
                f"dag_builder_04.supported_status is {dag_supported_status!r} but design implications are empty"
            )

    errors.extend(validate_route_hypotheses(get_path(data, ("routes", "hypotheses")), "routes.hypotheses"))
    errors.extend(
        validate_route_hypotheses(
            get_path(data, ("evaluators", "design_planner_03", "route_hypotheses")),
            "evaluators.design_planner_03.route_hypotheses",
        )
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
