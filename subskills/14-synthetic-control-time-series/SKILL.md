---
name: synthetic-control-time-series
description: Use for one or a few treated aggregate units, policy shocks at known times, synthetic control, augmented or generalized synthetic control, synthetic DiD, matrix-completion panel counterfactuals, interrupted time series, Bayesian structural time-series, and CausalImpact-style analyses.
---

# Synthetic Control and Time Series

## Core Behavior

When this subskill is invoked, focus on whether time, donor units, and comparison series can support a credible counterfactual for an aggregate intervention. The main question is not just how to forecast the post-period, but whether the comparison information would have tracked the treated unit in the absence of the intervention.

Always do these six things:

1. **Anchor the intervention in time.** Identify the treated unit or units, intervention date, anticipation window, pre-period, post-period, outcome frequency, and whether treatment turns on once or varies over time.
2. **Audit the comparison source.** Determine whether there is a donor pool, control time series, untreated units, untreated periods, or only the treated series. Check whether any comparison source could be affected by the intervention.
3. **Separate design from forecasting.** A good forecast is not automatically causal. State the causal assumptions behind the counterfactual before recommending a model.
4. **Shortlist methods by data structure.** Do not start with a long method catalog. Choose a small shortlist based on one treated unit versus many, pre-period length, donor pool quality, staggered adoption, pre-treatment fit, and whether control series are stable.
5. **Require pre-fit, placebo, and sensitivity checks.** Inspect pre-treatment fit, donor weights, placebo gaps, leave-one-out donor sensitivity, alternative pre/post windows, and concurrent shocks before treating effects as credible.
6. **Route out when another design is primary.** If the problem is mainly staggered DiD, RD, IV, point-treatment individual data, survival outcomes, interference, or missingness/selection, coordinate with or route to the relevant subskill.

## User-Facing Style

Be concrete and gentle. Most users will not know the difference between synthetic control, synthetic DiD, BSTS, and interrupted time series. Translate terms only when useful:

- synthetic control: "a weighted comparison unit built from places or groups that were not treated";
- donor pool: "the untreated units we are allowed to borrow information from";
- pre-treatment fit: "whether the weighted comparison tracked the treated unit before the policy";
- placebo test: "pretend another untreated unit was treated and see whether the estimated gap looks unusually large";
- stable relationship: "whether the comparison series would have kept moving with the treated series after the intervention if no intervention happened."

A helpful early response is often:

> This sounds like a synthetic-control or interrupted-time-series problem because you have an intervention at a known time and outcomes measured before and after it. Before choosing a method, I would check the number of treated units, the length of the pre-period, whether there are unaffected donor units or control series, and whether any other major shock happened around the same time.

## Activation and Route-Out

Use this subskill when the user says or implies:

- one treated state, hospital, city, region, firm, product, campaign, or aggregate unit;
- policy change, intervention, shock, campaign, rollout, or event at a known date;
- treated time series, before/after aggregate outcome, interrupted time series, segmented regression, ARIMA intervention analysis, state-space counterfactual, Bayesian structural time series, CausalImpact, synthetic control, augmented synthetic control, generalized synthetic control, synthetic DiD, matrix completion, donor pool, placebo tests, or pre-treatment fit.

Do **not** use this as the only workflow when:

- the user has individual-level point-treatment observational data with no aggregate time intervention: route to `subskills/06-point-treatment-observational/`;
- the dominant structure is many treated units with staggered adoption and a parallel-trends/event-study question: coordinate with `subskills/11-did-event-study/`;
- the assignment rule is a cutoff rather than time: route to `subskills/12-regression-discontinuity/`;
- the treatment is an encouragement or instrument: coordinate with `subskills/13-instrumental-variables/`;
- the outcome is time-to-event or competing risks: coordinate with `subskills/15-survival-competing-risks/`;
- donor units can affect each other or spill over across regions or markets: coordinate with `subskills/17-interference-spillovers/`;
- missingness, measurement changes, reporting artifacts, sample composition shifts, or selection dominate the time series: coordinate with `subskills/02-data-inspector/`;
- the user only wants a forecast with no causal interpretation: treat it as predictive time-series modeling outside this causal skill.

If this route is rejected, update the `subskill_analyses` entry as `rejected`, `fallback`, or `exploratory/user-forced`, record the failed condition, and return to the main skill's route shortlist. If the user insists on a weak route, continue only with prominent caveats and track the fatal flaws so a report can state them clearly.

## Synthetic Control Project Specification Entry

