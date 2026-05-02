# Literature and Software Map: Difference-in-Differences and Event Studies

## How to Use This Reference

This is a compact map, not an exhaustive bibliography. Use it to choose a DiD/event-study estimator, explain why naive TWFE can fail, and plan diagnostics for parallel trends, anticipation, composition, spillovers, and inference.

## Core Lessons

- DiD identifies treated-unit effects by comparing changes over time against credible comparison trends.
- In staggered adoption settings with heterogeneous effects, naive TWFE and TWFE event-study coefficients can be misleading.
- Modern DiD workflows usually target group-time ATT and then aggregate to dynamic, group, calendar, or overall effects.
- Pretrend tests and plots are useful diagnostics, but they do not prove parallel trends.
- Control-group choice, anticipation windows, composition changes, and spillovers often matter as much as the estimator.

## Foundational and Modern DiD Literature

- Card and Krueger (1994), "Minimum Wages and Employment: A Case Study of the Fast-Food Industry in New Jersey and Pennsylvania." Key lesson: canonical applied DiD design with treated and comparison regions. DOI: <https://doi.org/10.3386/w4509>
- Bertrand, Duflo, and Mullainathan (2004), "How Much Should We Trust Differences-in-Differences Estimates?" Key lesson: serial correlation can severely understate uncertainty; cluster and design-aware inference matter. DOI: <https://doi.org/10.1162/003355304772839588>
- Sant'Anna and Zhao (2020), "Doubly Robust Difference-in-Differences Estimators." Key lesson: DR DiD estimators combine outcome regression and propensity weighting under conditional parallel trends. DOI: <https://doi.org/10.1016/j.jeconom.2020.06.003>
- Callaway and Sant'Anna (2021), "Difference-in-Differences with Multiple Time Periods." Key lesson: group-time ATT estimands avoid many TWFE problems and can be aggregated transparently. DOI: <https://doi.org/10.1016/j.jeconom.2020.12.001>
- Sun and Abraham (2021), "Estimating dynamic treatment effects in event studies with heterogeneous treatment effects." Key lesson: TWFE event-study leads/lags can be contaminated under staggered timing and heterogeneous effects. DOI: <https://doi.org/10.1016/j.jeconom.2020.09.006>
- Goodman-Bacon (2021), "Difference-in-differences with variation in treatment timing." Key lesson: TWFE with staggered timing is a weighted average of 2x2 comparisons and can be biased when effects vary over time. DOI: <https://doi.org/10.1016/j.jeconom.2021.03.014>
- de Chaisemartin and D'Haultfoeuille (2020), "Two-Way Fixed Effects Estimators with Heterogeneous Treatment Effects." Key lesson: TWFE can use negative weights and produce misleading estimates under heterogeneity. DOI: <https://doi.org/10.1257/aer.20181169>
- Rambachan and Roth (2023), "A More Credible Approach to Parallel Trends." Key lesson: sensitivity analysis can quantify conclusions under bounded violations of parallel trends. DOI: <https://doi.org/10.1093/restud/rdad018>
- Borusyak, Jaravel, and Spiess (2024), "Revisiting Event-Study Designs: Robust and Efficient Estimation." Key lesson: imputation-based event-study estimation handles staggered adoption and heterogeneous effects. DOI: <https://doi.org/10.1093/restud/rdae007>
- Roth et al. (2023), "What's Trending in Difference-in-Differences?" Key lesson: recent DiD practice requires careful estimand definition, pretrend interpretation, and robust estimator choice. DOI: <https://doi.org/10.1016/j.jeconom.2023.03.008>

## Software Map

### R

- `did`: Callaway-Sant'Anna group-time ATT, dynamic/group/calendar aggregations, not-yet-treated/never-treated controls, covariates, and plots. Docs: <https://www.rdocumentation.org/packages/did/versions/2.3.0/topics/att_gt>
- `fixest`: fast fixed-effects estimation and `sunab()` for Sun-Abraham event studies. Docs: <https://lrberge.github.io/fixest/reference/sunab.html>
- `DRDID`: doubly robust DiD for two-period two-group panel and repeated cross-section settings. Docs: <https://www.rdocumentation.org/packages/DRDID/versions/1.2.3>
- `did2s`: two-stage DiD and event-study helper functions comparing modern estimators. Docs: <https://www.rdocumentation.org/packages/did2s/versions/1.2.0/topics/did2s>
- `HonestDiD`: robust inference under weaker parallel-trends assumptions. Docs: <https://www.rdocumentation.org/packages/HonestDiD/versions/0.2.6>
- `bacondecomp`: TWFE decomposition diagnostic; useful for explaining problems, not usually the final estimator.

### Python

- Python is useful for data construction, plotting, and simple DiD, but R is currently the safer default for modern staggered-adoption DiD workflows with established packages.
- If the user requires Python, confirm that the chosen package supports the estimand, treatment timing, control group, clustering, and diagnostics.

## Method Selection Heuristics

- If there are multiple treatment cohorts, start with group-time ATT or an equivalent modern staggered-adoption estimator.
- If the user wants event-time dynamics, use Sun-Abraham, Callaway-Sant'Anna dynamic aggregation, or imputation-based event-study methods rather than naive TWFE leads/lags.
- If there are only two groups and two periods, classical or doubly robust DiD may be enough.
- If parallel trends is uncertain, use placebo/pretrend checks and sensitivity analysis rather than a single definitive estimate.
- If there are very few treated aggregate units, consider synthetic control.
- If spillovers or contaminated controls are plausible, route to interference or redesign the comparison.
