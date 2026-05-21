# Point-treatment TMLE template.

library(readr)
library(tmle)

dat <- read_csv("analysis_dataset.csv")

# y: bounded or binary outcome
# a: treatment/exposure, 0/1
# x1, x2, x3: approved pre-treatment confounders

w <- dat[, c("x1", "x2", "x3")]

fit <- tmle(
  Y = dat$y,
  A = dat$a,
  W = w,
  family = "gaussian",
  Q.SL.library = c("SL.glm", "SL.glmnet", "SL.ranger"),
  g.SL.library = c("SL.glm", "SL.glmnet", "SL.ranger"),
  gbounds = c(0.01, 0.99)
)

summary(fit)
saveRDS(fit, "tmle_fit.rds")
