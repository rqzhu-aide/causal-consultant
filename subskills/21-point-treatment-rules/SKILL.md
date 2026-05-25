---
name: point-treatment-rules
description: "Use as a target_goal method/task subskill for single-point individualized treatment rules, one-time policy learning, targeting, prioritization, uplift, budgeted allocation, policy value, regret, and decision-rule report support."
---

# point_treatment_rules

## Role

Act as a bounded `target_goal` specialist for one-time treatment or action rules. Clarify what decision is being made, what information is available at that decision time, which actions are feasible, what utility or value the rule should optimize, and how the learned or proposed rule will be evaluated.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Follow the shared `Common Constructed-Input Claim Checks` in `references/method_subskill_contract.md`: judge the analysis dataset used by this method, not source-data transformations in isolation. When `data_analyst` records constructed inputs, simplifications, or alignment limits, use existing `statistical_evidence`, `method_specific_limits`, `requests`, and `method_lead_recheck` fields to state whether the input supports this module's estimand and assumptions or needs reframing.

This module defines the target and decision logic. It still needs a valid design route and reviewer support before any strong causal or deployment claim is made.

## When To Activate

Use this module when the project asks who should receive treatment, whom to target, how to prioritize limited capacity, how to learn or evaluate an individualized treatment rule, how to compare decision rules, or how to convert heterogeneity estimates into a one-time treatment recommendation.

Do not use it for repeated adaptive decisions over time; route those to `25-dynamic-treatment-policies`. Do not treat ordinary subgroup description as a policy unless the user wants a decision rule, ranking, budgeted allocation, or policy-value comparison.

## Inputs To Read

Read only the compact state needed for the target question:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: action meaning, harm/cost, fairness, practical constraints, domain standards.
- `data_analyst`: analysis alignment, data status, timing, baseline feature availability, support/overlap, missingness, split/cross-fit plan, artifacts.
- `method_lead`: design route, candidate estimands, assumptions, selected framework, diagnostics, claim boundary.
- related `subskill_records`: especially design route, heterogeneity, matching/weighting, doubly robust estimation, double machine learning, survival, or dynamic policy records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded target-goal details needed by this module.

## Fit / Failure Logic

Check these before recommending a method:

- Decision point: exactly one action decision, with no future adaptive history needed.
- Action set: binary or multi-action choices are concrete; "treat more" or continuous dosing may need `23-dose-response-effects`.
- Information set: rule features are measured before action and usable at deployment.
- Value target: outcome direction, treatment cost, harm, budget, capacity, fairness, or risk constraints are defined enough to optimize.
- Identification support: the design route can identify or evaluate policy value under the proposed action set.
- Data support: each candidate action has adequate covariate support for the groups where the rule may assign it.
- Evaluation plan: use held-out, cross-fitted, or externally validated policy-value estimates whenever the same data learn the rule.

Apply the common constructed-input checks to treatment-rule inputs. Risk scores, effect scores, grouped features, imputed covariates, budget filters, eligibility restrictions, or learned rule features can be valid when they are available at decision time and match the action/value target. If the same data select and evaluate the rule, or if constructed features leak post-action information or change the deployable population, report the rule as exploratory until honest policy-value evaluation is available.

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

## Statistical Evidence And Claim Scope

Fill `statistical_evidence` with the decision-rule claim supported by the evaluation design:

- `inference_supported` or `internally_validated` only when the rule-learning and rule-evaluation steps are separated by honest splitting, cross-fitting, held-out/off-policy evaluation, or external validation appropriate to the design.
- `exploratory_only` when value, regret, uplift, targeting gain, or selected rule structure is evaluated on the same data used to learn or tune it.
- `claim_scope`: policy value within the observed/targeted decision class, baseline information set, and feasible action set; do not claim individualized optimality beyond that class.
- Valid routes include doubly robust policy evaluation, policy trees, outcome-weighted learning, uplift/Qini evaluation, regret/value intervals, cross-fitted value estimation, safety/subgroup constraints, and sensitivity to learner, budget, threshold, and cost choices.
- Do not report a training-set policy value or model-picked treatment rule as deployment-ready without honest evaluation and clear decision constraints.

Treat the listed routes as examples, not an exhaustive whitelist. Equivalent, newer, or domain-adapted policy-learning and policy-evaluation routes are acceptable when their assumptions, diagnostics, uncertainty logic, data-dependence handling, and supported claim scope are explicitly recorded in `statistical_evidence`.

For point treatment rules, the statistical claim is about the value of a rule under a feasible information set, not merely about CATE signs or model accuracy. Treat these as claim-boundary issues:

