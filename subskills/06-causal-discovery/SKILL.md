---
name: causal-discovery
description: "Any-phase discovery sidecar for graph-hypothesis generation, graph comparison, variable screening, discovery diagnostics, and exploratory causal-structure deliverables with Python, R, or Java/Tetrad. Discovered graphs are sidecar artifacts by default; they must be routed through the relevant core reviewer before they affect framework commitment, adjustment, gates, or causal claim strength."
---

# Causal Discovery

## Role

Use this as a **discovery sidecar module** inside the Modular Consultant Team (MCT), not as an effect-estimation framework. It can propose, compare, and stress-test graph hypotheses from data at any phase of the consultant workflow. It does not validate identification, open a gate, change a framework, choose an adjustment set, or strengthen causal claim language.

Discovery output is inert by default. If a discovery finding may affect the main causal project, ask the main skill to close or pause the sidecar and route the implication through the relevant reviewer: `domain_expert` for construct validity, mechanism, plausibility, interpretation, or external-validity implications; `data_analyst` for feature, constructability, leakage, missingness, preprocessing, or artifact implications; `method_lead` for graph, timing, variable-role, adjustment, identification, estimand, framework, diagnostic, or causal-logic implications; and `report_writer` only for discovery-only report synthesis, report appendix, framing, or exploratory-language implications. If the user's deliverable is itself a discovery report, keep the claim exploratory unless a separate main-workflow review validates stronger interpretation.

## Activation Boundary

Use this subskill when the main skill activates it as a sidecar for one of these purposes:

- graph-hypothesis generation when the DAG is underspecified;
- comparison of candidate graph structures or equivalence classes;
- variable-screening support before or during `method_lead` review;
- discovery diagnostics for a graph-learning result;
- a user-requested discovery deliverable with clear exploratory limits.

Do not use it as a routine companion to every project. Do not use it to replace domain knowledge, framework planning, or DAG auditing. If the user asks to estimate an effect, this subskill is only supportive unless discovery is explicitly needed to form graph hypotheses. If the user only wants a discovery deliverable, produce discovery artifacts or report material with exploratory language and do not imply that an effect-estimation framework has been validated. In that case, recommend `report_writer` synthesis with `subskills/05-report-writer/assets/discovery_report_template.md` after graph artifacts, diagnostics, limitations, and paths are recorded.

## Sidecar Lifecycle

Enter with a bounded purpose, a concrete `return_to_phase`, and `affects_main_framework: false`. If the graph target, variable set, timing, background knowledge, or preprocessing is not ready, ask for the relevant reviewer first instead of running algorithms.

Work inside the sidecar by producing graph hypotheses, comparison notes, screening output, diagnostics, and report-support material. Keep provenance explicit: distinguish user-stated facts, inspected data, executed code, copied artifacts, and hypothetical examples. Do not write conclusions into reviewer-owned YAML fields.

Exit by returning a compact packet: purpose, graph target, method family, artifacts, diagnostics, limitations, reviewer requests, report-support bullets, recommended next action, and whether `method_lead_recheck.required` is true. Ask the main skill to close or pause the breadcrumb, route implications through the right reviewer, let `report_writer` update the working report when material is substantive, and return to the recorded phase.

## Discovery YAML Contract

When activated, the main skill records the sidecar breadcrumb under `analysis_state.discovery_sidecar` in the project YAML state. Append or update one compact `subskill_records` record only when durable traceability is useful. Keep full graphs, stability tables, code, and diagrams in analysis folders. Record output paths in the breadcrumb, subskill record, report-support packet, or working report; do not mutate the fixed package `artifact_index` as a reasoning field.

The sidecar breadcrumb should stay small:

```yaml
analysis_state:
  discovery_sidecar:
    active: true
    purpose: "graph exploration | graph comparison | variable screening | discovery diagnostics | discovery deliverable"
    return_to_phase: "project_exploration | causal_specification | report_production"
    affects_main_framework: false
    artifact_paths: []
```

When the sidecar is active, `return_to_phase` must be concrete: `causal_specification` for framework/DAG/design support, `report_production` for active-analysis, report, or appendix work, and `project_exploration` when the output is only helping the team learn. If the return destination is unclear, ask the main skill to resolve it with the user before activating or closing the sidecar.

On exit, ask the main skill to set `active: false` or pause the sidecar while preserving `purpose`, `return_to_phase`, `affects_main_framework`, and `artifact_paths`. Set `affects_main_framework: true` only as a warning that reviewer review is needed; it is not permission to change the framework directly.

Write this subskill's record with:

