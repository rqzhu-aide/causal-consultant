# Workflow: Causal Discovery

## Goal

Use for learning or comparing causal graph hypotheses from data as an any-phase sidecar. Discovery is exploratory support unless the user explicitly asks for a discovery deliverable. It does not validate an effect-estimation framework by itself and does not change gates, frameworks, adjustment choices, or claim strength directly.

## Sidecar Lifecycle

Use this lifecycle so discovery can enter and exit the MCT workflow cleanly.

1. **Enter.** Confirm a bounded purpose: graph exploration, graph comparison, variable screening, discovery diagnostics, or discovery deliverable. Ask the main skill to record `analysis_state.discovery_sidecar.active: true`, a concrete `return_to_phase`, `affects_main_framework: false`, and any initial artifact paths.
2. **Precheck.** Confirm the graph target, data structure, variable set, timing/background knowledge, hidden-confounding tolerance, and preprocessing risks. If one of these is not ready, request `domain_expert`, `data_analyst`, or `method_lead` review before running algorithms.
3. **Work.** Run or plan discovery only inside the bounded purpose. Save graph objects, edge lists, plots, settings, diagnostics, and provenance in the project analysis folder. Keep the sidecar output exploratory unless a separate reviewer validates a stronger use.
4. **Exit.** Return a compact packet with purpose, graph target, method family, artifacts, diagnostics, limitations, reviewer requests, report-support bullets, and a recommended next action. Ask the main skill to close or pause the breadcrumb, route implications to reviewers, and let `report_writer` update the working report when the sidecar produced durable material.

Set `affects_main_framework: true` only as a warning that review is needed. It is not permission for discovery to update gates, selected framework, adjustment sets, or claim language.

## Intake Checklist

- Is the user asking for graph discovery, graph comparison, variable screening, or effect estimation?
- What graph object is needed: DAG, CPDAG, PAG, ancestral relations, candidate adjustment hints, IDA-style bounds, or a variable-screening list?
- Are hidden confounders plausible?
- Are variables temporally ordered?
- Are cycles, feedback, or nonstationarity plausible?
- What assumptions are plausible: linearity, non-Gaussianity, additive noise, stationarity, causal sufficiency, faithfulness?
- What prior knowledge can constrain the graph: required edges, forbidden edges, tiers, known interventions?
- What backend does the user prefer: Python, R, Java/Tetrad, or no preference?
- What are sample size, variable count, missingness, data types, and measurement quality?
- Is the data IID, clustered, panel, longitudinal, time series, mixed, or text-derived?
- Does the user need a unique graph or can they accept an equivalence class?

## Planning Steps

1. Clarify whether discovery is a sidecar support step or the user's deliverable.
2. Inventory data structure, timing, background knowledge, and preprocessing risks.
3. Choose the target graph object and state what it can and cannot mean.
4. Choose candidate algorithms that match assumptions and graph target.
5. Define diagnostics before running: stability, tuning sensitivity, background-knowledge consistency, hidden-confounding checks, and domain plausibility.
6. Decide what artifact to produce: edge list, graph plot, equivalence-class notes, stability table, causal-path notes, assumptions memo, reviewer-review note, or discovery-only report material.
7. Record whether the output should stay sidecar-only or be routed through `domain_expert`, `data_analyst`, `method_lead`, or `report_writer` before affecting the main workflow. If the requested deliverable is a discovery-only report, route only the report synthesis to `report_writer` and keep effect-claim gates unchanged. If an effect-estimation framework is separately validated, treat discovery material as a visible exploratory module, appendix, or reviewer-routed implication instead of a discovery-only report handoff.
8. If discovery was activated early as a real sidecar, prepare a report-support packet so the eventual report can include a visible discovery section rather than losing the work in internal notes.

## Candidate Methods

