---
name: interference-spillovers
description: Use when one unit's treatment may affect another unit's outcome, including networks, households, clusters, markets, infectious diseases, and peer effects.
---

# Interference Spillovers

## When to Use

- spillovers
- network effects
- infectious disease transmission
- peer effects
- cluster exposure
- market equilibrium

## First Questions

- What is the interference structure: cluster, network, spatial, market?
- What exposure mapping summarizes others' treatment?
- Are direct and spillover effects both of interest?
- Is partial interference plausible?
- Is there positivity for exposure levels?

## Target Estimands

- direct effect
- indirect/spillover effect
- total effect
- overall effect
- exposure-response effect

## Candidate Methods

- partial interference models
- exposure mapping
- cluster-level estimators
- network IPW
- network TMLE
- randomization inference

## Common Packages and Tools

- R inferference
- R tmlenet
- custom network exposure code

## Required Diagnostics

- network/cluster summary
- exposure distribution
- positivity for exposure
- sensitivity to exposure mapping
- dependence-robust inference

## Red Flags

- SUTVA assumed despite obvious spillovers
- exposure mapping arbitrary and untested
- units treated as independent
- cluster-level intervention interpreted as individual-only effect

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
### Interference Spillovers Analysis Plan

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