- `subskill_id`: `06-causal-discovery`
- `module_type`: `discovery_sidecar`
- `role`: `discovery_module`
- `status`: `activated`, `reviewing`, `plan_proposed`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- `activation_reason`: graph exploration, graph comparison, variable screening, discovery diagnostic review, or discovery deliverable
- `type_specific.discovery_sidecar`: local sidecar packet when needed, such as graph target, related framework or route, method family, graph object, background knowledge, and sidecar purpose
- `inputs_reviewed`: data type, sample size, variable count, temporal order, missingness, background knowledge, forbidden/required edges, known interventions, and current DAG/design state
- `provenance_summary`: what was user-stated, inspected, computed, copied from an artifact, or hypothetical
- `fit_summary`: whether discovery is direct, adapted, exploratory, blocked, or not applicable for the requested sidecar purpose
- `assumptions_or_requirements`: causal sufficiency or latent-confounding handling, faithfulness, acyclicity, stationarity, non-Gaussianity, temporal tiers, and background-knowledge requirements
- `diagnostics_reviewed`: stability, sensitivity to tuning/test/score, background-knowledge consistency, hidden-confounding assumptions, orientation confidence, Markov/faithfulness plausibility, preprocessing risks, and domain plausibility checks
- `diagnostics_needed`: remaining stability, background-knowledge, hidden-confounding, preprocessing, or reviewer-routing checks
- `sensitivity_or_robustness`: bootstrap, subsampling, tuning/test/score changes, alternative preprocessing, edge constraints, lag choices, or graph-family comparisons
- `limitations`: graph non-uniqueness, possible latent variables, sample-size limits, time-order uncertainty, preprocessing risk, non-IID concerns, weak orientation evidence, and exploratory status
- `requests.user`: temporal order, background knowledge, hidden-confounding tolerance, variable exclusions, or discovery deliverable preferences
- `requests.domain_expert`: construct, mechanism, temporal-order, edge-plausibility, or external-validity review
- `requests.data_analyst`: feature construction, preprocessing, leakage, missingness, scale, non-IID, or artifact review
- `requests.method_lead`: graph, adjustment, identification, estimand, framework, or diagnostic review
- `requests.other_subskills`: report-writer integration or another specialist module if needed
- `report_support`: report-ready bullets for the working report: why discovery was activated, graph target, methods used or proposed, main graph findings, diagnostic/stability summary, reviewer-routing implications, limitations, artifact paths, and exploratory wording
- `readiness`: use `materials_ready` only when graph artifacts and diagnostics are ready for the requested sidecar deliverable or reviewer review; use `diagnostics_needed`, `diagnostics_deferred`, `blocked`, or `candidate_only` otherwise
- `method_lead_recheck`: set `required: true` only when discovery output may materially affect the causal structure, estimand set, assumptions, framework, gates, claim strength, or wording boundary; otherwise keep it false and route routine artifacts to `data_analyst` or `report_writer`
- `blocking_signal`: leave inactive by default; use it only when the discovery sidecar blocks the current phase, needs a target phase, or creates a severity-rated blocker
- `recommended_next_action`: one controlled value such as `refresh_domain_expert`, `refresh_data_analyst`, `refresh_method_lead`, `refresh_report_writer`, `ask_user`, `run_diagnostics`, `return_to_causal_specification`, or `proceed_with_caveat`
- `artifact_paths`: paths to graph outputs, code, diagnostics, plots, or report support memos

Keep discovery feedback in the sidecar breadcrumb, optional `subskill_records` chunk, and artifact paths. Do not duplicate the full discovery record in reviewer fields.

## Before Running Discovery

Check whether discovery is even appropriate:

- Goal: graph exploration, graph comparison, variable screening, adjustment support, or discovery deliverable.
- Shared state: current `variable_roster` entries and any existing `method_lead.causal_structure` narrative, graph artifact, edge summary, role summary, timing constraints, forbidden adjustments, identification gaps, and assumptions.
- Data: cross-sectional, longitudinal, time series, mixed, interventional, experimental, multi-domain, or text-derived.
- Scale: sample size, number of variables, missingness, measurement quality, discreteness, mixed types, and high-dimensional conditioning risk.
- Background knowledge: temporal tiers, required edges, forbidden edges, known interventions, impossible directions, and domain constraints.
- Assumptions: causal sufficiency or latent confounding, faithfulness, acyclicity, stationarity, non-Gaussianity, functional form, and selection mechanisms.
- Preprocessing risks: collider/selection construction, future leakage, post-treatment variables, and variables created from outcomes.

If these are unclear, recommend `ask_user`, `refresh_domain_expert`, `refresh_data_analyst`, or `refresh_method_lead` before running algorithms. In particular, ask `data_analyst` to vet variable construction, missingness, non-IID structure, leakage, scale, and preprocessing before treating discovery artifacts as evidence; ask `method_lead` to vet any adjustment, identification, estimand, or framework implication.

## Packages, Models, And Scripts

Choose packages by graph target and assumptions:

