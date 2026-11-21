import { shuffle, setFeedback } from '../helpers.js';

const ITEMS = ['🍎', '⭐', '🎈', '🦋', '🍓', '🌼', '🧸', '🍊'];

export default {
  init(container, engine) {
    const counts = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 8);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= counts.length) {
        engine.finish('Sonlarni juda yaxshi sanadingiz!');
        return;
      }
      locked = false;
      const target = counts[idx];
      const emoji = ITEMS[idx % ITEMS.length];
      const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((n) => n !== target);
      const opts = shuffle([target, ...shuffle(pool).slice(0, 3)]);

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Savol ${idx + 1} / ${counts.length}</span>
          <span>1 dan 10 gacha sanash</span>
        </div>
        <h3 class="game-prompt">Rasmda nechta buyum bor?</h3>
        <div class="stimulus-box" style="flex-direction:row; flex-wrap:wrap; gap:14px; font-size:2.4rem;">
          ${Array.from({ length: target }, () => `<span>${emoji}</span>`).join('')}
        </div>
        <div class="choice-grid cols-4">
          ${opts
            .map(
              (n) => `
            <button type="button" class="choice-btn mono" data-num="${n}" style="font-size:1.6rem;">
              ${n}
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
          if (Number(btn.getAttribute('data-num')) === target) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(110);
            setFeedback(fb, 'correct', `To‘g‘ri! Jami ${target} ta.`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 650);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(15);
            setFeedback(fb, 'wrong', 'Qaytadan sanab ko‘ring!');
          }
        });
      });
    };

    render();
  },
};
