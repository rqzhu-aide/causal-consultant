# Workflow: Causal Discovery

## Goal

Use for learning or comparing causal graph hypotheses from data. Discovery is exploratory support unless the user explicitly asks for a discovery deliverable. It does not validate an effect-estimation route by itself.

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

1. Clarify whether discovery is a support step or the user's deliverable.
2. Inventory data structure, timing, background knowledge, and preprocessing risks.
3. Choose the target graph object and state what it can and cannot mean.
4. Choose candidate algorithms that match assumptions and graph target.
5. Define diagnostics before running: stability, tuning sensitivity, background-knowledge consistency, hidden-confounding checks, and domain plausibility.
6. Decide what artifact to produce for DAG Builder: edge list, graph plot, equivalence-class notes, stability table, and assumptions memo.
7. Record why the output should return to DAG Builder before affecting route commitment.

## Candidate Methods

- PC or stable-PC for constraint-based DAG/CPDAG exploration under causal sufficiency.
- FCI, RFCI, GFCI, or related PAG methods when latent confounding is plausible.
- GES, FGES, GIES, GRaSP, BOSS, or score-based search when score assumptions and scale fit.
- LiNGAM, DirectLiNGAM, ICA-LiNGAM, or VAR-LiNGAM when non-Gaussian functional assumptions are plausible.
- Additive noise or post-nonlinear models when functional-form assumptions are central.
- Granger, PCMCI, CD-NOD, or lagged discovery workflows for time series or nonstationary settings.
- IDA-style effect bounds only as graph-implied exploratory bounds, not final effect estimates.

## Recommendation Workflow

Run `../scripts/recommend.py` with JSON input matching `../schemas/recommendation_input.schema.json` when a quick algorithm recommendation is useful.

Manual routing rules:

1. Text-derived variables: treat NLP extraction as a preprocessing risk; prefer DAG Builder review before discovery claims.
2. Time series or non-IID data: consider VAR-LiNGAM, PCMCI, Granger, or CD-NOD.
3. Missing values: use methods that explicitly handle missingness or ask Data Technician to review imputation/selection first.
4. Latent confounding plausible: prefer FCI/PAG-style output over unique DAG claims.
5. Unique DAG requested: only consider DirectLiNGAM or functional models if assumptions are plausible; otherwise explain why uniqueness is not supported.
6. Discrete data: use tests/scores appropriate for discrete variables.
7. Large variable sets: reduce variables with domain/data logic first, or use scalable algorithms with stability checks.
8. Default: PC/stable-PC or FCI depending on latent-confounding plausibility, with strong caveats.

## Diagnostics

- Sensitivity to alpha, conditional-independence test, score choice, and preprocessing.
- Bootstrap/subsample edge and orientation stability.
- Agreement with temporal tiers and required/forbidden edges.
- Hidden-variable assumptions and whether PAG output changes interpretation.
- Orientation confidence and equivalence-class ambiguity.
- Markov and faithfulness plausibility.
- Held-out likelihood or score diagnostics when score-based methods are used.
- Domain validation with Domain Helper and DAG Builder.

## Failure Modes

- Treating discovery output as proof.
- Ignoring hidden confounding or selection.
- Using cross-sectional data for temporal claims without explicit assumptions.
- Letting preprocessing create collider, leakage, or selection artifacts.
- Running high-dimensional conditioning with too few observations.
- Treating non-IID data as IID.
- Overinterpreting CPDAG/PAG marks as unique causal directions.
- Using discovered adjustment hints without DAG Builder review.

## Handoff To Main Skill

Return a compact handoff:

```yaml
subskill_id: "18-causal-discovery"
role: "discovery_module"
status: "one value from assets/workflow_enums.yaml > method_job_statuses"
activation_reason: null
selected_route_id: null
inputs_reviewed: []
outputs_created: []
diagnostics_reviewed: []
limitations: []
feedback_for_main_skill: []
requests_for_main_skill: []
readiness: "one value from assets/workflow_enums.yaml > production_loop_readiness"
blocking_signal:
  blocks_current_phase: false
  requires_previous_phase_recheck: false
  target_phase: null
  severity: "none"
  reason: null
  affected_sections: []
recommended_next_action: "one value from assets/workflow_enums.yaml > main_actions"
artifact_paths: []
```

End with one of:

- ready for DAG Builder review;
- needs more discovery diagnostics;
- useful only as exploratory variable screening;
- discovery deliverable can be drafted with exploratory language;
- return to foundation because timing, latent structure, or route assumptions changed.

## Code Template Index

Subskill examples:

- `../examples/python_pc.py`: causal-learn PC baseline.
- `../examples/python_fci.py`: causal-learn FCI baseline.
- `../examples/r_pcalg_pc.R`: pcalg PC baseline.
- `../examples/r_pcalg_fci.R`: pcalg FCI baseline.
- `../examples/r_bnlearn_hc.R`: bnlearn hill-climbing.
- `../examples/java_tetrad_workflow.md`: Tetrad CLI and Java workflow.
- `../scripts/recommend.py`: rule-based algorithm recommender.
- `../sample_input.json`: example recommender input.

Root templates:

- `scripts/python/causal_learn_pc_template.py`
- `scripts/python/causal_learn_fci_template.py`
- `scripts/R/pcalg_template.R`
- `scripts/R/pcalg_fci_template.R`
- `scripts/R/bnlearn_hc_template.R`
