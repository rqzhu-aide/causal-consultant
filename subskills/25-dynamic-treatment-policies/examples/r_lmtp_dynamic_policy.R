# Template: longitudinal modified treatment policy with lmtp.
# Replace node names, histories, learners, and shift function before running.

library(lmtp)

shift_policy <- function(data, trt) {
  # Example: reduce treatment intensity by one unit when possible.
  pmax(data[[trt]] - 1, 0)
}

fit <- lmtp_tmle(
  data = long_df,
  trt = c("A_0", "A_1", "A_2"),
  outcome = "Y",
  baseline = c("W1", "W2"),
  time_vary = list(c("L_0"), c("L_1"), c("L_2")),
  shift = shift_policy,
  learners_outcome = "SL.glm",
  learners_trt = "SL.glm"
)

summary(fit)

# Report this as an LMTP/feasible shift, not a universal fixed regime.
