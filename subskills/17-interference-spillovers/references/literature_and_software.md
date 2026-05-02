# Literature and Software: Interference and Spillovers

## Purpose

This map supports subskill 13. Use it when selecting methods for interference, spillovers, exposure mappings, network experiments, partial interference, marketplace experiments, spatial spillovers, peer effects, infectious disease/herd effects, and contaminated comparison units.

This is a newer and fast-moving area. Package support is thinner than the literature. For many applied analyses, the right recommendation is not "install a package," but "define the exposure mapping, compute exposure probabilities or support, and implement a transparent estimator."

## Anchor Literature

### Early warnings and foundational estimands

- Sobel (2006), "What Do Randomized Studies of Housing Mobility Demonstrate?," is a classic warning that no-interference assumptions are implausible in neighborhood and social settings. Source: https://www.tandfonline.com/doi/abs/10.1198/016214506000000636
- Hudgens and Halloran (2008), "Toward Causal Inference With Interference," is the central partial-interference and two-stage randomization reference. It defines direct, indirect, total, and overall effects in group settings. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC2600548/
- Tchetgen Tchetgen and VanderWeele (2012), "On causal inference in the presence of interference," extends finite-sample inference, IPW estimators, and estimands under interference. Source: https://journals.sagepub.com/doi/10.1177/0962280210386779
- Halloran and Hudgens (2016), "Dependent happenings: a recent methodological review," is a useful review for infectious disease, vaccine, and herd-effect settings. Source: https://pubmed.ncbi.nlm.nih.gov/27454871/

### General interference, exposure mappings, and randomization inference

- Aronow and Samii (2017), "Estimating Average Causal Effects Under General Interference, with Application to a Social Network Experiment," provides the design, exposure mapping, and estimand framework that many later network-experiment papers build on. Source: https://isps.yale.edu/research/publications/isps18-01
- Athey, Eckles, and Imbens (2018), "Exact p-Values for Network Interference," develops exact randomization tests for network interference hypotheses. Source: https://www.tandfonline.com/doi/abs/10.1080/01621459.2016.1241178
- Basse, Feller, and Toulis (2019), "Randomization tests of causal effects under interference," gives a conditioning-mechanism framework for valid and more powerful randomization tests. Source: https://academic.oup.com/biomet/article-abstract/106/2/487/5306899
- Savje, Aronow, and Hudgens (2021), "Average Treatment Effects in the Presence of Unknown Interference," shows when ordinary estimators can still target generalized effects under limited but unknown interference, while ordinary confidence statements may fail. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC8372033/

### Network experiments and graph-cluster designs

- Ugander, Karrer, Backstrom, and Kleinberg (2013), "Graph cluster randomization," introduced graph-cluster randomization ideas for network A/B testing. Source: https://dl.acm.org/doi/10.1145/2487575.2487695
- Eckles, Karrer, and Ugander (2017), "Design and Analysis of Experiments in Networks: Reducing Bias from Interference," is a key network-experiment design and analysis paper. Source: https://www.degruyterbrill.com/document/doi/10.1515/jci-2015-0021/html
- Fatemi and Zheleva (2023), "Network experiment designs for inferring causal effects under interference," proposes network designs for direct and total effects and is useful for recent online/social-network experimentation. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC10150447/
- Viviano, Lei, Imbens, Karrer, Schrijvers, and Shi (2023, revised 2025), "Causal clustering: design of cluster experiments under network interference," frames cluster choice as a worst-case MSE optimization problem for global treatment effects. Source: https://ideas.repec.org/p/arx/papers/2310.14983.html

### Recent identification, regression, approximate interference, and network uncertainty

- Leung (2022), "Causal Inference Under Approximate Neighborhood Interference," weakens sharp neighborhood cutoffs by allowing distant treatments to have smaller nonzero effects; it also supports network HAC-style inference. Source: https://www.econometricsociety.org/publications/econometrica/2022/01/01/causal-inference-under-approximate-neighborhood-interference
- Leung (2024, revised 2025), "Identifying Treatment and Spillover Effects Using Exposure Contrasts," warns that common exposure regressions can reverse signs and gives conditions under which exposure contrasts are interpretable convex averages. Source: https://ideas.repec.org/p/arx/papers/2403.08183.html
- Gao and Ding (2023, revised 2025), "Causal inference in network experiments: regression-based analysis and design-based properties," shows how carefully specified weighted regressions can implement network-experiment estimators and covariance estimates. Source: https://ideas.repec.org/p/arx/papers/2309.07476.html
- Bhattacharya, Malinsky, and Shpitser (2019), "Causal Inference Under Interference And Network Uncertainty," treats uncertainty in the network itself as part of the causal problem. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC6935347/
- Li, Sussman, and Kolaczyk (2021), "Causal Inference under Network Interference with Noise," studies noisy network measurements and their impact on estimators. Source: https://arxiv.org/abs/2105.04518
- Clark and Handcock (2024), "Causal inference over stochastic networks," develops causal inference when the network is stochastic and outcomes may be dependent through network processes. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC11393554/
- Bhadra and Schweinberger (2025), "Causal Inference Under Network Interference," is a recent review/preprint that synthesizes fixed-network and random-network perspectives, experimental design, estimands, and open problems. Source: https://arxiv.org/abs/2508.06808