When a project specification is being maintained, append or update this compact entry under the top-level `subskill_analyses` list. Fill only fields that are known or decision-relevant. Do not duplicate global fields already captured under `main_skill`, `data_inspector_02`, `dag_builder_04`, `design_planner_03`, or `analysis_routing`.

```yaml
subskill_analyses:
  - subskill_id: "14-synthetic-control-time-series"
    status: "candidate | selected | rejected | fallback | exploratory/user-forced"
    fit_to_user_need: null
    user_task: "design triage | method shortlist | synthetic control | interrupted time series | CausalImpact/BSTS | code | interpret result | unknown"
    panel_or_time_structure:
      treated_units: []
      donor_units_or_control_series: []
      time_variable: null
      outcome_frequency: null
      intervention_time: null
      anticipation_window: null
      pre_period: null
      post_period: null
      balanced_panel_available: null
      staggered_or_multiple_adoption: null
    estimand:
      label: "time-specific ATT | average post-period ATT | cumulative effect | level change | trend change | counterfactual forecast gap | unknown"
      treated_unit_or_population: null
      outcome_scale: null
      post_period_summary: null
      interpretation: null
    assumptions_needed:
      no_anticipation: null
      unaffected_donors_or_controls: null
      stable_counterfactual_relationship: null
      adequate_pre_period_fit_or_model_fit: null
      no_concurrent_shocks: null
      comparable_measurement_over_time: null
      no_interference_or_spillover: null
    diagnostics_or_checks:
      pre_treatment_fit: null
      treated_vs_counterfactual_plot: null
      placebo_or_permutation_tests: null
      donor_weight_concentration: null
      leave_one_out_or_donor_sensitivity: null
      window_and_predictor_sensitivity: null
      residual_autocorrelation_or_time_series_checks: null
      concurrent_shock_audit: null
      measurement_or_composition_shift_audit: null
    estimation_plan:
      method_family: "classic SCM | augmented SCM | generalized SCM | synthetic DiD | matrix completion | BSTS/CausalImpact | ITS/segmented regression | unknown"
      primary_method: null
      fallback_or_comparator: null
      inference_strategy: null
      software_backend: "R | Python | Stata | either | unknown"
    fatal_flaws_or_major_limitations: []
    limitations: []
    open_questions: []
```

## Core Theory and Formal Definitions

Default notation in this subskill:

- \(i\): unit, such as a state, region, hospital, firm, product, or market;
- \(t\): time;
- \(i=1\): treated unit for single-unit examples;
- \(T_0\): last pre-intervention period;
- \(D_{it}\): treatment or intervention exposure;
- \(Y_{it}\): observed outcome;
- \(Y_{it}(0)\): untreated potential outcome;
- \(Y_{it}(1)\): treated potential outcome.

If the user uses different notation or variable names, adapt responses to the user's notation.

### Time-specific and summary effects

For one treated unit, the post-period effect at time \(t > T_0\) is often written as

\[
\tau_t = Y_{1t}(1) - Y_{1t}(0).
\]

The observed treated outcome gives \(Y_{1t}(1)\). The method estimates the missing counterfactual \(Y_{1t}(0)\). Reports often summarize these gaps as an average post-period effect, cumulative effect, percent change, level change, or trend change.

### Classic synthetic control

Classic SCM estimates the treated unit's untreated counterfactual using a weighted average of donor units. It is most transparent when there is one or a few treated aggregate units, a clear intervention date, a meaningful donor pool, and strong pre-treatment fit.

Key assumptions in plain language:

- the donor pool was not affected by the intervention;
- no other major shock uniquely hit the treated unit at the same time;
- the weighted donor combination tracked the treated unit before treatment and would have continued to do so without treatment;
- the treated unit is not far outside the support of the donor pool.

### Augmented, generalized, synthetic DiD, and matrix-completion methods

Extensions relax or modify classic SCM in different ways. Augmented SCM adds outcome-model bias correction when perfect pre-fit is not feasible. Generalized SCM and matrix completion use factor or low-rank structure in panel data. Synthetic DiD combines ideas from DiD and SCM and can be useful when both unit and time weights help. These methods can help with multiple treated units, imperfect pre-fit, or richer panels, but they still need a credible untreated comparison structure.

### Interrupted time series and BSTS/CausalImpact

Interrupted time series estimates whether an outcome changes level or trend after an intervention, usually with autocorrelation and seasonality handled explicitly. It is weaker when there is no comparison group and strong secular trends or concurrent shocks are plausible.

BSTS/CausalImpact estimates a counterfactual time series using state-space models and control series. Its causal interpretation depends on control series being unaffected by the intervention and maintaining a stable relationship with the treated series after the intervention.

