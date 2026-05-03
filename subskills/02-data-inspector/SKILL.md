---
name: data-inspector
description: "Use as the concurrent backend data and preprocessing component in a causal project. When actual user data exist, inspect, validate, and prepare them for causal analysis: sample size, dimensionality, missingness, outliers, repeated measures, IDs, time variables, treatment labels, outcome variables, candidate covariates, confounder proxies, propensity-score inputs, clustering, longitudinal/cohort/panel structure, feature construction, transformations, and modeling difficulty triage. When data do not exist, keep the data entry conceptual and record the expected or hypothetical schema. Always set data_existence_status in the data-inspector YAML as existing, partially existing, conceptual, or unknown. Coordinate with the main skill, domain helper, design planner, and DAG builder; route out when a data issue requires an explicit causal/statistical model rather than preprocessing."
---

# Data Inspector

## Core Behavior

When this subskill is invoked, treat it as the concurrent backend record for data structure and preprocessing. The main skill usually talks with the user; this component inspects actual data when available, or describes the expected/planned data structure when no actual data exist. In both cases, infer the intended causal structure, check whether rows and variables match that structure or would need to be collected, and create a clean analysis-ready dataset or preprocessing/data-requirements plan for downstream causal subskills.

This component should coordinate with the other foundation records. It receives the user's goal from the main skill and domain expectations from `01-domain-helper`, gives observed or expected schema constraints to `03-design-planner`, and gives variable and timing facts to `04-dag-builder`. It can flag likely routes, but method selection should be finalized only after domain, design, and DAG/causal-logic records are considered.

This subskill is **not** primarily a specialized bias-correction methods skill. Missing values, measurement error, censoring, and sampling issues are handled here only to the extent needed to decide whether ordinary preprocessing is enough or whether the analysis must route to a method that explicitly models the data-generating or observation process.

Always do these six things:

1. **Infer the expected data structure from domain context.** Before inspecting columns mechanically, form lightweight assumptions about the unit, treatment, outcome, timing, grouping, and likely covariates based on the user's domain story.
2. **Set the data existence status and profile accordingly.** In the YAML entry, set `data_existence_status` to `existing`, `partially existing`, `conceptual`, or `unknown`, then set the more descriptive `data_basis`. For existing data, summarize rows, columns, sample size, dimensionality, variable types, missingness, duplicates, outliers, rare levels, constant/near-constant columns, ranges, IDs, time variables, and outcome availability. For conceptual data, record the expected unit, rows, key variables, timing, and minimum schema instead of reporting nonexistent diagnostics.
3. **Map variables to causal roles.** Identify treatment/exposure labels, outcome variables, baseline covariates, plausible confounders, effect modifiers, mediators/post-treatment variables, cluster/group IDs, time variables, censoring/observation indicators, and variables with unclear timing.
4. **Validate structure against assumptions.** Check whether the data look like cross-sectional, cohort, panel, longitudinal, repeated-measures, clustered, networked, survival, aggregate time-series, or high-dimensional data, and whether the columns needed for that structure are present.
5. **Flag modeling difficulties early.** Record issues that affect later method choice: high \(p/n\), sparse treatment groups, rare outcomes, many missing covariates, severe imbalance, poor overlap, too few clusters/time periods, repeated outcomes, irregular visits, high-cardinality categoricals, and leakage-prone variables.
6. **Separate preprocessing from method handoffs.** Do safe preprocessing when possible. Route out when the issue requires explicit methods such as survival censoring models, longitudinal g-methods, measurement-error correction, MNAR sensitivity, transport weighting, or post-fit diagnostics.

## User-Facing Style

Be quietly investigative. In the full project workflow, this component usually does not speak as a separate persona; the main skill surfaces its findings to the user. Start from the user's description, make provisional assumptions, then test those assumptions against the data. Do not ask the user to classify every variable manually if the dataset gives strong clues; infer first, then ask targeted questions through the main skill.

Good early response pattern:

