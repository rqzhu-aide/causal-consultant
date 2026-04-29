# scripts/R/doubleml_iv_template.R
# Reusable template for high-dimensional instrumental variables with DoubleML in R.
#
# Use this when IV identification is plausible and the nuisance relationships
# involving covariates X should be estimated flexibly with cross-fitting.
#
# Install manually if needed:
#   install.packages(c("DoubleML", "mlr3", "mlr3learners"))

required <- c("DoubleML", "mlr3", "mlr3learners")
missing <- required[!vapply(required, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing) > 0) {
  stop(
    "Missing packages: ", paste(missing, collapse = ", "),
    "\nInstall with: install.packages(c(",
    paste(sprintf('"%s"', missing), collapse = ", "),
    "))"
  )
}

library(DoubleML)
library(mlr3)
library(mlr3learners)

set.seed(202610)

# ---------------------------------------------------------------------
# USER INPUT SECTION
# ---------------------------------------------------------------------
# df <- read.csv("your_data.csv")
# outcome <- "Y"
# treatment <- "D"
# instrument <- "Z"
# x_cols <- c("X1", "X2", ...)

if (!exists("df")) {
  n <- 1000
  p <- 10
  X <- matrix(rnorm(n * p), nrow = n)
  colnames(X) <- paste0("X", seq_len(p))
  Z <- 0.6 * X[, 1] - 0.3 * X[, 2] + rnorm(n)
  U <- rnorm(n)
  D <- 0.9 * Z + sin(X[, 1]) + 0.4 * X[, 2]^2 + 0.8 * U + rnorm(n)
  Y <- 1.25 * D + cos(X[, 1]) + X[, 2] * X[, 3] + U + rnorm(n)
  df <- data.frame(Y = Y, D = D, Z = Z, X)
}

outcome <- "Y"
treatment <- "D"
instrument <- "Z"
x_cols <- setdiff(names(df), c(outcome, treatment, instrument))

df_iv <- na.omit(df[, c(outcome, treatment, instrument, x_cols)])
cat("Analysis N:", nrow(df_iv), "\n")
cat("Number of covariates:", length(x_cols), "\n\n")

obj_dml_data <- DoubleMLData$new(
  df_iv,
  y_col = outcome,
  d_cols = treatment,
  z_cols = instrument,
  x_cols = x_cols
)

# Linear learners are a transparent starting point.
# Replace with random forest, gradient boosting, glmnet, etc. after checking runtime and tuning.
ml_l <- lrn("regr.lm")  # E[Y | X]
ml_m <- lrn("regr.lm")  # E[Z | X]
ml_r <- lrn("regr.lm")  # E[D | X]

pliv <- DoubleMLPLIV$new(obj_dml_data, ml_l = ml_l, ml_m = ml_m, ml_r = ml_r, n_folds = 5)
pliv$fit()

cat("DoubleML PLIV summary:\n")
print(pliv$summary)
cat("\nConfidence intervals:\n")
print(pliv$confint())

cat("\nInterpretation reminder:\n")
cat("IV-DML helps estimate nuisance functions with cross-fitting; it does not validate the instrument.\n")
cat("You still need relevance, independence, exclusion, and an appropriate IV estimand.\n")
