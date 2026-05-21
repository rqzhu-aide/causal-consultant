#!/usr/bin/env python3
"""Rule based recommender for dynamic treatment policy targets.

Usage:
  python recommend.py input.json
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List


def _software(package: str, language: str, when: str) -> Dict[str, str]:
    return {"package": package, "language": language, "when_to_use": when}


def _base_diagnostics(spec: Dict[str, Any]) -> List[str]:
    diagnostics = [
        "Confirm decision times, available histories, action sets, and value target.",
        "Check action support and positivity over histories.",
        "Assess censoring, missingness, and regime adherence.",
        "Compare candidate policy value with simpler interpretable regimes.",
        "Evaluate policy stability across folds, seeds, state variables, and learner classes.",
    ]
    if spec.get("has_holdout_or_crossfit_plan") is False:
        diagnostics.append("Create a held-out, cross-fitting, or honest evaluation plan before reporting learned policy value.")
    if spec.get("high_stakes"):
        diagnostics.append("Add safety, fairness, and prospective validation requirements.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    return [
        f"Dynamic policy target: {spec.get('target', 'unknown')}.",
        "Report decision schedule, histories, action set, value target, and longitudinal design route.",
        "State support, censoring, time-varying confounding, validation status, and claim boundary.",
        "Include code/table/figure paths for regime definitions, value estimates, and diagnostics.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    target = spec.get("target", "unknown")
    design = spec.get("design_route", "unknown")
    data_source = spec.get("data_source", "unknown")
    decision_points = spec.get("decision_points")
    history = spec.get("history_status", "unknown")
    support = spec.get("action_support_status", "unknown")
    tvc = spec.get("time_varying_confounding", "unknown")
    censoring = spec.get("censoring_status", "unknown")
    value = spec.get("value_target", "unknown")
    interpretability = spec.get("need_interpretability", "unknown")
    language = spec.get("language", "unknown")
    known_probs = spec.get("has_known_randomization_or_logging_probabilities")

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = ["09-longitudinal-gmethods"]
    software: List[Dict[str, str]] = []

    if isinstance(decision_points, int) and decision_points <= 1:
        return {
            "readiness": "candidate_only",
            "top_choice": "Route one-time decision rule to point treatment rules",
            "analysis_lane": "not dynamic",
            "software_options": [],
            "required_clarifications": ["Clarify whether there is more than one decision point."],
            "diagnostics": diagnostics,
            "caveats": ["A single baseline decision is not a dynamic treatment policy."],
            "activate_other_subskills": ["21-point-treatment-rules"],
            "report_support": _common_report(spec),
            "recommended_next_action": "activate_specialist",
        }

    if history == "not_reconstructible":
        return {
            "readiness": "blocked",
            "top_choice": "Do not evaluate dynamic regimes until histories are reconstructible",
            "analysis_lane": "history blocked",
            "software_options": [],
            "required_clarifications": ["Clarify whether decision histories can be reconstructed from data."],
            "diagnostics": diagnostics,
            "caveats": ["Dynamic policy value requires histories available before each action."],
            "activate_other_subskills": ["09-longitudinal-gmethods"],
            "report_support": _common_report(spec),
            "recommended_next_action": "ask_user",
        }

    if target == "unknown":
        clarifications.append("Clarify whether the target is regime comparison, regime value, learned regime, SMART analysis, LMTP, or exploratory decision support.")
    if history in {"unknown", "partially_reconstructible"}:
        clarifications.append("Clarify available histories before each decision point.")
    if support == "unknown":
        clarifications.append("Ask data_analyst for action support over histories.")
    if value == "unknown":
        clarifications.append("Define the value target: final outcome, survival, utility, cost, harm, or composite.")
    if design == "unknown":
        clarifications.append("Clarify longitudinal design route and whether treatment assignment/logging probabilities are known.")

    if support == "poor":
        caveats.append("Poor action support over histories blocks reliable regime value for unsupported actions.")
    elif support == "limited":
        caveats.append("Limited support favors simpler regimes and strong positivity diagnostics.")
    if tvc in {"present", "possible", "unknown"}:
        caveats.append("Time-varying confounding requires longitudinal g-method identification review.")
    if censoring in {"moderate", "severe", "unknown"}:
        caveats.append("Censoring/missingness must be modeled or bounded before strong policy-value claims.")

    if value == "survival_time":
        activate.append("33-survival-competing-risks")

    if design in {"sequential_randomized", "smart_trial"} or data_source == "smart_trial":
        if language in {"r", "either", "unknown"}:
            software.append(_software("DynTxRegime", "R", "Use for Q-learning, weighted learning, and value-search dynamic regimes."))
            software.append(_software("DTRreg", "R", "Use for dynamic treatment regime regression and SMART-style analyses."))
            software.append(_software("polle", "R", "Use for policy learning/evaluation in finite-stage settings."))
        caveats.append("Respect sequential randomization probabilities and embedded regimes.")
    elif target in {"regime_comparison", "dynamic_regime_value"}:
        if language in {"r", "either", "unknown"}:
            software.append(_software("gfoRmula", "R", "Use for parametric g-formula comparison of sustained or dynamic strategies."))
            software.append(_software("ltmle", "R", "Use for longitudinal TMLE of static or dynamic interventions."))
            software.append(_software("lmtp", "R", "Use for longitudinal modified treatment policies and realistic shifts."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("custom g-computation/IPW", "Python", "Use for transparent prototypes when R tooling is unavailable."))
    elif target == "longitudinal_mtp":
        if language in {"r", "either", "unknown"}:
            software.append(_software("lmtp", "R", "Use for longitudinal modified treatment policies."))
            software.append(_software("ltmle", "R", "Use when the target can be expressed as a dynamic intervention."))
        software.append(_software("custom sequential regression", "R or Python", "Use when the MTP rule is simple but package defaults do not fit."))
    elif target == "learned_dynamic_regime":
        if language in {"r", "either", "unknown"}:
            software.append(_software("DynTxRegime", "R", "Use for Q-learning, A-learning-like, weighted learning, and value-search workflows."))
            software.append(_software("DTRreg/qLearn", "R", "Use for simpler Q-learning style dynamic-regime estimation."))
            software.append(_software("polle", "R", "Use for finite-stage policy learning/evaluation with DR options."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("custom fitted-Q / off-policy evaluation", "Python", "Use only as exploratory implementation support with causal checks."))
    elif target == "exploratory_decision_support":
        software.append(_software("descriptive histories + simple regime prototypes", "R or Python", "Use for design learning before causal policy claims."))

    if known_probs is False and design in {"logged_policy", "sequential_randomized", "smart_trial"}:
        caveats.append("Known randomization/logging probabilities are needed for many IPW/off-policy evaluation routes.")

    if interpretability == "high":
        caveats.append("Prefer simpler interpretable regimes if they perform similarly to complex learned policies.")

    if not software:
        software.append(_software("longitudinal design precheck", "R or Python", "Choose policy software after histories, support, and value target are clarified."))

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if support == "poor" or censoring == "severe":
        readiness = "blocked"

    if target == "learned_dynamic_regime":
        top_choice = "Learned dynamic regime with longitudinal identification and validation"
        lane = "policy learning"
    elif target == "regime_comparison":
        top_choice = "Compare prespecified dynamic regimes"
        lane = "regime comparison"
    elif target == "smart_analysis":
        top_choice = "SMART-supported adaptive regime analysis"
        lane = "SMART analysis"
    elif target == "longitudinal_mtp":
        top_choice = "Longitudinal modified treatment policy"
        lane = "LMTP"
    else:
        top_choice = "Clarify dynamic decision structure and value target"
        lane = "dynamic target clarification"

    next_action = "confirm_analysis_plan" if readiness == "plan_ready" else "clarify_specification"
    if readiness == "blocked":
        next_action = "ask_user"

    return {
        "readiness": readiness,
        "top_choice": top_choice,
        "analysis_lane": lane,
        "software_options": software[:6],
        "required_clarifications": clarifications,
        "diagnostics": diagnostics,
        "caveats": caveats,
        "activate_other_subskills": sorted(set(activate)),
        "report_support": _common_report(spec),
        "recommended_next_action": next_action,
    }


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python recommend.py input.json")
    spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    print(json.dumps(recommend(spec), indent=2))


if __name__ == "__main__":
    main()
