"""Template: continuous treatment effect support with EconML.

This estimates local marginal effects for a continuous treatment. It is not a
full dose-response curve by itself; report only the target supported by the
chosen estimator and diagnostics.
"""

from econml.dml import CausalForestDML, LinearDML
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

dose_col = "dose"
outcome_col = "outcome"
effect_modifiers = ["x1", "x2"]
controls = ["c1", "c2", "c3"]

train_df, test_df = train_test_split(df, test_size=0.3, random_state=123)

est = CausalForestDML(
    model_y=RandomForestRegressor(n_estimators=300, min_samples_leaf=20, random_state=123),
    model_t=RandomForestRegressor(n_estimators=300, min_samples_leaf=20, random_state=124),
    discrete_treatment=False,
    n_estimators=800,
    min_samples_leaf=20,
    random_state=125,
)

est.fit(
    Y=train_df[outcome_col],
    T=train_df[dose_col],
    X=train_df[effect_modifiers],
    W=train_df[controls],
)

marginal_effect = est.marginal_effect(T=test_df[dose_col], X=test_df[effect_modifiers])

out = test_df.copy()
out["local_marginal_effect"] = marginal_effect.reshape(-1)
print(out[effect_modifiers + [dose_col, "local_marginal_effect"]].head())

# For a simple partially linear target, compare against LinearDML.
linear = LinearDML(
    model_y=RandomForestRegressor(n_estimators=300, min_samples_leaf=20, random_state=123),
    model_t=RandomForestRegressor(n_estimators=300, min_samples_leaf=20, random_state=124),
    discrete_treatment=False,
    random_state=126,
)
linear.fit(train_df[outcome_col], train_df[dose_col], X=train_df[effect_modifiers], W=train_df[controls])
print(linear.summary())
