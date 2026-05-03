---
name: longitudinal-gmethods
description: Use for longitudinal causal questions with time-varying treatments, time-varying confounders affected by prior treatment, dynamic regimes, sustained strategies, grace periods, censoring, marginal structural models, g-formula, longitudinal TMLE, and longitudinal modified treatment policies.
---

# Longitudinal G-Methods

## Core Behavior

When this subskill is invoked, focus on causal effects of treatment strategies over time. The key warning is that ordinary regression adjustment can be biased when time-varying confounders are affected by earlier treatment and also affect later treatment and outcome.

Always do these six things:

1. **Draw the timeline first.** Define eligibility, time zero, decision times, treatment history, covariate history, censoring/competing events, outcome time, and follow-up.
2. **Define the treatment strategy.** Decide whether the estimand is a static sustained strategy, dynamic regime, modified treatment policy, per-protocol strategy, grace-period strategy, or regime value.
3. **Classify time-varying covariates.** Identify variables that affect later treatment and outcome and may themselves be affected by prior treatment.
4. **State sequential assumptions plainly.** Explain that causal interpretation requires measuring the relevant history at each decision time, comparable support for each treatment decision, and appropriate handling of censoring.
5. **Choose the g-method to match the regime and data.** Use MSM/IPW, parametric g-formula, sequential g-computation, longitudinal TMLE, LMTP, or cloning-censoring-weighting only after the timeline and estimand are clear.
6. **Require sequential diagnostics.** Check treatment/censoring weights, regime support, positivity over time, model fit, competing events, and sensitivity to regime definitions.

## User-Facing Style

Be patient and timeline-oriented. A helpful early response is:

> This is a longitudinal causal question because treatment and patient status change over time. Before choosing a model, I would map the decision times, what was known at each time, what treatments were possible, and when the outcome was measured. Then we can decide whether the right target is a sustained treatment strategy, a dynamic rule, or a per-protocol/grace-period effect.

Translate assumptions:

- sequential exchangeability: "at each time, we measured the reasons later treatment decisions and outcomes differed";
- sequential positivity: "for each history we want to compare, the relevant treatment choices actually occurred";
- consistency: "the treatment strategy is defined clearly enough that following it means the same thing across units";
- censoring exchangeability: "loss to follow-up can be explained by the measured history we use."

## Activation and Route-Out

Use this subskill when the user says or implies:

- treatment, dose, adherence, exposure, or intervention changes over time;
- time-varying confounders are affected by prior treatment;
- repeated treatment decisions, dynamic treatment regimes, sustained strategies, per-protocol effects, grace periods, or treatment switching;
- marginal structural model, inverse probability of treatment weighting over time, g-formula, g-computation, longitudinal TMLE, `ltmle`, `lmtp`, `gfoRmula`, cloning-censoring-weighting, or modified treatment policy.

Do **not** use this as the only workflow when:

- there is one baseline treatment and no treatment-confounder feedback: use `subskills/06-point-treatment-observational/`;
- the main problem is a randomized trial with simple fixed assignment: use `subskills/05-randomized-experiments/`;
- the outcome is time-to-event or competing risk and the longitudinal treatment structure is secondary: coordinate with `subskills/15-survival-competing-risks/`;
- missingness, censoring, or selection is the dominant validity issue: coordinate with `subskills/02-data-inspector/`;
- the user wants learned individualized policy rules beyond a fixed regime: coordinate with `subskills/09-heterogeneous-effects-policy/`;
- the design is policy timing, cutoff, instrument, synthetic control, mediation, or interference: route to the relevant subskill.

If the longitudinal route is rejected, update the `subskill_analyses` entry as `rejected`, `fallback`, or `exploratory/user-forced`, record the failed condition, and return to the main skill's route shortlist.

## Longitudinal Project Specification Entry

When a project specification is being maintained, append or update this compact entry under the top-level `subskill_analyses` list. Fill only fields that are known or decision-relevant. Do not duplicate global fields already captured under `main_skill`, `data_inspector_02`, `dag_builder_04`, `design_planner_03`, or `analysis_routing`.

