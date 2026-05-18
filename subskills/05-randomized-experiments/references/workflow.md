# Workflow: Randomized Experiments and A/B Testing

## Goal

Use this workflow for randomized experiments, A/B tests, randomized clinical trials, field experiments, lab experiments, cluster-randomized trials, factorial trials, crossover trials, SMART designs, randomized encouragement designs, attrition, missing outcomes, and noncompliance.

The workflow is intentionally conservative: randomization is powerful, but only for the contrast actually randomized and only after the experiment implementation and analysis population are understood.

## Stage 0: Decide Whether This Is Really a Randomized Experiment

Ask:

1. Who or what assigned treatment?
2. Was assignment random?
3. Is the random assignment variable observed in the dataset?
4. Did assignment occur before treatment/exposure/outcome?
5. Are all randomized units included, or only units satisfying a post-randomization condition?
6. Does the analysis target assignment, exposure, treatment received, adherence, or a triggered subgroup?

If there is no credible random assignment, route out to the root design router. Possible destinations:

- self-selected treatment: `06-point-treatment-observational`;
- policy timing: `11-did-event-study`;
- cutoff eligibility: `12-regression-discontinuity`;
- instrument/encouragement without full compliance: `13-instrumental-variables`;
- aggregate treated time series: `14-synthetic-control-time-series`.

## Stage 1: Minimal Intake

Construct this experiment specification:

```yaml
causal_question:
experiment_type:
unit_randomized:
unit_analyzed:
assignment_variable:
treatment_received_variable:
arms:
planned_assignment_probabilities:
randomization_scheme:
primary_outcome:
outcome_type:
time_zero:
follow_up_window:
analysis_population:
pre_randomization_covariates:
pre_experiment_metric:
post_randomization_exclusions:
missing_outcomes_or_attrition:
noncompliance_or_crossover:
clustering_or_repeated_measures:
interference_or_spillovers:
multiple_testing_or_peeking:
software_preference:
```

Keep the first user interaction small. If the user provides a dataset but not design details, ask these five high-value questions first:

1. What unit was randomized, and what does one row in the data represent?
2. Which column is randomized assignment, and what were the planned allocation probabilities?
3. What is the primary outcome and follow-up window?
4. Were any units excluded or missing outcomes after randomization?
5. Did all assigned units receive or experience their assigned treatment?

## Stage 2: Define the Estimand

Default to ITT/assignment effect unless the user explicitly asks otherwise.

Common estimands:

- ITT / assignment effect;
- risk difference, risk ratio, odds ratio for binary outcomes;
- mean difference or relative lift for continuous/count/revenue/product metrics;
- CACE/LATE for noncompliance;
- cluster-weighted or individual-weighted effect for cluster randomized trials;
- factorial main effects and interactions;
- time-to-event risk/survival/RMST/CIF contrast;
- per-protocol or as-treated effect, with clear extra assumptions.

State what the chosen estimand is **not** targeting. Example:

> This ITT analysis estimates the effect of being assigned to the new feature. It does not estimate the effect among users who actually used the feature unless additional assumptions are made.

## Stage 3: Audit Randomization and Data Integrity

Required checks:

1. Allocation counts by arm.
2. Sample-ratio mismatch if planned probabilities are known.
3. Duplicated units and units assigned to multiple arms.
4. Consistency between randomization unit and analysis unit.
5. Baseline balance for pre-treatment variables.
6. Missing outcome rate by arm.
7. Post-randomization exclusions by arm.
8. Compliance/exposure table if assignment differs from receipt.
9. Cluster size distribution if clustered.
10. Metric distribution and outliers.
11. Interference/spillover screen.
12. Multiplicity inventory.

### Interpretation of baseline balance

Baseline imbalance does not automatically invalidate a randomized experiment. It may occur by chance. However, extreme imbalance, especially in many covariates or in variables used by the assignment system, can indicate implementation errors, missingness, filtering, or logging problems.

### Sample-ratio mismatch

For online experiments, SRM is a data-quality guardrail. If SRM is significant and unexplained, do not provide a strong final causal interpretation. Investigate assignment logging, eligibility filters, bot filtering, triggered exposure, duplicate units, country/device filters, and bucketing implementation.

## Stage 4: Method Selection

### Simple two-arm individual experiment

Use:

- difference in means or proportions;
- HC2/HC3 robust SE for regression form;
- randomization inference if small sample or exact design inference is desired;
- regression adjustment or CUPED if pre-treatment covariates/pre-period metrics are available.

### Blocked or stratified experiment

Use:

