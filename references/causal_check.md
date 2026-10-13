# Causal Readiness and Design Elicitation

Use `causal_check` with operation `design_elicitation` or `readiness`. Review
what the study can support, not how persuasively a causal sentence can be written.
A user's preferred estimator is a question to investigate, not validity evidence.

For an initially underspecified causal request, assess the consequential study
process before endorsing a final strategy or an exhausted-evidence fallback.
This is substantive work, not a required checklist of status fields. Reuse
established facts and earlier adequate assessments; ask or inspect only gaps
that could change the target, design or advice. Explicit descriptive work can
proceed within its own claim boundary while the causal question remains open,
subject to [authorizations.md](authorizations.md) for protected computation.

## Design Elicitation

Interpret available user accounts, protocols, allocation rules, eligibility
records, rollout decisions and collection logs when they can resolve the main
uncertainty. Establish who could receive treatment, who decided, on what
information, at what time, and why some units received a different exposure.
Separate assignment, actual receipt, exposure measurement and outcome observation.
Ask what changed in recruitment, recording, eligibility or follow-up around the
intervention. Distinguish actual practice from the written protocol.

Produce a coherent, source-labelled account of the assignment and collection
process, including contradictions and gaps. Explain which designs that account
supports or undermines. When one missing fact remains decisive, identify it
precisely and say how the user or a document could resolve it. Ordinary asking
for that fact is lead work, not a reason to invoke an empty specialist review.

## Readiness

Check the question, population, intervention/exposure, comparator, outcome,
time zero, follow-up and estimand against the actual evidence. In particular:

- order covariates, treatment, mediators, outcomes, selection and censoring;
- identify the assignment or exposure process and the comparison it supports;
- assess confounding, measurement, missingness, support, leakage, interference,
  clustering, selection and transport assumptions where they affect the target;
- distinguish evidence for an assumption from an assumption merely adopted;
- identify diagnostics, sensitivity, falsification or negative controls that
  could materially weaken or qualify the conclusion.

For design or support selection, load [method-catalog.md](method-catalog.md).
Do not load all design playbooks. The catalog identifies a scientific frame;
its presence does not establish that required data or assumptions are satisfied.
Routine empty audit/domain status fields are not blockers. Inspect the evidence
actually needed for this review, and do not treat imagined data as available.

Discovery output remains candidate structure. Establish variable roles,
adjustment validity and identification independently from timing, assignment,
domain knowledge and defensible assumptions. A fitted graph is not an adjustment
certificate. Diagnostic success cannot prove untestable identification assumptions.

