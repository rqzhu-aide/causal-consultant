# Workflow: Data Inspection

## Goal

Use this workflow before choosing or fitting a causal model, and whenever the project needs a data reality check. The Data Technician asks: given the domain facts, envisioned design, and DAG/assumption needs, what does the data actually contain, what can it support, and which method families are technically feasible?

In the main-skill architecture, this workflow is the backend data-expert, method-feasibility evaluator, and production data reviewer. The main skill usually speaks with the user and selects next actions. Before the foundation gate is ready, this workflow updates `project.yaml > evaluators.data_technician_02`; after the foundation gate is ready, production review belongs in `analysis.production_loop.reviewer_summaries` unless a finding changes foundation data support.

Start each evaluator pass by reading `evaluator_loop` and the current `evaluators.*` records. The trigger, selected next action, action queue, evaluator readiness values, handoff notes, requests, and loop-control state tell the Data Technician whether this is a broad audit, a targeted check, route-commitment review, method-fit review, user-directed support, or a loop-breaking pass. Answer that selected action first before adding broader observations.

This workflow centers on:

- data existence and evidence basis: actual, partial, conceptual, or unknown;
- data inventory: rows, columns, files, tables, source systems, queries/views, codebooks, IDs, time variables, linkage keys, groups, records, and data shape;
- data-to-domain fit: whether fields represent the domain objects, terms, measurements, and codes described by `01`;
- data-to-design fit: whether the data can construct the population, treatment/exposure, comparator, time zero, follow-up, outcomes, clusters, pre-periods, or network links envisioned by `03`;
- data-to-DAG fit: whether variables and timing needed by `04` are observable, missing, late, ambiguous, or leakage-prone;
- quality and readiness: missingness, outliers, duplicates, support, sparsity, dimensionality, and reproducible preprocessing needs;
- data-enabled opportunities: alternate units, time-zero definitions, exposure windows, linkages, reshapes, proxy outcomes, or natural-experiment signals to route back to the foundation team.

## Phase Boundary

Use the same data-review toolkit in both phases, but keep readiness labels separate.

- Foundation mode answers whether the data can support the route, design, DAG timing, method-family feasibility, and foundation-gate commitment. It writes `evaluators.data_technician_02`.
- Production mode answers whether a specific production block, such as preprocessing, diagnostics, artifacts, package feasibility, or reproducibility, can move forward. It writes a reviewer summary with `reviewer_id: "02-data-technician"`, `phase_context: "production"`, `production_readiness`, `foundation_readiness_effect`, and the shared `blocking_signal` object when something blocks the current phase or requires foundation recheck.

Set `foundation_readiness_effect: recheck_needed` only when production reveals a data fact that may invalidate the approved foundation route. Otherwise use `unchanged`, `narrowed`, or `unknown`; use `blocking_signal.blocks_current_phase: true` for production-only blockage.

## Coordination With Other Foundation Components

- Use `main_skill` for the user goal, requested deliverable, and what needs to be explained plainly.
- Use `evaluator_loop` for the main skill's selected action, active queue, and loop-control state.
- Use `01-domain-helper` to check how domain terms, field norms, measurement practices, and privacy/access constraints appear in the data.
- Use `03-design-planner` to check whether actual or conceptual data support the envisioned design components.
- Use `04-dag-builder` to check timing evidence, candidate variables for DAG review, unavailable variables, and leakage-prone or late-measured variables.
- Do not let data shape alone choose the final method. Data inspector reports what the data can support, cannot support, or newly suggest; design and DAG records decide what that means for route validity.

## Intake Checklist

