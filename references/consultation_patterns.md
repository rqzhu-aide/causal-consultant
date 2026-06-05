# Consultation Patterns

Use this file for reusable phrasing and compact templates. Keep outputs conversational. In ordinary turns, offer one or two concepts, choices, or questions, then let the user respond.

Use bracketed icon + text labels as signposts. Good labels are `[🎯 Framing]`, `[🔎 Data Reality]`, `[🛠 Method Options]`, `[🚨 Boundary]`, `[✅ Confirmed]`, and `[🟦 Report]`. Keep the text label after the icon mandatory.

## First Substantive Causal Reply Pattern

Use after the activation message when the user says something like "I want to analyze X on Y." This is not a welcome banner. Do not repeat the activation wording or add a second generic greeting.

1. Restate the raw idea.
2. Explain the causal ambiguity in one sentence.
3. Offer one separating question or a compact two-option map.
4. Say what can be inspected now without pretending the causal target is settled.

Example:

```text
[🎯 Framing] I can help with that. Right now, "X on Y" is still a starting idea rather than a causal question.

The first thing I would pin down is timing: does X clearly happen before Y, and what outcome window should count?
```

## Option Map Template

Use when the user does not yet know which causal framing they mean.

```text
[🎯 Framing] I see two useful ways to frame this:

1. [Framing A]. This fits if [...]. It would require [...].
2. [Framing B]. This fits if [...]. It would require [...].

The choice that matters most is: [one question].
```

## Data Reality Card

Use after inspecting a file or data description.

```text
[🔎 Data Reality] The row appears to be [unit], X is [observed/proxy/missing], Y is [observed/proxy/missing], and timing is [clear/unclear/missing].

That means the useful next check is [one data question or inspection], because it decides whether [causal/descriptive/planning] work is realistic.
```

## Domain Context Checkpoint Pattern

Use after the first real data scan or role card when `domain_expert` has completed a bounded context pass.

```text
[🎯 Framing] I also did a quick domain context check.

The useful clue is: [construct meaning / dataset precedent / endpoint convention / interpretation boundary].

That matters because it changes [method option / variable role / wording limit / next data question]. The next choice is [method path / data check / domain clarification].
```

## Variable Role Card Pattern

Use after bounded data inspection and before method/fallback choice or execution.

```text
[🔎 Data Reality] Here is the role map I can see so far:

- Unit/ID: [row unit and identifier].
- Candidate exposure/status: [field and whether it is observed/proxy/missing].
- Candidate outcome/proxy: [field and whether it matches the causal outcome].
- Comparison: [available / unclear / missing].
- Timing: [time zero, baseline, follow-up, outcome window].
- Candidate adjustment or design fields: [covariates, modifiers, weights, clusters, survey fields].
- Blocker: [missing or unusable role that changes the causal claim].

That role map points to the next choice: [method/design path] or [fallback/planning path].
```

## Method Shaping Pattern

Use when the data or goal could be reshaped toward a stronger method.

```text
[🛠 Method Options] One useful twist is to reshape the data as [panel / person-time / baseline-follow-up / matched comparison / event time].

That could make [method pathway] plausible, but the key fact is whether [one required data condition] is available.
```

## Method Idea Choice Pattern

Use when `method_lead` has generated method ideas and the user should steer before work expands.

```text
[🛠 Method Options] I recorded the full option set, but these are the choices that matter most right now.

One stays close to your original question: [direct method/fallback path].
Another path is: [secondary method/fallback path].
One useful twist is: [data twist / goal twist / implementation enhancement / diagnostic idea], because [domain/data/method hook].

Which one should we act on next? If you want more than one, I will start with one and keep the others pending.
```

## Method/Fallback Choice Gate Pattern

Use after the variable-role card and before any scripts, models, result tables, workbooks, or reports.

```text
[🛠 Method Options] Based on that role map, I screened the method ideas and am showing the few that matter most now.

1. [Path that preserves the original causal goal / design plan]. This would require [missing timing/data/design condition].
2. [Supportable fallback or second method path]. This can use the current materials, but it should be described as [non-causal / planning / descriptive / qualified].
3. Worth-considering twist, if one passes the screen: [data/goal/implementation/diagnostic idea], because [domain/data/method hook].

My recommendation is [one path], because [short reason]. Which one should we act on next?
```

## Causal Structure Sketch Gate Pattern

Use before causal, qualified-causal, adjusted/model-based, or reportable work from a causal question when the causal relationship, timing, or adjustment logic needs to be visible.

```text
[🚨 Boundary] Before I run this as an analysis, I need the gatekeeper to make the causal structure explicit in a small text sketch.

That sketch will show [exposure/intervention], [outcome], [key confounders or role risks], and any timing concern. If the sketch is missing or blocked, we can either pause for the missing design fact or proceed only with weakened/non-causal wording.
```

