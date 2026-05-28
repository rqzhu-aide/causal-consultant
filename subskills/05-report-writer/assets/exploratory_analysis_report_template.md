# Exploratory / Progress Analysis Report Template

Use this flexible template when analyzable data, exploratory summaries, or prototype model outputs exist but the causal specification or report_production evidence is not ready for a final causal report. This report is for learning, debugging, model exploration, diagnostics, and progress review.

The default deliverable is a reproducible source report plus rendered HTML when feasible. If HTML is delivered, the paired source report is required and must be recorded with the rendered path:

```text
artifacts/
  [descriptive-name]-exploratory.ipynb   # or .qmd / .Rmd
  [descriptive-name]-exploratory.html
  figures/
  tables/
```

## Required Claim Boundary

State the current workflow status near the beginning:

```yaml
project_summary.current_phase: project_exploration | causal_specification | report_production
causal_gate.status: exploratory | not_ready | ready | blocked | complete
production_gate.status: not_ready | ready | blocked | complete
production_gate.claim_strength_for_report: exploratory | associational | descriptive | cautious_causal | supported_causal | unknown
data_analyst.analysis_alignment.status: not_checked | checked | needs_update | blocked | deferred | not_applicable
data_analyst.analysis_alignment.data_supported_claim_ceiling: exploratory | descriptive | associational | cautious_causal | supported_causal | no_causal_claim | unknown
```

Do not present an estimate as a final validated causal effect. Use language such as "exploratory estimate", "model-based first pass", "association under this specification", "diagnostic result", or "not yet report-ready" when the gates or diagnostics are incomplete.

If this progress artifact is being polished for delivery rather than used as a private draft, run evidence review for data facts, method/claim wording, interpretation, and any activated specialist modules, or make deferred review limits visible.

Even in a progress report, state the learning point early, keep claims close to their evidence and scope, and separate exploratory observations from interpretation.

## Flexible Report Spine

```markdown
# [Project-Specific Exploratory / Progress Report Title]

## 1. Summary And Claim Boundary

[Summarize the user's request, the data inspected, the model or diagnostic attempted, the main pattern if available, and why this is not final causal evidence.]

## 2. Question, Data, And Candidate Framework

[Name the treatment/exposure, comparator, outcome, population, timing, target estimand, and candidate framework if known. State which pieces remain uncertain or provisional.]

## 3. Data Readiness, Alignment, And Analysis Specification

[Describe row unit, missingness, timing/leakage risks, support/overlap, variable constructability, preprocessing, alignment between intended claims and data support, attempted model, packages, and missing diagnostics.]

## 4. Results, Diagnostics, And Sensitivity

[Present only executed or verified summaries, plots, estimates, intervals, diagnostics, and model outputs. Clearly label exploratory or first-pass outputs.]

## 5. Interpretation And Next Step

[State what can be learned, what cannot be claimed, and the smallest next check or user decision that could move the project toward causal specification or report_production readiness.]

## 6. Reproducibility Appendix

[Record source report path, rendered HTML path, code paths, saved figures/tables, package versions, seeds, rendered-output QA status, and rerun notes.]
```

## Required Coverage

Every exploratory/progress report must cover report scope, data provenance, candidate question/design, data checks, analysis specification, results provenance, claim boundary, upgrade path, reproducibility, report asset checklist status, and rendered-output QA status when applicable.

Before release, the report asset checklist should identify:

- the main result visual or table, with provenance path;
- the key diagnostic visual or table, with provenance path;
- any intentionally omitted or deferred main result or diagnostic asset and why;
- the source report path and rendered report path when HTML is delivered.

## Code And Output Rules

- Results, diagnostics, plots, and tables must come from executed code, verified artifacts, or explicitly labeled user-provided outputs.
- If illustrative or simulated data are used, label them clearly.
- If data are unavailable, empty, inaccessible, or not constructible, switch to a planning/communication memo or code scaffold.
- Before delivering HTML, inspect the rendered file for malformed lists, broken tables, missing figures or captions, broken local paths, broken source links, and missing source-report path.
- Keep sensitive raw rows, direct identifiers, secrets, and small-cell details out of the rendered report unless explicitly approved and necessary.
