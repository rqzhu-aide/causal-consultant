# Entropy balancing with balance diagnostics.

library(readr)
library(WeightIt)
library(cobalt)
library(survey)

dat <- read_csv("analysis_dataset.csv")

# y: outcome
# a: treatment/exposure, 0/1
# x1, x2, x3: pre-treatment covariates

entropy_weights <- weightit(
  a ~ x1 + x2 + x3,
  data = dat,
  method = "ebal",
  estimand = "ATT"
)

bal <- bal.tab(entropy_weights, un = TRUE, disp.v.ratio = TRUE)
print(bal)

dat$w <- entropy_weights$weights
design <- svydesign(ids = ~1, weights = ~w, data = dat)
fit <- svyglm(y ~ a, design = design)
print(summary(fit))

png("entropy_balance_love_plot.png", width = 1400, height = 900, res = 180)
love.plot(entropy_weights, stats = "mean.diffs", threshold = 0.1, abs = TRUE)
dev.off()

saveRDS(entropy_weights, "entropy_weightit_fit.rds")