- block-specific differences aggregated by planned weights;
- regression with block fixed effects;
- randomization inference that respects blocks.

Do not ignore blocks if blocking was used to improve precision or guarantee within-block allocation.

### Cluster randomized experiment

First ask whether the estimand is cluster-weighted or individual-weighted.

Use:

- cluster-level analysis for transparent cluster-weighted effects;
- individual-level regression with cluster-robust SE or GEE for individual-weighted effects;
- small-sample corrections if the number of clusters is small;
- randomization inference at the cluster level when feasible.

### Multi-arm experiment

Define all contrasts before testing:

- each treatment versus control;
- treatment A versus treatment B;
- pooled treatment versus control;
- ordered dose-response trend.

Address multiplicity using pre-specified hierarchical testing, adjusted p-values, false-discovery-rate control, or estimation-focused reporting with clear labels.

### Factorial experiment

Estimate main effects and interactions according to the factorial structure. Do not reduce a factorial experiment to many unrelated pairwise tests unless the scientific question is pairwise.

### Crossover trial

Check:

- treatment sequence;
- period effects;
- carryover;
- washout;
- within-unit correlation;
- missing periods.

If carryover is not plausible to rule out, interpret cautiously or restrict to first period as a parallel-arm trial sensitivity analysis.

### Noncompliance

Report ITT primary. For treatment received:

- route to `13-instrumental-variables`;
- estimate CACE/LATE only under IV assumptions;
- do not interpret per-protocol/as-treated comparisons as randomized without assumptions.

### Missing outcomes and attrition

Report missingness by arm. If differential or outcome-related missingness is plausible:

- route to `02-data-technician`;
- consider sensitivity analysis, inverse-probability weighting, multiple imputation, or bounds;
- distinguish the all-randomized estimand from complete-case estimands.

### Survival outcomes

Route to `15-survival-competing-risks`. Define whether the target is:

- risk by time \(t\);
- survival probability difference;
- RMST difference;
- cumulative incidence contrast;
- hazard ratio, only if scientifically justified.

## Stage 5: Code and Reproducibility

Before code, confirm:

- input data path or dataframe name;
- column names;
- treatment coding;
- outcome coding;
- randomization unit and cluster ID;
- assignment probabilities;
- primary metric and follow-up window;
- packages allowed.

Use synthetic fallback data in examples, but production code should adapt to user data.

Never silently install packages. Provide install commands as comments.

## Stage 6: Interpretation

Use this pattern:

```markdown
I would treat this as a randomized-experiments problem because [assignment mechanism]. The primary estimand is [estimand], defined as [formula]. A reasonable primary analysis is [method], implemented with [package], because [design match].

Before final interpretation, I would check [diagnostics]. If [diagnostic failure], I would [fallback route].

The estimate should be interpreted as [assignment/treatment/exposure] effect among [population]. It should not be generalized to [unsupported population/estimand] without [assumption].
```

## Route-Out Decision Table

| Finding | Action |
|---|---|
| Assignment not randomized | Return to root router; consider observational/quasi-experimental designs. |
| Assignment not observed | Cannot estimate ITT directly; consider observational or IV design if an instrument exists. |
| Treatment receipt differs from assignment | Keep ITT in `05-randomized-experiments`; use `13-instrumental-variables` for CACE/LATE. |
| Only triggered/exposed users are in dataset | Warn about post-randomization selection; use `02-data-technician`; define triggered estimand if scientifically intended. |
| Outcome is time-to-event | Use `15-survival-competing-risks`; keep `05-randomized-experiments` for randomization audit. |
| Interference/spillovers plausible | Use `17-interference-spillovers`; redefine exposure mapping. |
| CATE/uplift/single-stage individualized policy requested | Use `09-heterogeneous-effects-individualized-policy`; require honest or held-out evaluation. |
| Dynamic regimes/SMART | Use `10-longitudinal-gmethods`; define regime-level estimands. |
| Mechanism/mediator requested | Use `16-mediation`; do not adjust for mediator in primary total-effect analysis. |

## Code Template Index

- `../examples/r_estimatr_individual_rct.R`
- `../examples/r_fixest_clustered_ab.R`
- `../examples/r_ab_srm_cuped.R`
- `../examples/python_statsmodels_ab_test.py`
- `../examples/python_cluster_robust_rct.py`
- `../examples/python_cuped_ratio_metrics.py`
- `../../../scripts/R/rct_estimatr_template.R`
- `../../../scripts/R/ab_srm_cuped_template.R`
- `../../../scripts/python/ab_testing_statsmodels_template.py`
- `../../../scripts/python/cluster_robust_rct_template.py`
