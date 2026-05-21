# Template: continuous treatment weighting with WeightIt and cobalt.

library(WeightIt)
library(cobalt)

exposure_col <- "dose"
outcome_col <- "outcome"
covariates <- c("c1", "c2", "c3")

w <- weightit(
  as.formula(paste(exposure_col, "~", paste(covariates, collapse = " + "))),
  data = df,
  method = "glm",
  estimand = "ATE"
)

summary(w)
bal.tab(w, stats = c("correlations"), un = TRUE)
love.plot(w, stats = "correlations", abs = TRUE)

weighted_fit <- lm(
  as.formula(paste(outcome_col, "~ splines::ns(", exposure_col, ", df = 4)")),
  data = df,
  weights = w$weights
)

summary(weighted_fit)
