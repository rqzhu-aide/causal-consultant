#!/usr/bin/env python3
"""Rule based recommender for randomized assignment and experiments.

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
        "Verify assignment happened before treatment/exposure and outcome follow-up.",
        "Report experiment-flow counts from eligible to assigned to analyzed units.",
        "Check baseline balance using only pre-assignment covariates.",
        "Summarize missing outcomes and attrition by assigned arm.",
        "Confirm the analysis unit and uncertainty method match the randomization unit.",
    ]
    if spec.get("online_experiment"):
        diagnostics.append("Run sample-ratio mismatch and triggered/exposure checks before interpreting effects.")
    if spec.get("blocked_or_stratified"):
        diagnostics.append("Represent blocks or strata in estimation or randomization inference.")
    if spec.get("clustered"):
        diagnostics.append("Report number of clusters, cluster sizes, and cluster-robust or cluster-level inference.")
    if spec.get("multiple_outcomes_or_arms"):
        diagnostics.append("Separate primary from exploratory outcomes/arms and review multiplicity.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    estimand = spec.get("estimand", "unknown")
    return [
        f"Primary experiment estimand: {estimand}.",
        "Report assignment mechanism, unit, arms, eligibility, and outcome window.",
        "Include flow counts, assignment integrity checks, compliance/attrition summaries, and uncertainty method.",
        "State whether the result is exploratory, ITT-supported, CACE-supported, or not supportable.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    mechanism = spec.get("assignment_mechanism", "unknown")
    estimand = spec.get("estimand", "unknown")
    compliance = spec.get("compliance_status", "unknown")
    attrition = spec.get("attrition_status", "unknown")
    missing = spec.get("missing_outcome_status", "unknown")
    srm = spec.get("srm_status", "unknown")
    interference = spec.get("interference_risk", "unknown")
    language = spec.get("language", "unknown")
    n = spec.get("sample_size")
    clusters = spec.get("n_clusters")
    assignment_unit = spec.get("unit_of_assignment")
    analysis_unit = spec.get("unit_of_analysis")

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if mechanism == "not_randomized":
        return {
            "readiness": "blocked",
            "top_choice": "Route to an observational or other non-randomized design route",
            "analysis_lane": "not a randomized experiment",
            "software_options": [],
            "required_clarifications": ["Ask what generated treatment/exposure if assignment was not randomized."],
            "diagnostics": diagnostics,
            "caveats": ["This module should not label a non-randomized comparison as experimental."],
            "activate_other_subskills": ["08-single-time-observational-exposure"],
            "report_support": _common_report(spec),
            "recommended_next_action": "activate_specialist",
        }

    if mechanism == "unknown":
        clarifications.append("Clarify the assignment mechanism, allocation probability, and whether assignment was random.")
    if spec.get("has_assignment_log") is False:
        clarifications.append("Request the assignment log or a reproducible description of assignment.")
    if spec.get("has_known_probabilities") is False:
        clarifications.append("Clarify assignment probabilities before design-based analysis.")
    if not assignment_unit:
        clarifications.append("Define the unit of randomization.")
    if not analysis_unit:
        clarifications.append("Define the unit of analysis and whether it differs from assignment.")
    if assignment_unit and analysis_unit and assignment_unit != analysis_unit:
        caveats.append("Assignment unit and analysis unit differ; account for clustering, aggregation, or repeated measures.")

    if attrition in {"differential", "severe"}:
        caveats.append("Differential or severe attrition can undermine the randomized comparison.")
    elif attrition == "unknown":
        clarifications.append("Ask data_analyst for attrition by assignment arm.")
    if missing in {"differential", "severe"}:
        caveats.append("Differential or severe missing outcomes need weighting, bounds, sensitivity, or claim limits.")
    elif missing == "unknown":
        clarifications.append("Ask data_analyst for missing outcome summaries by arm.")
    if interference == "high":
        activate.append("14-interference-spillovers")
        caveats.append("High interference risk means individual-level no-spillover claims are not credible without a spillover design.")
    elif interference in {"moderate", "unknown"}:
        clarifications.append("Check contamination, spillovers, and whether treatment of one unit can affect another.")

    if srm == "failed":
        caveats.append("Sample-ratio mismatch failed; audit assignment, eligibility, logging, and triggering before effect interpretation.")
    elif srm == "unknown" and spec.get("online_experiment"):
        clarifications.append("Run a sample-ratio mismatch check before interpreting online experiment results.")

    if mechanism in {"simple_randomized", "bernoulli"}:
        if language in {"r", "either", "unknown"}:
            software.append(_software("estimatr", "R", "Use difference_in_means or lm_robust for transparent ITT estimates."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("statsmodels", "Python", "Use OLS with robust covariance for first-pass ITT estimates."))
        analysis_lane = "simple ITT randomized comparison"
    elif mechanism in {"blocked_randomized", "paired_or_matched"}:
        if language in {"r", "either", "unknown"}:
            software.append(_software("randomizr + estimatr", "R", "Represent blocked/paired assignment and estimate with block terms or design-aware estimators."))
            software.append(_software("ri2", "R", "Use randomization inference when the blocked/paired assignment is known."))
        analysis_lane = "blocked or paired randomized comparison"
    elif mechanism == "cluster_randomized":
        if language in {"r", "either", "unknown"}:
            software.append(_software("estimatr", "R", "Use lm_robust with clusters or cluster-level summaries."))
            software.append(_software("clubSandwich", "R", "Use small-sample cluster-robust variance adjustments when clusters are few."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("statsmodels", "Python", "Use cluster-robust covariance, plus cluster-level checks."))
        analysis_lane = "cluster randomized comparison"
        if isinstance(clusters, int) and clusters < 30:
            caveats.append("Few clusters; use cautious small-sample cluster inference or randomization inference.")
    elif mechanism == "encouragement":
        analysis_lane = "encouragement design with ITT and possible CACE"
        activate.append("12-instrumental-variables")
        if language in {"r", "either", "unknown"}:
            software.append(_software("estimatr::iv_robust", "R", "Use for CACE/LATE after reporting ITT and IV assumptions."))
        caveats.append("CACE/LATE requires relevance, exclusion, monotonicity, and no direct assignment effect except through receipt.")
    elif mechanism == "factorial":
        analysis_lane = "factorial randomized comparison"
        if language in {"r", "either", "unknown"}:
            software.append(_software("estimatr or fixest", "R", "Use factorial regression with planned main effects/interactions and robust SE."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("statsmodels", "Python", "Use planned factorial terms and robust covariance."))
        caveats.append("Predefine which main effects and interactions are primary to avoid multiplicity-driven claims.")
    else:
        analysis_lane = "randomized design clarification"

    if estimand == "unknown":
        clarifications.append("Choose the primary estimand: ITT, CACE/LATE, subgroup effect, policy value, or another target.")
    elif estimand == "cace_late":
        activate.append("12-instrumental-variables")
    elif estimand == "subgroup_effect":
        activate.append("20-heterogeneous-effects")
    elif estimand == "policy_value":
        activate.append("21-point-treatment-rules")
    elif estimand == "transported_effect":
        activate.append("24-transportability-generalizability")
    elif estimand in {"per_protocol", "as_treated", "treatment_on_treated"}:
        caveats.append("Per-protocol, as-treated, or treatment-on-treated targets are not protected by assignment without extra assumptions.")

    if compliance in {"partial", "poor"} and estimand == "itt":
        caveats.append("Report ITT as assignment effect; do not interpret it as effect of treatment receipt.")
    if compliance in {"partial", "poor"} and estimand in {"cace_late", "treatment_on_treated"}:
        activate.append("12-instrumental-variables")

    if spec.get("has_pre_period_outcome"):
        if language in {"r", "either", "unknown"}:
            software.append(_software("estimatr with ANCOVA/CUPED logic", "R", "Use pre-period outcomes for precision adjustment."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("statsmodels + CUPED template", "Python", "Use pre-period outcomes for variance reduction in online experiments."))
    elif spec.get("has_pre_treatment_covariates"):
        diagnostics.append("Consider covariate adjustment for precision, using only pre-assignment variables.")

    if isinstance(n, int) and n < 100:
        if language in {"r", "either", "unknown"}:
            software.append(_software("ri2", "R", "Use randomization inference for small samples when assignment is known."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("scipy.stats.permutation_test", "Python", "Use a transparent permutation-style test for simple assignments."))

    if not software:
        software.append(_software("design-aware difference in means", "R or Python", "Use as a conservative first pass once assignment is clarified."))

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if attrition == "severe" or missing == "severe" or srm == "failed":
        readiness = "diagnostics_needed"
    if mechanism == "unknown" and spec.get("has_assignment_log") is False:
        readiness = "blocked"

    top_choice = "Design-aware ITT analysis with assignment-integrity diagnostics"
    if mechanism == "encouragement" or estimand == "cace_late":
        top_choice = "ITT first, then CACE/LATE only if IV assumptions are defensible"
    elif mechanism == "cluster_randomized":
        top_choice = "Cluster-aware ITT with cluster-level and cluster-robust diagnostics"
    elif spec.get("online_experiment"):
        top_choice = "Online experiment ITT with SRM, triggering, and CUPED/ANCOVA precision checks"

    next_action = "confirm_analysis_plan" if readiness == "plan_ready" else "clarify_specification"
    if readiness == "diagnostics_needed":
        next_action = "run_diagnostics"
    if readiness == "blocked":
        next_action = "ask_user"

    return {
        "readiness": readiness,
        "top_choice": top_choice,
        "analysis_lane": analysis_lane,
        "software_options": software[:7],
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
