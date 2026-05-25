---
name: interference-spillovers
description: "Use as a design_route method/task subskill for interference, spillovers, peer effects, contagion, contamination, SUTVA/no-interference violations, network exposure, social exposure, geographic or spatial spillovers, cluster exposure, household/school/market spillovers, partial interference, treatment saturation, exposure mapping, graph cluster randomization, two-stage randomized designs, spillover DiD/RD/IV support, and direct/indirect/total/overall effect report support."
---

# interference_spillovers

## Role

Act as a bounded `design_route` specialist when one unit's treatment, exposure, behavior, or outcome may affect another unit's outcome. Clarify the interference structure, exposure mapping, target estimands, support conditions, and what causal claims remain possible.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Follow the shared `Common Constructed-Input Claim Checks` in `references/method_subskill_contract.md`: judge the analysis dataset used by this method, not source-data transformations in isolation. When `data_analyst` records constructed inputs, simplifications, or alignment limits, use existing `statistical_evidence`, `method_specific_limits`, `requests`, and `method_lead_recheck` fields to state whether the input supports this module's estimand and assumptions or needs reframing.

This module is often more about modeling logic than a single package. Mature tools exist for some partial, network, and spatial settings, but many projects need a custom exposure map plus design-based, IPW, regression, doubly robust, ML, spatial, or simulation support.

## When To Activate

Use this module when the project involves spillovers, peer effects, contagion, network influence, households, classrooms, villages, clusters, markets, platforms, social ties, geographic exposure, spatial proximity, contamination, treatment saturation, displacement, equilibrium effects, clustered assignment, graph cluster randomization, two-stage randomized designs, or any reason the no-interference/SUTVA assumption is doubtful.

Also use it when another module needs a spillover check: experiments with contamination, DiD with policy diffusion, RD near geographic boundaries, IV with peer encouragement, synthetic/time-series work with displacement, or observational exposure where neighbors' treatment may matter.

## Inputs To Read

Read only the compact state needed for interference support:

- `project_summary`: user goal, phase, data paths, deliverable, audience.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: mechanism of spillover, plausible contact/market/geographic structure, timing, direction, saturation meaning, and interpretation boundaries.
- `data_analyst`: analysis alignment, unit ids, cluster ids, network/edge list, distance matrix, geography, treatment timing, exposure-map construction, missing ties, support, and reproducibility assets.
- `method_lead`: causal claim, estimand set, assumptions, selected design route, diagnostics, sensitivity checks, and wording boundary.
- related `subskill_records`: especially randomized experiments, observational exposure, longitudinal g-methods, DiD/event study, RD, IV, synthetic/time-series, dose-response, DML, doubly robust estimation, survival, or transportability records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded design details needed by this module.

## Fit / Failure Logic

Check these before recommending software:

- Unit structure: treatment unit, outcome unit, exposure unit, and cluster/network/geographic unit are explicit.
- Interference mechanism: direct contact, contagion, shared group, market equilibrium, spatial proximity, resource displacement, or allocational interference is plausible and timed.
- Exposure mapping: each unit's spillover exposure can be represented by an interpretable function of others' treatment, timing, distance, or outcomes.
- Support: the data contain enough variation in own treatment and spillover exposure to estimate the intended direct, indirect, total, overall, or policy effect.
- Assignment or identification: randomization probabilities are known, or observational adjustment includes own covariates, neighbor covariates, network position, and exposure propensity/confounding logic.
- Dependence and inference: standard errors or uncertainty account for cluster, network, spatial, temporal, or randomization dependence.
- Missing structure: unobserved ties, unmeasured geography, hidden markets, or homophily are addressed rather than ignored.
- Spillover direction: donor/receiver direction, lag, radius, and decay are reasonable for the domain.
- Target: the estimand is not silently the no-interference ATE unless that is defensible.

Apply the common constructed-input checks to interference inputs. Network exposure mappings, spatial buffers, cluster summaries, peer-treatment doses, thresholds, or exposure categories can be valid, but the construction defines the estimand rather than serving as a neutral preprocessing detail. If mapping choices are post-hoc, outcome-informed, unsupported, or inconsistent with the assumed interference structure, keep claims exploratory or request reframing.

Block or heavily caveat causal spillover claims when exposure mapping is undefined, the relevant network/cluster/geography is unavailable, support across exposure levels is absent, interference contaminates the comparison group in an unmeasured way, timing is incompatible with the mechanism, or observational homophily/confounding is severe and unaddressed.

## Data Work It May Request

Ask `data_analyst` for one small, concrete interference check by default:

- unit, cluster, household, school, market, geography, time, treatment, outcome, covariate, and edge-list schema;
- treatment saturation by cluster, group, geography, or time;
- neighbor exposure variables such as treated-neighbor count/proportion, weighted exposure, distance-kernel exposure, lagged exposure, or leave-one-out group saturation;
- support tables for own treatment by spillover exposure category;
- degree distribution, component sizes, missing ties, isolated units, boundary units, and geographic distance summaries;
- timing checks showing whether exposure precedes outcomes;
- covariate balance or overlap by own treatment and exposure level;
- sensitivity to alternative radii, lags, tie definitions, weights, thresholds, or cluster definitions;
- reproducible exposure-construction code, network/geospatial plots, model outputs, and table/figure paths.

