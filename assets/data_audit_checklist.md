# Data Audit Checklist

## Structure

- [ ] Unit of analysis identified.
- [ ] Unique ID variable available or not needed.
- [ ] Treatment variable identified.
- [ ] Outcome variable identified.
- [ ] Time variable identified if longitudinal/panel/survival.
- [ ] Cluster/network/group variables identified if relevant.

## Timing

- [ ] Time zero defined.
- [ ] Treatment measured at or after eligibility and before outcome.
- [ ] Covariates classified as pre-treatment or post-treatment.
- [ ] Follow-up window defined.
- [ ] Outcome cannot occur before time zero, or pre-existing events are excluded.

## Missingness and Selection

- [ ] Missingness rates by variable.
- [ ] Missingness rates by treatment group.
- [ ] Missingness rates by outcome where observable.
- [ ] Attrition/censoring summarized.
- [ ] Complete-case restrictions documented.

## Treatment and Outcome

- [ ] Treatment prevalence/counts.
- [ ] Comparator counts.
- [ ] Outcome distribution by treatment group.
- [ ] Rare outcome or rare treatment noted.
- [ ] Measurement error or misclassification concerns listed.

## Covariates

- [ ] Baseline table produced.
- [ ] High-cardinality categorical variables handled.
- [ ] Continuous variables checked for outliers.
- [ ] Positivity/overlap preliminarily checked.

## Reproducibility

- [ ] Data source/version recorded.
- [ ] Inclusion/exclusion criteria documented.
- [ ] Software versions recorded.
- [ ] Random seeds set where relevant.
