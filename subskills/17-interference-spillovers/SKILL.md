---
name: interference-spillovers
description: Use when one unit's treatment, exposure, assignment, behavior, or outcome can affect another unit's outcome, including spillovers, contamination, network effects, peer effects, diffusion, infectious disease transmission, households, schools, villages, markets, marketplaces, spatial exposure, cluster interference, neighborhood effects, social networks, equilibrium effects, and experiments or observational studies where SUTVA/no-interference is implausible.
---

# Interference and Spillovers

## Core Behavior

When this subskill is invoked, focus on defining the interference structure, exposure mapping, and estimand before recommending a model. Ordinary causal analyses assume one unit's treatment only affects that unit's outcome. In interference settings, that assumption is the problem, not a detail to fix with clustered standard errors.

Always do these six things:

1. **Name the units and links.** Identify the treatment unit, outcome unit, assignment unit, analysis unit, cluster, network, market, geography, time period, and whether links are observed, partially observed, inferred, directed, weighted, dynamic, or uncertain.
2. **Define the exposure mapping.** State how other units' treatments enter each unit's potential outcome: treated neighbor count, fraction treated, distance-weighted exposure, cluster saturation, market-side assignment, spatial dose, time-lagged exposure, or a custom domain mapping.
3. **Choose the estimand.** Distinguish direct, spillover/indirect, total, overall, global treatment, exposure-response, saturation, peer, equilibrium, and policy effects. Do not call a direct effect a total effect.
4. **Separate design from analysis.** Randomized designs, two-stage designs, graph-cluster randomization, switchbacks, multiple randomization designs, observational network analyses, and DiD/RD/SCM-with-spillovers need different assumptions.
5. **Check positivity and support for exposures.** Many interference estimands are not estimable because few units experience the needed own-treatment and neighbor-exposure combinations.
6. **Use design-aware inference.** Account for dependence from clusters, networks, markets, spatial links, repeated time, or randomization design. Cluster-robust SEs alone do not identify spillover effects.

## User-Facing Style

Be concrete and structural. Users often know "spillovers may exist" but do not know what effect they want. Translate terms when helpful:

- interference: "one unit's treatment can change another unit's outcome";
- exposure mapping: "the summary of other people's treatment that we think matters for this unit";
- direct effect: "what treatment does to treated units holding their spillover exposure fixed";
- spillover effect: "what others' treatment does to an untreated or fixed-own-treatment unit";
- total/global effect: "what happens when the policy is rolled out broadly, including knock-on effects";
- partial interference: "units can affect others inside groups, but not across groups";
- saturation design: "randomize how much treatment coverage each cluster gets, then randomize people within clusters."

A helpful early response is often:

> This is an interference problem because treatment can affect more than the treated unit. Before choosing a model, I would define who can affect whom, what exposure summary captures that spillover, and whether you want the direct effect on treated units, spillovers on others, or the total effect of scaling the intervention.

## Activation and Route-Out

Use this subskill when the user says or implies:

- spillover, interference, contamination, SUTVA violation, peer effects, network effects, social contagion, diffusion, herd immunity, infectious disease transmission, marketplace equilibrium, two-sided market, network experiment, graph cluster randomization, saturation design, partial interference, cluster interference, neighborhood effects, exposure mapping, treated neighbors, cluster saturation, spatial spillover, buffer zones, adjacent counties, donor contamination, market interference, switchback experiment, local interference, or total treatment effect under network spillovers.

Do **not** use this as the only workflow when:

- the user has a standard individual-level comparison and no plausible cross-unit effects: route to the primary design subskill;
- the question is mainly randomized trial execution with only a light interference screen: coordinate with `subskills/05-randomized-experiments/`;
- treatment is time-varying and feedback over time is central: coordinate with `subskills/10-longitudinal-gmethods/`;
- panel policy evaluation or staggered adoption is primary and spillovers contaminate controls: coordinate with `subskills/11-did-event-study/`;
- assignment is a cutoff with cross-cutoff spillovers: coordinate with `subskills/12-regression-discontinuity/`;
- an encouragement or IV affects peers: coordinate with `subskills/13-instrumental-variables/`;
- donor contamination or regional spillovers affect a synthetic-control design: coordinate with `subskills/14-synthetic-control-time-series/`;
- infection, contagion, or event times with censoring/competing risks dominate: coordinate with `subskills/15-survival-competing-risks/`;
- mechanisms through peers or network exposure are central: coordinate with `subskills/16-mediation/`;
- network links are being discovered or learned from data rather than specified: coordinate with `subskills/18-causal-discovery/` and treat learned links cautiously;
- missing links, measurement error in edges, selection into networks, attrition, or sample censoring dominate: coordinate with `subskills/02-data-inspector/`.

