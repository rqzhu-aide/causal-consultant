# Workflow: Point Treatment Observational

## Goal

Use for observational studies with one primary treatment/exposure time and measured pre-treatment confounders.

## Intake Checklist

- [ ] What defines eligibility and time zero?
- [ ] Which confounders were measured before treatment?
- [ ] Is the treatment binary, multivalued, or continuous?
- [ ] What target population is desired: ATE, ATT, ATC, overlap?
- [ ] Are there contraindications or deterministic treatment rules?

## Estimand Checklist

- ATE
- ATT
- ATC
- ATO
- CATE
- dose-response

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

- regression adjustment
- g-computation
- matching
- IPW
- overlap weighting
- AIPW
- TMLE
- DML

## Diagnostics

- baseline table
- overlap plot
- balance diagnostics
- weight diagnostics
- sensitivity to covariate set
- negative controls where possible

## Common Packages

- R MatchIt/WeightIt/cobalt
- R tmle/tmle3/SuperLearner
- Python DoWhy/DoubleML/statsmodels

## Failure Modes

- confounders measured after treatment
- time zero not aligned
- poor overlap
- unmeasured confounding
- outcome measured before treatment

## Suggested Response Pattern

```markdown
I would treat this as a [point-treatment-observational] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
