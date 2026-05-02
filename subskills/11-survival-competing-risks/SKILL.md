---
name: survival-competing-risks
description: Use for time-to-event outcomes, censoring, competing risks, adjusted survival curves, RMST, and survival causal estimands.
---

# Survival Competing Risks

## When to Use

- time-to-event outcome
- right censoring
- competing risks
- hazard ratio
- RMST
- adjusted survival curves

## First Questions

- What is time zero?
- What event defines failure?
- What censoring occurs?
- Are competing events scientifically meaningful?
- Is the target survival probability, risk, cumulative incidence, hazard, or RMST?
- Does treatment affect censoring or competing events?

## Target Estimands

- survival difference at t
- risk difference by t
- RMST difference
- cumulative incidence contrast
- cause-specific hazard contrast
- subdistribution contrast

## Candidate Methods

- standardized survival curves
- IPCW
- AIPW/TMLE survival
- Cox model with caution
- RMST regression
- competing-risk cumulative incidence

## Common Packages and Tools

- R survival
- R adjustedCurves
- R riskRegression
- R survtmle
- R lmtp

## Required Diagnostics

- risk-set definition
- censoring by treatment
- censoring weights
- adjusted curves
- RMST
- competing-risk handling

## Red Flags

- immortal time
- hazard ratio interpreted as risk ratio
- hazard ratio emphasized when the scientific target is risk, survival probability, cumulative incidence, or RMST
- competing risks censored without justification
- time zero after treatment
- informative censoring ignored

## Code Templates

- `scripts/R/survival_adjusted_curves_template.R`

## Operating Instructions

1. Confirm the estimand and target population before recommending a method.
2. Confirm that variables used for adjustment or modeling have valid timing for this design.
3. State identification assumptions separately from model assumptions.
4. Propose a primary analysis and at least one diagnostic or sensitivity analysis.
5. If diagnostics fail, recommend redesign, a different estimand, or a weaker/descriptive interpretation.
6. When returning code, adapt variable names and include comments showing where the user must supply data-specific details.

## Output Template

```markdown
### Survival Competing Risks Analysis Plan

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
