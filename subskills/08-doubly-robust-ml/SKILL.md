---
name: doubly-robust-ml
description: Use for AIPW, TMLE, one-step estimators, DoubleML, debiased/orthogonal machine learning, cross-fitting, Super Learner, flexible nuisance estimation, and doubly robust causal effect estimation after a plausible causal design and adjustment set exist.
version: 0.2.0
---

# Doubly Robust and Orthogonal ML

## Core Behavior

When this subskill is invoked, focus on estimation after identification. Doubly robust and orthogonal ML methods can stabilize causal effect estimation when outcome and treatment/censoring nuisance functions are complex, but they do **not** create identification or remove unmeasured confounding.

Always do these six things:

1. **Confirm the parent causal route.** Identify whether the design is randomized, point-treatment observational, longitudinal, IV, missingness/censoring, survival, or HTE. The parent route owns identification.
2. **Define the target parameter.** Decide whether the target is ATE, ATT, ATC, risk difference, mean difference, survival/risk contrast, partially linear coefficient, IRM parameter, CATE/GATE, or policy value.
3. **Separate nuisance models from the causal estimand.** Record the outcome model, treatment/propensity model, censoring/missingness model, and any final-stage CATE or policy model.
4. **Use cross-fitting with flexible learners.** Prefer sample splitting/cross-fitting for ML nuisance models unless the method/package has a justified alternative.
5. **Diagnose positivity and nuisance behavior.** Check overlap, extreme propensities, predicted outcome calibration, influence-curve behavior, fold stability, and learner sensitivity.
6. **Explain double robustness correctly.** It means consistency can hold if one of two nuisance components is correctly specified in the relevant sense; it does not protect against wrong causal structure, post-treatment adjustment, positivity failure, or missing confounders.

## User-Facing Style

Be clear and modest. A helpful explanation is:

> Doubly robust methods combine an outcome model with a treatment-assignment model. They can be more stable than relying on only one model, especially with flexible machine learning, but they still require that the data contain the right pre-treatment confounders and that similar units received both treatment options.

Do not lead with acronyms. Translate:

- nuisance models: "the prediction pieces used inside the causal estimator";
- cross-fitting: "train the prediction pieces on one part of the data and evaluate the causal score on another";
- orthogonal score: "a construction that makes the final effect estimate less sensitive to small errors in the prediction pieces";
- influence curve: "the observation-level contribution used for uncertainty and diagnostics."

## Activation and Route-Out

Use this subskill when the user says or implies:

- AIPW, augmented IPW, doubly robust, TMLE, targeted learning, one-step estimator, Super Learner, DoubleML, debiased ML, orthogonal learning, cross-fitting, causal ML for average effects, or flexible nuisance estimation;
- high-dimensional covariates or nonlinear confounding make ordinary regression or simple weighting fragile;
- they need code or diagnostics for R `tmle`, `tmle3`, `AIPW`, `DoubleML`, `SuperLearner`/`sl3`, or Python `DoubleML`, `EconML`, `zepid`, or DoWhy DR-style workflows.

Do **not** use this as the only workflow when:

- the adjustment set or causal structure is unclear: activate `subskills/03-dag-builder/` and usually `02-user-data-inspector` first;
- the main task is matching, weighting, overlap, or balance design: activate `subskills/07-matching-weighting-balance/`;
- the user wants subgroup/CATE/policy learning as the main output: coordinate with `subskills/09-heterogeneous-effects-policy/`;
- treatment/confounding is time-varying: coordinate with `subskills/10-longitudinal-gmethods/`;
- outcome is time-to-event or competing risks: coordinate with `subskills/15-survival-competing-risks/`;
- missingness, censoring, selection, or transportability is central: coordinate with `subskills/02-user-data-inspector/`;
- the user has an IV, RD, DiD, synthetic control, mediation, or interference design: route to the design-specific subskill first.

If this route is rejected or only exploratory, update the `subskill_analyses` entry with the failed condition and return to the main route shortlist.

## DR/ML Project Specification Entry

