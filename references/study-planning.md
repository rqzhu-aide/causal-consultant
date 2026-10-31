# Selective study and sample-size planning

Use when prospective collection, sample size, precision or a fixed resource
ceiling makes these distinctions consequential. This is guidance within the
selected review, not another design or a checklist for every consultation.
[Causal readiness](causal_check.md) owns the identifying study account;
[design-worker feasibility](design_worker.md#feasibility) connects that basis to
a supported calculation. Return material changes of target, identifying argument
or study process to Lead. Basic explanations need no methods search.

## Start with the decision

Establish what the planning answer will change: recruitment, sites, follow-up,
measurement effort, allocation, or what existing resources can reasonably
establish. Give a useful provisional recommendation with its decisive condition;
do not wait for every nuisance input to become known.

Distinguish power for a named hypothesis, precision for a named quantity,
sensitivity under a fixed sample, and assurance averaged over an explicitly
justified design distribution. Expected interval width, probability of achieving
a width, and coverage differ. A meaningful effect, anticipated effect and
detectable effect are not interchangeable. Average, subgroup, interaction,
policy-value and equivalence/noninferiority questions need their own criterion.
Low anticipated power alone does not make fixed-data estimation worthless;
bias, sparse information and reliable uncertainty still matter.

Scenario ranges are not automatically prior-averaged assurance. A design
distribution represents planning uncertainty and need not equal an analysis
prior. [Pan and Banerjee (2023)](https://doi.org/10.32614/RJ-2023-066) provide
concrete assurance methods for specified models, not a universal causal formula.
Do not invent a prior to fill an unavailable input or silently change the user's
inferential framework.

## Work with attainable information

Separate quantities the user can choose from those the worker should derive:

| Kind | Examples | Useful action |
|---|---|---|
| Design choices | Sites, allocation, visits, sampling scheme, validation effort, endpoint horizon | Compare the few feasible choices that could improve the user's goal. |
| Empirical inputs | Outcome variation, event rates, correlations, retention, treatment overlap, costs | Seek relevant evidence or defensible ranges, preserving uncertainty and transport limits. |
| Derived consequences | Sampling overlap, supported exposure durations, assignment support, mature endpoints, conditional cost/power | Calculate from the design and stated scenarios instead of requesting redundant or inconsistent inputs. |
| Unidentified or future quantities | Future effect trajectory, individual-effect variation, joint potential-outcome dependence | Label assumptions or sensitivity scenarios; a simulation does not make them observed facts. |

For consequential variables, connect the intended construct to its recorded proxy,
unit/population, source, coverage and timing. Distinguish reference/event time,
actual assessment time and record availability. A later upload may describe an
earlier window but does not establish accurate pretreatment measurement. A field
that becomes available after the planning deadline cannot supply timely evidence.
Reuse inspected definitions; supplied materials belong to [data audit](data_audit.md),
and a consequential construct/validation uncertainty may need
[domain expertise](domain_expert.md), without an automatic extra handoff.

Distinguish the source pool, eligible people, repeated entries, validated measures,
successfully recovered outcomes and target-relevant events. Clones or additional
visits do not create independent recruits. Consider measurement improvement or
targeted ascertainment when more routine records would add little useful
information. Validation references can themselves be imperfect; a small pilot
does not establish an optimal allocation. Feasible collection advice retains
the existing burden, access and harm-response conditions in causal readiness.

## Match the calculation to the proposed analysis

Connect target, effect scale, estimator/test, uncertainty, assignment, observation
process and independent information units. A package default is not a silent
substitute. The following contrasts are navigation cues; inspect only those
affecting the current recommendation.

| Setting | Consequential distinction and planning direction |
|---|---|
| Observational weighting | ATE, ATT and overlap targets differ. Examine weight/outcome relationships, heterogeneity and estimated-score variance; a weight-only effective sample size is not the whole information calculation. Variance planning and sensitivity to omitted confounding answer different questions. |
| Covariate adjustment or flexible nuisance learning | Precision depends on available pretreatment measures, the actual estimator, fitting/splitting and inference. Predictive accuracy alone does not determine a causal estimator's power. Reuse the cluster covariance warning in [randomized assignment](design/randomized_assignment.md). |
| Cluster or stepped-wedge studies | Clusters, periods and people contribute different information. Open/closed cohorts and repeated cross-sections have different person overlap and covariance. Fixed cluster counts may impose precision limits that more people cannot overcome; match finite-cluster inference. |
| Rollout or delayed effects | Calendar trends, calendar effect modification, exposure duration and endpoint availability differ. Derive supported contrasts from the schedule and distinguish mature from pending outcomes at decision dates. Removing measurement cells may remove support for the desired effect. |
| SMART or micro-randomized trials | Embedded-regime contrasts differ from protocol-dependent proximal effects among available decision points. Availability is not ordinary missingness. Predetermined time-varying probabilities, response-based branches and outcome-adaptive allocation need their respective justification. |
| Factorial or heterogeneity questions | Marginal effects, combinations and interactions require different contrasts and support. Plan the intended comparison; do not select it retrospectively after a nonsignificant interaction test. |
| Survival or intercurrent events | Match event probabilities, recruitment/follow-up, censoring and the chosen endpoint. Marginal Cox planning is not general planning for risks, RMST or competing-risk incidence. Undefined outcomes differ from unobserved ones; use [outcome support](support/non-continuous-outcomes.md). |
| Panel, DiD or RD | Measurement spacing/covariance, treatment-effect versus pre-trend-test power, and usable observations near a real cutoff matter. Use the selected design's inference and support, not total database rows. |
| Measurement error or validation | Distinguish routine cohort size from validated information. Compare realistic validation allocation and cost with additional low-quality records; preserve error and selection assumptions. |
| Informative observation | Whether and when outcomes are observed may depend on evolving health or exposure. Consider attainable observation-process data, scheduled assessment or outcome recovery; a dropout multiplier does not resolve selection. |
| Sparse inputs or budget ceiling | Give conditional scenarios or bounded collection advice and identify which attainable input would most change it. Do not repeatedly demand an unavailable number or assume a budget-optimal design answers the original question. |

Useful primary anchors, with their scope, include:

- [Liu, Yang and Li (2026)](https://doi.org/10.1214/26-AOS2649): asymptotic
  propensity-weighting planning under working models. The inspected
  [arXiv v5](https://arxiv.org/pdf/2501.11181v5) contains target-specific
  heterogeneity qualifications, especially for ATT. Do not generalize
  conservatism across targets or transfer these calculations to every doubly
  robust estimator. Inspect the intended implementation's current branch.
- [Kasza et al. (2020)](https://doi.org/10.1002/sim.8519): open-cohort covariance
  from the sampling/overlap mechanism, with continuous-outcome and participation
  assumptions. [Kenny et al. (2026)](https://doi.org/10.1186/s13063-026-09558-x)
  connects exposure-time targets to stepped-wedge power under specified models;
  there is no universal sample-size multiplier.
- [Branson, Li and Ding (2024)](https://doi.org/10.1093/biomet/asad027):
  asymptotic power for specified balance rerandomization. This neither describes
  broken allocation nor supplies a generic clustered/adaptive extension.
- [Cohn, Qian and Murphy (2023)](https://doi.org/10.1002/sim.9748): binary proximal
  MRT planning under availability and dependence assumptions.
  [Yap et al. (2023)](https://doi.org/10.1177/09622802231167435) instead studies
  longitudinal-count SMART regime comparisons through a specified simulation.
  Neither is a general formula for all adaptive treatment designs.
- [Han et al. (2021)](https://doi.org/10.1177/0962280220978500): survival-model
  validation allocation for error-prone exposures.
  [Levis et al. (2024)](https://doi.org/10.1002/sim.10298) examines targeted recovery
  of initially missing outcomes under second-stage ascertainment and positivity
  assumptions. Neither makes every chart review or recontact a bias repair.

These are starting points for applicable research, not prescribed methods or
installation requests. A more efficient overlap population, shorter endpoint
or different contrast must retain its changed interpretation and the user's
original target; power alone does not justify adopting it.

## Investigate consequential gaps and give conditional advice

Search when a consequential feature lacks a justified treatment, an extension
is unfamiliar, evidence conflicts, or method/implementation knowledge may be
outdated. Search by the actual target, design, outcome and difficult feature.
Inspect the assumptions, estimator, uncertainty and relevant appendix or
simulation, not just the abstract. Prefer a published version when available;
record the version actually inspected and label preprints. Check consequential
implementation defaults, including test direction. Distinguish a documented
method, available software and locally checked functionality.

Reuse adequate sources. Stop when advice is supported or the remaining limit is
clear. Inaccessible evidence supports a qualified candidate, not a verified
calculation. Failure to find a method does not establish that none exists. An
unfamiliar planning formula alone does not change the identifying design.

Choose an applicable analytical calculation or a justified simulation of the
intended analysis; neither is an automatic fallback or mandatory stage. Preserve
uncertainty and dependence among planning inputs. Check numerical procedures
against relevant limiting/known cases. Simulations retain generating assumptions,
null calibration where relevant, Monte Carlo uncertainty and failed fits. A
selected scenario or successful API call is not a general operating guarantee.
[White et al. (2024)](https://doi.org/10.1093/ije/dyad134) describes simulation
checks. A candidate optimum is conditional on its model and search space; a
greedy search does not prove global optimality.

Use the [authorization boundary](authorizations.md#which-work-is-protected) for
assumed-input planning versus observed-study target estimation, and
[saved work](runs.md#plan-content) for substantial calculations. Preserve sources,
assumptions, changed inputs and result qualifications in the existing records.
Return useful conditional advice or a concrete next action when a precise
number is unjustified. Lead selects the public questions and alternatives;
unresolved assumptions need not become repeated questions or a compulsory report.