> I will treat this as a causal data-preprocessing step first. Based on your description, I am going to assume rows are [unit], treatment is measured around [time], outcomes are measured after that, and these columns are likely baseline covariates. I will check whether the actual data support that structure and flag anything that would affect later causal modeling.

When explaining concerns, tie them to downstream validity:

- "This column looks post-treatment, so using it in a propensity score could block part of the treatment effect."
- "There are only 18 treated units, so flexible propensity or CATE models may be unstable."
- "The data look repeated by patient ID, so treating rows as independent would understate uncertainty."
- "The outcome is missing mostly in one treatment group, so this is no longer just a preprocessing issue."

## Activation and Route-Out

Use this subskill when the user says or implies:

- preprocess data for causal inference, inspect dataset, data audit, data readiness, prepare data, clean data, causal variables, identify treatment/outcome/covariates, propensity-score variables, confounders, baseline covariates, repeated measures, cohort data, panel data, longitudinal data, cluster IDs, time variables, sample size, high-dimensional data, missingness, outliers, transformations, categorical encoding, standardization, dimension reduction, feature construction, leakage, duplicate rows, data dictionary, or "is this data suitable for causal analysis?"

Do **not** use this as the only workflow when:

- the user already has a cleaned dataset and wants the causal estimator: route to the relevant method subskill;
- missing outcome, censoring, or attrition is central to identification: coordinate with `subskills/15-survival-competing-risks/`, `10-longitudinal-gmethods/`, or the primary method;
- treatment or outcome measurement error must be corrected explicitly: route to a measurement-error/sensitivity plan through the primary method and reporting workflow;
- the user needs post-fit diagnostics, limitations, or final write-up: route to `subskills/20-reporting-interpretation/`;
- the user is designing data collection rather than preprocessing existing data: coordinate with `subskills/03-design-planner/`; keep this data track active but set `data_existence_status: conceptual` rather than `existing`;
- the data are genomics/omics and batch/ancestry/QTL-specific issues dominate: coordinate with `subskills/19-causal-genomics/`;
- the dominant issue is network exposure or spillover mapping: coordinate with `subskills/17-interference-spillovers/`.

If this route is rejected, update the `subskill_analyses` entry as `rejected`, `fallback`, or `exploratory/user-forced`, record the failed condition, and return to the main skill's route shortlist.

## Causal Data Preprocessing Entry

When a project specification is being maintained, append or update this compact entry under the top-level `subskill_analyses` list. Use `assets/data_inspector_entry.yaml` as the reusable template. Fill only fields that are known or decision-relevant.

