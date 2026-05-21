# Synthetic difference-in-differences.
# Coordinate with 10-did-event-study for estimand and DiD assumptions.

library(readr)
library(synthdid)

dat <- read_csv("analysis_synthdid_panel.csv")

# Required columns:
# unit, time, y, treated

setup <- panel.matrices(dat, unit = "unit", time = "time", outcome = "y", treatment = "treated")
tau_hat <- synthdid_estimate(setup$Y, setup$N0, setup$T0)
se_placebo <- sqrt(vcov(tau_hat, method = "placebo"))

write.csv(data.frame(estimate = as.numeric(tau_hat), std_error = se_placebo), "synthdid_estimate.csv", row.names = FALSE)
capture.output(summary(tau_hat), file = "synthdid_summary.txt")
saveRDS(list(tau = tau_hat, setup = setup), "synthdid_fit.rds")
