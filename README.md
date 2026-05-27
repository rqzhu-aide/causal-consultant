# A Causal Consultant Skill

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)]() [![Status](https://img.shields.io/badge/status-under%20development-orange.svg)]()

*A Modular Consultant Team (MCT) skill for causal reasoning, data feasibility, analysis framework selection, diagnostics, interpretation, and report production.*

---

## What This Skill Is About

This is a causal inference consultant skill for agent systems that load a top-level `SKILL.md` and then selectively read supporting references, subskills, scripts, examples, schemas, and templates. It helps a user move from an informal causal question to a defensible causal specification, useful exploratory or diagnostic analysis, appropriate method/task specialist support, and a report or memo with clear claim boundaries.

Version 1.2.0 uses a Modular Consultant Team (MCT) architecture: a user-facing lead consultant coordinates four core team members, `domain_expert`, `data_analyst`, `method_lead`, and silent `report_writer`. The lead consultant keeps the conversation coherent, while the core team preserves domain meaning, data reality, causal validity, and reportability. Early exploration stays lightweight, `method_lead` maps plausible causal options before narrowing, and method/task subskills are used as bounded specialist modules only when they are useful. This version strengthens DAG artifact decisions, report inclusion of causal-structure artifacts, conditioning-risk checks, diagnostics visibility, and reproducibility expectations.

The skill keeps a compact project state with the user's goal, project phase, working facts, domain guidance, data properties, candidate frameworks, estimands, assumptions, diagnostics, limitations, recommended or activated subskills, and report materials. As new information appears, the workflow can recheck earlier decisions, revise the analysis framework, narrow the estimand, request a bounded data diagnostic, produce a qualified progress artifact, or explain why a causal claim is not yet supported.

It is for data scientists, analysts, researchers, domain experts, and applied teams who want a careful causal partner rather than a black-box method picker. It can support exploratory planning, data audit, design critique, causal-structure reasoning, method selection, causal discovery sidecar work, R/Python code examples, diagnostic review, result interpretation, and reproducible reporting.

The core safety rule is simple: causal language should never be stronger than the design, assumptions, data support, diagnostics, and sensitivity checks justify.

> I cannot give you a definitive answer, but I can help you explore.

---

## How To Activate

Say one of the following phrases in your request:

- "causal inference"
- "causal discovery"
- "policy effect estimation"
- "treatment decision making"
- "individualized treatment rules"
- "causal effect report"
- "causal analysis plan"
- "can we call this causal?"

---

## How To Use Or Install

### Quick Start

Give your AI agent this GitHub link:

```text
https://github.com/rqzhu-aide/causal-consultant
```

Then ask:

```text
Use this GitHub repo as a causal consultant skill. Start from SKILL.md.
```

That is enough for tools that can read GitHub repositories or use repository context.

### Detailed Setup

This repository is a skill package centered on [`SKILL.md`](SKILL.md). If your AI tool supports skills, install this repository as a skill. If it does not, give the tool the GitHub URL above and ask it to follow `SKILL.md`.

#### Cursor, Claude Code, And Similar Repo-Context Tools

Open this repository in your tool, or give the tool this GitHub URL:

```text
https://github.com/rqzhu-aide/causal-consultant
```

Then ask:

```text
Use this repository as a causal consultant skill. Read SKILL.md first, then load only the supporting files needed for my task.
```

#### Codex Skills

Windows PowerShell:

```powershell
py "$env:USERPROFILE\.codex\skills\.system\skill-installer\scripts\install-skill-from-github.py" `
  --repo rqzhu-aide/causal-consultant `
  --path . `
  --name causal-consultant
```

macOS or Linux:

```bash
python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo rqzhu-aide/causal-consultant \
  --path . \
  --name causal-consultant
```

After installation, restart your agent app if needed so it can discover the skill.

#### Other AI Coding Tools

Use the same pattern:

```text
Use https://github.com/rqzhu-aide/causal-consultant as a causal consultant skill. Read SKILL.md first.
```

For best results, make sure the tool can access the full repository, not just the README.

---

## Interactive Modular Consultant Team Architecture

For a standalone copy of this diagram, see [`assets/workflow-mermaid.md`](assets/workflow-mermaid.md).

```mermaid
flowchart TD
    user["User<br/>goal, data, preferences"]
    lead["Lead Consultant<br/>user-facing conversation<br/>synthesis and progression"]
    state["Project State YAML<br/>shared memory<br/>variable_roster, causal_structure<br/>subskill_records, artifacts, limits"]
    domain["domain_expert<br/>constructs and mechanisms<br/>common practice<br/>external validity"]
    data["data_analyst<br/>data reality<br/>constructability and timing<br/>analysis alignment<br/>diagnostics and artifacts"]
    method["method_lead<br/>causal question and estimands<br/>framework and assumptions<br/>method/subskill triage"]
    writer["report_writer<br/>silent notebook<br/>working report<br/>report integration"]
    discovery["06-causal-discovery<br/>graph/feature exploration<br/>advisory sidecar"]
    design["Design Route Subskills<br/>07-15<br/>design validity"]
    target["Target Goal Subskills<br/>20-25<br/>estimand/decision goals"]
    support["Implementation Support Subskills<br/>30-33<br/>estimation and diagnostics"]
    gates["Gates<br/>causal_gate<br/>production_gate"]

    classDef userNode fill:#f8fafc,stroke:#64748b,color:#0f172a
    classDef leadNode fill:#eef2ff,stroke:#4f46e5,color:#111827
    classDef stateNode fill:#f1f5f9,stroke:#475569,color:#0f172a
    classDef domainNode fill:#ecfdf5,stroke:#047857,color:#064e3b
    classDef dataNode fill:#eff6ff,stroke:#2563eb,color:#1e3a8a
    classDef methodNode fill:#fff7ed,stroke:#ea580c,color:#7c2d12
    classDef reportNode fill:#fff1f2,stroke:#e11d48,color:#881337
    classDef discoveryNode fill:#faf5ff,stroke:#7e22ce,color:#581c87
    classDef designNode fill:#ecfeff,stroke:#0891b2,color:#164e63
    classDef targetNode fill:#fefce8,stroke:#ca8a04,color:#713f12
    classDef supportNode fill:#f7fee7,stroke:#65a30d,color:#365314
    classDef gateNode fill:#fef2f2,stroke:#dc2626,color:#7f1d1d

    class user userNode
    class lead leadNode
    class state stateNode
    class domain domainNode
    class data dataNode
    class method methodNode
    class writer reportNode
    class discovery discoveryNode
    class design designNode
    class target targetNode
    class support supportNode
    class gates gateNode

    user --> lead
    lead --> state
    state --> lead

    lead --> domain
    domain --> state
    lead --> data
    data --> state
    lead --> method
    method --> state
    lead --> writer
    writer --> state

    domain --> data
    domain --> method
    data --> method
    method --> data

    method -. selects .-> design
    method -. selects .-> target
    method -. selects .-> support
    lead -. invokes selected .-> design
    lead -. invokes selected .-> target
    lead -. invokes selected .-> support
    design -. record and recheck signal .-> state
    target -. record and recheck signal .-> state
    support -. record and recheck signal .-> state
    data -. data evidence .-> support
    support -. data or diagnostic request .-> data
    design -. report support .-> writer
    target -. report support .-> writer
    support -. report support .-> writer

    lead -. any phase .-> discovery
    discovery -. advisory output .-> domain
    discovery -. advisory output .-> data
    discovery -. advisory output .-> method
    discovery -. report material .-> writer

    state --> gates
    gates --> lead
    writer --> lead
    lead --> user
```

Colors distinguish the lead/state layer, each core member, causal discovery, method/task specialist pools, and gates. This Modular Consultant Team (MCT) workflow is interactive because it treats causal work as an adaptive conversation rather than a one-shot method checklist. The user, available data, durable artifacts, and current project YAML provide observations. The lead consultant reads those observations, coordinates the core team, chooses the next useful internal step, and speaks back to the user in plain language without exposing backend YAML mechanics.

The top-level `SKILL.md` is intentionally frontstage and short. It defines the lead consultant's user-facing behavior, team boundaries, working phases, and backend reference map. Detailed operating logic lives in:

- `references/backend_workflow.md`
- `references/yaml_management.md`
- `references/team_coordination.md`
- `references/subskill_coordination.md`
- `references/conversation_boundary.md`

The MCT structure has four core members and one sidecar:

- **`domain_expert` (`01-domain-expert`)** preserves domain meaning: constructs, mechanisms, temporal order, measurement standards, common practice, external validity, and wording cautions.
- **`data_analyst` (`02-data-analyst`)** evaluates data reality: available sources, row and analysis units, timing, variable construction, missingness/selection, support, analysis alignment between claim needs and data support, exploratory outputs, reproducible artifacts, and data-evidence handoffs.
- **`method_lead` (`03-method-lead`)** owns causal-method judgment: causal questions, framework candidates, selected framework, estimand set, assumptions, causal structure, diagnostics, sensitivity, method literature, and method/task subskill triage.
- **`report_writer` (`05-report-writer`)** is silent. It keeps a polished project notebook and working report from early durable content through production reporting, owner-review routing, and same-evidence revisions.
- **`06-causal-discovery`** is an any-phase sidecar for exploratory graph learning, graph comparison, variable screening, constructed-feature ideas, and discovery-only deliverables. Its outputs remain advisory until reviewed through the relevant core team logic.

Three working phases organize the interaction:

1. **`project_exploration`**: learn the user's goal, domain setting, data reality, feasibility, and possible candidate frameworks. Exploratory, descriptive, diagnostic, and design-learning work can happen here when data are provided.
2. **`causal_specification`**: settle and stress-test the causal claim, estimand set, framework, causal structure, assumptions, diagnostics, sensitivity plan, data feasibility, and wording boundary.
3. **`report_production`**: draft, diagnose, owner-review, revise, improve, and deliver the report or other user-facing artifact. The project stays in this phase for report revisions unless new evidence changes the causal claim, estimand set, assumptions, framework, or core design logic.

Two gates control claim readiness:

- **`causal_gate`** decides whether the causal claim, framework, assumptions, and wording boundary are ready enough for reportable use.
- **`production_gate`** decides whether evidence, diagnostics, provenance, materials, and owner-review feedback are ready enough for a polished deliverable.

The gates do not forbid progress. If work is blocked or incomplete, the team can still produce exploratory analysis, prototype code, diagnostics, or limitation-forward reports, but those artifacts must visibly carry the appropriate caveats and claim-strength limits.

With this structure in place, the practical loop is:

1. Update the compact project state from the user's latest turn.
2. Let `domain_expert`, `data_analyst`, and `method_lead` review in the default order.
3. Refresh `data_analyst.analysis_alignment` when data, claims, framework requirements, diagnostics, or report targets change, then let `method_lead` consume it before method selection or claim wording.
4. Allow one bounded adaptive follow-up pass only when a reviewer update would clearly improve the next user-facing move.
5. If `method_lead` selects a bounded method/task specialist, let the lead consultant invoke it and record its returned packet in `subskill_records`.
6. Let `report_writer` update the working notebook/report when there is substantive content to preserve or a specialist returns report support.
7. Before polished/final report delivery, route drafted sections to the owning reviewers: data evidence to `data_analyst`, causal/statistical claims to `method_lead`, domain interpretation to `domain_expert`, and activated modules to their method/task subskills.
8. Update gates, limitations, agenda, and next action.
9. Return to the user with one clear practical move: a question, explanation, proposed analysis, method choice, artifact, or revision.

This keeps the interaction collaborative instead of over-automated. The team does enough internal work to be useful, then returns to the user when a clarification, permission, preference, or review would improve the next step.

Method/task subskills are organized into three specialist pools:

- **Design routes (`07`-`15`)**: randomized assignment, observational exposure, longitudinal g-methods, DiD/event study, RD, IV/MR, synthetic control/time series, interference/spillovers, and negative controls/proximal methods.
- **Target goals (`20`-`25`)**: heterogeneous effects, point treatment rules, mediation, dose-response effects, transportability/generalizability, and dynamic treatment policies.
- **Implementation support (`30`-`33`)**: matching/weighting/balance, doubly robust estimation, Double Machine Learning, and survival/competing risks.

The helper `scripts/recommend_subskills.py` provides advisory recall for specialist modules, but it is not a router or judge. `method_lead` makes the causal-method decision after reading `domain_expert`, `data_analyst.analysis_alignment`, `data_analyst.method_support`, project state, and any relevant `subskill_records`; the lead consultant invokes selected specialists and records their returned packets.

The durable state model lives in `assets/causal_project_spec_template.yaml`; controlled values live in `assets/workflow_enums.yaml`; activated method/task subskills use `assets/method_job_subskill_record_template.yaml`. Validation scripts are provided in `scripts/`.

The result is a lean MCT workflow that stays conversational during exploration, becomes disciplined during causal specification, and remains report-focused through production and revision without treating internal machinery as user-facing content.
