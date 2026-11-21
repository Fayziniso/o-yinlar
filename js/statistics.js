/**
 * BrainPlay — Statistics & SVG Analytics Controller (statistics.html)
 */

import { requireOnboarding, getLevelInfo } from './user.js';
import { CATEGORIES, getGameById, getGamesByAge } from './catalog.js';
import { escapeHtml, renderAppChrome } from './navigation.js';

function getLast7DaysKeys() {
  const days = [];
  const uzDays = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({ key, label: uzDays[d.getDay()], dayNum: d.getDate() });
  }
  return days;
}

function renderDailySvgChart(container, dailyActivity) {
  const days = getLast7DaysKeys();
  const data = days.map((d) => ({
    ...d,
    xp: dailyActivity[d.key]?.xp || 0,
    games: dailyActivity[d.key]?.games || 0,
  }));

  const maxXp = Math.max(100, ...data.map((d) => d.xp));
  const width = 620;
  const height = 220;
  const padTop = 26;
  const padBottom = 38;
  const padLeft = 40;
  const padRight = 18;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const slotW = chartW / data.length;
  const barW = Math.min(44, slotW * 0.56);

  const gridLines = [0, 0.25, 0.5, 0.75, 1]
    .map((ratio) => {
      const y = padTop + chartH * (1 - ratio);
      const val = Math.round(maxXp * ratio);
      return `
        <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="var(--border-hairline)" stroke-width="1" />
        <text x="${padLeft - 8}" y="${y + 4}" text-anchor="end" fill="var(--text-muted)" font-size="11" font-family="var(--font-mono)">${val}</text>
      `;
    })
    .join('');

  const bars = data
    .map((d, i) => {
      const x = padLeft + i * slotW + (slotW - barW) / 2;
      const barH = d.xp > 0 ? Math.max(8, (d.xp / maxXp) * chartH) : 3;
      const y = padTop + chartH - barH;
      return `
        <g>
          <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="6" fill="${d.xp > 0 ? 'var(--accent)' : 'var(--bg-subtle)'}" />
          ${d.xp > 0 ? `<text x="${x + barW / 2}" y="${y - 6}" text-anchor="middle" fill="var(--text-primary)" font-size="11" font-weight="700" font-family="var(--font-mono)">${d.xp}</text>` : ''}
          <text x="${x + barW / 2}" y="${height - 16}" text-anchor="middle" fill="var(--text-secondary)" font-size="11" font-weight="600">${d.label}</text>
          <text x="${x + barW / 2}" y="${height - 3}" text-anchor="middle" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)">${d.dayNum}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="230" role="img" aria-label="Oxirgi 7 kunlik XP grafigi">
      ${gridLines}
      ${bars}
    </svg>
  `;
}

function initStatisticsPage() {
  const state = requireOnboarding();
  if (!state) return;

  renderAppChrome('statistics');

  const history = state.progress.history || [];
  const totalPlayed = history.length;
  const ageGames = getGamesByAge(state.user.ageGroup);
  const completedCount = state.progress.completedGames.length;
  const totalXp = state.progress.xp || 0;
  const levelInfo = getLevelInfo(totalXp);

  const highestScore = history.reduce((m, h) => Math.max(m, h.score), 0);
  const avgScore =
    totalPlayed > 0
      ? Math.round(history.reduce((sum, h) => sum + h.score, 0) / totalPlayed)
      : 0;

  // Favorite category calculation
  const catCounts = { memory: 0, logic: 0, math: 0, speed: 0, strategy: 0 };
  for (const h of history) {
    const g = getGameById(h.gameId);
    const cat = h.category || g?.category;
    if (cat && catCounts[cat] !== undefined) {
      catCounts[cat] += 1;
    }
  }
  let favCatKey = null;
  let favCatMax = 0;
  for (const [k, v] of Object.entries(catCounts)) {
    if (v > favCatMax) {
      favCatMax = v;
      favCatKey = k;
    }
  }
  const favCategoryLabel = favCatKey ? CATEGORIES[favCatKey]?.label : 'Hali aniqlanmagan';

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText('statTotalPlayed', String(totalPlayed));
  setText('statCompleted', `${completedCount} ta`);
  setText('statTotalXp', `${totalXp} XP`);
  setText('statLevel', `${levelInfo.level}-daraja · ${levelInfo.name}`);
  setText('statHighestScore', `${highestScore}`);
  setText('statAvgScore', `${avgScore}`);
  setText('statFavCategory', favCategoryLabel);
  setText('statStreak', `${state.progress.streak.current || 0} kun (eng yaxshi: ${state.progress.streak.best || 0})`);

  // SVG Daily Progress Chart
  const chartMount = document.getElementById('dailyChartContainer');
  if (chartMount) {
    renderDailySvgChart(chartMount, state.progress.dailyActivity || {});
  }

  // Category Breakdown Bars
  const catBarsMount = document.getElementById('categoryBreakdown');
  if (catBarsMount) {
    const maxCat = Math.max(1, ...Object.values(catCounts));
    catBarsMount.innerHTML = Object.entries(catCounts)
      .map(([catKey, count]) => {
        const pct = Math.round((count / maxCat) * 100);
        return `
          <div class="cat-bar-item">
            <div class="cat-bar-head">
              <span>${escapeHtml(CATEGORIES[catKey]?.label || catKey)}</span>
              <strong class="tabular-nums">${count} marta</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${count > 0 ? Math.max(6, pct) : 0}%"></div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // Personal Best Records Table (Current Age Group)
  const recordsBody = document.getElementById('recordsTableBody');
  if (recordsBody) {
    const records = ageGames
      .map((g) => ({
        game: g,
        best: state.progress.bestScores[g.id] || 0,
        plays: state.progress.playCounts[g.id] || 0,
      }))
      .filter((r) => r.plays > 0)
      .sort((a, b) => b.best - a.best);

    if (!records.length) {
      recordsBody.innerHTML = `<tr><td colspan="4" style="color:var(--text-muted); text-align:center; padding:24px;">Hali shaxsiy rekordlar qayd etilmagan. Biror o‘yinni yakunlang!</td></tr>`;
    } else {
      recordsBody.innerHTML = records
        .map(
          (r) => `
          <tr>
            <td><a href="./game.html?id=${encodeURIComponent(r.game.id)}" style="font-weight:600;">${escapeHtml(r.game.title)}</a></td>
            <td>${escapeHtml(CATEGORIES[r.game.category]?.label || r.game.category)}</td>
            <td class="mono">${r.plays}</td>
            <td class="mono"><strong>${r.best}</strong></td>
          </tr>
        `
        )
        .join('');
    }
  }

  // Recent Activity Table
  const activityBody = document.getElementById('recentActivityBody');
  if (activityBody) {
    if (!history.length) {
      activityBody.innerHTML = `<tr><td colspan="5" style="color:var(--text-muted); text-align:center; padding:24px;">So‘nggi faoliyat tarixi bo‘sh.</td></tr>`;
    } else {
      activityBody.innerHTML = history
        .slice(0, 15)
        .map((h) => {
          const g = getGameById(h.gameId);
          const acc =
            h.correct + h.wrong > 0
              ? `${Math.round((h.correct / (h.correct + h.wrong)) * 100)}%`
              : '100%';
          return `
            <tr>
              <td><strong>${escapeHtml(g ? g.title : h.gameId)}</strong></td>
              <td class="mono">${h.score}</td>
              <td class="mono">+${h.xp} XP</td>
              <td class="mono">${acc}</td>
              <td class="mono">${escapeHtml(h.date)}</td>
            </tr>
          `;
        })
        .join('');
    }
  }
}

document.addEventListener('DOMContentLoaded', initStatisticsPage);
