import { shuffle, setFeedback } from '../helpers.js';

const CASES = [
  {
    q: 'Orol aholisi ikki xil: Ritsarlar (faqat rost gapiradi) va Yolg‘onchilar (faqat yolg‘on gapiradi). A: “Men yolg‘onchiman yoki B ritsar” deydi. A va B kimlar?',
    opts: ['Ikkalasi ham ritsar', 'A yolg‘onchi, B ritsar', 'A ritsar, B yolg‘onchi', 'Ikkalasi ham yolg‘onchi'],
    ans: 'Ikkalasi ham ritsar',
    exp: 'Agar A yolg‘onchi bo‘lsa, “Men yolg‘onchiman” qismi rost bo‘lib qolar edi (ziddiyat). Demak A ritsar, shuning uchun B ham ritsar!',
  },
  {
    q: 'Barcha dasturchilar mantiqni biladi. Ba’zi talabalar dasturchi. Quyidagi qaysi xulosa mantiqan MUTLAQ to‘g‘ri?',
    opts: [
      'Ba’zi talabalar mantiqni biladi',
      'Barcha talabalar mantiqni biladi',
      'Mantiqni biladiganlarning hammasi dasturchi',
      'Hech bir talaba dasturchi emas',
    ],
    ans: 'Ba’zi talabalar mantiqni biladi',
    exp: 'Sillogizm qoidasiga ko‘ra dasturchi bo‘lgan talabalar albatta mantiqni biladi.',
  },
  {
    q: 'Uchta quti bor: “Olma”, “Banan”, “Aralash”. Barcha yorliqlar NOTO‘G‘RI yopishtirilgan. Faqat bitta qutidan bitta meva olib hammasini aniq bilish uchun qaysi qutini ochish kerak?',
    opts: ['“Aralash” yozilgan qutini', '“Olma” yozilgan qutini', '“Banan” yozilgan qutini', 'Bitta urinish yetarli emas'],
    ans: '“Aralash” yozilgan qutini',
    exp: '“Aralash” yorlig‘i noto‘g‘ri bo‘lgani uchun unda faqat bir xil meva bor — shundan qolgan ikki quti ham bir qiymatli aniqlanadi.',
  },
  {
    q: 'Agar P → Q (P bo‘lsa Q bo‘ladi) rost va Q yolg‘on bo‘lsa, P haqida nima deyish mumkin?',
    opts: ['P albatta yolg‘on (Modus Tollens)', 'P albatta rost', 'P rost ham, yolg‘on ham bo‘lishi mumkin', 'Aniqlab bo‘lmaydi'],
    ans: 'P albatta yolg‘on (Modus Tollens)',
    exp: 'Kontrapozitsiya qoidasi: (P → Q) va ¬Q dan ¬P kelib chiqadi.',
  },
  {
    q: 'To‘rt kishidan faqat bittasi rost gapiradi. A: “B aybdor.” B: “C aybdor.” C: “B yolg‘on gapiryapti.” D: “Men aybdor emasman.” Kim aybdor?',
    opts: ['D aybdor', 'A aybdor', 'B aybdor', 'C aybdor'],
    ans: 'D aybdor',
    exp: 'B va C bir-biriga zid — demak ulardan biri rost. Qolgan A va D yolg‘on gapirmoqda. D “Men aybdor emasman” deb yolg‘on gapirsa, D aybdor!',
  },
];

export default {
  init(container, engine) {
    const queue = shuffle(CASES);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Deduktiv tergovda barcha mantiqiy jumboqlarni fosh qildingiz!');
        return;
      }
      locked = false;
      const c = queue[idx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Tergov ${idx + 1} / ${queue.length}</span>
          <span>Logic Detective</span>
        </div>
        <div class="stimulus-box">
          <p style="font-size:1.05rem; font-weight:600; line-height:1.6;">${c.q}</p>
        </div>
        <div class="choice-grid">
          ${shuffle(c.opts)
            .map((o) => `<button type="button" class="choice-btn" data-o="${o}" style="font-size:0.95rem;">${o}</button>`)
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          if (btn.getAttribute('data-o') === c.ans) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(190);
            setFeedback(fb, 'correct', `To‘g‘ri! ${c.exp}`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 1300);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(30);
            setFeedback(fb, 'wrong', 'Mantiqiy ziddiyat bor — qayta tahlil qiling.');
          }
        });
      });
    };

    render();
  },
};