- PC or stable-PC for constraint-based DAG/CPDAG exploration under causal sufficiency.
- FCI, RFCI, GFCI, or related PAG methods when latent confounding is plausible.
- GES, FGES, GIES, GRaSP, BOSS, or score-based search when score assumptions and scale fit.
- LiNGAM, DirectLiNGAM, ICA-LiNGAM, or VAR-LiNGAM when non-Gaussian functional assumptions are plausible.
- Additive noise or post-nonlinear models when functional-form assumptions are central.
- Granger, PCMCI, CD-NOD, or lagged discovery workflows for time series or nonstationary settings.
- NOTEARS, DAGMA, GOLEM, neural DAG learners, or other differentiable/optimization approaches as screening or benchmark tools when assumptions, scaling, regularization, and orientation uncertainty are documented.
- Local discovery around exposure-outcome pairs when the full graph is too large or the project only needs candidate neighborhoods for later `method_lead` review.
- IDA-style effect bounds only as graph-implied exploratory bounds, not final effect estimates.

## Recommendation Workflow

Run `../scripts/recommend.py` with JSON input matching `../schemas/recommendation_input.schema.json` when a quick algorithm recommendation is useful.

Manual routing rules:

1. Text-derived variables: treat NLP extraction as a preprocessing risk; prefer `data_analyst` review of annotation/proxy construction and `method_lead` review before discovery claims.
2. Time series or non-IID data: consider VAR-LiNGAM, PCMCI, Granger, or CD-NOD.
3. Missing values: use methods that explicitly handle missingness or ask `data_analyst` to review imputation/selection first.
4. Latent confounding plausible: prefer FCI/PAG-style output over unique DAG claims.
5. Unique DAG requested: only consider DirectLiNGAM or functional models if assumptions are plausible; otherwise explain why uniqueness is not supported.
6. Discrete data: use tests/scores appropriate for discrete variables.
7. Large variable sets: reduce variables with domain/data logic first, use local discovery when the target is narrow, or use scalable algorithms with stability checks.
8. Default: PC/stable-PC or FCI depending on latent-confounding plausibility, with strong caveats.

## Diagnostics

- Sensitivity to alpha, conditional-independence test, score choice, and preprocessing.
- Bootstrap/subsample edge and orientation stability.
- Agreement with temporal tiers and required/forbidden edges.
- Hidden-variable assumptions and whether PAG output changes interpretation.
- Orientation confidence and equivalence-class ambiguity.
- Markov and faithfulness plausibility.
- Held-out likelihood or score diagnostics when score-based methods are used.
- Domain validation with the appropriate core reviewer.
- Data-pipeline validation by `data_analyst` when preprocessing, imputation, annotation, feature grouping, or time-windowing can change graph structure.
- Method validation by `method_lead` before using any discovered variable role, edge, or path to inform adjustment, identification, estimands, or framework choice.

## Discovery-Only Report Material

When the user asks for a causal discovery report rather than an effect estimate, prepare material for `subskills/05-report-writer/assets/discovery_report_template.md`:

- discovery question and scope;
- data and variable inventory;
- target graph object and method family;
- candidate graph findings;
- candidate causal paths, or a statement that stable paths are not supported;
- possible confounders, mediators, colliders, and adjustment warnings;
- diagnostics and stability checks;
- exploratory interpretation;
- recommended next effect-estimation questions, if useful;
- limitations and artifact paths.

Do not call this a final causal effect report. The report can recommend follow-up effect-estimation questions, but it must not run or imply effect estimation automatically.

## Report Support For Main Causal Reports

When discovery is used as an early sidecar for a broader causal project, prepare report-ready bullets even if the deliverable is not discovery-only:

- proposed section title, such as "Exploratory Causal Discovery";
- activation purpose and how it informed the project;
- data and variable set used, including preprocessing and provenance;
- graph target and method family;
- candidate structures or negative findings;
- stability/diagnostic results and what remains unchecked;
- implications that require `domain_expert`, `data_analyst`, or `method_lead` review;
- artifact paths for graphs, tables, edge lists, code, and diagnostics;
- cautious wording that keeps discovery as hypothesis-generating.

Use a visible report section when discovery was part of the user's requested features, was activated early to shape the project, or produced durable artifacts. Use only an appendix when it was a small diagnostic sensitivity check or not central to the user goal.

## Failure Modes

