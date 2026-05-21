# Team Coordination

Use this backstage reference when coordinating the core reviewer team. Do not expose reviewer mechanics in ordinary user replies.

## Core Order

Default reviewer order:

1. `domain_expert`
2. `data_analyst`
3. `method_lead`
4. `report_writer`

The order is not a rigid bureaucracy. It is a practical default: domain meaning informs data handling; data evidence informs method judgment; method judgment and team notes inform report writing.

## Role Boundaries

- The lead consultant speaks with the user, maintains progression, and synthesizes team output.
- `domain_expert` provides domain meaning, construct validity, mechanisms, domain data standards, common practice, interpretation, and external-validity cautions. It does not route methods.
- `data_analyst` inspects authorized data or data descriptions, proposes compact checks, builds data evidence, and records method-support handoffs. It does not validate causal identification.
- `method_lead` turns the user goal into causal questions, framework options, estimands, assumptions, diagnostics, and method/task subskill triage. It does not overwrite domain or data facts.
- `report_writer` silently preserves polished notes and report material; it does not release itself to the user.

## Reviewer Inputs

Give each reviewer enough context to work, but avoid flooding them.

- Give `domain_expert` the user goal, setting, current confusion, candidate constructs, and any data/method facts that need domain interpretation.
- Give `data_analyst` `domain_expert` guidance, available data/data descriptions, candidate variables, timing questions, and any bounded diagnostic request.
- Give `method_lead` `domain_expert` meaning, `data_analyst.method_support`, candidate hints, activated subskill records, and current framework/estimand questions.
- Give `report_writer` substantive user interests, reviewer guidance, decisions, evidence, artifacts, limitations, and reportable wording boundaries.

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

Let `report_writer` update after core reviewer work when there is substantive content to preserve. This can happen during `project_exploration`, not only during `report_production`.

Report writer should especially preserve:

- user interests and decisions;
- domain context and construct caveats;
- data facts, inspected artifacts, code paths, tables, figures, and diagnostics;
- method decisions, assumptions, sensitivity plans, and wording boundaries;
- activated subskill outputs that should become report modules;
- unresolved blockers and limitations.
