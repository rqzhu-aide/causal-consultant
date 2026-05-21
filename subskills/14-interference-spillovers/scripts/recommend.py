#!/usr/bin/env python3
"""Rule based recommender for interference and spillover designs.

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
        "Define treatment unit, outcome unit, and possible spillover receiver unit.",
        "State the interference mechanism and timing before choosing estimators.",
        "Construct or validate an exposure mapping for each unit.",
        "Check support by crossing own treatment with spillover exposure levels.",
        "Inspect contamination of nominal controls and dependence across units.",
        "Plan sensitivity to alternative exposure radii, lags, tie definitions, or saturation thresholds.",
    ]
    if spec.get("longitudinal_panel"):
        diagnostics.append("Check that spillover exposure precedes outcomes at each time point and does not use post-outcome information.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    return [
        f"Interference lane: {spec.get('interference_lane', 'unknown')}.",
        f"Target estimand: {spec.get('desired_estimand', 'unknown')}.",
        "Report unit structure, interference mechanism, exposure mapping, support, estimator/model, and uncertainty method.",
        "Include support tables, exposure-map diagnostics, network/cluster/geographic summaries, sensitivity to alternative mappings, and direct-versus-spillover wording limits.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    structure = spec.get("interference_structure", "unknown")
    design = spec.get("data_design", "unknown")
    estimand = spec.get("desired_estimand", "unknown")
    exposure_status = spec.get("exposure_mapping_status", "unknown")
    observed = spec.get("network_or_cluster_observed", "unknown")
    support = spec.get("support_across_exposures", "unknown")
    contamination = spec.get("contamination_risk", "unknown")
    homophily = spec.get("homophily_confounding_risk", "unknown")
    missingness = spec.get("network_missingness_risk", "unknown")
    language = spec.get("language", "unknown")
    clusters = spec.get("cluster_count")

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if structure == "unknown":
        clarifications.append("Clarify whether interference is partial/clustered, network, spatial, bipartite/market, saturation, contamination-only, or another structure.")
    if estimand == "unknown":
        clarifications.append("Choose a target estimand: direct, spillover/indirect, total, overall, saturation policy, exposure-response, or descriptive mapping.")
    if exposure_status in {"needs_construction", "uncertain", "unknown"}:
        clarifications.append("Define the exposure mapping before estimating spillover effects.")
    if exposure_status == "unsupported":
        caveats.append("Exposure mapping is unsupported; causal spillover estimation is not credible as specified.")
    if observed in {"missing", "unknown"} and structure not in {"contamination_only", "unknown"}:
        caveats.append("Relevant network, cluster, market, or geography structure is unavailable or unknown.")
    if observed == "partial":
        diagnostics.append("Assess missing ties, boundary units, and sensitivity to unobserved network/cluster structure.")
    if support == "none":
        caveats.append("No support across own-treatment and spillover-exposure levels; requested estimand is not estimable from current data.")
    elif support in {"thin", "unknown"}:
        diagnostics.append("Create support and positivity tables for own treatment by exposure level.")
    if not spec.get("timing_known", False):
        clarifications.append("Clarify whether spillover exposure occurs before the outcome.")
    if not spec.get("own_treatment_available", False):
        clarifications.append("Provide own treatment/exposure for each outcome unit.")
    if not spec.get("peer_treatment_available", False) and structure not in {"contamination_only", "unknown"}:
        clarifications.append("Provide treatment/exposure information for peers, neighbors, clusters, or nearby units.")
    if contamination == "high":
        caveats.append("High contamination risk; standard no-interference comparison groups are not clean.")
    elif contamination in {"moderate", "unknown"}:
        diagnostics.append("Separate clean controls, spillover-exposed controls, and directly treated units where possible.")
    if homophily == "high" and design == "observational":
        caveats.append("High homophily/shared-environment confounding risk; observational peer-effect claims are fragile.")
    elif homophily in {"moderate", "unknown"} and design == "observational":
        diagnostics.append("Adjust for own covariates, neighbor covariates, network position, and shared environment; consider sensitivity analysis.")
    if missingness == "high":
        caveats.append("High network/cluster missingness can invalidate the exposure mapping.")
    elif missingness in {"moderate", "unknown"}:
        diagnostics.append("Quantify missing ties or incomplete geography and rerun exposure maps under alternatives.")

    if design in {"randomized_individual", "cluster_randomized", "two_stage_randomized", "graph_cluster_randomized"}:
        activate.append("07-randomized-assignment-and-experiments")
    if design == "did_panel":
        activate.append("10-did-event-study")
    if design == "rd_boundary":
        activate.append("11-regression-discontinuity")
    if design == "iv_encouragement" or spec.get("noncompliance"):
        activate.append("12-instrumental-variables")
    if design == "synthetic_time_series":
        activate.append("13-synthetic-control-time-series")
    if spec.get("geographic") or structure == "spatial_interference":
        activate.append("13-synthetic-control-time-series")
    if spec.get("longitudinal_panel"):
        activate.append("09-longitudinal-gmethods")
    if estimand in {"exposure_response", "saturation_policy"}:
        activate.append("23-dose-response-effects")
    if spec.get("outcome_type") in {"survival_time", "competing_risk"}:
        activate.append("33-survival-competing-risks")

    if structure in {"partial_interference", "saturation_design"} or design in {"cluster_randomized", "two_stage_randomized"}:
        interference_lane = "partial interference or saturation design"
        if language in {"r", "either", "unknown"}:
            software.append(_software("inferference", "R", "Use IPW estimands for partial interference when group structure and allocation policies are clear."))
            software.append(_software("interferenceCI", "R", "Use confidence intervals for binary outcomes in two-stage randomized experiments."))
            software.append(_software("clusteredinterference", "R", "Use population treatment policy effects under clustered interference in observational settings."))
        if isinstance(clusters, int) and clusters < 20:
            caveats.append("Few clusters; use randomization inference, conservative intervals, or very cautious uncertainty wording.")
    elif structure == "network_interference" or design == "graph_cluster_randomized":
        interference_lane = "network exposure mapping"
        if language in {"r", "either", "unknown"}:
            software.append(_software("igraph or tidygraph", "R", "Construct treated-neighbor counts, proportions, weighted exposure, components, and degree diagnostics."))
            software.append(_software("fixest/lme4/mgcv + sandwich", "R", "Fit transparent exposure-response regressions with cluster/network-aware uncertainty as a benchmark."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("networkx", "Python", "Construct exposure mappings and graph diagnostics."))
            software.append(_software("networkinference", "Python", "Use network HAC, IPW, OLS/TSLS tools for network-dependent inference when assumptions fit."))
        if design in {"randomized_individual", "graph_cluster_randomized"} and spec.get("treatment_assignment_known") is True:
            diagnostics.append("Compute exposure probabilities or use randomization inference for the chosen exposure mapping.")
        elif design == "observational":
            diagnostics.append("Model both own treatment and neighbor exposure propensities; assess homophily and shared environment.")
    elif structure == "spatial_interference" or spec.get("geographic"):
        interference_lane = "spatial or geographic spillover"
        if language in {"r", "either", "unknown"}:
            software.append(_software("sf + spdep", "R", "Build distance, buffer, adjacency, and spatial-lag exposure variables."))
            software.append(_software("geocausal", "R", "Use spatio-temporal causal workflows when treatment/outcome events match the package assumptions."))
            software.append(_software("SpatialEffect", "R/GitHub", "Use design-based spatial experiment estimators when assignment and locations are known."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("geopandas + networkx", "Python", "Build spatial adjacency, distance kernels, and exposure maps."))
            software.append(_software("statsmodels/spreg-style tools", "Python", "Fit transparent spatial/regression analogs and dependence-aware benchmarks."))
        diagnostics.append("Test sensitivity to radius, distance decay, boundary handling, and temporal lag choices.")
    elif structure == "bipartite_market":
        interference_lane = "bipartite, market, or shared-provider exposure"
        diagnostics.append("Define both sides of the bipartite graph and construct exposure through providers, sellers, clinicians, schools, or markets.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("igraph/tidygraph + fixest", "R", "Construct bipartite exposure and fit transparent fixed-effect or clustered models."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("networkx + statsmodels/linearmodels", "Python", "Construct bipartite exposure and fit regression/panel benchmarks."))
    elif structure == "contamination_only":
        interference_lane = "contamination and design protection"
        caveats.append("Goal may be to protect the main design, not to estimate a spillover effect.")
        diagnostics.append("Quantify contamination, define clean controls, and consider cluster assignment, buffer zones, or ITT wording.")
        software.append(_software("design checklist", "R/Python/Stata", "Use design diagnostics and sensitivity tables before any specialized spillover estimator."))
    else:
        interference_lane = "interference structure unclear"
        software.append(_software("exposure mapping checklist", "R/Python/Stata", "Clarify mechanism, network/cluster/geography data, support, and estimand before software choice."))

    if spec.get("noncompliance"):
        if language in {"r", "either", "unknown"}:
            software.append(_software("latenetwork", "R", "Use LATE-style direct/indirect/spillover parameters under noncompliance and network interference when assumptions fit."))
        caveats.append("Noncompliance changes the estimand; coordinate spillover claims with IV assumptions.")
    if estimand == "descriptive_mapping":
        caveats.append("Requested output is descriptive mapping; do not upgrade to causal spillover language without identification support.")

    if not software:
        software.append(_software("custom exposure-map workflow", "R/Python/Stata", "Construct exposure variables and choose design-based or regression tools around the estimand."))

    blocked = (
        exposure_status == "unsupported"
        or support == "none"
        or (observed == "missing" and structure not in {"contamination_only", "unknown"})
    )
    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if caveats or support in {"thin", "unknown"} or observed == "partial":
        readiness = "diagnostics_needed"
    if blocked:
        readiness = "blocked"

    if readiness == "plan_ready":
        next_action = "confirm_analysis_plan"
    elif readiness == "diagnostics_needed":
        next_action = "run_exposure_diagnostics"
    elif readiness == "blocked":
        next_action = "ask_user_or_redesign"
    else:
        next_action = "clarify_specification"

    if readiness == "candidate_only":
        top_choice = "Define the interference mechanism, exposure mapping, support, and estimand before choosing packages"
    elif blocked:
        top_choice = "Do not estimate causal spillover effects until exposure structure and support are available"
    elif interference_lane.startswith("partial"):
        top_choice = "Use partial-interference or saturation estimands with cluster-level support and dependence-aware inference"
    elif interference_lane.startswith("network"):
        top_choice = "Fix an interpretable exposure mapping first, then use randomization/IPW or adjusted network models"
    elif interference_lane.startswith("spatial"):
        top_choice = "Build spatial exposure windows and test sensitivity to radius, lag, and boundary choices"
    elif interference_lane.startswith("contamination"):
        top_choice = "Protect or reinterpret the main design before estimating spillover effects"
    else:
        top_choice = "Use a custom exposure-map workflow with cautious causal wording"

    report_spec = {
        **spec,
        "interference_lane": interference_lane,
        "desired_estimand": estimand,
    }
    return {
        "readiness": readiness,
        "interference_lane": interference_lane,
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
