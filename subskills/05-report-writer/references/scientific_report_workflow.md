# Scientific Report Workflow

Use this reference when turning working notes into a polished causal report, progress report, memo, or same-evidence revision. The goal is rich content in a simple structure, not a comprehensive publication manuscript.

## Core Stance

- Write for the user's decision or confusion first.
- Build the argument before polishing sentences.
- Use evidence before interpretation: claim, evidence, boundary.
- Keep the main report short enough to read; move technical detail to appendices.
- Do not invent results, references, mechanisms, novelty, sample sizes, statistics, diagnostics, or limitations.
- Do not hide weak causal support under polished prose.

## Source-Informed Writing Principles

Use these principles as writing guidance, not as external authority for causal claims:

- Nature-style skill patterns are useful for evidence-first argument construction, paragraph jobs, bounded claims, and overclaim checks.
- Scientific report guides are useful for separating background, methods, results, discussion, conclusion, references, and appendices.
- Technical report guides are useful for centering the reader's need, decision, and action.
- Figure/table guidance is useful for keeping visuals self-contained and directly tied to the main conclusion.

## Before Drafting

1. Identify the report purpose:
   - user decision, scientific interpretation, planning memo, progress report, final report, revision, or requested add-on.
2. Identify the reader:
   - user only, collaborator, advisor, reviewer, client, clinical/scientific audience, policy/product audience, or mixed audience.
3. Identify the main answer:
   - one sentence that answers what the user asked, within the current claim-strength boundary.
4. Identify the evidence set:
   - user-stated facts, inspected data, computed outputs, figures/tables, diagnostics, subskill outputs, domain references, method references, and unresolved gaps.
5. Identify anti-claims:
   - statements the report must not make because they are unsupported, causally invalid, outside scope, or prohibited by `bounded_continuation`.

## Report Spine

Use this simple structure unless the user requests something else:

1. Problem, User Need, And Background
2. Analysis Choice And Justification
3. Results, Figures, And Tables
4. Model Diagnostics And Sensitivity Checks
5. Summary, Conclusion, And Potential Issues
6. Appendix

The report may be polished and substantive without many top-level sections. Add subsections only when they help the reader.

## Section Jobs

### Problem, User Need, And Background

Answer: What is the user trying to understand, and what context does the reader need?

Include:

- user goal and decision context;
- domain background needed for interpretation;
- data or materials available;
- audience and deliverable purpose;
- key references or source notes when they support background or common practice.

Avoid:

- broad literature review unless requested;
- domain material that does not affect the user's question;
- claims that imply data were inspected when they were only described.

### Analysis Choice And Justification

Answer: Why this analysis, for this question, with this data?

Include:

- causal or analytic framework;
- estimand or analysis target;
- key design/data reasons for the choice;
- alternatives considered only when they affect interpretation or trust;
- assumptions, diagnostics, sensitivity checks, and wording limits;
- method references or package references that justify the chosen approach.

Avoid:

- a catalog of all possible methods;
- method claims that the team did not evaluate;
- treating model convenience as causal validity.

### Results, Figures, And Tables

Answer: What did we find, and what should the reader look at?

Use a result unit:

- why this output was produced;
- what figure/table/result shows;
- what main pattern or estimate matters;
- what diagnostic or limitation affects trust;
- where the artifact or code lives.

Keep results mostly factual. Put broader interpretation and action implications in the conclusion section unless a brief interpretation is needed for readability.

### Model Diagnostics And Sensitivity Checks

Answer: Can the reader trust the model or analysis enough for the report's claim boundary?

Include diagnostics that materially affect the result or interpretation:

- model fit, residual, calibration, prediction, or specification checks;
- balance, overlap, support, positivity, donor-pool fit, pre-trend, bandwidth, weak-instrument, censoring, missingness, leakage, or other method-specific checks;
- robustness checks, sensitivity analyses, placebo/falsification checks, and model comparisons;
- what was completed, deferred, not applicable, or still unresolved.

For short reports, diagnostics can be a short paragraph inside Results, but they must remain explicit. Put detailed diagnostic tables, plots, and secondary sensitivity outputs in the appendix.

### Summary, Conclusion, And Potential Issues

Answer: So what, and what remains unsafe or unfinished?

Include:

- direct answer to the user;
- supported claim strength;
- causal blockers, data limitations, incomplete diagnostics, and external-validity limits;
- prohibited claims and bounded-continuation warnings;
- smallest useful next step.

Use cautious verbs when evidence is incomplete: `suggests`, `is consistent with`, `is compatible with`, `does not establish`, `remains exploratory`, or `requires`.

### Appendix

Use appendices to keep the main report readable.

Appendix material can include:

- additional tables, figures, diagnostics, or sensitivity checks;
- alternative methods, parked modules, or sidecar outputs;
- code and reproducibility notes;
- references and source notes;
- user-requested letters, memos, slide bullets, or emails.

## Reference Handling

- Cite only sources that were inspected, supplied by the user, or generated by an activated literature-search task.
- Cite method references when they justify an estimator, design, diagnostic, or limitation.
- Cite domain references when they support background, common practice, construct meaning, or external validity.
- Cite data documentation and package documentation when they affect reproducibility.
- Use one consistent style within a report: author-year, numbered, or source-note table.
- If the report is informal, a compact `References And Source Notes` appendix is enough.
- Do not fabricate citations or use a reference to support a claim it does not actually make.

## Polish Pass

Run this pass before delivery:

- The first paragraph tells the reader why the report exists.
- Each section answers one reader question.
- Each major claim has evidence and a boundary.
- Results are not buried under method explanation.
- Figures and tables are referenced in the text and explain their role.
- Diagnostics are explicit enough that the reader can see why the result is trusted, limited, or still provisional.
- Limitations are visible without overwhelming the main answer.
- The conclusion does not introduce new evidence.
- Terminology is stable across the report.
- The wording does not exceed `causal_gate.claim_strength_allowed` or `production_gate.claim_strength_for_report`.
- Appendices contain detail that would otherwise interrupt the main story.
