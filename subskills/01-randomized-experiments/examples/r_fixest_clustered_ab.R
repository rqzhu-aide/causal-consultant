# Cluster-randomized or clustered A/B experiment with fixest
# ---------------------------------------------------------
# This example is runnable with synthetic data. It demonstrates why the
# analysis must respect the randomization/cluster unit.
#
# Required packages:
# install.packages(c("fixest", "randomizr"))

required <- c("fixest", "randomizr")
missing <- required[!vapply(required, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing) > 0) {
  stop("Install required packages first: ", paste(missing, collapse = ", "))
}

set.seed(20260429)
C <- 80
cluster_size <- sample(15:60, C, replace = TRUE)
cluster_id <- rep(seq_len(C), times = cluster_size)
N <- length(cluster_id)

cluster_df <- data.frame(
  cluster_id = seq_len(C),
  block = sample(LETTERS[1:4], C, replace = TRUE),
  cluster_x = rnorm(C)
)

# Blocked cluster random assignment.
cluster_df$z <- randomizr::block_ra(blocks = cluster_df$block, prob = 0.5)

# Individual-level dataset.
df <- data.frame(
  id = seq_len(N),
  cluster_id = cluster_id,
  x = rnorm(N)
)
df <- merge(df, cluster_df, by = "cluster_id")

cluster_effect <- rnorm(C, sd = 0.8)
df$u_cluster <- cluster_effect[df$cluster_id]

# True assignment effect is 0.50.
df$y <- 1 + 0.50 * df$z + 0.30 * df$x + 0.40 * df$cluster_x + df$u_cluster + rnorm(N)

cat("\nClusters by arm:\n")
print(table(cluster_df$z))
cat("\nIndividuals by arm:\n")
print(table(df$z))
cat("\nCluster size summary:\n")
print(summary(cluster_size))

# Naive individual-level SE is wrong when clusters were randomized.
naive <- fixest::feols(y ~ z + x + cluster_x, data = df, vcov = "HC1")

# Cluster-robust SE at randomization cluster level.
clustered <- fixest::feols(y ~ z + x + cluster_x, data = df, cluster = ~ cluster_id)

# Add block fixed effects when assignment was blocked.
blocked_clustered <- fixest::feols(y ~ z + x + cluster_x | block, data = df, cluster = ~ cluster_id)

cat("\nNaive robust SE, cluster-robust SE, and block FE + cluster SE:\n")
print(fixest::etable(naive, clustered, blocked_clustered))

# Transparent cluster-level analysis: each cluster contributes one mean.
cluster_means <- aggregate(y ~ cluster_id + z + block + cluster_x, data = df, FUN = mean)
cluster_level <- fixest::feols(y ~ z + cluster_x | block, data = cluster_means, vcov = "HC1")
cat("\nCluster-level sensitivity analysis:\n")
print(summary(cluster_level))

cat("\nInterpretation reminder:\n")
cat("If clusters were randomized, report cluster-aware inference. Clarify whether the target is cluster-weighted or individual-weighted.\n")
