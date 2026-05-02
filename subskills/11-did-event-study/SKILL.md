---
name: did-event-study
description: Use for difference-in-differences, event studies, panel or repeated cross-section policy evaluation, staggered adoption, group-time ATT, dynamic effects, pretrend diagnostics, and parallel-trends sensitivity analysis.
version: 0.2.0
---

# Difference-in-Differences and Event Studies

## Core Behavior

When this subskill is invoked, focus on panel or repeated-cross-section designs where treatment changes for some units over time and untreated or not-yet-treated units provide the counterfactual trend. The main task is to define the DiD estimand and assess whether parallel trends, no anticipation, stable composition, and no spillovers are plausible.

Always do these six things:

1. **Map treatment timing.** Identify unit IDs, time periods, first treatment period, never-treated or not-yet-treated controls, and whether treatment is absorbing, reversible, continuous, or repeated.
2. **Define the estimand.** Distinguish group-time ATT, event-time/dynamic ATT, overall ATT, cohort-specific effects, calendar-time effects, and simple two-group/two-period ATT.
3. **Do not default to naive TWFE.** In staggered adoption settings, ordinary two-way fixed effects and TWFE event studies can be misleading with heterogeneous effects.
4. **Audit parallel trends and no anticipation.** Use pre-period outcomes, event-study plots, placebo periods, and domain knowledge. Explain that pretrend tests are diagnostics, not proof.
5. **Choose controls deliberately.** Decide whether never-treated, not-yet-treated, or other comparison units are credible; record composition changes, treatment reversals, and contamination.
6. **Use appropriate inference and sensitivity checks.** Cluster at the assignment level when possible, inspect dynamic effects, compare modern estimators, and consider parallel-trends sensitivity when claims matter.

## User-Facing Style

Be practical and cautious. A helpful early response is:

> This looks like a difference-in-differences question because some units receive the policy at different times and we observe outcomes before and after. Before choosing a model, I would first make a treatment timing table, check how many pre-periods exist, and decide whether never-treated or not-yet-treated units are credible controls.

Translate assumptions:

- parallel trends: "without the policy, treated and comparison units would have moved similarly over time";
- no anticipation: "units did not change behavior before treatment because they expected it";
- stable composition: "the makeup of treated and comparison units did not change in a way that explains the result";
- no spillovers: "treatment in one unit did not affect outcomes in comparison units."

## Activation and Route-Out

Use this subskill when the user says or implies:

- difference-in-differences, DiD, DD, event study, staggered adoption, panel policy evaluation, pre/post with controls, treatment timing, rollout, adoption date, leads/lags, pretrends, TWFE, group-time ATT, Callaway-Sant'Anna, Sun-Abraham, Goodman-Bacon, `did`, `fixest::sunab`, `DRDID`, `did2s`, or `HonestDiD`.

Do **not** use this as the only workflow when:

- there is only one treated aggregate unit or very few treated units and donor-pool construction dominates: coordinate with `subskills/14-synthetic-control-time-series/`;
- there is a cutoff assignment rule: route to `subskills/12-regression-discontinuity/`;
- treatment is randomized rollout or cluster randomized: coordinate with `subskills/05-randomized-experiments/`;
- treatment or confounding varies at individual time-varying decision points: route to `subskills/10-longitudinal-gmethods/`;
- interference/spillovers are central: coordinate with `subskills/17-interference-spillovers/`;
- missingness, panel attrition, measurement, or composition changes dominate: coordinate with `subskills/02-user-data-inspector/`;
- the user only has one treated group and one post period with no credible controls: route to descriptive, synthetic control if possible, or prospective design planning.

If the DiD route is rejected, update the `subskill_analyses` entry as `rejected`, `fallback`, or `exploratory/user-forced`, record the failed condition, and return to the main skill's route shortlist.

## DiD Project Specification Entry

When a project specification is being maintained, append or update this compact entry under the top-level `subskill_analyses` list. Fill only fields that are known or decision-relevant. Do not duplicate global fields already captured under `data`, `variables`, `intervention`, `outcomes`, `study_design`, or `analysis_routes`.

