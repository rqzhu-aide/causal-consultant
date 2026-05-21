# Template: outcome-model standardization from source to target population.

library(dplyr)

source <- subset(stacked_source_target, S == 1)
target <- subset(stacked_source_target, S == 0)

outcome_model <- glm(
  outcome ~ treatment * (age + sex + baseline_risk),
  data = source,
  family = gaussian()
)

target_a1 <- target
target_a0 <- target
target_a1$treatment <- 1
target_a0$treatment <- 0

mu1 <- predict(outcome_model, newdata = target_a1, type = "response")
mu0 <- predict(outcome_model, newdata = target_a0, type = "response")

target_ate <- mean(mu1 - mu0)
print(target_ate)

# Bootstrap or use influence-function methods for report-ready uncertainty.
# Report that this depends on outcome model extrapolation to target covariates.
