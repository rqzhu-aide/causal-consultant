# Workflow: Causal Mediation

## Goal

Use this workflow when the user wants to understand pathways, mechanisms, channels, direct effects, indirect effects, controlled direct effects, natural direct/indirect effects, interventional effects, path-specific effects, or mediation with multiple/high-dimensional mediators.

The workflow's first job is to prevent a common mistake: fitting a mediator-adjusted outcome model and interpreting the coefficient change as a causal mechanism. The correct starting point is the causal question and temporal structure.

## Intake Checklist

- [ ] What is the treatment, exposure, policy, genotype, intervention, assignment, or encouragement?
- [ ] What is the outcome, outcome scale, and measurement time?
- [ ] What mediator(s) or pathway(s) does the user care about?
- [ ] Is the mediator measured after treatment and before outcome?
- [ ] Is the mediator a single observed variable, latent construct, longitudinal process, unordered block, or high-dimensional feature set?
- [ ] Is the total effect identified by randomization, observational adjustment, IV, RD, DiD, synthetic control, genomic design, or another route?
- [ ] Which variables confound treatment-outcome, treatment-mediator, and mediator-outcome relationships?
- [ ] Are any mediator-outcome confounders affected by treatment?
- [ ] Are there missing mediator/outcome values, censoring, selection into mediator measurement, or survival-to-mediator-measurement issues?
- [ ] Does the user need a causal mechanism claim or a descriptive pathway screen?

## Estimand Checklist

The agent should state which estimand is being targeted and which estimands are not being targeted.

Common targets:

- total effect;
- controlled direct effect;
- natural direct effect;
- natural indirect effect;
- average causal mediation effect and average direct effect;
- interventional direct/indirect effects;
- path-specific effects;
- joint indirect effect through a mediator block;
- specific indirect effects through multiple mediators;
- separable effects;
- principal-stratum direct effect;
- descriptive pathway association or biomarker screen.

### Choosing among estimands

Use a controlled direct effect when the mediator can be set, fixed, or intervened on at a meaningful value.

Use natural direct/indirect effects when the user specifically wants classical decomposition and the cross-world assumptions are scientifically plausible enough to state.

Use interventional effects when multiple mediators, unordered mediators, exposure-induced confounding, high-dimensional features, or cross-world discomfort makes natural effects too strong.

Use path-specific effects only after a graph-based identification check.

Use separable effects when the treatment can plausibly be decomposed into components that affect different pathways.

Use a descriptive pathway screen when timing, confounding, measurement, or positivity cannot support causal mediation.

## Route Coordination

Mediation is usually a second-layer analysis. Coordinate with the parent causal route:

| Parent route | Mediation implication |
|---|---|
| Randomized experiment | treatment is randomized, but mediator-outcome confounding still matters |
| Observational point treatment | total-effect adjustment and mediator analysis both need careful confounding control |
| Longitudinal g-methods | repeated mediators or exposure-induced confounding may require g-formula, MSM, LMTP, or sequential g-estimation |
| IV/noncompliance | mechanism questions may become principal-stratum or IV mediation questions |
| RD/DiD/synthetic control | total-effect design may be strong, but mediator pathways are usually harder and may require additional assumptions |
| Survival/competing risks | define time zero, censoring, competing events, and risk/RMST/CIF scale before mediation |
| Genomics/omics | coordinate with MR, colocalization, population structure, batch effects, and high-dimensional mediator control |
| Missingness/measurement/selection | handle mediator measurement error, latent variables, missingness, and selection before causal claims |

## Analysis Planning

1. Restate the mechanism question in the user's domain.
2. Define the treatment/exposure, mediator(s), outcome, population, and time order.
3. Decide the total-effect identification route.
4. Create a temporal DAG or variable-role table.
5. Choose the estimand and effect scale.
6. List identification assumptions and check whether any are implausible.
7. Select a primary method and a comparator/sensitivity analysis.
8. Plan preprocessing, missingness, mediator selection, interactions, and inference.
9. Define diagnostics that must pass before causal interpretation.
10. Specify failure conditions and fallback language.

## Candidate Methods

### Parametric causal mediation

Use for simple single-mediator settings with clear timing and credible assumptions. R `mediation` and `regmedint` are common. Include treatment-mediator interaction if plausible.

### G-computation and standardization

Use when the estimand can be expressed by simulated interventions on treatment and mediator values or distributions. This is often the clearest way to explain controlled direct effects and interventional effects.

### Natural effect models

Use when natural direct/indirect effects are the target and the user needs flexible parameterization or hypothesis tests. R `medflex` is the main software.

### Weighting approaches

Inverse odds ratio weighting, mediator distribution weighting, and related methods can estimate direct and indirect effects under appropriate assumptions. Weight diagnostics are required.

### Interventional effects

Use for multiple, correlated, unordered, or high-dimensional mediators when distribution-shift interpretations are acceptable. These often map better to omics, environmental mixtures, and policy-channel questions than natural effects.

### Sequential g-estimation and longitudinal g-methods

Use when there are exposure-induced mediator-outcome confounders, repeated mediators, time-varying exposures, or treatment-confounder feedback. Coordinate with longitudinal g-methods.

### TMLE/AIPW and machine-learning-assisted mediation

Use when flexible nuisance models are needed and the sample size supports them. Keep the estimand simple and diagnostics strong.

### SEM and latent mediation

Use in psychometrics when mediator or outcome constructs are latent, but do not let SEM path diagrams substitute for causal identification. Check measurement invariance, reliability, and confounding.

### High-dimensional mediation

Use only with a discovery/validation mindset unless the design is unusually strong. Pre-specify screening, multiplicity control, batch adjustment, replication, and biological or domain validation.

