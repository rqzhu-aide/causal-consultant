---
name: synthetic-control-time-series
description: "Primary route subskill for one or a few treated aggregate units, policy shocks at known times, synthetic control, augmented or generalized synthetic control, synthetic DiD, matrix-completion panel counterfactuals, interrupted time series, Bayesian structural time series, CausalImpact-style analyses, and donor-pool fit diagnostics."
---

# Synthetic Control And Time-Series Counterfactuals

## Role

Use this as a **primary route subskill** when the route relies on aggregate units or time-series counterfactual construction around an intervention time.

## Route-Fit Check

Given the route handoff, check:

- treated unit(s), intervention timing, outcome frequency, pre/post periods, donor pool, covariates, and aggregation level;
- target effect over time and post-period estimand;
- pre-treatment fit, donor contamination, spillovers, concurrent shocks, seasonality, missingness, and limited donor support;
- whether DiD, event study, interrupted time series, Bayesian structural time series, or descriptive monitoring is more appropriate;
- whether uncertainty and placebo/permutation diagnostics are possible.

If donor fit or comparison construction is not credible, return feedback to the main skill.

## Package And Code Fit

Candidate tools include R `Synth`, `tidysynth`, `gsynth`, `CausalImpact`, `bsts`, and matrix-completion/synthetic DiD workflows. Confirm the tool supports the number of treated units, panel shape, covariates, diagnostics, and uncertainty needed.

## Pass / Fail Output

If fit passes, produce synthetic/time-series plan, donor diagnostics, placebo/sensitivity strategy, code path, and reporting handoff. If fit fails, report the failed condition and fallback options.

## References

- `references/workflow.md`: detailed workflow.
- `references/literature_and_software.md`: literature and software notes.
