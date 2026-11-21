import { shuffle, setFeedback, renderShapeSvg } from '../helpers.js';

const OBJECTS = [
  { id: 'yulduz', name: 'Yulduz', color: '#eab308' },
  { id: 'yurak', name: 'Yurak', color: '#e11d48' },
  { id: 'uchburchak', name: 'Uchburchak', color: '#16a34a' },
  { id: 'oltiburchak', name: 'Oltiburchak', color: '#0284c7' },
  { id: 'romb', name: 'Romb', color: '#9333ea' },
  { id: 'oval', name: 'Oval', color: '#f97316' },
  { id: 'kvadrat', name: 'Kvadrat', color: '#2563eb' },
];

export default {
  init(container, engine) {
    const queue = shuffle(OBJECTS);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Barcha soyalarning egasini aniq topdingiz!');
        return;
      }
      locked = false;
      const target = queue[idx];
      const opts = shuffle([
        target,
        ...shuffle(OBJECTS.filter((o) => o.id !== target.id)).slice(0, 3),
      ]);

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Soya ${idx + 1} / ${queue.length}</span>
          <span>Soyasini toping</span>
        </div>
        <div class="stimulus-box">
          <span style="font-size:0.86rem; color:var(--text-muted);">Bu soya qaysi shaklga tegishli?</span>
          ${renderShapeSvg(target.id, '#1e293b', 94)}
        </div>
        <div class="choice-grid cols-4">
          ${opts
            .map(
              (o) => `
            <button type="button" class="choice-btn" data-id="${o.id}" style="min-height:110px;">
              ${renderShapeSvg(o.id, o.color, 64)}
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
          if (btn.getAttribute('data-id') === target.id) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(115);
            setFeedback(fb, 'correct', `Topdingiz! Bu ${target.name} soyasi.`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 600);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(15);
            setFeedback(fb, 'wrong', 'Shaklni soyasi bilan yaxshilab solishtiring.');
          }
        });
      });
    };

    render();
  },
};