```yaml
subskill_analyses:
  - subskill_id: "11-did-event-study"
    status: "candidate | selected | rejected | fallback | exploratory/user-forced"
    fit_to_user_need: null
    user_task: "design triage | event study | estimate ATT | pretrend audit | code | interpret result | unknown"
    data_structure:
      unit_id: null
      time_variable: null
      panel_or_repeated_cross_section: null
      balanced_panel: null
      treatment_first_period_variable: null
      never_treated_available: null
      not_yet_treated_available: null
      treatment_reversible_or_absorbing: null
    estimand:
      label: "two-group two-period ATT | group-time ATT | dynamic/event-time ATT | overall ATT | cohort-specific ATT | calendar-time ATT | unknown"
      target_population: null
      outcome_scale: null
      aggregation: null
      interpretation: null
    assumptions_needed:
      parallel_trends_or_conditional_parallel_trends: null
      no_anticipation: null
      stable_composition: null
      no_spillovers: null
      consistent_treatment_definition: null
      correct_treatment_timing: null
    diagnostics_or_checks:
      treatment_timing_table: null
      pre_period_count: null
      event_study_plot: null
      pretrend_or_placebo_tests: null
      control_group_sensitivity: null
      cluster_level: null
      composition_or_attrition_check: null
      sensitivity_to_parallel_trends: null
    estimation_plan:
      primary_method: "Callaway-Sant'Anna | Sun-Abraham | Borusyak-Jaravel-Spiess imputation | doubly robust DiD | did2s | simple two-period DiD | unknown"
      fallback_method: null
      covariates: []
      control_group: "never-treated | not-yet-treated | both/sensitivity | unknown"
      software_backend: "R | Python | Stata | unknown"
    fatal_flaws_or_major_limitations: []
    limitations: []
    open_questions: []
```

## Core Theory and Formal Definitions

Default notation in this subskill:

- \(i\): unit;
- \(t\): time period;
- \(G_i\): first treatment period or cohort;
- \(D_{it}\): treatment status;
- \(Y_{it}(0)\): untreated potential outcome;
- \(Y_{it}(g)\): potential outcome if first treated in period \(g\).

If the user uses different notation or variable names, adapt responses to the user's notation.

### Group-time ATT

For group \(g\) first treated at time \(g\) and period \(t \ge g\):

\[
ATT(g,t) = E[Y_t(g) - Y_t(0) \mid G=g].
\]

Aggregations of \(ATT(g,t)\) produce event-time effects, group/cohort effects, calendar-time effects, or overall ATT summaries. State the aggregation explicitly.

### Parallel trends

The identifying claim is that, absent treatment, treated units would have followed the comparison trend. With covariates, this may be conditional parallel trends. Pre-period plots and tests can reveal problems but cannot prove the counterfactual trend.

## Method Recommendation Rules

### Design-to-method table

| Situation | Default recommendation | Required checks |
|---|---|---|
| Simple two groups, two periods | Classical DiD or doubly robust two-period DiD | pre/post alignment, parallel trends argument, cluster SE |
| Multiple periods, staggered absorbing treatment | Callaway-Sant'Anna group-time ATT via `did` | treatment timing, control group, no anticipation, aggregation |
| Dynamic/event-time effects with staggered adoption | Sun-Abraham, Callaway-Sant'Anna dynamic aggregation, or imputation estimator | event-time support, pre-periods, binning choices |
| Heterogeneous effects likely | Avoid naive TWFE; use group-time, interaction-weighted, or imputation estimators | cohort/time heterogeneity, aggregation weights |
| Conditional parallel trends with covariates | Doubly robust DiD or `did` with covariates | covariates measured pre-treatment, overlap, nuisance diagnostics |
| Few treated units or strong donor construction need | Coordinate with synthetic control | pre-period fit, donor pool, shocks |
| Possible violations of parallel trends | HonestDiD / sensitivity analysis | pretrend behavior, plausible restrictions |
| Spillovers or contamination | Coordinate with interference subskill or redesign | exposure mapping, contaminated controls |

## Language Backend Policy

Do not install packages silently. If packages are missing, show install commands and ask for approval.

### R preferred stack

- `did`: Callaway-Sant'Anna group-time ATT, dynamic/group/calendar aggregations, never-treated or not-yet-treated controls, covariates, multiplier bootstrap, plots.
- `fixest`: high-dimensional fixed effects and `sunab()` for Sun-Abraham event-study interactions; useful for transparent formulas and plotting.
- `DRDID`: doubly robust DiD for two-period/two-group panel or repeated cross-section settings.
- `did2s`: two-stage DiD and common event-study comparison interface.
- `HonestDiD`: robust inference/sensitivity to violations of parallel trends.
- `bacondecomp`: diagnostic decomposition for TWFE timing variation, not a primary modern estimator.

### Python

