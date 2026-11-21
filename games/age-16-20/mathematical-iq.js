import { shuffle, setFeedback } from '../helpers.js';

const ITEMS = [
  {
    q: 'log₂(64) + log₃(27) ifodaning qiymatini toping:',
    opts: ['9', '8', '10', '7'],
    ans: '9',
    exp: 'log₂(64) = 6 va log₃(27) = 3, yig‘indi = 9.',
  },
  {
    q: '2×2 matritsa [[4, 3], [2, 5]] ning determinanti nechaga teng?',
    opts: ['14', '26', '10', '16'],
    ans: '14',
    exp: 'det = 4×5 − 3×2 = 20 − 6 = 14.',
  },
  {
    q: '6 ta har xil kitobdan 2 tasini tartibini hisobga olmasdan necha xil usulda tanlash mumkin? C(6, 2)',
    opts: ['15', '30', '12', '20'],
    ans: '15',
    exp: 'C(6,2) = (6 × 5) / 2 = 15.',
  },
  {
    q: 'Agar 3ˣ = 81 va 2ʸ = 32 bo‘lsa, x + y nechaga teng?',
    opts: ['9', '8', '10', '7'],
    ans: '9',
    exp: 'x = 4, y = 5, demak x + y = 9.',
  },
  {
    q: '2¹⁰ mod 7 (1024 ni 7 ga bo‘lgandagi qoldiq) nechaga teng?',
    opts: ['2', '1', '4', '3'],
    ans: '2',
    exp: '2³ ≡ 1 (mod 7), shuning uchun 2¹⁰ = (2³)³ × 2 ≡ 2 (mod 7).',
  },
  {
    q: 'Agar x + 1/x = 4 bo‘lsa, x² + 1/x² ning qiymatini toping:',
    opts: ['14', '16', '12', '18'],
    ans: '14',
    exp: '(x + 1/x)² = x² + 2 + 1/x² = 16 ⇒ x² + 1/x² = 14.',
  },
  {
    q: '1 dan 100 gacha barcha natural sonlar yig‘indisi nechaga teng?',
    opts: ['5050', '5000', '4950', '5150'],
    ans: '5050',
    exp: 'Gauss formulasi: n(n+1)/2 = 100 × 101 / 2 = 5050.',
  },
  {
    q: 'Geometrik progressiya: 3, 6, 12, ... ning dastlabki 5 ta hadi yig‘indisi:',
    opts: ['93', '96', '90', '87'],
    ans: '93',
    exp: '3 + 6 + 12 + 24 + 48 = 93.',
  },
];

export default {
  init(container, engine) {
    const queue = shuffle(ITEMS);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Mathematical IQ sinovini yuqori ko‘rsatkich bilan yakunladingiz!');
        return;
      }
      locked = false;
      const item = queue[idx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Masala ${idx + 1} / ${queue.length}</span>
          <span>Mathematical IQ</span>
        </div>
        <div class="stimulus-box">
          <p style="font-size:1.12rem; font-weight:600;">${item.q}</p>
        </div>
        <div class="choice-grid">
          ${shuffle(item.opts)
            .map((o) => `<button type="button" class="choice-btn mono" data-o="${o}" style="font-size:1.3rem;">${o}</button>`)
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
            engine.addCorrect(160);
            setFeedback(fb, 'correct', `Aniq! ${item.exp}`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 900);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(25);
            setFeedback(fb, 'wrong', 'Qayta hisoblab ko‘ring.');
          }
        });
      });
    };

    render();
  },
};
