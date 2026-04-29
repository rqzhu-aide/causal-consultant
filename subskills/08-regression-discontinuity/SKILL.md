---
name: regression-discontinuity
description: Use for sharp or fuzzy regression discontinuity designs based on treatment assignment near a cutoff.
---

# Regression Discontinuity

## When to Use

- assignment cutoff
- threshold rule
- running variable
- eligibility score
- fuzzy cutoff uptake

## First Questions

- What is the running variable and cutoff?
- Is treatment deterministic at the cutoff or fuzzy?
- Can the running variable be manipulated?
- Are covariates continuous at the cutoff?
- What local population near the cutoff is meaningful?

## Target Estimands

- local average treatment effect at cutoff
- fuzzy RD LATE near cutoff

## Candidate Methods

- local polynomial RD
- robust bias-corrected inference
- bandwidth selection
- fuzzy RD
- donut RD
- covariate continuity checks

## Common Packages and Tools

- R/Python rdrobust
- R rddensity

## Required Diagnostics

- RD plot
- density/manipulation test
- bandwidth sensitivity
- covariate continuity
- donut sensitivity
- local estimand statement

## Red Flags

- running variable manipulation
- global polynomial only
- no bandwidth sensitivity
- interpreting local effect as population ATE
- wrong cutoff

## Code Templates

- `scripts/R/rdrobust_template.R`
- `scripts/python/rdrobust_template.py`

## Operating Instructions

1. Confirm the estimand and target population before recommending a method.
2. Confirm that variables used for adjustment or modeling have valid timing for this design.
3. State identification assumptions separately from model assumptions.
4. Propose a primary analysis and at least one diagnostic or sensitivity analysis.
5. If diagnostics fail, recommend redesign, a different estimand, or a weaker/descriptive interpretation.
6. When returning code, adapt variable names and include comments showing where the user must supply data-specific details.

## Output Template

```markdown
### Regression Discontinuity Analysis Plan

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
