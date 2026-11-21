import { setFeedback } from '../helpers.js';

const LEVELS = [
  {
    size: 5,
    start: [4, 0],
    goal: [0, 4],
    walls: ['3,0', '3,1', '2,3', '1,3', '1,1'],
  },
  {
    size: 5,
    start: [0, 0],
    goal: [4, 4],
    walls: ['0,2', '1,2', '2,2', '2,0', '3,3', '4,2'],
  },
  {
    size: 5,
    start: [4, 2],
    goal: [0, 2],
    walls: ['3,2', '2,1', '2,2', '2,3', '1,0', '1,4'],
  },
];

const DIR_LABELS = { U: '↑', D: '↓', L: '←', R: '→' };
const DELTAS = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };

export default {
  init(container, engine) {
    let lvIdx = 0;
    let queue = [];
    let robot = [0, 0];
    let running = false;
    let runTimer = null;

    const loadLevel = () => {
      if (lvIdx >= LEVELS.length) {
        engine.finish('Robot barcha algoritmlarni aniq bajarib marraga yetdi!');
        return;
      }
      queue = [];
      robot = [...LEVELS[lvIdx].start];
      running = false;
      draw();
    };

    const runProgram = () => {
      if (running || queue.length === 0) return;
      running = true;
      robot = [...LEVELS[lvIdx].start];
      let step = 0;
      const lv = LEVELS[lvIdx];

      const tick = () => {
        if (engine.state !== 'PLAYING') return;
        if (step >= queue.length) {
          running = false;
          engine.addWrong(20);
          draw();
          setFeedback(container.querySelector('#fb'), 'wrong', 'Robot nishonga yetmadi. Buyruqlarni tahrirlang.');
          return;
        }
        const [dr, dc] = DELTAS[queue[step]];
        const nr = robot[0] + dr;
        const nc = robot[1] + dc;
        if (nr < 0 || nc < 0 || nr >= lv.size || nc >= lv.size || lv.walls.includes(`${nr},${nc}`)) {
          running = false;
          engine.addWrong(25);
          draw();
          setFeedback(container.querySelector('#fb'), 'wrong', 'Robot to‘siqqa urildi! Algoritmni qayta tuzing.');
          return;
        }
        robot = [nr, nc];
        step += 1;
        draw();

        if (nr === lv.goal[0] && nc === lv.goal[1]) {
          running = false;
          engine.addCorrect(260);
          setFeedback(container.querySelector('#fb'), 'correct', 'Algoritm muvaffaqiyatli bajarildi!');
          runTimer = window.setTimeout(() => {
            lvIdx += 1;
            loadLevel();
          }, 800);
          return;
        }
        runTimer = window.setTimeout(tick, 320);
      };

      draw();
      runTimer = window.setTimeout(tick, 280);
    };

    const draw = () => {
      const lv = LEVELS[lvIdx];
      const cells = [];
      for (let r = 0; r < lv.size; r++) {
        for (let c = 0; c < lv.size; c++) {
          const isR = robot[0] === r && robot[1] === c;
          const isG = lv.goal[0] === r && lv.goal[1] === c;
          const isW = lv.walls.includes(`${r},${c}`);
          const cls = isR ? 'player' : isG ? 'goal' : isW ? 'wall' : '';
          cells.push(`<div class="board-cell ${cls}" style="font-size:1.3rem;">${isR ? '🤖' : isG ? '🚩' : ''}</div>`);
        }
      }

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Bosqich ${lvIdx + 1} / ${LEVELS.length}</span>
          <span>Buyruqlar soni: ${queue.length}</span>
        </div>
        <div class="board-grid" style="grid-template-columns: repeat(${lv.size}, 52px);">
          ${cells.join('')}
        </div>
        <div class="stimulus-box" style="padding:14px;">
          <span style="font-size:0.82rem; color:var(--text-muted);">Algoritm ketma-ketligi:</span>
          <div class="mono" style="font-size:1.25rem; min-height:30px; letter-spacing:0.15em;">
            ${queue.length ? queue.map((d) => DIR_LABELS[d]).join(' ') : 'Buyruq qo‘shing...'}
          </div>
        </div>
        <div class="numpad-row">
          <button type="button" class="numpad-btn" data-cmd="U" ${running ? 'disabled' : ''}>↑</button>
          <button type="button" class="numpad-btn" data-cmd="D" ${running ? 'disabled' : ''}>↓</button>
          <button type="button" class="numpad-btn" data-cmd="L" ${running ? 'disabled' : ''}>←</button>
          <button type="button" class="numpad-btn" data-cmd="R" ${running ? 'disabled' : ''}>→</button>
          <button type="button" id="popCmd" class="btn btn-secondary btn-sm" ${running ? 'disabled' : ''}>O‘chirish</button>
          <button type="button" id="clearCmd" class="btn btn-ghost btn-sm" ${running ? 'disabled' : ''}>Tozalash</button>
          <button type="button" id="runCmd" class="btn btn-primary btn-sm" ${running ? 'disabled' : ''}>Ishga tushirish</button>
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      container.querySelectorAll('[data-cmd]').forEach((b) => {
        b.addEventListener('click', () => {
          if (queue.length < 18) {
            queue.push(b.getAttribute('data-cmd'));
            draw();
          }
        });
      });
      container.querySelector('#popCmd').addEventListener('click', () => {
        queue.pop();
        draw();
      });
      container.querySelector('#clearCmd').addEventListener('click', () => {
        queue = [];
        robot = [...lv.start];
        draw();
      });
      container.querySelector('#runCmd').addEventListener('click', runProgram);
    };

    loadLevel();
    return () => {
      if (runTimer) window.clearTimeout(runTimer);
    };
  },
};
