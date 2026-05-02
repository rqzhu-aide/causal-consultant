# Weighting examples with WeightIt + cobalt
# Demonstrates ATE IPW, ATO overlap weights, and ATT entropy balancing.
# Synthetic data are used. No packages are installed silently.

required <- c("WeightIt", "cobalt", "sandwich", "lmtest")
missing <- required[!vapply(required, requireNamespace, quietly = TRUE, FUN.VALUE = logical(1))]
if (length(missing) > 0) {
  stop("Missing packages: ", paste(missing, collapse = ", "),
       "\nInstall with: install.packages(c('", paste(missing, collapse = "','"), "'))")
}

set.seed(20260429)
n <- 1200
x1 <- rnorm(n)
x2 <- rnorm(n)
x3 <- rbinom(n, 1, 0.45)
region <- factor(sample(c("North", "South", "West"), n, replace = TRUE))
lin_ps <- -0.4 + 1.1 * x1 - 0.8 * x2 + 0.35 * x3 + c(North = 0, South = 0.3, West = -0.25)[region]
ps_true <- plogis(lin_ps)
treat <- rbinom(n, 1, ps_true)
y <- 3 + 1.5 * treat + 1.0 * x1 - 0.7 * x2 + 0.5 * x3 + c(North = 0, South = 0.4, West = -0.2)[region] + rnorm(n)
dat <- data.frame(y, treat, x1, x2, x3, region)

form <- treat ~ x1 + I(x1^2) + x2 + I(x2^2) + x3 + region

# ATE via logistic propensity-score IPW.
w_ate <- WeightIt::weightit(form, data = dat, method = "glm", estimand = "ATE")

# ATO via overlap weights. These are often more stable under limited overlap.
w_ato <- WeightIt::weightit(form, data = dat, method = "glm", estimand = "ATO")

# ATT via entropy balancing. If the ebal backend is missing, WeightIt will report the package need.
w_att_ebal <- tryCatch(
  WeightIt::weightit(form, data = dat, method = "ebal", estimand = "ATT"),
  error = function(e) e
)

print_design <- function(wobj, label) {
  cat("\n\n==============================\n")
  cat(label, "\n")
  cat("==============================\n")
  print(summary(wobj))
  print(cobalt::bal.tab(wobj, un = TRUE, thresholds = c(m = 0.1, v = 2)))
  ess <- cobalt::bal.tab(wobj)$Observations
  cat("\nObservation/ESS summary from cobalt:\n")
  print(ess)
}

print_design(w_ate, "ATE IPW")
print_design(w_ato, "ATO overlap weighting")
if (!inherits(w_att_ebal, "error")) {
  print_design(w_att_ebal, "ATT entropy balancing")
} else {
  cat("\nEntropy balancing example skipped: ", conditionMessage(w_att_ebal), "\n")
}

# Save Love plots.
png("r_weightit_ate_love_plot.png", width = 1000, height = 700)
cobalt::love.plot(w_ate, stats = "mean.diffs", abs = TRUE, thresholds = c(m = 0.1))
dev.off()

png("r_weightit_ato_love_plot.png", width = 1000, height = 700)
cobalt::love.plot(w_ato, stats = "mean.diffs", abs = TRUE, thresholds = c(m = 0.1))
dev.off()

# Weighted mean contrast and robust model-based SE.
estimate_weighted_difference <- function(data, weights, label) {
  data$w <- weights
  weighted_mean <- function(x, w) sum(w * x) / sum(w)
  mu1 <- weighted_mean(data$y[data$treat == 1], data$w[data$treat == 1])
  mu0 <- weighted_mean(data$y[data$treat == 0], data$w[data$treat == 0])
  fit <- lm(y ~ treat, data = data, weights = w)
  robust <- lmtest::coeftest(fit, vcov. = sandwich::vcovHC(fit, type = "HC1"))
  cat("\n", label, "\n", sep = "")
  cat("Weighted treated mean:", round(mu1, 3), "\n")
  cat("Weighted control mean:", round(mu0, 3), "\n")
  cat("Weighted difference:", round(mu1 - mu0, 3), "\n")
  print(robust)
}

estimate_weighted_difference(dat, w_ate$weights, "ATE IPW outcome analysis")
estimate_weighted_difference(dat, w_ato$weights, "ATO overlap-weighted outcome analysis")
if (!inherits(w_att_ebal, "error")) {
  estimate_weighted_difference(dat, w_att_ebal$weights, "ATT entropy-balanced outcome analysis")
}

cat("\nInterpretation reminder:\n")
cat("\nATE, ATO, and ATT target different populations. Do not compare their point estimates as if they target the same estimand.\n")
