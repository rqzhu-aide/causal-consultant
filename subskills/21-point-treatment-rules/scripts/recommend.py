#!/usr/bin/env python3
"""Rule based recommender for one-time treatment/policy rules.

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
        "Confirm all rule features are measured before treatment/action.",
        "Compare against treat-all, treat-none, current practice, or a simple prespecified rule.",
        "Estimate policy value on held-out, cross-fitted, or externally validated data.",
        "Check support/overlap in the regions where the rule assigns each action.",
        "Assess stability across folds, seeds, learner classes, and simpler rule classes.",
    ]
    if spec.get("has_budget_or_capacity_constraint"):
        diagnostics.append("Report value across the requested budget/capacity range, not only one cutoff.")
    if spec.get("has_cost_or_harm_model") is False:
        diagnostics.append("Clarify costs, harms, or utility weights before calling the rule optimal.")
    if spec.get("high_stakes"):
        diagnostics.append("Add subgroup harm, fairness, calibration, and external/prospective validation checks.")
    if spec.get("has_holdout_or_crossfit_plan") is False:
        diagnostics.append("Create a split-sample or cross-fitting plan before reporting policy value.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    target = spec.get("target", "unknown")
    return [
        f"Policy target: {target}.",
        "Report action set, eligible population, information available at decision time, and value function.",
        "State whether the rule is exploratory, candidate, cross-fitted, externally validated, or deployment-ready.",
        "Include code/table/figure paths for rule learning, policy-value estimates, and diagnostics.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    timing = spec.get("decision_timing", "unknown")
    action_type = spec.get("action_type", "unknown")
    target = spec.get("target", "unknown")
    design = spec.get("design_route", "unknown")
    data_source = spec.get("data_source", "unknown")
    outcome = spec.get("outcome_type", "unknown")
    overlap = spec.get("overlap_status", "unknown")
    language = spec.get("language", "unknown")
    interpretability = spec.get("need_interpretability", "unknown")
    n = spec.get("n_samples")
    p = spec.get("n_features")

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if timing == "repeated":
        return {
            "readiness": "blocked",
            "top_choice": "Route to dynamic treatment policy workflow",
            "analysis_lane": "not a single-point decision",
            "software_options": [
                _software("DynTxRegime", "R", "Use for dynamic treatment regimes, Q-learning, weighted learning, and value-search methods."),
                _software("polle", "R", "Use for finite-stage policy learning and evaluation."),
            ],
            "required_clarifications": ["Ask whether the user wants repeated adaptive decisions or a single baseline rule."],
            "diagnostics": diagnostics,
            "caveats": ["This point-treatment-rule module should not handle sequential adaptive decisions by itself."],
            "activate_other_subskills": ["25-dynamic-treatment-policies", "09-longitudinal-gmethods"],
            "report_support": _common_report(spec),
            "recommended_next_action": "activate_specialist",
        }

    if action_type == "continuous_or_dose":
        return {
            "readiness": "candidate_only",
            "top_choice": "Clarify whether this is dose-response or a discrete policy rule",
            "analysis_lane": "dose or modified treatment policy",
            "software_options": [
                _software("tmle3mopttx", "R", "Use only if the continuous/dose problem can be reframed as categorical or realistic treatment rules."),
            ],
            "required_clarifications": ["Define whether actions are truly continuous doses, ordinal levels, or discrete options."],
            "diagnostics": diagnostics,
            "caveats": ["Continuous treatment intensity is usually a dose-response target before it becomes a point rule."],
            "activate_other_subskills": ["23-dose-response-effects"],
            "report_support": _common_report(spec),
            "recommended_next_action": "clarify_specification",
        }

    if target == "unknown":
        clarifications.append("Ask whether the user wants a deployable rule, ranking, existing-rule evaluation, or budgeted allocation.")
    if action_type == "unknown":
        clarifications.append("Define the action set and whether it is binary or multi-action.")
    if design == "unknown":
        clarifications.append("Clarify which design route can identify or evaluate policy value.")
    if outcome == "unknown":
        clarifications.append("Define the outcome/value scale and whether higher values are better.")

    if overlap == "poor":
        caveats.append("Poor overlap blocks reliable rule learning in unsupported covariate regions.")
    elif overlap == "limited":
        caveats.append("Limited overlap means the learned rule should be constrained to supported regions and stress-tested.")
    elif overlap == "unknown":
        clarifications.append("Ask data_analyst for action support and overlap summaries.")

    if design == "observational_unconfounded":
        activate.extend(["08-single-time-observational-exposure", "30-matching-weighting-balance"])
        if spec.get("known_propensity") is not True and spec.get("estimated_propensity_available") is not True:
            clarifications.append("Estimate or define treatment propensities before DR policy learning.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("policytree + grf", "R", "Use causal forest or other DR scores, then learn an interpretable policy tree."))
            software.append(_software("tmle3mopttx", "R", "Use when targeted learning and realistic/resource-constrained optimal rules are desired."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("econml.policy.DRPolicyTree", "Python", "Use for DR policy trees with sklearn-compatible nuisance models."))
        activate.extend(["31-doubly-robust-estimation", "32-double-machine-learning"])
    elif design == "randomized" or data_source == "randomized_trial":
        if target == "existing_rule_evaluation":
            software.append(_software("evalITR", "R", "Use for PAPE, PAPEp, PAPDp, and AUPEC under randomized data."))
        if language in {"r", "either", "unknown"}:
            software.append(_software("policytree", "R", "Use for interpretable policy trees from reward scores."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("econml.policy.DRPolicyTree", "Python", "Use for a direct Python policy-tree workflow."))
            software.append(_software("scikit-uplift", "Python", "Use for fast uplift ranking baselines and Qini/AUUC diagnostics."))
    elif design == "instrumental_variable":
        activate.append("12-instrumental-variables")
        caveats.append("Policy targets under IV usually apply to complier or instrument-induced effects, not ordinary treatment assignment without extra assumptions.")
    elif design == "regression_discontinuity":
        activate.append("11-regression-discontinuity")
        caveats.append("A rule learned from RD evidence may only be credible near the cutoff unless additional structure is justified.")
    elif design == "longitudinal":
        activate.extend(["09-longitudinal-gmethods", "25-dynamic-treatment-policies"])
        caveats.append("Longitudinal design often implies dynamic policy, not a single baseline rule.")

    if outcome == "survival_time":
        activate.append("33-survival-competing-risks")
        if language in {"r", "either", "unknown"}:
            software.append(_software("DynTxRegime", "R", "Use for optimal treatment regime workflows that include weighted/value-search methods."))
            software.append(_software("tmle3mopttx", "R", "Use for targeted-learning optimal-rule approaches when the outcome setup fits."))

    if target in {"ranking", "budgeted_allocation"}:
        if spec.get("has_budget_or_capacity_constraint") is not True:
            clarifications.append("Define the budget, capacity, or cutoff rule before treating a ranking as an allocation policy.")
        if language in {"python", "either", "unknown"}:
            software.append(_software("causalml", "Python", "Use for CATE/uplift targeting, campaign optimization, and practical uplift diagnostics."))
            software.append(_software("scikit-uplift", "Python", "Use for fast sklearn-style uplift baselines and Qini/AUUC metrics."))

    if target == "subgroup_rule":
        activate.append("20-heterogeneous-effects")
        if language in {"r", "either", "unknown"}:
            software.append(_software("personalized", "R", "Use for clinical/subgroup benefit scores and personalized medicine style validation."))

    if interpretability == "high" or spec.get("high_stakes"):
        software.insert(0, _software("policytree / shallow score rule", "R or Python", "Use when transparency, governance, or stakeholder trust matters."))
        caveats.append("Prefer a simpler rule if it performs similarly to a black-box policy.")

    if isinstance(n, int) and isinstance(p, int) and n < 20 * max(p, 1):
        caveats.append("Sample size is small relative to feature count; restrict the rule class or reduce features before policy learning.")

    if not software:
        software.append(_software("simple prespecified rule or policytree", "R or Python", "Use as a conservative starting point after the decision target is clarified."))

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if overlap == "poor":
        readiness = "blocked"

    top_choice = "Doubly robust interpretable policy learning with held-out or cross-fitted evaluation"
    analysis_lane = "single-point policy learning"
    if target == "existing_rule_evaluation":
        top_choice = "Evaluate the existing rule before learning a new one"
        analysis_lane = "policy evaluation"
    elif target == "ranking":
        top_choice = "Causal uplift or value ranking with explicit cutoff and validation"
        analysis_lane = "ranking and prioritization"
    elif target == "budgeted_allocation":
        top_choice = "Budgeted allocation rule with policy-value curve"
        analysis_lane = "budget-constrained policy learning"

    next_action = "confirm_analysis_plan" if readiness == "plan_ready" else "clarify_specification"
    if readiness == "blocked":
        next_action = "ask_user"

    return {
        "readiness": readiness,
        "top_choice": top_choice,
        "analysis_lane": analysis_lane,
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
