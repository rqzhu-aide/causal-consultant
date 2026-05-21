# Synthetic DiD template for aggregate/few-treated-unit panel data.
# Coordinate with 13-synthetic-control-time-series when donor-pool fit is central.

library(readr)
library(synthdid)

dat <- read_csv("analysis_synthdid_panel.csv")

# Required columns:
# unit: unit id
# time: time period
# y: outcome
# treated: 1 once treated, 0 otherwise

setup <- panel.matrices(dat, unit = "unit", time = "time", outcome = "y", treatment = "treated")
tau_hat <- synthdid_estimate(setup$Y, setup$N0, setup$T0)
se <- sqrt(vcov(tau_hat, method = "placebo"))

capture.output(summary(tau_hat), file = "synthdid_summary.txt")
write.csv(data.frame(estimate = as.numeric(tau_hat), std_error = se), "synthdid_estimate.csv", row.names = FALSE)
saveRDS(list(tau = tau_hat, setup = setup), "synthdid_fit.rds")
