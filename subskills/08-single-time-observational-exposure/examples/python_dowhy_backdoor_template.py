"""DoWhy backdoor workflow for a baseline observational exposure.

Replace paths, variable names, and graph before use.
"""

from pathlib import Path

import pandas as pd
from dowhy import CausalModel

DATA = Path("analysis_dataset.csv")
OUT = Path("observational_outputs")
OUT.mkdir(exist_ok=True)

df = pd.read_csv(DATA)

# Expected columns:
# y: outcome
# a: exposure/treatment, 0/1
# x1, x2, x3: baseline confounders

graph = """
digraph {
  x1 -> a; x1 -> y;
  x2 -> a; x2 -> y;
  x3 -> a; x3 -> y;
  a -> y;
}
"""

model = CausalModel(
    data=df,
    treatment="a",
    outcome="y",
    graph=graph,
)

identified_estimand = model.identify_effect(proceed_when_unidentifiable=False)
estimate = model.estimate_effect(
    identified_estimand,
    method_name="backdoor.propensity_score_weighting",
    target_units="ate",
)

refuter = model.refute_estimate(
    identified_estimand,
    estimate,
    method_name="random_common_cause",
)

(OUT / "dowhy_identified_estimand.txt").write_text(str(identified_estimand), encoding="utf-8")
(OUT / "dowhy_estimate.txt").write_text(str(estimate), encoding="utf-8")
(OUT / "dowhy_refuter.txt").write_text(str(refuter), encoding="utf-8")