When a project specification is being maintained, append or update this compact entry under the top-level `subskill_analyses` list. Fill only fields that are known or decision-relevant. Do not duplicate global fields already captured under `data`, `variables`, `intervention`, `outcomes`, `study_design`, or `analysis_routes`.

```yaml
subskill_analyses:
  - subskill_id: "08-doubly-robust-ml"
    status: "candidate | selected | rejected | fallback | exploratory/user-forced"
    fit_to_user_need: null
    parent_identification_route: "randomized | point-treatment observational | matching/weighting | longitudinal | survival | missingness/censoring | HTE/policy | IV | unknown"
    estimand:
      label: "ATE | ATT | ATC | risk difference | risk ratio | mean difference | PLR coefficient | IRM ATE/ATTE | CATE/GATE | survival/risk contrast | unknown"
      target_population: null
      scale: null
      interpretation: null
    assumptions_needed:
      inherited_identification_assumptions: []
      positivity_or_overlap: null
      correct_variable_timing: null
      no_unmeasured_confounding_or_parent_design_condition: null
      censoring_or_missingness_assumption: null
    nuisance_models:
      outcome_model_Q_or_g: null
      treatment_model_g_or_m: null
      censoring_or_missingness_model: null
      final_stage_model: null
      learner_library: []
      learner_constraints: []
    estimation_plan:
      method_family: "AIPW | TMLE | one-step | DoubleML PLR | DoubleML IRM | DRLearner | orthogonal forest | other | unknown"
      cross_fitting: null
      folds_or_repeated_splits: null
      sample_split_unit: null
      cluster_or_id_handling: null
      inference_method: null
      software_backend: "R | Python | either | unknown"
    diagnostics_or_checks:
      overlap_or_propensity_distribution: null
      nuisance_performance: null
      influence_curve_or_score_diagnostics: null
      fold_stability: null
      learner_sensitivity: []
      bootstrap_or_robust_se_check: null
    fatal_flaws_or_major_limitations: []
    limitations: []
    open_questions: []
```

## Core Theory and Formal Definitions

Default notation in this subskill:

- \(A\): treatment;
- \(Y\): outcome;
- \(X\): pre-treatment covariates;
- \(e(X)=P(A=1 \mid X)\): propensity or treatment mechanism;
- \(\mu_a(X)=E[Y \mid A=a, X]\): outcome regression under treatment level \(a\);
- \(\psi_a=E[Y(a)]\): mean potential outcome under \(a\).

If the user uses different notation or variable names, adapt responses to the user's notation.

### AIPW for a binary treatment

For treatment level \(a\), an augmented inverse probability weighted score is

\[
\phi_a(O) =
\frac{1(A=a)\{Y-\mu_a(X)\}}{P(A=a \mid X)}
+ \mu_a(X).
\]

An ATE estimate contrasts the averages of \(\phi_1(O)\) and \(\phi_0(O)\). This is the basic double-robust idea: the estimator can remain consistent if either the outcome regression or treatment model is correct, under the causal identification assumptions.

### TMLE

TMLE starts with initial nuisance estimates and then targets or updates the outcome regression toward the causal parameter using the efficient influence curve. It is a substitution estimator and often respects bounds of the outcome scale, for example probabilities in \([0,1]\).

### Double/debiased ML

DoubleML uses Neyman-orthogonal scores and sample splitting/cross-fitting to reduce bias from flexible nuisance estimation. Common models include partially linear regression (PLR), interactive regression model (IRM), partially linear IV (PLIV), and interactive IV (IIVM). Choose the score/model class to match the causal question and treatment structure.

## Identification Assumptions

State these separately from estimator mechanics:

- inherited assumptions from the parent route, such as randomization, conditional exchangeability, IV validity, or censoring assumptions;
- positivity/overlap for treatment and censoring/missingness models;
- correct timing of covariates;
- no interference unless handled elsewhere;
- nuisance-estimation and asymptotic conditions required by the selected estimator.

Do not say "doubly robust" means the estimate is robust to unmeasured confounding or arbitrary model failure.

## Method Recommendation Rules