If this route is rejected, update the `subskill_analyses` entry as `rejected`, `fallback`, or `exploratory/user-forced`, record the failed condition, and return to the main skill's route shortlist. If the user insists on no-interference methods despite plausible spillovers, report the estimand as conditional on no spillovers and list likely bias direction only when scientifically justified.

## Interference Project Specification Entry

When a project specification is being maintained, append or update this compact entry under the top-level `subskill_analyses` list. Fill only fields that are known or decision-relevant. Do not duplicate global fields already captured under `main_skill`, `data_inspector_02`, `dag_builder_04`, `design_planner_03`, or `analysis_routing`.

```yaml
subskill_analyses:
  - subskill_id: "17-interference-spillovers"
    status: "candidate | selected | rejected | fallback | exploratory/user-forced"
    fit_to_user_need: null
    user_task: "spillover triage | direct effect | indirect effect | total/global effect | exposure-response | saturation design | network experiment | market experiment | observational network analysis | code | interpret result | unknown"
    unit_structure:
      treatment_unit: null
      outcome_unit: null
      assignment_unit: null
      analysis_unit: null
      clusters_or_groups: []
      network_or_link_data_available: null
      link_type: "household | school | village | friendship | trade | platform | geography | market | spatial adjacency | inferred | unknown"
      links_directed_or_weighted: null
      links_dynamic_or_static: null
      single_connected_network: null
    interference_structure:
      assumed_scope: "none | partial interference | cluster interference | network interference | spatial interference | marketplace/local interference | unknown"
      exposure_mapping: null
      exposure_components:
        own_treatment: null
        neighbor_treatment_count_or_fraction: null
        distance_weighted_exposure: null
        cluster_saturation: null
        market_side_exposure: null
        time_lagged_exposure: null
      exposure_levels_or_bins: []
      interference_radius_or_bandwidth: null
      possible_long_range_interference: null
      network_uncertainty_or_missing_links: null
    estimand:
      label: "direct effect | spillover/indirect effect | total effect | overall effect | global treatment effect | exposure-response effect | saturation effect | equilibrium effect | policy effect | unknown"
      target_population: null
      own_treatment_contrast: null
      spillover_exposure_contrast: null
      policy_or_allocation_contrast: null
      outcome_scale: null
      interpretation: null
    assumptions_needed:
      consistency_under_exposure_mapping: null
      correctly_specified_or_adequate_interference_scope: null
      randomization_or_exchangeability_given_network_and_covariates: null
      positivity_for_exposure_conditions: null
      no_unmodeled_cross_cluster_interference_if_partial: null
      stable_or_measured_network: null
      no_unmeasured_network_confounding: null
      design_known_or_assignment_probabilities_known: null
    diagnostics_or_checks:
      network_or_cluster_summary: null
      exposure_distribution: null
      exposure_positivity: null
      balance_by_exposure_condition: null
      sensitivity_to_exposure_mapping: null
      sensitivity_to_interference_radius: null
      contamination_or_spillover_audit: null
      dependence_robust_inference_plan: null
      placebo_or_randomization_tests: []
      network_measurement_checks: []
    estimation_plan:
      method_family: "two-stage randomized estimator | exposure mapping IPW/Hajek | regression with exposure mapping | randomization inference | network TMLE | cluster-level analysis | graph-cluster design | multiple randomization design | switchback/marketplace design | observational network propensity | DiD/spatial spillover | unknown"
      primary_method: null
      fallback_or_comparator: null
      software_backend: "R | Python | Stata | custom | either | unknown"
      inference_strategy: null
    fatal_flaws_or_major_limitations: []
    limitations: []
    open_questions: []
```

## Core Theory and Formal Definitions

Default notation in this subskill:

