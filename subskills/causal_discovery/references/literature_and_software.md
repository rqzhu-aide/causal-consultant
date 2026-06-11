# Causal Discovery Literature And Software

Use these as orientation anchors. They do not prove that discovery fits a
project. Discovery implications must still pass through main and the relevant
core reviewers before they affect claims, adjustment, gates, or report wording.

Docs checked: 2026-06-10

## Research Anchors

- [Huber 2024, review of causal discovery in health and social sciences](https://link.springer.com/article/10.1186/s41937-024-00131-4):
  practical overview of assumptions, opportunities, and limits.
- [Glymour, Zhang, and Spirtes 2019](https://www.frontiersin.org/journals/genetics/articles/10.3389/fgene.2019.00524/full):
  graphical-model discovery review, including PC/FCI-style assumptions.
- [Andrews, Foraita, Didelez, and Witte 2021](https://arxiv.org/abs/2108.13395):
  practical constraint-based discovery guide for cohort data with mixed types,
  time ordering, and missingness.
- [Nogueira et al. 2022, JMLR](https://www.jmlr.org/papers/v23/20-1174.html):
  machine-learning causal discovery theories and applications.
- [Vowels, Camgoz, and Bowden 2023](https://arxiv.org/abs/2305.10032):
  survey of theory and practice.
- [Runge et al. time-series discovery references](https://jakobrunge.github.io/tigramite/):
  PCMCI, PCMCI+, LPCMCI, J-PCMCI+, regime-dependent, and multi-context time-series
  discovery.
- [TimeGraph 2025](https://arxiv.org/abs/2506.01361):
  benchmark design for robust time-series causal discovery under realistic
  temporal complications.
- [Barakati et al. 2025](https://arxiv.org/abs/2503.13833) and
  [Baldo, Ferreira, and Assaad 2024](https://arxiv.org/abs/2412.14019):
  examples of LLM-assisted causal discovery or ordering. Treat LLM output as
  background-knowledge support only, not graph evidence.

## Package Lanes

| Need | Python options | R / Java options | Notes |
|---|---|---|---|
| PC, FCI, GES-style exploration | [`causal-learn`](https://causal-learn.readthedocs.io/en/latest/search_methods_index/index.html) | [`pcalg`](https://cran.r-universe.dev/pcalg/doc/manual.html), [Tetrad](https://www.cmu.edu/dietrich/philosophy/tetrad/) | general graph-hypothesis lane; report equivalence class and assumptions |
| Bayesian network / score search | `causal-learn`, custom score search | [`bnlearn`](https://www.bnlearn.com/documentation/) | useful for structure exploration, not effect proof |
| Permutation/search alternatives | `causal-learn` GRaSP/BOSS where available | Tetrad search workflows | useful benchmark lane against PC/GES-style results |
| Local or high-dimensional discovery | local discovery, screening, stability selection | Tetrad/local workflows, custom screening | use for focal neighborhoods; avoid claiming a full DAG |
| Non-Gaussian functional discovery | [`lingam`](https://lingam.readthedocs.io/) | limited R support | DirectLiNGAM and VAR-LiNGAM need strong functional assumptions |
| Time-series discovery | [`Tigramite`](https://jakobrunge.github.io/tigramite/), `lingam` VAR variants | Tetrad SVAR-style workflows | PCMCI/PCMCI+/LPCMCI/J-PCMCI+ depend on lag, stationarity, and context assumptions |
| Optimization / differentiable DAG screens | [NOTEARS](https://github.com/xunzheng/notears), [DAGMA](https://github.com/kevinsbello/dagma), DAGMA-DCE research code | research implementations | screening or benchmark tools only; scale, tuning, thresholding, and stability matter |
| Graph handling and reporting | [`networkx`](https://networkx.org/documentation/stable/), `matplotlib` | [`igraph`](https://r.igraph.org/), `DiagrammeR`, `ggplot2` | artifacts need clear legends, paths, and exploratory wording |
| Background-knowledge support | LLM-assisted extraction, literature notes, domain constraints | manual domain review | never use LLM output as a discovered graph or validation by itself |

## Practical Selection Rules

- Need a unique DAG: only consider it when assumptions are unusually strong;
  otherwise report an equivalence class, PAG, local neighborhood, edge ranking,
  or candidate graph.
- Hidden confounding plausible: prefer FCI/PAG-style output or state that
  DAG-only output is incomplete.
- High-dimensional variables: reduce to a local neighborhood or
  data/domain-vetted variable set before broad discovery.
- Time-series data: use lagged discovery only after time order, stationarity,
  sampling interval, lag choices, and contemporaneous ambiguity are explicit.
- Multi-environment or multi-context data: consider context-aware time-series or
  multi-environment designs only when context variables and pooling assumptions
  are documented.
- Existing DAG uncertain: use discovery to generate alternatives or diagnostics,
  then route to `method_lead` and `causal_gatekeeper`.
- LLM-assisted discovery: use it to propose temporal tiers, candidate forbidden
  edges, or literature-derived constraints; route domain/gatekeeper review before
  relying on those constraints.
- Discovery-only deliverable: keep the report exploratory and separate from
  treatment-effect estimation.

## Diagnostics And Benchmarking

For any substantive run, record:

- graph object type: DAG, CPDAG, PAG, lagged graph, local neighborhood, edge
  ranking, or stability table;
- alpha/test/score/tuning/regularization choices;
- sensitivity to seed, preprocessing, variable set, missingness handling, and
  scaling;
- bootstrap, subsample, perturbation, or multi-method stability where feasible;
- temporal-tier, required-edge, and forbidden-edge consistency;
- hidden-confounding, selection, non-IID, measurement-error, nonstationarity, and
  benchmark limits;
- package versions and whether documentation/API behavior was checked during
  execution.

If diagnostics are missing, label the packet `candidate_only` or
`diagnostics_needed`.

## Tiny Code Skeletons

Primary docs: [causal-learn search methods](https://causal-learn.readthedocs.io/en/latest/search_methods_index/index.html),
[Tigramite documentation](https://jakobrunge.github.io/tigramite/),
[LiNGAM documentation](https://lingam.readthedocs.io/), and
[NetworkX documentation](https://networkx.org/documentation/stable/).

Reference-only unless main explicitly routes `execution_authorized` after
user-confirmed scope. Use only after the user-approved discovery purpose is
clear. Verify installed package versions and current docs before running. Do not
execute this skeleton from `feedback_only` or `bounded_inspection` mode. When
execution is authorized, create only outputs implied by the active step's
`execution.scope`, `execution.claim_boundary`, and `execution.expected_outputs`
inside `execution.analysis_dir`, write artifact paths into `discovery_sidecar`,
and write matching `artifact_index` entries.

If the chosen package is missing, the API differs, the graph target or algorithm
family needs to change, diagnostics must be dropped, the variable set changes,
or the output plan needs a new artifact, stop and write a repair or blocked
council option. Do not silently substitute a different discovery run.

```python
# Tiny sketch, not a complete script.
# PC/FCI/GES-style lane with causal-learn; replace data matrix and method.
from causallearn.search.ConstraintBased.PC import pc

graph_result = pc(data_matrix, alpha=0.05)
# Save graph_result, settings, edge list, and stability diagnostics.
```

```python
# Tiny sketch, not a complete script.
# Time-series lane with Tigramite; replace dataframe, variables, and lag range.
from tigramite.pcmci import PCMCI

pcmci = PCMCI(dataframe=tigramite_dataframe, cond_ind_test=ci_test)
results = pcmci.run_pcmci(tau_max=max_lag, pc_alpha=0.05)
# Save lagged links, plots, settings, and sensitivity checks.
```

```python
# Tiny sketch, not a complete script.
# Functional non-Gaussian lane with LiNGAM; use only if assumptions are plausible.
import lingam

model = lingam.DirectLiNGAM()
model.fit(data_matrix)
adjacency = model.adjacency_matrix_
# Save adjacency, ordering, residual checks, and caveats.
```

Artifact outputs to preserve in `discovery_sidecar.artifact_paths`: graph object
path, edge or stability table path, graph plot path, source code path, manifest
path, and technical note path.
