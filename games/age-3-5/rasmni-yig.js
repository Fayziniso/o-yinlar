import { shuffle, setFeedback } from '../helpers.js';

const PUZZLES = [
  {
    name: 'Quvnoq uy',
    tiles: [
      { id: 0, label: 'Tom (chap)', svg: '<rect width="100" height="100" fill="#bae6fd"/><polygon points="100,20 100,100 10,100" fill="#ef4444"/><circle cx="28" cy="28" r="14" fill="#facc15"/>' },
      { id: 1, label: 'Tom (o‘ng)', svg: '<rect width="100" height="100" fill="#bae6fd"/><polygon points="0,20 90,100 0,100" fill="#dc2626"/><rect x="52" y="26" width="16" height="34" fill="#7c2d12"/>' },
      { id: 2, label: 'Devor (chap)', svg: '<rect width="100" height="100" fill="#86efac"/><rect x="18" y="0" width="82" height="82" fill="#fde68a"/><rect x="34" y="22" width="32" height="32" rx="4" fill="#38bdf8" stroke="#92400e" stroke-width="4"/>' },
      { id: 3, label: 'Devor (o‘ng)', svg: '<rect width="100" height="100" fill="#86efac"/><rect x="0" y="0" width="82" height="82" fill="#fcd34d"/><rect x="20" y="24" width="38" height="58" rx="4" fill="#92400e"/><circle cx="50" cy="54" r="4" fill="#facc15"/>' },
    ],
  },
  {
    name: 'Kosmik raketa',
    tiles: [
      { id: 0, label: 'Uch (chap)', svg: '<rect width="100" height="100" fill="#1e293b"/><circle cx="22" cy="24" r="4" fill="#fde047"/><path d="M100 15 Q60 45 60 100 L100 100 Z" fill="#f97316"/>' },
      { id: 1, label: 'Uch (o‘ng)', svg: '<rect width="100" height="100" fill="#1e293b"/><circle cx="78" cy="30" r="5" fill="#fde047"/><path d="M0 15 Q40 45 40 100 L0 100 Z" fill="#ea580c"/>' },
      { id: 2, label: 'Korpus (chap)', svg: '<rect width="100" height="100" fill="#1e293b"/><rect x="60" y="0" width="40" height="65" fill="#e2e8f0"/><polygon points="60,30 25,75 60,65" fill="#ef4444"/><circle cx="88" cy="28" r="14" fill="#38bdf8"/>' },
      { id: 3, label: 'Korpus (o‘ng)', svg: '<rect width="100" height="100" fill="#1e293b"/><rect x="0" y="0" width="40" height="65" fill="#cbd5e1"/><polygon points="40,30 75,75 40,65" fill="#dc2626"/><circle cx="12" cy="28" r="14" fill="#38bdf8"/>' },
    ],
  },
  {
    name: 'Oftobli gul',
    tiles: [
      { id: 0, label: 'Gul (chap)', svg: '<rect width="100" height="100" fill="#fef9c3"/><circle cx="85" cy="85" r="38" fill="#f43f5e"/><circle cx="42" cy="55" r="24" fill="#fb7185"/>' },
      { id: 1, label: 'Gul (o‘ng)', svg: '<rect width="100" height="100" fill="#fef9c3"/><circle cx="15" cy="85" r="38" fill="#f43f5e"/><circle cx="58" cy="55" r="24" fill="#fb7185"/>' },
      { id: 2, label: 'Barg (chap)', svg: '<rect width="100" height="100" fill="#ecfccb"/><rect x="88" y="0" width="12" height="90" fill="#16a34a"/><ellipse cx="60" cy="48" rx="28" ry="14" transform="rotate(20 60 48)" fill="#22c55e"/>' },
      { id: 3, label: 'Barg (o‘ng)', svg: '<rect width="100" height="100" fill="#ecfccb"/><rect x="0" y="0" width="12" height="90" fill="#15803d"/><ellipse cx="40" cy="48" rx="28" ry="14" transform="rotate(-20 40 48)" fill="#22c55e"/>' },
    ],
  },
];

export default {
  init(container, engine) {
    let stageIdx = 0;

    const loadStage = () => {
      if (stageIdx >= PUZZLES.length) {
        engine.finish('Barcha rasmlarni mohirona yig‘dingiz!');
        return;
      }
      const puzzle = PUZZLES[stageIdx];
      let order = shuffle([0, 1, 2, 3]);
      if (order.every((v, i) => v === i)) order = [1, 0, 3, 2];
      let selectedPos = null;

      const draw = () => {
        container.innerHTML = `
          <div class="game-round-header">
            <span class="mono">Rasm ${stageIdx + 1} / ${PUZZLES.length}</span>
            <span>${puzzle.name}</span>
          </div>
          <h3 class="game-prompt">Ikki bo‘lakni ketma-ket bosib o‘rnini almashtiring</h3>
          <div style="display:grid; grid-template-columns:repeat(2, 130px); gap:6px; background:var(--border-strong); padding:6px; border-radius:14px;">
            ${order
              .map((tileId, pos) => {
                const t = puzzle.tiles[tileId];
                const isSel = selectedPos === pos;
                return `
                  <button type="button" data-pos="${pos}" style="width:130px; height:130px; padding:0; border:${isSel ? '4px solid var(--accent)' : '2px solid transparent'}; border-radius:10px; overflow:hidden; background:#fff;">
                    <svg viewBox="0 0 100 100" width="100%" height="100%">${t.svg}</svg>
                  </button>
                `;
              })
              .join('')}
          </div>
          <div id="fb" class="game-feedback idle"></div>
        `;

        const fb = container.querySelector('#fb');
        container.querySelectorAll('[data-pos]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const pos = Number(btn.getAttribute('data-pos'));
            if (selectedPos === null) {
              selectedPos = pos;
              draw();
            } else if (selectedPos === pos) {
              selectedPos = null;
              draw();
            } else {
              [order[selectedPos], order[pos]] = [order[pos], order[selectedPos]];
              selectedPos = null;
              const solved = order.every((v, i) => v === i);
              draw();
              if (solved) {
                engine.addCorrect(180);
                setFeedback(container.querySelector('#fb'), 'correct', `Ajoyib! “${puzzle.name}” tayyor!`);
                window.setTimeout(() => {
                  stageIdx += 1;
                  loadStage();
                }, 850);
              }
            }
          });
        });
      };

      draw();
    };

    loadStage();
  },
};
