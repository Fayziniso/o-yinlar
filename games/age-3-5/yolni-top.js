import { setFeedback } from '../helpers.js';

const LEVELS = [
  {
    size: 5,
    start: [0, 0],
    goal: [4, 4],
    walls: ['0,2', '1,2', '2,2', '3,1', '3,3', '1,4'],
  },
  {
    size: 5,
    start: [0, 4],
    goal: [4, 0],
    walls: ['1,4', '1,3', '1,1', '2,1', '3,1', '3,2', '3,3'],
  },
  {
    size: 5,
    start: [2, 0],
    goal: [2, 4],
    walls: ['0,2', '1,2', '2,2', '3,2', '1,4', '3,0'],
  },
];

export default {
  init(container, engine) {
    let levelIdx = 0;
    let pos = [0, 0];

    const loadLevel = () => {
      if (levelIdx >= LEVELS.length) {
        engine.finish('Quyoncha barcha sabzilarga muvaffaqiyatli yetib bordi!');
        return;
      }
      pos = [...LEVELS[levelIdx].start];
      draw();
    };

    const move = (dr, dc) => {
      const lv = LEVELS[levelIdx];
      const nr = pos[0] + dr;
      const nc = pos[1] + dc;
      if (nr < 0 || nc < 0 || nr >= lv.size || nc >= lv.size) return;
      if (lv.walls.includes(`${nr},${nc}`)) {
        engine.addWrong(5);
        setFeedback(container.querySelector('#fb'), 'wrong', 'Bu yerda daraxt bor, aylanib o‘ting!');
        return;
      }
      pos = [nr, nc];
      draw();
      if (nr === lv.goal[0] && nc === lv.goal[1]) {
        engine.addCorrect(200);
        setFeedback(container.querySelector('#fb'), 'correct', 'Zo‘r! Sabziga yetib keldik!');
        window.setTimeout(() => {
          levelIdx += 1;
          loadLevel();
        }, 700);
      }
    };

    const draw = () => {
      const lv = LEVELS[levelIdx];
      const cells = [];
      for (let r = 0; r < lv.size; r++) {
        for (let c = 0; c < lv.size; c++) {
          const isPlayer = pos[0] === r && pos[1] === c;
          const isGoal = lv.goal[0] === r && lv.goal[1] === c;
          const isWall = lv.walls.includes(`${r},${c}`);
          const cls = isPlayer ? 'player' : isGoal ? 'goal' : isWall ? 'wall' : '';
          const icon = isPlayer ? '🐰' : isGoal ? '🥕' : isWall ? '🌲' : '';
          cells.push(`<div class="board-cell ${cls}" style="font-size:1.45rem;">${icon}</div>`);
        }
      }

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Bosqich ${levelIdx + 1} / ${LEVELS.length}</span>
          <span>Quyonchani sabziga olib boring</span>
        </div>
        <div class="board-grid" style="grid-template-columns: repeat(${lv.size}, 52px);">
          ${cells.join('')}
        </div>
        <div class="dpad" aria-label="Yo‘nalish tugmalari">
          <div></div>
          <button type="button" class="dpad-btn" data-dir="up" aria-label="Yuqoriga">↑</button>
          <div></div>
          <button type="button" class="dpad-btn" data-dir="left" aria-label="Chapga">←</button>
          <button type="button" class="dpad-btn" data-dir="down" aria-label="Pastga">↓</button>
          <button type="button" class="dpad-btn" data-dir="right" aria-label="O‘ngga">→</button>
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      container.querySelectorAll('[data-dir]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const dir = btn.getAttribute('data-dir');
          if (dir === 'up') move(-1, 0);
          if (dir === 'down') move(1, 0);
          if (dir === 'left') move(0, -1);
          if (dir === 'right') move(0, 1);
        });
      });
    };

    engine.onKeyDown((e) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); move(-1, 0); }
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1, 0); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(0, -1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); move(0, 1); }
    });

    loadLevel();
  },
};
