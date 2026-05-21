# Negative control outcome diagnostic using the primary adjustment strategy.
# Replace column names and paths before use.

library(dplyr)
library(fixest)

df <- read.csv("analysis_dataset.csv")

primary <- feols(
  primary_outcome ~ treatment + age + baseline_risk + prior_utilization,
  data = df,
  vcov = "HC1"
)

negative_control <- feols(
  negative_control_outcome ~ treatment + age + baseline_risk + prior_utilization,
  data = df,
  vcov = "HC1"
)

etable(primary, negative_control)

diagnostic <- tibble(
  model = c("primary_outcome", "negative_control_outcome"),
  estimate = c(coef(primary)["treatment"], coef(negative_control)["treatment"]),
  se = c(se(primary)["treatment"], se(negative_control)["treatment"])
)

write.csv(diagnostic, "negative_control_outcome_diagnostic.csv", row.names = FALSE)
