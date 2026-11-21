/**
 * BrainPlay — Game Page Runner (game.html)
 * Validates onboarding, enforces selected age-group access, loads game module into GameEngine.
 */

import { updateState } from './storage.js';
import { AGE_GROUPS, requireOnboarding } from './user.js';
import { CATEGORIES, getGameById, renderGameIconSvg } from './catalog.js';
import { GameEngine } from './game-engine.js';
import { GAME_LOADERS } from './game-registry.js';
import { SoundFX } from './audio.js';

async function initGameRunner() {
  const state = requireOnboarding();
  if (!state) return;

  const params = new URLSearchParams(window.location.search);
  const gameId = params.get('id');
  const gameMeta = getGameById(gameId);

  const stage = document.getElementById('gameStage');
  const titleEl = document.getElementById('hudGameTitle');
  const subEl = document.getElementById('hudGameSub');
  const soundBtn = document.getElementById('hudSoundBtn');

  const syncSoundBtn = (enabled) => {
    if (!soundBtn) return;
    soundBtn.setAttribute('aria-pressed', String(enabled));
    soundBtn.title = enabled ? 'Ovoz yoqilgan' : 'Ovoz o‘chirilgan';
    soundBtn.innerHTML = enabled
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>';
  };

  syncSoundBtn(state.settings.sound !== false);
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const next = updateState((s) => {
        s.settings.sound = s.settings.sound === false;
        return s;
      });
      syncSoundBtn(next.settings.sound);
      if (next.settings.sound) SoundFX.click();
    });
  }

  if (!gameMeta || !GAME_LOADERS[gameMeta.id]) {
    if (titleEl) titleEl.textContent = 'O‘yin topilmadi';
    if (stage) {
      stage.innerHTML = `
        <div class="engine-screen">
          <div class="engine-screen-icon">${renderGameIconSvg('puzzle')}</div>
          <h2>O‘yin topilmadi</h2>
          <p>So‘ralgan o‘yin manzili noto‘g‘ri yoki mavjud emas.</p>
          <div class="engine-actions">
            <a href="./games.html" class="btn btn-primary btn-lg">Barcha o‘yinlarga o‘tish</a>
          </div>
        </div>
      `;
    }
    return;
  }

  // Enforce age-group access restriction for UX consistency
  if (gameMeta.ageGroup !== state.user.ageGroup) {
    const reqAge = AGE_GROUPS[gameMeta.ageGroup];
    const curAge = AGE_GROUPS[state.user.ageGroup];
    if (titleEl) titleEl.textContent = gameMeta.title;
    if (subEl) subEl.textContent = `Yosh cheklovi · ${reqAge.range}`;
    if (stage) {
      stage.innerHTML = `
        <div class="engine-screen">
          <div class="engine-screen-icon">${renderGameIconSvg('lock')}</div>
          <h2>Bu o‘yin boshqa yosh guruhi uchun</h2>
          <p>“${gameMeta.title}” o‘yini <strong>${reqAge.range} (${reqAge.title})</strong> guruhiga mo‘ljallangan. Sizning joriy profilingiz: <strong>${curAge.range}</strong>.</p>
          <div class="engine-actions">
            <a href="./games.html" class="btn btn-primary btn-lg">O‘z yosh guruhimdagi o‘yinlar</a>
            <a href="./settings.html" class="btn btn-secondary btn-lg">Sozlamalarda yoshni o‘zgartirish</a>
          </div>
        </div>
      `;
    }
    return;
  }

  document.title = `${gameMeta.title} — BrainPlay`;
  if (titleEl) titleEl.textContent = gameMeta.title;
  if (subEl) {
    const cat = CATEGORIES[gameMeta.category]?.label || gameMeta.category;
    subEl.textContent = `${AGE_GROUPS[gameMeta.ageGroup].range} · ${cat} · ${gameMeta.difficulty}`;
  }

  const engine = new GameEngine(gameMeta, {
    stage,
    scoreEl: document.getElementById('hudScore'),
    correctEl: document.getElementById('hudCorrect'),
    wrongEl: document.getElementById('hudWrong'),
    timerEl: document.getElementById('hudTimer'),
    bestEl: document.getElementById('hudBest'),
    pauseBtn: document.getElementById('hudPauseBtn'),
    restartBtn: document.getElementById('hudRestartBtn'),
    pauseOverlay: document.getElementById('pauseOverlay'),
    resumeBtn: document.getElementById('resumeGameBtn'),
    pauseRestartBtn: document.getElementById('pauseRestartBtn'),
  });

  try {
    const mod = await GAME_LOADERS[gameMeta.id]();
    engine.mount(mod.default || mod);
  } catch (err) {
    console.error(err);
    stage.innerHTML = `
      <div class="engine-screen">
        <h2>O‘yinni yuklashda xatolik yuz berdi</h2>
        <p>Sahifani qayta yuklang yoki boshqa o‘yinni tanlang.</p>
        <div class="engine-actions">
          <a href="./games.html" class="btn btn-primary">O‘yinlarga qaytish</a>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', initGameRunner);
