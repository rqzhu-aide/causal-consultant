# Template: Matching / weighting / balance workflow in R
# Adapt variable names in the USER SETTINGS section.
# Required packages are not installed silently.

required <- c("MatchIt", "WeightIt", "cobalt", "sandwich", "lmtest")
missing <- required[!vapply(required, requireNamespace, quietly = TRUE, FUN.VALUE = logical(1))]
if (length(missing) > 0) {
  stop("Missing packages: ", paste(missing, collapse = ", "),
       "\nInstall with: install.packages(c('", paste(missing, collapse = "','"), "'))")
}

# =========================
# USER SETTINGS
# =========================
# dat <- read.csv("your_data.csv")
# outcome <- "Y"
# treatment <- "A"
# covariates <- c("X1", "X2", "X3")
# estimand <- "ATT"  # ATE, ATT, ATC, ATO

# Synthetic fallback example. Replace this block with your real data.
set.seed(20260429)
n <- 800
X1 <- rnorm(n)
X2 <- rnorm(n)
X3 <- rbinom(n, 1, 0.45)
ps <- plogis(-0.4 + 0.9 * X1 - 0.8 * X2 + 0.3 * X3)
A <- rbinom(n, 1, ps)
Y <- 2 + 1.5 * A + 0.8 * X1 - 0.5 * X2 + 0.3 * X3 + rnorm(n)
dat <- data.frame(Y, A, X1, X2, X3)
outcome <- "Y"
treatment <- "A"
covariates <- c("X1", "X2", "X3")
estimand <- "ATT"

formula_ps <- as.formula(paste(treatment, "~", paste(covariates, collapse = " + ")))
formula_y <- as.formula(paste(outcome, "~", treatment))

# =========================
# OPTION 1: Matching
# =========================
m.out <- MatchIt::matchit(
  formula_ps,
  data = dat,
  method = "nearest",
  distance = "glm",
  estimand = estimand,
  ratio = 1,
  replace = FALSE,
  caliper = 0.2
)

cat("\n=== Matching summary ===\n")
print(summary(m.out))
cat("\n=== Matching balance ===\n")
print(cobalt::bal.tab(m.out, un = TRUE, thresholds = c(m = .1, v = 2)))

md <- MatchIt::match.data(m.out)
fit_match <- lm(formula_y, data = md, weights = weights)
cat("\n=== Matched outcome model ===\n")
print(lmtest::coeftest(fit_match, vcov. = sandwich::vcovHC(fit_match, type = "HC1")))

# =========================
# OPTION 2: Weighting
# =========================
w.out <- WeightIt::weightit(
  formula_ps,
  data = dat,
  method = "glm",
  estimand = "ATE"
)

dat$w_ate <- w.out$weights
cat("\n=== Weighting summary ===\n")
print(summary(w.out))
cat("\n=== Weighting balance ===\n")
print(cobalt::bal.tab(w.out, un = TRUE, thresholds = c(m = .1, v = 2)))

fit_weight <- lm(formula_y, data = dat, weights = w_ate)
cat("\n=== Weighted outcome model ===\n")
print(lmtest::coeftest(fit_weight, vcov. = sandwich::vcovHC(fit_weight, type = "HC1")))

# =========================
# Plots
# =========================
png("matchit_love_plot.png", width = 1000, height = 700)
cobalt::love.plot(m.out, stats = "mean.diffs", abs = TRUE, thresholds = c(m = .1))
dev.off()

png("weightit_love_plot.png", width = 1000, height = 700)
cobalt::love.plot(w.out, stats = "mean.diffs", abs = TRUE, thresholds = c(m = .1))
dev.off()

cat("\nInterpretation reminder:\n")
cat("\nMatching/weighting estimates are causal only under consistency, no interference, conditional exchangeability given included pre-treatment covariates, and positivity.\n")
cat("Report the target estimand, balance, overlap, discarded units, weights/ESS, and any target-population change.\n")
