# Causal Consultant V2 Workflow

```mermaid
flowchart TD
    user["User<br/>goal, data, preferences"]
    lead["Lead Consultant<br/>user-facing conversation<br/>synthesis and progression"]
    state["Project State YAML<br/>shared memory<br/>variable_roster, causal_structure<br/>subskill_records, artifacts, limits"]
    domain["domain_expert<br/>constructs and mechanisms<br/>common practice<br/>external validity"]
    data["data_analyst<br/>data reality<br/>constructability and timing<br/>diagnostics and artifacts"]
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

Colors distinguish the lead/state layer, each core member, causal discovery, method/task specialist pools, and gates. The lead consultant is the only user-facing node. Core reviewers update their own areas of project state. `method_lead` selects bounded specialist modules, the lead consultant invokes them, and returned packets are recorded in `subskill_records`. Method/task subskills provide route, target, implementation, diagnostic, or report-support guidance but do not own gates or speak to the user.
