---
name: longitudinal-gmethods
description: "Use as a design_route method/task subskill for longitudinal treatment or exposure histories, time-varying confounding affected by prior treatment, sustained strategies, dynamic regimes, marginal structural models, inverse-probability treatment and censoring weights, parametric or sequential g-formula, g-estimation, longitudinal TMLE, LMTP, and sequential causal validity checks."
---

# longitudinal_gmethods

## Role

Act as a bounded `design_route` specialist for longitudinal treatment, exposure, censoring, and covariate histories. Clarify whether the user's causal question requires a sustained strategy, dynamic regime, cumulative exposure, treatment history, censoring process, or time-varying confounding affected by prior treatment.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Follow the shared `Common Constructed-Input Claim Checks` in `references/method_subskill_contract.md`: judge the analysis dataset used by this method, not source-data transformations in isolation. When `data_analyst` records constructed inputs, simplifications, or alignment limits, use existing `statistical_evidence`, `method_specific_limits`, `requests`, and `method_lead_recheck` fields to state whether the input supports this module's estimand and assumptions or needs reframing.

This module supplies the longitudinal design route and identification logic. If the user wants to learn or evaluate adaptive decision rules, coordinate with `25-dynamic-treatment-policies`; if the user only has one baseline exposure, route to `08-single-time-observational-exposure`.

## When To Activate

Use this module when treatment, exposure, covariates, censoring, adherence, eligibility, or outcomes evolve over repeated time points. Also use it when the project mentions time-varying confounding, treatment histories, sustained treatment, treatment regimes, sequential strategies, marginal structural models, inverse-probability treatment/censoring weights, g-formula, g-computation, g-estimation, structural nested models, longitudinal TMLE, LMTP, or cloning/censoring/weighting.

Do not use it for a single baseline treatment unless follow-up, censoring, or treatment changes over time are part of the causal claim.

## Inputs To Read

Read only the compact state needed for the longitudinal design:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: treatment strategy meaning, visit schedule, biologic/operational timing, feasible interventions, adherence, and interpretation.
- `data_analyst`: analysis alignment, long-format data status, id/time rows, treatment/covariate/outcome timing, censoring, missingness, support, weights, and artifacts.
- `method_lead`: causal claim, estimand set, causal structure, sequential exchangeability, positivity, censoring assumptions, diagnostics, and wording boundary.
- related `subskill_records`: especially dynamic policies, dose-response, survival, matching/weighting, doubly robust estimation, DML, transportability, negative controls, or records with report-support material.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded design details needed by this module.

## Fit / Failure Logic

Check these before recommending a method:

- Time grid: visits, intervals, lags, grace periods, baseline, follow-up, and outcome windows are reconstructible.
- History: treatment, covariates, censoring, eligibility, adherence, and outcomes are ordered correctly at each time.
- Strategy: static, sustained, dynamic, stochastic, modified, cumulative, or threshold strategy can be written as an intervention.
- Confounding: time-varying confounders affected by prior treatment are measured before later treatment decisions.
- Censoring and missingness: loss to follow-up, competing events, administrative censoring, and artificial censoring are represented.
- Positivity over histories: each strategy has support across relevant treatment/covariate histories.
- Consistency: observed treatment versions match the intervention strategy closely enough.
- Outcome: final, repeated, survival, recurrent, competing-risk, or cumulative outcome scale is compatible with the design.
- Model-input compatibility: distinguish source-data preprocessing from the analysis dataset actually passed to the estimator. Collapsed pre-treatment histories, lagged summaries, cumulative features, baseline windows, or other derived constructs can be valid when they match the estimand and are documented. The longitudinal route requires that the estimator input preserve the treatment, covariate, censoring, adherence, eligibility, and outcome histories needed for the claimed strategy and nuisance models.

Apply the common constructed-input checks to longitudinal inputs. Pre-treatment summaries, baseline windows, lagged covariates, cumulative exposure features, or time-grid restrictions can be valid when the estimator input still preserves the histories required by the strategy. If construction collapses post-baseline treatment, censoring, adherence, or time-varying confounding needed for the claimed g-method, recommend reframing or rerouting rather than treating the simplified input as longitudinal evidence.

