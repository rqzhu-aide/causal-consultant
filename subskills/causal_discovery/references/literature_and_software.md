# Causal Discovery Literature And Software

Use these as orientation anchors. They do not prove that discovery fits a project. Always route discovery implications through main and the relevant core reviewers before they affect claims, adjustment, gates, or report wording.

Docs checked: 2026-05-31

## Research Anchors

- [Huber 2024, review of causal discovery in health and social sciences](https://link.springer.com/article/10.1186/s41937-024-00131-4): practical overview of assumptions, opportunities, and limits.
- [Glymour, Zhang, and Spirtes 2019](https://www.frontiersin.org/journals/genetics/articles/10.3389/fgene.2019.00524/full): graphical-model discovery review, including PC/FCI-style assumptions.
- [Nogueira et al. 2022, JMLR](https://www.jmlr.org/papers/v23/20-1174.html): machine-learning causal discovery theories and applications.
- [Vowels, Camgoz, and Bowden 2023](https://arxiv.org/abs/2305.10032): survey of theory and practice.

## Package Lanes

| Need | Python options | R / Java options | Notes |
|---|---|---|---|
| PC, FCI, GES-style exploration | [`causal-learn`](https://causal-learn.readthedocs.io/en/latest/search_methods_index/index.html) | [`pcalg`](https://cran.r-universe.dev/pcalg/doc/manual.html), [Tetrad](https://www.cmu.edu/dietrich/philosophy/tetrad/) | good general graph-hypothesis lane |
| Bayesian network / score search | `causal-learn`, custom score search | [`bnlearn`](https://www.bnlearn.com/documentation/) | useful for structure exploration, not effect proof |
| Non-Gaussian functional discovery | [`lingam`](https://lingam.readthedocs.io/) | limited R support | DirectLiNGAM needs strong functional assumptions |
| Time-series discovery | [`Tigramite`](https://jakobrunge.github.io/tigramite/), `lingam` VAR variants | Tetrad SVAR-style workflows | lag choice and stationarity matter |
| Optimization / differentiable DAG screens | [NOTEARS](https://github.com/xunzheng/notears), [DAGMA](https://github.com/kevinsbello/dagma) | research implementations | use as screening or benchmark with stability checks |
| Graph handling and reporting | [`networkx`](https://networkx.org/documentation/stable/), `matplotlib` | [`igraph`](https://r.igraph.org/), `DiagrammeR`, `ggplot2` | artifacts need clear legends and paths |

## Practical Selection Rules

- Need a unique DAG: only consider it when assumptions are unusually strong; otherwise report an equivalence class or candidate graph.
- Hidden confounding plausible: prefer FCI/PAG-style output or state that DAG-only output is incomplete.
- High-dimensional variables: reduce to a local neighborhood or domain/data-vetted variable set before broad discovery.
- Time-series data: use lagged discovery only after time order, stationarity, and lag choices are explicit.
- Existing DAG uncertain: use discovery to generate alternatives or diagnostics, then route to `method_lead` and `causal_gatekeeper`.
- Discovery-only deliverable: keep the report exploratory and separate from treatment-effect estimation.

## Tiny Code Skeletons

Primary docs: [causal-learn search methods](https://causal-learn.readthedocs.io/en/latest/search_methods_index/index.html), [Tigramite documentation](https://jakobrunge.github.io/tigramite/), [LiNGAM documentation](https://lingam.readthedocs.io/), [NetworkX documentation](https://networkx.org/documentation/stable/)

Reference-only unless main explicitly routes `execution_authorized` after user-confirmed scope. Use only after the user-approved discovery purpose is clear. Verify installed package versions and current docs before running. Do not execute this skeleton from `feedback_only` or `bounded_inspection` mode. Save graph, diagnostic, figure, table, and source code paths for `artifact_index`.

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

Artifact outputs to preserve: graph object path, edge/stability table path, graph plot path, source code path.
