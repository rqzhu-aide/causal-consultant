# Instrumental Variables And Mendelian Randomization Workflow
## Permission Note

This reference does not authorize execution. Treat diagnostics, artifacts, plots, tables, code, report material, or connected-specialist needs as council/result recommendations unless main explicitly routed `execution_authorized` after user-confirmed scope.

Use this reference when `SKILL.md` is not enough for instruments, noncompliance, LATE/CACE, weak instruments, IV-DML, or Mendelian randomization.

## 1. Clarify The IV Design

Record the smallest useful IV specification:

- Instrument: assignment, encouragement, eligibility, distance, provider preference, judge leniency, policy timing, genetic variant, polygenic score, or other source.
- Treatment/exposure: the behavior, treatment, dose, biomarker, or exposure moved by the instrument.
- Outcome: timing, scale, measurement, and whether survival/longitudinal support is needed.
- Population: eligible sample, genetic ancestry/sample source for MR, and target population.
- Target: LATE, CACE, local Wald effect, linear IV coefficient, structural parameter, MR causal estimate, or exploratory falsification.
- Assumptions: relevance, independence, exclusion, monotonicity, SUTVA/no interference; for MR, no population stratification/confounding and no horizontal pleiotropy except under sensitivity assumptions.
- Diagnostics: first stage, reduced form, weak instruments, balance, exclusion probes, overidentification, pleiotropy, and sensitivity.

## 2. Check Before Modeling

Before fitting IV:

- confirm instrument timing precedes treatment/exposure and outcome;
- recommend `domain_expert` review when plausible direct paths from instrument to outcome are unclear;
- recommend `data_analyst` review for first-stage and reduced-form summaries;
- define whether the IV target is local/complier-specific or a structural parameter;
- decide whether covariates are pre-instrument, pre-treatment, or invalid post-instrument controls;
- plan weak-instrument diagnostics before interpreting coefficient size;
- for MR, verify SNP-exposure relevance, allele harmonization, LD clumping, ancestry, sample overlap, and biological pleiotropy.

## 3. Choose A Method Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| Randomized encouragement with noncompliance | ITT/reduced form plus CACE/LATE IV | Assignment is often credible; CACE is interpretable | Exclusion, monotonicity, treatment receipt quality |
| Single binary instrument and treatment | Wald ratio and 2SLS benchmark | Transparent local effect | Weak first stage and local interpretation |
| Continuous treatment/exposure with valid instrument | 2SLS or LIML | Standard linear IV target | Weak instruments, nonlinear meaning, many instruments |
| Many instruments or weak instruments | LIML, Fuller, Anderson-Rubin/CLR/weak-robust inference | Reduces weak-IV fragility | Still needs instrument validity |
| High-dimensional controls/nuisance | IV-DML/PLIV/IIVM | Orthogonal nuisance support | Requires IV assumptions and correct score model |
| Fuzzy RD | Local Wald/2SLS at cutoff | Treatment discontinuity identifies local complier effect | Needs RD diagnostics from `04-regression-discontinuity` |
| Binary outcome or nonlinear model | Linear IV as risk-difference projection, or control-function/nonlinear IV if justified | Avoids pretending nonlinear IV is automatic | Marginal effects and target can be unclear |
| Mendelian randomization summary data | IVW baseline with MR-Egger/median/mode/PRESSO sensitivity | Common GWAS-summary workflow | Pleiotropy, LD, ancestry, sample overlap |
| Multivariable MR | MVMR | Separates correlated exposures if instruments support it | Conditional instrument strength and interpretation |

## 4. Connected Reviewer Relevance

