import { shuffle, setFeedback } from '../helpers.js';

const ROUNDS = [
  { words: ['Toshkent', 'Samarqand', 'Buxoro', 'Amudaryo'], odd: 'Amudaryo', why: 'Amudaryo — daryo, qolganlari shaharlar' },
  { words: ['Oltin', 'Kumush', 'Temir', 'Yog‘och'], odd: 'Yog‘och', why: 'Yog‘och metall emas' },
  { words: ['Bahor', 'Yoz', 'Kuz', 'Dushanba'], odd: 'Dushanba', why: 'Dushanba hafta kuni, qolganlari fasllar' },
  { words: ['Qalam', 'Daftar', 'Chizg‘ich', 'Yostiq'], odd: 'Yostiq', why: 'Yostiq o‘quv quroli emas' },
  { words: ['Uchburchak', 'Kvadrat', 'Doira', 'Santimetr'], odd: 'Santimetr', why: 'Santimetr o‘lchov birligi, shakl emas' },
  { words: ['Burgut', 'Qaldirg‘och', 'Turna', 'Delfin'], odd: 'Delfin', why: 'Delfin qush emas' },
  { words: ['Futbol', 'Shaxmat', 'Tennis', 'Soat'], odd: 'Soat', why: 'Soat sport turi emas' },
  { words: ['Mars', 'Venera', 'Yupiter', 'Oy'], odd: 'Oy', why: 'Oy Yerning yo‘ldoshi, sayyora emas' },
];

export default {
  init(container, engine) {
    const queue = shuffle(ROUNDS);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Barcha mantiqiy guruhlarni aniq tahlil qildingiz!');
        return;
      }
      locked = false;
      const q = queue[idx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Savol ${idx + 1} / ${queue.length}</span>
          <span>Ortiqchasini toping</span>
        </div>
        <h3 class="game-prompt">Qaysi so‘z umumiy guruhga kirmaydi?</h3>
        <div class="choice-grid">
          ${shuffle(q.words)
            .map(
              (w) => `<button type="button" class="choice-btn" data-w="${w}">${w}</button>`
            )
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          if (btn.getAttribute('data-w') === q.odd) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(120);
            setFeedback(fb, 'correct', `To‘g‘ri! ${q.why}.`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 800);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(20);
            setFeedback(fb, 'wrong', 'Uchta umumiy so‘zni ajratib ko‘ring.');
          }
        });
      });
    };

    render();
  },
};
