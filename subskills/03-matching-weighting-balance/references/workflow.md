# Workflow: Matching Weighting Balance

## Goal

Use for propensity score matching, weighting, subclassification, balance assessment, and overlap diagnostics.

## Intake Checklist

- [ ] What estimand should the design target: ATE, ATT, ATC, ATO?
- [ ] Which covariates are pre-treatment confounders?
- [ ] Should exact matching or calipers be required for key variables?
- [ ] What level of imbalance is acceptable?
- [ ] What is the plan if overlap is poor?

## Estimand Checklist

- ATE
- ATT
- ATC
- ATO/overlap estimand
- matched-sample estimand

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

- nearest-neighbor matching
- optimal matching
- full matching
- IPW
- stabilized weights
- overlap weights
- entropy balancing
- covariate balancing propensity scores

## Diagnostics

- standardized mean differences
- Love plot
- variance ratios
- propensity overlap
- weight distribution
- effective sample size
- discarded units

## Common Packages

- R MatchIt
- R WeightIt
- R cobalt
- R CBPS
- R optweight

## Failure Modes

- balance not checked
- using p-values for balance
- post-treatment covariates in PS model
- extreme weights
- changing estimand silently after trimming

## Suggested Response Pattern

```markdown
I would treat this as a [matching-weighting-balance] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
