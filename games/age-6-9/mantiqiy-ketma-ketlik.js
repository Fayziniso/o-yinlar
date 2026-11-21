import { shuffle, setFeedback } from '../helpers.js';

const SEQUENCES = [
  { seq: [2, 4, 6, 8], ans: 10, opts: [10, 9, 12, 11], hint: '+2 qo‘shib borilmoqda' },
  { seq: [5, 10, 15, 20], ans: 25, opts: [25, 22, 30, 24], hint: '+5 qadam bilan' },
  { seq: [3, 6, 9, 12], ans: 15, opts: [15, 14, 16, 18], hint: '+3 qo‘shilmoqda' },
  { seq: [20, 17, 14, 11], ans: 8, opts: [8, 9, 7, 10], hint: '-3 ayirilmoqda' },
  { seq: [1, 2, 4, 8], ans: 16, opts: [16, 12, 14, 10], hint: 'Har safar 2 ga ko‘paymoqda' },
  { seq: [1, 4, 7, 10], ans: 13, opts: [13, 12, 14, 15], hint: '+3 qonuniyati' },
  { seq: [2, 3, 5, 8, 12], ans: 17, opts: [17, 15, 16, 18], hint: '+1, +2, +3, +4, +5' },
  { seq: [40, 35, 30, 25], ans: 20, opts: [20, 15, 22, 18], hint: '-5 kamaymoqda' },
];

export default {
  init(container, engine) {
    const queue = shuffle(SEQUENCES);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Barcha mantiqiy ketma-ketliklarni yechdingiz!');
        return;
      }
      locked = false;
      const q = queue[idx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Qator ${idx + 1} / ${queue.length}</span>
          <span>Qonuniyatni toping</span>
        </div>
        <h3 class="game-prompt">Ketma-ketlikdagi keyingi son qaysi?</h3>
        <div class="stimulus-box">
          <div class="stimulus-big">${q.seq.join('  ·  ')}  ·  ?</div>
        </div>
        <div class="choice-grid">
          ${shuffle(q.opts)
            .map(
              (n) => `<button type="button" class="choice-btn mono" data-val="${n}" style="font-size:1.4rem;">${n}</button>`
            )
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          if (Number(btn.getAttribute('data-val')) === q.ans) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(125);
            setFeedback(fb, 'correct', `To‘g‘ri! (${q.hint})`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 700);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(20);
            setFeedback(fb, 'wrong', 'Sonlar orasidagi farqni tekshiring.');
          }
        });
      });
    };

    render();
  },
};
