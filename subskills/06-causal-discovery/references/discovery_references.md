# Causal Discovery References

Last refreshed: 2026-05-21.

Use these links as orientation anchors, not as proof that a method fits a project. Always route discovery implications back through `domain_expert`, `data_analyst`, and `method_lead` before they affect claims, adjustment, gates, or report wording.

## General Tooling

- causal-learn JMLR paper: https://jmlr.org/papers/volume25/23-0970/23-0970.pdf
- causal-learn documentation: https://causal-learn.readthedocs.io/en/latest/
- causal-learn search-method index: https://causal-learn.readthedocs.io/en/latest/search_methods_index/index.html
- causal-learn GitHub: https://github.com/py-why/causal-learn
- Tetrad project: https://www.cmu.edu/dietrich/philosophy/tetrad/
- Tetrad Java docs: https://www.phil.cmu.edu/tetrad-javadocs/
- Causal-cmd docs: https://bd2kccd.github.io/docs/causal-cmd/

## R And Python Packages

- pcalg CRAN: https://cran.r-project.org/package=pcalg
- pcalg manual: https://cran.r-universe.dev/pcalg/doc/manual.html
- bnlearn CRAN: https://cran.r-project.org/package=bnlearn
- bnlearn documentation: https://www.bnlearn.com/documentation/
- bnlearn causal discovery docs: https://www.bnlearn.com/documentation/man/causal.discovery.html
- causalDisco CRAN: https://cran.r-project.org/package=causalDisco
- Tigramite documentation: https://jakobrunge.github.io/tigramite/
- Tigramite GitHub: https://github.com/jakobrunge/tigramite
- lingam documentation: https://lingam.readthedocs.io/
- py-tetrad GitHub: https://github.com/cmu-phil/py-tetrad
- DAGMA GitHub: https://github.com/kevinsbello/dagma
- NOTEARS GitHub: https://github.com/xunzheng/notears

## Method Families To Keep In View

- Constraint-based discovery: PC, stable-PC, FCI, RFCI, GFCI, and related PAG/CPDAG workflows.
- Score/permutation search: GES, FGES, GIES, GRaSP, BOSS, and package-specific variants.
- Functional-model discovery: LiNGAM, DirectLiNGAM, ICA-LiNGAM, VAR-LiNGAM, additive-noise, and post-nonlinear models.
- Time-series discovery: PCMCI, PCMCI+, LPCMCI, Granger-style screening, VAR-LiNGAM, CD-NOD, and Tetrad SVAR workflows.
- Text/LLM-assisted discovery: COAT-style factor proposal and annotation before graph learning.
- Interventional/multi-environment discovery: GIES, IMaGES-style workflows, CD-NOD, and context-aware sensitivity checks.
- High-dimensional settings: variable reduction, local discovery, stability selection, and scalable score/permutation methods before broad graph claims.
- Differentiable/optimization-style discovery: NOTEARS, nonlinear NOTEARS variants, GOLEM, DAGMA, and neural DAG learners. Use these as screening or benchmark tools unless assumptions, regularization, tuning, and stability are carefully documented.
- Local discovery: target-neighborhood or exposure-outcome local graph learning when a full graph is too large or not needed for the user's question.

## Review And Benchmark Anchors

- Heinze-Deml, Maathuis, and Meinshausen, "Causal Structure Learning" (Annual Review of Statistics and Its Application, 2018): https://www.annualreviews.org/doi/10.1146/annurev-statistics-031017-100630
- Glymour, Zhang, and Spirtes, "Review of Causal Discovery Methods Based on Graphical Models" (Frontiers in Genetics, 2019): https://www.frontiersin.org/articles/10.3389/fgene.2019.00524/full
- Nogueira et al., "Causal Discovery in Machine Learning: Theories and Applications" (JMLR, 2022): https://www.jmlr.org/papers/v23/20-1174.html
- Vowels, Camgoz, and Bowden, "A Survey on Causal Discovery: Theory and Practice" (arXiv, 2023): https://arxiv.org/abs/2305.10032
- Cunningham, "An Introduction to Causal Discovery" (arXiv, 2024): https://arxiv.org/abs/2407.08602
- Reisach et al., "Assumption violations in causal discovery and the robustness of score matching" (NeurIPS, 2023): https://proceedings.neurips.cc/paper_files/paper/2023/file/93ed74938a54a73b5e4c52bbaf42ca8e-Paper-Conference.pdf
- Mogensen et al., benchmark dataset for causal discovery from time series data (PMLR, 2024): https://proceedings.mlr.press/v236/mogensen24a/mogensen24a.pdf
- Ganian, Korchemna, and Szeider, "Revisiting Causal Discovery from a Complexity-Theoretic Perspective" (IJCAI, 2024): https://www.ijcai.org/proceedings/2024/374
- Runge et al., PCMCI and time-series causal discovery literature via Tigramite docs: https://jakobrunge.github.io/tigramite/
- Zheng et al., "DAGs with NO TEARS: Continuous Optimization for Structure Learning" (NeurIPS, 2018): https://papers.neurips.cc/paper/8157-dags-with-no-tears-continuous-optimization-for-structure-learning
- Ng et al., "On the Role of Sparsity and DAG Constraints for Learning Linear DAGs" (NeurIPS, 2020): https://proceedings.neurips.cc/paper/2020/hash/d04d42cdf14579cd294e5079e0745411-Abstract.html
- Bello, Aragam, and Ravikumar, "DAGMA: Learning DAGs via M-matrices and a Log-Determinant Acyclicity Characterization" (NeurIPS, 2022): https://proceedings.neurips.cc/paper_files/paper/2022/hash/36e2967f87c3362e37cf988781a887ad-Abstract-Conference.html
- Maasch et al., "Local Discovery by Partitioning: Polynomial-Time Causal Discovery Around Exposure-Outcome Pairs" (UAI/PMLR, 2024): https://proceedings.mlr.press/v244/maasch24a.html

## Safety Reminders

- Discovery output is a graph hypothesis, not proof.
- CPDAG/PAG output often represents equivalence and uncertainty, not a unique DAG.
- Hidden confounding, selection, non-IID structure, measurement error, and preprocessing can all create misleading edges.
- Do not use discovered adjustment hints without `method_lead` review.
- Ask `data_analyst` to vet preprocessing, imputation, annotation, feature construction, non-IID structure, and leakage before graph artifacts influence the main project.
- Discovery-only reports should use exploratory language and should not imply treatment-effect estimation.
