# Mediation Workflow
## Permission Note

This reference does not authorize execution. Treat diagnostics, artifacts, plots, tables, code, or report material as requests back to main unless main explicitly routed `execution_authorized` after user-confirmed scope.

Use this reference when `SKILL.md` is not enough for causal mediation, mechanism, pathway, direct/indirect effect, or mediation report support.

## 1. Clarify The Mediation Target

Record the smallest useful target:

- **Exposure/treatment**: what intervention is being decomposed.
- **Mediator/pathway**: what intermediate variable or pathway is scientifically meaningful.
- **Outcome**: what endpoint and time scale are being explained.
- **Timing**: exposure before mediator before outcome; baseline confounders before exposure; mediator-outcome confounders timed correctly.
- **Estimand**: CDE, NDE/NIE, interventional direct/indirect effects, separable effects, path-specific effects, or descriptive pathway model.
- **Scale**: risk difference, mean difference, risk ratio, odds ratio, hazard, RMST, or other scale.
- **Use**: mechanism explanation, intervention design, report section, hypothesis generation, or sensitivity memo.

If the mediator is really a baseline subgroup, use `10-heterogeneous-effects`. If the user wants a future adaptive strategy, ask main to route `15-dynamic-treatment-policies`.

## 2. Check Design Fit

Mediation adds assumptions beyond the total effect design.

- Randomized exposure: still does not randomize the mediator; mediator-outcome confounding remains central.
- Observational exposure: requires exposure-outcome, exposure-mediator, and mediator-outcome confounding control.
- Time-varying mediator/confounder: often needs g-methods or interventional effects rather than simple natural effects.
- Multiple mediators: natural path decompositions can require strong ordering/dependence assumptions; interventional effects may be more defensible.
- Survival/competing risk outcome: ask main to route `23-survival-competing-risks`; product-of-coefficients intuition often fails.
- IV/RD/DiD total effect designs: mediation may be possible only with extra structure; ask `method_lead` before decomposing.

## 3. Choose An Estimand Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| Simple single mediator, clear timing, no exposure-induced mediator-outcome confounding | Natural direct/indirect effects via `mediation`, `regmedint`, or `medflex` | Familiar and reportable | Strong assumptions; sensitivity analysis needed |
| Fixed mediator intervention is meaningful | Controlled direct effect | Clearer intervention interpretation | Does not decompose total effect unless extra structure is added |
| Multiple correlated mediators | Interventional effects via `CMAverse` or custom g-computation | Avoids some cross-world and ordering burdens | Interpretation differs from natural effects |
| Exposure-induced mediator-outcome confounding | Interventional effects, separable effects, or longitudinal g-methods | Better aligned with post-exposure confounding | May require richer data and stronger modeling |
| Decomposable treatment components | Separable effects | Mechanism tied to intervention components | Requires meaningful treatment decomposition and isolation assumptions |
| Weak timing or cross-sectional data | Descriptive pathway model | Honest about limits | Do not call it causal mediation |
| Python-only simple model | `statsmodels` mediation or custom g-computation | Useful template when R is unavailable | Less comprehensive mediation ecosystem than R |

## 4. Ask For Focused Data Work

Ask for one or two concrete checks at a time:

- timing table for exposure, mediator, outcome, and covariates;
- mediator missingness and measurement quality;
- covariate timing map for baseline and post-exposure confounders;
- mediator-outcome confounder screen;
- descriptive path model with noncausal wording if assumptions are not ready;
- sensitivity input for unmeasured mediator-outcome confounding;
- bootstrap/imputation plan and reproducible model code.

## 5. Diagnose Before Reporting

Minimum diagnostic set:

- timing and causal ordering are plausible;
- all three confounding relations have a plan;
- exposure-induced mediator-outcome confounding is addressed or explicitly blocks natural effects;
- mediator positivity/support is checked;
- exposure-mediator interaction is handled when relevant;
- mediator measurement error and missingness are described;
- sensitivity to unmeasured mediator-outcome confounding is included or explicitly deferred;
- "proportion mediated" is avoided when unstable or misleading.

## 6. Reviewer Interaction

- `domain_expert`: validates mechanism, mediator construct, intervention meaning, and pathway wording.
- `data_analyst`: prepares timing tables, mediator construction, missingness, covariate maps, model inputs, and sensitivity artifacts.
- `method_lead`: chooses estimand, identifies assumptions, and sets claim boundary.
- `report_writer`: integrates mediation materials into the working report when substantive.

## 7. Report Language

Use:

- "causal mediation analysis under the stated assumptions" only when timing and confounding assumptions are defensible;
- "interventional indirect effect" when the estimand is mediator-distribution based;
- "exploratory pathway analysis" when timing or assumptions are incomplete;
- "descriptive mediation-style model" when causal interpretation is not supported.

Avoid:

- "X works through M" when the mediator-outcome relation is not causally identified;
- "percentage mediated" when total effect is near zero, signs differ, or scale makes decomposition unstable;
- "adjusting for the mediator gives the direct effect" without the required assumptions.
