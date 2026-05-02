---
name: matching-weighting-balance
description: Use when a user wants to estimate causal effects from observational point-treatment data by matching, propensity-score weighting, overlap weighting, entropy balancing, covariate balancing propensity scores, subclassification, or balance diagnostics. This subskill audits the estimand, covariates, overlap, method choice, diagnostics, failure modes, R/Python backends, and interpretation limits.
version: 0.2.0
---

# Matching, Weighting, and Balance

## Core Behavior

When this subskill is invoked, act as a causal-design consultant, not as a propensity-score code generator. Matching and weighting are design-stage tools for making observed treatment groups comparable; they do not by themselves prove causality.

Always do these six things:

1. **Define the target estimand before choosing a method.** Decide whether the user wants the ATE, ATT, ATC, ATO/overlap effect, a matched-sample effect, or another explicitly weighted target population.
2. **Audit covariate timing and causal role.** Adjustment variables should generally be measured before treatment and should be common causes or strong prognostic variables. Do not adjust for mediators, colliders, instruments chosen only for treatment prediction, or variables affected by treatment when targeting a total effect.
3. **Assess overlap before fitting a final analysis.** Poor overlap is a design problem, not a nuisance to hide. If support is poor, recommend trimming, restriction, overlap weights, or a narrower estimand.
4. **Choose the preprocessing method to target the estimand and data structure.** Nearest-neighbor matching, full matching, IPW, overlap weighting, entropy balancing, and CBPS have different target populations, bias-variance tradeoffs, and diagnostics.
5. **Require balance and weight diagnostics before outcome analysis.** Do not report a final causal effect without standardized mean differences, variance ratios or distributional diagnostics, propensity overlap, discarded-unit counts, and effective sample sizes.
6. **Interpret as conditional on measured-confounding assumptions.** Balance on observed covariates does not remove bias from unmeasured confounding, measurement error, interference, bad time zero, or post-treatment selection.

## When to Use

Use this subskill when the user says or implies:

- propensity score matching;
- nearest-neighbor matching, optimal matching, full matching, genetic matching, exact matching, or coarsened exact matching;
- inverse probability weighting, stabilized weights, overlap weights, matching weights, entropy balancing, CBPS, calibration weights, balancing weights;
- covariate balance, Love plot, standardized mean differences, common support, or overlap diagnostics;
- observational point-treatment data where the goal is to compare treated and untreated units after adjustment for measured baseline covariates;
- preprocessing before regression adjustment, doubly robust estimation, survival analysis, or subgroup analysis.

Do **not** use this as the only workflow when:

- treatment was randomized: use `subskills/05-randomized-experiments/`; balance checks may still be useful, but not for confounding control;
- treatment changes over time or time-varying confounders are affected by prior treatment: route to `subskills/10-longitudinal-gmethods/`;
- the outcome is time-to-event with censoring or competing risks: use this for baseline weighting/matching, then route to `subskills/15-survival-competing-risks/` for estimands and outcome analysis;
- the user has a credible instrument for unmeasured confounding: route to `subskills/13-instrumental-variables/`;
- treatment is assigned at a cutoff: route to `subskills/12-regression-discontinuity/`;
- the design is panel/policy timing: route to `subskills/11-did-event-study/`;
- interference/spillovers are plausible: route to `subskills/17-interference-spillovers/`;
- severe missingness, measurement error, or selection bias dominates: route to `subskills/02-user-data-inspector/`;
- the user wants doubly robust or ML-based final estimation after weights: coordinate with `subskills/08-doubly-robust-ml/`.

## Minimum Design Audit

Before giving a final analysis plan, collect or infer these fields:

```json
{
  "outcome": "Y",
  "treatment": "A",
  "treatment_type": "binary | multi-valued | continuous",
  "time_zero": "when eligibility and treatment assignment are defined",
  "follow_up_window": "outcome observation period",
  "target_population": "full eligible population | treated | controls | overlap population | matched sample | other",
  "target_estimand": "ATE | ATT | ATC | ATO | ATM | matched-sample effect | unknown",
  "outcome_scale": "mean difference | risk difference | risk ratio | odds ratio | RMST difference | other",
  "covariates": ["pre-treatment common causes and prognostic variables"],
  "post_treatment_variables": [],
  "exact_matching_requirements": [],
  "caliper_requirements": null,
  "sampling_weights": false,
  "clusters_or_repeated_units": null,
  "missingness": "none | covariates | outcome | treatment | unknown",
  "overlap_expected": "good | moderate | poor | unknown",
  "method_preference": "matching | weighting | balance optimization | unknown",
  "software_preference": "R | Python | either"
}
```

