# Partial-interference IPW sketch using inferference.
# Check package documentation and estimand definitions before production use.

library(inferference)

df <- read.csv("clustered_analysis_dataset.csv")

# Required formula shape:
# outcome | treatment ~ propensity covariates | cluster id
fit <- interference(
  outcome | treatment ~ age + baseline_risk + cluster_size | cluster_id,
  allocations = c(0.25, 0.50, 0.75),
  data = df,
  causal_estimation_method = "ipw",
  causal_estimation_options = list(variance_estimation = "robust")
)

print(fit)
print(direct_effect(fit))
print(indirect_effect(fit))
print(total_effect(fit))
print(overall_effect(fit))
