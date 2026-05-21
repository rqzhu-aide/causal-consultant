#!/usr/bin/env python3
"""Rule based recommender for survival and competing-risk support.

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
        "Verify time zero, eligibility, event definition, censoring definition, and follow-up horizon.",
        "Prepare event, censoring, competing-event, and at-risk counts by group over time.",
        "Check whether the chosen scale is risk, survival probability, RMST, CIF, hazard, CATE, or nuisance prediction.",
        "Document independent-censoring assumptions and censoring-model diagnostics if weighting/DR methods are used.",
        "Compare primary survival results with a simple descriptive Kaplan-Meier or Aalen-Johansen summary when applicable.",
    ]
    if spec.get("fixed_horizon_defined") is False:
        diagnostics.append("Choose a clinically/scientifically meaningful fixed horizon or RMST tau before report-ready estimation.")
    if spec.get("needs_prediction"):
        diagnostics.append("For prediction or nuisance models, report calibration, Brier score, C-index, and time-dependent AUC if feasible.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    return [
        f"Survival target scale: {spec.get('target_scale', 'unknown')}.",
        "Report time zero, event of interest, censoring, competing events, follow-up horizon, and target population.",
        "Include event/censoring counts, curves or risk tables, estimator/model details, diagnostics, and sensitivity checks.",
        "State when survival models are used as nuisance or prediction tools rather than direct causal estimators.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    design = spec.get("design_route", "unknown")
    goal = spec.get("target_goal", "unknown")
    structure = spec.get("outcome_structure", "unknown")
    scale = spec.get("target_scale", "unknown")
    timing = spec.get("treatment_timing", "unknown")
    censoring = spec.get("censoring_status", "unknown")
    competing = spec.get("competing_risks")
    left_truncation = spec.get("left_truncation")
    recurrent = spec.get("recurrent_events")
    ph_plausible = spec.get("proportional_hazards_plausible")
    horizon = spec.get("fixed_horizon_defined")
    language = spec.get("language", "unknown")
    n = spec.get("sample_size")
    events = spec.get("n_events")
    needs_cate = bool(spec.get("needs_cate"))
    needs_prediction = bool(spec.get("needs_prediction"))
    high_dimensional = bool(spec.get("high_dimensional"))

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if design == "unknown":
        clarifications.append("Clarify the causal design route before treating survival output as causal.")
    if goal == "unknown" and scale == "unknown":
        clarifications.append("Clarify whether the target is fixed-time risk, survival probability, RMST, CIF, hazard, CATE, policy value, or nuisance prediction.")
    if timing in {"time_varying", "post_baseline"}:
        activate.append("09-longitudinal-gmethods")
        caveats.append("Treatment timing may create immortal time or time-varying confounding; route through longitudinal support before final estimation.")
    if left_truncation:
        caveats.append("Delayed entry/left truncation must be represented in the survival data structure and model.")
    if recurrent:
        caveats.append("Recurrent events need a recurrent-event or multi-state plan; do not reduce to first event without justification.")
    if horizon is False and scale in {"risk_at_horizon", "survival_probability", "rmst", "cif", "survival_cate", "survival_policy_value"}:
        clarifications.append("Choose and justify a target horizon or RMST tau.")

    if censoring in {"informative", "heavy"}:
        diagnostics.append("Fit or inspect censoring models and IPCW weights; run truncation sensitivity.")
        activate.append("31-doubly-robust-estimation")
        caveats.append("Informative or heavy censoring needs measured predictors and sensitivity limits.")
    elif censoring in {"unclear", "unknown"}:
        clarifications.append("Clarify censoring mechanism and follow-up completeness.")

    if competing is True or structure == "competing_risk" or scale in {"cif", "subdistribution_hazard", "cause_specific_hazard"}:
        target_lane = "competing-risk survival support"
        diagnostics.append("Use CIF/Aalen-Johansen summaries and check whether cause-specific or subdistribution summaries match the question.")
        if needs_cate or goal == "cate" or scale == "survival_cate":
            activate.append("20-heterogeneous-effects")
            activate.append("32-double-machine-learning")
            caveats.append("Competing-risk CATE needs an explicit CIF or other competing-risk target, not an ordinary survival CATE by default.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("cmprsk", "R", "Use for CIF estimation and Fine-Gray subdistribution hazard models."))
            software.append(_software("riskRegression", "R", "Use for absolute risk prediction, competing-risk model evaluation, and reportable CIF workflows."))
            software.append(_software("prodlim", "R", "Use for Aalen-Johansen/KM support and survival prediction infrastructure."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("lifelines AalenJohansenFitter", "Python", "Use for exploratory cumulative incidence curves in competing-risk data."))
        if scale == "hazard_ratio":
            caveats.append("A single hazard-ratio target is usually not enough for competing-risk absolute risk questions.")
    elif needs_cate or scale == "survival_cate" or goal == "cate":
        target_lane = "survival CATE support"
        activate.append("20-heterogeneous-effects")
        activate.append("32-double-machine-learning")
        if language in {"r", "either", "unknown"}:
            software.append(_software("grf causal_survival_forest", "R", "Use for survival CATE when censoring, support, and event counts are adequate."))
            software.append(_software("randomForestSRC", "R", "Use for survival/competing-risk forest prediction or nuisance support."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("scikit-survival RandomSurvivalForest", "Python", "Use for survival forest prediction or nuisance support; wrap carefully for causal use."))
        if scale in {"rmst", "survival_probability", "risk_at_horizon"}:
            diagnostics.append(f"Define CATE on the {scale} scale and keep horizon/tau support explicit.")
        elif scale == "unknown":
            clarifications.append("Define whether survival CATE is on RMST, fixed-time survival, fixed-time risk, or another scale.")
    elif scale == "rmst" or goal == "rmst":
        target_lane = "RMST survival effect support"
        if language in {"r", "either", "unknown"}:
            software.append(_software("survRM2", "R", "Use for RMST contrasts at a pre-specified tau."))
            software.append(_software("adjustedCurves", "R", "Use for adjusted survival/RMST-style curve workflows when adjustment is needed."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("lifelines + custom RMST integration", "Python", "Use for transparent RMST prototypes from survival curves."))
        if ph_plausible is False:
            diagnostics.append("Report RMST as the primary scale and keep hazard ratios secondary or omitted.")
    elif scale in {"risk_at_horizon", "survival_probability"} or goal == "fixed_time_risk":
        target_lane = "fixed-time risk or survival probability support"
        if language in {"r", "either", "unknown"}:
            software.append(_software("adjustedCurves", "R", "Use for adjusted survival curves and fixed-time contrasts."))
            software.append(_software("riskRegression", "R", "Use for absolute risk prediction and fixed-time error diagnostics."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("lifelines", "Python", "Use for Kaplan-Meier, Cox/AFT models, and exploratory adjusted predictions."))
            software.append(_software("scikit-survival", "Python", "Use for survival prediction or nuisance models with sklearn-style pipelines."))
    elif scale in {"hazard_ratio", "cause_specific_hazard", "subdistribution_hazard"}:
        target_lane = "hazard-model survival support"
        if language in {"r", "either", "unknown"}:
            software.append(_software("survival", "R", "Use for Cox/AFT models, weighted Cox, counting-process data, and PH diagnostics."))
            software.append(_software("timereg", "R", "Use for flexible time-varying coefficient or additive hazard checks."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("lifelines", "Python", "Use for Cox/AFT models and PH diagnostics."))
            software.append(_software("statsmodels PHReg", "Python", "Use for proportional hazards regression in statsmodels workflows."))
        if ph_plausible is False:
            caveats.append("Proportional hazards looks doubtful; consider RMST or fixed-time risk as primary scale.")
    elif needs_prediction or scale == "prediction_nuisance" or goal == "prediction_nuisance":
        target_lane = "survival prediction or nuisance-model support"
        activate.append("32-double-machine-learning")
        if language in {"r", "either", "unknown"}:
            software.append(_software("survival or glmnet", "R", "Use Cox/AFT or penalized Cox as interpretable nuisance baselines."))
            software.append(_software("randomForestSRC or ranger", "R", "Use for flexible survival forest prediction/nuisance models."))
            software.append(_software("pec", "R", "Use for Brier score, C-index, and prediction error curves."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("scikit-survival", "Python", "Use for Coxnet, survival forests, boosting, and survival prediction metrics."))
            software.append(_software("pycox", "Python", "Use neural survival models for high-dimensional prediction/nuisance exploration."))
            software.append(_software("xgbse", "Python", "Use XGBoost survival predictions when boosted risk curves are useful."))
    else:
        target_lane = "general survival outcome support"
        if language in {"r", "either", "unknown"}:
            software.append(_software("survival", "R", "Use for KM, Cox, AFT, delayed-entry, and counting-process survival baselines."))
            software.append(_software("adjustedCurves", "R", "Use for adjusted survival and competing-risk curves after target clarification."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("lifelines", "Python", "Use for exploratory survival curves, Cox/AFT models, and diagnostics."))

    if high_dimensional:
        activate.append("32-double-machine-learning")
        caveats.append("High-dimensional survival work should separate prediction/nuisance value from causal identification.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("glmnet Cox", "R", "Use as a penalized Cox nuisance or prediction baseline."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("scikit-survival CoxnetSurvivalAnalysis", "Python", "Use as a penalized Cox prediction/nuisance baseline."))

    if design in {"single_time_observational", "randomized"} and scale not in {"prediction_nuisance", "unknown"}:
        activate.append("30-matching-weighting-balance" if design == "single_time_observational" else "07-randomized-assignment-and-experiments")
    if design == "transportability":
        activate.append("24-transportability-generalizability")
    if goal == "policy_value" or scale == "survival_policy_value":
        activate.append("21-point-treatment-rules")

    if isinstance(events, int) and events < 50 and not needs_prediction:
        caveats.append("Event count is sparse; prefer simple scales/models and avoid overfit heterogeneity claims.")
    if isinstance(n, int) and isinstance(events, int) and n > 0 and events / max(n, 1) < 0.03:
        caveats.append("Rare events may make flexible survival models unstable without strong regularization or pooling.")

    if not software:
        software.append(_software("survival target checklist", "R or Python", "Clarify target scale and data support before choosing software."))

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if censoring in {"informative", "heavy"} or ph_plausible is False:
        readiness = "diagnostics_needed"
    if timing in {"post_baseline", "time_varying"} and design not in {"longitudinal", "unknown"}:
        readiness = "diagnostics_needed"
    if design == "unknown" and goal == "unknown" and scale == "unknown":
        readiness = "blocked"

    if readiness == "plan_ready":
        next_action = "confirm_analysis_plan"
    elif readiness == "diagnostics_needed":
        next_action = "run_diagnostics"
    elif readiness == "blocked":
        next_action = "ask_user"
    else:
        next_action = "clarify_specification"

    top_choice = "Specify fixed-time risk, survival probability, RMST, CIF, hazard, CATE, or nuisance target before software choice"
    if target_lane.startswith("RMST"):
        top_choice = "Use RMST contrast at a justified tau, with censoring/support diagnostics"
    elif target_lane.startswith("competing"):
        top_choice = "Use CIF/Aalen-Johansen or competing-risk regression aligned to the target question"
    elif "CATE" in target_lane:
        top_choice = "Use survival CATE tools only after heterogeneity target, censoring, support, and event counts are validated"
    elif "prediction" in target_lane:
        top_choice = "Use survival models as prediction or nuisance plugins with calibration and error diagnostics"
    elif "fixed-time" in target_lane:
        top_choice = "Use adjusted fixed-time risk or survival probability contrasts at a supported horizon"
    elif "hazard" in target_lane:
        top_choice = "Use hazard models only with PH/time-varying-effect diagnostics and careful causal wording"

    return {
        "readiness": readiness,
        "target_lane": target_lane,
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
