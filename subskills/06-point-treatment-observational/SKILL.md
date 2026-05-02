---
name: point-treatment-observational
description: Use for observational cohort, registry, EHR, claims, survey, or cross-sectional data with one primary treatment/exposure time, a comparator, measured pre-treatment confounders, and a causal effect question under measured-confounding assumptions.
version: 0.2.0
---

# Point-Treatment Observational

## Core Behavior

When this subskill is invoked, act as a causal-design consultant for nonrandomized point-treatment comparisons. The core job is to define a target trial-like comparison, check whether measured-confounding adjustment is plausible, choose a high-level analysis route, and hand off to matching/weighting, doubly robust ML, survival, HTE, or missingness subskills when needed.

Always do these six things:

1. **Define the target trial frame.** Clarify eligibility, time zero, treatment/action, comparator, outcome, follow-up, target population, and whether treatment is assigned or initiated once.
2. **Classify covariates by timing and role.** Adjustment variables must generally be measured before treatment. Separate confounders, prognostic variables, effect modifiers, instruments, mediators, colliders, censoring/selection variables, and missingness variables.
3. **State the measured-confounding assumptions in plain language.** Do not require the user to know "exchangeability" or "positivity" up front; explain that causal interpretation depends on measuring the reasons treatment was chosen and having comparable treated and comparator units.
4. **Choose the estimand before the method.** Decide whether the target is ATE, ATT, ATC, overlap effect, dose-response, CATE/GATE, risk difference, risk ratio, mean difference, or survival contrast.
5. **Shortlist method families, not every estimator.** Start with a simple route and one stronger alternative. Route to `07-matching-weighting-balance` for matching/weighting/balance details and `08-doubly-robust-ml` for AIPW/TMLE/DML/high-dimensional nuisance estimation.
6. **Require design diagnostics before causal interpretation.** Check time ordering, overlap, balance or adjustment adequacy, missingness/selection, sensitivity to unmeasured confounding, and whether the analysis sample matches the target population.

## User-Facing Style

Be progressive and plain-spoken. A helpful early response is often:

> This looks like an observational comparison of treatment A versus a comparator. I can help design the analysis, but before choosing a model we need to align eligibility, treatment start, outcome follow-up, and baseline variables. Later we will check whether similar units received both options and whether key reasons for treatment choice were measured.

Translate assumptions:

- exchangeability: "we measured the important reasons people received one treatment rather than the other";
- positivity: "similar units appear under both treatment options";
- consistency: "the treatment and comparator are defined clearly enough that the comparison means the same thing across units";
- no interference: "one unit's treatment does not change another unit's outcome, unless we model that explicitly."

## Activation and Route-Out

Use this subskill when the user says or implies:

- observational cohort, registry, EHR, claims, administrative data, survey, or cross-sectional exposure with temporal caution;
- treatment or exposure is measured once at a meaningful baseline or time zero;
- they want the effect of treatment A versus no treatment, usual care, standard care, another active treatment, or another exposure level;
- they want regression adjustment, standardization, g-computation, propensity methods, matching, weighting, AIPW, TMLE, DML, or sensitivity analysis for a point-treatment causal effect.

Do **not** use this as the only workflow when:

- treatment was randomized: route to `subskills/05-randomized-experiments/`;
- the main unresolved task is choosing or diagnosing weights/matches: activate `subskills/07-matching-weighting-balance/`;
- the user specifically wants AIPW, TMLE, DML, Super Learner, or cross-fitting implementation: activate `subskills/08-doubly-robust-ml/`;
- treatment or confounders vary over time, or prior treatment affects later confounders: route to `subskills/10-longitudinal-gmethods/`;
- treatment is assigned by policy timing, cutoff, or instrument: route to `11-did-event-study`, `12-regression-discontinuity`, or `13-instrumental-variables`;
- outcome is time-to-event, censoring, or competing risks: coordinate with `subskills/15-survival-competing-risks/`;
- the target is mediation, interference, causal discovery, genomics/MR, missingness/selection, HTE/policy, or reporting: coordinate with the relevant subskill.

If the point-treatment observational route is rejected, update the `subskill_analyses` entry as `rejected`, `fallback`, or `exploratory/user-forced`, record the failed condition, and return to the main skill's route shortlist.

