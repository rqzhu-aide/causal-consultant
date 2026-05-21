# Report Writer Examples

Use these examples as small reusable patterns. Adapt method-specific details from `subskill_records`, `method_lead`, and `data_analyst`; do not invent evidence.

## Blocked Diagnostic Review

```yaml
report_writer_feedback:
  status: "blocked"
  missing_inputs:
    - "Overlap diagnostics have not been run for the adjusted observational estimate."
    - "The report table contains an estimate without a recorded source path."
  claim_language_risk: "The current draft says 'caused' but the report_production evidence only supports cautious or associational wording until diagnostics are reviewed."
  working_draft_path: "artifacts/report_working_draft.md"
  recommended_next_step: "Ask data_analyst to verify result provenance and ask method_lead whether overlap diagnostics are required or explicitly deferred."
  artifact_paths: []
```

## Exploratory Progress Report Summary

```yaml
report_writer_feedback:
  status: "artifact_created"
  report_lane: "exploratory report"
  evidence_basis:
    - "`data_analyst` inspected the uploaded CSV and generated missingness and support summaries."
    - "A prototype regression was run as user-directed exploratory work."
  claim_language_boundary: "Use exploratory/model-based association language; do not call this a final causal effect."
  working_draft_path: "artifacts/report_working_draft.md"
  artifact_paths:
    - "artifacts/renewal-exploratory-report.html"
  recommended_next_step: "Clarify time zero and comparator before moving to causal specification."
```

## Production-Ready Report Summary

```yaml
report_writer_feedback:
  status: "artifact_created"
  report_lane: "reproducible analysis report"
  evidence_basis:
    - "Specification gate is ready."
    - "report_production diagnostics are complete or explicitly deferred."
    - "All reported numbers come from the rendered source report."
  claim_language_boundary: "Cautious causal language is allowed within the recorded population, time window, and assumptions."
  working_draft_path: "artifacts/report_working_draft.md"
  artifact_paths:
    - "artifacts/renewal-effect-report.qmd"
    - "artifacts/renewal-effect-report.html"
  recommended_next_step: "Ask whether the user wants a shorter executive memo from the same evidence."
```

## Same-Evidence Revision

```yaml
report_writer_feedback:
  status: "artifact_revised"
  report_lane: "final report"
  evidence_basis:
    - "Revision used the same recorded estimates and diagnostics."
  claim_language_boundary: "No stronger causal wording was added."
  working_draft_path: "artifacts/report_working_draft.md"
  artifact_paths:
    - "artifacts/renewal-effect-report-v2.md"
  recommended_next_step: "Ask whether to create slides or stop here."
```
