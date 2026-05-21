# Density/manipulation check for an RD running variable.

library(rddensity)

df <- read.csv("analysis_dataset.csv")
x <- df$running_variable
cutoff <- 0

density_fit <- rddensity(X = x, c = cutoff)
summary(density_fit)

png("rddensity_check.png", width = 1200, height = 800, res = 150)
rdplotdensity(density_fit, X = x)
dev.off()