- What data evidence exists: file, table, codebook, column list, sample rows, summary table, study plan, or user description?
- What does one row represent, and does that match the intended analysis unit?
- What files/tables contain IDs, dates, treatment/exposure, outcomes, eligibility, follow-up, groups/clusters, or repeated records?
- Are there multiple tables, linkage keys, database queries, source-system views, nested records, logs, text/list fields, survey weights, geospatial fields, or scale limits that change what is observable?
- Which domain terms have obvious data fields, proxy fields, ambiguous fields, or no fields?
- Can the data construct treatment/exposure, comparator, time zero, follow-up, and outcome windows?
- Are proposed baseline variables measured before treatment or time zero?
- Are there unit IDs, group IDs, time variables, visit numbers, adoption dates, event dates, or censoring indicators?
- Are there enough units, treated/control observations, events, clusters, and time periods for the envisioned analysis?
- Are there missingness, outlier, high-dimensional, support, or leakage concerns?
- Are privacy, governance, or access limits preventing needed fields from being used?
- What profiling artifacts, codebook checks, or inspection commands have actually been run?

## Fit Checks

### Data-to-domain fit

Check whether the data reflect the domain scientist's notes:

- user-facing terms versus column/table names;
- true domain events versus billing/logging/proxy events;
- standard domain measurement windows versus available timestamps;
- field-specific coding systems, scales, instruments, assays, or log events;
- sensitive fields that are missing, masked, restricted, or only available in aggregate;
- domain concepts that are not measured and should not be silently treated as observed.

### Data-to-design fit

Check whether the data can operationalize the design planner's structure:

- target and analysis population;
- eligibility criteria;
- treatment/exposure assignment, receipt, dose, intensity, or timing;
- comparator or untreated/control observations;
- time zero;
- baseline window;
- follow-up and outcome window;
- clusters, sites, panels, pre-periods, repeated measures, or networks;
- censoring, attrition, sampling, or observation process fields.

### Data-to-DAG fit

Check whether the data can support DAG-builder questions:

- whether candidate baseline variables are measured before treatment/time zero;
- whether proposed adjustment variables are available and reliably measured;
- whether some variables are actually post-treatment, mediators, colliders, or consequences of selection;
- whether selection, censoring, missingness, or observation indicators exist;
- whether variables flagged as important by the DAG are unobserved, proxied, or restricted;
- whether preprocessing could leak outcome or future information.

### Data-enabled formulation scan

The Data Technician should notice when data structure suggests a useful causal formulation that has not yet been proposed. Examples include:

- a better unit of analysis than the one initially assumed;
- a credible time-zero field, adoption date, eligibility date, or baseline window;
- exposure intensity, dose, receipt, adherence, or timing constructions;
- comparator/control construction from unexposed, not-yet-treated, assigned-but-untriggered, or matched source-system records;
- panel, event-history, repeated-measure, or linkage reshapes;
- proxy outcomes or measurement composites that need domain review;
- discontinuities, rollouts, cutoffs, shocks, eligibility rules, or other natural-experiment signals.

Record these as `data_enabled_opportunities`, then use `handoff_notes` to route plausibility to `domain_helper_01`, route feasibility to `design_planner_03`, and causal timing/role concerns to `dag_builder_04`. Keep them provisional until the main skill selects a next action.

## Data Profile Checklist

- row count and column count;
- unique units;
- duplicate unit/time keys;
- wide versus long format;
- numeric, categorical, date/time, text, and list columns;
- JSON/list/nested fields, log events, source-system views, and database queries used;
- linkage keys, table relationships, and join multiplicity;
- survey weights, strata, clusters, or sampling fields;
- geospatial coordinates, regions, distances, or adjacency fields;
- missingness by variable and by key component;
- impossible values, date-order errors, unit inconsistencies, duplicate records;
- treatment/exposure availability and levels;
- comparator/control availability;
- outcome distribution and outcome availability;
- cluster sizes, repeated-measure counts, and panel balance;
- categorical levels, sparse levels, constant columns, and high-cardinality variables;
- \(p/n\), treated/control counts, event counts, cluster counts, and pre-period counts.
- computational scale, memory constraints, profiling artifacts, and inspection commands or rules run.

## Safe Preprocessing Patterns

Generally safe when documented:

