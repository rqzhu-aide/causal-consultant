#!/usr/bin/env python3
"""Rule based recommender for mediation targets.

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
        "Confirm exposure precedes mediator and mediator precedes outcome.",
        "Map exposure-outcome, exposure-mediator, and mediator-outcome confounders with timing.",
        "Check mediator missingness, measurement quality, positivity, and support.",
        "Assess exposure-mediator interaction and outcome-scale interpretation.",
        "Record sensitivity analysis needs for unmeasured mediator-outcome confounding.",
    ]
    if spec.get("need_sensitivity_analysis"):
        diagnostics.append("Plan formal sensitivity analysis or clearly state why it is deferred.")
    if spec.get("high_stakes"):
        diagnostics.append("Add domain review of mediator intervention meaning and harm/ethics implications.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    return [
        f"Mediation target: {spec.get('target', 'unknown')}.",
        "Report exposure, mediator, outcome, covariate timing, and pathway definition.",
        "State the estimand, assumptions, sensitivity checks, and whether interpretation is causal or descriptive.",
        "Include code/table/figure paths for mediation models, sensitivity analysis, and diagnostics.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    target = spec.get("target", "unknown")
    design = spec.get("design_route", "unknown")
    exposure_type = spec.get("exposure_type", "unknown")
    mediator_type = spec.get("mediator_type", "unknown")
    outcome_type = spec.get("outcome_type", "unknown")
    mediator_count = spec.get("mediator_count", "unknown")
    language = spec.get("language", "unknown")
    exp_before_med = spec.get("exposure_precedes_mediator")
    med_before_out = spec.get("mediator_precedes_outcome")
    intervention_meaning = spec.get("mediator_intervention_meaningful", "unknown")
    mo_conf = spec.get("mediator_outcome_confounding_status", "unknown")
    exposure_induced = spec.get("has_exposure_induced_mediator_outcome_confounder", "unknown")

    diagnostics = _base_diagnostics(spec)
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if exp_before_med is False or med_before_out is False:
        return {
            "readiness": "blocked",
            "top_choice": "Do not run causal mediation until timing is corrected or reframed",
            "analysis_lane": "timing blocked",
            "software_options": [],
            "required_clarifications": ["Clarify the temporal order of exposure, mediator, and outcome."],
            "diagnostics": diagnostics,
            "caveats": ["Wrong or unsupported timing blocks causal mediation; consider descriptive pathway wording only."],
            "activate_other_subskills": [],
            "report_support": _common_report(spec),
            "recommended_next_action": "ask_user",
        }

    if target == "unknown":
        clarifications.append("Clarify whether the target is CDE, natural effects, interventional effects, separable effects, path-specific effects, or descriptive pathway analysis.")
    if exp_before_med is None:
        clarifications.append("Confirm exposure precedes mediator.")
    if med_before_out is None:
        clarifications.append("Confirm mediator precedes outcome.")
    if mo_conf in {"unknown", "partially_measured"}:
        clarifications.append("Clarify mediator-outcome confounders and whether they are measured before the mediator.")
    if intervention_meaning in {"unknown", "unclear"} and target not in {"descriptive_pathway", "unknown"}:
        clarifications.append("Clarify whether intervention on the mediator or mediator distribution is meaningful.")

    if mo_conf == "unmeasured":
        caveats.append("Unmeasured mediator-outcome confounding blocks strong natural-effect claims without sensitivity or alternative estimands.")
    if exposure_induced in {"yes", "possible"}:
        caveats.append("Exposure-induced mediator-outcome confounding makes ordinary natural effects fragile; consider interventional, separable, or g-method targets.")
    if intervention_meaning == "no" and target not in {"descriptive_pathway", "separable_effect"}:
        caveats.append("If mediator intervention is not meaningful, natural/controlled effect language may be scientifically misleading.")

    if design == "observational_unconfounded":
        activate.append("08-single-time-observational-exposure")
        activate.extend(["31-doubly-robust-estimation", "32-double-machine-learning"])
    elif design == "longitudinal" or exposure_type == "time_varying" or mediator_type == "time_varying":
        activate.append("09-longitudinal-gmethods")
        caveats.append("Time-varying exposure/mediator structures may require longitudinal g-methods rather than simple mediation.")
    elif design == "instrumental_variable":
        activate.append("12-instrumental-variables")
        caveats.append("IV mediation requires extra structure; ordinary direct/indirect effects do not follow from IV identification alone.")
    elif design == "regression_discontinuity":
        activate.append("11-regression-discontinuity")
        caveats.append("RD mediation is usually local to the cutoff and needs extra assumptions.")
    elif design == "difference_in_differences":
        activate.append("10-did-event-study")
        caveats.append("DiD mediation needs careful timing and mediator trend assumptions.")

    if outcome_type == "survival_time":
        activate.append("33-survival-competing-risks")
        caveats.append("Survival mediation needs time-scale and censoring-aware methods.")

    if target == "descriptive_pathway":
        software.append(_software("regression or SEM/path model", "R or Python", "Use only for descriptive pathway summaries when causal assumptions are not met."))
    elif target == "controlled_direct":
        if language in {"r", "either", "unknown"}:
            software.append(_software("regmedint", "R", "Use for regression-based controlled direct effects and interaction-aware closed-form mediation."))
            software.append(_software("CMAverse", "R", "Use for DAG-supported workflows and sensitivity analysis."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("custom g-computation / statsmodels", "Python", "Use for simple controlled direct effect templates with explicit assumptions."))
    elif target == "natural_direct_indirect":
        if exposure_induced in {"yes", "possible"}:
            clarifications.append("Natural effects may be inappropriate; ask method_lead whether to switch to interventional or separable effects.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("mediation", "R", "Use for standard single-mediator natural effects and sensitivity analysis."))
            software.append(_software("regmedint", "R", "Use for closed-form natural effects with common outcome/mediator models and interactions."))
            software.append(_software("medflex", "R", "Use for natural effect models and expanded-data workflows."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("statsmodels Mediation", "Python", "Use for simple model-based mediation when R is unavailable."))
    elif target == "interventional_direct_indirect":
        if language in {"r", "either", "unknown"}:
            software.append(_software("CMAverse", "R", "Use for broad mediation workflows including interventional-style targets and sensitivity support."))
            software.append(_software("intmed", "R", "Use for interventional direct/indirect effects with multiple mediators when its assumptions fit."))
        software.append(_software("custom g-computation", "R or Python", "Use when package defaults do not match mediator ordering or intervention definition."))
    elif target == "separable_effect":
        software.append(_software("custom g-method / survival-aware workflow", "R or Python", "Use when the exposure can be meaningfully decomposed into components."))
        caveats.append("Separable effects require a scientifically meaningful exposure decomposition and isolation assumptions.")
    elif target == "path_specific":
        software.append(_software("DoWhy / graph identification support", "Python", "Use to check graph-based path-specific identification before estimation."))
        software.append(_software("custom g-computation", "R or Python", "Use after path-specific identification is established."))

    if mediator_count in {"multiple_ordered", "multiple_unordered", "high_dimensional"}:
        if target == "natural_direct_indirect":
            caveats.append("Multiple mediators make natural-effect decomposition more assumption-heavy; consider interventional effects.")
        if language in {"r", "either", "unknown"}:
            software.append(_software("CMAverse", "R", "Use for multiple mediator workflows and sensitivity routines when the target matches."))
        activate.append("03-method-lead")

    if not software:
        software.append(_software("timing/confounding precheck first", "R or Python", "Choose software only after the mediation estimand is clarified."))

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if mo_conf == "unmeasured" and target in {"natural_direct_indirect", "path_specific"}:
        readiness = "blocked"
    if intervention_meaning == "no" and target in {"controlled_direct", "natural_direct_indirect"}:
        readiness = "candidate_only"

    if target == "natural_direct_indirect":
        top_choice = "Natural direct/indirect effect workflow with sensitivity analysis"
        lane = "natural effects"
    elif target == "interventional_direct_indirect":
        top_choice = "Interventional direct/indirect effect workflow"
        lane = "interventional mediation"
    elif target == "controlled_direct":
        top_choice = "Controlled direct effect with explicit mediator intervention value"
        lane = "controlled direct effect"
    elif target == "descriptive_pathway":
        top_choice = "Descriptive pathway model with no causal mediation claim"
        lane = "descriptive pathway"
    else:
        top_choice = "Clarify estimand before choosing mediation software"
        lane = "mediation target clarification"

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
