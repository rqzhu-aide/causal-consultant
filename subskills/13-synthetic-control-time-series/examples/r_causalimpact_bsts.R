# Bayesian structural time-series / CausalImpact template.
# Control time series must be unaffected by the intervention.

library(readr)
library(CausalImpact)

dat <- read_csv("analysis_causalimpact_timeseries.csv")

# Required columns ordered by time:
# y: treated response series
# x1, x2: unaffected control time series

pre_period <- c(1, 200)
post_period <- c(201, 260)

impact <- CausalImpact(
  data = dat[, c("y", "x1", "x2")],
  pre.period = pre_period,
  post.period = post_period,
  model.args = list(nseasons = 12)
)

capture.output(summary(impact), file = "causalimpact_summary.txt")
capture.output(summary(impact, "report"), file = "causalimpact_report.txt")
write.csv(impact$series, "causalimpact_series.csv", row.names = FALSE)
saveRDS(impact, "causalimpact_fit.rds")
