/**
 * BrainPlay — Centralized Scoring, XP, Streaks & Achievements Engine
 */

import { getTodayKey, getWeekKey, loadState, updateState } from './storage.js';
import { getDailyChallengeGame, getGameById, getGamesByAge } from './catalog.js';
import { getLevelInfo } from './user.js';

export const ACHIEVEMENT_DEFS = [
  {
    id: 'first-step',
    title: 'Ilk qadam',
    description: 'Birinchi o‘yinni muvaffaqiyatli yakunlang.',
    category: 'Boshlang‘ich',
    check: (s) => s.progress.history.length >= 1,
    progress: (s) => [Math.min(1, s.progress.history.length), 1],
  },
  {
    id: 'five-games',
    title: 'Faol o‘yinchi',
    description: 'Jami 5 marta o‘yin o‘ynang.',
    category: 'Faollik',
    check: (s) => s.progress.history.length >= 5,
    progress: (s) => [Math.min(5, s.progress.history.length), 5],
  },
  {
    id: 'fifteen-games',
    title: 'Bilim ishqibozi',
    description: 'Jami 15 marta o‘yin yakunlang.',
    category: 'Faollik',
    check: (s) => s.progress.history.length >= 15,
    progress: (s) => [Math.min(15, s.progress.history.length), 15],
  },
  {
    id: 'perfect-accuracy',
    title: 'Xatosiz natija',
    description: 'Istalgan o‘yinni birorta ham xato qilmasdan yakunlang.',
    category: 'Mahorat',
    check: (s) => s.progress.history.some((h) => h.wrong === 0 && h.correct >= 3),
    progress: (s) => [s.progress.history.some((h) => h.wrong === 0 && h.correct >= 3) ? 1 : 0, 1],
  },
  {
    id: 'high-scorer',
    title: 'Rekordchi',
    description: 'Bitta o‘yinda 800 balldan yuqori natija qayd eting.',
    category: 'Mahorat',
    check: (s) => s.progress.history.some((h) => h.score >= 800),
    progress: (s) => {
      const max = s.progress.history.reduce((m, h) => Math.max(m, h.score), 0);
      return [Math.min(800, max), 800];
    },
  },
  {
    id: 'speed-demon',
    title: 'Chaqmoq tezligi',
    description: 'O‘yinni 45 soniyadan tezroq va kamida 70% aniqlikda yakunlang.',
    category: 'Tezlik',
    check: (s) =>
      s.progress.history.some((h) => h.duration > 0 && h.duration <= 45 && h.correct > h.wrong),
    progress: (s) => [
      s.progress.history.some((h) => h.duration > 0 && h.duration <= 45 && h.correct > h.wrong)
        ? 1
        : 0,
      1,
    ],
  },
  {
    id: 'explorer-5',
    title: 'Kashfiyotchi',
    description: '5 ta har xil o‘yinni yakunlang.',
    category: 'Kolleksiya',
    check: (s) => s.progress.completedGames.length >= 5,
    progress: (s) => [Math.min(5, s.progress.completedGames.length), 5],
  },
  {
    id: 'age-master',
    title: 'Yosh guruhi ustasi',
    description: 'O‘z yosh guruhingizdagi barcha 15 ta o‘yinni yakunlang.',
    category: 'Kolleksiya',
    check: (s) => {
      const groupIds = getGamesByAge(s.user.ageGroup).map((g) => g.id);
      return groupIds.length > 0 && groupIds.every((id) => s.progress.completedGames.includes(id));
    },
    progress: (s) => {
      const groupIds = getGamesByAge(s.user.ageGroup).map((g) => g.id);
      const count = groupIds.filter((id) => s.progress.completedGames.includes(id)).length;
      return [count, groupIds.length || 15];
    },
  },
  {
    id: 'daily-hero',
    title: 'Kunlik chempion',
    description: 'Kunlik topshiriqni muvaffaqiyatli bajaring.',
    category: 'Chaqiruv',
    check: (s) => Object.values(s.progress.dailyChallengeCompleted || {}).some(Boolean),
    progress: (s) => [
      Object.values(s.progress.dailyChallengeCompleted || {}).some(Boolean) ? 1 : 0,
      1,
    ],
  },
  {
    id: 'streak-3',
    title: 'Barqaror ritm',
    description: 'Ketma-ket 3 kun BrainPlay da shug‘ullaning.',
    category: 'Intizom',
    check: (s) => (s.progress.streak?.best || 0) >= 3,
    progress: (s) => [Math.min(3, s.progress.streak?.best || 0), 3],
  },
  {
    id: 'xp-500',
    title: '500 XP marrasi',
    description: 'Jami 500 XP tajriba ballini to‘plang.',
    category: 'Daraja',
    check: (s) => (s.progress.xp || 0) >= 500,
    progress: (s) => [Math.min(500, s.progress.xp || 0), 500],
  },
  {
    id: 'xp-1500',
    title: 'Daho darajasi',
    description: 'Jami 1500 XP tajriba balliga erishing.',
    category: 'Daraja',
    check: (s) => (s.progress.xp || 0) >= 1500,
    progress: (s) => [Math.min(1500, s.progress.xp || 0), 1500],
  },
];

// Session tokens to strictly prevent duplicate score submissions
const submittedSessions = new Set();

