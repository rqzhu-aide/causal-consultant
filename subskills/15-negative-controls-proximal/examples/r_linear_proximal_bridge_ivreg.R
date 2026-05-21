# Linear proximal outcome-bridge sketch.
# This is a transparent benchmark, not generic proof of proximal identification.

library(ivreg)

df <- read.csv("analysis_dataset.csv")

# Roles:
# A = treatment, Y = outcome, W = outcome confounding proxy,
# Z = treatment confounding proxy, X = measured covariates.
# Linear outcome bridge h(A, W, X) estimated with Z as an instrument-like proxy.

fit <- ivreg(
  outcome ~ treatment + outcome_proxy + age + baseline_risk |
    treatment + treatment_proxy + age + baseline_risk,
  data = df
)

summary(fit, diagnostics = TRUE)

# In this simple linear bridge sketch, the treatment coefficient is the
# target contrast under the chosen bridge assumptions.
coef(fit)["treatment"]
