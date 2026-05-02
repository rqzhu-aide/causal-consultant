---
name: survival-competing-risks
description: Use for causal questions with time-to-event outcomes, censoring, delayed entry, immortal time risk, survival probabilities, cumulative risks, RMST, adjusted survival curves, cause-specific cumulative incidence, competing risks, hazard models, AFT models, survival CATEs, and treatment decisions with survival endpoints.
version: 0.2.0
---

# Survival and Competing Risks

## Core Behavior

When this subskill is invoked, focus on defining the survival estimand, aligning time zero, and handling censoring and competing events before recommending Cox, AFT, GRF, TMLE, IPCW, or competing-risk models. A survival model is not automatically a causal analysis.

Always do these six things:

1. **Align time zero.** Define eligibility, treatment assignment or initiation, start of follow-up, delayed entry, grace period, and outcome clock. Misaligned time zero can create immortal time bias.
2. **Define the event process.** Identify event of interest, competing events, censoring, loss to follow-up, administrative end, recurrent events, and whether death is the event, a competing event, or part of a composite.
3. **Choose the estimand on an interpretable scale.** Prefer survival probability, risk by time, RMST, restricted mean time lost, or cumulative incidence contrasts when the user wants causal effects or decisions. Use hazard ratios only when the hazard-scale question is truly the target.
4. **Separate censoring from competing events.** Censoring means the event time is unobserved. A competing event is an observed event that prevents the event of interest. Do not censor competing events by default.
5. **Match method to design and endpoint.** Use randomized-trial methods, standardization, IPCW, AIPW/TMLE, causal survival forests, marginal structural models, or competing-risk estimators according to treatment timing, confounding, censoring, and outcome type.
6. **Require diagnostics before causal interpretation.** Check risk sets, censoring, positivity, balance, adjusted curves, proportional hazards if using Cox/Fine-Gray, competing-event coding, RMST horizon, and sensitivity to censoring/competing-risk assumptions.

## User-Facing Style

Be plain-spoken and timeline-first. Many users know "survival analysis" but not the estimand distinctions. Translate terms when useful:

- time zero: "the moment when people first become eligible, treatment is assigned or chosen, and follow-up starts";
- censoring: "we stop observing someone before we know whether the event would happen";
- competing event: "another event happens first and makes the event we wanted impossible";
- RMST: "average event-free time up to a chosen follow-up time";
- cumulative incidence: "the chance of a specific event by a time point while accounting for competing events";
- hazard ratio: "a ratio of instantaneous event rates among people still event-free at each time, not a direct risk ratio."

A helpful early response is often:

> This is a survival causal question because the outcome is not just whether the event happened, but when it happened and who was still at risk. Before choosing a Cox model, AFT model, causal survival forest, or competing-risk method, I would first define time zero, the event of interest, censoring, competing events, and the effect scale you want to interpret.

## Activation and Route-Out

Use this subskill when the user says or implies:

- survival, time-to-event, event-free survival, progression-free survival, mortality, relapse, hospitalization, churn, retention, duration, censoring, delayed entry, left truncation, time zero, immortal time, RMST, RMTL, Kaplan-Meier, Cox, AFT, adjusted survival curves, cumulative incidence, competing risks, Fine-Gray, cause-specific hazards, CATE with survival, causal survival forest, `grf`, `survival`, `flexsurv`, `adjustedCurves`, `riskRegression`, `cmprsk`, `survtmle`, `lmtp`, `causalCmprsk`, `lifelines`, `scikit-survival`, or `pycox`.

Do **not** use this as the only workflow when:

- the outcome is measured at a fixed time and no censoring/time-to-event structure matters: use the relevant point-treatment, randomized, or HTE route;
- treatment changes repeatedly over time or treatment-confounder feedback is central: coordinate with `subskills/10-longitudinal-gmethods/`;
- the user mainly wants individualized treatment rules or policy learning: coordinate with `subskills/09-heterogeneous-effects-policy/`;
- the route is IV, RD, DiD, synthetic control, or mediation with a survival endpoint: keep that design subskill active and use this subskill for endpoint, censoring, and estimand details;
- interference, missingness, measurement error, selection, or informative observation processes dominate: coordinate with the relevant subskill.

