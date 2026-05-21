# Sharp RD with rdrobust.
# Replace column names and paths before use.

library(rdrobust)

df <- read.csv("analysis_dataset.csv")

y <- df$outcome
x <- df$running_variable
cutoff <- 0

# Main robust bias-corrected local polynomial RD.
fit <- rdrobust(y = y, x = x, c = cutoff)
summary(fit)

# Bandwidth selection and RD plot.
bw <- rdbwselect(y = y, x = x, c = cutoff)
print(bw)

png("rdplot_outcome.png", width = 1200, height = 800, res = 150)
rdplot(y = y, x = x, c = cutoff)
dev.off()
