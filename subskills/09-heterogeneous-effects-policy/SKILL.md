---
name: heterogeneous-effects-policy
description: Use for CATE, HTE, subgroup effects, treatment prioritization, uplift modeling, individualized treatment rules, and policy learning after a plausible causal design has been identified.
version: 0.2.0
---

# Heterogeneous Effects and Policy

## Core Behavior

When this subskill is invoked, focus on the heterogeneity and decision-rule parts of the causal analysis. This subskill usually does **not** establish identification by itself; it inherits the design from randomized experiments, measured-confounding adjustment, doubly robust methods, IV, RD, DiD, or another routed subskill.

Always do these six things:

1. **Clarify the user's action gently.** Decide whether the user wants to learn about heterogeneity, estimate CATEs, compare subgroups, rank units for treatment, learn an interpretable policy, evaluate a proposed policy, or write up policy implications. Do not require the user to know technical labels before helping.
2. **Keep identification separate from estimation.** Causal forests, meta-learners, uplift models, and policy learners do not remove confounding by themselves. State the inherited assumptions before recommending an estimator.
3. **Separate effect modifiers from adjustment variables.** Effect modifiers are variables used to describe or act on heterogeneity. Adjustment variables are variables needed for identification or precision. Both should generally be pre-treatment, and policy variables must be available at decision time.
4. **Shortlist before choosing.** When the data and design are not yet clear, say that several popular methods may fit, inspect the data structure first, and defer final estimator choice until support, timing, and confounding conditions have been checked.
5. **Require honest or held-out validation when learning rules.** Subgroup discovery, treatment prioritization, and policy learning need sample splitting, cross-fitting, out-of-bag estimation, external validation, or another honest evaluation strategy.
6. **Communicate uncertainty and actionability.** Individual-level CATE estimates are usually noisy. Prefer validated groups, rankings, or policies when the user needs decisions.

## User-Facing Style

Be progressive and plain-spoken. Most users will not know terms like CATE, positivity, exchangeability, or policy value. Translate them only when useful:

- CATE: "expected treatment benefit for patients like this one";
- exchangeability: "whether we measured the reasons clinicians chose one treatment rather than another";
- positivity or overlap: "whether similar patients received both treatment options";
- consistency: "whether treatment A and standard care are defined clearly enough to compare";
- policy value: "how well a treatment rule would do compared with treat-all, treat-none, or current care."

Do not open with a long menu of estimators. A helpful early response is often:

> There are several popular methods for this kind of question. I can first look at your data structure and goal, then narrow this to a small set. Later we will need to check whether similar patients received both treatment options, whether key baseline reasons for treatment choice were measured, and whether the new patient is inside the data support.

## Activation and Route-Out

Use this subskill when the user says or implies:

- CATE, HTE, ITE, individual treatment effects, subgroup effects, or effect modifiers;
- "who benefits", "who should get treatment", "personalized medicine", "precision policy", "treatment targeting", or "resource allocation";
- uplift modeling, Qini curves, gain curves, treatment prioritization, or targeting rules;
- individualized treatment rules, optimal treatment regimes, policy learning, empirical welfare maximization, outcome weighted learning, or policy trees;
- causal forest, generalized random forest, Bayesian causal forest, meta-learners, R-learner, DR-learner, X-learner, EconML, CausalML, `grf`, or `policytree`.

Do **not** use this as the only workflow when:

- the main question is an average effect without heterogeneity or decisions: route to the appropriate average-effect subskill first;
- treatment, confounding, or decision points change over time: route to `subskills/10-longitudinal-gmethods/` for dynamic regimes, then return here only for static or final-stage policy summaries;
- the user has only a prediction/risk-scoring question and is not asking for a causal interpretation: treat it as predictive modeling outside this skill;
- the outcome is time-to-event, censoring, or competing risks: coordinate with `subskills/15-survival-competing-risks/`;
- interference or spillovers could make one unit's treatment affect another unit's outcome: coordinate with `subskills/17-interference-spillovers/`;
- the heterogeneity is local to compliers under an instrument: coordinate with `subskills/13-instrumental-variables/`;
- the user asks for mediation mechanisms rather than effect modification: route to `subskills/16-mediation/`.

If this route is rejected or only used as an exploratory add-on, update the `subskill_analyses` entry as `rejected`, `fallback`, or `exploratory/user-forced`, record the failed condition, and return to the main skill's route shortlist.

## HTE and Policy Project Specification Entry

