---
name: causal-reporting-interpretation
description: "Reporting layer for causal analysis plans, methods sections, diagnostics summaries, interpretation, limitations, claim-strength calibration, assumption ledgers, reproducibility appendices, package/version records, and user-facing summaries after foundation and method subskills produce route evidence."
---

# Reporting And Interpretation

## Role

Use this as the **reporting layer**. It does not validate a route or strengthen claim language. It converts the current project state, route analysis, diagnostics, assumptions, limitations, and claim strength into user-facing deliverables.

## Fit Check

Before writing, check:

- `foundation_gate.status`, `analysis.route_commitment_status`, and `analysis.claim_strength`;
- `analysis.execution_stage`, `analysis.execution_confirmation`, first-pass status, and whether final reporting has been approved or is only a progress summary;
- selected route, estimand, population, comparator, outcome scale, time horizon, and method subskill outputs;
- diagnostics, sensitivity checks, failed routes, caveats, and user-directed constraints;
- Data Technician method-fit suggestions and any unresolved data feasibility warnings;
- load-bearing assumptions and whether they were surfaced, acknowledged, or deferred;
- reproducibility needs: package names, versions, seeds, data-processing notes, code paths, and artifacts.

If the requested report would overstate the causal claim, return to the main skill with safer language or a needed route/diagnostic check. If only a first pass has been run, produce a progress memo or preliminary interpretation unless the user explicitly asks to defer remaining diagnostics and approve final reporting.

## Output Types

Produce concise causal analysis plans, methods sections, result interpretations, limitation sections, diagnostic summaries, assumption ledgers, reproducibility appendices, stakeholder summaries, and handoff memos.

## Claim Language

Match language to support:

- `causal`: supported gate-ready route and diagnostics.
- `cautious causal`: assumption-dependent or user-directed with clear caveats.
- `associational`, `descriptive`, or `exploratory`: unresolved route support or discovery-oriented analysis.

## References

- `references/workflow.md`: detailed reporting workflow.
