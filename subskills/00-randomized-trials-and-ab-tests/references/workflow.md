# Randomized Trials And A/B Tests Workflow
## Permission Note

This reference does not authorize execution. Treat diagnostics, artifacts, plots, tables, code, or report material as requests back to main unless main explicitly routed `execution_authorized` after user-confirmed scope.

Use this reference when `SKILL.md` is not enough for randomized trials, A/B tests, encouragement designs, or experiment diagnostics.

## 1. Clarify The Randomized Design

Record the smallest useful experiment description:

- assignment mechanism: complete, Bernoulli, blocked, stratified, clustered, paired, factorial, encouragement, lottery, holdout, or rollout;
- assignment unit and analysis unit;
- eligibility, assignment time, exposure window, and follow-up window;
- arms, variants, control/holdout, and allocation probabilities;
- primary outcome and outcome window;
- estimand: ITT by default, CACE/LATE for noncompliance, or adapted/descriptive targets when post-assignment filtering changes the target.

If treatment receipt is not fully compliant, keep ITT as the primary randomized estimand unless `method_lead` supports an IV/CACE target.

## 2. Check Design Integrity

Minimum checks before analysis:

- assignment log exists and assignment precedes exposure and outcome follow-up;
- allocation probabilities and sample-ratio checks are plausible;
- post-assignment exclusions are explained and do not silently redefine the target;
- blocked, clustered, paired, or factorial structure is represented;
- covariates used for adjustment are pre-assignment;
- missingness, attrition, compliance, contamination, and exposure are summarized by arm;
- exploratory outcomes, subgroups, and windows are labeled as exploratory unless prespecified.

## 3. Choose An Estimator Lane

| Situation | Prefer | Watch |
|---|---|---|
| Simple individual randomization | Difference in means or OLS/GLM with robust SE | uncertainty should match design |
| Strong pre-treatment predictors | ANCOVA, Lin adjustment, or CUPED | covariates must be pre-treatment |
| Blocked, stratified, or paired assignment | block terms, paired analysis, or randomization inference | do not ignore unequal probabilities |
| Cluster randomization or cluster dependence | cluster-level summaries or cluster-robust inference | few clusters need cautious inference |
| Small or constrained assignment | randomization/permutation inference | requires known assignment mechanism |
| Noncompliance or encouragement | ITT plus IV/CACE/LATE review | IV assumptions need review |
| Many outcomes, arms, windows, or subgroups | multiplicity-aware and exploratory labeling | avoid winner's curse language |
| Online A/B testing | SRM, exposure/triggering audit, CUPED/ANCOVA when eligible | triggered analyses can change target |

## 4. Ask For Focused Data Work

Ask for one or two concrete checks at a time:

- assignment counts and SRM by arm;
- eligible-assigned-analyzed flow table;
- missingness, attrition, compliance, and exposure by arm;
- baseline balance using pre-assignment variables;
- cluster sizes, block counts, paired structure, or repeated measures;
- first-pass ITT estimate with design-matched uncertainty;
- multiplicity inventory for outcomes, arms, subgroups, or windows.

## 5. Coordinate With Other Method Subskills

Use this route with:

- `05-instrumental-variables` support for receipt effects or encouragement designs;
- `07-interference-spillovers` support when units affect each other;
- `10-heterogeneous-effects` or `11-point-treatment-rules` when the user wants subgroup, CATE, uplift, or targeting;
- `14-transportability-generalizability` support for claims beyond the randomized sample;
- `23-survival-competing-risks` support for time-to-event outcomes;
- `21-doubly-robust-estimation` or `22-double-machine-learning` support for precision, nuisance modeling, or honest heterogeneity exploration inside a valid experimental route.

## 6. Report Language

Prefer:

- "intention-to-treat effect of assignment";
- "randomized comparison among eligible assigned units";
- "complier average causal effect under stated IV assumptions";
- "exploratory subgroup analysis";
- "randomization-inference p-value under the recorded assignment mechanism."

Avoid stronger wording when the record only supports treatment receipt, triggered subsets, exploratory subgroups, or target-population claims.
