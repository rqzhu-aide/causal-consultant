---
name: causal-discovery
description: "Any-phase discovery sidecar for graph-hypothesis generation, graph comparison, variable screening, discovery diagnostics, and exploratory causal-structure deliverables with Python, R, or Java/Tetrad. Discovered graphs are sidecar artifacts by default; they must be routed through the relevant main-workflow owner before they affect route commitment, adjustment, gates, or causal claim strength."
---

# Causal Discovery

## Role

Use this as a **discovery sidecar module**, not as an effect-estimation route. It can propose, compare, and stress-test graph hypotheses from data at any phase of the consultant workflow. It does not validate identification, open a gate, change a route, choose an adjustment set, or strengthen causal claim language.

Discovery output is inert by default. If a discovery finding may affect the main causal project, ask the main skill to close or pause the sidecar and route the implication through the existing owner: `02-data-technician` for feature, constructability, leakage, missingness, or preprocessing implications; `03-design-planner` for route, comparator, estimand, design, or fallback implications; `04-dag-builder` for graph, timing, variable-role, adjustment, identification, or causal-logic implications; and `20-report-writer` only for discovery-only report synthesis, report appendix, framing, or exploratory-language implications. If the user's deliverable is itself a discovery report, keep the claim exploratory unless a separate main-workflow review validates stronger interpretation.

## Activation Boundary

Use this subskill when the main skill activates it as a sidecar for one of these purposes:

- graph-hypothesis generation when the DAG is underspecified;
- comparison of candidate graph structures or equivalence classes;
- variable-screening support before DAG Builder review;
- discovery diagnostics for a graph-learning result;
- a user-requested discovery deliverable with clear exploratory limits.

Do not use it as a routine companion to every project. Do not use it to replace domain knowledge, design planning, or DAG auditing. If the user asks to estimate an effect, this subskill is only supportive unless discovery is explicitly needed to form graph hypotheses. If the user only wants a discovery deliverable, produce discovery artifacts or report material with exploratory language and do not imply that an effect-estimation route has been validated. In that case, recommend Report Writer synthesis with `subskills/20-report-writer/assets/discovery_report_template.md` after graph artifacts, diagnostics, limitations, and paths are recorded.

## Discovery YAML Contract

When activated, the main skill records the sidecar breadcrumb under `project.yaml > analysis.discovery_sidecar`. Append or update one compact `project.yaml > subskill_analyses` record using `assets/method_job_subskill_record_template.yaml`, with `role: discovery_module`, only when durable traceability is useful. Keep full graphs, stability tables, code, and diagrams in `analyses/` or `artifacts/`.

The sidecar breadcrumb should stay small:

```yaml
analysis:
  discovery_sidecar:
    active: true
    purpose: "graph exploration | graph comparison | variable screening | discovery diagnostics | discovery-only report"
    return_to_phase: "foundation | production | reporting | final_delivery | unknown"
    affects_main_route: false
    artifact_paths: []
```

Write this subskill's record with:

- `subskill_id`: `18-causal-discovery`
- `role`: `discovery_module`
- `status`: `activated`, `reviewing`, `plan proposed`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: graph exploration, graph comparison, variable screening, discovery diagnostic review, or discovery deliverable
- `selected_route_id`: the related route if one exists; otherwise null
- `inputs_reviewed`: data type, sample size, variable count, temporal order, missingness, background knowledge, forbidden/required edges, known interventions, and current DAG/design state
- `outputs_created`: discovery plan, selected algorithms, code path, graph hypotheses, CPDAG/PAG/DAG artifact, stability table, edge list, or DAG Builder handoff memo
- `diagnostics_reviewed`: stability, sensitivity to tuning/test/score, background-knowledge consistency, hidden-confounding assumptions, orientation confidence, Markov/faithfulness plausibility, preprocessing risks, and domain plausibility checks
- `limitations`: graph non-uniqueness, possible latent variables, sample-size limits, time-order uncertainty, preprocessing risk, non-IID concerns, weak orientation evidence, and exploratory status
- `feedback_for_main_skill`: whether output is ready for owner review, still exploratory, blocked, useful only as variable-screening support, or ready for a discovery-only report
- `requests_for_main_skill`: ask user for temporal order/background knowledge, refresh Data Technician, refresh Design Planner, refresh DAG Builder, refresh Report Writer, run stability diagnostics, narrow the graph task, or keep discovery as exploratory
- `readiness`: use `materials ready` only when graph artifacts and diagnostics are ready for the requested sidecar deliverable or owner review; use `diagnostics needed`, `diagnostics deferred`, `foundation recheck needed`, or `blocked` otherwise
- `blocking_signal`: leave inactive by default; request the appropriate owner review instead of directly changing gates or routes
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `refresh_dag_builder_04`, `refresh_data_technician_02`, `refresh_design_planner_03`, `refresh_report_writer_20`, `ask_user`, `run_diagnostics`, `proceed_with_caveat`, or `no_action`
- `artifact_paths`: paths to graph outputs, code, diagnostics, plots, or handoff memos

Keep discovery feedback in the sidecar breadcrumb, optional `subskill_analyses` chunk, and artifact paths. Do not duplicate the full discovery record in `analysis.production_loop.reviewer_summaries`.