- \(i\): outcome unit;
- \(j\): another unit that may affect \(i\);
- \(A_i\): own treatment or assignment;
- \(A_{-i}\): treatment assignments of other units;
- \(G\): graph, network, market, cluster, or adjacency structure;
- \(N_i\): neighbors or relevant exposure set for unit \(i\);
- \(E_i=f_i(A_i,A_{-i},G)\): exposure condition or exposure mapping;
- \(Y_i(\mathbf{a})\): potential outcome for unit \(i\) under the full treatment assignment vector \(\mathbf{a}\);
- \(Y_i(e)\): potential outcome under exposure condition \(e\), when the exposure mapping is assumed adequate.

If the user uses different notation or variable names, adapt responses to the user's notation.

### Exposure mappings

A full interference model lets \(Y_i\) depend on the entire treatment vector \(\mathbf{A}\), which is usually too large to estimate. An exposure mapping reduces this to a lower-dimensional summary:

\[
Y_i(\mathbf{a}) = Y_i(e) \quad \text{when} \quad e=f_i(\mathbf{a},G).
\]

This is an identifying assumption, not just a feature engineering choice. Common mappings include own treatment plus number treated among neighbors, fraction treated among neighbors, distance-weighted exposure, cluster saturation, treatment of key peers, market-side exposure, or spatial dose.

### Direct and spillover effects

Direct effects compare own treatment levels while holding spillover exposure fixed, such as:

\[
E[Y_i(A_i=1,S_i=s)-Y_i(A_i=0,S_i=s)].
\]

Spillover effects compare exposure from others while holding own treatment fixed, such as:

\[
E[Y_i(A_i=a,S_i=s_1)-Y_i(A_i=a,S_i=s_0)].
\]

These are not the same as the total effect of deploying a policy widely.

### Total, overall, and global effects

Global or total effects compare policies or allocation regimes, for example all treated versus all control, high saturation versus low saturation, or one marketplace rule versus another. These often matter most for products, platforms, vaccines, information diffusion, and public policy, but they require more design structure than a simple individual contrast.

### Partial interference

Partial interference assumes interference can occur within groups but not across groups. This is useful for households, villages, schools, classrooms, clinics, or geographic clusters. It is often paired with two-stage randomization: first randomize cluster saturation, then randomize individuals within clusters.

### Network and spatial interference

Network interference uses observed links to define exposure. Spatial interference uses distance, adjacency, commuting, trade, migration, or geographic buffers. Both require sensitivity checks because the true relevant links and radius are rarely known exactly.

### Marketplace and equilibrium interference

In marketplaces, ads, pricing, supply, demand, ranking, matching, delivery, auctions, and inventory constraints create interference through equilibrium or congestion. The estimand should usually be a policy or global effect rather than an isolated individual treatment effect.

## Identification Assumptions

State these separately from model assumptions.

### Consistency under exposure mapping

The same exposure condition should imply the same potential outcome, regardless of irrelevant details of the full assignment vector. If "40% treated neighbors" is the exposure, the method assumes which neighbors are treated does not matter beyond that summary unless the mapping includes it.

### Known or defensible interference scope

Partial interference requires no cross-cluster spillovers. Network exposure requires the observed network or exposure proxy to capture the relevant pathways. Approximate-neighborhood approaches weaken sharp cutoffs but still need topology and dependence restrictions.

### Randomization or exchangeability

In randomized experiments, exposure probabilities must be induced by the known assignment design. In observational network settings, exchangeability is much stronger because treatment, network position, and peer exposure may all be confounded.

### Positivity for exposure

Every exposure condition being compared must have nonzero and adequate probability for relevant units. Positivity often fails for high-degree nodes, rare saturation levels, isolated units, or deterministic cluster policies.

### Dependence and inference

Outcomes are dependent across linked or clustered units. Inference should reflect the randomization design, network dependence, cluster dependence, spatial dependence, or repeated switchback structure.

### Network measurement

Missing, noisy, stale, directed, weighted, or post-treatment networks can bias exposure mappings. A network measured after treatment may itself be affected by treatment and should not be used casually as a baseline interference structure.

## Method Recommendation Rules

### Design-to-method table

