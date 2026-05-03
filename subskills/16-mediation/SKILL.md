---
name: causal-mediation
description: Use for direct effects, indirect effects, mechanisms, mediators, pathways, path-specific effects, controlled direct effects, natural direct/indirect effects, interventional direct/indirect effects, mediation with multiple or high-dimensional mediators, and mechanism questions in randomized, observational, quasi-experimental, genomic, psychometric, economic, biomedical, and social-science settings.
---

# Causal Mediation

## Core Behavior

When this subskill is invoked, focus first on the mechanism question and the causal estimand. Mediation analysis is not just "adjusting for the mediator" or checking whether a coefficient shrinks. The work is to decide what pathway effect the user wants, whether it is identifiable in the data and design, and which assumptions are stronger than the science can support.

Always do these six things:

1. **Separate the total-effect design from the mediation layer.** Establish how the treatment/exposure effect is identified before decomposing it. Randomization of treatment does not by itself identify mediator effects.
2. **Draw or elicit a temporal DAG.** Place treatment, mediator(s), outcome, baseline confounders, mediator-outcome confounders, post-treatment confounders, measurement processes, selection/censoring, and competing pathways in time order.
3. **Name the estimand before the model.** Decide whether the user wants a total effect, controlled direct effect, natural direct/indirect effect, interventional direct/indirect effect, path-specific effect, separable effect, principal-stratum/direct effect, or descriptive mechanism screen.
4. **Check mediator feasibility.** Confirm that the mediator occurs after treatment and before the outcome, is well measured, is not just a proxy for the outcome, and could plausibly be intervened on or shifted in the way the estimand requires.
5. **State identification assumptions separately from model assumptions.** Natural effects usually require strong cross-world/sequential ignorability assumptions. Interventional effects, randomized-mediator designs, front-door designs, IV/principal-stratification designs, or g-methods may be better for some questions.
6. **Require sensitivity and negative-control thinking.** Mediation claims are often fragile. Plan sensitivity to mediator-outcome confounding, exposure-induced confounding, measurement error, multiple testing, model form, interactions, and alternative mediator definitions.

## User-Facing Style

Be careful and clarifying, not forbidding. Many users ask "does X mediate the effect?" when they mean one of several different things:

- mechanism: "is this pathway part of how the treatment works?";
- controlled direct effect: "what if we fixed the mediator at a chosen value?";
- natural indirect effect: "how much of the effect operates through the mediator changing as it naturally would under treatment?";
- interventional indirect effect: "how much of the effect is attributable to shifting the mediator distribution?";
- biomarker/omics screen: "which intermediate features are plausible pathway markers?";
- psychometric or behavioral mediation: "does the intervention change a latent construct, which then predicts the outcome?";
- economics mechanism analysis: "which observed channel explains the policy effect?"

A helpful early response is often:

> This is a mediation question because you are asking whether the effect of treatment on the outcome operates through a post-treatment pathway. Before choosing a mediation model, I would pin down whether you want a controlled direct effect, a natural direct/indirect effect, or a weaker interventional/pathway interpretation, because those require different assumptions and sometimes different data.

## Activation and Route-Out

Use this subskill when the user says or implies:

- mediator, mediation, indirect effect, direct effect, mechanism, pathway, channel, decomposition, proportion mediated, ACME, ADE, natural direct effect, natural indirect effect, controlled direct effect, interventional effect, path-specific effect, front-door, separable effect, principal-stratum direct effect, exposure-induced mediator-outcome confounder, `mediation`, `medflex`, `CMAverse`, `regmedint`, `mma`, `HIMA`, or omics mediation.

Do **not** use this as the only workflow when:

- the user only wants the total effect of treatment on outcome: route to the appropriate total-effect subskill and warn against adjusting for mediators;
- the mediator or outcome is repeatedly measured and treatment-confounder feedback is central: coordinate with `subskills/10-longitudinal-gmethods/`;
- the outcome is survival or competing risks: keep mediation active and coordinate with `subskills/15-survival-competing-risks/`;
- the mechanism claim depends on genetic instruments, eQTLs, colocalization, Mendelian randomization, or multi-omics causal structure: coordinate with `subskills/19-causal-genomics/`;
- the mediator may be affected by interference or peer/network exposure: coordinate with `subskills/17-interference-spillovers/`;
- missingness, measurement error, latent constructs, selection, censoring, or sample conditioning dominate: coordinate with `subskills/02-data-inspector/`;
- the user asks whether a graph identifies a path-specific effect or front-door criterion: coordinate with `subskills/04-dag-builder/`;
- the question is only predictive variable importance or feature attribution with no causal pathway claim: treat as descriptive/predictive unless a causal design is added.

If this route is rejected, update the `subskill_analyses` entry as `rejected`, `fallback`, or `exploratory/user-forced`, record the failed condition, and return to the main skill's route shortlist. If the user insists on causal mediation despite nonidentifiability, continue only with a clearly labeled exploratory or descriptive mechanism analysis.

## Mediation Project Specification Entry

When a project specification is being maintained, append or update this compact entry under the top-level `subskill_analyses` list. Fill only fields that are known or decision-relevant. Do not duplicate global fields already captured under `main_skill`, `data_inspector_02`, `dag_builder_04`, `design_planner_03`, or `analysis_routing`.

```yaml
subskill_analyses:
  - subskill_id: "16-mediation"
    status: "candidate | selected | rejected | fallback | exploratory/user-forced"
    fit_to_user_need: null
    user_task: "mechanism triage | direct effect | indirect effect | proportion mediated | pathway decomposition | multiple mediators | omics screen | code | interpret result | unknown"
    causal_timing:
      treatment_or_exposure_time: null
      mediator_measurement_time: null
      outcome_measurement_time: null
      baseline_covariate_window: null
      post_treatment_confounder_times: []
      repeated_or_longitudinal_mediators: null
    variables:
      treatment_or_exposure: null
      mediators: []
      outcome: null
      baseline_confounders: []
      mediator_outcome_confounders: []
      exposure_induced_confounders: []
      selection_or_censoring_variables: []
      candidate_negative_controls: []
    estimand:
      label: "controlled direct effect | natural direct effect | natural indirect effect | total effect decomposition | interventional direct/indirect effect | path-specific effect | separable effect | principal-stratum direct effect | descriptive pathway association | unknown"
      target_population: null
      treatment_contrast: null
      mediator_intervention_or_distribution: null
      outcome_scale: null
      time_horizon: null
      interpretation: null
    assumptions_needed:
      total_effect_identification: null
      no_unmeasured_treatment_outcome_confounding: null
      no_unmeasured_treatment_mediator_confounding: null
      no_unmeasured_mediator_outcome_confounding: null
      no_exposure_induced_mediator_outcome_confounding_for_natural_effects: null
      cross_world_or_composition_assumptions: null
      positivity_for_treatment_and_mediator: null
      consistency_and_well_defined_interventions: null
      no_interference: null
    diagnostics_or_checks:
      temporal_dag: null
      mediator_timing_valid: null
      mediator_measurement_quality: null
      overlap_or_positivity: null
      mediator_model_fit: null
      outcome_model_fit: null
      treatment_mediator_interaction: null
      sensitivity_to_mediator_outcome_confounding: null
      exposure_induced_confounding_audit: null
      multiple_testing_or_selection_plan: null
      negative_controls_or_falsification: []
    estimation_plan:
      method_family: "parametric mediation | g-computation | natural effect model | inverse odds/mediator weighting | interventional effects | sequential g-estimation | TMLE/AIPW | randomized mediator design | high-dimensional screen | unknown"
      primary_method: null
      fallback_or_comparator: null
      software_backend: "R | Python | Stata | SAS | Mplus/SEM | either | unknown"
      inference_strategy: null
    fatal_flaws_or_major_limitations: []
    limitations: []
    open_questions: []
```

