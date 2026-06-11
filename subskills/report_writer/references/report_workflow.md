# Report Workflow

Use this reference when `report_writer` needs more detail than `SKILL.md`.

## Permission Note

This reference does not authorize execution. Treat report plans, HTML drafting,
asset QA, artifact revision, and delivery closeout as requests back to main
unless main explicitly routed `execution_authorized` after user-confirmed scope.

## Operating Frame

Report writer has three deliverable surfaces:

1. report plan: selected evidence, outline, required assets, missing assets,
   owner review, and next report move;
2. static HTML report: final or planning narrative deliverable;
3. report QA: checks for readability, links, tables, claim boundary, source
   paths, artifact traceability, and unresolved review.

A report plan is not a final report. A technical note, analysis-folder HTML, or
script-authored memo is an input, not a delivered report, unless main routed
revision of that exact deliverable.

Main owns runtime pacing, Return Gate summaries, `pending_actions`,
`next_step_plan`, and all user-facing delivery. Report writer writes
`report_assembly`, `artifact_index` entries for created report artifacts or
newly indexed routed report artifacts, and one chamber opinion.

## Activation Timing

Default activation:

- no report request or confirmed report scope: leave `report_assembly.status` as
  `not_requested` and write a concise chamber note;
- planning/exploration plateau plus user chooses a planning report: plan or
  draft `planning_html` from staged state with no empirical results;
- user requests a report before report structure is settled: run
  `feedback_only`, update `report_assembly`, and write chamber feedback so main
  can ask for report-structure confirmation;
- post-execution Return Gate plus user chooses report: check structure from
  `report_assembly`, selected artifacts, manifests, analysis notes, source
  paths, owner evidence, and council opinions before HTML drafting;
- existing report needs QA/revision: inspect only that routed artifact and write
  QA feedback or an authorized revision.

Final report execution starts after main confirms the report structure from
report-writer feedback: report type, included actions or artifacts, major
limitations, omitted or parked items, and output scope. Required assets, claim
boundaries, source paths, and artifact paths should be present or explicitly
limited in `report_assembly`.

## Report Plan Creation

Use `assets/report_plan_template.md`.

The plan should mirror `report_assembly`:

- report type and template path;
- included actions and report-relevant artifact ids;
- required mentions and claim-boundary wording;
- required assets and missing assets;
- parked or not-run work;
- HTML outline;
- owner-review needs;
- smallest next report move.

Core components are included by default when supported: front summary, claim
boundary, data reality, domain interpretation, method rationale, selected
estimand, assumptions, results or planning evidence, diagnostics, limitations,
reproducibility links, and next steps.

Optional components are offered through main only when useful: expanded
causal-structure sketch, exploratory discovery appendix, main result visual,
diagnostic visual, sensitivity section, method appendix, code appendix, or
executive summary.

For `planning_html`, `report_assembly.included_actions` may be empty. Required
mentions must include no data analysis completed, no empirical estimates,
planning-only claim boundary, and what data/design information is needed next.

## Report Asset Plan

Track required visuals/tables, citation/source needs, and narrative cues. Each
important display item should have:

- type: figure, table, inline sketch, formula, source note, or appendix artifact;
- evidence role: result, diagnostic, data support, sensitivity, limitation,
  causal structure, or reproducibility;
- source artifact id or path;
- headline and interpretation;
- limitation;
- report placement;
- status: ready, missing, blocked, optional, or explicitly omitted.

Data-dependent figures and tables must come from authorized analysis/report
asset work and appear in `artifact_index`, a produced manifest, or a produced
technical note.
If a required display item is missing, write `needs_assets` and use the chamber
to ask main for the smallest repair/report option.

Inline causal-structure sketches should come from `causal_gatekeeper` when
causal/timing/adjustment logic is load-bearing. If missing or blocked, request a
gatekeeper/report-asset repair or ask main to confirm a weaker terse deliverable.

## Citation Ledger

Polished reports should cite the inspected basis for named methods, software,
datasets, and domain precedent. Track:

- statement needing support;
- inspected source or artifact path;
- citation status: ready, missing, not_needed, user_supplied, or blocked;
- report placement.

Do not invent citations. If a polished report needs method, software, dataset,
or domain citations that are absent, write `needs_assets` or `needs_narrative`
with a bounded source/citation refresh option.

## Evidence Component Ledger

Use a compact evidence ledger to prevent reports from becoming thin result
notes. For each report-relevant component, track:

- component name;
- decision or finding;
- evidence basis or source path;
- owner or reviewer;
- status: completed, qualified, missing, stale, blocked, parked, or omitted;
- report placement.

Include entries when available for causal framing, data role card, domain
interpretation, method/fallback gate, selected action/specification, gatekeeper
claim boundary, causal-structure sketch, execution scope, material deviations,
results, diagnostics, discovery status, interpretation, owner review, and next
steps.

If a component is missing but needed for an honest report, ask main for a
bounded owner refresh or state the omission. Do not replace missing evidence
with generic narrative.

## Modern HTML Manuscript Style

Use clean static HTML with restrained embedded CSS. Do not add scripts, CDN
assets, external fonts, ornamental sections, or dashboard-style decoration.

The final HTML should include:

- title, report type, audience, date, evidence status, and claim boundary;
- front summary with main answer or planning status, main limitation, assets, QA
  status, and next decision;
- table of contents when useful;
- prose-first sections with evidence cards, figure/table frames, formula cards,
  reference/source callouts, and appendix traceability;
- visible parked/not-run items and limitations.

Every major evidence section should explain why it matters, what evidence
supports it, how it connects to the claim, what the display shows, what
conclusion is allowed, and what the evidence does not establish.

Use static formula blocks only when `method_records` supports them and they
clarify the estimand or model logic. Prefer design-specific targets when
recorded method evidence does so. Do not add MathJax, scripts, or unsupported
formulas.

## Drafting

Use:

- `assets/final_report_template.html` for `final_html`;
- `assets/planning_report_template.html` for `planning_html`;
- `assets/report_plan_template.md` for private report plans.

Draft from selected/report-relevant evidence only: `report_assembly`,
`artifact_index`, routed artifacts, owner records, council opinions, manifests,
analysis notes, source paths, figures, tables, diagnostics, discovery packets,
and prior report artifacts.

For multiple included actions, synthesize them into one coherent report. Explain
whether they answer the same question, separate subquestions, sensitivity checks,
or parked alternatives.

Draft from the confirmed scope. Disclose omitted, parked, missing, or limitation
items when the user confirms proceeding. Use `needs_assets`,
`needs_narrative`, or `needs_owner_review` when the report can proceed only with
visible gaps or bounded repair. Use `blocked` only when the requested report
scope is incoherent, such as incompatible report type/template or no usable
evidence basis for any honest deliverable.

## QA

Final or revised HTML reports require QA for:

- duplicate titles or missing report wrapper;
- broken local links, missing source paths, or missing artifact references;
- broken tables, missing captions, or missing accessible descriptions;
- unsupported numeric or causal claims;
- missing visible claim boundary and limitations;
- template/report-type mismatch;
- required owner review not completed or parked;
- final report path outside `outputs/reports/`.

Write `qa_passed` only when the routed artifact satisfies the report scope or all
limitations are explicitly recorded.

## Return To Main

Write created report paths, or newly indexed routed report artifacts, in
`artifact_index`; update `report_assembly`; ensure one chamber entry using the
shared council contract; and stop. Main rereads YAML, promotes useful council
options into `pending_actions`, and speaks to the user.
