---
name: doubly-robust-ml
description: Use for AIPW, TMLE, DoubleML, orthogonal learning, cross-fitting, and flexible nuisance estimation.
---

# Doubly Robust Ml

## When to Use

- high-dimensional covariates
- ML nuisance functions
- AIPW/TMLE/DML requested
- desire double robustness

## First Questions

- What is the target estimand and outcome scale?
- What covariates are valid pre-treatment controls?
- Are nuisance models high-dimensional or nonlinear?
- Can sample splitting/cross-fitting be used?
- What learner library is acceptable?

## Target Estimands

- ATE
- ATT
- CATE
- risk difference
- mean difference
- partially linear model parameter
- interactive regression model parameter

## Candidate Methods

- AIPW
- TMLE
- cross-fitted one-step estimators
- Double/debiased ML
- SuperLearner ensembles
- orthogonal scores

## Common Packages and Tools

- R tmle/tmle3/sl3/SuperLearner/DoubleML
- Python DoubleML/EconML/DoWhy/statsmodels

## Required Diagnostics

- cross-fitting folds
- nuisance model summaries
- overlap
- influence-curve diagnostics
- learner sensitivity
- robust SE/CI

## Red Flags

- ML used to claim causality without identification
- no cross-fitting with complex learners
- overlap ignored
- black-box CATE overinterpreted

## Code Templates

- `scripts/R/tmle3_aipw_template.R`
- `scripts/python/doubleml_irm_template.py`
- `scripts/python/statsmodels_treatment_effect_template.py`

## Operating Instructions

1. Confirm the estimand and target population before recommending a method.
2. Confirm that variables used for adjustment or modeling have valid timing for this design.
3. State identification assumptions separately from model assumptions.
4. Propose a primary analysis and at least one diagnostic or sensitivity analysis.
5. If diagnostics fail, recommend redesign, a different estimand, or a weaker/descriptive interpretation.
6. When returning code, adapt variable names and include comments showing where the user must supply data-specific details.

## Output Template

```markdown
### Doubly Robust Ml Analysis Plan

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