- `domain_expert`: instrument mechanism, exclusion pathways, monotonicity plausibility, MR biological pathways, and interpretation limits.
- `data_analyst`: instrument/treatment/outcome timing, first-stage and reduced-form summaries, compliance flow, genetic harmonization facts, and missingness by instrument.
- `method_lead`: local estimand, IV lane, diagnostic requirements, implementation implications, and connected specialist choices.
- `causal_gatekeeper`: relevance, independence, exclusion, monotonicity, weak-instrument, pleiotropy, and claim-boundary review.
- `report_writer`: assumption table, first-stage/reduced-form/IV estimates, weak-IV or MR sensitivity displays, and local-claim wording.
- `00-randomized-trials-and-ab-tests`: encouragement designs, ITT, assignment integrity, noncompliance.
- `04-regression-discontinuity`: fuzzy RD and local Wald at cutoff.
- `02-longitudinal-gmethods`: time-varying exposure/outcome histories with instruments.
- `12-mediation`: IV mediation only under specialized assumptions; keep pathway claims careful.
- `21-doubly-robust-estimation`: influence-function/DR IV variants if implemented.
- `22-double-machine-learning`: PLIV/IIVM, high-dimensional controls, flexible nuisance support.
- `23-survival-competing-risks`: survival outcomes or censoring with IV.
- `08-negative-controls-proximal`: falsification, proxy, and unmeasured-confounding probes around exclusion.

## 5. Recommend Focused Data Work

Recommend one or two checks at a time:

- first-stage table: instrument to treatment/exposure with partial F and partial R2;
- reduced-form table: instrument to outcome;
- Wald ratio for simple binary instruments;
- balance table by instrument using pre-instrument covariates;
- treatment receipt/compliance and missingness by instrument;
- weak-IV diagnostics and weak-robust CI if feasible;
- overidentification diagnostics when multiple instruments exist;
- MR harmonized SNP table, clumping, allele alignment, F statistics, heterogeneity, MR-Egger intercept, and leave-one-out plots.

## 6. Diagnostics Before Reporting

Minimum diagnostic set:

- instrument mechanism and timing diagram;
- first-stage strength and reduced form;
- covariate balance or as-if-randomness evidence;
- exclusion-pathway review from `domain_expert`;
- monotonicity/complier interpretation;
- weak-instrument diagnostics and sensitivity;
- cluster/heteroskedasticity/fixed-effect decisions;
- if MR: LD/ancestry/sample-overlap, pleiotropy diagnostics, and sensitivity methods.

## 7. Mendelian Randomization Specifics

MR is an IV design with genetic variants as instruments. Require:

- Relevance: variants associate with exposure; report F statistics and variance explained when possible.
- Independence: variants are not associated with confounders; handle ancestry/population stratification, relatedness, and selection.
- Exclusion: variants affect outcome only through exposure; evaluate horizontal pleiotropy.
- Harmonization: exposure and outcome alleles align; palindromic variants are handled transparently.
- LD: variants are independent or modeled as correlated instruments.
- Sample overlap: one-sample/two-sample overlap and winner's curse risk are considered.

Use IVW as a baseline only when variants are plausibly valid as a set. Use MR-Egger, weighted median/mode, MR-PRESSO, leave-one-out, heterogeneity, Steiger directionality, colocalization, or multivariable MR as sensitivity/support, not as automatic rescue.

## 8. Report Language

Prefer:

- "local average treatment effect among compliers";
- "complier average causal effect";
- "reduced-form effect of assignment/encouragement";
- "first-stage association";
- "weak-instrument-robust interval";
- "MR estimate under genetic-IV assumptions";
- "pleiotropy sensitivity analysis."

Avoid:

- "the instrument proves causality";
- "IV estimates the ATE" unless extra assumptions are stated;
- "overidentification test validates exclusion";
- "F > 10 settles instrument strength" in clustered/heteroskedastic/many-instrument settings;
- "MR is randomized trial evidence" without genetic-IV caveats.

## 9. Report-Support Fields

For downstream `method_lead`, `causal_gatekeeper`, and `report_writer` review,
preserve compact report-support fields in the `method_task_results` item:

- `section_title`: concise IV/MR section title.
- `iv_lane`: encouragement, natural experiment, fuzzy RD, weak-IV, IV-DML, MR, or exploratory.
- `instrument`: source, timing, values, and mechanism.
- `target`: LATE/CACE/local effect, MR exposure effect, or structural parameter.
- `assumptions`: relevance, independence, exclusion, monotonicity, no interference; MR-specific assumptions if relevant.
- `method`: estimator, package, covariates, clustering, fixed effects, weak-IV inference, or MR sensitivity tools.
- `diagnostics`: first stage, reduced form, balance, weak-IV, exclusion probes, overidentification, pleiotropy, and sensitivity.
- `results`: table/figure/model paths and claim limits.
- `appendix_assets`: code, package versions, GWAS sources, harmonized SNP table, and supplemental diagnostics.
