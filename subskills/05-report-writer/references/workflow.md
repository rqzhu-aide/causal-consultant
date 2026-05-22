# Report Writer Workflow

Use this backstage reference when report-writer behavior needs more detail than `SKILL.md`. Keep the report writer silent, evidence-bound, and useful to the lead consultant.

## Operating Frame

Report Writer maintains three different surfaces:

1. `report_structure_notes`: private report architecture and future-use material.
2. `working_report`: private polished project notebook and draft memory.
3. released artifacts: user-facing reports, memos, revisions, appendices, slides, or requested add-ons.

Do not collapse these surfaces. Structure notes are not prose. The working report is not automatically released. A released artifact is compiled only when the lane, evidence, and claim limits are clear.

The main skill owns `causal_gate`, `production_gate`, `bounded_continuation`, and project YAML updates. Report Writer returns concise feedback and requested path updates; it does not open gates, validate identification, or talk to the user directly.

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
   - `causal_gate.blockers` and `production_gate.blockers`;
   - `bounded_continuation.allowed_scope` and `bounded_continuation.prohibited_claims`;
   - missing evidence, diagnostics, code provenance, or artifact paths.
4. Update the appropriate surface:
   - structure notes for candidate claims, evidence boundaries, section jobs, module placement, figure/table ideas, code appendix seeds, limitations, and anti-claims;
   - working report for user interests, decisions, domain interpretation, causal specification reasoning, data evidence, method logic, diagnostics, module ledger, limitations, and next steps;
   - released artifact only when a deliverable is needed.
5. Return compact feedback to the lead consultant: action performed, lane, evidence basis, claim boundary, missing inputs, path updates, artifact paths, and smallest next step.

## Phase Behavior

### `project_exploration`

Start report memory only after durable content appears. Useful content includes user interests, domain background, early data reality, possible directions, confusions, and open questions.

Prefer:

- structure notes for possible report spine, user need, background references, candidate claims, and early anti-claims;
- working report for stable background, user priorities, decisions, and open questions.

Do not make the notes look like final evidence.

### `causal_specification`

Actively update when information changes. Information includes data-analysis results, diagnostics, artifact provenance, method selection or rejection, causal reasoning, interpretation, assumptions, limitations, wording boundary, and how the framework corresponds to the user's request.

Preserve:

- why a framework or estimand is being selected, revised, blocked, or kept exploratory;
- what data facts or diagnostics changed method fit;
- what assumptions, causal blockers, and wording boundaries must appear in a later report;
- which method/job subskill modules may become main text, appendix, or parked notes.

Do not wait for `report_production` to reconstruct this reasoning later.

### `report_production`

Use the working report and structure notes as source material. Compile or revise only within recorded claim limits. For final-report prose, use `scientific_report_workflow.md` and the selected lane template.

After each released artifact, remain in `report_production` for same-evidence revisions, format changes, added limitations, or follow-up questions. Return to `causal_specification` only when the requested revision changes the causal claim, estimand, assumptions, framework, or core design logic.

## Lane Selection

Use the smallest lane that satisfies the user:

- `../assets/planning_communication_memo_template.md`: advisory memo, wording, slides, email, caveat, design explanation, or no analyzable data.
- `../assets/exploratory_analysis_report_template.md`: progress artifact, first-pass output, diagnostic report, or exploratory summary when gates are incomplete.
- `../assets/reproducible_analysis_report_template.md`: evidence-backed report with code, inspected artifacts, tables, figures, and diagnostics.
- `../assets/final_report_template.md`: finished narrative report or same-evidence revision. Default to the simple results-plus-diagnostics report spine unless the project needs more.
- `../assets/discovery_report_template.md`: standalone discovery report. If discovery supports a broader report, use it as a module source instead.

## Modular Integration

For each activated method/job subskill or sidecar, place its report support packet deliberately:

- main text if it is central to the user's question or main evidence;
- subsection if it supports the selected framework;
- appendix if it is supplemental, diagnostic, sensitivity-only, or technical;
- parked note if it was considered but not used.

Each module should contribute purpose, inputs, method/design logic, outputs/findings, diagnostics, limitations, reviewer interpretation, references, and artifact paths when available. Integrate modules with transitions and consistent terminology. Do not concatenate raw subskill outputs.

If `06-causal-discovery` was a meaningful early sidecar, keep a visible discovery section or appendix entry with purpose, graph target, methods/settings, main findings, diagnostics, reviewer-routing implications, wording boundary, and artifact paths.

## Evidence And Reference Rules

Populate report material from recorded state and inspected artifacts:

- `project_summary`, `team_synthesis`, gates, and `bounded_continuation`;
- `domain_expert`, `data_analyst`, and `method_lead`;
- `subskill_records` and report support packets;
- `analysis_state` paths, tables, figures, notebooks, rendered reports, discovery sidecar artifacts, and limitations;
- user-provided or inspected references, source materials, data documentation, package documentation, and method references.

Do not cite or summarize sources that were not inspected or supplied. Use one consistent citation style. If no external references were used, say so in the appendix or omit the reference appendix for a short memo.

Include numeric results, diagnostics, p-values, intervals, table values, figure interpretations, or code-derived claims only when they are user-provided, computed by authorized code, copied from inspected artifacts, or clearly labeled as placeholders.

## Pre-Release Check

Before delivering a report artifact, check:

- the report answers the user's need before technical detail;
- each major claim has evidence and a boundary;
- causal language does not exceed gate claim strength;
- unresolved blockers and bounded-continuation limits are visible;
- figures/tables are explained and have provenance;
- diagnostics and sensitivity checks are completed, deferred, or visibly missing;
- model diagnostics have their own visible space, either as a short standalone section or an explicit paragraph inside Results for very short reports;
- code-derived content has a reproducibility appendix or path index;
- limitations are clear without overwhelming the main conclusion;
- appendices carry secondary detail, alternative methods, references, code notes, and user-requested extras.

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
