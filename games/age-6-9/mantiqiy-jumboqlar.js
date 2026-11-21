import { shuffle, setFeedback } from '../helpers.js';

const RIDDLES = [
  {
    q: 'Qaysi oyda 28 kun bor?',
    opts: ['Barcha 12 oyda', 'Faqat fevralda', 'Faqat yanvarda', 'Faqat iyunda'],
    ans: 'Barcha 12 oyda',
    exp: 'Har bir oyda kamida 28 kun mavjud!',
  },
  {
    q: 'Uchta qo‘y va ikkita tovuqning jami nechta oyog‘i bor?',
    opts: ['16 ta', '14 ta', '12 ta', '18 ta'],
    ans: '16 ta',
    exp: '3 × 4 + 2 × 2 = 12 + 4 = 16.',
  },
  {
    q: 'Qo‘lsiz, oyoqsiz, lekin eshikni ochadi. Bu nima?',
    opts: ['Shamol', 'Soat', 'Qalam', 'Kalit'],
    ans: 'Shamol',
    exp: 'Shamol esib eshikni ocha oladi.',
  },
  {
    q: 'Alining 4 ta akasi bor. Har bir akaning bitta singlisi bor. Oilada jami nechta farzand bor?',
    opts: ['6 ta', '9 ta', '5 ta', '8 ta'],
    ans: '6 ta',
    exp: 'Ali + 4 aka + 1 singil = 6 nafar farzand.',
  },
  {
    q: '1 kg temir og‘irmi yoki 1 kg paxtami?',
    opts: ['Ikkalasi teng', 'Temir og‘ir', 'Paxta og‘ir', 'Aniqlab bo‘lmaydi'],
    ans: 'Ikkalasi teng',
    exp: 'Ikkalasining vazni ham aynan 1 kilogramm!',
  },
  {
    q: 'Stolda 5 ta sham yonib turibdi. 2 tasi o‘chirildi. Oxirida nechta sham qoladi?',
    opts: ['2 ta', '3 ta', '5 ta', '0 ta'],
    ans: '2 ta',
    exp: 'Yonib turgan 3 tasi erib tugaydi, o‘chirilgan 2 tasi qoladi!',
  },
  {
    q: 'Qaysi savolga hech qachon “Ha” deb to‘g‘ri javob berib bo‘lmaydi?',
    opts: ['Sen uxlayapsanmi?', 'Soat nechchi?', 'Isming nima?', 'Bugun yomg‘irmi?'],
    ans: 'Sen uxlayapsanmi?',
    exp: 'Uxlayotgan odam javob bera olmaydi.',
  },
];

export default {
  init(container, engine) {
    const queue = shuffle(RIDDLES);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Zukkoligingizga qoyil! Barcha mantiqiy jumboqlarni yechdingiz.');
        return;
      }
      locked = false;
      const r = queue[idx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Jumboq ${idx + 1} / ${queue.length}</span>
          <span>Mantiqiy fikrlang</span>
        </div>
        <div class="stimulus-box">
          <h3 class="game-prompt" style="font-size:1.35rem;">${r.q}</h3>
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
          if (btn.getAttribute('data-o') === r.ans) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(135);
            setFeedback(fb, 'correct', `To‘g‘ri! ${r.exp}`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 950);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(20);
            setFeedback(fb, 'wrong', 'Yana bir bor diqqat bilan o‘ylab ko‘ring.');
          }
        });
      });
    };

    render();
  },
};
