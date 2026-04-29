# Template: WeightIt + cobalt focused weighting analysis
# Demonstrates ATE, ATT, and ATO weights on a consistent analysis sample.

required <- c("WeightIt", "cobalt", "sandwich", "lmtest")
missing <- required[!vapply(required, requireNamespace, quietly = TRUE, FUN.VALUE = logical(1))]
if (length(missing) > 0) {
  stop("Missing packages: ", paste(missing, collapse = ", "),
       "\nInstall with: install.packages(c('", paste(missing, collapse = "','"), "'))")
}

set.seed(20260429)
n <- 1000
X1 <- rnorm(n); X2 <- rnorm(n); X3 <- rbinom(n, 1, .5)
A <- rbinom(n, 1, plogis(-.3 + X1 - .6 * X2 + .4 * X3))
Y <- 1 + 1.2 * A + .8 * X1 - .5 * X2 + .4 * X3 + rnorm(n)
dat <- data.frame(Y, A, X1, X2, X3)

f <- A ~ X1 + I(X1^2) + X2 + X3

weight_specs <- list(
  ATE_IPW = list(method = "glm", estimand = "ATE"),
  ATT_IPW = list(method = "glm", estimand = "ATT"),
  ATO_overlap = list(method = "glm", estimand = "ATO")
)

weighted_mean <- function(y, w) sum(y * w) / sum(w)

for (nm in names(weight_specs)) {
  spec <- weight_specs[[nm]]
  wobj <- WeightIt::weightit(f, data = dat, method = spec$method, estimand = spec$estimand)
  dat$w <- wobj$weights
  cat("\n\n=== ", nm, " ===\n", sep = "")
  print(summary(wobj))
  print(cobalt::bal.tab(wobj, un = TRUE, thresholds = c(m = .1, v = 2)))
  mu1 <- weighted_mean(dat$Y[dat$A == 1], dat$w[dat$A == 1])
  mu0 <- weighted_mean(dat$Y[dat$A == 0], dat$w[dat$A == 0])
  cat("Weighted difference:", round(mu1 - mu0, 3), "\n")
  fit <- lm(Y ~ A, data = dat, weights = w)
  print(lmtest::coeftest(fit, vcov. = sandwich::vcovHC(fit, type = "HC1")))
}
