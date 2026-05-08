---
name: heterogeneous-effects-policy
description: "Target and decision module for CATE, HTE, subgroup effects, treatment prioritization, uplift modeling, individualized treatment rules, policy learning, and decision-focused reporting after a primary causal route has identified the target effect."
---

# Heterogeneous Effects And Policy

## Role

Use this as a **target, subgroup, and decision module**. It extends a primary route to answer "for whom?", "which subgroup?", or "what decision rule?" It does not identify the causal effect by itself.

## Fit Check

Given the route handoff, check:

- base route and claim strength are already defined;
- effect modification variables are pre-treatment or otherwise valid for the target decision;
- subgroup/CATE targets are confirmatory, exploratory, policy-oriented, or personalized;
- sample size, support, overlap, multiplicity, and validation/honesty are adequate;
- policy learning has a defined action set, utility/outcome, constraints, and evaluation strategy.

If the base causal route is weak, keep HTE/policy results exploratory or user-directed. Do not report individualized recommendations as validated decisions without support.

## Package And Code Fit

Candidate tools include R `grf`, `policytree`, and Python `econml`, `causalml`, or custom meta-learner workflows. Confirm the package supports the estimand, treatment type, validation strategy, uncertainty, and policy evaluation needed.

## Pass / Fail Output

If fit passes, produce subgroup/CATE/policy analysis plan, validation strategy, diagnostics, and reporting cautions. If fit fails, return whether the problem is base-route validity, data support, decision definition, package support, or overinterpretation risk.

## References

- `references/workflow.md`: detailed HTE/policy workflow.
- `references/literature_and_software.md`: literature and software notes.
