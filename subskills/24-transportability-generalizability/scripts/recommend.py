#!/usr/bin/env python3
"""Rule based recommender for transportability/generalizability targets.

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
        "Confirm source internal validity before transport or generalization.",
        "Compare source and target covariate distributions for key effect modifiers.",
        "Check source-target overlap and weight instability or extrapolation.",
        "Audit treatment, comparator, outcome, and follow-up version compatibility.",
        "Assess sensitivity to alternative effect-modifier sets and selection/standardization models.",
    ]
    if spec.get("site_context_difference") in {"moderate", "high"}:
        diagnostics.append("Ask domain_expert to review site/context implementation differences.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    return [
        f"Transport target: {spec.get('target', 'unknown')}.",
        "Report source and target populations, target estimand, and source design validity.",
        "State effect modifiers, overlap, treatment/outcome compatibility, and missing target information.",
        "Include code/table/figure paths for source-target diagnostics, weights, and transported estimates.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    target = spec.get("target", "unknown")
    source_design = spec.get("source_design", "unknown")
    source_validity = spec.get("source_validity_status", "unknown")
    target_data = spec.get("target_data", "unknown")
    modifiers = spec.get("effect_modifier_status", "unknown")
    overlap = spec.get("overlap_status", "unknown")
    treatment_match = spec.get("treatment_version_match", "unknown")
    outcome_match = spec.get("outcome_version_match", "unknown")
    language = spec.get("language", "unknown")
    multiple_sites = spec.get("has_multiple_sites")

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if source_validity == "blocked":
        return {
            "readiness": "blocked",
            "top_choice": "Resolve source internal validity before transport",
            "analysis_lane": "source validity blocked",
            "software_options": [],
            "required_clarifications": ["Clarify or repair the source design before estimating target-population effects."],
            "diagnostics": diagnostics,
            "caveats": ["Transport cannot fix bias in the source causal effect."],
            "activate_other_subskills": [],
            "report_support": _common_report(spec),
            "recommended_next_action": "ask_user",
        }

    if target == "unknown":
        clarifications.append("Clarify whether the goal is generalizability, transportability, trial-to-target, site transport, or external-validity assessment.")
    if target_data == "unknown":
        clarifications.append("Clarify what target data are available: individual covariates, aggregate margins, codebook only, or none.")
    if modifiers == "unknown":
        clarifications.append("Identify the effect modifiers needed for source-target adjustment.")
    if overlap == "unknown":
        clarifications.append("Ask data_analyst for source-target overlap diagnostics.")
    if treatment_match == "unknown" or outcome_match == "unknown":
        clarifications.append("Compare source and target treatment/outcome/follow-up versions.")

    if source_design == "randomized_trial":
        activate.append("07-randomized-assignment-and-experiments")
    elif source_design == "observational":
        activate.append("08-single-time-observational-exposure")
        caveats.append("Observational source transport also inherits the source confounding assumptions.")
    elif source_design == "multi_site":
        activate.append("20-heterogeneous-effects")
        caveats.append("Multi-site transport should inspect site heterogeneity before pooling.")
    elif source_design == "published_estimate_only":
        caveats.append("Published aggregate effects may not contain enough effect-modifier information for numeric transport.")

    if modifiers in {"missing", "partially_observed"}:
        caveats.append("Missing effect modifiers can block or weaken numeric transport.")
    if overlap == "poor":
        caveats.append("Poor source-target overlap blocks reliable reweighting or standardization for the full target.")
    elif overlap == "limited":
        caveats.append("Limited overlap may require narrowing the target population or reporting extrapolation limits.")
    if treatment_match == "major_difference" or outcome_match == "major_difference":
        caveats.append("Major treatment or outcome version differences can make numeric transport scientifically invalid.")

    if target_data == "none":
        software.append(_software("descriptive external-validity memo", "R or Python", "Use when target data are unavailable and only qualitative applicability can be assessed."))
    elif target_data == "codebook_only":
        software.append(_software("structured compatibility assessment", "R or Python", "Use when target variables are known but target distributions are unavailable."))
    elif target_data == "aggregate_margins":
        software.append(_software("post-stratification / standardization", "R or Python", "Use when aggregate target margins cover key effect modifiers."))
    elif target_data == "individual_covariates":
        if language in {"r", "either", "unknown"}:
            software.append(_software("generalize", "R", "Use for trial generalization/transport workflows when assumptions match."))
            software.append(_software("WeightIt + cobalt + survey", "R", "Use for inverse odds of sampling weights and target balance diagnostics."))
            software.append(_software("SuperLearner", "R", "Use for flexible selection/outcome nuisance models in DR transport."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("custom sklearn/statsmodels transport", "Python", "Use for inverse-odds weighting or standardization templates with explicit diagnostics."))
            software.append(_software("DoWhy", "Python", "Use for graph/assumption documentation, not as a complete transport estimator."))

    if multiple_sites:
        software.append(_software("meta-regression / hierarchical model", "R or Python", "Use when multiple comparable source sites can inform site heterogeneity."))
        activate.append("20-heterogeneous-effects")

    if not software:
        software.append(_software("source-target diagnostics first", "R or Python", "Choose estimator after target data and effect modifiers are clarified."))

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if overlap == "poor" or modifiers == "missing" or treatment_match == "major_difference" or outcome_match == "major_difference":
        readiness = "blocked" if target != "external_validity_assessment" else "candidate_only"

    if target in {"trial_to_target", "generalizability"}:
        top_choice = "Trial/source to target standardization or inverse-odds weighting"
        lane = "target-population effect"
    elif target == "site_transport":
        top_choice = "Site transport with context and overlap diagnostics"
        lane = "site transport"
    elif target == "external_validity_assessment":
        top_choice = "Descriptive external-validity assessment"
        lane = "qualitative applicability"
    else:
        top_choice = "Clarify source-target contrast and effect modifiers"
        lane = "transport target clarification"

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
