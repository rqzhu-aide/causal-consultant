# Template: interpretable one-time policy tree with grf + policytree.
# Replace df, column names, and paths before running.

library(grf)
library(policytree)

baseline_cols <- c("x1", "x2", "x3")
treatment_col <- "treatment"  # 0 = control, 1 = treated
outcome_col <- "outcome"      # higher values should be better

X <- as.matrix(df[, baseline_cols])
W <- as.numeric(df[[treatment_col]])
Y <- as.numeric(df[[outcome_col]])

# Fit a causal forest. For observational data, inspect W.hat for overlap.
cf <- causal_forest(X, Y, W)
hist(cf$W.hat, main = "Estimated treatment propensities", xlab = "Pr(treatment | X)")

# Matrix of doubly robust reward scores, with one column per action.
dr_scores <- double_robust_scores(cf)

# Learn a shallow, interpretable rule. Action 1 is control, action 2 is treatment.
tree <- policy_tree(X, dr_scores, depth = 2)
print(tree)
plot(tree)

predicted_action <- predict(tree, X)
node_id <- predict(tree, X, type = "node.id")

# Use held-out or cross-fitted data for report-ready value estimates.
leaf_values <- aggregate(
  dr_scores,
  by = list(leaf_node = node_id),
  FUN = function(x) c(mean = mean(x), se = sd(x) / sqrt(length(x)))
)

print(leaf_values)
