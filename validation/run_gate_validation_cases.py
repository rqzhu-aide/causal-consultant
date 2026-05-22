#!/usr/bin/env python3
"""Exercise gate and bounded-continuation validator behavior.

The cases are generated from the canonical project-state template so the
fixtures stay aligned with the current schema while still testing realistic
full YAML states.
"""
from __future__ import annotations

import shutil
import sys
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "assets" / "causal_project_spec_template.yaml"
GENERATED = ROOT / "validation" / "generated"
SCRIPTS = ROOT / "scripts"
sys.path.insert(0, str(SCRIPTS))

from validate_project_state import validate  # noqa: E402


@dataclass(frozen=True)
class Case:
    name: str
    replacements: tuple[tuple[str, str], ...]
    expect_errors: tuple[str, ...] = ()
    expect_warnings: tuple[str, ...] = ()
    reject_errors: tuple[str, ...] = ()
    reject_warnings: tuple[str, ...] = ()


def replace_once(text: str, old: str, new: str, case_name: str) -> str:
    if old not in text:
        raise AssertionError(f"{case_name}: replacement target not found: {old!r}")
    return text.replace(old, new, 1)


def render_case(template: str, case: Case) -> str:
    text = template
    for old, new in case.replacements:
        text = replace_once(text, old, new, case.name)
    return text


CASES = (
    Case(
        name="01-project-exploration-baseline",
        replacements=(),
    ),
    Case(
        name="02-normal-report-production-ready",
        replacements=(
            ('  current_phase: "project_exploration"', '  current_phase: "report_production"'),
            ('  status: "exploratory"', '  status: "ready"'),
            ('  claim_strength_allowed: "exploratory"', '  claim_strength_allowed: "cautious_causal"'),
            ('  status: "not_ready"', '  status: "ready"'),
            ('  diagnostics_status: "not_started"', '  diagnostics_status: "complete"'),
            ("  reportable_evidence: false", "  reportable_evidence: true"),
            ('  claim_strength_for_report: "unknown"', '  claim_strength_for_report: "cautious_causal"'),
        ),
    ),
    Case(
        name="03-user-forced-production-bounded",
        replacements=(
            ('  current_phase: "project_exploration"', '  current_phase: "report_production"'),
            ('  status: "exploratory"', '  status: "blocked"'),
            ("  blockers: []", "  blockers:\n    - \"Unresolved identification assumptions.\""),
            ('  claim_strength_allowed: "exploratory"', '  claim_strength_allowed: "exploratory"'),
            ('  status: "not_ready"', '  status: "blocked"'),
            (
                "  blockers: []",
                "  blockers:\n    - \"Diagnostics and sensitivity checks are incomplete.\"",
            ),
            ('  claim_strength_for_report: "unknown"', '  claim_strength_for_report: "exploratory"'),
            ("  requested: false", "  requested: true"),
            ("  acknowledged_limits: false", "  acknowledged_limits: true"),
            ("  requested_scope: []", "  requested_scope:\n    - \"Draft a progress report now.\""),
            (
                "  allowed_scope: []",
                "  allowed_scope:\n    - \"Exploratory and limitation-forward report drafting.\"",
            ),
            (
                "  prohibited_claims: []",
                "  prohibited_claims:\n    - \"Do not call this a final causal estimate.\"",
            ),
            (
                "  warning: null",
                '  warning: "Proceeding only as bounded production with unresolved gate blockers visible."',
            ),
        ),
        expect_warnings=("current_phase is report_production under bounded_continuation",),
    ),
    Case(
        name="04-production-blocked-missing-diagnostics",
        replacements=(
            ('  current_phase: "project_exploration"', '  current_phase: "report_production"'),
            ('  status: "exploratory"', '  status: "ready"'),
            ('  claim_strength_allowed: "exploratory"', '  claim_strength_allowed: "cautious_causal"'),
            (
                'production_gate:\n  status: "not_ready"\n  blockers: []',
                'production_gate:\n  status: "blocked"\n  blockers:\n    - "Diagnostics are planned but not yet run."',
            ),
            ('  claim_strength_for_report: "unknown"', '  claim_strength_for_report: "cautious_causal"'),
        ),
        reject_errors=("production_gate.claim_strength_for_report is stronger",),
        reject_warnings=("current_phase is report_production but causal_gate",),
    ),
    Case(
        name="05-production-discovers-causal-recheck",
        replacements=(
            ('  current_phase: "project_exploration"', '  current_phase: "report_production"'),
            ('  status: "exploratory"', '  status: "ready"'),
            (
                "  blockers: []",
                "  blockers:\n    - \"New evidence changes the adjustment logic; causal specification recheck needed.\"",
            ),
            ('  claim_strength_allowed: "exploratory"', '  claim_strength_allowed: "cautious_causal"'),
            ('  status: "not_ready"', '  status: "ready"'),
            ('  diagnostics_status: "not_started"', '  diagnostics_status: "complete"'),
            ("  reportable_evidence: false", "  reportable_evidence: true"),
            ('  claim_strength_for_report: "unknown"', '  claim_strength_for_report: "cautious_causal"'),
        ),
        expect_warnings=(
            "causal_gate.status is ready/complete while causal_gate.blockers is non-empty",
            "current_phase is report_production but causal_gate",
        ),
    ),
    Case(
        name="06-invalid-production-claim-stronger-than-causal-gate",
        replacements=(
            ('  current_phase: "project_exploration"', '  current_phase: "report_production"'),
            ('  status: "exploratory"', '  status: "ready"'),
            ('  claim_strength_allowed: "exploratory"', '  claim_strength_allowed: "associational"'),
            ('  status: "not_ready"', '  status: "ready"'),
            ('  diagnostics_status: "not_started"', '  diagnostics_status: "complete"'),
            ("  reportable_evidence: false", "  reportable_evidence: true"),
            ('  claim_strength_for_report: "unknown"', '  claim_strength_for_report: "supported_causal"'),
        ),
        expect_errors=("production_gate.claim_strength_for_report is stronger",),
    ),
    Case(
        name="07-invalid-bounded-continuation-missing-scope",
        replacements=(
            ("  requested: false", "  requested: true"),
        ),
        expect_warnings=(
            "bounded_continuation.requested is true but acknowledged_limits is false",
            "bounded_continuation.requested is true but allowed_scope is empty",
            "bounded_continuation.requested is true but prohibited_claims is empty",
            "bounded_continuation.requested is true but warning is empty",
        ),
    ),
)