When a project specification is being maintained, append or update this compact entry under the top-level `subskill_analyses` list. Fill only fields that are known or decision-relevant. Do not duplicate global fields already captured under `data`, `variables`, `intervention`, `outcomes`, `study_design`, or `analysis_routes`.

```yaml
subskill_analyses:
  - subskill_id: "09-heterogeneous-effects-policy"
    status: "candidate | selected | rejected | fallback | exploratory/user-forced"
    fit_to_user_need: null
    user_task: "learn heterogeneity | estimate CATE | compare GATEs | rank treatment benefit | learn policy | evaluate policy | uplift modeling | unknown"
    source_identification_route: "randomized | measured-confounding | matching/weighting | doubly robust/DML | IV-local | RD-local | DiD/panel | unknown"
    estimand:
      label: "CATE | GATE | subgroup ATE | policy value | value difference | uplift | treatment rule performance | prioritization value | unknown"
      target_population: null
      treatment_contrast: null
      outcome_or_utility_scale: null
      decision_time: null
      interpretation: null
    assumptions_needed:
      consistency_or_well_defined_intervention: null
      exchangeability_or_design_specific_identification: null
      positivity_or_overlap_for_effect_modifiers: null
      correct_timing_of_modifiers_and_covariates: null
      no_interference_or_scope_of_interference: null
      stable_utility_or_outcome_scale: null
    diagnostics_or_checks:
      overlap_by_modifier_or_policy_group: null
      nuisance_model_performance: null
      cate_calibration_or_blp: null
      gate_or_subgroup_validation: null
      rate_toc_qini_or_gain: null
      heldout_policy_value: null
      sensitivity_or_stability: []
    fatal_flaws_or_major_limitations: []
    limitations: []
    open_questions: []
    subskill_specific_details:
      effect_modifier_candidates: []
      adjustment_covariates_used_by_parent_route: []
      policy_variables_available_at_decision_time: []
      protected_or_constrained_variables: []
      treatment_type: "binary | multi-arm | continuous | unknown"
      outcome_type: "continuous | binary | count | time-to-event | utility/reward | unknown"
      candidate_estimators: []
      primary_estimator: null
      validation_strategy: null
      treatment_budget_or_threshold: null
      interpretability_requirement: null
      software_preference: "R | Python | either | unknown"
```

## Core Theory and Formal Definitions

Default notation in this subskill:

- \(Y\): outcome or reward;
- \(A\) or \(W\): treatment, action, or policy option;
- \(X\): pre-treatment covariates available for effect modification, adjustment, or policy decisions;
- \(Z\): protected, constrained, or special-purpose variables when the user names them;
- \(Y(a)\): potential outcome under treatment or action \(a\);
- \(\pi(X)\): treatment policy assigning an action based on covariates.

If the user uses different notation or variable names, adapt responses to the user's notation rather than forcing these symbols.

### CATE

For binary treatment, the conditional average treatment effect is

\[
\tau(x) = E[Y(1)-Y(0) \mid X=x].
\]

CATE is about conditional mean effects, not a directly observed individual effect. A predicted CATE for one person should usually be treated as a noisy decision score, not a precise personal causal truth.

### GATE and subgroup effects

For a subgroup \(G=g\), the group average treatment effect is

\[
\tau_g = E[Y(1)-Y(0) \mid G=g].
\]

GATEs are often easier to validate and explain than fully nonparametric CATEs. They are useful for scientific interpretation, subgroup reporting, and sanity checks on more flexible CATE models.

### Policy value

A policy \(\pi\) maps covariates to an action. For binary treatment,

\[
V(\pi)=E[Y(\pi(X))].
\]

Policy learning asks which rule has high value subject to constraints such as budget, interpretability, fairness, safety, or action costs. Policy value must be evaluated on data not used to choose the policy whenever possible.

### Uplift and treatment prioritization

Uplift or prioritization scores rank units by expected incremental benefit from treatment. In randomized or credibly identified settings, a score can be evaluated by held-out targeting metrics such as TOC, RATE, Qini, gain curves, or policy value. A good risk model is not necessarily a good treatment-benefit model.

## Identification Assumptions

State these separately from estimator choices. Tailor the language to the user's design and avoid requiring the user to know the technical terms up front.

### Consistency and well-defined interventions

The observed outcome should correspond to the potential outcome under the treatment actually received. If treatment has multiple versions, define the version that the policy would assign.

### Exchangeability or inherited design-specific identification

