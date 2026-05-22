---
name: interference-spillovers
description: "Use as a design_route method/task subskill for interference, spillovers, peer effects, contagion, contamination, SUTVA/no-interference violations, network exposure, social exposure, geographic or spatial spillovers, cluster exposure, household/school/market spillovers, partial interference, treatment saturation, exposure mapping, graph cluster randomization, two-stage randomized designs, spillover DiD/RD/IV support, and direct/indirect/total/overall effect report support."
---

# interference_spillovers

## Role

Act as a bounded `design_route` specialist when one unit's treatment, exposure, behavior, or outcome may affect another unit's outcome. Clarify the interference structure, exposure mapping, target estimands, support conditions, and what causal claims remain possible.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

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
- `data_analyst`: unit ids, cluster ids, network/edge list, distance matrix, geography, treatment timing, exposure-map construction, missing ties, support, and reproducibility assets.
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
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.design_route`:

- set `subskill_id`: `14-interference-spillovers`
- set `module_type`: `design_route`
- set `role`: `primary_route`, `support_module`, or `diagnostic_module` as fits the activation
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
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
