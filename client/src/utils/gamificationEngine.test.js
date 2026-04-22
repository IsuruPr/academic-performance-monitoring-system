// Feature: study-timer-gamification
// Property-based and unit tests for gamificationEngine.js

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  computeXP,
  computeLevel,
  xpForLevel,
  computeProgress,
  updateStreak,
  checkStreakOnLoad,
  evaluateAchievements,
  processSession,
  loadState,
  saveState,
  DEFAULT_STATE,
} from './gamificationEngine.js';

// ─── localStorage mock ────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();

beforeEach(() => {
  localStorageMock.clear();
  vi.stubGlobal('localStorage', localStorageMock);
});

// ─── Property 1: XP formula correctness ──────────────────────────────────
// Feature: study-timer-gamification, Property 1: XP formula correctness
describe('Property 1 — XP formula correctness', () => {
  it('awards floor(minutes * 10) for sessions >= 1 min', () => {
    fc.assert(
      fc.property(fc.float({ min: 1, max: 300, noNaN: true }), (minutes) => {
        expect(computeXP(minutes)).toBe(Math.floor(minutes * 10));
      }),
      { numRuns: 100 }
    );
  });

  it('awards 0 XP for sessions < 1 minute', () => {
    fc.assert(
      fc.property(fc.float({ min: 0, max: Math.fround(0.999), noNaN: true }), (minutes) => {
        expect(computeXP(minutes)).toBe(0);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 2: XP persistence round-trip ───────────────────────────────
// Feature: study-timer-gamification, Property 2: XP persistence round-trip
describe('Property 2 — XP persistence round-trip', () => {
  it('persists prior_xp + earned_xp after processSession', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        fc.float({ min: 1, max: 300, noNaN: true }),
        (priorXP, sessionMin) => {
          localStorageMock.clear();
          // seed prior state
          localStorageMock.setItem('acadamiX_gamification', JSON.stringify({ ...DEFAULT_STATE, xp: priorXP }));
          localStorageMock.setItem('acadamiX_study_sessions', JSON.stringify([{ duration: sessionMin, date: '2025-01-01' }]));

          const result = processSession(sessionMin);
          const stored = JSON.parse(localStorageMock.getItem('acadamiX_gamification'));
          const expectedXP = priorXP + Math.floor(sessionMin * 10);

          expect(stored.xp).toBe(expectedXP);
          expect(result.totalXP).toBe(expectedXP);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 3: Level formula correctness ───────────────────────────────
// Feature: study-timer-gamification, Property 3: Level formula correctness
describe('Property 3 — Level formula correctness', () => {
  it('computeLevel matches floor(1 + sqrt(xp / 100))', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100000 }), (xp) => {
        expect(computeLevel(xp)).toBe(Math.floor(1 + Math.sqrt(xp / 100)));
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 4: Level-up detection and progress accuracy ────────────────
// Feature: study-timer-gamification, Property 4: Level-up detection and progress accuracy
describe('Property 4 — Level-up detection and progress accuracy', () => {
  it('computeProgress is always in [0, 100)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100000 }), (xp) => {
        const p = computeProgress(xp);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThan(100);
      }),
      { numRuns: 100 }
    );
  });

  it('leveledUp is true when XP crosses a level boundary', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 20 }), (level) => {
        const xpBefore = xpForLevel(level) - 10;
        const sessionMin = 15; // 150 XP, enough to cross boundary
        localStorageMock.clear();
        localStorageMock.setItem('acadamiX_gamification', JSON.stringify({ ...DEFAULT_STATE, xp: Math.max(0, xpBefore) }));
        localStorageMock.setItem('acadamiX_study_sessions', JSON.stringify([]));

        const result = processSession(sessionMin);
        const newLevel = computeLevel(result.totalXP);
        const oldLevel = computeLevel(Math.max(0, xpBefore));
        if (newLevel > oldLevel) {
          expect(result.leveledUp).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 5: Streak increment on consecutive days ────────────────────
// Feature: study-timer-gamification, Property 5: Streak increment on consecutive days
describe('Property 5 — Streak increment on consecutive days', () => {
  it('increments streak when session is on the next calendar day', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 365 }), (streak) => {
        const yesterday = '2025-01-14';
        const today = '2025-01-15';
        const state = { ...DEFAULT_STATE, streak, lastSessionDate: yesterday };
        const updated = updateStreak(state, today);
        expect(updated.streak).toBe(streak + 1);
        expect(updated.lastSessionDate).toBe(today);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 6: Streak reset on gap ─────────────────────────────────────
// Feature: study-timer-gamification, Property 6: Streak reset on gap
describe('Property 6 — Streak reset on gap', () => {
  it('resets streak to 1 when there is a gap of > 1 day', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 365 }), (streak) => {
        const twoDaysAgo = '2025-01-13';
        const today = '2025-01-15';
        const state = { ...DEFAULT_STATE, streak, lastSessionDate: twoDaysAgo };
        const updated = updateStreak(state, today);
        expect(updated.streak).toBe(1);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 7: Streak idempotence on same-day sessions ─────────────────
// Feature: study-timer-gamification, Property 7: Streak idempotence on same-day sessions
describe('Property 7 — Streak idempotence on same-day sessions', () => {
  it('leaves streak unchanged when session is on the same day', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 365 }), (streak) => {
        const today = '2025-01-15';
        const state = { ...DEFAULT_STATE, streak, lastSessionDate: today };
        const updated = updateStreak(state, today);
        expect(updated.streak).toBe(streak);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 8: Streak expiry on page load ──────────────────────────────
// Feature: study-timer-gamification, Property 8: Streak expiry on page load
describe('Property 8 — Streak expiry on page load', () => {
  it('resets streak to 0 when last session was > 1 day ago', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 365 }), (streak) => {
        localStorageMock.clear();
        // Use a date far in the past
        localStorageMock.setItem('acadamiX_gamification', JSON.stringify({
          ...DEFAULT_STATE,
          streak,
          lastSessionDate: '2020-01-01',
        }));
        const result = checkStreakOnLoad();
        expect(result.streak).toBe(0);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 9: Achievement unlock correctness and idempotence ──────────
// Feature: study-timer-gamification, Property 9: Achievement unlock correctness and idempotence
describe('Property 9 — Achievement idempotence', () => {
  it('each achievement appears at most once after repeated evaluations', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 0, max: 3000 }),
        (streak, totalMin) => {
          localStorageMock.clear();
          localStorageMock.setItem('acadamiX_study_sessions', JSON.stringify(
            Array.from({ length: Math.ceil(totalMin / 30) }, (_, i) => ({ duration: 30, date: `2025-01-${String(i + 1).padStart(2, '0')}` }))
          ));
          let state = { ...DEFAULT_STATE, streak, level: computeLevel(totalMin * 10) };
          const { state: s1 } = evaluateAchievements(state, 30);
          const { state: s2 } = evaluateAchievements(s1, 30);
          const ids = s2.unlockedAchievements;
          const unique = new Set(ids);
          expect(ids.length).toBe(unique.size);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 10: Sessions key isolation ─────────────────────────────────
// Feature: study-timer-gamification, Property 10: Sessions key isolation
describe('Property 10 — Sessions key isolation', () => {
  it('acadamiX_study_sessions is unchanged after gamification operations', () => {
    fc.assert(
      fc.property(fc.float({ min: 1, max: 120, noNaN: true }), (sessionMin) => {
        localStorageMock.clear();
        const sessions = [{ duration: 30, date: '2025-01-01' }];
        localStorageMock.setItem('acadamiX_study_sessions', JSON.stringify(sessions));
        const before = localStorageMock.getItem('acadamiX_study_sessions');

        processSession(sessionMin);

        const after = localStorageMock.getItem('acadamiX_study_sessions');
        expect(after).toBe(before);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Example-based unit tests ─────────────────────────────────────────────

describe('loadState', () => {
  it('returns DEFAULT_STATE when key is absent', () => {
    localStorageMock.clear();
    expect(loadState()).toEqual(DEFAULT_STATE);
  });

  it('returns DEFAULT_STATE when key contains invalid JSON', () => {
    localStorageMock.setItem('acadamiX_gamification', 'not-json');
    expect(loadState()).toEqual(DEFAULT_STATE);
  });
});

describe('computeXP edge cases', () => {
  it('processSession(0.5) awards 0 XP', () => {
    localStorageMock.clear();
    localStorageMock.setItem('acadamiX_study_sessions', '[]');
    const result = processSession(0.5);
    expect(result.xpEarned).toBe(0);
  });

  it('processSession(25) awards 250 XP', () => {
    localStorageMock.clear();
    localStorageMock.setItem('acadamiX_study_sessions', '[]');
    const result = processSession(25);
    expect(result.xpEarned).toBe(250);
  });
});

describe('computeLevel examples', () => {
  it('computeLevel(0) === 1', () => expect(computeLevel(0)).toBe(1));
  it('computeLevel(100) === 2', () => expect(computeLevel(100)).toBe(2));
  it('computeLevel(400) === 3', () => expect(computeLevel(400)).toBe(3));
});

describe('Achievement thresholds', () => {
  const makeState = (overrides) => ({ ...DEFAULT_STATE, ...overrides });

  it('first_session unlocks on first completed session', () => {
    localStorageMock.clear();
    localStorageMock.setItem('acadamiX_study_sessions', JSON.stringify([{ duration: 5, date: '2025-01-01' }]));
    const { newAchievements } = evaluateAchievements(makeState({}), 5);
    expect(newAchievements).toContain('first_session');
  });

  it('streak_3 unlocks at streak 3', () => {
    localStorageMock.clear();
    localStorageMock.setItem('acadamiX_study_sessions', '[]');
    const { newAchievements } = evaluateAchievements(makeState({ streak: 3 }), 5);
    expect(newAchievements).toContain('streak_3');
  });

  it('streak_7 unlocks at streak 7', () => {
    localStorageMock.clear();
    localStorageMock.setItem('acadamiX_study_sessions', '[]');
    const { newAchievements } = evaluateAchievements(makeState({ streak: 7 }), 5);
    expect(newAchievements).toContain('streak_7');
  });

  it('total_60min unlocks at 60 total minutes', () => {
    localStorageMock.clear();
    localStorageMock.setItem('acadamiX_study_sessions', JSON.stringify([{ duration: 60, date: '2025-01-01' }]));
    const { newAchievements } = evaluateAchievements(makeState({}), 5);
    expect(newAchievements).toContain('total_60min');
  });

  it('single_60min unlocks for a session >= 60 min', () => {
    localStorageMock.clear();
    localStorageMock.setItem('acadamiX_study_sessions', '[]');
    const { newAchievements } = evaluateAchievements(makeState({}), 60);
    expect(newAchievements).toContain('single_60min');
  });

  it('level_5 unlocks at level 5', () => {
    localStorageMock.clear();
    localStorageMock.setItem('acadamiX_study_sessions', '[]');
    const { newAchievements } = evaluateAchievements(makeState({ level: 5 }), 5);
    expect(newAchievements).toContain('level_5');
  });

  it('level_10 unlocks at level 10', () => {
    localStorageMock.clear();
    localStorageMock.setItem('acadamiX_study_sessions', '[]');
    const { newAchievements } = evaluateAchievements(makeState({ level: 10 }), 5);
    expect(newAchievements).toContain('level_10');
  });
});
