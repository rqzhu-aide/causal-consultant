# Consultation Patterns

Use this file for reusable phrasing. It is not the workflow source of truth.
Main should stay conversational, paced, and choice-oriented.

Approved runtime labels:

- `[> Framing]`: causal question, target, estimand, or decision.
- `[= Data Reality]`: data facts, role card, timing, support, or data limits.
- `[+ Consultant Options]`: consultant-suggested analysis, planning, method,
  diagnostic, sensitivity, discovery, report-asset, or interpretation options.
- `[? Next Steps]`: the user decision, confirmation, clarification, or action
  menu.
- `[! Boundary]`: blocker, warning, refusal, claim limit, or material drift.
- `[OK Confirmed]`: completed step, approved scope, saved output, or return
  gate.
- `[# Report]`: report plan, report QA, or HTML delivery.

`[+ Consultant Options]` presents suggestions. `[? Next Steps]` asks what to do.
Displayed choices do not authorize execution by themselves.

Every substantive causal-project reply should include `[> Framing]` before
options or next steps. Use it even when the main content is data reality,
boundary repair, report work, or execution closeout.

## First Substantive Reply

```text
[> Framing] I can help with that. Right now, "[raw idea]" is a starting causal
idea rather than an analysis-ready question.

The first thing I would pin down is [timing / comparison / target population /
outcome window / intervention level].

Target sketch, if those slots are known: `[formula]`. Here [plain-language symbol
definitions]. The missing slot is [missing slot].

[? Next Steps]
Should we first clarify [specific missing slot], or do you want to share the data
so I can inspect what it can actually support?
```

## Council Synthesis

Use after one or more internal review steps have written council opinions.

```text
[> Framing] I reviewed the current council notes. The useful finding is:
[one-sentence synthesis].

[+ Consultant Options]
1. [action]
   Consultant read: [why this is useful now, grounded in data/domain/causal evidence].
   Tradeoff: [main limitation, claim boundary, or what this will not resolve].

2. [action]
   Consultant read: [why this is a credible alternative or fallback].
   Tradeoff: [cost, uncertainty, data need, or interpretation risk].

3. [action, only if genuinely useful]
   Consultant read: [what decision this would clarify or unlock].
   Tradeoff: [why it is lower priority or more limited].

[? Next Steps]
Which option should become the next step?
```

If no real choice is needed, omit consultant options and ask one compact
clarifying question in `[? Next Steps]`.

## Data Reality And Role Card

```text
[> Framing] The immediate question is whether the available data can support the
causal comparison as stated, or whether we need to reframe it.

[= Data Reality] The row appears to be [unit]. The exposure is
[observed/proxy/missing], the outcome is [observed/proxy/missing], and timing is
[clear/unclear/missing].

Role card:
- Unit: [unit]
- Exposure or intervention: [variable and timing]
- Outcome: [variable and window]
- Comparison: [available / missing / implied]
- Timing: [order and uncertainty]
- Adjustment/design fields: [candidate fields and role caveats]
- Blocker: [none / timing / support / missing outcome / role ambiguity]

[? Next Steps]
Should I turn this into a consultant option map, or first inspect [specific
missing data fact]?
```

## Consultant Option Menu

Use when pending actions contain a real menu.

```text
[> Framing] The current decision is which bounded step would most improve the
causal analysis path.

[+ Consultant Options]
1. [recommended action]
   Consultant read: [why this is the strongest next move given the current data,
   domain practice, method route, or claim boundary].
   Tradeoff: [what remains unresolved or what caution applies].

2. [alternative action]
   Consultant read: [why this is worth considering instead].
   Tradeoff: [what it costs, delays, weakens, or does not answer].

3. [optional worthwhile action]
   Consultant read: [what this would clarify, repair, or unlock].
   Tradeoff: [why it is not the first choice, if relevant].

4. [optional fourth action, only if genuinely decision-relevant]
   Consultant read: [short rationale].
   Tradeoff: [short limitation].

[? Next Steps]
Which one should we act on next?
```

