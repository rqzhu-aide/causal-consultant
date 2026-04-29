# DiD/Event Study Design Notes

## Core Estimand

For group `g` first treated at time `g` and time `t >= g`, a group-time ATT is:

```math
ATT(g,t) = E[Y_t(g) - Y_t(0) \mid G=g]
```

where `Y_t(0)` is the untreated potential outcome at time `t`.

## Key Assumptions

- Parallel trends or conditional parallel trends.
- No anticipation.
- Stable composition.
- No spillovers between treated and control units.
- Appropriate control group: never-treated or not-yet-treated.

## Do Not Default to Naive TWFE

When treatment effects are heterogeneous across cohorts or over time, naive two-way fixed effects can estimate nontransparent weighted averages. Prefer group-time ATT or modern event-study estimators.

## Required Figures

- treatment timing plot;
- event-study plot with pre-treatment coefficients;
- treated and control outcome trends;
- placebo/pretrend plot.
