---
name: causal-reporting-interpretation
description: Use to write causal analysis plans, reports, diagnostics summaries, interpretation sections, limitations, and reproducibility appendices.
---

# Causal Reporting Interpretation

## When to Use

- final report
- interpret results
- write limitations
- summarize diagnostics
- causal analysis plan
- manuscript methods/results

## First Questions

- Who is the audience?
- What reporting standard or domain convention applies?
- What estimand and scale should be highlighted?
- Which diagnostics passed or failed?
- What claims should be toned down?

## Target Estimands

- all estimands, reported with target population and scale

## Candidate Methods

- structured reporting
- assumption ledger
- diagnostic summaries
- sensitivity narrative
- reproducibility appendix

## Common Packages and Tools

- Quarto/R Markdown/Jupyter
- sessionInfo()/renv
- pip freeze/conda env export

## Required Diagnostics

- all design-specific diagnostics
- result interpretation checklist
- package version record

## Completed Analysis Checklist

A completed causal analysis or report should include:

1. **Causal question and estimand.** Include a mathematical definition when useful.
2. **Design summary.** Explain why the design can or cannot support causal claims.
3. **Causal structure.** Include a DAG, design diagram, or variable-role map when relevant.
4. **Analysis population.** State inclusion/exclusion criteria and target population.
5. **Variables and timing.** Identify treatment, outcome, covariates, mediators, censoring, clustering, and time zero.
6. **Assumption ledger.** State assumptions and evidence or diagnostics for each.
7. **Primary estimate with uncertainty.** Include confidence interval or credible interval where appropriate.
8. **Diagnostics.** Include method-specific checks from the routed subskill or subskills.
9. **Sensitivity analyses.** Include at least one when feasible.
10. **Interpretation.** Use the estimand scale and target population accurately.
11. **Limitations.** Distinguish data limitations, design limitations, and identifying-assumption limitations.
12. **Reproducibility notes.** Include package names, versions if available, code skeleton, and random seeds.

## Red Flags

- causal language exceeds assumptions
- estimand omitted
- diagnostics omitted
- limitations vague
- methods irreproducible

## Code Templates

- `scripts/create_report_skeleton.py`

## Operating Instructions

1. Confirm the estimand and target population before recommending a method.
2. Confirm that variables used for adjustment or modeling have valid timing for this design.
3. State identification assumptions separately from model assumptions.
4. Propose a primary analysis and at least one diagnostic or sensitivity analysis.
5. If diagnostics fail, recommend redesign, a different estimand, or a weaker/descriptive interpretation.
6. When returning code, adapt variable names and include comments showing where the user must supply data-specific details.

## Output Template

```markdown
### Causal Reporting Interpretation Analysis Plan

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
