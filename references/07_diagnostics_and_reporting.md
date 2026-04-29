# Diagnostics, Visualization, and Reporting

Diagnostics should be specified before interpretation. Different designs require different diagnostics.

## Universal Diagnostics

1. Data flow diagram or sample restriction table.
2. Treatment and outcome timing diagram.
3. Baseline covariate table by treatment group.
4. Missingness table and missingness mechanism discussion.
5. Assumption ledger.
6. Sensitivity/robustness plan.
7. Reproducibility notes: code, packages, versions, random seeds.

## Matching/Weighting Diagnostics

Required:

- standardized mean differences before and after adjustment;
- Love plot;
- propensity score overlap plot;
- covariate distribution plots for important variables;
- weight distribution, including min/max/percentiles;
- effective sample size;
- trimmed or discarded units;
- estimand after trimming or matching.

## Doubly Robust / ML Diagnostics

Required:

- nuisance model specification or learner library;
- sample splitting/cross-fitting design;
- overlap diagnostics if treatment mechanism is involved;
- influence-function or robust standard errors;
- sensitivity to learner library and tuning if feasible;
- statement that ML prediction quality does not validate exchangeability.

## HTE/Policy Diagnostics

Required:

- pre-specified versus exploratory heterogeneity statement;
- CATE distribution;
- calibration or best linear projection if available;
- subgroup/GATE estimates with uncertainty;
- policy value estimate with uncertainty;
- validation or honest sample splitting;
- caution against overinterpreting individual-level CATEs.

## Longitudinal Diagnostics

Required:

- timeline diagram;
- treatment/censoring model diagnostics for IPW;
- weight distribution at each time and cumulative weights;
- effective sample size over time;
- positivity checks for treatment regimes;
- sensitivity to truncation/stabilization;
- g-formula model checks if parametric g-formula is used.

## DiD/Event Study Diagnostics

Required:

- treatment timing/cohort table;
- pre-treatment trends plot;
- event-study plot;
- no-anticipation discussion;
- group-time ATT table;
- sensitivity to control group choice;
- placebo periods or outcomes if feasible;
- cluster-robust standard errors.

## RD Diagnostics

Required:

- running-variable histogram/density near cutoff;
- manipulation/density check;
- RD plot with binned means;
- bandwidth sensitivity;
- polynomial/order/kernel sensitivity;
- covariate continuity checks;
- sharp versus fuzzy design statement;
- local estimand statement.

## IV Diagnostics

Required:

- first-stage estimate;
- weak-instrument diagnostic;
- reduced-form estimate;
- IV estimate and uncertainty;
- complier/LATE interpretation;
- exclusion restriction discussion;
- overidentification checks if multiple instruments;
- sensitivity analysis or falsification tests where possible.

## Synthetic Control / Time-Series Diagnostics

Required:

- intervention date and pre/post periods;
- donor pool description;
- pre-treatment fit plot;
- treated versus synthetic/control time-series plot;
- placebo/permutation tests where feasible;
- sensitivity to donor pool and predictor set;
- discussion of concurrent shocks and contaminated controls.

## Survival/Competing-Risk Diagnostics

Required:

- risk set and time-zero definition;
- censoring summary by treatment;
- adjusted survival or cumulative incidence curves;
- RMST if clinically meaningful;
- censoring weight diagnostics if IPCW is used;
- competing-risk estimand statement;
- avoid interpreting hazard ratios as risks.

## Mediation Diagnostics

Required:

- DAG for treatment, mediator, outcome, mediator-outcome confounders;
- temporal ordering of treatment, mediator, outcome;
- total effect, direct effect, indirect effect definitions;
- sensitivity to mediator-outcome confounding;
- warning about cross-world assumptions for natural effects.

## Interference Diagnostics

Required:

- network/cluster structure summary;
- exposure mapping definition;
- positivity for exposure categories;
- direct and spillover effect definitions;
- cluster/network robust inference;
- sensitivity to exposure mapping.

## Reporting Language

Use language like:

> Under the stated assumptions, the estimated average treatment effect was ...

Avoid language like:

> The model proved that treatment causes ...

unless the design truly supports that level of certainty, and even then state assumptions.

## Final Report Sections

1. Executive summary.
2. Scientific question and estimand.
3. Data and design.
4. Identification assumptions.
5. Methods.
6. Diagnostics.
7. Results.
8. Sensitivity analyses.
9. Interpretation.
10. Limitations.
11. Reproducibility appendix.