For observational point-treatment CATEs, a common assumption is

\[
\{Y(1),Y(0)\} \perp A \mid X_{\text{adjustment}}.
\]

For randomized, IV, RD, DiD, or other designs, use the design-specific assumption from the parent route. Do not imply that flexible CATE estimation removes unmeasured confounding.

### Positivity and overlap for effect modifiers

Each candidate policy group or effect-modifier region needs support for relevant treatment options. If some subgroup almost always receives one treatment, the CATE or policy recommendation for the missing counterfactual is extrapolation.

### Correct timing

Effect modifiers, adjustment variables, and policy variables should be measured before treatment assignment, or at the decision time for a future policy. Do not use mediators, adherence, post-treatment health status, post-exposure engagement, or outcome proxies as baseline effect modifiers for a total effect.

### No interference or defined interference scope

If one unit's treatment can affect another unit's outcome, ordinary CATE and policy-value interpretations may fail. Route to the interference subskill unless the estimand explicitly models spillovers.

### Stable utility or outcome scale

Policy learning optimizes the chosen reward. Confirm whether higher outcome is better, whether harms/costs are included, and whether the decision should optimize mean outcome, risk reduction, net benefit, equity, or constrained value.

## Method Recommendation Rules

### Adaptive recommendation posture

Recommend methods in layers. Name only the layer or small shortlist needed for the current user stage:

1. **Simple interpretation layer:** subgroup/GATE tables and interaction models for learning and communication.
2. **Flexible CATE layer:** causal forests, R-learners, DR-learners, X-learners, or Bayesian tree methods for patient-profile-specific benefit estimates when support and sample size look adequate.
3. **Decision layer:** policy trees, empirical welfare maximization, outcome weighted learning, or threshold rules when the user needs an action rule.

In normal responses, recommend one primary method family plus one simpler comparator. Mention package names only after the target, data structure, language preference, and validation plan are clear enough.

### Design-to-method table

| Situation | Default recommendation | Required checks |
|---|---|---|
| Small or moderate sample, few scientific modifiers | Pre-specified interactions, subgroup ATEs, GATE table | subgroup sizes, multiplicity caution, effect scale |
| Randomized experiment, exploratory heterogeneity | Causal trees/forests, R-learner, DR-learner, GATE validation | honesty/cross-fitting, CATE calibration, RATE/TOC/Qini |
| Observational point treatment with measured confounding | Doubly robust CATE learner, R-learner, causal forest with nuisance models, or coordinate with `subskills/08-doubly-robust-ml/` | adjustment set, overlap, nuisance performance, sensitivity |
| Need interpretable treatment assignment rule | Policy tree or simple constrained rule using doubly robust rewards | held-out policy value, budget, constraints, subgroup harms |
| Multi-arm treatment choice | Multi-arm causal forest, DRLearner-style CATEs, policytree with action-specific rewards | action support, baseline action, pairwise contrasts, value by action |
| Uplift or marketing/product targeting from randomized data | Uplift trees/forests, CATE rankers, Qini/TOC/RATE, gain curves | randomized or identified treatment, validation sample, calibration |
| Strong desire for smooth or sparse CATE model | R-learner, DR-learner, sparse linear/semiparametric CATE model | feature pre-specification, cross-fitting, out-of-sample score |
| Bayesian uncertainty and shrinkage are important | BART or Bayesian causal forest as an optional sensitivity estimator | propensity/confounding handling, prior sensitivity, calibration |
| Very small sample or many sparse modifiers | Prefer GATEs or a simple interaction model; avoid black-box CATE claims | power, subgroup counts, shrinkage, report as exploratory |
| Time-to-event outcome | Coordinate with survival subskill; use survival-specific CATE or RMST CATE if appropriate | censoring assumptions, time horizon, competing risks |
| Sequential treatment decisions | Route to longitudinal g-methods or dynamic treatment regime workflow | treatment history, time-varying confounding, decision points |

### Estimator families