## Point-Treatment Project Specification Entry

When a project specification is being maintained, append or update this compact entry under the top-level `subskill_analyses` list. Fill only fields that are known or decision-relevant. Do not duplicate global fields already captured under `data`, `variables`, `intervention`, `outcomes`, `study_design`, or `analysis_routes`.

```yaml
subskill_analyses:
  - subskill_id: "06-point-treatment-observational"
    status: "candidate | selected | rejected | fallback | exploratory/user-forced"
    fit_to_user_need: null
    user_task: "design triage | analysis plan | code | data audit | interpret result | unknown"
    causal_question:
      treatment_or_exposure: null
      comparator: null
      outcome: null
      target_population: null
      time_zero: null
      follow_up: null
    estimand:
      label: "ATE | ATT | ATC | ATO/overlap | dose-response | CATE/GATE | risk difference | risk ratio | mean difference | survival contrast | unknown"
      scale: null
      interpretation: null
    assumptions_needed:
      consistency_or_well_defined_treatment: null
      conditional_exchangeability_given_measured_covariates: null
      positivity_or_overlap: null
      no_interference: null
      correct_time_ordering: null
      selection_or_missingness_handled: null
    design_audit:
      treatment_type: "binary | multi-valued | continuous | ordinal | unknown"
      comparator_type: "untreated | usual care | active comparator | dose level | unknown"
      one_row_per_unit: null
      repeated_rows_or_feature_construction_needed: null
      baseline_window: null
      adjustment_set_source: "DAG | variable-role map | domain knowledge | unknown"
      candidate_confounders: []
      post_treatment_variables_to_exclude: []
      instruments_or_treatment_predictors: []
      effect_modifiers: []
      missingness_or_selection_concerns: []
    route_shortlist:
      primary_route: null
      secondary_route: null
      route_to_matching_weighting_balance: null
      route_to_doubly_robust_ml: null
      route_to_other_subskills: []
    diagnostics_or_checks:
      baseline_table: null
      overlap_or_common_support: null
      balance_or_covariate_distribution: null
      model_diagnostics: null
      sensitivity_to_unmeasured_confounding: null
      negative_controls_or_placebos: []
    fatal_flaws_or_major_limitations: []
    limitations: []
    open_questions: []
```

## Core Theory and Formal Definitions

Default notation in this subskill:

