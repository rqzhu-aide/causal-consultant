# Causal-Skills Workflow Diagram

This diagram shows the intended interaction loop from initial user need to defensible causal analysis.

```mermaid
flowchart TB
    U["User question or dataset"] --> M["Main causal skill<br/>user-facing conversation"]
    M --> F["Concurrent backend records<br/>01 domain, 02 data, 03 design, 04 DAG/causal logic"]
    F --> H{"Existing user data?"}
    H -->|No or conceptual| PD["01 domain support + 03 design planning + 02 conceptual schema<br/>target trial, route options, data requirements"]
    PD --> R["Route shortlist<br/>1-3 possible design families"]
    H -->|Yes or partial| DS["01 domain support + 02 data inspection + 03 design audit<br/>rows, units, timing, assignment, variables"]
    DS --> R["Route shortlist<br/>1-3 possible design families"]
    R --> C["04 causal-logic gate<br/>DAG/target trial, assumptions, identification"]
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
    ITER -->|Revise estimand/model/data processing| R
    ITER -->|Ready| REP["Report, interpretation, limitations, reproducibility"]
```

## Key Design Principles

1. **Need-aware interaction** - Start from the user's requested deliverable, not a fixed questionnaire.
2. **Concurrent foundation records** - Keep the main skill, domain support, data inspection, design planning, and DAG/causal logic active together.
3. **Data and design before method** - Identify rows, units, timing, assignment, and variable roles before choosing methods.
4. **Design frames routing; causal logic checks it** - Use the design record for high-level feasible routes, then use the DAG/target-trial record for identification, adjustment, and method-selection implications.
5. **Tool fit, data suitability, and causal validity together** - Use packages only when their assumptions and outputs match the planned causal claim.
6. **Iterative refinement** - Use diagnostics and user feedback to revise the estimand, route, model, or interpretation.
