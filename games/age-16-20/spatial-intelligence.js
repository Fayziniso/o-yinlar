import { shuffle, setFeedback } from '../helpers.js';

function rotateCW(mat) {
  const res = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      res[c][2 - r] = mat[r][c];
    }
  }
  return res;
}

function mirrorH(mat) {
  return mat.map((row) => [...row].reverse());
}

function matKey(mat) {
  return mat.flat().join('');
}

function renderMiniGrid(mat) {
  return `
    <div style="display:grid; grid-template-columns:repeat(3, 24px); gap:3px; padding:6px; border-radius:8px; background:var(--bg-subtle);">
      ${mat
        .flat()
        .map(
          (v) =>
            `<span style="width:24px; height:24px; border-radius:4px; background:${v ? 'var(--accent)' : 'var(--bg-surface)'}; border:1px solid var(--border-hairline);"></span>`
        )
        .join('')}
    </div>
  `;
}

const BASES = [
  [[1, 1, 0], [1, 0, 0], [1, 0, 1]],
  [[1, 0, 0], [1, 1, 1], [0, 0, 1]],
  [[0, 1, 1], [0, 1, 0], [1, 1, 0]],
  [[1, 1, 1], [0, 0, 1], [0, 1, 0]],
  [[1, 0, 1], [1, 1, 0], [0, 1, 0]],
  [[0, 1, 0], [1, 1, 1], [1, 0, 0]],
];

const OPS = [
  { label: 'soat yo‘nalishida 90° burilganda', fn: (m) => rotateCW(m) },
  { label: '180° burilganda', fn: (m) => rotateCW(rotateCW(m)) },
  { label: 'soat yo‘nalishiga qarshi 90° burilganda', fn: (m) => rotateCW(rotateCW(rotateCW(m))) },
  { label: 'gorizontal (chap-o‘ng) aks ettirilganda', fn: (m) => mirrorH(m) },
];

export default {
  init(container, engine) {
    const queue = shuffle(BASES);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Spatial Intelligence — fazoviy tasavvuringiz ajoyib!');
        return;
      }
      locked = false;
      const base = queue[idx];
      const op = OPS[idx % OPS.length];
      const correct = op.fn(base);
      const correctKey = matKey(correct);

      const candidates = [
        correct,
        rotateCW(base),
        rotateCW(rotateCW(base)),
        rotateCW(rotateCW(rotateCW(base))),
        mirrorH(base),
        mirrorH(rotateCW(base)),
      ];
      const unique = [];
      const seen = new Set([correctKey]);
      unique.push({ mat: correct, ok: true });
      for (const c of candidates) {
        const k = matKey(c);
        if (!seen.has(k) && unique.length < 4) {
          seen.add(k);
          unique.push({ mat: c, ok: false });
        }
      }

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Shakl ${idx + 1} / ${queue.length}</span>
          <span>Spatial Intelligence</span>
        </div>
        <div class="stimulus-box">
          <span style="font-size:0.94rem; color:var(--text-secondary);">Ushbu matritsa <strong>${op.label}</strong> qanday ko‘rinishga keladi?</span>
          ${renderMiniGrid(base)}
        </div>
        <div class="choice-grid">
          ${shuffle(unique)
            .map(
              (u) => `
            <button type="button" class="choice-btn" data-ok="${u.ok}" style="min-height:112px;">
              ${renderMiniGrid(u.mat)}
            </button>`
            )
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          if (btn.getAttribute('data-ok') === 'true') {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(160);
            setFeedback(fb, 'correct', 'Aniq fazoviy transformatsiya!');
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 650);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(25);
            setFeedback(fb, 'wrong', 'Burchak nuqtalari qayerga ko‘chishini kuzating.');
          }
        });
      });
    };

    render();
  },
};
