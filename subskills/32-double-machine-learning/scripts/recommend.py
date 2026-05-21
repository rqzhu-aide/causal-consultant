#!/usr/bin/env python3
"""Rule based recommender for double machine learning support.

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
        "Verify all features are valid pre-treatment or correctly time-ordered variables.",
        "Create a cross-fitting plan with tuning performed inside training folds.",
        "Check propensity/support and treatment prevalence before flexible modeling.",
        "Compare DML estimates with simpler regression, weighting, or DR benchmarks.",
        "Run learner and repeated-split sensitivity checks.",
    ]
    if spec.get("clustered_or_grouped"):
        diagnostics.append("Use grouped folds and cluster-aware uncertainty when observations are dependent.")
    if spec.get("needs_inference"):
        diagnostics.append("Confirm the chosen package/score supports valid standard errors for the target.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    return [
        f"DML target model: {spec.get('target_model', 'unknown')}; estimand: {spec.get('estimand', 'unknown')}.",
        "Report design route, feature timing, learner library, fold plan, tuning plan, and inference method.",
        "Include nuisance diagnostics, support checks, repeated-split sensitivity, and simple-model benchmarks.",
        "State that DML supports estimation under the causal assumptions; it does not create identification.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    design = spec.get("design_route", "unknown")
    target_model = spec.get("target_model", "unknown")
    estimand = spec.get("estimand", "unknown")
    treatment = spec.get("treatment_type", "unknown")
    outcome = spec.get("outcome_type", "unknown")
    features = spec.get("feature_status", "unknown")
    positivity = spec.get("positivity_status", "unknown")
    language = spec.get("language", "unknown")
    high_dim = spec.get("high_dimensional")
    n = spec.get("sample_size")
    p = spec.get("n_features")

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if features == "contains_post_treatment":
        return {
            "readiness": "blocked",
            "top_choice": "Remove post-treatment leakage before DML",
            "analysis_lane": "invalid feature timing",
            "software_options": [],
            "required_clarifications": ["Ask data_analyst and method_lead to revise the feature set."],
            "diagnostics": diagnostics,
            "caveats": ["DML cannot protect against post-treatment leakage or invalid adjustment variables."],
            "activate_other_subskills": [],
            "report_support": _common_report(spec),
            "recommended_next_action": "clarify_specification",
        }

    if design == "unknown":
        clarifications.append("Clarify the design route and identification assumptions before DML.")
    if target_model == "unknown":
        clarifications.append("Choose PLR, IRM, PLIV/IIVM, CATE forest, R/DR learner, or nuisance-only support.")
    if estimand == "unknown":
        clarifications.append("Define the estimand and whether valid inference is required.")
    if features in {"mixed_or_unclear", "unknown"}:
        clarifications.append("Audit feature timing and leakage before fitting ML nuisance models.")

    if positivity == "poor":
        caveats.append("Poor support blocks credible DML estimation for the requested target.")
    elif positivity == "limited":
        caveats.append("Limited support requires overlap diagnostics and sensitivity to trimming/restricted targets.")
    elif positivity == "unknown":
        clarifications.append("Ask for propensity/support diagnostics before DML reporting.")

    if treatment == "instrumented" or target_model in {"pliv", "iivm"} or design == "instrumental_variable":
        activate.append("12-instrumental-variables")
        analysis_lane = "IV double machine learning"
        if language in {"python", "either", "unknown"}:
            software.append(_software("DoubleML PLIV/IIVM", "Python/R", "Use for orthogonal IV scores with high-dimensional controls."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("EconML DMLIV/OrthoIV", "Python", "Use for IV-style orthogonal ML when IV assumptions are validated."))
    elif target_model == "plr" or treatment == "continuous":
        analysis_lane = "partially linear DML"
        if language in {"python", "either", "unknown"}:
            software.append(_software("DoubleML PLR", "Python/R", "Use for scalar partially linear effects with cross-fitted nuisance models."))
            software.append(_software("EconML LinearDML", "Python", "Use for partially linear DML with sklearn nuisance learners."))
        if language in {"r", "either", "unknown"}:
            software.append(_software("DoubleML PLR", "R", "Use R/mlr3 learners for PLR DML."))
    elif target_model == "irm" or treatment == "binary":
        analysis_lane = "interactive regression DML"
        if language in {"python", "either", "unknown"}:
            software.append(_software("DoubleML IRM", "Python/R", "Use for binary-treatment ATE/ATT-style orthogonal scores."))
            software.append(_software("EconML DRLearner", "Python", "Use for cross-fitted DR-style nuisance learning."))
        if language in {"r", "either", "unknown"}:
            software.append(_software("DoubleML IRM", "R", "Use for binary treatment DML with mlr3 learners."))
    elif target_model in {"cate_forest", "r_learner", "dr_learner"} or spec.get("heterogeneity_target"):
        analysis_lane = "orthogonal heterogeneity estimation"
        activate.append("20-heterogeneous-effects")
        if language in {"r", "either", "unknown"}:
            software.append(_software("grf", "R", "Use causal forests, BLP, and CATE diagnostics."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("EconML CausalForestDML", "Python", "Use orthogonal forest-style CATE estimation."))
    elif target_model == "nuisance_plugin":
        analysis_lane = "ML nuisance plugin support"
        activate.append("31-doubly-robust-estimation")
        software.append(_software("scikit-learn/mlr3/sl3 learners", "R or Python", "Use as nuisance plugins inside AIPW/TMLE/DML workflows."))
    else:
        analysis_lane = "DML design clarification"

    if design == "longitudinal" or treatment == "time_varying":
        activate.append("09-longitudinal-gmethods")
        caveats.append("Longitudinal DML requires 09 to validate histories and sequential assumptions.")
    if design == "survival" or outcome == "survival_time":
        activate.append("33-survival-competing-risks")
        caveats.append("Survival DML requires censoring and outcome-scale support.")
    if spec.get("policy_target"):
        activate.append("21-point-treatment-rules")
        caveats.append("Policy use needs held-out or cross-fitted policy-value evaluation.")

    if high_dim:
        if language in {"r", "either", "unknown"}:
            software.append(_software("hdm", "R", "Use post-double-selection when sparse linear controls are plausible."))
        caveats.append("High-dimensional controls require careful regularization, leakage checks, and fold stability.")

    if isinstance(n, int) and isinstance(p, int) and p > 0 and n < 10 * p:
        caveats.append("Sample size is small relative to feature count; restrict learners or simplify target.")
    if spec.get("needs_inference") and target_model in {"r_learner", "nuisance_plugin"}:
        caveats.append("Inference may not be valid for the selected learner/target without additional structure.")

    if not software:
        software.append(_software("DML checklist before package choice", "R or Python", "Clarify target model, features, folds, and support before fitting."))

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if positivity == "poor":
        readiness = "diagnostics_needed"
    if features == "contains_post_treatment":
        readiness = "blocked"

    top_choice = "Orthogonal ML with cross-fitting and learner sensitivity diagnostics"
    if target_model == "plr":
        top_choice = "PLR DML for a low-dimensional partially linear target"
    elif target_model == "irm":
        top_choice = "IRM DML for binary-treatment ATE/ATT-style target"
    elif target_model in {"cate_forest", "r_learner", "dr_learner"}:
        top_choice = "Orthogonal CATE estimation with heterogeneity module support"
    elif positivity == "poor":
        top_choice = "Do not use DML until support/positivity problem is addressed"

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
