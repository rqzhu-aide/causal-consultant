# Scientific Report Workflow

Use this reference when turning working notes into a polished causal report, progress report, memo, or same-evidence revision. The goal is rich content in a simple structure, not a comprehensive publication manuscript.

## Core Stance

- Write for the user's decision or confusion first.
- Build the argument before polishing sentences.
- Use evidence before interpretation: claim, evidence, boundary.
- Put the main answer near the front, then explain the question, data, method, results, diagnostics, and limits that support it.
- Keep the main report short enough to read; move technical detail to appendices.
- Do not invent results, references, mechanisms, novelty, sample sizes, statistics, diagnostics, or limitations.
- Do not hide weak causal support under polished prose.

## Source-Informed Writing Principles

Use these principles as writing guidance, not as external authority for causal claims:

- Nature-style skill patterns are useful for evidence-first argument construction, paragraph jobs, bounded claims, and overclaim checks.
- Scientific report guides are useful for separating background, methods, results, discussion, conclusion, references, and appendices.
- Technical report guides are useful for centering the reader's need, decision, and action.
- Figure/table guidance is useful for keeping visuals self-contained and directly tied to the main conclusion.

## Report Argument Rules

Use these rules for polished reports, progress artifacts, and same-evidence revisions:

- Main answer first: state the current answer, evidence status, and claim boundary before long background.
- Claim-evidence-boundary: every major report claim should point to evidence and state scope or limitation.
- Evidence ladder: order results by how they support the report's main answer, not by the order analyses were run.
- Results versus interpretation: results say what was observed, estimated, computed, or verified; interpretation says what it means and when it may fail.
- One paragraph, one job: each paragraph should orient, claim, support, compare, diagnose, interpret, or limit.
- Figure and table discipline: each visual should have one message, visible provenance, and a caption or sentence that explains why it matters.
- Overclaim check: remove or soften unsupported causal language, universal claims, unverified novelty, broad generalization, and action recommendations beyond the evidence.

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
6. Check `data_analyst.analysis_alignment`:
   - whether the data support the intended claim, estimand, framework requirements, diagnostics, prior warnings, and report target; if not, make that boundary part of the report's main answer.
7. Plan owner review before polished delivery:
   - identify which sections need `data_analyst`, `method_lead`, `domain_expert`, or activated specialist review, and keep the draft easy for those owners to check.

## Before Release

For polished or final deliverables, do not rely on prose polish as validation. The lead consultant should route data-dependent sections to `data_analyst`, causal/statistical sections to `method_lead`, domain interpretation to `domain_expert`, and activated modules to the owning method/task subskills. Revise required edits before release, or make unresolved review limits visible in the report and production gate state.

## Report Spine

Use this simple structure unless the user requests something else:

1. Main Answer And Evidence Status
2. Question, Data, And Estimand
3. Analysis Framework And Assumptions
4. Results, Figures, And Tables
5. Diagnostics, Sensitivity, And Robustness
6. Interpretation, Limitations, And Next Steps
7. Appendix

The report may be polished and substantive without many top-level sections. Add subsections only when they help the reader.

## Section Jobs

### Main Answer And Evidence Status

Answer: What is the current answer, and how strong is the evidence?

Include:

- direct answer to the user's question;
- main result, decision-relevant finding, or current position;
- evidence source and provenance;
- supported claim strength;
- most important limitation or unresolved review issue.

Avoid:

- delaying the main answer until the end;
- sounding more final than the gates, diagnostics, or data alignment allow;
- hiding claim boundaries in a late limitations section.

### Question, Data, And Estimand

Answer: What is the user trying to understand, and what exactly was analyzed?

Include:

- user goal and decision context;
- exposure/intervention, comparator, outcome, population, timing, causal unit, and target estimand or analysis target;
- data or materials used, provenance, row unit, analysis unit, and source scope when available;
- domain background needed for interpretation;
- audience and deliverable purpose;
- key references or source notes when they support background or common practice.

Avoid:

- broad literature review unless requested;
- domain material that does not affect the user's question;
- claims that imply data were inspected when they were only described.

### Analysis Framework And Assumptions

Answer: Why this analysis, for this question, with this data?

Include:

- causal or analytic framework;
- estimand or analysis target;
- key design/data reasons for the choice;
- how inspected data align or fail to align with requirements for the intended claim;
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

### Diagnostics, Sensitivity, And Robustness

Answer: Can the reader trust the analysis enough for the report's claim boundary?

Include diagnostics that materially affect the result or interpretation:

- model fit, residual, calibration, prediction, or specification checks;
- balance, overlap, support, positivity, donor-pool fit, pre-trend, bandwidth, weak-instrument, censoring, missingness, leakage, or other method-specific checks;
- robustness checks, sensitivity analyses, placebo/falsification checks, and model comparisons;
- what was completed, deferred, not applicable, or still unresolved.

For short reports, diagnostics can be a short paragraph inside Results, but they must remain explicit. Put detailed diagnostic tables, plots, and secondary sensitivity outputs in the appendix.

### Interpretation, Limitations, And Next Steps

Answer: So what, and what remains unsafe or unfinished?

Include:

- meaning of the evidence for the user's practical or scientific goal;
- what can and cannot be concluded;
- causal blockers, data limitations, incomplete diagnostics, and external-validity limits;
- data-to-claim alignment gaps that limit the conclusion;
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
- The main answer appears early and is tied to evidence status.
- Each section answers one reader question.
- Each paragraph has one main job.
- Each major claim has evidence and a boundary.
- Load-bearing alignment gaps are integrated into the main answer, framework justification, results interpretation, and limitations, not quarantined as final caveats.
- Results are not buried under method explanation.
- Results and interpretation are not blended in a way that upgrades exploratory findings.
- Figures and tables are referenced in the text and explain their role.
- Diagnostics are explicit enough that the reader can see why the result is trusted, limited, or still provisional.
- Limitations are visible without overwhelming the main answer.
- The interpretation and next-step section does not introduce new evidence.
- Terminology is stable across the report.
- The wording does not exceed `causal_gate.claim_strength_allowed` or `production_gate.claim_strength_for_report`.
- Appendices contain detail that would otherwise interrupt the main story.
