# Regression discontinuity template
# Required packages: rdrobust, rddensity

library(rdrobust)
library(rddensity)

# Variables:
# Y: outcome
# X: running variable
# cutoff: assignment cutoff
# A: treatment indicator if fuzzy RD

cutoff <- 0

# RD plot
rdplot(y = df$Y, x = df$X, c = cutoff)

# Sharp RD
rd <- rdrobust(y = df$Y, x = df$X, c = cutoff)
summary(rd)

# Density/manipulation check
rd_den <- rddensity(X = df$X, c = cutoff)
summary(rd_den)
rdplotdensity(rd_den, X = df$X)

# Fuzzy RD if treatment is not deterministic at cutoff
# frd <- rdrobust(y = df$Y, x = df$X, c = cutoff, fuzzy = df$A)
# summary(frd)

# Always report local nature of estimand and bandwidth sensitivity.
