# Intention-to-treat estimate for a randomized experiment.
# Replace paths and variable names before use.

library(readr)
library(dplyr)
library(estimatr)
library(modelsummary)

dat <- read_csv("analysis_dataset.csv")

# Expected columns:
# y: outcome
# z: randomized assignment, 0/1
# strata: optional block/stratum
# cluster_id: optional cluster identifier
# x1, x2: pre-treatment covariates

flow <- dat %>%
  count(z, name = "n_assigned")

balance <- dat %>%
  group_by(z) %>%
  summarise(
    n = n(),
    mean_x1 = mean(x1, na.rm = TRUE),
    mean_x2 = mean(x2, na.rm = TRUE),
    .groups = "drop"
  )

itt_unadjusted <- difference_in_means(y ~ z, data = dat)

itt_adjusted <- lm_robust(
  y ~ z * (x1 + x2) + factor(strata),
  data = dat,
  clusters = cluster_id,
  se_type = "CR2"
)

modelsummary(
  list("Unadjusted ITT" = itt_unadjusted, "Adjusted ITT" = itt_adjusted),
  output = "experiment_itt_table.md"
)

write_csv(flow, "experiment_flow_counts.csv")
write_csv(balance, "experiment_balance_summary.csv")
