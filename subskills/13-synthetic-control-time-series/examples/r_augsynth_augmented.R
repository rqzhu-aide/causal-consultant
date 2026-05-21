# Augmented synthetic control.
# Use when classic SCM pre-fit is imperfect but donor structure remains credible.

library(readr)
library(augsynth)

dat <- read_csv("analysis_scm_panel.csv")

# Required columns:
# unit_id, time, y, treated

fit <- augsynth(
  y ~ treated,
  unit = unit_id,
  time = time,
  data = dat,
  progfunc = "Ridge",
  scm = TRUE
)

summary_fit <- summary(fit)

capture.output(summary_fit, file = "augsynth_summary.txt")
write.csv(as.data.frame(summary_fit$att), "augsynth_att.csv", row.names = FALSE)
saveRDS(fit, "augsynth_fit.rds")