```yaml
subskill_analyses:
  - subskill_id: "02-data-inspector"
    status: "candidate | selected | rejected | fallback | exploratory/user-forced"
    fit_to_user_need: null
    data_existence_status: "existing | partially existing | conceptual | unknown"
    data_basis: "actual user data | partial user data | conceptual data | unknown"
    data_evidence_source: "uploaded file | local file path | codebook | column list | sample rows | summary table | study plan | simulated/mock data | user description | none | unknown"
    user_task: "data audit | variable-role mapping | preprocessing plan | structure validation | propensity covariate prep | longitudinal/panel prep | high-dimensional prep | model-difficulty triage | unknown"
    coordination:
      main_skill_goal_summary: null
      domain_record_used: "01-domain-helper"
      design_record_to_update: "03-design-planner"
      dag_record_to_update: "04-dag-builder"
      user_facing_summary_for_main_skill: null
    inferred_domain_assumptions:
      expected_unit: null
      expected_treatment_or_exposure: null
      expected_outcome: null
      expected_time_zero: null
      expected_baseline_window: null
      expected_follow_up_window: null
      expected_grouping_or_repeated_structure: null
      assumptions_to_verify: []
    dataset_profile:
      rows: null
      columns: null
      unique_units: null
      candidate_unit_id_columns: []
      candidate_time_columns: []
      candidate_group_cluster_columns: []
      wide_or_long_format: "wide | long | one-row-per-unit | one-row-per-unit-time | one-row-per-event | unknown"
      numeric_columns: []
      categorical_columns: []
      high_cardinality_columns: []
      constant_or_near_constant_columns: []
      duplicate_key_rows: null
      missingness_summary: null
      outlier_or_range_issues: []
      expected_schema_when_no_actual_data: []
      diagnostics_not_observable_without_actual_data: []
    variable_role_map:
      treatment_variables: []
      treatment_type: "binary | categorical | continuous | dose | time-varying | multi-arm | unknown"
      treatment_unit_or_level: null
      outcome_variables: []
      outcome_type: "continuous | binary | count | ordinal | time-to-event | repeated | unknown"
      candidate_baseline_covariates: []
      plausible_confounders: []
      effect_modifiers: []
      propensity_score_candidates: []
      mediators_or_post_treatment_variables: []
      instruments_or_encouragements: []
      censoring_or_observation_indicators: []
      variables_with_unclear_role_or_timing: []
      variables_to_exclude_from_adjustment: []
    structure_checks:
      cross_sectional: null
      cohort_or_follow_up: null
      repeated_measures_or_longitudinal: null
      panel_or_time_series: null
      clustered_or_multilevel: null
      survival_or_censoring: null
      network_or_spillover: null
      high_dimensional_features: null
      required_columns_missing: []
    preprocessing_plan:
      safe_cleaning_steps: []
      recoding_or_type_conversion: []
      treatment_label_construction: []
      outcome_construction: []
      baseline_covariate_construction: []
      categorical_encoding_plan: []
      transformation_or_scaling_plan: []
      missingness_handling_plan: []
      outlier_handling_plan: []
      dimension_reduction_or_screening_plan: []
      leakage_checks: []
      reproducibility_notes: []
    modeling_difficulty_flags:
      small_sample_or_few_treated: null
      high_dimension_relative_to_sample: null
      rare_outcome_or_separation: null
      treatment_imbalance: null
      limited_overlap_or_positivity: null
      too_few_clusters_or_time_periods: null
      irregular_follow_up_or_visit_times: null
      high_missingness_in_key_variables: null
      high_cardinality_or_sparse_levels: null
      post_treatment_covariate_risk: null
      likely_modeling_handoffs: []
    route_recommendation:
      likely_primary_causal_routes: []
      routes_to_avoid_or_defer: []
      required_data_fixes_before_modeling: []
      issues_requiring_explicit_modeling_not_preprocessing: []
      open_questions_for_user: []
```

## Core Workflow

### 0. Label data existence

Before profiling, set `data_existence_status` in the YAML entry:

- `existing`: actual records/files were provided and can be inspected;
- `partially existing`: only a codebook, column list, sample rows, summary tables, partial extract, or existing result exists;
- `conceptual`: no user data exist yet, or the work is based on a planned design, hypothetical schema, mock/example data, or purely conceptual data needs;
- `unknown`: the data status is not yet clear.

Then set `data_basis` as a human-readable companion label:

- `actual user data`: records/files were provided and can be inspected;
- `partial user data`: only a codebook, column list, sample rows, summary tables, or partial extract exists;
- `conceptual data`: planned data, hypothetical schemas, mock/example data, simulated scaffolds, or conceptual data needs;
- `unknown`: the basis is not yet clear.

Do not blur these labels. A conceptual schema can be useful for design planning or teaching, but it must not be described as evidence about the user's population.

### 1. Infer before inspecting

Use the user's domain language to infer likely structure:

- "patients receiving a drug" usually implies person-level units, treatment initiation, baseline covariates, follow-up outcomes, possible censoring;
- "schools adopting a policy over years" implies panel or DiD structure with school IDs and time;
- "users exposed to a feature" implies experiment or observational product data, possible clustering, interference, and logging artifacts;
- "biomarker mediates treatment" implies treatment, mediator timing, outcome timing, batch/assay concerns;
- "county policy effect" implies aggregate panel, spatial spillovers, time-series checks, and donor/comparison contamination.

