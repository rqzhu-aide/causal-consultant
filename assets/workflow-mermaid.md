# Causal Consultant Workflow Diagram

This diagram is a visual map of the workflow. The source of truth is the main `SKILL.md`, the subskill `SKILL.md` files, and the lean `project.yaml` contract.

```mermaid
flowchart TB
    U["User goal / data / constraints"]
    M["Main Skill<br/>conversation, routing, state updates"]
    Y["project.yaml<br/>lean coordination state"]

    U --> M
    M <--> Y
    M -.-> CD["18 Causal Discovery<br/>any-phase sidecar<br/>exploratory graph support"]
    CD -.-> Y
    CD -.->|"discovery-only report"| DRW["20 Report Writer<br/>discovery report mode"]

    M --> FSEL["Select foundation reviewers"]

    subgraph F["Foundation Review Loop"]
        direction TB
        DH["01 Domain Helper"]
        DT["02 Data Technician"]
        DP["03 Design Planner"]
        DAG["04 DAG Builder"]
    end

    FSEL --> F
    F --> FS["Foundation signals<br/>assumptions, blockers,<br/>route and DAG feedback"]
    FS --> M

    M --> FG{"Foundation Gate<br/>ready?"}
    FG -->|"No"| M
    FG -->|"Yes"| PC["Plan Confirmation<br/>estimand, treatment, outcome,<br/>unit/time, diagnostics,<br/>claim strength"]

    PC --> PA["Production Analysis Loop"]
    PA --> PSEL["Select production reviewers"]

    subgraph P["Production Reviewers"]
        direction TB
        MJ["Method/job subskills<br/>05-17, 19, 21"]
        DT2["02 Data Technician<br/>production review"]
        RW2["20 Report Writer<br/>production review"]
    end

    PSEL --> P
    P --> PS["Production signals<br/>route fit, diagnostics,<br/>artifacts, limitations,<br/>foundation recheck signals"]
    PS --> PA

    PA --> FR{"Foundation<br/>recheck needed?"}
    FR -->|"Yes"| M
    FR -->|"No"| PG{"Production Gate<br/>ready?"}

    PG -->|"No"| PA
    PG -->|"Yes"| RW["20 Report Writer<br/>final synthesis"]

    RW --> D["Post-delivery checkpoint<br/>report, memo, slides,<br/>or artifacts delivered"]
    DRW -.-> D
    D -->|"ask_user continuation"| M

    classDef user fill:#E3F2FD,stroke:#1565C0,color:#0D47A1,stroke-width:2px;
    classDef gate fill:#FFF3E0,stroke:#EF6C00,color:#5D3000,stroke-width:2px;
    classDef keyskill fill:#E8F5E9,stroke:#2E7D32,color:#143D1B,stroke-width:2px;
    classDef sidecar fill:#E0F7FA,stroke:#00838F,color:#00363A,stroke-width:3px,stroke-dasharray: 6 3;
    classDef method fill:#ECEFF1,stroke:#546E7A,color:#263238,stroke-width:2px;
    classDef report fill:#FCE4EC,stroke:#C2185B,color:#5C1230,stroke-width:2px;
    classDef state fill:#F5F5F5,stroke:#757575,color:#212121,stroke-width:1px;

    class U,D user;
    class FG,FR,PG gate;
    class M,DH,DT,DP,DAG,DT2,FSEL,FS,PC,PA,PSEL,PS keyskill;
    class CD sidecar;
    class MJ method;
    class RW2,RW,DRW report;
    class Y state;
```

## Key Design Principles

1. **Main skill owns both gates** - Foundation evaluator and production reviewer readiness values are signals, not automatic gate openers.
2. **Foundation evaluators are transitional kernel functions** - Domain, Data Technician, design, and DAG subskills update only their lean evaluator records and provide handoff notes to the main skill before `foundation_gate`.
3. **Production reviewers make materials real** - Method/job subskills, Data Technician, and Report Writer can be selected in `analysis.production_loop` after `foundation_gate` opens.
4. **Production work has its own review loop** - `analysis.production_loop` records selected reviewers, review purpose, what has been done, remaining checks, diagnostics readiness, polishing needs, loop control, and the next action.
5. **Production can return to foundation** - Severe production findings can trigger `analysis.production_loop.foundation_recheck` and `return_to_foundation`.
6. **Causal Discovery is a sidecar** - `18-causal-discovery` can be activated at any phase for exploratory graph support, with only a small `analysis.discovery_sidecar` breadcrumb and artifact links unless its findings are routed back through the main workflow.
7. **Report Writer has a narrow discovery exception** - `20-report-writer` may advise during production, takes over effect-report synthesis only after `production_gate.status: ready`, and can separately synthesize exploratory discovery-only reports when effect-estimation gates are `not needed`.
8. **Data Technician informs method fit** - Method suggestions should reflect the current design, DAG, observed data structure, feasible diagnostics, and package constraints.
9. **Package lists are candidate maps** - A package is appropriate only if the method stack confirms it supports the estimand, data structure, diagnostics, and uncertainty needs.
10. **User-directed progress is allowed but labeled** - The user can force workflow pace, not unqualified causal validity.
11. **Interactive checkpoints prevent runaway execution** - Foundation-ready routes require brief plan confirmation, first-pass results should lead to diagnostics or sensitivity decisions, production-loop review gates effect-report handoff, discovery-only reports stay exploratory, and delivered artifacts move to `post_delivery` for a continuation question.
12. **Loop control prevents circular evaluation** - Repeated unresolved blockers trigger a main-skill loop-break action.
13. **Detailed work leaves the shared YAML** - Full audits, code, diagnostics, DAGs, reports, and route memos belong in `analyses/` or `artifacts/`, with compact summaries in `project.yaml`.