- rule learning and rule evaluation must be separated or corrected; same-data value estimates are usually optimistic;
- a rule is only meaningful for the eligible population, action set, budget/cost constraints, fairness/safety constraints, and baseline features available at decision time;
- randomization probabilities, logged propensities, or a valid observational design route are needed before off-policy value claims are meaningful;
- policy trees, outcome weighted learning, uplift models, and DR policy learning support different targets and validation needs;
- a rule can be a candidate or prioritization aid without being a deployment-ready or globally optimal rule.

### Writing The YAML Handoff

When writing `subskill_records.statistical_evidence`:

1. Set `status: inference_supported` only when the rule value, regret, or welfare comparison has design-compatible evaluation, valid uncertainty, and explicit action/cost/eligibility constraints.
2. Set `status: internally_validated` when cross-fitting, held-out validation, repeated splits, off-policy evaluation, or stability checks support the candidate rule but external deployment evidence is absent.
3. Set `status: externally_validated` only when the same rule or rule class has been evaluated on an independent target dataset, prospective evaluation, or deployment-relevant validation sample.
4. Set `status: exploratory_only` when the same data learn/tune/evaluate the rule, when the rule is derived from a same-data CATE ranking, or when costs, constraints, or deployable features are not settled.
5. Set `status: blocked` when action support is absent, rule features are post-action or unavailable at decision time, the value function is undefined, or no valid design route can evaluate counterfactual rule value.
6. Set `claim_scope` to `target_sample` for internally evaluated value in the analysis sample, `target_population` only with transport/generalizability support, `model_implied` for score/ranking output, `internally_validated` for honest held-out/cross-fitted value, or `exploratory_only` for candidate screens.
7. Use `inference_or_validation_route` for policy-specific support: randomized policy evaluation, IPW/SNIPS or doubly robust off-policy value, empirical welfare maximization, policy tree evaluation, outcome weighted learning with validation, cross-fitted DR scores, uplift/Qini on held-out data, regret/value intervals, repeated-split stability, external validation, and safety/fairness subgroup checks.
8. Use `method_specific_limits` to state the exact boundary: not optimal outside the policy class, not deployment-ready, value only for a budget/action set, same-data value is optimistic, CATE ranking is not policy value, or observational policy value depends on measured-confounding assumptions.
9. Ask `data_analyst` for the smallest missing check: baseline feature leakage screen, action support by candidate rule strata, train/test or cross-fitting plan, logged propensity/randomization availability, held-out policy value, regret/value interval, rule stability, budget sensitivity, and safety/fairness tables.
10. Set `method_lead_recheck.required: true` when the record changes the user's goal from heterogeneity to policy learning, changes the estimand to policy value/regret, exposes invalid feature/action support, or forces weaker wording for the rule.

Example - exploratory learned rule:

```yaml
statistical_evidence:
  status: exploratory_only
  claim_scope: model_implied
  inference_or_validation_route:
    - "Current rule was learned and evaluated on the same data; honest policy-value evaluation is not yet available."
    - "Run cross-fitted or held-out doubly robust policy evaluation before claiming value improvement."
  method_specific_limits:
    - "Report as a candidate targeting rule, not an optimal or deployment-ready rule."
    - "CATE ranking does not by itself validate policy value under the budget and action constraints."
requests:
  data_analyst:
    - "Create a leakage-checked baseline feature set, action-support table, and cross-fitted/held-out policy value estimate against treat-all, treat-none, and current practice."
method_lead_recheck:
  required: true
  reason: "The analysis target shifts from effect heterogeneity to policy value and requires bounded report wording."
```

Example - internally validated policy value:

```yaml
statistical_evidence:
  status: internally_validated
  claim_scope: target_sample
  inference_or_validation_route:
    - "Rule value estimated with held-out or cross-fitted IPW/DR off-policy evaluation using design-compatible propensities or nuisance models."
    - "Rule stability, budget/cost sensitivity, and subgroup safety checks reviewed."
  method_specific_limits:
    - "Claim is value improvement for the recorded policy class, action set, baseline information set, and analysis population."
    - "No external deployment or target-population claim without independent validation or transport evidence."
```

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
- statistical_evidence: status, policy-value claim scope, rule-evaluation route, and exact wording limits;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.target_goal`:

- set `subskill_id`: `21-point-treatment-rules`
- set `module_type`: `target_goal`
- set `role`: `target_module`
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `statistical_evidence` using the section above before finalizing the record
- fill `type_specific.target_goal`: `target_goal`, `estimand_targets`, `target_population`, `effect_scale`, `decision_or_interpretation_goal`, `design_route_needed`, and `reporting_boundary`

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
