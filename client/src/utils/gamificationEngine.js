// Gamification Engine — pure utility module for Study Timer gamification
// Feature: study-timer-gamification

const STORE_KEY = 'acadamiX_gamification';

export const DEFAULT_STATE = {
  xp: 0,
  level: 1,
  streak: 0,
  lastSessionDate: null,
  unlockedAchievements: [],
};

/** Load gamification state from localStorage. Returns DEFAULT_STATE on missing or corrupt data. */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

/** Persist gamification state to localStorage. */
export function saveState(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // silently swallow storage quota errors; in-memory state remains correct
  }
}

/** Pure: compute XP earned for a session. 0 if duration < 1 minute. */
export function computeXP(sessionMinutes) {
  if (!sessionMinutes || isNaN(sessionMinutes) || sessionMinutes < 1) return 0;
  return Math.floor(sessionMinutes * 10);
}

/** Pure: compute level from cumulative XP. */
export function computeLevel(totalXP) {
  if (!totalXP || isNaN(totalXP) || totalXP < 0) return 1;
  return Math.floor(1 + Math.sqrt(totalXP / 100));
}

/** Pure: compute minimum XP required to reach a given level. */
export function xpForLevel(level) {
  return (level - 1) * (level - 1) * 100;
}

/** Pure: compute progress percentage (0–100) toward the next level. */
export function computeProgress(totalXP) {
  const currentLevel = computeLevel(totalXP);
  const nextLevel = currentLevel + 1;
  const xpCurrent = xpForLevel(currentLevel);
  const xpNext = xpForLevel(nextLevel);
  if (xpNext === xpCurrent) return 0;
  const progress = ((totalXP - xpCurrent) / (xpNext - xpCurrent)) * 100;
  return Math.min(Math.max(progress, 0), 99.99);
}

// ─── Achievement Definitions ───────────────────────────────────────────────

export const ACHIEVEMENTS = [
  { id: 'first_session', name: 'First Step',       icon: '🎯', condition: (s, _min, totalMin) => totalMin >= 0 && s.unlockedAchievements.length === 0 || true, check: (s) => !s.unlockedAchievements.includes('first_session') },
  { id: 'streak_3',      name: 'On a Roll',         icon: '🔥', check: (s) => s.streak >= 3  },
  { id: 'streak_7',      name: 'Week Warrior',      icon: '⚔️',  check: (s) => s.streak >= 7  },
  { id: 'streak_30',     name: 'Monthly Master',    icon: '👑',  check: (s) => s.streak >= 30 },
  { id: 'total_60min',   name: 'Hour Scholar',      icon: '📚',  check: (s, _min, totalMin) => totalMin >= 60   },
  { id: 'total_600min',  name: 'Dedicated Learner', icon: '🎓',  check: (s, _min, totalMin) => totalMin >= 600  },
  { id: 'total_3000min', name: 'Study Legend',      icon: '🏆',  check: (s, _min, totalMin) => totalMin >= 3000 },
  { id: 'single_60min',  name: 'Deep Focus',        icon: '🧠',  check: (s, sessionMin) => sessionMin >= 60    },
  { id: 'level_5',       name: 'Rising Star',       icon: '⭐',  check: (s) => s.level >= 5  },
  { id: 'level_10',      name: 'Academic Pro',      icon: '💎',  check: (s) => s.level >= 10 },
];

// ─── Streak Logic ──────────────────────────────────────────────────────────

/** Helper: get ISO date string "YYYY-MM-DD" for a Date object. */
function toDateStr(date) {
  return date.toISOString().slice(0, 10);
}

/** Helper: difference in calendar days between two ISO date strings. */
function dayDiff(dateStrA, dateStrB) {
  const a = new Date(dateStrA + 'T00:00:00Z');
  const b = new Date(dateStrB + 'T00:00:00Z');
  return Math.round((b - a) / 86400000);
}

/**
 * Pure: update streak given current state and today's ISO date string.
 * - Same day as lastSessionDate → unchanged
 * - Previous day → increment
 * - Any other gap → reset to 1
 */
export function updateStreak(state, todayDate) {
  const { lastSessionDate, streak } = state;
  if (!lastSessionDate) {
    return { ...state, streak: 1, lastSessionDate: todayDate };
  }
  const diff = dayDiff(lastSessionDate, todayDate);
  if (diff === 0) return { ...state }; // same day, no change
  if (diff === 1) return { ...state, streak: streak + 1, lastSessionDate: todayDate };
  return { ...state, streak: 1, lastSessionDate: todayDate };
}

/**
 * Called on page load: resets streak to 0 if last session was > 1 day ago.
 * Reads, updates, and persists state; returns updated state.
 */
export function checkStreakOnLoad() {
  const state = loadState();
  if (!state.lastSessionDate) return state;
  const today = toDateStr(new Date());
  const diff = dayDiff(state.lastSessionDate, today);
  if (diff > 1) {
    const updated = { ...state, streak: 0 };
    saveState(updated);
    return updated;
  }
  return state;
}

// ─── Achievement Logic ─────────────────────────────────────────────────────

/**
 * Pure: evaluate all achievement conditions.
 * Returns { state: updatedState, newAchievements: string[] }.
 */
export function evaluateAchievements(state, sessionMinutes) {
  const sessions = (() => {
    try {
      return JSON.parse(localStorage.getItem('acadamiX_study_sessions') || '[]');
    } catch { return []; }
  })();
  const totalMin = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  const newAchievements = [];
  let updated = { ...state, unlockedAchievements: [...state.unlockedAchievements] };

  for (const ach of ACHIEVEMENTS) {
    if (updated.unlockedAchievements.includes(ach.id)) continue;
    let met = false;
    if (ach.id === 'first_session') {
      met = true; // first completed session always unlocks this
    } else {
      met = ach.check(updated, sessionMinutes, totalMin);
    }
    if (met) {
      updated.unlockedAchievements.push(ach.id);
      newAchievements.push(ach.id);
    }
  }

  return { state: updated, newAchievements };
}

// ─── Main Entry Point ──────────────────────────────────────────────────────

/**
 * Called after a study session completes.
 * Orchestrates: loadState → computeXP → updateStreak → evaluateAchievements → level check → saveState.
 * Returns a SessionResult object.
 */
export function processSession(sessionMinutes) {
  let state = loadState();
  const today = toDateStr(new Date());

  // XP
  const xpEarned = computeXP(sessionMinutes);
  state = { ...state, xp: state.xp + xpEarned };

  // Streak
  state = updateStreak(state, today);

  // Level
  const newLevel = computeLevel(state.xp);
  const leveledUp = newLevel > state.level;
  state = { ...state, level: newLevel };

  // Achievements
  const { state: stateAfterAch, newAchievements } = evaluateAchievements(state, sessionMinutes);
  state = stateAfterAch;

  saveState(state);

  return {
    xpEarned,
    totalXP: state.xp,
    level: state.level,
    streak: state.streak,
    leveledUp,
    newAchievements,
  };
}
