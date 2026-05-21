# Longitudinal modified treatment policy template.
# Check the installed lmtp version and adjust argument names if needed.

library(readr)
library(lmtp)
library(SuperLearner)

dat <- read_csv("longitudinal_wide.csv")

# Expected wide-format columns for a two-time example:
# baseline_x
# a_0, l1_1, l2_1, c_1
# a_1, l1_2, l2_2, c_2
# y

shift_down_if_possible <- function(data, trt) {
  pmax(data[[trt]] - 1, 0)
}

fit <- lmtp_tmle(
  data = dat,
  trt = c("a_0", "a_1"),
  outcome = "y",
  time_vary = list(c("l1_1", "l2_1"), c("l1_2", "l2_2")),
  cens = c("c_1", "c_2"),
  baseline = "baseline_x",
  shift = shift_down_if_possible,
  folds = 5,
  learners_trt = c("SL.glm", "SL.glmnet"),
  learners_outcome = c("SL.glm", "SL.ranger")
)

summary(fit)
saveRDS(fit, "lmtp_tmle_fit.rds")
