# Template: inverse odds of sampling weights for trial-to-target transport.
# S = 1 for source/trial rows, S = 0 for target population rows.

library(WeightIt)
library(cobalt)
library(survey)

selection_covariates <- c("age", "sex", "baseline_risk")

selection_formula <- as.formula(paste("S ~", paste(selection_covariates, collapse = " + ")))

w_sel <- weightit(
  selection_formula,
  data = stacked_source_target,
  method = "glm",
  estimand = "ATE"
)

bal.tab(w_sel, un = TRUE)
love.plot(w_sel, abs = TRUE)

# Use only source rows for effect estimation, weighted toward the target covariate distribution.
source <- subset(stacked_source_target, S == 1)
source$transport_weight <- w_sel$weights[stacked_source_target$S == 1]

design <- svydesign(ids = ~1, weights = ~transport_weight, data = source)
fit <- svyglm(outcome ~ treatment, design = design)
summary(fit)

# Check effective sample size and extreme weights before reporting.
summary(source$transport_weight)
