---
name: heterogeneous-effects-individualized-policy
description: "Target, individualized-decision, and single-stage policy module for CATE, HTE, subgroup effects, treatment prioritization, uplift modeling, individualized treatment rules, binary or multi-arm treatment selection, continuous dose/intensity decisions, outcome weighted learning, residual weighted learning, policy learning, and decision-focused reporting after a primary causal route has identified the target effect."
---

# Heterogeneous Effects, Individualized Decisions, And Policy

## Role

Use this as a **target, subgroup, individualized-decision, and single-stage policy module**. It extends a primary route to answer "for whom?", "which subgroup?", "which individual should receive which action?", "which treatment arm?", "which dose or intensity?", or "what decision rule?" It does not identify the causal effect by itself.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "09-heterogeneous-effects-individualized-policy"`
- `role: "target_or_outcome_module"` or `support_module`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: subgroup, CATE, policy, prioritization, treatment-rule, or decision-analysis need
- `selected_route_id`: the base route this HTE/individualized-policy extension depends on
- `inputs_reviewed`: base estimate, claim strength, pre-treatment effect modifiers, treatment type, action set or dose range, utility/outcome, constraints, sample size, support, and validation plan
- `outputs_created`: subgroup/CATE/individualized-policy plan, script path, first-pass CATE, treatment-rule, multi-arm, or dose-rule output, validation diagnostics, policy-value table, or presentation artifact
- `diagnostics_reviewed`: subgroup support, overlap by modifier or decision group, generalized propensity or dose support when relevant, honest validation, CATE calibration, rank stability, treatment-rule value, multiplicity, policy value uncertainty, and fairness/constraint checks when relevant
- `limitations`: exploratory HTE status, small subgroup samples, weak support, multiplicity, external validity, individualized-decision constraints, or overinterpretation risk
- `feedback_for_main_skill`: whether the result can guide a decision or should remain exploratory
- `requests_for_main_skill`: ask user to define decision threshold/utility, choose subgroups, confirm action constraints, activate DR/ML support, refresh Data Technician, or accept exploratory language
- `readiness`: production readiness after this HTE/individualized-policy review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when HTE/individualized-policy review reveals the base causal route or target decision is invalid
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `ask_user`, `confirm_analysis_plan`, `run_first_pass`, `run_diagnostics`, `activate_method_subskill`, `proceed_with_caveat`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to scripts, CATE outputs, subgroup tables, policy plots, validation diagnostics, or presentation artifacts

## Fit Check

Given the route handoff, check:

- base route and claim strength are already defined;
- effect modification variables are pre-treatment or otherwise valid for the target decision;
- subgroup/CATE/individualized-policy targets are confirmatory, exploratory, policy-oriented, or personalized;
- sample size, support, overlap, multiplicity, and validation/honesty are adequate;
- the requested action recommendation has a defined decision objective, target population, decision-time variables, treatment type, binary or multi-arm action set, continuous dose/intensity range if applicable, implementation scope, constraints, and decision-relevant costs, harms, guardrails, or fairness requirements when relevant;
- individualized treatment-rule or policy learning has a defined reward/utility outcome, action set or dose grid, constraints, evaluation strategy, and deployment boundary;
- continuous dose/intensity recommendations stay inside observed or defensibly supported treatment ranges and have a clinically, operationally, or policy-approved grid or constraint set before any "optimal dose" language is used.

If the base causal route is weak, keep HTE/individualized-policy results exploratory or user-directed. Do not report individualized recommendations as validated decisions without support.

## Package And Code Fit

Candidate tools include R `grf`, `policytree`, `polle`, `tmle3mopttx`, `evalITR`/`evalHTE`, `GenericML`, `marginaleffects`/`emmeans`, `CausalGPS`, `causaldrf`, or `CausalSpline`; Python `econml`, `causalml`, `scikit-uplift`, or `causallib`; and custom meta-learner, outcome-weighted-learning, residual-weighted-learning, policy-value, or continuous-dose workflows. Confirm the package supports the estimand, treatment type, action set or dose range, validation strategy, uncertainty, and policy evaluation needed.

Before `production_gate.status` is ready, consider these analysis paths:

- pre-specified subgroup contrasts with interaction models when the goal is interpretable HTE;
- causal forests or orthogonal/DML CATE models when sample size and support justify flexible heterogeneity;
- S/T/X/R learners only when their nuisance assumptions, validation, and uncertainty limits are clear;
- policy trees, outcome weighted learning, residual weighted learning, empirical welfare maximization, targeted-learning optimal-rule estimators, or doubly robust policy learning when the user needs a binary or multi-arm individualized treatment rule and has a defined action set, reward/utility, capacity, fairness, or operational constraints;
- continuous-dose workflows only when the treatment is a single-stage dose or intensity with adequate support: estimate a dose-response or conditional marginal response, evaluate candidate dose rules over a bounded grid, compare against simple fixed-dose or current-policy baselines, and avoid extrapolating to unsupported dose levels;
- descriptive subgroup summaries only when the base route or validation is too weak for decision claims.

Simple sample scripts to provide or adapt:

- top-level `scripts/python/econml_cate_template.py`
- top-level `scripts/R/grf_causal_forest_template.R`
- interaction-model snippets using `statsmodels` or R `fixest` when interpretability is more important than flexible CATE

Post-fit diagnostics must cover:

- base-route diagnostics and claim strength, because HTE cannot rescue a weak base causal route;
- pre-treatment validity of effect modifiers and whether any are proxies for post-treatment processes;
- overlap/support within important subgroups or modifier ranges;
- treatment-arm support for binary or multi-arm rules, and generalized propensity or dose support for continuous-dose rules;
- subgroup sample size, multiple comparisons, and uncertainty inflation;
- honest splitting, cross-validation, out-of-sample calibration, BLP/RATE/Qini-style ranking diagnostics when applicable;
- policy value uncertainty, off-policy evaluation assumptions, treatment-rule value versus baselines, and sensitivity to decision thresholds, class weights, rewards, dose grids, and constraints;
- stability of top subgroups or treatment rules across folds, seeds, learner sets, and reasonable specifications.

## Pass / Fail Output

If fit passes, produce subgroup/CATE/policy analysis plan, validation strategy, diagnostics, and reporting cautions. If fit fails, return whether the problem is base-route validity, data support, decision definition, package support, or overinterpretation risk.

Main-skill feedback should include:

- whether HTE/individualized-policy output is confirmatory, exploratory, or not supportable;
- which subgroups, modifiers, or decision rules are defensible enough to present;
- which diagnostics and validation checks constrain interpretation;
- whether rollout, scale-up, renewal, shutdown, expansion, targeting, or prioritization language should be conditional, exploratory, or avoided because decision evidence is incomplete;
- the next user question, if any, such as choosing the decision objective, acceptable policy constraints, or whether exploratory subgroup findings are useful;
- this subskill's `subskill_analyses` chunk, artifact paths, and recommendations for main-owned updates to `analysis.recommended_diagnostics` and `production_gate.diagnostics_status`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- base route evidence and the exact HTE, CATE/GATE, subgroup, treatment-rule, or policy-value target;
- subgroup definitions, decision-time variables, binary or multi-arm action constraints, continuous dose/intensity bounds when relevant, utility/benefit assumptions, reward coding, and whether they were user-confirmed;
- validation, fold/seed/learner stability, multiplicity, calibration, treatment-rule value, dose-response or dose-rule support, and policy-value uncertainty diagnostics;
- plots or tables for subgroup effects, treatment rules, dose-response or dose-rule outputs, policy value, and uncertainty;
- wording that separates confirmed average-effect evidence from exploratory heterogeneity or decision-support evidence.

When the Report Writer uses the gate-ready or exploratory data-backed templates, contribute:

- **Summary / Claim Status:** whether heterogeneity, individualized treatment-rule, or policy output is confirmatory, exploratory, or decision-support only, and how it depends on the base route.
- **Question, Data, And Design:** base estimand, effect modifiers, decision-time variables, subgroup definitions, action set or dose range, target population, reward/utility or constraint assumptions, and user-confirmed decision objective.
- **Data Readiness And Analysis Specification:** modifier timing, subgroup and decision-rule support, learner, interaction, OWL/RWL, policy-tree, continuous-dose, or policy-value model, validation strategy, multiplicity handling, and policy-value evaluation setup.
- **Results And Diagnostics:** subgroup/CATE/policy tables, individualized treatment-rule plots, dose-response or dose-rule plots, policy-value contrasts, uncertainty, calibration, rank or fold stability, multiplicity, fairness, and constraint diagnostics.
- **Interpretation And Next Step:** whether findings can guide action, only prioritize follow-up, require user-defined utility/constraints, or should remain hypothesis-generating.
- **Reproducibility Appendix:** subgroup definitions, treatment-rule code, reward coding, learner or weighted-classification settings, folds/seeds, package versions, validation outputs, and plot/table paths.

Recommend `return_to_foundation` when the base causal route is not valid, proposed effect modifiers are post-treatment for the intended decision, subgroup support is absent for the target population, the requested policy action set or dose range does not match the treatment/comparator, continuous-dose support is too sparse for the proposed rule, or the user goal actually requires a different estimand or design.

Stay in production with a weaker claim when the base route is supportable but HTE/individualized-policy evidence is exploratory, underpowered, unstable across folds, sensitive to learner choice or reward coding, or only useful for hypothesis generation. Then recommend cautious presentation, more diagnostics, or a descriptive/policy-simulation framing.

Recommend production-gate readiness only when the base route evidence, HTE/individualized-policy outputs, validation diagnostics, uncertainty, decision constraints, limitations, and audience-appropriate presentation artifacts are recorded.

## References

- `references/workflow.md`: detailed HTE/individualized-policy workflow.
- `references/literature_and_software.md`: literature and software notes.
