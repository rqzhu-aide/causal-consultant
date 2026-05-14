# A Causal Consultant Skill

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![Version](https://img.shields.io/badge/version-0.2.1-blue.svg)]() [![Status](https://img.shields.io/badge/status-under%20development-orange.svg)]()

*An interactive, mini-MOE-style skill for consulting in causal reasoning, discovery, design, analysis, and reporting.*

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

## Interactive mini-MOE Architecture

For a visual map, see the rendered Mermaid workflow diagram in [`assets/workflow-mermaid.md`](assets/workflow-mermaid.md).

This workflow is interactive because it treats causal work as an adaptive conversation rather than a one-shot checklist. The user, available data, and current `project.yaml` state provide observations. The main skill reads those observations, chooses the next useful action, asks only for information that can change the decision, activates the relevant expert skill, and then updates the shared state before speaking back to the user.

The mini-MOE structure is a small mixture of specialized causal experts coordinated by one user-facing router. The main skill is the router, state manager, and gatekeeper. It does not try to be every method manual at once. Instead, it selects the smallest useful expert set for the current turn, receives compact signals from those experts, resolves conflicts, and keeps the conversation coherent.

The expert set has four main parts:

- **Foundation experts:** `01-domain-helper`, `02-data-technician`, `03-design-planner`, and `04-dag-builder` evaluate the causal question, data constructability, design route, and DAG logic before the foundation gate.
- **Method/job experts:** route-specific subskills such as randomized experiments, observational treatment analysis, DiD, RD, IV, longitudinal methods, mediation, interference, genomics, and negative controls review or execute production work only when relevant.
- **Causal discovery:** `18-causal-discovery` is an any-phase sidecar for graph discovery, graph comparison, variable screening, structure-learning diagnostics, or discovery-only deliverables. Its outputs remain exploratory by default and can add artifacts, feature suggestions, report appendix material, or a discovery-only report without changing gates, routes, adjustment choices, or claim strength.
- **Report Writer:** `20-report-writer` can review reportability during production, becomes the effect-report synthesis expert after `production_gate.status` is `ready`, and can separately write exploratory discovery-only reports when effect-estimation gates are `not needed`.

Discovery sidecar work is designed to stay out of the main gate flow unless the main skill deliberately routes a finding back through an existing owner such as Data Technician, Design Planner, DAG Builder, or Report Writer. When the user asks for a causal-discovery-only deliverable, Report Writer can synthesize an exploratory discovery report from the graph artifacts and diagnostics without treating learned graph structure as causal proof or effect-estimation evidence.

Two gates organize the interactive loop. `foundation_gate` decides whether the causal question, data context, design route, and DAG logic are coherent enough to begin method production. `production_gate` decides whether the completed analysis evidence, diagnostics, outputs, limitations, and handoff summary are ready for final reporting. Relevant experts use the same blocking language so the main skill can arbitrate rather than merge many incompatible statuses.

With those gates in place, the practical loop is step by step:

1. Clarify the user's causal question in domain language.
2. Record the current data context, including whether data exist, partially exist, or are only conceptual.
3. Propose and compare a small set of plausible design routes.
4. Use DAG and causal-logic review to test timing, variable roles, identification, and adjustment logic.
5. Open `foundation_gate` only when the problem, data, design route, and causal logic are coherent enough to support method work.
6. Activate only the production subskills relevant to the selected route and current job.
7. Review method fit, package fit, diagnostics, code, tables, figures, and claim strength through the production loop.
8. Open `production_gate` only when evidence is reportable, diagnostics are handled, and unresolved foundation rechecks are closed.
9. For effect-estimation reports, hand off to Report Writer for final synthesis from recorded evidence, not for a new interaction cycle. For discovery-only reports, use Report Writer's exploratory discovery mode without opening effect-estimation gates.
10. After delivery, return to `post_delivery` and let the main skill ask a context-aware continuation question rather than ending the conversation.

This gate principle keeps the YAML compact while still preserving the information needed for causal accountability.

Within the foundation expert group, each specialist owns a different part of the pre-gate review:

- `01-domain-helper`: translates the user's goal into domain-grounded causal formulations, measurement concerns, and practical constraints.
- `02-data-technician`: checks accessible existing or partial data, labels conceptual or user-described data as unverified, audits constructability, and later rechecks production data or method-fit concerns.
- `03-design-planner`: compares feasible design routes, fallbacks, and next actions.
- `04-dag-builder`: audits causal logic, timing, identification, adjustment, and route-changing assumptions.

The production phase uses only the relevant method or job subskills for the selected route. These subskills contribute compact records under `subskill_analyses` rather than preloading every possible method. `20-report-writer` participates as a production reviewer when report materials need review, becomes the final effect-report handoff skill only after `production_gate.status` is `ready`, and handles discovery-only reports through its separate exploratory mode.

The result is a lean workflow that stays interactive while the user is shaping the analysis, becomes disciplined during report handoff, and then returns to the main skill in `post_delivery` for a context-aware continuation question. The final report should summarize the problem, background, design logic, DAG reasoning, method and job analyses, diagnostics, figures, tables, conclusions, limitations, and cautions already collected during the foundation and production stages.
