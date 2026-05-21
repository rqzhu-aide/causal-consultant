#!/usr/bin/env python3
"""Rule based recommender for longitudinal g-methods.

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
        "Verify the time grid, time zero, lag rules, and follow-up window.",
        "Build a long-format history table with id, time, treatment, covariates, censoring, and outcome.",
        "Map treatment, confounder, censoring, and outcome timing at each interval.",
        "Check positivity/support over treatment and covariate histories.",
        "Document the intervention strategy as a feasible longitudinal rule.",
    ]
    if spec.get("censoring_status") in {"informative", "severe", "unknown"}:
        diagnostics.append("Model or summarize censoring and assess inverse-probability censoring weights.")
    if spec.get("positivity_status") in {"limited", "poor", "unknown"}:
        diagnostics.append("Report support, sparse histories, weight instability, and any target restriction.")
    if spec.get("time_varying_confounding") in {"present", "suspected", "unknown"}:
        diagnostics.append("Assess whether time-varying confounders affected by prior treatment are measured before later treatment.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    target = spec.get("target", "unknown")
    strategy = spec.get("strategy_type", "unknown")
    return [
        f"Longitudinal target: {target}; strategy type: {strategy}.",
        "Report time grid, treatment/censoring histories, covariates, outcome, and strategies.",
        "State consistency, sequential exchangeability, positivity, and censoring assumptions.",
        "Include weight/model diagnostics, strategy support, sensitivity checks, and code/table/figure paths.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    timing = spec.get("treatment_timing", "unknown")
    data_format = spec.get("data_format", "unknown")
    strategy = spec.get("strategy_type", "unknown")
    target = spec.get("target", "unknown")
    treatment_type = spec.get("treatment_type", "unknown")
    tvc = spec.get("time_varying_confounding", "unknown")
    censoring = spec.get("censoring_status", "unknown")
    positivity = spec.get("positivity_status", "unknown")
    outcome = spec.get("outcome_type", "unknown")
    language = spec.get("language", "unknown")
    high_dim = spec.get("high_dimensional")
    n_time = spec.get("n_time_points")
    n_ids = spec.get("n_ids")

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if timing == "single_time" and (not isinstance(n_time, int) or n_time <= 1):
        return {
            "readiness": "candidate_only",
            "top_choice": "Route to single-time observational exposure unless longitudinal censoring or histories matter",
            "analysis_lane": "not primarily longitudinal",
            "software_options": [],
            "required_clarifications": ["Ask whether treatment/exposure, confounders, censoring, or adherence change over time."],
            "diagnostics": diagnostics,
            "caveats": ["A longitudinal g-method may be unnecessary if there is only one baseline exposure and no longitudinal process."],
            "activate_other_subskills": ["08-single-time-observational-exposure"],
            "report_support": _common_report(spec),
            "recommended_next_action": "activate_specialist",
        }

    if spec.get("time_grid_defined") is False:
        clarifications.append("Define the time grid, time zero, visit spacing, lags, grace periods, and follow-up end.")
    if data_format in {"summary_only", "unknown"}:
        clarifications.append("Ask data_analyst whether person-time histories can be reconstructed.")
    if strategy == "unknown":
        clarifications.append("Define the strategy: sustained/static, dynamic, stochastic, modified, cumulative, or threshold.")
    if target == "unknown":
        clarifications.append("Define whether the target is a strategy mean, strategy contrast, survival risk, or policy value.")
    if treatment_type == "unknown":
        clarifications.append("Define treatment/exposure type at each time point.")
    if tvc == "unknown":
        clarifications.append("Clarify whether time-varying confounders are present and affected by prior treatment.")

    if strategy in {"dynamic_regime", "learned_policy"} or target in {"dynamic_regime_value", "learned_policy"}:
        activate.append("25-dynamic-treatment-policies")
        caveats.append("Dynamic policy target needs `25-dynamic-treatment-policies`; this module supplies longitudinal identification support.")
    if strategy in {"modified_treatment_policy", "stochastic"}:
        if language in {"r", "either", "unknown"}:
            software.append(_software("lmtp", "R", "Use for longitudinal modified treatment policies or realistic shifts."))
        caveats.append("Modified/stochastic strategies must be feasible and supported over histories.")
    if strategy == "cumulative_dose" or treatment_type in {"continuous", "mixed"}:
        activate.append("23-dose-response-effects")
        caveats.append("Continuous, mixed, or cumulative exposure needs dose-response target support.")

    if outcome in {"survival_time", "competing_risk", "recurrent_event"}:
        activate.append("33-survival-competing-risks")
        caveats.append("Time-to-event, competing-risk, or recurrent outcome needs survival/event-process support.")

    if positivity == "poor":
        caveats.append("Poor support over histories can block strategy contrasts or require target restriction.")
    elif positivity == "limited":
        caveats.append("Limited support favors realistic strategies, truncation, restricted targets, or LMTP-style shifts.")
    elif positivity == "unknown":
        clarifications.append("Ask data_analyst for support over histories and weight diagnostics.")

    if censoring == "severe":
        caveats.append("Severe censoring can block strong longitudinal claims unless censoring assumptions are credible.")
    elif censoring in {"informative", "unknown"}:
        clarifications.append("Assess censoring process and inverse-probability censoring weights.")

    if tvc in {"present", "suspected"} or spec.get("confounders_affected_by_prior_treatment"):
        if strategy in {"static_sustained", "threshold_rule"} and positivity in {"good", "limited", "unknown"}:
            if language in {"r", "either", "unknown"}:
                software.append(_software("ipw + survey", "R", "Use for MSM/IPW when treatment and censoring weights are stable."))
            if language in {"python", "either", "unknown"}:
                software.append(_software("zepid or statsmodels", "Python", "Use for MSM/IPW prototypes and weighted pooled models."))
        if spec.get("needs_absolute_risk") or target in {"strategy_mean", "survival_risk"}:
            if language in {"r", "either", "unknown"}:
                software.append(_software("gfoRmula", "R", "Use parametric g-formula for simulated risks or means under specified strategies."))
            if language in {"python", "either", "unknown"}:
                software.append(_software("custom sequential regression", "Python", "Use transparent g-computation prototypes when R g-formula tooling is unavailable."))
        activate.append("30-matching-weighting-balance")

    if high_dim:
        activate.extend(["31-doubly-robust-estimation", "32-double-machine-learning"])
        if language in {"r", "either", "unknown"}:
            software.append(_software("ltmle or lmtp + SuperLearner/sl3", "R", "Use flexible nuisance models with targeted longitudinal estimation."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("scikit-learn + cross-fitting prototype", "Python", "Use as nuisance support, with longitudinal assumptions reviewed separately."))

    if target == "descriptive_trajectory":
        caveats.append("Descriptive trajectories do not require g-method causal language unless a strategy contrast is defined.")

    if language in {"r", "either", "unknown"} and strategy in {"static_sustained", "dynamic_regime", "threshold_rule"}:
        software.append(_software("ltmle", "R", "Use longitudinal TMLE for static/dynamic treatment nodes when node ordering is well defined."))
    if spec.get("needs_interpretability"):
        software.insert(0, _software("MSM/IPW with explicit strategy table", "R or Python", "Use when transparent marginal contrasts and diagnostics are more important than flexible simulation."))

    if not software:
        software.append(_software("long-format design table plus exploratory pooled model", "R or Python", "Use only after the time grid, strategy, and history support are clarified."))

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if positivity == "poor" or censoring == "severe":
        readiness = "diagnostics_needed"
    if data_format == "summary_only" and spec.get("time_grid_defined") is False:
        readiness = "blocked"

    top_choice = "Longitudinal g-methods design with time-ordering, support, and censoring diagnostics"
    analysis_lane = "longitudinal strategy comparison"
    if strategy == "static_sustained":
        top_choice = "MSM/IPW or g-formula for sustained strategy contrast"
        analysis_lane = "sustained strategy comparison"
    elif strategy == "modified_treatment_policy":
        top_choice = "LMTP or stochastic intervention with realistic support checks"
        analysis_lane = "modified longitudinal treatment policy"
    elif target in {"dynamic_regime_value", "learned_policy"}:
        top_choice = "Coordinate 09 identification with 25 dynamic-policy target definition"
        analysis_lane = "dynamic regime support"
    elif spec.get("needs_absolute_risk"):
        top_choice = "Parametric g-formula or sequential regression for strategy-specific risks"
        analysis_lane = "strategy-specific risk simulation"

    next_action = "confirm_analysis_plan" if readiness == "plan_ready" else "clarify_specification"
    if readiness == "diagnostics_needed":
        next_action = "run_diagnostics"
    if readiness == "blocked":
        next_action = "ask_user"

    return {
        "readiness": readiness,
        "top_choice": top_choice,
        "analysis_lane": analysis_lane,
        "software_options": software[:8],
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
