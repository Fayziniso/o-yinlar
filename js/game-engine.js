/**
 * BrainPlay — Reusable Vanilla JavaScript Game Engine
 * Provides standardized lifecycle, HUD, timer, pause/resume, feedback,
 * score & XP calculation, duplicate-submission prevention, and completion UI.
 */

import { SoundFX } from './audio.js';
import { loadState } from './storage.js';
import { CATEGORIES, renderGameIconSvg } from './catalog.js';
import { createSessionToken, recordGameResult } from './scoring.js';

export class GameEngine {
  constructor(gameMeta, dom) {
    this.game = gameMeta;
    this.dom = dom;
    this.state = 'START'; // 'START' | 'PLAYING' | 'PAUSED' | 'COMPLETED'
    this.score = 0;
    this.correct = 0;
    this.wrong = 0;
    this.combo = 0;
    this.elapsedSeconds = 0;
    this.timerId = null;
    this.sessionToken = null;
    this.submitted = false;
    this.activeCleanup = null;
    this.gameModule = null;
    this.customKeyHandler = null;

    this._bindHudControls();
  }

  _bindHudControls() {
    if (this.dom.pauseBtn) {
      this.dom.pauseBtn.addEventListener('click', () => {
        if (this.state === 'PLAYING') this.pause();
        else if (this.state === 'PAUSED') this.resume();
      });
    }
    if (this.dom.restartBtn) {
      this.dom.restartBtn.addEventListener('click', () => {
        if (this.state !== 'START') this.restart();
      });
    }
    if (this.dom.resumeBtn) {
      this.dom.resumeBtn.addEventListener('click', () => this.resume());
    }
    if (this.dom.pauseRestartBtn) {
      this.dom.pauseRestartBtn.addEventListener('click', () => this.restart());
    }
  }

  mount(gameModule) {
    this.gameModule = gameModule;
    this.renderStartScreen();
  }

  getBestScore() {
    const st = loadState();
    return st.progress.bestScores[this.game.id] || 0;
  }

  formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  updateHud() {
    if (this.dom.scoreEl) this.dom.scoreEl.textContent = String(this.score);
    if (this.dom.correctEl) this.dom.correctEl.textContent = String(this.correct);
    if (this.dom.wrongEl) this.dom.wrongEl.textContent = String(this.wrong);
    if (this.dom.timerEl) this.dom.timerEl.textContent = this.formatTime(this.elapsedSeconds);
    if (this.dom.bestEl) this.dom.bestEl.textContent = String(Math.max(this.getBestScore(), this.score));
  }

  _startTimer() {
    this._stopTimer();
    this.timerId = window.setInterval(() => {
      if (this.state === 'PLAYING') {
        this.elapsedSeconds += 1;
        if (this.dom.timerEl) {
          this.dom.timerEl.textContent = this.formatTime(this.elapsedSeconds);
        }
      }
    }, 1000);
  }

  _stopTimer() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  _cleanupActiveGame() {
    if (typeof this.activeCleanup === 'function') {
      try {
        this.activeCleanup();
      } catch {
        // ignore cleanup errors
      }
      this.activeCleanup = null;
    }
    if (this.customKeyHandler) {
      window.removeEventListener('keydown', this.customKeyHandler);
      this.customKeyHandler = null;
    }
  }

  onKeyDown(handler) {
    if (this.customKeyHandler) {
      window.removeEventListener('keydown', this.customKeyHandler);
    }
    this.customKeyHandler = (e) => {
      if (this.state !== 'PLAYING') return;
      handler(e);
    };
    window.addEventListener('keydown', this.customKeyHandler);
  }

