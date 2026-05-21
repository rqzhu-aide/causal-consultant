# Template: single-mediator causal mediation with the R mediation package.
# Replace df, column names, model family, and covariates before running.

library(mediation)

mediator_model <- lm(M ~ A + C1 + C2, data = df)
outcome_model <- lm(Y ~ A + M + C1 + C2, data = df)

fit <- mediate(
  model.m = mediator_model,
  model.y = outcome_model,
  treat = "A",
  mediator = "M",
  sims = 1000,
  robustSE = TRUE
)

summary(fit)

# Sensitivity analysis is central for mediator-outcome confounding.
sens <- medsens(fit, rho.by = 0.1)
summary(sens)
plot(sens)
