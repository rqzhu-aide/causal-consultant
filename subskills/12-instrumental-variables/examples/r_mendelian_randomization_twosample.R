# Two-sample Mendelian randomization template.
# Requires harmonized GWAS summary data or OpenGWAS access.

library(readr)
library(TwoSampleMR)

# harmonized_mr_data.csv should contain SNP-exposure and SNP-outcome effects
# in TwoSampleMR-compatible format after extraction, clumping, and harmonization.
dat <- read_csv("harmonized_mr_data.csv")

mr_results <- mr(dat)
het <- mr_heterogeneity(dat)
pleio <- mr_pleiotropy_test(dat)
loo <- mr_leaveoneout(dat)

write.csv(mr_results, "mr_results.csv", row.names = FALSE)
write.csv(het, "mr_heterogeneity.csv", row.names = FALSE)
write.csv(pleio, "mr_pleiotropy_egger_intercept.csv", row.names = FALSE)
write.csv(loo, "mr_leave_one_out.csv", row.names = FALSE)

saveRDS(list(results = mr_results, heterogeneity = het, pleiotropy = pleio, leave_one_out = loo), "twosamplemr_fit.rds")
