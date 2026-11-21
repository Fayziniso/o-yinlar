import { setFeedback } from '../helpers.js';

const SOL = [
  [1, 2, 3, 4, 5, 6],
  [4, 5, 6, 1, 2, 3],
  [2, 3, 1, 5, 6, 4],
  [5, 6, 4, 2, 3, 1],
  [3, 1, 2, 6, 4, 5],
  [6, 4, 5, 3, 1, 2],
];

const GIVEN_MASK = [
  [1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 1],
  [0, 1, 0, 1, 1, 0],
];

export default {
  init(container, engine) {
    const board = SOL.map((row, r) => row.map((v, c) => (GIVEN_MASK[r][c] ? v : 0)));
    let sel = null;

    const draw = () => {
      const cells = [];
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          const given = Boolean(GIVEN_MASK[r][c]);
          const val = board[r][c];
          const isSel = sel && sel[0] === r && sel[1] === c;
          const isErr = val !== 0 && val !== SOL[r][c];
          const br = c === 2 ? 'border-right: 3px solid var(--text-primary);' : '';
          const bb = r === 1 || r === 3 ? 'border-bottom: 3px solid var(--text-primary);' : '';
          cells.push(`
            <button type="button" class="sudoku-cell ${given ? 'given' : ''} ${isSel ? 'active' : ''} ${isErr ? 'err' : ''}" data-r="${r}" data-c="${c}" ${given ? 'disabled' : ''} style="width:48px; height:48px; ${br} ${bb}">
              ${val || ''}
            </button>
          `);
        }
      }

      const remaining = board.flat().filter((v) => v === 0).length;
      container.innerHTML = `
        <div class="game-round-header">
          <span>6x6 Sudoku Master</span>
          <span class="mono">Bo‘sh kataklar: ${remaining}</span>
        </div>
        <div class="sudoku-grid" style="grid-template-columns: repeat(6, 48px);">
          ${cells.join('')}
        </div>
        <div class="numpad-row">
          ${[1, 2, 3, 4, 5, 6]
            .map((n) => `<button type="button" class="numpad-btn" data-n="${n}">${n}</button>`)
            .join('')}
          <button type="button" class="numpad-btn" data-n="0" style="padding:0 12px;">Tozalash</button>
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      container.querySelectorAll('[data-r]').forEach((btn) => {
        btn.addEventListener('click', () => {
          sel = [Number(btn.getAttribute('data-r')), Number(btn.getAttribute('data-c'))];
          draw();
        });
      });

      container.querySelectorAll('[data-n]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (!sel) {
            setFeedback(container.querySelector('#fb'), 'wrong', 'Avval bo‘sh katakchani tanlang.');
            return;
          }
          const [r, c] = sel;
          const n = Number(btn.getAttribute('data-n'));
          board[r][c] = n;
          if (n === 0) {
            draw();
            return;
          }
          if (n === SOL[r][c]) {
            engine.addCorrect(55);
            const solved = board.every((row, ri) => row.every((v, ci) => v === SOL[ri][ci]));
            draw();
            if (solved) {
              engine.addBonus(250);
              engine.finish('6x6 Sudoku Master panjarasini to‘liq va xatosiz yakunladingiz!');
            }
          } else {
            engine.addWrong(20);
            draw();
            setFeedback(container.querySelector('#fb'), 'wrong', 'Bu raqam qator, ustun yoki 2x3 blokda ziddiyat yaratdi.');
          }
        });
      });
    };

    draw();
  },
};
