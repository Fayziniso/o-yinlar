import { setFeedback } from '../helpers.js';

const ICONS = { 1: '🍎', 2: '⭐', 3: '🎈', 4: '🍀' };

const PUZZLES = [
  {
    given: [
      [1, 0, 3, 0],
      [0, 4, 0, 2],
      [2, 0, 4, 0],
      [0, 3, 0, 1],
    ],
    sol: [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1],
    ],
  },
  {
    given: [
      [0, 3, 0, 1],
      [4, 0, 2, 0],
      [0, 2, 0, 4],
      [1, 0, 3, 0],
    ],
    sol: [
      [2, 3, 4, 1],
      [4, 1, 2, 3],
      [3, 2, 1, 4],
      [1, 4, 3, 2],
    ],
  },
];

export default {
  init(container, engine) {
    let pIdx = 0;

    const loadPuzzle = () => {
      if (pIdx >= PUZZLES.length) {
        engine.finish('Rasmli sudokuni to‘liq va to‘g‘ri yechdingiz!');
        return;
      }
      const puz = PUZZLES[pIdx];
      const board = puz.given.map((row) => [...row]);
      let selected = null;

      const draw = () => {
        const cells = [];
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const isGiven = puz.given[r][c] !== 0;
            const val = board[r][c];
            const isSel = selected && selected[0] === r && selected[1] === c;
            const isErr = val !== 0 && val !== puz.sol[r][c];
            const borderR = c === 1 ? 'border-right: 3px solid var(--text-primary);' : '';
            const borderB = r === 1 ? 'border-bottom: 3px solid var(--text-primary);' : '';
            cells.push(`
              <button type="button" class="sudoku-cell ${isGiven ? 'given' : ''} ${isSel ? 'active' : ''} ${isErr ? 'err' : ''}" data-r="${r}" data-c="${c}" ${isGiven ? 'disabled' : ''} style="width:62px; height:62px; font-size:1.6rem; ${borderR} ${borderB}">
                ${val ? ICONS[val] : ''}
              </button>
            `);
          }
        }

        container.innerHTML = `
          <div class="game-round-header">
            <span class="mono">Jadval ${pIdx + 1} / ${PUZZLES.length}</span>
            <span>Har qator, ustun va 2x2 da 4 xil belgi</span>
          </div>
          <div class="sudoku-grid" style="grid-template-columns: repeat(4, 62px);">
            ${cells.join('')}
          </div>
          <div class="numpad-row">
            ${[1, 2, 3, 4]
              .map(
                (n) => `<button type="button" class="numpad-btn" data-pick="${n}" style="width:54px; height:54px; font-size:1.5rem;">${ICONS[n]}</button>`
              )
              .join('')}
          </div>
          <div id="fb" class="game-feedback idle"></div>
        `;

        container.querySelectorAll('[data-r]').forEach((btn) => {
          btn.addEventListener('click', () => {
            selected = [Number(btn.getAttribute('data-r')), Number(btn.getAttribute('data-c'))];
            draw();
          });
        });

        container.querySelectorAll('[data-pick]').forEach((btn) => {
          btn.addEventListener('click', () => {
            if (!selected) {
              setFeedback(container.querySelector('#fb'), 'wrong', 'Avval bo‘sh katakchani tanlang.');
              return;
            }
            const [r, c] = selected;
            const val = Number(btn.getAttribute('data-pick'));
            board[r][c] = val;
            if (val === puz.sol[r][c]) {
              engine.addCorrect(75);
              const done = board.every((row, ri) => row.every((v, ci) => v === puz.sol[ri][ci]));
              draw();
              if (done) {
                engine.addBonus(150);
                setFeedback(container.querySelector('#fb'), 'correct', 'Ajoyib! Jadval to‘liq to‘ldirildi!');
                window.setTimeout(() => {
                  pIdx += 1;
                  loadPuzzle();
                }, 800);
              }
            } else {
              engine.addWrong(15);
              draw();
              setFeedback(container.querySelector('#fb'), 'wrong', 'Bu belgi shu qator yoki ustunda takrorlanmoqda!');
            }
          });
        });
      };

      draw();
    };

    loadPuzzle();
  },
};