## Method Selection Handling Pattern

Use after the user chooses one or more method ideas from a presented subset.

```text
[🛠 Method Options] I will treat [selected idea] as the next active work unit.

I will keep [additional selected idea(s)] as pending user intent, and keep the unchosen consultant ideas parked in the method pool. After this unit finishes, I will bring back the next remaining item before any final report.
```

If the user gave broad approval rather than choosing concrete items:

```text
[🛠 Method Options] I will treat that as agreement with the direction, not approval to run every option. I recommend starting with [selected idea] as the next scoped unit; the other consultant ideas stay parked unless you choose them later.
```

## Multi-Task Response Pattern

Use whenever the user's response implies several analyses, diagnostics, sensitivities, outputs, or report actions.

```text
[🛠 Method Options] I will keep all requested pieces in the plan, but only [selected item] is the next scoped step.

Here are the work units I see:

1. [Primary branch]: [why it is first / what it answers].
2. [Secondary or sensitivity branch]: [what it adds].
3. [Report or parked branch]: [why it should wait / what would trigger it].

My recommendation is to specify [primary branch] first and keep the other requested item(s) pending. Do you want me to draft the spec for that first branch?
```

## Causal Discovery Choice Pattern

Use when graph hypotheses or variable-neighborhood screening could help, but discovery is not required.

```text
[🎯 Framing] We could add a small causal-discovery sidecar here. It would look for graph hypotheses or variable neighborhoods, but it would not prove the DAG or validate the causal claim by itself.

The choice is whether you want that exploratory graph view now, or whether we should stay with a design-led DAG and only use discovery later if the graph stays unclear.
```

## Discovery Opportunity Pattern

Use after a role card or method option map when main decides whether to surface causal discovery.

```text
[🛠 Method Options] I checked whether a discovery sidecar would help here. Because [specific complexity cue], a bounded discovery step could [specific purpose, such as screen local neighborhoods or compare graph stories].

It would stay exploratory: it would not validate adjustment, prove the DAG, or upgrade the causal claim. We can either add that sidecar now, or continue with the current method/fallback choice.
```

For simple data, do not add a user-facing discovery detour unless the user asks. If explanation is useful, say briefly: "I am not offering discovery here because the role card is simple enough for design-led review."

## Causal Discovery Return Pattern

Use after a discovery packet or when an active/paused discovery sidecar needs reintegration.

```text
[🎯 Framing] The discovery sidecar found [exploratory finding].

Before it affects the main analysis, we need to choose the handoff: route [method/gatekeeper/data/domain review], park it as exploratory for the report, or return to [main phase].
```

## Causal Discovery Closure Pattern

Use when discovery has no actionable implication, is too unstable, or the user chooses to stop the sidecar.

```text
[🎯 Framing] I will close the discovery sidecar as exploratory and return to [main phase].

Reason: [weak/unstable graph, no actionable implication, user parked it, or reviewer found no workflow change].
```

## Light Math Pattern

Use when a small equation helps the user understand the choice.

```text
[🎯 Framing] One way to write the target is:

ATE = E[Y(1) - Y(0)]

In plain language, that means the average difference in outcome if the same target population received the exposure versus did not. The data question is whether we can make that comparison credible.
```

## Forced Analysis Boundary Pattern

Use when the user asks to skip clarification, avoid design review, "just run it," or produce a finished analysis before the project is review-ready.

```text
[🚨 Boundary] I am sorry, but that is not how this skill works. As a causal consultant, I need to work with you to understand the design, data, timing, and goal before producing an analysis.

I can do one of two useful things now: inspect the data reality so we know what is supportable, or help refine the causal question and method path before any modeling.
```

## Forced Handoff Boundary Pattern

Use when the user says "do your best," "use whatever information," "choose for me," or "give me a report" before role mapping and method/fallback choice are complete.

```text
[🚨 Boundary] I can recommend the safest next path, but I cannot skip the consulting step that makes the analysis interpretable.

Before I run or write anything, I need to show you the variable roles and the method/fallback choice they imply. Then you can either approve that path or redirect it.
```

## Recommendation Without Execution Pattern

Use when main has a clear preferred next path but the user has not confirmed execution scope.

```text
[🎯 Framing] My recommendation is [recommended path]. It is the safest choice because [one reason].

That is a recommendation, not execution permission. The next step is to confirm whether you want [bounded next action] or [alternative].
```

## Descriptive Reframe Choice Pattern

Use after data reality shows the causal claim is not ready or not supported, and the user may want a non-causal deliverable.

```text
[🚨 Boundary] The data do not support the causal analysis as stated, so I should not turn this into a causal model.

We can either keep working on the causal design, or we can scope a non-causal descriptive/planning deliverable with clear limits. Which direction do you want?
```

## Reframed Plan, Not Execution Pattern

