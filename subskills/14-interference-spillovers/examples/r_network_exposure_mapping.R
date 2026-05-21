# Construct simple network exposure variables in R.
# Replace paths and column names before use.

library(dplyr)
library(igraph)

nodes <- read.csv("units.csv")
edges <- read.csv("edges.csv")

g <- graph_from_data_frame(edges, directed = FALSE, vertices = nodes)
treat <- setNames(nodes$treatment, nodes$unit_id)

neighbor_exposure <- function(graph, treatment_vector) {
  neighbors <- adjacent_vertices(graph, V(graph), mode = "all")
  treated_count <- vapply(neighbors, function(v) sum(treatment_vector[names(v)] == 1, na.rm = TRUE), numeric(1))
  degree <- lengths(neighbors)
  treated_prop <- ifelse(degree > 0, treated_count / degree, 0)
  data.frame(
    unit_id = names(V(graph)),
    degree = degree,
    treated_neighbor_count = treated_count,
    treated_neighbor_prop = treated_prop
  )
}

exposure <- neighbor_exposure(g, treat)
analysis <- left_join(nodes, exposure, by = "unit_id")

support <- analysis %>%
  mutate(peer_exposure_bin = cut(treated_neighbor_prop, c(-0.01, 0, 0.25, 0.5, 1))) %>%
  count(treatment, peer_exposure_bin)

print(support)
write.csv(analysis, "analysis_with_network_exposure.csv", row.names = FALSE)
