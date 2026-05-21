# Weighted survival curves and RMST-style reporting.
# Replace column names and file paths before use.

library(readr)
library(dplyr)
library(survival)
library(survRM2)

dat <- read_csv("analysis_survival_dataset.csv")

# Required columns:
# time: follow-up time from valid time zero
# event: 1 event of interest, 0 censored
# a: treatment/exposure, coded 0/1
# weight: optional design/IPTW/transport weight

tau <- 365

fit <- survfit(
  Surv(time, event) ~ a,
  data = dat,
  weights = weight
)

summary_at_tau <- summary(fit, times = tau)

rmst <- rmst2(
  time = dat$time,
  status = dat$event,
  arm = dat$a,
  tau = tau
)

cox_weighted <- coxph(
  Surv(time, event) ~ a,
  data = dat,
  weights = weight,
  robust = TRUE
)

write.csv(
  data.frame(
    strata = summary_at_tau$strata,
    time = summary_at_tau$time,
    survival = summary_at_tau$surv,
    lower = summary_at_tau$lower,
    upper = summary_at_tau$upper
  ),
  "weighted_survival_at_tau.csv",
  row.names = FALSE
)

saveRDS(
  list(
    survfit = fit,
    rmst = rmst,
    cox_weighted = cox_weighted,
    tau = tau
  ),
  "weighted_survival_rmst_fit.rds"
)
