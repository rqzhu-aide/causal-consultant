# Workflow: Regression Discontinuity

## Goal

Use for sharp or fuzzy regression discontinuity designs based on treatment assignment near a cutoff.

## Intake Checklist

- [ ] What is the running variable and cutoff?
- [ ] Is treatment deterministic at the cutoff or fuzzy?
- [ ] Can the running variable be manipulated?
- [ ] Are covariates continuous at the cutoff?
- [ ] What local population near the cutoff is meaningful?

## Estimand Checklist

- local average treatment effect at cutoff
- fuzzy RD LATE near cutoff

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

- local polynomial RD
- robust bias-corrected inference
- bandwidth selection
- fuzzy RD
- donut RD
- covariate continuity checks

## Diagnostics

- RD plot
- density/manipulation test
- bandwidth sensitivity
- covariate continuity
- donut sensitivity
- local estimand statement

## Common Packages

- R/Python rdrobust
- R rddensity

## Failure Modes

- running variable manipulation
- global polynomial only
- no bandwidth sensitivity
- interpreting local effect as population ATE
- wrong cutoff

## Suggested Response Pattern

```markdown
I would treat this as a [regression-discontinuity] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