If this route is rejected, update the `subskill_analyses` entry as `rejected`, `fallback`, or `exploratory/user-forced`, record the failed condition, and return to the main skill's route shortlist.

## Survival Project Specification Entry

When a project specification is being maintained, append or update this compact entry under the top-level `subskill_analyses` list. Fill only fields that are known or decision-relevant. Do not duplicate global fields already captured under `data`, `variables`, `intervention`, `outcomes`, `study_design`, or `analysis_routes`.

```yaml
subskill_analyses:
  - subskill_id: "15-survival-competing-risks"
    status: "candidate | selected | rejected | fallback | exploratory/user-forced"
    fit_to_user_need: null
    user_task: "survival estimand | adjusted curves | treatment effect | competing risks | survival CATE | decision support | code | interpret result | unknown"
    time_to_event_structure:
      time_zero: null
      eligibility_time: null
      treatment_assignment_or_initiation_time: null
      follow_up_start: null
      follow_up_end: null
      time_scale: "time since treatment/eligibility | age | calendar time | unknown"
      delayed_entry_or_left_truncation: null
      recurrent_events_present: null
    events:
      event_of_interest: null
      event_code: null
      censoring_codes: []
      competing_event_codes: []
      composite_endpoint: null
      administrative_censoring_time: null
    estimand:
      label: "survival difference at t | risk difference by t | RMST difference | RMTL difference | cumulative incidence contrast | survival CATE | RMST CATE | hazard contrast | unknown"
      target_population: null
      treatment_contrast: null
      time_horizon_or_tau: null
      outcome_scale: null
      interpretation: null
    assumptions_needed:
      consistency_or_well_defined_treatment: null
      exchangeability_or_parent_design_identification: null
      positivity_or_overlap: null
      independent_or_exchangeable_censoring: null
      correct_time_zero_and_no_immortal_time: null
      competing_event_interpretation: null
      no_interference: null
    diagnostics_or_checks:
      risk_set_definition: null
      number_at_risk_by_time_and_treatment: null
      censoring_by_treatment_and_covariates: null
      censoring_weight_distribution: null
      covariate_balance_or_overlap: null
      adjusted_survival_or_cif_curves: null
      proportional_hazards_or_model_fit: null
      rmst_horizon_sensitivity: null
      competing_risk_coding_check: null
      sensitivity_or_negative_controls: []
    estimation_plan:
      method_family: "standardization | IPCW | AIPW/TMLE | Cox/AFT | RMST regression | competing-risk CIF | causal survival forest | MSM/g-method | unknown"
      primary_method: null
      fallback_or_comparator: null
      software_backend: "R | Python | Stata | either | unknown"
      inference_strategy: null
    fatal_flaws_or_major_limitations: []
    limitations: []
    open_questions: []
```

## Core Theory and Formal Definitions

Default notation in this subskill:

- \(A\): baseline treatment or intervention;
- \(T\): event time;
- \(C\): censoring time;
- \(\tilde T=\min(T,C)\): observed follow-up time;
- \(\Delta\): event indicator;
- \(J\): event type when competing risks exist;
- \(X\): pre-treatment covariates;
- \(S_a(t)=P(T^a>t)\): survival under treatment \(a\);
- \(F_{ak}(t)=P(T^a \le t, J^a=k)\): cumulative incidence of event type \(k\) under treatment \(a\).

If the user uses different notation or variable names, adapt responses to the user's notation.

### Survival, risk, and RMST

Common causal estimands include:

\[
S_1(t)-S_0(t)
\]

for survival probability difference at time \(t\),

\[
P(T^1 \le t)-P(T^0 \le t)
\]

for risk difference by time \(t\), and

\[
RMST_a(\tau)=E[\min(T^a,\tau)] = \int_0^\tau S_a(t)dt
\]

for restricted mean survival time. RMST differences are often easier to explain than hazard ratios and remain meaningful when hazards are not proportional.

### Competing risks

When event type \(k\) is the event of interest and other event types prevent it, the natural absolute-risk estimand is often a contrast in cause-specific cumulative incidence:

\[
F_{1k}(t)-F_{0k}(t).
\]

