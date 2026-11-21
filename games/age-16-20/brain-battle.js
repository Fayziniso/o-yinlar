import { shuffle, setFeedback } from '../helpers.js';

const BLITZ_ROUNDS = [
  { tag: 'Matematika', q: '17 × 6 − 12 nechaga teng?', opts: ['90', '92', '88', '102'], ans: '90' },
  { tag: 'Ikkilik sanoq', q: '101101₂ sonining o‘nlik qiymati:', opts: ['45', '43', '47', '41'], ans: '45' },
  { tag: 'Mantiq', q: 'Barcha A lar B, hech bir B C emas. U holda A va C:', opts: ['Kesishmaydi', 'Teng', 'Ba’zi A lar C', 'Aniqlanmaydi'], ans: 'Kesishmaydi' },
  { tag: 'Ketma-ketlik', q: '5, 11, 23, 47, ? — keyingi son:', opts: ['95', '94', '93', '96'], ans: '95' },
  { tag: 'Algoritm', q: 'Quick Sort ning o‘rtacha murakkabligi:', opts: ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)'], ans: 'O(n log n)' },
  { tag: 'Geometriya', q: 'Muntazam oltiburchakning ichki burchaklari yig‘indisi:', opts: ['720°', '540°', '600°', '900°'], ans: '720°' },
  { tag: 'Ehtimollik', q: 'Zarni tashlaganda 4 dan katta son tushish ehtimolligi:', opts: ['1/3', '1/2', '1/6', '2/3'], ans: '1/3' },
  { tag: 'Kriptografiya', q: 'Sezar (+2) shifri bilan “CSN” qaysi so‘z? (A→C, Q→S, L→N)', opts: ['AQL', 'AQN', 'AOL', 'BAL'], ans: 'AQL' },
  { tag: 'Algebra', q: 'Agar 2ˣ⁺¹ = 64 bo‘lsa, x nechaga teng?', opts: ['5', '6', '4', '7'], ans: '5' },
  { tag: 'Dasturlash', q: '[1, 2, 3, 4].reduce((a, b) => a + b, 10) natijasi:', opts: ['20', '10', '24', '14'], ans: '20' },
];

export default {
  init(container, engine) {
    const rounds = shuffle(BLITZ_ROUNDS);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= rounds.length) {
        engine.finish('Brain Battle — barcha 10 ta aralash intellektual raunddan o‘tdingiz!');
        return;
      }
      locked = false;
      const r = rounds[idx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Raund ${idx + 1} / ${rounds.length}</span>
          <span>Yo‘nalish: ${r.tag}</span>
        </div>
        <div class="stimulus-box">
          <p style="font-size:1.15rem; font-weight:700;">${r.q}</p>
        </div>
        <div class="choice-grid">
          ${shuffle(r.opts)
            .map((o) => `<button type="button" class="choice-btn" data-o="${o}">${o}</button>`)
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          if (btn.getAttribute('data-o') === r.ans) {
            btn.classList.add('is-correct');
            engine.addCorrect(145);
            setFeedback(fb, 'correct', 'To‘g‘ri! Keyingi raund!');
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(30);
            setFeedback(fb, 'wrong', `To‘g‘ri javob: ${r.ans}`);
          }
          window.setTimeout(() => {
            idx += 1;
            render();
          }, 700);
        });
      });
    };

    render();
  },
};
