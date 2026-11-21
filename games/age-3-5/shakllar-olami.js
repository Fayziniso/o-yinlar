import { shuffle, setFeedback, renderShapeSvg } from '../helpers.js';

const SHAPES = [
  { id: 'doira', name: 'Doira', color: '#ea580c' },
  { id: 'kvadrat', name: 'Kvadrat', color: '#2563eb' },
  { id: 'uchburchak', name: 'Uchburchak', color: '#16a34a' },
  { id: 'yulduz', name: 'Yulduz', color: '#eab308' },
  { id: 'romb', name: 'Romb', color: '#9333ea' },
  { id: 'oltiburchak', name: 'Oltiburchak', color: '#0891b2' },
  { id: 'yurak', name: 'Yurakcha', color: '#e11d48' },
  { id: 'oval', name: 'Oval', color: '#4f46e5' },
];

export default {
  init(container, engine) {
    const queue = shuffle(SHAPES);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Barcha geometrik shakllarni topdingiz!');
        return;
      }
      locked = false;
      const target = queue[idx];
      const options = shuffle([
        target,
        ...shuffle(SHAPES.filter((s) => s.id !== target.id)).slice(0, 3),
      ]);

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Shakl ${idx + 1} / ${queue.length}</span>
          <span>Shakllar olami</span>
        </div>
        <h3 class="game-prompt">“${target.name}” shaklini toping</h3>
        <div class="choice-grid">
          ${options
            .map(
              (s) => `
            <button type="button" class="choice-btn" data-id="${s.id}" style="min-height:118px;">
              ${renderShapeSvg(s.id, s.color, 72)}
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
            engine.addCorrect(110);
            setFeedback(fb, 'correct', `Barakalla! Bu ${target.name}.`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 650);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(15);
            setFeedback(fb, 'wrong', 'Boshqa shaklga qarang!');
          }
        });
      });
    };

    render();
  },
};
