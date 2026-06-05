# Dynamic Treatment Policies Workflow
## Permission Note

This reference does not authorize execution. Treat diagnostics, artifacts, plots, tables, code, or report material as requests back to main unless main explicitly routed `execution_authorized` after user-confirmed scope.

Use this reference when `SKILL.md` is not enough for dynamic regimes, adaptive strategies, sequential policies, SMART analyses, or longitudinal policy-value report support.

## 1. Clarify The Dynamic Policy Target

Record the smallest useful target:

- **Decision schedule**: visits, time points, events, or rolling windows when action may change.
- **History**: covariates, responses, prior actions, contraindications, and costs available before each decision.
- **Action set**: feasible actions at each time, including no treatment, continue, stop, escalate, switch, or dose level.
- **Regime**: fixed, adaptive, deterministic, stochastic, learned, or user-specified.
- **Value target**: final outcome, cumulative outcome, survival, utility, cost, harm, or regret.
- **Deliverable**: regime comparison, learned policy, value estimate, SMART report, exploratory decision support, or deployment-style artifact.

If there is only one decision point, use `11-point-treatment-rules`. If the user wants fixed sustained treatment effects, use `02-longitudinal-gmethods` first.

## 2. Check Design Fit

Dynamic policies inherit longitudinal identification assumptions.

- Sequential randomized trial/SMART: strong support for regime comparison and learning if randomization probabilities and histories are known.
- Observational longitudinal data: requires sequential exchangeability, positivity, consistency, and censoring/missingness assumptions.
- Logged policy data: off-policy evaluation may be possible if propensities and available actions are known.
- Time-varying confounding affected by prior treatment: ask main to route `02-longitudinal-gmethods`.
- Survival outcome: ask main to route `23-survival-competing-risks`.

## 3. Choose A Method Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| User-specified fixed/adaptive regimes | Sequential g-formula, `gfoRmula`, `ltmle`, `lmtp` | Directly estimates regime value | Model dependence and positivity |
| Stable treatment/censoring weights | IPW/MSM | Transparent regime comparison | Weight instability |
| Need learned interpretable regime | Q-learning, A-learning, DTRreg, DynTxRegime | Classic DTR estimators and decision rules | Model misspecification and overfitting |
| SMART trial | DynTxRegime, DTRreg, SMART-specific analyses | Sequential randomization supports adaptive-regime estimation | Must respect randomization structure |
| Feasible treatment modifications over time | LMTP via `lmtp` | Avoids impossible fixed regimes | Target differs from "always set treatment" |
| Logged sequential decisions | Off-policy evaluation, fitted Q evaluation, doubly robust OPE | Uses logged actions and propensities | RL-style OPE is not causal without design assumptions |
| Python-only prototype | Custom sklearn/statsmodels/fitted-Q scaffold | Flexible prototyping | R has more mature DTR causal tooling |

## 4. Ask For Focused Data Work

Ask for one or two concrete checks at a time:

- long-format data with id/time/action/covariate/censoring/outcome;
- action availability and support by history;
- observed adherence to candidate regimes;
- randomization or logging propensity availability;
- censoring and missingness summaries;
- state-variable availability before each decision;
- candidate simple regimes for baseline comparison.

## 5. Diagnose Before Reporting

Minimum diagnostic set:

- support/positivity over histories;
- regime adherence or feasibility;
- weight instability/effective sample size when using IPW;
- censoring and missingness assumptions;
- policy value uncertainty and optimism correction;
- sensitivity to state variables, action definitions, time grid, and learner class;
- comparison with simpler interpretable regimes and standard care.

## 6. Reviewer Interaction

- `domain_expert`: validates adaptive strategy meaning, safety, ethical constraints, and practical deployment.
- `data_analyst`: prepares long-format histories, support checks, action logs, weights, and value artifacts.
- `method_lead`: decides longitudinal identification, target estimand, policy class, and claim boundary.
- `report_writer`: integrates policy target, strategy descriptions, diagnostics, and caveats.

## 7. Report Language

Use:

- "candidate dynamic treatment strategy";
- "estimated value under the stated sequential exchangeability and positivity assumptions";
- "SMART-supported adaptive regime analysis";
- "exploratory policy-learning result" when learned from observational/logged data.

Avoid:

- "optimal regime" without policy class, assumptions, and validation;
- "the model says to treat" without support and safety constraints;
- "dynamic policy" for a single baseline rule.
