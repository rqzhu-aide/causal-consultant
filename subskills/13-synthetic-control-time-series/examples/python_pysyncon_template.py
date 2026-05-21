"""Python synthetic control template with pysyncon.

Validate package API and results against a known example before production use.
"""

from pathlib import Path

import pandas as pd
from pysyncon import Dataprep, Synth


DATA = Path("analysis_scm_panel.csv")
df = pd.read_csv(DATA)

# Required columns:
# unit_name, time, y, treated_unit_name, predictors x1/x2

treated_unit = "treated_unit_name"
controls = sorted(set(df["unit_name"]) - {treated_unit})

dataprep = Dataprep(
    foo=df,
    predictors=["x1", "x2"],
    predictors_op="mean",
    dependent="y",
    unit_variable="unit_name",
    time_variable="time",
    treatment_identifier=treated_unit,
    controls_identifier=controls,
    time_predictors_prior=range(2000, 2011),
    time_optimize_ssr=range(2000, 2011),
    time_plot=range(2000, 2021),
)

synth = Synth()
synth.fit(dataprep=dataprep)

synth.weights().to_csv("pysyncon_unit_weights.csv")
synth.path_plot(time_period=range(2000, 2021), treatment_time=2011)
