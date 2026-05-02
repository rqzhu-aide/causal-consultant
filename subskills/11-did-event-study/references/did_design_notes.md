# DiD/Event Study Design Notes

## Core Estimand

For group `g` first treated at time `g` and time `t >= g`, a group-time ATT is:

```math
ATT(g,t) = E[Y_t(g) - Y_t(0) \mid G=g]
```

where `Y_t(0)` is the untreated potential outcome at time `t`.

## Key Assumptions

- Parallel trends or conditional parallel trends.
- No anticipation before treatment.
- Stable composition of treated and comparison units.
- No spillovers or contaminated controls.
- Correct treatment timing and treatment definition.
- Appropriate control group: never-treated, not-yet-treated, or both as sensitivity.

## Do Not Default to Naive TWFE

When treatment effects vary across cohorts or over event time, naive two-way fixed effects can estimate nontransparent weighted averages, sometimes with negative or contaminated weights. Prefer group-time ATT, interaction-weighted, imputation, doubly robust, or two-stage estimators when staggered adoption and heterogeneity are plausible.

## Required Figures

- treatment timing/cohort-size plot;
- raw outcome trends by cohort and controls;
- event-study plot with pre-treatment coefficients;
- dynamic treatment effect plot with event-time support;
- placebo or sensitivity plot when available.

## Interpretation Reminders

- Pretrend tests do not prove parallel trends.
- Event-study post-treatment estimates are dynamic ATT summaries, not automatically long-run population ATEs.
- Binning endpoints can change interpretation.
- Cluster at the treatment assignment level when possible.
