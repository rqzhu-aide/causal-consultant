# Post-double-selection lasso for sparse high-dimensional controls.

library(readr)
library(hdm)

dat <- read_csv("analysis_dataset.csv")

# y: outcome
# a: treatment/exposure
# x1:x100 or a constructed high-dimensional covariate matrix

x_cols <- grep("^x", names(dat), value = TRUE)
x <- as.matrix(dat[, x_cols])

fit <- rlassoEffect(
  x = x,
  y = dat$y,
  d = dat$a,
  method = "double selection"
)

print(summary(fit))
saveRDS(fit, "hdm_double_selection_fit.rds")
