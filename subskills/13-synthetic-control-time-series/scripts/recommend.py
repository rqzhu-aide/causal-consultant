#!/usr/bin/env python3
"""Rule based recommender for synthetic control and time-series support.

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
        "Verify treated unit(s), donor/control pool, intervention date, pre-period, and post-period.",
        "Plot raw treated and donor/control outcome trends before fitting models.",
        "Report pre-treatment fit, donor weights, and outcome/predictor balance.",
        "Plan placebo/permutation, leave-one-out, or alternative-date sensitivity.",
        "Check concurrent shocks, spillovers, and measurement changes at the intervention date.",
    ]
    if spec.get("seasonality_risk") in {"moderate", "high", "unknown"}:
        diagnostics.append("Inspect seasonality, autocorrelation, and frequency-specific time-series structure.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    return [
        f"Synthetic/time-series design: {spec.get('data_structure', 'unknown')}.",
        "Report treated unit(s), donor/control pool, intervention date, pre/post windows, and target effect.",
        "Include pre-fit, donor/time weights, treated-versus-counterfactual plots, placebo/sensitivity evidence, and limitations.",
        "State that counterfactual validity depends on donor/control validity, pre-period fit, and absence of concurrent shocks/spillovers.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    data = spec.get("data_structure", "unknown")
    treated = spec.get("treated_units")
    donor = spec.get("donor_pool_status", "unknown")
    pre = spec.get("pre_periods")
    post = spec.get("post_periods")
    prefit = spec.get("pre_fit_status", "unknown")
    timing = spec.get("intervention_timing", "unknown")
    anticipation = spec.get("anticipation_risk", "unknown")
    spillover = spec.get("spillover_risk", "unknown")
    shock = spec.get("concurrent_shock_risk", "unknown")
    language = spec.get("language", "unknown")

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if data == "unknown":
        clarifications.append("Clarify data structure: single series, treated plus control series, balanced panel, unbalanced panel, or staggered panel.")
    if treated is None:
        clarifications.append("Record number of treated units.")
    if donor == "unknown":
        clarifications.append("Clarify donor/control pool availability and contamination risk.")
    if timing == "unknown":
        clarifications.append("Clarify intervention date, phase-in, or multiple intervention dates.")
    if isinstance(pre, int) and pre < 8:
        caveats.append("Short pre-period; counterfactual trend, seasonality, and placebo diagnostics are weak.")
    elif pre is None:
        clarifications.append("Record number of pre-intervention periods.")
    if isinstance(post, int) and post < 1:
        caveats.append("No post-intervention period is available.")
    elif post is None:
        clarifications.append("Record number of post-intervention periods.")

    if donor == "contaminated":
        activate.append("14-interference-spillovers")
        caveats.append("Donor/control pool appears contaminated by intervention or spillovers.")
    elif donor == "limited":
        caveats.append("Limited donor pool; inference and placebo evidence may be fragile.")
    if spillover == "high":
        activate.append("14-interference-spillovers")
        caveats.append("High spillover risk threatens donor/control validity.")
    elif spillover in {"moderate", "unknown"}:
        diagnostics.append("Check donor/control contamination and geographic/network spillover paths.")
    if shock == "high":
        caveats.append("Concurrent shock risk is high; causal attribution may be blocked without redesign.")
    elif shock in {"moderate", "unknown"}:
        diagnostics.append("Review concurrent shocks and alternative intervention dates.")
    if anticipation == "high":
        caveats.append("High anticipation risk; adjust pre/post windows or avoid interpreting early effects causally.")
    elif anticipation in {"moderate", "unknown"}:
        diagnostics.append("Check anticipation and phase-in windows.")

    if spec.get("no_donor_pool") or donor == "none" or data == "single_series":
        design_lane = "interrupted time-series support"
        if language in {"r", "either", "unknown"}:
            software.append(_software("segmented regression with nlme/sandwich", "R", "Use for ITS with autocorrelation/seasonality checks when no donor pool exists."))
            software.append(_software("CausalImpact without controls only as forecast sensitivity", "R", "Use cautiously as model-based forecast support, not strong causal evidence."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("statsmodels SARIMAX/OLS", "Python", "Use for segmented regression or forecast-based ITS diagnostics."))
        caveats.append("Treated-only ITS is vulnerable to concurrent shocks; claims should be cautious.")
    elif spec.get("needs_bsts") or data == "treated_plus_controls":
        design_lane = "BSTS or comparative time-series support"
        if language in {"r", "either", "unknown"}:
            software.append(_software("CausalImpact", "R", "Use Bayesian structural time-series counterfactual with unaffected control series."))
            software.append(_software("bsts", "R", "Use custom BSTS when seasonality/state components need control."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("causal-impact", "Python", "Use Python CausalImpact-style workflow after checking package maturity."))
            software.append(_software("statsmodels", "Python", "Use SARIMAX/state-space benchmarks and diagnostics."))
    elif spec.get("needs_synthetic_did") or data == "staggered_panel" or spec.get("multiple_treated_periods"):
        design_lane = "synthetic DiD or generalized panel counterfactual support"
        activate.append("10-did-event-study")
        if language in {"r", "either", "unknown"}:
            software.append(_software("synthdid", "R", "Use synthetic DiD when panel data support unit and time weighting."))
            software.append(_software("gsynth", "R", "Use generalized SCM/interactive fixed effects with multiple treated units or timing variation."))
            software.append(_software("fect", "R", "Use fixed-effect counterfactual or matrix-completion workflows with diagnostics."))
            software.append(_software("augsynth", "R", "Use augmented/staggered synthetic control when imperfect fit needs bias correction."))
        if language in {"stata", "either", "unknown"}:
            software.append(_software("sdid", "Stata", "Use Stata synthetic DiD implementation."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("pysyncon or custom matrix completion", "Python", "Use Python synthetic panel tools after validating against reference output."))
    elif isinstance(treated, int) and treated <= 5:
        if prefit == "good":
            design_lane = "classic synthetic control support"
            if language in {"r", "either", "unknown"}:
                software.append(_software("Synth", "R", "Use canonical SCM with donor weights and placebo diagnostics."))
                software.append(_software("tidysynth", "R", "Use tidy SCM workflow with plots and weight diagnostics."))
            if language in {"python", "either", "unknown"}:
                software.append(_software("pysyncon", "Python", "Use Python SCM/augmented SCM when R is not available."))
            if language in {"stata", "either", "unknown"}:
                software.append(_software("synth + synth_runner", "Stata", "Use classic SCM with placebo wrappers."))
        elif prefit in {"imperfect", "poor"}:
            design_lane = "augmented synthetic control support"
            if language in {"r", "either", "unknown"}:
                software.append(_software("augsynth", "R", "Use augmented SCM to correct imperfect pre-treatment fit with explicit model-dependence caveats."))
                software.append(_software("gsynth", "R", "Use interactive fixed-effect counterfactuals if panel structure supports it."))
            if language in {"python", "either", "unknown"}:
                software.append(_software("pysyncon AugSynth", "Python", "Use augmented SCM style support in Python after validation."))
            caveats.append("Pre-treatment fit is not good; classic SCM alone is not enough.")
        else:
            design_lane = "synthetic control fit-diagnostics support"
            clarifications.append("Run pre-fit and donor-weight diagnostics before choosing classic versus augmented SCM.")
    else:
        design_lane = "aggregate panel counterfactual support"
        activate.append("10-did-event-study")
        if language in {"r", "either", "unknown"}:
            software.append(_software("gsynth / fect", "R", "Use generalized SCM or matrix-completion style panel counterfactuals."))
            software.append(_software("synthdid", "R", "Use synthetic DiD if treatment block and panel support fit."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("statsmodels + custom SCM/matrix completion", "Python", "Use transparent benchmarks and validate counterfactual assumptions."))

    if prefit == "poor" and design_lane == "classic synthetic control support":
        caveats.append("Poor pre-fit should move away from classic SCM or keep claims exploratory.")
    if timing in {"ambiguous", "multiple_dates"}:
        caveats.append("Ambiguous or multiple intervention dates require phase-in/event-time sensitivity.")
    if spec.get("seasonality_risk") == "high":
        caveats.append("High seasonality risk; model seasonality and test seasonal sensitivity.")
    if not software:
        software.append(_software("synthetic/time-series design checklist", "R/Python/Stata", "Clarify donor pool, pre-fit, timing, and diagnostics before choosing software."))

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if caveats and any(term in " ".join(caveats).lower() for term in ["contaminated", "high", "short pre-period", "poor", "concurrent", "treated-only", "limited donor", "multiple intervention"]):
        readiness = "diagnostics_needed"
    if donor == "contaminated" or shock == "high" or (isinstance(post, int) and post < 1):
        readiness = "blocked"

    if readiness == "plan_ready":
        next_action = "confirm_analysis_plan"
    elif readiness == "diagnostics_needed":
        next_action = "run_diagnostics"
    elif readiness == "blocked":
        next_action = "ask_user"
    else:
        next_action = "clarify_specification"

    top_choice = "Clarify treated unit, donor/control pool, intervention date, and pre-fit before software choice"
    if design_lane.startswith("classic"):
        top_choice = "Use classic SCM with strong pre-fit, donor weights, and placebo diagnostics"
    elif design_lane.startswith("augmented"):
        top_choice = "Use augmented SCM with explicit imperfect-fit and extrapolation caveats"
    elif design_lane.startswith("synthetic DiD"):
        top_choice = "Use synthetic DiD or generalized panel counterfactuals and coordinate with DiD"
    elif design_lane.startswith("BSTS"):
        top_choice = "Use CausalImpact/BSTS only with unaffected control series and seasonality diagnostics"
    elif design_lane.startswith("interrupted"):
        top_choice = "Use ITS cautiously with autocorrelation, seasonality, and alternative-date sensitivity"

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
