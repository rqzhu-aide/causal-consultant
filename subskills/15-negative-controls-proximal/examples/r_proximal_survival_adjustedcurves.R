# Proximal survival curve sketch using adjustedCurves.
# Check adjustedCurves documentation and proxy/bridge assumptions before use.

library(adjustedCurves)

df <- read.csv("survival_analysis_dataset.csv")

# group must be a binary factor. q_bridge and h_bridge are usually fit by
# lower-level proximal functions or supplied from a previous workflow.
# This file documents where proximal survival support enters the pipeline.

# adj <- adjustedsurv(
#   data = df,
#   variable = "treatment_group",
#   ev_time = "time",
#   event = "event",
#   method = "prox_aiptw",
#   treatment_proxy = "treatment_proxy",
#   outcome_proxy = "outcome_proxy",
#   conf_int = TRUE
# )
#
# plot(adj)

message("Use adjustedCurves::surv_prox_aiptw through adjustedsurv after bridge inputs are specified.")
