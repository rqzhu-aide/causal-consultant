"""Competing-risk cumulative incidence with lifelines AalenJohansenFitter."""

from pathlib import Path

import pandas as pd
from lifelines import AalenJohansenFitter


DATA = Path("analysis_competing_risk_dataset.csv")
EVENT_OF_INTEREST = 1

df = pd.read_csv(DATA)

# Required columns:
# time: follow-up time from valid time zero
# event_type: 0 censored, 1 event of interest, 2+ competing events
# a: treatment/exposure or group

rows = []
for group, part in df.groupby("a"):
    aj = AalenJohansenFitter(calculate_variance=True)
    aj.fit(
        durations=part["time"],
        event_observed=part["event_type"],
        event_of_interest=EVENT_OF_INTEREST,
        label=f"a={group}",
    )
    cif = aj.cumulative_density_.reset_index()
    cif["a"] = group
    rows.append(cif)

pd.concat(rows, ignore_index=True).to_csv("aalen_johansen_cif_by_group.csv", index=False)
