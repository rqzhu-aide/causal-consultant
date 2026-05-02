"""
Optional DoWhy propensity-score matching/weighting template.

Requires:
    pip install dowhy pandas numpy

This example is intentionally compact. DoWhy is useful for the model-identify-estimate-refute
workflow, but you should still run explicit balance and overlap diagnostics separately.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

try:
    from dowhy import CausalModel
except ImportError as exc:
    raise SystemExit("Missing DoWhy. Install with: pip install dowhy") from exc


def simulate_data(n: int = 800, seed: int = 20260429) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    x1 = rng.normal(size=n)
    x2 = rng.normal(size=n)
    x3 = rng.binomial(1, 0.5, size=n)
    ps = 1 / (1 + np.exp(-(-0.4 + 0.9 * x1 - 0.6 * x2 + 0.3 * x3)))
    treat = rng.binomial(1, ps)
    y = 1.0 + 1.25 * treat + 0.9 * x1 - 0.7 * x2 + 0.4 * x3 + rng.normal(size=n)
    return pd.DataFrame({"y": y, "treat": treat, "x1": x1, "x2": x2, "x3": x3})


def main() -> None:
    data = simulate_data()
    graph = """
    digraph {
        x1 -> treat; x1 -> y;
        x2 -> treat; x2 -> y;
        x3 -> treat; x3 -> y;
        treat -> y;
    }
    """
    model = CausalModel(data=data, treatment="treat", outcome="y", graph=graph)
    identified_estimand = model.identify_effect()
    print(identified_estimand)

    estimate_match = model.estimate_effect(
        identified_estimand,
        method_name="backdoor.propensity_score_matching",
        target_units="att",
    )
    print("\nPropensity-score matching estimate")
    print(estimate_match)

    estimate_weight = model.estimate_effect(
        identified_estimand,
        method_name="backdoor.propensity_score_weighting",
        target_units="ate",
        method_params={"weighting_scheme": "ips_stabilized_weight"},
    )
    print("\nStabilized IPW estimate")
    print(estimate_weight)

    refute = model.refute_estimate(
        identified_estimand,
        estimate_weight,
        method_name="random_common_cause",
    )
    print("\nRefutation example")
    print(refute)

    print("\nDiagnostic reminder: run explicit SMD, overlap, and weight diagnostics outside DoWhy before final reporting.")


if __name__ == "__main__":
    main()
