# scripts/R/ivreg_fixest_template.R
# Reusable template for classical instrumental variables in R.
#
# Replace the variable names below:
#   Y: outcome
#   D: endogenous treatment/exposure
#   Z: excluded instrument
#   X1, X2: pre-treatment covariates
#   cluster_id: optional cluster variable
#
# Install manually if needed:
#   install.packages(c("ivreg", "fixest", "lmtest", "sandwich"))

required <- c("ivreg", "fixest", "lmtest", "sandwich")
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
library(fixest)
library(lmtest)
library(sandwich)

# ---------------------------------------------------------------------
# USER INPUT SECTION
# ---------------------------------------------------------------------
# df <- read.csv("your_data.csv")
# Required columns: Y, D, Z, X1, X2
# Optional columns: cluster_id, fixed_effect_group
#
# outcome <- "Y"
# treatment <- "D"
# instrument <- "Z"
# covariates <- c("X1", "X2")
# cluster <- NULL  # e.g., "cluster_id"
# fixed_effect <- NULL  # e.g., "site_id"

# For demonstration, create a small synthetic dataset if df is not supplied.
if (!exists("df")) {
  set.seed(202608)
  n <- 1000
  X1 <- rnorm(n)
  X2 <- rbinom(n, 1, 0.4)
  Z <- rbinom(n, 1, plogis(0.1 * X1 - 0.1 * X2))
  U <- rnorm(n)
  D <- 0.8 * Z + 0.6 * X1 - 0.2 * X2 + 0.8 * U + rnorm(n)
  Y <- 1.5 * D + 0.7 * X1 - 0.3 * X2 + U + rnorm(n)
  cluster_id <- sample(1:50, n, replace = TRUE)
  df <- data.frame(Y, D, Z, X1, X2, cluster_id)
}

outcome <- "Y"
treatment <- "D"
instrument <- "Z"
covariates <- c("X1", "X2")
cluster <- "cluster_id"  # set to NULL if no clustering
fixed_effect <- NULL     # e.g. "site_id"

analysis_vars <- c(outcome, treatment, instrument, covariates, cluster, fixed_effect)
analysis_vars <- analysis_vars[!is.na(analysis_vars) & !vapply(analysis_vars, is.null, logical(1))]
df_iv <- na.omit(df[, unique(analysis_vars)])
cat("Analysis N:", nrow(df_iv), "\n\n")

# ---------------------------------------------------------------------
# Formula construction.
# ivreg syntax: Y ~ D + X1 + X2 | Z + X1 + X2
# fixest IV syntax without FE: Y ~ X1 + X2 | D ~ Z
# fixest IV syntax with FE:    Y ~ X1 + X2 | FE | D ~ Z
# ---------------------------------------------------------------------
x_rhs <- paste(c(treatment, covariates), collapse = " + ")
z_rhs <- paste(c(instrument, covariates), collapse = " + ")
ivreg_formula <- as.formula(sprintf("%s ~ %s | %s", outcome, x_rhs, z_rhs))

# ---------------------------------------------------------------------
# First stage and reduced form.
# ---------------------------------------------------------------------
fs_formula <- as.formula(sprintf("%s ~ %s + %s", treatment, instrument, paste(covariates, collapse = " + ")))
rf_formula <- as.formula(sprintf("%s ~ %s + %s", outcome, instrument, paste(covariates, collapse = " + ")))

fs_fit <- lm(fs_formula, data = df_iv)
fs_restricted <- lm(as.formula(sprintf("%s ~ %s", treatment, paste(covariates, collapse = " + "))), data = df_iv)
rf_fit <- lm(rf_formula, data = df_iv)

fs_ct <- lmtest::coeftest(fs_fit, vcov = sandwich::vcovHC(fs_fit, type = "HC1"))
rf_ct <- lmtest::coeftest(rf_fit, vcov = sandwich::vcovHC(rf_fit, type = "HC1"))

fs_coef <- fs_ct[instrument, "Estimate"]
fs_t <- fs_ct[instrument, "t value"]
partial_r2 <- 1 - sum(resid(fs_fit)^2) / sum(resid(fs_restricted)^2)

cat("First stage with HC1 robust SEs:\n")
print(fs_ct)
cat(sprintf("Partial R^2 for %s: %.4f\n", instrument, partial_r2))
cat(sprintf("Robust first-stage F-like statistic for one excluded instrument: %.2f\n\n", fs_t^2))

cat("Reduced form with HC1 robust SEs:\n")
print(rf_ct)
cat(sprintf("Wald ratio, reduced form / first stage: %.4f\n\n", rf_ct[instrument, "Estimate"] / fs_coef))

# ---------------------------------------------------------------------
# ivreg 2SLS.
# ---------------------------------------------------------------------
iv_fit <- ivreg::ivreg(ivreg_formula, data = df_iv)

cat("ivreg diagnostics; includes weak-instrument, Wu-Hausman, and Sargan when applicable:\n")
print(summary(iv_fit, diagnostics = TRUE))
cat("\n")

cat("ivreg with HC1 robust SEs:\n")
print(lmtest::coeftest(iv_fit, vcov = sandwich::vcovHC(iv_fit, type = "HC1")))
cat("\n")

# ---------------------------------------------------------------------
# fixest IV, especially useful for fixed effects and clustering.
# ---------------------------------------------------------------------
if (is.null(fixed_effect)) {
  fixest_formula <- as.formula(sprintf(
    "%s ~ %s | %s ~ %s",
    outcome,
    paste(covariates, collapse = " + "),
    treatment,
    instrument
  ))
} else {
  fixest_formula <- as.formula(sprintf(
    "%s ~ %s | %s | %s ~ %s",
    outcome,
    paste(covariates, collapse = " + "),
    fixed_effect,
    treatment,
    instrument
  ))
}

if (is.null(cluster)) {
  fe_iv <- fixest::feols(fixest_formula, data = df_iv, vcov = "hetero")
} else {
  fe_iv <- fixest::feols(fixest_formula, data = df_iv, vcov = as.formula(paste0("~", cluster)))
}

cat("fixest IV result:\n")
print(fe_iv)
cat("\n")

cat("fixest first stage:\n")
print(summary(fe_iv, stage = 1))
cat("\n")

cat("fixest first/second stage table:\n")
print(fixest::etable(summary(fe_iv, stage = 1:2), fitstat = ~ . + ivfall + ivwaldall.p))
cat("\n")

cat("Interpretation reminder: IV validity requires relevance, independence, exclusion, and for LATE monotonicity.\n")
cat("A strong first stage does not prove exclusion or independence. LATE is not automatically ATE.\n")
