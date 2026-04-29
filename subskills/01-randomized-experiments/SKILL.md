---
name: randomized-experiments
description: Use for randomized experiments, A/B tests, cluster randomized trials, factorial trials, crossover trials, SMART designs, attrition, and noncompliance.
---

# Randomized Experiments

## When to Use

- treatment assigned by randomization
- A/B testing
- cluster randomized trial
- noncompliance in randomized trial

## First Questions

- What was randomized: individual, cluster, time period, or sequence?
- What is the primary estimand: ITT, per-protocol, as-treated, CACE/LATE?
- Was there noncompliance, crossover, attrition, or missing outcome data?
- Were outcomes measured for all randomized units?
- Are there multiple arms or factorial components?

## Target Estimands

- ITT
- ATE under full adherence
- per-protocol effect
- CACE/LATE
- cluster-level ATE
- factorial main effects/interactions

## Candidate Methods

- difference in means/proportions
- regression adjustment
- ANCOVA
- randomization inference
- cluster-robust inference
- mixed models/GEE
- IV for noncompliance

## Common Packages and Tools

- R estimatr
- R randomizr
- R lme4/geepack/clubSandwich
- Python statsmodels

## Required Diagnostics

- randomization balance table
- CONSORT-style flow
- attrition by arm
- compliance table
- cluster size summary
- multiple-testing plan

## Red Flags

- dropping randomized units after treatment
- per-protocol interpreted as randomized without assumptions
- ignoring cluster randomization
- post-treatment covariate adjustment

## Code Templates

- No dedicated script yet; use the workflow and package recipes.

## Operating Instructions

1. Confirm the estimand and target population before recommending a method.
2. Confirm that variables used for adjustment or modeling have valid timing for this design.
3. State identification assumptions separately from model assumptions.
4. Propose a primary analysis and at least one diagnostic or sensitivity analysis.
5. If diagnostics fail, recommend redesign, a different estimand, or a weaker/descriptive interpretation.
6. When returning code, adapt variable names and include comments showing where the user must supply data-specific details.

## Output Template

```markdown
### Randomized Experiments Analysis Plan

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
