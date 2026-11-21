/**
 * BrainPlay — Shared Sidebar, Header, Live Search, Game Cards & Toasts
 */

import { loadState, updateState } from './storage.js';
import {
  AGE_GROUPS,
  applyThemeAndAge,
  getInitials,
  getLevelInfo,
  toggleFavoriteGame,
} from './user.js';
import { CATEGORIES, getGamesByAge, getThumbPalette, renderGameIconSvg } from './catalog.js';
import { SoundFX } from './audio.js';

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function showToast(message, variant = 'default') {
  let region = document.getElementById('toastRegion');
  if (!region) {
    region = document.createElement('div');
    region.id = 'toastRegion';
    region.className = 'toast-region';
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
  }
  const el = document.createElement('div');
  el.className = `toast ${variant === 'success' ? 'toast-success' : variant === 'danger' ? 'toast-danger' : ''}`;
  el.textContent = message;
  region.appendChild(el);
  window.setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    window.setTimeout(() => el.remove(), 220);
  }, 2800);
}

const NAV_ICONS = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  all: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  memory: '<path d="M12 2a4 4 0 0 0-4 4v1H6a2 2 0 0 0-2 2v2a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V9a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4Z"/><path d="M9 15v5"/><path d="M15 15v5"/>',
  logic: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/>',
  math: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
  speed: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  strategy: '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>',
  stats: '<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>',
  achievements: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
};

function iconSvg(key) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NAV_ICONS[key] || ''}</svg>`;
}

export function renderAppChrome(activeKey) {
  const state = loadState();
  applyThemeAndAge(state);

  const ageInfo = AGE_GROUPS[state.user.ageGroup] || AGE_GROUPS['6-9'];
  const levelInfo = getLevelInfo(state.progress.xp);
  const initials = getInitials(state.user.name);
  const isDark = state.settings.theme === 'dark';

  const sidebarMount = document.getElementById('appSidebar');
  const topbarMount = document.getElementById('appTopbar');

  if (sidebarMount) {
    const links = [
      { key: 'dashboard', href: './dashboard.html', label: 'Bosh sahifa', icon: 'home', group: 'Asosiy' },
      { key: 'all', href: './games.html', label: 'Barcha o‘yinlar', icon: 'all', group: 'O‘yinlar' },
      { key: 'memory', href: './games.html?category=memory', label: 'Xotira o‘yinlari', icon: 'memory', group: 'O‘yinlar' },
      { key: 'logic', href: './games.html?category=logic', label: 'Mantiqiy o‘yinlar', icon: 'logic', group: 'O‘yinlar' },
      { key: 'math', href: './games.html?category=math', label: 'Matematik o‘yinlar', icon: 'math', group: 'O‘yinlar' },
      { key: 'speed', href: './games.html?category=speed', label: 'Tezkor fikrlash', icon: 'speed', group: 'O‘yinlar' },
      { key: 'strategy', href: './games.html?category=strategy', label: 'Strategiya', icon: 'strategy', group: 'O‘yinlar' },
      { key: 'statistics', href: './statistics.html', label: 'Natijalarim', icon: 'stats', group: 'Shaxsiy' },
      { key: 'achievements', href: './achievements.html', label: 'Yutuqlarim', icon: 'achievements', group: 'Shaxsiy' },
      { key: 'settings', href: './settings.html', label: 'Sozlamalar', icon: 'settings', group: 'Shaxsiy' },
    ];

    let navHtml = '';
    let lastGroup = '';
    for (const item of links) {
      if (item.group !== lastGroup) {
        navHtml += `<div class="sidebar-section-label">${item.group}</div>`;
        lastGroup = item.group;
      }
      const cls = activeKey === item.key ? 'nav-item active' : 'nav-item';
      navHtml += `<a class="${cls}" href="${item.href}">${iconSvg(item.icon)}<span>${item.label}</span></a>`;
    }

    sidebarMount.innerHTML = `
      <div class="sidebar-header">
        <a href="./dashboard.html" class="brand-link">
          <span class="brand-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 0-4 4v1H6a2 2 0 0 0-2 2v2a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V9a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4Z"/><path d="M9 15v5"/><path d="M15 15v5"/></svg>
          </span>
          <span>BrainPlay</span>
        </a>
        <button type="button" class="sidebar-close-btn" id="sidebarCloseBtn" aria-label="Menyuni yopish">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <nav class="sidebar-nav" aria-label="Asosiy navigatsiya">${navHtml}</nav>
      <div class="sidebar-footer">
        <div class="sidebar-age-card">
          <div class="sidebar-age-info">
            <strong>${escapeHtml(ageInfo.range)}</strong>
            <span>${escapeHtml(ageInfo.title)}</span>
          </div>
          <a href="./age-selection.html" class="btn btn-secondary btn-sm">Almashtirish</a>
        </div>
      </div>
    `;
  }

  if (topbarMount) {
    topbarMount.innerHTML = `
      <div class="topbar-left" style="flex:1;">
        <button type="button" class="menu-toggle-btn" id="menuToggleBtn" aria-label="Menyuni ochish">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="search" id="globalSearchInput" class="search-input" placeholder="O‘yinlarni qidirish..." autocomplete="off" aria-label="O‘yinlarni qidirish" />
          <div id="globalSearchDropdown" class="search-dropdown" hidden></div>
        </div>
      </div>
      <div class="topbar-right">
        <div class="user-progress-inline">
          <span>Daraja <strong class="tabular-nums">${levelInfo.level}</strong> · ${escapeHtml(levelInfo.name)}</span>
          <span aria-hidden="true">/</span>
          <strong class="mono">${state.progress.xp} XP</strong>
        </div>
        <button type="button" class="icon-btn" id="quickThemeToggle" aria-label="${isDark ? 'Yorug‘ rejimga o‘tish' : 'Tungi rejimga o‘tish'}" title="${isDark ? 'Yorug‘ rejim' : 'Tungi rejim'}">
          ${
            isDark
              ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>'
              : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'
          }
        </button>
        <a href="./settings.html" class="user-profile-link" aria-label="Profil va sozlamalar">
          <div class="user-avatar" style="background:${escapeHtml(state.user.avatarColor || 'var(--accent)')}">${escapeHtml(initials)}</div>
          <div class="user-meta-text">
            <strong>${escapeHtml(state.user.name)}</strong>
            <span>${escapeHtml(ageInfo.range)}</span>
          </div>
        </a>
      </div>
    `;
  }

  // Mobile sidebar drawer wiring
  const sidebarEl = document.getElementById('appSidebar');
  const overlayEl = document.getElementById('sidebarOverlay');
  const openBtn = document.getElementById('menuToggleBtn');
  const closeBtn = document.getElementById('sidebarCloseBtn');

  const closeDrawer = () => {
    if (sidebarEl) sidebarEl.classList.remove('open');
    if (overlayEl) overlayEl.classList.remove('open');
  };

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      if (sidebarEl) sidebarEl.classList.add('open');
      if (overlayEl) overlayEl.classList.add('open');
    });
  }
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlayEl) overlayEl.addEventListener('click', closeDrawer);

  // Quick theme toggle
  const themeBtn = document.getElementById('quickThemeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      SoundFX.click();
      const updated = updateState((s) => {
        s.settings.theme = s.settings.theme === 'dark' ? 'light' : 'dark';
        return s;
      });
      applyThemeAndAge(updated);
      renderAppChrome(activeKey);
    });
  }

  // Global live search
  const searchInput = document.getElementById('globalSearchInput');
  const dropdown = document.getElementById('globalSearchDropdown');
  if (searchInput && dropdown) {
    const ageGames = getGamesByAge(state.user.ageGroup);

    const renderMatches = (query) => {
      const q = query.trim().toLowerCase();
      if (!q) {
        dropdown.hidden = true;
        return;
      }
      const matches = ageGames.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          (CATEGORIES[g.category]?.label || '').toLowerCase().includes(q)
      );
      if (!matches.length) {
        dropdown.innerHTML = `<div class="search-result-item"><span class="search-result-meta">“${escapeHtml(query)}” bo‘yicha o‘yin topilmadi</span></div>`;
      } else {
        dropdown.innerHTML = matches
          .slice(0, 6)
          .map(
            (g) => `
            <a class="search-result-item" href="./game.html?id=${encodeURIComponent(g.id)}">
              <div>
                <div class="search-result-title">${escapeHtml(g.title)}</div>
                <div class="search-result-meta">${escapeHtml(CATEGORIES[g.category]?.label || g.category)} · ${escapeHtml(g.difficulty)}</div>
              </div>
              <span class="section-link">O‘ynash</span>
            </a>`
          )
          .join('');
      }
      dropdown.hidden = false;
    };

    searchInput.addEventListener('input', (e) => renderMatches(e.target.value));
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = `./games.html?q=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.hidden = true;
      }
    });
  }
}

