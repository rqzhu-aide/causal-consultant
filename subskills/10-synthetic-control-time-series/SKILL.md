---
name: synthetic-control-time-series
description: Use for aggregate treated units, interrupted time series, synthetic controls, Bayesian structural time-series, and CausalImpact analyses.
---

# Synthetic Control Time Series

## When to Use

- one/few treated aggregate units
- policy intervention date
- treated time series
- donor pool
- interrupted time series

## First Questions

- What is the intervention date?
- What are pre/post periods?
- What untreated donor units or control series exist?
- Could controls be affected by the intervention?
- Are there concurrent shocks?
- Is pre-treatment fit adequate?

## Target Estimands

- post-period ATT for treated unit
- cumulative effect
- average post-treatment effect
- time-varying treatment effect

## Candidate Methods

- synthetic control
- augmented synthetic control
- generalized synthetic control
- Bayesian structural time series/CausalImpact
- segmented regression
- placebo tests

## Common Packages and Tools

- R Synth
- R tidysynth
- R gsynth
- R CausalImpact
- R bsts

## Required Diagnostics

- pre-treatment fit
- treated vs synthetic plot
- placebo/permutation tests
- donor-pool sensitivity
- predictor balance
- concurrent shock audit

## Red Flags

- contaminated controls
- poor pre-period fit
- short pre-period
- unknown intervention date
- many simultaneous interventions

## Code Templates

- `scripts/R/causalimpact_template.R`

## Operating Instructions

1. Confirm the estimand and target population before recommending a method.
2. Confirm that variables used for adjustment or modeling have valid timing for this design.
3. State identification assumptions separately from model assumptions.
4. Propose a primary analysis and at least one diagnostic or sensitivity analysis.
5. If diagnostics fail, recommend redesign, a different estimand, or a weaker/descriptive interpretation.
6. When returning code, adapt variable names and include comments showing where the user must supply data-specific details.

## Output Template

```markdown
### Synthetic Control Time Series Analysis Plan

- Causal question:
- Estimand:
- Data/design requirements:
- Primary method:
- Alternative method:
- Identification assumptions:
- Diagnostics:
- Sensitivity analyses:
- Packages/code templates:
- Interpretation cautions:
```

For more detail, read `references/workflow.md` in this subskill folder.
