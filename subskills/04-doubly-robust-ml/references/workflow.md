# Workflow: Doubly Robust Ml

## Goal

Use for AIPW, TMLE, DoubleML, orthogonal learning, cross-fitting, and flexible nuisance estimation.

## Intake Checklist

- [ ] What is the target estimand and outcome scale?
- [ ] What covariates are valid pre-treatment controls?
- [ ] Are nuisance models high-dimensional or nonlinear?
- [ ] Can sample splitting/cross-fitting be used?
- [ ] What learner library is acceptable?

## Estimand Checklist

- ATE
- ATT
- CATE
- risk difference
- mean difference
- partially linear model parameter
- interactive regression model parameter

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

- AIPW
- TMLE
- cross-fitted one-step estimators
- Double/debiased ML
- SuperLearner ensembles
- orthogonal scores

## Diagnostics

- cross-fitting folds
- nuisance model summaries
- overlap
- influence-curve diagnostics
- learner sensitivity
- robust SE/CI

## Common Packages

- R tmle/tmle3/sl3/SuperLearner/DoubleML
- Python DoubleML/EconML/DoWhy/statsmodels

## Failure Modes

- ML used to claim causality without identification
- no cross-fitting with complex learners
- overlap ignored
- black-box CATE overinterpreted

## Suggested Response Pattern

```markdown
I would treat this as a [doubly-robust-ml] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
