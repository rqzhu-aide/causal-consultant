# Individual-level randomized experiment with randomizr + estimatr
# ------------------------------------------------------------------
# This example is runnable with synthetic data. Replace the synthetic block
# with your own dataframe and variable names for production use.
#
# Required packages:
# install.packages(c("randomizr", "estimatr", "broom"))
# Optional package for randomization inference:
# install.packages("ri2")

required <- c("randomizr", "estimatr", "broom")
missing <- required[!vapply(required, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing) > 0) {
  stop("Install required packages first: ", paste(missing, collapse = ", "))
}

set.seed(20260429)
N <- 1000

df <- data.frame(
  id = seq_len(N),
  x_pre = rnorm(N),
  age = rnorm(N, mean = 50, sd = 12),
  site = sample(LETTERS[1:5], N, replace = TRUE)
)

# Complete random assignment: exactly half treatment, half control.
df$z <- randomizr::complete_ra(N = N, prob = 0.5)

# Synthetic outcome with a true ITT effect of 0.30.
df$y <- 2 + 0.30 * df$z + 0.70 * df$x_pre + 0.02 * df$age + rnorm(N)

# Optional binary outcome.
linpred <- -0.4 + 0.25 * df$z + 0.3 * df$x_pre
p <- plogis(linpred)
df$y_binary <- rbinom(N, size = 1, prob = p)

# 1. Allocation counts.
cat("\nAllocation counts:\n")
print(table(df$z))

# 2. Baseline balance helper.
smd <- function(x, z) {
  x1 <- x[z == 1]
  x0 <- x[z == 0]
  pooled_sd <- sqrt((stats::var(x1) + stats::var(x0)) / 2)
  (mean(x1) - mean(x0)) / pooled_sd
}

balance <- data.frame(
  variable = c("x_pre", "age"),
  mean_treat = c(mean(df$x_pre[df$z == 1]), mean(df$age[df$z == 1])),
  mean_control = c(mean(df$x_pre[df$z == 0]), mean(df$age[df$z == 0])),
  smd = c(smd(df$x_pre, df$z), smd(df$age, df$z))
)
cat("\nBaseline balance:\n")
print(balance)

# 3. Difference in means for continuous outcome.
dim_y <- estimatr::difference_in_means(y ~ z, data = df)
cat("\nDifference in means, continuous outcome:\n")
print(summary(dim_y))

# 4. Robust OLS form. The treatment coefficient equals difference in means
# in a two-arm experiment with an intercept, but robust SEs are convenient.
ols_y <- estimatr::lm_robust(y ~ z, data = df, se_type = "HC2")
cat("\nRobust OLS, continuous outcome:\n")
print(summary(ols_y))

# 5. Lin-style covariate adjustment using pre-treatment covariates.
# Adjustment is for precision, not because confounding is expected.
lin_y <- estimatr::lm_lin(y ~ z, covariates = ~ x_pre + age, data = df, se_type = "HC2")
cat("\nLin covariate-adjusted analysis:\n")
print(summary(lin_y))

# 6. Binary outcome: risk difference using difference_in_means.
rd <- estimatr::difference_in_means(y_binary ~ z, data = df)
cat("\nRisk difference for binary outcome:\n")
print(summary(rd))

# 7. Optional randomization inference if ri2 is available.
if (requireNamespace("ri2", quietly = TRUE)) {
  declaration <- randomizr::declare_ra(N = nrow(df), prob = 0.5)
  ri <- ri2::conduct_ri(
    formula = y ~ z,
    declaration = declaration,
    assignment = "z",
    sharp_hypothesis = 0,
    data = df
  )
  cat("\nRandomization inference under sharp null of zero effect:\n")
  print(summary(ri))
} else {
  cat("\nPackage ri2 not installed; skipping randomization inference.\n")
}

# 8. Minimal reporting object.
result <- data.frame(
  estimand = "ITT / assignment effect",
  method = "difference in means",
  estimate = coef(dim_y)["z"],
  std_error = summary(dim_y)$coefficients["z", "Std. Error"],
  n_control = sum(df$z == 0),
  n_treatment = sum(df$z == 1)
)
cat("\nMinimal report table:\n")
print(result)
