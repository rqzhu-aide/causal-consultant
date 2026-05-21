# Template: modified treatment policy or shift intervention with lmtp.
# Replace node names and shift function before running.

library(lmtp)

shift_down <- function(data, trt) {
  pmax(data[[trt]] - 1, 0)
}

fit <- lmtp_tmle(
  data = df,
  trt = "dose",
  outcome = "outcome",
  baseline = c("c1", "c2", "c3"),
  shift = shift_down,
  learners_outcome = "SL.glm",
  learners_trt = "SL.glm"
)

summary(fit)

# Report this as the effect of the feasible modified treatment policy, not as
# the effect of setting everyone to one fixed unsupported dose.
