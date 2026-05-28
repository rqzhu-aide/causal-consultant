# Red Flags Reference

Use this reference when a gate decision, framework choice, causal claim, report wording, or method activation depends on whether a causal-method risk is blocking, diagnosable, or only a wording limitation.

Do not load it for ordinary exploration unless the next reply depends on one of these risks.

## Record A Consequence When

Record a blocker, wording boundary, diagnostic need, or request for progression when:

- the user's goal, deliverable, exposure/intervention, comparator, outcome, population, causal unit, time zero, or follow-up is unclear;
- treatment/exposure may not precede the outcome;
- eligibility, baseline, exposure, follow-up, outcome, or censoring windows conflict;
- proposed adjustment, restriction, matching/weighting, stratification, complete-case, or model-covariate choices may condition on post-treatment variables, mediators, colliders, selection variables, instruments, precision variables, or effect modifiers requiring different handling;
- the row unit described by data does not match the causal unit required by one or more target estimands;
- support, overlap, randomization, instrument validity, cutoff logic, parallel trends, censoring assumptions, or no-interference assumptions are fragile;
- missingness, selection, exclusions, or censoring may depend on treatment, outcome, or post-treatment processes;
- the method can run but the causal framework is not supportable;
- new evidence or materials make the planned causal claim impossible or materially different;
- causal language is stronger than design, assumptions, diagnostics, sensitivity checks, or gate status support.

## Response Pattern

Use the smallest consequence that keeps the project honest:

- `blockers` when the intended causal or statistical claim cannot proceed as stated;
- `diagnostics_plan` or `sensitivity_plan` when a bounded check could decide whether the risk matters;
- `report_wording_boundary` when the analysis may proceed but the claim language must be weaker;
- `requests_for_progression` when one user clarification, data check, or specialist review would resolve the issue.

When several red flags are present, surface the one or two that change the next move. Keep the rest as concise internal notes.
