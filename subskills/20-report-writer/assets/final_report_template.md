# Final Causal Report Template

Use this template only after `production_gate.status: ready` and Report Writer handoff mode is active. Populate it from the recorded foundation and production state. Do not add new causal claims, diagnostics, figures, or user preferences that are not supported by `project.yaml`, `subskill_analyses`, or linked artifacts.

# [Report Title]

## Executive Summary

- **Problem:** [Decision question or practical problem.]
- **Bottom line:** [Best supported conclusion.]
- **Claim strength:** [causal | cautious causal | associational | descriptive | exploratory.]
- **Key evidence:** [Primary estimate, diagnostic, table, or figure supporting the conclusion.]
- **Main caution:** [Most important limitation or deferred check.]

## 1. Problem And Background

State the user's goal, decision context, audience-relevant background, and why the question matters. Use `main_skill`, `evaluators.domain_helper_01`, and `production_gate.handoff_summary`.

## 2. Causal Question And Estimand

Define:

- treatment or exposure;
- comparator;
- outcome;
- target population;
- unit and time zero;
- follow-up or time horizon;
- estimand or target contrast;
- allowed claim strength.

Use `routes`, `foundation_gate`, and activated method/job records.

## 3. Design And DAG Logic

Explain why the selected design route was used and why major alternatives were rejected, deferred, or treated as fallback. Summarize the DAG or causal logic, identification story, load-bearing assumptions, and any assumptions that were surfaced or deferred.

## 4. Data Construction And Readiness

Summarize the analysis dataset or conceptual data structure:

- row unit and timing;
- treatment, comparator, outcome, covariate, censoring, clustering, panel, or network construction;
- filtering, linkage, missingness, support, overlap, leakage, and measurement issues;
- reproducibility materials such as code paths, seeds, package versions, and data-processing artifacts.

Use Data Technician records and artifact paths.

## 5. Method And Job Analysis

Describe the method/job actually used, why it fits the route, and what it produced. Include the primary estimate or result, uncertainty, model/specification notes, implementation constraints, and any method-specific limitations.

Use `subskill_analyses`, `analysis.analyses`, and method/job handoff notes.

## 6. Diagnostics And Sensitivity

Present the checks that determine how the result should be interpreted.

| Check | Status | Evidence | Interpretation impact |
|---|---|---|---|
| Design fit | [pass/concern/fail/not run/not applicable] | [record/artifact] | [effect on claim] |
| Data fit | [status] | [record/artifact] | [effect on claim] |
| Required method diagnostic | [status] | [record/artifact] | [effect on claim] |
| Sensitivity or robustness | [status] | [record/artifact] | [effect on claim] |
| Reproducibility | [status] | [record/artifact] | [effect on claim] |

If diagnostics were deferred, say who deferred them, why, and how that limits the conclusion.

## 7. Figures And Tables Supporting The Conclusion

List the evidence displays used in the report.

| Exhibit | Source artifact | What it supports | Caveat |
|---|---|---|---|
| [Figure/Table name] | [path] | [result, diagnostic, or assumption] | [limitation] |

Use figures and tables as evidence. Keep unsupported or purely exploratory displays in an appendix or artifact index.

## 8. Conclusion And Interpretation

State the conclusion in language calibrated to the gate and diagnostics. Include the estimate scale, uncertainty, practical meaning, and what should not be inferred.

## 9. Limitations And Cautions

Summarize unresolved assumptions, missing diagnostics, data limits, external-validity limits, model/specification sensitivity, package or implementation constraints, and any results that should remain exploratory.

## 10. Reproducibility And Artifact Index

Record the analysis files, scripts, figures, tables, diagnostics, environment/session information, and report artifacts needed to audit or rerun the work.

| Artifact | Path | Purpose |
|---|---|---|
| [name] | [relative path] | [why it matters] |
