# Causal-Skills Workflow Diagram

This diagram shows the intended interaction loop from initial user need to defensible causal analysis.

```mermaid
flowchart TB
    U["User question or dataset"] --> M["Select interaction mode"]
    M --> I["Need, data, and question triage"]
    I --> H{"Existing data?"}
    H -->|No| PD["Prospective design planning<br/>target trial, route options, data schema"]
    PD --> R["Route shortlist<br/>1-3 possible design families"]
    H -->|Yes| DS["Data structure audit<br/>rows, units, timing, assignment, variables"]
    DS --> R["Route shortlist<br/>1-3 possible design families"]
    R --> C["Condition checks<br/>known, checkable, unresolved, violated"]
    C --> D{"Enough support for a causal route?"}
    D -->|No| ALT["Recommend descriptive, predictive, sensitivity, or data collection next step"]
    D -->|Yes| G["DAG, design diagram, or variable-role map"]
    G --> E["Estimand and identification statement"]
    E --> S["Activate method subskills"]
    S --> P["Analysis plan<br/>primary route, fallback route, diagnostics"]
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
4. **Causal structure before code** - Use a DAG, design diagram, or variable-role map to specify the estimand and assumptions.
5. **Package-aware but design-led** - Adapt data to packages only when the transformation is scientifically meaningful and documented.
6. **Iterative refinement** - Use diagnostics and user feedback to revise the estimand, route, model, or interpretation.