## Domain-Specific Guidance

### Genomics, epigenomics, metabolomics, proteomics, microbiome, and imaging

- Treat omics mediators as high-dimensional, noisy, correlated, and often measured with batch effects.
- Control for ancestry/population structure, cell composition, technical batch, sample handling, tissue type, and timing.
- Distinguish biomarker mediation from causal molecular mechanism.
- Use MR/colocalization only when genetic instruments are valid and the mediator and outcome signals plausibly share a causal variant.
- Prefer joint or interventional mediator-block effects when individual mediator ordering is unknown.
- Require replication or external validation for selected mediators.

### Economics, policy, and social science mechanisms

- Link the mediator to a realistic channel in the policy or behavioral model.
- Avoid "bad controls" that are downstream of treatment and mediator unless the estimand is direct effect.
- With quasi-experimental total effects, remember that mediator analysis may need extra assumptions beyond the quasi-experiment.
- Consider randomized saturation, encouragement, or sequential intervention designs when planning future studies.
- Be cautious with proportion mediated when total effects are heterogeneous or near zero.

### Psychology, education, and psychometrics

- Check whether mediator and outcome are latent constructs or observed scale scores.
- Require temporal separation between intervention, mediator, and outcome waves.
- Check measurement invariance across treatment arms and time.
- Use multilevel mediation when students, patients, clinicians, schools, classrooms, or clinics are clustered.
- Do not treat cross-sectional survey mediation as causal without a strong design.

### Clinical, epidemiologic, and public-health applications

- Check mediator-outcome confounding and treatment-induced confounders.
- For survival outcomes, use risk/RMST/CIF-oriented interpretations when possible.
- Consider separable effects when treatment components map to different biological pathways.
- Handle censoring, competing events, missing mediators, and measurement timing explicitly.

## Diagnostics

### Required before causal interpretation

- temporal DAG or variable-role map;
- total-effect identification statement;
- mediator timing and measurement validity;
- mediator-outcome confounding assessment;
- exposure-induced mediator-outcome confounding audit;
- positivity/overlap for treatment and mediator;
- treatment-mediator interaction check;
- sensitivity to unmeasured mediator-outcome confounding;
- missingness, selection, and censoring assessment.

### Method-specific

For `mediation`/parametric models:

- mediator and outcome model fit;
- nonlinearities and interactions;
- bootstrap or simulation inference;
- sensitivity analysis for sequential ignorability.

For weighting:

- weight distributions;
- extreme weights;
- weighted covariate balance;
- positivity violations.

For high-dimensional mediators:

- multiplicity control;
- stability selection or cross-validation;
- batch and technical artifacts;
- held-out or external replication;
- sensitivity to mediator filtering thresholds.

For latent mediation:

- reliability;
- measurement invariance;
- factor model fit;
- sensitivity to factor-score versus latent-variable modeling.

## Failure Modes

- Mediator measured before treatment.
- Mediator measured after outcome or simultaneously with outcome.
- Mediator is part of the outcome definition.
- Treatment randomization is mistaken for mediator randomization.
- Mediator-outcome confounding is ignored.
- Exposure-induced mediator-outcome confounding is ignored while estimating natural effects.
- Mediator adjustment is interpreted as the total effect.
- Proportion mediated is emphasized when total effect is small or direct and indirect effects oppose.
- Nonlinear-scale effects are decomposed without explaining scale dependence.
- High-dimensional mediator results are treated as confirmed mechanisms.
- Cross-sectional mediation is presented causally.
- Missingness or selection into mediator measurement is ignored.
- A latent construct mediator is used without measurement checks.
- Multiple mediator order is assumed without scientific justification.
- Post-treatment colliders are adjusted for.

## Suggested Response Pattern

```markdown
I would treat this as a causal-mediation problem because the user is asking whether [mediator/pathway] explains part of the effect of [treatment] on [outcome].

The first decision is the estimand. If you want [plain-language goal], the closest estimand is [controlled direct / natural indirect / interventional indirect / path-specific / descriptive].

The total effect appears to be identified by [design route], but the mediation layer additionally requires [key assumptions], especially [mediator-outcome confounding issue].

A reasonable primary analysis is [method] using [software], with [comparator/sensitivity]. I would not interpret it causally unless [diagnostics] pass.

If [main assumption] is not defensible, I would switch to [fallback estimand or descriptive mechanism screen] and report the limitation directly.
```

## Output Template

```markdown
### Causal Mediation Analysis Plan

#### 1. Causal question and timing
- Treatment/exposure:
- Mediator(s):
- Outcome:
- Timing:
- Total-effect route:

#### 2. Estimand
- Target estimand:
- Estimands not targeted:
- Effect scale:
- Target population:

#### 3. Identification assumptions
- Treatment-outcome:
- Treatment-mediator:
- Mediator-outcome:
- Exposure-induced confounding:
- Positivity:
- Cross-world/interventional:
- Measurement/selection:

#### 4. Estimation plan
- Primary method:
- Comparator/fallback:
- Software:
- Inference:
- Required covariates:

#### 5. Diagnostics and sensitivity
- DAG/timing:
- Overlap:
- Model fit:
- Treatment-mediator interaction:
- Sensitivity to M-Y confounding:
- Missingness/selection:
- Multiple mediator/high-dimensional checks:

#### 6. Interpretation
- What can be claimed causally:
- What remains exploratory:
- Fatal flaws or limitations:
- Next step:
```

## Code Templates

- `scripts/R/mediation_template.R`: simple R `mediation` template for single-mediator ACME/ADE workflows. Adapt it only after the estimand and assumptions are clear.

## Reference Files

- `references/literature_and_software.md`: literature map, domain-specific notes, and package guide.
