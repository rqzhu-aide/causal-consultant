# r_fixest_iv.R
# Self-contained instrumental-variables example using fixest.
#
# What this script demonstrates:
#   1. fixed-effect IV syntax in fixest
#   2. cluster-robust standard errors
#   3. first-stage extraction and IV fit statistics
#   4. comparison to naive fixed-effect OLS
#
# Install manually if needed:
#   install.packages("fixest")

required <- c("fixest")
missing <- required[!vapply(required, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing) > 0) {
  stop(
    "Missing packages: ", paste(missing, collapse = ", "),
    "\nInstall with: install.packages(c(",
    paste(sprintf('"%s"', missing), collapse = ", "),
    "))"
  )
}

library(fixest)

set.seed(202604)

# ---------------------------------------------------------------------
# 1. Synthetic clustered/panel-like data with cluster fixed effects.
# ---------------------------------------------------------------------
n_clusters <- 120
cluster_size <- 20
n <- n_clusters * cluster_size

cluster_id <- rep(seq_len(n_clusters), each = cluster_size)
cluster_fe <- rnorm(n_clusters, sd = 1.0)[cluster_id]

X1 <- rnorm(n)
X2 <- rbinom(n, 1, 0.4)

# Instrument varies within clusters; otherwise cluster FE would absorb it.
p_z <- plogis(0.15 * X1 - 0.10 * X2 + 0.15 * cluster_fe)
Z <- rbinom(n, 1, p_z)

# Individual-level unobserved confounder.
U <- rnorm(n)

# Endogenous treatment.
D <- 0.80 * Z + 0.50 * X1 - 0.25 * X2 + 0.80 * U + cluster_fe + rnorm(n)

# Outcome. True causal effect beta = 1.5.
Y <- 1.50 * D + 0.50 * X1 - 0.30 * X2 + 1.00 * U + cluster_fe + rnorm(n)

df <- data.frame(Y, D, Z, X1, X2, cluster_id = factor(cluster_id))
df <- na.omit(df)

cat("Analysis N:", nrow(df), "\n")
cat("Clusters:", length(unique(df$cluster_id)), "\n\n")

# ---------------------------------------------------------------------
# 2. Naive fixed-effect OLS; biased because D is endogenous.
# ---------------------------------------------------------------------
ols_fe <- feols(Y ~ D + X1 + X2 | cluster_id, data = df, vcov = ~ cluster_id)
cat("Naive fixed-effect OLS with cluster-robust SEs; not causal here:\n")
print(ols_fe)
cat("\n")

# ---------------------------------------------------------------------
# 3. Fixed-effect IV.
# fixest IV formula:
#   outcome ~ exogenous_controls | fixed_effects | endogenous ~ instruments
# If no fixed effects, use: Y ~ X1 + X2 | D ~ Z
# ---------------------------------------------------------------------
iv_fe <- feols(Y ~ X1 + X2 | cluster_id | D ~ Z, data = df, vcov = ~ cluster_id)

cat("Fixed-effect IV with cluster-robust SEs:\n")
print(iv_fe)
cat("\n")

cat("First-stage summary:\n")
print(summary(iv_fe, stage = 1))
cat("\n")

cat("First and second stages in one table:\n")
print(etable(summary(iv_fe, stage = 1:2), fitstat = ~ . + ivfall + ivwaldall.p))
cat("\n")

cat("Selected IV fit statistics with cluster-robust covariance where applicable:\n")
print(fitstat(iv_fe, ~ ivf1 + ivwald1, cluster = "cluster_id"))
cat("\n")

# ---------------------------------------------------------------------
# 4. Manual reduced-form check with same FE and clustering.
# ---------------------------------------------------------------------
rf_fe <- feols(Y ~ Z + X1 + X2 | cluster_id, data = df, vcov = ~ cluster_id)
fs_fe <- feols(D ~ Z + X1 + X2 | cluster_id, data = df, vcov = ~ cluster_id)

cat("Manual first stage D ~ Z + X + FE:\n")
print(fs_fe)
cat("\n")

cat("Manual reduced form Y ~ Z + X + FE:\n")
print(rf_fe)
cat("\n")

wald_ratio <- coef(rf_fe)["Z"] / coef(fs_fe)["Z"]
cat(sprintf("Manual Wald ratio from FE reduced form / FE first stage: %.4f\n", wald_ratio))
cat(sprintf("fixest IV coefficient on fitted D: %.4f\n\n", coef(iv_fe)["fit_D"]))

cat("Interpretation reminder:\n")
cat("This estimate uses within-cluster variation in Z. If Z had no within-cluster variation, cluster fixed effects would absorb the instrument.\n")
cat("Cluster-robust SEs are used because observations within cluster_id share shocks/design features.\n")
