# Causal Consultant

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)]()
[![Status](https://img.shields.io/badge/status-active%20development-orange.svg)]()

An interactive causal inference skill for turning rough causal ideas into defensible questions, method options, validity checks, and reportable conclusions.

## What This Skill Does

Causal Consultant is a consultation-first Agent Skill. It helps users decide what causal question they can honestly ask, what their data can support, which analysis paths are plausible, and where the claim should be limited, revised, or refused.

It is not a model runner. If a user says "analyze X on Y," the skill treats that as the start of a conversation: What is the intervention? What is the comparison? Who is the target population? When is the outcome measured? What would make the answer causal rather than descriptive?

The goal is to make causal work more thoughtful and easier to explain. The skill helps refine the question, explore nearby research directions, suggest data reshaping ideas, compare methods, check causal validity, and produce reports with clear assumptions and limitations.

## What Makes It Different

- **It asks before executing.** The skill does not jump from a variable pair to a causal model.
- **It suggests alternatives.** It can offer nearby causal framings, method routes, target-goal twists, and implementation enhancements the user may not have considered.
- **It teaches the tradeoffs.** Short explanations and light math help the user understand why a method, estimand, diagnostic, or limitation matters.
- **It keeps choices manageable.** Ordinary turns focus on one or two questions or options, while other useful directions are saved for later.
- **It uses checkpoint reviews.** Before method activation, causal estimation, stronger causal wording, discovery implications, or reports, the relevant internal reviewer state must be current.
- **It produces reportable artifacts.** Reports are built from recorded evidence, diagnostics, figures, code paths, and reviewed claim boundaries.

## How The Team Works

The main skill is the only user-facing voice. It coordinates a small consultant team and turns internal feedback into a clear next move for the user.

- **Main consultant:** owns the conversation, pacing, project state, user-facing synthesis, and next action.
- **Core reviewers:** `domain_expert`, `data_analyst`, `method_lead`, and `causal_gatekeeper`.
- **Silent report specialist:** `report_writer`, used for report plans, final HTML reports, owner review, and report QA.
- **Optional discovery sidecar:** `causal_discovery`, used for exploratory graph hypotheses, variable neighborhoods, discovery diagnostics, or discovery-only reports.
- **Method specialists:** design routes `00-08`, target goals `10-15`, and implementation supports `20-23`.

```text
User <-> Main consultant
          -> core reviewers
          -> method specialists
          -> causal_discovery sidecar
          -> report_writer
          -> reports, diagnostics, figures, code paths, and claim boundaries
```

The internal project state stays compact. Core reviewers own their sections, method specialists return compact records, and the main consultant decides what to record, defer, route, or show to the user.

## Typical Interaction

1. **Start with a rough idea.** The user may only know "I want to know whether X affects Y."
2. **Clarify the causal question.** The skill helps define treatment, outcome, comparison, population, timing, and claim boundary.
3. **Explore options.** The method lead can suggest a few plausible design routes, target-goal twists, or implementation enhancements.
4. **Check validity.** The causal gatekeeper reviews DAG/timing logic, data support, statistical claims, and unsupported causal wording.
5. **Analyze or report.** Once the question and evidence are coherent enough, the skill can support analysis, diagnostics, interpretation, and a polished report.

This flow is intentionally patient. A good causal answer is often created through conversation, not selected from a method checklist.

## When To Use

Use Causal Consultant when you want help with:

- refining a causal question or estimand;
- deciding whether a dataset can support a causal claim;
- comparing causal designs such as experiments, observational adjustment, longitudinal methods, DiD, RD, IV, synthetic control, interference, negative controls, or proximal methods;
- exploring target goals such as heterogeneity, treatment rules, mediation, dose response, transportability, or dynamic policies;
- choosing diagnostics, sensitivity checks, weighting, doubly robust estimation, DML, or survival outcome handling;
- checking DAG, timing, adjustment, post-treatment variables, or statistical claim boundaries;
- producing a report, memo, appendix, figure set, diagnostic package, or reproducibility trail.

## Install And Activate

Install the full repository, not just this README, so your agent can load `SKILL.md`, references, templates, and subskills as needed.

### Recommended: Skills CLI

For agents that support the cross-agent [`skills` CLI](https://www.skills.sh/docs/cli), use the documented install pattern:

```bash
npx skills add rqzhu-aide/causal-consultant
```

If the CLI later supports explicit agent targeting, follow the current CLI documentation for that option.

After installation, ask your agent:

```text
Use the causal-consultant skill to help me think through this causal question.
```

### Claude Code Direct Install

Claude Code supports skills in personal and project skill folders. See the [Claude Code skills docs](https://code.claude.com/docs/en/skills) for the current behavior.

For a project-local install, run this from your project folder:

```bash
git clone https://github.com/rqzhu-aide/causal-consultant .claude/skills/causal-consultant
```

For a personal install available across Claude Code projects:

```bash
git clone https://github.com/rqzhu-aide/causal-consultant ~/.claude/skills/causal-consultant
```

On Windows PowerShell:

```powershell
git clone https://github.com/rqzhu-aide/causal-consultant "$env:USERPROFILE\.claude\skills\causal-consultant"
```

Claude Code can load the skill automatically when relevant, or you can invoke it directly:

```text
/causal-consultant
```

### Other Agents

If your agent supports Agent Skills, install this repository through that agent's skill mechanism. If it does not have a dedicated installer, give the agent the full repository and ask it to read `SKILL.md` first, then load supporting files only as needed.

## License

MIT. See [LICENSE](LICENSE).