### Marketplace, platform, and multiple randomization designs

- Bajari, Burdick, Imbens, Masoero, McQueen, Richardson, and Rosen (2023), "Experimental Design in Marketplaces," reviews why standard A/B tests fail in interacting marketplaces and introduces multiple randomization design ideas. Source: https://www.gsb.stanford.edu/faculty-research/publications/experimental-design-marketplaces
- Masoero, Vijaykumar, Richardson, McQueen, Rosen, Burdick, Bajari, and Imbens (2026), "Multiple randomization designs: estimation and inference with interference," derives finite-sample properties and CLTs for simple multiple randomization designs under local interference. Source: https://academic.oup.com/jrsssb/advance-article/doi/10.1093/jrsssb/qkaf073/8422435
- Nabi, Pfeiffer, Charles, and Kiciman (2022), "Causal Inference in the Presence of Interference in Sponsored Search Advertising," is useful for advertising auctions and platform ranking examples. Source: https://www.frontiersin.org/articles/10.3389/fdata.2022.888592
- Chen and Simchi-Levi (2025, forthcoming), "Efficient Switchback Experiments with Surrogate Variables," is relevant for marketplace/switchback settings with temporal interference and surrogate outcomes. Source: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4436643

### Observational, spatial, continuous-treatment, and DiD spillovers

- Ogburn, Sofrygin, Diaz, and van der Laan (2020) and related work connect network causal inference, structural models, and dependence-aware estimation in observational settings.
- Forastiere, Del Prete, and Leone Sciabolazza (2024), "Causal inference on networks under continuous treatment interference," extends spillover analysis to continuous treatments using generalized propensity-score ideas. Source: https://www.sciencedirect.com/science/article/pii/S0378873323000515
- Xu (2023), "Difference-in-Differences with Interference: A Finite Population Perspective," proposes direct and spillover estimands with doubly robust DiD-style estimators under modified parallel trends. Source: https://arxiv.org/abs/2306.12003
- Christensen (2024, revised 2025), "Comparative Statics for Difference-in-Differences," studies DiD-style effects in equilibrium models with spillovers and interacting firms. Source: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4650630
- Papadogeorgou, Mealli, and Zigler (2019), "Causal inference with interfering units for cluster and population level treatment allocation programs," is useful for policies allocated at cluster/population levels. Source: https://pubmed.ncbi.nlm.nih.gov/30549231/

### Policy targeting and learning under interference

- Imai, Jiang, and Malani (2021), "Causal inference with interference and noncompliance in two-stage randomized experiments," is useful when encouragement, uptake, and spillovers interact. Source: https://www.tandfonline.com/doi/full/10.1080/01621459.2020.1775612
- Zhang and Imai (2023, revised 2025), "Individualized Policy Evaluation and Learning under Clustered Network Interference," is relevant when the user asks how to target treatments under clustered network interference. Source: https://ideas.repec.org/p/arx/papers/2311.02467.html
- Recent work by Leung, Viviano, Lei, Gao, Ding, Fatemi, Zheleva, Masoero, Vijaykumar, Clark, and others is worth tracking because influential results may be recent preprints or newly accepted papers with modest citation counts.

## Method Selection Notes

### Partial interference and saturation

Use when groups are credible independent interference blocks. This is the cleanest framework for many applied settings and maps naturally to direct, indirect, total, and overall effects.

### Exposure mapping

Exposure mapping is the workhorse for network interference. It can be simple, but it is a causal assumption. Always ask whether treated-neighbor count, fraction, weighted exposure, key-peer exposure, saturation, or distance band is scientifically meaningful.

### Graph-cluster randomization

Use prospectively when running network experiments. It trades bias reduction against variance and can be improved with graph partitioning or causal-clustering ideas.

### Regression-based implementation

Do not dismiss regression if the estimand and design are clear. Recent work shows that weighted regressions can reproduce design-based exposure estimators and make covariate adjustment easier, but covariance estimation must be chosen carefully.

### Marketplace and switchback designs

In two-sided markets, pricing, ads, matching, and ranking systems, the estimand should often be a market-level policy contrast. Multiple randomization or switchback designs may be more meaningful than unit-level A/B tests.

### Observational network spillovers

Treat as high-risk. Homophily, network formation, correlated shocks, and reflection problems can produce peer-effect-looking associations. Use baseline networks, balance checks, negative controls, and sensitivity analyses.

### Unknown and approximate interference

When the network/radius is uncertain, consider sensitivity to wider radii, limited-interference robustness, approximate-neighborhood results, conservative variance, and network uncertainty.

## Software Map

### R