This is a total effect on the probability of event \(k\) by time \(t\), including any treatment pathways through competing events. If the user wants to ask what would happen if the competing event were eliminated, prevented, or separated into biological components, that is a different and usually stronger causal question. Consider separable effects only when the treatment can plausibly be decomposed into components with distinct pathways.

### Hazard contrasts

Cox, cause-specific hazard, and Fine-Gray subdistribution hazard models are useful modeling tools, but hazard ratios are conditional on the evolving risk set. They are not risk ratios, and they may be hard to interpret causally when treatment changes who remains at risk. If the user asks "what is the chance by 3 years?" or "which treatment gives more event-free time?", prefer risk, survival probability, RMST, or cumulative incidence.

## Identification Assumptions

State these separately from model assumptions.

### Time zero and consistency

Time zero should align eligibility, treatment assignment or initiation, and follow-up start. Treatment strategies should be defined clearly enough that the observed outcome under received treatment corresponds to the relevant potential outcome.

### Exchangeability or parent-route identification

For observational baseline treatment effects, causal interpretation typically requires that measured baseline covariates capture the reasons treatment choice and survival outcomes differ. For randomized, IV, RD, DiD, or longitudinal routes, inherit the design-specific assumptions from the parent subskill.

### Positivity

The target population must include comparable people who could receive each treatment strategy and who remain observable enough to estimate the survival curve, risk, RMST, or cumulative incidence.

### Censoring exchangeability

Administrative censoring is often easier to defend. Loss to follow-up or treatment-dependent censoring needs explicit handling, often with IPCW or sensitivity analysis. Censoring weights can fail if censoring is common or positivity is weak.

### Competing-event interpretation

Do not treat competing events as simple censoring unless the estimand explicitly targets a hypothetical event-free world and the assumptions are defensible. For most user-facing risk questions, use cumulative incidence.

## Method Recommendation Rules

### Design-to-method table

| Situation | Default recommendation | Required checks |
|---|---|---|
| Randomized trial, single event type | Kaplan-Meier plus adjusted survival/risk/RMST; Cox as secondary if hazard scale is desired | time zero, censoring, PH if Cox, RMST horizon |
| Observational baseline treatment, single event type | Target-trial framing plus standardization, IPCW, AIPW/TMLE, or adjusted curves | confounding set, overlap, censoring weights, adjusted curves |
| User wants interpretable treatment benefit | Survival/risk difference at time \(t\), RMST/RMTL difference, or absolute risk reduction | time horizon, censoring, clinical decision threshold |
| User wants CATE or treatment decisions with survival endpoint | Coordinate with `09-heterogeneous-effects-policy`; consider `grf::causal_survival_forest` for RMST or survival-probability CATE | unconfoundedness, censoring, horizon, calibration/validation |
| Cox or AFT model requested | Use as model-based support, not automatic causal conclusion | PH/AFT fit, risk-scale translation, adjusted predictions |
| Competing events present | Cumulative incidence and cause-specific event coding; consider cause-specific hazards or Fine-Gray depending on target | event coding, CIF curves, treatment effects on competing events |
| Causal competing-risk ATE for baseline treatment | `causalCmprsk`, `adjustedCurves`, `survtmle`, or weighted cause-specific models | exchangeability, censoring, weights, target population |
| Time-varying treatment or adherence | Route to longitudinal g-methods; use MSM/IPCW, g-formula, longitudinal TMLE/LMTP | sequential exchangeability, time-varying positivity, censoring |
| Heavy censoring or rare events | Simpler estimand, shorter horizon, descriptive analysis, or redesign | number at risk, weight instability, power |
| Recurrent events plus death | Coordinate with longitudinal/recurrent-event methods; do not reduce to first event silently | recurrent-event estimand, death handling, risk-set rules |

In normal responses, recommend one primary method and one comparator. Avoid listing every survival package unless the user asks for a software survey.

## Language Backend Policy

Do not install packages silently. If packages are missing, show install commands and ask for approval.

### R preferred stack

