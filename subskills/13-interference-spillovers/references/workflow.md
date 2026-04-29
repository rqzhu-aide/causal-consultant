# Workflow: Interference Spillovers

## Goal

Use when one unit's treatment may affect another unit's outcome, including networks, households, clusters, markets, infectious diseases, and peer effects.

## Intake Checklist

- [ ] What is the interference structure: cluster, network, spatial, market?
- [ ] What exposure mapping summarizes others' treatment?
- [ ] Are direct and spillover effects both of interest?
- [ ] Is partial interference plausible?
- [ ] Is there positivity for exposure levels?

## Estimand Checklist

- direct effect
- indirect/spillover effect
- total effect
- overall effect
- exposure-response effect

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

- partial interference models
- exposure mapping
- cluster-level estimators
- network IPW
- network TMLE
- randomization inference

## Diagnostics

- network/cluster summary
- exposure distribution
- positivity for exposure
- sensitivity to exposure mapping
- dependence-robust inference

## Common Packages

- R inferference
- R tmlenet
- custom network exposure code

## Failure Modes

- SUTVA assumed despite obvious spillovers
- exposure mapping arbitrary and untested
- units treated as independent
- cluster-level intervention interpreted as individual-only effect

## Suggested Response Pattern

```markdown
I would treat this as a [interference-spillovers] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