Then inspect whether actual data have the required IDs, times, labels, and outcome windows, or record those fields as requirements when the data are conceptual.

### 2. Profile the dataset

Minimum profile:

- number of rows and columns;
- unique unit IDs and duplicate keys;
- candidate time variables and date ranges;
- treatment counts and treatment levels;
- outcome availability and outcome distribution;
- missingness by column and key roles;
- variable types and high-cardinality fields;
- outliers, impossible values, and rare categories;
- cluster/group sizes and repeated-measure counts;
- \(p/n\), treated/control sample sizes, and events-per-variable when relevant.

If no actual data exist, replace this with a minimum expected profile: causal unit, expected row structure, required ID/time/group variables, treatment/exposure fields, outcome fields, baseline covariates, mediator or censoring fields when relevant, and expected sample-size or dimensionality constraints.

### 3. Map causal roles

Create a variable-role table before modeling:

| Role | Examples | Preprocessing caution |
|---|---|---|
| Treatment/exposure | drug, policy, feature flag, dose, adoption date | define timing, levels, unit, and contrast |
| Outcome | biomarker, disease, revenue, event time | must occur after treatment; avoid post-hoc winsorization |
| Baseline covariate | age, sex, pre-period outcome, comorbidity | safe for adjustment if measured before treatment |
| Confounder proxy | prior utilization, severity, socioeconomic variables | include if common cause of treatment and outcome |
| Effect modifier | subgroup, risk score, site | keep for heterogeneity if support exists |
| Mediator/post-treatment | adherence, post-treatment lab, intermediate behavior | do not use in total-effect propensity score |
| ID/time/group | patient ID, school ID, date, cluster | determines structure and inference |
| Observation/censoring | follow-up status, visit observed | may require method handoff |

### 4. Decide safe preprocessing

Usually safe:

- type conversion and unit standardization;
- deterministic recoding based on a codebook;
- constructing baseline summaries from pre-treatment windows;
- one-hot encoding or target-safe categorical grouping;
- scaling/normalizing covariates for algorithms;
- unsupervised dimension reduction using baseline covariates only;
- documenting and preserving raw variables.

Potentially unsafe:

- dropping rows with missing outcome or treatment without checking patterns;
- using post-treatment variables in propensity scores;
- selecting covariates by association with the outcome using all data;
- using future visits to define baseline;
- winsorizing outcomes after inspecting treatment effects;
- deriving treatment labels from post-outcome behavior;
- collapsing rare categories that encode meaningful treatment assignment mechanisms;
- PCA or embeddings learned from variables that include outcomes or mediators.

### 5. Flag modeling difficulties

Record these before choosing methods:

- too few treated units for matching, weighting, ML, or CATE;
- high \(p/n\) for propensity or outcome models;
- rare binary outcome and separation risk;
- continuous treatment with sparse dose support;
- multi-arm treatment with rare arms;
- covariate distributions with little overlap;
- high missingness in confounders or outcomes;
- many clusters but few units per cluster, or few clusters total;
- panel data with too few pre-periods;
- longitudinal data with irregular visits;
- high-cardinality IDs/categories;
- strong site/batch/time effects;
- likely post-treatment covariates mixed into candidate covariates.

## Preprocessing vs Method Handoff

| Finding | Preprocess here? | Route/handoff |
|---|---|---|
| Wrong data types, units, duplicates, impossible values | yes | keep audit trail |
| Missing baseline covariates | often yes, with imputation plan | matching/weighting/DR if it affects adjustment |
| Missing treatment labels | partly | define exposure hierarchy; sensitivity if uncertain |
| Missing outcomes or dropout related to treatment/prognosis | not only preprocessing | survival, longitudinal, DR/IPW, or sensitivity |
| Time-to-event outcome or censoring | no | survival/competing risks |
| Repeated treatments and time-varying confounding | no | longitudinal g-methods |
| Measurement error in treatment/outcome | no | explicit measurement-error or sensitivity analysis |
| Sample differs from target population | partly | transport/generalizability plan through primary route/reporting |
| High-dimensional covariates | yes, if baseline and leakage-safe | DR/ML or simpler model depending on \(p/n\) |
| Potential mediators in covariate set | no for total effect | mediation if direct/indirect effects are target |
| Spillover/network exposure variables needed | partly | interference/spillovers |

