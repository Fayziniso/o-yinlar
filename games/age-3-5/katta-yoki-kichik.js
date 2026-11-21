import { shuffle, setFeedback, renderShapeSvg } from '../helpers.js';

const ITEMS = [
  { shape: 'doira', color: '#ea580c', label: 'Koptok' },
  { shape: 'yulduz', color: '#eab308', label: 'Yulduzcha' },
  { shape: 'yurak', color: '#e11d48', label: 'Yurakcha' },
  { shape: 'kvadrat', color: '#2563eb', label: 'Kubik' },
  { shape: 'uchburchak', color: '#16a34a', label: 'Archa' },
  { shape: 'oltiburchak', color: '#7c3aed', label: 'Asalari uyasi' },
  { shape: 'romb', color: '#0891b2', label: 'Varrak' },
];

export default {
  init(container, engine) {
    const total = 7;
    let round = 0;
    let locked = false;

    const render = () => {
      if (round >= total) {
        engine.finish('Katta va kichik buyumlarni mukammal ajratdingiz!');
        return;
      }
      locked = false;
      const item = ITEMS[round % ITEMS.length];
      const askBiggest = round % 2 === 0;
      const sizes = shuffle([38, 62, 92]);
      const targetSize = askBiggest ? 92 : 38;

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Bosqich ${round + 1} / ${total}</span>
          <span>O‘lchamni solishtiring</span>
        </div>
        <h3 class="game-prompt">Eng <strong>${askBiggest ? 'KATTA' : 'KICHIK'}</strong> shaklni bosing</h3>
        <div class="choice-grid cols-3">
          ${sizes
            .map(
              (sz) => `
            <button type="button" class="choice-btn" data-size="${sz}" style="min-height:136px;">
              ${renderShapeSvg(item.shape, item.color, sz)}
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
          const sz = Number(btn.getAttribute('data-size'));
          if (sz === targetSize) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(115);
            setFeedback(fb, 'correct', 'Zo‘r! Aynan shu!');
            window.setTimeout(() => {
              round += 1;
              render();
            }, 600);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(15);
            setFeedback(fb, 'wrong', 'O‘lchamlarga yana bir bor qarang.');
          }
        });
      });
    };

    render();
  },
};
