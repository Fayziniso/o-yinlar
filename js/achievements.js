/**
 * BrainPlay — Achievements Page Controller (achievements.html)
 */

import { requireOnboarding } from './user.js';
import { ACHIEVEMENT_DEFS } from './scoring.js';
import { escapeHtml, renderAppChrome } from './navigation.js';

function initAchievementsPage() {
  const state = requireOnboarding();
  if (!state) return;

  renderAppChrome('achievements');

  const summaryEl = document.getElementById('achievementsSummary');
  const filterTabs = document.getElementById('achievementFilterTabs');
  const gridEl = document.getElementById('achievementsGrid');

  let filter = 'all'; // 'all' | 'unlocked' | 'locked'

  const render = () => {
    const unlockedMap = state.achievements || {};
    const unlockedCount = ACHIEVEMENT_DEFS.filter((d) => Boolean(unlockedMap[d.id])).length;

    if (summaryEl) {
      summaryEl.textContent = `${unlockedCount} / ${ACHIEVEMENT_DEFS.length} ta yutuq qo‘lga kiritildi. Barcha yutuqlar haqiqiy o‘yin natijalari orqali ochiladi.`;
    }

    const list = ACHIEVEMENT_DEFS.filter((def) => {
      const isUnlocked = Boolean(unlockedMap[def.id]);
      if (filter === 'unlocked') return isUnlocked;
      if (filter === 'locked') return !isUnlocked;
      return true;
    });

    if (!gridEl) return;

    if (!list.length) {
      gridEl.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3>Bu bo‘limda hozircha yutuqlar yo‘q</h3>
          <p>O‘yinlarni o‘ynab, yangi yutuqlarni oching!</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = list
      .map((def) => {
        const record = unlockedMap[def.id];
        const unlocked = Boolean(record);
        const [cur, max] = def.progress(state);
        const pct = Math.min(100, Math.round((cur / Math.max(1, max)) * 100));
        const dateLabel = unlocked
          ? new Date(record.unlockedAt).toLocaleDateString('uz-UZ')
          : 'Ochilmagan';

        return `
          <article class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-top">
              <div class="achievement-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  ${
                    unlocked
                      ? '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>'
                      : '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
                  }
                </svg>
              </div>
              <div>
                <h3>${escapeHtml(def.title)}</h3>
                <div class="achievement-meta">${escapeHtml(def.category)} · ${escapeHtml(dateLabel)}</div>
              </div>
            </div>
            <p class="achievement-desc">${escapeHtml(def.description)}</p>
            <div class="xp-progress-block">
              <div class="xp-progress-labels">
                <span>Jarayon</span>
                <strong class="mono">${cur} / ${max}</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width:${unlocked ? 100 : pct}%"></div>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  };

  if (filterTabs) {
    filterTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      filter = btn.getAttribute('data-filter');
      filterTabs.querySelectorAll('.cat-tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  }

  render();
}

document.addEventListener('DOMContentLoaded', initAchievementsPage);
