---
name: heterogeneous-effects-policy
description: "Target and decision module for CATE, HTE, subgroup effects, treatment prioritization, uplift modeling, individualized treatment rules, policy learning, and decision-focused reporting after a primary causal route has identified the target effect."
---

# Heterogeneous Effects And Policy

## Role

Use this as a **target, subgroup, and decision module**. It extends a primary route to answer "for whom?", "which subgroup?", or "what decision rule?" It does not identify the causal effect by itself.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "09-heterogeneous-effects-policy"`
- `role: "target_or_outcome_module"` or `support_module`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: subgroup, CATE, policy, prioritization, treatment-rule, or decision-analysis need
- `selected_route_id`: the base route this HTE/policy extension depends on
- `inputs_reviewed`: base estimate, claim strength, pre-treatment effect modifiers, action set, utility/outcome, constraints, sample size, support, and validation plan
- `outputs_created`: subgroup/CATE/policy plan, script path, first-pass CATE output, validation diagnostics, policy-value table, or presentation artifact
- `diagnostics_reviewed`: subgroup support, overlap by modifier, honest validation, CATE calibration, rank stability, multiplicity, policy value uncertainty, and fairness/constraint checks when relevant
- `limitations`: exploratory HTE status, small subgroup samples, weak support, multiplicity, external validity, decision constraints, or overinterpretation risk
- `feedback_for_main_skill`: whether the result can guide a decision or should remain exploratory
- `requests_for_main_skill`: ask user to define decision threshold/utility, choose subgroups, confirm action constraints, activate DR/ML support, refresh Data Technician, or accept exploratory language
- `readiness`: production readiness after this HTE/policy review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when HTE/policy review reveals the base causal route or target decision is invalid
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `ask_user`, `confirm_analysis_plan`, `run_first_pass`, `run_diagnostics`, `activate_method_subskill`, `proceed_with_caveat`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to scripts, CATE outputs, subgroup tables, policy plots, validation diagnostics, or presentation artifacts

## Fit Check

Given the route handoff, check:

- base route and claim strength are already defined;
- effect modification variables are pre-treatment or otherwise valid for the target decision;
- subgroup/CATE targets are confirmatory, exploratory, policy-oriented, or personalized;
- sample size, support, overlap, multiplicity, and validation/honesty are adequate;
- the requested action recommendation has a defined decision objective, target population, action set, implementation scope, constraints, and decision-relevant costs, harms, guardrails, or fairness requirements when relevant;
- policy learning has a defined action set, utility/outcome, constraints, and evaluation strategy.

If the base causal route is weak, keep HTE/policy results exploratory or user-directed. Do not report individualized recommendations as validated decisions without support.

## Package And Code Fit

Candidate tools include R `grf`, `policytree`, and Python `econml`, `causalml`, or custom meta-learner workflows. Confirm the package supports the estimand, treatment type, validation strategy, uncertainty, and policy evaluation needed.

Before `production_gate.status` is ready, consider these analysis paths:

- pre-specified subgroup contrasts with interaction models when the goal is interpretable HTE;
- causal forests or orthogonal/DML CATE models when sample size and support justify flexible heterogeneity;
- S/T/X/R learners only when their nuisance assumptions, validation, and uncertainty limits are clear;
- policy trees or treatment rules when the user has a defined action set, utility, capacity, fairness, or operational constraints;
- descriptive subgroup summaries only when the base route or validation is too weak for decision claims.

Simple sample scripts to provide or adapt:

- top-level `scripts/python/econml_cate_template.py`
- top-level `scripts/R/grf_causal_forest_template.R`
- interaction-model snippets using `statsmodels` or R `fixest` when interpretability is more important than flexible CATE

Post-fit diagnostics must cover:

- base-route diagnostics and claim strength, because HTE cannot rescue a weak base causal route;
- pre-treatment validity of effect modifiers and whether any are proxies for post-treatment processes;
- overlap/support within important subgroups or modifier ranges;
- subgroup sample size, multiple comparisons, and uncertainty inflation;
- honest splitting, cross-validation, out-of-sample calibration, BLP/RATE/Qini-style ranking diagnostics when applicable;
- policy value uncertainty, off-policy evaluation assumptions, and sensitivity to decision thresholds;
- stability of top subgroups or treatment rules across folds, seeds, learner sets, and reasonable specifications.

## Pass / Fail Output

If fit passes, produce subgroup/CATE/policy analysis plan, validation strategy, diagnostics, and reporting cautions. If fit fails, return whether the problem is base-route validity, data support, decision definition, package support, or overinterpretation risk.

Main-skill feedback should include:

- whether HTE/policy output is confirmatory, exploratory, or not supportable;
- which subgroups, modifiers, or decision rules are defensible enough to present;
- which diagnostics and validation checks constrain interpretation;
- whether rollout, scale-up, renewal, shutdown, expansion, targeting, or prioritization language should be conditional, exploratory, or avoided because decision evidence is incomplete;
- the next user question, if any, such as choosing the decision objective, acceptable policy constraints, or whether exploratory subgroup findings are useful;
- this subskill's `subskill_analyses` chunk, artifact paths, and recommendations for main-owned updates to `analysis.recommended_diagnostics` and `production_gate.diagnostics_status`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- base route evidence and the exact HTE, CATE/GATE, subgroup, treatment-rule, or policy-value target;
- subgroup definitions, action constraints, utility/benefit assumptions, and whether they were user-confirmed;
- validation, fold/seed/learner stability, multiplicity, calibration, and policy-value uncertainty diagnostics;
- plots or tables for subgroup effects, treatment rules, policy value, and uncertainty;
- wording that separates confirmed average-effect evidence from exploratory heterogeneity or decision-support evidence.

Recommend `return_to_foundation` when the base causal route is not valid, proposed effect modifiers are post-treatment for the intended decision, subgroup support is absent for the target population, the requested policy action set does not match the treatment/comparator, or the user goal actually requires a different estimand or design.

Stay in production with a weaker claim when the base route is supportable but HTE/policy evidence is exploratory, underpowered, unstable across folds, sensitive to learner choice, or only useful for hypothesis generation. Then recommend cautious presentation, more diagnostics, or a descriptive/policy-simulation framing.

Recommend production-gate readiness only when the base route evidence, HTE/policy outputs, validation diagnostics, uncertainty, decision constraints, limitations, and audience-appropriate presentation artifacts are recorded.

## References

- `references/workflow.md`: detailed HTE/policy workflow.
- `references/literature_and_software.md`: literature and software notes.
