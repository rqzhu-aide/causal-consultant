# Diagnostics and Failure Modes: Matching, Weighting, and Balance

## Diagnostic Philosophy

Diagnostics answer three questions:

1. **Did the adjusted treated and control groups become comparable on measured pre-treatment covariates?**
2. **Is the target estimand supported by overlap/common support?**
3. **Does the estimator rely on a few units, extreme weights, or opaque exclusions?**

They do not prove no unmeasured confounding.

## Required Diagnostic Suite

### 1. Covariate balance table

Report each covariate before and after adjustment:

- treated mean/proportion;
- control mean/proportion;
- standardized mean difference;
- variance ratio for continuous variables;
- missingness indicators if used;
- threshold flags.

Preferred R tool: `cobalt::bal.tab()`.

### 2. Love plot

A Love plot shows absolute balance statistics before and after adjustment. It should include all core confounders and prognostic covariates, not just the variables that look good.

Preferred R tool: `cobalt::love.plot()`.

### 3. Propensity score overlap

Plot estimated propensity scores by treatment group. Use histograms, density curves, mirrored histograms, or empirical CDFs.

Report:

- min/max/quantiles by group;
- number of treated units outside control support;
- number of control units outside treated support;
- common-support restrictions.

### 4. Weight distribution

For weighting analyses, report:

- min, mean, SD, median, max;
- 95th and 99th percentiles;
- group-specific summaries;
- top-weight observations;
- effective sample size;
- trimming/winsorization thresholds if used.

### 5. Effective sample size

\[
ESS_g=\frac{(\sum_{i:A_i=g}w_i)^2}{\sum_{i:A_i=g}w_i^2}.
\]

Report ESS by group. If ESS is small relative to nominal sample size, the estimate is fragile.

### 6. Matching structure

For matching analyses, report:

- matching method;
- distance metric;
- caliper and scale;
- exact variables;
- replacement;
- matching ratio;
- matched sample sizes;
- discarded units by treatment;
- reused controls;
- subclass size distribution for full matching.

### 7. Outcome-free design log

Keep a record of design choices made before looking at outcomes:

- covariate set;
- transformations/interactions;
- caliper choices;
- trimming rule;
- balance thresholds;
- primary estimand.

This prevents outcome-driven design search.

## Thresholds and Interpretation

### Standardized mean differences

Common conventions:

- \(|SMD| < 0.10\): often considered acceptable;
- \(|SMD| < 0.05\): stricter;
- \(|SMD| \ge 0.20\): usually concerning.

These are not laws. A small imbalance in a very strong confounder can matter more than a larger imbalance in a weak covariate.

### Variance ratios

Common conventions:

- near 1 is ideal;
- 0.5 to 2 is a broad screen;
- 0.8 to 1.25 is stricter.

Variance ratio imbalance can remain even when means are balanced.

### ECDF / distributional differences

For continuous covariates, mean balance may hide tail imbalance. Use ECDF differences, quantile plots, density plots, or side-by-side weighted histograms for important covariates.

### Propensity score overlap

Do not require identical propensity distributions, but do require support. If treated units have no comparable controls, matching or weighting cannot estimate their counterfactual outcomes without extrapolation.

### Weight tails

There is no universal maximum acceptable weight. A weight is problematic when it dominates the estimate, produces tiny ESS, or represents unsupported counterfactual comparisons.

## Failure Mode Catalog

### 1. Using p-values for balance

**Problem:** Balance p-values depend heavily on sample size. Large samples flag trivial differences; small samples miss meaningful differences.

**Corrective action:** Use SMDs, variance ratios, ECDFs, and subject-matter thresholds.

### 2. Adjusting for post-treatment variables

**Problem:** Post-treatment variables may be mediators or colliders. Including them can change the estimand or induce bias.

**Corrective action:** Remove them for total effects. Route to mediation if the target is a direct effect.

### 3. Balance on the propensity score only

**Problem:** Matching on the estimated propensity score often balances the score by construction, but individual covariates may remain imbalanced.

**Corrective action:** Check covariate balance directly.

