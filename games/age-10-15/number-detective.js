import { shuffle, setFeedback } from '../helpers.js';

const CASES = [
  {
    clues: ['Son 20 dan 40 gacha oraliqda.', 'U 3 ga ham, 4 ga ham qoldiqsiz bo‘linadi.', 'Raqamlari yig‘indisi 9 ga teng.'],
    ans: 36,
    opts: [36, 24, 30, 32],
  },
  {
    clues: ['Ikki xonali tub son.', '30 dan katta, 40 dan kichik.', 'Raqamlari yig‘indisi 10 ga teng.'],
    ans: 37,
    opts: [37, 31, 33, 39],
  },
  {
    clues: ['Juft son va 5 ga bo‘linadi.', '50 dan katta, 90 dan kichik.', '7 ga bo‘linadi.'],
    ans: 70,
    opts: [70, 60, 80, 65],
  },
  {
    clues: ['To‘liq kvadrat son (n²).', 'Raqamlari yig‘indisi 10 ga teng.', '50 dan katta, 100 dan kichik.'],
    ans: 64,
    opts: [64, 81, 49, 73],
  },
  {
    clues: ['40 dan 60 gacha bo‘lgan son.', '8 ga qoldiqsiz bo‘linadi.', 'Raqamlari farqi 4 ga teng.'],
    ans: 48,
    opts: [48, 56, 40, 52],
  },
  {
    clues: ['Ikki xonali toq son, 9 ga bo‘linadi.', 'Raqamlari farqi 5 ga teng.', '50 dan kichik.'],
    ans: 27,
    opts: [27, 45, 63, 18],
  },
];

export default {
  init(container, engine) {
    const queue = shuffle(CASES);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Number Detective bo‘limidagi barcha sirli sonlarni fosh qildingiz!');
        return;
      }
      locked = false;
      const c = queue[idx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Ish ${idx + 1} / ${queue.length}</span>
          <span>Number Detective</span>
        </div>
        <div class="stimulus-box" style="align-items:flex-start; text-align:left; gap:8px;">
          <strong>Matematik dalillar:</strong>
          ${c.clues.map((cl, i) => `<span>${i + 1}. ${cl}</span>`).join('')}
        </div>
        <h3 class="game-prompt">Barcha dalillarga mos yagona son qaysi?</h3>
        <div class="choice-grid">
          ${shuffle(c.opts)
            .map((o) => `<button type="button" class="choice-btn mono" data-v="${o}" style="font-size:1.45rem;">${o}</button>`)
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          if (Number(btn.getAttribute('data-v')) === c.ans) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(150);
            setFeedback(fb, 'correct', `Aniq! Sirli son — ${c.ans}.`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 650);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(25);
            setFeedback(fb, 'wrong', 'Bu son barcha dalillarga mos kelmaydi.');
          }
        });
      });
    };

    render();
  },
};
