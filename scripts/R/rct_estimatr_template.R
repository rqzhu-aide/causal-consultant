# Root template: randomized experiment analysis with estimatr
# ----------------------------------------------------------
# Replace df and column names with user data. Do not install packages silently.
# install.packages(c("estimatr", "randomizr", "broom"))

required <- c("estimatr", "broom")
missing <- required[!vapply(required, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing) > 0) stop("Install required packages first: ", paste(missing, collapse = ", "))

# Expected columns:
# df$id       randomization-unit ID
# df$z        randomized assignment: 0 control, 1 treatment
# df$y        primary outcome
# df$x_pre    optional pre-treatment covariate
# df$cluster  optional cluster ID
# df$block    optional block/stratum ID

if (!exists("df")) {
  set.seed(20260429)
  N <- 1000
  df <- data.frame(id = seq_len(N), z = rbinom(N, 1, 0.5), x_pre = rnorm(N))
  df$y <- 1 + 0.25 * df$z + 0.6 * df$x_pre + rnorm(N)
}

cat("\nAllocation counts:\n")
print(table(df$z))

# Difference in means.
fit_dim <- estimatr::difference_in_means(y ~ z, data = df)
cat("\nDifference in means:\n")
print(summary(fit_dim))

# Robust OLS.
fit_ols <- estimatr::lm_robust(y ~ z, data = df, se_type = "HC2")
cat("\nRobust OLS:\n")
print(summary(fit_ols))

# Covariate adjustment if x_pre exists.
if ("x_pre" %in% names(df)) {
  fit_lin <- estimatr::lm_lin(y ~ z, covariates = ~ x_pre, data = df, se_type = "HC2")
  cat("\nLin covariate-adjusted analysis:\n")
  print(summary(fit_lin))
}

# Cluster-robust option if cluster exists.
if ("cluster" %in% names(df)) {
  fit_cluster <- estimatr::lm_robust(y ~ z, data = df, clusters = cluster, se_type = "CR2")
  cat("\nCluster-robust analysis:\n")
  print(summary(fit_cluster))
}

cat("\nReminder: confirm ITT estimand, unit randomized, missingness, compliance, and interference before final interpretation.\n")
