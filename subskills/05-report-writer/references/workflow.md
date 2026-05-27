# Report Writer Workflow

Use this backstage reference when report-writer behavior needs more detail than `SKILL.md`. Keep the report writer silent, evidence-bound, and useful to the lead consultant.

## Operating Frame

Report Writer maintains three different surfaces:

1. `report_structure_notes`: private report architecture and future-use material.
2. `working_report`: private polished project notebook and draft memory.
3. released artifacts: user-facing reports, memos, revisions, appendices, slides, or requested add-ons.

Do not collapse these surfaces. Structure notes are not prose. The working report is not automatically released. A released artifact is compiled only when the lane, evidence, and claim limits are clear.

The main skill owns `causal_gate`, `production_gate`, `bounded_continuation`, `analysis_state`, and project YAML updates. Report Writer returns concise feedback and requested path updates; it does not open gates, validate identification, append its own `subskill_records` entry, or talk to the user directly.

## Working Draft And Structure Notes

Start the Markdown project notebook or working report only when durable content is stable enough that preserving it will help later work. Use the existing `analysis_state.report_working_draft_path` if present. If no path exists and a draft is needed, create or request a project-local Markdown path such as `artifacts/report_working_draft.md`, then ask the lead consultant to record it in `analysis_state.report_working_draft_path`.

Use `../assets/report_structure_notes_template.md` for companion structure notes when the report shape is emerging or material may later matter but is not ready for prose. Use the existing `analysis_state.report_structure_notes_path` if present. If no path exists and notes are needed, create or request a project-local Markdown path such as `artifacts/report_structure_notes.md`, then ask the lead consultant to record it in `analysis_state.report_structure_notes_path`.

Use the two private artifacts differently:

- structure notes are for report architecture: candidate claims, evidence/provenance, claim boundaries, section jobs, module placement, figure/table ideas, code appendix candidates, limitations, anti-claims, and the smallest report question for the user;
- the working report is for durable project memory and draftable content: background, user priorities, reviewer reasoning, data/method evidence, module ledger, diagnostics, limitations, and next steps.

Do not turn either artifact into a transcript, and do not use either artifact to strengthen claims beyond the gates.

Keep the working draft organized around project background, user goals, domain interpretation, causal question, framework, estimand set, assumptions, data sources, variable construction, analysis alignment, activated modules, diagnostics, sensitivity checks, limitations, decisions, and next steps.

Preserve reviewer cues that connect report sections. For example, if `domain_expert` says a construct-validity concern, mechanism, common-practice finding, or external-validity boundary is closely related to the causal framework or interpretation, keep those pieces linked in the relevant draft sections rather than scattering them as unrelated caveats.

## Activation Procedure

On each activation:

1. Read compact state first: `project_summary`, `team_synthesis`, gates, `bounded_continuation`, reviewer sections, `analysis_state`, and `subskill_records`.
2. Classify the required action:
   - `no_action`: nothing report-worthy changed.
   - `structure_notes_update`: preserve report-building material that is not ready for prose.
   - `working_draft_update`: preserve durable project memory or draftable content.
   - `artifact_compile`: create a report/memo/progress artifact.
   - `artifact_revision`: revise an existing artifact from the same evidence.
3. Check claim boundaries before writing:
   - `causal_gate.claim_strength_allowed`;
   - `production_gate.claim_strength_for_report`;
   - `data_analyst.analysis_alignment.data_supported_claim_ceiling`;
   - `causal_gate.blockers` and `production_gate.blockers`;
   - `bounded_continuation.allowed_scope` and `bounded_continuation.prohibited_claims`;
   - missing evidence, diagnostics, code provenance, or artifact paths.
4. Update the appropriate surface:
   - structure notes for candidate claims, evidence boundaries, section jobs, module placement, figure/table ideas, code appendix seeds, limitations, and anti-claims;
   - working report for user interests, decisions, domain interpretation, causal specification reasoning, data evidence, analysis alignment, method logic, diagnostics, module ledger, limitations, and next steps;
   - released artifact only when a deliverable is needed.
5. If a needed result, diagnostic, table, figure, code path, or alignment check appears stale or inconsistent with the current report target, ask the lead consultant to route a bounded refresh to `data_analyst` or the owning method/task subskill. Do not rerun or silently update the analysis inside Report Writer.
6. For polished or final deliverables, recommend an owner review pass before release. Name which sections need `data_analyst`, `method_lead`, `domain_expert`, or activated method/task subskill review, and why.
7. Return compact feedback to the lead consultant: action performed, lane, evidence basis, claim boundary, missing inputs, owner-review needs, path updates, artifact paths, and smallest next step. The durable report record is the updated structure notes, working report, released artifact, and lead-recorded paths or limitations, not a separate Report Writer subskill record.

## Phase Behavior

### `project_exploration`

