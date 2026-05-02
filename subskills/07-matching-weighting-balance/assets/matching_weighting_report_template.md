# Matching / Weighting / Balance Report

## 1. Causal Question

- Treatment:
- Comparator:
- Outcome:
- Time zero:
- Follow-up:
- Unit of analysis:
- Target population:

## 2. Estimand

- Primary estimand:
- Mathematical definition:
- Outcome scale:
- Target population before preprocessing:
- Target population after trimming/matching, if changed:

## 3. Identification Assumptions

- Consistency:
- Conditional exchangeability given measured covariates:
- Positivity/overlap:
- No interference:
- Measurement and missingness assumptions:

## 4. Covariate Design Ledger

| Variable | Timing | Role | Included? | Reason |
|---|---|---|---|---|

## 5. Preprocessing Method

- Method:
- Software:
- Propensity model or distance:
- Matching ratio/replacement/caliper/exact constraints:
- Weighting method/estimand/stabilization/trimming:
- Design iterations performed without outcome peeking:

## 6. Diagnostics

### Sample and overlap

- Initial treated/control counts:
- Retained treated/control counts:
- Discarded treated/control counts:
- Propensity overlap summary:

### Balance

- Maximum absolute SMD before:
- Maximum absolute SMD after:
- Number of covariates with adjusted |SMD| > 0.1:
- Variance ratio range:
- Important residual imbalances:

### Weights or matching structure

- ESS treated:
- ESS control:
- Max weight:
- Weight trimming:
- Matched ratio distribution:
- Reused controls:

## 7. Effect Estimate

| Quantity | Estimate |
|---|---:|
| Treated mean/risk | |
| Control mean/risk | |
| Absolute effect | |
| Relative effect, if requested | |
| Standard error | |
| 95% confidence interval | |
| p-value, if requested | |

## 8. Sensitivity and Robustness

- Alternative preprocessing method:
- Alternative caliper/trimming:
- Alternative estimand, e.g., ATO vs ATE:
- Unmeasured confounding sensitivity:
- Negative control or placebo checks:

## 9. Interpretation

State the result in this form:

> Under consistency, no interference, conditional exchangeability given the listed pre-treatment covariates, and positivity in the retained target population, the estimated [estimand] is [estimate] on the [scale] scale. The target population is [population]. Balance diagnostics [passed/partially passed/failed]. Remaining limitations include [limitations].

## 10. Reproducibility

- Data version:
- Package versions:
- Random seed:
- Code file:
- Design log:
