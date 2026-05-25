---
name: single-time-observational-exposure
description: "Use as a design_route method/task subskill for single-time or baseline observational exposure, target-trial emulation, point treatment versus comparison framing, confounding adjustment, propensity scores, matching, weighting, ATE/ATT targets, overlap/positivity diagnostics, sensitivity analysis, and observational causal validity checks."
---

# single_time_observational_exposure

## Role

Act as a bounded `design_route` specialist for one-time or baseline observational exposure comparisons. Clarify whether a target-trial-style comparison can be emulated, which confounding and support requirements matter, which estimands are credible, and what implementation supports may help.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Follow the shared `Common Constructed-Input Claim Checks` in `references/method_subskill_contract.md`: judge the analysis dataset used by this method, not source-data transformations in isolation. When `data_analyst` records constructed inputs, simplifications, or alignment limits, use existing `statistical_evidence`, `method_specific_limits`, `requests`, and `method_lead_recheck` fields to state whether the input supports this module's estimand and assumptions or needs reframing.

This module supplies the design route for point observational exposures. Matching, weighting, DR, DML, survival, dose-response, heterogeneity, or policy modules may still be needed for implementation or target details.

## When To Activate

Use this module when the project involves observational cohorts, registries, claims, EHR, surveys, baseline exposure, point treatment, treated versus untreated comparisons, exposed versus unexposed comparisons, index dates, target-trial emulation, ATE/ATT/ATC, confounder adjustment, propensity scores, matching, weighting, g-computation, or backdoor-style identification.

Do not use it for actual randomized assignment; route to `07-randomized-assignment-and-experiments`. Do not use it alone for repeated/time-varying treatment, continuous dose-response, IV, RD, DiD, or synthetic-control designs.

## Inputs To Read

Read only the compact state needed for the observational design:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: exposure meaning, comparator, plausible confounders, clinical/scientific timing, eligibility, and interpretation.
- `data_analyst`: analysis alignment, variables, time zero, baseline windows, missingness, sample construction, support, balance, outcomes, and artifacts.
- `method_lead`: causal claim, estimand set, causal structure, assumptions, target modules, diagnostics, sensitivity plan, and wording boundary.
- related `subskill_records`: especially matching/weighting, doubly robust estimation, DML, negative controls/proximal, dose-response, heterogeneity, survival, or transportability records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded design details needed by this module.

## Fit / Failure Logic

Check these before recommending an analysis:

- Target trial: eligibility, time zero, treatment/exposure strategies, assignment proxy, follow-up, outcome, and analysis set can be stated.
- Exposure timing: exposure is measured at or before time zero and precedes the outcome window.
- Comparator: untreated, alternative treatment, usual care, lower exposure, or another strategy is concrete and interpretable.
- Confounding: baseline confounders are measured before exposure; post-treatment variables are not used as ordinary confounders.
- Positivity/support: each exposure option is plausible for covariate patterns in the target population.
- Consistency: observed exposure versions match the intervention claim closely enough.
- Selection/missingness: inclusion, complete-case choices, censoring, and missing covariates/outcomes do not silently change the estimand.
- Measurement: exposure, outcome, and confounders are defined with domain-valid windows and acceptable error.

Apply the common constructed-input checks to point-exposure analysis sets. Constructed baseline exposures, proxy covariates, imputed values, feature reductions, restrictions, or outcome windows can be valid when they are pre-treatment and match the target-trial contrast. Post-treatment leakage, collider/selection conditioning, target-population drift, or same-data threshold selection should lower claim scope or trigger `method_lead_recheck`.

Block or caveat causal claims when exposure follows outcome risk changes, time zero is undefined, baseline covariates are post-treatment, comparison groups have no support, key confounders are absent, sample selection defines away the target population, or the target trial cannot be stated.

## Data Work It May Request

Ask `data_analyst` for one small, concrete follow-up by default:

- target-trial construction table: eligibility, time zero, exposure, comparator, follow-up, outcome;
- baseline variable map with pre/post-exposure timing flags;
- analysis-set flow counts and exclusion reasons;
- exposure and comparator counts by key domain strata;
- missingness, measurement, and selection profiles;
- overlap/support plots and sparse-cell checks;
- covariate balance before and after matching, weighting, or adjustment;
- first-pass adjustment, weighting, or doubly robust estimate labeled as exploratory until diagnostics pass.

## Method Or Support Guidance

Distinguish design and implementation:

