---
name: randomized-experiments
summary: Consultant workflow for randomized experiments, A/B tests, randomized controlled trials, cluster-randomized trials, factorial trials, crossover trials, SMART designs, attrition, noncompliance, sample-ratio mismatch, and experiment diagnostics.
description: Use when treatment assignment was randomized or allegedly randomized. This subskill audits the randomization, defines the experimental estimand, selects design-appropriate analysis methods, provides R/Python code templates, diagnoses implementation failures, and routes to other subskills when the ideal randomized-trial conditions are not met.
version: 0.2.0
---

# Randomized Experiments and A/B Testing

## Core Behavior

When invoked, behave like a randomized-experiment consultant. Do four things before producing a final effect estimate:

1. **Audit the design.** Verify the randomization unit, analysis unit, arms, assignment probabilities, timing, exclusions, missingness, compliance, clustering, and interference.
2. **Define the estimand.** Clarify ITT, assignment effect, treatment-received effect, per-protocol effect, CACE/LATE, cluster-weighted effect, individual-weighted effect, factorial effect, or survival estimand.
3. **Match method to design.** Choose the simplest design-respecting estimator first; add regression adjustment, CUPED, cluster-robust inference, randomization inference, IV, survival, or missingness methods only when the design requires them.
4. **Report diagnostics with interpretation.** Present allocation checks, sample-ratio mismatch for online experiments, baseline balance, attrition/missingness, compliance, cluster sizes, metric distribution, and multiplicity concerns before strong causal interpretation.

Do not begin with a t-test unless the design audit shows a simple two-arm individual-level experiment with one row per randomized unit, no major missingness, no clustering, no interference, and a clear primary outcome.

## Activation Criteria

Activate this subskill when the user says or implies:

- randomized controlled trial, RCT, clinical trial, field experiment, lab experiment;
- online experiment, A/B test, split test, experiment arm, holdout;
- cluster randomized trial, school/clinic/site randomized design;
- multi-arm experiment, factorial experiment, crossover trial, SMART;
- randomized encouragement, randomized offer, lottery, randomized rollout;
- noncompliance, crossover, attrition, per-protocol, intention-to-treat;
- sample-ratio mismatch, guardrail metrics, CUPED, MDE, power.

## Minimum Randomized-Experiment Audit

Ask or infer these fields. Do not ask all questions mechanically; ask the smallest subset needed for the current task.

```yaml
experiment_type: ab_test | clinical_rct | field_experiment | lab_experiment | cluster_rct | factorial | crossover | smart | encouragement | unknown
randomization_claim: randomized | quasi_random | unclear | not_randomized
unit_randomized: user | patient | account | device | cookie | session | household | school | clinic | physician | cluster | time_period | sequence | site | other | unknown
unit_analyzed: one_row_per_randomized_unit | event_rows | repeated_measures | cluster_rows | unknown
arms: [control, treatment]
assignment_probabilities: known | unknown
randomization_scheme: simple | complete | blocked | clustered | blocked_clustered | matched_pair | multi_arm | factorial | crossover | adaptive | unknown
assignment_variable: variable_name | unknown
treatment_received_variable: variable_name | same_as_assignment | unknown
primary_outcome: name
primary_outcome_type: continuous | binary | count | ordinal | ratio | survival | repeated | unknown
secondary_outcomes: []
guardrail_outcomes: []
time_zero: assignment_time | exposure_time | enrollment_time | unknown
follow_up_window: defined | unclear
baseline_covariates: []
pre_experiment_metric: name | none | unknown
exclusions_before_randomization: none | present | unknown
exclusions_after_randomization: none | present | unknown
outcome_missingness: none | present | unknown
noncompliance_or_crossover: none | present | unknown
clustering_or_dependence: none | present | unknown
interference_or_spillovers: no | yes | unknown
hypothesis_type: superiority | noninferiority | equivalence | estimation | unknown
multiplicity_plan: one_primary | multiple_outcomes | multiple_arms | sequential_peeking | unknown
software_preference: r | python | either | unknown
```