Ask focused questions only when needed. If the user lacks an estimand, propose a provisional one and explain the consequences.

## Core Theory and Formal Definitions

Let \(A_i \in \{0,1\}\) denote treatment, \(X_i\) baseline covariates, and \(Y_i(1),Y_i(0)\) potential outcomes. The observed outcome is

\[
Y_i = A_iY_i(1) + (1-A_i)Y_i(0).
\]

The standard identification assumptions for point-treatment matching/weighting are:

1. **Consistency:** if \(A_i=a\), then \(Y_i=Y_i(a)\).
2. **Conditional exchangeability / no unmeasured confounding:**

\[
\{Y_i(1),Y_i(0)\} \perp A_i \mid X_i.
\]

3. **Positivity / overlap:**

\[
0 < e(X_i) < 1
\]

for all covariate values in the target population, where

\[
e(X_i)=P(A_i=1\mid X_i)
\]

is the propensity score.

4. **No interference / SUTVA:** one unit's treatment does not affect another unit's outcome unless the estimand explicitly models spillovers.

Matching and weighting estimate causal effects only under these design assumptions. Balance diagnostics can reveal failures in measured covariate balance, but cannot prove exchangeability.

### Propensity score balancing property

The propensity score is a balancing score:

\[
A \perp X \mid e(X).
\]

If treatment assignment is strongly ignorable given \(X\), then it is also ignorable given the true propensity score:

\[
\{Y(1),Y(0)\} \perp A \mid e(X).
\]

In practice \(e(X)\) is estimated. Therefore, the propensity-score model should be evaluated by covariate balance, overlap, and estimator behavior, not by treatment-prediction accuracy alone.

## Common Estimands

### Average treatment effect: ATE

\[
\tau_{ATE}=E\{Y(1)-Y(0)\}.
\]

ATE asks what would happen if everyone in the eligible target population were treated versus untreated. It requires support for both treatment choices across the full covariate distribution. Poor overlap makes ATE unstable.

### Average treatment effect on the treated: ATT

\[
\tau_{ATT}=E\{Y(1)-Y(0)\mid A=1\}.
\]

ATT asks what would happen to the treated units if, contrary to fact, they had not been treated. ATT is natural for program evaluation when the treated population is the policy target.

### Average treatment effect on the controls: ATC

\[
\tau_{ATC}=E\{Y(1)-Y(0)\mid A=0\}.
\]

ATC is natural when considering expanding treatment to currently untreated units.

### Overlap average treatment effect: ATO

Let the tilting function be

\[
h(X)=e(X)\{1-e(X)\}.
\]

The overlap estimand is

\[
\tau_{ATO}
=
\frac{E[h(X)\{Y(1)-Y(0)\}]}{E[h(X)]}.
\]

ATO targets units with clinical or scientific equipoise: those who had reasonable probability of receiving either treatment. It is often more stable than ATE when propensity scores are near 0 or 1.

### General balancing-weight estimand

For any nonnegative tilting function \(h(X)\), define

\[
\tau_h
=
\frac{E[h(X)\{Y(1)-Y(0)\}]}{E[h(X)]}.
\]

The corresponding group weights are

\[
w_i(1)=\frac{h(X_i)}{e(X_i)},
\qquad
w_i(0)=\frac{h(X_i)}{1-e(X_i)}.
\]

Special cases:

| Estimand | Tilting function \(h(X)\) | Treated weight | Control weight | Target population |
|---|---:|---:|---:|---|
| ATE | \(1\) | \(1/e\) | \(1/(1-e)\) | Full eligible population |
| ATT | \(e\) | \(1\) | \(e/(1-e)\) | Treated-like population |
| ATC | \(1-e\) | \((1-e)/e\) | \(1\) | Control-like population |
| ATO | \(e(1-e)\) | \(1-e\) | \(e\) | Overlap/equipoise population |
| Matching weights | \(\min(e,1-e)\) | \(\min(e,1-e)/e\) | \(\min(e,1-e)/(1-e)\) | Matched/overlap-like population |

### Weighted mean-difference estimator

A normalized weighted mean contrast is

\[
\widehat{\tau}_w
=
\frac{\sum_i A_i w_i Y_i}{\sum_i A_i w_i}
-
\frac{\sum_i (1-A_i) w_i Y_i}{\sum_i (1-A_i) w_i}.
\]

