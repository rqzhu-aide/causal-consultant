# Classic synthetic control with Synth.
# Replace predictors, unit ids, time ids, and windows before use.

library(readr)
library(Synth)

dat <- read_csv("analysis_scm_panel.csv")

# Required columns:
# unit_id, unit_name, time, y, treated_unit_flag
# x1, x2: pre-treatment predictors

treated_id <- unique(dat$unit_id[dat$treated_unit_flag == 1])
controls <- unique(dat$unit_id[dat$treated_unit_flag == 0])
pre_period <- 2000:2010
post_period <- 2011:2020

dp <- dataprep(
  foo = dat,
  predictors = c("x1", "x2"),
  predictors.op = "mean",
  dependent = "y",
  unit.variable = "unit_id",
  unit.names.variable = "unit_name",
  time.variable = "time",
  treatment.identifier = treated_id,
  controls.identifier = controls,
  time.predictors.prior = pre_period,
  time.optimize.ssr = pre_period,
  time.plot = c(pre_period, post_period)
)

fit <- synth(dp)
tables <- synth.tab(dataprep.res = dp, synth.res = fit)

write.csv(tables$tab.w, "synth_donor_weights.csv", row.names = FALSE)
write.csv(tables$tab.pred, "synth_predictor_balance.csv", row.names = FALSE)
capture.output(fit, file = "synth_fit_summary.txt")
saveRDS(list(dataprep = dp, fit = fit, tables = tables), "synth_fit.rds")