### Design-to-method table

| Situation | Default recommendation | Required checks |
|---|---|---|
| Binary point treatment, ATE/ATT, moderate/high-dimensional covariates | AIPW or TMLE | adjustment set, overlap, Q/e diagnostics, influence curve |
| User wants bounded estimates for binary outcome/risk | TMLE | outcome bounds, clever covariate, positivity, IC diagnostics |
| User prefers econometric DML and structural parameter | DoubleML PLR or IRM | model class fits treatment/outcome, cross-fitting, score choice |
| Flexible learners needed but sample is small | Simpler AIPW/TMLE with conservative learner library | fold stability, overfitting, learner sensitivity |
| Need CATE or subgroup effects | DRLearner, causal forest DML, or coordinate with `09-heterogeneous-effects-policy` | CATE validation, overlap by modifiers, calibration |
| Time-to-event or competing risk outcome | Survival-specific AIPW/TMLE or coordinate with `15-survival-competing-risks` | censoring, horizon, risk/RMST scale |
| Missing outcomes or informative censoring | Add missingness/censoring nuisance model and coordinate with `02-user-data-inspector` | IPCW/IPMW diagnostics, positivity |
| IV or natural experiment with high-dimensional controls | IV-DML via `13-instrumental-variables` | IV assumptions, first stage, orthogonal score |

### Learner selection

- Include simple baseline learners such as mean/GLM/main-effects models.
- Add flexible learners only when sample size and data structure support them.
- Use learner libraries appropriate to outcome type and treatment type.
- Avoid algorithms that cannot respect known bounds or categorical structure unless carefully wrapped.
- Keep fold assignment reproducible and aligned with clusters, sites, or repeated units.
- Compare estimates across a small number of learner libraries rather than tuning until the desired effect appears.

## Language Backend Policy

Do not install packages silently. If packages are missing, show install commands and ask for approval.

### R preferred stack

- `tmle`: point-treatment TMLE for binary treatment with continuous/binary outcomes and missingness support.
- `tmle3`, `sl3`, and `tlverse`: extensible targeted-learning framework for more complex parameters.
- `AIPW`: direct AIPW workflows for common point-treatment settings.
- `SuperLearner`: cross-validated ensemble nuisance estimation.
- `DoubleML`: DML for PLR, IRM, PLIV, IIVM, and related score-based workflows.
- `drtmle` or specialized packages may be useful for longitudinal/survival/missingness settings; check scope before recommending.

### Python preferred stack

- `DoubleML`: DML with PLR, IRM, PLIV, IIVM, sample splitting, bootstrap, confidence intervals, and sensitivity tools.
- `EconML`: DML, DRLearner, CausalForestDML, ForestDRLearner, and CATE-oriented orthogonal methods.
- `zepid`: AIPTW, TMLE, IPTW/IPCW, and epidemiologic workflows.
- `DoWhy`: graph/identification/refutation wrapper; useful around estimation but not a full diagnostics replacement.
- `scikit-learn`, `statsmodels`, `pandas`, and `numpy`: nuisance learners, transparent baselines, and custom diagnostics.

## Data Preprocessing Rules

1. Use the parent route's valid adjustment set. Do not add post-treatment variables because they improve prediction.
2. Define a consistent analysis sample for treatment, outcome, covariates, nuisance models, and diagnostics.
3. Encode categorical variables and sparse levels consistently across folds.
4. Handle missing covariates intentionally before cross-fitting; do not let packages silently drop different rows by nuisance model.
5. Use cluster/site/patient IDs in sample splitting when observations are not independent.
6. Preserve treatment prevalence in folds when treatment is rare.
7. Bound or truncate propensity scores only with transparent reporting and sensitivity analysis.
8. For continuous treatments, ensure the chosen score/backend supports the treatment type.
9. For binary outcomes, keep predictions on valid probability scales when possible.
10. Store fold IDs, learner libraries, seeds, tuning choices, and software versions for reproducibility.

## Required Diagnostics

### Identification and support diagnostics

