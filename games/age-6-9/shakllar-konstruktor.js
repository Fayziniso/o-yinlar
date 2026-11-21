import { setFeedback } from '../helpers.js';

const BLUEPRINTS = [
  {
    name: 'Plyus belgisi',
    cells: [0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0],
  },
  {
    name: 'Zinapoya',
    cells: [1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1],
  },
  {
    name: 'Romba',
    cells: [0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0],
  },
  {
    name: 'Shaxmat naqshi',
    cells: [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1],
  },
];

export default {
  init(container, engine) {
    let idx = 0;

    const load = () => {
      if (idx >= BLUEPRINTS.length) {
        engine.finish('Barcha konstruktor shakllarini aniq yaratdingiz!');
        return;
      }
      const bp = BLUEPRINTS[idx];
      const user = Array(16).fill(0);

      const draw = () => {
        container.innerHTML = `
          <div class="game-round-header">
            <span class="mono">Shakl ${idx + 1} / ${BLUEPRINTS.length}</span>
            <span>${bp.name}</span>
          </div>
          <h3 class="game-prompt">Chapdagi namunani o‘ngdagi maydonda qayta yasang</h3>
          <div style="display:flex; gap:28px; flex-wrap:wrap; justify-content:center; align-items:center;">
            <div>
              <div style="font-size:0.82rem; color:var(--text-muted); text-align:center; margin-bottom:6px;">Namuna</div>
              <div class="board-grid" style="grid-template-columns: repeat(4, 48px);">
                ${bp.cells.map((v) => `<div class="board-cell ${v ? 'lit' : ''}" style="width:48px; height:48px;"></div>`).join('')}
              </div>
            </div>
            <div>
              <div style="font-size:0.82rem; color:var(--accent-text); font-weight:600; text-align:center; margin-bottom:6px;">Sizning maydoningiz</div>
              <div class="board-grid" style="grid-template-columns: repeat(4, 48px);">
                ${user
                  .map(
                    (v, i) => `<button type="button" class="board-cell ${v ? 'lit' : ''}" data-i="${i}" style="width:48px; height:48px;"></button>`
                  )
                  .join('')}
              </div>
            </div>
          </div>
          <div style="display:flex; gap:10px;">
            <button type="button" id="checkShapeBtn" class="btn btn-primary">Tekshirish</button>
            <button type="button" id="clearShapeBtn" class="btn btn-secondary">Tozalash</button>
          </div>
          <div id="fb" class="game-feedback idle"></div>
        `;

        container.querySelectorAll('[data-i]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const i = Number(btn.getAttribute('data-i'));
            user[i] = user[i] ? 0 : 1;
            draw();
          });
        });

        container.querySelector('#clearShapeBtn').addEventListener('click', () => {
          user.fill(0);
          draw();
        });

        container.querySelector('#checkShapeBtn').addEventListener('click', () => {
          const ok = bp.cells.every((v, i) => v === user[i]);
          if (ok) {
            engine.addCorrect(180);
            setFeedback(container.querySelector('#fb'), 'correct', `Ajoyib! “${bp.name}” aniq yasaldi!`);
            window.setTimeout(() => {
              idx += 1;
              load();
            }, 700);
          } else {
            engine.addWrong(20);
            setFeedback(container.querySelector('#fb'), 'wrong', 'Ayrim katakchalar namunaga mos emas.');
          }
        });
      };

      draw();
    };

    load();
  },
};
