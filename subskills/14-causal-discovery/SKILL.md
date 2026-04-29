---
name: causal-discovery
description: Use for learning or comparing causal graphs from data using constraint-based, score-based, functional, or time-series discovery methods. Supports Python, R, and Java workflows with structured recommendations, runnable code templates, and validation guardrails.
---

# Causal Discovery

## When to Use

- learn a causal graph
- discover causal structure
- PC/FCI/GES/LiNGAM
- conditional independence graph
- time-series causal discovery
- recommend, run, explain, compare, or debug causal discovery methods from tabular data, time series data, mixed data, or unstructured text that must first be converted into causal variables

## First Questions

- Is the goal graph discovery or effect estimation?
- Are there hidden confounders?
- Are variables temporally ordered?
- Are cycles possible?
- What assumptions are plausible: linearity, non-Gaussianity, additive noise, stationarity?
- What prior knowledge can constrain the graph?
- What language backend does the user prefer: Python, R, or Java?

## Target Estimands

- DAG
- CPDAG
- PAG
- ancestral relations
- candidate adjustment sets
- IDA-style effect bounds

## Candidate Methods

- PC / stable-PC / MV-PC
- FCI / RFCI / GFCI / GRaSP-FCI
- GES / FGES / GIES / GRaSP / BOSS
- LiNGAM / DirectLiNGAM / ICA-LiNGAM / VAR-LiNGAM
- additive noise models (ANM)
- post-nonlinear models (PNL)
- Granger causality / PCMCI / CD-NOD
- IDA

## Common Packages and Tools

- Python causal-learn (default for PC, FCI, GES, LiNGAM, ANM, PNL, GIN, GRaSP, BOSS, CD-NOD)
- Python py-tetrad (for broader Tetrad coverage from Python)
- Python lingam
- Python tigramite
- R pcalg (PC, FCI, RFCI, GIES)
- R bnlearn (Bayesian network structure learning, hill-climbing, score-based)
- R causalDisco (unified interface, Tetrad integration)
- Java Tetrad (GUI, causal-cmd CLI, tetrad-lib embedded)

## Required Diagnostics

- sensitivity to alpha/test or score choice
- bootstrap edge stability
- prior-knowledge constraints
- hidden-variable assumptions
- orientation confidence
- domain validation
- Markov and faithfulness plausibility
- held-out likelihood when score-based

## Red Flags

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

## Operating Instructions

1. Confirm the estimand and target population before recommending a method.
2. Confirm that variables used for adjustment or modeling have valid timing for this design.
3. State identification assumptions separately from model assumptions.
4. Propose a primary analysis and at least one diagnostic or sensitivity analysis.
5. If diagnostics fail, recommend redesign, a different estimand, or a weaker/descriptive interpretation.
6. When returning code, adapt variable names and include comments showing where the user must supply data-specific details.
7. Never present a discovered graph as definitive causal truth. Say it is a candidate causal structure under assumptions. Recommend intervention, expert knowledge, temporal order, or sensitivity checks whenever possible.

## Core Behavior

When invoked, do four things in order:

1. **Audit the input data or user description.** Use the minimum data audit schema below.
2. **Recommend one top method and two alternatives.** Use the recommendation rules and quick decision table.
3. **Generate runnable code** in the requested language: Python, R, or Java.
4. **State assumptions, expected graph type, and validation steps.**

## Minimum Data Audit

Collect or infer these fields. If the user does not give enough information, still give a default recommendation. Do not block unless a critical choice is impossible.

```json
{
  "n_samples": null,
  "n_variables": null,
  "data_type": "continuous | discrete | mixed | text | unknown",
  "has_missing_values": null,
  "is_iid": null,
  "is_time_series": null,
  "has_hidden_confounders": "yes | no | possible | unknown",
  "needs_unique_dag": null,
  "accepts_cpdag_or_pag": null,
  "has_interventions": null,
  "has_background_knowledge": null,
  "target_variable": null,
  "language": "python | r | java | unknown"
}
```

If the user gives a dataset, inspect sample size, number of variables, column types, missingness, constant columns, near duplicate columns, obvious time index, and text columns.

## Recommendation Rules

### Practical Defaults

