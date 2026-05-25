---
name: heterogeneous-effects
description: "Use as a target_goal method/task subskill for heterogeneous treatment effects, subgroup or strata effects, CATE, GATE, ITE-style prediction, effect modifiers, causal forests, meta-learners, interaction models, heterogeneity diagnostics, and heterogeneity report support."
---

# heterogeneous_effects

## Role

Act as a bounded `target_goal` specialist for questions about whether effects differ across groups, covariates, strata, sites, time periods, or units. Clarify the heterogeneity target, effect scale, modifier set, prespecified versus exploratory status, and what claim can be made from the current design and data.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Follow the shared `Common Constructed-Input Claim Checks` in `references/method_subskill_contract.md`: judge the analysis dataset used by this method, not source-data transformations in isolation. When `data_analyst` records constructed inputs, simplifications, or alignment limits, use existing `statistical_evidence`, `method_specific_limits`, `requests`, and `method_lead_recheck` fields to state whether the input supports this module's estimand and assumptions or needs reframing.

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
- `data_analyst`: analysis alignment, sample size, subgroup support, variable timing, missingness, overlap, split/cross-fit plan, plots, and artifacts.
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

Apply the common constructed-input checks to CATE, GATE, subgroup, and modifier analyses. Constructed heterogeneity inputs such as CATE quartiles, grouped modifiers, learned strata, PCA or embedding features, imputed covariates, filtered samples, or derived subgroup variables are not invalid merely because they are constructed. They must still pass compatibility, timing and variable-role, estimand-drift, selection and reuse, and support and scope checks. Passing those checks does not validate discovered heterogeneity; same-data CATE groups, rankings, post-hoc modifiers, or selected quartiles still require the heterogeneity-specific validation route before stronger claims.

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

## Statistical Evidence And Claim Scope

Fill `statistical_evidence` with the heterogeneity claim actually supported:

- `inference_supported` for prespecified subgroup/GATE contrasts with adequate support, defensible design route, valid uncertainty, and multiplicity or simultaneous-inference handling when many groups are reported.
- `internally_validated` for honest/cross-fitted CATE ranking or forest-style heterogeneity evidence when validation diagnostics support the pattern, but external claims still need replication or transport evidence.
- `exploratory_only` for same-data CATE rankings, variable importance, discovered subgroups, post-hoc bins, or ITE-style narratives.
- `claim_scope`: prespecified subgroup, GATE, CATE function, model-implied ranking, or hypothesis-generating screen; individual-level effects are never directly observed.
- Valid routes include interaction or stratified estimands, honest causal trees/forests, meta-learners with cross-fitting, DR/TMLE/DML heterogeneity estimators, simultaneous intervals for multiple GATEs, RATE/Qini/AUUC-style ranking checks, and learner/fold/seed sensitivity.

Treat the listed routes as examples, not an exhaustive whitelist. Equivalent, newer, or domain-adapted validation routes are acceptable when their assumptions, diagnostics, uncertainty logic, data-dependence handling, and supported claim scope are explicitly recorded in `statistical_evidence`.

### Writing The YAML Handoff

When this module returns a durable record, write `statistical_evidence` before `diagnostics_needed`:

1. Decide whether the heterogeneity finding is prespecified, discovered, model-implied, internally validated, or inference-supported.
2. Set `status` conservatively:
   - `exploratory_only` for same-data discovered subgroups, CATE quartiles, variable importance, or model-selected effect modifiers.
   - `internally_validated` when honest splitting, cross-fitting, held-out ranking checks, or stable RATE/GATES-style evidence supports the pattern.
   - `inference_supported` when prespecified subgroup/GATE estimates have valid uncertainty and multiplicity handling, or when a forest/DR/DML method provides valid inference for the specific heterogeneity target under its assumptions.
   - `blocked` when modifiers are post-treatment, unsupported, not constructible, or incompatible with the selected design route.
3. Set `claim_scope` to the exact target: `in_sample_only`, `model_implied`, `internally_validated`, `target_sample`, `target_population`, or `exploratory_only`. Use `target_population` only when the design route and transport/generalizability evidence support it.
4. Fill `inference_or_validation_route` with the route that was used or is needed, such as prespecified interaction test, simultaneous GATE intervals, honest causal forest, cross-fitted DR-learner, RATE/Qini/AUUC ranking check, external validation, or learner/fold/seed stability.
5. Fill `method_specific_limits` with direct wording limits for `method_lead`, such as "Do not call CATE quartiles validated subgroups" or "Report as model-implied heterogeneity, not proven individual benefit."
6. Put bounded evidence requests in `requests.data_analyst`, such as subgroup support tables, overlap by modifier, split/cross-fit plan, stability across seeds/learners, or GATE/CATE validation plots.
7. Set `method_lead_recheck.required: true` if the evidence boundary changes the intended claim from confirmatory to exploratory, blocks heterogeneity wording, changes the estimand, or routes the user's goal to policy learning instead.

Example exploratory handoff:

```yaml
statistical_evidence:
  status: "exploratory_only"
  claim_scope: "model_implied"
  inference_or_validation_route:
    - "Needed: honest or cross-fitted CATE ranking validation before stronger heterogeneity claims."
  method_specific_limits:
    - "Current CATE quartiles are same-data model-implied groups."
    - "Do not claim the highest-CATE quartile truly benefits more without validation and support checks."
requests:
  data_analyst:
    - "Check subgroup sizes, treatment overlap, and CATE-rank stability across folds/seeds/learners."
method_lead_recheck:
  required: true
  reason: "Heterogeneity wording should be capped as exploratory until validation evidence is available."
```

Example stronger handoff:

```yaml
statistical_evidence:
  status: "inference_supported"
  claim_scope: "target_sample"
  inference_or_validation_route:
    - "Prespecified subgroup/GATE contrast with valid uncertainty and multiplicity-aware reporting."
  method_specific_limits:
    - "Claim applies to the analyzed target sample and prespecified subgroup scale, not individual-level effects."
```

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
- `statistical_evidence`: status, claim scope, method-specific validation or inference route, and exact wording limits;
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
- fill `statistical_evidence` using the section above before finalizing the record

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