## Main-Skill Routing Into This Subskill

The root skill should route here when treatment is assigned by a random device, experiment platform, investigator protocol, lottery, randomized encouragement, randomized rollout, or randomized trial design.

The root skill should initially keep the randomized route even if complications exist, but should activate related subskills as needed:

| Complication detected | Keep `05-randomized-experiments`? | Additional subskill |
|---|---:|---|
| Noncompliance, crossover, treatment switching | yes | `13-instrumental-variables` for CACE/LATE; `02-user-data-inspector` for adherence/missingness data issues if relevant |
| Time-to-event outcome, censoring, competing risks | yes | `15-survival-competing-risks` |
| Missing outcomes, attrition, post-randomization selection | yes | `02-user-data-inspector` |
| Spillovers, household/network/marketplace interference | yes, but only for design audit | `17-interference-spillovers` |
| Heterogeneous effects, uplift, treatment rules | yes | `09-heterogeneous-effects-policy` |
| Dynamic regimes, repeated randomized decisions, SMART | yes | `10-longitudinal-gmethods` |
| Mediation, mechanisms, post-treatment pathways | yes | `16-mediation` |
| Fuzzy RD with randomization near threshold | maybe | `12-regression-discontinuity` and `13-instrumental-variables` |
| Not actually randomized | no as primary | route back to root: `06-point-treatment-observational`, `11-did-event-study`, `12-regression-discontinuity`, `13-instrumental-variables`, `14-synthetic-control-time-series`, or descriptive analysis |

## Route-Out Rules

Exit or downgrade the randomized-trial interpretation when any of these are true:

1. **No credible randomization.** If assignment was chosen by clinicians, users, firms, schools, policy makers, self-selection, or an algorithm based on outcome-related variables without randomization, route to observational or quasi-experimental subskills.
2. **Assignment variable is unavailable.** If the dataset contains only treatment received/exposure, but no randomized assignment, the ITT estimand cannot be directly estimated. Route to `02-user-data-inspector` or `13-instrumental-variables` depending on whether assignment can serve as an instrument.
3. **Dataset conditions on post-randomization events.** If the dataset includes only exposed, triggered, compliant, retained, surviving, or logged units, warn that the all-randomized ITT estimand may be lost. Activate `02-user-data-inspector` and possibly redefine the estimand.
4. **Treatment received is the target despite noncompliance.** If the user wants effect of actual treatment receipt, activate `13-instrumental-variables` for CACE/LATE or treat as observational if IV assumptions fail.
5. **Interference is central.** If one unit's treatment can affect another unit's outcome, activate `17-interference-spillovers` and redefine exposure mappings.
6. **Outcome is survival/competing risk.** Use `15-survival-competing-risks` for estimand and estimator while preserving `05-randomized-experiments` for assignment audit.
7. **Policy/time-series structure dominates.** If the user describes a policy change, rollout, or adoption without individual randomization, route to `11-did-event-study` or `14-synthetic-control-time-series`.

## Mathematical Foundation

### Potential outcomes and assignment

Let each unit have potential outcomes

\[
Y_i(1),\quad Y_i(0),
\]

where \(Y_i(1)\) is the outcome if assigned to treatment and \(Y_i(0)\) is the outcome if assigned to control. Let \(Z_i\in\{0,1\}\) be randomized assignment.

Under consistency,

\[
Y_i = Z_iY_i(1) + (1-Z_i)Y_i(0).
\]

Under random assignment,

\[
Z_i \perp \{Y_i(1),Y_i(0),X_i\},
\]

possibly conditional on blocks or strata. This identifies average assignment effects without modeling the outcome process.

### Intention-to-treat effect

The default estimand is the intention-to-treat or assignment effect:

\[
\tau_{ITT}=E\{Y(1)-Y(0)\}.
\]

For a two-arm experiment,

\[
\hat\tau = \bar Y_1-\bar Y_0,
\]