## Language Backend Policy

Do not install packages silently. If packages are missing, show install commands and ask for approval.

### R

- `dplyr`, `tidyr`, `data.table`, `janitor`: cleaning, joins, reshaping.
- `skimr`, `naniar`, `visdat`, `DataExplorer`: data profile and missingness maps.
- `lubridate`: time variables and baseline/follow-up windows.
- `recipes`: reproducible preprocessing pipelines.
- `mice`: imputation when appropriate.
- `cobalt`, `WeightIt`, `MatchIt`: overlap/balance diagnostics after preprocessing.
- `arrow`, `duckdb`: larger datasets.

### Python

- `pandas`, `polars`, `numpy`: cleaning, profiling, reshaping.
- `pandera`, `great_expectations`: validation rules.
- `missingno`, `ydata-profiling`: missingness/profile reports.
- `scikit-learn` preprocessing tools: encoders, scalers, imputers, PCA; use only with timing/leakage safeguards.
- `pyjanitor`: cleaning helpers.
- `duckdb`, `pyarrow`: larger data workflows.

When the user proposes a preprocessing package, check whether it preserves IDs/time, avoids leakage, can be run reproducibly, and can be fit only on allowed training/baseline information when needed.

## Required Diagnostics

### General data profile

- row and column counts;
- unit count and duplicate unit/time keys;
- variable type table;
- missingness by variable and role;
- numeric ranges and impossible values;
- categorical levels and rare categories;
- treatment and outcome distributions;
- sample size by treatment arm and outcome availability.

### Structure diagnostics

- one row per unit, unit-time, visit, event, cluster, or aggregate time point;
- candidate ID/time/group columns;
- repeated-measure count per unit;
- time ordering of treatment, covariates, mediators, and outcomes;
- cluster sizes and number of clusters;
- panel balance and pre/post periods;
- survival/event/censoring columns if relevant.

### Causal-role diagnostics

- treatment label validity and contrast;
- outcome timing and construction;
- baseline covariate timing;
- candidate confounder coverage;
- post-treatment variables excluded or marked;
- propensity-score candidate list;
- support/overlap warning based on treatment counts and covariate ranges;
- leakage audit.

### Modeling-difficulty diagnostics

- \(n\), \(p\), and \(p/n\);
- treated/control counts and rare arms;
- outcome event count;
- missingness in treatment, outcome, and key covariates;
- high-cardinality categorical variables;
- near-zero variance columns;
- separation risk for binary outcomes;
- few clusters/time periods;
- sparse dose or exposure regions.

## Failure Modes and Guardrails

Escalate warnings when:

- rows are treated as independent despite repeated IDs;
- time-varying data are collapsed without defining time zero;
- treatment labels are built using future information;
- outcomes are measured before or at the same time as treatment;
- post-treatment variables are included as baseline confounders;
- mediator variables are added to propensity scores for a total-effect analysis;
- covariates are selected using outcome associations in a leakage-prone way;
- high-dimensional data are fed into simple propensity models without regularization or screening;
- rare treatment arms are modeled as if support is strong;
- complete-case filtering removes most treated or outcome-positive units;
- outlier removal changes treatment groups asymmetrically;
- missingness is "fixed" but the missingness pattern indicates a method handoff is needed;
- preprocessing decisions are not reproducible.

## Step-by-Step Operating Procedure

