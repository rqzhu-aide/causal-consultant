# Literature and Software Map: DAGs and Identification

## How to Use This Reference

This is a compact map, not an exhaustive bibliography. Use it to audit the causal structure of the current design plan, choose safe graph tools, and avoid overstating what a DAG or software check can prove.

## Core Lessons

- A DAG is an assumption map. It combines subject-matter knowledge with graphical rules; it is not learned or validated automatically by a regression.
- Identification comes before estimation. A good estimator cannot repair a structurally invalid adjustment set.
- Adjustment is only one identification strategy. IV, front-door, mediation, g-methods, RD, DiD, selection models, transportability, and prospective design may be needed instead.
- Graphical tools can check consequences of a supplied graph, enumerate adjustment sets, and reveal forbidden variables. They cannot prove the graph is true.
- A target-trial protocol is often the most useful structure to audit a design plan because it forces treatment, comparator, eligibility, time zero, outcome, and follow-up to be explicit. The design planner owns the active design proposal; DAG builder audits the causal logic.
- A route hypothesis is not feasible merely because its graph can be drawn. Treat graph alternatives as provisional until design feasibility, data support, and domain plausibility are checked by the other foundation evaluators.

## Foundational Graphical Causal Inference

- Pearl (1995), "Causal Diagrams for Empirical Research." Key lesson: graphs combine statistical and subject-matter information and can be queried for identifiability of nonexperimental causal effects. DOI: <https://doi.org/10.1093/biomet/82.4.669>
- Pearl, *Causality: Models, Reasoning, and Inference* (2nd ed., 2009). Key lesson: structural causal models, do-calculus, backdoor/front-door reasoning, and graphical identification provide the formal backbone.
- Greenland, Pearl, and Robins (1999), "Causal Diagrams for Epidemiologic Research." Key lesson: DAGs clarify confounding, selection, and why traditional confounder-selection heuristics can fail. DOI: <https://doi.org/10.1097/00001648-199901000-00008>
- Pearl, Glymour, and Jewell, *Causal Inference in Statistics: A Primer* (2016). Key lesson: accessible introduction to DAGs, interventions, backdoor, front-door, and mediation.

## Adjustment and Identification Criteria

- Shpitser, VanderWeele, and Robins (2010), "On the validity of covariate adjustment for estimating causal effects." Key lesson: adjustment validity has a complete graphical criterion; not every pre-treatment variable is safe or useful to adjust for. Publication page: <https://pure.johnshopkins.edu/en/publications/on-the-validity-of-covariate-adjustment-for-estimating-causal-eff/>
- Perkovic, Textor, Kalisch, and Maathuis (2018), "Complete Graphical Characterization and Construction of Adjustment Sets in Markov Equivalence Classes of Ancestral Graphs." Key lesson: generalized adjustment criteria cover DAGs, CPDAGs, MAGs, and PAGs and support robust adjustment across graph uncertainty. JMLR page: <https://jmlr.org/beta/papers/v18/16-319.html>
- Shpitser and Pearl (2006), "Identification of Joint Interventional Distributions in Recursive Semi-Markovian Causal Models." Key lesson: the ID algorithm gives a complete graphical characterization for many interventional distributions with latent variables. AAAI page: <https://aaai-24.aaai.org/Library/AAAI/2006/aaai06-191.php>
- Tikka and Karvanen (2017), "Identifying Causal Effects with the R Package causaleffect." Key lesson: `causaleffect` implements ID-style identification and helps when simple adjustment is insufficient. DOI: <https://doi.org/10.18637/jss.v076.i12>

## Target-Trial and Applied Structure

- Hernan and Robins, *Causal Inference: What If*. Key lesson: consistency, exchangeability, positivity, target trials, and time ordering are the applied bridge between causal questions and valid analysis. Official PDF: <https://www.hsph.harvard.edu/miguel-hernan/wp-content/uploads/sites/1268/2024/04/hernanrobins_WhatIf_26apr24.pdf>
- Hernan and Robins (2016), "Using Big Data to Emulate a Target Trial When a Randomized Trial Is Not Available." Key lesson: define the hypothetical trial first to avoid design flaws such as immortal time and misaligned eligibility. DOI: <https://doi.org/10.1093/aje/kwv254>
- Matthews et al. (2022), "Target trial emulation: applying principles of randomised trials to observational studies." Key lesson: target-trial emulation helps turn observational analyses into explicit treatment strategies, eligibility, assignment, follow-up, and estimands. BMJ page: <https://www.bmj.com/content/378/bmj-2022-071108>

## Software Map

### R

- `dagitty`: first-line tool for DAG adjustment sets, d-separation, implied conditional independencies, equivalent models, instruments, and graph visualization. Docs: <https://www.rdocumentation.org/packages/dagitty/versions/0.3-4>
- `ggdag`: tidy visualization and workflow wrapper around `dagitty`, useful for clean reporting graphics.
- `causaleffect`: implements ID-style derivation of interventional distributions when the effect is identifiable but not through ordinary adjustment. Docs: <https://www.rdocumentation.org/packages/causaleffect/versions/1.0/topics/causaleffect-package>
- `pcalg`: use for discovery/equivalence-class tasks, not routine confounder selection; coordinate with `subskills/18-causal-discovery/`.

### Python

- `DoWhy`: model-identify-estimate-refute workflow with graph-based identification, including backdoor, IV, front-door, and mediation routes. Docs: <https://www.pywhy.org/dowhy/v0.9.1/user_guide/effect_inference/identify.html>
- `networkx` and `graphviz`: useful for lightweight graph construction and visualization.
- `causal-learn`: discovery-oriented package; coordinate with `subskills/18-causal-discovery/`.

## Analytic Handoff Heuristics

- If the user asks "what should I adjust for", start with variable timing and a DAG or role map, then use `dagitty` to check adjustment sets.
- If the graph has unmeasured common causes between treatment and outcome, ordinary adjustment is not enough; consider sensitivity analysis, IV, front-door, RD, DiD, or prospective design only if the required structure is plausible.
- If the user wants a direct or indirect effect, route to mediation before choosing adjustment variables.
- If selection into the dataset or complete-case analysis depends on treatment or outcome risk, route to `02-data-technician` before final estimation.
- If the user has a graph learned from data, treat it as an uncertain CPDAG/PAG or candidate graph and coordinate with causal discovery.
- If the user's practical question is still vague, ask `03-design-planner` to clarify the design target before drawing a detailed DAG.
- If `03-design-planner` records structured route hypotheses or `02-data-technician` records data-enabled opportunities, audit each promising route for timing, identification, forbidden variables, unobserved causes, and assumptions before method handoff.
