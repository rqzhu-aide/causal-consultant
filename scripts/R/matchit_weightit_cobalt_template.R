# Matching/weighting/balance template
# Adapt variable names before running.
# Required packages: MatchIt, WeightIt, cobalt, sandwich, lmtest

library(MatchIt)
library(WeightIt)
library(cobalt)
library(sandwich)
library(lmtest)

# Example variables
# data: df
# treatment: A, binary 0/1
# outcome: Y
# pre-treatment covariates: X1, X2, X3

covariates <- c("X1", "X2", "X3")
formula_ps <- as.formula(paste("A ~", paste(covariates, collapse = " + ")))

# Matching example targeting ATT by default
m.out <- matchit(formula_ps, data = df, method = "nearest", estimand = "ATT")
summary(m.out)
love.plot(m.out, threshold = 0.1, abs = TRUE)
matched_df <- match.data(m.out)

fit_m <- lm(Y ~ A + X1 + X2 + X3, data = matched_df, weights = weights)
coeftest(fit_m, vcov = vcovHC(fit_m, type = "HC1"))

# Weighting example targeting ATE
w.out <- weightit(formula_ps, data = df, method = "ps", estimand = "ATE")
bal.tab(w.out, un = TRUE, thresholds = c(m = 0.1))
love.plot(w.out, threshold = 0.1, abs = TRUE)
summary(w.out$weights)

fit_w <- lm(Y ~ A, data = df, weights = w.out$weights)
coeftest(fit_w, vcov = vcovHC(fit_w, type = "HC1"))

# Report effective sample size, balance, overlap, and weight diagnostics before interpreting effects.
