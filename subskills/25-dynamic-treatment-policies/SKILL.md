---
name: dynamic-treatment-policies
description: "Use as a target_goal method/task subskill for dynamic treatment policies, dynamic treatment regimes, adaptive strategies, sequential decision rules, treatment regimes over time, SMART designs, Q-learning, A-learning, outcome weighted learning, policy value, off-policy evaluation, and longitudinal decision support."
---

# dynamic_treatment_policies

## Role

Act as a bounded `target_goal` specialist for strategies that adapt over time. Clarify the sequential decision points, histories available at each point, action sets, value target, safety constraints, and whether the data can evaluate or learn counterfactual dynamic regimes.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

This module defines dynamic policy targets and decision logic. It does not supply longitudinal identification by itself; coordinate with `09-longitudinal-gmethods` whenever time-varying confounding, censoring, or counterfactual regime value is at issue.

## When To Activate

Use this module when the project asks what adaptive strategy to follow, how treatment should change based on evolving response/history, how to compare dynamic regimes, how to learn or evaluate sequential decision policies, how to analyze SMART-style designs, or how to report dynamic regime value.

Do not use it for a one-time baseline treatment rule; route those to `21-point-treatment-rules`. Do not use it when the user only needs a longitudinal total effect of a fixed sustained regimen; route first to `09-longitudinal-gmethods`.

## Inputs To Read

Read only the compact state needed for the target question:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: treatment strategy meaning, safety limits, clinical/operational feasibility, response definitions, and interpretation.
- `data_analyst`: long-format data status, decision times, action availability, histories, censoring, missingness, support, adherence, and artifacts.
- `method_lead`: longitudinal design route, estimand set, sequential exchangeability/positivity assumptions, causal structure, diagnostics, and wording boundary.
- related `subskill_records`: especially `09-longitudinal-gmethods`, point treatment rules, survival, doubly robust estimation, double machine learning, and dose-response records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded target-goal details needed by this module.

## Fit / Failure Logic

Check these before recommending a method:

- Decision schedule: times or visits when actions can change are explicit.
- History set: variables available before each decision are reconstructible and deployment-feasible.
- Action set: feasible actions at each decision are defined and supported.
- Regime definition: candidate strategies are deterministic, stochastic, learned, fixed, or adaptive with clear rules.
- Value target: outcome, utility, survival, cost, harm, regret, or policy value is defined.
- Longitudinal support: each regime/action has adequate support across histories.
- Confounding/censoring: time-varying confounders affected by prior treatment and censoring are handled.
- Validation: learned policies use honest splitting, cross-fitting, or held-out/off-policy evaluation when possible.

Block or caveat policy claims when histories are not reconstructible, actions lack support, regimes are not well-defined interventions, time-varying confounding is unhandled, censoring/missingness is severe, or the data cannot evaluate counterfactual strategy values.

## Data Work It May Request

Ask `data_analyst` for one small, concrete follow-up by default:

- long-format history table with id, time, action, covariates, censoring, and outcome;
- action availability and support by history strata;
- regime adherence summaries for candidate rules;
- missingness/censoring summaries and inverse probability weight inputs;
- candidate state variables available before each decision;
- value-function components such as outcome, cost, harm, or survival time;
- train/test, cross-fitting, or off-policy evaluation split plan;
- simpler interpretable regime candidates for comparison.

## Method Or Support Guidance

Distinguish common dynamic policy targets:

- **Regime comparison**: compare fixed or adaptive strategies specified in advance.
- **Dynamic regime value**: estimate expected outcome under a candidate dynamic strategy.
- **Optimal or learned regime**: learn a strategy from data; needs stronger validation and support.
- **SMART analysis**: analyze randomized sequential assignments in a SMART or MRT-like design.
- **Longitudinal modified treatment policy**: evaluate feasible modifications to treatment over time.
- **Exploratory decision support**: prototype candidate strategies without deployment-ready claims.

Candidate method lanes:

- Sequential g-formula or parametric g-computation for fixed or dynamic strategy comparison.
- IPW/MSM for sustained or dynamic regime value when weights are stable.
- Q-learning, A-learning, outcome weighted learning, or residual weighted learning for learned regimes.
- Dynamic weighted ordinary least squares or value-search methods when interpretable regimes matter.
- TMLE/ltmle/lmtp approaches for longitudinal policies and modified treatment policies.
- Off-policy evaluation or fitted Q evaluation for logged sequential decision data, with causal caveats.
- SMART-specific methods when sequential randomization is built into the design.

Use `scripts/recommend.py` with `sample_input.json` when quick target/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Diagnostics And Sensitivity

Review:

- support and positivity over histories for each action or regime;
- weight instability, effective sample size, and censoring assumptions;
- regime adherence and feasibility;
- overfitting, policy instability, and value optimism for learned regimes;
- uncertainty for policy value and regret;
- sensitivity to state variables, action definitions, learner class, and time grid;
- safety/fairness constraints and simpler interpretable alternatives;
- whether the policy is exploratory, candidate, internally validated, externally validated, or deployment-ready.

Do not call a learned dynamic regime "optimal" unless the policy class, value target, assumptions, and validation design are explicit.

## Output To Main Team

Return:

- dynamic policy target, decision schedule, action set, history set, and value function;
- whether the request is direct, adapted, exploratory, blocked, or not applicable;
- feasible method/package lane and why it fits;
- identification handoff needs for `09-longitudinal-gmethods`;
- assumptions, diagnostics, limitations, and robustness needs;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.target_goal`:

- set `subskill_id`: `25-dynamic-treatment-policies`
- set `module_type`: `target_goal`
- set `role`: `target_module`
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `type_specific.target_goal`: `target_goal`, `estimand_targets`, `target_population`, `effect_scale`, `decision_or_interpretation_goal`, `design_route_needed`, and `reporting_boundary`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Dynamic Treatment Strategy" or "Adaptive Policy Analysis";
- dynamic policy question and relation to the user's goal;
- decision schedule, histories, actions, and value target;
- longitudinal design route and identification assumptions;
- method, software, split/cross-fit/off-policy evaluation plan;
- estimated regime value, policy comparison, or exploratory artifacts if computed;
- diagnostics, support, censoring, and sensitivity checks;
- claim boundary: exploratory, candidate, internally validated, externally validated, or not supportable;
- code, table, figure, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed dynamic policy workflow, reviewer handoffs, diagnostics, and report integration.
- `references/literature_and_software.md`: literature map and R/Python package matrix.
- `examples/`: short R/Python templates for dynamic regime learning, g-formula, LMTP, and fitted Q-style support.
- `scripts/recommend.py`: rule-based target/package recommender for quick internal triage.
