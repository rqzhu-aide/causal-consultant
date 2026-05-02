# Causal-Skills Workflow Diagram

This diagram shows the intended interaction loop from initial user need to defensible causal analysis.

```mermaid
flowchart TB
    U["User question or dataset"] --> M["Select interaction mode"]
    M --> I["Need, data, and question triage"]
    I --> H{"Existing data?"}
    H -->|No| PD["Activate 18 prospective design planning<br/>target trial, route options, data schema"]
    PD --> R["Route shortlist<br/>1-3 possible design families"]
    H -->|Yes| DS["Data structure audit<br/>rows, units, timing, assignment, variables"]
    DS --> R["Route shortlist<br/>1-3 possible design families"]
    R --> C["Feasibility checks<br/>conditions, lightweight causal structure, route assumptions"]
    C --> D{"Enough support for a causal route?"}
    D -->|No| ALT["Recommend descriptive, predictive, sensitivity, or data collection next step"]
    D -->|Yes| S["Activate candidate subskill(s)"]
    S --> E["Subskill activation<br/>estimand determination and route-specific audit"]
    E --> SD{"Selected route still supported?"}
    SD -->|No| RO["Record rejected, fallback, or exploratory/user-forced status<br/>then return to route shortlist"]
    RO --> R
    SD -->|Yes| P["Analysis plan<br/>primary route, fallback route, diagnostics"]
    P --> CODE["R/Python code or package workflow"]
    CODE --> RES["Results and diagnostics"]
    RES --> ITER{"Revise?"}
    ITER -->|Revise estimand/model/data processing| I
    ITER -->|Ready| REP["Report, interpretation, limitations, reproducibility"]
```

## Key Design Principles

1. **Need-aware interaction** - Start from the user's requested deliverable, not a fixed questionnaire.
2. **Data-structure-first routing** - Identify rows, units, timing, assignment, and variable roles before choosing methods.
3. **Route narrowing** - Compare a small set of plausible design families by their required conditions.
4. **Causal structure before code** - Use a DAG, design diagram, assignment summary, or variable-role map when it helps define the route, estimand, or assumptions.
5. **Tool fit, data suitability, and causal validity together** - Use packages only when their assumptions and outputs match the planned causal claim.
6. **Iterative refinement** - Use diagnostics and user feedback to revise the estimand, route, model, or interpretation.
