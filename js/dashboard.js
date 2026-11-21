/**
 * BrainPlay — Dashboard Controller
 */

import { getTodayKey, loadState } from './storage.js';
import { AGE_GROUPS, getLevelInfo, requireOnboarding } from './user.js';
import { CATEGORIES, getDailyChallengeGame, getGameById, getGamesByAge } from './catalog.js';
import { getWeeklyChallengeStatus } from './scoring.js';
import {
  bindFavoriteButtons,
  createGameCardHtml,
  escapeHtml,
  renderAppChrome,
} from './navigation.js';

function initDashboard() {
  const state = requireOnboarding();
  if (!state) return;

  renderAppChrome('dashboard');

  const ageGroup = state.user.ageGroup;
  const ageInfo = AGE_GROUPS[ageGroup];
  const ageGames = getGamesByAge(ageGroup);
  const levelInfo = getLevelInfo(state.progress.xp);
  const dailyGame = getDailyChallengeGame(ageGroup);
  const todayKey = getTodayKey();
  const isDailyDone = Boolean(state.progress.dailyChallengeCompleted[todayKey]);
  const weekly = getWeeklyChallengeStatus(state);

  // Welcome panel
  const welcomeName = document.getElementById('welcomeHeading');
  const welcomeKicker = document.getElementById('welcomeKicker');
  const levelLabel = document.getElementById('dashLevelLabel');
  const xpRemaining = document.getElementById('dashXpRemaining');
  const xpBar = document.getElementById('dashXpBar');

  if (welcomeKicker) {
    welcomeKicker.textContent = `${ageInfo.range} · ${ageInfo.title}`;
  }
  if (welcomeName) {
    welcomeName.textContent = `Xush kelibsiz, ${state.user.name}!`;
  }
  if (levelLabel) {
    levelLabel.innerHTML = `<strong>${levelInfo.level}-daraja: ${escapeHtml(levelInfo.name)}</strong>`;
  }
  if (xpRemaining) {
    xpRemaining.textContent = levelInfo.nextLevel
      ? `Keyingi darajagacha ${levelInfo.xpNeededForNext} XP`
      : 'Maksimal darajaga yetdingiz!';
  }
  if (xpBar) {
    xpBar.style.width = `${levelInfo.progressPercent}%`;
  }

  // Daily Challenge Card
  const dailyBg = document.getElementById('dailyChallengeBg');
  const dailyTitle = document.getElementById('dailyChallengeTitle');
  const dailyDesc = document.getElementById('dailyChallengeDesc');
  const dailyStatus = document.getElementById('dailyChallengeStatus');
  const dailyLink = document.getElementById('dailyChallengeLink');

  if (dailyBg) dailyBg.src = ageInfo.image;
  if (dailyTitle) dailyTitle.textContent = dailyGame.title;
  if (dailyDesc) dailyDesc.textContent = dailyGame.description;
  if (dailyStatus) {
    dailyStatus.textContent = isDailyDone
      ? 'Bugungi topshiriq bajarildi (+50 XP olindi)'
      : 'Mukofot: +50 bonus XP';
  }
  if (dailyLink) {
    dailyLink.href = `./game.html?id=${encodeURIComponent(dailyGame.id)}`;
    dailyLink.textContent = isDailyDone ? 'Yana o‘ynash' : 'Sinovni boshlash';
  }

  // 4-Column KPI Row
  const completedInGroup = ageGames.filter((g) => state.progress.completedGames.includes(g.id)).length;
  const totalSessions = state.progress.history.length;
  const bestStreak = state.progress.streak.current || 0;
  const unlockedCount = Object.keys(state.achievements || {}).length;

  const setKpi = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setKpi('kpiXp', `${state.progress.xp} XP`);
  setKpi('kpiCompleted', `${completedInGroup} / ${ageGames.length}`);
  setKpi('kpiStreak', `${bestStreak} kun`);
  setKpi('kpiSessions', `${totalSessions}`);
  setKpi('kpiUnlockedSub', `${unlockedCount} ta yutuq ochilgan`);

  // Weekly Challenge Strip
  const weeklyText = document.getElementById('weeklyChallengeText');
  const weeklyBar = document.getElementById('weeklyChallengeBar');
  if (weeklyText) {
    weeklyText.textContent = weekly.completed
      ? `Haftalik maqsad bajarildi (${weekly.done}/${weekly.target})`
      : `${weekly.done} / ${weekly.target} o‘yin yakunlandi`;
  }
  if (weeklyBar) {
    weeklyBar.style.width = `${weekly.percent}%`;
  }

  // Recommended Games (prioritize uncompleted games first)
  const recGrid = document.getElementById('recommendedGrid');
  if (recGrid) {
    const unplayed = ageGames.filter((g) => !state.progress.completedGames.includes(g.id));
    const recommended = [...unplayed, ...ageGames].slice(0, 6);
    recGrid.innerHTML = recommended.map((g) => createGameCardHtml(g, state)).join('');
    bindFavoriteButtons(recGrid);
  }

  // Recently Played Games
  const recentSection = document.getElementById('recentSection');
  const recentGrid = document.getElementById('recentGrid');
  if (recentGrid && recentSection) {
    const recentGames = state.progress.recentGames
      .map((id) => getGameById(id))
      .filter((g) => g && g.ageGroup === ageGroup)
      .slice(0, 3);

    if (recentGames.length === 0) {
      recentGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3>Hali o‘yin o‘ynalmadi</h3>
          <p>Birinchi o‘yinni boshlang — so‘nggi o‘ynagan o‘yinlaringiz shu yerda ko‘rinadi.</p>
        </div>
      `;
    } else {
      recentGrid.innerHTML = recentGames.map((g) => createGameCardHtml(g, state)).join('');
      bindFavoriteButtons(recentGrid);
    }
  }

  // Popular Games
  const popularGrid = document.getElementById('popularGrid');
  if (popularGrid) {
    const popular = ageGames.filter((g) => g.popular).slice(0, 6);
    popularGrid.innerHTML = popular.map((g) => createGameCardHtml(g, state)).join('');
    bindFavoriteButtons(popularGrid);
  }

  // Interactive Category Explorer
  const catTabs = document.getElementById('dashboardCategoryTabs');
  const catGrid = document.getElementById('categoryPreviewGrid');
  if (catTabs && catGrid) {
    let activeCat = 'all';

    const renderCategoryView = () => {
      const freshState = loadState();
      const filtered =
        activeCat === 'all' ? ageGames : ageGames.filter((g) => g.category === activeCat);
      catGrid.innerHTML = filtered
        .slice(0, 6)
        .map((g) => createGameCardHtml(g, freshState))
        .join('');
    };

    catTabs.innerHTML = Object.values(CATEGORIES)
      .map(
        (c) =>
          `<button type="button" class="cat-tab ${c.id === activeCat ? 'active' : ''}" data-cat="${c.id}">${c.label}</button>`
      )
      .join('');

    catTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      activeCat = btn.getAttribute('data-cat');
      catTabs.querySelectorAll('.cat-tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderCategoryView();
    });

    bindFavoriteButtons(catGrid);
    renderCategoryView();
  }
}

document.addEventListener('DOMContentLoaded', initDashboard);
