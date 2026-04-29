# CausalImpact template
# Required packages: CausalImpact, zoo or xts

library(CausalImpact)

# data_ts should contain treated outcome as first column and unaffected control series as other columns.
# Rows must be ordered time points.
# Define pre.period and post.period using row indices or time labels.

pre.period <- c(1, 100)
post.period <- c(101, 130)

impact <- CausalImpact(data_ts, pre.period, post.period)
summary(impact)
summary(impact, "report")
plot(impact)

# Critical assumptions:
# - controls are not affected by intervention
# - treated-control relationship learned in pre-period remains stable
# - no concurrent shock uniquely affects treated series
