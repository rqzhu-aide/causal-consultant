#!/usr/bin/env python3
"""Rule based recommender for doubly robust estimation.

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
        "Verify design route, estimand, and adjustment set before estimator choice.",
        "Check support/positivity and possible propensity truncation.",
        "Document outcome, treatment, censoring, missingness, or sampling nuisance functions.",
        "Prepare influence-curve or fold-stability diagnostics.",
        "Compare the DR estimate with simpler regression/weighting/matching benchmarks.",
    ]
    if spec.get("needs_cross_fitting"):
        diagnostics.append("Use cross-fitting or honest sample splitting for flexible nuisance learners.")
    if spec.get("clustered"):
        diagnostics.append("Plan clustered splits or clustered uncertainty when units are dependent.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    return [
        f"DR estimand: {spec.get('estimand', 'unknown')}.",
        "Report design route, nuisance functions, learner library, positivity/truncation, and inference method.",
        "Include influence-curve or fold diagnostics and comparison to simpler estimators.",
        "State that double robustness does not address wrong identification or unmeasured confounding.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    design = spec.get("design_route", "unknown")
    estimand = spec.get("estimand", "unknown")
    treatment = spec.get("treatment_type", "unknown")
    outcome = spec.get("outcome_type", "unknown")
    complexity = spec.get("nuisance_complexity", "unknown")
    positivity = spec.get("positivity_status", "unknown")
    confounders = spec.get("confounder_status", "unknown")
    censoring = spec.get("censoring_or_missingness", "unknown")
    language = spec.get("language", "unknown")
    n = spec.get("sample_size")
    p = spec.get("n_covariates")

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if design == "unknown":
        clarifications.append("Clarify design route before choosing a doubly robust estimator.")
    if estimand == "unknown":
        clarifications.append("Define the target estimand and effect scale.")
    if confounders in {"weak", "partial"}:
        caveats.append("DR estimation cannot fix missing key confounders; keep claim limits and sensitivity analysis.")
    elif confounders == "unknown":
        clarifications.append("Confirm the approved adjustment set.")

    if positivity == "poor":
        caveats.append("Poor positivity can make DR estimators unstable or non-credible.")
    elif positivity == "limited":
        caveats.append("Limited positivity requires truncation/support diagnostics and comparison to restricted targets.")
    elif positivity == "unknown":
        clarifications.append("Ask for propensity/support diagnostics before DR reporting.")

    if treatment == "continuous":
        activate.append("23-dose-response-effects")
        caveats.append("Continuous treatment DR targets need dose-response or continuous-treatment support.")
    if treatment == "time_varying" or design == "longitudinal":
        activate.append("09-longitudinal-gmethods")
        if language in {"r", "either", "unknown"}:
            software.append(_software("ltmle or lmtp", "R", "Use for longitudinal targeted learning or modified treatment policies."))
        analysis_lane = "longitudinal doubly robust estimation"
    elif outcome in {"survival_time", "competing_risk"} or design == "survival":
        activate.append("33-survival-competing-risks")
        analysis_lane = "censoring-aware doubly robust survival support"
    else:
        analysis_lane = "point-treatment doubly robust estimation"

    if design == "transportability" or estimand == "transported_effect":
        activate.append("24-transportability-generalizability")

    if censoring == "severe":
        caveats.append("Severe missingness/censoring needs a credible censoring model or claim limits.")
    elif censoring in {"informative", "unknown"}:
        clarifications.append("Clarify missingness/censoring nuisance model and diagnostics.")

    flexible = complexity in {"moderate", "high"} or spec.get("needs_cross_fitting")
    if flexible:
        activate.append("32-double-machine-learning")
        if language in {"r", "either", "unknown"}:
            software.append(_software("tmle3/sl3 or drtmle", "R", "Use flexible nuisance learners with targeted or DR estimation."))
            software.append(_software("SuperLearner + AIPW", "R", "Use for transparent AIPW with ensemble nuisance models."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("EconML DRLearner", "Python", "Use cross-fitted doubly robust learners with sklearn-style nuisances."))
            software.append(_software("DoubleML IRM", "Python/R", "Use orthogonal score workflows for binary treatment effects."))
    else:
        if language in {"r", "either", "unknown"}:
            software.append(_software("AIPW or tmle", "R", "Use for transparent point-treatment DR/TMLE estimation."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("custom AIPW or zepid", "Python", "Use for transparent AIPW prototypes and diagnostics."))

    if outcome in {"binary", "bounded"}:
        if language in {"r", "either", "unknown"}:
            software.append(_software("tmle", "R", "Use for bounded/risk targets with targeted updating."))

    if isinstance(n, int) and isinstance(p, int) and p > 0 and n < 20 * p:
        caveats.append("Sample size is small relative to covariates; restrict learner library or simplify nuisance models.")

    if not software:
        software.append(_software("AIPW/TMLE design checklist", "R or Python", "Clarify target and diagnostics before choosing software."))

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if positivity == "poor" or censoring == "severe":
        readiness = "diagnostics_needed"
    if design == "unknown" and estimand == "unknown":
        readiness = "blocked"

    top_choice = "Doubly robust estimator with influence-function diagnostics"
    if flexible:
        top_choice = "Cross-fitted DR/TMLE workflow with flexible nuisance learners"
    if design == "longitudinal":
        top_choice = "Longitudinal TMLE or sequential DR only after 09 validates histories"
    if positivity == "poor":
        top_choice = "Do not rely on DR until support problem is addressed"

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
