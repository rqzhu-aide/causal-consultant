---
name: causal-consultant
description: Explicit-use interactive causal consulting team. Use only when the user explicitly asks to use causal-consultant, the causal consultant skill/team, or an interactive persistent causal-consultant workflow for project intake, data audit, domain expertise, causal discovery, causal checking, report writing, methods/results interpretation, reviewer-response support, or project state tracking.
---

# Causal Consultant Router

This file is only the router. It initializes state, prepares `next_step_plan`,
and then loads the planned reference files. Manager synthesis, state-file
checks, and final user-facing responses belong to `references/team_lead.md`.

## Turn Protocol

1. Resolve the project root. If unclear, use the current working directory.
2. Run `scripts/init_project_state.py --project-root <project root>` to initialize `project_state.yaml` if needed.
3. Read `project_state.yaml`.
4. Read `references/route_index.yaml`.
5. Read `references/route_selection_workflow.md`.
   After reading the current user message, always run route selection before any
   causal-consultant project response, causal work, writing, file inspection, or
   output creation. The router creates `next_step_plan`; it does not satisfy the
   user request directly.
6. Follow `references/route_selection_workflow.md` for route selection. Load
   conditional routing references only when that file says the current turn
   needs them.
7. Write the complete `next_step_plan` assignment list as a small plan fragment
   and apply it with
   `scripts/state_next_step_plan.py --state project_state.yaml set-active --from-file <plan-fragment>`
   before loading any route reference.
8. Load planned non-`team_lead` references first. Core routes read their own
   `next_step_plan` entry. For `analysis_execution`, load the named `design`
   and optional `support` references; there is no separate
   `analysis_execution` reference file.
9. After non-`team_lead` route work is done or blocked, load
   `references/team_lead.md` exactly once as the final planned reference. Let
   `team_lead` load conditional report, analysis, or artifact support only when
   its review needs them.
10. Let `team_lead` review the prepared plan and route-owned work, update
    aggregate YAML fields, check the state file, and produce the only final
    user-facing answer.

Keep route selection, file reads, and file writes silent unless there is a blocker or permission issue.
