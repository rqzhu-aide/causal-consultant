# Team Coordination

Use this backstage reference when coordinating the core reviewer team. Do not expose reviewer mechanics in ordinary user replies.

## Core Order

Default reviewer order:

1. `domain_expert`
2. `data_analyst`
3. `method_lead`
4. `report_writer`

The order is not a rigid bureaucracy. It is a practical default: domain meaning informs data handling; data evidence informs method judgment; method judgment and team notes inform report writing. Invoke `report_writer` only when it has work to do, but treat it as the normal fourth core member whenever content should be preserved or a deliverable is active.

## Role Boundaries

- The lead consultant speaks with the user, maintains progression, and synthesizes team output.
- The lead consultant may create lean `variable_roster` entries from user language, but final method roles, data bindings, and domain meanings belong to the reviewers below.
- `domain_expert` provides domain meaning, construct validity, mechanisms, domain data standards, common practice, interpretation, external-validity cautions, and `variable_roster.domain_meaning`. It does not route methods.
- `data_analyst` inspects authorized data or data descriptions, proposes compact checks, builds data evidence, records method-support handoffs, and updates `variable_roster.data_binding` and `variable_roster.data_status`. It does not validate causal identification.
- `method_lead` turns the user goal into causal questions, framework options, estimands, causal structure, assumptions, diagnostics, final variable-role use, and method/task subskill triage. It does not overwrite domain or data facts.
- `report_writer` silently preserves polished notes, report-structure notes, and report material; it does not release itself to the user.

## Reviewer Inputs

Give each reviewer enough context to work, but avoid flooding them.

- Give `domain_expert` the user goal, setting, current confusion, candidate constructs, `variable_roster` entries needing meaning, and any data/method facts that need domain interpretation.
- Give `data_analyst` `domain_expert` guidance, available data/data descriptions, `variable_roster` entries needing data binding, timing questions, and any bounded diagnostic request.
- Give `method_lead` `variable_roster`, `domain_expert` meaning, `data_analyst.method_support`, candidate hints, activated subskill records, and current framework/estimand questions.
- Give `report_writer` substantive user interests, reviewer guidance, decisions, evidence, artifacts, limitations, and reportable wording boundaries. During `causal_specification`, also give it the data-analysis results or diagnostics, method-picking logic, interpretation, and user-goal alignment that explain why a framework is being selected, revised, blocked, or kept exploratory.

## Adaptive Follow-Up

After the default first pass, allow at most one adaptive follow-up pass by default. Use it only when a reviewer has a concrete request or material update that would clearly change the next user-facing move.

Good follow-up triggers:

- `method_lead` asks for a specific timing, support, or variable-construction diagnostic from `data_analyst`;
- `data_analyst` finds a data contradiction that needs `method_lead` re-triage;
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
- reviewer output changes data evidence, method choice, assumptions, interpretation, wording, limitations, or user-goal alignment;
- a method/job subskill or sidecar returns report-support material;
- figures, tables, diagnostics, code, report artifacts, references, or source notes appear;
- the user requests a report, memo, revision, slide text, letter, or other deliverable;
- `report_production` is active.

Skip it when no report-worthy content changed and no deliverable is being produced.

During `causal_specification`, `report_writer` should actively update structure notes or the working report whenever there is an information update. Information update means a change in data evidence, data-analysis results, method selection or rejection, causal reasoning, interpretation, assumptions, diagnostics, limitations, wording boundary, or the explanation of how the analysis framework answers the user's request and goals.

Report writer should especially preserve:

- user interests and decisions;
- domain context and construct caveats;
- data facts, inspected artifacts, code paths, tables, figures, and diagnostics;
- method decisions, assumptions, sensitivity plans, and wording boundaries;
- why the chosen or candidate framework fits the user's goal, and what would make it change;
- activated subskill outputs that should become report modules;
- unresolved blockers and limitations.

Use report-structure notes for material that may shape a future report but should not yet become prose: candidate claims, evidence boundaries, section jobs, module placement, figure/table ideas, code appendix seeds, limitations, and anti-claims.

After it returns, the lead consultant records returned structure-note, working-draft, report-artifact, and durable-limitation paths in `analysis_state`, then uses report-writer feedback to update `production_gate` and `next_action` when relevant.
