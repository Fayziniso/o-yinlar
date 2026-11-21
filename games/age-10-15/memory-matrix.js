import { shuffle, setFeedback } from '../helpers.js';

const ROUNDS = [
  { size: 3, count: 3 },
  { size: 3, count: 4 },
  { size: 4, count: 5 },
  { size: 4, count: 6 },
  { size: 5, count: 7 },
];

export default {
  init(container, engine) {
    let idx = 0;
    let timer = null;

    const loadRound = () => {
      if (idx >= ROUNDS.length) {
        engine.finish('Memory Matrix ning barcha 5 darajasidan o‘tdingiz!');
        return;
      }
      const cfg = ROUNDS[idx];
      const totalCells = cfg.size * cfg.size;
      const targets = new Set(shuffle([...Array(totalCells).keys()]).slice(0, cfg.count));
      const picked = new Set();
      let phase = 'memorize';

      const draw = () => {
        container.innerHTML = `
          <div class="game-round-header">
            <span class="mono">Daraja ${idx + 1} / ${ROUNDS.length} (${cfg.size}x${cfg.size})</span>
            <span>${phase === 'memorize' ? 'Katakchalarni eslab qoling...' : `Toping: ${picked.size} / ${cfg.count}`}</span>
          </div>
          <div class="board-grid" style="grid-template-columns: repeat(${cfg.size}, 56px);">
            ${Array.from({ length: totalCells }, (_, i) => {
              const lit = phase === 'memorize' ? targets.has(i) : picked.has(i);
              return `<button type="button" class="board-cell ${lit ? 'lit' : ''}" data-i="${i}" style="width:56px; height:56px;" ${phase === 'memorize' ? 'disabled' : ''}></button>`;
            }).join('')}
          </div>
          <div id="fb" class="game-feedback idle"></div>
        `;

        if (phase === 'recall') {
          container.querySelectorAll('[data-i]').forEach((btn) => {
            btn.addEventListener('click', () => {
              const i = Number(btn.getAttribute('data-i'));
              if (picked.has(i)) return;
              if (targets.has(i)) {
                picked.add(i);
                engine.addCorrect(45);
                draw();
                if (picked.size === cfg.count) {
                  engine.addBonus(100);
                  setFeedback(container.querySelector('#fb'), 'correct', 'Matritsa xotiradan aniq tiklandi!');
                  window.setTimeout(() => {
                    idx += 1;
                    loadRound();
                  }, 700);
                }
              } else {
                engine.addWrong(25);
                btn.style.background = 'var(--danger-soft)';
                setFeedback(container.querySelector('#fb'), 'wrong', 'Bu katakcha yonmagan edi!');
              }
            });
          });
        }
      };

      draw();
      timer = window.setTimeout(() => {
        phase = 'recall';
        draw();
      }, 2100);
    };

    loadRound();
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  },
};
