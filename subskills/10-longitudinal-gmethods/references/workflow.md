# Workflow: Longitudinal G-Methods

## Purpose

Use this workflow when treatment or exposure varies over time, confounders vary over time, and prior treatment can affect later confounders. The main goal is to estimate effects of treatment strategies, not merely to fit a repeated-measures model.

## Stage 1: Timeline and Data Shape

Define:

- causal unit and row unit;
- eligibility and time zero;
- decision times and spacing;
- treatment/action at each time;
- covariates measured before each action;
- censoring, competing events, switching, discontinuation, and visit process;
- outcome and follow-up end;
- person-period or wide data structure.

If time ordering is unclear, do not choose an estimator yet.

## Stage 2: Regime and Estimand

Classify the target:

- static sustained strategy;
- dynamic strategy based on measured history;
- modified treatment policy;
- per-protocol strategy;
- grace-period strategy;
- dynamic treatment regime value;
- contrast of two or more regimes.

State the estimand as the mean or risk under a strategy, such as `E[Y^g]`, plus the contrast and scale.

## Stage 3: Feasibility and Assumptions

Check:

- whether the needed treatment/covariate history is measured at each decision time;
- whether relevant histories include people following each strategy;
- whether censoring and competing events are defined and can be modeled;
- whether dynamic rules use only information available at the decision time;
- whether irregular visits or missing histories require a visit-process or missingness route.

Explain assumptions in plain language: measured history at every decision point, support for each strategy, well-defined regimes, and censoring explained by measured history.

## Stage 4: Method Selection

Choose one primary method and one fallback.

Use MSM/IPW when:

- the regime can be represented through treatment and censoring weights;
- a marginal structural model gives a clear summary;
- weight diagnostics are acceptable.

Use parametric g-formula when:

- the user wants simulated outcomes under several sustained interventions;
- the covariate process is important and can be modeled;
- model specification and simulation checks are feasible.

Use longitudinal TMLE when:

- the target is an intervention-specific mean or MSM parameter;
- flexible nuisance modeling and double robustness are important;
- the data structure fits `ltmle` or related tools.

Use LMTP when:

- treatment is continuous, multivalued, or better represented by a feasible shift/modification than a fixed value;
- positivity for static regimes would be unrealistic;
- `lmtp` supports the outcome and censoring structure.

Use cloning-censoring-weighting when:

- the target is a per-protocol or grace-period effect;
- treatment strategies are assigned by cloning and deviations are handled by artificial censoring and weights.

## Stage 5: Diagnostics

Report:

- timeline diagram;
- treatment prevalence by time;
- regime support;
- time-specific and cumulative treatment weights;
- censoring weights;
- effective sample size;
- model fit for treatment, censoring, covariate, and outcome models;
- g-formula simulation checks when used;
- sensitivity to grace periods, intervention definitions, and truncation.

## Stage 6: Interpretation and Fallback

Interpret the result as an effect of a defined strategy over time. If checks fail:

- simplify the strategy;
- shorten follow-up or coarsen decision times;
- choose a feasible modified treatment policy;
- narrow the target population;
- change from causal to descriptive trajectory analysis;
- recommend prospective data collection.

## Suggested Response Pattern

```markdown
I would treat this as a longitudinal g-methods problem because treatment and covariates change over time.

The key timeline is [time zero], then decisions at [times], with [covariates] measured before each decision and [outcome] measured at [follow-up].

The estimand is the outcome under [strategy g] compared with [strategy g0], not a single baseline treatment effect.

My primary route would be [method], with [fallback]. Before interpreting it causally, I would check [sequential positivity/weights/regime support/censoring].

If [main support issue] fails, I would [fallback plan].
```

## Code Template Index

Root template:

- `scripts/R/longitudinal_gmethods_template.R`

Use it as a design skeleton. Adapt to `ipw`, `gfoRmula`, `ltmle`, `lmtp`, or cloning-censoring-weighting only after the timeline and regime are explicit.

## Literature and Software Map

For key papers, textbooks, and software notes, read `literature_and_software.md` in this folder.
