# Causal Consultant Workflow Diagram

This diagram is a visual map of the workflow. The source of truth is the main `SKILL.md`, the subskill `SKILL.md` files, and the lean `project.yaml` contract.

```mermaid
flowchart TB
    U["User question, goal, or dataset"] --> M["Main causal skill<br/>policy actor and user-facing conversation"]
    M --> Y["Lean project.yaml<br/>main_skill, foundation_gate, production_gate,<br/>evaluator_loop, routes, analysis"]

    Y --> E["Foundation evaluator loop<br/>01 domain, 02 Data Technician, 03 design, 04 DAG"]
    E --> S["Evaluator signals<br/>summaries, handoff notes, requests, assumptions, blockers"]
    S --> M
    E --> I["Innovation seeds<br/>candidate formulations, data opportunities,<br/>method-fit suggestions, route hypotheses,<br/>causal-logic hypotheses"]
    I --> M

    M --> A{"Main skill selected action"}
    A -->|"ask / inspect / search / refresh"| E
    A -->|"loop detected"| LB["Loop break<br/>decisive question, labeled assumption, surface assumption, block, fallback, or user-directed"]
    LB --> M

    M --> RT["Promote, defer, revise, or reject routes<br/>routes.current_route_id and routes.hypotheses"]
    RT --> G{"Foundation gate decision"}
    G -->|"not ready / blocked"| ALT["Revise route, ask user, collect data, refresh evaluator,<br/>choose fallback, or continue user-directed with caveats"]
    ALT --> M
    G -->|"foundation ready"| C["User confirmation checkpoint<br/>planned treatment, outcome, unit/time,<br/>method family, diagnostics, claim strength"]
    C --> R["Selected route handoff<br/>route_id, estimand, data status, assumptions, limitations, software preference"]

    R --> MS["Compose method stack<br/>primary route + optional support/target modules"]
    MS --> ML["Production loop<br/>selected method/job reviewers,<br/>Causal Discovery when graph support is needed,<br/>Data Technician and Report Writer when useful"]
    ML --> PF{"Route fit and package/code fit pass?"}
    PF -->|"no"| FB["Method feedback to main skill<br/>failed condition, owner of fix, recommended next action"]
    FB --> M
    FB -->|"severe foundation flaw"| REG["foundation_recheck<br/>return_to_foundation"]
    REG --> E
    PF -->|"yes"| PLAN["Confirmed analysis plan<br/>estimator, diagnostics, sensitivity, fallback"]
    PLAN --> CODE["First-pass code/package workflow<br/>R, Python, Stata, or documented manual workflow"]
    CODE --> RES["First-pass results<br/>preliminary interpretation and recommended checks"]
    RES --> ML2["Refresh production loop<br/>what was done, diagnostics, failures,<br/>remaining checks, next action"]
    ML2 --> DIAG["Diagnostics and sensitivity<br/>run, defer with reason, or revise"]
    DIAG --> ML3["Production-loop report-readiness review<br/>materials, diagnostics, limitations,<br/>presentation, handoff summary"]
    ML3 --> OK{"Production gate ready?"}
    OK -->|"revise route/model/data processing"| M
    OK -->|"foundation recheck needed"| REG
    OK -->|"yes"| PG["production_gate.status: ready"]
    PG --> REP["20 Report Writer handoff<br/>final synthesis from collected evidence,<br/>diagnostics, figures, tables, limitations"]
```

## Key Design Principles

1. **Main skill owns both gates** - Foundation evaluator and production reviewer readiness values are signals, not automatic gate openers.
2. **Foundation evaluators are transitional kernel functions** - Domain, Data Technician, design, and DAG subskills update only their lean evaluator records and provide handoff notes to the main skill before `foundation_gate`.
3. **Production reviewers make materials real** - Method/job subskills, Data Technician, Causal Discovery for graph support, and Report Writer can be selected in `analysis.production_loop` after `foundation_gate` opens.
4. **Production work has its own review loop** - `analysis.production_loop` records selected reviewers, review purpose, what has been done, remaining checks, diagnostics readiness, polishing needs, loop control, and the next action.
5. **Production can return to foundation** - Severe production findings can trigger `analysis.production_loop.foundation_recheck` and `return_to_foundation`.
6. **Method/job and discovery YAML is append-only when activated** - Use `assets/method_job_subskill_record_template.yaml` for compact `subskill_analyses` records; do not pre-create blank method/job or discovery sections.
7. **Report Writer handoff is after production gate** - `20-report-writer` may advise during production, but only takes over final report synthesis after `production_gate.status: ready`; handoff uses recorded foundation and production evidence rather than starting another interaction loop.
8. **Data Technician informs method fit** - Method suggestions should reflect the current design, DAG, observed data structure, feasible diagnostics, and package constraints.
9. **Package lists are candidate maps** - A package is appropriate only if the method stack confirms it supports the estimand, data structure, diagnostics, and uncertainty needs.
10. **User-directed progress is allowed but labeled** - The user can force workflow pace, not unqualified causal validity.
11. **Interactive checkpoints prevent runaway execution** - Foundation-ready routes require brief plan confirmation, first-pass results should lead to diagnostics or sensitivity decisions, production-loop review gates report handoff, and final reports are owned by Report Writer after production gate.
12. **Loop control prevents circular evaluation** - Repeated unresolved blockers trigger a main-skill loop-break action.
13. **Detailed work leaves the shared YAML** - Full audits, code, diagnostics, DAGs, reports, and route memos belong in `analyses/` or `artifacts/`, with compact summaries in `project.yaml`.
