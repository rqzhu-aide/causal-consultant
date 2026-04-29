# Causal mediation template using mediation
# Adapt models and ensure temporal ordering: A before M before Y.

library(mediation)

# A: treatment
# M: mediator
# Y: outcome
# X1, X2: pre-treatment confounders of relevant relationships

med_model <- lm(M ~ A + X1 + X2, data = df)
out_model <- lm(Y ~ A + M + X1 + X2, data = df)

med_fit <- mediate(
  model.m = med_model,
  model.y = out_model,
  treat = "A",
  mediator = "M",
  boot = TRUE,
  sims = 1000
)

summary(med_fit)

# Before interpretation, discuss sequential ignorability and mediator-outcome confounding.
