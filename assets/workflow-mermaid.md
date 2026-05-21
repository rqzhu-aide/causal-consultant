# Causal Consultant V2 Workflow

```mermaid
flowchart TD
    user["User<br/>goal, data, preferences"]
    lead["Lead Consultant<br/>user-facing conversation<br/>synthesis and progression"]
    state["Project State YAML<br/>shared memory<br/>facts, artifacts, limitations"]
    domain["domain_expert<br/>constructs and mechanisms<br/>common practice<br/>external validity"]
    data["data_analyst<br/>data reality<br/>constructability and timing<br/>diagnostics and artifacts"]
    method["method_lead<br/>causal question and estimands<br/>framework and assumptions<br/>method/subskill triage"]
    writer["report_writer<br/>silent notebook<br/>working report<br/>report integration"]
    discovery["06-causal-discovery<br/>graph/feature exploration<br/>advisory sidecar"]
    design["Design Route Subskills<br/>07-15<br/>design validity"]
    target["Target Goal Subskills<br/>20-25<br/>estimand/decision goals"]
    support["Implementation Support Subskills<br/>30-33<br/>estimation and diagnostics"]
    gates["Gates<br/>causal_gate<br/>production_gate"]

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

    method --> design
    design --> method
    method --> target
    target --> method
    method --> support
    data --> support
    support --> method
    support --> data

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

The lead consultant is the only user-facing node. Core reviewers update their own areas of project state. Method/task subskills are specialist modules: they provide route, target, implementation, diagnostic, or report-support guidance but do not own gates or speak to the user.
