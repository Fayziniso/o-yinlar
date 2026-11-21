import { shuffle, pickOne, setFeedback } from '../helpers.js';

const COLORS = [
  { id: 'red', label: 'QIZIL', hex: '#dc2626' },
  { id: 'blue', label: 'KO‘K', hex: '#2563eb' },
  { id: 'green', label: 'YASHIL', hex: '#16a34a' },
  { id: 'amber', label: 'SARIQ', hex: '#d97706' },
];

export default {
  init(container, engine) {
    const total = 10;
    let round = 0;
    let locked = false;

    const render = () => {
      if (round >= total) {
        engine.finish('Diqqatingiz chalg‘imadi! Strop sinovidan muvaffaqiyatli o‘tdingiz.');
        return;
      }
      locked = false;
      const ink = pickOne(COLORS);
      const wordPool = COLORS.filter((c) => c.id !== ink.id);
      const word = pickOne(wordPool);

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Sinov ${round + 1} / ${total}</span>
          <span>So‘zga emas, rangga qarang!</span>
        </div>
        <h3 class="game-prompt">Yozuv qaysi RANGDA yozilgan?</h3>
        <div class="stimulus-box">
          <div class="stimulus-big" style="color:${ink.hex}; font-family:var(--font-display); font-size:2.8rem;">${word.label}</div>
        </div>
        <div class="choice-grid">
          ${shuffle(COLORS)
            .map(
              (c) => `<button type="button" class="choice-btn" data-id="${c.id}">${c.label}</button>`
            )
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          if (btn.getAttribute('data-id') === ink.id) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(110);
            setFeedback(fb, 'correct', 'To‘g‘ri! Diqqat a’lo!');
            window.setTimeout(() => {
              round += 1;
              render();
            }, 450);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(20);
            setFeedback(fb, 'wrong', 'So‘zning ma’nosiga emas, bo‘yog‘iga qarang!');
          }
        });
      });
    };

    render();
  },
};