- **Interaction and subgroup models:** best when effect modifiers are few, interpretable, and scientifically motivated.
- **Causal trees and causal forests:** useful for exploratory heterogeneity and nonparametric CATEs with honesty and adequate sample size.
- **Meta-learners:** S-, T-, X-, R-, and DR-learners use ordinary supervised learners inside a causal workflow. Choice depends on sample balance, treatment assignment, nuisance quality, and desired robustness.
- **Orthogonal and doubly robust learners:** useful when flexible nuisance models are needed and the design supports measured-confounding adjustment.
- **Bayesian tree methods:** BART/BCF can be useful for nonlinear response surfaces and regularized heterogeneity, but still need a valid design.
- **Policy learning:** empirical welfare maximization, policy trees, outcome weighted learning, residual weighted learning, and doubly robust policy learning target decisions, not necessarily accurate pointwise CATEs.
- **Uplift models:** useful for randomized targeting and product/marketing settings, but should be treated as causal only when treatment assignment and outcome timing support causal interpretation.

## Language Backend Policy

Do not install packages silently. If packages are missing, show install commands and ask for approval.

### R preferred stack

- `grf`: causal forests, multi-arm forests, local linear forests, best linear projection, calibration checks, RATE/TOC/Qini-style heterogeneity evaluation, and doubly robust scores.
- `policytree`: shallow interpretable policy trees using doubly robust reward estimates, often paired with `grf`.
- `DoubleML`: orthogonal/DML workflows when the parent route needs flexible nuisance estimation.
- `rlearner`, `bartCause`, `BART`, or `bcf`: optional specialized tools when their assumptions and maintenance status fit the user's environment.
- `cobalt`, `WeightIt`, or matching/weighting outputs: useful inputs when the parent design uses balance or weights.

### Python preferred stack

- `EconML`: DML, causal forest DML, DRLearner, ForestDRLearner, orthogonal forest, interpreters, SHAP-style summaries, and DoWhy integration.
- `CausalML`: meta-learners, uplift trees/forests, Qini/gain utilities, and applied uplift workflows.
- `DoubleML`: orthogonal nuisance estimation when the design is closer to DML than policy learning.
- `DoWhy`: useful for causal graph/refutation workflow, but not a substitute for HTE diagnostics or policy evaluation.
- `scikit-learn`, `statsmodels`, `pandas`, and `numpy`: useful for transparent interaction models, validation, and custom policy-value calculations.

When the user proposes another package, check its documentation for treatment assignment assumptions, supported treatment/outcome types, required nuisance models, validation tools, and whether its estimand matches the project.

## Data Preprocessing Rules

1. Define time zero, treatment/action, comparator, outcome, follow-up window, and target population before modeling heterogeneity.
2. Keep one analysis dataset with treatment, outcome, candidate effect modifiers, adjustment variables inherited from the parent route, clusters, sampling weights, and missingness indicators.
3. Mark each variable as adjustment, effect modifier, decision variable, protected/constrained variable, mediator, collider, instrument, post-treatment variable, or unknown.
4. Exclude post-treatment variables from primary total-effect CATEs and policy rules unless the estimand explicitly targets a later decision point.
5. Check support for treatment choices across important effect modifiers and intended policy groups.
6. Decide whether modifiers may be used for scientific explanation, treatment assignment, or both. A variable may be scientifically useful but not ethically or legally acceptable for allocation.
7. Preserve holdout folds, clusters, repeated units, and time splits so that validation does not leak information.
8. For policy learning, define the reward direction, costs, harms, budget, treatment capacity, and decision constraints before optimizing.
9. Record all subgroup discovery, trimming, threshold selection, and policy constraints in the project specification.
10. If censoring, missingness, measurement error, selection, or survey design dominates the problem, coordinate with the relevant subskill before finalizing the HTE workflow.

## Required Diagnostics

### Identification and support diagnostics

Always check:

- inherited identification route and assumptions;
- treatment overlap/positivity by key modifiers and policy groups;
- covariate balance or propensity diagnostics from the parent design when observational;
- subgroup sample sizes and effective sample sizes;
- whether policy variables are available before treatment or at decision time.

### CATE and heterogeneity diagnostics

Use the diagnostics supported by the method:

- CATE distribution, with caution against overinterpreting tails;
- GATE table or subgroup ATEs for interpretable modifiers;
- calibration or best linear projection of CATEs when using forests or DR scores;
- RATE, TOC, Qini, gain, or rank-based validation for treatment prioritization;
- variable importance or SHAP-style summaries only as secondary interpretation, not as proof of causal moderation;
- sensitivity to learner choice, tuning, covariate set, trimming, and target population.

### Policy diagnostics

For learned policies or treatment rules, report:

- value of the learned policy versus treat-all, treat-none, current policy, or a clinically/business-relevant baseline;
- uncertainty for policy value or value difference;
- held-out, cross-fit, out-of-bag, or external validation strategy;
- treatment fraction, budget use, and subgroup distribution of assigned actions;
- harm, equity, feasibility, or constraint checks where relevant.

