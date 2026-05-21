---
name: point-treatment-rules
description: "Use as a target_goal method/task subskill for single-point individualized treatment rules, one-time policy learning, targeting, prioritization, uplift, budgeted allocation, policy value, regret, and decision-rule report support."
---

# point_treatment_rules

## Role

Act as a bounded `target_goal` specialist for one-time treatment or action rules. Clarify what decision is being made, what information is available at that decision time, which actions are feasible, what utility or value the rule should optimize, and how the learned or proposed rule will be evaluated.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

This module defines the target and decision logic. It still needs a valid design route and reviewer support before any strong causal or deployment claim is made.

## When To Activate

Use this module when the project asks who should receive treatment, whom to target, how to prioritize limited capacity, how to learn or evaluate an individualized treatment rule, how to compare decision rules, or how to convert heterogeneity estimates into a one-time treatment recommendation.

Do not use it for repeated adaptive decisions over time; route those to `25-dynamic-treatment-policies`. Do not treat ordinary subgroup description as a policy unless the user wants a decision rule, ranking, budgeted allocation, or policy-value comparison.

## Inputs To Read

Read only the compact state needed for the target question:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `domain_expert`: action meaning, harm/cost, fairness, practical constraints, domain standards.
- `data_analyst`: data status, timing, baseline feature availability, support/overlap, missingness, split/cross-fit plan, artifacts.
- `method_lead`: design route, candidate estimands, assumptions, selected framework, diagnostics, claim boundary.
- related `subskill_records`: especially design route, heterogeneity, matching/weighting, doubly robust estimation, double machine learning, survival, or dynamic policy records.

## Fit / Failure Logic

Check these before recommending a method:

- Decision point: exactly one action decision, with no future adaptive history needed.
- Action set: binary or multi-action choices are concrete; "treat more" or continuous dosing may need `23-dose-response-effects`.
- Information set: rule features are measured before action and usable at deployment.
- Value target: outcome direction, treatment cost, harm, budget, capacity, fairness, or risk constraints are defined enough to optimize.
- Identification support: the design route can identify or evaluate policy value under the proposed action set.
- Data support: each candidate action has adequate covariate support for the groups where the rule may assign it.
- Evaluation plan: use held-out, cross-fitted, or externally validated policy-value estimates whenever the same data learn the rule.

Block or caveat when rule features are post-action, action support is absent, the value function is undefined, deployment constraints are missing, overlap is poor, or the selected design route supports effect estimation but not rule evaluation.

## Data Work It May Request

Ask `data_analyst` for one small, concrete follow-up by default:

- baseline feature map and leakage screen;
- action counts by key covariates and support/overlap summaries;
- missingness and constructability checks for candidate rule features;
- train/test, cross-fitting, or sample-splitting plan;
- value-function inputs such as outcome scale, costs, harms, budget, capacity, or censoring;
- exploratory CATE/ranking outputs only when clearly labeled as exploratory;
- policy-value, regret, calibration, or subgroup-safety tables on held-out or cross-fitted predictions.

## Method Or Support Guidance

Distinguish four common targets:

- **Deployable rule**: a function from baseline/current covariates to an action.
- **Ranking or prioritization**: order people by expected incremental value, often with a budget cutoff.
- **Existing rule evaluation**: estimate the value of a user-provided rule without necessarily learning a new one.
- **Rule support for reporting**: summarize candidate rules, limitations, and diagnostics for a report.

Candidate method lanes:

- Simple threshold, score, or prespecified rule when interpretability, high stakes, small samples, or governance dominate.
- Outcome-regression or Q-learning style rules when outcome models are credible and the action set is simple.
- Doubly robust or orthogonal policy learning when observational data, confounding adjustment, or flexible nuisance models are needed.
- Empirical welfare maximization or policy trees when the user needs a constrained, interpretable assignment rule.
- Uplift modeling when randomized or logged treatment data support targeting/ranking, especially in marketing or product settings.
- TMLE or targeted-learning optimal-rule workflows when formal policy-value estimation and nonparametric nuisance modeling are central.

CATE estimates can inform a policy, but a CATE model alone is not a deployable policy. Costs, constraints, support, and policy-value evaluation must be stated.

Use `scripts/recommend.py` with `sample_input.json` when a quick package/method triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Diagnostics And Sensitivity

Review:

- policy value, regret, PAPE/AUPEC/Qini or analogous value/ranking metrics as appropriate;
- overfitting, train/test leakage, cross-fitting, policy stability, and sensitivity to learner choice;
- overlap/positivity for assigned actions, including where the learned rule changes treatment;
- calibration of risk/benefit predictions if used for ranking or thresholding;
- subgroup harm, fairness, budget/cost, and clinical/product/policy feasibility;
- comparison to simpler interpretable rules and to "treat all", "treat none", or current practice;
- sensitivity to unmeasured confounding for observational policy learning.

Do not report training-set value as deployment-ready. If value is evaluated on the same data used to learn the rule, require cross-fitting, honest splitting, or an explicit exploratory caveat.

## Output To Main Team

Return:

- decision target, action set, value function, and deployment constraints;
- whether the request is direct, adapted, exploratory, blocked, or not applicable;
- feasible rule-learning or rule-evaluation route;
- packages or model families worth considering, with why they fit;
- assumptions, diagnostics, limitations, and robustness needs;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- one controlled `recommended_next_action`.

For durable records, use:

- `subskill_id`: `21-point-treatment-rules`
- `module_type`: `target_goal`
- `role`: `target_module`
- `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Individualized Treatment Rule" or "Policy Targeting Analysis";
- decision target and why a rule/ranking was considered;
- action set, eligible population, information available at decision time, and value target;
- design route and identification limits;
- rule-learning or rule-evaluation method, software, and data split;
- estimated value, regret, ranking, or diagnostics if computed;
- safety/fairness/cost/constraint checks;
- claim boundary and whether the rule is exploratory, candidate, validated, or deployment-ready;
- code, table, figure, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed one-time policy-rule workflow, reviewer handoffs, diagnostics, and report integration.
- `references/literature_and_software.md`: literature map and R/Python package matrix.
- `examples/`: short R/Python templates for policy trees, policy evaluation, EconML policy trees, and uplift-style diagnostics.
- `scripts/recommend.py`: rule-based package/method recommender for quick internal triage.
