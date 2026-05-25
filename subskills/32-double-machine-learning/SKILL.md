---
name: double-machine-learning
description: "Use as an implementation_support method/task subskill for orthogonal or double/debiased machine learning, cross-fitting, residualization, nuisance learners, partially linear models, interactive regression models, R-learner logic, orthogonal random forests, high-dimensional controls, ML plugin support, valid inference checks, and learner sensitivity for causal estimation."
---

# double_machine_learning

## Role

Act as a bounded `implementation_support` specialist for orthogonalized, machine-learning-assisted estimation inside a selected causal design and target. Clarify when flexible learners can safely serve as nuisance-model plugins, when DML-specific estimators are appropriate, and what diagnostics/inference cautions are required.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Follow the shared `Common Constructed-Input Claim Checks` in `references/method_subskill_contract.md`: judge the analysis dataset used by this method, not source-data transformations in isolation. When `data_analyst` records constructed inputs, simplifications, or alignment limits, use existing `statistical_evidence`, `method_specific_limits`, `requests`, and `method_lead_recheck` fields to state whether the input supports this module's estimand and assumptions or needs reframing.

This module supports estimation and nuisance learning. It does not create causal identification, define the estimand, or replace design-route review by `method_lead`.

## When To Activate

Use this module when the project mentions Double Machine Learning, DML, double/debiased ML, Neyman orthogonality, orthogonal scores, cross-fitting, residualization, high-dimensional controls, ML nuisance models, partially linear causal models, interactive regression models, R-learner logic, orthogonal random forests, causal forests as orthogonal learners, or flexible learners for treatment/outcome/censoring/sampling nuisance functions.

Do not activate it just because a predictive model is being trained. It is for causal estimation support where nuisance functions feed an identified causal target.

## Inputs To Read

Read only the compact state needed for DML support:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: valid features, leakage risks, interpretable covariates, deployment constraints, and effect-scale meaning.
- `data_analyst`: analysis alignment, feature matrices, sample size, high-dimensional structure, splits, missingness, support, clustering, and artifacts.
- `method_lead`: design route, estimand, target model, nuisance functions, assumptions, inference need, and wording boundary.
- related `subskill_records`: especially doubly robust estimation, matching/weighting, heterogeneous effects, policy rules, longitudinal g-methods, survival, or transport records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded implementation details needed by this module.

## Fit / Failure Logic

Check these before recommending DML:

- Target: PLR/partial-linear ATE, IRM/interactive regression treatment effect, CATE/orthogonal forest, policy score, or nuisance plugin target is explicit.
- Design: selected design route identifies the target under stated assumptions.
- Features: nuisance features are pre-treatment or correctly time-ordered; no leakage, mediators, colliders, or post-treatment variables are used improperly.
- Cross-fitting: folds, repeated splits, cluster/group splits, and tuning separation are feasible.
- Learners: candidate learners match sample size, covariate type, treatment/outcome type, and inference needs.
- Positivity: propensity/support remains adequate after flexible nuisance fitting.
- Inference: standard errors, confidence intervals, bootstrap/repeated splitting, or forest variance are valid for the chosen estimator.

Apply the common constructed-input checks to DML inputs. Feature engineering, embeddings, regularization screens, nuisance learner libraries, fold construction, sample restrictions, and residualization can be valid when they are pre-treatment or otherwise target-valid and isolated from the outcome/effect evaluation being claimed. If preprocessing, tuning, folds, or feature selection leak across splits or change the low-dimensional target, DML-style inference should be downgraded or rechecked.

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

## Statistical Evidence And Claim Scope

Fill `statistical_evidence` with the DML or orthogonal-learning claim supported by the score and splitting design:

- `inference_supported` when the target has a valid orthogonal score, cross-fitting is leakage-free, nuisance learners are appropriate and stable, and package standard errors/intervals are valid for the estimator and data dependence.
- `internally_validated` for learner, split, and nuisance-sensitivity evidence that supports stability but does not by itself identify the causal target.
- `exploratory_only` when DML is used as a flexible nuisance plugin, when cross-fitting leaks preprocessing or tuning, when folds are too small, or when the output is a discovered pattern rather than the low-dimensional DML target.
- `claim_scope`: low-dimensional causal parameter, partially linear coefficient, IRM ATE/ATT, PLIV effect, orthogonal forest/CATE summary, or nuisance-support result; state which one.
- Valid routes include Neyman-orthogonal scores, cross-fitting, repeated splits, cluster/group-aware folds, valid score-specific SE, bootstrap/repeated-split sensitivity, and benchmark comparisons to simpler estimators.
- Do not use DML orthogonalization as validation for selected subgroups, treatment rules, model narratives, or invalid causal designs.

Treat the listed routes as examples, not an exhaustive whitelist. Equivalent, newer, or domain-adapted orthogonal/debiased ML routes are acceptable when their assumptions, diagnostics, uncertainty logic, data-dependence handling, and supported claim scope are explicitly recorded in `statistical_evidence`.

