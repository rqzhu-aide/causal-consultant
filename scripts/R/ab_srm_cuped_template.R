# Root template: A/B test SRM and CUPED in R
# ------------------------------------------
# Expected columns:
# df$unit_id      randomization-unit ID
# df$z            assignment: 0 control, 1 treatment
# df$y            outcome metric
# df$x_pre        pre-experiment metric for CUPED, optional

if (!exists("df")) {
  set.seed(20260429)
  N <- 10000
  df <- data.frame(unit_id = seq_len(N), z = rbinom(N, 1, 0.5), x_pre = rnorm(N))
  df$y <- 1 + 0.15 * df$z + 0.7 * df$x_pre + rnorm(N)
}

srm_test <- function(z, probs = c(control = 0.5, treatment = 0.5)) {
  observed <- table(factor(z, levels = seq_along(probs) - 1))
  expected <- sum(observed) * probs
  stat <- sum((observed - expected)^2 / expected)
  p <- stats::pchisq(stat, df = length(probs) - 1, lower.tail = FALSE)
  data.frame(arm = names(probs), observed = as.numeric(observed), expected = as.numeric(expected), chisq = stat, p_value = p)
}

summarize_effect <- function(y, z) {
  y1 <- y[z == 1]
  y0 <- y[z == 0]
  est <- mean(y1) - mean(y0)
  se <- sqrt(stats::var(y1) / length(y1) + stats::var(y0) / length(y0))
  data.frame(control_mean = mean(y0), treatment_mean = mean(y1), absolute_effect = est, relative_lift = est / mean(y0), std_error = se, ci_low = est - 1.96 * se, ci_high = est + 1.96 * se)
}

cuped_adjust <- function(y, x) {
  theta <- stats::cov(y, x, use = "complete.obs") / stats::var(x, na.rm = TRUE)
  y - theta * (x - mean(x, na.rm = TRUE))
}

cat("\nSRM test:\n")
print(srm_test(df$z))

cat("\nRaw effect:\n")
print(summarize_effect(df$y, df$z))

if ("x_pre" %in% names(df)) {
  df$y_cuped <- cuped_adjust(df$y, df$x_pre)
  cat("\nCUPED-adjusted effect:\n")
  print(summarize_effect(df$y_cuped, df$z))
}

cat("\nReminder: CUPED uses pre-treatment information for precision; it does not fix SRM or post-treatment selection.\n")
