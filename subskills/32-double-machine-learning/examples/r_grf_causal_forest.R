# Causal forest / orthogonal forest style support for heterogeneity.

library(readr)
library(grf)

dat <- read_csv("analysis_dataset.csv")

# y: outcome
# a: treatment/exposure, 0/1
# x1, x2, x3: approved pre-treatment covariates

x <- as.matrix(dat[, c("x1", "x2", "x3")])
forest <- causal_forest(
  X = x,
  Y = dat$y,
  W = dat$a,
  num.trees = 2000,
  honesty = TRUE,
  seed = 123
)

ate <- average_treatment_effect(forest, target.sample = "overlap")
blp <- best_linear_projection(forest, x)

write.csv(
  data.frame(estimate = ate[1], std_error = ate[2], target = "overlap"),
  "grf_average_treatment_effect.csv",
  row.names = FALSE
)
saveRDS(list(forest = forest, blp = blp), "grf_causal_forest_fit.rds")
