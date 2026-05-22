#!/usr/bin/env python3
"""Exercise method/task subskill record contract validation."""
from __future__ import annotations

import shutil
import sys
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "assets" / "method_job_subskill_record_template.yaml"
GENERATED = ROOT / "validation" / "generated_subskill_records"
SCRIPTS = ROOT / "scripts"
sys.path.insert(0, str(SCRIPTS))

from validate_subskill_record import validate  # noqa: E402


@dataclass(frozen=True)
class Case:
    name: str
    replacements: tuple[tuple[str, str], ...]
    expect_errors: tuple[str, ...] = ()
    reject_errors: tuple[str, ...] = ()


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
        name="01-template-baseline",
        replacements=(),
    ),
    Case(
        name="02-valid-method-lead-recheck",
        replacements=(
            ("subskill_id: null", 'subskill_id: "08-single-time-observational-exposure"'),
            ("module_type: null", 'module_type: "design_route"'),
            ("role: null", 'role: "primary_route"'),
            ("status: null", 'status: "plan_proposed"'),
            ("activation_reason: null", 'activation_reason: "Check observational design fit."'),
            ("provenance_summary: null", 'provenance_summary: "User-described design and available YAML state."'),
            ('  fit: "unknown"', '  fit: "direct"'),
            ("  reason: null", '  reason: "Baseline exposure with candidate adjustment set."'),
            ("    causal_comparison: null", '    causal_comparison: "Exposure versus comparison at baseline."'),
            ("    design_route: null", '    design_route: "single-time observational exposure"'),
            ("    identification_status: null", '    identification_status: "needs assumptions review"'),
            ("    comparison_group_logic: null", '    comparison_group_logic: "Observed treated and untreated groups."'),
            ("  required: false", "  required: true"),
            (
                "  reason: null",
                '  reason: "The module found a possible collider in the proposed adjustment set."',
            ),
            ("recommended_next_action: null", 'recommended_next_action: "refresh_method_lead"'),
        ),
    ),
    Case(
        name="03-invalid-recheck-missing-reason",
        replacements=(
            ("  required: false", "  required: true"),
        ),
        expect_errors=("method_lead_recheck.required is true, but method_lead_recheck.reason is empty",),
    ),
    Case(
        name="04-invalid-subskill-tries-to-mark-causal-gate",
        replacements=(
            ("recommended_next_action: null", 'recommended_next_action: "mark_causal_gate_ready"'),
        ),
        expect_errors=("Invalid value at recommended_next_action",),
    ),
    Case(
        name="05-invalid-subskill-tries-to-mark-production-gate",
        replacements=(
            ("recommended_next_action: null", 'recommended_next_action: "mark_production_gate_ready"'),
        ),
        expect_errors=("Invalid value at recommended_next_action",),
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
        errors = validate(fixture_path)

        missing_errors = contains_all(errors, case.expect_errors)
        rejected_errors = contains_any(errors, case.reject_errors)

        if missing_errors or rejected_errors:
            failures.append(
                "\n".join(
                    [
                        f"{case.name}: FAILED",
                        f"  fixture: {fixture_path.relative_to(ROOT)}",
                        f"  errors: {errors}",
                        f"  missing expected errors: {missing_errors}",
                        f"  rejected errors present: {rejected_errors}",
                    ]
                )
            )
            continue

        print(
            f"PASS {case.name}: {len(errors)} error(s), "
            f"{fixture_path.relative_to(ROOT)}"
        )

    if failures:
        print("\n\n".join(failures), file=sys.stderr)
        return 1

    print(f"OK: {len(CASES)} subskill record validation case(s) passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
