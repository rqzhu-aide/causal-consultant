# Workflow: Matching, Weighting, and Balance

## Goal

Guide a user through observational point-treatment causal design using matching, weighting, and balance diagnostics. The workflow should feel like a statistical consultant: first clarify the estimand and design, then propose methods, generate code, inspect diagnostics, iterate the design, and only then interpret the causal estimate.

## Required Response Pattern

When invoked, use this structure unless the user asks only for code:

```markdown
I would treat this as a matching/weighting/balance problem because [reason].

The target estimand appears to be [ATE/ATT/ATC/ATO/matched-sample], defined as [definition].
This requires measured-confounding control using pre-treatment covariates [X].

My recommended primary design is [method] because [overlap/estimand/data justification].
I would not report the treatment effect until we check [balance/overlap/weights].

If diagnostics fail, I would [revise model, change method, restrict target population, switch to ATO, or stop causal interpretation].
```

## Step 1: Intake and Project Specification

Collect or infer:

- treatment and comparator;
- outcome and outcome scale;
- time zero;
- follow-up window;
- unit of analysis;
- target population;
- treatment type: binary, multi-valued, continuous;
- whether treatment is point treatment or longitudinal;
- desired estimand: ATE, ATT, ATC, ATO, matched-sample, unknown;
- baseline covariates available;
- covariate timing;
- post-treatment variables in the dataset;
- missingness in treatment, outcome, and covariates;
- sample weights, clusters, repeated units;
- expected overlap/common support;
- software preference.

Minimum JSON-like intake:

```json
{
  "treatment": "A",
  "outcome": "Y",
  "time_zero": null,
  "follow_up_window": null,
  "target_estimand": "unknown",
  "covariates_pre_treatment": [],
  "post_treatment_variables_to_exclude": [],
  "treatment_type": "binary",
  "overlap_expected": "unknown",
  "clusters": null,
  "sampling_weights": null,
  "language": "R | Python | either"
}
```

## Step 2: Decide Whether This Subskill Is Appropriate

Use this module when the design is an observational point-treatment comparison and the identifying strategy is adjustment for measured covariates.

Route out when:

| Finding | Route |
|---|---|
| Treatment randomized | `05-randomized-experiments` |
| Treatment varies over time | `10-longitudinal-gmethods` |
| Unmeasured confounding with credible instrument | `13-instrumental-variables` |
| Policy timing with pre/post panel | `11-did-event-study` |
| Cutoff assignment | `12-regression-discontinuity` |
| Survival/censoring/competing risks outcome | `15-survival-competing-risks` after baseline design |
| Interference/spillovers | `17-interference-spillovers` |
| Severe missingness, measurement error, selection | `02-user-data-inspector` |
| Final estimator is AIPW/TMLE/DML | `08-doubly-robust-ml` after balance design |

## Step 3: Define the Estimand Before the Method

Ask:

- Is the question about everyone eligible? Use ATE if overlap is adequate.
- Is the question about those who actually received treatment? Use ATT.
- Is the question about those currently untreated? Use ATC.
- Is the question about the population where either treatment was plausible? Use ATO/overlap.
- Will matching/calipers discard units? Then state the matched-sample or restricted estimand.

Do not accept “the treatment effect” without a population and scale.

## Step 4: Classify Covariates

Create a variable ledger:

| Variable | Timing | Role | Include in design? | Notes |
|---|---|---|---|---|
| baseline confounder | pre-treatment | common cause of A and Y | yes | primary adjustment set |
| prognostic baseline variable | pre-treatment | predicts Y | usually yes | improves precision/balance |
| pure treatment predictor/instrument | pre-treatment | predicts A only | maybe no | may hurt overlap/variance |
| mediator | post-treatment | on causal pathway | no for total effect | route to mediation if target changes |
| collider/selection variable | pre/post | common effect | no | can induce bias |
| cluster/site | pre-treatment/design | dependence/source | include or stratify | use cluster-aware SE |

