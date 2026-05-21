# Template: prespecified subgroup or interaction analysis.
# Good for transparent, confirmatory GATE-style reporting when groups are meaningful.

library(sandwich)
library(lmtest)

outcome_col <- "outcome"
treatment_col <- "treatment"
group_col <- "subgroup"
covariates <- c("c1", "c2", "c3")

formula_text <- paste(
  outcome_col,
  "~",
  paste(c(paste0(treatment_col, " * ", group_col), covariates), collapse = " + ")
)

fit <- lm(as.formula(formula_text), data = df)
print(coeftest(fit, vcov = vcovHC(fit, type = "HC3")))

# Crude subgroup support checks before interpreting interactions.
support <- with(df, table(df[[group_col]], df[[treatment_col]], useNA = "ifany"))
print(support)

# For nonlinear outcomes or marginal contrasts, use marginal standardization
# via marginaleffects/emmeans after confirming the estimand scale.
