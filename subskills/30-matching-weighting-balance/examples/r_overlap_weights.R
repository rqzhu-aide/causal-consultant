# Overlap weights for limited common support.

library(readr)
library(WeightIt)
library(cobalt)
library(survey)
library(dplyr)

dat <- read_csv("analysis_dataset.csv")

# y: outcome
# a: treatment/exposure, 0/1
# x1, x2, x3: pre-treatment covariates

ow <- weightit(
  a ~ x1 + x2 + x3,
  data = dat,
  method = "glm",
  estimand = "ATO"
)

dat$w_overlap <- ow$weights

weight_summary <- dat %>%
  summarise(
    n = n(),
    effective_n = sum(w_overlap)^2 / sum(w_overlap^2),
    w_min = min(w_overlap),
    w_median = median(w_overlap),
    w_p99 = quantile(w_overlap, 0.99),
    w_max = max(w_overlap)
  )

design <- svydesign(ids = ~1, weights = ~w_overlap, data = dat)
fit <- svyglm(y ~ a, design = design)

write_csv(weight_summary, "overlap_weight_summary.csv")
saveRDS(bal.tab(ow, un = TRUE), "overlap_balance.rds")
print(summary(fit))