  renderStartScreen() {
    this._stopTimer();
    this._cleanupActiveGame();
    this.state = 'START';
    this.score = 0;
    this.correct = 0;
    this.wrong = 0;
    this.combo = 0;
    this.elapsedSeconds = 0;
    this.submitted = false;
    this.updateHud();

    if (this.dom.pauseOverlay) this.dom.pauseOverlay.hidden = true;
    if (this.dom.pauseBtn) this.dom.pauseBtn.disabled = true;
    if (this.dom.restartBtn) this.dom.restartBtn.disabled = true;

    const best = this.getBestScore();
    const catLabel = CATEGORIES[this.game.category]?.label || this.game.category;

    this.dom.stage.innerHTML = `
      <div class="engine-screen">
        <div class="engine-screen-icon">${renderGameIconSvg(this.game.icon)}</div>
        <h2>${this.game.title}</h2>
        <p>${this.game.description}</p>
        <div class="engine-instruction-box">
          <strong>Qanday o‘ynaladi:</strong>
          <span>${this.game.instructions}</span>
          <span>Yo‘nalish: ${catLabel} · Daraja: ${this.game.difficulty} · Rekordingiz: ${best} ball</span>
        </div>
        <div class="engine-actions">
          <button type="button" class="btn btn-primary btn-lg" id="engineStartBtn">O‘yinni boshlash</button>
          <a href="./games.html" class="btn btn-secondary btn-lg">O‘yinlarga qaytish</a>
        </div>
      </div>
    `;

    const startBtn = this.dom.stage.querySelector('#engineStartBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        SoundFX.click();
        this.start();
      });
    }
  }

  start() {
    this._cleanupActiveGame();
    this.state = 'PLAYING';
    this.score = 0;
    this.correct = 0;
    this.wrong = 0;
    this.combo = 0;
    this.elapsedSeconds = 0;
    this.submitted = false;
    this.sessionToken = createSessionToken(this.game.id);

    if (this.dom.pauseOverlay) this.dom.pauseOverlay.hidden = true;
    if (this.dom.pauseBtn) this.dom.pauseBtn.disabled = false;
    if (this.dom.restartBtn) this.dom.restartBtn.disabled = false;

    this.updateHud();
    this._startTimer();

    this.dom.stage.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'game-play-area';
    this.dom.stage.appendChild(container);

    if (this.gameModule && typeof this.gameModule.init === 'function') {
      const cleanup = this.gameModule.init(container, this);
      if (typeof cleanup === 'function') {
        this.activeCleanup = cleanup;
      }
    }
  }

  restart() {
    SoundFX.click();
    this.start();
  }

  pause() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    if (this.dom.pauseOverlay) this.dom.pauseOverlay.hidden = false;
    if (this.dom.pauseBtn) this.dom.pauseBtn.setAttribute('aria-pressed', 'true');
  }

  resume() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    if (this.dom.pauseOverlay) this.dom.pauseOverlay.hidden = true;
    if (this.dom.pauseBtn) this.dom.pauseBtn.setAttribute('aria-pressed', 'false');
  }

  addCorrect(points = 100) {
    if (this.state !== 'PLAYING') return 0;
    this.correct += 1;
    this.combo += 1;
    const comboBonus = this.combo >= 3 ? Math.min(50, (this.combo - 2) * 15) : 0;
    const gained = Math.round(points + comboBonus);
    this.score += gained;
    SoundFX.correct();
    this.updateHud();
    return gained;
  }

  addWrong(penalty = 20) {
    if (this.state !== 'PLAYING') return;
    this.wrong += 1;
    this.combo = 0;
    this.score = Math.max(0, this.score - penalty);
    SoundFX.wrong();
    this.updateHud();
  }

  addBonus(points) {
    if (this.state !== 'PLAYING') return;
    this.score = Math.max(0, this.score + Math.round(points));
    this.updateHud();
  }

  /**
   * Completes the game, saves result once (anti-duplicate), and displays summary screen.
   */
  finish(customSummary = '') {
    if (this.submitted || this.state === 'COMPLETED') return;
    this.submitted = true;
    this.state = 'COMPLETED';
    this._stopTimer();
    this._cleanupActiveGame();

    if (this.dom.pauseOverlay) this.dom.pauseOverlay.hidden = true;
    if (this.dom.pauseBtn) this.dom.pauseBtn.disabled = true;

    const result = recordGameResult({
      sessionToken: this.sessionToken,
      gameId: this.game.id,
      score: this.score,
      correct: this.correct,
      wrong: this.wrong,
      duration: Math.max(1, this.elapsedSeconds),
    });

    if (result.levelUp) {
      SoundFX.levelUp();
    } else {
      SoundFX.win();
    }

    this.updateHud();

    const accuracy =
      this.correct + this.wrong > 0
        ? Math.round((this.correct / (this.correct + this.wrong)) * 100)
        : 100;

    const achievementsHtml =
      result.newlyUnlocked && result.newlyUnlocked.length > 0
        ? `<div class="engine-instruction-box">
            <strong>Yangi yutuqlar ochildi:</strong>
            <span>${result.newlyUnlocked.map((a) => `${a.title} — ${a.description}`).join(' · ')}</span>
          </div>`
        : '';

    const notices = [];
    if (result.isNewBest) notices.push('Yangi shaxsiy rekord!');
    if (result.isDailyBonus) notices.push('Kunlik topshiriq bajarildi (+50 XP)');
    if (result.levelUp) notices.push(`Yangi daraja: ${result.levelInfo.name}!`);

    this.dom.stage.innerHTML = `
      <div class="engine-screen">
        <div class="engine-screen-icon">${renderGameIconSvg('crown')}</div>
        <h2>Barakalla! O‘yin yakunlandi</h2>
        <p>${customSummary || 'Ajoyib harakat! Natijangiz saqlandi va tajriba ballingiz oshdi.'}</p>
        ${notices.length ? `<p style="color: var(--accent-text); font-weight: 600;">${notices.join(' · ')}</p>` : ''}
        <div class="engine-stats-grid">
          <div class="engine-stat-cell">
            <span>Jami ball</span>
            <strong class="tabular-nums">${this.score}</strong>
          </div>
          <div class="engine-stat-cell">
            <span>Olingan XP</span>
            <strong class="tabular-nums">+${result.earnedXp || 0}</strong>
          </div>
          <div class="engine-stat-cell">
            <span>Aniqlik</span>
            <strong class="tabular-nums">${accuracy}%</strong>
          </div>
          <div class="engine-stat-cell">
            <span>Vaqt</span>
            <strong class="tabular-nums">${this.formatTime(this.elapsedSeconds)}</strong>
          </div>
        </div>
        ${achievementsHtml}
        <div class="engine-actions">
          <button type="button" class="btn btn-primary btn-lg" id="engineReplayBtn">Qayta o‘ynash</button>
          <a href="./games.html" class="btn btn-secondary btn-lg">Boshqa o‘yinlar</a>
          <a href="./dashboard.html" class="btn btn-ghost btn-lg">Bosh sahifa</a>
        </div>
      </div>
    `;

    const replayBtn = this.dom.stage.querySelector('#engineReplayBtn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        SoundFX.click();
        this.start();
      });
    }
  }
}
