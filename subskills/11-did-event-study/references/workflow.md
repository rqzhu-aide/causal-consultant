# Workflow: Difference-in-Differences and Event Studies

## Purpose

Use this workflow when units are observed over time and some units adopt a policy, treatment, or exposure while others are untreated or not yet treated. The workflow should define the DiD estimand, choose a modern estimator, and audit parallel-trends credibility.

## Stage 1: Timing and Data Structure

Define:

- unit ID and time variable;
- treatment or policy start date for each unit;
- never-treated and not-yet-treated controls;
- whether treatment is absorbing, reversible, continuous, or repeated;
- outcome timing;
- balanced panel versus unbalanced panel or repeated cross sections;
- level of treatment assignment and clustering.

Make a treatment timing table before modeling.

## Stage 2: Estimand

Choose:

- simple two-group/two-period ATT;
- group-time ATT;
- event-time/dynamic ATT;
- cohort-specific effect;
- calendar-time effect;
- overall ATT summary.

State how group-time effects will be aggregated. Avoid saying "the DiD effect" without specifying the target.

## Stage 3: Feasibility and Assumptions

Assess:

- parallel trends or conditional parallel trends;
- no anticipation;
- stable unit composition;
- no spillovers or contaminated controls;
- treatment timing validity;
- enough pre-periods and event-time support;
- whether covariates are pre-treatment and suitable for conditional trends.

Pretrend tests and plots are diagnostics, not proof. Use domain knowledge and sensitivity analysis when claims matter.

## Stage 4: Method Selection

Use classical two-period DiD only when there are two groups and two periods or a very simple panel structure.

Use Callaway-Sant'Anna group-time ATT when:

- treatment timing varies across cohorts;
- never-treated or not-yet-treated controls are available;
- the user needs group, dynamic, calendar, or overall ATT aggregations.

Use Sun-Abraham or related interaction-weighted event studies when:

- dynamic event-time effects are the main output;
- staggered adoption and heterogeneous effects make naive event-study TWFE unsafe.

Use imputation or two-stage approaches when:

- untreated potential outcomes can be modeled using untreated observations;
- time-varying controls or efficient event-study estimation are important.

Use doubly robust DiD when:

- conditional parallel trends with covariates is the key identifying route;
- panel or repeated cross-section two-period/two-group setup fits the estimator.

Use HonestDiD or related sensitivity when:

- pretrends are imperfect;
- the user needs conclusions under bounded violations of parallel trends.

## Stage 5: Diagnostics and Sensitivity

Report:

- treatment timing table;
- cohort sizes and event-time support;
- raw outcome trends by cohort and control group;
- event-study plot with pre-periods;
- placebo periods or placebo outcomes when possible;
- sensitivity to never-treated versus not-yet-treated controls;
- sensitivity to covariates and event-time binning;
- clustered standard errors at the assignment level;
- parallel-trends sensitivity when claims are high-stakes.

## Stage 6: Interpretation and Fallback

Interpret as an ATT for treated units/cohorts unless a different estimand is explicitly justified. If checks fail:

- narrow to cohorts with credible controls;
- change the control group;
- shorten or re-bin event windows;
- use synthetic control for few treated units;
- use HonestDiD sensitivity rather than a point claim;
- route to `02-data-technician` or `17-interference-spillovers` if those problems dominate;
- report descriptive trends only.

## Suggested Response Pattern

```markdown
I would treat this as a DiD/event-study problem because [units] adopt [policy] at different times and outcomes are observed before and after.

The target estimand should be [group-time/dynamic/overall ATT], not a generic TWFE coefficient.

My primary route would be [method] with [control group]. I would use [fallback/comparator] as a robustness check.

Before interpreting the result causally, I would check [parallel trends/no anticipation/control sensitivity/composition].

If [main credibility issue] fails, I would [fallback plan].
```

## Code Template Index

Root template:

- `scripts/R/did_callaway_santanna_template.R`

Use this as the first template for staggered adoption with group-time ATT. Adapt ID, time, first-treatment period, covariates, control group, clustering, and aggregation before returning code.

## Literature and Software Map

For key papers, textbooks, and software notes, read `literature_and_software.md` in this folder.
