# Multiple-cutoff RD template.
# Check current rdmulti documentation for exact argument names before production use.

library(rdmulti)

df <- read.csv("analysis_dataset.csv")

# One row per unit with outcome, running variable, and cutoff assigned to that unit.
y <- df$outcome
x <- df$running_variable
c <- df$cutoff_value

# Example command shape for multiple cutoffs.
fit <- rdmc(Y = y, X = x, C = c)
summary(fit)
