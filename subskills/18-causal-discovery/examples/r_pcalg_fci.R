# FCI baseline with pcalg for possible latent confounders.
# Run:
#   install.packages("pcalg")
#   Rscript r_pcalg_fci.R data.csv

args <- commandArgs(trailingOnly = TRUE)
if (length(args) != 1) stop("Usage: Rscript r_pcalg_fci.R data.csv")

library(pcalg)

df <- read.csv(args[1])
labels <- colnames(df)
X <- as.matrix(df)

suffStat <- list(C = cor(X, use = "pairwise.complete.obs"), n = nrow(X))
fit <- fci(suffStat = suffStat,
           indepTest = gaussCItest,
           alpha = 0.05,
           labels = labels)

print(fit)
png("fci_pag_r.png", width = 1000, height = 800)
plot(fit)
dev.off()