where \(\bar Y_z\) is the sample mean among units assigned to arm \(z\).

### Binary outcomes

For binary \(Y\), report the risk difference by default:

\[
RD = P(Y=1\mid Z=1)-P(Y=1\mid Z=0).
\]

Optional scales:

\[
RR = \frac{P(Y=1\mid Z=1)}{P(Y=1\mid Z=0)},
\]

\[
OR = \frac{P(Y=1\mid Z=1)/P(Y=0\mid Z=1)}{P(Y=1\mid Z=0)/P(Y=0\mid Z=0)}.
\]

For product, clinical, and policy decisions, absolute risk difference and number needed to treat/harm are often more interpretable than odds ratios.

### Relative lift for A/B tests

For a metric mean \(\mu_z=E(Y\mid Z=z)\), relative lift is

\[
\text{lift}=\frac{\mu_1-\mu_0}{\mu_0}.
\]

Always report the absolute effect \(\mu_1-\mu_0\) with relative lift. Relative lift can be misleading when the control mean is small.

### Regression adjustment and ANCOVA

For pre-treatment covariates \(X_i\), regression adjustment can improve precision. A conservative default for individually randomized experiments is Lin-style adjustment:

\[
Y_i = \alpha + \tau Z_i + \beta^T(X_i-\bar X)+\gamma^T Z_i(X_i-\bar X)+\varepsilon_i.
\]

The estimand remains the randomized assignment effect; adjustment is not needed to remove confounding, and covariates must be pre-randomization or otherwise unaffected by treatment.

### CUPED variance reduction

For online experiments with a pre-experiment metric \(X_i\), CUPED transforms the outcome as

\[
Y_i^{CUPED}=Y_i-\theta(X_i-\bar X),
\qquad
\theta=\frac{\operatorname{Cov}(Y,X)}{\operatorname{Var}(X)}.
\]

Then analyze \(Y_i^{CUPED}\) by assignment arm. CUPED is a precision tool, not a fix for failed randomization or post-treatment selection.

### Sample-ratio mismatch

If the planned allocation probabilities are \(p_1,\ldots,p_K\) and observed arm counts are \(n_1,\ldots,n_K\), compute

\[
\chi^2 = \sum_{k=1}^K \frac{(n_k-Np_k)^2}{Np_k}.
\]

A small p-value suggests the observed assignment counts are inconsistent with the planned allocation. In online experiments, treat sample-ratio mismatch as a data-trust problem until explained.

### Noncompliance and CACE/LATE

If assignment \(Z\) differs from treatment received \(D\), keep ITT primary:

\[
\tau_{ITT,Y}=E(Y\mid Z=1)-E(Y\mid Z=0).
\]

A secondary complier average causal effect can be estimated as

\[
\tau_{CACE}=\frac{E(Y\mid Z=1)-E(Y\mid Z=0)}{E(D\mid Z=1)-E(D\mid Z=0)},
\]

under IV assumptions: relevance, independence from potential outcomes, exclusion restriction, and monotonicity for LATE interpretation. Route to `subskills/13-instrumental-variables/`.

### Cluster-randomized estimands

If clusters \(c=1,\ldots,C\) are randomized, distinguish:

Cluster-weighted effect:

\[
\tau_C=\frac{1}{C}\sum_{c=1}^C \{\bar Y_c(1)-\bar Y_c(0)\}.
\]

Individual-weighted effect:

\[
\tau_I=\frac{1}{\sum_c n_c}\sum_{c=1}^C n_c\{\bar Y_c(1)-\bar Y_c(0)\}.
\]

These differ when cluster sizes vary and effects are heterogeneous. The agent must ask which target population is intended.

## Method Recommendation Rules

