# Report Workflow

Use this reference when report-writer behavior needs more detail than `SKILL.md`.

## Permission Note

This reference does not authorize execution. Treat HTML report drafting, asset QA, figures, tables, code paths, or report revisions as requests back to main unless main explicitly routed `execution_authorized` after user-confirmed scope.

## Operating Frame

Report Writer has three surfaces:

1. report plan: modular plan, core components, optional components, missing assets, owner review, and next user question;
2. final HTML report: the user-facing narrative deliverable;
3. report QA: checks for readability, links, tables, source code paths, claim boundary, and artifact index.

Do not collapse these surfaces. A report plan is not a report. A technical note is not the final report. A final report is complete only when the HTML path and QA status are recorded.

Runtime execution Return Gate state is owned by main, not report writer. When analysis was run, consume `execution_records`, the Post-Execution Return Gate state, `analysis_note_*.md`, source script path, queue reconciliation, report asset plan, and artifact paths as report inputs.

Final report readiness also depends on main clearing pending work. User-requested `pending_user_intents`, worthwhile consultant alternatives in `team_synthesis.exploration_threads` or `method_alignments.method_ideas`, and any active or paused discovery sidecar should be resolved, declined, blocked, closed, or explicitly parked for the report before drafting a final substantive report. If analysis was run, the latest execution record must have `closeout_status: complete` and `queue_reconciliation.report_ready: true`.

## Activation Timing

Default activation:

- no report request or confirmed report scope: `no_action`;
- user requests a report or report was part of the confirmed work unit: create a report plan before drafting;
- post-execution Return Gate plus user chooses report: assemble from `execution_records`, queue reconciliation, analysis note, source code path, artifacts, and stage evidence;
- existing HTML report needs QA/revision: inspect only that routed artifact and return feedback or a revision.

Readiness can be qualified. A progress or exploratory report may proceed with visible limitations, but a structurally invalid causal target must be reframed before report drafting.

Do not activate opportunistically to monitor stable decisions during ordinary execution. Main records those decisions in the Return Gate state, analysis note, `team_synthesis`, and `artifact_index`.

## Report Plan Creation

Use `assets/report_plan_template.md`.

Core components are included by default when supported:

- front summary: report type, evidence status, main answer, claim boundary, main limitation, and next decision;
- key callouts: key takeaways, what not to claim, assumptions needing care, unresolved diagnostics, and next action;
- consultation and decision trace: causal framing, data role card, method/fallback choice, selected work-unit spec, validity review, execution confirmation, execution Return Gate, dependency decisions, deviations, results, diagnostics, interpretation, and next steps;
- pending and parked work: user-requested tasks and consultant-suggested alternatives that were resolved, declined, blocked, or parked for the report;
- main answer and evidence status;
- original and refined causal question;
- data reality and provenance;
- causal framework, estimand, assumptions, and inline causal-structure sketch when required;
- results or current evidence;
- diagnostics and sensitivity status;
- interpretation, limitations, and next steps;
- reproducibility and artifact paths when analysis was run.

Optional components are offered through main:

- expanded DAG, timing diagram, or role table when the inline sketch is not enough;
- exploratory causal discovery section or appendix;
- main result visual or table;
- diagnostic visual or table;
- sensitivity or robustness section;
- method module appendix;
- code/reproducibility appendix;
- executive summary.

Offer optional components only when they are useful, available, or required for truthful claim wording. Missing assets should trigger a bounded refresh request, not invented content.

## Report Asset Plan

For substantive model-based, diagnostic, exploratory, or causal reports, the report plan must include a report asset plan. This plan is not decorative; it tells main what evidence must exist before a polished report can be drafted.

Track:

