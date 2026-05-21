# Spatial spillover exposure construction with sf.

library(dplyr)
library(sf)

units <- st_read("units.geojson")

treated <- units %>% filter(treatment == 1)

# Distance to nearest treated unit and count of treated units within a radius.
dist_matrix <- st_distance(units, treated)
units$distance_to_nearest_treated <- apply(dist_matrix, 1, min)
units$treated_within_5km <- rowSums(as.matrix(dist_matrix) <= units::set_units(5, km))

units <- units %>%
  mutate(
    exposed_within_5km = treated_within_5km > ifelse(treatment == 1, 1, 0)
  )

support <- units %>%
  st_drop_geometry() %>%
  count(treatment, exposed_within_5km)

print(support)
st_write(units, "units_with_spatial_exposure.geojson", delete_dsn = TRUE)
