# AIPW estimate for a binary point treatment with Super Learner nuisance models.

library(readr)
library(dplyr)
library(SuperLearner)

dat <- read_csv("analysis_dataset.csv")

# Expected columns:
# y: outcome
# a: treatment/exposure, 0/1
# x1, x2, x3: approved pre-treatment confounders

w <- dat %>% select(x1, x2, x3)
y <- dat$y
a <- dat$a

learners <- c("SL.mean", "SL.glm", "SL.glmnet", "SL.ranger")

g_fit <- SuperLearner(Y = a, X = w, family = binomial(), SL.library = learners)
g_hat <- pmin(pmax(predict(g_fit, newdata = w)$pred, 0.01), 0.99)

q1_fit <- SuperLearner(Y = y[a == 1], X = w[a == 1, ], family = gaussian(), SL.library = learners)
q0_fit <- SuperLearner(Y = y[a == 0], X = w[a == 0, ], family = gaussian(), SL.library = learners)

q1 <- predict(q1_fit, newdata = w)$pred
q0 <- predict(q0_fit, newdata = w)$pred

ic <- q1 - q0 + a * (y - q1) / g_hat - (1 - a) * (y - q0) / (1 - g_hat)
ate <- mean(ic)
se <- sd(ic) / sqrt(length(ic))

result <- tibble(
  estimand = "ATE",
  estimate = ate,
  std_error = se,
  ci_low = ate - 1.96 * se,
  ci_high = ate + 1.96 * se,
  ic_mean = mean(ic - ate),
  ic_sd = sd(ic)
)

write_csv(result, "aipw_superlearner_result.csv")
write_csv(tibble(propensity = g_hat), "aipw_propensity_predictions.csv")