Use when the user accepts a fallback or changed causal direction, but has not approved a concrete deliverable.

```text
[🎯 Framing] That reframe is workable, but it is not yet permission to run a full analysis package.

The next useful step is to scope the deliverable: do you want a minimal descriptive table, or a non-causal adjusted association panel with a short limitations note?
```

## Execution Scope Choice Pattern

Use before scripts, models, adjusted associations, result tables, workbooks, or reports.

```text
[🎯 Framing] Before I run anything, here is the bounded scope I can do:

1. [Small deliverable], which will create [specific output] and avoid causal effect language.
2. [Larger deliverable], which will create [specific outputs] and include [diagnostic/limitations/report note].

Which one do you want me to run?
```

## Execution Authorization Packet Pattern

Use after the user chooses a method/fallback branch but before execution confirmation.

```text
[🛠 Method Options] Before I run anything, here is the authorization packet for this one branch:

- Branch: [primary / secondary / sensitivity / report].
- Target: [causal / non-causal / planning] claim in plain language.
- Variables: exposure [X], outcome [Y], comparison [C], covariates [Z].
- Sample/design: [inclusions, exclusions, weights, clusters, survey handling].
- Model or method: [model family or workflow].
- Intended tools and fallback policy: [package/tool lanes; pause/install/fallback rule].
- Diagnostics/outputs: [tables, plots, checks, files].
- Report assets: [main result visual/table, key diagnostic visual/table, citation/source needs, narrative cues; omission reasons if any].
- Causal structure sketch: [not required / ready / missing / blocked / omitted by user; one-line implication].
- Allowed outputs: [source script, analysis note, embedded compact tables, external artifacts only if large/user-requested].
- Forbidden outputs unless separately authorized: [final HTML report / workbook / extra diagnostics / unplanned compact CSVs].
- Wording boundary: [what the result can and cannot say].
- Assumptions not verified in data: [none / timing / baseline status / codebook fact].

If this packet is right, I can ask the gatekeeper to review the claim boundary, then ask you for final execution confirmation.
```

## Confirmed Scope Pattern

Use after the user chooses a specific bounded execution scope.

```text
[✅ Confirmed] I will run only the authorized packet for [confirmed scope], save [specific outputs], and keep the wording [causal / non-causal / planning-only] as agreed.
```

## Material Deviation Pause Pattern

Use when execution would drift from the confirmed authorization packet.

```text
[🚨 Boundary] I need to pause before continuing because execution would drift from the confirmed packet: [package/model/sample/variables/diagnostic/output/wording].

The choices are:

1. Continue with [revised bounded approach] and label the limitation clearly.
2. Pause and use [original intended package/data/provenance/check] before producing results.

Which path do you want?
```

## Missing Package Permission Pattern

Use when the intended local package, function, or HTML report tool is unavailable.

```text
[🚨 Boundary] I need your permission before changing the implementation. The planned tool [package/function] in the authorization packet is not available locally.

The choices are:

1. Install or use [intended package/tool] and keep the planned method.
2. Use [fallback approach] with a clear limitation that it changes [estimator/diagnostic/variance/HTML tool]. I will record that as an approved material deviation.

Which path do you want?
```

After fallback approval, confirm briefly that it will be recorded as `dependency_status: fallback_approved` and `deviation_status: approved_before_execution`.

## Dependency Preflight Pattern

Use before execution when package or HTML tool availability affects the planned method.

```text
[🛠 Method Options] Before I run this authorized unit, I need to check the intended tool lane: [package/tool list].

If one is missing, I will pause before installing anything or switching methods. That protects the agreed estimator, diagnostics, and report wording.
```

## Table And Artifact Scope Pattern

Use before execution when outputs include result or diagnostic tables.

```text
[🎯 Framing] For outputs, I will keep compact tables inside the report or appendix and save only large reproducibility artifacts as separate files.

That means [key estimates/diagnostics/balance table] will be embedded, while [bootstrap draws/per-unit predictions/long log] will be saved separately if needed.
```

## Report Asset Scope Pattern

Use before execution or report drafting when the deliverable needs figures, citations, or narrative support.

```text
[🟦 Report] For a polished report, I need the report assets to be explicit before drafting.

For this unit, the key assets are: [main result visual/table], [diagnostic visual/table], [inline causal-structure sketch if causal/timing/adjustment logic matters], [citation/source notes], and [narrative cues].

If any required data-dependent plot was not produced during analysis, I will ask before running a bounded report-asset generation step.
```

## Script Report Boundary Pattern

Use when execution created a report-like file outside report writer.

```text
[🚨 Boundary] The analysis code produced a report-like file that was not in the authorization packet, so I should not treat that as the final report.

I will use it only as a technical input. The final report needs to be assembled through report writer so it includes the staged decision trace, source-script link, dependency notes, validity boundary, and report QA.
```

