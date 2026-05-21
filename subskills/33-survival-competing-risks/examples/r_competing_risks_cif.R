# Competing-risk cumulative incidence and Fine-Gray template.
# Replace column names and event codes before use.

library(readr)
library(cmprsk)

dat <- read_csv("analysis_competing_risk_dataset.csv")

# Required columns:
# time: follow-up time from valid time zero
# event_type: 0 censored, 1 event of interest, 2+ competing events
# a: treatment/exposure or group
# x1, x2: approved baseline covariates if regression is used

cif <- cuminc(
  ftime = dat$time,
  fstatus = dat$event_type,
  group = dat$a,
  cencode = 0
)

fg <- crr(
  ftime = dat$time,
  fstatus = dat$event_type,
  cov1 = as.matrix(dat[, c("a", "x1", "x2")]),
  failcode = 1,
  cencode = 0
)

sink("competing_risks_summary.txt")
print(cif)
print(summary(fg))
sink()

saveRDS(list(cif = cif, fine_gray = fg), "competing_risks_fit.rds")
