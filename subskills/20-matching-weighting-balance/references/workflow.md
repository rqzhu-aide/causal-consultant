# Matching Weighting Balance Workflow
## Permission Note

This reference does not authorize execution. Treat diagnostics, artifacts, plots, tables, code, report material, or connected-specialist needs as council/result recommendations unless main explicitly routed `execution_authorized` after user-confirmed scope.

Use this reference when `SKILL.md` is not enough for matching, weighting, overlap, positivity, or balance-diagnostic support.

## 1. Clarify The Support Target

Record the smallest useful implementation target:

- Design route: observational point exposure, longitudinal g-methods, transportability, trial-to-target, or other selected route.
- Estimand: ATE, ATT, ATC, ATO/overlap, target-population effect, survey-weighted effect, or longitudinal strategy effect.
- Treatment/exposure: binary, multi-arm, continuous/coarsened, longitudinal, or censoring/selection process.
- Adjustment set: pre-treatment confounders selected by `method_lead` and checked by `domain_expert`.
- Target population: full sample, treated/exposed, untreated/unexposed, overlap population, survey population, or restricted support region.
- Constraints: exact-match variables, calipers, cluster structure, survey weights, missingness, or domain-critical strata.

## 2. Check Before Estimating Outcomes

Do these before outcome modeling whenever possible:

- confirm all balance covariates are pre-treatment;
- inspect treatment prevalence and overlap by key covariates;
- decide whether the target is ATE, ATT, ATO, or another population;
- choose matching/weighting method based on support rather than habit;
- create balance and weight diagnostics before looking at outcome sensitivity when feasible;
- record discarded units, trimmed weights, and target-population changes.

## 3. Choose A Method Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| ATT question, enough controls | Nearest-neighbor, optimal, full, or exact/coarsened matching | Transparent treated-to-control comparison | Discarded controls and caliper choices change evidence |
| Domain-critical categories must align | Exact matching, coarsened exact matching, cardinality/design matching | Strong face validity for key constructs | Can discard many units or create sparse strata |
| ATE with good overlap | IPW/IPTW or stabilized weights | Direct population-average target | Extreme weights if support is weaker than expected |
| Limited overlap | Overlap weights, trimming, restricted target | Avoids unsupported extrapolation | Target becomes overlap population, not everyone |
| Need direct covariate balance | Entropy balancing, calibration/raking, CBPS, stable balancing weights | Optimizes balance or stability directly | Requires clear target moments and diagnostics |
| Survey or population target | Survey weights plus balancing/transport weights | Preserves population meaning | Need combined-weight plan and variance handling |
| Longitudinal MSM | Time-varying treatment/censoring weights | Handles time-varying confounding in `09` workflows | Weight tails and positivity over histories dominate |
| Multi-arm treatment | Generalized propensity, multi-category weights, full matching | Handles more than two treatments | Pairwise balance and estimand clarity get harder |

## 4. Recommend Focused Evidence

Recommend one or two concrete checks at a time:

- adjustment-set timing/missingness table;
- propensity score or balancing score overlap plot;
- love plot and balance table before/after adjustment;
- effective sample size and weight distribution;
- discarded/retained unit flow by treatment group;
- exact-match feasibility for high-priority variables;
- sensitivity to caliper, trimming, method, and target estimand;
- reproducible matched/weighted dataset with code and diagnostics.

## 5. Connected Reviewer Relevance

Preserve reviewer relevance in the `method_task_results` item rather than assigning work directly.

- `01-single-time-observational-exposure`: primary design route for baseline observational treatment comparisons.
- `02-longitudinal-gmethods`: time-varying treatment/censoring weights and MSM support.
- `14-transportability-generalizability`: target-population or trial-to-target weighting.
- `21-doubly-robust-estimation`: AIPW/TMLE after propensity/balance support is reviewed.
- `22-double-machine-learning`: flexible propensity/nuisance learners and cross-fitting when high dimensional.
- `23-survival-competing-risks`: weighted survival or censoring-aware outcome support.
- `data_analyst`: covariate timing, missingness, support, clusters, survey weights, and retained/discarded-unit artifacts.
- `domain_expert`: adjustment-variable meaning, exact-match strata, target population, and residual imbalance interpretation.
- `causal_gatekeeper`: checks whether balance evidence is being used to overstate causal identification or adjustment validity.
- `report_writer`: balance tables, love plots, overlap plots, weight summaries, flow tables, and careful target-population wording.

## 6. Diagnose Before Reporting

Minimum diagnostic set:

- SMD table and love plot before/after matching/weighting;
- propensity or balancing-score overlap plot;
- weight summary, tails, truncation, and effective sample size;
- retained/discarded units and target-population shift;
- balance on key domain variables, nonlinear terms, and interactions where relevant;
- sensitivity to method, caliper, trimming, and propensity learner;
- explicit statement that balance only concerns measured covariates.

## 7. Report-Support Fields

For downstream `method_lead`, `causal_gatekeeper`, and `report_writer` review, preserve compact report-support fields in the `method_task_results` item.

Use careful implementation language:

- "measured baseline covariate balance improved after weighting";
- "the target population is the treated/exposed group" for ATT;
- "the target population is the overlap population" for overlap weights;
- "limited support required trimming/restriction";
- "residual imbalance remains for..."

Avoid:

- "matched data are randomized";
- "confounding is eliminated";
- "ATE in the full population" when trimming or overlap weighting changed the target;
- "propensity model fit was good" as a substitute for balance and support diagnostics.
