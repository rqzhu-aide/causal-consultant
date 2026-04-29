# Longitudinal g-methods template
# Candidate packages: ipw, gfoRmula, ltmle, lmtp
# This file is a design skeleton; adapt to the chosen package.

# Required data structure:
# - id variable
# - time variable
# - treatment at each time A_t
# - time-varying covariates L_t
# - censoring indicator C_t if relevant
# - outcome Y

# Analysis steps:
# 1. Define time zero and eligibility.
# 2. Define treatment regimes: static, dynamic, or modified treatment policy.
# 3. Construct person-period data.
# 4. Classify time-varying confounders affected by prior treatment.
# 5. Choose estimator:
#    - MSM/IPW via ipw
#    - parametric g-formula via gfoRmula
#    - longitudinal TMLE via ltmle
#    - modified treatment policy via lmtp
# 6. Diagnose treatment/censoring weights and sequential positivity.
# 7. Report regime-specific risks/means and contrasts.
