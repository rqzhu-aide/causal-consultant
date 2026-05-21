# Causal survival forest for survival CATE support.
# Use only after method_lead defines the survival target and 20-heterogeneous-effects is active.

library(readr)
library(grf)

dat <- read_csv("analysis_survival_dataset.csv")

# Required columns:
# time: non-negative event/censoring time from valid time zero
# event: 1 observed event of interest, 0 censored
# a: treatment/exposure, binary or numeric
# x1, x2, x3: approved pre-treatment covariates

x <- as.matrix(dat[, c("x1", "x2", "x3")])
horizon <- 365

cs_forest <- causal_survival_forest(
  X = x,
  Y = dat$time,
  W = dat$a,
  D = dat$event,
  target = "RMST",
  horizon = horizon,
  num.trees = 3000,
  honesty = TRUE,
  seed = 123
)

ate <- average_treatment_effect(cs_forest)
cate <- predict(cs_forest)$predictions

write.csv(
  data.frame(id = dat$id, survival_cate_rmst = cate),
  "survival_cate_predictions.csv",
  row.names = FALSE
)

write.csv(
  data.frame(estimate = ate[1], std_error = ate[2], target = "RMST", horizon = horizon),
  "survival_cate_average_effect.csv",
  row.names = FALSE
)

saveRDS(list(forest = cs_forest, ate = ate, horizon = horizon), "causal_survival_forest_fit.rds")