| Situation | Default recommendation | Required checks |
|---|---|---|
| Cluster or household interference, separate groups | Partial-interference estimands; two-stage randomized estimators or cluster-level analysis | no cross-cluster spillovers, saturation support |
| Randomized saturation design | Hudgens-Halloran/Tchetgen-style direct, indirect, total, overall effects | cluster sizes, allocation probabilities, exposure support |
| Known network experiment | Exposure mapping plus Horvitz-Thompson/Hajek/IPW or regression equivalent | exposure probabilities, mapping sensitivity, network dependence |
| Single connected online/social network | Graph-cluster randomization, causal clustering, randomization tests, or exposure regression | cluster quality, graph cuts, bias-variance tradeoff |
| User wants global rollout effect | Graph-cluster or marketplace/global treatment design; total treatment effect estimators | policy contrast, extrapolation from experiment |
| Marketplace/platform with strategic interaction | Multiple randomization design, switchback, cluster/time design, or market-level experiment | market sides, congestion, temporal carryover |
| Observational network spillovers | Propensity or generalized propensity methods with exposure mapping; strong caveats | network confounding, homophily, link formation |
| Continuous treatment or exposure | Generalized propensity score or dose-response with network exposure | dose overlap, functional form, bandwidth/binning |
| DiD/RD/SCM with contaminated controls | Add spillover exposure mapping or spatial/network buffer; coordinate with design subskill | modified parallel trends/local assumptions |
| Unknown or approximate interference | Unknown/limited interference robustness, sensitivity to radius, network HAC/bootstrap | growth of interference, topology, conservative inference |
| Infectious disease/herd effects | Cluster/saturation designs, transmission models, or vaccine direct/indirect/overall effects | transmission network, time dynamics, censoring |
| No observed network but plausible spillovers | Cluster or spatial proxies; sensitivity/bounds; redesign if possible | proxy validity, exposure misclassification |

In normal responses, recommend one primary method and one practical comparator. Avoid long method catalogs unless the user asks for a survey.

## Language Backend Policy

Do not install packages silently. If packages are missing, show install commands and ask for approval.

### R

- `inferference`: implements IPW-style estimators for partial interference, including direct, indirect, total, and overall effects. Useful when the data match group-level partial interference.
- `tmlenet`: TMLE, IPTW, and g-computation for single-time-point interventions in network-dependent data with user-defined static, dynamic, or stochastic interventions. Check maintenance and assumptions before production use.
- `sna`, `igraph`, `statnet`, `network`, and `tidygraph`: build and summarize networks, degrees, components, neighborhoods, and exposure mappings.
- `sf`, `spdep`, and spatial packages: construct spatial adjacency, distance bands, and spatial exposure summaries.
- `fixest`, `sandwich`, `clubSandwich`, and `estimatr`: implement exposure regressions, cluster-robust inference, and custom estimators when design assumptions justify them.
- Custom R code is often appropriate for exposure mappings, IPW/Hajek estimators, randomization inference, and saturation summaries.

### Python

- `networkx`, `igraph`, `pandas`, `numpy`, and `scipy`: construct networks, exposure mappings, assignment probabilities, and custom estimators.
- `statsmodels` and `linearmodels`: exposure regressions, cluster/spatial/HAC style covariance estimators where appropriate.
- `geopandas`, `libpysal`, and `shapely`: spatial adjacency and spillover exposure.
- Custom Python code is often the most realistic path for randomized exposure estimators, graph-cluster diagnostics, and simulation-based randomization inference.

### Stata and other environments

- Stata can support exposure regressions, cluster/spatial covariance, and custom randomization inference, but interference-specific tooling is limited.
- Marketplace, switchback, and graph-cluster designs often require custom engineering pipelines to compute exposure and assignment probabilities.

When the user proposes a package or estimator, check whether it supports the design, assignment mechanism, exposure mapping, estimand, weights, dependence-robust inference, and diagnostics. Many generic network or peer-effect packages do prediction or association, not causal interference estimation.

## Custom Implementation Recipes

Many useful methods are not hard to implement once the design is clear.

### Exposure mapping

1. Build an adjacency matrix or edge list from pre-treatment links.
2. For each unit, compute own treatment \(A_i\).
3. Compute neighbor exposure \(S_i\), such as treated-neighbor count, treated-neighbor fraction, weighted sum, or binned exposure level.
4. Tabulate counts by \((A_i,S_i)\), cluster, degree, baseline covariates, and outcome availability.
5. Recompute under alternative radii, weights, bins, or edge definitions as a sensitivity check.

