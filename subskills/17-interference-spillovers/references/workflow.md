# Workflow: Interference and Spillovers

## Goal

Use this workflow when one unit's treatment, exposure, assignment, behavior, or outcome can affect another unit's outcome. This includes social networks, households, schools, classrooms, villages, firms, markets, marketplaces, online experiments, infectious disease transmission, spatial spillovers, peer effects, diffusion, contamination, and cluster-level spillovers.

The key move is to replace "no interference" with an explicit interference structure and estimand. The analysis should define who can affect whom, how exposure is summarized, and which policy contrast is being estimated.

## Intake Checklist

- [ ] What are the treatment, assignment, outcome, and analysis units?
- [ ] What are the clusters, networks, markets, geographies, or time periods?
- [ ] Are links observed, inferred, weighted, directed, dynamic, missing, or measured after treatment?
- [ ] What is the likely spillover pathway: peer behavior, contagion, congestion, equilibrium, geography, information, resource constraints, or contamination?
- [ ] Is partial interference plausible, or is there one connected network/market?
- [ ] What exposure mapping summarizes other units' treatment?
- [ ] Does the user want a direct effect, spillover effect, total/global effect, saturation effect, exposure-response, or policy effect?
- [ ] Is treatment randomized, two-stage randomized, graph-cluster randomized, switched over time, observational, or quasi-experimental?
- [ ] Are assignment probabilities or exposure probabilities known or computable?
- [ ] Is there support for all target exposure conditions?
- [ ] What dependence-aware inference strategy is feasible?

## Estimand Checklist

The agent should state which estimand is being targeted and what estimands are not being targeted.

Common targets:

- direct effect;
- spillover or indirect effect;
- total effect;
- overall effect;
- global treatment effect;
- exposure-response effect;
- saturation effect;
- peer effect;
- equilibrium or marketplace policy effect;
- spatial spillover effect;
- network policy value;
- descriptive contamination or spillover audit.

### Choosing among estimands

Use a direct effect when the question is what own treatment does at a fixed level of peer exposure.

Use a spillover effect when the question is how others' treatment changes a unit's outcome at fixed own treatment.

Use a total/global effect when the question is what happens under broad rollout, high saturation, a marketplace rule, or a policy allocation.

Use saturation effects when clusters are assigned different treatment coverage levels.

Use exposure-response effects when peer or spatial exposure is continuous or ordinal.

Use a descriptive contamination audit when the design cannot identify causal spillovers but can show whether controls were plausibly exposed.

## Route Coordination

Interference is usually a design modifier, not a standalone data type.

| Parent route | Interference implication |
|---|---|
| Randomized experiment | use assignment probabilities; consider two-stage, graph-cluster, or randomization inference |
| Observational point treatment | model own treatment and spillover exposure; homophily/network confounding is a major threat |
| Matching/weighting | balance must be checked by exposure condition, not only own treatment |
| Doubly robust/ML | useful for flexible nuisance models, but exposure mapping remains a causal assumption |
| HTE/policy | policies may have equilibrium/network effects; ordinary individual CATEs may fail |
| Longitudinal g-methods | dynamic exposure, feedback, and changing links may require sequential interventions |
| DiD/event study | spillovers contaminate controls; define exposure by treated neighbors, distance, or market contact |
| RD | spillovers across cutoff/border can break local-control assumptions |
| IV | encouragement may affect peers; estimand may be local network effect rather than ordinary LATE |
| Synthetic control | donors exposed to treated unit are contaminated controls |
| Survival/infectious disease | herd effects and transmission require time/event-aware estimands |
| Mediation | peer exposure may be a mediator or pathway |
| Missingness/selection | missing links, network sampling, attrition, and post-treatment networks can dominate |

## Analysis Planning

1. Restate the user's spillover concern in domain language.
2. Define units, links, clusters, treatment, assignment mechanism, outcome, and timing.
3. Decide the interference structure: partial, cluster, network, spatial, marketplace, temporal, unknown, or approximate.
4. Define one primary exposure mapping and at least one sensitivity mapping.
5. Define the target estimand and effect scale.
6. Check whether the design identifies that estimand.
7. Compute exposure support, network/cluster summaries, and contamination diagnostics.
8. Choose the estimator and dependence-aware inference method.
9. Plan sensitivity analyses for exposure mapping, radius/bandwidth, link uncertainty, high-degree nodes, and cross-cluster exposure.
10. Define failure conditions and fallback language.

