"""Template: CATE estimation with EconML CausalForestDML.

Replace df, column names, and models before running. Interpret results through
the design route and use held-out/cross-fitted diagnostics for report-ready claims.
"""

from econml.dml import CausalForestDML
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split

effect_cols = ["x1", "x2", "x3"]   # modifiers for CATE reporting
control_cols = ["c1", "c2", "c3"]  # adjustment variables not necessarily reported as modifiers
treatment_col = "treatment"
outcome_col = "outcome"

train_df, test_df = train_test_split(df, test_size=0.3, random_state=123)

est = CausalForestDML(
    model_y=RandomForestRegressor(n_estimators=300, min_samples_leaf=20, random_state=123),
    model_t=RandomForestClassifier(n_estimators=300, min_samples_leaf=20, random_state=124),
    discrete_treatment=True,
    n_estimators=800,
    min_samples_leaf=20,
    honest=True,
    inference=True,
    random_state=125,
)

est.fit(
    train_df[outcome_col],
    train_df[treatment_col],
    X=train_df[effect_cols],
    W=train_df[control_cols],
)

tau = est.effect(test_df[effect_cols])
lb, ub = est.effect_interval(test_df[effect_cols])

out = test_df.copy()
out["cate_hat"] = tau
out["cate_lb"] = lb
out["cate_ub"] = ub

print(out[effect_cols + ["cate_hat", "cate_lb", "cate_ub"]].head())
