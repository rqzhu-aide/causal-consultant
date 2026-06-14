# Interactive Causal Consultant

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-4.1.0-blue.svg)]()
[![Status](https://img.shields.io/badge/status-active%20development-orange.svg)]()

An interactive causal inference consultant skill for moving from a rough causal
question to a defensible analysis plan, diagnostic workflow, interpretation, and
report.

> I cannot give you a definitive answer, but I can help you explore.

It is designed to feel like working with a careful causal consulting team: it
asks clarifying questions, inspects data reality, compares options, keeps the
user in control of the next step, and avoids jumping straight from a variable
pair to a model.

## How It Works

`causal-consultant` is a routed skill. The top-level `SKILL.md` initializes
`project_state.yaml`, writes a compact `next_step_plan`, loads the planned route
reference, and then loads `team_lead` as the final manager.

The internal team is:

- **`team_lead`:** the only user-facing voice; owns synthesis, approvals, state
  cleanup, and final response.
- **`data_audit`:** checks data structure, timing, leakage, dependencies,
  missingness, support, validity, and causal-preparation diagnostics.
- **`domain_expert`:** records durable domain knowledge, measurement
  conventions, common practice, precedent, reporting norms, and domain-specific
  risks.
- **`causal_check`:** checks causal framing, assumptions, claim strength,
  analysis readiness, and design/support route recommendations.
- **`causal_discovery`:** optional graph-hypothesis, variable-neighborhood, and
  discovery-diagnostic sidecar.
- **`report_writer`:** report-scope precheck, approved report work,
  manuscript-style writing, reviewer-facing text, and Markdown-to-HTML
  conversion.
- **Design/support references:** focused analysis routes for randomized
  assignment, observational exposure, longitudinal g-methods, DiD, RD, IV,
  synthetic control, interference, descriptive association, heterogeneity, dose
  response, mediation, transportability, non-continuous outcomes, and
  statistical validity.

Version 4.1.0 uses a compact route-reference architecture: one state file at
`project_state.yaml`, one planned route before `team_lead`, shallow/deep gates
for report or analysis approval, and compact route-owned YAML sections for
durable findings and created outputs.

```text
User <-> causal-consultant router
          -> selected route reference
          -> team_lead
```

## What It Helps With

Use it when you want to work interactively on:

- refining a causal question, estimand, comparison, population, or timing
  window;
- deciding whether available data can support a causal claim or only a
  descriptive fallback;
- auditing data for timing, missingness, leakage, support, dependence, and
  validity;
- comparing designs such as experiments, observational adjustment, longitudinal
  methods, DiD, RD, IV, synthetic control, interference, or descriptive
  association;
- exploring target or support goals such as heterogeneity, dose response,
  mediation, transportability, non-continuous outcomes, or statistical validity;
- checking DAG/timing, adjustment, post-treatment variables, claim wording, or
  statistical evidence;
- producing a planning report, analysis report, manuscript-style section,
  reviewer-facing response, or HTML version of a Markdown report.

## Interaction Style

The skill is intentionally interactive. It usually shows framing, consultant
options, boundaries, and a scoped next step before analysis expands. Broad
requests like "do your best" or "give me a report" are treated as invitations to
recommend the safest next move, not permission to skip the causal consulting
process.

## Install And Activate

Clone the repository first:

PowerShell:

```powershell
git clone --depth 1 https://github.com/rqzhu-aide/causal-consultant.git
Set-Location causal-consultant
```

macOS/Linux shell:

```sh
git clone --depth 1 https://github.com/rqzhu-aide/causal-consultant.git
cd causal-consultant
```

Install the canonical skill folder:

```text
skills/causal-consultant/
```

### Codex Personal Install

PowerShell:

```powershell
$skillsDir = Join-Path $HOME ".codex\skills"
$dst = Join-Path $skillsDir "causal-consultant"
New-Item -ItemType Directory -Force -Path $skillsDir | Out-Null
if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
Copy-Item -Recurse -Force ".\skills\causal-consultant" $dst
```

macOS/Linux shell:

```sh
mkdir -p "$HOME/.codex/skills"
rm -rf "$HOME/.codex/skills/causal-consultant"
cp -R skills/causal-consultant "$HOME/.codex/skills/causal-consultant"
```

### Claude Code Personal Install

PowerShell:

```powershell
$skillsDir = Join-Path $HOME ".claude\skills"
$dst = Join-Path $skillsDir "causal-consultant"
New-Item -ItemType Directory -Force -Path $skillsDir | Out-Null
if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
Copy-Item -Recurse -Force ".\skills\causal-consultant" $dst
```

macOS/Linux shell:

```sh
mkdir -p "$HOME/.claude/skills"
rm -rf "$HOME/.claude/skills/causal-consultant"
cp -R skills/causal-consultant "$HOME/.claude/skills/causal-consultant"
```

### Other Agent Skill Folder

For agents that scan a project-local skill folder, copy the same canonical skill
folder into the agent's skill directory, such as `.agents/skills` or
`.agent/skills`.

PowerShell:

```powershell
$targetRepo = "C:\path\to\target-repo"
$skillsDir = Join-Path $targetRepo ".agents\skills"
$dst = Join-Path $skillsDir "causal-consultant"
New-Item -ItemType Directory -Force -Path $skillsDir | Out-Null
if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
Copy-Item -Recurse -Force ".\skills\causal-consultant" $dst
```

macOS/Linux shell:

```sh
target_repo="/path/to/target-repo"
mkdir -p "$target_repo/.agents/skills"
rm -rf "$target_repo/.agents/skills/causal-consultant"
cp -R skills/causal-consultant "$target_repo/.agents/skills/causal-consultant"
```

Start using it by asking your agent: `Use the causal-consultant skill to help
me think through this causal question.` Or use the direct command:

```
/causal-consultant
```

### Optional Project Hooks

Project-level hooks are optional stability checks. They are not part of the
personal skill install. If you want them, copy the hook files into each local
project where you want the checks to run.

Codex project hook, PowerShell:

```powershell
$targetRepo = "C:\path\to\target-repo"
$dst = Join-Path $targetRepo ".codex"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item -Force ".\project-hooks\.codex\hooks.json" (Join-Path $dst "hooks.json")
Copy-Item -Force ".\project-hooks\.codex\project_state_stop_check.js" (Join-Path $dst "project_state_stop_check.js")
```

Codex project hook, macOS/Linux shell:

```sh
target_repo="/path/to/target-repo"
mkdir -p "$target_repo/.codex"
cp project-hooks/.codex/hooks.json "$target_repo/.codex/hooks.json"
cp project-hooks/.codex/project_state_stop_check.js "$target_repo/.codex/project_state_stop_check.js"
```

Claude Code project hook, PowerShell:

```powershell
$targetRepo = "C:\path\to\target-repo"
$dst = Join-Path $targetRepo ".claude"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item -Force ".\project-hooks\.claude\settings.json" (Join-Path $dst "settings.json")
Copy-Item -Force ".\project-hooks\.claude\project_state_stop_check.js" (Join-Path $dst "project_state_stop_check.js")
```

Claude Code project hook, macOS/Linux shell:

```sh
target_repo="/path/to/target-repo"
mkdir -p "$target_repo/.claude"
cp project-hooks/.claude/settings.json "$target_repo/.claude/settings.json"
cp project-hooks/.claude/project_state_stop_check.js "$target_repo/.claude/project_state_stop_check.js"
```

Codex or Claude Code may ask you to trust or approve project hooks before they
run.

## License

MIT. See [LICENSE](LICENSE).
