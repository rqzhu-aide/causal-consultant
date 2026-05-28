# Backend Workflow

Use this backstage reference for internal turn handling. Do not expose this workflow to the user unless they explicitly ask how the consulting skill is organized.

## One-Turn Workflow

On each meaningful user conversation turn, optimize for a useful next interaction with the user, not for exhausting every possible internal review. Use the steps below as the normal progression when the turn needs them; skip steps whose trigger is not present.

### Project Exploration Override

When `project_summary.current_phase` is `project_exploration`, use `exploration intake mode` by default. Treat the numbered workflow as a menu for escalation, not mandatory end-to-end execution. Run only the steps needed to produce the next useful user-facing reply.

In intake mode, core members return only the smallest orientation needed for that reply: the lead consultant identifies the immediate goal and next question; `domain_expert` sketches candidate construct meanings only when the goal, constructs, setting, or interpretation is new or ambiguous; `data_analyst` records provenance and coarse data/document structure; `method_lead` returns a shallow option map with 2-4 plausible causal framings or framework families, the reason each could fit, the distinguishing fact or user choice that would separate them, the data reality each would require, and the smallest next question or check; `report_writer` preserves only explicit deliverable requests or durable decisions/evidence points.

Escalate beyond intake mode only when the user asks for deeper audit or analysis, has already authorized deeper work, or a safe next reply depends on a bounded internal check.

### Normal Turn Sequence

