# Instrumental Variables Bibliography

This file lists core references for the instrumental-variables subskill. Use these to support theory explanations, diagnostics, and user-facing recommendations.

## Foundational LATE and IV

1. Imbens, Guido W., and Joshua D. Angrist. 1994. “Identification and Estimation of Local Average Treatment Effects.” *Econometrica* 62(2): 467–475.  
   Use for LATE definition, compliers, monotonicity, and local interpretation.

2. Angrist, Joshua D., Guido W. Imbens, and Donald B. Rubin. 1996. “Identification of Causal Effects Using Instrumental Variables.” *Journal of the American Statistical Association* 91(434): 444–455.  
   Use for potential-outcome assumptions behind IV.

3. Angrist, Joshua D., and Alan B. Krueger. 1991. “Does Compulsory School Attendance Affect Schooling and Earnings?” *Quarterly Journal of Economics* 106(4): 979–1014.  
   Classic empirical IV example.

4. Angrist, Joshua D., and Jörn-Steffen Pischke. 2009. *Mostly Harmless Econometrics*. Princeton University Press.  
   Use for applied IV workflow, first stage, reduced form, LATE language, and diagnostics.

## Weak instruments and inference

5. Staiger, Douglas, and James H. Stock. 1997. “Instrumental Variables Regression with Weak Instruments.” *Econometrica* 65(3): 557–586.  
   Use for weak-instrument asymptotics and the common first-stage F rule-of-thumb context.

6. Stock, James H., and Motohiro Yogo. 2005. “Testing for Weak Instruments in Linear IV Regression.” In *Identification and Inference for Econometric Models*, edited by Donald W. K. Andrews and James H. Stock. Cambridge University Press.  
   Use for Stock–Yogo critical values and formal weak-instrument testing in classical linear IV settings.

7. Andrews, Isaiah, James H. Stock, and Liyang Sun. 2019. “Weak Instruments in Instrumental Variables Regression: Theory and Practice.” *Annual Review of Economics* 11: 727–753.  
   Use for modern weak-IV guidance, especially with heteroskedasticity, serial correlation, and clustering.

8. Lee, David S., Justin McCrary, Marcelo J. Moreira, and Jack Porter. 2022. “Valid t-Ratio Inference for IV.” *American Economic Review* 112(10): 3260–3290.  
   Use for the caution that conventional t-ratio inference can remain distorted even when the first-stage F exceeds common thresholds.

9. Anderson, T. W., and Herman Rubin. 1949. “Estimation of the Parameters of a Single Equation in a Complete System of Stochastic Equations.” *Annals of Mathematical Statistics* 20(1): 46–63.  
   Use for Anderson–Rubin weak-IV-robust testing ideas.

## Sensitivity and imperfect validity

10. Conley, Timothy G., Christian B. Hansen, and Peter E. Rossi. 2012. “Plausibly Exogenous.” *Review of Economics and Statistics* 94(1): 260–272.  
    Use for sensitivity analysis under possible exclusion violations.

11. Baiocchi, Michael, Jing Cheng, and Dylan S. Small. 2014. “Instrumental Variable Methods for Causal Inference.” *Statistics in Medicine* 33(13): 2297–2340.  
    Useful broad review for biomedical and applied audiences.

## High-dimensional IV and machine learning

12. Chernozhukov, Victor, Denis Chetverikov, Mert Demirer, Esther Duflo, Christian Hansen, Whitney Newey, and James Robins. 2018. “Double/Debiased Machine Learning for Treatment and Structural Parameters.” *The Econometrics Journal* 21(1): C1–C68.  
    Use for DML theory, orthogonal scores, and cross-fitting.

13. Bach, Philipp, Victor Chernozhukov, Malte S. Kurz, and Martin Spindler. 2022. “DoubleML — An Object-Oriented Implementation of Double Machine Learning in Python.” *Journal of Machine Learning Research* 23(53): 1–6.  
    Use for Python DoubleML package citation.

14. Bach, Philipp, Victor Chernozhukov, Sven Klaassen, Malte S. Kurz, and Martin Spindler. 2024. “DoubleML: An Object-Oriented Implementation of Double Machine Learning in R.” *Journal of Statistical Software* 108(3): 1–56.  
    Use for R DoubleML package citation.

## Software references

15. Fox, John, Christian Kleiber, Achim Zeileis, and contributors. `ivreg`: Instrumental-Variables Regression by 2SLS, 2SM, or 2SMM, with Diagnostics. CRAN package.  
    Use for R 2SLS and diagnostics.

16. Berge, Laurent, and Grant McDermott. `fixest`: Fast Fixed-Effects Estimations. CRAN package.  
    Use for fixed-effect IV, clustered SEs, and large econometric applications.

17. Sheppard, Kevin. `linearmodels`: Linear Models for Python.  
    Use for Python IV2SLS, LIML, GMM, first-stage diagnostics, and overidentification tests.