| Situation | Default method | Notes |
|---|---|---|
| Two-arm individual RCT, continuous outcome | Difference in means; optionally HC2/HC3 robust SE | Add Lin regression adjustment if strong pre-treatment covariates exist. |
| Two-arm binary outcome | Risk difference and CI; optionally risk ratio/odds ratio | Use exact or randomization inference for small samples. |
| Known assignment probabilities unequal | Difference in means for arm-specific means; Horvitz-Thompson/Hajek if needed | Report assignment probabilities. |
| Blocked/stratified randomization | Block-specific differences aggregated; or regression with block fixed effects | Include block in analysis. |
| Cluster randomization | Cluster-level analysis or cluster-robust regression/GEE | Do not pretend individual rows are independent. |
| Multi-arm experiment | Pre-specified contrasts | Address multiplicity; report control mean and contrast-specific effects. |
| Factorial experiment | Main effects and interactions | Estimate factorial contrasts, not only pairwise arm effects. |
| Crossover trial | Within-unit model with period/sequence effects | Check washout and carryover. |
| SMART/dynamic regime | Regime-specific value; weighted or g-method analysis | Route to longitudinal/g-methods. |
| Noncompliance | ITT primary; CACE/LATE secondary | Route to IV. |
| Missing outcomes/attrition | ITT with missingness audit; sensitivity/bounds/IPW/imputation | Route to missingness. |
| Survival endpoint | Survival probability, RMST, risk difference, CIF | Route to survival. |
| Online A/B with pre-period metric | Difference in means plus CUPED/ANCOVA | Check SRM and logging first. |
| Ratio metric | Analyze at randomization-unit level; use delta method/bootstrap | Avoid event-level independent tests. |
| Sequential peeking/adaptive stopping | Use planned sequential design or alpha spending | Do not report naive fixed-horizon p-value as confirmatory. |

## Language Backend Policy

Use the user's preferred language. If no preference is given:

- Use **R** when the user wants design-based experimental analysis, randomization procedures, randomization inference, cluster randomized designs, or concise reporting. Recommended packages: `randomizr`, `estimatr`, `ri2`, `fixest`, `clubSandwich`, `DeclareDesign`, `broom`, `modelsummary`.
- Use **Python** when the user works in product analytics, data engineering, or general ML pipelines. Recommended packages: `pandas`, `numpy`, `scipy`, `statsmodels`, optionally `linearmodels` for IV/noncompliance and `sklearn` only for auxiliary prediction/variance-reduction tasks.
- Do not silently install packages. Provide install commands as comments only.
- Record package versions when returning production code.

## Required Diagnostics

Always attempt these diagnostics before final interpretation:

1. **Allocation table:** observed counts by arm; planned probabilities if known.
2. **Sample-ratio mismatch:** mandatory for online experiments when planned probabilities are known.
3. **Unit consistency:** randomization unit versus row/analysis unit.
4. **Duplicates and multiple assignment:** one unit should not appear assigned to multiple arms unless design allows crossover/sequence.
5. **Baseline balance:** pre-treatment covariates by arm; use as implementation audit, not as a mechanical validity test.
6. **Outcome missingness/attrition:** missing outcome rate by arm and reason if known.
7. **Post-randomization exclusions:** counts and reasons by arm.
8. **Compliance/exposure:** assignment-by-receipt table if treatment receipt differs from assignment.
9. **Metric distribution:** outliers, skew, zero inflation, denominator problems for ratio metrics.
10. **Clustering:** cluster count, cluster size distribution, intracluster correlation when relevant.
11. **Multiplicity:** number of outcomes, arms, subgroups, looks, and contrasts.
12. **Interference screen:** whether treatment can affect other units.

## Red Flags

Warn strongly when:

- the user analyzes only exposed/triggered/compliant/surviving units without redefining the estimand;
- rows are sessions/events but randomization happened at user/account level;
- post-treatment covariates are adjusted for in the primary total-effect analysis;
- the primary outcome was selected after looking at results;
- sample-ratio mismatch is present and unexplained;
- missingness or attrition differs materially by arm;
- per-protocol or as-treated estimates are interpreted as randomized causal effects;
- cluster randomization is analyzed using independent individual-level standard errors;
- treatment spillovers are plausible but ignored;
- repeated peeking occurred but p-values are reported as fixed-horizon tests;
- many outcomes/subgroups are screened and only significant results are reported;
- ratio metrics are tested using event-level rows instead of randomization-unit summaries;
- a survival estimand is reduced to a vague hazard ratio despite user asking about risk or event-free time.

