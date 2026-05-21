# Template: continuous exposure support and GPS-style workflow with CausalGPS.
# Replace df, column names, and package parameters before running.

library(CausalGPS)

exposure_col <- "dose"
outcome_col <- "outcome"
covariates <- c("c1", "c2", "c3")

# Inspect dose support first.
hist(df[[exposure_col]], breaks = 40, main = "Dose distribution", xlab = exposure_col)

# CausalGPS APIs can change; use this as a scaffold, not drop-in production code.
gps_obj <- estimate_gps(
  .data = df,
  .formula = as.formula(paste(exposure_col, "~", paste(covariates, collapse = " + "))),
  gps_density = "normal"
)

# Continue with weighting/matching and balance diagnostics according to the
# current CausalGPS documentation and the selected target contrast or curve.
print(gps_obj)
