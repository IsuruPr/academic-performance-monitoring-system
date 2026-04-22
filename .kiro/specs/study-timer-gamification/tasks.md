# Implementation Plan: Study Timer Gamification

## Overview

Implement a client-side gamification layer on top of the existing `StudyTimerPage`. The work is split into four incremental phases: (1) the pure gamification engine utility, (2) the three new UI components, (3) wiring everything into `StudyTimerPage`, and (4) automated tests.

## Tasks

- [x] 1. Create `gamificationEngine.js` — core pure functions
  - Create `client/src/utils/gamificationEngine.js`
  - Implement `DEFAULT_STATE`, `loadState`, and `saveState` (read/write `acadamiX_gamification` in localStorage; return DEFAULT_STATE on missing or invalid JSON)
  - Implement `computeXP(sessionMinutes)` — returns `Math.floor(minutes × 10)` for ≥ 1 min, else 0
  - Implement `computeLevel(totalXP)` — returns `Math.floor(1 + Math.sqrt(totalXP / 100))`
  - Implement `xpForLevel(level)` — returns `(level - 1)² × 100`
  - Implement `computeProgress(totalXP)` — returns progress % toward next level (0–100)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.4, 6.1, 6.2, 6.3_

- [x] 2. Implement streak and achievement logic in `gamificationEngine.js`
  - [x] 2.1 Implement `updateStreak(state, todayDate)` — increment on consecutive day, reset to 1 on gap, leave unchanged on same day
  - [x] 2.2 Implement `checkStreakOnLoad()` — reads state, resets streak to 0 if last session date is > 1 day ago, persists and returns updated state
  - [x] 2.3 Implement `evaluateAchievements(state, sessionMinutes)` — checks all 10 achievement conditions, adds newly met ones to `unlockedAchievements`, returns `{ state, newAchievements }`
  - [x] 2.4 Implement `processSession(sessionMinutes)` — orchestrates `loadState → computeXP → updateStreak → evaluateAchievements → level check → saveState`, returns `SessionResult`
  - _Requirements: 1.3, 2.2, 3.1, 3.2, 3.3, 3.4, 3.6, 4.1, 4.2, 4.3, 6.2, 6.4_

- [x] 3. Add Vitest + fast-check to client workspace and write property-based tests
  - [x] 3.1 Add `vitest` and `fast-check` as devDependencies in `client/package.json`; add a `"test"` script (`vitest --run`)
  - [x]* 3.2 Write property test — Property 1: XP formula correctness
    - Use `fc.float({ min: 0, max: 300 })` to verify `computeXP` formula and zero-XP edge case
    - **Property 1: XP formula correctness**
    - **Validates: Requirements 1.1, 1.2**
  - [x]* 3.3 Write property test — Property 2: XP persistence round-trip
    - Mock localStorage; verify `processSession` persists `prior_xp + earned_xp`
    - **Property 2: XP persistence round-trip**
    - **Validates: Requirements 1.3, 6.1, 6.2**
  - [x]* 3.4 Write property test — Property 3: Level formula correctness
    - Use `fc.integer({ min: 0, max: 100000 })` to verify `computeLevel` formula
    - **Property 3: Level formula correctness**
    - **Validates: Requirements 2.1**
  - [x]* 3.5 Write property test — Property 4: Level-up detection and progress accuracy
    - Generate XP pairs straddling level boundaries; verify `leveledUp` flag and `computeProgress` in [0, 100)
    - **Property 4: Level-up detection and progress accuracy**
    - **Validates: Requirements 2.2, 2.4**
  - [x]* 3.6 Write property test — Property 5: Streak increment on consecutive days
    - **Property 5: Streak increment on consecutive days**
    - **Validates: Requirements 3.2**
  - [x]* 3.7 Write property test — Property 6: Streak reset on gap
    - **Property 6: Streak reset on gap**
    - **Validates: Requirements 3.3**
  - [x]* 3.8 Write property test — Property 7: Streak idempotence on same-day sessions
    - **Property 7: Streak idempotence on same-day sessions**
    - **Validates: Requirements 3.4**
  - [x]* 3.9 Write property test — Property 8: Streak expiry on page load
    - **Property 8: Streak expiry on page load**
    - **Validates: Requirements 3.6**
  - [x]* 3.10 Write property test — Property 9: Achievement unlock correctness and idempotence
    - Use `fc.record(...)` for arbitrary gamification states; verify each achievement appears at most once
    - **Property 9: Achievement unlock correctness and idempotence**
    - **Validates: Requirements 4.2, 4.3**
  - [x]* 3.11 Write property test — Property 10: Sessions key isolation
    - Verify `acadamiX_study_sessions` is byte-for-byte unchanged after any gamification operation
    - **Property 10: Sessions key isolation**
    - **Validates: Requirements 6.4**
  - [x]* 3.12 Write example-based unit tests for `gamificationEngine.js`
    - Cover: `loadState` with missing key, `loadState` with invalid JSON, `processSession(0.5)` → 0 XP, `processSession(25)` → 250 XP, `computeLevel` at 0/100/400, each of the 10 achievements at its exact threshold
    - _Requirements: 1.1, 1.2, 1.4, 2.1, 4.1, 6.3_

