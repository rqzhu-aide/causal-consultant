# Adjusted survival curves template
# Candidate packages: survival, adjustedCurves, riskRegression, survtmle

library(survival)
library(adjustedCurves)

# Variables:
# time: follow-up time
# event: event indicator, 1 event, 0 censored
# A: treatment
# X1, X2, X3: pre-treatment covariates

cox_fit <- coxph(Surv(time, event) ~ A + X1 + X2 + X3, data = df, x = TRUE)

adj <- adjustedsurv(
  data = df,
  variable = "A",
  ev_time = "time",
  event = "event",
  method = "direct",
  outcome_model = cox_fit
)

plot(adj)

# Consider reporting survival probability differences at clinically meaningful times
# and RMST differences, not only hazard ratios.
