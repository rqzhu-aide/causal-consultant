# Literature And Software Map

Use this file to choose credible DiD and event-study tools. Keep the main team focused on treatment timing, comparison group, estimand, parallel-trend assumptions, heterogeneity, and diagnostics before software.

## Core Literature

### Foundations And Diagnostics

- Ashenfelter (1978), [Estimating the effect of training programs on earnings](https://doi.org/10.2307/2526347): classic pre-program earnings dip and selection concern.
- Card and Krueger (1994), [Minimum wages and employment](https://doi.org/10.1257/aer.84.4.772): canonical applied DiD example.
- Angrist and Pischke (2009), *Mostly Harmless Econometrics*: applied DiD intuition, regression framing, and common pitfalls.
- Bertrand, Duflo, and Mullainathan (2004), [How much should we trust differences-in-differences estimates?](https://doi.org/10.1162/003355304772839588): serial correlation and inference caution.
- Roth (2022), [Pretest with caution](https://doi.org/10.1257/aer.20200742): pre-trend tests can distort inference and have low power.
- Rambachan and Roth (2023), [A more credible approach to parallel trends](https://doi.org/10.1093/restud/rdad018): HonestDiD-style robust inference under bounded trend violations.

### Modern Staggered Adoption And Event Studies

- Goodman-Bacon (2021), [Difference-in-differences with variation in treatment timing](https://doi.org/10.1016/j.jeconom.2021.03.014): TWFE decomposition and problematic comparisons.
- de Chaisemartin and D'Haultfoeuille (2020), [Two-way fixed effects estimators with heterogeneous treatment effects](https://doi.org/10.1257/aer.20181169): negative weights and heterogeneity risks.
- Sun and Abraham (2021), [Estimating dynamic treatment effects in event studies with heterogeneous treatment effects](https://doi.org/10.1016/j.jeconom.2020.09.006): interaction-weighted event-study approach and lead/lag contamination.
- Callaway and Sant'Anna (2021), [Difference-in-differences with multiple time periods](https://doi.org/10.1016/j.jeconom.2020.12.001): group-time ATT framework and flexible aggregation.
- Borusyak, Jaravel, and Spiess (2024), [Revisiting event-study designs: robust and efficient estimation](https://doi.org/10.1093/restud/rdae007): imputation estimator for event-study designs.
- Gardner (2022), [Two-stage differences in differences](https://doi.org/10.48550/arXiv.2207.05943): two-stage DiD estimator implemented in `did2s`.
- Wooldridge (2021), [Two-way fixed effects, the two-way Mundlak regression, and difference-in-differences estimators](https://doi.org/10.2139/ssrn.3906345): alternative Mundlak/ETWFE framing.

### Conditional, Doubly Robust, Synthetic, And Extended DiD

- Abadie (2005), [Semiparametric difference-in-differences estimators](https://doi.org/10.1111/0034-6527.00321): conditional DiD and semiparametric weighting.
- Sant'Anna and Zhao (2020), [Doubly robust difference-in-differences estimators](https://doi.org/10.1016/j.jeconom.2020.06.003): DR-DiD for panel and repeated cross-section data.
- Arkhangelsky et al. (2021), [Synthetic difference-in-differences](https://doi.org/10.1257/aer.20190159): combines DiD and synthetic-control ideas for panel data.
- Imai, Kim, and Wang (2023), [Matching methods for causal inference with time-series cross-sectional data](https://doi.org/10.1111/ajps.12685): matching/generalized DiD for TSCS settings.
- Callaway, Goodman-Bacon, and Sant'Anna (2024/working paper), [Difference-in-differences with a continuous treatment](https://doi.org/10.48550/arXiv.2107.02637): continuous treatment/intensity DiD.
- Baker et al. (2025 working paper), [Difference-in-differences designs: a practitioner's guide](https://doi.org/10.48550/arXiv.2503.13323): broad applied review and estimator guidance.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`did`](https://bcallaway11.github.io/did/) | R | Callaway-Sant'Anna group-time ATT and aggregation | Mature modern staggered DiD implementation | Requires clear cohort, comparison group, and aggregation choice |
| [`fixest`](https://lrberge.github.io/fixest/) | R | Fast FE regressions, Sun-Abraham via `sunab()`, TWFE benchmarks | Efficient, flexible, strong plotting/table ecosystem | TWFE must be treated carefully in staggered settings |
| [`didimputation`](https://cran.r-project.org/package=didimputation) | R | Borusyak-Jaravel-Spiess imputation estimator | Good robust event-study workflow | Requires correct untreated outcome model structure |
| [`did2s`](https://journal.r-project.org/articles/RJ-2022-048/) | R | Gardner two-stage DiD | Fast, convenient, heterogeneity-robust framing | Estimand and inference should be checked against design |
| [`did_multiplegt`](https://cran.r-project.org/package=did_multiplegt) / [`DIDmultiplegtDYN`](https://cran.r-project.org/package=DIDmultiplegtDYN) | R | de Chaisemartin-D'Haultfoeuille estimators, dynamic and multiple-treatment variants | Strong for complex staggered treatment paths | Interface and estimand details require care |
| [`DRDID`](https://psantanna.com/DRDID/) | R | Doubly robust 2x2 DiD for panel or repeated cross-sections | Efficient and transparent conditional DiD | Two-period/two-group core use; multi-period via `did` |
| [`HonestDiD`](https://github.com/asheshrambachan/HonestDiD) | R/Stata | Sensitivity to violations of parallel trends | Report-ready robustness under explicit trend-violation restrictions | Needs event-study estimates and assumptions about deviations |
| [`synthdid`](https://synth-inference.github.io/synthdid/) | R | Synthetic DiD for panel data | Useful when donor fit matters and comparison group is weak | Needs donor pool and pre-treatment fit diagnostics |
| [`PanelMatch`](https://cran.r-project.org/package=PanelMatch) | R | Matching methods for TSCS/panel causal inference | Useful for treatment histories and matched sets | More complex setup and estimand choices |
| [`bacondecomp`](https://cran.r-project.org/package=bacondecomp) | R | Goodman-Bacon TWFE decomposition | Good diagnostic for TWFE weights/comparisons | Diagnostic only; not a primary estimator |
| [`csdid`](https://ideas.repec.org/c/boc/bocode/s458976.html) | Stata | Callaway-Sant'Anna style multi-period DiD | Popular Stata implementation | Requires Stata environment and careful options |
| [`eventstudyinteract`](https://github.com/lsun20/EventStudyInteract) | Stata | Sun-Abraham interaction-weighted event studies | Direct implementation of SA event-study logic | Stata-specific |
| [`did_imputation`](https://github.com/borusyak/did_imputation) | Stata | Borusyak-Jaravel-Spiess imputation estimator | Strong event-study plotting support | Stata-specific |
| [`DoubleML`](https://docs.doubleml.org/dev/guide/models.html#difference-in-differences-models-did) | R/Python | DML/orthogonal DiD with flexible nuisance learners | Useful for conditional parallel trends and ML nuisances | More complex; not a generic staggered DiD replacement |
| [`moderndid`](https://moderndid.readthedocs.io/) | Python | Modern DiD estimators in Python | Broad Python API for modern DiD | Newer ecosystem; validate against known examples |
| [`diff-diff`](https://diff-diff.readthedocs.io/) | Python | Python DiD, event-study, HonestDiD, synthetic DiD workflows | sklearn-like modern DiD interface | Newer ecosystem; review API maturity before production |
| [`statsmodels`](https://www.statsmodels.org/stable/index.html) / [`linearmodels`](https://bashtage.github.io/linearmodels/) | Python | Simple TWFE/event-study benchmarks and clustered SE | Familiar regression tools | Modern staggered DiD must be implemented or handled elsewhere |

## Practical Selection Rules

- Need clean 2x2 ATT: use simple DiD or `DRDID` if covariates/conditional parallel trends matter.
- Need staggered adoption: start with `did`, `fixest::sunab`, `didimputation`, `did2s`, or `did_multiplegt`; do not default to TWFE.
- Need dynamic event-study plot: use estimators that separate cohort and event-time effects; define reference period and anticipation window before plotting.
- Need repeated cross-sections: use `did` or `DRDID` modes that support repeated cross-section data; document composition assumptions.
- Need weak comparison group or aggregate units: consider `synthdid` and ask main to route `06-synthetic-control-time-series`.
- Need conditional parallel trends with many covariates: ask main to route `21-doubly-robust-estimation` or `22-double-machine-learning`; use DR-DiD or DoubleML DiD if the estimator matches the target.
- Need robustness to parallel-trend violations: use `HonestDiD` or comparable sensitivity after event-study estimates are ready.
- Need continuous treatment or intensity: ask main to route `13-dose-response-effects`; do not shoehorn into binary adoption without justification.
- Need simple report benchmark: include TWFE only as a labeled benchmark when modern estimators are the primary evidence.

## Tiny Code Skeletons

Docs checked: 2026-05-31
Primary docs: [did `att_gt`](https://bcallaway11.github.io/did/reference/att_gt.html), [fixest `sunab`](https://lrberge.github.io/fixest/reference/sunab.html)

Reference-only unless main explicitly routes `execution_authorized` after user-confirmed scope. Use only after causal validity is ready or qualified. Verify installed package versions and current docs before running. Do not execute this skeleton from `feedback_only` or `bounded_inspection` mode. Save outputs inside the active `analysis_dir`, update the unit `manifest.json`, and mirror report-relevant source, table, figure, diagnostic, and large-artifact paths into `artifact_index`.

```r
# Tiny sketch, not a complete script.
# Replace id, time, first_treat, Y, and covariates.
library(did)

att <- att_gt(yname = "Y", tname = "time", idname = "id",
              gname = "first_treat", xformla = ~ X1 + X2,
              data = panel_data, panel = TRUE)
event <- aggte(att, type = "dynamic")
```

Artifact outputs to preserve: group-time/event-study table path, pre-trend/event plot path, source code path.
