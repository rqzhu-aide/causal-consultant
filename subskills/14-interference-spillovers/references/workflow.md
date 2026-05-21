# Interference And Spillover Workflow

Use this file when interference support needs more detail than `SKILL.md`. The goal is to prevent the team from silently using a no-interference estimand when the scientific setting says units interact.

## 1. Define Units And Mechanism

Record:

- unit receiving treatment or exposure;
- unit where outcome is measured;
- cluster, group, network, market, or geography linking units;
- whether interference is direct, contagion, allocational, shared-resource, geographic, market/equilibrium, or contamination;
- timing: when own treatment, neighbor exposure, mediator/outcome contagion, and outcome are measured;
- whether the treatment can change the network or group membership itself.

Ask `domain_expert` to explain the mechanism in ordinary scientific terms. Do not start with a package.

## 2. Choose An Exposure Mapping

An exposure mapping turns the full treatment vector into a smaller exposure variable for each unit. Common choices:

- own treatment only: no-interference benchmark, usually not enough here;
- any treated neighbor;
- count or proportion of treated neighbors;
- weighted treated-neighbor exposure by tie strength, distance, recency, or interaction frequency;
- leave-one-out cluster saturation;
- distance/radius/kernel exposure in geography;
- lagged exposure over one or more prior periods;
- bipartite exposure, such as consumers exposed through treated sellers, clinicians, schools, or markets.

Exposure mapping is a causal assumption. The report should state why it is meaningful and show sensitivity to plausible alternatives.

## 3. Pick The Estimand

Keep direct and indirect effects separate:

- direct effect: own treatment changes while spillover exposure is held fixed or marginalized in a defined way;
- spillover/indirect effect: others' treatment changes while own treatment is fixed;
- total effect: own treatment and others' treatment change together;
- overall effect: population average under one treatment allocation policy versus another;
- saturation/policy effect: effect of moving a cluster/population from one treatment saturation level to another;
- exposure-response effect: outcome contrast across exposure-map levels;
- generalized ATE under unknown interference: marginal effect averaged over realized or randomized spillovers;
- local spillover LATE: IV-style effect among compliers or units with compliant peers.

If the user asks for a simple ATE, check whether that ATE mixes direct and indirect effects or whether a policy/saturation effect is more meaningful.

## 4. Match Design To Data

### Randomized Or Designed Settings

- Individual randomization with observed network: use exposure mapping and exposure probabilities when assignment is known.
- Cluster randomization: good for preventing cross-arm contamination if clusters are meaningfully separated.
- Two-stage/saturation design: randomize group saturation, then individual assignment; strong for direct and spillover effects under partial interference.
- Graph cluster randomization: useful when social network interference is expected and treatment can be correlated over graph clusters.
- Spatial experiment: use design-based spatial estimators or artificial/randomization inference when locations and assignment are known.

### Observational Settings

Require a stronger design story:

- own treatment confounding;
- neighbor exposure confounding;
- network homophily and shared environments;
- missing or endogenous ties;
- timing and feedback between outcomes and exposures.

Use generalized propensity/exposure models, outcome regression, doubly robust ideas, sensitivity analysis, and cautious wording. If the network is likely endogenous, ask whether the goal should become descriptive or exploratory.

### Panel, DiD, RD, IV, Or Synthetic Settings

- DiD with spillovers: define treated, untreated, spillover-exposed controls, and uncontaminated controls; coordinate with `10-did-event-study`.
- RD near boundaries: geographic spillovers can violate local comparison; coordinate with `11-regression-discontinuity`.
- IV with peers or encouragement: direct/spillover LATEs need special assumptions; coordinate with `12-instrumental-variables`.
- Synthetic/time-series: spillovers/displacement can contaminate donor or control regions; coordinate with `13-synthetic-control-time-series`.
- Longitudinal contagion: treatment may change outcomes that then affect peers; coordinate with `09-longitudinal-gmethods`.

## 5. Request Minimal Evidence

First-pass data checks:

- network/cluster/geographic summary;
- exposure-map construction code;
- support table crossing own treatment by spillover exposure;
- outcome and covariate summaries by exposure level;
- balance/overlap by exposure level;
- missing edge or boundary-unit summary;
- sensitivity table for alternative radii/lags/tie definitions;
- plot of treatment saturation or geographic exposure.

When data are not yet available, ask for the structure: clusters, network availability, treatment assignment process, and likely spillover radius.

## 6. Pick A Practical Implementation

Specialized tools are sparse, so implementation often combines:

- exposure construction: `igraph`, `tidygraph`, `sf`, `spdep`, `networkx`, `geopandas`;
- design-based/IPW: `inferference`, `interferenceCI`, `clusteredinterference`, `latenetwork`, custom Horvitz-Thompson/Hajek estimators;
- observational modeling: `glm`, `fixest`, `lme4`, `mgcv`, `SuperLearner`, `grf`, `xgboost`, `DoubleML`, `EconML`;
- dependence-aware inference: cluster robust SE, randomization/permutation inference, network HAC, spatial HAC, bootstrap;
- spatial-temporal spillovers: `geocausal`, `SpatialEffect`, `sf`, `spatstat`, `forecast`/time-series tools.

The method choice is less important than whether the exposure map, support, confounding control, and uncertainty method match the estimand.

## 7. Report Integration

The report writer should include a distinct interference/spillover subsection when this module materially affects the analysis. That subsection should include:

1. why no-interference is doubtful;
2. exposure mapping and timing;
3. estimands;
4. data support and diagnostics;
5. estimator/model and uncertainty;
6. sensitivity to alternative exposure maps;
7. limits on claim strength.

## 8. Common Failure Modes

- Treating contaminated controls as clean controls.
- Calling a total policy effect an individual direct effect.
- Defining an exposure map after seeing which one gives the desired answer.
- Ignoring network homophily in observational peer-effect studies.
- Using ordinary standard errors when outcomes are network/spatially dependent.
- Estimating spillovers without support for low, medium, and high exposure levels.
- Treating a missing network as if it proves no spillovers.
- Forgetting that treatment can change the network or group composition.
