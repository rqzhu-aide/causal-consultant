"""DoWhy point-treatment template.

Adapt variable names and graph before running.
"""
import dowhy
from dowhy import CausalModel

# df: pandas DataFrame
# treatment = "A"
# outcome = "Y"
# common_causes = ["X1", "X2", "X3"]

model = CausalModel(
    data=df,
    treatment="A",
    outcome="Y",
    common_causes=["X1", "X2", "X3"],
)

identified_estimand = model.identify_effect()
print(identified_estimand)

estimate = model.estimate_effect(
    identified_estimand,
    method_name="backdoor.propensity_score_weighting",
    target_units="ate",
)
print(estimate)

refute_random = model.refute_estimate(
    identified_estimand,
    estimate,
    method_name="random_common_cause",
)
print(refute_random)

refute_placebo = model.refute_estimate(
    identified_estimand,
    estimate,
    method_name="placebo_treatment_refuter",
)
print(refute_placebo)

# Always supplement with balance/overlap diagnostics; DoWhy refuters do not prove identification assumptions.