- Target-trial emulation and backdoor adjustment are design logic, not software.
- Regression adjustment, g-computation, matching, weighting, stratification, AIPW, TMLE, and DML are implementation choices inside the design.
- Flexible learners can improve nuisance models or prediction, but they do not fix wrong timing, absent confounders, nonpositivity, or a non-interpretable exposure.
- ATT is often natural when the question is about treated/exposed units; ATE needs broader overlap and target-population clarity.
- If overlap is weak, prefer a narrowed target population, overlap weights, trimmed weights, or explicit "supported region" reporting over unsupported extrapolation.
- If unmeasured confounding is plausible and no design feature addresses it, require sensitivity analysis, negative controls, proximal methods, IV, or a cautious non-causal/descriptive claim.

Use `scripts/recommend.py` with `sample_input.json` when quick design/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Statistical Evidence And Claim Scope

Fill `statistical_evidence` with the claim allowed by confounding control and diagnostics:

- `inference_supported` only when the exposure precedes outcome, adjustment set is pre-treatment and defensible, positivity/overlap is adequate, sensitivity needs are addressed, and the estimator's uncertainty method matches the data structure.
- `exploratory_only` or `descriptive_only` when the result is a first-pass adjusted association, the adjustment set is provisional, overlap is weak, unmeasured confounding is unresolved, or the model was selected after seeing results.
- `claim_scope`: the overlap, trimmed, matched, weighted, ATT, ATE, or target population actually created by the design, not automatically the full source dataset.
- Valid routes include prespecified regression adjustment, propensity weighting/matching with balance evidence, AIPW/TMLE/DML with valid nuisance handling, robust or bootstrap uncertainty, and sensitivity/negative-control checks when needed.
- Do not let flexible learners, high predictive accuracy, or many covariates upgrade the causal claim without exchangeability, positivity, timing, and measurement support.

Treat the listed routes as examples, not an exhaustive whitelist. Equivalent, newer, or domain-adapted validation routes are acceptable when their assumptions, diagnostics, uncertainty logic, data-dependence handling, and supported claim scope are explicitly recorded in `statistical_evidence`.

For point observational exposure, the central statistical issue is not only interval validity; it is whether the analysis has created a credible emulation of a target trial using measured covariates. Treat the following as claim-boundary issues:

- target-trial drift: eligibility, time zero, exposure strategy, comparator, follow-up, or outcome windows differ from the user's intended causal question;
- outcome-informed design: confounder sets, trimming rules, propensity models, matching specifications, or subgroup definitions were selected after inspecting outcomes or preferred effects;
- unsupported target population: ATE is claimed when only ATT, overlap, matched, trimmed, or sparse supported regions are credible;
- residual confounding: key baseline confounders are absent, proxy-only, poorly measured, or downstream of exposure;
- positivity failure: extreme weights, no comparable controls, sparse strata, or extrapolation from flexible models drives the result;
- selection and missingness: complete-case, inclusion, censoring, or measurement choices redefine the target without being recorded.

### Writing The YAML Handoff

When this module returns a durable record, write `statistical_evidence` before `diagnostics_needed`:

1. Start from the emulated target trial and adjustment logic. Identify eligibility, time zero, exposure/comparator, outcome window, baseline confounders, estimand, and target population.
2. Set `status` conservatively:
   - `inference_supported` when target-trial alignment is clear, measured-confounding assumptions are plausible, support/balance diagnostics pass, uncertainty matches the estimator/data structure, and sensitivity needs are addressed or explicitly bounded.
   - `internally_validated` when nuisance models, matching/weighting, or DR/DML estimates pass internal support, balance, learner, and robustness checks, but unmeasured-confounding or external-validity limits still cap the claim.
   - `descriptive_only` when the result is an adjusted association, balance/support table, or design diagnostic without enough causal support.
   - `exploratory_only` when the adjustment set, model, trimming, subgroup, or estimand was selected after seeing outcomes or effect estimates.
   - `blocked` when time zero is undefined, exposure may follow outcome risk changes, key confounders are missing, positivity fails, or selection/missingness invalidates the target.