For binary outcomes this is a marginal risk difference. Risk ratios and odds ratios can also be reported, but the risk difference is usually easier to interpret causally.

### Matching estimand

After matching or discarding units, the estimand may become a sample-specific or restricted-population estimand. For example, if nearest-neighbor ATT matching discards treated units without suitable controls, the target changes from all treated units to matchable treated units:

\[
\tau_{matched}
=
\frac{1}{|\mathcal M_T|}\sum_{i\in\mathcal M_T}\{Y_i(1)-Y_i(0)\}.
\]

The skill must explicitly state when calipers, common-support restriction, exact matching, or trimming change the target population.

## Method Recommendation Rules

### Design-to-method table

| Situation | Default recommendation | Why | Required diagnostics |
|---|---|---|---|
| Binary treatment, clear ATT target, moderate sample | Nearest-neighbor or optimal matching with caliper; possibly full matching | Directly compares treated units with similar controls | SMDs, Love plot, matched counts, discarded treated units, pair distances |
| Binary treatment, ATE target, good overlap | IPW or stabilized IPW | Targets full population | PS overlap, weight tails, ESS, SMDs, variance ratios |
| Binary treatment, ATE target, poor overlap | Do not force ATE; consider ATO or trimmed ATE | ATE requires support where data may not exist | trimming report, estimand-change statement, overlap plot |
| Binary treatment, overlap/equipoise target | Overlap weights / ATO | Bounded weights, emphasizes comparable units | ESS, overlap target statement, SMDs |
| Need exact balance on selected moments | Entropy balancing or stable balancing weights | Directly balances moments, often for ATT or ATE | exact moment balance, weight dispersion, feasibility |
| Propensity model hard to specify | CBPS, entropy balancing, machine-learning PS with balance diagnostics | Prioritizes balance over pure prediction | balance across covariates, interactions, nonlinear terms |
| Strong categorical constraints | Exact matching, coarsened exact matching, or exact constraints inside MatchIt | Enforces scientific comparability | dropped strata, stratum sizes, within-stratum overlap |
| Many controls per treated | Variable-ratio nearest neighbor, full matching, or weighting | Uses information efficiently | matched ratio distribution, weights, ESS |
| Small sample | Exact/coarsened matching or carefully specified matching; avoid fragile high-dimensional PS | PS models may be unstable | individual match review, covariate tables |
| Clustered units | Matching/weighting plus cluster-aware outcome inference | Independence may be at cluster level | cluster counts, cluster sizes, cluster-robust SEs |
| Survey/sample weights exist | Combine design weights and balancing weights carefully | Target population is affected by sampling design | weighted balance, target population statement |
| Multi-valued treatment | WeightIt/CBPS/PSweight or generalized propensity methods | Binary tools do not directly apply | pairwise balance by treatment, generalized overlap |
| Continuous treatment | Generalized propensity weighting or route to dose-response methods | Binary matching is not appropriate | treatment-density overlap, weighted correlations with treatment |
| High-dimensional final effect model desired | Balance design first, then route to doubly robust / DML | Weighting alone may be unstable | nuisance diagnostics, cross-fitting, same estimand |

## Matching Methods

### Nearest-neighbor matching

Use when the target is usually ATT and the treated group has credible controls nearby. Choices:

- with or without replacement;
- 1:k ratio;
- caliper on propensity score or logit propensity score;
- exact constraints on key variables;
- Mahalanobis distance within propensity-score calipers;
- order of matching.

Use replacement when controls are scarce or overlap is limited; it can improve match quality but increases dependence and may concentrate weight on a few controls.

A common starting caliper is 0.2 times the standard deviation of the logit propensity score. Treat this as a starting point, not a universal law. Tighten or loosen based on balance, overlap, and discarded units.

### Optimal pair matching

Use when greedy nearest-neighbor matching gives poor global match quality. Optimal matching minimizes total within-pair distances but may still produce poor matches if overlap is weak.

### Full matching

Use when you want to retain more units and create matched subclasses containing at least one treated and one control. Full matching often targets ATE/ATT-like estimands depending on weights and can be efficient when treatment-group sizes are unequal.

### Genetic matching

Use when ordinary propensity or Mahalanobis matching fails to balance important covariates. Genetic matching searches over covariate weights to optimize balance. It can be computationally expensive and must still be evaluated by diagnostics.

