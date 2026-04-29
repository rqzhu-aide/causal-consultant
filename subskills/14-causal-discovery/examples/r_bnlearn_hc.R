# Score-based Bayesian network structure learning with bnlearn.
# Run:
#   install.packages("bnlearn")
#   Rscript r_bnlearn_hc.R data.csv

args <- commandArgs(trailingOnly = TRUE)
if (length(args) != 1) stop("Usage: Rscript r_bnlearn_hc.R data.csv")

library(bnlearn)

df <- read.csv(args[1])

fit <- hc(df, score = "bic-g")
print(fit)

# graphviz.plot requires Rgraphviz.
# graphviz.plot(fit)
