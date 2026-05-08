# Causal-Skills Workflow Diagram

This diagram is a visual map of the workflow. The source of truth is the main `SKILL.md`, the subskill `SKILL.md` files, and the lean `project.yaml` contract.

```mermaid
flowchart TB
    U["User question, goal, or dataset"] --> M["Main causal skill<br/>policy actor and user-facing conversation"]
    M --> Y["Lean project.yaml<br/>main_skill, foundation_gate, evaluator_loop, routes, analysis"]

    Y --> E["Foundation evaluator loop<br/>01 domain, 02 data, 03 design, 04 DAG"]
    E --> S["Evaluator signals<br/>summaries, implications, requests, assumptions, blockers"]
    S --> M
    E --> I["Innovation seeds<br/>candidate formulations, data opportunities,<br/>route hypotheses, causal-logic hypotheses"]
    I --> M

    M --> A{"Main skill selected action"}
    A -->|"ask / inspect / search / refresh"| E
    A -->|"loop detected"| LB["Loop break<br/>decisive question, labeled assumption, surface assumption, block, fallback, or user-directed"]
    LB --> M

    M --> RT["Promote, defer, revise, or reject routes<br/>routes.current_route_id and routes.hypotheses"]
    RT --> G{"Main skill gate decision"}
    G -->|"not ready / blocked"| ALT["Revise route, ask user, collect data, refresh evaluator,<br/>choose fallback, or continue user-directed with caveats"]
    ALT --> M
    G -->|"ready or user-directed"| R["Selected route handoff<br/>route_id, estimand, data status, assumptions, limitations, software preference"]

    R --> MS["Compose method stack<br/>primary route + optional support/target/reporting modules"]
    MS --> PF{"Route fit and package/code fit pass?"}
    PF -->|"no"| FB["Method feedback to main skill<br/>failed condition, owner of fix, recommended next action"]
    FB --> M
    PF -->|"yes"| PLAN["Analysis plan<br/>estimator, diagnostics, sensitivity, fallback"]
    PLAN --> CODE["Code/package workflow<br/>R, Python, Stata, or documented manual workflow"]
    CODE --> RES["Results, diagnostics, limitations"]
    RES --> OK{"Interpretation ready?"}
    OK -->|"revise route/model/data processing"| M
    OK -->|"yes"| REP["Reporting subskill<br/>interpretation, limitations, reproducibility"]
```

## Key Design Principles

1. **Main skill owns policy and gate decisions** - Foundation evaluator readiness values are signals, not automatic gate openers.
2. **Foundation evaluators maintain state** - Domain, data, design, and DAG subskills update only their lean evaluator records and provide implications to the main skill.
3. **Method subskills have roles** - Primary route subskills check design families, support modules add estimators/diagnostics, target modules change the estimand target, discovery modules explore graphs, and reporting modules communicate results.
4. **Package lists are candidate maps** - A package is appropriate only if the method stack confirms it supports the estimand, data structure, diagnostics, and uncertainty needs.
5. **User-directed progress is allowed but labeled** - The user can force workflow pace, not unqualified causal validity.
6. **Loop control prevents circular evaluation** - Repeated unresolved blockers trigger a main-skill loop-break action.
7. **Detailed work leaves the shared YAML** - Full audits, code, diagnostics, DAGs, reports, and route memos belong in `analyses/` or `artifacts/`, with compact summaries in `project.yaml`.
