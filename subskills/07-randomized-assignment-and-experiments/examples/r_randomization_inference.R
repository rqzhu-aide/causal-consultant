# Randomization inference for a simple or blocked randomized experiment.
# Replace paths and variable names before use.

library(readr)
library(randomizr)
library(ri2)

dat <- read_csv("analysis_dataset.csv")

# y: outcome
# z: assigned treatment, 0/1
# block_id: optional block variable used in the original randomization

declaration <- declare_ra(
  blocks = dat$block_id,
  m_each = table(dat$block_id, dat$z == 1)[, "TRUE"]
)

ri_result <- conduct_ri(
  formula = y ~ z,
  declaration = declaration,
  assignment = "z",
  sharp_hypothesis = 0,
  data = dat
)

print(summary(ri_result))
saveRDS(ri_result, "randomization_inference_result.rds")