```yaml
subskill_analyses:
  - subskill_id: "10-longitudinal-gmethods"
    status: "candidate | selected | rejected | fallback | exploratory/user-forced"
    fit_to_user_need: null
    user_task: "timeline audit | regime definition | analysis plan | code | interpret result | unknown"
    longitudinal_structure:
      unit_id: null
      time_variable: null
      time_zero: null
      decision_times: []
      follow_up_end: null
      person_period_data_available: null
      repeated_rows_need_reshaping: null
    estimand:
      label: "E[Y^g] | regime contrast | static sustained strategy | dynamic regime value | modified treatment policy | per-protocol effect | grace-period effect | unknown"
      strategies_compared: []
      target_population: null
      outcome_scale: null
      interpretation: null
    assumptions_needed:
      consistency_or_well_defined_regime: null
      sequential_exchangeability: null
      sequential_positivity: null
      censoring_exchangeability: null
      no_interference: null
      correct_time_ordering: null
    history_variables:
      baseline_covariates: []
      time_varying_treatments: []
      time_varying_confounders: []
      confounders_affected_by_prior_treatment: []
      censoring_or_visit_process_variables: []
      competing_events: []
      outcomes: []
    estimation_plan:
      method_family: "MSM/IPW | parametric g-formula | sequential g-computation | longitudinal TMLE | LMTP | cloning-censoring-weighting | dynamic regime/value | unknown"
      primary_method: null
      fallback_method: null
      software_backend: "R | Python | either | unknown"
      intervention_definition: null
      grace_period: null
    diagnostics_or_checks:
      timeline_diagram: null
      sequential_positivity: null
      treatment_weight_distribution: null
      censoring_weight_distribution: null
      cumulative_weight_distribution: null
      regime_support: null
      model_fit_or_simulation_checks: null
      sensitivity_or_alternative_regimes: []
    fatal_flaws_or_major_limitations: []
    limitations: []
    open_questions: []
```

## Core Theory and Formal Definitions

Default notation in this subskill:

- \(A_t\): treatment/action at time \(t\);
- \(L_t\): time-varying covariates just before treatment at time \(t\);
- \(C_t\): censoring or loss-to-follow-up indicator;
- \(\bar A_t\) and \(\bar L_t\): treatment and covariate history through time \(t\);
- \(g\): treatment strategy or regime;
- \(Y^g\): potential outcome under regime \(g\).

If the user uses different notation or variable names, adapt responses to the user's notation.

### Regime mean

The central estimand is often

\[
E[Y^g],
\]

the mean outcome if everyone in the target population followed strategy \(g\). A regime contrast compares \(E[Y^{g_1}]\) and \(E[Y^{g_0}]\).

### Why ordinary regression can fail

When \(L_t\) affects later treatment and outcome, but earlier treatment also affects \(L_t\), adjusting for \(L_t\) in a standard outcome regression can block part of the treatment effect or induce bias. G-methods are designed for this treatment-confounder feedback.

## Method Recommendation Rules

### Design-to-method table

| Situation | Default recommendation | Required checks |
|---|---|---|
| Sustained static strategies with discrete treatment | MSM/IPW or parametric g-formula | sequential positivity, cumulative weights, regime support |
| Complex time-varying covariate process and interpretable simulation desired | Parametric g-formula via `gfoRmula` | model fit for covariate/outcome processes, simulation checks |
| Need double robustness or flexible learners | Longitudinal TMLE via `ltmle` or `lmtp` when estimand fits | fold/learner plan, positivity, censoring models |
| Continuous or multivalued treatments with feasible intervention | LMTP via `lmtp` | modified policy definition, feasible support, density-ratio diagnostics |
| Per-protocol effect with treatment switching or grace period | Cloning-censoring-weighting or target-trial emulation | clone rules, artificial censoring, censoring weights |
| Sequential individualized decision rule | Dynamic treatment regime/value methods plus `09-heterogeneous-effects-policy` | decision points, state variables, validation |
| Censoring or competing events central | Coordinate with `15-survival-competing-risks` and `02-data-inspector` | risk set, competing event definition, censoring positivity |
| No time-varying treatment-confounder feedback | Use simpler point-treatment route | time zero, baseline confounding, no feedback |

In normal responses, recommend one primary method family and one fallback. Do not list all g-methods unless the user asks for a survey.

## Language Backend Policy

Do not install packages silently. If packages are missing, show install commands and ask for approval.

### R preferred stack

- `ipw`: inverse probability weights for marginal structural models with point or time-varying treatments.
- `gfoRmula`: parametric g-formula for sustained strategies, survival outcomes, continuous/binary end-of-follow-up outcomes, censoring, and competing event options.
- `ltmle`: longitudinal TMLE, IPTW, and g-computation for treatment/censoring-specific means and MSMs.
- `lmtp`: longitudinal modified treatment policies, sequentially doubly robust and TMLE estimators, binary/continuous/categorical treatments, censored and survival outcomes.
- `survival`, `riskRegression`, or related packages may be needed for survival endpoints; coordinate with `15-survival-competing-risks`.

### Python

