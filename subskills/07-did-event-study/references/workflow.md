# Workflow: Did Event Study

## Goal

Use for difference-in-differences, event studies, panel policy evaluation, and staggered adoption designs.

## Intake Checklist

- [ ] When is each unit first treated?
- [ ] Are there never-treated or not-yet-treated controls?
- [ ] What pre-treatment periods are available?
- [ ] Is anticipation possible?
- [ ] Are treatment effects likely heterogeneous?
- [ ] What clustering level is appropriate?

## Estimand Checklist

- ATT
- group-time ATT
- dynamic/event-time ATT
- overall ATT
- cohort-specific effects

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

- Callaway-Sant'Anna group-time ATT
- Sun-Abraham event studies
- doubly robust DiD
- two-stage DiD
- fixed effects with caution
- placebo tests

## Diagnostics

- treatment timing table
- pretrend/event-study plot
- no-anticipation discussion
- control-group sensitivity
- clustered SE
- placebo outcomes/periods

## Common Packages

- R did
- R fixest
- R DRDID
- R did2s
- R bacondecomp

## Failure Modes

- naive TWFE with heterogeneous staggered effects
- parallel trends assumed without evidence
- anticipation
- time-varying composition
- spillovers across units

## Suggested Response Pattern

```markdown
I would treat this as a [did-event-study] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
