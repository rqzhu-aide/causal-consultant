# Fuzzy RD using rdrobust plus a local IV sensitivity benchmark.
# Coordinate interpretation with 12-instrumental-variables.

library(rdrobust)
library(ivreg)

df <- read.csv("analysis_dataset.csv")

y <- df$outcome
x <- df$running_variable
d <- df$treatment_received
cutoff <- 0

# Fuzzy RD/local Wald estimate at the cutoff.
fit <- rdrobust(y = y, x = x, c = cutoff, fuzzy = d)
summary(fit)

# Optional local-window IV benchmark after selecting a defensible bandwidth.
h <- fit$bws[1, 1]
local <- subset(df, abs(running_variable - cutoff) <= h)
local$above_cutoff <- as.integer(local$running_variable >= cutoff)

iv_fit <- ivreg(outcome ~ treatment_received + running_variable |
                  above_cutoff + running_variable,
                data = local)
summary(iv_fit, diagnostics = TRUE)
