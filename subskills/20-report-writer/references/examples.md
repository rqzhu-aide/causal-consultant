# Report Writer Examples

Use these examples as reusable patterns. Adapt the method-specific content from the activated method/job subskill handoff notes. Do not use these examples to bypass `production_gate`.

## Production-Review Handback

Use during production reviewer mode when materials are not yet ready for handoff.

```yaml
reviewer_id: "20-report-writer"
phase_context: "production"
review_purpose: "presentation_review"
production_readiness: "diagnostics needed"
foundation_readiness_effect: "unchanged"
summary: "The estimate is reportable only as first-pass evidence because the required method diagnostic is not complete."
blocking_signal:
  blocks_current_phase: true
  requires_previous_phase_recheck: false
  target_phase: production
  severity: "caution"
  reason: "Required diagnostics are not complete enough for final report handoff."
  affected_sections: ["analysis.production_loop", "production_gate", "analysis.report_writer_20"]
recommended_next_action: "run_diagnostics"
artifact_paths: []
```

User-facing synthesis by the main skill should be short:

```markdown
The result is close to reportable, but I would not make it final yet. The missing piece is the diagnostic that checks whether the comparison is credible. I suggest we run that next, then decide how strong the wording can be.
```

## Diagnostic Review

Use after first-pass results, diagnostics, or sensitivity checks exist.

| Check | Status | Evidence | Interpretation impact |
|---|---|---|---|
| Design fit | pass | Route and estimand match the confirmed analysis plan. | Supports reporting the estimate as design-based evidence. |
| Data constructability | concern | Missingness differs by treatment arm. | Requires visible limitation and possibly sensitivity analysis. |
| Required method diagnostic | fail | Primary diagnostic does not support the identifying comparison. | Do not use unqualified causal wording. |
| Sensitivity | not run | No alternative specification yet. | Report as first-pass or request another check. |
| Reproducibility | pass | Script path, seed, package versions, and output table are recorded. | Materials can be audited later. |

Conclusion pattern:

```markdown
This is not ready for a final report. It can support a cautious progress memo, but the main report should wait until the failed diagnostic is addressed or the claim is weakened.
```

## Final Report Pattern

Use after `production_gate.status: ready` and handoff mode is active.

```markdown
# Final Report

## Executive Summary

- Problem: [decision question].
- Bottom line: [best supported conclusion].
- Claim strength: [claim strength from production gate].
- Key evidence: [primary estimate, diagnostic, figure, or table].
- Main caution: [most important limitation or deferred check].

## Problem And Background

[Summarize the user goal, domain context, and why the causal question matters.]

## Causal Question And Estimand

[Treatment/exposure], [comparator], [outcome], [population], [unit/time zero], [follow-up], and [estimand].

## Design And DAG Logic

[Explain the selected design route, why alternatives were not used, DAG/identification logic, and load-bearing assumptions.]

## Data Construction And Readiness

[Summarize row unit, timing, variable construction, missingness, support, leakage, and reproducibility notes from Data Technician.]

## Method, Diagnostics, And Results

[Describe the method/job analysis, primary result, uncertainty, diagnostics, sensitivity checks, and interpretation impact.]

## Figures And Tables Supporting The Conclusion

| Exhibit | Source artifact | What it supports | Caveat |
|---|---|---|---|
| [Figure/Table] | [path] | [claim supported] | [limitation] |

## Conclusion And Interpretation

[State the conclusion in calibrated language and name what should not be inferred.]

## Limitations

[List unresolved assumptions, deferred diagnostics, data limits, implementation constraints, and generalizability cautions.]

## Reproducibility And Artifact Index

[List scripts, figures, tables, diagnostics, report artifacts, and environment notes.]
```

## Revision Pass

Use after the user asks for changes to a delivered report or explicitly requests a changed version.

```markdown
Revision focus: make the report more executive-facing without strengthening the causal claim.

Changes:
- Moved the practical bottom line to the opening paragraph.
- Shortened method details and moved diagnostics into a compact table.
- Replaced "caused" with "is consistent with an effect under the recorded assumptions."
- Added the main limitation to the figure caption.

Note:
This revision pass happens only after the handoff report has already been delivered or the user explicitly asks for a changed version.
```

## Presentation Consulting

Use when the user needs slides, a memo, or an audience-specific version.

```markdown
Recommended structure for a policy audience:

1. Decision question and practical stakes.
2. One result figure with uncertainty and the key caveat in the caption.
3. What the design can support.
4. What diagnostics were checked.
5. Recommended decision language and limits.

Lead with the effect scale if diagnostics are supportive. Lead with design limits if diagnostics are fragile.
```

## Final Handoff Check

Use before marking `analysis.report_writer_20.status: final report delivered`.

```yaml
final_handoff_check:
  production_gate_ready: true
  foundation_and_production_records_used: true
  diagnostics_complete_or_deferred: true
  claim_strength_matches_gate: true
  method_specific_handoff_used: true
  data_technician_warnings_addressed: true
  figures_tables_support_conclusion: true
  limitations_visible: true
  no_new_interaction_needed: true
  artifacts_recorded: true
```

If any field is false, return a revision or diagnostic handback instead of calling the report final.