- standardize units;
- parse dates;
- recode labels using a codebook;
- remove exact duplicate records after key audit;
- construct baseline summaries from pre-treatment windows;
- encode categorical covariates;
- scale continuous variables for algorithms;
- create missingness indicators for descriptive audit;
- impute baseline covariates when assumptions are plausible and documented;
- use unsupervised dimension reduction on baseline covariates only;
- preserve raw variables and reproducible transformation rules.

Potentially unsafe:

- use future visits to construct baseline;
- use post-treatment variables in baseline adjustment sets;
- drop rows based on outcome availability without checking treatment/prognosis patterns;
- remove outliers after seeing treatment effects;
- infer treatment from downstream behavior;
- include mediators as baseline covariates for a total-effect analysis;
- select features by outcome association without sample splitting or cross-fitting;
- collapse repeated rows without preserving time;
- learn embeddings or PCA from variables that include outcomes, mediators, or future information.

## Readiness Triage

Use the canonical evaluator readiness statuses:

- `ready`: data structure and quality are adequate for a named route, design, or next step;
- `sufficient_for_now`: data evidence is enough for the current exploratory or routing action, but not necessarily enough for gate commitment;
- `needs_information`: key meanings, timing, IDs, files, tables, fields, or preprocessing evidence are ambiguous;
- `blocks_foundation_gate`: a required design/DAG component is absent, contradicted, or cannot be constructed from available data;
- `not_needed`: no data check is needed for the current non-causal, teaching, or descriptive task;
- `unknown`: data evidence is too limited to judge.

Common blockers:

- no comparator/control observations;
- no treatment/exposure timing;
- no outcome or follow-up window;
- rows represent the wrong unit for the intended analysis;
- missing or unreliable unit IDs, time IDs, cluster IDs, or adoption dates;
- baseline variables measured after treatment;
- complete-case filtering would remove most treated or outcome-positive units;
- too few treated units, events, clusters, or pre-periods;
- key domain measurements are only proxies or unavailable;
- data include only triggered/exposed/observed units when the design needs assigned or eligible units.

Every foundation readiness note should include `readiness_scope`, such as `exploratory review`, `route comparison`, `design-data fit`, `dag-data fit`, `preprocessing`, `method-specific modeling`, `gate commitment`, or `user-directed execution`. If readiness is narrow, record what it does not cover so a preprocessing pass is not mistaken for route or gate readiness. Production readiness belongs in `analysis.production_loop.reviewer_summaries`, not in `evaluators.data_technician_02.readiness`.

## Evaluator Output Examples

```yaml
evaluators:
  data_technician_02:
    readiness: "blocks_foundation_gate"
    readiness_scope: "design-data fit"
    data_status: "existing"
    summary: "The file appears to include only treated users, so a treatment-versus-control effect is not currently supported by these data."
    key_findings:
      - note: "No comparator group is visible in the observed data."
        basis: "observed data"
        severity: "blocker"
    handoff_notes:
      - target: "design_planner_03"
        note: "The current cohort design needs a comparator source or a fallback route."
        basis: "observed data"
        suggested_next_action: "refresh_design_planner_03"
      - target: "dag_builder_04"
        note: "Several candidate severity variables are measured after treatment initiation."
        basis: "data dictionary"
        suggested_next_action: "refresh_dag_builder_04"
    requests_for_main_skill:
      - request_id: "data-01"
        note: "Ask whether an untreated, not-yet-treated, or eligible-but-unexposed comparator source exists."
        requested_action: "ask_user"
        blocking_signal:
          blocks_current_phase: true
          requires_previous_phase_recheck: false
          target_phase: foundation
          severity: "serious"
          reason: "No comparator source is currently visible for the proposed effect estimate."
          affected_sections: ["foundation_gate", "evaluators.data_technician_02", "routes"]
        status: "open"
        main_skill_decision: null
```

## Reference Files

- `literature_and_software.md`: preprocessing principles and software notes.
