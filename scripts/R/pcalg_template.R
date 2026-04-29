# Causal discovery template using pcalg PC algorithm.
# Use only after discussing assumptions: causal sufficiency, faithfulness, acyclicity, test choice.
# Returns a CPDAG/equivalence class.
#
# Run:
#   install.packages("pcalg")
#   Rscript pcalg_template.R data.csv

args <- commandArgs(trailingOnly = TRUE)
if (length(args) != 1) stop("Usage: Rscript pcalg_template.R data.csv")

library(pcalg)

df <- read.csv(args[1])
labels <- colnames(df)
X <- as.matrix(df)

suffStat <- list(C = cor(X, use = "pairwise.complete.obs"), n = nrow(X))
alpha <- 0.05
pc_fit <- pc(suffStat = suffStat,
             indepTest = gaussCItest,
             alpha = alpha,
             labels = labels)

print(pc_fit)
png("pc_graph_r.png", width = 1000, height = 800)
plot(pc_fit)
dev.off()

# Output is a CPDAG/equivalence class under assumptions, not proof of a unique causal DAG.
