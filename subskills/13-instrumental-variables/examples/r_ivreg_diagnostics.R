# r_ivreg_diagnostics.R
# Self-contained instrumental-variables example using the standalone ivreg package.
#
# What this script demonstrates:
#   1. simulated data with an endogenous treatment D, valid instrument Z, covariates X1/X2
#   2. OLS versus IV estimates
#   3. manual first-stage and reduced-form diagnostics
#   4. partial R^2 and robust first-stage F-like statistic for one excluded instrument
#   5. covariate-balance and placebo-outcome falsification checks
#   6. a simple Anderson-Rubin-style test for a hypothesized beta
#
# To use with your own data, replace df and variable names:
#   Y = outcome
#   D = endogenous treatment/exposure
#   Z = excluded instrument
#   X1, X2 = pre-treatment covariates
#
# Install manually if needed:
#   install.packages(c("ivreg", "lmtest", "sandwich", "ggplot2"))

required <- c("ivreg", "lmtest", "sandwich", "ggplot2")
missing <- required[!vapply(required, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing) > 0) {
  stop(
    "Missing packages: ", paste(missing, collapse = ", "),
    "\nInstall with: install.packages(c(",
    paste(sprintf('"%s"', missing), collapse = ", "),
    "))"
  )
}

library(ivreg)
library(lmtest)
library(sandwich)
library(ggplot2)

set.seed(202603)

# ---------------------------------------------------------------------
# 1. Synthetic data: Z affects D; unobserved U confounds D and Y.
# ---------------------------------------------------------------------
n <- 2000
X1 <- rnorm(n)
X2 <- rbinom(n, 1, 0.45)

# Z is conditionally as-if random given X.
p_z <- plogis(0.10 * X1 - 0.20 * X2)
Z <- rbinom(n, 1, p_z)

# Unobserved confounder.
U <- rnorm(n)

# Endogenous treatment.
D <- 0.90 * Z + 0.60 * X1 - 0.35 * X2 + 0.85 * U + rnorm(n)

# Outcome. True causal effect of D is beta = 2.0.
Y <- 2.00 * D + 0.80 * X1 - 0.40 * X2 + 1.00 * U + rnorm(n)

# A placebo outcome affected by X but not by D or Z.
placebo_y <- 0.50 * X1 - 0.20 * X2 + rnorm(n)

df <- data.frame(Y, D, Z, X1, X2, placebo_y)

# Keep one common complete-case sample for all stages.
vars <- c("Y", "D", "Z", "X1", "X2", "placebo_y")
df <- na.omit(df[, vars])
cat("Analysis N:", nrow(df), "\n\n")

# ---------------------------------------------------------------------
# 2. Naive OLS association: expected to be biased here.
# ---------------------------------------------------------------------
ols_fit <- lm(Y ~ D + X1 + X2, data = df)
cat("Naive OLS with HC1 robust SEs; not causal here because D is endogenous:\n")
print(lmtest::coeftest(ols_fit, vcov = sandwich::vcovHC(ols_fit, type = "HC1")))
cat("\n")

# ---------------------------------------------------------------------
# 3. First stage: D ~ Z + X.
# ---------------------------------------------------------------------
fs_full <- lm(D ~ Z + X1 + X2, data = df)
fs_restricted <- lm(D ~ X1 + X2, data = df)

fs_hc1 <- lmtest::coeftest(fs_full, vcov = sandwich::vcovHC(fs_full, type = "HC1"))
fs_coef <- fs_hc1["Z", "Estimate"]
fs_se <- fs_hc1["Z", "Std. Error"]
fs_f_like <- (fs_coef / fs_se)^2

rss_full <- sum(resid(fs_full)^2)
rss_restricted <- sum(resid(fs_restricted)^2)
partial_r2 <- 1 - rss_full / rss_restricted

cat("First-stage regression D ~ Z + X1 + X2:\n")
print(fs_hc1)
cat(sprintf("\nFirst-stage coefficient on Z: %.4f\n", fs_coef))
cat(sprintf("Partial R^2 for excluded instrument Z: %.4f\n", partial_r2))
cat(sprintf("Robust first-stage F-like statistic for one instrument (t^2): %.2f\n\n", fs_f_like))