## Candidate Methods

### Partial interference and two-stage designs

Use when groups are plausibly independent but units interfere within groups. Common in households, villages, schools, clinics, and vaccine trials. Estimate direct, indirect/spillover, total, and overall effects using saturation and individual randomization.

### Exposure mapping with IPW/Hajek estimators

Use when treatment is randomized over a known network and exposure conditions can be computed. Estimate exposure-specific means using inverse exposure probabilities, often computed analytically or by Monte Carlo simulation of the assignment mechanism.

### Regression with exposure mappings

Use when the exposure mapping is clear and implementation needs to be transparent. Weighted least squares can reproduce Hajek-style estimators under suitable specification. Robust or adjusted covariance estimators are needed; ordinary model-based SEs are usually too optimistic.

### Randomization inference

Use for randomized experiments when exact or design-based tests are more credible than asymptotic approximations, especially with small clusters, unusual networks, or sharp/intersection nulls.

### Network TMLE and g-computation

Use for network-dependent data when the user needs flexible adjustment and the assumptions fit the software. Check whether the package handles the intervention, time point, network structure, and inference required.

### Graph-cluster randomization and causal clustering

Use prospectively when a network experiment can be designed. Cluster assignment can reduce interference bias for global effects but may increase variance. Recent causal-clustering work frames cluster choice as an optimization problem.

### Marketplace and multiple randomization designs

Use when several sides of a market interact: buyers/sellers, ads/queries, drivers/riders, inventory/customers, or ranking/matching systems. Multiple randomization designs, switchbacks, and market/time clusters can target main, direct, and spillover effects.

### Observational network/spatial methods

Use with caution when assignment is not randomized. Model own treatment and exposure jointly, adjust for baseline covariates and network position, check balance, and emphasize sensitivity to homophily, link formation, and correlated shocks.

### DiD/RD/spatial spillover extensions

Use when policy timing or cutoffs provide the primary design but neighboring untreated units may be exposed. Define exposed-control groups, buffer zones, distance bands, or treated-neighbor summaries and coordinate with the relevant parent subskill.

### Unknown or approximate interference

Use when the exact network or radius is uncertain. Consider limited/unknown interference robustness, approximate neighborhood interference, network HAC, conservative inference, and sensitivity to radii or exposure definitions.

## Domain-Specific Guidance

### Public health, vaccines, infectious disease, and herd effects

- Direct, indirect, total, and overall effects have clear public-health interpretations.
- Transmission dynamics and time-to-event outcomes may require survival or infectious-disease modeling.
- Cluster or saturation designs are often more interpretable than individual randomization.
- Censoring, depletion of susceptibles, and changing contact networks matter.

### Education, households, villages, and social programs

- Partial interference is often plausible but must be checked against cross-school, cross-village, sibling, teacher, or neighborhood links.
- Spillovers may be positive through information diffusion or negative through competition/resource displacement.
- Cluster sizes and saturation levels drive support and power.

### Online platforms, social networks, and product experiments

- Individual A/B tests can be biased when peer exposure affects outcomes.
- Graph-cluster randomization and exposure-aware analysis can reduce bias.
- High-degree nodes, communities, and one giant component can dominate exposure and variance.
- Network links may be dynamic and treatment-affected.

### Marketplaces, ads, pricing, ranking, and auctions

- Equilibrium, congestion, substitution, and capacity constraints often make individual treatment effects less relevant than policy or global effects.
- Multiple randomization designs and switchbacks are often more useful than simple user-level randomization.
- Time carryover and market-side interactions should be explicitly modeled.

### Spatial policy and regional spillovers

- Predefine adjacency, distance bands, commuting flows, trade links, or migration links.
- Use buffer zones or distance-to-treated exposure summaries as sensitivity checks.
- Spatial spillovers can invalidate DiD, RD, and synthetic-control donor assumptions.

## Diagnostics

### Required before causal interpretation

