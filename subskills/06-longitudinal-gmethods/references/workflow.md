# Workflow: Longitudinal Gmethods

## Goal

Use for time-varying treatments, time-varying confounders, dynamic regimes, censoring, marginal structural models, g-formula, longitudinal TMLE, and modified treatment policies.

## Intake Checklist

- [ ] What are the decision times?
- [ ] What is the treatment regime?
- [ ] Which time-varying confounders are affected by prior treatment?
- [ ] What censoring/competing events occur?
- [ ] Is the estimand static, dynamic, or modified treatment policy?

## Estimand Checklist

- E[Y^g]
- regime contrast
- dynamic treatment regime value
- modified treatment policy effect
- per-protocol effect with grace period

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

- marginal structural models/IPW
- parametric g-formula
- sequential g-computation
- longitudinal TMLE
- lmtp
- cloning-censoring-weighting

## Diagnostics

- timeline diagram
- sequential positivity
- time-specific/cumulative weights
- censoring weights
- regime support
- model checks

## Common Packages

- R ipw
- R gfoRmula
- R ltmle
- R lmtp

## Failure Modes

- standard regression adjusting for time-varying confounders affected by prior treatment
- poor sequential positivity
- ambiguous grace periods
- censoring ignored

## Suggested Response Pattern

```markdown
I would treat this as a [longitudinal-gmethods] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