### Randomized network exposure estimator

1. Define exposure conditions \(e\), such as untreated with low exposure and untreated with high exposure.
2. Use the known assignment design or Monte Carlo simulation to estimate \(P(E_i=e)\) for each unit.
3. Estimate mean potential outcomes by Horvitz-Thompson or Hajek weighting:

\[
\hat{\mu}(e)=\frac{\sum_i 1(E_i=e)Y_i / \hat{p}_{ie}}{\sum_i 1(E_i=e)/\hat{p}_{ie}}.
\]

4. Contrast \(\hat{\mu}(e_1)-\hat{\mu}(e_0)\).
5. Use randomization, network-robust, cluster-robust, or conservative variance depending on the design.

### Observational exposure analysis

1. Define the target exposure contrast before looking at outcomes.
2. Model joint own-treatment and neighbor-exposure assignment using baseline covariates and network summaries.
3. Check balance and positivity across exposure groups.
4. Estimate an exposure-response curve or contrast using weighting, standardization, doubly robust estimation, or regression.
5. Treat results as more assumption-sensitive than randomized network experiments because network position and peer exposure are often confounded.

## Data Preprocessing Rules

1. Preserve raw unit IDs, cluster IDs, edge lists, network timestamps, treatment timestamps, outcome timestamps, assignment probabilities, and geography/market identifiers.
2. Use pre-treatment networks when possible. Flag post-treatment network measures as potentially affected by treatment.
3. Keep one row per outcome unit per outcome time, with separate tables for edges, clusters, assignments, and exposures when needed.
4. Compute degree, component, cluster, distance, and exposure summaries before outcome modeling.
5. Do not discard isolated units, high-degree nodes, cross-cluster edges, or contaminated controls without documenting the estimand change.
6. For spatial studies, predefine distance bands, adjacency rules, buffer zones, and border handling.
7. For marketplace studies, preserve market side, time, inventory, capacity, matching/ranking rules, and carryover windows.
8. For switchback or repeated designs, preserve time ordering, lag windows, seasonality, and carryover periods.
9. Track missing edges, missing outcomes, attrition, censoring, and selection into the observed network.
10. Store the exact exposure-mapping code or formula because it is part of the causal estimand.

## Required Diagnostics

### Structure diagnostics

- network or cluster summary: number of units, clusters, components, degree distribution, isolates, giant component, cross-cluster edges;
- treatment assignment by cluster/network position;
- exposure distribution by own treatment, degree, cluster, time, and baseline covariates;
- support for target exposure contrasts;
- spillover contamination of intended controls;
- network measurement timing and missing-link audit.

### Design and identification diagnostics

- assignment probabilities or exposure probabilities for randomized designs;
- balance by exposure condition for observational or covariate-adjusted designs;
- positivity and extreme-weight checks;
- sensitivity to exposure mapping, radius, weights, bins, and network uncertainty;
- cross-cluster spillover audit for partial interference;
- placebo exposure tests or randomization tests where possible.

### Inference diagnostics

- variance method matched to design: randomization, cluster, network HAC, bootstrap, permutation, or conservative design-based SE;
- sensitivity to clustering level or spatial bandwidth;
- leverage of high-degree nodes, large clusters, or dominant markets;
- finite-sample stability when the number of clusters or exposure-supported units is small.

## Failure Modes and Guardrails

Escalate warnings when:

- SUTVA/no-interference is assumed despite obvious peer, cluster, market, infectious, or spatial spillovers;
- the exposure mapping is chosen after seeing outcomes;
- the network is post-treatment but treated as baseline;
- treatment affects link formation and links are used to define exposure;
- partial interference is assumed while cross-cluster links are common;
- support is weak for key exposure contrasts;
- high-degree nodes dominate estimates;
- direct, spillover, total, and global effects are mixed together;
- controls are contaminated but interpreted as pure controls;
- cluster-robust SEs are used as if they solve interference bias;
- marketplace experiments ignore equilibrium, congestion, or supply-demand feedback;
- DiD, RD, or synthetic-control assumptions are claimed despite untreated units being affected by treated units;
- observational peer effects ignore homophily, selection into networks, or correlated shocks;
- a learned/predicted network is used without sensitivity to link uncertainty.

