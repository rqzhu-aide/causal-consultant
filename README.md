# Causal Inference Consultant Skill

This is a preliminary modular skill package for causal inference. It is intended for agent systems that load a top-level `SKILL.md` and then selectively read supporting references, subskills, scripts, and assets.

The package is organized around an interactive consulting workflow:

1. clarify the causal question;
2. define the estimand;
3. identify the data design and assumptions;
4. route to method-specific subskills;
5. propose a matched analysis plan;
6. run or draft code only after the design is explicit;
7. diagnose and interpret results;
8. produce a reproducible report.

## Directory Structure

```text
causal-inference-consultant/
  SKILL.md
  README.md
  references/
  subskills/
  scripts/
    python/
    R/
  assets/
```

## How to Use

Place this folder in the skill directory used by your agent system, or upload the zipped folder if your agent accepts skill packages as ZIP files.

The top-level `SKILL.md` should be the first file loaded. It instructs the agent to use progressive disclosure: start with intake and routing, then read only the subskills relevant to the user's data and causal goal.

## Design Philosophy

This skill treats causal inference as a sequence of design decisions, not as a single modeling command. The agent should not run an estimator until the intervention, comparator, outcome, time zero, follow-up, target population, and estimand are clear enough.

## Suggested Next Improvements

- Add package-version-specific recipes after testing in your preferred R/Python environments.
- Add domain-specific child skills, for example biomedical EHR, nutrition, infectious disease, economics/policy, education, marketing, and causal genomics.
- Add validated example datasets and end-to-end reports.
- Add automated schema extraction and data-audit helpers.
- Add templated Quarto/R Markdown/Jupyter report generation.
