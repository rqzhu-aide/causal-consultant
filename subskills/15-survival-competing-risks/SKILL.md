---
name: survival-competing-risks
description: "Target and outcome module for causal questions with time-to-event outcomes, censoring, delayed entry, immortal-time risk, survival probabilities, cumulative incidence, competing risks, RMST, adjusted survival curves, hazard models, survival CATEs, and treatment decisions with survival endpoints."
---

# Survival And Competing Risks

## Role

Use this as a **target/outcome module** when the outcome is time-to-event or censoring/competing risks are central. It usually combines with a primary route such as randomized experiments, point-treatment observational, longitudinal g-methods, or HTE/policy.

## Fit Check

Given the route handoff, check:

- time origin, delayed entry, follow-up, event definition, censoring, competing events, and risk set;
- target estimand: survival probability, cumulative incidence, risk difference/ratio, RMST, hazard ratio, cause-specific effect, subdistribution effect, or dynamic treatment target;
- immortal-time risk, treatment timing, informative censoring, competing-risk interpretation, and selection;
- whether weighting, AIPW/TMLE, longitudinal methods, or HTE support is needed;
- whether diagnostics and sensitivity checks are possible.

Do not default to hazard ratios unless hazards are the scientific target.

## Package And Code Fit

Candidate tools include R `survival`, `adjustedCurves`, `riskRegression`, `prodlim`, `survtmle`, and route-specific workflows. Confirm package support for censoring, competing risks, clustering, weights, and estimand scale.

## Pass / Fail Output

If fit passes, produce survival estimand, analysis plan, censoring/competing-risk diagnostics, code path, and reporting handoff. If fit fails, identify the timing/outcome/censoring issue and return to the main skill.

## References

- `references/workflow.md`: detailed workflow.
- `references/survival_estimand_notes.md`: estimand notes.
- `references/literature_and_software.md`: literature and software notes.
