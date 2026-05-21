# Matching, weighting, and balance diagnostics for a binary treatment.

library(readr)
library(MatchIt)
library(WeightIt)
library(cobalt)
library(survey)
library(modelsummary)

dat <- read_csv("analysis_dataset.csv")

# Expected columns:
# y: outcome
# a: treatment/exposure, 0/1
# x1, x2, x3: pre-treatment covariates selected by method_lead

ps_formula <- a ~ x1 + x2 + x3

match_fit <- matchit(
  ps_formula,
  data = dat,
  method = "nearest",
  estimand = "ATT",
  ratio = 1,
  caliper = 0.2,
  std.caliper = TRUE
)

weight_fit <- weightit(
  ps_formula,
  data = dat,
  method = "glm",
  estimand = "ATO"
)

bal_match <- bal.tab(match_fit, un = TRUE)
bal_weight <- bal.tab(weight_fit, un = TRUE)

png("balance_love_plot.png", width = 1400, height = 900, res = 180)
love.plot(
  list(Matching_ATT = match_fit, Weighting_ATO = weight_fit),
  stats = "mean.diffs",
  threshold = 0.1,
  abs = TRUE
)
dev.off()

matched_dat <- match.data(match_fit)
match_model <- lm(y ~ a + x1 + x2 + x3, data = matched_dat, weights = weights)

dat$w_ato <- weight_fit$weights
design <- svydesign(ids = ~1, weights = ~w_ato, data = dat)
weight_model <- svyglm(y ~ a, design = design)

modelsummary(
  list("Matched ATT" = match_model, "Weighted ATO" = weight_model),
  output = "matched_weighted_outcome_table.md"
)

saveRDS(bal_match, "balance_matchit.rds")
saveRDS(bal_weight, "balance_weightit.rds")
