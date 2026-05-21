#!/usr/bin/env python3
"""Rule based recommender for single-time observational exposure designs.

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
        "Build or review a target-trial emulation table.",
        "Map exposure, confounder, mediator, collider, and outcome timing.",
        "Summarize analysis-set flow counts and exclusion reasons.",
        "Check overlap/support before choosing ATE, ATT, or a restricted target.",
        "Report balance before and after any adjustment, matching, or weighting.",
    ]
    if spec.get("missingness_status") in {"moderate", "severe", "unknown"}:
        diagnostics.append("Profile missingness by exposure and outcome before deciding complete-case, imputation, or weighting.")
    if spec.get("selection_risk") in {"moderate", "high", "unknown"}:
        diagnostics.append("Assess selection into the dataset and whether it changes the target population.")
    if spec.get("unmeasured_confounding_concern"):
        diagnostics.append("Add unmeasured-confounding sensitivity, negative controls, proximal methods, or another design feature if possible.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    estimand = spec.get("estimand", "unknown")
    return [
        f"Primary observational estimand: {estimand}.",
        "Report target trial, time zero, exposure, comparator, eligibility, follow-up, and outcome.",
        "Include adjustment set, support/overlap evidence, missingness/selection handling, and sensitivity checks.",
        "State whether the result is exploratory, descriptive, cautious causal, supported under assumptions, or not supportable.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    timing = spec.get("exposure_timing", "unknown")
    exposure_type = spec.get("exposure_type", "unknown")
    estimand = spec.get("estimand", "unknown")
    confounding = spec.get("confounder_status", "unknown")
    overlap = spec.get("overlap_status", "unknown")
    missing = spec.get("missingness_status", "unknown")
    selection = spec.get("selection_risk", "unknown")
    outcome = spec.get("outcome_type", "unknown")
    language = spec.get("language", "unknown")
    high_dim = spec.get("high_dimensional")
    interpretability = spec.get("needs_interpretability")
    n = spec.get("sample_size")
    p = spec.get("n_covariates")

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if timing == "post_outcome":
        return {
            "readiness": "blocked",
            "top_choice": "Do not use post-outcome exposure as a baseline treatment",
            "analysis_lane": "invalid timing for point-treatment causal design",
            "software_options": [],
            "required_clarifications": ["Ask for the true exposure time and outcome follow-up window."],
            "diagnostics": diagnostics,
            "caveats": ["Exposure after outcome risk or outcome measurement blocks the target-trial comparison."],
            "activate_other_subskills": [],
            "report_support": _common_report(spec),
            "recommended_next_action": "ask_user",
        }

    if timing == "time_varying":
        return {
            "readiness": "candidate_only",
            "top_choice": "Route to longitudinal g-methods or dynamic policy workflow",
            "analysis_lane": "not a single-time exposure",
            "software_options": [],
            "required_clarifications": ["Clarify whether exposure changes over time and whether time-varying confounding exists."],
            "diagnostics": diagnostics,
            "caveats": ["A point-treatment design can mis-handle treatment histories and time-varying confounding."],
            "activate_other_subskills": ["09-longitudinal-gmethods"],
            "report_support": _common_report(spec),
            "recommended_next_action": "activate_specialist",
        }

    if exposure_type in {"continuous", "ordinal", "multi_level"}:
        activate.append("23-dose-response-effects")
        caveats.append("Dose or multi-level exposure needs target support from the dose-response module.")

    if spec.get("target_trial_defined") is False:
        clarifications.append("Fill the target-trial table before committing to a polished causal estimate.")
    if timing == "unknown":
        clarifications.append("Define time zero and confirm exposure precedes the outcome window.")
    if estimand == "unknown":
        clarifications.append("Choose ATE, ATT, overlap-population, or another target estimand.")
    if confounding == "unknown":
        clarifications.append("List baseline confounders and which are available in the data.")
    elif confounding == "weak":
        caveats.append("Measured confounder set appears weak; causal claims require strong caveats or another design feature.")
    elif confounding == "partial":
        caveats.append("Partial confounder measurement requires sensitivity analysis and careful claim limits.")

    if overlap == "poor":
        caveats.append("Poor overlap blocks broad ATE-style claims; restrict the target or use an overlap estimand if defensible.")
    elif overlap == "limited":
        caveats.append("Limited overlap favors ATT, overlap weights, trimming, or a supported target population.")
    elif overlap == "unknown":
        clarifications.append("Ask data_analyst for overlap/support diagnostics.")

    if missing == "severe":
        caveats.append("Severe missingness can change the target population or bias adjustment; resolve before a strong claim.")
    if selection == "high":
        caveats.append("High selection risk needs explicit selection model, target restriction, or claim boundary.")

    if outcome in {"survival_time", "competing_risk"}:
        activate.append("33-survival-competing-risks")
        caveats.append("Time-to-event or competing-risk outcome needs survival-specific estimands and censoring diagnostics.")

    if spec.get("unmeasured_confounding_concern"):
        activate.append("15-negative-controls-proximal")
        if spec.get("has_negative_controls") is False:
            clarifications.append("Ask whether negative-control exposure/outcome/proxy variables or sensitivity parameters are available.")

    if high_dim or (isinstance(n, int) and isinstance(p, int) and p > 0 and n < 20 * p):
        activate.append("32-double-machine-learning")
        if language in {"r", "either", "unknown"}:
            software.append(_software("DoubleML or grf", "R", "Use orthogonal or forest-based nuisance support when covariates are rich."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("DoubleML or EconML", "Python", "Use cross-fitted nuisance learners for high-dimensional adjustment support."))

    if exposure_type == "binary":
        if overlap in {"good", "unknown"}:
            if language in {"r", "either", "unknown"}:
                software.append(_software("WeightIt + cobalt", "R", "Use propensity weighting with balance and weight diagnostics."))
                software.append(_software("MatchIt + cobalt", "R", "Use matching/subclassification when ATT or design-stage pruning is natural."))
            if language in {"python", "either", "unknown"}:
                software.append(_software("DoWhy", "Python", "Use DAG-based identification, backdoor adjustment, and refutation discipline."))
                software.append(_software("statsmodels + scikit-learn", "Python", "Use transparent propensity and regression prototypes."))
        if overlap == "limited":
            if language in {"r", "either", "unknown"}:
                software.append(_software("WeightIt overlap weights + cobalt", "R", "Use overlap or trimmed weights with explicit target-population reporting."))
                software.append(_software("MatchIt", "R", "Use matching to focus on supported treated-control comparisons."))
            if language in {"python", "either", "unknown"}:
                software.append(_software("DoWhy + custom overlap diagnostics", "Python", "Use explicit identification plus support checks and restricted target reporting."))

    if confounding in {"strong", "partial"} and overlap in {"good", "limited"}:
        activate.extend(["30-matching-weighting-balance", "31-doubly-robust-estimation"])
        if language in {"r", "either", "unknown"}:
            software.append(_software("tmle/drtmle/tmle3", "R", "Use TMLE or doubly robust estimation when nuisance models need flexibility."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("EconML DRLearner", "Python", "Use doubly robust learners for flexible observational effect estimation."))

    if interpretability:
        software.insert(0, _software("target-trial table + balance diagnostics", "R or Python", "Use as the primary communication artifact before flexible estimators."))

    if not software:
        software.append(_software("transparent regression/g-computation prototype", "R or Python", "Use only after timing, confounding, and support are clarified."))

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if overlap == "poor" or missing == "severe" or selection == "high":
        readiness = "diagnostics_needed"
    if confounding == "weak" and spec.get("unmeasured_confounding_concern"):
        readiness = "blocked"

    top_choice = "Target-trial emulation with balance, overlap, and sensitivity diagnostics"
    analysis_lane = "single-time observational exposure"
    if estimand == "att":
        top_choice = "ATT-oriented matching or weighting with treated-population support checks"
        analysis_lane = "observational ATT design"
    elif estimand == "ate":
        top_choice = "ATE-oriented adjustment with strong overlap diagnostics"
        analysis_lane = "observational ATE design"
    elif estimand == "overlap_population":
        top_choice = "Overlap-population effect with explicit supported target reporting"
        analysis_lane = "restricted support design"

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
