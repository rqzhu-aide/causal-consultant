"""Template: uplift ranking baseline with scikit-uplift.

Use for product/marketing style targeting when treatment is randomized or logged
with credible propensity support. Treat output as a ranking unless policy value
is evaluated with an appropriate causal design.
"""

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklift.metrics import qini_auc_score, uplift_at_k
from sklift.models import TwoModels

baseline_cols = ["x1", "x2", "x3"]
treatment_col = "treatment"  # binary indicator
outcome_col = "outcome"      # binary response for this template

train_df, test_df = train_test_split(df, test_size=0.3, random_state=123, stratify=df[treatment_col])

X_train = train_df[baseline_cols]
y_train = train_df[outcome_col]
treat_train = train_df[treatment_col]

X_test = test_df[baseline_cols]
y_test = test_df[outcome_col]
treat_test = test_df[treatment_col]

uplift_model = TwoModels(
    estimator_trmnt=RandomForestClassifier(n_estimators=300, min_samples_leaf=50, random_state=123),
    estimator_ctrl=RandomForestClassifier(n_estimators=300, min_samples_leaf=50, random_state=124),
    method="vanilla",
)

uplift_model.fit(X_train, y_train, treat_train)
uplift_score = uplift_model.predict(X_test)

print("Qini AUC:", qini_auc_score(y_test, uplift_score, treat_test))
print("Uplift at 30%:", uplift_at_k(y_test, uplift_score, treat_test, strategy="overall", k=0.30))
