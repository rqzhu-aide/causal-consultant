# IV regression with ivreg diagnostics.
# Use for standard 2SLS reporting plus diagnostic plots/tables.

library(readr)
library(ivreg)

dat <- read_csv("analysis_iv_dataset.csv")

fit <- ivreg(
  y ~ d + x1 + x2 | z + x1 + x2,
  data = dat
)

diagnostic_summary <- summary(fit, diagnostics = TRUE)

capture.output(diagnostic_summary, file = "ivreg_diagnostics_summary.txt")
png("ivreg_diagnostics_plots.png", width = 1200, height = 900)
plot(fit)
dev.off()

saveRDS(fit, "ivreg_fit.rds")
