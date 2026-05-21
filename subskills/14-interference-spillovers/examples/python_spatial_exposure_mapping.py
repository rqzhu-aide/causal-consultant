"""Construct simple distance-based spillover exposure in Python."""

import geopandas as gpd
import pandas as pd


units = gpd.read_file("units.geojson")
treated = units.loc[units["treatment"] == 1].copy()

projected = units.to_crs(units.estimate_utm_crs())
treated_projected = treated.to_crs(projected.crs)

distances = projected.geometry.apply(lambda geom: treated_projected.distance(geom).min())
projected["distance_to_nearest_treated_m"] = distances
projected["exposed_within_5km"] = projected["distance_to_nearest_treated_m"] <= 5000

support = (
    pd.DataFrame(projected.drop(columns="geometry"))
    .groupby(["treatment", "exposed_within_5km"], observed=True)
    .size()
)

print(support)
projected.to_file("units_with_spatial_exposure.geojson", driver="GeoJSON")