- `survival`: core `Surv`, Kaplan-Meier, Cox, AFT via `survreg`, Aalen-Johansen, multi-state support, left truncation, and robust variance options.
- `adjustedCurves`: confounder-adjusted survival curves and cause-specific cumulative incidence with direct adjustment, IPW, AIPW, empirical likelihood, TMLE options, and adjusted RMST.
- `riskRegression` and `prodlim`: risk prediction, cause-specific Cox/Fine-Gray workflows, prediction performance, IPCW, and competing-risk absolute-risk tools.
- `cmprsk` and `tidycmprsk`: cumulative incidence, Gray tests, and Fine-Gray subdistribution hazard models.
- `causalCmprsk`: point-treatment ATEs for survival and competing risks using propensity-score weighting, with risk, hazard, and restricted-mean-time summaries.
- `survtmle`: TMLE for baseline covariate-adjusted cumulative incidence in right-censored survival settings with and without competing risks.
- `lmtp`, `ltmle`, and `gfoRmula`: longitudinal or modified treatment policy questions with survival, censoring, or competing-risk endpoints.
- `grf`: `causal_survival_forest` for heterogeneous effects on RMST or survival probability with right-censored outcomes.
- `flexsurv`, `rstpm2`, `rms`, and `survRM2`: flexible parametric, spline, AFT, and RMST-oriented models.
- `timereg`, `mets`, `randomForestSRC`, and `ranger`: additive hazards, flexible competing risks, multi-state or machine-learning survival tools when their assumptions match the task.

### Python

Python can support many survival workflows, but R is usually stronger for causal survival and competing-risk tooling.

- `lifelines`: Kaplan-Meier, Cox, AFT, parametric models, and diagnostics for standard survival analysis.
- `scikit-survival`: survival ML, Cox models, random survival forests, performance metrics, and nonparametric competing-risk cumulative incidence.
- `pycox`: neural survival prediction. Use for prediction only unless a causal design and estimand are handled externally.
- `statsmodels`, `pandas`, `numpy`, and `scikit-learn`: custom IPW, standardization, pseudo-outcomes, diagnostics, and plotting.
- `iptw-survival`: emerging Python package for IPTW/overlap-weighted survival summaries. Check maturity and assumptions before recommending.

When the user proposes another package, check documentation for event coding, censoring assumptions, left truncation, competing-risk support, available estimands, weighting/TMLE support, and whether outputs are hazard-scale or absolute-risk-scale.

## Data Preprocessing Rules

1. Define eligibility, treatment, comparator, time zero, follow-up start, and outcome clock before creating the analysis dataset.
2. Use one row per person for baseline treatment survival analyses, or a person-period/long format for time-varying treatments and g-methods.
3. Preserve raw event time, censoring time, event type, competing event type, delayed entry time, and administrative end date.
4. Mark each variable as baseline confounder, treatment, event, censoring, competing event, time-varying confounder, mediator, post-treatment variable, or unknown.
5. Do not adjust for post-treatment variables in a baseline total-effect analysis unless the estimand explicitly requires a later decision point.
6. Keep people who are event-free and eligible at time zero; do not condition on future survival or future treatment.
7. Check event coding, units of time, duplicated records, negative times, zero times, and ties.
8. Track loss to follow-up and censoring reasons separately from competing events.
9. For RMST, choose the truncation horizon before looking for favorable effects and ensure enough people remain at risk near that horizon.
10. For competing risks, choose whether the target is event-specific cumulative incidence, all-cause composite risk, cause-specific hazards, subdistribution hazards, or separable effects.

## Required Diagnostics

### Design and timing diagnostics

- target-trial table with eligibility, treatment strategies, assignment time, follow-up start, outcome, censoring, and analysis plan;
- number at risk by treatment over time;
- event and censoring counts by treatment and event type;
- delayed-entry/left-truncation check;
- immortal time and time-zero alignment audit.

### Identification and censoring diagnostics

- baseline covariate balance or overlap by treatment;
- censoring rates by treatment and covariates;
- censoring model fit and IPCW weight distribution when weights are used;
- positivity checks for treatment and censoring;
- sensitivity to censoring assumptions and follow-up horizon.

### Model and endpoint diagnostics

- adjusted survival, risk, RMST, or cumulative-incidence curves;
- PH checks for Cox, cause-specific Cox, and Fine-Gray models when used;
- AFT or parametric model fit checks when used;
- calibration, Brier score, or prediction checks when building risk models;
- CATE calibration, RATE/TOC, subgroup validation, or held-out policy value when using survival CATEs or treatment rules.

