# Report Writer Workflow

Use this reference when working-report or report-compilation support needs more detail than `SKILL.md`.

## Operating Frame

Report Writer starts silently during `project_exploration` once there is durable project content to preserve. It maintains a polished Markdown project notebook and working report from early user interests, discussions, reviewer updates, and artifacts through ongoing `report_production`, including same-evidence revisions. It compiles artifacts only when the report lane and claim limits are clear. It does not own a YAML section or a separate transition gate.

Treat the main report as the integrating document. It keeps project bookkeeping, the user's interests and priorities, discussion history, issues, decisions, references, artifacts, reviewer cautions, and an index of active modules. Activated method/job subskills and sidecars contribute modular report components. Report Writer preserves each module's local logic and evidence, then integrates it into one polished narrative with consistent claim language.

The main skill owns `causal_gate` and `production_gate`. Report Writer reads those fields and returns concise feedback about what can be reported safely.

Default deliverables are Markdown-first. A `.md` report is a first-round structured draft, but it should still be readable, organized, and lightly polished. It is auditable, easy to revise, and suitable for later polishing. If the user wants a fuller prose report, use the Markdown draft plus referenced data, code, figures, and artifacts as source material. The report writer may polish it directly in the current workflow or use available authorized tooling/APIs when that is appropriate. Avoid turning every Markdown draft into an exhaustive publication-style report unless the user asks.

## Lane Selection

Use `../assets/planning_communication_memo_template.md` when:

- no analyzable data are available;
- the user needs wording, slides, an email, a caveat, a short planning memo, or a design explanation;
- the project is still in `project_exploration` or `causal_specification` and the deliverable is advisory rather than evidence-reporting.

Use `../assets/exploratory_analysis_report_template.md` when:

- analyzable data or prototype model outputs exist;
- `causal_gate.status` is `not_ready`, or `production_gate.status` is `not_ready`;
- the user still wants a progress artifact, first-pass model report, diagnostic report, or exploratory summary.

Use `../assets/reproducible_analysis_report_template.md` when:

- `causal_gate` is ready or complete;
- `report_production` evidence is ready enough to report;
- numbers, plots, diagnostics, and tables come from executed code, inspected artifacts, or user-provided outputs with provenance.

Use `../assets/final_report_template.md` when:

- the user wants a finished narrative report, memo, or methods/results section from the same `report_production` evidence;
- the report can rely on recorded `domain_expert`, `data_analyst`, `method_lead`, method/job, and artifact records.

Use `../assets/discovery_report_template.md` when:

- the requested deliverable is a standalone graph exploration, variable screening, or causal discovery report rather than treatment-effect reporting;
- discovery outputs and limitations are recorded under `analysis_state.discovery_sidecar` or `subskill_records`.

When discovery is part of a broader analysis workflow, use `../assets/discovery_report_template.md` as a source for a modular section rather than creating a separate report.

Use a visible discovery section inside another report when:

- `06-causal-discovery` was activated early as a meaningful sidecar;
- the user requested discovery features as part of the project;
- discovery outputs shaped the candidate framework, DAG/theory, variable screening, or diagnostics;
- graph artifacts, edge lists, stability tables, or discovery limitations were created.

Use only an appendix when discovery was a small sensitivity check, produced no substantive findings, or is peripheral to the user goal.

## Modular Integration

For each activated method/job subskill or sidecar, look for a report support packet or equivalent material in `subskill_records`, `analysis_state`, artifacts, or reviewer notes. Decide its placement:

- central section if it shaped the user-facing analysis or produced key evidence;
- subsection if it supports a broader method/results/diagnostics story;
- appendix if it is supplemental or sensitivity-only;
- parked note if it was considered but not used.

Each module should contribute these pieces when available: purpose, inputs, method/design logic, outputs/findings, diagnostics, limitations, reviewer interpretation, references, and artifact paths. Integrate modules with transitions and consistent terminology; do not concatenate raw subskill outputs.

## Evidence Sources

Populate reports from:

