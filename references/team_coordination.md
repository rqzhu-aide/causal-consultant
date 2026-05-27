# Team Coordination

Use this backstage reference when coordinating the core reviewer team. Do not expose reviewer mechanics in ordinary user replies.

## Core Order

Default reviewer order:

1. `domain_expert`
2. `data_analyst`
3. `method_lead`
4. `report_writer`

The order is not a rigid bureaucracy, and it is not a rerun requirement. It is a practical default when multiple reviewer lanes are needed: domain meaning informs data handling; data evidence informs method judgment; method judgment and team notes inform report writing. Invoke `report_writer` only when it has work to do, but treat it as the normal fourth core member whenever content should be preserved or a deliverable is active.

## Role Boundaries

- The lead consultant speaks with the user, maintains progression, and synthesizes team output.
- The lead consultant may create lean `variable_roster` entries from user language, but final method roles, data bindings, and domain meanings belong to the reviewers below.
- `domain_expert` provides domain meaning, construct validity, mechanisms, domain data standards, common practice, interpretation, external-validity cautions, and `variable_roster.domain_meaning`. It does not route methods.
- `data_analyst` inspects authorized data or data descriptions, proposes compact checks, builds data evidence, records method-support handoffs, maintains `analysis_alignment`, and updates `variable_roster.data_binding` and `variable_roster.data_status`. It does not validate causal identification.
- `method_lead` turns the user goal into causal questions, framework options, estimands, causal structure, assumptions, diagnostics, statistical-validity checks, final variable-role use, and method/task subskill triage. It does not overwrite domain or data facts.
- `report_writer` silently preserves polished notes, report-structure notes, and report material; it does not release itself to the user.

## Domain Expert Timing

Domain guidance is persistent. Invoke or refresh `domain_expert` when new information changes, challenges, or depends on domain meaning: user goals, setting, population, exposure, comparator, outcome, timing, mechanisms, variable construct meaning, measurement standards, plausible intervention versions, effect scale, external validity, interpretation, action language, or report wording.

Reuse existing domain guidance when later work only consumes already-recorded meaning. Do not rerun `domain_expert` for ordinary file intake, code execution, table or figure generation, report formatting, method-lead consumption of stable domain facts, or a bounded data check that does not change construct meaning or interpretation.

## Reviewer Inputs

Give each reviewer enough context to work, but avoid flooding them.

- Give `domain_expert` the user goal, setting, current confusion, candidate constructs, `variable_roster` entries needing meaning, and any data/method facts that need domain interpretation, but only when a domain refresh is triggered.
- Give `data_analyst` `domain_expert` guidance, available data/data descriptions, `variable_roster` entries needing data binding, timing questions, current `method_lead` requirements or candidate framework needs, and any bounded diagnostic request.
- Give `method_lead` `variable_roster`, `domain_expert` meaning, `data_analyst.analysis_alignment`, `data_analyst.method_support`, candidate hints, activated subskill records, current framework/estimand questions, and any new analysis results or report claims needing statistical-validity review.
- Give `report_writer` substantive user interests, reviewer guidance, decisions, evidence, artifacts, limitations, and reportable wording boundaries. During `causal_specification`, also give it the data-analysis results or diagnostics, method-picking logic, interpretation, and user-goal alignment that explain why a framework is being selected, revised, blocked, or kept exploratory.

## Adaptive Follow-Up

After the triggered first pass, allow at most one adaptive follow-up pass by default. Count a bounded `analysis_alignment` refresh and method-lead consumption as that follow-up when it reruns a reviewer. Use follow-up only when a reviewer has a concrete request or material update that would clearly change the next user-facing move.

Good follow-up triggers:

- `method_lead` asks for a specific timing, support, or variable-construction diagnostic from `data_analyst`;
- `data_analyst` finds a data contradiction or `analysis_alignment` gap that needs `method_lead` re-triage;
- `domain_expert` identifies a construct rule that changes data construction or wording;
- `report_writer` finds that report wording would misrepresent a reviewer limitation.

Weak follow-up triggers:

- more review might be useful in general;
- a broad method catalog could be searched;
- a reviewer could produce a longer memo;
- the next useful move is clearly to ask the user a question.

## Team Synthesis

Use `team_synthesis` as the compact convergence checkpoint for the turn. It should answer:

- What did the user just ask or provide?
- What small internal purpose is this turn serving?
- What facts or working facts changed?
- What is missing?
- What tensions matter for the user's goal?
- Is the team ready to reply, and why?

Keep `team_synthesis.turn_goal` small. The purpose is not to solve the entire project before returning to the user. The purpose is to prepare the next useful question, explanation, small action, or artifact.

## Report Writer Timing

Let the lead consultant load `05-report-writer` after core reviewer work when there is substantive content to preserve. This can happen during `project_exploration`, not only during `report_production`.

Invoke it when:

- durable user interests, background, choices, or open questions appear;
- reviewer output changes data evidence, analysis alignment, method choice, assumptions, interpretation, wording, limitations, or user-goal alignment;
- a method/job subskill or sidecar returns report-support material;
- figures, tables, diagnostics, code, report artifacts, references, or source notes appear;
- the user requests a report, memo, revision, slide text, letter, or other deliverable;
- `report_production` is active.

Skip it when no report-worthy content changed and no deliverable is being produced.

During `causal_specification`, `report_writer` should actively update structure notes or the working report whenever there is an information update. Information update means a change in data evidence, `analysis_alignment`, data-analysis results, method selection or rejection, causal reasoning, interpretation, assumptions, diagnostics, limitations, wording boundary, or the explanation of how the analysis framework answers the user's request and goals.

Report writer should especially preserve:

- user interests and decisions;
- domain context and construct caveats;
- data facts, inspected artifacts, code paths, tables, figures, and diagnostics;
- alignment between intended claims and what the data actually support;
- method decisions, assumptions, sensitivity plans, and wording boundaries;
- why the chosen or candidate framework fits the user's goal, and what would make it change;
- activated subskill outputs that should become report modules;
- unresolved blockers and limitations.

Use report-structure notes for material that may shape a future report but should not yet become prose: candidate claims, evidence boundaries, section jobs, module placement, figure/table ideas, code appendix seeds, limitations, and anti-claims.

After it returns, the lead consultant records returned structure-note, working-draft, report-artifact, and durable-limitation paths in `analysis_state`, then uses report-writer feedback to update `production_gate` and `next_action` when relevant.

## Report Owner Review

Before treating a polished or final report artifact as production-ready, run a bounded owner review pass when the report contains substantive data evidence, causal/statistical claims, domain interpretation, or activated specialist modules.

- `data_analyst` reviews data facts, tables, figures, code paths, artifact provenance, stale-output risk, and `analysis_alignment`.
- `method_lead` reviews causal framework consistency, estimands, assumptions, diagnostics, statistical-evidence status, and claim strength.
- `domain_expert` reviews construct language, interpretation, meaningful effect scale, action language, and external-validity wording.
- Activated method/task subskills review only their own report module, diagnostic, appendix material, or method-specific limitation.

Route required edits back to `report_writer`. Use existing durable fields for unresolved issues: `production_gate.blockers`, `production_gate.unresolved_required_materials`, `analysis_state.limitations`, reviewer-owned fields, or a new `subskill_records` entry only if the review produces new substantive specialist feedback.
