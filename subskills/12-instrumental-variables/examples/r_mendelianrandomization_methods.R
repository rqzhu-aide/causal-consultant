# Summary-data Mendelian randomization with MendelianRandomization.
# Replace file names with harmonized SNP-exposure and SNP-outcome associations.

library(readr)
library(MendelianRandomization)

dat <- read_csv("harmonized_mr_summary.csv")

# Required columns:
# beta_x, se_x: SNP-exposure effect and SE
# beta_y, se_y: SNP-outcome effect and SE
# snp: variant id

mr_input_obj <- mr_input(
  bx = dat$beta_x,
  bxse = dat$se_x,
  by = dat$beta_y,
  byse = dat$se_y,
  snps = dat$snp
)

ivw <- mr_ivw(mr_input_obj)
egger <- mr_egger(mr_input_obj)
median <- mr_median(mr_input_obj)
mode <- mr_mbe(mr_input_obj)

capture.output(ivw, file = "mr_ivw.txt")
capture.output(egger, file = "mr_egger.txt")
capture.output(median, file = "mr_weighted_median.txt")
capture.output(mode, file = "mr_mode_based.txt")

saveRDS(list(ivw = ivw, egger = egger, median = median, mode = mode), "mendelianrandomization_methods.rds")