Block or caveat causal claims when time ordering is not reconstructible, required model-input histories are missing, treatment or censoring support collapses, the strategy cannot be described as an intervention, post-outcome variables enter the history, or censoring is severe and unaddressed. If a collapse or summary defines a different valid estimand rather than a longitudinal g-methods input, return `method_lead_recheck.required: true` and suggest re-routing or reframing instead of calling the data treatment invalid.

## Data Work It May Request

Ask `data_analyst` for one small, concrete follow-up by default:

- long-format person-time table with id, time, treatment, covariates, censoring, and outcome;
- visit/time-grid construction and grace-period definitions;
- treatment and covariate timing map with lag choices;
- model-input audit: row structure, time-varying elements retained, elements collapsed or summarized, and whether the estimator input matches the claimed longitudinal strategy;
- regime or strategy adherence counts over time;
- treatment/censoring model inputs and positivity summaries by history strata;
- inverse-probability weight distributions, truncation, and effective sample size;
- artificial censoring or cloning/censoring/weighting construction if strategies require it;
- first-pass g-formula, MSM/IPW, sequential-regression, or LMTP prototype labeled exploratory until diagnostics pass.

## Method Or Support Guidance

Choose the method lane from the question and data structure:

- Marginal structural models with IP treatment/censoring weights are useful for marginal effects of sustained or dynamic strategies when weights are stable and model fit is defensible.
- Parametric g-formula is useful for simulating absolute risks or outcomes under complex static or dynamic strategies, but relies heavily on correct models for the longitudinal data-generating process.
- Sequential regression or iterated conditional expectation is useful for discrete-time strategy comparisons and can accept flexible learners, but still needs correct time ordering and support.
- Structural nested models and g-estimation are useful for treatment-effect models with time-varying treatment, especially when blip or treatment-duration effects are scientifically meaningful, but software and interpretation are more specialized.
- Longitudinal TMLE, sequentially doubly robust estimators, and LMTP workflows can use flexible nuisance models and target realistic interventions, but require careful ordering, cross-fitting, and positivity checks.
- Pooled logistic hazards, weighted Cox models, or cumulative-incidence workflows are implementation supports for time-to-event outcomes; activate `33-survival-competing-risks` when survival details matter.

Do not let a longitudinal package substitute for the design. The time grid, intervention strategy, sequential exchangeability, positivity, consistency, censoring, and outcome scale must be stated before the estimate is treated as causal.

Use `scripts/recommend.py` with `sample_input.json` when quick design/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Statistical Evidence And Claim Scope

Fill `statistical_evidence` according to whether the longitudinal target and time ordering are genuinely supported:

- `inference_supported` only when treatment, covariate, censoring, and outcome histories are ordered correctly; sequential exchangeability, consistency, and positivity are plausible; and the estimator's variance/influence/bootstrap route matches the repeated-measure structure.
- `exploratory_only` when the model-input dataset flattens or omits histories required for the claimed longitudinal estimand, time-varying confounding is only partly measured, positivity is unstable, or model selection is driven by in-sample patterns. Baseline summaries of pre-treatment histories are acceptable when they are documented as baseline/history covariates and do not erase information required by the strategy.
- `claim_scope`: sustained strategy, dynamic regime, modified treatment policy, or longitudinal contrast actually encoded; do not report it as a single-time ATE unless `method_lead` changes the estimand.
- Valid routes include MSM/IPTW with weight diagnostics, parametric or sequential g-formula with model/simulation uncertainty, longitudinal TMLE/sequential DR estimators, and LMTP estimators when the intervention is a realistic shift.
- Do not treat a fitted longitudinal model, survival regression, or repeated-measures association as a causal regime effect without the g-method assumptions and censoring/selection diagnostics.

