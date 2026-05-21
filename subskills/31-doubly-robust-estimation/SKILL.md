---
name: doubly-robust-estimation
description: "Use as an implementation_support method/task subskill for AIPW, augmented inverse probability weighting, TMLE, one-step estimators, efficient influence functions, doubly robust estimation, targeted learning, Super Learner nuisance models, cross-fitting needs, missingness/censoring nuisance support, and robust effect-estimation report support."
---

# doubly_robust_estimation

## Role

Act as a bounded `implementation_support` specialist for doubly robust, one-step, and targeted estimators inside a selected design route and target. Clarify nuisance models, estimand compatibility, influence-function diagnostics, uncertainty, and reporting boundaries.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

This module improves estimation robustness when identification, timing, support, and adjustment set are already coherent. It does not supply identification by itself and must not weaken claim boundaries set by `method_lead`.

## When To Activate

Use this module when the project needs AIPW, augmented IPW, TMLE, one-step estimation, doubly robust estimation, targeted learning, efficient influence functions, outcome and propensity nuisance models, censoring/missingness nuisance models, Super Learner, cross-fitting for nuisance estimation, or robust implementation of ATE/ATT/risk/mean/survival-style targets.

Coordinate with `32-double-machine-learning` when the main concern is orthogonal ML, partially linear models, residualization, or generic high-dimensional nuisance learning.

## Inputs To Read

Read only the compact state needed for doubly robust implementation:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `domain_expert`: outcome scale, effect scale, meaningful covariates, subgroup concerns, and interpretability.
- `data_analyst`: analysis-ready matrix, missingness/censoring, support, splits, nuisance diagnostics, clusters, and artifacts.
- `method_lead`: design route, estimand, adjustment set, assumptions, positivity, sensitivity plan, and wording boundary.
- related `subskill_records`: especially observational exposure, longitudinal g-methods, matching/weighting, DML, survival, dose-response, heterogeneity, or policy records.

## Fit / Failure Logic

Check these before recommending an estimator:

- Estimand: ATE, ATT, risk difference, mean difference, survival contrast, longitudinal strategy, transport target, or another parameter is explicit.
- Design: selected design route identifies the estimand under stated assumptions.
- Nuisance set: outcome, treatment/propensity, censoring, missingness, and sampling models use valid pre-treatment or time-ordered variables.
- Positivity: treatment, censoring, and sampling probabilities are not near-deterministic in the target population.
- Learners: nuisance models are stable enough for sample size and data structure; cross-fitting is planned when flexible learners are used.
- Variance: influence-curve, bootstrap, cluster, or repeated-split uncertainty plan matches the estimator and data.
- Diagnostics: nuisance predictions, propensity tails, influence-curve tails, fold stability, and benchmark estimators are reviewed.

Block or caveat implementation when identification is unsettled, positivity fails, nuisance variables are post-treatment or missing, sample size cannot support flexible learners, cross-fitting is infeasible for the selected approach, or diagnostics show unstable influence/weight behavior.

## Data Work It May Request

Ask `data_analyst` for one small, concrete follow-up by default:

- analysis-ready covariate/outcome/treatment matrix with timing and leakage checks;
- cross-fitting or sample-splitting plan with id/cluster grouping when needed;
- propensity/support diagnostics and truncation options;
- nuisance-model prediction diagnostics and calibration;
- influence-curve distribution, standard error, and outlier checks;
- comparison table against regression, weighting, matching, or simple design estimator;
- reproducible code paths and estimate objects.

## Method Or Support Guidance

Choose the estimator lane from target and data:

- AIPW or one-step estimators for transparent binary-treatment ATE/ATT/mean/risk targets with outcome and propensity nuisance models.
- TMLE when targeted updating, bounded outcomes, risk parameters, Super Learner, or targeted loss behavior is important.
- `drtmle`/TMLE variants when nuisance estimates are flexible and robust inference is desired.
- Longitudinal TMLE or sequentially doubly robust methods when treatment/censoring histories are central, coordinated with `09-longitudinal-gmethods`.
- Survival TMLE or censoring-aware DR methods when censoring or time-to-event outcome drives the target, coordinated with `33-survival-competing-risks`.
- Transport or sampling-weight DR estimators when source-to-target differences matter, coordinated with `24-transportability-generalizability`.

Double robustness means consistency can hold if either the outcome regression or treatment/censoring/sampling mechanism is correctly specified, under identification and regularity conditions. It does not protect against wrong causal structure, unmeasured confounding, no support, leakage, or badly defined outcomes.

Use `scripts/recommend.py` with `sample_input.json` when quick estimator/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Diagnostics And Sensitivity

Review:

- propensity/support and truncation;
- nuisance model calibration, fold stability, and learner sensitivity;
- influence-curve mean near zero, tails/outliers, and variance estimates;
- standard error method, clustering, repeated splits, bootstrap, or sample-splitting uncertainty;
- comparison against simpler estimators and matching/weighting diagnostics;
- missingness/censoring and sampling weights when relevant;
- sensitivity to learner library, truncation, covariate set, folds, seeds, and target scale.

Do not report a DR estimate as automatically more credible than a simpler design-consistent estimate when diagnostics are unstable or the assumptions are weaker.

## Output To Main Team

Return:

- selected DR/TMLE/one-step target and estimator lane;
- whether the implementation is direct, adapted, exploratory, blocked, or not applicable;
- nuisance requirements and package/model recommendations;
- diagnostics, variance plan, limitations, and robustness checks;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- one controlled `recommended_next_action`.

For durable records, use:

- `subskill_id`: `31-doubly-robust-estimation`
- `module_type`: `implementation_support`
- `role`: `implementation_support`
- `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Doubly Robust Estimation" or "Targeted Learning Analysis";
- estimand, design route, adjustment set, nuisance functions, and software;
- learner library, cross-fitting/sample-splitting plan, truncation, and variance method;
- estimate, confidence interval, influence-curve diagnostics, and comparison to simpler estimates;
- limitations: measured confounding only, positivity, nuisance instability, sample size, censoring, clustering, or missingness;
- code, table, figure, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed doubly robust/TMLE workflow, reviewer handoffs, diagnostics, and report integration.
- `references/literature_and_software.md`: literature map and R/Python package matrix.
- `examples/`: short R/Python templates for AIPW, TMLE, Super Learner, influence-curve diagnostics, and DR learners.
- `scripts/recommend.py`: rule-based doubly robust estimator recommender for quick internal triage.