1. Update obvious lead-consultant state from the user turn, including `team_synthesis.user_turn_summary` and a small `team_synthesis.turn_goal`. Add lean `variable_roster` entries only for decision-relevant variables or variable families named by the user, with provisional labels and user-stated roles.
2. Identify candidate or potentially useful subskill hints from the user turn plus existing YAML. In `project_exploration`, the lead consultant may notice candidates directly from meaning. In `causal_specification`, optionally use `scripts/recommend_subskills.py` as advisory recall for `method_lead`; the lead consultant does not adjudicate method fit from raw lookup output.
3. Give candidate hints to the reviewer lanes that need them. Give hints to `domain_expert` only when candidate fit depends on construct meaning, setting, mechanisms, measurement standards, interpretation, external validity, or action context; give hints to `data_analyst` when data evidence matters; give hints especially to `method_lead` for method triage. Candidates are not activated yet, and raw script output should not be copied into selected methods.
4. Run or refresh only the reviewer lanes needed for the next reply. Use this order when multiple lanes are needed: `01-domain-expert`, `02-data-analyst`, `03-method-lead`. Refresh `domain_expert` only when the user turn, data finding, method question, or report wording changes or depends on domain meaning; otherwise reuse existing domain guidance. Run `data_analyst` when data facts, provenance, constructability, diagnostics, artifacts, or `analysis_alignment` matter. Run `method_lead` when causal question, framework, estimand, validity, method/subskill triage, statistical evidence, or claim wording matters. In `project_exploration` intake mode, use compact orientation only from the member lanes needed for the next reply.
5. Run or refresh `data_analyst.analysis_alignment` when a causal/report claim is being formed, a method is about to be activated, an analysis is about to be interpreted, data role/provenance concerns may change interpretation, a report/memo is requested, earlier warnings may conflict with available data, or the turn has moved beyond intake mode. In early `project_exploration`, let new data or documents first produce intake facts: what was provided, whether it is inspectable, and what user goal or claim the materials should support. If `method_lead` created or changed load-bearing requirements in the first pass, route a bounded `data_analyst` alignment refresh; if that alignment changes method fit, claim ceiling, diagnostics, or blockers, route a bounded `method_lead` consumption pass before method selection, claim wording, or gate readiness.
6. Record material changes in `team_synthesis.material_updates_this_turn`, including alignment changes that affect claim strength, method fit, report wording, or next user questions.
7. Allow at most one adaptive follow-up pass by default, counting the alignment refresh/consumption loop above when it reruns a reviewer. Use it only when a reviewer produced a concrete update that would clearly improve the next user-facing move. Examples: `method_lead` requests a bounded data diagnostic; `data_analyst` produces data evidence triage or `analysis_alignment` that changes framework feasibility; `domain_expert` identifies a construct rule that changes data construction.
8. Do not rerun a reviewer just because more review might help. Extra internal passes beyond one require the user to have explicitly asked for deeper analysis, already-authorized data work to be actively running, or a clear risk that replying now would mislead the user.
9. During `causal_specification`, let `method_lead` revise the triaged candidate set after reviewer updates if `domain_expert` or `data_analyst` changes what support may be useful.
10. If `method_lead` selects a method/job subskill for bounded activation this turn, follow `subskill_coordination.md`: the lead consultant invokes the subskill, records its returned packet in `subskill_records`, then routes the record by what it affects. In `project_exploration`, activation requires a concrete bounded reason: the user asked for method-specific assessment, `method_lead` has narrowed a design/target question enough for specialist support, or one specialist check directly answers the next user question. Routine data or implementation requests go to `data_analyst`; report-support material goes to `report_writer`; `method_lead` gets a bounded recheck only when `method_lead_recheck.required` is true, `blocking_signal` threatens gate status or causal claims, or the record may change causal strategy, selected framework, estimand set, `causal_structure`, claim strength, or wording boundary. If no subskill is selected for activation, keep selected candidates as triage notes rather than pretending activation happened.
11. Decide whether to invoke `05-report-writer` as the fourth core step. Invoke it when any of these are true: a report, memo, revision, or other deliverable is requested; a durable decision/evidence point should be preserved; a method/job subskill returned report-support material; `causal_specification` changed data evidence, `analysis_alignment`, method choice, reasoning, interpretation, assumptions, limitations, wording boundary, or user-goal alignment; or `report_production` is active. In `project_exploration` intake mode, report-writer work is limited to explicit deliverable requests or durable decisions/evidence points and should not delay the orientation reply. If invoked, give it compact state plus relevant reviewer/subskill output and let it update `report_structure_notes`, the working report, or a report artifact according to `subskills/05-report-writer/references/workflow.md`. If nothing report-worthy changed, do not force a report-writer pass.
12. Record only `method_lead`-triaged plausible recommendations in `analysis_state.recommended_method_job_subskills`. Use `subskill_records` as the durable source of truth for subskills that actually ran or produced durable feedback. Let `method_lead.tools_and_methods` hold the causal triage: plausible candidates, selected subskills, and blocked or not-used options.
13. After `report_writer` feedback, record returned path updates in `analysis_state.report_structure_notes_path`, `analysis_state.report_working_draft_path`, or `analysis_state.report_production_artifacts`; record durable report limitations in `analysis_state.limitations`; and use report-writer readiness or claim-language risk when updating `production_gate`. Do not write report-writer feedback into reviewer-owned sections.
14. When `report_writer` compiles or materially revises a report artifact that may be delivered as polished work, run a bounded report owner review pass before treating it as final or production-ready. This step belongs to `report_production`, explicit deliverable work, or bounded continuation that creates a user-facing artifact; it is not part of ordinary exploration intake. Route the draft, or only the relevant sections, to `data_analyst`, `method_lead`, `domain_expert`, and any activated method/task subskill whose module appears in the report. Each reviewer checks only its owned facts, claims, artifacts, diagnostics, wording limits, and stale-output risks. This review pass is deliverable QA, not a reason to create new method-job records by default.
15. Send required report edits back to `report_writer` for revision when owner review is active. Record only durable unresolved issues in existing locations: `production_gate.blockers`, `production_gate.unresolved_required_materials`, `analysis_state.limitations`, reviewer-owned fields, or a new `subskill_records` entry only if a specialist produces new substantive feedback beyond reviewing its own drafted section.
16. Update gates, `working_agenda`, `bounded_continuation` if relevant, `analysis_state.limitations`, `team_synthesis.ready_to_reply`, `team_synthesis.reply_reason`, and `next_action` only after required rechecks and report owner-review issues have either been completed or explicitly deferred with visible limitations.
17. Reply to the user in plain language when the next useful interaction is clear.

## Phase Guidance

Phase progression depends mainly on recorded evidence, consistency with the provided or described data, and whether the team can support the next level of claim. Analysis can happen in every phase; the phase defines the purpose of the analysis.

### `project_exploration`

Use `project_exploration` to learn and orient:

- clarify the user goal, domain setting, data reality, feasibility, and possible candidate frameworks;
- use intake mode for provided data or documents: identify files/sources, provenance, coarse structure, document headings or abstracts when available, cheap schema facts such as row/column counts, obvious candidate exposure/outcome/time/unit fields, and the next check that would matter;
- begin a lean `variable_roster` only for variables or variable families that affect the causal question, data construction, design, diagnostics, or report;
- let the lead consultant notice potentially relevant subskills or frameworks without requiring a formal catalog pass, while leaving causal-method triage to `method_lead`;
- invoke `report_writer` once durable content exists and preserving it would materially help future turns; do not delay the first orientation reply just to start report notes;
- keep outputs exploratory, descriptive, diagnostic, or design-learning rather than final causal evidence.

