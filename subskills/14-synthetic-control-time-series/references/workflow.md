# Workflow: Synthetic Control and Time Series

## Purpose

Use this workflow when the user has an intervention, policy, shock, campaign, or rollout at a known time and wants to estimate what would have happened to an aggregate outcome without that intervention.

The workflow should first decide whether the comparison information can support a causal counterfactual. Estimator choice comes after the timeline, donor/control structure, and feasibility checks are clear.

## Stage 1: Intent and Data Triage

Classify the user's immediate goal:

- learn whether a synthetic-control or interrupted-time-series design is suitable;
- build a method shortlist;
- estimate an intervention effect for one treated unit;
- analyze several treated units or staggered timing;
- draft R/Python code;
- interpret synthetic-control, CausalImpact, ITS, or panel counterfactual results;
- prepare results for a report.

Collect only the information needed for the next step:

- treated unit(s), outcome, and intervention date;
- pre-period, post-period, anticipation period, and outcome frequency;
- donor units, control series, or untreated periods;
- whether treatment was announced or anticipated before implementation;
- whether donors or controls may be contaminated by spillovers;
- concurrent shocks, policy bundles, reporting changes, or denominator changes;
- number of pre-period and post-period observations;
- language or package preference.

If the user is learning, explain the basic idea first: the analysis tries to construct or model the treated unit's "no intervention" path, then compares observed post-intervention outcomes with that counterfactual path.

## Stage 2: Feasibility and Route Check

Before choosing an estimator, decide whether this subskill is the right active route.

Use this route when:

- there is a known intervention time;
- outcomes are measured before and after treatment;
- the unit of analysis is aggregate or panel-time;
- at least one of these exists: donor units, control time series, untreated time periods, or a long enough single series for cautious ITS;
- the user accepts that causal interpretation depends on strong counterfactual assumptions.

Route out or coordinate when:

- the main structure is staggered DiD/event study with many treated units and cohort effects;
- assignment is based on a cutoff;
- the treatment is an instrument or encouragement;
- censoring, survival outcomes, missingness, measurement changes, selection, or spillovers dominate;
- there is no plausible comparison structure and no stable pre-period, in which case only descriptive before/after or forecasting language may be supportable.

When routing out, update `subskill_analyses` with the rejected or fallback reason and return to the main route shortlist.

## Stage 3: Estimand and Project Spec Entry

Update the project specification entry from the top-level `../../../SKILL.md`.

At minimum, record:

- treated unit(s);
- intervention date and anticipation window;
- pre-period and post-period;
- donor units or control series;
- target estimand and effect scale;
- candidate method family;
- key assumptions and diagnostics;
- fatal flaws or major limitations.

Use `null` or `[]` for unknown values. Keep the entry compact, and do not duplicate global project fields.

## Stage 4: Method Selection

Recommend in layers rather than as a large menu. Choose only one primary family and one comparator unless the user explicitly asks for a survey.

### Classic synthetic control layer

Use when there is one or a few treated aggregate units, a clear intervention date, enough pre-period data, and an untreated donor pool. Prefer this when interpretability and transparent donor weights matter.

Common choices:

- classic SCM with `Synth` or `tidysynth`;
- placebo-in-space inference;
- leave-one-out and donor-pool sensitivity.

### Augmented and generalized panel layer

Use when classic SCM is close but not enough:

- augmented SCM when pre-fit is imperfect and bias correction is helpful;
- generalized SCM when multiple treated units or variable adoption times are present and interactive fixed effects are plausible;
- matrix completion when the panel is richer and a low-rank counterfactual structure is plausible;
- synthetic DiD when both DiD and SCM comparisons are plausible.

Coordinate with DiD when the estimand is primarily cohort/event-study based.

### Time-series counterfactual layer

Use when the data are one treated series plus control series or a long single series:

- CausalImpact/BSTS when there are stable, unaffected control time series and the user wants a modeled counterfactual with uncertainty;
- interrupted time series or segmented regression when no donor pool exists but many observations are available before and after treatment;
- ARIMA/state-space intervention models when autocorrelation and seasonality are central and the user understands the assumptions.

Label single-series ITS as weaker than designs with valid controls when concurrent shocks are plausible.

## Stage 5: Diagnostics, Inference, and Sensitivity

Plan diagnostics before final causal interpretation.

For synthetic-control designs:

- plot treated and synthetic outcomes over time;
- report pre-treatment RMSPE or an equivalent fit measure;
- inspect donor weights and predictor balance;
- run placebo-in-space tests when donor units exist;
- run leave-one-out sensitivity for high-weight donors;
- test alternative donor pools, predictor sets, and pre-period windows;
- check whether treatment effects are large relative to placebo gaps.

For generalized SCM, synthetic DiD, or matrix completion:

- check held-out or cross-validated pre-period prediction;
- inspect factor dimension or regularization choice when available;
- compare with simpler DiD or SCM estimators;
- examine adoption timing and untreated support.

For ITS/BSTS/CausalImpact:

- check pre-period forecast accuracy and residuals;
- inspect autocorrelation, seasonality, and structural breaks;
- audit control series for contamination and stable relationship;
- run placebo time windows or pre-period holdout when meaningful;
- compare level-change and trend-change summaries.

## Stage 6: Interpretation and Fallback

Interpret results on three levels:

- **Design support:** whether the donor/control/timeline structure can plausibly support the counterfactual.
- **Model support:** whether pre-fit, residuals, placebo tests, and sensitivity analyses are reassuring.
- **Causal claim strength:** whether the result can be described as a causal effect, a fragile causal estimate, or a descriptive change.

If diagnostics fail, choose one of these fallbacks:

- narrow the donor pool or remove contaminated donors;
- change the pre/post windows or include an anticipation period;
- switch from classic SCM to augmented SCM, generalized SCM, synthetic DiD, or ITS depending on the failure;
- route to DiD/event study, RD, missingness/measurement, or interference subskills;
- report the analysis as exploratory or descriptive only.

## Suggested Response Pattern

```markdown
I would treat this as a synthetic-control/time-series problem because [reason].

The intervention appears to occur at [time], for [treated unit]. The main counterfactual question is what [outcome] would have looked like after that date without the intervention.

Before choosing the final method, I would check [donor/control/pre-period feature]. A reasonable starting shortlist is [primary method] plus [comparator].

The key causal conditions are [plain-language assumptions]. I would diagnose them with [pre-fit/placebo/sensitivity checks].

If [main diagnostic] fails, I would [fallback or route-out plan].
```

## Code Template Index

Root templates:

- `scripts/R/causalimpact_template.R`

There is not yet a full SCM template in the root scripts. If writing SCM code, use package documentation and adapt code carefully to the user's unit, time, donor pool, intervention date, and outcome scale. Do not install packages silently.

## Literature and Software Map

For key papers, package capabilities, and method-selection notes, read `literature_and_software.md` in this folder.
