# Lightweight parametric g-formula skeleton for strategy simulation.
# This is intentionally explicit; for production consider gfoRmula.

library(readr)
library(dplyr)
library(purrr)

dat <- read_csv("longitudinal_person_time.csv")

# Expected columns:
# id, time, a, y, l1, l2, baseline_x
# Example target: compare always treated vs never treated over the observed time grid.

dat <- dat %>%
  arrange(id, time) %>%
  group_by(id) %>%
  mutate(
    lag_a = lag(a, default = 0),
    lag_l1 = lag(l1, default = first(l1)),
    lag_l2 = lag(l2, default = first(l2))
  ) %>%
  ungroup()

cov_l1 <- lm(l1 ~ lag_a + lag_l1 + lag_l2 + baseline_x + factor(time), data = dat)
cov_l2 <- glm(l2 ~ lag_a + lag_l1 + baseline_x + factor(time), data = dat, family = binomial())
outcome <- lm(y ~ a + l1 + l2 + baseline_x + factor(time), data = dat)

simulate_strategy <- function(strategy_value) {
  sim <- dat %>%
    group_by(id) %>%
    slice(1) %>%
    ungroup() %>%
    select(id, baseline_x, l1, l2) %>%
    mutate(y = NA_real_)

  times <- sort(unique(dat$time))
  out <- list()
  for (tt in times) {
    sim <- sim %>%
      mutate(
        time = tt,
        lag_a = ifelse(tt == min(times), 0, strategy_value),
        lag_l1 = l1,
        lag_l2 = l2,
        a = strategy_value,
        l1 = predict(cov_l1, newdata = .),
        l2 = as.numeric(predict(cov_l2, newdata = ., type = "response") > 0.5),
        y = predict(outcome, newdata = .)
      )
    out[[as.character(tt)]] <- sim
  }

  bind_rows(out) %>%
    group_by(id) %>%
    summarise(strategy_mean_outcome = last(y), .groups = "drop")
}

always_treat <- simulate_strategy(1)
never_treat <- simulate_strategy(0)

result <- tibble(
  strategy = c("always_treat", "never_treat"),
  mean_outcome = c(
    mean(always_treat$strategy_mean_outcome, na.rm = TRUE),
    mean(never_treat$strategy_mean_outcome, na.rm = TRUE)
  )
)

write_csv(result, "parametric_gformula_strategy_means.csv")
