#!/usr/bin/env python3
"""Rule based recommender for heterogeneous effect targets.

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
        "Confirm candidate effect modifiers are measured before treatment/action.",
        "Check subgroup or covariate-region support, treatment variation, and overlap.",
        "Report uncertainty for subgroup/GATE estimates and use simultaneous intervals when many groups are compared.",
        "Compare flexible heterogeneity results with a simpler prespecified interaction or stratified model.",
        "Assess stability across folds, seeds, learner classes, and covariate sets.",
    ]
    if spec.get("prespecification") != "prespecified":
        diagnostics.append("Label data-adaptive heterogeneity as exploratory or hypothesis-generating unless externally validated.")
    if spec.get("has_holdout_or_crossfit_plan") is False:
        diagnostics.append("Create an honest split, holdout, or cross-fitting plan before reporting flexible CATE patterns.")
    if spec.get("high_stakes"):
        diagnostics.append("Add safety, fairness, and subgroup harm checks before recommending action from heterogeneity.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    return [
        f"Heterogeneity target: {spec.get('target', 'unknown')}.",
        "Report effect scale, modifier definitions, timing, support, and domain rationale.",
        "State whether results are prespecified, exploratory, cross-fitted, externally validated, or hypothesis-generating.",
        "Include code/table/figure paths for subgroup estimates, CATE/GATE artifacts, and diagnostics.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    target = spec.get("target", "unknown")
    design = spec.get("design_route", "unknown")
    data_source = spec.get("data_source", "unknown")
    treatment_type = spec.get("treatment_type", "unknown")
    outcome = spec.get("outcome_type", "unknown")
    timing = spec.get("modifier_timing", "unknown")
    prespec = spec.get("prespecification", "unknown")
    overlap = spec.get("overlap_status", "unknown")
    language = spec.get("language", "unknown")
    interpretability = spec.get("need_interpretability", "unknown")
    n = spec.get("n_samples")
    p = spec.get("n_features")
    k = spec.get("n_subgroups")

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if target == "policy_implication":
        return {
            "readiness": "candidate_only",
            "top_choice": "Route policy or targeting implications to point treatment rules",
            "analysis_lane": "heterogeneity-to-policy handoff",
            "software_options": [
                _software("policytree", "R", "Use after CATE/GATE evidence is converted into a decision target."),
                _software("econml.policy", "Python", "Use for policy learning after costs, constraints, and value are defined."),
            ],
            "required_clarifications": ["Ask whether the user wants heterogeneity interpretation or a treatment assignment rule."],
            "diagnostics": diagnostics,
            "caveats": ["CATE estimates alone do not define a deployment policy."],
            "activate_other_subskills": ["21-point-treatment-rules"],
            "report_support": _common_report(spec),
            "recommended_next_action": "activate_specialist",
        }

    if timing in {"post_treatment", "mixed"}:
        return {
            "readiness": "blocked",
            "top_choice": "Reframe post-treatment modifiers before heterogeneity analysis",
            "analysis_lane": "invalid or unclear modifier timing",
            "software_options": [],
            "required_clarifications": ["Clarify whether the modifier is baseline, mediator, post-treatment event, or selection variable."],
            "diagnostics": diagnostics,
            "caveats": ["Post-treatment modifiers can create collider or mediation problems if treated as ordinary effect modifiers."],
            "activate_other_subskills": ["22-mediation"],
            "report_support": _common_report(spec),
            "recommended_next_action": "clarify_specification",
        }

    if target == "unknown":
        clarifications.append("Clarify whether the target is prespecified subgroup effects, GATEs, CATEs, ITE-style predictions, or screening.")
    if timing == "unknown":
        clarifications.append("Confirm candidate modifiers are baseline or pre-treatment.")
    if design == "unknown":
        clarifications.append("Clarify the design route that identifies the underlying causal effect.")
    if outcome == "unknown":
        clarifications.append("Define the effect scale for heterogeneity reporting.")

    if overlap == "poor":
        caveats.append("Poor overlap blocks reliable subgroup or CATE claims in unsupported regions.")
    elif overlap == "limited":
        caveats.append("Limited overlap means heterogeneity should be constrained to supported regions and stress-tested.")
    elif overlap == "unknown":
        clarifications.append("Ask data_analyst for support and overlap checks by candidate modifier.")

    if design == "observational_unconfounded":
        activate.extend(["08-single-time-observational-exposure", "30-matching-weighting-balance"])
        activate.extend(["31-doubly-robust-estimation", "32-double-machine-learning"])
    elif design == "instrumental_variable":
        activate.append("12-instrumental-variables")
        caveats.append("Heterogeneity under IV is usually heterogeneity in local/complier effects unless stronger assumptions are justified.")
    elif design == "regression_discontinuity":
        activate.append("11-regression-discontinuity")
        caveats.append("RD heterogeneity may only be credible near the cutoff unless extrapolation is justified.")
    elif design == "difference_in_differences":
        activate.append("10-did-event-study")
        caveats.append("DiD heterogeneity needs subgroup-specific parallel-trend and composition checks.")
    elif design == "longitudinal" or treatment_type == "time_varying":
        activate.append("09-longitudinal-gmethods")
        caveats.append("History-dependent effect modification may require longitudinal estimands rather than baseline CATE only.")
    elif design == "synthetic_control":
        activate.append("13-synthetic-control-time-series")
        caveats.append("Synthetic-control heterogeneity is usually limited by few treated units and donor support.")

    if outcome == "survival_time":
        activate.append("33-survival-competing-risks")
        caveats.append("Time-to-event heterogeneity needs censoring-aware estimands and time-scale choices.")

    if treatment_type == "continuous_or_dose":
        activate.append("23-dose-response-effects")
        caveats.append("Continuous-treatment heterogeneity may be a dose-response surface, not binary CATE.")

    simple = target in {"prespecified_subgroup", "gate"} or interpretability == "high"
    flexible = target in {"cate", "ite_style_prediction", "effect_modifier_screening"}

    if simple:
        software.append(_software("interaction model / marginaleffects / emmeans", "R or Python", "Use for prespecified subgroup contrasts and transparent reporting."))
        if language in {"r", "either", "unknown"}:
            software.append(_software("DoubleML", "R", "Use for GATEs with orthogonal nuisance adjustment and joint inference."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("DoubleML", "Python", "Use for GATEs and group effects with orthogonal nuisance adjustment."))

    if flexible:
        if language in {"r", "either", "unknown"}:
            software.append(_software("grf", "R", "Use causal forests, calibration tests, best linear projection, and CATE/GATE summaries."))
            software.append(_software("causalTree", "R", "Use for honest, interpretable discovered subgroup partitions."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("EconML CausalForestDML / meta-learners", "Python", "Use for orthogonal forests and S/T/X/DR-style workflows with sklearn-compatible nuisance learners."))
            software.append(_software("CausalML X-/T-/S-/DR-learners", "Python", "Use for meta-learner exploration; X-learner is useful when treatment groups are imbalanced."))

    if isinstance(n, int) and isinstance(p, int) and n < 20 * max(p, 1):
        caveats.append("Sample size is small relative to feature count; prefer prespecified groups, shrinkage, or simpler models.")
    if isinstance(k, int) and isinstance(n, int) and k > 0 and n / max(k, 1) < 100:
        caveats.append("Many sparse groups make subgroup estimates unstable; consider pooling or fewer groups.")

    if not software:
        software.append(_software("prespecified subgroup estimates", "R or Python", "Use as a conservative start after modifiers and design are clarified."))

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if overlap == "poor":
        readiness = "blocked"

    if target == "gate":
        top_choice = "GATE or prespecified subgroup analysis with support and uncertainty checks"
        lane = "group average heterogeneity"
    elif target == "cate":
        top_choice = "Flexible CATE estimation with cross-fitting, calibration, and simpler-model comparison"
        lane = "conditional heterogeneity"
    elif target == "effect_modifier_screening":
        top_choice = "Exploratory modifier screening with validation and cautious wording"
        lane = "hypothesis-generating heterogeneity"
    else:
        top_choice = "Prespecified subgroup or interaction analysis before flexible discovery"
        lane = "subgroup heterogeneity"

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