## Method Or Support Guidance

Choose the lane from the interference structure:

- Partial interference: units interact within clusters but not across clusters. Good fit for households, villages, schools, classrooms, clinics, or trial clusters; use direct, spillover/indirect, total, and overall effects.
- Two-stage or saturation designs: treatment saturation is randomized at cluster level and treatment is randomized within clusters. Strong option when design is possible or already used.
- Known randomized network exposure: define exposure mapping and use Horvitz-Thompson/Hajek-style estimators, randomization inference, graph cluster randomization, or exposure-probability weighting.
- Observational network interference: use extended unconfoundedness, generalized propensity or exposure models, outcome regression, doubly robust ideas, and strong homophily/measurement sensitivity.
- Spatial or geographic spillovers: use distance/radius/kernel exposure maps, spatial-temporal windows, geospatial preprocessing, and spatially aware inference; coordinate with RD or time-series modules when relevant.
- Contamination-only setting: if spillovers only threaten a standard design, recommend redesign, cluster-level analysis, buffer zones, ITT wording, or a bounded sensitivity analysis before estimating spillover effects.
- Noncompliance plus interference: coordinate with `12-instrumental-variables`; local direct/spillover effects may require IV-style exposure mappings or specialized tools.
- Longitudinal contagion: coordinate with `09-longitudinal-gmethods`; exposure timing, feedback, and outcome-mediated contagion need sequential logic.

Use `scripts/recommend.py` with `sample_input.json` when quick lane/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Statistical Evidence And Claim Scope

Fill `statistical_evidence` with the claim supported under the specified interference structure:

- `inference_supported` only when the exposure mapping, interference neighborhood, estimand, exposure probabilities or models, and dependence-aware uncertainty are explicit and credible.
- `exploratory_only` when spillover distance, network ties, exposure thresholds, saturation bins, or peer groups were selected after seeing outcomes or are weakly measured.
- `claim_scope`: direct, indirect/spillover, total, overall, saturation, network, or spatial effect under the recorded exposure map; the claim does not survive a different exposure map without sensitivity evidence.
- Valid routes include design-based/randomization inference under known assignment and exposure probabilities, partial-interference estimators, exposure-probability weighting, cluster/saturation designs, spatial or network HAC/cluster bootstrap/permutation, and simulation sensitivity to exposure-map choices.
- Do not use ordinary independent-unit SE, standard SUTVA wording, or simple treatment indicators when interference is material.

Treat the listed routes as examples, not an exhaustive whitelist. Equivalent, newer, or domain-adapted validation routes are acceptable when their assumptions, diagnostics, uncertainty logic, data-dependence handling, and supported claim scope are explicitly recorded in `statistical_evidence`.

For interference and spillover designs, the statistical claim is determined by the exposure map and dependency structure. The same fitted coefficient can mean different things under different network, cluster, spatial, or saturation definitions. Treat these as claim-boundary issues:

- the exposure mapping is part of the estimand; post-hoc tie/radius/threshold/saturation choices weaken claim strength;
- support is needed for own treatment and spillover exposure jointly, not just for a binary treatment indicator;
- randomized designs need exposure probabilities or compatible randomization inference; observational designs need explicit exposure-confounding logic;
- standard independent-unit uncertainty is usually wrong when outcomes or exposures are networked, clustered, spatial, or temporally dependent;
- unobserved ties, homophily, shared environments, market displacement, and spillover timing can make estimates descriptive or sensitivity-only.

### Writing The YAML Handoff

When writing `subskill_records.statistical_evidence`:

1. Set `status: inference_supported` only when the exposure map, estimand, assignment/exposure model, support, timing, and dependence-aware uncertainty route are explicit and credible.
2. Set `status: internally_validated` when alternative exposure maps, support tables, balance/overlap, network/geographic summaries, placebo/permutation, or dependence-aware sensitivity checks support the pattern but exposure validity remains assumption-bound.
3. Set `status: exploratory_only` when exposure variables, radii, tie definitions, saturation bins, peer groups, or lag windows were chosen after seeing outcomes or are weakly measured.
4. Set `status: blocked` when no interpretable exposure map can be built, support across exposure levels is absent, nominal controls are unmeasurably contaminated, or network/geographic data needed for the mechanism are unavailable.
5. Set `claim_scope` to `target_sample` for the observed units under the recorded exposure map, `internally_validated` for sensitivity-supported exposure effects, or `exploratory_only` for first-pass spillover screens.
6. Use `inference_or_validation_route` for interference-specific support: known randomization/exposure probabilities, Horvitz-Thompson/Hajek or exposure-propensity weighting, partial-interference estimators, two-stage/saturation design inference, graph-cluster or randomization inference, network HAC, spatial HAC, cluster bootstrap, permutation, or simulation over plausible exposure maps.
7. Use `method_specific_limits` to state the exact boundary: effect under this exposure map only, no SUTVA/no-interference claim, direct/spillover/total/overall not interchangeable, weak support for some exposure cells, observational homophily unresolved, or dependence-aware uncertainty still missing.
8. Ask `data_analyst` for the smallest missing check: exposure-map construction, support table by own and spillover exposure, treatment saturation, network/geography summaries, timing alignment, balance/overlap by exposure, alternative radii/lags/ties, contamination review, or dependence-aware uncertainty.
9. Set `method_lead_recheck.required: true` when the interference record changes the causal comparison, invalidates a no-interference design, adds direct/spillover estimands, changes gate status, or forces report wording to become exposure-map-specific.

