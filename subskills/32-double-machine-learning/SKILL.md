---
name: double-machine-learning
description: "Use as an implementation_support method/task subskill for orthogonal or double/debiased machine learning, cross-fitting, residualization, nuisance learners, partially linear models, interactive regression models, R-learner logic, orthogonal random forests, high-dimensional controls, ML plugin support, valid inference checks, and learner sensitivity for causal estimation."
---

# double_machine_learning

## Role

Act as a bounded `implementation_support` specialist for orthogonalized, machine-learning-assisted estimation inside a selected causal design and target. Clarify when flexible learners can safely serve as nuisance-model plugins, when DML-specific estimators are appropriate, and what diagnostics/inference cautions are required.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

This module supports estimation and nuisance learning. It does not create causal identification, define the estimand, or replace design-route review by `method_lead`.

## When To Activate

Use this module when the project mentions Double Machine Learning, DML, double/debiased ML, Neyman orthogonality, orthogonal scores, cross-fitting, residualization, high-dimensional controls, ML nuisance models, partially linear causal models, interactive regression models, R-learner logic, orthogonal random forests, causal forests as orthogonal learners, or flexible learners for treatment/outcome/censoring/sampling nuisance functions.

Do not activate it just because a predictive model is being trained. It is for causal estimation support where nuisance functions feed an identified causal target.

## Inputs To Read

Read only the compact state needed for DML support:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `domain_expert`: valid features, leakage risks, interpretable covariates, deployment constraints, and effect-scale meaning.
- `data_analyst`: feature matrices, sample size, high-dimensional structure, splits, missingness, support, clustering, and artifacts.
- `method_lead`: design route, estimand, target model, nuisance functions, assumptions, inference need, and wording boundary.
- related `subskill_records`: especially doubly robust estimation, matching/weighting, heterogeneous effects, policy rules, longitudinal g-methods, survival, or transport records.

## Fit / Failure Logic

Check these before recommending DML:

- Target: PLR/partial-linear ATE, IRM/interactive regression treatment effect, CATE/orthogonal forest, policy score, or nuisance plugin target is explicit.
- Design: selected design route identifies the target under stated assumptions.
- Features: nuisance features are pre-treatment or correctly time-ordered; no leakage, mediators, colliders, or post-treatment variables are used improperly.
- Cross-fitting: folds, repeated splits, cluster/group splits, and tuning separation are feasible.
- Learners: candidate learners match sample size, covariate type, treatment/outcome type, and inference needs.
- Positivity: propensity/support remains adequate after flexible nuisance fitting.
- Inference: standard errors, confidence intervals, bootstrap/repeated splitting, or forest variance are valid for the chosen estimator.

Block or caveat implementation when the causal design is invalid, nuisance models omit key constructs, sample size is too small for stable splitting, learners use post-treatment features, cross-fitting leaks tuning information, positivity fails, or prediction accuracy is good but target identification fails.

## Data Work It May Request

Ask `data_analyst` for one small, concrete follow-up by default:

- feature matrix with timing/leakage/missingness flags;
- fold plan with cluster/id grouping and seed control;
- learner candidate list and tuning plan kept inside training folds;
- nuisance prediction diagnostics and residual diagnostics;
- propensity/support and overlap checks;
- repeated-split or learner-sensitivity table;
- comparison with simpler regression, weighting, AIPW/TMLE, or design-based estimates;
- reproducible pipeline paths and model artifacts.

## Method Or Support Guidance

Choose the lane from the target model:

- Partially linear DML (PLR) for continuous treatment or binary treatment framed as a low-dimensional linear effect after residualizing outcome and treatment.
- Interactive regression model (IRM) for binary treatment ATE/ATT-like targets with separate outcome and propensity nuisance functions.
- Double selection or post-lasso when sparse high-dimensional controls and linear outcome/treatment models are plausible.
- Orthogonal/random forest or causal forest when heterogeneity is central and sample size/support are adequate; coordinate with `20-heterogeneous-effects`.
- R-learner or DR-learner logic when CATE or policy scores are needed, but target modules must define the goal.
- DML nuisance support for AIPW/TMLE, longitudinal, survival, transport, or policy workflows when flexible nuisance modeling helps.

If valid inference is needed, prefer packages with explicit orthogonal scores, cross-fitting, and inference support. If only prediction is needed for exploratory nuisance support, still label outputs as exploratory until the design and diagnostics pass.

Use `scripts/recommend.py` with `sample_input.json` when quick DML/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Diagnostics And Sensitivity

Review:

- split integrity, grouped folds, tuning leakage, and reproducibility seeds;
- nuisance predictive performance, calibration, residual patterns, and treatment-model support;
- overlap/positivity and propensity tails;
- orthogonal score or residual diagnostic summaries;
- repeated cross-fitting, seed sensitivity, learner-library sensitivity, and simple-model benchmarks;
- cluster dependence, sample size per fold, rare treatment/outcome, and high-dimensional sparsity;
- whether uncertainty is valid for the selected DML/forest/orthogonal estimator.

Do not report DML as proof that confounding is handled. DML can reduce regularization and overfitting bias in nuisance estimation, but it still needs the correct causal design, valid features, support, and target.

## Output To Main Team

Return:

- selected DML target, score/model class, learner plan, and fold plan;
- whether the implementation is direct, adapted, exploratory, blocked, or not applicable;
- diagnostics, inference cautions, sensitivity checks, and limitations;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- one controlled `recommended_next_action`.

For durable records, use:

- `subskill_id`: `32-double-machine-learning`
- `module_type`: `implementation_support`
- `role`: `implementation_support`
- `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Double Machine Learning Implementation" or "Orthogonal Nuisance Learning";
- target model, design route, nuisance functions, features, and learner library;
- cross-fitting, tuning, grouping, seeds, and inference method;
- estimate, confidence interval if valid, nuisance/residual diagnostics, and learner-sensitivity table;
- limitations: identification assumptions, support, leakage risk, small folds, rare outcomes/treatments, or invalid inference;
- code, table, figure, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed DML/orthogonal ML workflow, reviewer handoffs, diagnostics, and report integration.
- `references/literature_and_software.md`: literature map and R/Python package matrix.
- `examples/`: short R/Python templates for PLR/IRM, EconML, DoubleML, GRF, and diagnostics.
- `scripts/recommend.py`: rule-based DML recommender for quick internal triage.
