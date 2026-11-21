/**
 * BrainPlay — Safe LocalStorage Layer
 * Handles defensive parsing, defaults, migration, and atomic updates.
 */

const STORAGE_KEY = 'brainplay_state_v1';

export function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekKey() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), 0, 1);
  const pastDays = Math.floor((now - firstDay) / 86400000);
  const weekNum = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function createDefaultState() {
  return {
    version: 1,
    user: {
      name: '',
      ageGroup: '',
      avatarColor: '#2563eb',
      createdAt: null,
    },
    progress: {
      xp: 0,
      completedGames: [], // unique game IDs completed at least once
      bestScores: {},     // { [gameId]: number }
      playCounts: {},     // { [gameId]: number }
      recentGames: [],    // [gameId, ...] newest first, max 12
      favorites: [],      // [gameId, ...]
      history: [],        // [{ id, gameId, score, xp, correct, wrong, duration, date, timestamp }]
      dailyActivity: {},  // { ['YYYY-MM-DD']: { games: number, xp: number, scoreSum: number } }
      dailyChallengeCompleted: {}, // { ['YYYY-MM-DD']: boolean }
      weeklyProgress: {}, // { ['YYYY-WXX']: number }
      streak: {
        current: 0,
        best: 0,
        lastActiveDate: null,
      },
    },
    achievements: {},     // { [achievementId]: { unlockedAt: ISOString } }
    settings: {
      theme: 'light',     // 'light' | 'dark'
      sound: true,        // boolean
    },
  };
}

function deepMergeDefaults(parsed) {
  const def = createDefaultState();
  if (!parsed || typeof parsed !== 'object') return def;

  return {
    version: 1,
    user: {
      ...def.user,
      ...(parsed.user && typeof parsed.user === 'object' ? parsed.user : {}),
    },
    progress: {
      ...def.progress,
      ...(parsed.progress && typeof parsed.progress === 'object' ? parsed.progress : {}),
      bestScores: {
        ...(parsed.progress?.bestScores && typeof parsed.progress.bestScores === 'object'
          ? parsed.progress.bestScores
          : {}),
      },
      playCounts: {
        ...(parsed.progress?.playCounts && typeof parsed.progress.playCounts === 'object'
          ? parsed.progress.playCounts
          : {}),
      },
      dailyActivity: {
        ...(parsed.progress?.dailyActivity && typeof parsed.progress.dailyActivity === 'object'
          ? parsed.progress.dailyActivity
          : {}),
      },
      dailyChallengeCompleted: {
        ...(parsed.progress?.dailyChallengeCompleted &&
        typeof parsed.progress.dailyChallengeCompleted === 'object'
          ? parsed.progress.dailyChallengeCompleted
          : {}),
      },
      weeklyProgress: {
        ...(parsed.progress?.weeklyProgress && typeof parsed.progress.weeklyProgress === 'object'
          ? parsed.progress.weeklyProgress
          : {}),
      },
      streak: {
        ...def.progress.streak,
        ...(parsed.progress?.streak && typeof parsed.progress.streak === 'object'
          ? parsed.progress.streak
          : {}),
      },
      completedGames: Array.isArray(parsed.progress?.completedGames)
        ? parsed.progress.completedGames
        : [],
      recentGames: Array.isArray(parsed.progress?.recentGames)
        ? parsed.progress.recentGames
        : [],
      favorites: Array.isArray(parsed.progress?.favorites)
        ? parsed.progress.favorites
        : [],
      history: Array.isArray(parsed.progress?.history)
        ? parsed.progress.history
        : [],
    },
    achievements:
      parsed.achievements && typeof parsed.achievements === 'object'
        ? { ...parsed.achievements }
        : {},
    settings: {
      ...def.settings,
      ...(parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {}),
    },
  };
}

export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw);
    return deepMergeDefaults(parsed);
  } catch {
    return createDefaultState();
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function updateState(mutator) {
  const current = loadState();
  const next = mutator(current) || current;
  saveState(next);
  return next;
}

export function resetAllData() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
  const fresh = createDefaultState();
  saveState(fresh);
  return fresh;
}

export function resetProgressOnly() {
  return updateState((state) => {
    const def = createDefaultState();
    state.progress = def.progress;
    state.achievements = {};
    return state;
  });
}
