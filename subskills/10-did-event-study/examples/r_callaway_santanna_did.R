# Callaway-Sant'Anna group-time ATT template.
# Replace column names and file paths before use.

library(readr)
library(did)

dat <- read_csv("analysis_did_panel.csv")

# Required columns:
# id: unit id
# time: time period
# y: outcome
# g: first treated period; 0 for never treated
# x1, x2: approved pre-treatment or correctly time-ordered covariates

attgt <- att_gt(
  yname = "y",
  tname = "time",
  idname = "id",
  gname = "g",
  xformla = ~ x1 + x2,
  data = dat,
  panel = TRUE,
  control_group = "notyettreated",
  anticipation = 0,
  est_method = "dr",
  bstrap = TRUE,
  cband = TRUE,
  clustervars = "id"
)

dynamic <- aggte(attgt, type = "dynamic")
overall <- aggte(attgt, type = "group")

write.csv(dynamic$egt, "did_dynamic_event_time.csv", row.names = FALSE)
capture.output(summary(dynamic), file = "did_dynamic_summary.txt")
capture.output(summary(overall), file = "did_group_summary.txt")
saveRDS(list(attgt = attgt, dynamic = dynamic, overall = overall), "did_callaway_santanna_fit.rds")