/**
 * Renders a reusable interactive game card with favorite toggle and best score.
 */
export function createGameCardHtml(game, state) {
  const best = state.progress.bestScores[game.id] || 0;
  const isCompleted = state.progress.completedGames.includes(game.id);
  const isFav = state.progress.favorites.includes(game.id);
  const catLabel = CATEGORIES[game.category]?.label || game.category;
  const palette = getThumbPalette(game.category);

  return `
    <article class="game-card" data-game-id="${escapeHtml(game.id)}">
      <div class="game-card-thumb" style="--thumb-bg: ${palette.bg}; --thumb-ink: ${palette.ink};">
        <div class="game-card-thumb-pattern"></div>
        <div class="game-card-glyph">${renderGameIconSvg(game.icon)}</div>
        <button type="button" class="fav-toggle-btn ${isFav ? 'active' : ''}" data-fav-id="${escapeHtml(game.id)}" aria-label="${isFav ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo‘shish'}" title="${isFav ? 'Sevimlilarda' : 'Sevimlilarga qo‘shish'}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
      </div>
      <div class="game-card-body">
        <div class="game-card-meta">
          <span>${escapeHtml(catLabel)}</span>
          <span aria-hidden="true">·</span>
          <span>${escapeHtml(game.difficulty)}</span>
          <span aria-hidden="true">·</span>
          <span>${escapeHtml(game.estimatedTime)}</span>
        </div>
        <h3 class="game-card-title">${escapeHtml(game.title)}</h3>
        <p class="game-card-desc">${escapeHtml(game.description)}</p>
        <div class="game-card-footer">
          <div class="game-card-score">
            ${isCompleted ? `Rekord: <strong class="tabular-nums">${best}</strong>` : 'Hali o‘ynalmagan'}
          </div>
          <a href="./game.html?id=${encodeURIComponent(game.id)}" class="btn btn-primary btn-sm">O‘ynash</a>
        </div>
      </div>
    </article>
  `;
}

export function bindFavoriteButtons(rootEl, onChange) {
  if (!rootEl) return;
  rootEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-fav-id]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const id = btn.getAttribute('data-fav-id');
    const next = toggleFavoriteGame(id);
    const active = next.progress.favorites.includes(id);
    SoundFX.click();
    btn.classList.toggle('active', active);
    const svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', active ? 'currentColor' : 'none');
    showToast(active ? 'Sevimli o‘yinlarga qo‘shildi' : 'Sevimlilardan olib tashlandi');
    if (typeof onChange === 'function') onChange(next);
  });
}
