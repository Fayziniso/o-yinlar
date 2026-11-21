import { shuffle, setFeedback } from '../helpers.js';

const CIPHERS = [
  {
    type: 'Sezar shifri (+3 siljish)',
    cipher: 'ELOLP',
    clue: 'Har bir harf alifboda 3 ta oldinga surilgan (A→D, B→E...). Asl so‘zni toping:',
    answer: 'BILIM',
  },
  {
    type: 'Sezar shifri (+1 siljish)',
    cipher: 'LPE',
    clue: 'Har bir harf 1 ta oldinga surilgan (A→B, K→L...). Asl so‘z:',
    answer: 'KOD',
  },
  {
    type: 'Atbash shifri (A↔Z, B↔Y, C↔X...)',
    cipher: 'ZJO',
    clue: 'Alifbo teskari: A↔Z, Q↔J, L↔O. Asl o‘zbekcha so‘z:',
    answer: 'AQL',
  },
  {
    type: 'ASCII O‘nlik kod',
    cipher: '68  65  72  79',
    clue: 'A=65, B=66, C=67, D=68, H=72, O=79. Xabarni deshifrlang:',
    answer: 'DAHO',
  },
  {
    type: 'Teskari blok shifri',
    cipher: 'QITNAM',
    clue: 'Matn teskari tartibda yozilgan. Asl so‘zni kiriting:',
    answer: 'MANTIQ',
  },
  {
    type: 'XOR Bit operatsiyasi',
    cipher: '10110 XOR 01101',
    clue: 'Bir xil bitlar → 0, har xil bitlar → 1. Natijaviy 5-bitli kodni kiriting:',
    answer: '11011',
  },
];

export default {
  init(container, engine) {
    const queue = shuffle(CIPHERS);
    let idx = 0;

    const draw = () => {
      if (idx >= queue.length) {
        engine.finish('Barcha kriptografik shifrlarni muvaffaqiyatli deshifrladingiz!');
        return;
      }
      const c = queue[idx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Shifr ${idx + 1} / ${queue.length}</span>
          <span>${c.type}</span>
        </div>
        <div class="stimulus-box">
          <div class="stimulus-big">${c.cipher}</div>
          <p style="font-size:0.94rem; color:var(--text-secondary);">${c.clue}</p>
        </div>
        <form id="crForm" class="game-input-row">
          <input type="text" id="crInput" class="form-input" placeholder="Asl matnni kiriting..." autocomplete="off" style="text-transform:uppercase;" />
          <button type="submit" class="btn btn-primary">Deshifrlash</button>
        </form>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const form = container.querySelector('#crForm');
      const input = container.querySelector('#crInput');
      const fb = container.querySelector('#fb');
      input.focus();

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = input.value.trim().toUpperCase();
        if (!val) return;
        if (val === c.answer) {
          engine.addCorrect(180);
          setFeedback(fb, 'correct', `To‘g‘ri deshifrlandi: ${c.answer}`);
          window.setTimeout(() => {
            idx += 1;
            draw();
          }, 700);
        } else {
          engine.addWrong(25);
          setFeedback(fb, 'wrong', 'Shifr kalitini diqqat bilan qayta qo‘llang.');
          input.select();
        }
      });
    };

    draw();
  },
};
