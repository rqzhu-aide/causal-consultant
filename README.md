# A Causal Consultant Skill

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)]() [![Status](https://img.shields.io/badge/status-under%20development-orange.svg)]()

*An interactive consultant for causal reasoning, discovery, design, analysis, and reporting.*

---

## What This Skill Is About

This is a modular causal inference consultant skill for agent systems that load a top-level `SKILL.md` and then selectively read only the supporting subskills, references, scripts, and templates needed for the current project phase. It helps a user move from an informal causal question to a defensible analysis plan, production-ready evidence, and final report handoff.

The skill is built for interactive work. It keeps a compact project state with the user's goal, treatment or exposure, comparator, outcome, population, timing, data situation, plausible causal routes, assumptions, blockers, diagnostics, and reporting readiness. As new information appears, the workflow can recheck earlier decisions, revise the route, narrow the estimand, suggest fallback analyses, or explain why a causal claim is not supported.

It is for data scientists, analysts, researchers, and domain experts who want a careful causal partner rather than a black-box method picker. It can support data audit, prospective design planning, DAG reasoning, method selection, R/Python code drafting, diagnostic review, result interpretation, and reproducible reporting.

However, causal claims should never be stronger than the design, assumptions, diagnostics, and sensitivity checks can justify.

> I cannot give you a definitive answer, but I can help you explore.

---

## How to Activate

Say one of the following phrases in your request:

- "causal inference"
- "causal discovery"
- "policy effect estimation"
- "treatment decision making"

---

## How to Install

One Codex-friendly example:

```powershell
py "$env:USERPROFILE\.codex\skills\.system\skill-installer\scripts\install-skill-from-github.py" `
  --repo rqzhu-aide/causal-consultant `
  --path . `
  --name causal-consultant
```

After installation, restart the agent app if needed so it can discover the new skill.

---

## Interactive Architecture

This workflow is different from a standard causal checklist because it treats causal work as an adaptive conversation. The user and project state provide observations. The main skill acts like a policy actor in a reinforcement-learning-style loop: it chooses the next useful action, asks for only the information that can change the decision, activates the relevant evaluator or method subskill, and updates the shared state. Subskills act like evaluators: each one focuses on a narrow part of the causal problem and reports compact readiness, implications, requests, and blockers back to the main skill.

Two gates organize the loop. `foundation_gate` decides whether the causal question, data context, design route, and DAG logic are coherent enough to begin method production. `production_gate` decides whether the completed analysis evidence, diagnostics, outputs, limitations, and handoff summary are ready for final reporting. Relevant subskills use the same blocking language so the main skill does not have to interpret many incompatible statuses: a subskill can block the current phase, request a previous-phase recheck, or allow progress with stated cautions.

With those gates in place, the practical loop is step by step:

1. Clarify the user's causal question in domain language.
2. Record the current data context, including whether data exist, partially exist, or are only conceptual.
3. Propose and compare a small set of plausible design routes.
4. Use DAG and causal-logic review to test timing, variable roles, identification, and adjustment logic.
5. Open `foundation_gate` only when the problem, data, design route, and causal logic are coherent enough to support method work.
6. Activate only the production subskills relevant to the selected route and current job.
7. Review method fit, package fit, diagnostics, code, tables, figures, and claim strength through the production loop.
8. Open `production_gate` only when evidence is reportable, diagnostics are handled, and unresolved foundation rechecks are closed.
9. Hand off to Report Writer for final synthesis from recorded evidence, not for a new interaction cycle.

This gate principle keeps the YAML compact while still preserving the information needed for causal accountability.

The key foundation subskills are:

- `01-domain-helper`: translates the user's goal into domain-grounded causal formulations, measurement concerns, and practical constraints.
- `02-data-technician`: checks existing, partial, or conceptual data; audits constructability; and later rechecks production data or method-fit concerns.
- `03-design-planner`: compares feasible design routes, fallbacks, and next actions.
- `04-dag-builder`: audits causal logic, timing, identification, adjustment, and route-changing assumptions.

The production phase uses only the relevant method or job subskills for the selected route. These subskills contribute compact records under `subskill_analyses` rather than preloading every possible method. `20-report-writer` participates as a production reviewer when report materials need review, then becomes the final handoff skill only after `production_gate.status` is `ready`.

The result is a lean workflow that stays interactive while the user is still shaping the analysis, then becomes disciplined and non-interactive at handoff: the final report should summarize the problem, background, design logic, DAG reasoning, method and job analyses, diagnostics, figures, tables, conclusions, limitations, and cautions already collected during the foundation and production stages.
