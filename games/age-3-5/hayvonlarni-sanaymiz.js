import { shuffle, randInt, setFeedback } from '../helpers.js';

const ANIMALS = [
  { name: 'quyoncha', emoji: '🐰' },
  { name: 'ayiqcha', emoji: '🐻' },
  { name: 'tulki', emoji: '🦊' },
  { name: 'kuchukcha', emoji: '🐶' },
  { name: 'mushukcha', emoji: '🐱' },
];

export default {
  init(container, engine) {
    const total = 7;
    let round = 0;
    let locked = false;

    const render = () => {
      if (round >= total) {
        engine.finish('O‘rmondagi barcha hayvonlarni aniq sanab chiqdingiz!');
        return;
      }
      locked = false;
      const picked = shuffle(ANIMALS);
      const target = picked[0];
      const other = picked[1];
      const targetCount = randInt(2, 7);
      const otherCount = randInt(2, 5);
      const field = shuffle([
        ...Array(targetCount).fill(target.emoji),
        ...Array(otherCount).fill(other.emoji),
      ]);

      const wrongNums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => n !== targetCount)).slice(0, 3);
      const opts = shuffle([targetCount, ...wrongNums]);

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Maydoncha ${round + 1} / ${total}</span>
          <span>Diqqat bilan sanang</span>
        </div>
        <h3 class="game-prompt">Maydonchada nechta ${target.emoji} (${target.name}) bor?</h3>
        <div class="stimulus-box" style="flex-direction:row; flex-wrap:wrap; gap:14px; font-size:2.3rem;">
          ${field.map((e) => `<span>${e}</span>`).join('')}
        </div>
        <div class="choice-grid cols-4">
          ${opts
            .map(
              (n) => `<button type="button" class="choice-btn mono" data-num="${n}" style="font-size:1.5rem;">${n}</button>`
            )
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          if (Number(btn.getAttribute('data-num')) === targetCount) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(120);
            setFeedback(fb, 'correct', `To‘g‘ri! ${targetCount} ta ${target.name} bor.`);
            window.setTimeout(() => {
              round += 1;
              render();
            }, 650);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(15);
            setFeedback(fb, 'wrong', `Faqat ${target.emoji} larni sanab chiqing!`);
          }
        });
      });
    };

    render();
  },
};
