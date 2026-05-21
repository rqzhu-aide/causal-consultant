# Template: regression-based causal mediation with regmedint.
# Good for common closed-form epidemiologic mediation models.

library(regmedint)

fit <- regmedint(
  data = df,
  yvar = "Y",
  avar = "A",
  mvar = "M",
  cvar = c("C1", "C2"),
  a0 = 0,
  a1 = 1,
  m_cde = 0,
  c_cond = c(C1 = 0, C2 = 0),
  mreg = "linear",
  yreg = "linear",
  interaction = TRUE
)

summary(fit)

# Change mreg/yreg and c_cond to match mediator/outcome type and target population.
