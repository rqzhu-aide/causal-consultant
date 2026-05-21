# Tidy synthetic control workflow with tidysynth.

library(readr)
library(tidysynth)

dat <- read_csv("analysis_scm_panel.csv")

scm <- dat |>
  synthetic_control(
    outcome = y,
    unit = unit_name,
    time = time,
    i_unit = "treated_unit_name",
    i_time = 2011,
    generate_placebos = TRUE
  ) |>
  generate_predictor(time_window = 2000:2010, x1 = mean(x1, na.rm = TRUE)) |>
  generate_predictor(time_window = 2000:2010, x2 = mean(x2, na.rm = TRUE)) |>
  generate_weights(optimization_window = 2000:2010) |>
  generate_control()

write.csv(grab_unit_weights(scm), "tidysynth_unit_weights.csv", row.names = FALSE)
write.csv(grab_balance_table(scm), "tidysynth_balance.csv", row.names = FALSE)
write.csv(grab_significance(scm), "tidysynth_placebo_significance.csv", row.names = FALSE)
saveRDS(scm, "tidysynth_fit.rds")
