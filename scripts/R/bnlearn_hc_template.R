# Score-based Bayesian network structure learning with bnlearn.
# Use for score-based discovery (BIC, BDeu) with hill-climbing.
#
# Run:
#   install.packages("bnlearn")
#   Rscript bnlearn_hc_template.R data.csv

args <- commandArgs(trailingOnly = TRUE)
if (length(args) != 1) stop("Usage: Rscript bnlearn_hc_template.R data.csv")

library(bnlearn)

df <- read.csv(args[1])

# For continuous Gaussian data
fit <- hc(df, score = "bic-g")

# For discrete data, use a discrete score such as bic or bde.
# fit <- hc(df, score = "bic")

print(fit)

# graphviz.plot requires Rgraphviz.
# graphviz.plot(fit)
