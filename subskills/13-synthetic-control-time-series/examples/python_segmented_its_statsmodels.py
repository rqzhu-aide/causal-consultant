"""Interrupted time-series segmented regression with statsmodels.

Use when no valid donor/control pool exists. Claims need strong caveats and
sensitivity to seasonality, autocorrelation, and alternative break dates.
"""

from pathlib import Path

import pandas as pd
import statsmodels.formula.api as smf


DATA = Path("analysis_its_timeseries.csv")
df = pd.read_csv(DATA)

# Required columns:
# y: outcome
# time_index: numeric time
# post: 1 after intervention, 0 before
# time_after: 0 before intervention, increasing after intervention

fit = smf.ols("y ~ time_index + post + time_after", data=df).fit(cov_type="HAC", cov_kwds={"maxlags": 4})

fit.summary2().tables[1].to_csv("its_segmented_regression_summary.csv")
with open("its_segmented_regression.txt", "w", encoding="utf-8") as f:
    f.write(str(fit.summary()))
