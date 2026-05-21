# Final Report Template

Use this template when `report_production` evidence and materials are ready enough for a finished narrative report, memo, methods/results section, or same-evidence revision. Populate it from the project YAML state, `subskill_records`, and linked artifacts. Do not add causal claims, diagnostics, figures, tables, or preferences that are not supported by recorded evidence.

Markdown is the default first-round deliverable. Make it coherent and lightly polished, but keep it auditable and easy to revise. Treat this file as a structured draft that can be reviewed directly, revised in place, or used with the referenced data/code/artifacts as source material for a more polished report.

```markdown
# [Project-Specific Final Report Title]

## 1. Summary And Claim Status

[State the user goal, the data used, the selected causal framework, the main result if available, the recorded claim strength, and the most important limitation.]

## 2. Background And Domain Interpretation

[Use `domain_expert` for scientific context, construct validity, meaningful interpretation, external validity, and action-recommendation cautions.]

## 3. Causal Question And Specification

[Use `method_lead` for treatment/exposure, comparator, outcome, population, time zero, follow-up, estimand, selected analysis framework, DAG/theory, and load-bearing assumptions.]

## 4. Data And Analysis Materials

[Use `data_analyst` for data sources, row unit, variable construction, missingness/selection/support, reproducibility assets, analysis datasets, tables, figures, and paths.]

## 5. Method, Results, Diagnostics, And Sensitivity

[Use `subskill_records`, executed reports, and artifacts for methods, estimates, uncertainty, diagnostics, sensitivity checks, and limitations. Include only sourced numbers.]

## 6. Modular Analysis Components

[Integrate activated method/job subskills and sidecars that materially shaped the project or produced report-worthy evidence. Give each central module a coherent subsection with purpose, inputs, method/design logic, findings, diagnostics, limitations, reviewer interpretation, references, and artifact paths. If causal discovery was activated as part of the workflow, fold its discovery-report structure into a visible exploratory discovery subsection rather than attaching a separate standalone report.]

## 7. Interpretation, Limits, And Recommendation Boundary

[State what can be claimed, what cannot be claimed, where the result applies, what assumptions matter, and how far any action recommendation can go.]

## 8. Reproducibility And Artifact Index

[List source reports, rendered reports, scripts, data products, figures, tables, seeds, package versions, and rerun notes when available.]

## Appendix A. Code And Reproducibility

[If code produced reported numbers, diagnostics, tables, figures, graph artifacts, or analysis datasets, list code/notebook paths, purpose, inputs, outputs, package/version notes when available, seeds, and rerun notes. Include short code excerpts only when they clarify key transformations or models; otherwise link the full scripts/notebooks as artifacts.]
```

If a section has no supporting evidence, include a short transparent statement rather than filling the gap.