## Failure Modes and Guardrails

Escalate warnings when:

- the user treats predicted individual CATEs as precise individual causal effects;
- the analysis searches many subgroups and reports only the most favorable one;
- the policy is trained and evaluated on the same data without honesty or holdout validation;
- treatment positivity fails in important modifier strata;
- effect modifiers are measured after treatment or affected by treatment;
- a risk prediction model is being interpreted as treatment benefit;
- the parent design cannot support causal interpretation, but the user wants causal targeting;
- the policy optimizes the wrong outcome, ignores harms/costs, or uses a variable unavailable at decision time;
- fairness, legal, or operational constraints make the learned rule unusable;
- the sample is too small for the requested high-dimensional CATE or policy model;
- the user wants to deploy a policy without prospective validation or monitoring.

## Step-by-Step Operating Procedure

1. Restate the user's goal as learning, CATE estimation, subgroup comparison, ranking, policy learning, policy evaluation, uplift modeling, or reporting.
2. Identify the parent causal design and inherited assumptions. If no plausible parent design exists, route out or label the analysis descriptive/exploratory.
3. Define the estimand: CATE, GATE, policy value, value difference, uplift, or treatment-rule performance.
4. Classify variables by timing and role: adjustment, modifier, decision variable, protected/constrained variable, mediator, collider, or unknown.
5. Check support and sample size for the target modifiers or intended policy groups.
6. If data details are incomplete, give a provisional shortlist and explain what needs checking before final method choice.
7. Choose a primary estimator and one simpler comparator. Prefer the simplest method that can answer the user's question credibly.
8. Plan validation before fitting the final model: honesty, cross-fitting, heldout set, out-of-bag evaluation, external validation, or prospective validation.
9. Run diagnostics appropriate to the estimator and target: overlap, nuisance performance, GATEs, calibration, RATE/TOC/Qini, and policy value.
10. If diagnostics fail, narrow the target population, switch to GATEs, choose a simpler policy, route to another subskill, or report a descriptive analysis.
11. Write results in terms of what the analysis can support: heterogeneity evidence, possible prioritization, policy value, uncertainty, limitations, and next-step validation.

## Output Template

```markdown
### Heterogeneous Effects / Policy Analysis

#### 1. User goal and causal route
- User goal:
- Parent causal design:
- Treatment/action:
- Outcome or utility:
- Target population:

#### 2. Estimand
- Target estimand:
- Treatment contrast:
- Effect modifiers or policy variables:
- Decision time:
- Outcome scale:

#### 3. Assumptions
- Consistency/well-defined intervention:
- Exchangeability or design-specific identification:
- Positivity/overlap:
- Correct timing:
- No interference or interference scope:
- Utility/reward definition:

#### 4. Method recommendation
- Primary method:
- Simpler comparator:
- Software/backend:
- Validation strategy:
- Policy constraints or budget:

#### 5. Diagnostics
- Overlap/support:
- Nuisance model checks:
- GATE/subgroup validation:
- CATE calibration or best linear projection:
- RATE/TOC/Qini/gain:
- Held-out policy value:

#### 6. Interpretation
- What can be said causally:
- What should remain exploratory:
- Fatal flaws or major limitations:
- Recommended next step:
```

## Related Subskills

- `subskills/05-randomized-experiments/`: parent route for randomized experiments and A/B tests.
- `subskills/06-point-treatment-observational/`: parent route for point-treatment observational identification.
- `subskills/07-matching-weighting-balance/`: parent route for design-stage balance and overlap.
- `subskills/08-doubly-robust-ml/`: coordinate for AIPW, TMLE, DML, and high-dimensional nuisance estimation.
- `subskills/10-longitudinal-gmethods/`: use for dynamic treatment regimes and time-varying treatment.
- `subskills/13-instrumental-variables/`: coordinate when heterogeneity is local to compliers or instruments.
- `subskills/15-survival-competing-risks/`: use when censoring or competing risks define the outcome.
- `subskills/17-interference-spillovers/`: use when treatment can affect other units.
- `subskills/02-user-data-inspector/`: use when missingness, measurement error, or selection affects the design.
- `subskills/20-reporting-interpretation/`: use for final reports and policy interpretation.

## Reference Files

For the detailed workflow, read `references/workflow.md`. For the literature and software map behind this subskill, read `references/literature_and_software.md`.
