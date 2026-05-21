# Instrumental variables with robust or clustered standard errors.
# Replace column names and file paths before use.

library(readr)
library(estimatr)

dat <- read_csv("analysis_iv_dataset.csv")

# Required columns:
# y: outcome
# d: endogenous treatment/exposure
# z: instrument
# x1, x2: pre-instrument or valid baseline covariates
# cluster_id: optional clustering unit

fit <- iv_robust(
  y ~ d + x1 + x2 | z + x1 + x2,
  data = dat,
  clusters = cluster_id,
  se_type = "CR2",
  diagnostics = TRUE
)

capture.output(summary(fit), file = "iv_2sls_estimatr_summary.txt")
write.csv(data.frame(term = names(coef(fit)), estimate = coef(fit)), "iv_2sls_estimatr_coef.csv", row.names = FALSE)
saveRDS(fit, "iv_2sls_estimatr_fit.rds")
