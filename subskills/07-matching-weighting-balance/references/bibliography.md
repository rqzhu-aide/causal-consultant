# Bibliography: Matching, Weighting, and Balance

## Foundational propensity score and matching papers

- Rosenbaum, P. R., and Rubin, D. B. (1983). “The Central Role of the Propensity Score in Observational Studies for Causal Effects.” *Biometrika*, 70(1), 41–55. DOI: 10.1093/biomet/70.1.41.
- Rosenbaum, P. R., and Rubin, D. B. (1985). “Constructing a Control Group Using Multivariate Matched Sampling Methods That Incorporate the Propensity Score.” *The American Statistician*, 39(1), 33–38.
- Ho, D. E., Imai, K., King, G., and Stuart, E. A. (2007). “Matching as Nonparametric Preprocessing for Reducing Model Dependence in Parametric Causal Inference.” *Political Analysis*, 15(3), 199–236. DOI: 10.1093/pan/mpl013.
- Stuart, E. A. (2010). “Matching Methods for Causal Inference: A Review and a Look Forward.” *Statistical Science*, 25(1), 1–21. DOI: 10.1214/09-STS313.
- Austin, P. C. (2011). “An Introduction to Propensity Score Methods for Reducing the Effects of Confounding in Observational Studies.” *Multivariate Behavioral Research*, 46(3), 399–424. DOI: 10.1080/00273171.2011.568786.

## Matching estimators and inference

- Abadie, A., and Imbens, G. W. (2006). “Large Sample Properties of Matching Estimators for Average Treatment Effects.” *Econometrica*, 74(1), 235–267. DOI: 10.1111/j.1468-0262.2006.00655.x.
- Abadie, A., and Imbens, G. W. (2008). “On the Failure of the Bootstrap for Matching Estimators.” *Econometrica*, 76(6), 1537–1557. DOI: 10.3982/ECTA6474.
- Abadie, A., and Imbens, G. W. (2011). “Bias-Corrected Matching Estimators for Average Treatment Effects.” *Journal of Business & Economic Statistics*, 29(1), 1–11. DOI: 10.1198/jbes.2009.07333.
- Abadie, A., and Imbens, G. W. (2016). “Matching on the Estimated Propensity Score.” *Econometrica*, 84(2), 781–807. DOI: 10.3982/ECTA11293.
- Austin, P. C. (2011). “Optimal Caliper Widths for Propensity-Score Matching When Estimating Differences in Means and Differences in Proportions in Observational Studies.” *Pharmaceutical Statistics*, 10(2), 150–161. DOI: 10.1002/pst.433.

## Weighting, overlap weights, and balance optimization

- Robins, J. M., Hernán, M. A., and Brumback, B. (2000). “Marginal Structural Models and Causal Inference in Epidemiology.” *Epidemiology*, 11(5), 550–560.
- Hirano, K., Imbens, G. W., and Ridder, G. (2003). “Efficient Estimation of Average Treatment Effects Using the Estimated Propensity Score.” *Econometrica*, 71(4), 1161–1189.
- Imai, K., and Ratkovic, M. (2014). “Covariate Balancing Propensity Score.” *Journal of the Royal Statistical Society: Series B*, 76(1), 243–263. DOI: 10.1111/rssb.12027.
- Hainmueller, J. (2012). “Entropy Balancing for Causal Effects: A Multivariate Reweighting Method to Produce Balanced Samples in Observational Studies.” *Political Analysis*, 20(1), 25–46. DOI: 10.1093/pan/mpr025.
- Li, F., Morgan, K. L., and Zaslavsky, A. M. (2018). “Balancing Covariates via Propensity Score Weighting.” *Journal of the American Statistical Association*, 113(521), 390–400. DOI: 10.1080/01621459.2016.1260466.
- Li, F., Thomas, L. E., and Li, F. (2019). “Addressing Extreme Propensity Scores via the Overlap Weights.” *American Journal of Epidemiology*, 188(1), 250–257. DOI: 10.1093/aje/kwy201.
- Zubizarreta, J. R. (2015). “Stable Weights That Balance Covariates for Estimation With Incomplete Outcome Data.” *Journal of the American Statistical Association*, 110(511), 910–922. DOI: 10.1080/01621459.2015.1023805.
- Austin, P. C., and Stuart, E. A. (2015). “Moving Towards Best Practice When Using Inverse Probability of Treatment Weighting (IPTW) Using the Propensity Score to Estimate Causal Treatment Effects in Observational Studies.” *Statistics in Medicine*, 34(28), 3661–3679. DOI: 10.1002/sim.6607.

## Coarsened exact, genetic, and optimal matching

- Iacus, S. M., King, G., and Porro, G. (2012). “Causal Inference Without Balance Checking: Coarsened Exact Matching.” *Political Analysis*, 20(1), 1–24. DOI: 10.1093/pan/mpr013.
- Hansen, B. B., and Klopfer, S. O. (2006). “Optimal Full Matching and Related Designs via Network Flows.” *Journal of Computational and Graphical Statistics*, 15(3), 609–627. DOI: 10.1198/106186006X137047.
- Sekhon, J. S. (2011). “Multivariate and Propensity Score Matching Software with Automated Balance Optimization: The Matching Package for R.” *Journal of Statistical Software*, 42(7), 1–52. DOI: 10.18637/jss.v042.i07.

## Diagnostics and reporting

- Austin, P. C. (2009). “Balance Diagnostics for Comparing the Distribution of Baseline Covariates Between Treatment Groups in Propensity-Score Matched Samples.” *Statistics in Medicine*, 28(25), 3083–3107. DOI: 10.1002/sim.3697.
- Greifer, N. (cobalt documentation). “Covariate Balance Tables and Plots: A Guide to the cobalt Package.” CRAN/pkgdown documentation.
- Greifer, N. (MatchIt documentation). “Assessing Balance” and “Estimating Effects After Matching.” MatchIt pkgdown documentation.

## Software documentation

- `MatchIt`: https://cran.r-project.org/package=MatchIt and https://kosukeimai.github.io/MatchIt/
- `WeightIt`: https://cran.r-project.org/package=WeightIt and https://ngreifer.github.io/WeightIt/
- `cobalt`: https://cran.r-project.org/package=cobalt and https://ngreifer.github.io/cobalt/
- `optmatch`: https://cran.r-project.org/package=optmatch
- `Matching`: https://cran.r-project.org/package=Matching
- `CBPS`: https://cran.r-project.org/package=CBPS
- `PSweight`: https://cran.r-project.org/package=PSweight
- `DoWhy`: https://www.pywhy.org/dowhy/
- `causalml`: https://causalml.readthedocs.io/
- `zEpid`: https://zepid.readthedocs.io/
