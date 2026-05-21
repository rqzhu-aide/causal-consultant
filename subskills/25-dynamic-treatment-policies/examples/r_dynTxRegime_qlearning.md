# Template: Q-learning With DynTxRegime

Use this as a scaffold because `DynTxRegime` syntax depends on the exact stage structure, treatment coding, and outcome model.

Typical workflow:

1. Reshape data into one row per subject with stage-specific histories, actions, and final outcome, or the package's required multi-stage format.
2. Define treatment models and outcome/blip models for each stage.
3. Fit Q-learning or value-search estimators using `DynTxRegime`.
4. Extract the recommended regime and estimated value.
5. Compare against simpler regimes and check support for histories where the learned rule changes action.

Skeleton:

```r
library(DynTxRegime)

# Stage-specific model objects are placeholders. Replace with package-specific
# modelObj definitions after the decision structure is finalized.
# qfit <- qLearn(
#   moMain = main_effect_model,
#   moCont = contrast_model,
#   data = analysis_df,
#   response = analysis_df$Y,
#   txName = "A_stage",
#   fSet = NULL
# )
#
# summary(qfit)
# opt_tx <- optTx(qfit)
```

Keep the output exploratory unless the longitudinal design, support, and validation checks are complete.
