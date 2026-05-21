#!/usr/bin/env python3
"""Rule based recommender for instrumental variables and Mendelian randomization.

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
        "Verify instrument timing, treatment/exposure timing, outcome timing, and eligible sample.",
        "Report first stage, reduced form, and IV/Wald estimate separately.",
        "Review exclusion pathways and local/complier interpretation with domain_expert.",
        "Check covariate balance or as-if-randomness evidence by instrument.",
        "Plan weak-instrument diagnostics before interpreting IV estimates.",
    ]
    if spec.get("clustered"):
        diagnostics.append("Use cluster-robust inference or weak-IV diagnostics compatible with clustering.")
    if spec.get("mendelian_randomization"):
        diagnostics.append("For MR, check allele harmonization, LD clumping, ancestry, sample overlap, F statistics, and pleiotropy sensitivity.")
    return diagnostics


def _common_report(spec: Dict[str, Any]) -> List[str]:
    return [
        f"IV target estimand: {spec.get('target_estimand', 'unknown')}.",
        "Report instrument, exposure/treatment, outcome, target population, and local/complier interpretation.",
        "Include first stage, reduced form, IV estimate, weak-instrument diagnostics, and assumption/sensitivity checks.",
        "State that IV validity rests on relevance, independence, exclusion, and monotonicity or MR-specific assumptions.",
    ]


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    context = spec.get("iv_context", "unknown")
    instrument_type = spec.get("instrument_type", "unknown")
    treatment = spec.get("treatment_type", "unknown")
    outcome = spec.get("outcome_type", "unknown")
    target = spec.get("target_estimand", "unknown")
    strength = spec.get("instrument_strength", "unknown")
    first_stage_f = spec.get("first_stage_f")
    n_instruments = spec.get("n_instruments")
    n_endogenous = spec.get("n_endogenous")
    exclusion = spec.get("exclusion_risk", "unknown")
    independence = spec.get("independence_risk", "unknown")
    monotonicity = spec.get("monotonicity_risk", "unknown")
    language = spec.get("language", "unknown")
    mr = bool(spec.get("mendelian_randomization")) or context == "mendelian_randomization" or instrument_type in {"genetic_variant", "polygenic_score", "multiple_snps"}

    diagnostics = _base_diagnostics({**spec, "mendelian_randomization": mr})
    caveats: List[str] = []
    clarifications: List[str] = []
    activate: List[str] = []
    software: List[Dict[str, str]] = []

    if context == "unknown":
        clarifications.append("Clarify the IV source: encouragement, policy eligibility, distance/preference/provider variation, fuzzy RD, MR, or other.")
    if instrument_type == "unknown":
        clarifications.append("Define the instrument and its assignment/generation mechanism.")
    if target == "unknown":
        clarifications.append("Define the IV target: LATE/CACE, Wald ratio, linear IV coefficient, MR causal effect, or structural parameter.")
    if treatment == "unknown":
        clarifications.append("Define the treatment/exposure moved by the instrument.")
    if outcome == "unknown":
        clarifications.append("Define the outcome and its timing.")

    if exclusion == "high":
        caveats.append("High exclusion risk; IV causal interpretation is not credible without redesign or strong sensitivity support.")
    elif exclusion in {"moderate", "unknown"}:
        diagnostics.append("Map possible direct paths from instrument to outcome and consider negative-control/falsification checks.")
    if independence == "high":
        caveats.append("Instrument independence/as-if-randomness is highly doubtful.")
    elif independence in {"moderate", "unknown"}:
        diagnostics.append("Check balance by instrument and possible confounding of instrument assignment.")
    if monotonicity == "high":
        caveats.append("Monotonicity is doubtful; LATE/CACE interpretation may fail.")
    elif monotonicity in {"moderate", "unknown"} and target in {"cace_late", "wald_ratio", "unknown"}:
        diagnostics.append("Clarify possible defiers and complier meaning.")

    weak = strength == "weak" or (isinstance(first_stage_f, (int, float)) and first_stage_f < 10)
    if strength == "unknown" and first_stage_f is None and not mr:
        clarifications.append("Provide first-stage strength or partial F diagnostics.")
    if weak:
        caveats.append("Weak-instrument risk; use weak-robust inference and avoid overconfident 2SLS claims.")
    if spec.get("many_instruments") or (isinstance(n_instruments, int) and isinstance(n_endogenous, int) and n_instruments > max(3, 3 * max(n_endogenous, 1))):
        caveats.append("Many-instrument risk; inspect overfit first stage, bias toward OLS, and consider LIML/Fuller or shrinkage.")

    if mr:
        iv_lane = "Mendelian randomization support"
        if language in {"r", "either", "unknown"}:
            software.append(_software("TwoSampleMR", "R", "Use for GWAS extraction, harmonization, clumping, IVW, and common two-sample MR sensitivity workflow."))
            software.append(_software("MendelianRandomization", "R", "Use for broad summary-data MR methods including IVW, MR-Egger, median/mode, and multivariable MR."))
            software.append(_software("MRPRESSO", "R", "Use for horizontal pleiotropy and outlier diagnostics."))
            software.append(_software("MVMR", "R", "Use for multivariable MR and conditional instrument-strength checks."))
        if spec.get("mr_pleiotropy_risk") in {"moderate", "high", "unknown"}:
            caveats.append("Pleiotropy risk requires MR-Egger/median/mode/PRESSO/leave-one-out and biological review.")
        diagnostics.append("Report SNP-exposure F statistics, harmonization, LD clumping, heterogeneity, MR-Egger intercept, and leave-one-out diagnostics.")
        if target == "unknown":
            target = "mr_causal_effect"
    elif context == "fuzzy_rd":
        iv_lane = "fuzzy RD local IV support"
        activate.append("11-regression-discontinuity")
        if language in {"r", "either", "unknown"}:
            software.append(_software("rdrobust + ivreg/fixest", "R", "Use RD diagnostics plus local Wald/2SLS logic near the cutoff."))
        caveats.append("Fuzzy RD target is local to the cutoff and compliers.")
    elif context == "encouragement" or instrument_type in {"randomized_encouragement", "lottery"}:
        iv_lane = "encouragement or noncompliance IV support"
        activate.append("07-randomized-assignment-and-experiments")
        if language in {"r", "either", "unknown"}:
            software.append(_software("estimatr::iv_robust", "R", "Use for CACE/LATE with robust or clustered standard errors after reporting ITT."))
            software.append(_software("ivreg", "R", "Use for standard 2SLS diagnostics and IV reporting."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("linearmodels IV2SLS", "Python", "Use for transparent 2SLS with robust/clustered covariance."))
        if language in {"stata", "either", "unknown"}:
            software.append(_software("ivregress or ivreg2", "Stata", "Use mature IV diagnostics and robust/clustered inference."))
        diagnostics.append("Report ITT/reduced form before CACE/LATE.")
    elif spec.get("high_dimensional_controls") or context == "high_dimensional_iv":
        iv_lane = "high-dimensional or DML-IV support"
        activate.append("32-double-machine-learning")
        if language in {"r", "either", "unknown"}:
            software.append(_software("DoubleML PLIV/IIVM", "R", "Use orthogonal IV scores with cross-fitted nuisance models."))
            software.append(_software("hdm", "R", "Use sparse high-dimensional IV or post-selection support when assumptions fit."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("DoubleML PLIV/IIVM", "Python", "Use orthogonal IV scores and learner sensitivity."))
            software.append(_software("EconML DMLIV/OrthoIV/DRIV", "Python", "Use flexible IV nuisance/CATE support with careful target selection."))
    else:
        iv_lane = "standard natural-experiment IV support"
        if language in {"r", "either", "unknown"}:
            software.append(_software("ivreg", "R", "Use standard IV regression with diagnostics."))
            software.append(_software("fixest", "R", "Use fast IV with fixed effects and clustered standard errors."))
            software.append(_software("estimatr::iv_robust", "R", "Use design-oriented 2SLS with robust/clustered SE."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("linearmodels IV2SLS/IVGMM", "Python", "Use mature Python IV estimation."))
            software.append(_software("ivmodels", "Python", "Use weak-IV robust tests and confidence sets."))
        if language in {"stata", "either", "unknown"}:
            software.append(_software("ivreg2 / weakiv", "Stata", "Use advanced IV diagnostics and weak-IV robust inference."))

    if weak:
        if language in {"r", "either", "unknown"}:
            software.append(_software("ivmodel", "R", "Use weak-instrument robust intervals and sensitivity for one endogenous variable."))
        if language in {"python", "either", "unknown"}:
            software.append(_software("ivmodels", "Python", "Use Anderson-Rubin, LM, and CLR-style weak-IV robust inference."))
        if language in {"stata", "either", "unknown"}:
            software.append(_software("weakiv / weakivtest", "Stata", "Use weak-instrument robust tests and intervals."))

    if outcome in {"survival_time", "competing_risk"}:
        activate.append("33-survival-competing-risks")
        caveats.append("Survival outcomes need survival-scale and censoring support; 2SLS may be only a linear projection.")
    if treatment == "time_varying":
        activate.append("09-longitudinal-gmethods")
        caveats.append("Time-varying exposure with IV needs longitudinal timing review.")
    if spec.get("nonlinear_target"):
        caveats.append("Nonlinear IV/control-function targets require extra modeling assumptions; define marginal effect scale before reporting.")

    if not software:
        software.append(_software("IV design checklist", "R/Python/Stata", "Clarify assumptions and first-stage evidence before choosing software."))

    readiness = "plan_ready"
    if clarifications:
        readiness = "candidate_only"
    if caveats and any(term in " ".join(caveats).lower() for term in ["weak", "high", "pleiotropy", "nonlinear", "time-varying"]):
        readiness = "diagnostics_needed"
    if exclusion == "high" or independence == "high":
        readiness = "blocked"

    if readiness == "plan_ready":
        next_action = "confirm_analysis_plan"
    elif readiness == "diagnostics_needed":
        next_action = "run_diagnostics"
    elif readiness == "blocked":
        next_action = "ask_user"
    else:
        next_action = "clarify_specification"

    top_choice = "Clarify instrument mechanism, target estimand, and IV assumptions before software choice"
    if iv_lane.startswith("Mendelian"):
        top_choice = "Use MR only with harmonized genetic instruments and pleiotropy/heterogeneity sensitivity"
    elif iv_lane.startswith("encouragement"):
        top_choice = "Report ITT/reduced form first, then CACE/LATE if IV assumptions hold"
    elif weak:
        top_choice = "Use weak-instrument robust inference before interpreting 2SLS magnitude"
    elif "DML" in iv_lane:
        top_choice = "Use IV-DML only after IV assumptions and orthogonal score target are explicit"

    return {
        "readiness": readiness,
        "iv_lane": iv_lane,
        "top_choice": top_choice,
        "software_options": software[:10],
        "required_clarifications": clarifications,
        "diagnostics": diagnostics,
        "caveats": caveats,
        "activate_other_subskills": sorted(set(activate)),
        "report_support": _common_report({**spec, "target_estimand": target}),
        "recommended_next_action": next_action,
    }


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python recommend.py input.json")
    spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    print(json.dumps(recommend(spec), indent=2))


if __name__ == "__main__":
    main()
