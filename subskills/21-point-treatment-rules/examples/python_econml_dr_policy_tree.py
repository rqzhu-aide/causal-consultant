"""Template: one-time DR policy tree with EconML.

Replace df, column names, and models before running. Use held-out or
cross-fitted evaluation for report-ready policy value.
"""

import pandas as pd
from econml.policy import DRPolicyTree
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split

baseline_cols = ["x1", "x2", "x3"]
treatment_col = "treatment"  # 0 = control, 1 = treated
outcome_col = "outcome"      # higher values should be better

train_df, test_df = train_test_split(df, test_size=0.3, random_state=123)

X_train = train_df[baseline_cols]
T_train = train_df[treatment_col]
Y_train = train_df[outcome_col]

X_test = test_df[baseline_cols]

policy = DRPolicyTree(
    model_regression=RandomForestRegressor(n_estimators=300, min_samples_leaf=20, random_state=123),
    model_propensity=RandomForestClassifier(n_estimators=300, min_samples_leaf=20, random_state=123),
    max_depth=2,
    min_samples_leaf=50,
    honest=True,
    random_state=123,
)

policy.fit(Y_train, T_train, X=X_train)

recommended_treatment = policy.predict(X_test)
recommendation_prob = policy.predict_proba(X_test)
relative_value = policy.predict_value(X_test)

out = test_df.copy()
out["recommended_treatment"] = recommended_treatment
out["recommendation_prob_treat"] = recommendation_prob[:, 1]
out["relative_value_vs_control"] = relative_value[:, 0]

print(out[baseline_cols + ["recommended_treatment", "relative_value_vs_control"]].head())