- Python: `causal-learn` for PC/FCI/GES-family workflows, `lingam` for non-Gaussian functional assumptions, `tigramite` for time-series discovery, `py-tetrad` when Tetrad access is available.
- R: `pcalg` for PC/FCI/GES/IDA-style workflows, `bnlearn` for score-based or Bayesian-network exploration, `causalDisco` for selected modern discovery workflows when it fits, and Python/Tigramite when time-series assumptions dominate.
- Java/Tetrad: use when the user needs Tetrad algorithms, GUI-aligned workflows, large algorithm coverage, or richer background-knowledge support.
- Optimization-style methods such as NOTEARS, DAGMA, GOLEM, or neural DAG learners can be useful for screening or benchmarking, but require strong caution about assumptions, tuning, and false orientation confidence.

Local examples to provide or adapt:

- `examples/python_pc.py`
- `examples/python_fci.py`
- `examples/python_ges.py`
- `examples/python_lingam_direct.py`
- `examples/python_tigramite_pcmci.py`
- `examples/r_pcalg_pc.R`
- `examples/r_pcalg_fci.R`
- `examples/r_bnlearn_hc.R`
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
- domain plausibility checks to send back to the appropriate reviewer.

Never describe discovery output as proof. Prefer "suggests graph hypotheses," "is compatible with," or "raises a candidate edge/orientation."

## Feedback To Main Skill

Give the main skill:

- graph target and algorithm family used or proposed;
- what graph artifact was created, such as DAG, CPDAG, PAG, edge list, stability table, or candidate adjustment hints;
- whether the graph is ready for the appropriate reviewer review, still exploratory, or blocked;
- which assumptions and diagnostics most constrain interpretation;
- whether the result should remain a sidecar artifact, become a visible main-report module, be included in a discovery-only report, or be routed through `domain_expert`, `data_analyst`, `method_lead`, or `report_writer`;
- a `report_support` packet whenever discovery was activated as a meaningful sidecar, especially during `project_exploration` or early `causal_specification`;
- one focused user question if temporal order, background knowledge, or hidden-confounding tolerance is needed.

## Report Support Packet

When causal discovery is activated early as a real sidecar, assume the user expects those features to be visible in the eventual deliverable. Return report-ready material unless the activation was only a quick private lookup that produced no artifact or substantive interpretation.

The report support packet should include:

- section title suggestion, usually "Exploratory Causal Discovery" or "Graph Discovery Sidecar";
- why discovery was used and what question it was meant to inform;
- data and variables used, with provenance and preprocessing caveats;
- target graph object, such as DAG, CPDAG, PAG, edge list, screening result, or stability table;
- method family and key settings, including background knowledge, forbidden/required edges, lags, or intervention targets;
- main candidate structures, paths, edges, variable groups, or negative findings;
- diagnostics and stability checks completed or still needed;
- implications to route to `domain_expert`, `data_analyst`, or `method_lead`;
- wording boundary, including that findings are graph hypotheses rather than proof;
- artifact paths for plots, tables, code, and graph objects.

For a normal causal report, recommend a visible discovery section when discovery was activated early or produced artifacts. Use an appendix only when the discovery task was minor, purely diagnostic, or not important to the user's goal. For a discovery-only deliverable, send the packet to `report_writer` for the discovery report lane.

Report-writer notes for discovery-only reports should include:

- graph target, algorithm family, data type, temporal/background constraints, and whether output is DAG, CPDAG, PAG, edge list, or screening result;
- stability, tuning/test/score sensitivity, background-knowledge consistency, hidden-confounding, and orientation-confidence diagnostics;
- graph artifact paths, stability tables, and `method_lead` report support memo;
- limitations from equivalence classes, latent variables, sample size, non-IID data, preprocessing, or weak orientations;
- exploratory wording that avoids treating discovered edges as proof and says whether the deliverable is graph exploration rather than effect estimation.
- candidate next effect-estimation questions, if useful, framed as follow-up options rather than completed causal answers.

## Sidecar Closure

Recommend reviewer review when discovery contradicts current causal timing, reveals likely latent structure that may invalidate the current framework, shows required variables may be downstream/collider-like, or makes the current DAG/framework questionable. Do not change gates, frameworks, adjustment sets, or claim strength directly from discovery output.

Close the sidecar with `recommended_next_action: ask_user` when discovery is useful but remains exploratory, graph-equivalence is broad, orientations are weak, hidden confounding remains plausible, or the output is only report appendix material and no reviewer review is immediately required. Preserve cautious language and artifact paths, and ask the main skill to offer a context-aware continuation choice such as keep it exploratory, route implications to `domain_expert`/`data_analyst`/`method_lead` review, compare another discovery specification, turn it into a discovery report, resume the prior phase, or pause.

For a discovery-only deliverable, recommend `materials_ready` only when the graph artifact, causal-path notes or a statement that paths are not stable, diagnostics, limitations, exploratory wording, recommended next effect-estimation questions if useful, and artifact paths are recorded. This does not imply `causal_gate` or `production_gate` readiness for an effect claim.

## Reference Files

- `references/workflow.md`: detailed discovery workflow.
- `references/discovery_readme.md`: tool orientation and recommender use.
- `references/discovery_references.md`: literature notes.
- `examples/`: R, Python, and Tetrad templates.