- `inferference`: partial-interference estimators for direct, indirect, total, and overall effects using IPW-style methods. Documentation: https://rdrr.io/cran/inferference/
- `tmlenet`: TMLE, IPTW, and g-computation for network-dependent data with static, dynamic, or stochastic interventions. Documentation: https://www.rdocumentation.org/packages/tmlenet
- `igraph`, `sna`, `network`, `statnet`, `tidygraph`, and `ggraph`: network construction, visualization, components, degree, neighborhoods, and exposure mapping.
- `sf`, `spdep`, `spatialreg`, and `spatstat`: spatial adjacency, buffers, distance bands, and spatial dependence.
- `fixest`, `estimatr`, `sandwich`, `clubSandwich`, and `lmtest`: regression-based exposure estimators and robust/clustered covariance tools.
- `randomizr` and custom simulation code: assignment and randomization inference for graph-cluster or exposure designs.

### Python

- `networkx`, `igraph`, `graph-tool` where available, `pandas`, `numpy`, and `scipy`: custom network exposure mapping and estimator implementation.
- `statsmodels` and `linearmodels`: weighted regressions and covariance estimators; verify assumptions.
- `geopandas`, `libpysal`, `shapely`, and `scipy.spatial`: spatial spillover exposure.
- Custom simulation code is often needed for exposure probabilities, randomization inference, and graph-cluster diagnostics.

### Stata and other environments

- Stata can handle exposure regressions, cluster/spatial SEs, and randomization inference with custom code, but interference-specific packaged workflows are limited.
- Platform and marketplace experiments often need production data pipelines to compute assignment probabilities, market exposure, and carryover windows.

## Practical Implementation Patterns

### Exposure tabulation

For each unit, compute:

- own treatment;
- degree or cluster size;
- treated-neighbor count and fraction;
- weighted treated-neighbor exposure;
- cluster saturation;
- spatial exposure within distance bands;
- market-side exposure or capacity/congestion summaries;
- exposure bins with enough support.

Then tabulate outcome availability, baseline covariates, and treatment by exposure condition.

### Monte Carlo exposure probabilities

When analytical exposure probabilities are hard:

1. simulate the known randomization design many times;
2. recompute exposure \(E_i\) for every unit in each simulation;
3. estimate \(p_{ie}=P(E_i=e)\);
4. use \(p_{ie}\) in IPW/Hajek estimators;
5. report Monte Carlo error and repeat under alternative mappings.

### Randomization tests

Randomization tests are attractive when:

- assignment is known;
- sample or cluster count is small;
- asymptotic variance is dubious;
- the null can be made sharp by conditioning or artificial experiments;
- the user asks whether spillovers exist at all.

### Sensitivity recipes

Always consider at least one of:

- smaller/larger interference radius;
- count versus fraction treated;
- weighted versus unweighted exposure;
- excluding high-degree nodes;
- buffer zones around treated units;
- alternative cluster partitions;
- post-treatment carryover windows;
- network uncertainty or missing-link imputation;
- placebo exposure using pre-treatment outcomes.

## Diagnostics by Method

### Partial interference

- group counts and group-size distribution;
- cross-group links or spillover pathways;
- saturation support;
- direct/spillover contrast support;
- cluster-level balance;
- finite-cluster inference.

### Network randomized experiments

- degree distribution;
- components and giant component;
- exposure probabilities;
- high-degree leverage;
- treatment assignment by degree/community;
- exposure-mapping sensitivity;
- randomization or network-robust inference.

### Marketplace/switchback designs

- market-side balance;
- time-block balance;
- carryover and lag diagnostics;
- congestion/capacity metrics;
- equilibrium or substitution channels;
- seasonality and shocks.

### Observational network/spatial analyses

- baseline network timing;
- covariate and network-position balance;
- positivity and extreme weights;
- correlated shocks by geography/cluster;
- homophily and selection diagnostics;
- negative controls or placebo exposures.

## Red Flags

Do not let the analysis silently become a standard no-interference causal claim when:

- controls can be treated indirectly;
- untreated regions are adjacent to treated regions;
- marketplace treatment changes supply, demand, ranking, or prices for others;
- peers share information or behavior;
- infection or contagion is the outcome pathway;
- assignment is randomized but exposure to others' treatment is not balanced;
- the exposure mapping is selected after seeing outcomes;
- the network is post-treatment;
- exposure support is sparse;
- only clustered SEs are used to address spillover bias;
- observed peer effects may be homophily or correlated shocks;
- high-degree units or large markets dominate the effect.

## Reporting Language

Use precise language:

- "This estimates a spillover contrast comparing untreated units with high versus low treated-neighbor exposure, under the specified exposure mapping."
- "This is a global treatment effect approximation, not an individual direct effect."
- "The no-cross-cluster-spillover assumption is not credible here, so the partial-interference estimate should be treated as exploratory."
- "The package handles the IPW estimator, but the exposure mapping and exposure positivity are the key assumptions."

Avoid:

- "We controlled for spillovers" when only standard errors changed.
- "The treatment effect" without saying direct, spillover, total, or global.
- "No interference" when there are obvious peer, spatial, or market links.
- "Network-adjusted" without defining the network exposure.