- [x] 4. Checkpoint — Ensure all engine tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Build `GamificationStatsBar.jsx` component
  - Create `client/src/components/GamificationStatsBar.jsx`
  - Accept props: `level`, `totalXP`, `progressPercent`, `streak`, `totalMinutes`
  - Render four stat tiles: Level, XP with progress bar, Streak (flame icon), Total Minutes
  - Style consistently with the existing dark glass aesthetic
  - _Requirements: 2.3, 2.4, 3.5, 7.1, 7.2_

- [x] 6. Build `RewardPopup.jsx` component
  - Create `client/src/components/RewardPopup.jsx`
  - Accept props: `result` (SessionResult shape), `onStartNew`, `onDismiss`
  - Always render: XP earned, current level, streak count
  - Conditionally render level-up banner when `result.leveledUp === true`
  - Conditionally render new achievement cards when `result.newAchievements.length > 0`
  - Provide "Start New Session" and "Dismiss" buttons that call the respective callbacks
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Build `AchievementsGrid.jsx` component
  - Create `client/src/components/AchievementsGrid.jsx`
  - Accept prop: `unlockedIds` (array of achievement ID strings)
  - Render all 10 achievement definitions as badge cards
  - Unlocked: show name + icon; Locked: show name + lock icon in greyed-out style
  - _Requirements: 4.4_

- [x] 8. Wire gamification into `StudyTimerPage.jsx`
  - [x] 8.1 On page mount, call `checkStreakOnLoad()` and initialise gamification state from `loadState()`; compute `totalMinutes` from `acadamiX_study_sessions`
  - [x] 8.2 Render `<GamificationStatsBar>` above the timer and chart panels, passing live state values
  - [x] 8.3 In `handleStop` and `handleTimerFinish`, call `processSession(studiedMinutes)` after saving the session; store the returned `SessionResult` in component state
  - [x] 8.4 Replace the existing `showCompletionPopup` modal with `<RewardPopup>` driven by the `SessionResult`; wire `onStartNew` and `onDismiss` to reset the timer display
  - [x] 8.5 Render `<AchievementsGrid>` below the timer/chart grid, passing `unlockedAchievements` from gamification state
  - [x] 8.6 After each session completes, re-read gamification state and re-compute `totalMinutes` so the stats bar updates without a page reload
  - _Requirements: 2.3, 3.5, 5.4, 5.5, 6.1, 7.1, 7.2, 7.3_

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 10. Write property test — Property 11: Reward popup renders all session result fields
  - Use `fc.record(...)` to generate arbitrary `SessionResult` values; render `RewardPopup` with a test renderer and assert XP, level, streak are present; assert level-up message when `leveledUp` is true; assert each achievement name appears when `newAchievements` is non-empty
  - **Property 11: Reward popup renders all session result fields**
  - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All gamification state lives in `acadamiX_gamification`; the existing `acadamiX_study_sessions` key must never be modified by gamification code
- Property tests use `fast-check` with a minimum of 100 iterations each
- Each property test file should include a comment: `// Feature: study-timer-gamification, Property N: <property text>`
- Run tests with: `cd client && npm test` (single-run mode via `vitest --run`)