For DML, the statistical claim is about a low-dimensional target estimated with an orthogonal score and valid sample splitting, not about having used machine learning. Treat these as claim-boundary issues:

- the score/model class must match the causal estimand: PLR, IRM, PLIV/IIVM, ATT/ATE, orthogonal forest/CATE summary, or nuisance plugin support;
- cross-fitting must isolate nuisance training, preprocessing, imputation, feature selection, and tuning from the fold being scored;
- high predictive accuracy is not evidence of causal validity, and weak nuisance/support diagnostics can still invalidate inference;
- DML does not validate discovered subgroups, policy rules, causal narratives, or post-treatment feature sets;
- clustering, panels, survival/censoring, rare treatment/outcome, and small folds require adapted splitting and variance logic.

### Writing The YAML Handoff

When writing `subskill_records.statistical_evidence`:

1. Set `status: inference_supported` only when the orthogonal score matches the target, cross-fitting is leakage-free, nuisance learners are stable, support is adequate, and score-specific uncertainty is valid for the data dependence.
2. Set `status: internally_validated` when learner/fold/repeated-split/nuisance diagnostics support stability but the output is still internal evidence or depends on design-route assumptions.
3. Set `status: exploratory_only` when DML is only a nuisance plugin, cross-fitting is incomplete, tuning/preprocessing leaks, folds are too small, or the output is a discovered CATE/policy/subgroup pattern rather than the prespecified DML target.
4. Set `status: blocked` when the design route is invalid, features leak post-treatment information, the score does not match the estimand, support fails, or valid splitting/variance is infeasible.
5. Set `claim_scope` to `target_sample` for the low-dimensional target in the analysis sample, `model_implied` for nuisance/CATE scores, `internally_validated` for stable internal orthogonal estimates, or `exploratory_only` for plugin/discovery use.
6. Use `inference_or_validation_route` for DML-specific support: Neyman-orthogonal score, PLR/IRM/PLIV/IIVM score, post-double-selection, cross-fitting, group/cluster-aware folds, repeated splits, valid score-specific SE, multiplier/bootstrap when justified, orthogonal forest variance, nuisance calibration/residual diagnostics, and simple-estimator benchmarks.
7. Use `method_specific_limits` to state the exact boundary: low-dimensional parameter only, no validation of design, no support for selected subgroups/rules, nuisance plugin only, leakage risk, small-fold finite-sample caveat, invalid cluster/panel variance, or post-treatment feature exclusion.
8. Ask `data_analyst` for the smallest missing check: feature timing/leakage table, fold/grouping plan, tuning isolation, nuisance performance and calibration, residual diagnostics, propensity/support tails, repeated-split sensitivity, benchmark estimates, and cluster/survival variance plan if relevant.
9. Set `method_lead_recheck.required: true` when DML diagnostics reveal invalid features, target-score mismatch, support failure, contradictory estimates, or a need to weaken causal/inference wording.

Example - exploratory DML plugin:

```yaml
statistical_evidence:
  status: exploratory_only
  claim_scope: model_implied
  inference_or_validation_route:
    - "DML/orthogonal ML is currently used as a flexible nuisance or CATE plugin; score-specific inference and leakage-free cross-fitting are not established."
    - "Run feature timing/leakage review, grouped cross-fitting, repeated-split sensitivity, and benchmark comparison."
  method_specific_limits:
    - "Do not report ML-discovered subgroups or policy rules as inference-supported DML targets."
    - "High nuisance predictive accuracy does not validate the causal design or target."
requests:
  data_analyst:
    - "Produce feature timing table, fold/tuning isolation plan, nuisance diagnostics, propensity/support tails, repeated-split sensitivity, and simple-estimator benchmark."
method_lead_recheck:
  required: true
  reason: "The current DML use may be nuisance support rather than valid inference for the selected causal target."
```

Example - supported DML target:

```yaml
statistical_evidence:
  status: inference_supported
  claim_scope: target_sample
  inference_or_validation_route:
    - "Neyman-orthogonal score matches the recorded PLR/IRM/PLIV/IIVM/ATE/ATT target and uses leakage-free cross-fitting."
    - "Learner stability, support diagnostics, repeated splits, and score-specific uncertainty reviewed."
  method_specific_limits:
    - "Claim is for the recorded low-dimensional DML target under the selected design-route assumptions."
    - "DML does not validate post-hoc heterogeneity, policy, or narrative claims without the relevant target module."
```

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
- statistical_evidence: status, DML claim scope, orthogonal-score inference or validation route, and exact wording limits;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.implementation_support`:

- set `subskill_id`: `32-double-machine-learning`
- set `module_type`: `implementation_support`
- set `role`: `implementation_support` or `support_module` as fits the activation
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `statistical_evidence` using the section above before finalizing the record
- fill `type_specific.implementation_support`: `implementation_role`, `estimator_or_model_family`, `required_data_shape`, `nuisance_or_prediction_components`, `diagnostic_outputs`, `reproducibility_outputs`, and `package_or_code_options`

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
