---
name: longitudinal-gmethods
description: Use for time-varying treatments, time-varying confounders, dynamic regimes, censoring, marginal structural models, g-formula, longitudinal TMLE, and modified treatment policies.
---

# Longitudinal Gmethods

## When to Use

- treatment changes over time
- time-varying confounding
- dynamic treatment regime
- repeated treatment decisions
- censoring affected by history

## First Questions

- What are the decision times?
- What is the treatment regime?
- Which time-varying confounders are affected by prior treatment?
- What censoring/competing events occur?
- Is the estimand static, dynamic, or modified treatment policy?

## Target Estimands

- E[Y^g]
- regime contrast
- dynamic treatment regime value
- modified treatment policy effect
- per-protocol effect with grace period

## Candidate Methods

- marginal structural models/IPW
- parametric g-formula
- sequential g-computation
- longitudinal TMLE
- lmtp
- cloning-censoring-weighting

## Common Packages and Tools

- R ipw
- R gfoRmula
- R ltmle
- R lmtp

## Required Diagnostics

- timeline diagram
- sequential positivity
- time-specific/cumulative weights
- censoring weights
- regime support
- model checks

## Red Flags

- standard regression adjusting for time-varying confounders affected by prior treatment
- poor sequential positivity
- ambiguous grace periods
- censoring ignored

## Code Templates

- `scripts/R/longitudinal_gmethods_template.R`

## Operating Instructions

1. Confirm the estimand and target population before recommending a method.
2. Confirm that variables used for adjustment or modeling have valid timing for this design.
3. State identification assumptions separately from model assumptions.
4. Propose a primary analysis and at least one diagnostic or sensitivity analysis.
5. If diagnostics fail, recommend redesign, a different estimand, or a weaker/descriptive interpretation.
6. When returning code, adapt variable names and include comments showing where the user must supply data-specific details.

## Output Template

```markdown
### Longitudinal Gmethods Analysis Plan

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
