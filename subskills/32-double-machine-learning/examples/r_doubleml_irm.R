# DoubleML IRM for binary treatment ATE/ATTE-style targets.

library(readr)
library(DoubleML)
library(mlr3)
library(mlr3learners)
library(data.table)

dat <- read_csv("analysis_dataset.csv")

# y: outcome
# a: treatment/exposure, 0/1
# x1, x2, x3: approved pre-treatment covariates

dml_data <- double_ml_data_from_data_frame(
  data = as.data.table(dat),
  y_col = "y",
  d_cols = "a",
  x_cols = c("x1", "x2", "x3")
)

ml_g <- lrn("regr.ranger", num.trees = 500, min.node.size = 10)
ml_m <- lrn("classif.ranger", num.trees = 500, min.node.size = 10, predict_type = "prob")

irm <- DoubleMLIRM$new(
  data = dml_data,
  ml_g = ml_g,
  ml_m = ml_m,
  n_folds = 5,
  score = "ATE"
)

irm$fit()
print(irm$summary())
saveRDS(irm, "doubleml_irm_fit.rds")
