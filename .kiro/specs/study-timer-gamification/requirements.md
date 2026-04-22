# Requirements Document

## Introduction

This feature adds a gamification layer to the existing Study Timer page in AcadamiX. The goal is to make completing study sessions feel rewarding and game-like by introducing XP points, levels, streaks, achievements/badges, and visual rewards. All gamification state is persisted in `localStorage` alongside the existing session data, keeping the feature fully client-side with no backend changes required.

## Glossary

- **Gamification_Engine**: The client-side module responsible for computing XP, levels, streaks, and unlocking achievements based on study session data.
- **Study_Session**: A completed timer run recorded with a date and duration in minutes, as stored in `acadamiX_study_sessions`.
- **XP**: Experience Points — a numeric score awarded to the user upon completing a Study_Session.
- **Level**: A numeric rank derived from the user's cumulative XP, representing overall study progress.
- **Streak**: The count of consecutive calendar days on which the user completed at least one Study_Session.
- **Achievement**: A named badge unlocked when the user meets a specific, predefined condition related to study behaviour.
- **Reward_Popup**: The in-app modal displayed upon session completion that shows XP earned, level-up notifications, and newly unlocked Achievements.
- **Progress_Bar**: A visual indicator on the Study Timer page showing XP progress toward the next Level.
- **Gamification_Store**: The `localStorage` key `acadamiX_gamification` that persists XP total, level, streak data, and unlocked achievements.

---

## Requirements

### Requirement 1: XP Rewards for Completed Sessions

**User Story:** As a student, I want to earn XP points when I finish a study session, so that I feel rewarded for my effort.

#### Acceptance Criteria

1. WHEN a Study_Session is completed (timer reaches zero or user stops after ≥ 1 minute), THE Gamification_Engine SHALL award XP equal to `floor(session_minutes × 10)` points.
2. WHEN a Study_Session duration is less than 1 minute, THE Gamification_Engine SHALL award 0 XP for that session.
3. THE Gamification_Engine SHALL persist the updated cumulative XP total to the Gamification_Store immediately after each session.
4. WHEN the Gamification_Store is absent or corrupted, THE Gamification_Engine SHALL initialise a default state with XP = 0, Level = 1, Streak = 0, and an empty achievements list.

---

### Requirement 2: Level Progression

**User Story:** As a student, I want to level up as I accumulate XP, so that I can see my long-term study growth.

#### Acceptance Criteria

1. THE Gamification_Engine SHALL compute the user's Level using the formula `floor(1 + sqrt(total_xp / 100))`, where `total_xp` is the cumulative XP stored in the Gamification_Store.
2. WHEN the computed Level exceeds the previously stored Level, THE Gamification_Engine SHALL update the stored Level and set a `leveledUp` flag for the current session result.
3. THE Study_Timer_Page SHALL display the current Level and a Progress_Bar showing XP progress toward the next Level threshold at all times while the page is visible.
4. THE Progress_Bar SHALL display the percentage of XP accumulated toward the next level, calculated as `((total_xp - xp_for_current_level) / (xp_for_next_level - xp_for_current_level)) × 100`.

---

### Requirement 3: Daily Streak Tracking

**User Story:** As a student, I want to maintain a daily study streak, so that I am motivated to study every day.

#### Acceptance Criteria

1. WHEN a Study_Session is completed on a calendar date with no prior session recorded for that date, THE Gamification_Engine SHALL check whether the previous calendar day also had a completed session.
2. WHEN the previous calendar day had at least one completed session, THE Gamification_Engine SHALL increment the Streak counter by 1.
3. WHEN the previous calendar day had no completed session, THE Gamification_Engine SHALL reset the Streak counter to 1.
4. WHEN a Study_Session is completed on a calendar date that already has a recorded session, THE Gamification_Engine SHALL leave the Streak counter unchanged.
5. THE Study_Timer_Page SHALL display the current Streak count with a flame icon at all times while the page is visible.
6. WHEN the user opens the Study_Timer_Page and the last recorded session date is more than 1 calendar day before today, THE Gamification_Engine SHALL reset the Streak counter to 0 and persist the updated value to the Gamification_Store.