### Coarsened exact matching

Use when substantive comparability requires exact agreement on coarsened covariate bins. CEM is transparent and strongly design-oriented, but coarsening choices can discard many units or create a restricted target population.

## Weighting Methods

### Inverse probability weighting

Use for ATE or ATT/ATC when overlap is good and the propensity model can be specified well. Watch for extreme weights.

Unstabilized ATE weights:

\[
w_i = \frac{A_i}{e_i} + \frac{1-A_i}{1-e_i}.
\]

Stabilized ATE weights:

\[
w_i = A_i\frac{P(A=1)}{e_i} + (1-A_i)\frac{P(A=0)}{1-e_i}.
\]

Stabilization changes variance behavior but does not solve positivity failure.

### Overlap weighting

Use when scientific interest is in the population where both treatment choices are plausible, especially when ATE IPW is unstable. For binary treatment:

\[
w_i = A_i\{1-e_i\} + (1-A_i)e_i.
\]

### Entropy balancing

Use when the user wants weights that directly balance means, variances, or other moments of covariates. It is especially useful for ATT-style problems where controls are weighted to resemble treated units.

### Covariate balancing propensity score

Use when the propensity score should be estimated while optimizing covariate balance. CBPS can reduce the iterative cycle of fitting a treatment model, checking balance, modifying the model, and checking again.

### Stable balancing weights / calibration weights

Use when exact or near-exact balance is desired while controlling weight dispersion. These are useful when conventional IPW creates extreme weights.

## Language Backend Policy

Do not install packages silently. If packages are missing, show install commands and ask for approval.

### R preferred stack

```r
install.packages(c(
  "MatchIt", "WeightIt", "cobalt", "survey", "sandwich", "lmtest", "estimatr"
))

# Optional advanced packages
install.packages(c("optmatch", "Matching", "CBPS", "ebal", "cem", "optweight", "PSweight"))
```

Use:

- `MatchIt` for nearest-neighbor, optimal, full, exact, coarsened exact, cardinality/profile matching wrappers, and matched data extraction.
- `WeightIt` for propensity-score weights, overlap weights, entropy balancing, CBPS, machine-learning weights, multi-category and continuous treatments, and integration with `cobalt`.
- `cobalt` for balance tables, Love plots, variance ratios, distributional balance, propensity overlap diagnostics, and effective sample size displays.
- `survey` for weighted outcome models when sampling weights or robust design-based SEs are needed.
- `sandwich` and `lmtest` for robust covariance in simple weighted outcome regressions.
- `estimatr` for robust regression after preprocessing when appropriate.
- `optmatch` for optimal full matching and distance restrictions.
- `Matching` for genetic matching and Abadie-Imbens-style matching estimators.
- `CBPS`, `ebal`, `optweight`, and `PSweight` for specialized weighting workflows.

### Python preferred stack

```bash
pip install pandas numpy scipy scikit-learn statsmodels matplotlib
pip install dowhy causalml zepid
```

Use:

- `pandas`, `numpy`, `scikit-learn`, and `statsmodels` for transparent from-scratch propensity modeling, matching, weighting, weighted means, and robust outcome models.
- `DoWhy` when the user wants a model-identify-estimate-refute workflow and simple propensity-score matching/weighting estimators.
- `causalml` for nearest-neighbor propensity matching and ML-oriented causal workflows.
- `zepid` for epidemiologic IPW, IPTW, IPCW, AIPTW, and related causal estimators.

Python currently has less mature end-to-end balance-diagnostic tooling than the R `MatchIt`/`WeightIt`/`cobalt` stack. For production matching/weighting analyses, prefer R unless the user strongly prefers Python or the workflow is simple enough to implement transparently.

## Data Preprocessing Rules

1. Keep treatment, outcome, covariates, sampling weights, cluster IDs, and time-zero definitions in a single analysis dataset.
2. Use a consistent analysis sample for propensity estimation, balance diagnostics, and outcome analysis unless deliberately reporting separate samples.
3. Include only pre-treatment variables for the primary total-effect analysis.
4. Include variables that are common causes of treatment and outcome, variables strongly related to outcome, and design variables that determined treatment selection.
5. Do not select covariates merely because they predict treatment. Instruments that affect treatment but not outcome can increase variance and worsen overlap; pure outcome predictors can improve precision and balance.
6. Do not use post-treatment utilization, adherence, complications, mediator values, or outcome proxies measured after treatment in the propensity model for a total effect.
7. Encode categorical variables explicitly and check sparse categories before exact matching or CEM.
8. Avoid letting the outcome influence design choices. Design diagnostics should be selected before inspecting treatment effects when possible.
9. Record all discarded units, trimming rules, calipers, exact constraints, and changes to estimand.
10. If covariates are missing, decide between missing indicators, multiple imputation, complete case analysis, or a missingness subskill; do not silently drop many units.
11. If sampling weights exist, state whether the target is the sampled population or a survey-weighted population.
12. If treatment or outcome has repeated rows per unit, aggregate or cluster at the correct level before balance/outcome analysis.