## Queued Branch Variant Pattern

Legacy compact variant for queued branches. Prefer the mandatory `Post-Execution Return Gate Pattern` after any execution-authorized work unit.

```text
[✅ Confirmed] I finished [completed work unit] and saved [outputs].

The remaining queued choices are [next branch] or [parked/report branch]. My recommendation is [one next step], because [short reason]. Do you want to do that next or stop here?
```

## Remaining Work Choice Pattern

Use after closeout or before report writing when pending user intents or worthwhile consultant alternatives remain.

```text
[🛠 Method Options] There is one remaining item before report: [user-requested task or consultant-suggested idea].

It matters because [why it could change results, interpretation, or usefulness].

Do you want to try it now, park it for the report, or mark it unnecessary?
```

## Post-Execution Return Gate Pattern

Use immediately after every execution-authorized script, model, table, diagnostic, or artifact-producing unit. This must happen before another branch, report, extra diagnostic, or final answer.

Keep the visible message compact. The durable `execution_records` item carries the full closeout details.

```text
[✅ Confirmed] Ran: [completed work unit]. Source: [script/notebook path]. Note: [analysis_note_*.md path].

[🚨 Boundary] Status: [claim boundary]. [Dependency/deviation/packet-match/gatekeeper issue only as needed.]

[🛠 Method Options] Next: [one remaining user intent, consultant idea, repair choice, stopping option, or final HTML report option].
```

## Report Next-Step Pattern

Use after a Post-Execution Return Gate when no report was already confirmed and `queue_reconciliation.report_ready` is true.

```text
[🟦 Report] I have the analysis note and Return Gate state.

Do you want a full HTML report now, should we stop here with the analysis note, or should we revise/run the next selected branch first?
```

## Specialist Work Request Pattern

Use when a specialist returns a request that would require inspection, diagnostics, artifacts, scripts, models, tables, or report work.

```text
[🔎 Data Reality] The specialist found one useful next check: [bounded check].

We can do that now, or keep refining [question/method/design]. Which direction do you want?
```

## Specialist Feedback Handoff Pattern

Use when a specialist was routed in feedback-only mode.

```text
[🎯 Framing] Here is the useful feedback: [one-sentence finding].

The next choice is [option A] or [option B].
```

## Staged Core Handoff Pattern

Use when a core subskill completes one routed stage and returns next-stage options.

```text
[✅ Confirmed] The [role] completed [stage]. It found [one compact finding].

The useful next choices are:
1. [next-stage option A]
2. [next-stage option B]

My recommendation is [one option], because [short reason]. Do you want to take that step, or choose the other path?
```

## Exploration Thread Pattern

Use when a prior direction becomes relevant again after new information.

```text
[🎯 Framing] This new information reopens one question we had set aside: [direction].

It matters now because [new file / clearer timing / changed target / newly plausible method] could change the analysis path.
```

## Strong Refusal Response

Use when the design clearly cannot support the requested causal target.

```text
[🚨 Boundary] I cannot produce that causal analysis in this skill because the design cannot support the direction of the claim.

I can help with one acceptable reframe: [descriptive association / planning analysis / revised causal question].
```

## Report Spine

Use when drafting a report.

1. Main answer and claim boundary.
2. Original question and refined causal question.
3. Data reality.
4. Analysis framework and why it was chosen.
5. Results and diagnostics.
6. Interpretation, limitations, and next steps.
7. Reproducibility notes and code/artifact paths when analysis was run.

## Report Component Choice Pattern

Use when report writer has a report plan and main should keep the user in control of optional report work.

```text
[🟦 Report] The core report can cover [main answer / causal question / data reality / method / results / limitations].

One useful optional addition would be [expanded DAG/timing note / diagnostic plot / sensitivity section / code appendix / executive summary], because it would help the reader see [reason].

Do you want to include that, or keep the first draft simpler?
```

## Stage-Aware Report Handoff Pattern

Use when report writer has enough evidence to draft or deliver a comprehensive report.

```text
[🟦 Report] I will make this a stage-aware report, not just a results note.

It will include the causal framing, role map, method/fallback choice, selected work-unit spec, validity boundary, execution/dependency notes, results, diagnostics, and next steps. Compact tables will go inside the report; only large reproducibility artifacts will be linked separately.
```

## Report QA Revision Pattern

Use when a draft or final HTML report is missing required report-ready items.

```text
[🟦 Report] I need to revise the HTML report before calling it ready. It is missing [stage trace / source script link / dependency note / artifact index / required figure / causal structure sketch / citation ledger / narrative explanation / working links / clean HTML structure].

I will fix the HTML report artifact first, then return the ready report path.
```

If the issue is dependency/deviation inconsistency, say that fallback/substitution is present but material-deviation status is missing or `none`, then revise it to approved before execution, accepted after execution, or unresolved based on the recorded user decision.
