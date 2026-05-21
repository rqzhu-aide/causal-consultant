#!/usr/bin/env python3
"""Rule based recommender for DiD and event-study support.

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
        "Verify unit, time, treatment timing, cohort/adoption time, and event-time coding.",
        "Prepare raw outcome trends by treatment/cohort/comparison group before fitting models.",
        "Report cohort sizes, comparison-group availability, pre-period support, and post-period support.",
        "Check pre-period evidence without treating non-significant pre-trend tests as proof.",
        "Use clustering/inference that matches the exposure or policy variation level.",
    ]
    if spec.get("needs_dynamic_effects"):
        diagnostics.append("Define reference period, event-time bins, and anticipation window before event-study estimation.")
    if spec.get("few_clusters"):
        diagnostics.append("Use few-cluster robust or randomization/placebo-style inference sensitivity.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    return [
        f"DiD estimand: {spec.get('estimand', 'unknown')}.",
        "Report treatment timing, comparison group, cohort/event-time definitions, and aggregation rule.",
        "Include raw trends, pre-period checks, estimator details, clustering, sensitivity checks, and limitations.",
        "State that parallel trends is an identifying assumption, not proven by pre-trend tests.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    data = spec.get("data_structure", "unknown")
    path = spec.get("treatment_path", "unknown")
    estimand = spec.get("estimand", "unknown")
    comparison = spec.get("comparison_group", "unknown")
    has_never = spec.get("has_never_treated")
    pre_periods = spec.get("pre_periods")
    post_periods = spec.get("post_periods")
    anticipation = spec.get("anticipation_risk", "unknown")
    spillover = spec.get("spillover_risk", "unknown")
    composition = spec.get("composition_risk", "unknown")
    language = spec.get("language", "unknown")
    n_units = spec.get("n_units")
    n_treated = spec.get("n_treated_units")

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if data == "unknown":
        clarifications.append("Clarify whether data are panel, repeated cross-section, aggregate time series, or simple 2x2.")
    if path in {"unclear", "unknown"}:
        clarifications.append("Clarify treatment path: single cohort, staggered absorbing adoption, reversible/repeated treatment, continuous intensity, or multiple treatments.")
    if comparison in {"unclear", "unknown"}:
        clarifications.append("Clarify comparison group: never-treated, not-yet-treated, selected controls, synthetic controls, or none.")
    if estimand == "unknown":
        clarifications.append("Choose the DiD target: ATT, group-time ATT, event-time effect, aggregate ATT, cohort-specific effect, or synthetic DiD effect.")
    if isinstance(pre_periods, int) and pre_periods < 2:
        caveats.append("Very few pre-periods; pre-trend learning and placebo diagnostics are weak.")
    elif pre_periods is None:
        clarifications.append("Record number of pre-treatment periods.")
    if isinstance(post_periods, int) and post_periods < 1:
        caveats.append("No post-treatment period is available for DiD estimation.")
    elif post_periods is None:
        clarifications.append("Record number of post-treatment periods.")

    if anticipation == "high":
        caveats.append("High anticipation risk; define an anticipation window or avoid interpreting early event-time estimates causally.")
    elif anticipation in {"moderate", "unknown"}:
        diagnostics.append("Check anticipation with domain timing and lead-window sensitivity.")
    if spillover == "high":
        activate.append("14-interference-spillovers")
        caveats.append("High spillover risk can invalidate untreated comparisons.")
    elif spillover in {"moderate", "unknown"}:
        diagnostics.append("Check contamination/spillovers across units, regions, sites, or markets.")
    if composition == "high":
        caveats.append("Large composition changes threaten repeated cross-section or unbalanced panel DiD.")
    elif composition in {"moderate", "unknown"}:
        diagnostics.append("Compare sample composition and measurement stability by group/time.")

    if spec.get("continuous_or_intensity_treatment") or path == "continuous_intensity" or estimand == "dose_or_intensity":
        activate.append("23-dose-response-effects")
        caveats.append("Continuous or intensity treatments need continuous-treatment DiD or dose-response support.")
    if spec.get("multiple_treatments") or path == "multiple_treatments":
        caveats.append("Multiple treatments can contaminate TWFE and event-study coefficients; define separate treatments or use multi-treatment methods.")
    if spec.get("treatment_reversal") or path in {"reversible", "repeated"}:
        caveats.append("Treatment reversals or repeated exposures do not fit standard absorbing-adoption DiD without adaptation.")

    if data == "aggregate_time_series" or comparison == "synthetic_controls" or (isinstance(n_treated, int) and n_treated <= 5):
        design_lane = "synthetic or aggregate DiD support"
        activate.append("13-synthetic-control-time-series")
        if language in {"r", "either", "unknown"}:
            software.append(_software("synthdid", "R", "Use when donor-pool weights and pre-period fit are central."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("diff-diff or custom synthetic DiD", "Python", "Use for Python synthetic/event-study workflows after API review."))
        caveats.append("Aggregate or few-treated-unit DiD needs donor fit, placebo, and time-series diagnostics.")
    elif data == "two_by_two" or path == "single_cohort":
        design_lane = "2x2 or single-cohort DiD support"
        if spec.get("needs_covariates"):
            activate.append("31-doubly-robust-estimation")
            if language in {"r", "either", "unknown"}:
                software.append(_software("DRDID", "R", "Use for doubly robust 2x2 panel or repeated cross-section DiD."))
            if language in {"python", "either", "unknown"}:
                software.append(_software("DoubleML DID", "Python/R", "Use for conditional parallel trends with flexible nuisance models."))
        if language in {"r", "either", "unknown"}:
            software.append(_software("fixest", "R", "Use for transparent 2x2 DiD regression and clustered SE benchmarks."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("statsmodels", "Python", "Use for simple DiD/TWFE benchmarks with robust or clustered covariance."))
    elif path == "staggered_absorbing" or estimand in {"group_time_att", "event_time_effect", "dynamic_effect", "aggregate_att", "cohort_specific"}:
        design_lane = "staggered-adoption modern DiD support"
        if language in {"r", "either", "unknown"}:
            software.append(_software("did", "R", "Use Callaway-Sant'Anna group-time ATT and aggregation."))
            software.append(_software("fixest::sunab", "R", "Use Sun-Abraham interaction-weighted event-study support."))
            software.append(_software("didimputation", "R", "Use Borusyak-Jaravel-Spiess imputation-style event-study estimation."))
            software.append(_software("did2s", "R", "Use Gardner two-stage DiD as another modern staggered estimator."))
            software.append(_software("bacondecomp", "R", "Use as a TWFE decomposition diagnostic, not the primary estimator."))
        if language in {"stata", "either", "unknown"}:
            software.append(_software("csdid / eventstudyinteract / did_imputation", "Stata", "Use modern Stata DiD implementations matched to the estimator."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("DoubleML DID or moderndid", "Python", "Use for Python modern DiD after validating the estimator target and API."))
        if comparison == "earlier_later_cohorts":
            caveats.append("Earlier/later cohort comparisons can be invalid when treatment effects are heterogeneous; prefer never/not-yet-treated logic if supported.")
        if has_never is False and comparison == "never_treated":
            clarifications.append("Never-treated comparison requested but no never-treated units are available; consider not-yet-treated or another design.")
    elif data == "repeated_cross_section":
        design_lane = "repeated-cross-section DiD support"
        if language in {"r", "either", "unknown"}:
            software.append(_software("did", "R", "Use repeated-cross-section mode for group-time ATT when conditions fit."))
            software.append(_software("DRDID", "R", "Use for 2x2 repeated-cross-section DR-DiD."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("DoubleML DID", "Python/R", "Use for conditional DiD in supported repeated cross-section settings."))
        diagnostics.append("Check population/composition stationarity and sampling weights across repeated cross sections.")
    else:
        design_lane = "DiD design clarification"
        if language in {"r", "either", "unknown"}:
            software.append(_software("did + fixest", "R", "Use after treatment path and estimand are clarified."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("statsmodels or DoubleML DID", "Python", "Use after treatment path and estimand are clarified."))

    if spec.get("needs_dynamic_effects"):
        diagnostics.append("Report cohort/event-time estimates and aggregation, not only one pooled post coefficient.")
    if spec.get("needs_covariates"):
        diagnostics.append("Use only pre-treatment or correctly time-ordered covariates; avoid post-treatment controls.")
        activate.append("31-doubly-robust-estimation")
    if spec.get("few_clusters"):
        caveats.append("Few clusters can make conventional cluster-robust inference unreliable.")
    if isinstance(n_units, int) and n_units < 30:
        caveats.append("Few units; lean toward aggregate/synthetic/placebo inference and cautious claims.")

    if not software:
        software.append(_software("DiD design checklist", "R/Python/Stata", "Clarify timing, comparison, estimand, and diagnostics before choosing software."))

    if estimand in {"event_time_effect", "dynamic_effect"}:
        if language in {"r", "either", "unknown"}:
            software.append(_software("HonestDiD", "R/Stata", "Use for sensitivity to violations of parallel trends after event-study estimates."))
        diagnostics.append("Consider HonestDiD-style sensitivity once event-study estimates and covariance are available.")

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if caveats and any(term in " ".join(caveats).lower() for term in ["high", "few pre-periods", "no post-treatment", "spillover", "reversal"]):
        readiness = "diagnostics_needed"
    if comparison == "none" or (isinstance(post_periods, int) and post_periods < 1):
        readiness = "blocked"

    if readiness == "plan_ready":
        next_action = "confirm_analysis_plan"
    elif readiness == "diagnostics_needed":
        next_action = "run_diagnostics"
    elif readiness == "blocked":
        next_action = "ask_user"
    else:
        next_action = "clarify_specification"

    top_choice = "Clarify treatment timing, comparison group, and DiD estimand before software choice"
    if design_lane.startswith("staggered"):
        top_choice = "Use modern staggered-adoption DiD; keep TWFE as benchmark or diagnostic only"
    elif design_lane.startswith("2x2"):
        top_choice = "Use simple or doubly robust 2x2 DiD with parallel-trend and inference diagnostics"
    elif design_lane.startswith("synthetic"):
        top_choice = "Use synthetic DiD or synthetic-control support with donor-fit and placebo diagnostics"
    elif design_lane.startswith("repeated"):
        top_choice = "Use repeated-cross-section DiD with composition and sampling diagnostics"

    return {
        "readiness": readiness,
        "design_lane": design_lane,
        "top_choice": top_choice,
        "software_options": software[:10],
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