# Classical nested-model F test. This is not heteroskedasticity robust.
cat("Classical nested-model first-stage F test; use as a rough screen only:\n")
print(lmtest::waldtest(fs_restricted, fs_full, test = "F"))
cat("\n")

# ---------------------------------------------------------------------
# 4. Reduced form: Y ~ Z + X.
# ---------------------------------------------------------------------
rf_fit <- lm(Y ~ Z + X1 + X2, data = df)
rf_hc1 <- lmtest::coeftest(rf_fit, vcov = sandwich::vcovHC(rf_fit, type = "HC1"))
rf_coef <- rf_hc1["Z", "Estimate"]

cat("Reduced-form regression Y ~ Z + X1 + X2:\n")
print(rf_hc1)
cat(sprintf("\nReduced-form coefficient on Z: %.4f\n", rf_coef))
cat(sprintf("Wald ratio, reduced form / first stage: %.4f\n\n", rf_coef / fs_coef))

# ---------------------------------------------------------------------
# 5. IV model using ivreg. Correct SEs should come from IV model object.
# ---------------------------------------------------------------------
iv_fit <- ivreg::ivreg(Y ~ D + X1 + X2 | Z + X1 + X2, data = df)

cat("ivreg 2SLS summary with package diagnostics:\n")
print(summary(iv_fit, diagnostics = TRUE))
cat("\n")

cat("ivreg 2SLS with HC1 robust SEs:\n")
print(lmtest::coeftest(iv_fit, vcov = sandwich::vcovHC(iv_fit, type = "HC1")))
cat("\n")

# ---------------------------------------------------------------------
# 6. Falsification checks.
# ---------------------------------------------------------------------
cat("Covariate balance by instrument Z. Large systematic differences may weaken the design story.\n")
balance_table <- data.frame(
  covariate = c("X1", "X2"),
  mean_Z0 = c(mean(df$X1[df$Z == 0]), mean(df$X2[df$Z == 0])),
  mean_Z1 = c(mean(df$X1[df$Z == 1]), mean(df$X2[df$Z == 1]))
)
balance_table$difference_Z1_minus_Z0 <- balance_table$mean_Z1 - balance_table$mean_Z0
print(balance_table)
cat("\n")

cat("Placebo outcome test: placebo_y should not be affected by Z after design covariates.\n")
placebo_fit <- lm(placebo_y ~ Z + X1 + X2, data = df)
print(lmtest::coeftest(placebo_fit, vcov = sandwich::vcovHC(placebo_fit, type = "HC1")))
cat("\n")

# ---------------------------------------------------------------------
# 7. Simple Anderson-Rubin-style test for H0: beta = beta0.
#    For a candidate beta0, regress Y - beta0*D on Z and X; test Z coefficient.
#    With one instrument, this is a simple robust Wald/t test for the excluded instrument.
# ---------------------------------------------------------------------
ar_test <- function(beta0) {
  y_tilde <- df$Y - beta0 * df$D
  ar_fit <- lm(y_tilde ~ Z + X1 + X2, data = df)
  out <- lmtest::coeftest(ar_fit, vcov = sandwich::vcovHC(ar_fit, type = "HC1"))
  data.frame(
    beta0 = beta0,
    z_coef = out["Z", "Estimate"],
    z_se = out["Z", "Std. Error"],
    z_t = out["Z", "t value"],
    p_value = out["Z", "Pr(>|t|)"]
  )
}

iv_beta <- coef(iv_fit)["D"]
cat("Anderson-Rubin-style tests for beta0 = 0 and beta0 = IV estimate:\n")
print(rbind(ar_test(0), ar_test(iv_beta)))
cat("\n")

# ---------------------------------------------------------------------
# 8. First-stage visualization.
# ---------------------------------------------------------------------
plot_obj <- ggplot(df, aes(x = factor(Z), y = D)) +
  geom_boxplot() +
  labs(
    x = "Instrument Z",
    y = "Endogenous treatment D",
    title = "First-stage relationship: treatment by instrument"
  )

print(plot_obj)

cat("\nInterpretation reminder:\n")
cat("The IV estimate is causal only under relevance, independence, exclusion, monotonicity/constant-effect assumptions as needed, consistency, and no interference.\n")
cat("If D is binary and Z is binary, the target is usually a LATE/CACE for compliers, not an ATE.\n")
