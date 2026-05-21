---
name: single-time-observational-exposure
description: "Use as a design_route method/task subskill for single-time or baseline observational exposure, target-trial emulation, point treatment versus comparison framing, confounding adjustment, propensity scores, matching, weighting, ATE/ATT targets, overlap/positivity diagnostics, sensitivity analysis, and observational causal validity checks."
---

# single_time_observational_exposure

## Role

Act as a bounded `design_route` specialist for one-time or baseline observational exposure comparisons. Clarify whether a target-trial-style comparison can be emulated, which confounding and support requirements matter, which estimands are credible, and what implementation supports may help.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

This module supplies the design route for point observational exposures. Matching, weighting, DR, DML, survival, dose-response, heterogeneity, or policy modules may still be needed for implementation or target details.

## When To Activate

Use this module when the project involves observational cohorts, registries, claims, EHR, surveys, baseline exposure, point treatment, treated versus untreated comparisons, exposed versus unexposed comparisons, index dates, target-trial emulation, ATE/ATT/ATC, confounder adjustment, propensity scores, matching, weighting, g-computation, or backdoor-style identification.

Do not use it for actual randomized assignment; route to `07-randomized-assignment-and-experiments`. Do not use it alone for repeated/time-varying treatment, continuous dose-response, IV, RD, DiD, or synthetic-control designs.

## Inputs To Read

Read only the compact state needed for the observational design:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `domain_expert`: exposure meaning, comparator, plausible confounders, clinical/scientific timing, eligibility, and interpretation.
- `data_analyst`: variables, time zero, baseline windows, missingness, sample construction, support, balance, outcomes, and artifacts.
- `method_lead`: causal claim, estimand set, DAG/theory, assumptions, target modules, diagnostics, sensitivity plan, and wording boundary.
- related `subskill_records`: especially matching/weighting, doubly robust estimation, DML, negative controls/proximal, dose-response, heterogeneity, survival, or transportability records.

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

## Diagnostics And Sensitivity

Review:

- target-trial emulation table and timing consistency;
- baseline confounder sufficiency against the DAG/theory;
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
- assumptions, diagnostics, limitations, and robustness needs;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- one controlled `recommended_next_action`.

For durable records, use:

- `subskill_id`: `08-single-time-observational-exposure`
- `module_type`: `design_route`
- `role`: `primary_route`
- `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`

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