## Failure Modes and Guardrails

Escalate warnings when:

- time zero occurs after treatment initiation, eligibility, or survival conditioning;
- the treatment definition requires future information;
- competing events are censored without a clear estimand justification;
- hazard ratios are interpreted as risk ratios, odds ratios, or direct survival probabilities;
- Cox/Fine-Gray proportional hazards assumptions fail but hazard ratios remain the main claim;
- censoring differs strongly by treatment and prognostic factors but is ignored;
- censoring or treatment weights are extreme;
- the RMST horizon is chosen after inspecting results;
- too few people remain at risk at the requested time horizon;
- death is treated inconsistently across outcome, censoring, and competing-event definitions;
- survival predictions are used for treatment decisions without a causal design;
- CATE estimates are treated as precise individual survival benefits without validation.

## Step-by-Step Operating Procedure

1. Restate the survival question in domain language.
2. Define time zero, treatment/comparator, event of interest, competing events, censoring, target population, and follow-up horizon.
3. Decide the estimand: survival probability, risk, RMST/RMTL, cumulative incidence, hazard contrast, survival CATE, or policy value.
4. Identify the parent causal route: randomized, observational baseline treatment, longitudinal treatment, HTE/policy, IV/RD/DiD with survival endpoint, or descriptive.
5. Choose one primary method and one comparator based on endpoint and design.
6. Plan preprocessing, event coding, censoring handling, and competing-event handling.
7. Run or request timing, risk-set, balance, censoring, and model diagnostics.
8. If using Cox/AFT/Fine-Gray, translate results to absolute risks, survival curves, RMST, or CIFs when the user needs decisions.
9. If diagnostics fail, shorten the horizon, change estimand, use a weaker descriptive interpretation, or route to longitudinal/missingness/interference/HTE subskills.
10. Record assumptions, diagnostics, limitations, and open questions in the project specification.

## Output Template

```markdown
### Survival / Competing-Risks Analysis

#### 1. Design setup
- Time zero:
- Treatment/comparator:
- Event of interest:
- Censoring:
- Competing events:
- Follow-up horizon:

#### 2. Estimand
- Target estimand:
- Time horizon or RMST tau:
- Target population:
- Interpretation:

#### 3. Assumptions
- Treatment identification:
- Positivity/overlap:
- Censoring exchangeability:
- Competing-event interpretation:
- No immortal time:

#### 4. Method recommendation
- Primary method:
- Comparator/fallback:
- Software/backend:
- Inference strategy:

#### 5. Diagnostics
- Risk-set/time-zero check:
- Number at risk:
- Balance/overlap:
- Censoring and weights:
- Adjusted survival/CIF/RMST:
- Model fit/PH checks:

#### 6. Interpretation
- Causal claim supported:
- What remains descriptive or exploratory:
- Fatal flaws or major limitations:
- Recommended next step:
```

## Related Subskills

- `subskills/05-randomized-experiments/`: use for randomized survival endpoints and trial estimands.
- `subskills/06-point-treatment-observational/`: use for baseline treatment identification before survival endpoint modeling.
- `subskills/07-matching-weighting-balance/`: use for overlap, weights, and balance before survival curves.
- `subskills/08-doubly-robust-ml/`: coordinate for AIPW/TMLE and flexible nuisance models.
- `subskills/09-heterogeneous-effects-policy/`: use for survival CATEs, treatment targeting, and decision policies.
- `subskills/10-longitudinal-gmethods/`: use for time-varying treatment, sustained strategies, cloning-censoring-weighting, and sequential censoring.
- `subskills/16-mediation/`: coordinate when survival mediation or separable effects are central.
- `subskills/17-interference-spillovers/`: use when one unit's treatment affects another unit's event time.
- `subskills/02-user-data-inspector/`: use when censoring, measurement, or selection dominate.
- `subskills/20-reporting-interpretation/`: use for final survival reports and limitation language.

## Reference Files

For the detailed workflow, read `references/workflow.md`. For estimand notes, read `references/survival_estimand_notes.md`. For the literature and software map, read `references/literature_and_software.md`.