- Treating discovery output as proof.
- Ignoring hidden confounding or selection.
- Using cross-sectional data for temporal claims without explicit assumptions.
- Letting preprocessing create collider, leakage, or selection artifacts.
- Running high-dimensional conditioning with too few observations.
- Treating non-IID data as IID.
- Overinterpreting CPDAG/PAG marks as unique causal directions.
- Using discovered adjustment hints without `method_lead` review.
- Treating a discovery sidecar artifact as a gate or framework update.

## Handoff To Main Skill

Return the sidecar breadcrumb and, when useful, a compact optional `subskill_records` handoff:

```yaml
analysis_state:
  discovery_sidecar:
    active: true
    purpose: "graph exploration | graph comparison | variable screening | discovery diagnostics | discovery deliverable"
    return_to_phase: "causal_specification"
    affects_main_framework: false
    artifact_paths: []
```

Use a concrete `return_to_phase` while the sidecar is active: `causal_specification` for framework/DAG/design support, `report_production` for active-analysis, report, or appendix work, and `project_exploration` when the output is only helping the team learn. If the destination is unclear, ask the main skill to clarify with the user before activating or closing the sidecar.

On closure, ask the main skill to set `active: false` or pause the sidecar while preserving `purpose`, `return_to_phase`, `affects_main_framework`, and `artifact_paths`. Keep artifact paths in the sidecar breadcrumb, subskill record, report-support packet, working report, or analysis folders. Do not use the fixed package `artifact_index` as a sidecar reasoning field.

```yaml
subskill_id: "06-causal-discovery"
module_type: "discovery_sidecar"
role: "discovery_module"
status: "activated | reviewing | plan_proposed | diagnostics_reviewed | materials_ready | blocked | deferred"
activation_reason: null
inputs_reviewed: []
provenance_summary: null
fit_summary:
  fit: "exploratory"
  reason: null
type_specific:
  discovery_sidecar:
    sidecar_purpose: null
    graph_target: null
    related_framework_or_route: null
    method_family: []
    graph_object: null
    background_knowledge_used: []
    main_framework_implication: null
assumptions_or_requirements: []
diagnostics_needed: []
diagnostics_reviewed: []
sensitivity_or_robustness: []
limitations: []
requests:
  domain_expert: []
  data_analyst: []
  method_lead: []
  user: []
  other_subskills: []
report_support: []
readiness: "materials_ready | diagnostics_needed | diagnostics_deferred | blocked | candidate_only"
method_lead_recheck:
  required: false
  reason: null
blocking_signal:
  blocks_current_phase: false
  target_phase: null
  severity: "none"
  reason: null
  affected_sections: []
recommended_next_action: "ask_user | refresh_domain_expert | refresh_data_analyst | refresh_method_lead | refresh_report_writer | run_diagnostics | return_to_causal_specification | proceed_with_caveat"
artifact_paths: []
```

End with one of:

- ready for `method_lead` review;
- ready for `domain_expert`, `data_analyst`, or `report_writer` review;
- needs more discovery diagnostics;
- useful only as exploratory variable screening;
- discovery deliverable can be drafted with exploratory language;
- close sidecar and route the implication through the appropriate reviewer.

## Code Template Index

Subskill examples:

- `../examples/python_pc.py`: causal-learn PC baseline.
- `../examples/python_fci.py`: causal-learn FCI baseline.
- `../examples/python_ges.py`: causal-learn GES baseline for score-based exploration.
- `../examples/python_lingam_direct.py`: DirectLiNGAM baseline for linear non-Gaussian orientation assumptions.
- `../examples/python_tigramite_pcmci.py`: Tigramite PCMCI baseline for lagged time-series discovery.
- `../examples/r_pcalg_pc.R`: pcalg PC baseline.
- `../examples/r_pcalg_fci.R`: pcalg FCI baseline.
- `../examples/r_bnlearn_hc.R`: bnlearn hill-climbing.
- `../examples/java_tetrad_workflow.md`: Tetrad CLI and Java workflow.
- `../scripts/recommend.py`: rule-based algorithm recommender.
- `../sample_input.json`: example recommender input.

Use the local examples as templates; copy or adapt them into the project analysis folder before running.
