# Nearest-neighbor propensity-score matching with MatchIt + cobalt
# Goal: estimate an ATT-style effect after observational preprocessing.
# This example uses synthetic data so it can run without external datasets.
# It does not install packages silently.

required <- c("MatchIt", "cobalt", "sandwich", "lmtest")
missing <- required[!vapply(required, requireNamespace, quietly = TRUE, FUN.VALUE = logical(1))]
if (length(missing) > 0) {
  stop("Missing packages: ", paste(missing, collapse = ", "),
       "\nInstall with: install.packages(c('", paste(missing, collapse = "','"), "'))")
}

set.seed(20260429)
n <- 1000
age <- rnorm(n, 55, 12)
severity <- rnorm(n)
female <- rbinom(n, 1, 0.52)
site <- factor(sample(LETTERS[1:5], n, replace = TRUE))

lin_ps <- -0.6 + 0.025 * (age - 55) + 0.9 * severity - 0.25 * female +
  c(A = -0.2, B = 0.1, C = 0.0, D = 0.2, E = -0.1)[site]
ps_true <- plogis(lin_ps)
treat <- rbinom(n, 1, ps_true)

# Treatment effect is 2.0; confounding exists through age/severity/female/site.
y <- 10 + 2.0 * treat + 0.04 * age + 1.3 * severity - 0.4 * female +
  c(A = 0.0, B = 0.5, C = -0.2, D = 0.2, E = -0.3)[site] + rnorm(n)

dat <- data.frame(y, treat, age, severity, female, site)

# Design formula: pre-treatment covariates only.
ps_formula <- treat ~ age + I(age^2) + severity + female + site

# 1:1 nearest-neighbor ATT matching with a caliper.
# In applied work, consider calipers on logit PS and inspect discarded treated units.
m.out <- MatchIt::matchit(
  ps_formula,
  data = dat,
  method = "nearest",
  distance = "glm",
  estimand = "ATT",
  ratio = 1,
  replace = FALSE,
  caliper = 0.2
)

cat("\n=== MatchIt summary ===\n")
print(summary(m.out))

cat("\n=== Balance table ===\n")
bal <- cobalt::bal.tab(m.out, un = TRUE, thresholds = c(m = 0.1, v = 2))
print(bal)

# Save a Love plot. Remove this section if running in a non-graphical environment.
png("r_matchit_nearest_love_plot.png", width = 1000, height = 700)
cobalt::love.plot(m.out, stats = "mean.diffs", abs = TRUE, thresholds = c(m = 0.1))
dev.off()

md <- MatchIt::match.data(m.out)
cat("\nMatched rows:", nrow(md), "\n")
cat("Original treated/control counts:\n")
print(table(dat$treat))
cat("Matched treated/control counts using positive matching weights:\n")
print(table(md$treat))

# Outcome analysis after matching.
# For simple matched/weighted analyses, estimate a weighted marginal mean difference.
fit <- lm(y ~ treat, data = md, weights = weights)
robust <- lmtest::coeftest(fit, vcov. = sandwich::vcovHC(fit, type = "HC1"))
cat("\n=== Weighted outcome model with robust SE ===\n")
print(robust)

# Direct weighted mean contrast.
weighted_mean <- function(x, w) sum(w * x) / sum(w)
treated_mean <- weighted_mean(md$y[md$treat == 1], md$weights[md$treat == 1])
control_mean <- weighted_mean(md$y[md$treat == 0], md$weights[md$treat == 0])
cat("\nATT-style matched mean contrast:\n")
cat("\nTreated mean:", round(treated_mean, 3))
cat("\nMatched control mean:", round(control_mean, 3))
cat("\nDifference:", round(treated_mean - control_mean, 3), "\n")

cat("\nInterpretation reminder:\n")
cat("\nThis targets an ATT-style effect among matched treated units, not necessarily the ATE.\n")
cat("Causal interpretation requires consistency, no interference, conditional exchangeability given the measured pre-treatment covariates, and overlap in the retained matched sample.\n")