## Required Diagnostics

### Balance diagnostics

Always report balance before and after adjustment:

- standardized mean differences for all covariates;
- variance ratios for continuous covariates;
- distributional diagnostics such as ECDF, quantile, or density differences for important continuous covariates;
- Love plot of absolute SMDs;
- balance on interactions, nonlinear terms, and clinically important transformations when relevant;
- exact matching or CEM stratum counts when used.

A common SMD threshold is \(|SMD|<0.1\), with \(|SMD|<0.05\) used in stricter analyses. These are conventions, not proofs. Variance ratios near 1 are preferred; values outside roughly 0.5-2 are concerning, and some applications use 0.8-1.25 as a stricter rule.

Do not use hypothesis-test p-values as the primary balance diagnostic. Balance is about covariate distributions, and p-values change with sample size.

### Overlap diagnostics

Always inspect:

- propensity score histograms or density plots by treatment;
- minimum and maximum propensity scores by group;
- fraction of units outside common support;
- caliper failures and discarded treated/control units;
- whether important covariate strata have treated and untreated units.

If overlap is poor, report that the target estimand is unsupported or must be narrowed.

### Weight diagnostics

For weighting, report:

- weight summary by treatment group: min, quartiles, mean, max;
- top weight contributors;
- effective sample size by group:

\[
ESS_g = \frac{(\sum_{i:A_i=g} w_i)^2}{\sum_{i:A_i=g} w_i^2};
\]

- stabilized versus unstabilized weights if relevant;
- trimming/winsorization rules;
- whether trimming changed the estimand.

### Matching diagnostics

For matching, report:

- number of treated and control units before/after matching;
- matched ratio distribution;
- number and percentage of discarded units by group;
- caliper width and distance scale;
- exact matching variables;
- maximum and mean matched distances;
- whether matching was with replacement;
- frequency with which controls were reused.

### Outcome-analysis diagnostics

After design diagnostics pass:

- estimate marginal effects on the intended scale;
- use robust or design-aware standard errors;
- account for matched sets, subclasses, replacement weights, clustering, and sampling weights where relevant;
- provide sensitivity analysis for unmeasured confounding when causal claims matter.

## Failure Modes and Guardrails

### Estimator before estimand

Bad: “Run PSM.”

Better: “The target is ATT among treated patients at time zero; use nearest-neighbor matching or ATT weights, then check balance and overlap.”

### Post-treatment variables in the propensity model

Including variables affected by treatment can block mediating paths or induce collider bias. Warn and remove them for total-effect analyses unless the user explicitly targets a controlled direct effect or principal-stratum estimand.

### Balance only on the propensity score

A balanced propensity score does not guarantee all covariates are balanced in the estimated sample. Always check covariate balance directly.

### Balance p-values

P-values are not good balance diagnostics. Large samples can make trivial imbalances significant; small samples can hide meaningful imbalances.

### Extreme weights

A few extreme weights can dominate IPW estimates. Report ESS and weight tails. Consider overlap weights, trimming, stabilized weights, or an alternate estimand.

### Silent estimand switching

Trimming, calipers, CEM, exact matching, and common-support restriction can change the target population. State the original estimand and the post-restriction estimand.

### Poor overlap treated as a software problem

Poor overlap means the data cannot support some counterfactual comparisons. Trying more algorithms may not fix the design.

### Assuming balance means no bias

Balance on measured covariates does not address unmeasured confounding, measurement error, interference, bad time zero, informative missingness, or selection bias.

### Outcome-informed tuning

Do not keep trying designs until the desired treatment effect appears. Design tuning should primarily use covariates and treatment assignment, not outcomes.

### Using regression after matching as if nothing changed

Matched and weighted data have induced dependence and non-uniform weights. Standard errors and target-population interpretation need to account for the design.