## Core Theory and Formal Definitions

Default notation in this subskill:

- \(A\): treatment, exposure, intervention, assignment, or policy;
- \(M\): mediator or vector of mediators;
- \(Y\): outcome;
- \(C\): pre-treatment covariates or baseline confounders;
- \(L\): post-treatment mediator-outcome confounder, possibly affected by \(A\);
- \(Y(a,m)\): potential outcome under treatment \(a\) and mediator value \(m\);
- \(M(a)\): potential mediator under treatment \(a\).

If the user uses different notation or variable names, adapt responses to the user's notation.

### Total effect

The total effect compares \(Y(1)\) with \(Y(0)\). In mediation work, first ask whether this total effect is identified credibly. If it is not, decomposition will usually inherit or worsen the problem.

### Controlled direct effect

A controlled direct effect fixes the mediator to a value \(m\):

\[
E[Y(1,m)-Y(0,m)].
\]

This is often easier to describe as "what would the treatment effect be if the mediator were set to a specified level?" It does not require a cross-world natural mediator value, but it does require the mediator intervention to be meaningful and positivity to support \(m\).

### Natural direct and indirect effects

The natural direct effect compares:

\[
E[Y(1,M(0))-Y(0,M(0))].
\]

The natural indirect effect compares:

\[
E[Y(1,M(1))-Y(1,M(0))].
\]

These are common in applied literature and connect to ACME/ADE language, but they rely on nested counterfactuals and strong identification assumptions. They can be inappropriate with exposure-induced mediator-outcome confounding, ill-defined mediator interventions, or highly complex mediator processes.

### Interventional direct and indirect effects

Interventional effects replace individual natural mediator values with draws or shifts from mediator distributions under treatment conditions. They are often more defensible for multiple mediators, high-dimensional mediators, correlated mediators, and cases where cross-world assumptions are scientifically uncomfortable. The interpretation is distributional: "what part of the effect is attributable to changing the mediator distribution?"

### Path-specific and separable effects

Path-specific effects target selected causal pathways through a graph. They require careful identification checks and may be impossible when paths intersect through recanting witnesses or exposure-induced confounders. Separable effects decompose treatment into components affecting different pathways and are useful when a real intervention can plausibly be separated into components.

### Proportion mediated

The proportion mediated can be unstable or misleading, especially when total effects are near zero, direct and indirect effects have opposite signs, scales are nonlinear, or multiple pathways interact. Report it only with the underlying direct, indirect, and total effects and the effect scale.

## Identification Assumptions

State these separately from model assumptions.

### Timing and consistency

Treatment or exposure must precede the mediator, and the mediator must precede the outcome. Treatment and mediator interventions should be sufficiently well defined that potential outcomes correspond to the observed data.

### Exchangeability for treatment and mediator

For natural effects in the standard single-mediator setup, the usual requirements include no unmeasured treatment-outcome, treatment-mediator, and mediator-outcome confounding, plus no mediator-outcome confounder affected by treatment. Randomized treatment helps only with the first two pieces; mediator-outcome confounding remains a major threat.

### Positivity

Within the target population and covariate strata, treatment and mediator values or mediator distributions must be observed with enough support. Positivity is often strained in behavioral, clinical, and omics settings where mediators are rare, deterministic, or strongly constrained by treatment.

### Cross-world assumptions for natural effects

Natural direct and indirect effects involve counterfactual mediator values under one treatment level combined with outcomes under another. These assumptions cannot be verified directly. Make them explicit and consider interventional effects or controlled direct effects when they are too strong.

### Exposure-induced mediator-outcome confounding

If treatment changes a variable \(L\) that then affects both mediator and outcome, standard natural direct/indirect effects are generally not identified by simple regression adjustment. Consider interventional effects, longitudinal g-methods, sequential g-estimation, separable effects, or weaker descriptive interpretation.

### Measurement and selection

