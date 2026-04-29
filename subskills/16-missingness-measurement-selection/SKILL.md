---
name: missingness-measurement-selection
description: Use for missing data, measurement error, misclassification, censoring, attrition, sample selection, transportability, and selection bias concerns.
---

# Missingness Measurement Selection

## When to Use

- missing data
- attrition
- censoring
- selection bias
- measurement error
- misclassification
- transportability

## First Questions

- What variables have missingness and when?
- Could missingness depend on treatment or outcome?
- Was sample inclusion affected by treatment/outcome causes?
- Are treatment/outcome variables misclassified?
- Is the analysis population different from target population?

## Target Estimands

- complete-data target estimand
- selected-population estimand
- transported estimand
- measurement-error-corrected estimand

## Candidate Methods

- multiple imputation
- inverse probability of censoring/selection weighting
- doubly robust missing-data methods
- bounds
- probabilistic bias analysis
- standardization/transport

## Common Packages and Tools

- R mice
- R ipw
- R WeightIt
- R survey
- Python statsmodels/sklearn imputation tools

## Required Diagnostics

- missingness map
- missingness by treatment/outcome
- complete vs incomplete comparisons
- censoring weights
- selection model diagnostics
- sensitivity parameters

## Red Flags

- complete-case analysis without justification
- conditioning on post-treatment selection
- differential outcome measurement
- transporting outside covariate support

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
### Missingness Measurement Selection Analysis Plan

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
