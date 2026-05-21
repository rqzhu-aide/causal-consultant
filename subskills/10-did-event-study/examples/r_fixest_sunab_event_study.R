# Sun-Abraham style event study with fixest::sunab.
# Use for staggered adoption when event-study dynamics are needed.

library(readr)
library(fixest)

dat <- read_csv("analysis_did_panel.csv")

# Required columns:
# id: unit id
# time: time period
# y: outcome
# cohort: first treated period; use Inf or NA for never treated depending on data prep
# x1, x2: approved pre-treatment or time-ordered covariates

fit <- feols(
  y ~ sunab(cohort, time, ref.p = -1) + x1 + x2 | id + time,
  data = dat,
  cluster = ~ id
)

event_table <- etable(fit)
agg_att <- aggregate(fit, agg = "att")
agg_period <- aggregate(fit, agg = "period")

write.csv(as.data.frame(event_table), "fixest_sunab_event_table.csv", row.names = FALSE)
capture.output(summary(fit), file = "fixest_sunab_summary.txt")
capture.output(agg_att, file = "fixest_sunab_aggregate_att.txt")
capture.output(agg_period, file = "fixest_sunab_event_time_aggregate.txt")
saveRDS(list(fit = fit, aggregate_att = agg_att, aggregate_period = agg_period), "fixest_sunab_fit.rds")