- `project_summary`: project label, user goal, audience, deliverable, and current phase;
- `team_synthesis`: known facts, missing information, and key tensions;
- `domain_expert`: domain context, construct guidance, causal-structure guidance, interpretation, common-practice context, and external validity;
- `method_lead`: causal question variants, selected framework, estimand set, validity requirements, DAG/theory, assumptions, method-literature guidance, tools/subskills, diagnostics, sensitivity, and wording boundary;
- `data_analyst`: data provenance, data properties, exploratory outputs, diagnostics assets, `report_production` assets, and reproducibility notes;
- `subskill_records`: method/job fit, outputs, diagnostics, limitations, requests, and artifact paths;
- `analysis_state` and `artifact_index`: working draft path, created reports, tables, figures, notebooks, rendered HTML, limitations, and discovery sidecar paths.
- discovery `report_support` packets: section title, purpose, graph target, methods/settings, main findings, diagnostics, reviewer-routing implications, wording boundary, and artifact paths.
- other subskill report support packets: module title, purpose, inputs, methods, outputs, diagnostics, limitations, reviewer interpretation, references, and artifact paths.

If the needed evidence is missing, write the missing item plainly and recommend the next `report_production` step.

Do not present a report as complete or strongly causal unless `production_gate.status` is ready/complete and the evidence supports that wording. If readiness is incomplete, the report may still be produced as a qualified, progress, diagnostic, or limitation-forward artifact that visibly names blockers, missing materials, deferred diagnostics, and claim-strength limits. Under `bounded_continuation`, keep the artifact inside `bounded_continuation.allowed_scope` and avoid `bounded_continuation.prohibited_claims`.

## Working Draft Pattern

Use `../assets/working_report_template.md` when starting the Markdown project notebook/working report. Keep the path in `analysis_state.report_working_draft_path`. Update the draft after meaningful user-priority updates, reviewer changes, sidecar outputs, or artifact creation. The working draft is not a released report; it is the structured, paper-like memory the report writer uses for later production.

## Final Report Production Review

Before finishing a causal report, check:

- the claim(s) and estimand set are the same as the causal specification;
- data-derived numbers have provenance;
- diagnostics and sensitivity checks are completed, explicitly deferred, or visibly missing;
- limitations from all reviewers are represented;
- action recommendations are weaker than or equal to the evidence;
- privacy and disclosure constraints are respected;
- the artifact path and reproducibility notes are recorded.
- any code used for reported numbers, diagnostics, tables, figures, graph artifacts, or analysis datasets is indexed in a code/reproducibility appendix.

## Code Appendix Pattern

Use a code or reproducibility appendix whenever code supports reported content. Prefer a path-and-purpose index over long pasted code blocks:

| Code or notebook | Purpose | Inputs | Outputs | Reproducibility notes |
|---|---|---|---|---|
| [path] | [model, diagnostic, table, figure, graph, data construction] | [data/artifacts] | [reported outputs] | [seed, package/version notes, rerun notes] |

Add short code excerpts only for key transformations or models that readers need to inspect in the report. Keep full scripts and notebooks as linked artifacts.

## Blocked Feedback Pattern

```yaml
report_writer_feedback:
  status: "blocked"
  missing_inputs:
    - null
  claim_language_risk: null
  working_draft_path: null
  recommended_next_step: null
  artifact_paths: []
```

## Completion Pattern

```yaml
report_writer_feedback:
  status: "artifact_created"
  report_lane: "planning memo | exploratory report | reproducible analysis report | final report | discovery report"
  evidence_basis: []
  claim_language_boundary: null
  working_draft_path: null
  artifact_paths: []
  recommended_next_step: null
```

After an artifact is delivered, stay in `report_production` for revision and follow-up work: revising the same deliverable, creating another format from the same evidence, answering follow-up questions, improving wording, adding limitations, or pausing. Each released version should invite the user to review it and identify what still needs improvement. Return to `causal_specification` only when a requested revision changes the causal claim, estimand, assumptions, framework, or core design logic.
