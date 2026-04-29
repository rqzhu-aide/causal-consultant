# Full matching and coarsened exact matching examples with MatchIt.
# Full matching may require optmatch. CEM may require the relevant MatchIt method support/dependencies.

required <- c("MatchIt", "cobalt", "sandwich", "lmtest")
missing <- required[!vapply(required, requireNamespace, quietly = TRUE, FUN.VALUE = logical(1))]
if (length(missing) > 0) {
  stop("Missing packages: ", paste(missing, collapse = ", "),
       "\nInstall with: install.packages(c('", paste(missing, collapse = "','"), "'))")
}

set.seed(20260429)
n <- 900
age <- round(rnorm(n, 60, 10))
score <- rnorm(n)
female <- rbinom(n, 1, 0.55)
comorbidity <- sample(0:3, n, replace = TRUE, prob = c(.45, .30, .18, .07))
lin_ps <- -0.7 + 0.03 * (age - 60) + 0.9 * score + 0.25 * female + 0.35 * comorbidity
ps <- plogis(lin_ps)
treat <- rbinom(n, 1, ps)
y <- 5 + 1.2 * treat + 0.02 * age + 1.0 * score + 0.3 * female + 0.6 * comorbidity + rnorm(n)
dat <- data.frame(y, treat, age, score, female, comorbidity)

form <- treat ~ age + I(age^2) + score + female + comorbidity

run_and_report <- function(m.out, label) {
  cat("\n\n==============================\n")
  cat(label, "\n")
  cat("==============================\n")
  print(summary(m.out))
  print(cobalt::bal.tab(m.out, un = TRUE, thresholds = c(m = .1, v = 2)))
  md <- MatchIt::match.data(m.out)
  fit <- lm(y ~ treat, data = md, weights = weights)
  print(lmtest::coeftest(fit, vcov. = sandwich::vcovHC(fit, type = "HC1")))
}

# Full matching can retain many units while creating matched subclasses.
full_result <- tryCatch(
  MatchIt::matchit(form, data = dat, method = "full", distance = "glm", estimand = "ATE"),
  error = function(e) e
)
if (!inherits(full_result, "error")) {
  run_and_report(full_result, "Full matching")
  png("r_full_matching_love_plot.png", width = 1000, height = 700)
  cobalt::love.plot(full_result, stats = "mean.diffs", abs = TRUE, thresholds = c(m = .1))
  dev.off()
} else {
  cat("\nFull matching skipped: ", conditionMessage(full_result), "\n")
  cat("Install optional dependency if needed: install.packages('optmatch')\n")
}

# Coarsened exact matching: substantively chosen bins.
# The exact/coarsened constraints can change the target population by dropping unmatched strata.
cem_result <- tryCatch(
  MatchIt::matchit(
    treat ~ age + score + female + comorbidity,
    data = dat,
    method = "cem",
    estimand = "ATT",
    cutpoints = list(age = c(45, 55, 65, 75), score = c(-1, 0, 1))
  ),
  error = function(e) e
)
if (!inherits(cem_result, "error")) {
  run_and_report(cem_result, "Coarsened exact matching")
  png("r_cem_love_plot.png", width = 1000, height = 700)
  cobalt::love.plot(cem_result, stats = "mean.diffs", abs = TRUE, thresholds = c(m = .1))
  dev.off()
} else {
  cat("\nCEM skipped: ", conditionMessage(cem_result), "\n")
}

cat("\nInterpretation reminder:\n")
cat("\nFull matching and CEM can change the target population. Report discarded units and describe the retained matched/weighted population.\n")
