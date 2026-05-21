# Literature And Software Map

Use this file to choose credible interference, spillover, network exposure, partial interference, spatial spillover, and contamination tools. This area is still developing; the strongest workflow is usually a well-justified exposure mapping plus careful design, diagnostics, and uncertainty.

## Core Literature

### Foundations And Reviews

- Rubin (1980) and later potential-outcome work formalized no-interference/SUTVA as a standard assumption; this module activates when that assumption is doubtful.
- Sobel (2006), [What do randomized studies of housing mobility demonstrate?](https://doi.org/10.1198/016214506000000636): early social-science warning that no-interference can mislead.
- Hudgens and Halloran (2008), [Toward causal inference with interference](https://doi.org/10.1198/016214508000000292): direct, indirect, total, and overall effects under partial interference.
- Tchetgen Tchetgen and VanderWeele (2012), [On causal inference in the presence of interference](https://doi.org/10.1177/0962280210386779): IPW estimators and estimands for partial interference.
- Ogburn and VanderWeele (2014), [Causal diagrams for interference](https://doi.org/10.1214/14-STS501): distinguishes direct, contagion, and allocational interference.
- Causal Inference Under Network Interference (2025/2026 review), [arXiv overview](https://arxiv.org/abs/2508.06808): recent conceptual review across statistics, economics, health, and social sciences.

### Exposure Mapping, Network Experiments, And Unknown Interference

- Aronow and Samii (2017), [Estimating average causal effects under general interference](https://doi.org/10.1214/16-AOAS1005): exposure mapping, known assignment, and randomization-based estimators.
- Ugander et al. (2013), [Graph cluster randomization](https://arxiv.org/abs/1305.6979): graph clustering and exposure probabilities for network A/B tests.
- Eckles, Karrer, and Ugander (2017), [Design and analysis of experiments in networks](https://doi.org/10.1515/jci-2015-0021): design and analysis choices that reduce bias under network interference.
- Athey, Eckles, and Imbens (2018), [Exact p-values for network interference](https://doi.org/10.1080/01621459.2016.1241178): randomization inference for network interference hypotheses.
- Savje, Aronow, and Hudgens (2021), [Average treatment effects in the presence of unknown interference](https://doi.org/10.1214/20-AOS1973): generalized ATE behavior under limited unknown interference.
- Leung (2022), [Causal inference under approximate neighborhood interference](https://doi.org/10.3982/ECTA17841): approximate neighborhood interference and network HAC inference.
- Hu, Li, and Wager (2022), [Average direct and indirect causal effects under interference](https://doi.org/10.1093/biomet/asac008): direct/indirect effect definitions under cross-unit interference.

### Observational, IV, Spatial, And Applied Extensions

- Forastiere, Airoldi, and Mealli (2021), [Treatment and interference effects in observational network studies](https://doi.org/10.1080/01621459.2020.1768100): generalized propensity score logic for own and neighborhood treatment.
- Forastiere et al. (2022), [Estimating causal effects under network interference](https://www.jmlr.org/papers/v23/18-711.html): Bayesian/generalized propensity score framework for network interference.
- Vazquez-Bare (2023), [Causal spillover effects using instrumental variables](https://doi.org/10.1080/01621459.2021.2021920): IV-style direct/spillover effects under noncompliance.
- Hoshino and Yanagi (2023/2024), [Causal inference with noncompliance and unknown interference](https://doi.org/10.1080/01621459.2023.2284413): LATE-type parameters with network interference and companion `latenetwork`.
- Baird, Bohren, McIntosh, and Ozler (2018), [Optimal design of experiments in the presence of interference](https://ideas.repec.org/a/tpr/restat/v100y2018i5p844-860.html): randomized saturation design and power tradeoffs.
- Papadogeorgou, Imai, Lyall, and Li (2022), [Causal inference with spatio-temporal data](https://doi.org/10.1111/rssb.12548): spatial-temporal treatment and outcome processes with spillover windows.
- Mukaigawara et al. (2024), [geocausal R package](https://cran.r-universe.dev/geocausal/doc/manual.html): package support for spatio-temporal causal workflows.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`inferference`](https://search.r-project.org/CRAN/refmans/inferference/html/inferference.html) | R | Partial interference IPW estimands following Tchetgen Tchetgen/VanderWeele and related work | Purpose-built for direct/indirect/overall/total effects within groups | Narrow assumptions; formula/API requires care |
| [`interferenceCI`](https://www.rdocumentation.org/packages/interferenceCI/versions/1.1) | R | Confidence intervals for two-stage randomized experiments with binary outcomes | Closely tied to Hudgens-Halloran and Liu-Hudgens style estimands | Specialized to binary outcomes/two-stage settings |
| [`clusteredinterference`](https://www.rdocumentation.org/packages/clusteredinterference/versions/1.0.1/topics/clusteredinterference) | R | Observational clustered interference and population treatment policy effects | Useful when clusters are natural and policy effects are target | Low-download/niche; inspect assumptions and vignette |
| [`latenetwork`](https://www.rdocumentation.org/packages/latenetwork/versions/1.0.1) | R | LATE-style direct/indirect/spillover effects with noncompliance and unknown network interference | Connects interference with IV-style estimands | Specialized; requires instrument/noncompliance structure |
| [`SpatialEffect`](https://cdsamii.github.io/cds-demos/external/spatial-vignette.html) | R/GitHub | Design-based spatial experiments with interference | Useful when assignment locations and spatial spillover assumptions are known | Development package; validate against paper/vignette |
| [`geocausal`](https://cran.r-universe.dev/geocausal/doc/manual.html) | R | Spatio-temporal treatment/outcome event data and stochastic intervention strategies | Recent package for granular spatial-temporal causal inference | More specialized; needs careful event-process setup |
| [`networkinference`](https://pypi.org/project/networkinference/) | Python | Network-dependent inference, network HAC, TSLS/IPW, approximate neighborhood interference support | Rare Python package directly relevant to network dependence | More inference/dependence oriented than complete causal workflow |
| [`igraph`](https://r.igraph.org/) / [`tidygraph`](https://tidygraph.data-imaginist.com/) | R | Network exposure construction and diagnostics | Mature graph tooling | Does not identify causal effects by itself |
| [`networkx`](https://networkx.org/) | Python | Network exposure construction and diagnostics | Mature Python graph tooling | Does not identify causal effects by itself |
| [`sf`](https://r-spatial.github.io/sf/) / [`geopandas`](https://geopandas.org/) | R/Python | Geographic exposure construction, buffers, distances, joins | Essential for spatial spillover preprocessing | Spatial causal assumptions remain external |
| [`fixest`](https://lrberge.github.io/fixest/), [`lme4`](https://cran.r-project.org/package=lme4), [`mgcv`](https://cran.r-project.org/package=mgcv) | R | Regression analogs with own treatment and exposure mapping, fixed/random effects, smooth spillover functions | Practical and transparent for custom models | Causal validity depends on exposure/confounding/inference choices |
| [`grf`](https://grf-labs.github.io/grf/), [`SuperLearner`](https://cran.r-project.org/package=SuperLearner), [`xgboost`](https://xgboost.readthedocs.io/) | R/Python | Flexible nuisance or outcome models after exposure mapping is defined | Useful for high-dimensional confounding or nonlinear exposure response | Not a substitute for interference identification |
| [`DoubleML`](https://docs.doubleml.org/) / [`EconML`](https://econml.azurewebsites.net/) | R/Python | Orthogonal nuisance modeling around custom exposure variables | Useful for adapted observational workflows | Standard methods assume iid/no interference unless carefully adapted |

## Practical Selection Rules

- Need partial interference in clusters and a clear saturation policy: start with `inferference`, `interferenceCI`, or `clusteredinterference`.
- Need network A/B or randomized assignment with observed graph: define exposure mapping, compute exposure probabilities, and use randomization/IPW logic; use graph cluster randomization when designing the experiment.
- Need observational peer effects: start with the exposure map, homophily/confounding review, support table, and generalized propensity/outcome model; treat results as fragile unless the domain design is strong.
- Need geographic spillovers: build distance or buffer exposures with `sf`/`geopandas`; consider `geocausal` or `SpatialEffect` when the data match their assumptions.
- Need IV/noncompliance plus spillovers: activate `12-instrumental-variables` and consider `latenetwork` or Vazquez-Bare style estimands.
- Need DiD/RD/synthetic control with contamination: activate the relevant design-route module and use this module to define contaminated, spillover-exposed, and clean comparison units.
- Need ML: use it for nuisance prediction, exposure-response flexibility, or diagnostics after the exposure mapping is fixed; do not let ML invent the spillover estimand.
- Need report-ready evidence: include the exposure map, support, balance/overlap, dependence-aware uncertainty, sensitivity to alternative maps, and strict wording of direct versus indirect effects.
