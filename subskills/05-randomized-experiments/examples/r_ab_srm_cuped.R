# Online A/B test: sample-ratio mismatch and CUPED in R
# ----------------------------------------------------
# This example is runnable with synthetic user-level data.
# Replace synthetic data with one row per randomization unit in production.

set.seed(20260429)
N <- 50000
planned_prob <- c(control = 0.5, treatment = 0.5)

# Simulated user-level assignment.
df <- data.frame(
  user_id = seq_len(N),
  z = rbinom(N, 1, planned_prob["treatment"]),
  pre_metric = rgamma(N, shape = 2, scale = 5)
)

# Treatment improves outcome by 0.20 on absolute scale.
df$outcome <- 1 + 0.20 * df$z + 0.75 * df$pre_metric + rnorm(N, sd = 5)
df$converted <- rbinom(N, 1, plogis(-2.0 + 0.08 * df$z + 0.03 * df$pre_metric))

# Introduce no SRM here. To test failure behavior, drop some treatment rows.
# df <- df[!(df$z == 1 & runif(nrow(df)) < 0.03), ]

srm_test <- function(z, probs) {
  observed <- table(factor(z, levels = seq_along(probs) - 1))
  expected <- sum(observed) * probs
  stat <- sum((observed - expected)^2 / expected)
  p <- stats::pchisq(stat, df = length(probs) - 1, lower.tail = FALSE)
  data.frame(
    arm = names(probs),
    observed = as.numeric(observed),
    expected = as.numeric(expected),
    chisq = stat,
    df = length(probs) - 1,
    p_value = p
  )
}

cuped_adjust <- function(y, x) {
  theta <- stats::cov(y, x, use = "complete.obs") / stats::var(x, na.rm = TRUE)
  y_adj <- y - theta * (x - mean(x, na.rm = TRUE))
  list(y_adj = y_adj, theta = theta)
}

summarize_effect <- function(y, z) {
  y1 <- y[z == 1]
  y0 <- y[z == 0]
  est <- mean(y1) - mean(y0)
  se <- sqrt(stats::var(y1) / length(y1) + stats::var(y0) / length(y0))
  control_mean <- mean(y0)
  data.frame(
    control_mean = control_mean,
    treatment_mean = mean(y1),
    absolute_effect = est,
    relative_lift = est / control_mean,
    std_error = se,
    ci_low = est - 1.96 * se,
    ci_high = est + 1.96 * se
  )
}

cat("\nSample-ratio mismatch test:\n")
print(srm_test(df$z, planned_prob))

cat("\nRaw outcome effect:\n")
raw <- summarize_effect(df$outcome, df$z)
print(raw)

adj <- cuped_adjust(df$outcome, df$pre_metric)
df$outcome_cuped <- adj$y_adj
cat("\nCUPED theta:\n")
print(adj$theta)
cat("\nCUPED-adjusted outcome effect:\n")
print(summarize_effect(df$outcome_cuped, df$z))

cat("\nBinary conversion risk difference:\n")
print(summarize_effect(df$converted, df$z))

cat("\nInterpretation reminder:\n")
cat("CUPED improves precision when pre_metric is pre-treatment. It does not fix SRM, logging failures, or post-treatment filtering.\n")
