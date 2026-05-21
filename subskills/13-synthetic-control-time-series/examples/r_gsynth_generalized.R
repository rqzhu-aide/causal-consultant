# Generalized synthetic control / interactive fixed effects.
# Use for multiple treated units or staggered timing when assumptions fit.

library(readr)
library(gsynth)

dat <- read_csv("analysis_panel_counterfactual.csv")

# Required columns:
# unit_id, time, y, treated, x1, x2

fit <- gsynth(
  y ~ treated + x1 + x2,
  data = dat,
  index = c("unit_id", "time"),
  force = "two-way",
  CV = TRUE,
  r = c(0, 5),
  se = TRUE,
  inference = "parametric",
  nboots = 200,
  seed = 123
)

capture.output(print(fit), file = "gsynth_summary.txt")
saveRDS(fit, "gsynth_fit.rds")