## Method Recommendation Rules

### Design-to-method table

| Situation | Default recommendation | Required checks |
|---|---|---|
| One treated aggregate unit, strong donor pool, clear intervention date | Classic SCM via `Synth` or `tidysynth` | pre-fit, donor contamination, placebo gaps, leave-one-out sensitivity |
| One treated unit but pre-fit is imperfect or treated unit is partly outside convex hull | Augmented SCM via `augsynth` | extrapolation, bias correction sensitivity, donor leverage |
| Multiple treated units or staggered treatment with panel counterfactual focus | Generalized SCM or matrix completion | factor structure, untreated support, cross-validation, adoption timing |
| Panel setting where DiD and SCM are both plausible | Synthetic DiD as comparator or primary route | pre-trends, unit/time weights, placebo or jackknife inference |
| Single treated time series plus unaffected control series | BSTS/CausalImpact | stable controls, posterior predictive fit, seasonality, control contamination |
| No donor pool or controls, many time points before and after | Interrupted time series or segmented regression | autocorrelation, seasonality, concurrent shocks, functional form |
| Many policy adopters with event-study target | Route to DiD/event study, optionally use SCM as sensitivity | parallel trends, heterogeneity, adoption cohorts |
| Sparse pre-period or short noisy time series | Treat as weak/exploratory or redesign | low power, pre-fit instability, descriptive fallback |

In normal responses, recommend one primary method and one simpler or design-adjacent comparator. Do not list all methods unless the user asks for a survey.

## Language Backend Policy

Do not install packages silently. If packages are missing, show install commands and ask for approval.

### R preferred stack

- `Synth`: classic SCM with donor weights, path plots, gap plots, and placebo-oriented workflows.
- `tidysynth`: tidy interface around classic SCM with convenient visualization and placebo tools.
- `augsynth`: augmented SCM and related panel treatment-effect workflows, including bias correction and synthetic DiD-style estimators.
- `gsynth`: generalized synthetic control using interactive fixed effects for multiple treated units and variable treatment timing.
- `synthdid`: synthetic difference-in-differences for panel treatment effects.
- `CausalImpact` and `bsts`: Bayesian structural time-series counterfactuals with control series.
- `fixest`, `nlme`, `forecast`, `fable`, or `stats`: segmented regression, autocorrelation, seasonality, and transparent ITS checks.

### Python

Python support is useful for audits and simpler workflows, but R currently has the more mature applied SCM ecosystem.

- `pandas`, `numpy`, `statsmodels`, `matplotlib`, and `seaborn`: data shaping, ITS, segmented regression, autocorrelation, and visualization.
- `SyntheticControlMethods`: Python SCM variants for single-treated-unit settings when its assumptions and maintenance fit the user's environment.
- Custom optimization or matrix-completion code may be appropriate only when the user has sufficient expertise and validation needs are clear.

When the user proposes another package, check its documentation for supported designs, treatment timing, inference, placebo tools, donor-weight diagnostics, and whether the package's estimand matches the project.

## Data Preprocessing Rules

1. Preserve the raw time variable, outcome frequency, treated-unit indicator, intervention date, and treatment exposure history.
2. Define pre-period, anticipation period, post-period, and any excluded transition window before looking for favorable effects.
3. Build a long panel with one row per unit-time when donor units exist. Keep unit IDs, time IDs, treatment status, outcome, predictors, clusters, and weights.
4. For CausalImpact/BSTS, align treated and control series on the same time index and preserve missingness patterns.
5. Exclude donor units that are treated, partially treated, directly affected, strongly spillover-exposed, or structurally incomparable unless the user explicitly chooses an exploratory sensitivity.
6. Use only pre-treatment predictors for SCM weighting. Do not use post-treatment predictors or outcomes to select donors or tune predictors.
7. Check outcome definition and measurement consistency across units and over time, especially around policy implementation.
8. Record concurrent shocks, seasonal changes, reporting changes, population denominator changes, and sample-composition shifts.
9. Keep enough pre-period observations for fit diagnostics. If the pre-period is short, label estimates as fragile.
10. Preserve analysis choices for donor pool, predictor set, time windows, smoothing, transformations, and excluded periods in the project specification.

## Required Diagnostics

### Design diagnostics

- timeline showing intervention, anticipation, pre-period, post-period, and outcome measurement;
- donor-pool audit for contamination, spillovers, and comparability;
- concurrent-shock audit around the intervention date;
- measurement and composition stability over time.

