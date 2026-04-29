#!/usr/bin/env python3
"""Rule based causal discovery recommender.

Usage:
  python recommend.py input.json
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict


def recommend(spec: Dict[str, Any]) -> Dict[str, Any]:
    n = spec.get("n_samples")
    p = spec.get("n_variables")
    data_type = spec.get("data_type", "unknown")
    missing = spec.get("has_missing_values")
    iid = spec.get("is_iid")
    time_series = spec.get("is_time_series")
    latent = spec.get("has_hidden_confounders", "unknown")
    unique = spec.get("needs_unique_dag")

    validation = [
        "Bootstrap edge stability.",
        "Compare against at least one baseline such as PC, FCI, or GES.",
        "Check key edges against background knowledge or intervention evidence."
    ]

    if data_type == "text":
        return {
            "top_choice": "COAT style factor proposal and annotation, then FCI",
            "test_or_score": "Fisher Z for continuous annotations or Chi square/G square for discrete annotations",
            "why": "Raw text should first be converted into explicit causal variables with annotation criteria.",
            "graph_returned": "PAG",
            "alternatives": [
                {"method": "COAT plus PC", "when_to_use": "Use when all major variables are believed observed."},
                {"method": "Manual annotation plus FCI", "when_to_use": "Use when LLM annotation must be minimized or audited."}
            ],
            "assumptions": ["Annotated factors are meaningful variables.", "Annotation noise is acceptable or audited."],
            "caveats": ["Do not directly interpret LLM proposed edges as causal discoveries."],
            "validation": validation
        }

    if time_series or iid is False:
        return {
            "top_choice": "VAR-LiNGAM, PCMCI, Granger causality, or CD-NOD",
            "test_or_score": "Lagged dependence tests or nonstationarity signal",
            "why": "The observations are not IID, so ordinary PC or GES can be misleading.",
            "graph_returned": "Lagged causal graph or context aware graph",
            "alternatives": [
                {"method": "CD-NOD", "when_to_use": "Use for heterogeneous or nonstationary data."},
                {"method": "Lagged PC or Tetrad SVAR methods", "when_to_use": "Use when temporal order and lags are available."}
            ],
            "assumptions": ["Temporal order or context index is meaningful."],
            "caveats": ["Do not shuffle time series data as IID rows."],
            "validation": validation
        }

    if missing:
        return {
            "top_choice": "MV-PC or PC with missing value Fisher Z",
            "test_or_score": "mv_fisherz",
            "why": "The data contain missing values and the missingness should be handled inside the CI testing or through sensitivity analysis.",
            "graph_returned": "CPDAG or partially directed graph",
            "alternatives": [
                {"method": "Imputation plus PC", "when_to_use": "Use when MV-PC is unavailable in the selected backend."},
                {"method": "FCI with missing value handling", "when_to_use": "Use when hidden confounders are also plausible."}
            ],
            "assumptions": ["Missingness handling is appropriate for the data collection process."],
            "caveats": ["Different imputation choices can change edges."],
            "validation": validation
        }

    large = (isinstance(p, int) and p > 100) or (isinstance(n, int) and n >= 3000)

    if latent in {"yes", "possible"}:
        if data_type == "discrete":
            top, test, graph = "FCI", "Chi square or G square", "PAG"
        elif data_type == "mixed":
            top, test, graph = "FCI with an appropriate mixed data test if available", "mixed data test", "PAG"
        else:
            top, test, graph = "FCI", "Fisher Z", "PAG"
        alternatives = [
            {"method": "RFCI", "when_to_use": "Use when FCI is too slow."},
            {"method": "GFCI or GRaSP-FCI", "when_to_use": "Use when a hybrid score and constraint method is preferred."}
        ]
        if large:
            alternatives.insert(0, {"method": "GRaSP-FCI or scalable Tetrad methods", "when_to_use": "Use for many variables or large samples."})
        return {
            "top_choice": top,
            "test_or_score": test,
            "why": "Hidden confounders are plausible, so a PAG method is safer than PC or GES.",
            "graph_returned": graph,
            "alternatives": alternatives[:2],
            "assumptions": ["No major selection bias unless modeled.", "CI tests are suitable for the variable types."],
            "caveats": ["PAG endpoint marks encode uncertainty and should not be overinterpreted."],
            "validation": validation
        }

    if unique:
        return {
            "top_choice": "DirectLiNGAM",
            "test_or_score": "linear non Gaussian functional model",
            "why": "The user wants a more oriented DAG, which needs stronger assumptions than CPDAG methods.",
            "graph_returned": "DAG",
            "alternatives": [
                {"method": "ANM", "when_to_use": "Use when additive nonlinear noise assumptions are plausible."},
                {"method": "GES plus BIC", "when_to_use": "Use as a score based baseline, but expect an equivalence class."}
            ],
            "assumptions": ["Acyclicity.", "Non Gaussian noise for LiNGAM or functional restrictions for ANM."],
            "caveats": ["Unique orientation comes from assumptions, not only from conditional independencies."],
            "validation": validation
        }

    if data_type == "discrete":
        return {
            "top_choice": "PC",
            "test_or_score": "Chi square or G square",
            "why": "Discrete variables need a discrete conditional independence test.",
            "graph_returned": "CPDAG or partially directed graph",
            "alternatives": [
                {"method": "GES or FGES plus BDeu", "when_to_use": "Use as a score based discrete baseline."},
                {"method": "bnlearn hill climbing", "when_to_use": "Use in R for Bayesian network structure learning."}
            ],
            "assumptions": ["Causal sufficiency if using PC.", "Adequate counts in conditional contingency tables."],
            "caveats": ["Sparse categories can make CI tests unstable."],
            "validation": validation
        }

    if large:
        return {
            "top_choice": "GRaSP, BOSS, or FGES",
            "test_or_score": "BIC or suitable score",
            "why": "The data are large enough that scalable score or permutation based methods are preferable.",
            "graph_returned": "CPDAG, DAG, or pattern depending on backend",
            "alternatives": [
                {"method": "PC stable with restricted depth", "when_to_use": "Use as a constraint based fast baseline."},
                {"method": "FCI or GFCI", "when_to_use": "Use if hidden confounders are plausible."}
            ],
            "assumptions": ["Acyclicity.", "Score or CI test matches the variable type."],
            "caveats": ["Scalability does not remove confounding or measurement error concerns."],
            "validation": validation
        }

    return {
        "top_choice": "PC",
        "test_or_score": "Fisher Z",
        "why": "It is a fast, interpretable default for continuous IID data when causal sufficiency is plausible.",
        "graph_returned": "CPDAG or partially directed graph",
        "alternatives": [
            {"method": "GES plus BIC", "when_to_use": "Use as a score based baseline."},
            {"method": "FCI plus Fisher Z", "when_to_use": "Use if hidden confounders are plausible."}
        ],
        "assumptions": ["IID samples.", "No hidden confounders for PC.", "Faithfulness and suitable CI tests."],
        "caveats": ["Undirected edges mean orientation is not identified from the data and assumptions."],
        "validation": validation
    }


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python recommend.py input.json")
    spec = json.loads(Path(sys.argv[1]).read_text())
    print(json.dumps(recommend(spec), indent=2))


if __name__ == "__main__":
    main()
