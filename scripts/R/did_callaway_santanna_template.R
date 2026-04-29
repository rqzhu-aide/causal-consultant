# Difference-in-differences template using did
# Adapt id, time, group, treatment timing, outcome, and covariates.

library(did)
library(ggplot2)

# df must include:
# id: unit id
# t: time period
# G: first treatment period; 0 or Inf for never treated depending on coding
# Y: outcome
# X1, X2: optional pre-treatment covariates

att <- att_gt(
  yname = "Y",
  tname = "t",
  idname = "id",
  gname = "G",
  xformla = ~ X1 + X2,
  data = df,
  control_group = "notyettreated",
  est_method = "dr",
  bstrap = TRUE,
  clustervars = "id"
)

summary(att)

dyn <- aggte(att, type = "dynamic")
summary(dyn)
ggdid(dyn)

overall <- aggte(att, type = "group")
summary(overall)

# Always inspect pre-treatment event-study coefficients and discuss parallel trends/no anticipation.
