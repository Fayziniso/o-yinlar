import { shuffle, setFeedback } from '../helpers.js';

const PATTERNS = [
  { seq: [1, 4, 9, 16, 25], ans: 36, opts: [36, 32, 34, 49], rule: 'Natural sonlar kvadratlari (6²)' },
  { seq: [1, 1, 2, 3, 5, 8], ans: 13, opts: [13, 11, 12, 15], rule: 'Fibonachchi qatori (5 + 8)' },
  { seq: [2, 6, 12, 20, 30], ans: 42, opts: [42, 40, 44, 38], rule: 'n(n+1): 6 × 7 = 42' },
  { seq: [3, 6, 11, 18, 27], ans: 38, opts: [38, 36, 37, 40], rule: '+3, +5, +7, +9, +11' },
  { seq: [2, 3, 5, 7, 11, 13], ans: 17, opts: [17, 15, 19, 16], rule: 'Tub sonlar ketma-ketligi' },
  { seq: [1, 3, 7, 15, 31], ans: 63, opts: [63, 62, 64, 59], rule: '2ⁿ − 1 qonuniyati' },
  { seq: [81, 27, 9, 3], ans: 1, opts: [1, 0, 2, 3], rule: 'Har safar 3 ga bo‘linadi' },
  { seq: [4, 7, 13, 25, 49], ans: 97, opts: [97, 95, 98, 89], rule: '2×oldingi − 1' },
];

export default {
  init(container, engine) {
    const queue = shuffle(PATTERNS);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Pattern Master sinovini a’lo natija bilan yakunladingiz!');
        return;
      }
      locked = false;
      const p = queue[idx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Qonuniyat ${idx + 1} / ${queue.length}</span>
          <span>Pattern Master</span>
        </div>
        <h3 class="game-prompt">Ketma-ketlikning keyingi hadini toping</h3>
        <div class="stimulus-box">
          <div class="stimulus-big">${p.seq.join(', ')}, ?</div>
        </div>
        <div class="choice-grid">
          ${shuffle(p.opts)
            .map((o) => `<button type="button" class="choice-btn mono" data-v="${o}" style="font-size:1.35rem;">${o}</button>`)
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          if (Number(btn.getAttribute('data-v')) === p.ans) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(140);
            setFeedback(fb, 'correct', `To‘g‘ri! ${p.rule}`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 800);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(25);
            setFeedback(fb, 'wrong', 'Hadlar orasidagi bog‘liqlikni qayta tahlil qiling.');
          }
        });
      });
    };

    render();
  },
};