Set `project_summary.current_phase` to `causal_specification` when the user goal, domain setting, data structure, and at least one plausible candidate analysis framework are clear enough to begin specifying the causal claim(s), estimand set, assumptions, and diagnostics. This is not a claim-readiness gate.

### `causal_specification`

Use `causal_specification` to settle and stress-test:

- the causal claim(s), estimand set, framework, causal structure, assumptions, and wording boundary;
- treatment/exposure, comparator, outcome, population, time zero, follow-up, and causal unit;
- data feasibility, variable construction, timing, support, diagnostics, tool fit, and sensitivity plan;
- `data_analyst.analysis_alignment`: whether the current data support the intended claim, framework requirements, estimands, diagnostics, data role/provenance interpretation, and report target;
- candidate method/task subskills through `method_lead` triage, not raw lookup output;
- statistical-validity status for methods, diagnostics, results, discovered patterns, and claim wording, especially when results are in-sample, post-hoc, tuned on the same data, or not yet honestly evaluated;
- `method_lead.causal_structure`, using `variable_roster`, `domain_expert`, and `data_analyst` evidence rather than a standalone DAG table;
- the causal-structure artifact decision: if graph, timing, or role reasoning is load-bearing, `method_lead.causal_structure.graph_artifact` should point to a current project artifact; if not, `causal_structure.narrative` should explain why the compact YAML summary is enough;
- narrowing the exploration option map toward one primary working framework, while preserving one or two serious alternates only when current domain or data uncertainty genuinely supports them, with the evidence that would make each alternate replace or modify the primary framework;
- active `report_writer` updates whenever the team learns something that changes the data evidence, method choice, reasoning, interpretation, limitations, or connection between the analysis framework and the user's goal.

Do not wait until `report_production` to preserve causal-specification reasoning. `report_writer` should keep the working report and report-structure notes current enough that later production can reuse the recorded story instead of reconstructing why the framework, estimand, assumptions, diagnostics, or wording boundary were chosen.

Set `project_summary.current_phase` to `report_production` when `causal_gate.status` is `ready` or `complete`, `causal_gate.blockers` is empty, and the selected framework, estimand set, key assumptions, decision-relevant variable roles, data feasibility, current `analysis_alignment`, diagnostics/sensitivity plan, and report wording boundary are recorded well enough to support a reportable deliverable. This does not require every diagnostic or report artifact to be complete; those are handled by `production_gate`.

### `report_production`

Use `report_production` to draft, diagnose, revise, improve, and deliver:

- invoke `report_writer` on every deliverable-focused turn to choose or update the lane, preserve paths, check claim limits, and compile or revise artifacts when requested;
- verify that analysis datasets, code, results, diagnostics, and sensitivity checks have provenance;
- when report-needed outputs are stale or inconsistent with the current YAML state, route a bounded refresh to `data_analyst` or the owning method/task subskill before using them as report claims;
- organize completed analyses into coherent tables, figures, appendices, and report text;
- keep a report asset checklist for the main result visual/table, key diagnostic visual/table, and provenance path for each included or omitted asset;
- when HTML or another rendered artifact is delivered, keep the paired source report path and run rendered-output QA for lists, tables, figures, broken paths, and source/report links;
- before final or polished delivery, run a report owner review pass: `data_analyst` checks data facts, provenance, artifacts, and `analysis_alignment`; `method_lead` checks causal/statistical framing and claim strength; `domain_expert` checks domain meaning and interpretation; activated method/task subskills check their own modules, diagnostics, and method-specific limits;
- send owner-review corrections back to `report_writer`, then revise the report or visibly defer the issue before delivery;
- draft, revise, and improve the report with the user across as many turns as needed;
- after each meaningful report update, invite the user to review the new version and say which parts still need improvement;
- after a first-round Markdown report is generated, ask whether the user wants content revisions or conversion to another format such as Word, PDF, HTML, slides, captions, or an executive memo;
- resolve inconsistencies between evidence, wording, and reviewer cautions;
- limit new runs to missing diagnostics, reproducibility checks, or user-approved bounded additions.

Delivering one version of a report does not move the project into a separate phase. Stay in `report_production` for follow-up questions, wording revisions, format changes, added limitations, and same-evidence improvements. Return to `causal_specification` only when new evidence or a requested revision changes the causal claim(s), estimand set, assumptions, framework, or core design logic.

## Gate Logic

Gate status and blockers control normal phase movement.