1. Restate the user's domain story and infer the expected unit, treatment, outcome, timing, and structure.
2. Set `data_existence_status` as `existing`, `partially existing`, `conceptual`, or `unknown`, then set the companion `data_basis` label.
3. Inspect the actual dataset profile when records exist: rows, columns, IDs, times, types, missingness, outliers, duplicates, and dimensions. If no records exist, draft the expected schema and mark diagnostics as not yet observable.
4. Identify treatment, outcome, candidate covariates, plausible confounders, effect modifiers, IDs, groups, and time variables.
5. Check whether the observed or planned structure matches the expected design: cross-sectional, cohort, panel, longitudinal, clustered, survival, networked, or aggregate.
6. Build a variable-role map and mark variables that should not be used for the planned estimand.
7. Create a safe preprocessing plan or data-requirements plan: recodes, transformations, encoding, baseline summaries, imputation if appropriate, and reproducibility notes.
8. Flag modeling difficulties that constrain later causal method choice.
9. Decide which issues are preprocessing-only and which require explicit method handoff.
10. Recommend the likely next causal subskill route.
11. Record open questions for the user, focusing only on details the data cannot resolve.

## Output Template

```markdown
### Causal Data Preprocessing Plan

#### 1. Working assumptions
- Data existence status:
- Data basis:
- Expected unit:
- Treatment/exposure:
- Outcome:
- Time zero:
- Expected structure:

#### 2. Data profile
- Rows/columns:
- Unit/time/group IDs:
- Treatment distribution:
- Outcome distribution:
- Missingness:
- Outliers/range issues:
- Dimensionality:

#### 3. Variable-role map
- Treatment variables:
- Outcome variables:
- Candidate baseline covariates:
- Plausible confounders:
- Propensity-score candidates:
- Effect modifiers:
- Post-treatment/mediator variables to exclude:
- Unclear variables:

#### 4. Structure checks
- Cross-sectional/cohort/panel/longitudinal:
- Repeated measures:
- Clustering:
- Survival/censoring indicators:
- Required columns missing:

#### 5. Preprocessing plan
- Safe cleaning:
- Recoding/encoding:
- Transformations/scaling:
- Missingness handling:
- Outlier handling:
- Dimension reduction/screening:
- Leakage checks:

#### 6. Modeling implications
- Main difficulties:
- Methods likely suitable:
- Methods to avoid or use cautiously:
- Issues needing explicit modeling:
- Next subskill route:
```

## Related Subskills

- `subskills/04-dag-builder/`: use when variable roles, confounders, mediators, colliders, or adjustment sets are unclear.
- `subskills/06-point-treatment-observational/`: use after preprocessing for baseline observational treatment effects.
- `subskills/07-matching-weighting-balance/`: use when propensity-score covariates, overlap, matching, or weights are next.
- `subskills/08-doubly-robust-ml/`: use when high-dimensional covariates or flexible nuisance models are needed.
- `subskills/09-heterogeneous-effects-policy/`: use when preprocessing reveals effect-modifier or policy-learning goals.
- `subskills/10-longitudinal-gmethods/`: use when repeated measures, time-varying treatment, or time-varying confounding dominate.
- `subskills/11-did-event-study/`: use when preprocessing reveals panel/staggered adoption structure.
- `subskills/14-synthetic-control-time-series/`: use for aggregate time-series/donor-pool structures.
- `subskills/15-survival-competing-risks/`: use when event time, censoring, or competing events are central.
- `subskills/16-mediation/`: use when post-treatment mediators are central to the question.
- `subskills/17-interference-spillovers/`: use when IDs/network/geography imply spillovers.
- `subskills/19-causal-genomics/`: use when genomics/omics preprocessing has specialized batch, ancestry, or QTL concerns.
- `subskills/20-reporting-interpretation/`: use for post-fit diagnostics, limitations, and final reporting.

## Reference Files

For the detailed workflow, read `references/workflow.md`. For preprocessing and software notes, read `references/literature_and_software.md`. For the reusable YAML entry, use `assets/data_inspector_entry.yaml`.
