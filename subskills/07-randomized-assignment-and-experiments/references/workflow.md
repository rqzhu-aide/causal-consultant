# Randomized Assignment And Experiments Workflow

Use this reference when `SKILL.md` is not enough for randomized trials, field experiments, A/B tests, encouragement designs, or experiment diagnostics.

## 1. Clarify The Randomized Design

Record the smallest useful experiment description:

- Assignment mechanism: complete, Bernoulli, blocked, stratified, clustered, paired, rerandomized, factorial, encouragement, or rollout.
- Unit of assignment: individual, household, school, cluster, user, session, device, market, region, or other unit.
- Unit of analysis: whether it matches assignment or requires clustered/paired/repeated-measure handling.
- Eligibility and time zero: who entered the experiment, when assignment happened, and when follow-up began.
- Arms and probabilities: treatment variants, holdout/control, allocation probability, and whether allocation was equal.
- Outcome window: primary outcome, follow-up length, pre-period covariates, and missing/censored outcomes.
- Estimand: ITT by default; CACE/LATE if assignment only encourages receipt; subgroup, policy, transport, or survival targets as separate modules.
- Analysis set: intention-to-treat population, exclusions, triggered subset, per-protocol subset, or exposure-defined subset.

If receipt or exposure is not fully compliant, keep ITT as the primary randomized estimand unless `method_lead` explicitly supports an IV/CACE or other adjusted target.

## 2. Check Design Integrity

Minimum checks before analysis:

- assignment log exists and assignment precedes treatment/exposure;
- no post-assignment exclusions are silently redefining the estimand;
- sample-ratio mismatch or allocation-probability checks pass or are explained;
- blocked, clustered, paired, or factorial structure is represented in the analysis plan;
- baseline covariates used for adjustment are measured before assignment;
- missingness and attrition are summarized by arm;
- compliance, crossover, contamination, and spillovers are measured or bounded;
- all exploratory subgroups, outcomes, and follow-up windows are labeled as exploratory unless prespecified.

## 3. Choose An Estimator Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| Simple individual randomization, large enough sample | Difference in means or OLS with robust SE | Transparent ITT estimate | Model-based SE should match assignment assumptions |
| Covariates strongly predict outcome | ANCOVA, Lin-style interacted regression adjustment, CUPED for online experiments | Improves precision without changing ITT target | Covariates must be pre-treatment; avoid post-treatment controls |
| Blocked, stratified, paired, or rerandomized assignment | Block fixed effects, strata weighting, paired analysis, or randomization inference | Respects assignment mechanism | Do not ignore blocks if probabilities differ |
| Cluster randomized trial or cluster dependence | Cluster-level summaries, mixed or marginal models, cluster-robust SE | Matches assignment/dependence structure | Few clusters need cautious inference |
| Small sample or constrained assignment | Randomization inference or permutation test | Design-based inference, fewer asymptotic assumptions | Requires known assignment mechanism |
| Noncompliance or encouragement | ITT plus IV/CACE/LATE analysis | Separates assignment effect from receipt effect | IV assumptions and monotonicity need review by `12-instrumental-variables` |
| Many arms/outcomes/subgroups | Multiplicity-aware plan and hierarchical reporting | Reduces false discovery and winner's curse | Exploratory results need cautious wording |
| Online A/B test with pre-period metrics | CUPED/ANCOVA, SRM checks, trigger/exposure audits | Handles common product-experiment issues | Triggered analyses can change target population |

## 4. Ask For Focused Data Work

Ask for one or two concrete checks at a time:

- assignment counts and SRM test by experiment cell;
- experiment-flow table from eligible to analyzed sample;
- treatment receipt, exposure, crossover, and compliance by assignment arm;
- baseline balance table using variables known before assignment;
- missing outcome and attrition table by arm;
- cluster sizes, number of clusters, and unit-level dependence checks;
- first-pass ITT estimate with robust or cluster-robust SE;
- randomization-inference p-value if assignment is small or constrained;
- CUPED/ANCOVA precision comparison if pre-period outcomes exist.

## 5. Coordinate With Other Subskills

Use the experiment route with other modules when the user's target goes beyond a simple ITT:

- `12-instrumental-variables`: noncompliance, encouragement, CACE/LATE, or receipt effects.
- `14-interference-spillovers`: spillovers, contamination, network exposure, or cluster exposure.
- `20-heterogeneous-effects`: subgroup, CATE, or effect-modifier questions.
- `21-point-treatment-rules`: treatment targeting, prioritization, or policy learning from experimental data.
- `24-transportability-generalizability`: trial-to-target or experiment-to-population claims.
- `31-doubly-robust-estimation` or `32-double-machine-learning`: precision, heterogeneity, or flexible nuisance components when design and evaluation allow them.
- `33-survival-competing-risks`: time-to-event outcomes, censoring, or competing risks.

## 6. Diagnose Before Reporting

Minimum diagnostic set:

- assignment integrity and SRM/allocation check;
- baseline balance and pre-treatment covariate adjustment description;
- analysis-set flow and post-assignment exclusion rationale;
- attrition/missingness by arm;
- compliance/receipt/contamination when treatment receipt differs from assignment;
- cluster/block/unit-of-analysis handling;
- primary versus exploratory outcomes, subgroups, and windows;
- sensitivity to covariate adjustment, analysis set, outlier rules, and follow-up window.

## 7. Report Language

Use clear design-based language:

- "intention-to-treat effect of assignment";
- "complier average causal effect under the stated IV assumptions";
- "randomized comparison among eligible assigned units";
- "exploratory subgroup analysis";
- "randomization-inference p-value under the recorded assignment mechanism."

Avoid:

- "effect of treatment receipt" when only assignment was randomized;
- "per-protocol randomized effect" without explaining post-assignment selection;
- "optimal variant" when many arms/outcomes were explored without multiplicity or replication;
- "representative of the target population" without transport/generalizability support.