## Code Template Index

Use these examples before writing fresh code:

- `examples/r_estimatr_individual_rct.R`: individual-level RCT, `randomizr`, `estimatr`, balance, ITT, Lin adjustment, optional randomization inference.
- `examples/r_fixest_clustered_ab.R`: blocked/clustered experiment with `fixest`, cluster-robust SE, cluster-level sensitivity.
- `examples/r_ab_srm_cuped.R`: online A/B test, SRM test, CUPED, binary/continuous metrics.
- `examples/python_statsmodels_ab_test.py`: Python A/B test/RCT analysis with `statsmodels`, proportions, robust SEs, SRM, balance.
- `examples/python_cluster_robust_rct.py`: Python clustered experiment with cluster-robust regression and cluster-level analysis.
- `examples/python_cuped_ratio_metrics.py`: CUPED and delta-method ratio metrics at the randomization-unit level.

Root-level templates:

- `scripts/R/rct_estimatr_template.R`
- `scripts/R/ab_srm_cuped_template.R`
- `scripts/python/ab_testing_statsmodels_template.py`
- `scripts/python/cluster_robust_rct_template.py`

## Output Template

```markdown
### Randomized Experiment Analysis Plan

- Causal question:
- Experiment type:
- Unit randomized:
- Unit analyzed:
- Treatment arms and assignment probabilities:
- Time zero and follow-up:
- Primary outcome and scale:
- Primary estimand:
- Secondary estimands:
- Main method:
- Alternative/sensitivity methods:
- Required assumptions:
- Randomization diagnostics:
- Missingness/attrition diagnostics:
- Compliance/exposure diagnostics:
- Multiplicity plan:
- Related subskills activated:
- Packages/code templates:
- Interpretation cautions:
```

## Output Template for Completed Analysis

```markdown
### Results Summary

The primary estimand is [ITT / risk difference / mean difference / cluster-weighted effect / etc.], comparing assignment to [treatment] versus assignment to [control] among [analysis population].

- Control mean/risk:
- Treatment mean/risk:
- Absolute effect:
- Relative lift or risk ratio, if meaningful:
- Standard error:
- 95% confidence interval:
- p-value, if hypothesis testing was requested:
- Number randomized by arm:
- Number analyzed by arm:
- Outcome missingness by arm:
- SRM p-value, if applicable:
- Compliance/exposure summary, if applicable:

Interpretation: Under the documented randomization, consistency, no-interference/exposure-mapping, and outcome-observation assumptions, this estimates [estimand]. The result should not be interpreted as [non-target estimand] because [reason].
```

## Related Subskills

- Use `13-instrumental-variables` when noncompliance/crossover makes treatment receipt differ from randomized assignment.
- Use `15-survival-competing-risks` for time-to-event endpoints, censoring, competing events, RMST, and cumulative incidence.
- Use `02-user-data-inspector` for attrition, missing outcomes, post-randomization exclusions, triggered-only datasets, or logging failures.
- Use `17-interference-spillovers` for spillovers, contamination, marketplaces, networks, classrooms, households, or cluster exposure mappings.
- Use `09-heterogeneous-effects-policy` for subgroup/CATE/uplift/policy-learning analyses.
- Use `10-longitudinal-gmethods` for SMART, dynamic regimes, repeated treatments, or crossover analyses with time-varying treatment.
- Use `16-mediation` for direct/indirect effects and mechanisms.

## Reference Files

Read these files as needed:

- `references/workflow.md`
- `references/math_estimands.md`
- `references/diagnostics_and_failure_modes.md`
- `references/software_and_packages.md`
- `references/rct_ab_bibliography.md`
