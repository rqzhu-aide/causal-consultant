# Simple AIPW template for a binary point treatment.
# Use this as a transparent prototype, not a substitute for the DR/TMLE subskill.

library(readr)
library(dplyr)
library(SuperLearner)

dat <- read_csv("analysis_dataset.csv")

# Expected columns:
# y: outcome
# a: exposure/treatment, 0/1
# x1, x2, x3: baseline confounders

w <- dat %>% select(x1, x2, x3)
y <- dat$y
a <- dat$a

g_fit <- SuperLearner(
  Y = a,
  X = w,
  family = binomial(),
  SL.library = c("SL.glm", "SL.glmnet", "SL.ranger")
)
g_hat <- pmin(pmax(predict(g_fit, newdata = w)$pred, 0.01), 0.99)

q0_fit <- SuperLearner(
  Y = y[a == 0],
  X = w[a == 0, ],
  family = gaussian(),
  SL.library = c("SL.mean", "SL.glm", "SL.glmnet", "SL.ranger")
)
q1_fit <- SuperLearner(
  Y = y[a == 1],
  X = w[a == 1, ],
  family = gaussian(),
  SL.library = c("SL.mean", "SL.glm", "SL.glmnet", "SL.ranger")
)

q0 <- predict(q0_fit, newdata = w)$pred
q1 <- predict(q1_fit, newdata = w)$pred

psi_i <- q1 - q0 + a * (y - q1) / g_hat - (1 - a) * (y - q0) / (1 - g_hat)
ate <- mean(psi_i)
se <- sd(psi_i) / sqrt(length(psi_i))

result <- tibble(
  estimand = "ATE",
  estimate = ate,
  std_error = se,
  ci_low = ate - 1.96 * se,
  ci_high = ate + 1.96 * se
)

write_csv(result, "observational_aipw_result.csv")
