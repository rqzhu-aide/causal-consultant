"""PCMCI baseline with Tigramite for lagged time-series discovery.

Run:
  pip install tigramite pandas numpy
  python python_tigramite_pcmci.py data.csv 3

Rows must be ordered in time. Do not shuffle or treat time-series rows as
ordinary IID samples. Review lag choice and stationarity before interpreting.
"""

import sys

import numpy as np
import pandas as pd
from tigramite import data_processing as pp
from tigramite.independence_tests.parcorr import ParCorr
from tigramite.pcmci import PCMCI


def main(path: str, tau_max: int) -> None:
    df = pd.read_csv(path)
    labels = list(df.columns)
    data = df.to_numpy()

    dataframe = pp.DataFrame(data, var_names=labels)
    cond_ind_test = ParCorr(significance="analytic")
    pcmci = PCMCI(dataframe=dataframe, cond_ind_test=cond_ind_test, verbosity=1)
    results = pcmci.run_pcmci(tau_max=tau_max, pc_alpha=0.05)
    q_matrix = pcmci.get_corrected_pvalues(
        p_matrix=results["p_matrix"],
        tau_max=tau_max,
        fdr_method="fdr_bh",
    )

    pcmci.print_significant_links(
        p_matrix=q_matrix,
        val_matrix=results["val_matrix"],
        alpha_level=0.05,
    )
    np.savez(
        "pcmci_results.npz",
        val_matrix=results["val_matrix"],
        p_matrix=results["p_matrix"],
        q_matrix=q_matrix,
        labels=np.asarray(labels),
    )


if __name__ == "__main__":
    if len(sys.argv) not in {2, 3}:
        raise SystemExit("Usage: python python_tigramite_pcmci.py data.csv [tau_max]")
    tau = int(sys.argv[2]) if len(sys.argv) == 3 else 3
    main(sys.argv[1], tau)
