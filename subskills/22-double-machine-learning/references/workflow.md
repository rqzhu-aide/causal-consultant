# Double Machine Learning Workflow
## Permission Note

This reference does not authorize execution. Treat diagnostics, artifacts, plots, tables, code, or report material as requests back to main unless main explicitly routed `execution_authorized` after user-confirmed scope.

Use this reference when `SKILL.md` is not enough for DML, orthogonal scores, cross-fitting, residualization, or high-dimensional nuisance learning.

## 1. Clarify The Orthogonal Target

Record the smallest useful DML target:

- Design route: observational point exposure, randomized experiment, longitudinal, IV, transport, survival, or other selected route.
- Estimand/model: PLR, IRM, ATE, ATT, CATE, policy score, orthogonal forest, IV-DML, nuisance plugin, or exploratory residualization.
- Treatment/exposure: binary, continuous, multi-arm, instrumented, time-varying, or policy action.
- Outcome: continuous, binary, count, survival, censored, or composite.
- Features: approved pre-treatment or time-ordered variables; leakage flags; high-dimensional groups.
- Inference need: valid confidence intervals, ranked exploration only, nuisance support only, or report-ready effect.

## 2. Check Before Modeling

Before fitting DML:

- confirm identification is already specified by the design route;
- remove post-treatment leakage, mediators, colliders, and outcome-derived features unless explicitly part of a valid longitudinal history;
- define folds and keep tuning inside training data;
- group folds by cluster/person/site when needed;
- check support/positivity and treatment prevalence before flexible modeling;
- benchmark against simpler estimators.

## 3. Choose A Method Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| Low-dimensional target with high-dimensional controls | PLR DML | Orthogonal residualization for a scalar effect | Partially linear target must be plausible |
| Binary treatment ATE with flexible nuisances | IRM DML or DR learner | Separate outcome and propensity models | Positivity and propensity calibration |
| Heterogeneous effects | Causal forest, orthogonal forest, R-learner/DR-learner | CATE support with honesty/orthogonality | Needs `10-heterogeneous-effects` target and diagnostics |
| Sparse high-dimensional linear controls | Double selection/post-lasso | Transparent sparse-control logic | Sparsity assumptions and linearity |
| IV with high-dimensional controls | DML IV/PLIV | Orthogonal IV score | Needs `05-instrumental-variables` assumptions |
| Policy learning or ranking | DR scores or orthogonal scores for policy module | Useful score input | Needs `21` or `25` target and held-out evaluation |
| Survival/longitudinal nuisance | DML as nuisance plugin | Flexible prediction support | Needs `09`/`33` target and censoring logic |

## 4. Ask For Focused Data Work

Ask for one or two concrete checks at a time:

- feature matrix with timing/leakage flags;
- fold plan with grouped splits and seed control;
- learner library and tuning plan;
- propensity/support diagnostics by fold;
- nuisance prediction and residual diagnostics;
- repeated split and learner sensitivity table;
- benchmark comparison with simpler models;
- reproducible pipeline output and package versions.

## 5. Coordinate With Other Subskills

- `21-doubly-robust-estimation`: AIPW/TMLE/DR target and influence-function reporting.
- `20-matching-weighting-balance`: overlap, propensity, balance, and support checks.
- `10-heterogeneous-effects`: CATE/forest/learner target and reporting.
- `11-point-treatment-rules`: policy scores and rule-learning support.
- `02-longitudinal-gmethods`: time-varying histories and sequential assumptions.
- `05-instrumental-variables`: IV-DML assumptions and first-stage diagnostics.
- `23-survival-competing-risks`: censored outcomes and survival targets.

## 6. Diagnose Before Reporting

Minimum diagnostic set:

- fold and tuning integrity;
- nuisance performance and calibration;
- propensity/support and residual checks;
- repeated splits/seeds and learner sensitivity;
- comparison to simpler estimators;
- inference validity statement for the selected estimator;
- explicit statement that DML does not solve unmeasured confounding or positivity failure.

## 7. Report Language

Use careful DML language:

- "orthogonal score with cross-fitted nuisance models";
- "partially linear DML target";
- "interactive regression DML target";
- "learner sensitivity analysis";
- "DML estimate under the stated causal identification assumptions."

Avoid:

- "ML adjusted away confounding";
- "best prediction means best causal estimate";
- "black-box causal proof";
- "valid inference" unless the package/score/splitting supports it.