- unit/cluster/network/market map;
- exposure mapping definition;
- exposure distribution and support;
- cross-cluster or donor contamination audit;
- treatment/exposure balance by baseline covariates and network position;
- assignment or exposure probabilities for randomized designs;
- sensitivity to exposure radius, weights, bins, or cluster definitions;
- dependence-aware inference plan.

### Method-specific

For two-stage or saturation designs:

- cluster sizes;
- saturation distribution;
- within-cluster assignment probabilities;
- support for direct and spillover contrasts;
- cluster-level dependence and finite-cluster inference.

For network exposure estimators:

- degree distribution and isolates;
- exposure probabilities by degree;
- high-degree leverage;
- Monte Carlo error in exposure probability simulation;
- sensitivity to mapping and radius.

For graph-cluster or marketplace experiments:

- graph cut size and within-cluster retention;
- cluster balance and cluster sizes;
- expected exposure under assignment;
- bias-variance tradeoff;
- temporal carryover and market-side balance.

For observational network analyses:

- covariate balance across exposure groups;
- overlap and extreme weights;
- homophily/network confounding assessment;
- link formation timing;
- negative controls or placebo spillover tests.

## Failure Modes

- SUTVA is assumed because the software expects it, not because the science supports it.
- A cluster-robust SE is used to "handle spillovers" without changing the estimand.
- Exposure mapping is arbitrary and not checked.
- Exposure conditions have little or no support.
- The network is measured after treatment.
- Treatment affects links, and links define exposure.
- Cross-cluster spillovers violate partial interference.
- Controls are contaminated by treated neighbors, regions, or markets.
- High-degree nodes dominate the estimand.
- Direct, spillover, total, and global effects are conflated.
- Marketplace experiments ignore equilibrium or congestion.
- Observational peer effects ignore homophily or correlated shocks.
- DiD/RD/SCM designs use untreated comparisons that are actually spillover-exposed.
- Network uncertainty is ignored when links are noisy or sampled.

## Suggested Response Pattern

```markdown
I would treat this as an interference/spillover problem because [one unit's treatment can affect another unit's outcome through pathway].

The first design choice is the exposure mapping: for unit i, I would summarize spillover exposure as [mapping]. I would check [alternative mapping] as a sensitivity analysis.

The estimand should be [direct/spillover/total/global/exposure-response], not [nearby non-target estimand], because the user wants [plain-language goal].

A reasonable primary analysis is [method], using [software/custom code], because [design reason]. This requires [key assumptions], especially [interference scope/positivity/exchangeability].

If [main diagnostic] fails, I would [fallback: change mapping, aggregate to clusters, use descriptive contamination audit, redesign experiment, or weaken claim].
```

## Output Template

```markdown
### Interference / Spillover Analysis Plan

#### 1. Causal question and structure
- Treatment:
- Outcome:
- Treatment/assignment unit:
- Outcome/analysis unit:
- Network/cluster/market/geography:
- Timing:

#### 2. Exposure mapping
- Own-treatment component:
- Spillover component:
- Exposure levels:
- Alternative mappings:
- Positivity/support:

#### 3. Estimand
- Target estimand:
- Estimands not targeted:
- Target population:
- Effect scale:

#### 4. Identification assumptions
- Exposure mapping consistency:
- Interference scope:
- Randomization/exchangeability:
- Positivity:
- Network/link measurement:
- Dependence/inference:

#### 5. Estimation plan
- Primary method:
- Comparator/fallback:
- Software/custom implementation:
- Inference:

#### 6. Diagnostics and sensitivity
- Network/cluster summary:
- Exposure distribution:
- Balance/weights:
- Mapping/radius sensitivity:
- Contamination audit:
- Placebo/randomization tests:

#### 7. Interpretation
- What can be claimed causally:
- What remains exploratory:
- Fatal flaws or limitations:
- Next step:
```

## Implementation Note

Do not overstate software maturity. For many interference analyses, the most reliable approach is a short custom pipeline:

1. compute exposure mappings from a pre-treatment edge list or cluster table;
2. tabulate exposure support;
3. estimate exposure-specific means with design probabilities or regression;
4. use design-appropriate randomization, cluster, network, or conservative inference;
5. repeat under alternative mappings.

## Reference Files

- `literature_and_software.md`: literature map, recent methods, software, and practical implementation guidance.