If the user supplies a variable list, ask for timing and scientific role. If timing is unknown, mark the design provisional.

## Step 5: Initial Data Audit

Before estimating propensities:

- count treated and control units;
- summarize outcome availability by treatment;
- summarize missingness by treatment;
- verify one row per analysis unit;
- inspect covariate distributions;
- identify sparse categories;
- identify impossible exact-matching constraints;
- confirm the analysis sample.

If a large number of units are dropped due to missing covariates, route to `02-user-data-inspector` or report a complete-case target population.

## Step 6: Initial Overlap Assessment

Fit an initial propensity score using plausible pre-treatment covariates or use a nonparametric overlap check. Do not tune for outcome effects.

Required checks:

- histogram/density of estimated propensity scores by treatment;
- min/max/quantiles of propensity score by treatment;
- treated units without control support;
- control units without treated support;
- sparse exact-match strata;
- covariate regions unique to one treatment group.

Interpretation:

- **Good overlap:** ATE, ATT, ATC, or ATO may be feasible.
- **Moderate overlap:** ATT/ATC/full matching/overlap weights may be safer than ATE IPW.
- **Poor overlap:** the full-population ATE is not credible without extrapolation. Use ATO, trim/restrict, or report descriptive results.

## Step 7: Method Selection

### Matching route

Choose matching when:

- the user wants transparent comparable treated-control sets;
- ATT is natural;
- common support is adequate;
- a matched cohort is easy to explain;
- exact matching on key variables is scientifically required.

Method choices:

| Method | Best for | Main tuning | Main risk |
|---|---|---|---|
| Nearest-neighbor PS matching | Simple ATT analyses | ratio, replacement, caliper | greedy poor matches, discarded units |
| Mahalanobis within PS caliper | small/moderate covariate set | caliper, variables | high-dimensional instability |
| Optimal matching | better global pair quality | distance, caliper | still fails under poor support |
| Full matching | retains more units | subclass restrictions | weights/subclasses harder to explain |
| Genetic matching | hard-to-balance covariates | genetic search settings | computational cost, over-tuning |
| CEM/exact matching | strong substantive constraints | coarsening bins | changes target and drops units |

### Weighting route

Choose weighting when:

- the target estimand is ATE, ATT, ATC, or ATO;
- the user wants to retain most units;
- weighted outcome models are acceptable;
- balance can be achieved without extreme weights.

Method choices:

| Method | Best for | Main tuning | Main risk |
|---|---|---|---|
| IPW | ATE with good overlap | PS model | extreme weights |
| Stabilized IPW | ATE/ATT with variance control | numerator choice | still fails under poor overlap |
| Overlap weights | clinical equipoise/poor tails | ATO estimand | not ATE/ATT |
| Entropy balancing | exact moment balance | moments to balance | feasibility/extreme weights |
| CBPS | balance-oriented PS | moments/model | diagnostics still required |
| Stable balancing weights | exact/near-exact balance with dispersion control | balance tolerances | optimization complexity |

## Step 8: Design Tuning Without Outcome Peeking

If balance fails, tune using treatment and covariates only:

- add nonlinear terms, splines, interactions, or categorized forms of confounders;
- use exact matching for strong confounders or design variables;
- use calipers on logit propensity score;
- switch from nearest-neighbor to optimal/full matching;
- switch from IPW to overlap weights;
- use entropy balancing or CBPS;
- restrict to common support;
- change from ATE to ATO or restricted estimand.

Document each design iteration. Do not select the design by treatment-effect estimates.

## Step 9: Balance Diagnostics

Use `cobalt::bal.tab()` and `cobalt::love.plot()` in R when possible.

Required table columns:

- covariate name;
- unadjusted mean/proportion by treatment;
- adjusted mean/proportion by treatment;
- unadjusted SMD;
- adjusted SMD;
- variance ratio for continuous covariates;
- missingness indicators if used;
- threshold flags.

