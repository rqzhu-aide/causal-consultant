# Template: parametric g-formula for sustained or dynamic strategies.
# Replace node names and interventions according to gfoRmula documentation.

library(gfoRmula)

# obs_data should be long format with id, time, treatment, covariates, outcome.
# This is a scaffold; exact arguments depend on covariate types and interventions.

fit <- gformula(
  obs_data = obs_data,
  id = "id",
  time_name = "time",
  outcome_name = "Y",
  outcome_type = "continuous_eof",
  covnames = c("L1", "L2"),
  covtypes = c("normal", "binary"),
  basecovs = c("baseline_age", "baseline_risk"),
  intvars = list("A", "A"),
  interventions = list(
    list(c(static, rep(0, max_time + 1))),
    list(c(static, rep(1, max_time + 1)))
  ),
  int_descript = c("Never treat", "Always treat")
)

print(fit)

# Add dynamic interventions after support checks and domain review.
