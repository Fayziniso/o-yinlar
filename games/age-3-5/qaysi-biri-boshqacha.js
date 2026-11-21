import { shuffle, setFeedback } from '../helpers.js';

const ROUNDS = [
  { items: ['🍎', '🍌', '🍇', '🚗'], odd: '🚗', reason: 'Mashina meva emas' },
  { items: ['🐶', '🐱', '🐰', '✈️'], odd: '✈️', reason: 'Samolyot hayvon emas' },
  { items: ['🌞', '🌙', '⭐', '🍔'], odd: '🍔', reason: 'Burger osmon jismi emas' },
  { items: ['🥕', '🍅', '🥒', '🎸'], odd: '🎸', reason: 'Gitara sabzavot emas' },
  { items: ['🚲', '🚌', '🚂', '🌻'], odd: '🌻', reason: 'Kungaboqar transport emas' },
  { items: ['🧤', '👟', '🧢', '🐟'], odd: '🐟', reason: 'Baliq kiyim emas' },
  { items: ['📘', '✏️', '🎒', '🍕'], odd: '🍕', reason: 'Pitsa o‘quv quroli emas' },
];

export default {
  init(container, engine) {
    const queue = shuffle(ROUNDS);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Barcha boshqacha buyumlarni topdingiz!');
        return;
      }
      locked = false;
      const q = queue[idx];
      const opts = shuffle(q.items);

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Bosqich ${idx + 1} / ${queue.length}</span>
          <span>Boshqachasini toping</span>
        </div>
        <h3 class="game-prompt">Qaysi biri qolganlariga o‘xshamaydi?</h3>
        <div class="choice-grid">
          ${opts
            .map(
              (em) => `
            <button type="button" class="choice-btn" data-val="${em}" style="min-height:112px; font-size:2.8rem;">
              ${em}
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
          if (btn.getAttribute('data-val') === q.odd) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(115);
            setFeedback(fb, 'correct', `To‘g‘ri! ${q.reason}.`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 750);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(15);
            setFeedback(fb, 'wrong', 'Boshqa rasmni tekshiring!');
          }
        });
      });
    };

    render();
  },
};