3. Set `claim_scope` to the actual supported target: `target_sample`, `target_population`, `in_sample_only`, `model_implied`, `internally_validated`, or `exploratory_only`. Use `target_population` only when the data, design, and `24-transportability-generalizability` style evidence support it.
4. Fill `inference_or_validation_route` with the route used or needed, such as target-trial table, outcome-blind propensity design, balance/overlap diagnostics, prespecified regression adjustment, matching/weighting with robust or bootstrap uncertainty, AIPW/TMLE/DML implementation support, E-value/Rosenbaum bounds, negative controls, proximal/IV alternative, or missingness/censoring sensitivity.
5. Fill `method_specific_limits` with direct wording limits for `method_lead`, such as "Estimate is conditional on no unmeasured confounding," "Claim applies only to the overlap-weighted population," or "Current result is an adjusted association because key confounders are unavailable."
6. Put bounded evidence requests in `requests.data_analyst`, such as target-trial construction table, pre/post-exposure timing flags, analysis-set flow, balance and overlap plots, weight tails, missingness by exposure/outcome, sensitivity analysis, or comparison of ATE/ATT/overlap targets.
7. Set `method_lead_recheck.required: true` if the evidence boundary changes the estimand, target population, adjustment set, selected framework, claim strength, gate readiness, or report wording.

Example blocked or exploratory handoff:

```yaml
statistical_evidence:
  status: "exploratory_only"
  claim_scope: "model_implied"
  inference_or_validation_route:
    - "Needed: outcome-blind target-trial specification, baseline confounder timing check, and balance/overlap diagnostics before causal wording."
  method_specific_limits:
    - "Current estimate is a first-pass adjusted association."
    - "Do not claim a causal ATE because the adjustment set and target population are not yet established."
requests:
  data_analyst:
    - "Produce target-trial construction table, baseline confounder timing flags, balance/overlap plots, and ATE/ATT/overlap support comparison."
method_lead_recheck:
  required: true
  reason: "The supported estimand and claim strength depend on target-trial alignment and overlap diagnostics."
```

Example stronger handoff:

```yaml
statistical_evidence:
  status: "inference_supported"
  claim_scope: "target_sample"
  inference_or_validation_route:
    - "Outcome-blind target-trial emulation with pre-treatment adjustment set, acceptable overlap, balance diagnostics, and estimator-matched uncertainty."
    - "Unmeasured-confounding sensitivity reported as a limitation."
  method_specific_limits:
    - "Causal wording is conditional on measured exchangeability and applies to the analyzed support region."
```

## Diagnostics And Sensitivity

Review:

- target-trial emulation table and timing consistency;
- baseline confounder sufficiency against the causal structure;
- balance before and after adjustment, matching, or weighting;
- overlap/positivity, influential weights, trimming, sparse strata, and supported target population;
- model dependence, learner sensitivity, functional form, and calibration when prediction is used;
- missingness, selection, censoring, competing risks, and outcome timing;
- unmeasured confounding sensitivity, negative controls, E-values, bounds, or proximal/IV alternatives when appropriate;
- estimand stability across ATE, ATT, overlap-weighted, or restricted-population definitions.

Do not report a statistically polished observational estimate as a strong causal claim when timing, confounding, or support remains unresolved.

## Output To Main Team

Return:

- emulated target trial, exposure, comparator, time zero, eligibility, follow-up, and outcome;
- estimand options and preferred estimand with rationale;
- whether the request is direct, adapted, exploratory, blocked, or not applicable;
- feasible estimator/software lane and why it fits;
- `statistical_evidence`: status, claim scope, observational-design inference or validation route, and exact wording limits;
- assumptions, diagnostics, limitations, and robustness needs;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.design_route`:

- set `subskill_id`: `08-single-time-observational-exposure`
- set `module_type`: `design_route`
- set `role`: `primary_route`, `support_module`, or `diagnostic_module` as fits the activation
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `type_specific.design_route`: `causal_comparison`, `design_route`, `identification_status`, `required_timing`, `comparison_group_logic`, `key_identification_assumptions`, `invalidating_conditions`, and `estimands_supported`
- fill `statistical_evidence` using the section above before finalizing the record

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Observational Target Trial Emulation" or "Baseline Exposure Analysis";
- target trial table and why the comparison matches the user's causal question;
- exposure, comparator, eligibility, time zero, follow-up, outcome, and estimand;
- adjustment set, support/positivity evidence, and missingness/selection handling;
- method, software, model form, and robustness checks;
- diagnostics and sensitivity checks;
- claim boundary: exploratory, descriptive, cautious causal, supported causal under assumptions, or not supportable;
- code, table, figure, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed target-trial and observational point-exposure workflow, reviewer handoffs, diagnostics, and report integration.
- `references/literature_and_software.md`: literature map and R/Python package matrix.
- `examples/`: short R/Python templates for matching/weighting, balance, DoWhy backdoor checks, AIPW, and DML-style nuisance workflows.
- `scripts/recommend.py`: rule-based observational design/package recommender for quick internal triage.