Python DiD tooling is less standardized than R for modern staggered-adoption estimators. Use Python for data preparation, plotting, and simple DiD when appropriate; prefer R for production Callaway-Sant'Anna, Sun-Abraham, and HonestDiD workflows unless the user has a validated Python package.

## Data Preprocessing Rules

1. Create one row per unit-period or repeated cross-section unit-period observation.
2. Define first treatment period \(G_i\) before outcome modeling.
3. Code never-treated and not-yet-treated units explicitly.
4. Keep treatment timing separate from treatment intensity or exposure dose.
5. Ensure covariates used for conditional parallel trends are pre-treatment or not affected by treatment.
6. Check balanced versus unbalanced panel and whether attrition/composition changes are treatment-related.
7. Do not include post-treatment controls that absorb treatment effects.
8. Preserve unit, cluster, geography, cohort, and calendar-time variables for inference and plots.
9. Decide event-time binning before looking for favorable effects.
10. Record policy anticipation windows and exclude or re-code anticipation periods if justified.

## Required Diagnostics

- treatment timing table and cohort sizes;
- outcome trends by treatment cohort and controls;
- event-study plot with pre-treatment periods;
- pretrend/placebo periods and placebo outcomes when available;
- comparison of never-treated versus not-yet-treated controls when both exist;
- cluster-robust inference at the assignment/policy level where feasible;
- composition/attrition and missingness checks;
- sensitivity to event-time binning, covariates, control group choice, and estimator family;
- parallel-trends sensitivity using `HonestDiD` or related methods for high-stakes claims.

## Failure Modes and Guardrails

Escalate warnings when:

- naive TWFE is used with staggered timing and likely heterogeneous effects;
- treatment timing is mis-coded or treatment is not absorbing when the estimator assumes it is;
- there are too few pre-periods to assess trends;
- treated and comparison units have visibly different pretrends;
- anticipation is plausible but ignored;
- composition changes, attrition, or missing outcomes differ by treatment timing;
- controls are contaminated by spillovers or anticipation;
- standard errors ignore clustering at the policy/assignment level;
- dynamic effects are interpreted without checking event-time support;
- local or treated-population ATT is generalized to all units without justification.

## Step-by-Step Operating Procedure

1. Restate the policy or treatment timing question.
2. Define units, time periods, treatment start, outcome, target population, and panel/repeated-cross-section structure.
3. Build a treatment timing table and outcome trend plot.
4. Choose the estimand and aggregation.
5. Choose the control group and discuss parallel trends/no anticipation.
6. Select a modern estimator appropriate for timing and heterogeneity.
7. Plan clustering and inference.
8. Run pretrend, placebo, control-group, composition, and sensitivity diagnostics.
9. If diagnostics fail, narrow the comparison, use sensitivity bounds, route to synthetic control/interference/missingness, or report descriptive trends.
10. Record assumptions, estimator, diagnostics, and limitations in the project specification.

## Output Template

```markdown
### DiD / Event Study Analysis

#### 1. Design setup
- Units and time periods:
- Treatment timing:
- Control group:
- Outcome:
- Panel or repeated cross-section:

#### 2. Estimand
- Target estimand:
- Event-time or aggregation:
- Target population:
- Scale:

#### 3. Assumptions
- Parallel trends:
- No anticipation:
- Stable composition:
- No spillovers:
- Treatment timing validity:

#### 4. Method recommendation
- Primary estimator:
- Fallback/comparator:
- Software/backend:
- Clustering level:

#### 5. Diagnostics
- Treatment timing table:
- Event-study/pretrend plot:
- Placebo checks:
- Control-group sensitivity:
- Composition/attrition:
- Parallel-trends sensitivity:

#### 6. Interpretation
- Estimate and uncertainty:
- What can be said causally:
- Fatal flaws or major limitations:
- Recommended next step:
```

## Related Subskills

- `subskills/14-synthetic-control-time-series/`: use when few aggregate units are treated or donor-pool fit is central.
- `subskills/02-user-data-inspector/`: use for panel attrition, changing composition, or missing outcomes.
- `subskills/17-interference-spillovers/`: use when spillovers or contaminated controls are plausible.
- `subskills/09-heterogeneous-effects-policy/`: use when heterogeneity, targeting, or policy rules are the target.
- `subskills/20-reporting-interpretation/`: use for final write-up and limitations.

## Reference Files

For the detailed workflow, read `references/workflow.md`. For compact design notes, read `references/did_design_notes.md`. For the literature and software map, read `references/literature_and_software.md`.
