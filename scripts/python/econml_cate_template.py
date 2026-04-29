"""EconML CATE template using LinearDML.

Adapt learners, outcome type, and covariates.
"""
import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from econml.dml import LinearDML

# Y: outcome array
# T: treatment array, binary or continuous depending on model
# X: effect modifiers for CATE
# W: controls/confounders

est = LinearDML(
    model_y=RandomForestRegressor(n_estimators=500, min_samples_leaf=5, random_state=1),
    model_t=RandomForestClassifier(n_estimators=500, min_samples_leaf=5, random_state=2),
    discrete_treatment=True,
    cv=5,
    random_state=3,
)

est.fit(Y, T, X=X, W=W)

cate = est.effect(X)
print("CATE summary:", np.nanmean(cate), np.nanpercentile(cate, [5, 50, 95]))

# For inference, use EconML inference options appropriate to the estimator.
# Interpret CATE causally only under identification assumptions.
