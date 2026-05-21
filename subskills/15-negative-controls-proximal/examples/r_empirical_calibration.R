# Empirical calibration from multiple negative controls.
# Input should contain comparable log effect estimates and standard errors.

library(EmpiricalCalibration)

effects <- read.csv("negative_and_positive_control_estimates.csv")

negative_controls <- subset(effects, ground_truth == 0)
positive_controls <- subset(effects, ground_truth == 1)
target <- subset(effects, estimand_id == "primary")

null <- fitNull(
  logRr = negative_controls$log_rr,
  seLogRr = negative_controls$se_log_rr
)

calibrated_p <- calibrateP(
  null = null,
  logRr = target$log_rr,
  seLogRr = target$se_log_rr
)

print(calibrated_p)

png("empirical_calibration_plot.png", width = 1200, height = 800, res = 150)
plotCalibrationEffect(
  logRrNegatives = negative_controls$log_rr,
  seLogRrNegatives = negative_controls$se_log_rr,
  logRrPositives = positive_controls$log_rr,
  seLogRrPositives = positive_controls$se_log_rr,
  null = null
)
dev.off()