def contains_all(messages: list[str], expected: tuple[str, ...]) -> list[str]:
    missing: list[str] = []
    for expected_part in expected:
        if not any(expected_part in message for message in messages):
            missing.append(expected_part)
    return missing


def contains_any(messages: list[str], rejected: tuple[str, ...]) -> list[str]:
    found: list[str] = []
    for rejected_part in rejected:
        if any(rejected_part in message for message in messages):
            found.append(rejected_part)
    return found


def main() -> int:
    template = TEMPLATE.read_text(encoding="utf-8")
    if GENERATED.exists():
        shutil.rmtree(GENERATED)
    GENERATED.mkdir(parents=True)

    failures: list[str] = []
    for case in CASES:
        fixture_path = GENERATED / f"{case.name}.yaml"
        fixture_path.write_text(render_case(template, case), encoding="utf-8")
        errors, warnings = validate(fixture_path)

        missing_errors = contains_all(errors, case.expect_errors)
        missing_warnings = contains_all(warnings, case.expect_warnings)
        rejected_errors = contains_any(errors, case.reject_errors)
        rejected_warnings = contains_any(warnings, case.reject_warnings)

        if missing_errors or missing_warnings or rejected_errors or rejected_warnings:
            failures.append(
                "\n".join(
                    [
                        f"{case.name}: FAILED",
                        f"  fixture: {fixture_path.relative_to(ROOT)}",
                        f"  errors: {errors}",
                        f"  warnings: {warnings}",
                        f"  missing expected errors: {missing_errors}",
                        f"  missing expected warnings: {missing_warnings}",
                        f"  rejected errors present: {rejected_errors}",
                        f"  rejected warnings present: {rejected_warnings}",
                    ]
                )
            )
            continue

        print(
            f"PASS {case.name}: "
            f"{len(errors)} error(s), {len(warnings)} warning(s), "
            f"{fixture_path.relative_to(ROOT)}"
        )

    if failures:
        print("\n\n".join(failures), file=sys.stderr)
        return 1

    print(f"OK: {len(CASES)} gate validation case(s) passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
