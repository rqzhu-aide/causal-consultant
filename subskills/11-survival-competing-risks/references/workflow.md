# Workflow: Survival Competing Risks

## Goal

Use for time-to-event outcomes, censoring, competing risks, adjusted survival curves, RMST, and survival causal estimands.

## Intake Checklist

- [ ] What is time zero?
- [ ] What event defines failure?
- [ ] What censoring occurs?
- [ ] Are competing events scientifically meaningful?
- [ ] Is the target survival probability, risk, cumulative incidence, hazard, or RMST?
- [ ] Does treatment affect censoring or competing events?

## Estimand Checklist

- survival difference at t
- risk difference by t
- RMST difference
- cumulative incidence contrast
- cause-specific hazard contrast
- subdistribution contrast

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

- standardized survival curves
- IPCW
- AIPW/TMLE survival
- Cox model with caution
- RMST regression
- competing-risk cumulative incidence

## Diagnostics

- risk-set definition
- censoring by treatment
- censoring weights
- adjusted curves
- RMST
- competing-risk handling

## Common Packages

- R survival
- R adjustedCurves
- R riskRegression
- R survtmle
- R lmtp

## Failure Modes

- immortal time
- hazard ratio interpreted as risk ratio
- competing risks censored without justification
- time zero after treatment
- informative censoring ignored

## Suggested Response Pattern

```markdown
I would treat this as a [survival-competing-risks] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
