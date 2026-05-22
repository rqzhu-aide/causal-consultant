---
name: heterogeneous-effects
description: "Use as a target_goal method/task subskill for heterogeneous treatment effects, subgroup or strata effects, CATE, GATE, ITE-style prediction, effect modifiers, causal forests, meta-learners, interaction models, heterogeneity diagnostics, and heterogeneity report support."
---

# heterogeneous_effects

## Role

Act as a bounded `target_goal` specialist for questions about whether effects differ across groups, covariates, strata, sites, time periods, or units. Clarify the heterogeneity target, effect scale, modifier set, prespecified versus exploratory status, and what claim can be made from the current design and data.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

This module defines and evaluates a heterogeneity target. It does not supply identification by itself; the selected design route and `method_lead` still determine causal validity and claim strength.

## When To Activate

Use this module when the project asks about subgroup effects, effect modification, strata, moderators, heterogeneity, CATE, GATE, ITE-style estimates, causal forests, meta-learners, site-specific effects, group-specific effects, personalized effect estimates, or exploratory heterogeneity screening.

Do not use it when the user wants an actual treatment assignment rule or budgeted targeting decision; route those to `21-point-treatment-rules`. Do not use post-treatment variables as effect modifiers unless `method_lead` reframes the target as mediation, principal strata, separable effects, or another valid post-treatment estimand.

## Inputs To Read

Read only the compact state needed for the target question:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: meaningful effect modifiers, subgroup definitions, mechanisms, external validity, fairness/safety context, and wording cautions.
- `data_analyst`: sample size, subgroup support, variable timing, missingness, overlap, split/cross-fit plan, plots, and artifacts.
- `method_lead`: design route, selected framework, estimand set, assumptions, causal structure, sensitivity plan, and wording boundary.
- related `subskill_records`: especially design route, matching/weighting, doubly robust estimation, double machine learning, point treatment rules, transportability, and survival records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded target-goal details needed by this module.

## Fit / Failure Logic

Check these before recommending a method:

- Target type: prespecified subgroup contrast, GATE, CATE function, ITE-style prediction, effect-modifier screening, or report-only descriptive heterogeneity.
- Modifier timing: effect modifiers should be baseline/pre-treatment or otherwise justified by a valid target.
- Domain meaning: subgroup or covariate contrasts should be interpretable and useful, not just mechanically discovered.
- Support: each subgroup or covariate region needs enough observations, treatment variation, and overlap for the selected design.
- Scale: risk difference, risk ratio, odds ratio, hazard, RMST, mean difference, or another scale must match the scientific question.
- Prespecification: confirmatory subgroup claims require stronger prespecification, multiplicity control, and stable estimates than exploratory screening.
- Validation: flexible CATE claims need honest splitting, cross-fitting, out-of-sample diagnostics, or external validation when possible.

Block or caveat claims when modifiers are post-treatment, sparse, data-mined without validation, not meaningful to `domain_expert`, lack overlap within subgroup, or rely on an unsupported design route.

## Data Work It May Request

Ask `data_analyst` for one small, concrete follow-up by default:

- subgroup counts, outcome rates, treatment rates, and missingness by candidate modifier;
- overlap, balance, or support plots within subgroups or covariate regions;
- baseline timing and constructability check for effect modifiers;
- prespecified interaction-ready variables or grouped strata;
- train/test, honest splitting, or cross-fitting plan for flexible learners;
- CATE/ranking plots, calibration diagnostics, RATE/Qini/AUUC-style ranking checks, or GATE tables;
- stability checks across learners, folds, seeds, covariate sets, and simpler models.

## Method Or Support Guidance

Distinguish common heterogeneity targets:

- **Prespecified subgroup effects**: estimate effects in domain-defined groups; strongest for reporting if groups are meaningful and supported.
- **GATE**: group average treatment effects for groups, strata, sites, or bins; useful for interpretable summaries and simultaneous inference.
- **CATE**: conditional average treatment effect as a function of covariates; useful for learning patterns, not automatically a policy.
- **ITE-style prediction**: individual-level effect predictions are model-based summaries, not directly observed individual causal effects.
- **Exploratory screening**: generates hypotheses; requires cautious wording and follow-up validation.

Candidate method lanes:

- Interaction models or stratified estimands when the modifier set is small, prespecified, and interpretability matters.
- Honest causal trees when a simple subgroup partition is desired.
- Causal forests/generalized random forests when nonlinear high-dimensional heterogeneity is plausible and sample size/support are adequate.
- Meta-learners such as S-, T-, X-, R-, and DR-learners when supervised ML plugins are useful and the team can cross-fit or validate. The X-learner is especially natural when treatment groups are imbalanced and separate outcome models plus imputed treatment effects are plausible.
- Doubly robust, TMLE, or DML approaches when observational data need flexible nuisance adjustment.
- Bayesian or shrinkage/hierarchical models when groups are many, sparse, or partially pooled.

Use `scripts/recommend.py` with `sample_input.json` when quick method/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Diagnostics And Sensitivity

Review:

- subgroup support, overlap, and balance within candidate strata;
- prespecified versus exploratory status and multiplicity burden;
- uncertainty intervals for subgroup/GATE estimates, preferably simultaneous when many groups are reported;
- CATE calibration, rank stability, variable importance stability, and RATE/Qini/AUUC-style ranking checks when appropriate;
- sensitivity to learner class, nuisance models, cross-fitting folds, seeds, covariate set, and subgroup definitions;
- whether heterogeneity is on the chosen effect scale and whether scale changes alter interpretation;
- unmeasured confounding sensitivity for observational heterogeneity claims;
- whether a simpler interpretable model gives similar conclusions.

Do not present a flexible CATE model as discovering "true individual effects." If the user wants action recommendations, route the implication to `21-point-treatment-rules`.

## Output To Main Team

Return:

- heterogeneity target and effect scale;
- candidate modifiers or subgroup definitions with provenance;
- whether the request is direct, adapted, exploratory, blocked, or not applicable;
- feasible method/package lane and why it fits;
- assumptions, diagnostics, limitations, and robustness needs;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.target_goal`:

- set `subskill_id`: `20-heterogeneous-effects`
- set `module_type`: `target_goal`
- set `role`: `target_module`
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `type_specific.target_goal`: `target_goal`, `estimand_targets`, `target_population`, `effect_scale`, `decision_or_interpretation_goal`, `design_route_needed`, and `reporting_boundary`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Treatment Effect Heterogeneity" or "Subgroup Effects";
- heterogeneity question and relation to the user's goal;
- modifier definitions, timing, support, and domain rationale;
- design route and identification limits;
- method, software, split/cross-fit plan, and effect scale;
- subgroup/CATE/GATE results or exploratory artifacts if computed;
- diagnostics, multiplicity/validation status, and sensitivity checks;
- claim boundary: prespecified, exploratory, hypothesis-generating, or supported;
- code, table, figure, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed heterogeneity workflow, reviewer handoffs, diagnostics, and report integration.
- `references/literature_and_software.md`: literature map and R/Python package matrix.
- `examples/`: short R/Python templates for causal forests, interaction/GATE analyses, EconML, and CausalML-style meta-learners.
- `scripts/recommend.py`: rule-based package/method recommender for quick internal triage.
