---
name: mediation
description: "Use as a target_goal method/task subskill for causal mediation, mechanisms, pathways, mediators, controlled direct effects, natural direct and indirect effects, interventional direct and indirect effects, separable effects, path-specific effects, mediator timing, mediator-outcome confounding, and mediation report support."
---

# mediation

## Role

Act as a bounded `target_goal` specialist for mechanism and pathway questions. Clarify whether the user wants a controlled direct effect, natural direct/indirect effect, interventional direct/indirect effect, separable effect, path-specific effect, descriptive mediation-style model, or a cautious mechanism discussion.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

This module defines and stress-tests the mediation target. It does not make a mechanism causal by itself; timing, confounding control, mediator meaning, and the selected design route still determine claim strength.

## When To Activate

Use this module when the project asks how an effect works, whether a mediator explains the effect, what portion is through a pathway, whether direct/indirect effects should be estimated, whether an intermediate variable should be adjusted for, or how to report mechanism/pathway evidence.

Do not activate it merely because a covariate is statistically associated with treatment and outcome. If the user only wants effect heterogeneity by a baseline subgroup, use `20-heterogeneous-effects`. If the user wants repeated time-varying mediators or treatment regimes, coordinate with `09-longitudinal-gmethods` and possibly `25-dynamic-treatment-policies`.

## Inputs To Read

Read only the compact state needed for the target question:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: mechanism plausibility, mediator construct meaning, intervention meaning, temporal ordering, and wording cautions.
- `data_analyst`: exposure/mediator/outcome timing, mediator missingness, mediator measurement, covariate timing, path variables, and artifacts.
- `method_lead`: design route, causal structure, estimand set, assumptions, confounding plan, sensitivity plan, and wording boundary.
- related `subskill_records`: especially design route, longitudinal g-methods, survival, negative control/proximal, doubly robust estimation, and double machine learning records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded target-goal details needed by this module.

## Fit / Failure Logic

Check these before recommending a method:

- Temporal order: exposure precedes mediator, mediator precedes outcome, and covariates are timed correctly.
- Mediator construct: the mediator is a meaningful pathway variable, not just a proxy, collider, selection variable, or post-outcome measure.
- Estimand: controlled, natural, interventional, separable, path-specific, or descriptive target is explicit.
- Confounding: exposure-outcome, exposure-mediator, and mediator-outcome confounders are identified and measured as needed.
- Exposure-induced mediator-outcome confounding: if present, ordinary natural direct/indirect effects usually need rethinking.
- Intervention meaning: natural or controlled mediator interventions must be scientifically interpretable enough for the target.
- Multiple mediators: order, dependence, and joint/interventional interpretation must be specified.
- Outcome scale: additive, ratio, odds, hazard, survival, or risk-scale decompositions can imply different interpretations.

Block or caveat causal mediation claims when timing is wrong, mediator-outcome confounding is unmeasured, exposure-induced mediator-outcome confounding is ignored, mediator intervention is not meaningful for the chosen estimand, cross-sectional timing is unsupported, or the selected design route only supports a total effect.

## Data Work It May Request

Ask `data_analyst` for one small, concrete follow-up by default:

- exposure, mediator, outcome, and covariate timing table;
- mediator missingness, measurement quality, and constructability checks;
- DAG/path variable map with baseline versus post-exposure covariates;
- mediator-outcome confounder availability and timing screen;
- descriptive path summaries clearly labeled as descriptive;
- sensitivity-analysis inputs for unmeasured mediator-outcome confounding;
- bootstrapping, imputation, or g-computation artifacts when a mediation target is feasible.

## Method Or Support Guidance

Distinguish common mediation targets:

- **Controlled direct effect (CDE)**: effect of exposure while setting mediator to a fixed value; often easiest to interpret as an intervention, but it does not decompose total effect by itself.
- **Natural direct/indirect effects (NDE/NIE)**: classic counterfactual decomposition; powerful but relies on strong cross-world and no mediator-outcome unmeasured confounding assumptions.
- **Interventional direct/indirect effects**: often more defensible for multiple mediators or exposure-induced mediator-outcome confounding; uses stochastic interventions on mediator distributions.
- **Separable effects**: useful when the exposure can be meaningfully decomposed into components acting through different pathways.
- **Path-specific effects**: DAG-defined pathway contrasts; require careful identification checks and often stronger assumptions.
- **Descriptive mediation-style analysis**: appropriate when timing or assumptions do not support causal mechanism claims.

Candidate method lanes:

- `mediation` R package for standard single-mediator natural effect workflows and sensitivity analysis.
- `regmedint` for regression-based closed-form mediation with exposure-mediator interaction and common outcome types.
- `medflex` for natural effect models with expanded data.
- `CMAverse` for broader causal mediation workflows, DAG support, multiple mediators, and sensitivity routines.
- `statsmodels` mediation for simple Python model-based mediation templates.
- DoWhy identification/refutation support when a causal graph and mediation estimand need explicit checking.
- Custom g-computation, weighting, TMLE, or longitudinal g-methods when standard package assumptions do not fit.

Use `scripts/recommend.py` with `sample_input.json` when quick target/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Diagnostics And Sensitivity

Review:

- exposure, mediator, outcome, and covariate ordering;
- confounder sets for exposure-outcome, exposure-mediator, and mediator-outcome relations;
- exposure-induced mediator-outcome confounding and whether the chosen estimand can handle it;
- mediator measurement error, missingness, positivity, and support;
- sensitivity to unmeasured mediator-outcome confounding;
- model form, interaction terms, bootstrap/simulation uncertainty, and imputation assumptions;
- multiple mediator ordering/dependence and whether decomposition language is defensible;
- outcome scale and whether "proportion mediated" is meaningful, stable, and not misleading.

Do not report a proportion mediated mechanically when direct and indirect effects have opposite signs, total effect is near zero, the scale is noncollapsible, or the estimand is not an additive decomposition.

## Output To Main Team

Return:

- mediation target and pathway definition;
- exposure, mediator, outcome, covariate timing status;
- whether the request is direct, adapted, exploratory, blocked, or not applicable;
- feasible method/package lane and why it fits;
- assumptions, diagnostics, limitations, and sensitivity needs;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.target_goal`:

- set `subskill_id`: `22-mediation`
- set `module_type`: `target_goal`
- set `role`: `target_module`
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `type_specific.target_goal`: `target_goal`, `estimand_targets`, `target_population`, `effect_scale`, `decision_or_interpretation_goal`, `design_route_needed`, and `reporting_boundary`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Mediation Analysis" or "Mechanism and Pathway Evidence";
- mediation question and relation to the user's causal claim;
- exposure, mediator, outcome, and covariate timing table;
- target estimand and why it fits the scientific mechanism;
- design route, identification assumptions, and untestable assumptions;
- method, software, model forms, interaction handling, and uncertainty method;
- direct/indirect/pathway estimates or descriptive artifacts if computed;
- sensitivity checks and unresolved blockers;
- claim boundary: causal mechanism, interventional pathway evidence, exploratory pathway analysis, or descriptive association;
- code, table, figure, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed mediation workflow, reviewer handoffs, diagnostics, and report integration.
- `references/literature_and_software.md`: literature map and R/Python package matrix.
- `examples/`: short R/Python templates for `mediation`, `regmedint`, `CMAverse`, and `statsmodels`.
- `scripts/recommend.py`: rule-based target/package recommender for quick internal triage.