## Before Running Discovery

Check whether discovery is even appropriate:

- Goal: graph exploration, graph comparison, variable screening, adjustment support, or discovery deliverable.
- Data: cross-sectional, longitudinal, time series, mixed, interventional, experimental, multi-domain, or text-derived.
- Scale: sample size, number of variables, missingness, measurement quality, discreteness, mixed types, and high-dimensional conditioning risk.
- Background knowledge: temporal tiers, required edges, forbidden edges, known interventions, impossible directions, and domain constraints.
- Assumptions: causal sufficiency or latent confounding, faithfulness, acyclicity, stationarity, non-Gaussianity, functional form, and selection mechanisms.
- Preprocessing risks: collider/selection construction, future leakage, post-treatment variables, and variables created from outcomes.

If these are unclear, recommend `ask_user`, `refresh_data_technician_02`, or `refresh_dag_builder_04` before running algorithms.

## Packages, Models, And Scripts

Choose packages by graph target and assumptions:

- Python: `causal-learn` for PC/FCI/GES-family workflows, `lingam` for non-Gaussian functional assumptions, `tigramite` for time-series discovery, `py-tetrad` when Tetrad access is available.
- R: `pcalg` for PC/FCI/GES/IDA-style workflows, `bnlearn` for score-based or Bayesian-network exploration, `tigramite` alternatives through Python when time-series assumptions dominate.
- Java/Tetrad: use when the user needs Tetrad algorithms, GUI-aligned workflows, or richer background-knowledge support.

Simple sample scripts to provide or adapt:

- `scripts/python/causal_learn_pc_template.py`
- `scripts/python/causal_learn_fci_template.py`
- `scripts/R/pcalg_template.R`
- `scripts/R/pcalg_fci_template.R`
- `scripts/R/bnlearn_hc_template.R`
- `examples/java_tetrad_workflow.md`
- `scripts/recommend.py` with `sample_input.json` when a rule-based algorithm recommendation is useful

## Discovery Diagnostics

After fitting or comparing discovery models, diagnostics must cover:

- edge and orientation stability across bootstrap, subsampling, alpha/test/score choices, seeds, and reasonable preprocessing choices;
- consistency with temporal order, required/forbidden edges, and known interventions;
- whether the output is a DAG, CPDAG, PAG, ancestral graph, or only a ranking/screen;
- hidden-confounding risk and whether FCI/PAG-style output is needed;
- Markov and faithfulness plausibility, including near-determinism or cancellations;
- sample-size and high-dimensional conditioning limitations;
- time-series stationarity, lag choice, and contemporaneous-edge interpretation when relevant;
- domain plausibility checks to send back to the appropriate main-workflow owner.

Never describe discovery output as proof. Prefer "suggests graph hypotheses," "is compatible with," or "raises a candidate edge/orientation."

## Feedback To Main Skill

Give the main skill:

- graph target and algorithm family used or proposed;
- what graph artifact was created, such as DAG, CPDAG, PAG, edge list, stability table, or candidate adjustment hints;
- whether the graph is ready for the appropriate owner review, still exploratory, or blocked;
- which assumptions and diagnostics most constrain interpretation;
- whether the result should remain a sidecar artifact, be included in a discovery-only report, or be routed through Data Technician, Design Planner, DAG Builder, or Report Writer;
- one focused user question if temporal order, background knowledge, or hidden-confounding tolerance is needed.

Report Writer handoff notes for discovery-only reports should include:

- graph target, algorithm family, data type, temporal/background constraints, and whether output is DAG, CPDAG, PAG, edge list, or screening result;
- stability, tuning/test/score sensitivity, background-knowledge consistency, hidden-confounding, and orientation-confidence diagnostics;
- graph artifact paths, stability tables, and DAG Builder handoff memo;
- limitations from equivalence classes, latent variables, sample size, non-IID data, preprocessing, or weak orientations;
- exploratory wording that avoids treating discovered edges as proof and says whether the deliverable is graph exploration rather than effect estimation.
- candidate next effect-estimation questions, if useful, framed as follow-up options rather than completed causal answers.

## Sidecar Closure

Recommend owner review when discovery contradicts current causal timing, reveals likely latent structure that may invalidate the current route, shows required variables may be downstream/collider-like, or makes the current DAG/route questionable. Do not change gates, routes, adjustment sets, or claim strength directly from discovery output.

Close the sidecar with `recommended_next_action: no_action` when discovery is useful but remains exploratory, graph-equivalence is broad, orientations are weak, hidden confounding remains plausible, or the output is only report appendix material. Preserve cautious language and artifact paths.

For a discovery-only deliverable, recommend `materials ready` only when the graph artifact, causal-path notes or a statement that paths are not stable, diagnostics, limitations, exploratory wording, recommended next effect-estimation questions if useful, and artifact paths are recorded. This does not imply foundation-gate or production-gate readiness for an effect claim.

## Reference Files

- `references/workflow.md`: detailed discovery workflow.
- `references/discovery_readme.md`: tool orientation and recommender use.
- `references/discovery_references.md`: literature notes.
- `examples/`: R, Python, and Tetrad templates.
