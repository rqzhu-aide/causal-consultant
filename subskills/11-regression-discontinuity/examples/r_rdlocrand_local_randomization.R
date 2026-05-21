# Local randomization RD workflow for discrete scores or very local windows.

library(rdlocrand)

df <- read.csv("analysis_dataset.csv")

Y <- df$outcome
R <- df$running_variable
Z <- as.integer(R >= 0)
covariates <- df[, c("covariate_1", "covariate_2")]

# Select candidate windows using covariate balance.
windows <- rdwinselect(R = R, X = covariates, cutoff = 0)
print(windows)

# Run randomization inference in a chosen window.
chosen_window <- c(-1, 1)
in_window <- R >= chosen_window[1] & R <= chosen_window[2]

ri <- rdrandinf(Y = Y[in_window], R = R[in_window], cutoff = 0, wl = chosen_window[1], wr = chosen_window[2])
summary(ri)
