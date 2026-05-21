# CACE/LATE estimate for noncompliance in a randomized encouragement design.
# Report ITT first. Use this only when IV assumptions are defensible.

library(readr)
library(estimatr)
library(modelsummary)

dat <- read_csv("analysis_dataset.csv")

# y: outcome
# z: randomized assignment or encouragement
# d: treatment received
# x1, x2: pre-treatment covariates
# cluster_id: optional cluster identifier

itt <- lm_robust(
  y ~ z + x1 + x2,
  data = dat,
  clusters = cluster_id,
  se_type = "CR2"
)

cace <- iv_robust(
  y ~ d + x1 + x2 | z + x1 + x2,
  data = dat,
  clusters = cluster_id,
  se_type = "CR2"
)

modelsummary(
  list("ITT: assignment" = itt, "CACE/LATE: receipt instrumented by assignment" = cace),
  output = "experiment_noncompliance_table.md"
)
