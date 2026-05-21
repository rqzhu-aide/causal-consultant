#!/usr/bin/env python3
"""Rule based recommender for matching, weighting, and balance support.

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
        "Verify all matching/weighting covariates are pre-treatment and in the approved adjustment set.",
        "Produce propensity or balancing-score overlap plots.",
        "Produce pre/post balance tables with standardized mean differences.",
        "Summarize retained/discarded units and target-population shift.",
        "Summarize weights, tails, truncation, and effective sample size.",
    ]
    if spec.get("needs_exact_match"):
        diagnostics.append("Check exact or coarsened matching feasibility for domain-critical variables.")
    if spec.get("survey_weights"):
        diagnostics.append("Create an explicit plan for combining survey weights and causal weights.")
    if spec.get("clustered"):
        diagnostics.append("Track cluster structure in matching/weighting and outcome variance estimation.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    return [
        f"Matching/weighting target estimand: {spec.get('estimand', 'unknown')}.",
        "Report adjustment set, target population, retained/discarded units, and weight diagnostics.",
        "Include balance and overlap tables/figures before outcome interpretation.",
        "State that balance diagnostics address measured covariates only.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    design = spec.get("design_route", "unknown")
    estimand = spec.get("estimand", "unknown")
    treatment = spec.get("treatment_type", "unknown")
    timing = spec.get("covariate_timing", "unknown")
    confounders = spec.get("confounder_status", "unknown")
    overlap = spec.get("overlap_status", "unknown")
    balance = spec.get("balance_status", "unknown")
    missing = spec.get("missingness_status", "unknown")
    language = spec.get("language", "unknown")
    n = spec.get("sample_size")
    p = spec.get("n_covariates")

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if timing == "post_treatment":
        return {
            "readiness": "blocked",
            "top_choice": "Do not match or weight on post-treatment variables as ordinary confounders",
            "analysis_lane": "invalid covariate timing",
            "software_options": [],
            "required_clarifications": ["Ask method_lead to revise the adjustment set and timing map."],
            "diagnostics": diagnostics,
            "caveats": ["Post-treatment adjustment can block or distort the intended causal effect."],
            "activate_other_subskills": [],
            "report_support": _common_report(spec),
            "recommended_next_action": "clarify_specification",
        }

    if design == "unknown":
        clarifications.append("Clarify the design route before choosing matching or weighting.")
    if estimand == "unknown":
        clarifications.append("Choose ATE, ATT, ATO/overlap, target-population, or another estimand.")
    if treatment == "continuous":
        activate.append("23-dose-response-effects")
        caveats.append("Continuous exposure usually needs dose-response support, not ordinary binary propensity matching.")
    if treatment == "time_varying":
        activate.append("09-longitudinal-gmethods")
        caveats.append("Time-varying treatment needs longitudinal weight/support logic.")
    if timing in {"mixed_or_unclear", "unknown"}:
        clarifications.append("Confirm covariate timing and remove mediators/colliders from the balance set.")
    if confounders in {"weak", "partial"}:
        caveats.append("Balance can only address measured covariates; missing key confounders require causal caveats or sensitivity work.")
    elif confounders == "unknown":
        clarifications.append("Ask method_lead/domain_expert for the approved confounder set.")

    if overlap == "poor":
        caveats.append("Poor overlap blocks broad ATE-style weighting and may require restricted target or no causal estimate.")
    elif overlap == "limited":
        caveats.append("Limited overlap favors ATT, matching, overlap weights, trimming, or restricted target reporting.")
    elif overlap == "unknown":
        clarifications.append("Ask data_analyst for propensity/overlap diagnostics.")

    if balance == "imbalanced":
        caveats.append("Current balance diagnostics remain poor; revise method or limit claims.")
    elif balance in {"not_checked", "unknown"}:
        clarifications.append("Run balance diagnostics before outcome interpretation.")

    if missing in {"moderate", "severe"}:
        caveats.append("Missing covariates can change support and balance; resolve imputation/complete-case plan before final diagnostics.")

    if design == "transportability" or estimand == "target_population":
        activate.append("24-transportability-generalizability")
    if design == "longitudinal" or estimand == "longitudinal_strategy":
        activate.append("09-longitudinal-gmethods")

    if spec.get("needs_exact_match"):
        if language in {"r", "either", "unknown"}:
            software.append(_software("MatchIt or cem", "R", "Use exact/coarsened matching for domain-critical strata."))
        caveats.append("Exact/coarsened constraints may discard units and change the target population.")

    if estimand == "att":
        if language in {"r", "either", "unknown"}:
            software.append(_software("MatchIt + cobalt", "R", "Use matching/subclassification with balance and retained-sample diagnostics."))
            software.append(_software("WeightIt ATT + cobalt", "R", "Use ATT weights when retaining all treated units is important."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("causallib or custom sklearn/statsmodels", "Python", "Use propensity matching/ATT weights with custom balance diagnostics."))
        analysis_lane = "ATT matching or weighting"
    elif estimand == "ate":
        if overlap in {"good", "unknown"}:
            if language in {"r", "either", "unknown"}:
                software.append(_software("WeightIt IPTW + cobalt", "R", "Use stabilized ATE weights with weight and balance diagnostics."))
            if language in {"python", "either", "unknown"}:
                software.append(_software("DoWhy or custom IPTW", "Python", "Use explicit identification plus custom balance/weight reporting."))
            analysis_lane = "ATE weighting"
        else:
            analysis_lane = "ATE support problem"
    elif estimand == "ato_overlap" or overlap == "limited":
        if language in {"r", "either", "unknown"}:
            software.append(_software("WeightIt overlap weights + cobalt", "R", "Use overlap weights and report the overlap-population target."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("custom overlap weights", "Python", "Use propensity-based overlap weights with explicit target reporting."))
        analysis_lane = "overlap-population weighting"
    else:
        analysis_lane = "balance and support diagnostics"

    if spec.get("survey_weights"):
        if language in {"r", "either", "unknown"}:
            software.append(_software("survey + WeightIt/cobalt", "R", "Use when population design weights must be combined with causal weights."))
        activate.append("24-transportability-generalizability")

    if isinstance(n, int) and isinstance(p, int) and p > 0 and n < 20 * p:
        caveats.append("Sample size is small relative to covariate count; prefer simpler balance targets or dimension reduction.")
        activate.append("32-double-machine-learning")

    if not software:
        software.append(_software("balance-first design table", "R or Python", "Start with overlap and SMD diagnostics before choosing a final method."))

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if overlap == "poor" or balance == "imbalanced" or missing == "severe":
        readiness = "diagnostics_needed"
    if timing == "post_treatment":
        readiness = "blocked"

    top_choice = "Balance-first matching/weighting plan with explicit target population"
    if estimand == "att":
        top_choice = "ATT-focused matching or weighting with retained treated-population diagnostics"
    elif estimand == "ato_overlap" or overlap == "limited":
        top_choice = "Overlap or restricted-target weighting with support diagnostics"
    elif estimand == "ate":
        top_choice = "ATE weighting only if common support and weight stability are acceptable"

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