### Fit and inference diagnostics

- treated versus synthetic or predicted counterfactual plot;
- pre-treatment RMSPE, residuals, or posterior predictive checks;
- donor weights and predictor balance;
- placebo-in-space tests when donor units exist;
- placebo-in-time tests or pre-period holdout when meaningful;
- leave-one-out donor sensitivity and donor-pool sensitivity;
- sensitivity to predictor set, pre-period length, excluded transition window, and outcome transformation;
- residual autocorrelation and seasonality checks for ITS/BSTS models.

### Interpretation diagnostics

- effect trajectory, average post-period effect, and cumulative effect with uncertainty when supported;
- comparison to a simple baseline, such as raw before/after, DiD-style comparator, or segmented regression;
- whether the result depends on a small number of donors or a narrow modeling choice;
- whether the new effect claim is stronger than the design can justify.

## Failure Modes and Guardrails

Escalate warnings when:

- there is no clear intervention date or treatment timing;
- donor units or control series may be affected by the intervention;
- the intervention is anticipated before the chosen treatment date;
- pre-treatment fit is poor and the method relies on strong extrapolation;
- the treated unit is outside the donor support;
- one donor dominates without a substantive reason;
- placebo effects are as large as the treated effect;
- a concurrent event could explain the gap;
- outcome measurement, coding, denominator, or population composition changes at the intervention date;
- the user interprets a purely predictive forecast as a causal effect;
- a single-series ITS is used despite strong secular shocks and no comparison group;
- many candidate intervention dates, donor pools, or outcomes were searched without disclosure.

## Step-by-Step Operating Procedure

1. Restate the user's question as a dated aggregate intervention problem in domain language.
2. Identify treated unit(s), intervention time, pre-period, post-period, outcome, and intended effect summary.
3. Determine whether there are donor units, control series, untreated periods, multiple treated units, staggered adoption, or only one treated series.
4. Audit donor/control contamination, anticipation, concurrent shocks, and measurement changes.
5. Define the estimand: time-specific ATT, average post-period ATT, cumulative effect, level change, trend change, or counterfactual forecast gap.
6. Choose one primary method and one comparator based on the data structure.
7. Plan the donor pool, predictors, windows, transformations, autocorrelation/seasonality handling, and inference strategy before final interpretation.
8. Run or request diagnostics: pre-fit, plots, placebo tests, leave-one-out, sensitivity, residual checks, and shock audit.
9. If diagnostics fail, route to a weaker descriptive ITS, a DiD/event-study route, a different estimand, or a no-causal-claim report.
10. Record assumptions, diagnostics, limitations, and open questions in the project specification.

## Output Template

```markdown
### Synthetic Control / Time-Series Analysis

#### 1. Design setup
- Treated unit(s):
- Intervention date and anticipation window:
- Pre-period and post-period:
- Outcome and frequency:
- Donor units or control series:

#### 2. Estimand
- Target estimand:
- Effect scale:
- Post-period summary:
- Target interpretation:

#### 3. Assumptions
- Donors/control series unaffected:
- Stable counterfactual relationship:
- No anticipation:
- No concurrent shocks:
- Measurement consistency:
- No interference/spillover:

#### 4. Method recommendation
- Primary method:
- Comparator/fallback:
- Software/backend:
- Inference strategy:

#### 5. Diagnostics
- Pre-treatment fit:
- Treated versus counterfactual plot:
- Placebo checks:
- Donor weights and sensitivity:
- Window/predictor sensitivity:
- Residual/autocorrelation checks:

#### 6. Interpretation
- Effect estimate or planned summary:
- What can be said causally:
- What remains exploratory:
- Fatal flaws or major limitations:
- Recommended next step:
```

## Related Subskills

- `subskills/11-did-event-study/`: use for many treated units, staggered adoption, cohort effects, and event-study targets.
- `subskills/12-regression-discontinuity/`: use when assignment changes at a running-variable cutoff.
- `subskills/13-instrumental-variables/`: use when timing or exposure is driven by an instrument or encouragement.
- `subskills/15-survival-competing-risks/`: use when outcomes are time-to-event or competing risks.
- `subskills/17-interference-spillovers/`: use when spillovers contaminate donor units or neighboring regions.
- `subskills/02-data-inspector/`: use when reporting changes, missing time points, measurement error, or selection dominate.
- `subskills/20-reporting-interpretation/`: use for final reports and causal-claim calibration.

## Reference Files

For the detailed workflow, read `references/workflow.md`. For the literature and software map, read `references/literature_and_software.md`.
