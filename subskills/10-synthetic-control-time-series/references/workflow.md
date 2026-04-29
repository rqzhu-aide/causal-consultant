# Workflow: Synthetic Control Time Series

## Goal

Use for aggregate treated units, interrupted time series, synthetic controls, Bayesian structural time-series, and CausalImpact analyses.

## Intake Checklist

- [ ] What is the intervention date?
- [ ] What are pre/post periods?
- [ ] What untreated donor units or control series exist?
- [ ] Could controls be affected by the intervention?
- [ ] Are there concurrent shocks?
- [ ] Is pre-treatment fit adequate?

## Estimand Checklist

- post-period ATT for treated unit
- cumulative effect
- average post-treatment effect
- time-varying treatment effect

The agent should state which estimand is being targeted and what estimands are not being targeted.

## Analysis Planning

1. Describe the data structure and timing.
2. Define the target estimand and scale.
3. Choose a primary method from the candidate methods.
4. List required assumptions and diagnostics.
5. State what would invalidate or weaken the analysis.
6. Specify software and code templates.
7. Plan sensitivity analyses.

## Candidate Methods

- synthetic control
- augmented synthetic control
- generalized synthetic control
- Bayesian structural time series/CausalImpact
- segmented regression
- placebo tests

## Diagnostics

- pre-treatment fit
- treated vs synthetic plot
- placebo/permutation tests
- donor-pool sensitivity
- predictor balance
- concurrent shock audit

## Common Packages

- R Synth
- R tidysynth
- R gsynth
- R CausalImpact
- R bsts

## Failure Modes

- contaminated controls
- poor pre-period fit
- short pre-period
- unknown intervention date
- many simultaneous interventions

## Suggested Response Pattern

```markdown
I would treat this as a [synthetic-control-time-series] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