Mediator measurement error, latent constructs, selection into mediator measurement, missing outcomes, informative censoring, and conditioning on post-treatment variables can create severe bias. Coordinate with missingness/measurement/selection workflows when these dominate.

## Method Recommendation Rules

### Design-to-method table

| Situation | Default recommendation | Required checks |
|---|---|---|
| Randomized treatment, single measured mediator, no post-treatment mediator-outcome confounder | Parametric or semiparametric causal mediation with sensitivity analysis | mediator timing, M-Y confounding, A-M interaction, model fit |
| Observational exposure, single mediator | Target-trial/DAG framing plus g-computation, weighting, or `mediation`/`regmedint` only if confounding control is credible | total-effect identification, treatment and mediator overlap |
| User wants effect not through mediator fixed at a chosen value | Controlled direct effect via g-computation, standardization, or sequential g-estimation | meaningful mediator intervention, positivity at chosen value |
| Strong interest in natural direct/indirect effects | Natural effect models, `mediation`, `medflex`, `regmedint`, or `CMAverse` | cross-world assumptions, no exposure-induced M-Y confounder |
| Exposure-induced mediator-outcome confounder present | Interventional effects, g-methods, sequential g-estimation, or separable effects if treatment components are plausible | timing of \(L\), assumptions for intervention/distribution |
| Multiple causally ordered mediators | Path-specific g-computation, natural/interventional effect models, or longitudinal g-methods | mediator ordering, recanting witness, joint support |
| Multiple unordered or correlated mediators | Interventional indirect effects or joint mediator block effects | mediator correlation, mediator selection plan |
| High-dimensional omics mediators | Two-stage screen plus validation, high-dimensional mediation, sparse models, or omics-specific mediation; coordinate with genomics | multiple testing, batch effects, colocalization/MR if genetic |
| Latent psychological/psychometric mediator | SEM/latent variable model plus causal assumptions, or factor-score sensitivity | measurement invariance, latent construct validity |
| Survival or competing-risk outcome | Coordinate with survival subskill; use survival mediation methods on risk/RMST/cumulative-incidence scales where possible | censoring, time zero, mediator timing |
| Noncompliance or encouragement design | Mediation under principal strata, IV mediation, or design-based methods | exclusion, monotonicity, principal-stratum interpretation |
| User only has cross-sectional data | Usually descriptive mechanism analysis only | temporal ambiguity, reverse causation |

In normal responses, recommend one primary method and one comparator or sensitivity analysis. Avoid method catalogs unless the user asks for a literature/software survey.

## Language Backend Policy

Do not install packages silently. If packages are missing, show install commands and ask for approval.

### R preferred stack

- `mediation`: widely used ACME/ADE workflow for model-based and design-based causal mediation, with sensitivity tools for common models.
- `CMAverse`: broad causal mediation suite, including regression, weighting, inverse odds ratio weighting, marginal structural models, multiple mediators, and sensitivity-oriented workflows.
- `regmedint`: regression-based closed-form mediation with treatment-mediator interaction and several outcome model families, including survival models.
- `medflex`: natural effect models via imputation or weighting, useful for direct modeling of path-specific natural effects.
- `mma`, `HIMA`, `HDMT`, and related packages: high-dimensional and multiple-mediator screening. Treat results as discovery unless design and validation are strong.
- `lavaan`, `Mplus`, `OpenMx`, and `semTools`: latent variable and psychometric mediation. Use only when causal assumptions and timing are explicit.
- `tmle`, `ltmle`, `lmtp`, `SuperLearner`, and custom g-computation/AIPW workflows: useful when flexible nuisance modeling or longitudinal structure matters.

### Python

Python can support custom mediation workflows, but R has the more mature causal mediation ecosystem.