## Step-by-Step Operating Procedure

1. Restate the spillover question in domain language.
2. Identify units, links, clusters, time, assignment mechanism, treatment, outcome, and target population.
3. Decide the interference structure: none, partial, cluster, network, spatial, marketplace, temporal, unknown/approximate.
4. Define the exposure mapping and plausible alternatives.
5. Choose the estimand: direct, spillover, total, overall, global, exposure-response, saturation, equilibrium, or policy effect.
6. Identify the parent design: randomized, two-stage/saturation, graph-cluster, marketplace/switchback, observational, DiD/RD/SCM with spillovers, or descriptive.
7. Check exposure support, assignment probabilities, balance, network quality, and cross-cluster contamination.
8. Choose one primary estimator and one comparator/sensitivity analysis.
9. Plan inference matched to the design and dependence structure.
10. If diagnostics fail, change the exposure mapping, target a weaker estimand, aggregate to clusters/markets, redesign the experiment, or report a descriptive spillover analysis.
11. Record assumptions, diagnostics, limitations, and open questions in the project specification.

## Output Template

```markdown
### Interference / Spillover Analysis

#### 1. Design setup
- Outcome unit:
- Treatment/assignment unit:
- Clusters/network/geography/market:
- Treatment:
- Outcome:
- Timing:

#### 2. Interference structure
- Assumed scope:
- Exposure mapping:
- Alternative mappings to check:
- Network/link measurement:
- Positivity/support:

#### 3. Estimand
- Target estimand:
- Own-treatment contrast:
- Spillover exposure contrast:
- Policy/allocation contrast:
- Target population:
- Interpretation:

#### 4. Assumptions
- Consistency under exposure mapping:
- Randomization/exchangeability:
- Positivity:
- Network/cluster validity:
- Dependence/inference:
- Measurement/selection:

#### 5. Method recommendation
- Primary method:
- Comparator/fallback:
- Software/backend:
- Inference strategy:

#### 6. Diagnostics and sensitivity
- Network/cluster summary:
- Exposure distribution:
- Balance/positivity/weights:
- Mapping/radius sensitivity:
- Spillover contamination audit:
- Randomization/placebo tests:

#### 7. Interpretation
- Causal claim supported:
- What remains exploratory:
- Fatal flaws or major limitations:
- Recommended next step:
```

## Related Subskills

- `subskills/04-dag-builder/`: use for variable roles, graph structure, and interference-aware exposure maps.
- `subskills/05-randomized-experiments/`: use for standard randomized design audit, assignment probabilities, and cluster trials.
- `subskills/06-point-treatment-observational/`: use when own-treatment confounding is primary but spillovers need explicit modeling.
- `subskills/07-matching-weighting-balance/`: use for balance and positivity diagnostics across exposure groups.
- `subskills/08-doubly-robust-ml/`: coordinate for flexible nuisance models or doubly robust exposure-response estimators.
- `subskills/09-heterogeneous-effects-policy/`: use when treatment allocation or policy targeting under network interference is central.
- `subskills/10-longitudinal-gmethods/`: use for time-varying treatment, feedback, dynamic networks, and temporal spillovers.
- `subskills/11-did-event-study/`: coordinate for panel spillovers, contaminated controls, spatial DiD, and staggered policies.
- `subskills/12-regression-discontinuity/`: coordinate when spillovers cross a cutoff or geographic boundary.
- `subskills/13-instrumental-variables/`: use for peer encouragement, IV with spillovers, and noncompliance under interference.
- `subskills/14-synthetic-control-time-series/`: use when donor units or neighboring regions may be contaminated.
- `subskills/15-survival-competing-risks/`: use for infection, contagion, event times, censoring, and herd effects.
- `subskills/16-mediation/`: use when peer exposure is a mechanism or mediator.
- `subskills/02-data-inspector/`: use for missing links, network measurement error, attrition, selection, and censoring.
- `subskills/20-reporting-interpretation/`: use for final reports and careful spillover language.

## Reference Files

For the detailed workflow, read `references/workflow.md`. For the literature and software map, read `references/literature_and_software.md`.
