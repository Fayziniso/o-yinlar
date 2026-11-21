import { setFeedback } from '../helpers.js';

const SOL = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

// Curated solvable 9x9 mask (22 empty cells for rewarding, completable session)
const EMPTY_CELLS = new Set([
  '0,2', '0,5', '0,7',
  '1,1', '1,4', '1,8',
  '2,0', '2,6',
  '3,3', '3,7',
  '4,2', '4,4', '4,6',
  '5,1', '5,5',
  '6,0', '6,4', '6,8',
  '7,2', '7,7',
  '8,3', '8,6',
]);

export default {
  init(container, engine) {
    const board = SOL.map((row, r) =>
      row.map((v, c) => (EMPTY_CELLS.has(`${r},${c}`) ? 0 : v))
    );
    let sel = null;

    const placeNumber = (n) => {
      if (!sel) {
        setFeedback(container.querySelector('#fb'), 'wrong', 'Avval bo‘sh katakchani tanlang.');
        return;
      }
      const [r, c] = sel;
      board[r][c] = n;
      if (n === 0) {
        draw();
        return;
      }
      if (n === SOL[r][c]) {
        engine.addCorrect(45);
        const solved = board.every((row, ri) => row.every((v, ci) => v === SOL[ri][ci]));
        draw();
        if (solved) {
          engine.addBonus(350);
          engine.finish('9x9 Advanced Sudoku panjarasini mukammal yakunladingiz!');
        }
      } else {
        engine.addWrong(25);
        draw();
        setFeedback(container.querySelector('#fb'), 'wrong', 'Qator, ustun yoki 3x3 blokda takrorlanish yuz berdi.');
      }
    };

    const draw = () => {
      const cells = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const isGiven = !EMPTY_CELLS.has(`${r},${c}`);
          const val = board[r][c];
          const isSel = sel && sel[0] === r && sel[1] === c;
          const isErr = val !== 0 && val !== SOL[r][c];
          const br = c === 2 || c === 5 ? 'border-right: 3px solid var(--text-primary);' : '';
          const bb = r === 2 || r === 5 ? 'border-bottom: 3px solid var(--text-primary);' : '';
          cells.push(`
            <button type="button" class="sudoku-cell ${isGiven ? 'given' : ''} ${isSel ? 'active' : ''} ${isErr ? 'err' : ''}" data-r="${r}" data-c="${c}" ${isGiven ? 'disabled' : ''} style="${br} ${bb}">
              ${val || ''}
            </button>
          `);
        }
      }
      const left = board.flat().filter((v) => v === 0).length;

      container.innerHTML = `
        <div class="game-round-header">
          <span>9x9 Advanced Sudoku</span>
          <span class="mono">Qolgan kataklar: ${left}</span>
        </div>
        <div class="sudoku-grid" style="grid-template-columns: repeat(9, 44px);">
          ${cells.join('')}
        </div>
        <div class="numpad-row">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9]
            .map((n) => `<button type="button" class="numpad-btn" data-n="${n}">${n}</button>`)
            .join('')}
          <button type="button" class="numpad-btn" data-n="0" style="padding:0 12px;">C</button>
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      container.querySelectorAll('[data-r]').forEach((b) => {
        b.addEventListener('click', () => {
          sel = [Number(b.getAttribute('data-r')), Number(b.getAttribute('data-c'))];
          draw();
        });
      });
      container.querySelectorAll('[data-n]').forEach((b) => {
        b.addEventListener('click', () => placeNumber(Number(b.getAttribute('data-n'))));
      });
    };

    engine.onKeyDown((e) => {
      if (e.key >= '1' && e.key <= '9') placeNumber(Number(e.key));
      if (e.key === 'Backspace' || e.key === 'Delete') placeNumber(0);
    });

    draw();
  },
};
