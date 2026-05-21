#!/usr/bin/env python3
"""Rule based recommender for negative controls and proximal causal inference.

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
        "Classify each variable as primary exposure, primary outcome, negative control outcome, negative control exposure, treatment proxy, or outcome proxy.",
        "Verify timing of treatment, outcome, controls/proxies, and covariates.",
        "Ask domain_expert to justify the null relation for negative controls and shared-bias relevance.",
        "Run the same adjustment/design used for the primary analysis on the negative-control target where possible.",
        "Report whether evidence is diagnostic, calibration, bias adjustment, or proximal identification support.",
    ]
    if spec.get("controls_pre_specified") is False:
        diagnostics.append("Flag possible cherry-picking and report how candidate controls were selected.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    return [
        f"Negative-control/proximal lane: {spec.get('analysis_lane', 'unknown')}.",
        f"Support role: {spec.get('goal', 'unknown')}.",
        "Report candidate controls/proxies, timing, domain rationale, model, assumptions, results, and sensitivity.",
        "State clearly whether the evidence is falsification/calibration support or proximal identification support.",
    ]


def _count(spec: Dict[str, Any], key: str) -> int:
    value = spec.get(key)
    return value if isinstance(value, int) else 0


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    lane = spec.get("lane", "unknown")
    primary_design = spec.get("primary_design", "unknown")
    goal = spec.get("goal", "unknown")
    timing = spec.get("timing_status", "unknown")
    null_plausibility = spec.get("null_relation_plausibility", "unknown")
    shared_bias = spec.get("shared_bias_plausibility", "unknown")
    measurement = spec.get("measurement_quality", "unknown")
    support = spec.get("support_status", "unknown")
    bridge = spec.get("bridge_model_status", "unknown")
    hidden_risk = spec.get("hidden_confounding_risk", "unknown")
    language = spec.get("language", "unknown")

    nco = _count(spec, "candidate_nco_count")
    nce = _count(spec, "candidate_nce_count")
    z_proxy = _count(spec, "treatment_proxy_count")
    w_proxy = _count(spec, "outcome_proxy_count")
    many_controls = bool(spec.get("many_controls_available")) or (nco + nce >= 10)

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if lane == "unknown":
        clarifications.append("Clarify whether this is a negative control diagnostic, empirical calibration, bias adjustment, or proximal identification task.")
    if goal == "unknown":
        clarifications.append("Clarify whether the goal is diagnostic reassurance, calibrated uncertainty, bias correction, or identification under proximal assumptions.")
    if timing in {"questionable", "unknown"}:
        diagnostics.append("Create a timing table for exposure, outcome, controls/proxies, and covariates.")
    if timing == "invalid":
        caveats.append("Timing is invalid for the proposed control/proxy role.")
    if null_plausibility in {"weak", "unknown"} and lane in {"negative_control_outcome", "negative_control_exposure", "paired_negative_controls", "falsification_placebo"}:
        diagnostics.append("Strengthen domain rationale for why the control relation should be null.")
    if null_plausibility == "invalid":
        caveats.append("The proposed negative control is not a valid null relation.")
    if shared_bias in {"weak", "unknown"}:
        diagnostics.append("Assess whether the control/proxy shares the same hidden bias process as the primary question.")
    if measurement in {"limited", "unknown"}:
        diagnostics.append("Check missingness, prevalence, measurement quality, and sample support for controls/proxies.")
    if measurement == "poor":
        caveats.append("Poor measurement quality may make control/proxy results misleading.")
    if support in {"thin", "unknown"}:
        diagnostics.append("Check variation and positivity for treatment, outcome, controls/proxies, and covariates.")
    if support == "none":
        caveats.append("No support for the proposed control/proxy analysis.")
    if hidden_risk == "high" and goal == "bias_diagnostic":
        caveats.append("High hidden-confounding risk means negative controls can diagnose concern but cannot by themselves identify the primary effect.")

    if primary_design == "single_time_observational":
        activate.append("08-single-time-observational-exposure")
    elif primary_design == "longitudinal":
        activate.append("09-longitudinal-gmethods")
    elif primary_design == "did_event_study":
        activate.append("10-did-event-study")
    elif primary_design == "rd":
        activate.append("11-regression-discontinuity")
    elif primary_design == "iv":
        activate.append("12-instrumental-variables")
    elif primary_design == "synthetic_time_series":
        activate.append("13-synthetic-control-time-series")
    elif primary_design == "survival":
        activate.append("33-survival-competing-risks")
    elif primary_design == "mediation":
        activate.append("22-mediation")

    if lane in {"negative_control_outcome", "negative_control_exposure", "paired_negative_controls", "falsification_placebo"} or goal == "bias_diagnostic":
        analysis_lane = "negative control or falsification diagnostic"
        if nco + nce == 0:
            clarifications.append("List candidate negative control outcomes or exposures.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("glm/fixest/survival primary-model analog", "R", "Run the same primary design/adjustment on negative control outcomes or exposures."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("statsmodels/lifelines primary-model analog", "Python", "Run comparable falsification regressions or survival models."))
        if nco > 0 and nce > 0:
            diagnostics.append("Compare exposure-negative-control-outcome and negative-control-exposure-primary-outcome patterns.")
    elif lane == "empirical_calibration" or goal == "empirical_calibration" or many_controls:
        analysis_lane = "empirical calibration with negative controls"
        if not many_controls:
            clarifications.append("Empirical calibration usually needs many comparable negative controls; provide the control set or keep the result diagnostic.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("EmpiricalCalibration", "R", "Fit empirical null or systematic-error distributions and calibrate p-values or confidence intervals."))
            software.append(_software("CohortMethod", "R", "Generate standardized observational estimates across many negative controls in OHDSI-style workflows."))
        diagnostics.append("Pre-specify or audit the negative-control set and verify estimates are comparable across controls.")
    elif lane == "control_outcome_adjustment" or goal == "bias_adjustment":
        analysis_lane = "negative-control bias adjustment"
        if nco == 0:
            clarifications.append("Bias adjustment using a control outcome needs at least one credible negative control outcome.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("NCOA or custom control-outcome calibration", "R", "Use only when control outcome assumptions and binary/cohort setting match."))
            software.append(_software("glm/fixest", "R", "Fit transparent shared-bias adjustment or sensitivity models."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("statsmodels", "Python", "Fit transparent shared-bias adjustment or sensitivity models."))
        caveats.append("Bias adjustment from negative controls is more assumption-heavy than falsification.")
    elif lane in {"proximal_identification", "proximal_survival", "proximal_longitudinal"} or goal == "proximal_identification":
        analysis_lane = "proximal causal inference"
        if z_proxy == 0 or w_proxy == 0:
            clarifications.append("Proximal identification needs credible treatment and outcome confounding proxies.")
        if bridge in {"not_started", "unknown"}:
            diagnostics.append("Plan bridge-function estimation and stability checks.")
        if bridge in {"unstable", "failed"}:
            caveats.append("Bridge model is unstable or failed; do not treat proximal estimate as reliable.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("PCL", "R", "Use proximal causal learning bridge-function tools when assumptions and data types match."))
            software.append(_software("ivreg/fixest", "R", "Use transparent linear bridge sketches and sensitivity benchmarks."))
            software.append(_software("DoubleML/grf/SuperLearner", "R", "Use flexible learners for bridge or nuisance models after proxy roles are fixed."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("linearmodels IV2SLS", "Python", "Use linear IV-style bridge sketches for transparent proximal diagnostics."))
            software.append(_software("statsmodels/sklearn/DoubleML", "Python", "Use general learners for bridge/nuisance modeling with careful sensitivity."))
        if lane == "proximal_survival" or primary_design == "survival":
            activate.append("33-survival-competing-risks")
            if language in {"r", "either", "unknown"}:
                software.append(_software("adjustedCurves::surv_prox_aiptw or pci2s", "R", "Use proximal survival workflows when censoring and proxy assumptions match."))
        if lane == "proximal_longitudinal" or primary_design == "longitudinal":
            activate.append("09-longitudinal-gmethods")
            caveats.append("Longitudinal proximal analysis needs time-indexed proxies and bridge assumptions; point-treatment templates are insufficient.")
    else:
        analysis_lane = "negative-control/proximal structure unclear"
        software.append(_software("role-classification checklist", "R/Python/Stata", "Clarify controls, proxies, timing, null logic, and shared-bias structure before software choice."))

    if spec.get("survival_or_longitudinal"):
        activate.extend(["09-longitudinal-gmethods", "33-survival-competing-risks"])

    if not software:
        software.append(_software("primary-model analog", "R/Python/Stata", "Run comparable falsification or proxy diagnostics using the primary analysis framework."))

    blocked = (
        timing == "invalid"
        or null_plausibility == "invalid"
        or support == "none"
        or measurement == "poor"
        or bridge == "failed"
    )
    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if caveats or support in {"thin", "unknown"} or measurement in {"limited", "unknown"} or bridge in {"not_started", "unstable", "unknown"}:
        readiness = "diagnostics_needed"
    if blocked:
        readiness = "blocked"

    if readiness == "plan_ready":
        next_action = "confirm_analysis_plan"
    elif readiness == "diagnostics_needed":
        next_action = "run_diagnostics"
    elif readiness == "blocked":
        next_action = "ask_user_or_redesign"
    else:
        next_action = "clarify_specification"

    if blocked:
        top_choice = "Do not use the proposed controls/proxies for causal support until role, timing, null logic, and support are repaired"
    elif analysis_lane.startswith("negative control"):
        top_choice = "Use the negative control as falsification evidence, not proof that unmeasured confounding is absent"
    elif analysis_lane.startswith("empirical"):
        top_choice = "Use empirical calibration only with many comparable controls and pre-specified/audited selection"
    elif analysis_lane.startswith("proximal"):
        top_choice = "Use proximal identification only with credible paired proxies and stable bridge-function estimates"
    elif analysis_lane.startswith("negative-control bias"):
        top_choice = "Treat negative-control bias adjustment as assumption-heavy and report sensitivity"
    else:
        top_choice = "First classify the variables and whether the goal is diagnostic, calibration, adjustment, or identification"

    report_spec = {
        **spec,
        "analysis_lane": analysis_lane,
        "goal": goal,
    }
    return {
        "readiness": readiness,
        "analysis_lane": analysis_lane,
        "top_choice": top_choice,
        "software_options": software[:10],
        "required_clarifications": clarifications,
        "diagnostics": diagnostics,
        "caveats": caveats,
        "activate_other_subskills": sorted(set(activate)),
        "report_support": _common_report(report_spec),
        "recommended_next_action": next_action,
    }


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python recommend.py input.json")
    spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    print(json.dumps(recommend(spec), indent=2))


if __name__ == "__main__":
    main()
