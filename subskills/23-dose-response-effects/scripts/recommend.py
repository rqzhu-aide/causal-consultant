#!/usr/bin/env python3
"""Rule based recommender for dose-response targets.

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
        "Plot dose distribution and flag sparse or unsupported ranges.",
        "Check positivity/support for every reported dose contrast, curve segment, or shift.",
        "Inspect covariate balance or generalized propensity diagnostics across dose ranges.",
        "Assess functional-form sensitivity with bins, splines, transformations, and flexible learners.",
        "Check dose measurement error, heaping, outliers, and influential dose ranges.",
    ]
    if spec.get("need_threshold"):
        diagnostics.append("Run threshold and binning sensitivity before reporting a cut point.")
    if spec.get("measurement_error") in {"moderate", "severe"}:
        diagnostics.append("Add measurement-error sensitivity or weaken curve language.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    return [
        f"Dose-response target: {spec.get('target', 'unknown')}.",
        "Report dose scale, feasible range, intervention meaning, timing, and support.",
        "State unsupported ranges, extrapolation limits, and whether results are exploratory or causal.",
        "Include code/table/figure paths for curves, contrasts, shifts, and diagnostics.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    target = spec.get("target", "unknown")
    dose_type = spec.get("dose_type", "unknown")
    design = spec.get("design_route", "unknown")
    outcome = spec.get("outcome_type", "unknown")
    timing = spec.get("dose_timing", "unknown")
    support = spec.get("support_status", "unknown")
    feasibility = spec.get("intervention_feasibility", "unknown")
    language = spec.get("language", "unknown")
    long_dose = spec.get("has_longitudinal_dose")
    n_levels = spec.get("n_dose_levels")

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if dose_type == "binary":
        return {
            "readiness": "candidate_only",
            "top_choice": "Route binary exposure to the appropriate design route",
            "analysis_lane": "not a dose-response target",
            "software_options": [],
            "required_clarifications": ["Clarify whether the user really wants treated-versus-untreated rather than dose-response."],
            "diagnostics": diagnostics,
            "caveats": ["Binary treatment is usually not a dose-response problem."],
            "activate_other_subskills": ["08-single-time-observational-exposure"],
            "report_support": _common_report(spec),
            "recommended_next_action": "clarify_specification",
        }

    if timing == "post_outcome":
        return {
            "readiness": "blocked",
            "top_choice": "Do not estimate dose-response with post-outcome dose timing",
            "analysis_lane": "timing blocked",
            "software_options": [],
            "required_clarifications": ["Clarify dose timing relative to outcome start and follow-up."],
            "diagnostics": diagnostics,
            "caveats": ["Dose measured after outcome cannot support ordinary causal dose-response."],
            "activate_other_subskills": [],
            "report_support": _common_report(spec),
            "recommended_next_action": "ask_user",
        }

    if target == "unknown":
        clarifications.append("Clarify whether the user wants a fixed contrast, curve, threshold, stochastic shift, MTP, or exploratory exposure-response.")
    if timing == "unknown":
        clarifications.append("Clarify dose timing relative to treatment start, time zero, and outcome.")
    if feasibility in {"unclear", "unknown"}:
        clarifications.append("Clarify whether fixed dose levels or dose shifts are feasible interventions.")
    if support == "unknown":
        clarifications.append("Ask data_analyst for dose distribution and support diagnostics.")
    if design == "unknown":
        clarifications.append("Clarify the design route and confounding plan.")

    if support == "poor":
        caveats.append("Poor support blocks reliable curve or fixed-dose claims outside observed dose regions.")
    elif support == "limited":
        caveats.append("Limited support favors realistic shifts, MTPs, or supported contrasts over a full curve.")
    if feasibility == "not_intervenable":
        caveats.append("If dose is not intervenable, report descriptive exposure-response or redefine the target.")

    if design == "observational_unconfounded":
        activate.extend(["08-single-time-observational-exposure", "30-matching-weighting-balance"])
        activate.extend(["31-doubly-robust-estimation", "32-double-machine-learning"])
    elif design == "longitudinal" or long_dose or dose_type == "time_varying":
        activate.append("09-longitudinal-gmethods")
        caveats.append("Time-varying dose requires longitudinal identification and history reconstruction.")
    elif design == "interference":
        activate.append("14-interference-spillovers")
        caveats.append("Dose may be an exposure mapping under interference; define the mapping before estimating.")

    if outcome == "survival_time":
        activate.append("33-survival-competing-risks")
        caveats.append("Time-to-event dose-response needs censoring-aware estimands.")

    if target in {"modified_treatment_policy", "stochastic_shift"} or feasibility == "feasible_shift":
        if language in {"r", "either", "unknown"}:
            software.append(_software("lmtp", "R", "Use for longitudinal or point modified treatment policies and feasible shifts."))
            software.append(_software("tmle3shift", "R", "Use for targeted-learning stochastic shift interventions."))
        software.append(_software("custom g-computation", "R or Python", "Use when the MTP rule is simple but package defaults do not fit."))
    elif target in {"dose_response_curve", "fixed_contrast", "threshold"}:
        if language in {"r", "either", "unknown"}:
            software.append(_software("CausalGPS", "R", "Use for generalized propensity score weighting/matching for continuous doses."))
            software.append(_software("WeightIt + cobalt", "R", "Use for continuous treatment weighting and balance diagnostics."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("EconML / DoubleML", "Python", "Use for continuous-treatment DML or local marginal effect support."))
        software.append(_software("splines/GAM/custom standardization", "R or Python", "Use for transparent supported contrasts or descriptive curves."))
    elif target == "exploratory_exposure_response":
        software.append(_software("splines/GAM/descriptive plots", "R or Python", "Use for design-learning before causal target commitment."))

    if isinstance(n_levels, int) and 2 < n_levels <= 8:
        software.insert(0, _software("multi-level treatment contrasts", "R or Python", "Use when dose has a small number of meaningful categories."))

    if not software:
        software.append(_software("support diagnostics first", "R or Python", "Choose estimator after dose support and intervention meaning are clarified."))

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if support == "poor" and target in {"dose_response_curve", "fixed_contrast"}:
        readiness = "blocked"
    if feasibility == "not_intervenable" and target != "exploratory_exposure_response":
        readiness = "candidate_only"

    if target == "modified_treatment_policy":
        top_choice = "Modified treatment policy or feasible shift target"
        lane = "modified treatment policy"
    elif target == "stochastic_shift":
        top_choice = "Stochastic shift intervention with targeted or g-computation support"
        lane = "stochastic shift"
    elif target == "dose_response_curve":
        top_choice = "Supported dose-response curve with extrapolation diagnostics"
        lane = "dose-response curve"
    elif target == "threshold":
        top_choice = "Threshold analysis with domain rationale and binning sensitivity"
        lane = "threshold/saturation"
    else:
        top_choice = "Supported dose contrast or exploratory exposure-response precheck"
        lane = "dose contrast"

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