Python has fewer mature end-to-end longitudinal g-method packages than R. Use Python only when the workflow is simple enough to implement transparently or the user strongly prefers it. Possible components include `pandas`, `statsmodels`, `scikit-learn`, `lifelines`, and custom IPW/g-computation code. For production longitudinal TMLE/g-formula/LMTP workflows, prefer R unless a validated Python workflow already exists.

## Data Preprocessing Rules

1. Convert data to a clear person-period or decision-time structure.
2. Define whether variables at time \(t\) occur before or after treatment \(A_t\).
3. Store histories explicitly, including lagged treatment, lagged covariates, cumulative exposure, and baseline variables.
4. Define censoring, competing events, death, treatment discontinuation, switching, and visit process indicators.
5. Do not condition naively on post-treatment variables in a standard regression for total effects.
6. Ensure each regime is feasible in the observed histories; impossible strategies violate positivity.
7. Use cluster/person-aware resampling and inference.
8. Record grace periods, adherence definitions, clone rules, and artificial censoring rules before looking at outcomes.
9. Keep missingness and measurement schedules explicit; irregular visits may require a visit-process model or a coarser decision grid.
10. Preserve codebook details for treatment versions and outcome timing.

## Required Diagnostics

- timeline diagram with baseline, decision times, covariate measurement, treatment, censoring, outcome, and follow-up;
- treatment prevalence by time and history strata;
- sequential positivity and regime support checks;
- treatment weight, censoring weight, and cumulative weight summaries;
- effective sample size under weighting;
- model fit checks for treatment, censoring, covariate, and outcome models;
- simulated covariate/outcome trajectory checks for g-formula;
- intervention and grace-period sensitivity;
- comparison to a simpler descriptive or baseline-only analysis for orientation.

## Failure Modes and Guardrails

Escalate warnings when:

- decision times or variable ordering are ambiguous;
- standard regression adjusts for time-varying confounders affected by prior treatment;
- treatment/censoring weights are extreme or unstable;
- regimes require treatment choices not observed for relevant histories;
- censoring, competing events, or death are ignored;
- grace periods or adherence rules are defined after seeing outcomes;
- irregular measurement or visit processes are treated as if fully observed at fixed times;
- dynamic rules use variables unavailable at the decision time;
- the user interprets a regime effect as a point-treatment effect or population ATE without the longitudinal target population caveat.

## Step-by-Step Operating Procedure

1. Restate the longitudinal causal question in domain language.
2. Define eligibility, time zero, decision times, treatment histories, covariate histories, censoring, outcome, and follow-up.
3. Draw or describe the timeline and treatment-confounder feedback.
4. Define the regime(s) or modified policy and target estimand.
5. Check sequential exchangeability and positivity in plain language.
6. Choose one primary g-method and one fallback/comparator.
7. Plan data reshaping and history construction.
8. Plan weight/model/support diagnostics before final interpretation.
9. Route to survival, missingness, HTE/policy, or reporting subskills as needed.
10. Record assumptions, diagnostics, limitations, and open questions in the project specification.

## Output Template

```markdown
### Longitudinal G-Methods Analysis

#### 1. Timeline and question
- Eligibility/time zero:
- Decision times:
- Treatment strategies:
- Outcome and follow-up:
- Target population:

#### 2. Histories and assumptions
- Baseline covariates:
- Time-varying confounders:
- Confounders affected by prior treatment:
- Censoring/competing events:
- Sequential exchangeability:
- Sequential positivity:

#### 3. Estimation route
- Primary method:
- Fallback/comparator:
- Software/backend:
- Data reshaping needed:

#### 4. Diagnostics
- Timeline check:
- Treatment/censoring weights:
- Regime support:
- Model/simulation checks:
- Sensitivity analyses:

#### 5. Interpretation
- Regime effect estimate:
- What the estimand means:
- Fatal flaws or major limitations:
- Recommended next step:
```

## Related Subskills

- `subskills/06-point-treatment-observational/`: use when treatment is only a baseline point treatment.
- `subskills/08-doubly-robust-ml/`: coordinate for longitudinal TMLE or flexible nuisance estimation.
- `subskills/09-heterogeneous-effects-policy/`: coordinate for dynamic decision rules or individualized regimes.
- `subskills/15-survival-competing-risks/`: use for survival endpoints, censoring, competing risks, or RMST.
- `subskills/02-data-inspector/`: use when censoring, missingness, visit processes, or selection dominate.
- `subskills/20-reporting-interpretation/`: use for final reporting.

## Reference Files

For the detailed workflow, read `references/workflow.md`. For the literature and software map, read `references/literature_and_software.md`.
