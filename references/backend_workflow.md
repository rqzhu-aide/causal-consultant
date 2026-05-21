# Backend Workflow

Use this backstage reference for internal turn handling. Do not expose this workflow to the user unless they explicitly ask how the consulting skill is organized.

## One-Turn Workflow

On each meaningful user conversation turn, optimize for a useful next interaction with the user, not for exhausting every possible internal review.

1. Update obvious lead-consultant state from the user turn, including `team_synthesis.user_turn_summary` and a small `team_synthesis.turn_goal`.
2. Identify candidate or potentially useful subskill hints from the user turn plus existing YAML. In `project_exploration`, the lead consultant may notice candidates directly from meaning. In `causal_specification`, optionally use `scripts/recommend_subskills.py` as advisory recall for `method_lead`; the lead consultant does not adjudicate method fit from raw lookup output.
3. Give candidate hints to `domain_expert`, `data_analyst`, and especially `method_lead` as optional review context. Candidates are not activated yet, and raw script output should not be copied into selected methods.
4. Run the default first pass in this order: `01-domain-expert`, `02-data-analyst`, `03-method-lead`. Let each reviewer update only its own section.
5. Record material changes in `team_synthesis.material_updates_this_turn`.
6. Allow at most one adaptive follow-up pass by default, and only when a reviewer produced a concrete update that would clearly improve the next user-facing move. Examples: `method_lead` requests a bounded data diagnostic; `data_analyst` produces data evidence triage that changes framework feasibility; `domain_expert` identifies a construct rule that changes data construction.
7. Do not rerun a reviewer just because more review might help. Extra internal passes beyond one require the user to have explicitly asked for deeper analysis, already-authorized data work to be actively running, or a clear risk that replying now would mislead the user.
8. During `causal_specification`, let `method_lead` revise the triaged candidate set after reviewer updates if `domain_expert` or `data_analyst` changes what support may be useful.
9. After reviewer updates and any bounded follow-up, let `report_writer` update the polished project notebook or working report in every phase when there is substantive new user interest, discussion, evidence, decisions, artifacts, or reviewer guidance to preserve.
10. Record only `method_lead`-triaged plausible recommendations in `analysis_state.recommended_method_job_subskills`; record actual activations only in `analysis_state.activated_method_job_subskills` and `subskill_records`. Let `method_lead.tools_and_methods` hold the causal triage: plausible candidates, selected subskills, and blocked or not-used options.
11. Update gates, `working_agenda`, `bounded_continuation` if relevant, `analysis_state.limitations`, `team_synthesis.ready_to_reply`, `team_synthesis.reply_reason`, and `next_action`.
12. Reply to the user in plain language when the next useful interaction is clear.

## Phase Guidance

Phase progression depends mainly on recorded evidence, consistency with the provided or described data, and whether the team can support the next level of claim. Analysis can happen in every phase; the phase defines the purpose of the analysis.

### `project_exploration`

Use `project_exploration` to learn and orient:

- clarify the user goal, domain setting, data reality, feasibility, and possible candidate frameworks;
- if data is provided, inspect schema, variables, missingness, timing, summaries, and quick plots;
- let the lead consultant notice potentially relevant subskills or frameworks without requiring a formal catalog pass, while leaving causal-method triage to `method_lead`;
- let `report_writer` begin polished project notes once the conversation has durable content, especially user interests, domain context, early design ideas, open questions, and why they matter;
- keep outputs exploratory, descriptive, diagnostic, or design-learning rather than final causal evidence.

Set `project_summary.current_phase` to `causal_specification` when the user goal, domain setting, data structure, and at least one plausible candidate analysis framework are clear enough to begin specifying the causal claim(s), estimand set, assumptions, and diagnostics. This is not a claim-readiness gate.

### `causal_specification`

Use `causal_specification` to settle and stress-test:

- the causal claim(s), estimand set, framework, DAG/theory, assumptions, and wording boundary;
- treatment/exposure, comparator, outcome, population, time zero, follow-up, and causal unit;
- data feasibility, variable construction, timing, support, diagnostics, tool fit, and sensitivity plan;
- candidate method/task subskills through `method_lead` triage, not raw lookup output.

Set `project_summary.current_phase` to `report_production` when `causal_gate.status` is `ready` or `complete`, `causal_gate.blockers` is empty, and the selected framework, estimand set, key assumptions, data feasibility, diagnostics/sensitivity plan, and report wording boundary are recorded well enough to execute or finish the deliverable. This does not require every diagnostic or report artifact to be complete; those are handled by `production_gate`.

### `report_production`

Use `report_production` to draft, diagnose, revise, improve, and deliver:

- verify that analysis datasets, code, results, diagnostics, and sensitivity checks have provenance;
- organize completed analyses into coherent tables, figures, appendices, and report text;
- draft, revise, and improve the report with the user across as many turns as needed;
- after each meaningful report update, invite the user to review the new version and say which parts still need improvement;
- resolve inconsistencies between evidence, wording, and reviewer cautions;
- limit new runs to missing diagnostics, reproducibility checks, or user-approved bounded additions.

Delivering one version of a report does not move the project into a separate phase. Stay in `report_production` for follow-up questions, wording revisions, format changes, added limitations, and same-evidence improvements. Return to `causal_specification` only when new evidence or a requested revision changes the causal claim(s), estimand set, assumptions, framework, or core design logic.

## Gate Logic

Gate status and blockers control normal phase movement.

- `causal_gate.status` summarizes whether the causal claim/framework is ready for reportable use. `causal_gate.blockers` lists reasons it is not. If status is not `ready`/`complete` or blockers are non-empty, do not treat the causal specification as ready; ask for missing information, narrow the claim, or run bounded design-learning analysis.
- `production_gate.status` summarizes whether evidence/materials are ready for a polished deliverable. `production_gate.blockers` lists reasons they are not. If status is not `ready`/`complete` or blockers are non-empty, a report may still be produced, but it must visibly name the blockers, use weaker claim language, and avoid presenting unresolved work as complete.

If significant evidence or materials make the originally planned causal claim impossible or materially different, return to `causal_specification` for a recheck.

`bounded_continuation` is separate. It records when the user knowingly asks to continue despite unresolved blockers. It permits only bounded work inside `bounded_continuation.allowed_scope` and does not clear blockers, mark gates ready, or allow prohibited claims.

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
