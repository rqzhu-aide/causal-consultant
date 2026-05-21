"""Template: simple model-based mediation with statsmodels.

Use when the workflow must remain in Python. Treat output as causal mediation
only when timing and confounding assumptions are justified by method_lead.
"""

import statsmodels.api as sm
from statsmodels.stats.mediation import Mediation

outcome_model = sm.OLS.from_formula("Y ~ A + M + C1 + C2", data=df)
mediator_model = sm.OLS.from_formula("M ~ A + C1 + C2", data=df)

med = Mediation(
    outcome_model=outcome_model,
    mediator_model=mediator_model,
    exposure="A",
    mediator="M",
)

result = med.fit(n_rep=1000)
print(result.summary())

# For binary outcomes/mediators, replace OLS with appropriate GLM models.
# Add sensitivity analysis separately; statsmodels mediation is not a full causal workflow.
