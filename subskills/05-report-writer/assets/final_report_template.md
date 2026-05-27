# Final Report Template

Use this template when the user needs a finished narrative report, memo, methods/results section, or same-evidence revision. Keep the structure simple by default. Populate it from the project YAML state, report-structure notes, working report, `subskill_records`, and linked artifacts. Do not add causal claims, diagnostics, figures, tables, references, or preferences that are not supported by recorded evidence.

Markdown is the default first-round deliverable. Make it coherent and lightly polished, but keep it auditable and easy to revise. Omit empty subsections. Move technical detail to the appendix when it would distract from the user's main need.

Before drafting, use the report-structure notes to decide the main answer, claim boundary, section jobs, module placement, figure/table placement, code appendix needs, references, and anti-claims. Bring forward only supported or clearly qualified material.

Before polished/final delivery, route the drafted report through owner review for sections that depend on data evidence, causal/statistical claims, domain interpretation, or activated method/task modules. Revise required edits or make unresolved issues visible before release.

## Report Construction Rules

- Draft the main answer before drafting prose. The report should not make the reader wait until the conclusion to learn what the evidence currently supports.
- For each major claim, keep the evidence and boundary close to the claim. Use the structure: claim, evidence, limitation or scope.
- Build the results as an evidence ladder, not a chronological log of analysis attempts. Lead with the most decision-relevant result, then add supporting diagnostics, comparisons, or sensitivity checks.
- For substantive analysis reports, include a small visual evidence plan: at least one decision-useful figure or table for the main result, data support, or key diagnostic when such an artifact exists or can be generated from recorded outputs. If no visualization is included, say why text or tables are sufficient.
- If `method_lead.causal_structure.graph_artifact` exists, include the DAG, timing diagram, edge table, adjustment table, mediator path map, interference or spillover map, selection or transportability diagram, or role/timing table in the report unless it is no longer current or not relevant to the report lane. Place it in the framework/assumptions section when it carries the causal claim; use the appendix when it is technical or supplemental. If it is omitted, say why.
- Separate results from interpretation: results say what was observed or computed; interpretation says what it means for the user's question and where that interpretation may fail.
- If adjusted, restricted, matched, weighted, stratified, complete-case, or model-conditioned results are reported, state whether conditioning variables were checked for timing and causal role. If not checked, make collider, post-treatment, mediator, selection, missingness, or outcome-derived-feature risk visible as a limitation.
- When the report uses a method with standard diagnostics, include those diagnostics in the main text or appendix, or state that they were not run, not applicable, or deferred. For matching, weighting, propensity scores, IPW/IPTW, overlap weights, or balancing weights, this normally includes balance before/after adjustment, propensity or balancing-score overlap, weight distribution and tails, truncation, effective sample size, retained/discarded units, and target-population changes.
- When code generated reported results, figures, tables, diagnostics, transformed datasets, or sensitivity checks, include a complete reproducibility package: source notebook/script paths, run order, inputs, outputs, seeds/randomness controls, package/version notes when available, and all code needed to reproduce reported content. For short analyses, include the code directly in the appendix; for longer analyses, link complete source artifacts and include the key code excerpts needed to audit the main transformations and models.
- Give each paragraph one job. A paragraph should either orient, state a claim, present evidence, compare alternatives, explain a diagnostic, interpret meaning, or state a limitation.
- Before release, run an overclaim check for unsupported causal language, broader generalization than the data support, unverified novelty, hidden unresolved diagnostics, and action recommendations that exceed the evidence.

