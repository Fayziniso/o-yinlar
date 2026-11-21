import { setFeedback } from '../helpers.js';

// 0 = path, 1 = wall
const MAZES = [
  {
    grid: [
      [0, 0, 1, 0, 0, 0, 0],
      [1, 0, 1, 0, 1, 1, 0],
      [0, 0, 0, 0, 1, 0, 0],
      [0, 1, 1, 1, 1, 0, 1],
      [0, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 1, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
    ],
    start: [0, 0],
    goal: [6, 6],
  },
  {
    grid: [
      [0, 1, 0, 0, 0, 1, 0],
      [0, 1, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 0],
      [1, 1, 0, 0, 0, 1, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 1, 1, 1, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 0],
    ],
    start: [0, 0],
    goal: [0, 6],
  },
];

export default {
  init(container, engine) {
    let idx = 0;
    let pos = [0, 0];
    let steps = 0;

    const load = () => {
      if (idx >= MAZES.length) {
        engine.finish('Barcha labirintlardan xazinani topib chiqdingiz!');
        return;
      }
      pos = [...MAZES[idx].start];
      steps = 0;
      draw();
    };

    const move = (dr, dc) => {
      const m = MAZES[idx];
      const nr = pos[0] + dr;
      const nc = pos[1] + dc;
      if (nr < 0 || nc < 0 || nr >= 7 || nc >= 7) return;
      if (m.grid[nr][nc] === 1) {
        engine.addWrong(5);
        setFeedback(container.querySelector('#fb'), 'wrong', 'Devor! Boshqa yo‘nalishni tanlang.');
        return;
      }
      pos = [nr, nc];
      steps += 1;
      draw();
      if (nr === m.goal[0] && nc === m.goal[1]) {
        engine.addCorrect(250);
        setFeedback(container.querySelector('#fb'), 'correct', `Xazina ${steps} qadamda topildi!`);
        window.setTimeout(() => {
          idx += 1;
          load();
        }, 800);
      }
    };

    const draw = () => {
      const m = MAZES[idx];
      const cells = [];
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isP = pos[0] === r && pos[1] === c;
          const isG = m.goal[0] === r && m.goal[1] === c;
          const isW = m.grid[r][c] === 1;
          const cls = isP ? 'player' : isG ? 'goal' : isW ? 'wall' : '';
          cells.push(
            `<div class="board-cell ${cls}" style="width:42px; height:42px; font-size:1.2rem;">${isP ? '🧭' : isG ? '💎' : ''}</div>`
          );
        }
      }

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Labirint ${idx + 1} / ${MAZES.length}</span>
          <span class="mono">Qadamlar: ${steps}</span>
        </div>
        <div class="board-grid" style="grid-template-columns: repeat(7, 42px);">
          ${cells.join('')}
        </div>
        <div class="dpad">
          <div></div>
          <button type="button" class="dpad-btn" data-d="u">↑</button>
          <div></div>
          <button type="button" class="dpad-btn" data-d="l">←</button>
          <button type="button" class="dpad-btn" data-d="d">↓</button>
          <button type="button" class="dpad-btn" data-d="r">→</button>
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      container.querySelectorAll('[data-d]').forEach((b) => {
        b.addEventListener('click', () => {
          const d = b.getAttribute('data-d');
          if (d === 'u') move(-1, 0);
          if (d === 'd') move(1, 0);
          if (d === 'l') move(0, -1);
          if (d === 'r') move(0, 1);
        });
      });
    };

    engine.onKeyDown((e) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); move(-1, 0); }
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1, 0); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(0, -1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); move(0, 1); }
    });

    load();
  },
};