---

### Requirement 4: Achievements and Badges

**User Story:** As a student, I want to unlock achievements for reaching study milestones, so that I have specific goals to work toward.

#### Acceptance Criteria

1. THE Gamification_Engine SHALL evaluate the following Achievement conditions after every Study_Session completes:

   | Achievement ID       | Name                  | Condition                                              |
   |----------------------|-----------------------|--------------------------------------------------------|
   | `first_session`      | First Step            | Complete the first ever Study_Session                  |
   | `streak_3`           | On a Roll             | Reach a Streak of 3 consecutive days                   |
   | `streak_7`           | Week Warrior          | Reach a Streak of 7 consecutive days                   |
   | `streak_30`          | Monthly Master        | Reach a Streak of 30 consecutive days                  |
   | `total_60min`        | Hour Scholar          | Accumulate 60 total minutes across all sessions        |
   | `total_600min`       | Dedicated Learner     | Accumulate 600 total minutes across all sessions       |
   | `total_3000min`      | Study Legend          | Accumulate 3000 total minutes across all sessions      |
   | `single_60min`       | Deep Focus            | Complete a single session of ≥ 60 minutes              |
   | `level_5`            | Rising Star           | Reach Level 5                                          |
   | `level_10`           | Academic Pro          | Reach Level 10                                         |

2. WHEN an Achievement condition is met and the Achievement is not already in the unlocked list, THE Gamification_Engine SHALL add the Achievement to the unlocked list in the Gamification_Store and set a `newAchievements` list for the current session result.
3. WHEN an Achievement has already been unlocked, THE Gamification_Engine SHALL NOT unlock it again.
4. THE Study_Timer_Page SHALL display all unlocked Achievements as badge cards in a dedicated section, and all locked Achievements as greyed-out cards showing only the name and a lock icon.

---

### Requirement 5: Reward Popup on Session Completion

**User Story:** As a student, I want to see a celebratory popup when I finish a session, so that the reward feels immediate and satisfying.

#### Acceptance Criteria

1. WHEN a Study_Session completes, THE Reward_Popup SHALL display the XP earned in that session, the current Level, and the updated Streak count.
2. WHEN the `leveledUp` flag is set for the current session result, THE Reward_Popup SHALL display a level-up congratulation message including the new Level number.
3. WHEN the `newAchievements` list for the current session result is non-empty, THE Reward_Popup SHALL display each newly unlocked Achievement name and icon.
4. THE Reward_Popup SHALL replace the existing session-completion modal on the Study_Timer_Page.
5. WHEN the user clicks "Start New Session" or "Dismiss" on the Reward_Popup, THE Reward_Popup SHALL close and reset the timer display to the configured duration.

---

### Requirement 6: Persistent Gamification State

**User Story:** As a student, I want my XP, level, streak, and achievements to be saved between visits, so that my progress is never lost.

#### Acceptance Criteria

1. THE Gamification_Engine SHALL read the Gamification_Store from `localStorage` on every page load of the Study_Timer_Page.
2. THE Gamification_Engine SHALL write the updated Gamification_Store to `localStorage` after every state-changing operation (XP award, level update, streak update, achievement unlock).
3. IF the value stored at `acadamiX_gamification` cannot be parsed as valid JSON, THEN THE Gamification_Engine SHALL discard the corrupted value and initialise a fresh default state.
4. THE Gamification_Engine SHALL NOT modify the existing `acadamiX_study_sessions` key or its data format.

---

### Requirement 7: Gamification Stats Display

**User Story:** As a student, I want to see my XP, level, and streak at a glance on the Study Timer page, so that I always know where I stand.

#### Acceptance Criteria

1. THE Study_Timer_Page SHALL display a stats bar containing: current Level, total XP, current Streak, and total study minutes (derived from `acadamiX_study_sessions`).
2. THE Study_Timer_Page SHALL render the stats bar above the timer panel and chart panel at all times.
3. WHEN any gamification value changes (after a session completes), THE Study_Timer_Page SHALL re-render the stats bar with the updated values without requiring a page reload.