```markdown
# [Project-Specific Report Title]

## 1. Main Answer And Evidence Status

[Answer the user's question directly in one to three short paragraphs. State the main finding or current position, the evidence source, the allowed claim strength, and the most important limitation.]

[If the report is exploratory, descriptive, associational, causally cautious, or bounded by unresolved materials, say that here. Do not let claim boundaries appear only in a late limitations section.]

[State whether the report has passed evidence review or whether any data, method, interpretation, or artifact issue remains deferred.]

## 2. Question, Data, And Estimand

[State the user's goal, practical or scientific need, intended audience, treatment/exposure, comparator, outcome, population, causal unit, timing, and target estimand or analysis target.]

[Describe the data or materials used, including provenance, row unit, analysis unit, sample or file scope when known, and whether the data were inspected, computed from code, user-provided, or unavailable.]

[State whether the inspected data align with the requirements for the intended claim. If load-bearing timing, confounder, support, diagnostic, or provenance requirements are missing, proxy-only, contradicted, or deferred, make that boundary part of the setup.]

## 3. Analysis Framework And Assumptions

[State the selected causal or analytic framework and why this approach fits the user's question, design, data structure, and current phase.]

[If a causal-structure artifact exists, include or link it here when it helps explain the DAG, timing, variable roles, adjustment choice, forbidden adjustment, mediator pathway, interference/spillover mapping, selection/transportability logic, or claim boundary. Give a short caption explaining what the reader should learn from it.]

[Name the main assumptions, diagnostics, sensitivity checks, and wording limits. Briefly explain key alternatives that were considered, deferred, or rejected when they matter for the user's decision. Keep this focused on method fit, not a broad methods textbook.]

[When activated method/job modules contribute to the report, state each central module's role, evidence status, and claim scope in plain language, using its `subskill_records.statistical_evidence` packet.]

## 4. Results, Figures, And Tables

[Present the main result or current finding first, with provenance. Include the key result figure or table when it makes the result easier to inspect, compare, or explain. For most substantive analysis reports, use at least one visual or table for the main result, data support, or key diagnostic; if omitted, explain why.]

[For each figure or table, give a short reader-facing explanation: what it shows, why it matters, and what conclusion or caution it supports. Keep interpretation consistent with the recorded claim strength.]

[Keep this section focused on what was observed, estimated, or verified. Briefly point to diagnostics only when needed for flow; give diagnostic implications their own space in the next section. Use captions or short notes that make figures and tables readable without asking the user to reverse-engineer the analysis.]

## 5. Diagnostics, Sensitivity, And Robustness

[Summarize the diagnostics that affect whether the result can be trusted or how it must be qualified. This may include model fit, residual or prediction checks, balance/overlap/support checks, influential observations, missingness/selection checks, timing/leakage checks, robustness checks, sensitivity analyses, placebo/falsification checks, or method-specific diagnostics.]

[For matching, weighting, propensity score, IPW/IPTW, overlap-weight, or balancing-weight analyses, explicitly report or defer: balance before and after adjustment, propensity or balancing-score overlap, weight distribution and tails, truncation rules, effective sample size, retained/discarded units, target-population changes, and sensitivity to trimming or learner/model choice. Do not present a weighted estimate as production-ready when extreme weights, poor overlap, or unresolved balance dominate the result.]

[State which diagnostics were completed, which were deferred, which were not applicable, and which remain unresolved. If diagnostics are minimal in a short memo, this section can be a short paragraph or be blended into the Results section, but it should still be explicit.]

[Put detailed diagnostic tables, plots, model-comparison outputs, and secondary sensitivity results in the appendix.]

## 6. Interpretation, Limitations, And Next Steps

[Interpret the evidence for the user's goal. State what can be concluded, what cannot be concluded, and what the result means for the user's practical or scientific decision.]

[List the most important causal blockers, data limitations, unresolved diagnostics, scope limits, bounded-continuation warnings, and prohibited claims.]

[End with the smallest useful next step: review, additional data check, diagnostic, alternative analysis, revision, decision, or follow-up artifact.]

## Appendix

### Appendix A. Additional Analysis Results

[Optional: secondary tables, figures, diagnostics, robustness checks, sensitivity checks, exploratory outputs, or detailed result notes. Include diagnostic visuals that are too detailed for the main text, such as balance plots, propensity-score overlap, weight-tail plots, residual checks, placebo plots, sensitivity curves, or subgroup/support summaries.]

### Appendix B. Causal Structure, Alternative Methods, Or Parked Modules

[Optional: causal-structure artifacts that are too technical for the main text, method/job subskills considered but not central, alternative estimands, rejected approaches, sidecar outputs, or causal discovery material that is useful but not part of the main narrative.]

### Appendix C. Reproducibility Package And Code Appendix

[Optional for purely narrative reports, but required when code supports reported content. Include all code needed to reproduce the reported results, figures, tables, diagnostics, transformed datasets, and sensitivity checks, either directly in this appendix for short analyses or through complete linked source notebooks/scripts for longer analyses. Record run order, code/notebook paths, purpose, inputs, outputs, package/version notes when available, seeds or randomness controls, rerun notes, saved figure/table paths, and key code excerpts for load-bearing transformations and models.]

### Appendix D. References And Source Notes

[List only sources actually used in the report. Include method references, domain references, data documentation, package documentation, or user-supplied source materials as appropriate. Use one consistent citation style. If no external references were used, say so.]

### Appendix E. User-Requested Materials

[Optional: drafted letter, memo, slide bullets, email language, decision brief, or other requested add-ons.]
```

If the project is simple, keep the diagnostics section very short or blend it into Results with an explicit diagnostic paragraph. If a section has no supporting evidence, include a transparent sentence or omit it rather than filling the gap.
