# Point Treatment Rules Workflow
## Permission Note

This reference does not authorize execution. Treat diagnostics, artifacts, plots, tables, code, report material, or connected-specialist needs as council/result recommendations unless main explicitly routed `execution_authorized` after user-confirmed scope.

Use this reference when `SKILL.md` is not enough for a one-time policy, individualized treatment rule, targeting, or prioritization problem.

## 1. Clarify The Decision Target

Record the smallest useful target before choosing software:

- **Decision point**: one-time action from baseline/current information.
- **Eligible population**: who could receive each action.
- **Action set**: control/treat, multiple treatment options, message choices, offer levels, or other discrete actions.
- **Information set**: variables available before action and at deployment.
- **Value function**: benefit, harm, cost, utility, welfare, risk reduction, profit, conversion, survival, or composite score.
- **Constraint**: budget, capacity, fairness, safety, legal/ethical rule, clinical guideline, or operational threshold.
- **Deliverable**: candidate rule, ranking, value estimate, policy comparison, sensitivity memo, report section, or deployment-style artifact.

If the user only wants "who benefits more", recommend `10-heterogeneous-effects` review first. If the user wants repeated decisions over time, recommend `15-dynamic-treatment-policies` review.

## 2. Check Design Fit

The rule can be useful only inside a valid design route.

- Randomized trial or A/B test: strongest for learning/evaluating ITRs, but still needs held-out or cross-fitted evaluation if the same data learn the rule.
- Observational single-time exposure: possible with exchangeability, positivity, correct timing, and robust nuisance modeling; recommend `01-single-time-observational-exposure`, `20-matching-weighting-balance`, `21-doubly-robust-estimation`, or `22-double-machine-learning` support as needed.
- Instrumental variables or encouragement: policy learning may target instrument-induced effects or complier-style decisions; recommend `method_lead` review before treating it as ordinary treatment assignment.
- Longitudinal or repeated decisions: usually not this module; recommend `02-longitudinal-gmethods` and `15-dynamic-treatment-policies` review.
- Survival/time-to-event outcomes: keep the one-time decision target here, but recommend `23-survival-competing-risks` review for censoring and time-scale support.

## 3. Choose A Method Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| High-stakes, small sample, or strong need for transparency | Prespecified rule, shallow policy tree, scorecard, subgroup threshold | Easy to audit and explain | May lose value relative to flexible rules |
| Randomized trial, binary action, rule evaluation | `evalITR`, PAPE/AUPEC, held-out value, Qini/uplift diagnostics | Randomization supports clean evaluation | Same-data learning needs cross-validation |
| Randomized or observational data, interpretable policy | `policytree` with doubly robust scores; EconML `DRPolicyTree` | Empirical welfare and shallow tree outputs | Needs stable nuisance fits and support |
| Rich observational data, flexible confounding adjustment | DR policy learning, causal forests/GRF scores, DML nuisance models, TMLE | Better robustness with flexible learners | Identification assumptions still dominate |
| Product/marketing targeting or uplift ranking | `causalml`, `scikit-uplift`, uplift forests, meta-learners | Practical ranking and uplift metrics | Often less formal causal reporting unless design is strong |
| Categorical multi-action | multi-action policy tree, EconML policy learners, `polle`, `tmle3mopttx` | Handles more than treat/control | Requires support for each action in relevant covariate regions |
| Formal targeted-learning optimal rule | `tmle3mopttx` / tlverse | CV-TMLE style value estimation and realistic rules | Steeper software workflow |
| Clinical subgroup or personalized medicine | `personalized`, `DynTxRegime` for single-stage OTR, interpretable trees | Good clinical/biostatistics fit | Dynamic features belong to dynamic-policy module |

## 4. Recommend Focused Evidence

Recommend one or two concrete checks at a time:

- baseline feature list with leakage/post-action flags;
- action counts and overlap by key domain strata;
- missingness and constructability for candidate rule variables;
- outcome and utility component availability;
- train/test or cross-fitting plan;
- first-pass rule/ranking with exploratory caveat;
- held-out policy-value, regret, Qini/AUUC, PAPE/AUPEC, or subgroup safety table.

## 5. Diagnose Before Reporting

Minimum diagnostic set:

- compare learned rule with treat-all, treat-none, and current/default practice;
- estimate policy value on held-out or cross-fitted predictions;
- inspect support where the rule assigns treatment;
- evaluate stability across seeds, folds, learner classes, and simple rules;
- check subgroup harms, fairness, cost, and implementation constraints;
- record whether the rule is exploratory, candidate, validated in-sample/cross-fit, externally validated, or deployment-ready.

## 6. Connected Reviewer Relevance

Preserve reviewer relevance in the `method_task_results` item rather than assigning work directly:

- `domain_expert`: validates treatment/action meaning, harms, constraints, fairness, domain standards, and whether the rule is interpretable in the scientific or operational setting.
- `data_analyst`: prepares features, support checks, nuisance inputs, splits, policy-value artifacts, plots, tables, and reproducible code.
- `method_lead`: decides whether the design identifies policy value, which target and estimand are valid, and what claim language is allowed.
- `causal_gatekeeper`: checks whether rule/value wording overstates the base route, support, validation, deployment claim, or fairness/safety evidence.
- `report_writer`: integrates the policy module into the working report when the module is substantive.

## 7. Report-Support Fields

For downstream `method_lead`, `causal_gatekeeper`, and `report_writer` review, preserve compact report-support fields in `method_task_results` item.

Use cautious language unless the design and evaluation are strong:

- "candidate individualized treatment rule"
- "exploratory prioritization rule"
- "cross-fitted policy-value estimate"
- "under the stated exchangeability and positivity assumptions"
- "not deployment-ready without prospective or external validation"

Avoid:

- "optimal" unless the optimization class, value function, assumptions, and evaluation design are explicit;
- "personalized causal recommendation" when support or identification is weak;
- "the model proves who should be treated."
