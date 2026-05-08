---
name: did-event-study
description: "Primary route subskill for difference-in-differences, event studies, panel or repeated cross-section policy evaluation, staggered adoption, group-time ATT, dynamic effects, pretrend diagnostics, anticipation, parallel-trends sensitivity, and route-fit feedback to the main skill."
---

# Difference-In-Differences And Event Studies

## Role

Use this as a **primary route subskill** when the route relies on treated and comparison units observed before and after adoption or policy change. The main skill owns route activation; this subskill audits DiD-specific fit.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Route-Fit Check

Given the route handoff, check:

- unit, time period, treatment adoption timing, comparison group, absorbing/nonabsorbing treatment, and outcome timing;
- target estimand: group-time ATT, dynamic/event-time effect, calendar-time aggregate, simple ATT, or policy effect;
- pre-treatment periods, anticipation, staggered adoption, treatment reversals, spillovers, compositional changes, and clustering;
- whether parallel trends is plausible, diagnosable, or only assumption-dependent;
- whether synthetic control/time-series, RD, IV, or descriptive fallback is more appropriate.

If pre-periods, comparison units, or treatment timing are inadequate, return feedback to the main skill before code.

## Package And Code Fit

Candidate R tools include `did`, `fixest`, `DRDID`, `did2s`, and sensitivity packages. Python support is less standardized for modern staggered DiD; verify package capability before production use.

## Pass / Fail Output

If fit passes, produce event-study/DiD plan, estimator choice, diagnostic and sensitivity plan, code path, and reporting cautions. If fit fails, report the failed route condition and recommended next action.

## References

- `references/workflow.md`: detailed DiD workflow.
- `references/did_design_notes.md`: compact design notes.
- `references/literature_and_software.md`: literature and software map.
