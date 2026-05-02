# PC baseline with pcalg.
# Run:
#   install.packages("pcalg")
#   Rscript r_pcalg_pc.R data.csv

args <- commandArgs(trailingOnly = TRUE)
if (length(args) != 1) stop("Usage: Rscript r_pcalg_pc.R data.csv")

library(pcalg)

df <- read.csv(args[1])
labels <- colnames(df)
X <- as.matrix(df)

suffStat <- list(C = cor(X, use = "pairwise.complete.obs"), n = nrow(X))
fit <- pc(suffStat = suffStat,
          indepTest = gaussCItest,
          alpha = 0.05,
          labels = labels)

print(fit)
png("pc_graph_r.png", width = 1000, height = 800)
plot(fit)
dev.off()
