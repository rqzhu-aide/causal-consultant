---
name: negative-controls-proximal
description: "Primary or specialized identification route subskill for negative-control exposures/outcomes, proximal causal inference, proxy variables for unmeasured confounding, bridge functions, falsification checks, bias-detection workflows, custom estimating equations, and route-fit feedback when standard measured-confounding assumptions are not enough."
---

# Negative Controls And Proximal Causal Inference

## Role

Use this as a **primary or specialized identification route subskill** when the route relies on negative controls, proxy variables, or proximal causal inference to address unmeasured confounding. It should be tightly coordinated with `04-dag-builder`, because the identifying logic is mainly structural.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Route-Fit Check

Given the route handoff, check:

- treatment/action, outcome, target population, unit, time zero, and target effect;
- proposed negative-control exposure, negative-control outcome, treatment-inducing proxy, outcome-inducing proxy, or other proxy variables;
- timing and exclusion logic: controls/proxies must not be affected in ways that violate the intended bridge or falsification argument;
- whether completeness, relevance, proxy-quality, bridge-function, and no-direct-effect assumptions are plausible enough for the intended claim;
- whether the data can support bridge estimation, falsification checks, sensitivity analysis, or only qualitative bias assessment.

If controls/proxies are not credible, return feedback to the main skill and recommend data collection, a weaker estimand, sensitivity analysis, or user-directed caveats.

## Package And Code Fit

Package support is less standardized than for DiD, RD, IV, or matching. Expect some workflows to require custom regression, GMM, flexible nuisance estimation, simulation, or sensitivity/falsification code. Verify any specialized package before using it for a causal claim.

## Pass / Fail Output

If fit passes, produce a proximal/negative-control estimand, assumption ledger, bridge/falsification plan, candidate code path, diagnostics, and reporting handoff. If fit fails, identify whether the problem is proxy definition, timing, bridge assumptions, data support, package support, or claim strength.

## Handoff Back To Main Skill

Return structured feedback to the main skill when:

- controls or proxies look post-treatment, invalid, or too weak;
- bridge-function assumptions are not defensible;
- package/code support is too custom for the requested deliverable;
- results should remain sensitivity/falsification evidence rather than a primary causal effect.
