import { shuffle, setFeedback } from '../helpers.js';

const SYMS = ['🌞', '🌙', '⭐', '☁️', '⚡', '🌈', '🔥', '❄️', '🍀', '🌸', '🍎', '💎', '🎈', '🎯', '🚀', '🦋'];

export default {
  init(container, engine) {
    let stage = 0;
    const totalStages = 2;

    const loadStage = () => {
      if (stage >= totalStages) {
        engine.finish('Kuzatuvchanligingiz ajoyib! Barcha farqlar topildi.');
        return;
      }
      const left = shuffle(SYMS).slice(0, 16);
      const diffIndices = shuffle([...Array(16).keys()]).slice(0, 4);
      const right = [...left];
      diffIndices.forEach((i) => {
        const alt = SYMS.find((s) => s !== left[i] && s !== right[i]) || '🦊';
        right[i] = alt === left[i] ? '🦊' : alt;
      });
      const found = new Set();

      const draw = () => {
        container.innerHTML = `
          <div class="game-round-header">
            <span class="mono">Bosqich ${stage + 1} / ${totalStages}</span>
            <span class="mono">Topilgan farqlar: ${found.size} / 4</span>
          </div>
          <h3 class="game-prompt">O‘ng jadvalda chapdagidan farq qiluvchi 4 ta katakchani bosing</h3>
          <div style="display:flex; gap:24px; flex-wrap:wrap; justify-content:center; align-items:center;">
            <div>
              <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:6px; text-align:center;">Asl rasm</div>
              <div class="board-grid" style="grid-template-columns: repeat(4, 52px);">
                ${left.map((s) => `<div class="board-cell" style="font-size:1.5rem;">${s}</div>`).join('')}
              </div>
            </div>
            <div>
              <div style="font-size:0.82rem; color:var(--accent-text); font-weight:600; margin-bottom:6px; text-align:center;">Farqlarni shu yerdan bosing</div>
              <div class="board-grid" style="grid-template-columns: repeat(4, 52px);">
                ${right
                  .map(
                    (s, i) => `
                  <button type="button" class="board-cell ${found.has(i) ? 'goal' : ''}" data-i="${i}" style="font-size:1.5rem;">
                    ${s}
                  </button>`
                  )
                  .join('')}
              </div>
            </div>
          </div>
          <div id="fb" class="game-feedback idle"></div>
        `;

        container.querySelectorAll('[data-i]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const i = Number(btn.getAttribute('data-i'));
            if (found.has(i)) return;
            if (diffIndices.includes(i)) {
              found.add(i);
              engine.addCorrect(120);
              draw();
              setFeedback(container.querySelector('#fb'), 'correct', `Topildi! (${found.size}/4)`);
              if (found.size === 4) {
                window.setTimeout(() => {
                  stage += 1;
                  loadStage();
                }, 700);
              }
            } else {
              engine.addWrong(15);
              setFeedback(container.querySelector('#fb'), 'wrong', 'Bu katakchalar bir xil.');
            }
          });
        });
      };

      draw();
    };

    loadStage();
  },
};
