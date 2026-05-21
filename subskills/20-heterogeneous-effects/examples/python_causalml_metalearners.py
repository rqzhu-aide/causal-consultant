"""Template: CATE exploration with CausalML meta-learners.

Use for exploratory CATE screening or product-style uplift support. Report causal
claims only if the design route supports identification and diagnostics are done.
"""

from causalml.inference.meta import BaseDRRegressor, BaseXRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

feature_cols = ["x1", "x2", "x3", "c1", "c2"]
treatment_col = "treatment"
outcome_col = "outcome"

train_df, test_df = train_test_split(df, test_size=0.3, random_state=123)

base_model = RandomForestRegressor(n_estimators=300, min_samples_leaf=30, random_state=123)

x_learner = BaseXRegressor(learner=base_model)
cate_x = x_learner.fit_predict(
    X=train_df[feature_cols].values,
    treatment=train_df[treatment_col].values,
    y=train_df[outcome_col].values,
    p=None,
)

dr_learner = BaseDRRegressor(learner=base_model)
cate_dr = dr_learner.fit_predict(
    X=train_df[feature_cols].values,
    treatment=train_df[treatment_col].values,
    y=train_df[outcome_col].values,
    p=None,
)

print("Exploratory X-learner CATE shape:", cate_x.shape)
print("Exploratory DR-learner CATE shape:", cate_dr.shape)
