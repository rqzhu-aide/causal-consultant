"""statsmodels treatment effect template.

Adapt to the current statsmodels API and installed version.
"""
# statsmodels has treatment effect functionality for binary treatment settings under conditional independence.
# Use this template as a reminder to specify:
# - outcome model
# - treatment model
# - estimand
# - robust standard errors
# - overlap diagnostics

# Example outline:
# from statsmodels.treatment.treatment_effects import TreatmentEffect
# from statsmodels.discrete.discrete_model import Logit
# from statsmodels.regression.linear_model import OLS
#
# y_model = OLS.from_formula("Y ~ A + X1 + X2 + X3", data=df).fit()
# t_model = Logit.from_formula("A ~ X1 + X2 + X3", data=df).fit()
# te = TreatmentEffect(y_model, df["A"], results_select=t_model)
# print(te.aipw())