- `causal_gate.status` summarizes whether the causal claim/framework is ready for reportable use. `causal_gate.blockers` lists reasons it is not. If status is not `ready`/`complete` or blockers are non-empty, do not treat the causal specification as ready; ask for missing information, narrow the claim, or run bounded design-learning analysis.
- `production_gate.status` summarizes whether evidence/materials are ready for a polished deliverable. `production_gate.blockers` lists reasons they are not. If status is not `ready`/`complete` or blockers are non-empty, a report may still be produced, but it must visibly name the blockers, use weaker claim language, and avoid presenting unresolved work as complete.

If significant evidence or materials make the originally planned causal claim impossible or materially different, return to `causal_specification` for a recheck.

`bounded_continuation` is separate. It records when the user knowingly asks to continue despite unresolved blockers. It permits only bounded work inside `bounded_continuation.allowed_scope` and does not clear blockers, mark gates ready, or allow prohibited claims.

A user-forced production request is handled as `bounded_continuation`, not as gate passage. The lead consultant may continue with a qualified report, progress artifact, diagnostic artifact, or report revision, and may use `report_production` as the active work phase when the task is deliverable-focused. The causal and production gate blockers stay recorded until actually resolved, and every released statement must remain consistent with those blockers.

## Gate Procedure

The lead consultant is the only gate writer. Reviewers, sidecars, and method/task subskills provide evidence, blockers, requests, artifacts, and wording limits; they do not open gates themselves.

Update gates after the relevant reviewer/subskill information has been recorded and any required `method_lead` recheck has either been completed or explicitly deferred with visible limitations. Do not mark a gate `ready` or `complete` just because an estimator can run, a report can be drafted, or the user wants to proceed.

### `causal_gate`

Use `causal_gate` for causal-specification readiness: whether the causal claim, estimand set, framework, assumptions, data feasibility, diagnostics plan, and wording boundary are coherent enough to be used in reportable work.

Inputs:

- `domain_expert`: construct validity, plausible mechanisms, meaningful effect scale, interpretation cautions, external-validity limits, and domain blockers.
- `data_analyst`: data availability, unit structure, timing, variable construction, support, missingness/selection, provenance, data-quality blockers, and method-support feasibility notes.
- `data_analyst.analysis_alignment`: current data-support crosswalk for the intended claim, framework, estimands, prior warnings, and gate requirements.
- `method_lead`: causal question, selected framework, estimand set, validity requirements, `causal_structure`, diagnostics/sensitivity plan, statistical-validity checks, report wording boundary, and causal blockers.
- `subskill_records`: only when a method/task subskill or causal-discovery sidecar produced durable feedback. If `method_lead_recheck.required` is true, do not treat the gate as ready until `method_lead` rechecks or the unresolved issue is visibly deferred.
- `analysis_state.limitations`: cross-cutting limitations that affect claim strength.

Set `causal_gate.status` to `ready` or `complete` only when the recorded state is sufficient for the next reportable step:

- causal question, exposure/intervention, comparator, outcome, population, time zero, follow-up, and causal unit are clear enough for the intended claim;
- selected framework and primary estimand set are recorded;
- decision-relevant variable roles are reflected in `variable_roster` and `method_lead.causal_structure`;
- graph, timing, or role reasoning is either externalized in a current `method_lead.causal_structure.graph_artifact` when load-bearing, or the `causal_structure.narrative` explains why no separate artifact is needed;
- load-bearing adjustment, restriction, matching/weighting, stratification, complete-case, or model-covariate choices have passed a timing/role check, or unresolved collider, post-treatment, mediator, selection, missingness, or outcome-derived-feature risk is recorded as a blocker or claim limitation;
- data feasibility is supported, constructible, or explicitly bounded;
- `analysis_alignment.status` is `checked`, `deferred`, or `not_applicable`, and any unsupported load-bearing requirements are either resolved or reflected in claim limits and blockers;
- key assumptions, diagnostics, sensitivity needs, and wording limits are recorded;
- blockers and unresolved required information are empty or explicitly deferred in a way that limits the claim.

Before `causal_gate` is ready, the team may explore, inspect data, run descriptive or diagnostic analysis, activate specialist modules, draft planning/progress artifacts, and ask clarifying questions. It should not present a finalized causal specification, move normally to `report_production`, or strengthen causal wording beyond `causal_gate.claim_strength_allowed`.

After `causal_gate` is ready, the team may move to `report_production` and use the specified framework for reportable analysis or deliverable work. The team still must run or document diagnostics, provenance, evidence, and materials under `production_gate`; causal readiness is not the same as finished evidence.

### `production_gate`

Use `production_gate` for deliverable readiness: whether evidence, diagnostics, provenance, code/tables/figures, limitations, and report materials are ready enough for the requested artifact.

Inputs:

- `data_analyst`: analysis dataset status, code paths, table paths, figure paths, diagnostics assets, reproducibility notes, data-quality blockers, and final report assets.
- `data_analyst.analysis_alignment`: whether executed or reported analysis remains aligned with the data support and claim ceiling.
- `method_lead`: whether executed work still matches the selected framework, estimand set, diagnostics/sensitivity plan, statistical-validity checks, and claim wording boundary.
- `domain_expert`: whether results and wording remain meaningful, interpretable, and not overgeneralized.
- `report_writer`: report lane, working draft path, structure notes path, missing evidence, claim-language risk, artifact paths, and whether the deliverable can be safely framed.
- report owner-review feedback from `data_analyst`, `method_lead`, `domain_expert`, and activated method/task subskills when their sections or outputs appear in the drafted report.
- `subskill_records`: specialist report-support packets, diagnostic outputs, limitations, artifact paths, and any `blocking_signal`.
- `analysis_state`: report production artifacts, discovery sidecar material, durable limitations, and report draft path.

Set `production_gate.status` to `ready` or `complete` only when the deliverable can be framed without hiding unfinished work:

- reported numbers, tables, figures, diagnostics, and sensitivity checks have provenance or are clearly marked as missing/deferred;
- code, notebooks, datasets, or artifact paths needed for reproducibility are recorded when they exist;
- diagnostics are `complete`, `not_applicable`, or explicitly `deferred` with visible limitations;
- current `analysis_alignment` has been checked or visibly deferred, and report wording does not exceed `data_supported_claim_ceiling`;
- owner review has either approved the relevant draft sections or unresolved owner-review issues are recorded as visible blockers, deferred materials, or report limitations;
- `production_gate.claim_strength_for_report` is no stronger than `causal_gate.claim_strength_allowed` and no stronger than the executed evidence supports;
- blockers and unresolved required materials are empty or explicitly deferred in a way the report will show.

Before `production_gate` is ready, the team may draft, revise, run missing diagnostics, produce qualified progress reports, or create exploratory/diagnostic artifacts. It must visibly name blockers and avoid presenting unresolved work as complete.

After `production_gate` is ready or complete, the team may deliver or revise polished artifacts within the recorded claim strength. Stay in `report_production` for same-evidence revisions. Return to `causal_specification` if new evidence or a requested revision changes the causal claim, estimand set, assumptions, selected framework, or core design logic.

### `bounded_continuation` And User-Forced Production

Use `bounded_continuation` when the user explicitly wants progress, analysis, or a report despite incomplete causal specification, unresolved gate blockers, missing diagnostics, or unfinished materials. This is a bounded work authorization, not a readiness decision.

Inputs:

- the user's requested continuation and whether they acknowledged the limits;
- current `causal_gate.status`, `causal_gate.blockers`, and `causal_gate.claim_strength_allowed`;
- current `production_gate.status`, `production_gate.blockers`, diagnostics status, and `production_gate.claim_strength_for_report`;
- reviewer blockers, `analysis_state.limitations`, `subskill_records`, and report-writer lane feedback.

When using `bounded_continuation`:

- keep `causal_gate` and `production_gate` statuses, blockers, and unresolved-information lists unchanged unless the issue is actually resolved;
- record the requested scope, allowed scope, prohibited claims, and brief warning in `bounded_continuation`;
- allow only work that fits the allowed scope, such as exploratory analysis, diagnostic checks, progress reporting, limitation-forward drafting, or same-evidence report revision;
- do not mark `causal_gate` or `production_gate` ready/complete because the user wants to proceed;
- do not delete, hide, or soften gate blockers in the report;
- cap report wording at the weakest relevant boundary from `causal_gate.claim_strength_allowed`, `production_gate.claim_strength_for_report`, `method_lead.report_wording_boundary`, `analysis_state.limitations`, and `bounded_continuation.prohibited_claims`;
- if the requested artifact uses a final-report structure, label unresolved causal logic and production blockers in the report body or limitations section rather than implying completion.

If user-forced production reveals evidence or materials that would change the causal claim, estimand set, assumptions, selected framework, causal structure, or wording boundary, stop treating it as same-scope production and return to `causal_specification` for recheck.

## When To Return To The User

Prefer returning to the user after one useful internal synthesis step. Pause internal review and reply when the next useful move is:

- a clarification question;
- a choice between plausible frameworks;
- permission to inspect data or run code;
- a short explanation of a blocker;
- a proposed small analysis;
- a concise summary of what the team currently thinks;
- a report or artifact revision for user review.

Use `team_synthesis.ready_to_reply` and `team_synthesis.reply_reason` to record why the lead is returning to the user now.