- required visuals or tables: main result visual/table, key diagnostic visual/table, inline causal-structure sketch when causal/timing/adjustment logic is load-bearing, optional expanded DAG/timing/role artifact when the sketch is not enough, discovery graph/stability artifact when discovery is material;
- citation/source needs: method references, software/package references, dataset/codebook documentation, domain precedent, user-provided sources, inspected local artifacts;
- narrative cues: section purpose, reader takeaway, interpretation limit, and "what this does not prove";
- status: ready / missing / blocked / optional / explicitly_omitted;
- owner or route: analysis code, data_analyst, method/task subskill, domain_expert, causal_gatekeeper, causal_discovery, report_writer, or user.

If required data-dependent figures were not created during authorized execution, ask main for a bounded report-asset generation work unit before drafting. Report writer may not compute data plots, rerun models, or infer figure patterns from tables. It may create schematic report-only diagrams from recorded state only when main routes that exact deliverable.

Expected figures are method-sensitive:

- matching, weighting, or propensity-score work: propensity/balancing-score overlap plot, balance/love plot or SMD plot, weight/ESS diagnostic, and main estimate visual when results are reported;
- survival or event-time work: Kaplan-Meier, CIF, RMST, risk-by-horizon, event-time, or censoring-support visual as appropriate;
- DiD or event-study work: trend, event-time, and pre-period diagnostic visuals;
- RD work: running-variable/cutoff plot plus density/manipulation diagnostic when relevant;
- IV work: first-stage/weak-instrument or exclusion-relevant diagnostic visual/table when relevant;
- causal discovery work: graph, edge-stability, neighborhood, or discovery-diagnostic visual when discovery is reported.

If a required visual is impossible, intentionally omitted, or blocked, record the reason and do not call the report a polished diagnostic report unless the user explicitly accepts the omission.

Inline causal-structure sketches are not data plots and are not separate artifacts by default. Use the sketch recorded in `causal_validity.dag_and_timing.causal_structure_sketch.markdown`. If it is required but `missing` or `blocked`, return `blocked` or `needs_assets` to main so the gatekeeper can refresh it or the user can choose a weaker/terse deliverable.

## Citation Ledger

Polished reports should cite the inspected basis for named methods, software, datasets, and domain precedent. Track citations in a compact ledger:

- claim, method, software, dataset fact, or domain statement needing support;
- inspected source or artifact path;
- citation status: ready / missing / not_needed / user_supplied / blocked;
- report placement.

Use method-subskill `literature_and_software.md` files, package documentation, dataset/codebook documentation, domain_expert bounded source notes, user-provided references, or inspected local artifacts. Do not invent citations. If the report relies on named methods such as propensity scores, matching, weighting, survey inference, DR/TMLE, DML, RD, IV, DiD, survival, or causal discovery and no source was inspected, request a bounded citation/source refresh or label the deliverable as an internal technical note.

## Stage Evidence Ledger

The report plan should preserve a compact stage evidence ledger. Use it to prevent final reports from becoming thin results notes.

For each report-relevant stage, track:

- stage name;
- decision or finding;
- evidence basis or source path;
- owner or reviewer;
- status: completed / qualified / missing / stale / blocked;
- report placement: front summary / main text / appendix / omitted with reason.

Include entries for causal framing, variable-role card, method/fallback gate, selected work-unit spec, gatekeeper review, inline causal-structure sketch status when required, post-analysis gatekeeper status when analysis was run, execution scope, dependency or package decisions, material deviations, results, diagnostics, interpretation, and next steps when those stages occurred.

Also include a report-readiness entry for pending user intents, worthwhile consultant alternatives, and queue reconciliation. If items are parked for the report, state what was not run and why the report can proceed.

If discovery was active, paused, or parked, add a discovery-readiness entry: sidecar status, unresolved next action or reviewer requests, whether implications were reviewed, and whether the material belongs in main text, appendix, or a "Not Run / Parked Discovery" note.

When an execution record or Return Gate state exists, use it as the spine for execution-related ledger entries. If it is missing source code path, analysis note path, dependency status, deviation status, artifact reasons, `closeout_status`, or queue reconciliation, ask main to repair the record before drafting a final report.