Example - exploratory spillover screen:

```yaml
statistical_evidence:
  status: exploratory_only
  claim_scope: exploratory_only
  inference_or_validation_route:
    - "Current output uses a provisional neighbor-exposure variable; support, alternative maps, and dependence-aware uncertainty are not yet reviewed."
    - "Run own-treatment-by-spillover support tables and sensitivity to tie/radius/lag definitions."
  method_specific_limits:
    - "Cannot claim a spillover effect without a justified exposure map and uncertainty that accounts for dependence."
    - "Simple treatment-control language is not valid if interference is material."
requests:
  data_analyst:
    - "Construct exposure support tables, network/geographic summaries, alternative exposure maps, and a dependence-aware uncertainty plan."
method_lead_recheck:
  required: true
  reason: "Material interference may change the causal estimand and invalidate the current comparison-group logic."
```

Example - supported exposure-map analysis:

```yaml
statistical_evidence:
  status: inference_supported
  claim_scope: target_sample
  inference_or_validation_route:
    - "Exposure map, direct/spillover estimand, support, timing, and assignment or exposure model are documented."
    - "Randomization/exposure-probability, cluster/network/spatial HAC, bootstrap, permutation, or simulation-based uncertainty is used as appropriate."
  method_specific_limits:
    - "Claim applies under the recorded exposure map and should be sensitivity-checked against plausible alternatives."
    - "Direct, spillover, total, and overall effects must not be merged in report wording."
```

## Diagnostics And Sensitivity

Review:

- exposure-map definition, domain justification, timing, and alternatives;
- support and positivity across own treatment and spillover exposure;
- contamination of nominal controls;
- cluster/network/geographic boundary definitions;
- network missingness, degree distribution, component structure, and isolated units;
- homophily and shared-environment confounding in observational networks;
- sensitivity to exposure radius, tie strength, time lag, saturation thresholds, and distance decay;
- dependence-aware inference: cluster robust, randomization inference, network HAC, spatial HAC, bootstrap, or permutation where appropriate;
- whether direct and indirect effects are being mixed in wording or tables.

## Output To Main Team

Return:

- interference lane, unit structure, exposure mapping, support status, candidate estimands, and required assumptions;
- whether implementation is direct, adapted, exploratory, blocked, or not applicable;
- candidate packages/models, diagnostics, sensitivity checks, and limitations;
- statistical_evidence: status, exposure-map claim scope, interference-specific inference or validation route, and exact wording limits;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.design_route`:

- set `subskill_id`: `14-interference-spillovers`
- set `module_type`: `design_route`
- set `role`: `primary_route`, `support_module`, or `diagnostic_module` as fits the activation
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `statistical_evidence` using the section above before finalizing the record
- fill `type_specific.design_route`: `causal_comparison`, `design_route`, `identification_status`, `required_timing`, `comparison_group_logic`, `key_identification_assumptions`, `invalidating_conditions`, and `estimands_supported`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Interference and Spillover Design", "Network Exposure Analysis", "Treatment Saturation Design", or "Spatial Spillover Analysis";
- unit structure, interference mechanism, exposure mapping, timing, and target population;
- estimands: direct, spillover/indirect, total, overall, saturation policy, exposure-response, or generalized ATE under unknown interference;
- estimator/model, package, weighting/regression/ML/spatial design choices, and dependence-aware uncertainty method;
- exposure-map diagnostics, support tables, network/geospatial summaries, balance/overlap checks, and sensitivity to alternative mappings;
- limitations: unobserved ties, homophily, contamination, weak support, wrong exposure map, noncompliance, spillover direction uncertainty, and local or policy-specific interpretation;
- code, table, figure, model-object, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed interference/spillover workflow, team coordination, diagnostics, and report integration.
- `references/literature_and_software.md`: interference, network, spatial, and package matrix.
- `examples/`: short R/Python templates for exposure mapping, partial interference IPW, clustered/saturation designs, spatial exposure, and network-aware inference.
- `scripts/recommend.py`: rule-based interference/spillover recommender for quick internal triage.
