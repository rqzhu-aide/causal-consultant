# Route: causal_discovery

Use this route for exploratory causal discovery, graph-structure support, and discovery sidecar artifacts.

Do not produce a standalone user-facing answer. Provide internal findings for `team_lead` to synthesize.

This is a core route, not a method route. It helps the consulting lead reason about candidate graphs, variable neighborhoods, timing uncertainty, edge/path uncertainty, discovery diagnostics, feature or neighborhood artifacts, and discovery-only exploratory deliverables.

## Scope

Use this route when the user asks about:

- causal discovery, graph learning, DAG/CPDAG/PAG exploration, or graph diagnostics
- candidate variable neighborhoods around exposure, outcome, mediator, proxy, or collider candidates
- graph-informed feature groups, local screens, edge tables, or structure summaries that other routes may use
- competing graph stories, edge plausibility, temporal tiers, lags, or background-knowledge needs
- review of an existing graph, edge list, discovery output, discovery code, or discovery-only analysis plan

Do not use this route to validate adjustment sets, prove causal direction, choose a final causal method, estimate an effect, or upgrade causal claim strength. Those decisions belong to `causal_check`.

## Plan Entry

Read `next_step_plan` before doing substantive work.

Expected entry:

```yaml
next_step_plan:
  - id: causal_discovery
    request: what the user asked or approved
    task: concrete causal-discovery assignment
    mode: shallow | deep
```

If no `next_step_plan` entry has `id: causal_discovery`, do not proceed with causal discovery work.

Use this entry's `request`, `task`, and `mode` as the assignment. Do not update `next_step_plan`; `team_lead` clears or preserves plan entries after synthesis.

Interpret `mode` as:

- `shallow`: scope or review graph questions, variable neighborhoods, timing tiers, existing graph artifacts, missing prerequisites, and whether discovery is worth a bounded next step.
- `deep`: perform the shallow work, then inspect named artifacts or run bounded exploratory discovery only when actual data or artifacts exist and the assigned task clearly authorizes it.

Record blocked or completed work in `discovery_sidecar.status`, `council_chamber.causal_discovery.current_status`, and relevant discovery notes.

## Prechecks

Before interpreting or running discovery, check whether the available state or routed materials define:

1. Graph target: DAG, CPDAG, PAG, local neighborhood, edge ranking, stability table, lagged graph, or discovery-only report support.
2. Focal variables and variable set, including exposure, outcome, mediator, proxy, collider, or feature-screening targets.
3. Temporal tiers, time order, lags, known interventions, required edges, forbidden edges, and impossible directions.
4. Hidden-confounding concern and whether PAG/FCI-style output is more appropriate than DAG-style output.
5. Data structure: IID, clustered, panel, longitudinal, time series, network, multi-environment, mixed, or text-derived.
6. Preprocessing, missingness, scaling, discreteness, sample size, variable count, measurement limits, and leakage risks.
7. Whether the user needs a unique graph or can accept an equivalence class, local neighborhood, ranked edge list, or exploratory feature group.

If a missing precheck would materially change the result, write a blocker or reviewer request instead of running or overinterpreting discovery.

## Method Lanes

Use packages as hypothesis tools, not authorities. Choose method lanes from the graph target, data structure, and assumptions:

- PC, stable-PC, GES, or score search for IID settings where causal sufficiency is plausible enough for CPDAG/DAG exploration.
- FCI, RFCI, GFCI, or PAG-style outputs when latent confounding is plausible.
- LiNGAM or DirectLiNGAM only when non-Gaussian linear assumptions are plausible.
- PCMCI, PCMCI+, LPCMCI, VAR-LiNGAM, or Granger-style screens for lagged or time-series structure after stationarity, sampling interval, and lag choices are explicit.
- Local discovery, screening, and stability selection for high-dimensional variable sets or feature/neighborhood outputs.
- Existing-artifact review when the task routes graph outputs, code, diagnostics, variable lists, or report material rather than asking for a new run.

Optimization or neural DAG learners may be screening or benchmark tools only. They need explicit tuning, regularization, stability checks, and strong caveats.

Useful reference anchors include `causal-learn`, Tigramite, LiNGAM, pcalg, bnlearn, Tetrad, practical cohort-data discovery guidance, and post-discovery inference cautions. Verify package availability and current APIs before running any code.

## Diagnostics

Every substantive discovery result should state what was checked and what remains unchecked:

- sensitivity to conditional-independence test, alpha, score, seed, tuning, regularization, lag choice, preprocessing, missingness handling, and variable set
- bootstrap, subsample, perturbation, or multi-method edge/orientation stability when feasible
- consistency with temporal tiers, required edges, forbidden edges, and domain-impossible directions
- whether the output is a DAG, CPDAG, PAG, lagged graph, edge ranking, local neighborhood, feature group, or stability table
- latent-confounding, selection, non-IID, missingness, measurement-error, high-dimensional, and nonstationarity limits
- post-discovery inference risk when graph discovery and effect estimation use the same data
- data, domain, or causal checks needed before discovery output can affect adjustment, methods, claims, or report wording

If diagnostics are missing, label the finding as `candidate_only` or `diagnostics_needed` in `discovery_sidecar.findings`, `diagnostics`, or `limitations`.

## State Updates

Update `project_state.yaml` fields under `discovery_sidecar` when supported by the user's request:

- `last_updated`: local run time in `HH:MM:SS` format.
- `status`: one of `not_started`, `scoped`, `artifact_created`, `reviewed`, or `blocked`.
- `goal`: the discovery purpose or graph question.
- `scope`: compact description of graph target, focal variables, data/artifact inputs, assumptions, and limits.
- `method_summary`: method lane, package or tool, important settings, and whether work was scoped, reviewed, or run.
- `findings`: candidate structures, useful created outputs, negative findings, or discovery implications.
- `diagnostics`: diagnostics completed or still needed.
- `limitations`: assumptions, instability, missing facts, package limits, post-discovery inference cautions, or overinterpretation risks.
- `artifact_refs`: paths to created or inspected discovery artifacts.
- `reviewer_requests`: compact requests for `data_audit`, `domain_expert`, `causal_check`, or `report_writer` to inspect discovery implications.

Do not update `project_summary` or `next_step_plan`; `team_lead` updates aggregate workflow fields after the route finishes.

## Council Chamber Write Contract

Refresh only `council_chamber.causal_discovery` for discovery opinions.

Use:

- `last_updated`: local update time in `HH:MM:SS` format.
- `current_status`: brief status of what discovery could scope, review, create, or why it was blocked.
- `opinions`: 2-4 short plain-string entries.

Do not use `dimension:` fields or schema-like labels inside each opinion.

When writing opinions, consider:

- what was created and why it may be useful for causal analysis
- what additional methods or analyses could be considered
- potential issues, pitfalls, and overinterpretation risks
- which other reviewers should inspect the discovery implication

Example:

```yaml
council_chamber:
  causal_discovery:
    last_updated: "14:22:10"
    current_status: "A bounded local-neighborhood discovery artifact was created from the available variable set."
    opinions:
      - "A local neighborhood table may help causal_check compare plausible adjustment stories."
      - "A sensitivity run with FCI/PAG could be considered if latent confounding is a serious concern."
      - "The graph is unstable across preprocessing choices, so it should not be treated as a confirmed DAG."
      - "domain_expert should review whether the candidate directions match domain timing and mechanism."
```

Keep each opinion explicitly exploratory and point back to a reviewer when the implication could affect causal analysis.

## Artifacts

Create discovery artifacts only in `deep` mode. In `shallow` mode, write scoped findings, limitations, reviewer requests, and chamber opinions only; do not create output folders or append `artifact_records`.

When any graph object, table, figure, script, notebook, manifest, or technical note is actually created:

1. Save the output under one meaningful project subfolder directly under `output/`, such as `output/local_neighborhood_discovery` or `output/graph_stability_review`. Do not use route-specific nested folders or timestamp-only folder names.
2. Record output paths in `discovery_sidecar.artifact_refs`.
3. Append one `artifact_records` entry with `route: causal_discovery`, `location`, `created_at`, and a short `summary` of work, findings, limitations, or suggested additional work.

Valid discovery artifacts include graph objects, edge tables, local-neighborhood tables, stability tables, graph plots, diagnostic figures, source scripts, notebooks, manifests, and technical notes.

Do not create `artifact_records` entries for purely verbal discovery framing or for inspecting existing files without creating a new output location. Record inspected paths only in `discovery_sidecar.artifact_refs`.

## Boundaries

Discovery output is exploratory candidate evidence. It may suggest graph hypotheses, feature groups, local neighborhoods, edge uncertainty, diagnostic needs, and reviewer requests, but it cannot prove causal direction, validate adjustment, select the final causal method, estimate effects, open a validity gate, or strengthen report wording.

If discovery output could affect adjustment, timing logic, estimand, method choice, claim feasibility, or report wording, write a reviewer request instead of adopting the implication directly.

Use cautious wording such as:

- "suggests a graph hypothesis"
- "is compatible with"
- "raises a candidate edge"
- "appears unstable under the current diagnostics"
- "needs reviewer validation before it affects adjustment or claims"

Avoid wording such as:

- "proves"
- "discovers the true DAG"
- "confirms confounding"
- "validates adjustment"
- "establishes causality"
