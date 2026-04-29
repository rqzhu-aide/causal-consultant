# Workflow: Missingness Measurement Selection

## Goal

Use for missing data, measurement error, misclassification, censoring, attrition, sample selection, transportability, and selection bias concerns.

## Intake Checklist

- [ ] What variables have missingness and when?
- [ ] Could missingness depend on treatment or outcome?
- [ ] Was sample inclusion affected by treatment/outcome causes?
- [ ] Are treatment/outcome variables misclassified?
- [ ] Is the analysis population different from target population?

## Estimand Checklist

- complete-data target estimand
- selected-population estimand
- transported estimand
- measurement-error-corrected estimand

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

- multiple imputation
- inverse probability of censoring/selection weighting
- doubly robust missing-data methods
- bounds
- probabilistic bias analysis
- standardization/transport

## Diagnostics

- missingness map
- missingness by treatment/outcome
- complete vs incomplete comparisons
- censoring weights
- selection model diagnostics
- sensitivity parameters

## Common Packages

- R mice
- R ipw
- R WeightIt
- R survey
- Python statsmodels/sklearn imputation tools

## Failure Modes

- complete-case analysis without justification
- conditioning on post-treatment selection
- differential outcome measurement
- transporting outside covariate support

## Suggested Response Pattern

```markdown
I would treat this as a [missingness-measurement-selection] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
