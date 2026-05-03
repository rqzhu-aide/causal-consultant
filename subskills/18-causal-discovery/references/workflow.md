# Workflow: Causal Discovery

## Goal

Use for learning or comparing causal graphs from data using constraint-based, score-based, functional, or time-series discovery methods.

## Intake Checklist

- [ ] Is the goal graph discovery or effect estimation?
- [ ] Are there hidden confounders?
- [ ] Are variables temporally ordered?
- [ ] Are cycles possible?
- [ ] What assumptions are plausible: linearity, non-Gaussianity, additive noise, stationarity?
- [ ] What prior knowledge can constrain the graph?
- [ ] What language backend does the user prefer: Python, R, or Java?
- [ ] What is the sample size and number of variables?
- [ ] Is the data continuous, discrete, mixed, or text?
- [ ] Are there missing values?
- [ ] Is the data IID or time series / nonstationary?
- [ ] Does the user need a unique DAG or accept an equivalence class (CPDAG/PAG)?

## Estimand Checklist

- DAG
- CPDAG
- PAG
- ancestral relations
- candidate adjustment sets
- IDA-style effect bounds

The agent should state which estimand is being targeted and what estimands are not being targeted.

## Analysis Planning

1. Describe the data structure and timing.
2. Define the target estimand and scale.
3. Choose a primary method from the candidate methods.
4. List required assumptions and diagnostics.
5. State what would invalidate or weaken the analysis.
6. Specify software and code templates.
7. Plan sensitivity analyses.
8. State the expected graph type (DAG, CPDAG, PAG).

## Candidate Methods

- PC / stable-PC / MV-PC
- FCI / RFCI / GFCI / GRaSP-FCI
- GES / FGES / GIES / GRaSP / BOSS
- LiNGAM / DirectLiNGAM / ICA-LiNGAM / VAR-LiNGAM
- additive noise models (ANM)
- post-nonlinear models (PNL)
- Granger causality / PCMCI / CD-NOD
- IDA

## Recommendation Workflow

Run `../scripts/recommend.py` with a JSON input matching `../schemas/recommendation_input.schema.json` to get a structured recommendation.

Or follow the manual rules:

1. If text data -> COAT-style pipeline then FCI/PC/CD-NOD.
2. If time series or non-IID -> VAR-LiNGAM, PCMCI, Granger, or CD-NOD.
3. If missing values -> MV-PC or missing-value Fisher Z.
4. If latent confounders possible -> FCI (+ RFCI/GFCI fallback).
5. If unique DAG needed -> DirectLiNGAM.
6. If discrete -> PC with Chi-square/G-square.
7. If large (p>100 or n>=3000) -> GRaSP, BOSS, or FGES.
8. Default -> PC with Fisher Z.

## Diagnostics

- sensitivity to alpha/test or score choice
- bootstrap edge stability
- prior-knowledge constraints
- hidden-variable assumptions
- orientation confidence
- domain validation
- Markov and faithfulness plausibility
- held-out likelihood when score-based

## Common Packages

- Python causal-learn
- Python py-tetrad
- Python lingam
- Python tigramite
- R pcalg
- R bnlearn
- R causalDisco
- Java Tetrad (GUI, causal-cmd, tetrad-lib)

## Failure Modes

- discovery result treated as proof
- ignoring hidden confounding
- using cross-sectional data for temporal claims without assumptions
- data preprocessing creates collider/selection bias
- low sample size relative to variables
- high dimensional conditioning causing unstable CI tests
- non-IID data treated as IID
- strong faithfulness violations and near cancellations
- mixed data handled by an inappropriate continuous or discrete test
- overinterpreting CPDAG or PAG edge marks as unique directions

## Suggested Response Pattern

```markdown
I would treat this as a [causal-discovery] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```

## Code Template Index

See the following files in this subskill folder:
- `../examples/python_pc.py` — causal-learn PC baseline
- `../examples/python_fci.py` — causal-learn FCI baseline
- `../examples/r_pcalg_pc.R` — pcalg PC baseline
- `../examples/r_pcalg_fci.R` — pcalg FCI baseline
- `../examples/r_bnlearn_hc.R` — bnlearn hill-climbing
- `../examples/java_tetrad_workflow.md` — Tetrad CLI and Java workflow
- `../scripts/recommend.py` — rule-based algorithm recommender
- `../sample_input.json` — example recommender input

And at the package root:
- `scripts/python/causal_learn_pc_template.py`
- `scripts/python/causal_learn_fci_template.py`
- `scripts/R/pcalg_template.R`
- `scripts/R/pcalg_fci_template.R`
- `scripts/R/bnlearn_hc_template.R`
