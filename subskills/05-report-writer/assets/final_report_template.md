# Final Report Template

Use this template when the user needs a finished narrative report, memo, methods/results section, or same-evidence revision. Keep the structure simple by default. Populate it from the project YAML state, report-structure notes, working report, `subskill_records`, and linked artifacts. Do not add causal claims, diagnostics, figures, tables, references, or preferences that are not supported by recorded evidence.

Markdown is the default first-round deliverable. Make it coherent and lightly polished, but keep it auditable and easy to revise. Omit empty subsections. Move technical detail to the appendix when it would distract from the user's main need.

Before drafting, use the report-structure notes to decide the main answer, claim boundary, section jobs, module placement, figure/table placement, code appendix needs, references, and anti-claims. Bring forward only supported or clearly qualified material.

```markdown
# [Project-Specific Report Title]

## 1. Problem, User Need, And Background

[State the user's goal, practical or scientific need, relevant domain background, available data or materials, intended audience, and what this report is meant to help the user decide or understand.]

[Use references only when they support background, domain practice, data source context, or a methodological choice. Do not cite references that were not actually inspected or supplied.]

## 2. Analysis Choice And Justification

[State the selected causal or analytic framework, target estimand or analysis target, and why this approach fits the user's question, design, data structure, and current phase.]

[Briefly explain key alternatives that were considered, deferred, or rejected when they matter for the user's decision. Keep this focused on method fit, not a broad methods textbook.]

[Name the main assumptions, diagnostics, sensitivity checks, and wording limits. If the analysis is exploratory, descriptive, associational, or bounded by unresolved causal blockers, say so here.]

## 3. Results, Figures, And Tables

[Present the main result or current finding first, with provenance. Use figures and tables only when they help the reader understand the result better than text alone.]

[For each figure or table, give a short reader-facing explanation: what it shows, why it matters, and what conclusion or caution it supports. Keep interpretation consistent with the recorded claim strength.]

[Keep this section focused on what was found. Briefly point to diagnostics only when needed for flow; give diagnostics their own space in the next section.]

## 4. Model Diagnostics And Sensitivity Checks

[Summarize the diagnostics that affect whether the result can be trusted or how it must be qualified. This may include model fit, residual or prediction checks, balance/overlap/support checks, influential observations, missingness/selection checks, timing/leakage checks, robustness checks, sensitivity analyses, placebo/falsification checks, or method-specific diagnostics.]

[State which diagnostics were completed, which were deferred, which were not applicable, and which remain unresolved. If diagnostics are minimal in a short memo, this section can be a short paragraph or be blended into the Results section, but it should still be explicit.]

[Put detailed diagnostic tables, plots, model-comparison outputs, and secondary sensitivity results in the appendix.]

## 5. Summary, Conclusion, And Potential Issues

[Answer the user's question as directly as the evidence allows. State what can be concluded, what cannot be concluded, and what the result means for the user's goal.]

[List the most important causal blockers, data limitations, unresolved diagnostics, scope limits, bounded-continuation warnings, and prohibited claims.]

[End with the smallest useful next step: review, additional data check, diagnostic, alternative analysis, revision, decision, or follow-up artifact.]

## Appendix

### Appendix A. Additional Analysis Results

[Optional: secondary tables, figures, diagnostics, robustness checks, sensitivity checks, exploratory outputs, or detailed result notes.]

### Appendix B. Alternative Methods Or Parked Modules

[Optional: method/job subskills considered but not central, alternative estimands, rejected approaches, sidecar outputs, or causal discovery material that is useful but not part of the main narrative.]

### Appendix C. Reproducibility And Code Notes

[Optional but required when code supports reported content: code/notebook paths, purpose, inputs, outputs, package/version notes when available, seeds, rerun notes, and short code excerpts only when they clarify a key transformation or model.]

### Appendix D. References And Source Notes

[List only sources actually used in the report. Include method references, domain references, data documentation, package documentation, or user-supplied source materials as appropriate. Use one consistent citation style. If no external references were used, say so.]

### Appendix E. User-Requested Materials

[Optional: drafted letter, memo, slide bullets, email language, decision brief, or other requested add-ons.]
```

If the project is simple, keep the diagnostics section very short or blend it into Results with an explicit diagnostic paragraph. If a section has no supporting evidence, include a transparent sentence or omit it rather than filling the gap.
