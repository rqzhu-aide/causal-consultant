# Literature And Software Map

Use this file to choose credible negative-control, empirical-calibration, and proximal causal inference tools. The central distinction is whether the evidence is diagnostic/calibration support or identification support.

## Core Literature

### Negative Controls And Falsification

- Lipsitch, Tchetgen Tchetgen, and Cohen (2010), [Negative controls: a tool for detecting confounding and bias in observational studies](https://dash.harvard.edu/entities/publication/73120379-21f6-6bd4-e053-0100007fdf3b): classic negative-control outcome/exposure framework.
- Tchetgen Tchetgen (2014), [The control outcome calibration approach](https://doi.org/10.1093/aje/kwt303): control-outcome calibration for unobserved confounding.
- Sofer et al. (2016), [On negative outcome control of unobserved confounding as a generalization of difference-in-differences](https://doi.org/10.1214/16-STS558): connects negative control outcomes to bias correction logic.
- Shi, Miao, and Tchetgen Tchetgen (2020), [A selective review of negative control methods in epidemiology](https://doi.org/10.1007/s40471-020-00243-3): overview of negative control design and analysis.
- Penning de Vries and Groenwold (2023), [Negative controls: concepts and caveats](https://doi.org/10.1177/09622802231181230): recent review emphasizing assumptions and caveats.
- Advances in methodologies of negative controls (2024), [scoping review](https://doi.org/10.1016/j.jclinepi.2023.11.002): maps detection, calibration, and correction methods.

### Empirical Calibration

- Schuemie, Ryan, DuMouchel, Suchard, and Madigan (2014), [Interpreting observational studies: why empirical calibration is needed to correct p-values](https://doi.org/10.1002/sim.5925): empirical null calibration using negative controls.
- Schuemie et al. (2018), [Empirical confidence interval calibration for population-level effect estimation studies in observational healthcare data](https://pmc.ncbi.nlm.nih.gov/articles/PMC5856503/): calibrated confidence intervals with negative/positive controls.
- OHDSI, [Book of OHDSI: Method validity](https://ohdsi.github.io/TheBookOfOhdsi/MethodValidity.html): practical large-database negative-control calibration workflow.

### Proxy Variables And Proximal Causal Inference

- Kuroki and Pearl (2014), [Measurement bias and effect restoration in causal inference](https://doi.org/10.1093/biomet/asu009): proxy/measurement-error foundations.
- Miao, Geng, and Tchetgen Tchetgen (2018), [Identifying causal effects with proxy variables of an unmeasured confounder](https://doi.org/10.1093/biomet/asy038): nonparametric proxy identification result.
- Tchetgen Tchetgen, Ying, Cui, Shi, and Miao (2024), [An Introduction to Proximal Causal Inference](https://doi.org/10.1214/23-STS911): broad introduction to proximal causal learning.
- Cui, Pu, Shi, Miao, and Tchetgen Tchetgen (2024), [Semiparametric proximal causal inference](https://doi.org/10.1080/01621459.2023.2191817): proximal doubly robust and efficient estimators.
- Ying et al. (2023), [Proximal causal inference for complex longitudinal studies](https://doi.org/10.1093/jrsssb/qkad025): longitudinal proximal g-methods.
- Zivich et al. (2023), [Introducing proximal causal inference for epidemiologists](https://doi.org/10.1093/aje/kwad077): concise epidemiology-oriented introduction.
- Zivich et al. (2025), [Regression-based proximal causal inference](https://doi.org/10.1093/aje/kwae362): practical regression-based proximal g-computation for common outcome/proxy types.
- Zhang, Li, Miao, and Tchetgen Tchetgen (2023/2024), [Proximal causal inference without uniqueness assumptions](https://pmc.ncbi.nlm.nih.gov/articles/PMC10887303/): solution-set and uniqueness issues.
- Ghassami, Shpitser, and Tchetgen Tchetgen (2023), [Partial identification of causal effects using proxy variables](https://arxiv.org/abs/2304.04374): useful when completeness/point-identification assumptions are too strong.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`EmpiricalCalibration`](https://github.com/OHDSI/EmpiricalCalibration) | R | Empirical null, calibrated p-values, calibrated confidence intervals from many negative/positive controls | Mature OHDSI/HADES package; strong for large standardized healthcare workflows | Needs many credible controls and comparable study estimates |
| [`CohortMethod`](https://ohdsi.github.io/CohortMethod/) | R | Generate comparable observational estimates and negative-control outputs in OHDSI workflows | Integrates with empirical calibration | Healthcare database ecosystem; not general-purpose |
| [`NCOA`](https://dceg.cancer.gov/tools/analysis/ncoadjustment) | R | Negative control outcome adjustment for binary exposure/outcome cohort settings | Implements a specific NCO adjustment idea | Narrow setting; inspect assumptions carefully |
| [`PCL`](https://rdrr.io/cran/PCL/f/) | R | Proximal causal learning functions including h/q bridge components | Directly named proximal package | Sparse/older documentation; validate before production |
| [`pci2s`](https://arxiv.org/abs/2409.08924) | R/research | Regression-based proximal causal inference for right-censored time-to-event data | Useful when survival/censoring and proxies are central | Newer research implementation; ask main to route survival support |
| [`adjustedCurves::surv_prox_aiptw`](https://www.rdocumentation.org/packages/adjustedCurves/versions/0.11.4/topics/surv_prox_aiptw) | R | Proximal AIPTW survival curves | Packaged proximal survival workflow | Specific binary group/survival setting and bridge assumptions |
| [`ivreg`](https://zeileis.github.io/ivreg/) / [`fixest`](https://lrberge.github.io/fixest/) | R | Linear proximal bridge sketches, IV-style bridge equations, transparent sensitivity | Easy to audit and report | Only valid under chosen linear bridge/proxy assumptions |
| [`linearmodels`](https://bashtage.github.io/linearmodels/) | Python | Linear IV-style proximal bridge sketches | Useful Python analog for transparent bridge estimation | Not a dedicated proximal package |
| [`statsmodels`](https://www.statsmodels.org/stable/index.html) | Python | Falsification regressions and control/proxy diagnostics | Mature general modeling | Does not implement proximal identification by itself |
| [`DoubleML`](https://docs.doubleml.org/), [`grf`](https://grf-labs.github.io/grf/), [`SuperLearner`](https://cran.r-project.org/package=SuperLearner), [`xgboost`](https://xgboost.readthedocs.io/) | R/Python | Flexible nuisance/bridge/outcome models after proxy roles are fixed | Useful for high-dimensional or nonlinear settings | ML cannot rescue invalid controls/proxies or untestable bridge assumptions |

## Practical Selection Rules

- Need a simple falsification check: run the same primary estimator on the negative control outcome/exposure and report it as diagnostic evidence.
- Need multiple negative controls in healthcare-style data: use `EmpiricalCalibration`, and pre-specify the control set when possible.
- Need one negative control outcome for bias adjustment: consider NCO adjustment or control-outcome calibration only if shared-bias assumptions are strong.
- Need unmeasured-confounding identification using proxies: use proximal methods only with credible treatment and outcome proxies and interpretable bridge assumptions.
- Need survival outcomes: ask main to route `23-survival-competing-risks`; consider proximal survival tools only if censoring and bridge assumptions are explicit.
- Need longitudinal treatment/confounding: ask main to route `02-longitudinal-gmethods`; simple point-treatment proximal templates are not enough.
- Need flexible ML: use it after the causal/proxy structure is fixed; report learner sensitivity and bridge instability.
- Need report-ready evidence: separate diagnostic, calibration, and identification language; never say a negative control proves absence of bias.

## Tiny Code Skeletons

Docs checked: 2026-05-31
Primary docs: [EmpiricalCalibration reference](https://ohdsi.github.io/EmpiricalCalibration/reference/index.html), [PCL package files](https://rdrr.io/cran/PCL/f/), [adjustedCurves proximal survival reference](https://www.rdocumentation.org/packages/adjustedCurves/versions/0.11.4/topics/surv_prox_aiptw)

Reference-only unless main explicitly routes `execution_authorized` after user-confirmed scope. Use only after causal validity is ready or qualified. Verify installed package versions and current docs before running. Do not execute this skeleton from `feedback_only` or `bounded_inspection` mode. Proximal APIs are research-stage and fragmented; check package docs carefully before using bridge-function code. Save outputs inside the active `analysis_dir`, update the unit `manifest.json`, and mirror report-relevant source, table, figure, diagnostic, and large-artifact paths into `artifact_index`.

```r
# Tiny sketch, not a complete script.
# Repeat the primary estimator shape on negative controls; do not treat this as proof.
primary <- fit_effect(data = analysis_data, outcome = "Y")
nco <- fit_effect(data = analysis_data, outcome = "negative_control_Y")
nce <- fit_effect(data = analysis_data, treatment = "negative_control_A")

# If many controls exist, estimate an empirical null/calibration model from control estimates.
```

Artifact outputs to preserve: primary/control contrast table path, calibration/falsification plot path, source code path.
