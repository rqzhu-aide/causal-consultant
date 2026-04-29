---
name: matching-weighting-balance
description: Use for propensity score matching, weighting, subclassification, balance assessment, and overlap diagnostics.
---

# Matching Weighting Balance

## When to Use

- user mentions propensity scores
- matching/weighting requested
- need transparent confounding adjustment
- need balance diagnostics

## First Questions

- What estimand should the design target: ATE, ATT, ATC, ATO?
- Which covariates are pre-treatment confounders?
- Should exact matching or calipers be required for key variables?
- What level of imbalance is acceptable?
- What is the plan if overlap is poor?

## Target Estimands

- ATE
- ATT
- ATC
- ATO/overlap estimand
- matched-sample estimand

## Candidate Methods

- nearest-neighbor matching
- optimal matching
- full matching
- IPW
- stabilized weights
- overlap weights
- entropy balancing
- covariate balancing propensity scores

## Common Packages and Tools

- R MatchIt
- R WeightIt
- R cobalt
- R CBPS
- R optweight

## Required Diagnostics

- standardized mean differences
- Love plot
- variance ratios
- propensity overlap
- weight distribution
- effective sample size
- discarded units

## Red Flags

- balance not checked
- using p-values for balance
- post-treatment covariates in PS model
- extreme weights
- changing estimand silently after trimming

## Code Templates

- `scripts/R/matchit_weightit_cobalt_template.R`

## Operating Instructions

1. Confirm the estimand and target population before recommending a method.
2. Confirm that variables used for adjustment or modeling have valid timing for this design.
3. State identification assumptions separately from model assumptions.
4. Propose a primary analysis and at least one diagnostic or sensitivity analysis.
5. If diagnostics fail, recommend redesign, a different estimand, or a weaker/descriptive interpretation.
6. When returning code, adapt variable names and include comments showing where the user must supply data-specific details.

## Output Template

```markdown
### Matching Weighting Balance Analysis Plan

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
