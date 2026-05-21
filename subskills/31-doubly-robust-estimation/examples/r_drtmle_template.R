# drtmle template for doubly robust treatment effect estimation.

library(readr)
library(drtmle)

dat <- read_csv("analysis_dataset.csv")

# y: outcome
# a: treatment/exposure, 0/1
# x1, x2, x3: approved pre-treatment confounders

w <- dat[, c("x1", "x2", "x3")]

fit <- drtmle(
  W = w,
  A = dat$a,
  Y = dat$y,
  family = gaussian(),
  SL_Qrnr = c("SL.glm", "SL.glmnet", "SL.ranger"),
  SL_grnr = c("SL.glm", "SL.glmnet", "SL.ranger")
)

print(fit)
saveRDS(fit, "drtmle_fit.rds")
