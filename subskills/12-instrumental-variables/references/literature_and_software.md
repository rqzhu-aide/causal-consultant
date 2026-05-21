# Literature And Software Map

Use this file to choose credible IV, weak-instrument, IV-DML, and Mendelian randomization tools. Keep the main team focused on identification assumptions and local interpretation before software.

## Core Literature

### IV, LATE, And Noncompliance

- Imbens and Angrist (1994), [Identification and estimation of local average treatment effects](https://doi.org/10.2307/2951620): LATE foundations and monotonicity.
- Angrist, Imbens, and Rubin (1996), [Identification of causal effects using instrumental variables](https://doi.org/10.1080/01621459.1996.10476902): CACE/LATE framing for instruments and noncompliance.
- Angrist and Imbens (1995), [Two-stage least squares estimation of average causal effects in models with variable treatment intensity](https://doi.org/10.1080/01621459.1995.10476535): 2SLS and variable treatment intensity interpretation.
- Angrist, Graddy, and Imbens (2000), [The interpretation of instrumental variables estimators in simultaneous equations models](https://doi.org/10.1111/1468-0262.00141): local interpretation in simultaneous-equations settings.
- Imbens (2014), [Instrumental variables: an econometrician's perspective](https://doi.org/10.1214/14-STS480): broad modern review.

### Weak Instruments, Many Instruments, And Robust Inference

- Bound, Jaeger, and Baker (1995), [Problems with instrumental variables estimation when the correlation between the instruments and the endogenous explanatory variable is weak](https://doi.org/10.1080/01621459.1995.10476536): classic weak-IV warning.
- Staiger and Stock (1997), [Instrumental variables regression with weak instruments](https://doi.org/10.2307/2171753): weak-IV asymptotics and consequences.
- Stock and Yogo (2005), [Testing for weak instruments in linear IV regression](https://www.nber.org/papers/t0284): weak-instrument critical-value framework.
- Moreira (2003), [A conditional likelihood ratio test for structural models](https://doi.org/10.1111/1468-0262.00438): weak-instrument-robust inference.
- Andrews, Moreira, and Stock (2006), [Optimal two-sided invariant similar tests for instrumental variables regression](https://doi.org/10.1111/j.1468-0262.2006.00702.x): weak-IV robust testing.
- Montiel Olea and Pflueger (2013), [A robust test for weak instruments](https://doi.org/10.1080/00401706.2013.806694): heteroskedasticity/autocorrelation/cluster-robust effective F logic.
- Andrews, Stock, and Sun (2019), [Weak instruments in instrumental variables regression: theory and practice](https://doi.org/10.1146/annurev-economics-080218-025643): practical weak-IV review.

### High-Dimensional, DML, And Control-Function Support

- Belloni, Chernozhukov, and Hansen (2012/2014), [Inference on treatment effects after selection among high-dimensional controls](https://doi.org/10.1093/restud/rdt044): sparse controls and post-selection inference.
- Chernozhukov et al. (2018), [Double/debiased machine learning for treatment and structural parameters](https://doi.org/10.1111/ectj.12097): orthogonal scores including IV-style targets.
- Newey and Powell (2003), [Instrumental variable estimation of nonparametric models](https://doi.org/10.1111/1468-0262.00459): nonparametric IV foundations.
- Wooldridge (2015), [Control function methods in applied econometrics](https://doi.org/10.1257/jhr.50.2.420): control-function approach and interpretation.

### Mendelian Randomization

- Davey Smith and Ebrahim (2003), [Mendelian randomization: can genetic epidemiology contribute to understanding environmental determinants of disease?](https://doi.org/10.1093/ije/dyg070): MR framing.
- Lawlor et al. (2008), [Mendelian randomization: using genes as instruments for making causal inferences in epidemiology](https://doi.org/10.1002/sim.3034): MR assumptions and applied issues.
- Burgess, Butterworth, and Thompson (2013), [Mendelian randomization analysis with multiple genetic variants using summarized data](https://doi.org/10.1002/sim.5753): summary-data MR and multiple variants.
- Bowden, Davey Smith, and Burgess (2015), [Mendelian randomization with invalid instruments: effect estimation and bias detection through Egger regression](https://doi.org/10.1093/ije/dyv080): MR-Egger.
- Bowden et al. (2016), [Consistent estimation in Mendelian randomization with some invalid instruments using a weighted median estimator](https://doi.org/10.1002/sim.6930): weighted median sensitivity.
- Hartwig, Davey Smith, and Bowden (2017), [Robust inference in summary data Mendelian randomization via the zero modal pleiotropy assumption](https://doi.org/10.1093/ije/dyx102): mode-based MR.
- Verbanck et al. (2018), [Detection of widespread horizontal pleiotropy in Mendelian randomization](https://doi.org/10.1038/s41588-018-0099-7): MR-PRESSO.
- Sanderson et al. (2019), [An examination of multivariable Mendelian randomization in the single-sample and two-sample summary data settings](https://doi.org/10.1093/ije/dyy262): multivariable MR guidance.
- Davies, Holmes, and Davey Smith (2018), [Reading Mendelian randomisation studies: a guide, glossary, and checklist](https://doi.org/10.1136/bmj.k601): practical MR interpretation checklist.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`ivreg`](https://search.r-project.org/CRAN/refmans/ivreg/html/ivreg.html) | R | 2SLS/IV regression with diagnostics | Modern standalone IV regression and diagnostic tooling | Validity assumptions remain external |
| [`AER::ivreg`](https://cran.r-project.org/package=AER) | R | Classic IV examples and diagnostics | Familiar in applied econometrics | Prefer `ivreg` or `estimatr` for newer workflows |
| [`estimatr::iv_robust`](https://search.r-project.org/CRAN/refmans/estimatr/html/iv_robust.html) | R | 2SLS with robust/clustered SE in design-based work | Good defaults for robust SE and experiment/encouragement designs | Limited weak-IV robust inference |
| [`fixest::feols`](https://lrberge.github.io/fixest/) | R | Fast IV with fixed effects and clustered SE | Excellent for large FE specifications | Weak-IV diagnostics may require extra tools |
| [`ivmodel`](https://cran.r-project.org/package=ivmodel) | R | Weak-IV robust intervals and sensitivity for one endogenous variable | Useful AR/CLR-style inference and sensitivity | Scope narrower than general IV regression |
| [`ivDiag`](https://cran.r-project.org/package=ivDiag) | R | IV diagnostics and weak-instrument reporting | Practical diagnostic helper | Diagnostic support only |
| [`DoubleML`](https://docs.doubleml.org/) | R/Python | PLIV/IIVM/orthogonal IV with ML nuisances | Strong DML ecosystem and cross-fitting | Requires correct score/model and IV assumptions |
| [`EconML`](https://www.pywhy.org/EconML/) | Python | DMLIV, OrthoIV, DRIV, heterogeneous IV | Flexible sklearn-compatible IV ML | Many estimators; target choice can be confusing |
| [`linearmodels`](https://bashtage.github.io/linearmodels/) | Python | IV2SLS, IVGMM, panel-style IV workflows | Mature Python IV package | Some weak-IV diagnostics need manual supplement |
| [`ivmodels`](https://ivmodels.readthedocs.io/) | Python | Weak-IV robust tests and confidence sets | AR/LM/CLR-style inference support | Newer, specialized package |
| [`statsmodels`](https://www.statsmodels.org/) | Python | Baseline regression and diagnostics around IV workflows | Familiar ecosystem | IV functionality is less complete than `linearmodels` |
| [`ivreg2`](https://ideas.repec.org/c/boc/bocode/s425401.html) | Stata | Advanced IV/GMM diagnostics, weak-IV tests | Very mature Stata ecosystem | Stata-specific |
| [`weakiv`](https://ideas.repec.org/c/boc/bocode/s457684.html) / `weakivtest` | Stata | Weak-IV robust inference and tests | Strong weak-IV reporting | Stata-specific |
| [`MendelianRandomization`](https://search.r-project.org/CRAN/refmans/MendelianRandomization/html/00Index.html) | R | Summary-data MR, IVW, MR-Egger, median/mode, multivariable MR | Broad MR method collection | User must harmonize/check variants carefully |
| [`TwoSampleMR`](https://mrcieu.github.io/TwoSampleMR/) | R | Two-sample MR with OpenGWAS integration | Very practical extraction/harmonization/sensitivity workflow | Database/API and ancestry/sample-overlap checks matter |
| [`MRPRESSO`](https://mrcieu.r-universe.dev/MRPRESSO/doc/readme) | R | Horizontal pleiotropy and outlier diagnostics | Useful pleiotropy sensitivity | Does not prove no pleiotropy |
| [`MVMR`](https://wspiller.github.io/MVMR/) | R | Multivariable MR and conditional instrument strength | Good for correlated exposures | Interpretation and conditional strength can be difficult |
| [`CAUSE`](https://github.com/jean997/cause) / [`coloc`](https://cran.r-project.org/package=coloc) | R | Correlated/pleiotropic genetic effects and colocalization support | Useful MR sensitivity around shared loci | Advanced assumptions and setup |

## Practical Selection Rules

- Need transparent noncompliance analysis: report ITT/reduced form, then CACE/LATE with `estimatr::iv_robust`, `ivreg`, or `linearmodels` if assumptions hold.
- Need many fixed effects: use `fixest` or `linearmodels`, but supplement weak-IV diagnostics.
- Need weak-instrument robustness: use Anderson-Rubin/CLR-style intervals via `ivmodel`, `ivmodels`, or Stata `ivreg2`/`weakiv`.
- Need high-dimensional controls or flexible nuisance learners: use `DoubleML` or `EconML`, coordinated with `32-double-machine-learning`.
- Need nonlinear outcome: decide whether a linear IV estimand is acceptable before using nonlinear/control-function methods.
- Need MR summary-data analysis: use `TwoSampleMR` for extraction/harmonization and `MendelianRandomization` for method breadth; include pleiotropy and heterogeneity diagnostics.
- Need MR with suspected pleiotropy: use MR-Egger, weighted median/mode, MR-PRESSO, multivariable MR, and domain review; do not treat sensitivity methods as automatic validation.
- Need report-ready IV: include first stage, reduced form, IV estimate, weak-IV diagnostics, assumption table, local interpretation, and falsification/sensitivity checks.
