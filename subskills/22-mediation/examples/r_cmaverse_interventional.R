# Template: CMAverse mediation workflow.
# Useful for broader causal mediation workflows, including sensitivity support.

library(CMAverse)

fit <- cmest(
  data = df,
  model = "rb",
  outcome = "Y",
  exposure = "A",
  mediator = "M",
  basec = c("C1", "C2"),
  EMint = TRUE,
  mreg = list("linear"),
  yreg = "linear",
  astar = 0,
  a = 1,
  mval = list(0),
  estimation = "imputation",
  inference = "bootstrap",
  nboot = 200
)

summary(fit)

# Use cmdag() before estimation when a mediation DAG needs to be displayed/audited.
# Use cmsens() when unmeasured mediator-outcome confounding sensitivity is required.