- `statsmodels.stats.mediation.Mediation`: useful for simpler parametric workflows, not a complete replacement for causal design checks.
- `dowhy`: can express graph-based mediation/front-door identification and run refutation-style checks when the graph supports it.
- `econml` and `doubleml`: useful for nuisance modeling and heterogeneous effects, but mediation-specific estimands usually require custom construction.
- `semopy`, `statsmodels`, `sklearn`, `pandas`, and `numpy`: useful for SEM-like or custom g-computation workflows, with careful assumptions.

### Stata, SAS, and SEM environments

- Stata has `paramed`, `medeff`, `mediate`, `gsem`, and SEM workflows depending on version and estimand.
- SAS has `PROC CAUSALMED` and macro workflows derived from Valeri and VanderWeele-style regression formulas.
- Mplus is common in psychometrics and latent mediation. Use it for measurement models only when causal timing and confounding assumptions are addressed.

When the user proposes another package, check supported outcome/mediator types, interactions, multiple mediators, survival/censoring, sensitivity analysis, bootstrap/inference, and whether it estimates natural, controlled, or interventional effects.

## Data Preprocessing Rules

1. Preserve raw treatment, mediator, outcome, time stamps, measurement waves, and eligibility information.
2. Classify every variable as baseline confounder, treatment, mediator, outcome, mediator-outcome confounder, exposure-induced confounder, selection/censoring variable, instrument, effect modifier, or unknown.
3. Do not adjust for the mediator when estimating the total effect.
4. Do not adjust for post-treatment variables in a natural-effect model unless the estimand and method explicitly require that structure.
5. For multiple mediators, decide whether they are a joint block, causally ordered sequence, unordered correlated features, or high-dimensional discovery set.
6. For omics, biomarker, or imaging mediators, keep batch variables, platform metadata, tissue/cell composition, ancestry/population structure, and sample-processing dates.
7. For psychometric mediators, check scale reliability, measurement invariance across treatment groups/time, and whether the mediator is a latent construct or observed score.
8. For economics and policy mechanisms, avoid conditioning on variables that are themselves downstream of both the mediator and outcome or selected by post-treatment survival/participation.
9. Track missing mediator/outcome data, censoring, and selection into measurement before fitting mediation models.
10. Pre-specify mediator selection, transformation, interaction terms, covariates, and sensitivity analyses when possible.

## Required Diagnostics

### Design and timing diagnostics

- temporal DAG or variable-role map;
- mediator measured after treatment and before outcome;
- mediator is not part of the outcome definition;
- baseline covariates measured before treatment;
- audit for exposure-induced mediator-outcome confounders;
- check whether treatment, mediator, and outcome are well defined.

### Identification diagnostics

- total-effect identification route;
- treatment and mediator positivity/overlap;
- mediator-outcome confounding assessment;
- treatment-mediator interaction and effect modification;
- selection/censoring/missingness audit;
- sensitivity to unmeasured mediator-outcome confounding;
- negative controls or falsification tests where plausible.

### Model and estimation diagnostics

- mediator model fit and residual checks;
- outcome model fit and scale choice;
- bootstrap or robust inference;
- influence and outlier checks;
- weight distribution if using weighting;
- flexible model comparison if nonlinearities are plausible;
- multiple-testing correction and held-out validation for high-dimensional mediators.

## Failure Modes and Guardrails

Escalate warnings when:

- mediator is measured before treatment or at the same time as the outcome;
- the mediator is a collider, selection variable, proxy outcome, or component of the outcome;
- the user adjusts for the mediator but interprets the coefficient as the total effect;
- a randomized treatment is treated as if it randomized the mediator;
- mediator-outcome confounding is ignored;
- treatment affects a mediator-outcome confounder and standard natural effects are still claimed;
- proportion mediated is reported without direct/indirect effects and total effect scale;
- direct and indirect effects are on nonlinear scales but interpreted as additive percentages;
- high-dimensional mediator hits are treated as confirmed mechanisms without replication;
- latent mediator scores are used without measurement-invariance or reliability checks;
- selection into mediator measurement or survival to mediator measurement is ignored;
- many mediators, outcomes, or time windows are searched without disclosure;
- mediation is used to infer biology, psychology, or economics mechanisms when the data are purely cross-sectional.

