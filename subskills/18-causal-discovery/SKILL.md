---
name: causal-discovery
description: "Discovery support subskill for graph-hypothesis generation, graph comparison, variable screening, and exploratory causal-structure learning with Python, R, or Java/Tetrad. Use only when the main skill needs discovery as a support module or user deliverable; discovered graphs must be handed to DAG Builder before they affect route commitment or causal claim strength."
---

# Causal Discovery

## Role

Use this as a **discovery support module**, not as an effect-estimation route. It can propose, compare, and stress-test graph hypotheses from data. It does not validate identification, open a gate, or strengthen causal claim language.

Discovery output must return to `04-dag-builder` before it changes `foundation_gate.status`, `routes.current_route_id`, adjustment choices, or claim strength. If the user's deliverable is itself a discovery report, keep the claim exploratory unless the main skill and DAG Builder separately validate the causal interpretation.

## Activation Boundary

Use this subskill when the main skill selects it for one of these purposes:

- graph-hypothesis generation when the DAG is underspecified;
- comparison of candidate graph structures or equivalence classes;
- variable-screening support before DAG Builder review;
- discovery diagnostics for a graph-learning result;
- a user-requested discovery deliverable with clear exploratory limits.

Do not use it as a routine companion to every project. Do not use it to replace domain knowledge, design planning, or DAG auditing. If the user asks to estimate an effect, this subskill is only supportive unless discovery is explicitly needed to form graph hypotheses.

## Discovery YAML Contract

When activated, append or update one compact `project.yaml > subskill_analyses` record using `assets/method_job_subskill_record_template.yaml`, with `role: discovery_module`. Keep full graphs, stability tables, code, and diagrams in `analyses/` or `artifacts/`.

Write this subskill's record with:

- `subskill_id`: `18-causal-discovery`
- `role`: `discovery_module`
- `status`: `activated`, `reviewing`, `plan proposed`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: graph exploration, graph comparison, variable screening, discovery diagnostic review, or discovery deliverable
- `selected_route_id`: the affected route if one exists; otherwise null
- `inputs_reviewed`: data type, sample size, variable count, temporal order, missingness, background knowledge, forbidden/required edges, known interventions, and current DAG/design state
- `outputs_created`: discovery plan, selected algorithms, code path, graph hypotheses, CPDAG/PAG/DAG artifact, stability table, edge list, or DAG Builder handoff memo
- `diagnostics_reviewed`: stability, sensitivity to tuning/test/score, background-knowledge consistency, hidden-confounding assumptions, orientation confidence, Markov/faithfulness plausibility, preprocessing risks, and domain plausibility checks
- `limitations`: graph non-uniqueness, possible latent variables, sample-size limits, time-order uncertainty, preprocessing risk, non-IID concerns, weak orientation evidence, and exploratory status
- `feedback_for_main_skill`: whether output is ready for DAG Builder review, still exploratory, blocked, or useful only as variable-screening support
- `requests_for_main_skill`: ask user for temporal order/background knowledge, refresh Data Technician, refresh DAG Builder, run stability diagnostics, narrow the graph task, or keep discovery as exploratory
- `readiness`: use `materials ready` only when graph artifacts and diagnostics are ready for DAG Builder or a discovery deliverable; use `diagnostics needed`, `diagnostics deferred`, `foundation recheck needed`, or `blocked` otherwise
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when discovery reveals a serious contradiction in current timing, variable roles, latent structure, or route assumptions
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `refresh_dag_builder_04`, `refresh_data_technician_02`, `ask_user`, `run_diagnostics`, `proceed_with_caveat`, `return_to_foundation`, or `no_action`
- `artifact_paths`: paths to graph outputs, code, diagnostics, plots, or handoff memos

Keep discovery feedback in this subskill's `subskill_analyses` chunk and artifact paths. Do not duplicate the full discovery record in `analysis.production_loop.reviewer_summaries`.

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
- domain plausibility checks to send back to Domain Helper or DAG Builder.

Never describe discovery output as proof. Prefer "suggests graph hypotheses," "is compatible with," or "raises a candidate edge/orientation."

## Feedback To Main Skill

Give the main skill:

- graph target and algorithm family used or proposed;
- what graph artifact was created, such as DAG, CPDAG, PAG, edge list, stability table, or candidate adjustment hints;
- whether the graph is ready for DAG Builder review, still exploratory, or blocked;
- which assumptions and diagnostics most constrain interpretation;
- whether the result changes the current route, requires `return_to_foundation`, or only informs future data/design work;
- one focused user question if temporal order, background knowledge, or hidden-confounding tolerance is needed.

Report Writer handoff notes should include:

- graph target, algorithm family, data type, temporal/background constraints, and whether output is DAG, CPDAG, PAG, edge list, or screening result;
- stability, tuning/test/score sensitivity, background-knowledge consistency, hidden-confounding, and orientation-confidence diagnostics;
- graph artifact paths, stability tables, and DAG Builder handoff memo;
- limitations from equivalence classes, latent variables, sample size, non-IID data, preprocessing, or weak orientations;
- exploratory wording that avoids treating discovered edges as proof and says whether the deliverable is graph exploration rather than effect estimation.

## Gate Decisions

Recommend `return_to_foundation` when discovery contradicts the current causal timing, reveals likely latent structure that invalidates the current route, shows required variables are downstream/collider-like, or makes the current DAG/route impossible without revision.

Stay in production with a weaker claim when discovery is useful but unstable, graph-equivalence is broad, orientations are weak, hidden confounding remains plausible, or the output is best treated as exploratory support. Then recommend DAG Builder review and cautious language.

Recommend production-gate readiness only when the user's deliverable is a discovery deliverable or discovery artifact, not an effect claim, and the graph artifact, diagnostics, limitations, exploratory wording, and DAG Builder handoff or deferral rationale are recorded.

## Reference Files

- `references/workflow.md`: detailed discovery workflow.
- `references/discovery_readme.md`: tool orientation and recommender use.
- `references/discovery_references.md`: literature notes.
- `examples/`: R, Python, and Tetrad templates.