### Ignoring target scale

For binary outcomes, weighted logistic regression odds ratios are conditional/model-based and may not equal marginal risk differences or risk ratios. Report risk differences when they answer the scientific question.

## Step-by-Step Operating Procedure

1. **Restate the causal question.** Specify treatment, comparator, outcome, time zero, follow-up, and target population.
2. **Choose the estimand.** ATE, ATT, ATC, ATO, matched-sample effect, or other.
3. **Classify variables.** Pre-treatment confounders, prognostic variables, instruments, mediators, colliders, missingness variables, clusters.
4. **Draw or describe a DAG.** At minimum, list why each covariate is included.
5. **Check raw overlap.** Plot treatment prevalence and propensity score overlap; identify non-overlap regions.
6. **Select a primary preprocessing method.** Use the method table above.
7. **Generate matched sample or weights.** Document all tuning parameters.
8. **Check balance.** Use SMDs, variance ratios, distributional plots, and Love plots.
9. **Iterate design if diagnostics fail.** Modify covariate transformations, interactions, exact constraints, calipers, or estimand. Do not inspect the outcome to choose among designs unless transparently doing sensitivity analysis.
10. **Estimate the effect.** Use weighted/matched outcome analysis with appropriate uncertainty.
11. **Run robustness checks.** Alternative calipers, matching ratios, weight trimming, ATO vs ATE/ATT, sensitivity to unmeasured confounding.
12. **Report limitations.** State conditional exchangeability, positivity, target population, diagnostics, and any estimand changes.

## Output Template

```markdown
### Matching / Weighting / Balance Analysis Plan

**Causal question:**  
**Treatment/comparator:**  
**Outcome and scale:**  
**Time zero and follow-up:**  
**Target population:**  
**Target estimand:** ATE / ATT / ATC / ATO / matched-sample / other  

#### Identification assumptions
- Consistency:
- Conditional exchangeability given:
- Positivity/overlap:
- No interference:
- Correct covariate timing:

#### Design audit
- Covariates included:
- Covariates excluded and why:
- Post-treatment variables removed:
- Missingness handling:
- Clustering/repeated units:
- Sampling weights:

#### Primary preprocessing method
- Method:
- Estimand targeted:
- Distance or propensity model:
- Caliper/exact matching/trimming:
- Software:

#### Diagnostics to report
- Balance table:
- Love plot:
- Propensity overlap:
- Weight distribution or matched counts:
- Effective sample size:
- Discarded units and estimand change:

#### Effect estimation
- Estimator:
- Standard error method:
- Main estimate:
- Confidence interval:
- Sensitivity analyses:

#### Interpretation
- Causal interpretation allowed under:
- Target population caveat:
- Remaining threats:
```

## Related Subskills

- `subskills/06-point-treatment-observational/`: use for general backdoor adjustment and observational point-treatment estimands.
- `subskills/08-doubly-robust-ml/`: use after matching/weighting when the final estimator is AIPW, TMLE, DML, or Super Learner-based.
- `subskills/09-heterogeneous-effects-policy/`: use when the user wants CATEs, subgroup effects, or policy learning after weighting/matching.
- `subskills/10-longitudinal-gmethods/`: use when treatment or confounding changes over time.
- `subskills/13-instrumental-variables/`: use when unmeasured confounding is central and a credible instrument exists.
- `subskills/15-survival-competing-risks/`: use when the outcome is survival, censoring, competing risks, or RMST.
- `subskills/17-interference-spillovers/`: use when treatment of one unit can affect another unit.
- `subskills/02-user-data-inspector/`: use when missingness, measurement error, or selection dominates the design.

## Code Template Index

R:

- `examples/r_matchit_nearest_cobalt.R`
- `examples/r_weightit_overlap_entropy.R`
- `examples/r_full_cem_matching.R`
- `scripts/R/matchit_weightit_cobalt_template.R`
- `scripts/R/weightit_cobalt_template.R`

Python:

- `examples/python_ps_weighting_diagnostics.py`
- `examples/python_nearest_neighbor_matching.py`
- `examples/python_dowhy_weighting_template.py`
- `scripts/python/propensity_weighting_template.py`
- `scripts/python/propensity_matching_template.py`

For detailed workflow, read `references/workflow.md`. For formal estimands, read `references/math_estimands.md`. For diagnostics and failure modes, read `references/diagnostics_and_failure_modes.md`. For software details, read `references/software_and_packages.md`.
