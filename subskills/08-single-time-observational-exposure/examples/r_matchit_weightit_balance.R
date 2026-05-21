# Observational point exposure: matching, weighting, and balance diagnostics.
# Replace paths and variable names before use.

library(readr)
library(dplyr)
library(MatchIt)
library(WeightIt)
library(cobalt)
library(survey)
library(modelsummary)

dat <- read_csv("analysis_dataset.csv")

# Expected columns:
# y: outcome
# a: exposure/treatment, 0/1
# x1, x2, x3: baseline confounders measured before exposure

covariate_formula <- a ~ x1 + x2 + x3

matched <- matchit(
  covariate_formula,
  data = dat,
  method = "nearest",
  estimand = "ATT",
  ratio = 1
)

weighted <- weightit(
  covariate_formula,
  data = dat,
  method = "glm",
  estimand = "ATE"
)

balance_matched <- bal.tab(matched, un = TRUE)
balance_weighted <- bal.tab(weighted, un = TRUE)

love.plot(
  list(Matching = matched, Weighting = weighted),
  stats = "mean.diffs",
  threshold = 0.1,
  abs = TRUE
)
ggsave("observational_balance_love_plot.png", width = 8, height = 5, dpi = 300)

matched_data <- match.data(matched)
att_model <- lm(y ~ a + x1 + x2 + x3, data = matched_data, weights = weights)

design <- svydesign(ids = ~1, weights = ~weighted$weights, data = dat)
ate_model <- svyglm(y ~ a, design = design)

modelsummary(
  list("Matched ATT" = att_model, "Weighted ATE" = ate_model),
  output = "observational_matching_weighting_table.md"
)

saveRDS(balance_matched, "balance_matched.rds")
saveRDS(balance_weighted, "balance_weighted.rds")