### 4. Poor overlap ignored

**Problem:** ATE/IPW can be dominated by units with propensity scores near 0 or 1.

**Corrective action:** Show overlap plots and ESS. Consider ATT, ATC, ATO, trimming, exact restrictions, or no causal estimate for unsupported regions.

### 5. Extreme weights hidden

**Problem:** Weighted estimates may depend on a handful of observations.

**Corrective action:** Report weight summaries, top weights, ESS, and sensitivity to trimming/winsorization.

### 6. Silent estimand switching

**Problem:** Calipers, CEM, exact matching, common support restriction, and trimming often change the population.

**Corrective action:** Report the original target and the retained target. Use language such as “effect among matchable treated units.”

### 7. Treatment-prediction model optimized instead of balance

**Problem:** A high AUC propensity model may separate treatment groups and create poor overlap.

**Corrective action:** Fit for balance, not prediction. Consider CBPS, entropy balancing, overlap weights, interactions, or simpler models.

### 8. Ignoring categorical sparse cells

**Problem:** Exact matching or CEM on sparse categories can discard many units or create unstable strata.

**Corrective action:** Collapse categories substantively, report stratum counts, or change method.

### 9. Duplicated analysis units

**Problem:** Event-level data may treat repeated observations from the same person as independent.

**Corrective action:** Aggregate to the treatment-assignment or exposure-decision unit, or use cluster-aware methods.

### 10. Unclear time zero

**Problem:** Covariate timing, treatment eligibility, and follow-up may be misaligned. This can create immortal time bias or selection bias.

**Corrective action:** Define eligibility time, treatment assignment time, and outcome start before propensity modeling.

### 11. Using matching to fix unmeasured confounding

**Problem:** Matching/weighting only balances measured variables.

**Corrective action:** State unmeasured-confounding limitations and propose sensitivity analysis or an alternative design.

### 12. Outcome-informed design search

**Problem:** Trying many designs and reporting the one with the desired result invalidates honest inference.

**Corrective action:** Separate design and analysis. Use a pre-specified or logged design process.

### 13. Ignoring standard errors after matching

**Problem:** Matched samples and weights induce dependence. Naive unweighted tests can be wrong.

**Corrective action:** Use weights, subclasses, matched-pair methods, robust SEs, bootstrap where appropriate, or package-supported inference.

### 14. Reporting only relative effects

**Problem:** Relative risks or percentage changes can hide small absolute effects.

**Corrective action:** Report absolute effect and uncertainty; add relative effect when useful.

### 15. Treating trimmed ATE as the original ATE

**Problem:** Trimming non-overlap regions changes the population.

**Corrective action:** Label as trimmed/restricted ATE or overlap-region effect.

## Diagnostic Escalation Rules

If any adjusted \(|SMD|>0.1\):

- inspect the variable's role and scale;
- add transformations or interactions;
- exact match or caliper on the variable;
- use entropy balancing/CBPS;
- report residual imbalance if unavoidable.

If variance ratios are poor:

- check distributional plots;
- use transformations;
- consider full matching or balancing moments beyond means.

If ESS is too small:

- use stabilized weights;
- switch to overlap weights;
- trim with explicit estimand change;
- restrict target population;
- avoid high-variance IPW claims.

If overlap is poor:

- do not report full ATE as primary;
- use ATT/ATC if supported;
- use ATO;
- restrict to common support;
- or state causal effect cannot be estimated for the requested population.

If post-treatment variables are in the adjustment set:

- remove them;
- clarify whether the target is total effect, controlled direct effect, or mediation;
- route to mediation if needed.

## Minimal Final Diagnostic Report

```markdown
### Diagnostics

**Balance:** Maximum adjusted absolute SMD = ...; number above 0.1 = ...  
**Variance ratios:** range = ...  
**Overlap:** [adequate/moderate/poor], based on propensity score plot and support checks.  
**Weights or matches:** ESS treated = ..., ESS control = ... / matched treated = ..., matched controls = ...  
**Discarded units:** ... treated, ... controls; estimand changed? yes/no  
**Residual concerns:** ...
```
