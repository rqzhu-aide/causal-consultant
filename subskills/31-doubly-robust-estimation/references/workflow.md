# Doubly Robust Estimation Workflow

Use this reference when `SKILL.md` is not enough for AIPW, TMLE, one-step estimators, influence-function diagnostics, or targeted learning support.

## 1. Confirm The Estimation Target

Record the smallest useful DR estimation target:

- Design route: randomized, observational, longitudinal, transport, survival, or other route.
- Estimand: ATE, ATT, risk difference, mean difference, risk ratio, survival risk, strategy mean, transported effect, or other target.
- Nuisance functions: outcome regression, treatment/propensity, censoring, missingness, sampling/selection, or time-varying nuisance functions.
- Adjustment set: variables approved by `method_lead` and checked for timing.
- Data structure: independent units, clusters, repeated measures, survival data, longitudinal histories, or survey/sample weights.
- Inference need: point estimate only, confidence interval, cluster-robust inference, bootstrap, repeated cross-fitting, or report-ready inference.

## 2. Check Before Estimating

Before running DR/TMLE:

- verify design route and identification assumptions are not still unsettled;
- confirm all nuisance variables are valid pre-treatment or time-ordered variables;
- inspect support/positivity and possible truncation;
- decide whether flexible learners require cross-fitting;
- define outcome scale and effect scale;
- choose variance/inference method before reporting.

## 3. Choose An Estimator Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| Binary treatment, mean/risk ATE or ATT, simple data | AIPW or one-step estimator | Transparent DR structure and diagnostics | Positivity and influence-curve tails |
| Bounded outcome/risk target or Super Learner desired | TMLE | Targeted update, bounded predictions, strong reporting ecosystem | More setup and learner choices |
| Flexible nuisance with formal targeted-learning workflow | `drtmle`, `tmle3`, Super Learner/sl3 | Robust nuisance handling and targeted inference | Diagnostics and cross-fitting discipline matter |
| High-dimensional nuisance or orthogonal ML central | Coordinate with `32-double-machine-learning` | DML packages handle cross-fitting and orthogonal scores | DML target may differ from TMLE/AIPW target |
| Longitudinal treatment/censoring | Longitudinal TMLE or sequential DR | Handles time-ordered nuisance functions | Needs `09` time-grid and support review |
| Survival/censoring target | Survival TMLE/DR with censoring nuisance | Handles censoring explicitly | Needs `33` outcome-scale support |
| Transport or missingness/sampling | Augmented weighting or TMLE with sampling nuisance | Combines outcome and sampling models | Target population and sampling weights must be explicit |

## 4. Ask For Focused Data Work

Ask for one or two concrete checks at a time:

- nuisance feature matrix and timing/leakage table;
- split/cross-fit plan, grouped by cluster/id when needed;
- propensity/support and truncation diagnostics;
- nuisance prediction calibration or fold performance;
- influence-curve summary and outlier table;
- estimate comparison table: regression, weighting, AIPW/TMLE, and simple benchmark;
- reproducible estimator object, seed, folds, learner library, and code path.

## 5. Coordinate With Other Subskills

- `30-matching-weighting-balance`: overlap, propensity, balance, weights, and support diagnostics.
- `32-double-machine-learning`: orthogonal ML, residualization, and DML-specific packages.
- `09-longitudinal-gmethods`: longitudinal histories and sequential assumptions.
- `33-survival-competing-risks`: censoring, survival targets, competing risks.
- `24-transportability-generalizability`: sampling/transport weights and target populations.
- `20-heterogeneous-effects` or `21-point-treatment-rules`: DR scores can support heterogeneity or policy modules, but target modules must define the goal.

## 6. Diagnose Before Reporting

Minimum diagnostic set:

- support/positivity and truncation rule;
- nuisance learner library and fold plan;
- nuisance calibration/performance where relevant;
- influence-curve mean, tails, outliers, and standard error;
- comparison to simpler estimators;
- sensitivity to learner set, truncation, folds, seeds, and covariate set;
- explicit claim boundary tied to design assumptions.

## 7. Report Language

Use careful DR language:

- "doubly robust estimator under the stated identification assumptions";
- "uses outcome and propensity nuisance models";
- "cross-fitted nuisance estimates";
- "influence-curve-based standard error";
- "targeted maximum likelihood estimate."

Avoid:

- "robust to all model misspecification";
- "fixes confounding";
- "machine learning makes the estimate unbiased";
- "more advanced, therefore more credible" without diagnostics.