- \(A\): point treatment or exposure;
- \(a\) and \(a'\): treatment and comparator levels;
- \(Y\): outcome measured after treatment;
- \(X\): pre-treatment adjustment covariates;
- \(Y(a)\): potential outcome under treatment level \(a\).

If the user uses different notation or variable names, adapt responses to the user's notation.

### Point-treatment effect

For binary treatment, a common average treatment effect is

\[
E[Y(1)-Y(0)].
\]

For an ATT, target treated units:

\[
E[Y(1)-Y(0) \mid A=1].
\]

For continuous or multi-valued treatment, define the dose or treatment levels and target a contrast or dose-response curve.

### Identification under measured confounding

A standard point-treatment observational identification strategy requires:

1. consistency: observed outcomes match the treatment actually received;
2. conditional exchangeability: no unmeasured confounding after conditioning on pre-treatment \(X\);
3. positivity: each relevant treatment option occurs within the covariate regions being compared;
4. no interference unless modeled separately.

Then, for a binary treatment:

\[
E[Y(a)] = E_X\{E[Y \mid A=a, X]\}.
\]

This is the basis for standardization or g-computation. Matching, weighting, AIPW, TMLE, and DML target the same causal comparison under related identification assumptions.

## Method Recommendation Rules

### Adaptive recommendation posture

Recommend a route in layers:

1. **Design and adjustment layer:** target-trial framing, DAG or variable-role map, baseline table, overlap check.
2. **Transparent estimation layer:** regression adjustment or standardization/g-computation when covariates and sample size are modest and model form is explainable.
3. **Design-preprocessing layer:** matching, weighting, overlap weighting, entropy balancing, or CBPS when comparability and balance are central. Route to `07-matching-weighting-balance`.
4. **Doubly robust / ML layer:** AIPW, TMLE, DML, or flexible nuisance models when covariates are high-dimensional, nonlinear, or model robustness is important. Route to `08-doubly-robust-ml`.
5. **Specialized outcome or estimand layer:** survival, HTE/policy, mediation, longitudinal, missingness/selection, or transportability routes when needed.

In normal responses, recommend one primary route plus one fallback or comparator. Do not dump every possible estimator.

### Design-to-method table

| Situation | Default recommendation | Required checks |
|---|---|---|
| Clear binary treatment, modest covariates, good overlap | Standardization/g-computation or adjusted regression on a marginal scale | time zero, covariate timing, model form, marginal vs conditional scale |
| User wants ATT or treated-population comparison | Matching or ATT weighting via `07-matching-weighting-balance` | treated support, discarded units, balance, target-population statement |
| Poor full-population overlap | Consider overlap estimand, trimming, or narrowed target population via `07-matching-weighting-balance` | support plots, effective sample size, estimand-change warning |
| High-dimensional or nonlinear confounding | AIPW/TMLE/DML via `08-doubly-robust-ml` | cross-fitting, nuisance performance, same identification assumptions |
| Continuous or dose treatment | Dose-response or generalized propensity/standardization | dose support, functional form, avoid extrapolation |
| Time-to-event outcome | Coordinate with survival subskill | time zero, censoring, competing risks, target contrast |
| Strong subgroup or new-patient benefit interest | Coordinate with HTE/policy after parent route is credible | overlap by modifier, validation, CATE uncertainty |
| Important unmeasured confounder likely missing | Do not present primary causal estimate as definitive | sensitivity, negative controls, IV/RD/DiD if plausible |

## Language Backend Policy

Do not install packages silently. If packages are missing, show install commands and ask for approval.

### R preferred stack

- `dagitty`/`ggdag`: adjustment-set and variable-role support.
- `marginaleffects`: adjusted predictions, contrasts, standardization/g-computation-style summaries for many model classes.
- `MatchIt`, `WeightIt`, `cobalt`: route to `07-matching-weighting-balance` for matching, weighting, and balance diagnostics.
- `AIPW`, `tmle`, `tmle3`, `SuperLearner`, `DoubleML`: route to `08-doubly-robust-ml` for doubly robust or ML-based estimation.
- `survival`, `riskRegression`, `adjustedCurves`, or survival-specific TMLE packages when time-to-event outcomes dominate; coordinate with `15-survival-competing-risks`.

### Python preferred stack

- `DoWhy`: useful for graph, identification, estimation, and refutation workflow; refuters are diagnostics, not proof.
- `zepid`: epidemiologic g-formula, IPTW, AIPTW, TMLE, IPCW, and transportability utilities.
- `statsmodels`, `scikit-learn`, `pandas`, and `numpy`: transparent regression, standardization, weighting, and custom diagnostics.
- `DoubleML`, `EconML`, or `causalml`: use when routing to `08-doubly-robust-ml` or `09-heterogeneous-effects-policy`.

When the user proposes another package, check whether it supports the target treatment type, estimand, outcome scale, diagnostics, and uncertainty method.

## Data Preprocessing Rules

1. Align eligibility, treatment assignment/initiation, and outcome follow-up at the same time zero for treated and comparator units.
2. Exclude units whose outcome occurred before time zero unless the estimand explicitly handles prevalence or history.
3. Keep treatment, outcome, covariates, sampling weights, cluster IDs, and censoring/missingness indicators in one auditable analysis dataset.
4. Use only pre-treatment covariates for primary total-effect adjustment.
5. Do not adjust for adherence, complications, post-treatment utilization, mediator values, or outcome proxies measured after treatment.
6. Record missingness for treatment, outcome, confounders, and follow-up. Do not silently run complete-case analysis if missingness may be informative.
7. Check whether repeated rows, visits, claims, or transactions must be summarized into a baseline window before time zero.
8. Preserve cluster, site, provider, household, school, or geography variables for diagnostics and inference.
9. If sampling weights or survey design exist, state whether the estimand targets the sampled population or a broader population.
10. Do not tune covariate selection or preprocessing based on the desired outcome effect.

## Required Diagnostics

### Design diagnostics

- eligibility and time-zero alignment;
- treatment/comparator definitions and treatment prevalence;
- covariate timing and role table;
- baseline table or covariate distribution summary;
- missingness, censoring, selection, and attrition summary;
- row/unit/cluster structure.

### Comparability diagnostics

- overlap or common support by treatment group;
- balance diagnostics if matching/weighting is used;
- influential strata, extreme weights, or extrapolation regions;
- target population changes caused by trimming, matching, or exclusions.

### Model and robustness diagnostics

- outcome model fit and calibration when using standardization;
- sensitivity to covariate set, functional form, and sample restriction;
- negative controls or placebo outcomes/exposures where scientifically available;
- sensitivity analysis for unmeasured confounding when causal claims matter;
- design-specific diagnostics delegated to `07-matching-weighting-balance`, `08-doubly-robust-ml`, `15-survival-competing-risks`, `02-user-data-inspector`, or other subskills.

## Failure Modes and Guardrails

Escalate warnings when:

- time zero is unclear or differs between treated and comparator groups;
- baseline covariates are measured after treatment starts;
- outcome or eligibility depends on future treatment or survival;
- treatment is deterministic in important covariate strata;
- the proposed adjustment set omits major common causes;
- the analysis adjusts for mediators, colliders, or selection variables for a total effect;
- a treatment-prediction model is used without balance or overlap checks;
- unmeasured confounding is likely central;
- the user interprets a conditional regression coefficient as the target marginal causal effect without checking scale and model meaning;
- cross-sectional data are used to claim effects when treatment-outcome timing is unknown.

## Step-by-Step Operating Procedure

1. Restate the causal question in domain language.
2. Define eligibility, time zero, treatment, comparator, outcome, follow-up, and target population.
3. Classify variables by timing and role, ideally using `subskills/03-dag-builder/`.
4. Choose the estimand and effect scale.
5. Check whether measured-confounding adjustment is plausible; if not, route out or label the result descriptive/sensitivity-only.
6. Check raw overlap and data support before estimator choice.
7. Choose a primary analysis route and one fallback/comparator route.
8. Activate `07-matching-weighting-balance` or `08-doubly-robust-ml` when the selected estimator needs detailed matching/weighting/DR guidance.
9. Plan diagnostics and sensitivity analyses before final causal interpretation.
10. Update the project specification with assumptions, route status, open questions, and limitations.

## Output Template

```markdown
### Point-Treatment Observational Analysis

#### 1. Causal question
- Treatment/exposure:
- Comparator:
- Outcome:
- Time zero and follow-up:
- Target population:
- Estimand and scale:

#### 2. Design audit
- Data source:
- Rows/unit structure:
- Eligibility:
- Baseline window:
- Candidate confounders:
- Variables excluded from adjustment:
- Missingness/selection concerns:

#### 3. Assumptions
- Well-defined treatment:
- Measured-confounding assumption:
- Overlap/common support:
- No interference:
- Correct time ordering:

#### 4. Recommended route
- Primary route:
- Fallback/comparator route:
- Subskills to activate:
- Software/backend:

#### 5. Diagnostics and sensitivity
- Baseline table:
- Overlap/support:
- Balance or adjustment diagnostics:
- Model diagnostics:
- Negative controls or sensitivity analysis:

#### 6. Interpretation
- What can be said causally:
- What remains unresolved:
- Fatal flaws or major limitations:
- Recommended next step:
```

## Related Subskills

- `subskills/03-dag-builder/`: use before estimator choice when adjustment variables or causal structure are unclear.
- `subskills/07-matching-weighting-balance/`: use for matching, weighting, overlap, balance, and target-population diagnostics.
- `subskills/08-doubly-robust-ml/`: use for AIPW, TMLE, DML, Super Learner, cross-fitting, and flexible nuisance models.
- `subskills/09-heterogeneous-effects-policy/`: use for CATE, subgroup effects, uplift, or treatment rules after the parent route is credible.
- `subskills/10-longitudinal-gmethods/`: use when treatment/confounding changes over time.
- `subskills/15-survival-competing-risks/`: use for time-to-event outcomes, censoring, competing risks, or RMST.
- `subskills/02-user-data-inspector/`: use when missingness, measurement error, selection, transportability, or post-treatment conditioning dominates.
- `subskills/20-reporting-interpretation/`: use for final write-up and limitations.

## Reference Files

For the detailed workflow, read `references/workflow.md`. For the backdoor math summary, read `references/backdoor_workflow.md`. For the literature and software map, read `references/literature_and_software.md`.
