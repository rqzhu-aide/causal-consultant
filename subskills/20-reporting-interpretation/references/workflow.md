# Workflow: Causal Reporting Interpretation

## Goal

Use to write causal analysis plans, reports, diagnostics summaries, interpretation sections, limitations, and reproducibility appendices.

## Intake Checklist

- [ ] Who is the audience?
- [ ] What reporting standard or domain convention applies?
- [ ] What estimand and scale should be highlighted?
- [ ] Which diagnostics passed or failed?
- [ ] What claims should be toned down?

## Estimand Checklist

- all estimands, reported with target population and scale

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

- structured reporting
- assumption ledger
- diagnostic summaries
- sensitivity narrative
- reproducibility appendix

## Diagnostics

- all design-specific diagnostics
- result interpretation checklist
- package version record

## Common Packages

- Quarto/R Markdown/Jupyter
- sessionInfo()/renv
- pip freeze/conda env export

## Failure Modes

- causal language exceeds assumptions
- estimand omitted
- diagnostics omitted
- limitations vague
- methods irreproducible

## Suggested Response Pattern

```markdown
I would treat this as a [causal-reporting-interpretation] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
