# Workflow: Survival and Competing Risks

## Purpose

Use this workflow when the outcome is time until an event and the analysis must account for censoring, risk sets, competing events, delayed entry, or survival-specific causal estimands.

The workflow should first define time zero, event types, censoring, and estimand. Model choice comes after the target trial or causal design is clear.

## Stage 1: Intent and Data Triage

Classify the user's immediate goal:

- learn survival estimands;
- audit time zero and censoring;
- estimate a treatment effect on survival, risk, RMST, or cumulative incidence;
- compare survival curves after adjustment;
- handle competing risks;
- estimate heterogeneous treatment effects or treatment decisions with survival endpoints;
- draft R/Python code;
- interpret survival or competing-risk results;
- prepare a report.

Collect only the information needed for the next step:

- time zero and eligibility;
- treatment or intervention and comparator;
- event of interest and event code;
- competing events and censoring codes;
- follow-up horizon and time scale;
- delayed entry, left truncation, recurrent events, or repeated measures;
- baseline confounders and treatment timing;
- censoring reasons and administrative end;
- whether the user wants risks, survival probabilities, RMST, hazards, CATEs, or a decision rule.

If the user is learning, explain that survival analysis tracks both event occurrence and time at risk, and that causal survival analysis adds a treatment-comparison question on top of that.

## Stage 2: Feasibility and Route Check

Before choosing an estimator, decide whether this subskill is the right active route.

Use this route when:

- the outcome is time to an event or duration until an event;
- some people are censored, lost to follow-up, administratively censored, or have competing events;
- the user needs survival curves, risk by time, RMST, cumulative incidence, hazards, or survival treatment decisions;
- the main causal design already exists or can be coordinated with a parent route.

Route out or coordinate when:

- treatment is time-varying or adherence/regimes are central: longitudinal g-methods;
- the user asks for individualized treatment rules or policy learning: HTE/policy;
- the design is IV, RD, DiD, synthetic control, or mediation with survival endpoint: keep that design active and use survival endpoint support here;
- censoring, missingness, measurement, or selection is the central threat: missingness/measurement/selection;
- the analysis is pure survival prediction without causal interpretation: use survival modeling outside the causal skill.

When routing out, update `subskill_analyses` with the rejected or fallback reason and return to the main route shortlist.

## Stage 3: Estimand and Project Spec Entry

Update the project specification entry from the top-level `../../../SKILL.md`.

At minimum, record:

- time zero;
- treatment contrast;
- event of interest;
- censoring and competing events;
- time horizon or RMST truncation time;
- target estimand;
- primary method and comparator;
- censoring and competing-risk assumptions;
- fatal flaws or limitations.

Do not fill method-specific details that are not yet known. Keep unknowns as `null` or `[]`.

## Stage 4: Method Selection

Recommend in layers rather than as a large menu. Choose one primary family and one comparator unless the user asks for a survey.

### Randomized or target-trial layer

Use when treatment assignment is randomized or a target trial can be clearly emulated:

- Kaplan-Meier or Aalen-Johansen curves for unadjusted orientation;
- adjusted survival/risk/RMST curves for precision or standardization;
- Cox or AFT models as secondary or model-based summaries;
- RMST when hazards are non-proportional or the user needs interpretable time gained/lost.

### Observational baseline-treatment layer

Use when treatment is selected at baseline and confounding must be addressed:

- standardization or direct adjusted survival curves;
- inverse probability weighted survival curves;
- AIPW/TMLE survival or cumulative incidence;
- weighted cause-specific or competing-risk workflows;
- target-trial emulation to avoid immortal time and selection bias.

### Competing-risk layer

Use when a competing event prevents the event of interest:

- cumulative incidence functions for event-specific absolute risks;
- Aalen-Johansen for nonparametric multi-state/CIF estimates;
- cause-specific Cox when the hazard process or etiologic association is the target;
- Fine-Gray when subdistribution hazard modeling or CIF prediction is the target;
- causal competing-risk tools when the target is an ATE on CIF, risk, or restricted mean time.

Do not censor competing events by default. If a user asks for "death-free risk of relapse" or "risk if death were prevented," pause and clarify the estimand.

### Heterogeneity and decision layer

Use when the user wants patient-specific treatment effects or treatment choices:

- survival CATE on RMST or survival probability at a specified horizon;
- `grf::causal_survival_forest` when right-censoring, unconfoundedness, and a suitable horizon are defined;
- subgroup RMST/risk contrasts as an interpretable comparator;
- policy learning only after validation plans are clear.

Coordinate with the HTE/policy subskill for validation, policy value, fairness, and deployment concerns.

## Stage 5: Diagnostics and Sensitivity

Plan diagnostics before final causal interpretation.

For timing and risk sets:

- target-trial table;
- number at risk by treatment over time;
- event and censoring counts;
- immortal-time audit;
- delayed-entry and left-truncation check.

For censoring and identification:

- balance or overlap after adjustment/weighting;
- censoring distribution by treatment and covariates;
- IPCW distribution and effective sample size;
- sensitivity to administrative versus loss-to-follow-up censoring;
- positivity at the requested time horizon.

For survival/competing-risk models:

- adjusted survival, risk, RMST, or CIF curves;
- PH checks for Cox, cause-specific Cox, and Fine-Gray models;
- AFT or parametric fit checks;
- calibration and prediction checks when used for decisions;
- event-code audit for competing risks.

## Stage 6: Interpretation and Fallback

Interpret results on three levels:

- **Causal support:** whether treatment comparison assumptions and time zero support a causal claim.
- **Endpoint support:** whether censoring, risk sets, and competing events were handled appropriately.
- **Decision support:** whether the scale and horizon match the user's decision.

If diagnostics fail, choose one of these fallbacks:

- shorten the follow-up horizon;
- switch from hazard ratios to RMST or risk by time;
- switch from KM to cumulative incidence for competing risks;
- use IPCW/TMLE/AIPW instead of model-only adjustment;
- route to longitudinal g-methods for time-varying treatment;
- report descriptive survival only.

## Suggested Response Pattern

```markdown
I would treat this as a survival/competing-risk problem because [reason].

The first thing I would define is time zero: [candidate time zero]. The event of interest is [event], censoring is [censoring], and [competing event] should be treated as [competing event / censoring only if justified].

For the causal target, I would prefer [survival/risk/RMST/CIF estimand] at [time horizon] because [interpretation]. A Cox or AFT model can still be useful, but I would translate it into adjusted curves or risk/RMST summaries for interpretation.

A reasonable starting method is [primary method] plus [comparator]. Before trusting it causally, I would check [time-zero/censoring/balance/model diagnostic]. If [diagnostic] fails, I would [fallback].
```

## Code Template Index

Root templates:

- `scripts/R/survival_adjusted_curves_template.R`

Use the template only after adapting time zero, event coding, censoring, treatment, covariates, competing-risk handling, and target horizon. Do not install packages silently.

## Literature and Software Map

For key papers, package capabilities, and method-selection notes, read `literature_and_software.md` in this folder.
