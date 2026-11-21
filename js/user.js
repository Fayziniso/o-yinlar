/**
 * BrainPlay — User Profile, Age Groups, Levels & Access Guards
 */

import { loadState, updateState } from './storage.js';

export const AGE_GROUPS = {
  '3-5': {
    id: '3-5',
    range: '3–5 yosh',
    title: 'Kichkintoylar',
    description: 'Ranglar, shakllar, hayvonlar va ilk mantiqiy qadamlar uchun quvnoq o‘yinlar.',
    image: '/src/assets/images/age_3_5_kids_1795235523332.jpg',
    accent: '#ea580c',
  },
  '6-9': {
    id: '6-9',
    range: '6–9 yosh',
    title: 'Yosh bilimdonlar',
    description: 'Matematik poygalar, labirintlar, so‘z o‘yinlari va qiziqarli mantiqiy jumboqlar.',
    image: '/src/assets/images/age_6_9_explorers_1795235524147.jpg',
    accent: '#059669',
  },
  '10-15': {
    id: '10-15',
    range: '10–15 yosh',
    title: 'Yosh daholar',
    description: 'Sudoku, shaxmat masalalari, ikkilik sanoq, algoritmlar va tezkor fikrlash sinovlari.',
    image: '/src/assets/images/age_10_15_geniuses_1795235523983.jpg',
    accent: '#4338ca',
  },
  '16-20': {
    id: '16-20',
    range: '16–20 yosh',
    title: 'Intellektual liderlar',
    description: 'Kriptografiya, ehtimollik nazariyasi, dasturlash mantig‘i va strategik qarorlar.',
    image: '/src/assets/images/age_16_20_leaders_1795235524105.jpg',
    accent: '#1e3a8a',
  },
};

export const LEVELS = [
  { level: 1, name: 'Yangi boshlovchi', minXp: 0 },
  { level: 2, name: 'Izlanuvchi', minXp: 150 },
  { level: 3, name: 'Bilimdon', minXp: 400 },
  { level: 4, name: 'Zukko', minXp: 800 },
  { level: 5, name: 'Daho', minXp: 1400 },
  { level: 6, name: 'Intellektual usta', minXp: 2200 },
  { level: 7, name: 'BrainPlay afsonasi', minXp: 3500 },
];

export function getLevelInfo(xp = 0) {
  let current = LEVELS[0];
  let next = LEVELS[1];

  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }

  if (!next) {
    return {
      ...current,
      nextLevel: null,
      xpIntoLevel: xp - current.minXp,
      xpNeededForNext: 0,
      progressPercent: 100,
    };
  }

  const span = next.minXp - current.minXp;
  const gained = xp - current.minXp;
  const pct = Math.min(100, Math.max(0, Math.round((gained / span) * 100)));

  return {
    ...current,
    nextLevel: next,
    xpIntoLevel: gained,
    xpNeededForNext: next.minXp - xp,
    progressPercent: pct,
  };
}

export function isValidAgeGroup(ageGroup) {
  return Boolean(ageGroup && AGE_GROUPS[ageGroup]);
}

export function isOnboardingComplete(state = loadState()) {
  return Boolean(
    state.user &&
      isValidAgeGroup(state.user.ageGroup) &&
      typeof state.user.name === 'string' &&
      state.user.name.trim().length >= 2
  );
}

export function applyThemeAndAge(state = loadState()) {
  const html = document.documentElement;
  const theme = state.settings?.theme === 'dark' ? 'dark' : 'light';
  html.setAttribute('data-theme', theme);
  if (isValidAgeGroup(state.user?.ageGroup)) {
    html.setAttribute('data-age', state.user.ageGroup);
  } else {
    html.removeAttribute('data-age');
  }
}

export function setAgeGroup(ageGroup) {
  if (!isValidAgeGroup(ageGroup)) return null;
  const next = updateState((state) => {
    state.user.ageGroup = ageGroup;
    return state;
  });
  applyThemeAndAge(next);
  return next;
}

export function setUserProfile(name, avatarColor) {
  const cleanName = String(name || '').trim().slice(0, 32);
  if (cleanName.length < 2) return null;
  return updateState((state) => {
    state.user.name = cleanName;
    if (avatarColor) state.user.avatarColor = avatarColor;
    if (!state.user.createdAt) {
      state.user.createdAt = new Date().toISOString();
    }
    return state;
  });
}

export function toggleFavoriteGame(gameId) {
  return updateState((state) => {
    const idx = state.progress.favorites.indexOf(gameId);
    if (idx >= 0) {
      state.progress.favorites.splice(idx, 1);
    } else {
      state.progress.favorites.unshift(gameId);
    }
    return state;
  });
}

/**
 * Protects dashboard/games/statistics/achievements/settings pages
 * from incomplete onboarding.
 */
export function requireOnboarding() {
  const state = loadState();
  applyThemeAndAge(state);
  if (!isValidAgeGroup(state.user.ageGroup)) {
    window.location.replace('./age-selection.html');
    return null;
  }
  if (!state.user.name || state.user.name.trim().length < 2) {
    window.location.replace('./registration.html');
    return null;
  }
  return state;
}

export function getInitials(name) {
  const clean = String(name || 'B').trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}