export function createSessionToken(gameId) {
  return `${gameId}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function calculateSessionXp({ score, correct, wrong, duration, isDailyBonus }) {
  const accuracy = correct + wrong > 0 ? correct / (correct + wrong) : 1;
  const baseXp = Math.max(20, Math.round(score * 0.12));
  const accuracyBonus = accuracy === 1 && correct >= 3 ? 25 : Math.round(accuracy * 15);
  const speedBonus = duration > 0 && duration <= 60 ? 10 : 0;
  const dailyBonus = isDailyBonus ? 50 : 0;
  return baseXp + accuracyBonus + speedBonus + dailyBonus;
}

function updateStreak(streak, todayKey) {
  const prev = streak.lastActiveDate;
  if (prev === todayKey) return streak;

  const today = new Date(`${todayKey}T00:00:00`);
  let nextCurrent = 1;
  if (prev) {
    const prevDate = new Date(`${prev}T00:00:00`);
    const diffDays = Math.round((today - prevDate) / 86400000);
    if (diffDays === 1) {
      nextCurrent = (streak.current || 0) + 1;
    }
  }

  return {
    current: nextCurrent,
    best: Math.max(streak.best || 0, nextCurrent),
    lastActiveDate: todayKey,
  };
}

/**
 * Records a completed game session once per sessionToken.
 * Returns summary with earned XP, best score flag, levelUp flag, and newly unlocked achievements.
 */
export function recordGameResult({
  sessionToken,
  gameId,
  score,
  correct,
  wrong,
  duration,
}) {
  if (!sessionToken || submittedSessions.has(sessionToken)) {
    return { duplicate: true };
  }
  submittedSessions.add(sessionToken);

  const game = getGameById(gameId);
  if (!game) return { error: 'O‘yin topilmadi' };

  const todayKey = getTodayKey();
  const weekKey = getWeekKey();

  const beforeState = loadState();
  const prevLevel = getLevelInfo(beforeState.progress.xp).level;
  const dailyGame = getDailyChallengeGame(beforeState.user.ageGroup);
  const isDailyFirstTime =
    dailyGame &&
    dailyGame.id === gameId &&
    !beforeState.progress.dailyChallengeCompleted[todayKey];

  const cleanScore = Math.max(0, Math.round(score || 0));
  const earnedXp = calculateSessionXp({
    score: cleanScore,
    correct: Math.max(0, correct || 0),
    wrong: Math.max(0, wrong || 0),
    duration: Math.max(1, Math.round(duration || 1)),
    isDailyBonus: isDailyFirstTime,
  });

  let isNewBest = false;
  let newlyUnlocked = [];
  let nextLevelInfo = null;

  updateState((state) => {
    const p = state.progress;

    p.xp += earnedXp;

    if (!p.completedGames.includes(gameId)) {
      p.completedGames.push(gameId);
    }

    const prevBest = p.bestScores[gameId] || 0;
    if (cleanScore > prevBest) {
      p.bestScores[gameId] = cleanScore;
      isNewBest = true;
    }

    p.playCounts[gameId] = (p.playCounts[gameId] || 0) + 1;

    p.recentGames = [gameId, ...p.recentGames.filter((id) => id !== gameId)].slice(0, 12);

    p.history.unshift({
      id: sessionToken,
      gameId,
      category: game.category,
      score: cleanScore,
      xp: earnedXp,
      correct: Math.max(0, correct || 0),
      wrong: Math.max(0, wrong || 0),
      duration: Math.max(1, Math.round(duration || 1)),
      date: todayKey,
      timestamp: new Date().toISOString(),
    });
    if (p.history.length > 200) {
      p.history = p.history.slice(0, 200);
    }

    const dayRec = p.dailyActivity[todayKey] || { games: 0, xp: 0, scoreSum: 0 };
    dayRec.games += 1;
    dayRec.xp += earnedXp;
    dayRec.scoreSum += cleanScore;
    p.dailyActivity[todayKey] = dayRec;

    if (isDailyFirstTime) {
      p.dailyChallengeCompleted[todayKey] = true;
    }

    p.weeklyProgress[weekKey] = (p.weeklyProgress[weekKey] || 0) + 1;
    p.streak = updateStreak(p.streak, todayKey);

    // Evaluate achievements
    for (const def of ACHIEVEMENT_DEFS) {
      if (!state.achievements[def.id] && def.check(state)) {
        state.achievements[def.id] = {
          unlockedAt: new Date().toISOString(),
        };
        newlyUnlocked.push(def);
      }
    }

    nextLevelInfo = getLevelInfo(p.xp);
    return state;
  });

  return {
    duplicate: false,
    score: cleanScore,
    earnedXp,
    isNewBest,
    isDailyBonus: isDailyFirstTime,
    levelUp: nextLevelInfo && nextLevelInfo.level > prevLevel,
    levelInfo: nextLevelInfo,
    newlyUnlocked,
  };
}

export function getWeeklyChallengeStatus(state = loadState()) {
  const weekKey = getWeekKey();
  const target = 7;
  const done = Math.min(target, state.progress.weeklyProgress[weekKey] || 0);
  return {
    done,
    target,
    completed: done >= target,
    percent: Math.round((done / target) * 100),
  };
}