Treat the listed routes as examples, not an exhaustive whitelist. Equivalent, newer, or domain-adapted validation routes are acceptable when their assumptions, diagnostics, uncertainty logic, data-dependence handling, and supported claim scope are explicitly recorded in `statistical_evidence`.

For longitudinal g-methods, the central statistical issue is whether the observed history can support the intervention history being claimed. Treat the following as claim-boundary issues:

- history summarization: collapsing source information can be valid when it creates an interpretable baseline/history feature, but reducing post-baseline treatment, adherence, censoring, or time-varying confounding required by the strategy changes the estimand or breaks the longitudinal method input;
- strategy ambiguity: "treated longer," "always treated," "treated when sick," "dose escalation," and "dynamic rule" require different intervention definitions;
- treatment-confounder feedback: ordinary time-updated regression can be biased when prior treatment affects later confounders;
- support over histories: sparse treatment/covariate histories, deterministic treatment decisions, or unstable censoring weights restrict the target population;
- artificial censoring and cloning: protocol deviations, grace periods, and regime adherence choices can create selection that must be weighted or bounded;
- simulation/model dependence: parametric g-formula and sequential regression can be highly model-dependent, even when the code runs cleanly.

### Writing The YAML Handoff

When this module returns a durable record, write `statistical_evidence` before `diagnostics_needed`:

1. Start from the longitudinal intervention and the estimator's model-input dataset, not the package name. Identify model-input row structure, time grid, baseline, histories, treatment/censoring nodes, strategy definition, outcome window, and target contrast.
2. Set `status` conservatively:
   - `inference_supported` when histories are ordered, the strategy is well-defined, sequential exchangeability/positivity/censoring assumptions are plausible, diagnostics are acceptable, and the uncertainty route matches the estimator.
   - `internally_validated` when weights, nuisance models, simulations, or sequential regressions pass internal diagnostics but the claim still depends strongly on unverifiable assumptions or limited support.
   - `descriptive_only` for longitudinal summaries, adherence trajectories, weight diagnostics, or repeated-measures associations without causal regime interpretation.
   - `exploratory_only` when the time grid, lags, strategy, truncation, model form, or history summaries are chosen after inspecting results, when support is uncertain, or when the model input only partially represents the intended longitudinal history.
   - `blocked` when time ordering is unreconstructible, key model-input histories are missing, strategy support fails, or censoring/selection is severe and unaddressed.
3. Set `claim_scope` to the exact target: `target_sample`, `target_population`, `internally_validated`, `model_implied`, `in_sample_only`, or `exploratory_only`. Describe the substantive target in `type_specific.design_route.estimands_supported`, such as sustained strategy, dynamic regime, cumulative exposure, or LMTP.
4. Fill `inference_or_validation_route` with the route used or needed, such as MSM/IPTW with treatment/censoring weight diagnostics, parametric g-formula with simulation/model checks, sequential regression with cross-fitting, longitudinal TMLE/sequential DR influence-curve inference, LMTP estimator diagnostics, artificial-censoring weight checks, or survival/competing-risk support.
5. Fill `method_specific_limits` with direct wording limits for `method_lead`, such as "Do not describe this as a sustained-strategy effect because adherence histories are unavailable", "Pre-treatment lab history was summarized as baseline severity; post-treatment treatment/censoring histories remain longitudinal", or "Claim is limited to histories with non-extreme treatment and censoring weights."
6. Put bounded evidence requests in `requests.data_analyst`, such as model-input row structure, long-format table, time-order map, retained versus summarized histories, strategy adherence counts, positivity by history strata, weight distribution/effective sample size, censoring summaries, simulation diagnostics, or sensitivity to grace periods and truncation.
7. Set `method_lead_recheck.required: true` if the evidence boundary changes the intervention strategy, estimand, target history population, selected framework, claim strength, gate readiness, report wording, or suggests that the current model input belongs under a different design route.

Example exploratory handoff:

```yaml
statistical_evidence:
  status: "exploratory_only"
  claim_scope: "model_implied"
  inference_or_validation_route:
- "Needed: reconstruct person-time histories, treatment/censoring support, and strategy adherence before reporting a regime effect."
  method_specific_limits:
    - "Current model uses time-updated covariates descriptively and does not identify a sustained treatment strategy."
    - "Do not report the coefficient as a longitudinal causal effect under time-varying confounding."
    - "If the intended input is one row per subject after collapsing post-baseline histories, ask method_lead whether this should be reframed as a single-time or cumulative-exposure estimand."
requests:
  data_analyst:
    - "Create long-format id-time table, timing map, treatment/censoring support summaries, and candidate strategy adherence counts."
method_lead_recheck:
  required: true
  reason: "The intended longitudinal estimand and claim wording depend on whether treatment histories support a g-methods strategy."
```

Example stronger handoff:

```yaml
statistical_evidence:
  status: "inference_supported"
  claim_scope: "target_sample"
  inference_or_validation_route:
    - "MSM/IPTW for a prespecified sustained strategy with treatment/censoring weight diagnostics, truncation sensitivity, and robust variance."
  method_specific_limits:
    - "Claim is conditional on sequential exchangeability, consistency, positivity, and correct handling of censoring in the observed history support."
    - "Pre-treatment history summaries are used only as baseline covariates; treatment and censoring histories from time zero onward remain in the model input."
```

## Diagnostics And Sensitivity

Review:

- time ordering, history construction, grace periods, and lag definitions;
- model-input row structure, retained longitudinal histories, and summarized or collapsed source fields;
- support/positivity over treatment and covariate histories;
- treatment and censoring weight distributions, truncation, and effective sample size;
- covariate balance over time after weighting when MSM/IPW is used;
- model diagnostics for treatment, censoring, outcome, and covariate processes;
- sensitivity to time grid, lag choices, strategy definitions, weight truncation, learners, and artificial censoring rules;
- censoring, competing events, missingness, and adherence;
- whether target claims are static strategy, dynamic regime, cumulative exposure, modified treatment policy, or exploratory longitudinal association.

Do not report a naive time-updated regression coefficient as a longitudinal causal effect when time-varying confounders affected by prior treatment are present.

## Output To Main Team

Return:

- longitudinal target structure, time grid, strategy definition, outcome, and estimand options;
- model-input compatibility judgment: what histories are retained, what was summarized, and whether the estimator input matches the claimed method logic;
- whether the request is direct, adapted, exploratory, blocked, or not applicable;
- feasible method/package lane and why it fits;
- `statistical_evidence`: status, claim scope, longitudinal inference or validation route, and exact wording limits;
- assumptions, diagnostics, limitations, and robustness needs;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.design_route`:

- set `subskill_id`: `09-longitudinal-gmethods`
- set `module_type`: `design_route`
- set `role`: `primary_route`, `support_module`, or `diagnostic_module` as fits the activation
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `type_specific.design_route`: `causal_comparison`, `design_route`, `identification_status`, `required_timing`, `comparison_group_logic`, `key_identification_assumptions`, `invalidating_conditions`, and `estimands_supported`
- fill `statistical_evidence` using the section above before finalizing the record

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Longitudinal Treatment Strategy Analysis" or "G-Methods Design";
- time grid, eligibility over time, treatment/censoring histories, covariates, outcome, and strategies;
- estimand and why it matches the user's causal question;
- identification assumptions: consistency, sequential exchangeability, positivity, and censoring;
- method, software, model form, weight/truncation or simulation plan, and learner choices;
- diagnostics and sensitivity checks;
- claim boundary: exploratory, descriptive, cautious causal under assumptions, supported causal under assumptions, or not supportable;
- code, table, figure, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed longitudinal g-methods workflow, reviewer handoffs, diagnostics, and report integration.
- `references/literature_and_software.md`: literature map and R/Python package matrix.
- `examples/`: short R/Python templates for MSM/IPW, parametric g-formula, sequential regression, LMTP, and weight diagnostics.
- `scripts/recommend.py`: rule-based longitudinal design/package recommender for quick internal triage.