Use [Helper's reconciled account](helper.md#resume-and-interpret) without
mistaking understood meaning for established science. Assess the affected
mechanism, cohort, target and plausible alternative accounts against their
sources. Return justified changes and unresolved implications together; preserve
unaffected conclusions and historical reviews. Changed source meaning does not
itself imply altered artifact bytes.

## Strategies and the Next Discriminator

Compare plausible accounts against the original causal question, not only the
currently preferred analysis. For a leading check, identify what different
answers would enable or rule out and a source capable of distinguishing them.
An important but difficult gap remains a limit on the claim; prioritize a
feasible investigation of it rather than replacing it with easier diagnostics.

For example, a spending/outcome snapshot may reflect funding received before
the studied cohort's exposure, or spending recorded after its outcome. Inspect
the period/cohort definitions to distinguish these accounts. If timing aligns,
investigate how funding differed and whether a relevant allocation record exists.
A rule is a lead to assess, not an identification certificate. If timing or
assignment cannot be recovered, distinguish an established access/knowledge limit
from a source that has simply not been examined. No fixed question order follows
from this example.

Maintain project-specific candidates using the
[study-record contract](memory-records.md#study-and-user-records). Recommend a default
only when evidence can rank a responsible route for the current target; keep a
route's endorsement or exclusion conditional while unresolved study facts could
materially change it.
Develop alternatives for Lead across model assumptions or structure, data
construction or linkage, method, population, comparator, follow-up, estimand or
interpretation, including an explicitly non-causal fallback. Follow
[Lead's conditional option guidance](team_lead.md#select-the-next-useful-contribution):
normally offer at least two meaningful directions when a real next choice remains.
Direct answers, an accepted next action and user-directed closure need no menu;
a viable default alone does not establish that useful alternatives are exhausted.
An information route asks whether the user can provide existing data, protocols,
assignment records or other documentation, and explains what it could resolve.
It does not ask for a repeated experiment or new observations. Do not invent
unsupported science to populate the menu; preserve the limits of available evidence.

For each material change, record its supporting/opposing evidence, unmet
requirements, claim boundary, reason, and what could reopen or promote it.
Keep unsupported and historical strategies discoverable. Two strategies sharing
a design remain distinct if their populations, targets or required data differ.
Routine estimator or uncertainty variants belong inside one strategy.

An alternative target does not replace the user's current target. ATT, overlap,
complier, cutoff-local and future-data targets may be valuable, but their changed
interpretation must be visible and adopted before execution. Never rank or create
strategies from the significance, direction or desirability of target results.
Result-driven recoding, exclusions or target switching do not repair a design.

If evidence cannot rank the routes, say so and name the smallest fact or user
decision that would discriminate them. Recommend an actionable next investigation,
with its required material, rather than another generic causal review. A missing
assignment log cannot be supplied by invoking a different specialist. If no
attainable review would change advice, give the supported conditional or limited
recommendation and return to the lead for discussion. Residual assumptions need not be repeatedly sent back
to the user as factual questions. Return proposed dispositions for the
[lead to reconcile](team_lead.md#closeout); use the [question contract](memory-records.md#questions)
when updating a saved answer or unresolved remainder.

## Claim and Work Boundary

Use the [record purposes and budgets](memory-records.md#prose-budgets-and-purpose):
summarize the decisive conclusion and limit; link the detailed identifying account.

Make the assessment's basis inspectable: connect consequential facts and their
sources, unresolved conditions, the live routes they support or undermine, and
the reason for the recommended next action or stopping. Unknowns need not all
be resolved. An open, attainable check that could materially improve the answer
prevents calling the evidence exhausted; a bounded result or explicit user
closure can still be complete. Preserve which question was actually settled.

State whether the evidence supports a causal claim under named assumptions,
a narrower qualified causal claim, association-only analysis, or planning only.
An explicit descriptive fallback can be useful but is never a causal design or
a silent substitute for requested estimation. Unresolved identification conditions
must be named as conditions on the claim or concrete checks needed before it,
not buried in a generic limitations list.

This review may inspect inputs, existing results and input/design-feasibility
diagnostics. Do not compute a new target outcome contrast, fitted target result,
subgroup effect or exposure-outcome association. Calling it a diagnostic does
not change that boundary. Existing results can be discussed without recomputation
or extension. Policy learning/value and outcome-based subgroup selection are
also protected analysis. A new estimate needs a presented analysis scope and
later acceptance before one design worker executes it in a later turn.

Return one meaningful review with evidence, assumptions and strategy changes
to the [named commit owner](memory.md#ownership-and-save-points), normally Lead.
Use the [review contract](memory-records.md#checkpoints-and-reviews), linking it
to the prospectively recorded handling and assignment. An option
selection authorizes bounded work; it does not confirm the identifying
conditions. Preserve partial answers and uncertain accounts in the evidence
and keep unanswered factual questions open.

Link consequential supported claims to their target, assumptions, source basis
and limits through the [result-condition contract](memory-records.md#result-conditions).
Do not merely place a condition
in a general limitations paragraph where it can detach from the claim. Existing
unlinked results are unreviewed for these conditions, not assumption-free.
Return the decisive uncertainty and practical next direction to the lead. Do not
start another specialist or perform final report production inside this review.
The lead reconciles the handoff and records which questions it actually asks in
the outgoing exchange. Readiness is a finding, not execution permission or an
automatic report transition. A design-only or nonidentification finding can be
discussed and support its own later report offer without invented effect results.
