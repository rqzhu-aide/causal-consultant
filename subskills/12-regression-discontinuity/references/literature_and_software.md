# Literature and Software Map: Regression Discontinuity

## How to Use This Reference

This is a compact map, not an exhaustive bibliography. Use it to choose a safe RD route, explain the local estimand, and avoid global-polynomial or overgeneralized interpretations.

## Core Lessons

- RD identifies a local effect at a cutoff, not a population-wide ATE.
- The running variable, cutoff, and assignment rule must be known and fixed before outcome analysis.
- Continuity and no precise manipulation are central. Density, covariate, and placebo checks are diagnostics, not proof.
- Local polynomial methods with robust bias-corrected inference are the default modern approach.
- Fuzzy RD is a local IV design and needs a first stage plus IV-like interpretation.

## Foundational and Modern RD Literature

- Hahn, Todd, and van der Klaauw (2001), "Identification and Estimation of Treatment Effects with a Regression-Discontinuity Design." Key lesson: formal identification of sharp and fuzzy RD effects at the cutoff. DOI: <https://doi.org/10.1111/1468-0262.00183>
- Imbens and Lemieux (2008), "Regression discontinuity designs: A guide to practice." Key lesson: practical guide for estimation, bandwidth, graphs, and diagnostics. DOI: <https://doi.org/10.1016/j.jeconom.2007.05.001>
- Lee and Lemieux (2010), "Regression Discontinuity Designs in Economics." Key lesson: comprehensive review of RD assumptions, implementation, and applied interpretation. DOI: <https://doi.org/10.1257/jel.48.2.281>
- McCrary (2008), "Manipulation of the running variable in the regression discontinuity design." Key lesson: density discontinuities can reveal sorting/manipulation around the cutoff. DOI: <https://doi.org/10.1016/j.jeconom.2007.05.005>
- Calonico, Cattaneo, and Titiunik (2014), "Robust Nonparametric Confidence Intervals for Regression-Discontinuity Designs." Key lesson: robust bias-corrected inference improves coverage for local polynomial RD. DOI: <https://doi.org/10.3982/ECTA11757>
- Calonico, Cattaneo, and Titiunik (2015), "`rdrobust`: An R Package for Robust Nonparametric Inference in Regression-Discontinuity Designs." Key lesson: practical software for robust RD estimation and bandwidth selection. DOI: <https://doi.org/10.32614/RJ-2015-004>
- Cattaneo, Jansson, and Ma (2020), "Simple Local Polynomial Density Estimators." Key lesson: modern density estimation/testing around RD cutoffs, implemented in `rddensity`. DOI: <https://doi.org/10.1080/01621459.2019.1635480>
- Cattaneo, Idrobo, and Titiunik, *A Practical Introduction to Regression Discontinuity Designs*. Key lesson: modern applied RD workflow, including continuity-based and local-randomization approaches. Book page: <https://rdpackages.github.io/references/Cattaneo-Idrobo-Titiunik_2020_CUP.pdf>

## Software Map

### R

- `rdrobust`: robust bias-corrected local polynomial RD, bandwidth selection, covariates, clusters, fuzzy RD, mass-point checks, and RD plots. Docs: <https://www.rdocumentation.org/packages/rdrobust/versions/3.0.0/topics/rdrobust>
- `rddensity`: manipulation/density testing and density plots around the cutoff. Docs: <https://www.rdocumentation.org/packages/rddensity/versions/2.6/topics/rddensity>
- `rdlocrand`: local-randomization RD window selection, balance tests, and randomization inference. Docs: <https://rdpackages.github.io/rdlocrand/>

### Python

- `rdrobust`: Python package from the RD Packages ecosystem for estimation and plotting. RD Packages page: <https://rdpackages.github.io/rdrobust/>
- Use `pandas`, `numpy`, `statsmodels`, and plotting libraries for audit tables and custom plots, but prefer `rdrobust` for final RD inference.

## Method Selection Heuristics

- If treatment deterministically changes at the cutoff, start with sharp local polynomial RD.
- If treatment probability jumps but uptake is imperfect, use fuzzy RD and interpret as a local complier effect.
- If the running variable is coarse or has many mass points, check support and mass-point handling before trusting default bandwidths.
- If manipulation is localized at the cutoff, consider a pre-specified donut RD; if manipulation is broad, RD may fail.
- If a narrow window is plausibly randomized, consider local randomization methods.
- If the user wants a broad population effect, explain that RD alone identifies a local effect and suggest other designs or extrapolation only with additional assumptions.
