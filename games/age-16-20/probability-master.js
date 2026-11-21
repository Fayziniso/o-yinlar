import { shuffle, setFeedback } from '../helpers.js';

const ITEMS = [
  {
    q: 'Ikkita adolatli zarni (kubikni) tashlaganda ochkolar yig‘indisi 7 bo‘lish ehtimolligi:',
    opts: ['1/6', '1/12', '1/9', '5/36'],
    ans: '1/6',
    exp: '36 ta teng imkoniyatdan 6 tasi (1+6, 2+5, 3+4, 4+3, 5+2, 6+1) yig‘indisi 7 beradi: 6/36 = 1/6.',
  },
  {
    q: 'Qutida 3 ta qizil va 2 ta ko‘k shar bor. Qaytarmasdan ketma-ket 2 ta qizil shar olish ehtimolligi:',
    opts: ['3/10', '9/25', '2/5', '1/5'],
    ans: '3/10',
    exp: '(3/5) × (2/4) = 6/20 = 3/10.',
  },
  {
    q: 'Tanga 3 marta tashlandi. Kamida bitta Gerb (Head) tushish ehtimolligi nechaga teng?',
    opts: ['7/8', '3/8', '1/2', '5/8'],
    ans: '7/8',
    exp: '1 − P(hech qaysi gerb emas) = 1 − (1/2)³ = 1 − 1/8 = 7/8.',
  },
  {
    q: '52 talik kartalar to‘plamidan tasodifiy 1 karta olindi. Uning Tuz (Ace) yoki Qarg‘a (Spade) bo‘lish ehtimolligi:',
    opts: ['4/13', '17/52', '1/4', '5/13'],
    ans: '4/13',
    exp: 'P(A ∪ B) = 4/52 + 13/52 − 1/52 = 16/52 = 4/13.',
  },
  {
    q: 'Sinfda 60% o‘quvchi ingliz tilini, 40% nemis tilini, 20% esa ikkalasini biladi. Tasodifiy o‘quvchi kamida bitta til bilish ehtimolligi:',
    opts: ['80%', '100%', '70%', '60%'],
    ans: '80%',
    exp: '60% + 40% − 20% = 80%.',
  },
  {
    q: 'Biror hodisa ro‘y berish ehtimolligi 0.25 bo‘lsa, 20 ta mustaqil tajribada kutilayotgan muvaffaqiyatlar soni (E[X]):',
    opts: ['5', '4', '8', '2.5'],
    ans: '5',
    exp: 'Binomial kutilma: E[X] = n × p = 20 × 0.25 = 5.',
  },
];

export default {
  init(container, engine) {
    const queue = shuffle(ITEMS);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Ehtimollik nazariyasida kuchli tahliliy qobiliyat ko‘rsatdingiz!');
        return;
      }
      locked = false;
      const item = queue[idx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Masala ${idx + 1} / ${queue.length}</span>
          <span>Probability Master</span>
        </div>
        <div class="stimulus-box">
          <p style="font-size:1.06rem; font-weight:600;">${item.q}</p>
        </div>
        <div class="choice-grid">
          ${shuffle(item.opts)
            .map((o) => `<button type="button" class="choice-btn mono" data-o="${o}" style="font-size:1.25rem;">${o}</button>`)
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          if (btn.getAttribute('data-o') === item.ans) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(165);
            setFeedback(fb, 'correct', `Aniq! ${item.exp}`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 950);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(25);
            setFeedback(fb, 'wrong', 'Ehtimollik formulasini qayta tekshiring.');
          }
        });
      });
    };

    render();
  },
};
