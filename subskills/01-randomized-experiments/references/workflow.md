# Workflow: Randomized Experiments

## Goal

Use for randomized experiments, A/B tests, cluster randomized trials, factorial trials, crossover trials, SMART designs, attrition, and noncompliance.

## Intake Checklist

- [ ] What was randomized: individual, cluster, time period, or sequence?
- [ ] What is the primary estimand: ITT, per-protocol, as-treated, CACE/LATE?
- [ ] Was there noncompliance, crossover, attrition, or missing outcome data?
- [ ] Were outcomes measured for all randomized units?
- [ ] Are there multiple arms or factorial components?

## Estimand Checklist

- ITT
- ATE under full adherence
- per-protocol effect
- CACE/LATE
- cluster-level ATE
- factorial main effects/interactions

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

- difference in means/proportions
- regression adjustment
- ANCOVA
- randomization inference
- cluster-robust inference
- mixed models/GEE
- IV for noncompliance

## Diagnostics

- randomization balance table
- CONSORT-style flow
- attrition by arm
- compliance table
- cluster size summary
- multiple-testing plan

## Common Packages

- R estimatr
- R randomizr
- R lme4/geepack/clubSandwich
- Python statsmodels

## Failure Modes

- dropping randomized units after treatment
- per-protocol interpreted as randomized without assumptions
- ignoring cluster randomization
- post-treatment covariate adjustment

## Suggested Response Pattern

```markdown
I would treat this as a [randomized-experiments] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