- inherited adjustment set and parent route;
- treatment overlap/propensity distribution;
- positivity for censoring or missingness models when applicable;
- covariate timing and post-treatment exclusion;
- sensitivity to unmeasured confounding when causal claims matter.

### Nuisance diagnostics

- cross-validated performance for outcome and treatment/censoring models;
- calibration or residual checks on outcome model;
- treatment model separation, extreme propensities, and fold failures;
- learner weights or selected learners for Super Learner/ensembles;
- stability across learner libraries and tuning choices.

### Estimator diagnostics

- influence-curve or score distribution, outliers, and mean near zero when applicable;
- standard error, confidence interval, and bootstrap/robust SE when appropriate;
- fold-specific estimates or repeated cross-fitting stability;
- comparison to simpler estimators such as regression, IPW, or matching/weighting estimate;
- target scale and bounds, especially for risk differences/ratios.

## Failure Modes and Guardrails

Escalate warnings when:

- causal identification has not been established;
- covariates are measured after treatment or include mediators/colliders;
- flexible ML is used without cross-fitting or a method-specific justification;
- propensity scores are near 0 or 1 and dominate the estimate;
- nuisance models fail in some folds or produce impossible predictions;
- the user interprets double robustness as protection against unmeasured confounding;
- the final estimate changes dramatically across reasonable learner libraries;
- the sample is too small for the planned learner complexity;
- CATE output is interpreted as precise individual effects without validation;
- package defaults choose an estimand, score, or scale different from the user's target.

## Step-by-Step Operating Procedure

1. Restate the causal question and parent identification route.
2. Confirm treatment, comparator, outcome, time zero, target population, estimand, and scale.
3. Confirm valid pre-treatment covariates and route out if the adjustment set is unresolved.
4. Choose the DR/orthogonal method family that matches the data structure and estimand.
5. Specify nuisance functions and candidate learner library, including simple baseline learners.
6. Specify cross-fitting/splitting, cluster handling, seeds, and reproducibility settings.
7. Fit the estimator only after overlap and timing checks are planned.
8. Report nuisance, overlap, and influence-curve/score diagnostics.
9. Compare against a simpler route and at least one sensitivity or learner-robustness check.
10. Interpret causally only under the parent assumptions and report limitations.

## Output Template

```markdown
### Doubly Robust / Orthogonal ML Analysis

#### 1. Causal route and estimand
- Parent route:
- Treatment/comparator:
- Outcome:
- Target population:
- Estimand and scale:

#### 2. Identification assumptions
- Parent assumptions:
- Positivity/overlap:
- Covariate timing:
- Missingness/censoring:

#### 3. Estimation plan
- Method family:
- Outcome nuisance model:
- Treatment/censoring nuisance model:
- Learner library:
- Cross-fitting plan:
- Software/backend:

#### 4. Diagnostics
- Overlap:
- Nuisance performance:
- Influence-curve/score checks:
- Fold stability:
- Learner sensitivity:
- Simpler estimator comparison:

#### 5. Interpretation
- Estimate and uncertainty:
- What double robustness does and does not protect against:
- Fatal flaws or major limitations:
- Recommended next step:
```

## Related Subskills

- `subskills/03-dag-builder/`: use when adjustment variables or causal structure are unclear.
- `subskills/06-point-treatment-observational/`: parent route for measured-confounding point-treatment designs.
- `subskills/07-matching-weighting-balance/`: use for balance, matching, weighting, and overlap diagnostics.
- `subskills/09-heterogeneous-effects-policy/`: use for CATE, GATE, DRLearner, causal forests, or policy learning outputs.
- `subskills/10-longitudinal-gmethods/`: use for time-varying treatment/confounding.
- `subskills/13-instrumental-variables/`: use for IV-DML or high-dimensional IV designs.
- `subskills/15-survival-competing-risks/`: use for survival, censoring, competing risks, or RMST.
- `subskills/02-user-data-inspector/`: use for missing outcomes, censoring, selection, or transportability.

## Reference Files

For the detailed workflow, read `references/workflow.md`. For the literature and software map, read `references/literature_and_software.md`.
