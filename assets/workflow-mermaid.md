# Causal-Skills Workflow Diagram

This diagram shows how the skill package interacts with a user from initial question to final causal report.

```mermaid
flowchart TB
    subgraph User["**PHASE 1 — USER**"]
        U[User<br/>Researcher / Analyst]
        Q[Causal Question<br/>"What is the effect of X on Y?"]
        UF[User Review<br/>Approves / revises / asks follow-up]
    end

    subgraph Intake["**PHASE 2 — INTAKE & ROUTING**"]
        RS[Root SKILL.md<br/>Top-level intake & progressive disclosure]
        IN[Intake & Project Spec<br/>• Clarify question<br/>• Define estimand<br/>• Identify data design]
        DR[Design Router<br/>Classify: RCT / Obs / DiD / RD / IV / ...]
        RD{Router Decision}
        AL[Assumption Ledger<br/>Tracked: SUTVA, positivity, ignorability...]
        RO[Route-Out Logic<br/>Cross-skill activation if design changes]
    end

    subgraph Subskills["**PHASE 3 — METHOD SUBSKILLS**"]
        S01["**01** — Randomized Experiments<br/>(A/B tests, RCTs, cluster trials) ✓ 85%"]
        S03["**03** — Matching / Weighting<br/>(Propensity scores, balance) ✓ 85%"]
        S09["**09** — Instrumental Variables<br/>(IV, 2SLS, CACE/LATE) ✓ 90%"]
        S14["**14** — Causal Discovery<br/>(PC, FCI, Tetrad, bnlearn) ✓ 85%"]
        SO["+ 14 other subskills<br/>(DiD, RD, Survival, Mediation...)"]

        subgraph Internal["Within Each Subskill"]
            I1[1. Audit design &amp; assumptions]
            I2[2. Define estimand formally]
            I3[3. Select method &amp; match to design]
            I4[4. Provide code templates (R/Python)]
            I5[5. Run diagnostics &amp; fail if needed]
        end
    end

    subgraph Output["**PHASE 4 — OUTPUT**"]
        RPT[Final Report<br/>Effect estimate + diagnostics + caveats + reproducible code]
        INT[Interpretation<br/>What the result means and what it does NOT mean]
    end

    U --> Q
    Q --> RS
    RS --> IN
    IN --> DR
    DR --> RD

    RD -->|RCT| S01
    RD -->|Observational| S03
    RD -->|Instrument| S09
    RD -->|Discovery| S14
    RD -->|Other| SO

    S01 --> Internal
    S03 --> Internal
    S09 --> Internal
    S14 --> Internal
    SO --> Internal

    Internal --> RPT
    Internal -->|if complications| RO
    RO --> AL
    AL --> RPT

    RPT --> INT
    INT --> UF
    UF -->|iterate| IN
    UF --> U
```

## Key Design Principles

1. **Progressive Disclosure** — The root skill starts with intake and routing before loading any method-specific content
2. **Estimand-First** — Every subskill defines the causal estimand before choosing a method
3. **Design-Aware Routing** — The router classifies the actual data structure, not just the user's label
4. **Cross-Skill Activation** — Subskills can route to each other when complications arise (e.g., RCT → IV for noncompliance)
5. **Assumption Ledger** — Key assumptions are tracked throughout, not forgotten after method selection
6. **Iterative Feedback** — The user reviews and can loop back to refine the question or design
