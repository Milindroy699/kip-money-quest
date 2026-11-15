# Success Metrics

| Area | Metric | Target (beta) |
|---|---|---|
| Activation | % of installs reaching 3 lessons + 1 run + reminder set within 72 h, and returning on Day 1 | ≥ 40% |
| Onboarding | % reaching the Kip vs Dash slider; % completing onboarding | ≥ 90% / ≥ 70% |
| Retention | D1 / D7 / D30 | 45% / 25% / 12% |
| Habit | Median streak length; % of weekly active users with streak ≥ 7 | ≥ 5 days / ≥ 30% |
| Learning | Pre/post assessment gain (validated financial-literacy items) | ≥ +25 percentage points |
| Mastery | % of review questions answered correctly on the day-7 review | ≥ 70% |
| Social (Phase 2) | % with ≥ 1 friend or club; duels per weekly active user | ≥ 30% / ≥ 2 |
| Behaviour | % of duel portfolios that are diversified and goal-fit | Rising week over week |
| Wellbeing | Notification opt-out rate; median session length | < 15% / 4–8 min |

## Instrumentation
- **Phase 1:** no analytics. Use on-device state only, plus manual playtests.
- **Phase 2:** Firebase Analytics in a child-safe configuration.
  - No advertising ID and no cross-app tracking.
  - Events: `onboarding_step`, `lesson_start`, `lesson_complete`, `quiz_answer` (misconception tag), `run_end`, `streak_update`, `freeze_used`, `dividend_claim`, `notification_open`.
