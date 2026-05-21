# Marginal structural model with treatment and censoring weights.
# Replace paths and variable names before use.

library(readr)
library(dplyr)
library(ipw)
library(survey)
library(cobalt)
library(modelsummary)

dat <- read_csv("longitudinal_person_time.csv")

# Expected long-format columns:
# id: person/unit id
# time: ordered visit or interval
# a: treatment/exposure at this time, 0/1
# y: final or interval outcome
# censored: 1 if censored by the next interval, 0 otherwise
# l1, l2: time-varying confounders measured before a at this time
# baseline_x: baseline confounder

dat <- dat %>%
  arrange(id, time) %>%
  group_by(id) %>%
  mutate(
    lag_a = lag(a, default = 0),
    lag_l1 = lag(l1),
    lag_l2 = lag(l2)
  ) %>%
  ungroup()

treat_w <- ipwtm(
  exposure = a,
  family = "binomial",
  link = "logit",
  numerator = ~ baseline_x + lag_a,
  denominator = ~ baseline_x + lag_a + l1 + l2 + lag_l1 + lag_l2,
  id = id,
  timevar = time,
  type = "all",
  data = dat
)

censor_w <- ipwtm(
  exposure = censored,
  family = "binomial",
  link = "logit",
  numerator = ~ baseline_x + lag_a,
  denominator = ~ baseline_x + lag_a + l1 + l2 + lag_l1 + lag_l2,
  id = id,
  timevar = time,
  type = "cens",
  data = dat
)

dat$sw <- treat_w$ipw.weights * censor_w$ipw.weights
dat$sw_trunc <- pmin(dat$sw, quantile(dat$sw, 0.99, na.rm = TRUE))

weight_summary <- dat %>%
  summarise(
    n_rows = n(),
    n_ids = n_distinct(id),
    sw_min = min(sw, na.rm = TRUE),
    sw_p01 = quantile(sw, 0.01, na.rm = TRUE),
    sw_median = median(sw, na.rm = TRUE),
    sw_p99 = quantile(sw, 0.99, na.rm = TRUE),
    sw_max = max(sw, na.rm = TRUE)
  )

design <- svydesign(ids = ~id, weights = ~sw_trunc, data = dat)
msm <- svyglm(y ~ a + time + lag_a, design = design, family = gaussian())

modelsummary(list("Weighted MSM" = msm), output = "longitudinal_msm_table.md")
write_csv(weight_summary, "longitudinal_weight_summary.csv")
