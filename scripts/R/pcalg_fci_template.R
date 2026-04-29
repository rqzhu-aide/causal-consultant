# Causal discovery template using pcalg FCI algorithm.
# Use when hidden confounders are possible. Returns a PAG.
#
# Run:
#   install.packages("pcalg")
#   Rscript pcalg_fci_template.R data.csv

args <- commandArgs(trailingOnly = TRUE)
if (length(args) != 1) stop("Usage: Rscript pcalg_fci_template.R data.csv")

library(pcalg)

df <- read.csv(args[1])
labels <- colnames(df)
X <- as.matrix(df)

suffStat <- list(C = cor(X, use = "pairwise.complete.obs"), n = nrow(X))
alpha <- 0.05
fci_fit <- fci(suffStat = suffStat,
               indepTest = gaussCItest,
               alpha = alpha,
               labels = labels)

print(fci_fit)
png("fci_pag_r.png", width = 1000, height = 800)
plot(fci_fit)
dev.off()

# Output is a PAG under assumptions. Circle marks indicate uncertainty about endpoint orientation.
