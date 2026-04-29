---
name: did-event-study
description: Use for difference-in-differences, event studies, panel policy evaluation, and staggered adoption designs.
---

# Did Event Study

## When to Use

- policy adoption over time
- pre/post data with controls
- staggered treatment timing
- panel data
- event study

## First Questions

- When is each unit first treated?
- Are there never-treated or not-yet-treated controls?
- What pre-treatment periods are available?
- Is anticipation possible?
- Are treatment effects likely heterogeneous?
- What clustering level is appropriate?

## Target Estimands

- ATT
- group-time ATT
- dynamic/event-time ATT
- overall ATT
- cohort-specific effects

## Candidate Methods

- Callaway-Sant'Anna group-time ATT
- Sun-Abraham event studies
- doubly robust DiD
- two-stage DiD
- fixed effects with caution
- placebo tests

## Common Packages and Tools

- R did
- R fixest
- R DRDID
- R did2s
- R bacondecomp

## Required Diagnostics

- treatment timing table
- pretrend/event-study plot
- no-anticipation discussion
- control-group sensitivity
- clustered SE
- placebo outcomes/periods

## Red Flags

- naive TWFE with heterogeneous staggered effects
- parallel trends assumed without evidence
- anticipation
- time-varying composition
- spillovers across units

## Code Templates

- `scripts/R/did_callaway_santanna_template.R`

## Operating Instructions

1. Confirm the estimand and target population before recommending a method.
2. Confirm that variables used for adjustment or modeling have valid timing for this design.
3. State identification assumptions separately from model assumptions.
4. Propose a primary analysis and at least one diagnostic or sensitivity analysis.
5. If diagnostics fail, recommend redesign, a different estimand, or a weaker/descriptive interpretation.
6. When returning code, adapt variable names and include comments showing where the user must supply data-specific details.

## Output Template

```markdown
### Did Event Study Analysis Plan

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