- **PC with Fisher Z**: default for continuous IID tabular data when causal sufficiency is plausible and the user wants a fast, interpretable baseline.
- **FCI with Fisher Z**: when hidden confounders are possible and continuous variables are acceptable.
- **GES / FGES / GRaSP / BOSS**: when the data are large or the user wants a scalable score or permutation based method.
- **LiNGAM / DirectLiNGAM**: when the user believes the system is linear, acyclic, and non-Gaussian, and wants more edge orientation than CPDAG methods provide.
- **ANM / PNL**: when the user strongly believes pairwise or functional causal model assumptions are appropriate. Warn that these can be slower and assumption-sensitive.
- **CD-NOD**: when data are heterogeneous, nonstationary, or collected from changing environments.
- **VAR-LiNGAM / PCMCI / Granger causality**: when observations are not IID time series.
- **MV-PC or missing-value Fisher Z**: when missing values are present and the backend supports it. Otherwise recommend imputation plus sensitivity analysis.

### Observed-Variable Flow

If all major variables are observed:

| User belief | Main recommendation | Alternatives |
|---|---|---|
| Continuous, roughly linear Gaussian | PC + Fisher Z | GES or FGES + BIC, GRaSP + BIC |
| Continuous, linear non-Gaussian | DirectLiNGAM or ICA-LiNGAM | PC + Fisher Z, GES + BIC |
| Discrete | PC + Chi-square or G-square | GES or FGES + BDeu, bnlearn hill-climbing |
| Mixed | Encode or treat ordinal carefully, then PC or GES | Tetrad mixed methods, sensitivity checks |
| Nonlinear | PC or FCI + KCI | fastKCI or RCIT if available, GES or GRaSP + generalized score |
| Additive noise | ANM | CAM-style methods, pairwise ANM with caution |
| Post nonlinear | PNL | ANM, nonlinear CI-based methods |
| Large p or large n | GRaSP, BOSS, FGES | PC stable with restricted depth, score-based with background knowledge |

### Latent-Variable Flow

If hidden variables are possible:

| User belief | Main recommendation | Alternatives |
|---|---|---|
| Continuous, roughly linear Gaussian | FCI + Fisher Z | RFCI, GFCI |
| Discrete | FCI + Chi-square or G-square | RFCI, GFCI with discrete score |
| Nonparametric | FCI + KCI | fastKCI or RCIT |
| Linear non-Gaussian | RCD, GIN | LiNGAM variants with latent caution, FCI baseline |
| Additive noise with unobserved confounders | CAM-UV | FCI baseline |

### Scaling Rules

- If samples are below about 3000, KCI and generalized score are acceptable options.
- If samples are at least about 3000, prefer fastKCI, RCIT, or a faster baseline.
- If variables exceed about 100, recommend GRaSP, BOSS, or FGES as scalable choices.
- Always include a faster option when recommending a nonparametric method.

### Avoid Over-Fragmenting by Distribution

Do not force users to choose exact distributional assumptions unless it changes the algorithm choice. A good product recommendation should usually say:

> "Start with PC + Fisher Z for a fast baseline. If nonlinear relations are central and sample size is modest, compare against PC + KCI. If hidden confounders are plausible, use FCI."

This avoids pushing users toward very slow nonparametric methods by default.

### Text or Unstructured Data

When the input is text, do **not** run causal discovery directly on raw text embeddings as the default. Use a COAT-style pipeline:

1. Propose candidate causal variables from text.
2. Write annotation criteria for each variable.
3. Annotate each document into a structured table.
4. Run causal discovery on the structured table.
5. Use unexplained samples and graph errors as feedback to refine candidate variables.

Default graph algorithm after annotation:
- **FCI** if hidden factors are possible.
- **PC** if all major variables are believed observed.
- **CD-NOD** if documents come from different contexts or time periods.

## Language Backend Policy

### Python

Default package: **causal-learn**.

Use causal-learn for PC, MV-PC, FCI, CD-NOD, GES, ANM, PNL, LiNGAM variants, GIN, GRaSP, BOSS, and Granger-style methods when supported.

Use py-tetrad when the user specifically wants broader Tetrad coverage from Python.

Basic install:
```bash
pip install causal-learn pandas numpy scipy scikit-learn matplotlib graphviz pydot
```

### R

Default packages:
- **pcalg** for PC, FCI, RFCI, and GIES.
- **bnlearn** for Bayesian network structure learning (constraint-based, score-based, hybrid).
- **causalDisco** when the user wants a more unified interface and Tetrad integration.

Basic install:
```r
install.packages(c("pcalg", "bnlearn"))
install.packages("causalDisco")
```

### Java

Default package: **Tetrad**.

Routes:
1. Tetrad GUI for no-code users.
2. causal-cmd for command-line workflows.
3. tetrad-lib for embedded Java code.

For Java, always ask or infer the installed Tetrad version before writing detailed embedded code, because class names and constructors may change across versions. If version is unknown, provide causal-cmd or Tetrad GUI steps first.

