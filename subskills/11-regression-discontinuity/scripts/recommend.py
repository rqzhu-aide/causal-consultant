#!/usr/bin/env python3
"""Rule based recommender for regression-discontinuity designs.

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
        "Verify cutoff rule, running-variable timing, treatment timing, and eligible sample.",
        "Plot outcome and treatment/exposure against the running variable with the cutoff marked.",
        "Report local sample counts on both sides of the cutoff and inside candidate bandwidths.",
        "Run density/manipulation and heaping checks before interpreting the cutoff jump.",
        "Check continuity of predetermined covariates near the cutoff.",
        "Plan bandwidth, polynomial-order, kernel, and donut/placebo sensitivity checks.",
    ]
    if spec.get("clustered"):
        diagnostics.append("Use cluster-aware inference if assignment, treatment, or outcomes are clustered.")
    if spec.get("high_order_polynomial_requested"):
        diagnostics.append("Avoid global high-order polynomials as the main RD specification; use local polynomial RD as the credibility anchor.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    return [
        f"RD lane: {spec.get('rd_lane', 'unknown')}.",
        f"Target scope: {spec.get('target_population_scope', 'unknown')}.",
        "Report cutoff rule, running variable, treatment jump, local estimand, local sample, estimator, package, and bandwidth/inference choices.",
        "Include RD plot, treatment jump, density/manipulation evidence, covariate continuity, bandwidth sensitivity, placebo/donut checks when relevant, and local-interpretation limits.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    design = spec.get("design_variant", "unknown")
    running_type = spec.get("running_variable_type", "unknown")
    treatment_jump = spec.get("treatment_jump_status", "unknown")
    target_scope = spec.get("target_population_scope", "unknown")
    manipulation = spec.get("manipulation_risk", "unknown")
    density = spec.get("density_check_status", "unknown")
    covariates = spec.get("covariate_continuity_status", "unknown")
    bandwidth = spec.get("bandwidth_support", "unknown")
    simultaneous = spec.get("simultaneous_policy_risk", "unknown")
    heaping = spec.get("heaping_risk", "unknown")
    sample_n = spec.get("sample_size_near_cutoff")
    language = spec.get("language", "unknown")

    fuzzy = bool(spec.get("fuzzy_compliance")) or design == "fuzzy_rd" or treatment_jump == "fuzzy"
    multiple = bool(spec.get("multiple_cutoffs")) or design == "multiple_cutoff_rd"
    local_rand = bool(spec.get("local_randomization_candidate")) or bool(spec.get("discrete_score")) or design == "local_randomization_rd" or running_type == "discrete"
    geographic = design == "geographic_rd" or running_type in {"geographic_distance", "multidimensional"}
    time_cutoff = design == "time_cutoff_rd" or running_type == "date_time"
    kink = design == "regression_kink" or treatment_jump == "kink"

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if design == "unknown":
        clarifications.append("Clarify whether this is sharp RD, fuzzy RD, regression kink, geographic RD, time cutoff RD, multiple-cutoff RD, or local-randomization RD.")
    if running_type == "unknown":
        clarifications.append("Define the running/forcing variable and confirm it was measured before treatment.")
    if spec.get("cutoff_known") is not True:
        clarifications.append("Confirm the exact cutoff value and source of the assignment rule.")
    if spec.get("pre_specified_cutoff") is False:
        caveats.append("Cutoff appears analyst-chosen or post hoc; causal RD credibility is weak unless the assignment rule can be documented.")
    if treatment_jump in {"unknown", "other"}:
        clarifications.append("Show whether treatment receipt, eligibility, or exposure intensity changes at the cutoff.")
    if treatment_jump == "no_jump":
        caveats.append("No treatment or exposure jump at the cutoff; RD cannot identify a cutoff effect as specified.")
    if target_scope == "broad_population":
        activate.append("24-transportability-generalizability")
        caveats.append("RD identifies a local cutoff effect by default; broad-population claims need separate transportability support.")

    if density == "failed" or manipulation == "high":
        caveats.append("Severe running-variable manipulation/sorting evidence threatens RD validity.")
    elif density in {"not_run", "unknown"} or manipulation in {"moderate", "unknown"}:
        diagnostics.append("Run rddensity/McCrary-style checks and inspect sorting incentives before treating the design as credible.")

    if covariates == "failed":
        caveats.append("Predetermined covariates are discontinuous at the cutoff; continuity assumptions need redesign, explanation, or heavy caveat.")
    elif covariates in {"not_run", "unknown"}:
        diagnostics.append("Run covariate continuity checks for predetermined variables.")

    if simultaneous == "high":
        caveats.append("A concurrent policy or measurement change at the cutoff may explain the discontinuity.")
    elif simultaneous in {"moderate", "unknown"}:
        diagnostics.append("Ask domain_expert to check whether other rules change at the same threshold.")

    if heaping == "high":
        caveats.append("High heaping/rounding near the cutoff can bias RD estimates; consider donut RD or local-randomization alternatives.")
    elif heaping in {"moderate", "unknown"}:
        diagnostics.append("Inspect heaping/rounding and consider donut RD sensitivity.")

    if bandwidth in {"thin", "very_thin"}:
        caveats.append("Sparse support near the cutoff may make RD estimates unstable.")
    elif bandwidth == "unknown":
        diagnostics.append("Compute local sample counts and bandwidth sensitivity.")
    if isinstance(sample_n, int) and sample_n < 100:
        caveats.append("Very small local sample near cutoff; prioritize feasibility/power and randomization-style sensitivity.")

    if fuzzy:
        rd_lane = "fuzzy RD local IV"
        activate.append("12-instrumental-variables")
        diagnostics.append("Report the first-stage treatment jump and local complier interpretation.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("rdrobust", "R", "Use fuzzy RD estimation with robust bias-corrected inference and RD plots."))
            software.append(_software("ivreg or fixest", "R", "Use local-window IV/2SLS sensitivity after RD diagnostics are satisfied."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("rdrobust", "Python", "Use official Python rdrobust for fuzzy RD if installed and validated."))
            software.append(_software("linearmodels IV2SLS", "Python", "Use local-window IV benchmark, not as a replacement for RD diagnostics."))
        if language in {"stata", "either", "unknown"}:
            software.append(_software("rdrobust", "Stata", "Use canonical fuzzy RD workflow and robust inference."))
    elif kink:
        rd_lane = "regression kink design"
        diagnostics.append("Show a discontinuity in the slope of treatment/intensity at the cutoff and smooth predetermined variables.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("rdrobust", "R", "Use derivative/kink RD support and sensitivity checks where appropriate."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("rdrobust or statsmodels", "Python", "Use RD package support or custom local polynomial slope-change benchmarks."))
        if language in {"stata", "either", "unknown"}:
            software.append(_software("rdrobust", "Stata", "Use kink/RD support with local polynomial inference."))
    elif geographic:
        rd_lane = "geographic or border RD"
        activate.append("14-interference-spillovers")
        diagnostics.append("Construct boundary distance and check geographic balance, sorting, spillovers, and boundary-specific confounding.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("sf + rdrobust", "R", "Use geospatial preprocessing plus local RD estimation near the boundary."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("geopandas + rdrobust/statsmodels", "Python", "Use geospatial preprocessing plus transparent local RD benchmarks."))
    elif time_cutoff:
        rd_lane = "time cutoff RD with time-series caution"
        activate.extend(["10-did-event-study", "13-synthetic-control-time-series"])
        caveats.append("Date cutoffs are vulnerable to secular trends, seasonality, and concurrent shocks; RD alone may not be enough.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("rdrobust + time-series checks", "R", "Use RD only with trend/seasonality and concurrent-shock sensitivity."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("rdrobust/statsmodels", "Python", "Use local RD benchmark plus interrupted-time-series diagnostics."))
    elif multiple:
        rd_lane = "multiple cutoff or multiple score RD"
        diagnostics.append("Report cutoff-specific estimates and justify any pooling or aggregation.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("rdmulti", "R", "Use multiple-cutoff or multiple-score RD workflow."))
            software.append(_software("rdrobust", "R", "Use cutoff-specific RD estimates and plots."))
        if language in {"stata", "either", "unknown"}:
            software.append(_software("rdmulti", "Stata", "Use multiple-cutoff or multiple-score RD workflow."))
    elif local_rand:
        rd_lane = "local randomization RD"
        diagnostics.append("Select and justify a local window, then run balance and randomization-inference checks.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("rdlocrand", "R", "Use local randomization window selection, balance, and randomization inference."))
        if language in {"stata", "either", "unknown"}:
            software.append(_software("rdlocrand", "Stata", "Use local randomization inference around the cutoff."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("statsmodels/scipy", "Python", "Use custom local-window balance and permutation tests if R/Stata rdlocrand is unavailable."))
    else:
        rd_lane = "sharp continuous-score RD"
        if language in {"r", "either", "unknown"}:
            software.append(_software("rdrobust", "R", "Use rdrobust, rdbwselect, and rdplot for local-polynomial RD with robust bias correction."))
            software.append(_software("rddensity", "R", "Use density/manipulation testing as a required diagnostic."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("rdrobust", "Python", "Use official Python rdrobust for local-polynomial RD where possible."))
            software.append(_software("CausalPy", "Python", "Use sharp RD modeling/plots in Python, especially for exploratory or Bayesian workflows."))
            software.append(_software("statsmodels", "Python", "Use custom local-linear benchmarks and clustered/robust SE sensitivity."))
        if language in {"stata", "either", "unknown"}:
            software.append(_software("rdrobust", "Stata", "Use canonical Stata RD estimation, plots, and bandwidth selection."))
            software.append(_software("rddensity", "Stata", "Use density/manipulation testing."))

    if spec.get("needs_power_planning"):
        if language in {"r", "either", "unknown"}:
            software.append(_software("rdpower", "R", "Use RD power and sample-size planning."))
        if language in {"stata", "either", "unknown"}:
            software.append(_software("rdpower", "Stata", "Use RD power and sample-size planning."))

    if spec.get("outcome_type") in {"survival_time", "competing_risk"}:
        activate.append("33-survival-competing-risks")
        caveats.append("Time-to-event outcomes need survival-scale support; RD can identify a local cutoff contrast but outcome modeling must handle censoring.")

    if not software:
        software.append(_software("RD design checklist", "R/Python/Stata", "Clarify cutoff rule, running variable, treatment jump, and local support before choosing software."))

    blocked = (
        treatment_jump == "no_jump"
        or density == "failed"
        or manipulation == "high"
        or covariates == "failed"
        or simultaneous == "high"
    )

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if caveats or any(token in diagnostics[-3:] for token in ["Run covariate continuity checks for predetermined variables."]):
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

    top_choice = "Clarify the cutoff rule, running variable, treatment jump, and local estimand before software choice"
    if readiness != "candidate_only":
        if fuzzy:
            top_choice = "Use fuzzy RD/local IV only after confirming a strong treatment jump and local complier interpretation"
        elif kink:
            top_choice = "Use regression kink only if the treatment slope, not just the outcome, changes at the cutoff"
        elif local_rand:
            top_choice = "Use local-randomization RD if a narrow balanced window is defensible"
        elif geographic:
            top_choice = "Use geographic RD only with boundary comparability and spillover checks"
        elif time_cutoff:
            top_choice = "Treat date-cutoff RD as tentative until time-series shocks and trends are ruled out"
        else:
            top_choice = "Use rdrobust plus density, covariate-continuity, and bandwidth sensitivity checks"

    report_spec = {
        **spec,
        "rd_lane": rd_lane,
        "target_population_scope": target_scope,
    }
    return {
        "readiness": readiness,
        "rd_lane": rd_lane,
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
