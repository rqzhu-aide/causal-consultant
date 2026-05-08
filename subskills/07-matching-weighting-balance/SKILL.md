---
name: matching-weighting-balance
description: "Estimation and diagnostics support module for matching, propensity-score weighting, overlap weighting, entropy balancing, covariate balancing propensity scores, subclassification, balance diagnostics, overlap/support checks, effective sample size, and matched/weighted outcome-analysis handoff after a primary causal route exists."
---

# Matching, Weighting, And Balance

## Role

Use this as an **estimation and diagnostic support module**, usually after `06-point-treatment-observational` or another primary route has established the estimand, comparator, time zero, and pre-treatment adjustment set. Matching and weighting are design-stage tools; they do not by themselves identify a causal effect.

## Fit Check

Given the route handoff, check:

- estimand: ATE, ATT, ATC, ATO/overlap, matched-sample effect, or stabilized weighted effect;
- treatment and covariates are pre-outcome and, for total effects, pre-treatment;
- overlap/support, sparse strata, positivity risks, missingness, sample restrictions, and effective sample size;
- balance diagnostics: standardized mean differences, variance ratios, distributional checks, Love plots, and high-cardinality categories;
- whether matched/weighted outcome analysis can use correct clustering, sampling weights, repeated measures, or survival outcome modules.

If overlap is poor, covariates are post-treatment, or weights are unstable, return feedback to the main skill rather than hiding the problem in software.

## Package And Code Fit

Candidate R tools include `MatchIt`, `WeightIt`, `cobalt`, `CBPS`, `optweight`, and related design packages. Candidate Python paths include `pandas`/`sklearn`-based workflows and package-specific templates when validated. Confirm diagnostics and uncertainty support before using a package for final analysis.

## Pass / Fail Output

If fit passes, produce a preprocessing/design plan, balance diagnostics plan, matched/weighted dataset guidance, outcome-analysis handoff, and limitations. If fit fails, report whether the fix belongs to data construction, covariate timing, route choice, estimand change, or user-directed caveat.

## References

- `references/workflow.md`: detailed workflow.
- `references/math_estimands.md`: estimands.
- `references/diagnostics_and_failure_modes.md`: diagnostic failures.
- `references/software_and_packages.md`: package notes.
- `references/bibliography.md`: literature notes.
- `examples/`: reusable R/Python templates.
- `assets/`: compact report/project templates.