## Step-by-Step Operating Procedure

1. Restate the user's mechanism question in domain language.
2. Identify treatment/exposure, mediator(s), outcome, population, measurement times, and total-effect design.
3. Draw or request a temporal DAG with baseline confounders, mediator-outcome confounders, post-treatment confounders, selection/censoring, and multiple pathways.
4. Decide whether the target is a controlled direct effect, natural direct/indirect effect, interventional effect, path-specific effect, separable effect, principal-stratum effect, or descriptive pathway screen.
5. Check identification assumptions and choose the weakest estimand that still answers the user's question.
6. Choose one primary method and one comparator or sensitivity analysis.
7. Plan preprocessing, mediator selection, transformations, interactions, missingness/censoring handling, and inference.
8. Run or request diagnostics: timing, overlap, mediator/outcome model fit, treatment-mediator interaction, sensitivity to M-Y confounding, and high-dimensional validation if relevant.
9. If diagnostics fail, change estimand, route to g-methods/genomics/survival/missingness, or label the result descriptive.
10. Record assumptions, diagnostics, limitations, and open questions in the project specification.

## Output Template

```markdown
### Causal Mediation Analysis

#### 1. Design setup
- Treatment/exposure:
- Mediator(s):
- Outcome:
- Timing:
- Total-effect identification route:

#### 2. Estimand
- Target estimand:
- Treatment contrast:
- Mediator intervention/distribution:
- Target population:
- Outcome scale:
- Interpretation:

#### 3. Assumptions
- Treatment-outcome identification:
- Treatment-mediator identification:
- Mediator-outcome confounding:
- Exposure-induced mediator-outcome confounding:
- Positivity/overlap:
- Cross-world or interventional assumptions:
- Measurement/selection assumptions:

#### 4. Method recommendation
- Primary method:
- Comparator/fallback:
- Software/backend:
- Inference strategy:

#### 5. Diagnostics and sensitivity
- Temporal DAG:
- Mediator timing/measurement:
- Model fit and interactions:
- Overlap/weights:
- Sensitivity to unmeasured M-Y confounding:
- Multiple mediator/high-dimensional checks:
- Negative controls or falsification:

#### 6. Interpretation
- Causal claim supported:
- What remains exploratory:
- Fatal flaws or major limitations:
- Recommended next step:
```

## Related Subskills

- `subskills/04-dag-builder/`: use for temporal DAGs, path-specific identification, front-door logic, and recanting-witness concerns.
- `subskills/05-randomized-experiments/`: use when treatment was randomized but mediator pathways are the target.
- `subskills/06-point-treatment-observational/`: use for total-effect identification in baseline observational exposure settings.
- `subskills/08-doubly-robust-ml/`: coordinate for flexible nuisance modeling, AIPW/TMLE, or machine-learning-assisted mediation.
- `subskills/10-longitudinal-gmethods/`: use for repeated mediators, treatment-confounder feedback, or sustained pathway interventions.
- `subskills/13-instrumental-variables/`: coordinate for encouragement, noncompliance, IV mediation, or principal-stratum direct effects.
- `subskills/15-survival-competing-risks/`: use when the outcome is time-to-event, censoring, competing risks, RMST, or cumulative incidence.
- `subskills/17-interference-spillovers/`: use when mediators or outcomes are affected by other units' exposures.
- `subskills/19-causal-genomics/`: use for Mendelian randomization, colocalization, eQTL/GWAS, omics mediation, pleiotropy, and multi-omics mechanisms.
- `subskills/02-data-inspector/`: use when measurement error, missing mediator data, latent constructs, censoring, or selection dominate.
- `subskills/20-reporting-interpretation/`: use for final reports and calibrated causal mechanism language.

## Reference Files

For the detailed workflow, read `references/workflow.md`. For the literature and software map, read `references/literature_and_software.md`.
