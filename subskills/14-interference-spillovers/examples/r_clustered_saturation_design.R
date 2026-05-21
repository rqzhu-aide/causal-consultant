# Cluster saturation design summary and regression benchmark.
# Use specialized estimators where assumptions match; this file builds diagnostics.

library(dplyr)
library(fixest)

df <- read.csv("clustered_analysis_dataset.csv")

df <- df %>%
  group_by(cluster_id) %>%
  mutate(
    cluster_size = n(),
    cluster_saturation = mean(treatment),
    peer_saturation = (sum(treatment) - treatment) / pmax(cluster_size - 1, 1)
  ) %>%
  ungroup()

support <- df %>%
  mutate(peer_bin = cut(peer_saturation, c(-0.01, 0, 0.25, 0.5, 0.75, 1))) %>%
  count(treatment, peer_bin)

print(support)

fit <- feols(
  outcome ~ treatment + peer_saturation + treatment:peer_saturation + baseline_risk,
  data = df,
  cluster = ~cluster_id
)

summary(fit)
