# Literature and Software: User Data Inspection

## Purpose

This map supports subskill 02. Use it for practical preprocessing before causal analysis: data profiling, variable-role mapping, structure validation, leakage prevention, missingness/outlier summaries, feature construction, and modeling-difficulty triage.

This is intentionally narrower than a missing-data or measurement-error methods guide. If the data problem requires an explicit statistical model for censoring, measurement error, transportability, or nonignorable missingness, route to the relevant analysis subskill and use this preprocessing audit as input.

## Practical Principles

### Start from a causal data model

Before touching variables, identify:

- unit of analysis;
- treatment/exposure;
- treatment timing or assignment time;
- outcome and outcome timing;
- baseline covariate window;
- IDs, groups, clusters, and time variables;
- repeated or longitudinal structure;
- variables that are post-treatment or should be excluded from adjustment.

### Keep preprocessing reproducible

Every preprocessing step should be documented as code or a rule:

- source column;
- derived column;
- rule or transformation;
- timing justification;
- whether it is used for treatment, outcome, covariate, ID, or diagnostic role;
- whether it changes the analysis sample.

### Avoid leakage

Leakage in causal preprocessing often comes from:

- using future visits to define baseline;
- using outcome windows to select features;
- using post-treatment utilization as a confounder;
- selecting covariates based on treatment-effect results;
- learning embeddings/PCA on variables that include post-treatment or outcome information;
- imputing with variables that would not be observed at the decision time.

### Treat preprocessing as part of design

Choices about row filtering, baseline windows, treatment definitions, outcome windows, covariate summaries, and outlier rules are part of the causal design. They should be made before fitting the effect model and carried into the report.

## Data Profiling Checklist

### Basic structure

- rows and columns;
- unique units;
- duplicate keys;
- wide versus long format;
- numeric/categorical/date/text/list columns;
- memory and computational scale.

### Data quality

- missingness by variable and row;
- impossible values;
- date-order errors;
- unit inconsistencies;
- duplicate records;
- rare categorical levels;
- outliers and heavy tails;
- constant or near-constant variables.

### Causal readiness

- treatment count and levels;
- control/comparator count;
- outcome distribution and availability;
- baseline covariate availability;
- pre-treatment outcome history if needed;
- cluster and time support;
- repeated-measure pattern;
- overlap warning signs.

## Variable-Role Notes

### Treatment labels

Check whether treatment is:

- binary, categorical, multivalued, continuous, dose, duration, time-varying, or adoption time;
- assigned at unit, cluster, market, geography, or time level;
- measured before outcome;
- recorded as assignment, initiation, adherence, received dose, or exposure.

### Outcomes

Check whether outcome is:

- continuous, binary, ordinal, count, repeated, event time, or composite;
- measured after treatment;
- available for all units;
- constructed from multiple columns;
- affected by censoring or follow-up.

### Covariates and confounders

Candidate covariates should generally be measured before treatment. Good propensity-score candidates are plausible common causes of treatment and outcome. Bad candidates include mediators, colliders, post-treatment utilization, and variables defined by survival or follow-up after treatment.

### IDs and time

IDs and time variables determine the analysis structure. Always preserve:

- unit ID;
- cluster/site/group ID;
- date/time or visit index;
- treatment date;
- outcome date/window;
- adoption date for panel settings;
- event/censoring date for survival settings.

## Software Notes

### R

- `dplyr`, `tidyr`, `data.table`, `janitor`: cleaning, recoding, reshaping.
- `skimr`, `naniar`, `visdat`, `DataExplorer`: profiling and missingness.
- `lubridate`: date parsing and time windows.
- `recipes`: reusable preprocessing pipelines.
- `mice`: baseline covariate imputation when appropriate.
- `MatchIt`, `WeightIt`, `cobalt`: downstream overlap/balance checks after preprocessing.
- `arrow`, `duckdb`: larger-than-memory preprocessing.

### Python

- `pandas`, `polars`, `numpy`: data manipulation and profiling.
- `pandera`, `great_expectations`: validation rules and data contracts.
- `missingno`, `ydata-profiling`: missingness/profile summaries.
- `scikit-learn`: encoders, scalers, imputers, PCA; use with leakage safeguards.
- `pyjanitor`: cleaning helpers.
- `duckdb`, `pyarrow`: large data workflows.

## Modeling-Difficulty Notes

### Small sample or few treated units

Prefer simple, transparent methods. Matching may discard too much; flexible ML and CATE models can be unstable.

### High dimension relative to sample size

Use screening, regularization, DR/ML workflows, or domain-guided covariate reduction. Avoid unregularized propensity models with many sparse variables.

### Rare outcome

Watch separation, unstable logistic models, too few events per variable, and unreliable subgroup analyses.

### Limited overlap

Preprocessing should surface this before modeling. Consider trimming, overlap weights, redefining target population, or changing design.

### Repeated measures

Do not treat repeated rows as independent. Decide whether the analysis is unit-level, visit-level, person-period, panel, or survival.

### High-cardinality categorical variables

Use domain grouping, regularized encoding, or sparse-aware models. Avoid naive one-hot explosion when sample size is small.

## Red Flags

- no clear treatment column;
- no clear outcome timing;
- no unit ID in repeated data;
- treatment measured after some covariates/outcomes;
- post-treatment variables mixed into baseline covariates;
- high missingness in treatment or outcome;
- severe treatment imbalance;
- too few treated units or outcome events;
- many more covariates than units without a plan;
- repeated measures collapsed without rules;
- outlier removal based on treatment-effect results;
- dimensionality reduction using outcomes or post-treatment variables;
- no audit trail for derived variables.

## Reporting Language

Use language like:

- "The preprocessing audit suggests rows are unit-time observations, not independent people."
- "The covariate set was restricted to variables measured before treatment."
- "These variables were excluded from propensity modeling because their timing appears post-treatment."
- "The sample has high dimensionality relative to treated units, so regularized or doubly robust methods are preferable to an unregularized propensity model."
- "Outcome missingness appears concentrated in one treatment arm; this should be handled by the primary analysis method, not treated as routine preprocessing."
