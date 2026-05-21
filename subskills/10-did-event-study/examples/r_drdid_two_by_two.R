# Doubly robust 2x2 DiD template with DRDID.
# Use when the design is two groups/two periods or can be validly collapsed.

library(readr)
library(DRDID)

dat <- read_csv("analysis_did_2x2.csv")

# Required columns:
# id: unit id if panel data
# y_pre: pre-treatment outcome
# y_post: post-treatment outcome
# d: treated group indicator
# x1, x2: pre-treatment covariates

fit <- drdid(
  y1 = dat$y_post,
  y0 = dat$y_pre,
  D = dat$d,
  covariates = as.matrix(dat[, c("x1", "x2")]),
  i.weights = NULL,
  boot = TRUE,
  inffunc = TRUE
)

capture.output(summary(fit), file = "drdid_two_by_two_summary.txt")
saveRDS(fit, "drdid_two_by_two_fit.rds")
