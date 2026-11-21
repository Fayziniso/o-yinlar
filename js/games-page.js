/**
 * BrainPlay — Games Library Controller (games.html)
 */

import { loadState } from './storage.js';
import { AGE_GROUPS, requireOnboarding } from './user.js';
import { CATEGORIES, getGamesByAge } from './catalog.js';
import {
  bindFavoriteButtons,
  createGameCardHtml,
  renderAppChrome,
} from './navigation.js';

function initGamesPage() {
  const initialState = requireOnboarding();
  if (!initialState) return;

  const params = new URLSearchParams(window.location.search);
  let activeCategory = params.get('category') || 'all';
  if (!CATEGORIES[activeCategory]) activeCategory = 'all';
  let searchQuery = params.get('q') || '';
  let onlyFavorites = false;
  let sortMode = 'default';

  renderAppChrome(activeCategory);

  const ageGroup = initialState.user.ageGroup;
  const ageInfo = AGE_GROUPS[ageGroup];
  const ageGames = getGamesByAge(ageGroup);

  const headingEl = document.getElementById('gamesPageTitle');
  const subtitleEl = document.getElementById('gamesPageSubtitle');
  const tabsEl = document.getElementById('gamesCategoryTabs');
  const searchEl = document.getElementById('catalogSearchInput');
  const favFilterBtn = document.getElementById('favFilterBtn');
  const sortSelect = document.getElementById('gamesSortSelect');
  const gridEl = document.getElementById('catalogGamesGrid');
  const countEl = document.getElementById('gamesCountLabel');

  if (headingEl) headingEl.textContent = `${ageInfo.range} — ${ageInfo.title} o‘yinlari`;
  if (subtitleEl) {
    subtitleEl.textContent = `Sizning yosh guruhingiz uchun maxsus saralangan ${ageGames.length} ta to‘liq ishlaydigan intellektual o‘yin.`;
  }
  if (searchEl && searchQuery) {
    searchEl.value = searchQuery;
  }

  if (tabsEl) {
    tabsEl.innerHTML = Object.values(CATEGORIES)
      .map(
        (c) =>
          `<button type="button" class="cat-tab ${c.id === activeCategory ? 'active' : ''}" data-cat="${c.id}">${c.label}</button>`
      )
      .join('');
  }

  const renderGrid = () => {
    const state = loadState();
    let list = [...ageGames];

    if (activeCategory !== 'all') {
      list = list.filter((g) => g.category === activeCategory);
    }

    if (onlyFavorites) {
      list = list.filter((g) => state.progress.favorites.includes(g.id));
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          (CATEGORIES[g.category]?.label || '').toLowerCase().includes(q)
      );
    }

    if (sortMode === 'best') {
      list.sort(
        (a, b) => (state.progress.bestScores[b.id] || 0) - (state.progress.bestScores[a.id] || 0)
      );
    } else if (sortMode === 'popular') {
      list.sort((a, b) => Number(b.popular) - Number(a.popular));
    } else if (sortMode === 'alpha') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (countEl) {
      countEl.textContent = `${list.length} ta o‘yin ko‘rsatilmoqda`;
    }

    if (!gridEl) return;

    if (list.length === 0) {
      gridEl.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3>Mos o‘yin topilmadi</h3>
          <p>Qidiruv so‘zini yoki filtrlarni o‘zgartirib ko‘ring.</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = list.map((g) => createGameCardHtml(g, state)).join('');
  };

  if (tabsEl) {
    tabsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      activeCategory = btn.getAttribute('data-cat');
      tabsEl.querySelectorAll('.cat-tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid();
    });
  }

  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderGrid();
    });
  }

  if (favFilterBtn) {
    favFilterBtn.addEventListener('click', () => {
      onlyFavorites = !onlyFavorites;
      favFilterBtn.classList.toggle('active', onlyFavorites);
      favFilterBtn.setAttribute('aria-pressed', String(onlyFavorites));
      renderGrid();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortMode = e.target.value;
      renderGrid();
    });
  }

  bindFavoriteButtons(gridEl, () => {
    if (onlyFavorites) renderGrid();
  });

  renderGrid();
}

document.addEventListener('DOMContentLoaded', initGamesPage);