Java recommendation rules:
- PC or FGES for fast observed-variable baselines.
- FCI, RFCI, GFCI, or GRaSP-FCI when latent confounders are plausible.
- BOSS, GRaSP, or FGES for large variable sets.
- Tetrad knowledge files for required edges, forbidden edges, tiers, and temporal order.

## Code Templates

- `scripts/python/causal_learn_pc_template.py`
- `scripts/python/causal_learn_fci_template.py`
- `scripts/R/pcalg_template.R`
- `scripts/R/pcalg_fci_template.R`
- `scripts/R/bnlearn_hc_template.R`
- `examples/python_pc.py` (subskill)
- `examples/python_fci.py` (subskill)
- `examples/r_pcalg_pc.R` (subskill)
- `examples/r_pcalg_fci.R` (subskill)
- `examples/r_bnlearn_hc.R` (subskill)
- `examples/java_tetrad_workflow.md` (subskill)
- `scripts/recommend.py` (subskill rule-based recommender)

## Data Preprocessing Rules

Before running discovery:
- Remove constant and near-constant columns.
- Check missingness and report missing percentage.
- Avoid one-hot encoding high-cardinality variables without explanation.
- Standardize continuous variables when using methods sensitive to scale.
- Preserve temporal order as background knowledge if known.
- Do not include post-treatment variables if the target is causal effect estimation.
- Avoid raw text embeddings as causal variables unless the user explicitly wants exploratory representation-level graphs.

## Background Knowledge Rules

Use background knowledge whenever available:
- **Temporal tiers**: past variables cannot be caused by future variables.
- **Forbidden edges**: impossible causal directions.
- **Required edges**: known direct mechanisms, but use sparingly.
- **Group constraints**: variables from the same measurement instrument may share artifacts.

Background knowledge should constrain the search, not force the final story.

## Graph Interpretation

- **DAG**: fully directed acyclic graph. More committed than CPDAG or PAG.
- **CPDAG**: Markov equivalence class under causal sufficiency. Undirected edges mean orientation is not identifiable from the available conditional independencies.
- **PAG**: equivalence class that allows latent confounders and selection effects. Circle marks indicate uncertainty about endpoint orientation.
- Undirected or partially directed edges are **not failures**. They can be the statistically honest output.

## Validation Rules

Always recommend at least two of these:
- Bootstrap edge stability.
- Rerun with different alpha values or scores.
- Compare PC, FCI, and score-based baselines.
- Check Markov and faithfulness plausibility.
- Use held-out likelihood when score-based.
- Ask domain experts to inspect forbidden and required edge constraints.
- Validate key edges through interventions or quasi-experiments when possible.

## Output Template

Use this structure for recommendations:

```markdown
### Causal Discovery Analysis Plan

- Causal question:
- Estimand:
- Data/design requirements:
- Primary method:
- Alternative method:
- Identification assumptions:
- Diagnostics:
- Sensitivity analyses:
- Packages/code templates:
- Interpretation cautions:

### Recommendation

Top choice: <method> with <test or score>
Why: <one sharp reason>
Graph returned: <DAG | CPDAG | PAG | pattern | other>

Alternatives:
1. <method>: <when to use>
2. <method>: <when to use>

Assumptions:
<short list>

Caveats:
<short list>

Code:
```<language>
<runnable code>
```

Validation:
<bootstrap, stability, background knowledge, compare methods, intervention or domain check>
```

## Quick Decision Table

| Situation | Use first | Fallback |
|---|---|---|
| Continuous IID, no strong latent concern | PC + Fisher Z | GES or FGES + BIC |
| Continuous IID, hidden confounders possible | FCI + Fisher Z | RFCI, GFCI |
| Missing values | MV-PC or missing-value Fisher Z | Imputation + sensitivity |
| Discrete | PC + Chi-square or G-square | BDeu score search |
| Mixed | Tetrad mixed methods or careful encoding | Separate analyses by type |
| Nonlinear, modest n | PC or FCI + KCI | fastKCI or RCIT |
| Very large p or n | GRaSP, BOSS, FGES | PC stable with depth limit |
| Non-IID or time series | VAR-LiNGAM, PCMCI, Granger, CD-NOD | Lagged PC or Tetrad SVAR |
| Text data | COAT-style factor proposal + annotation | Manual variable coding + FCI |
| Need a unique DAG | LiNGAM, ANM, PNL, score search | Report CPDAG/PAG honestly |

## Style Rules

Be concise. Prefer one top recommendation rather than listing every method. Explain why the recommended method matches the data. Give runnable code. Make assumptions visible. Do not make causal claims stronger than the method justifies.

For more detail, read `references/workflow.md` and `references/discovery_references.md` in this subskill folder.
