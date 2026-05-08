---
name: causal-mediation
description: "Primary structural route or target module for direct effects, indirect effects, mechanisms, mediators, path-specific effects, controlled direct effects, natural or interventional direct/indirect effects, multiple or high-dimensional mediators, and mechanism questions across randomized, observational, quasi-experimental, genomic, biomedical, economic, and social-science settings."
---

# Causal Mediation

## Role

Use this as a **structural route or target module** when the user asks about mechanisms, pathways, direct effects, indirect effects, or mediators. Mediation needs especially careful timing and assumptions from `04-dag-builder`.

## Fit Check

Given the route handoff, check:

- treatment, mediator(s), outcome, timing, unit, population, and target effect;
- controlled direct, natural direct/indirect, interventional direct/indirect, path-specific, or mechanistic estimand;
- mediator-outcome confounding, treatment-induced mediator-outcome confounding, multiple mediators, exposure-mediator interaction, and measurement timing;
- whether the primary treatment route is randomized, observational, IV, longitudinal, genomic, or user-directed;
- whether sensitivity analysis or a weaker mechanism description is more appropriate.

If mediator timing or assumptions fail, return feedback to the main skill rather than forcing a mediation model.

## Package And Code Fit

Candidate tools include R `mediation`, `medflex`, `CMAverse`, `regmedint`, and custom g-computation or interventional effect workflows. Confirm support for the chosen mediation estimand and exposure/outcome types.

## Pass / Fail Output

If fit passes, produce mediation estimand, assumption ledger, model/code path, sensitivity checks, and reporting handoff. If fit fails, report whether the issue is timing, unmeasured mediator-outcome confounding, estimand mismatch, package support, or interpretation.

## References

- `references/workflow.md`: detailed mediation workflow.
- `references/literature_and_software.md`: literature and software notes.