Dependency/deviation consistency check: fallback used, estimator substitution, approximation, dropped diagnostics, or changed outputs cannot appear with `Material deviations: none`. Use the execution record status instead: `none`, `approved before execution`, `accepted after execution`, or `unresolved`.

If a stage is missing but needed to make the report honest, ask main for a bounded owner refresh or state the omission. Do not replace missing stage evidence with invented narrative.

## Visual And Structural Style

Use clean static HTML with restrained embedded CSS. Do not add decorative styling, excessive icons, color-heavy formatting, scripts, or ornamental sections.

Make reports easy to scan:

- put report type, evidence status, claim boundary, main limitation, and next decision near the front;
- use short tables for status, role maps, assumptions, diagnostics, and artifact paths;
- use compact callouts for claim boundary, main limitation, assumptions needing care, unresolved diagnostics, and what not to claim;
- put status labels before long prose when they affect interpretation.

For figures and tables, include:

- headline title that states the message;
- short subtitle or sentence explaining what the asset shows;
- source or artifact path;
- accessible text description for figures;
- caution or interpretation limit when needed.

Visual cues should emphasize the main message, not decorate the page. Formal reports should usually avoid emoji; use headings, labels, tables, and callouts instead.

## Narrative Minimums

A final report should read like a report, not a pasted workbook. Unless the user explicitly requested a terse technical appendix, every major evidence section needs:

- one short setup paragraph explaining why the section is there;
- table/figure-specific interpretation that tells the reader what to look at;
- a limitation sentence stating what the evidence does not show;
- a transition or decision sentence connecting the evidence to the claim boundary or next step.

For each important table or figure, include: headline, what it shows, why it matters, source/path, accessible description when visual, and caution. A section that contains only tables fails report-ready QA.

## Artifact Minimalism And Table Placement

Reports should be readable without making the user open many small files.

Default table placement:

- embed compact key estimates, one-row diagnostics, balance summaries, role cards, and selected-spec tables directly in the report or appendix;
- save external CSVs or workbooks only for large, reproducibility-oriented, sensitive, or user-requested artifacts;
- treat tables with roughly `<=30` rows and `<=8` columns as embed-first unless there is a concrete reason not to;
- summarize large bootstrap draws, per-unit predictions, model matrices, or logs in the report and link the full artifact from the appendix.

Every external artifact should have a short role description and path in the report. Do not create a separate file for every compact table by default.

## Drafting

Use static HTML for final reports. Use `assets/final_report_template.html` for comprehensive reports. Private report plans may remain Markdown, and `analysis_note_*.md` technical notes remain valid inputs, but the final narrative report should be `final_report_*.html`.

Draft from:

- project YAML state;
- report plan;
- post-execution Return Gate state when analysis was run;
- `analysis_note_*.md` or routed technical note;
- `domain_information`, `data_facts`, `method_alignments`, and `causal_validity`;
- `specialist_outputs`;
- `discovery_sidecar` when causal discovery was activated or requested;
- inspected artifacts listed in `artifact_index`;
- user-provided references or inspected source notes.

Do not report numeric results, diagnostics, p-values, intervals, tables, figures, references, or code claims unless they are recorded, computed by authorized work, supplied by the user, or inspected as artifacts.

Analysis scripts may create one source script or notebook, one compact `analysis_note_*.md` or `technical_note_*.md`, and large or reproducibility-focused external artifacts. Report writer assembles the final HTML narrative report. If a script-generated Markdown, HTML, or memo exists, treat it as a technical input or invalid final report unless report writer was explicitly routed to create or revise that exact final HTML deliverable.

Use a short memo format only when main states that the user explicitly requested a brief deliverable. Otherwise, include the stage evidence ledger material in organized sections before detailed results.

## Asset Checklist

Before a substantive analysis report is treated as ready, check:

- main result visual or table: path, owner, status, placement, or omission reason;
- key diagnostic visual or table: path, owner, status, placement, or omission reason;
- method-sensitive visual assets named in the report asset plan: ready or explicitly resolved;
- citation ledger for named methods, software, data documentation, and domain precedent: ready or explicitly resolved;
- narrative cues for every major evidence section: ready or explicitly shortened by user request;
- inline causal-structure sketch when causal, timing, adjustment, matching, weighting, stratification, or causal-question fallback logic is load-bearing;
- optional expanded DAG/timing/role artifact only when the inline sketch is not enough, discovery produced a complex graph, or the user requested a polished visual;
- discovery graph, edge/stability table, or diagnostic paths when a discovery sidecar was user-visible or materially shaped the project;
- actual source script or notebook path when code supports reported content, regardless of language or extension;
- final HTML report path and QA status.

If code supports reported content and the source script path is missing, the report is not ready. Ask main to route a bounded artifact refresh or revise the reproducibility appendix.

If a polished report is requested and required figures or citations are missing, return `needs_assets` or `blocked` feedback with one bounded next action: generate figure assets, inspect source/citation notes, accept a terse technical note, or revise report scope.

## Owner Review

Request owner review before polished delivery when the draft has substantive evidence or claims:

- `data_analyst`: data facts, provenance, stale outputs, figures, tables, diagnostics, and code paths;
- `method_lead`: causal question, estimand, framework, assumptions, statistical evidence, and claim strength;
- `domain_expert`: construct meaning, domain interpretation, action language, and external validity;
- method/task subskills: their own modules, diagnostics, artifacts, and limits.
- `causal_discovery`: graph target, artifacts, diagnostics, exploratory wording, and reviewer-routing status.

Owner review is a QA pass, not a reason to create new method/task records by default.

## HTML Report QA

When a final HTML report is produced, inspect or request inspection for:

- duplicate title blocks or repeated top-level headings;
- missing page wrapper or content container;
- malformed lists or headings;
- broken tables;
- missing figures or captions;
- broken local paths;
- broken source script, artifact, figure, or appendix links;
- missing final HTML report path;
- missing source script or notebook link when code supports results;
- visible claim boundary and limitations.

Do not ask about a later format step. The HTML report is the final report artifact.

## Report-Ready Failure Conditions

Return `blocked` or request revision when a substantive report lacks any required item without an explicit omission reason:

- consultation and decision trace;
- variable-role card;
- method/fallback choice;
- selected work-unit spec;
- validity boundary;
- required inline causal-structure sketch or explicit qualified omission when causal/timing/adjustment logic matters;
- resolved, declined, blocked, or explicitly parked pending user intents;
- resolved, declined, blocked, or explicitly parked worthwhile consultant alternatives;
- closed, blocked, inactive, or explicitly parked discovery sidecar state when discovery was opened or requested;
- execution Return Gate state and execution record when analysis was run;
- `closeout_status: complete` and `queue_reconciliation.report_ready: true` when analysis was run;
- post-analysis gatekeeper review when analysis was run;
- dependency/deviation notes;
- source script or notebook path when code supports results;
- required report asset plan and asset status for model-based, diagnostic, exploratory, or reportable work;
- required figures or explicit omission reasons;
- citation ledger or explicit internal-note limitation when named methods/software/domain sources are used;
- narrative prose around major evidence sections;
- final HTML report path;
- external artifact index when external files exist;
- owner review for substantive data, method, interpretation, or claim content.

Also fail QA when dependency/deviation notes conflict with the execution record, especially fallback or substitution paired with `Material deviations: none`. Fail polished-report QA when a results or diagnostics section is only stacked tables with no rationale, interpretation, and limitation prose.

## Feedback To Main

Return one compact `report_writer_feedback` packet. Use `needs_assets` when the report cannot be polished until required figures, citation/source notes, or narrative cues are generated or explicitly omitted. Include the final HTML report path when created, missing assets, citation needs, narrative gaps, owner-review needs, claim boundary, optional components to offer, and one next user question.

Main records durable paths in `artifact_index` and speaks to the user.