Threshold guidance:

- \(|SMD|<0.10\): common convention for adequate mean balance;
- \(|SMD|<0.05\): stricter convention;
- variance ratio roughly 0.5-2: broad screen;
- variance ratio 0.8-1.25: stricter screen;
- ECDF or KS-like differences should be small for important continuous covariates;
- thresholds are not guarantees and should be interpreted with subject-matter knowledge.

Do not use p-values as primary balance diagnostics.

## Step 10: Weight Diagnostics

For each treatment arm, report:

- sample size;
- sum of weights;
- effective sample size;
- min, max, mean, standard deviation of weights;
- 1st, 50th, 99th percentiles;
- number of weights exceeding pre-specified thresholds;
- top-weighted observations or strata.

If ESS is much smaller than nominal sample size, warn that the estimate depends on relatively few units.

## Step 11: Matching Diagnostics

Report:

- units before matching;
- units after matching;
- unmatched treated units;
- unmatched control units;
- ratio of controls per treated;
- whether replacement was used;
- reused controls and their maximum reuse count;
- caliper width and scale;
- exact or CEM variables;
- matched distance summaries.

If treated units are discarded in an ATT analysis, explicitly state that the estimand is no longer all treated units.

## Step 12: Outcome Analysis

Only after diagnostics pass:

1. Estimate the effect on the scale of interest.
2. Use weights or matched-sample weights in the outcome model.
3. Use robust or design-aware standard errors.
4. Include covariate adjustment after matching/weighting when pre-specified or when it improves precision; do not use post-treatment variables.
5. For binary outcomes, report marginal risk difference and optionally risk ratio/odds ratio.
6. For survival outcomes, route to survival estimands and methods.

Recommended default for continuous outcome:

```text
Weighted/matched marginal mean difference, with robust standard errors.
```

For binary outcome:

```text
Weighted/matched risk difference first; risk ratio second if requested.
```

## Step 13: Sensitivity and Robustness

At minimum propose:

- alternative propensity model specifications;
- different caliper widths or matching ratios;
- IPW versus overlap weights;
- trimmed versus untrimmed weights;
- with versus without exact matching on key variables;
- unmeasured-confounding sensitivity analysis such as Rosenbaum bounds for matched pairs or E-values for risk ratio contexts when appropriate;
- negative-control or placebo outcome checks when available.

## Step 14: Interpretation Template

Use language like:

> The estimated effect targets [estimand] in [target population]. Under consistency, no interference, conditional exchangeability given the listed pre-treatment covariates, and positivity in the retained sample, the matched/weighted comparison can be interpreted causally. The diagnostics show [balance/overlap summary]. Because [discarding/trimming/overlap weights] was used, the estimand is [restricted/ATO/etc.], not necessarily the original full-population ATE. Remaining concerns are [unmeasured confounding, measurement error, missingness, residual imbalance].

## Code Template Index

R examples:

- `examples/r_matchit_nearest_cobalt.R`: nearest-neighbor ATT matching with MatchIt and cobalt diagnostics.
- `examples/r_weightit_overlap_entropy.R`: ATE IPW, ATO overlap weights, and ATT entropy balancing with WeightIt and cobalt.
- `examples/r_full_cem_matching.R`: full matching and coarsened exact matching with MatchIt.

Python examples:

- `examples/python_ps_weighting_diagnostics.py`: from-scratch IPW/overlap weighting, balance diagnostics, ESS, plots, robust weighted regression.
- `examples/python_nearest_neighbor_matching.py`: from-scratch nearest-neighbor PS matching with caliper and SMD diagnostics.
- `examples/python_dowhy_weighting_template.py`: optional DoWhy propensity-score matching/weighting workflow.

Root scripts:

- `scripts/R/matchit_weightit_cobalt_template.R`
- `scripts/R/weightit_cobalt_template.R`
- `scripts/python/propensity_weighting_template.py`
- `scripts/python/propensity_matching_template.py`
