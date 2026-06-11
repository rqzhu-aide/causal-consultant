# Interactive Causal Consultant

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-3.4.3-blue.svg)]()
[![Status](https://img.shields.io/badge/status-active%20development-orange.svg)]()

An interactive causal inference consultant skill for moving from a rough causal question to a defensible analysis plan, diagnostic workflow, interpretation, and report.

> I cannot give you a definitive answer, but I can help you explore.

It is designed to feel like working with a careful causal consulting team: it asks clarifying questions, inspects data reality, compares options, keeps the user in control of the next step, and avoids jumping straight from a variable pair to a model.

## How It Works

The main consultant is the only user-facing voice. It paces the conversation, routes internal specialists when useful, and normally turns their feedback into three or four meaningful next actions for the user.

The internal team is:

- **Main consultant:** owns the conversation, pacing, project state, synthesis, and next user-facing choice.
- **`domain_expert`:** clarifies construct meaning, domain precedent, field conventions, and interpretation boundaries.
- **`data_analyst`:** checks data reality: variables, timing, support, quality, provenance, and usable roles.
- **`method_lead`:** compares method or fallback paths, uses the method catalog, and surfaces creative but grounded twists.
- **`causal_gatekeeper`:** checks DAG/timing logic, causal claim strength, statistical validity, and wording boundaries.
- **Numbered method/task specialists:** provide routed technical checks for design routes, target goals, and implementation support.
- **`causal_discovery`:** optional exploratory sidecar for graph hypotheses, variable neighborhoods, or discovery diagnostics.
- **`report_writer`:** silent deliverable specialist for final HTML reports, evidence organization, and report QA.

Version 3.4.3 uses lean live YAML routing: main maintains `outputs/project_state.yaml`, routes by `agent_called + mode + action_goal`, maps routed `action_id` from `next_step_plan.steps[].id`, every routed subskill writes its standard owner/result section plus one shared-format council entry, report requests use a report-structure feedback pass before execution, execution scopes use step-local `expected_outputs`, and user-facing consultant options show compact rationale and tradeoffs while YAML stays lean.

```text
User <-> Main consultant
          -> domain_expert
          -> data_analyst
          -> method_lead
          -> causal_gatekeeper
          -> numbered method/task specialists
          -> optional causal_discovery
          -> report_writer
```

## What It Helps With

Use it when you want to work interactively on:

- refining a causal question, estimand, comparison, population, or timing window;
- deciding whether available data can support a causal claim or only a descriptive fallback;
- comparing designs such as experiments, observational adjustment, longitudinal methods, DiD, RD, IV, synthetic control, interference, negative controls, or proximal methods;
- exploring target goals such as heterogeneity, treatment rules, mediation, dose response, transportability, or dynamic policies;
- choosing diagnostics, sensitivity checks, weighting, doubly robust estimation, DML, or survival outcome handling;
- checking DAG/timing, adjustment, post-treatment variables, claim wording, or statistical evidence;
- producing a final HTML report with evidence, diagnostics, figures, code paths, and clear limitations.

## Interaction Style

The skill is intentionally interactive. It usually shows a small role map, method choice, validity boundary, or scoped next step before analysis expands. Broad requests like "do your best" or "give me a report" are treated as invitations to recommend the safest next move, not permission to skip the causal consulting process.

## Install And Activate

Install the full repository, not just this README, so your agent can load `SKILL.md`, references, templates, and subskills as needed.

### Skills CLI

For agents that support the cross-agent [`skills` CLI](https://www.skills.sh/docs/cli):

```bash
npx skills add rqzhu-aide/causal-consultant
```

After installation, ask your agent:

```text
Use the causal-consultant skill to help me think through this causal question.
```

### Direct Install

For agents that load local skill folders, clone this repository into the agent's skill directory.

Project-local example:

```bash
git clone https://github.com/rqzhu-aide/causal-consultant .claude/skills/causal-consultant
```

Personal install example:

```bash
git clone https://github.com/rqzhu-aide/causal-consultant ~/.claude/skills/causal-consultant
```

Windows PowerShell example:

```powershell
git clone https://github.com/rqzhu-aide/causal-consultant "$env:USERPROFILE\.claude\skills\causal-consultant"
```

## License

MIT. See [LICENSE](LICENSE).