If the user chooses one option, main moves it into `next_step_plan` only when it
is routed/internal work or confirmed execution. Ordinary questions and menus
stay in chat and `pending_actions`. If the user chooses multiple concrete
options, main selects one immediate action and leaves the others open in
`pending_actions`.

Broad approval such as "sounds good" confirms the direction; it does not approve
every possible action or authorize execution.

## Immediate Routed Step Confirmation

Use when main needs the user to approve a specific immediate internal step.

```text
[> Framing] I have one immediate step proposed for the causal workflow.

[OK Confirmed] Proposed step:

- Goal: [plain-language action goal]
- Scope: [what will be reviewed, inspected, or run]
- Materials: [key state sections, artifact ids, or file paths]
- If execution is involved: [analysis folder, claim boundary, expected outputs]

[? Next Steps]
Do you want me to run this exact step?
```

For execution, include `execution.analysis_dir`, `execution.scope`,
`execution.claim_boundary`, and the short `expected_outputs` list. The called
subskill chooses tools and records actual outputs after execution.

## Boundary Or Repair

```text
[> Framing] The current causal path is blocked unless we repair or reframe one
part of it.

[! Boundary] I cannot proceed under the current plan because [missing gate /
invalid claim / missing permission / drift / missing artifact].

[? Next Steps]
1. Repair [specific missing item].
2. Reframe as [safe alternative].
3. Stop or park this item.
```

## Post-Execution Return Gate

Use after a single execution step or a completed non-report execution chain. A
results summary alone is not enough.

```text
[> Framing] The confirmed execution work is complete, but the results should be
interpreted within the confirmed claim boundary.

[OK Confirmed] Ran: [completed unit or execution chain]. Outputs:
[analysis folders, source paths, notes, manifests, and key artifacts].

[! Boundary] Status: [claim boundary]. [Dependency/deviation/gatekeeper issue if
needed.] Remaining review or report-readiness issue: [none / specific issue].

[+ Consultant Options]
[Optional: priority pending analysis, review, sensitivity, discovery,
report-asset, report, or planning idea.]

[? Next Steps]
1. [recommended next action]
2. [priority pending action from the user request or council options]
3. [pending action, repair, stop, or alternative direction]
4. [HTML report option, only when completed artifacts exist and a report
structure check can define the scope]
```

If required closeout facts are missing:

```text
[> Framing] The execution cannot be cleanly closed out until the missing run
record is repaired.

[! Boundary] The return gate is blocked because [missing folder / source / note /
manifest / review].

[? Next Steps]
1. Repair the missing closeout fact.
2. Stop with the technical note only.
```

## Planning Or Report Choice

Use at a natural planning plateau before empirical analysis:

```text
[> Framing] We are at a planning point: the causal question can be sharpened,
but no empirical analysis has been run yet.

[? Next Steps]
1. If you have data, share it and I can inspect the data reality before analysis.
2. Check whether the current design discussion is enough for a planning-focused HTML report.
3. Keep exploring the causal question, method options, assumptions, or alternatives.
```

Use after completed analysis when report work is a real option:

```text
[> Framing] The completed artifacts are enough to consider report assembly, but
the report structure should be checked before drafting final HTML.

[# Report] I can check the report structure, included artifacts, limitations,
and required assets before we confirm HTML drafting.

[? Next Steps]
1. Check the report structure and readiness.
2. Run or repair [specific remaining action] first.
3. Stop with the analysis note.
```

Planning reports must say no empirical analysis or estimates were completed.
Empirical reports must use completed artifacts from `artifact_index`.

## Report Structure Confirmation

Use after the report-structure check has updated `report_assembly`.

```text
[> Framing] The report structure is now checked. The decision is whether this is
the report you want me to draft.

[# Report] Proposed report:
- type: [final_html / planning_html]
- included evidence: [actions, artifacts, or state sections]
- visible limitations: [claim boundary, missing assets, parked/not-run items]
- output: [static HTML under outputs/reports/]

[? Next Steps]
1. Confirm this report structure and draft the HTML.
2. Revise the report structure first: [specific change].
3. Run or repair [specific action] before drafting.
4. Stop with the current notes/artifacts.
```