Default to `no_action` during ordinary exploration intake. Start report memory only after durable content appears or the user requests a deliverable. Useful durable content includes stable user interests, audience or deliverable choices, domain background, early data reality, decisions, possible directions, confusions, and open questions that are likely to matter later.

Prefer:

- structure notes for possible report spine, user need, background references, candidate claims, and early anti-claims;
- working report for stable background, user priorities, decisions, and open questions.

Do not delay the first orientation reply to create notes. A single file-intake or clarification turn usually needs no report-writer artifact unless it contains an explicit deliverable request or a stable decision/evidence point.

Do not make the notes look like final evidence.

### `causal_specification`

Actively update when information changes. Information includes data-analysis results, diagnostics, artifact provenance, method selection or rejection, causal reasoning, interpretation, assumptions, limitations, wording boundary, and how the framework corresponds to the user's request.

Preserve:

- why a framework or estimand is being selected, revised, blocked, or kept exploratory;
- what data facts or diagnostics changed method fit;
- how the current data align or fail to align with the intended claim, framework, estimands, and prior warnings;
- what assumptions, causal blockers, and wording boundaries must appear in a later report;
- which method/job subskill modules may become main text, appendix, or parked notes.

Do not wait for `report_production` to reconstruct this reasoning later.

### `report_production`

Use the working report and structure notes as source material. Compile or revise only within recorded claim limits. For final-report prose, use `scientific_report_workflow.md` and the selected lane template.

Before polished or final delivery, support a bounded owner review pass. `data_analyst` reviews data facts, artifact provenance, stale outputs, tables, figures, and `analysis_alignment`; `method_lead` reviews causal/statistical framing, assumptions, diagnostics, and claim strength; `domain_expert` reviews domain meaning, interpretation, action language, and external-validity wording; activated method/task subskills review only their own modules and method-specific limits. Integrate required owner-review edits when the lead consultant routes them back.

After each released artifact, remain in `report_production` for same-evidence revisions, format changes, added limitations, or follow-up questions. Return to `causal_specification` only when the requested revision changes the causal claim, estimand, assumptions, framework, or core design logic.

After a first-round Markdown report is generated, recommend that the lead consultant ask the user to review the content and choose whether to revise the Markdown or convert it to another requested format such as Word, PDF, HTML, slides, captions, or an executive memo. Do not convert formats automatically unless the user already requested that format or the agreed deliverable requires it.

## Lane Selection

Use the smallest lane that satisfies the user:

- `../assets/planning_communication_memo_template.md`: advisory memo, wording, slides, email, caveat, design explanation, no analyzable data, or early `project_exploration`.
- `../assets/exploratory_analysis_report_template.md`: progress artifact, first-pass output, diagnostic report, or exploratory summary when analyzable data or prototype outputs exist but `causal_gate` or `production_gate` readiness is incomplete.
- `../assets/reproducible_analysis_report_template.md`: evidence-backed report when `causal_gate.status` is ready, `production_gate` is ready enough to report, and executed code or verified artifacts support the reported numbers, diagnostics, figures, and tables.
- `../assets/final_report_template.md`: finished narrative report or same-evidence revision. Default to the simple main-answer, evidence, diagnostics, and limitations spine unless the project needs more. If blockers remain but the user still needs a report, use final-report structure only with visible limitation framing and claim language no stronger than `production_gate.claim_strength_for_report`.
- `../assets/discovery_report_template.md`: standalone discovery report only when the requested deliverable is graph exploration, causal discovery, variable screening, or a discovery-only summary rather than treatment-effect reporting. If discovery supports a broader report, use it as a module source instead.

## Modular Integration

For each activated method/job subskill or sidecar, place its report support packet deliberately:

- main text if it is central to the user's question or main evidence;
- subsection if it supports the selected framework;
- appendix if it is supplemental, diagnostic, sensitivity-only, or technical;
- parked note if it was considered but not used.

Each module should contribute purpose, inputs, method/design logic, outputs/findings, diagnostics, limitations, reviewer interpretation, references, and artifact paths when available. Integrate modules with transitions and consistent terminology. Do not concatenate raw subskill outputs.

If `06-causal-discovery` was a meaningful early sidecar, keep a visible discovery section or appendix entry with purpose, graph target, methods/settings, main findings, diagnostics, reviewer-routing implications, wording boundary, and artifact paths.

If `method_lead.causal_structure.graph_artifact` exists, treat it as report material. Include the DAG, timing diagram, edge table, adjustment table, mediator path map, interference or spillover map, selection or transportability diagram, or role/timing table in the framework/assumptions section when it helps the reader understand the causal claim, adjustment choice, forbidden adjustment, identification gap, or wording boundary. Use the appendix only when the artifact is technical or supplemental. If the artifact is not shown in the report, state the reason in the report notes or limitations.

## Evidence And Reference Rules

Populate report material from recorded state and inspected artifacts:

- `project_summary`, `team_synthesis`, gates, and `bounded_continuation`;
- `domain_expert`, `data_analyst`, and `method_lead`;
- `subskill_records` and report support packets;
- `analysis_state` paths, tables, figures, notebooks, rendered reports, discovery sidecar artifacts, and limitations;
- user-provided or inspected references, source materials, data documentation, package documentation, and method references.

Do not cite or summarize sources that were not inspected or supplied. Use one consistent citation style. If no external references were used, say so in the appendix or omit the reference appendix for a short memo.

Include numeric results, diagnostics, p-values, intervals, table values, figure interpretations, or code-derived claims only when they are user-provided, computed by authorized code, copied from inspected artifacts, or clearly labeled as placeholders.

If a result is missing, unavailable, not run, or illustrative, state that visibly. Match wording to recorded claim strength: `supported_causal`, `cautious_causal`, `associational`, `descriptive`, `exploratory`, or `unknown`. Separate effect interpretation from action recommendations. Keep privacy, access, small-cell, direct identifier, credential, and secret constraints out of public-facing artifacts.

If code generated reported numbers, diagnostics, tables, figures, graph artifacts, or transformed analysis datasets, include a reproducibility appendix or code appendix. The appendix should list code/notebook paths, purpose, inputs, outputs, package/version notes when available, seeds or randomness controls, and rerun notes. Include short code excerpts only when they clarify a key transformation or model. Keep long scripts and notebooks as linked artifacts rather than pasting them into the main narrative. Do not report code-derived results without provenance.

## Pre-Release Check

Before delivering a report artifact, check:

- the report answers the user's need before technical detail;
- the main answer, evidence status, and claim boundary appear near the front;
- each major claim has evidence and a boundary;
- causal language does not exceed gate claim strength;
- load-bearing `analysis_alignment` gaps shape the main answer, framework justification, results interpretation, and limitations rather than appearing only as late caveats;
- unresolved blockers and bounded-continuation limits are visible;
- figures/tables are explained and have provenance;
- any existing causal-structure graph, timing, or role artifact that is material to the claim is included in the report or has a clear omission reason;
- adjusted, restricted, matched, weighted, stratified, complete-case, or model-conditioned results state whether conditioning variables passed timing/role review, or visibly carry the unresolved collider/post-treatment/selection risk;
- diagnostics and sensitivity checks are completed, deferred, or visibly missing;
- diagnostics, sensitivity, and robustness checks have their own visible space, either as a short standalone section or an explicit paragraph inside Results for very short reports;
- code-derived content has a reproducibility appendix or path index;
- limitations are clear without overwhelming the main conclusion;
- appendices carry secondary detail, alternative methods, references, code notes, and user-requested extras.

If diagnostics are incomplete, write a progress report or diagnostic review rather than a final causal conclusion unless the main skill records the deferral and the report makes the limitation clear.

## Output Contract

Before compiling an artifact, make sure the report lane and claim limits are clear. Put full reports, Markdown drafts, notebooks, rendered HTML, slides, captions, appendices, tables, figures, and code artifacts in artifact folders. Convert recorded project YAML, reviewer sections, activated `subskill_records`, report-structure notes, working-report material, and linked artifacts into the requested report lane.

Return compact YAML update requests to the lead consultant:

- add finished report paths to `analysis_state.report_production_artifacts`;
- keep the working draft path in `analysis_state.report_working_draft_path`;
- keep the structure notes path in `analysis_state.report_structure_notes_path` when one exists;
- request owner review for report sections that depend on data facts, causal/statistical claims, domain interpretation, or activated method/task modules before polished or final delivery;
- return report-readiness feedback for the lead consultant to use when updating `production_gate`;
- record unresolved report limitations in `analysis_state.limitations`;
- leave reviewer-owned judgment fields to their owners.

## Feedback Patterns

Blocked:

```yaml
report_writer_feedback:
  status: "blocked"
  action: "no_action | structure_notes_update | working_draft_update | artifact_compile | artifact_revision"
  missing_inputs: []
  claim_language_risk: null
  working_draft_path: null
  structure_notes_path: null
  recommended_next_step: null
  artifact_paths: []
```

Updated notes or draft:

```yaml
report_writer_feedback:
  status: "draft_updated"
  action: "structure_notes_update | working_draft_update"
  report_lane: null
  evidence_basis: []
  claim_language_boundary: null
  working_draft_path: null
  structure_notes_path: null
  artifact_paths: []
  recommended_next_step: null
```

Artifact created or revised:

```yaml
report_writer_feedback:
  status: "artifact_created | artifact_revised"
  action: "artifact_compile | artifact_revision"
  report_lane: "planning memo | exploratory report | reproducible analysis report | final report | discovery report"
  evidence_basis: []
  claim_language_boundary: null
  working_draft_path: null
  structure_notes_path: null
  artifact_paths: []
  recommended_next_step: null
```
