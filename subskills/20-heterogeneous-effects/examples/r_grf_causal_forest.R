# Template: heterogeneous effects with grf.
# Replace df, column names, and paths before running.

library(grf)

baseline_cols <- c("x1", "x2", "x3")
treatment_col <- "treatment"  # 0 = control, 1 = treated
outcome_col <- "outcome"      # higher values should be better

X <- as.matrix(df[, baseline_cols])
W <- as.numeric(df[[treatment_col]])
Y <- as.numeric(df[[outcome_col]])

cf <- causal_forest(X, Y, W, num.trees = 4000, honesty = TRUE)

ate <- average_treatment_effect(cf)
cal <- test_calibration(cf)
cate <- predict(cf, X, estimate.variance = TRUE)

print(ate)
print(cal)

# Summarize CATEs by pre-specified group.
df$cate_hat <- cate$predictions
aggregate(cate_hat ~ group_var, data = df, FUN = function(z) c(mean = mean(z), sd = sd(z)))

# Best linear projection can make effect-modifier summaries more reportable.
blp <- best_linear_projection(cf, X)
print(blp)

# Ranking diagnostics are exploratory unless validated on held-out or cross-fitted data.
rate <- rank_average_treatment_effect(cf)
print(rate)
