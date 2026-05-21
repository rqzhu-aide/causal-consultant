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
    accepts_equiv = spec.get("accepts_cpdag_or_pag")
    interventions = spec.get("has_interventions")
    background = spec.get("has_background_knowledge")
    language = spec.get("language", "unknown")

    validation = [
        "Bootstrap edge stability.",
        "Compare against at least one baseline such as PC, FCI, or GES.",
        "Check key edges against background knowledge or intervention evidence."
    ]
    if background:
        validation.append("Encode and audit required edges, forbidden edges, or temporal tiers before fitting.")
    if interventions:
        validation.append("Confirm intervention targets, intervention timing, and whether data are pooled or environment-specific.")
    if language == "python":
        validation.append("Python backends to consider: causal-learn, Tigramite for time series, and lingam for LiNGAM-family models.")
    elif language == "r":
        validation.append("R backends to consider: pcalg, bnlearn, causalDisco, and Tetrad through wrappers when available.")
    elif language == "java":
        validation.append("Java/Tetrad is a natural backend when rich background knowledge or Tetrad-specific algorithms are needed.")

    if (
        data_type == "unknown"
        and latent == "unknown"
        and missing is None
        and iid is None
        and time_series is None
    ):
        return {
            "top_choice": "Clarify data structure before choosing a discovery algorithm",
            "test_or_score": "not ready",
            "why": "The recommender does not yet know the variable type, IID/time structure, missingness, or hidden-confounding tolerance.",
            "graph_returned": "No graph yet",
            "alternatives": [
                {"method": "Intake first", "when_to_use": "Ask for data type, sample size, variable count, timing, and background knowledge."},
                {"method": "Reviewer precheck", "when_to_use": "Use data_analyst and method_lead review before running discovery."}
            ],
            "assumptions": ["Discovery needs interpretable variables, timing/background knowledge, and a plausible graph target."],
            "caveats": ["Running discovery before these facts are known can create misleading graph artifacts."],
            "validation": validation
        }

    if isinstance(n, int) and isinstance(p, int) and p > 50 and n < 5 * p:
        return {
            "top_choice": "Reduce variables before graph discovery",
            "test_or_score": "screening and stability before CI tests or scores",
            "why": "The variable count is high relative to the sample size, so dense conditional testing or score search is likely unstable.",
            "graph_returned": "No graph yet, or a deliberately scoped subgraph",
            "alternatives": [
                {"method": "Domain/data variable reduction", "when_to_use": "Use when variables can be grouped, removed, or tiered before discovery."},
                {"method": "Targeted local discovery", "when_to_use": "Use when the user only needs candidate causes or neighbors of a target variable."}
            ],
            "assumptions": ["The reduced variable set is scientifically meaningful and not selected using post-treatment leakage."],
            "caveats": ["High-dimensional discovery can look precise while being driven by sample noise or preprocessing choices."],
            "validation": validation
        }

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

    if time_series:
        return {
            "top_choice": "PCMCI/PCMCI+, LPCMCI, or VAR-LiNGAM",
            "test_or_score": "Lagged conditional independence tests or non-Gaussian time-series model",
            "why": "The data are time ordered, so discovery should respect lags, autocorrelation, and possible contemporaneous dependence.",
            "graph_returned": "Lagged time-series graph, possibly with contemporaneous or latent-confounding marks",
            "alternatives": [
                {"method": "LPCMCI", "when_to_use": "Use when latent confounding is plausible and lag-specific causal relations are needed."},
                {"method": "Granger causality", "when_to_use": "Use only as predictive lag screening with explicit causal caveats."}
            ],
            "assumptions": ["Temporal order, lag choice, and stationarity or nonstationarity handling are meaningful."],
            "caveats": ["Do not shuffle time series data as IID rows.", "Granger-style results are not causal proof without additional assumptions."],
            "validation": validation
        }

    if iid is False:
        return {
            "top_choice": "CD-NOD or multi-environment discovery, with within-context sensitivity checks",
            "test_or_score": "context or nonstationarity signal plus appropriate CI tests/scores",
            "why": "The observations are not IID but are not described as a time series, so environment, clustering, or distribution-shift structure must be modeled.",
            "graph_returned": "Context-aware graph or exploratory graph within each stable context",
            "alternatives": [
                {"method": "Context-stratified PC/FCI", "when_to_use": "Use when groups or environments can be analyzed separately."},
                {"method": "Ordinary PC/FCI as sensitivity only", "when_to_use": "Use only after documenting why IID violations may be mild."}
            ],
            "assumptions": ["The source of non-IID structure is understood well enough to encode or stratify."],
            "caveats": ["Pooling clustered, panel, or multi-environment data can create unstable or misleading edges."],
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

    if interventions:
        if latent in {"yes", "possible"}:
            top = "GFCI/FCI sensitivity plus interventional-design review"
            why = "Interventions are present, but hidden confounding is plausible, so standard interventional equivalence-class methods need caution."
            alternatives = [
                {"method": "GIES with caveats", "when_to_use": "Use only if hidden confounding is judged unlikely for the intervention targets."},
                {"method": "Tetrad GFCI or FCI", "when_to_use": "Use as a latent-confounding sensitivity analysis."}
            ]
            graph = "PAG or interventional equivalence-class graph"
            caveats = ["Known interventions help orientation only when targets, timing, and assumptions are credible."]
        else:
            top = "GIES or interventional score search"
            why = "The data include interventions, so algorithms that use intervention targets can be more appropriate than purely observational PC/GES."
            alternatives = [
                {"method": "pcalg GIES", "when_to_use": "Use when intervention targets are known and hidden confounding is not expected."},
                {"method": "Tetrad IMaGES or related multi-dataset search", "when_to_use": "Use when multiple intervention or environment datasets are available."}
            ]
            graph = "Interventional Markov equivalence class or CPDAG-like graph"
            caveats = ["Incorrect intervention targets or pooled environments can misorient edges."]
        return {
            "top_choice": top,
            "test_or_score": "interventional score or hybrid search",
            "why": why,
            "graph_returned": graph,
            "alternatives": alternatives,
            "assumptions": ["Intervention targets and timing are known.", "Background knowledge is encoded consistently."],
            "caveats": caveats,
            "validation": validation
        }

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

    if accepts_equiv is False and not unique:
        return {
            "top_choice": "Clarify whether stronger assumptions for a unique DAG are acceptable",
            "test_or_score": "not ready for unique orientation",
            "why": "The user does not accept CPDAG/PAG-style equivalence output, but the request does not state assumptions that identify a unique DAG.",
            "graph_returned": "No unique graph yet",
            "alternatives": [
                {"method": "DirectLiNGAM", "when_to_use": "Use if linear non-Gaussian assumptions are plausible."},
                {"method": "Additive noise models", "when_to_use": "Use if nonlinear functional assumptions are defensible."}
            ],
            "assumptions": ["Unique orientation requires assumptions beyond ordinary conditional independence or score equivalence."],
            "caveats": ["Forcing a DAG from an equivalence class can create false certainty."],
            "validation": validation
        }

    if latent == "unknown":
        return {
            "top_choice": "PC or GES baseline with FCI sensitivity",
            "test_or_score": "Fisher Z, discrete CI test, or BIC depending on data type",
            "why": "Hidden-confounding status is unknown, so a causally sufficient graph should not be treated as final without a latent-confounding sensitivity run.",
            "graph_returned": "CPDAG baseline plus PAG sensitivity if FCI is run",
            "alternatives": [
                {"method": "FCI/RFCI", "when_to_use": "Use when unmeasured common causes are plausible or cannot be ruled out."},
                {"method": "PC-stable or GES", "when_to_use": "Use as a transparent baseline under causal sufficiency."}
            ],
            "assumptions": ["Causal sufficiency is uncertain.", "CI tests or scores match the variable types."],
            "caveats": ["Do not present PC/GES orientations as final causal directions while hidden confounding is unresolved."],
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
