# Heterogeneous treatment effects using grf
# Adapt variables and ensure covariates are pre-treatment.

library(grf)

# X: matrix/data.frame of pre-treatment covariates
# W: binary treatment vector
# Y: outcome vector

X <- df[, c("X1", "X2", "X3")]
W <- df$A
Y <- df$Y

cf <- causal_forest(X = X, Y = Y, W = W, num.trees = 2000)

ate <- average_treatment_effect(cf, target.sample = "all")
print(ate)

# Heterogeneity checks
blp <- best_linear_projection(cf, X)
print(blp)

cate_hat <- predict(cf)$predictions
summary(cate_hat)

# Policy learning may use policytree after estimating CATEs.
# Validate HTE findings with honest splits, pre-specified subgroups, and calibration diagnostics.
