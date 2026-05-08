---
name: interference-spillovers
description: "Primary structural route subskill for causal questions where one unit's treatment, exposure, assignment, behavior, or outcome can affect another unit's outcome, including spillovers, contamination, networks, peer effects, diffusion, spatial exposure, cluster interference, marketplace effects, and SUTVA violations."
---

# Interference And Spillovers

## Role

Use this as a **primary structural route subskill** when no-interference/SUTVA is implausible. It may combine with randomized, observational, DiD, network, survival, or policy-learning routes.

## Route-Fit Check

Given the route handoff, check:

- units, clusters, networks, spatial structure, exposure mapping, treatment saturation, and outcome interference;
- estimand: direct effect, spillover effect, total effect, exposure-response effect, cluster-level effect, policy effect, or equilibrium effect;
- whether exposure mapping is observed, constructible, or assumed;
- partial interference, network interference, contamination, equilibrium feedback, and measurement quality;
- whether diagnostics, sensitivity checks, or design revisions are possible.

If the exposure mapping or interference structure is not defensible, return feedback to the main skill.

## Package And Code Fit

Candidate tools include R `inferference`, `tmlenet`, custom exposure-mapping workflows, and route-specific estimators. Package support is uneven, so confirm estimand and data compatibility before implementation.

## Pass / Fail Output

If fit passes, produce exposure mapping, estimand, analysis plan, diagnostics, sensitivity checks, and reporting handoff. If fit fails, identify whether the issue is network data, exposure definition, design, package support, or claim strength.

## References

- `references/workflow.md`: detailed interference workflow.
- `references/literature_and_software.md`: literature and software notes.
