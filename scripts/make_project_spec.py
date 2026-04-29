#!/usr/bin/env python3
"""Create a blank causal project specification YAML file.

This script does not analyze data. It creates a structured template that an agent or analyst can fill in.
"""
from pathlib import Path
import argparse
import datetime

TEMPLATE = """project_name: {project_name}
analyst: null
date: {date}
causal_question: null
scientific_context: null
unit_of_analysis: null
target_population: null
intervention:
  treatment_name: null
  treatment_type: null
  intervention_definition: null
  comparator_definition: null
  treatment_initiation_time: null
outcome:
  outcome_name: null
  outcome_type: null
  measurement_time: null
  follow_up_window: null
time_zero: null
estimand:
  label: null
  formal_definition: null
  scale: null
observed_data:
  data_source: null
  rows_represent: null
  sample_size: null
variables:
  treatment_variable: null
  outcome_variable: null
  pre_treatment_confounders: []
  mediators: []
  post_treatment_variables: []
assumptions:
  consistency: null
  exchangeability_or_as_if_random: null
  positivity_or_overlap: null
  no_interference_or_exposure_mapping: null
analysis_plan:
  primary_method: null
  alternative_methods: []
  diagnostics: []
  sensitivity_analyses: []
limitations: []
open_questions: []
"""

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project-name", default="causal_project")
    parser.add_argument("--out", default="causal_project_spec.yaml")
    args = parser.parse_args()
    out = Path(args.out)
    text = TEMPLATE.format(project_name=args.project_name, date=datetime.date.today().isoformat())
    out.write_text(text, encoding="utf-8")
    print(f"Wrote {out}")

if __name__ == "__main__":
    main()
