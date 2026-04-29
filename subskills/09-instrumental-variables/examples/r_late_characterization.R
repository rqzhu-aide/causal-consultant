# r_late_characterization.R
# Self-contained example for binary-instrument/binary-treatment LATE/CACE
# and simple complier characterization.
#
# Install manually if needed:
#   install.packages(c("ivreg", "lmtest", "sandwich"))

required <- c("ivreg", "lmtest", "sandwich")
missing <- required[!vapply(required, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing) > 0) {
  stop(
    "Missing packages: ", paste(missing, collapse = ", "),
    "\nInstall with: install.packages(c(",
    paste(sprintf('"%s"', missing), collapse = ", "),
    "))"
  )
}

library(ivreg)
library(lmtest)
library(sandwich)

set.seed(202607)

# ---------------------------------------------------------------------
# 1. Synthetic imperfect-compliance / encouragement design.
# ---------------------------------------------------------------------
n <- 5000
X_age <- rnorm(n, mean = 50, sd = 12)
X_high_risk <- rbinom(n, 1, 0.35)

# Randomized encouragement/assignment.
Z <- rbinom(n, 1, 0.5)

# Compliance type probabilities depend on covariates.
# This is for simulation only. In real data, compliance type is latent.
p_complier <- plogis(-0.3 + 0.02 * (X_age - 50) + 0.8 * X_high_risk)
p_always <- plogis(-2.2 + 0.4 * X_high_risk)
p_never <- 1 - p_complier - p_always
p_never <- pmax(p_never, 0.05)

# Normalize probabilities.
den <- p_complier + p_always + p_never
p_complier <- p_complier / den
p_always <- p_always / den
p_never <- p_never / den

u <- runif(n)
type <- ifelse(u < p_always, "always",
  ifelse(u < p_always + p_complier, "complier", "never")
)

# Treatment received: always-takers receive regardless; compliers receive only if Z=1.
D <- ifelse(type == "always", 1, ifelse(type == "complier" & Z == 1, 1, 0))

# Outcome with treatment effect 1.2 among all types for simplicity.
Y <- 2 + 1.2 * D + 0.03 * X_age + 0.8 * X_high_risk + rnorm(n)

df <- data.frame(Y, D, Z, X_age, X_high_risk, type)
df <- na.omit(df)

# ---------------------------------------------------------------------
# 2. ITT, first stage, Wald/LATE.
# ---------------------------------------------------------------------
itt <- mean(df$Y[df$Z == 1]) - mean(df$Y[df$Z == 0])
first_stage <- mean(df$D[df$Z == 1]) - mean(df$D[df$Z == 0])
wald_late <- itt / first_stage

cat(sprintf("ITT effect of assignment Z on outcome Y: %.4f\n", itt))
cat(sprintf("First stage, effect of Z on treatment D: %.4f\n", first_stage))
cat(sprintf("Wald LATE/CACE estimate: %.4f\n\n", wald_late))

# 2SLS version with covariates.
iv_fit <- ivreg(Y ~ D + X_age + X_high_risk | Z + X_age + X_high_risk, data = df)
cat("2SLS CACE/LATE with covariates and HC1 robust SEs:\n")
print(lmtest::coeftest(iv_fit, vcov = sandwich::vcovHC(iv_fit, type = "HC1")))
cat("\n")

# ---------------------------------------------------------------------
# 3. Complier share and covariate characterization.
# Under monotonicity, P(complier) = E[D|Z=1] - E[D|Z=0].
# For covariate X:
#   E[X | complier] = {E[XD | Z=1] - E[XD | Z=0]} / P(complier)
# ---------------------------------------------------------------------
p_hat_c <- first_stage
cat(sprintf("Estimated complier share: %.4f\n\n", p_hat_c))

complier_mean <- function(x, d, z) {
  (mean(x[z == 1] * d[z == 1]) - mean(x[z == 0] * d[z == 0])) /
    (mean(d[z == 1]) - mean(d[z == 0]))
}

char_table <- data.frame(
  covariate = c("X_age", "X_high_risk"),
  overall_mean = c(mean(df$X_age), mean(df$X_high_risk)),
  estimated_complier_mean = c(
    complier_mean(df$X_age, df$D, df$Z),
    complier_mean(df$X_high_risk, df$D, df$Z)
  )
)

# Because this is simulated, we can also show the true complier mean as a check.
char_table$true_complier_mean_in_simulation <- c(
  mean(df$X_age[df$type == "complier"]),
  mean(df$X_high_risk[df$type == "complier"])
)

cat("Complier characterization:\n")
print(char_table)
cat("\n")

cat("Compliance-type counts are shown only because this is simulated data:\n")
print(table(df$type))
cat("\n")

cat("Interpretation reminder:\n")
cat("The estimate is a CACE/LATE for compliers whose treatment receipt is changed by Z.\n")
cat("It is not automatically the ATE for always-takers, never-takers, or the full population.\n")
