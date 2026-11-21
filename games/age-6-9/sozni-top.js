import { shuffle, setFeedback } from '../helpers.js';

const WORDS = [
  { word: 'KITOB', clue: 'Bilim manbai, sahifalari bor va o‘qiladi.' },
  { word: 'QUYOSH', clue: 'Yerga nur va issiqlik beruvchi yulduz.' },
  { word: 'MAKTAB', clue: 'O‘quvchilar har kuni ta’lim oladigan maskan.' },
  { word: 'OLMA', clue: 'Bog‘da o‘sadigan shirin va foydali meva.' },
  { word: 'DARYO', clue: 'Uzoq masofaga oqib boradigan katta suv oqimi.' },
];

const ALPHABET = 'ABDEFGHIJKLMNOPQRSTUVXYZ'.split('');

export default {
  init(container, engine) {
    const queue = shuffle(WORDS).slice(0, 4);
    let idx = 0;

    const loadWord = () => {
      if (idx >= queue.length) {
        engine.finish('Barcha yashiringan so‘zlarni topdingiz!');
        return;
      }
      const item = queue[idx];
      const guessed = new Set();
      let lives = 6;

      const draw = () => {
        const display = item.word
          .split('')
          .map((ch) => (guessed.has(ch) ? ch : '_'))
          .join(' ');
        const solved = item.word.split('').every((ch) => guessed.has(ch));

        container.innerHTML = `
          <div class="game-round-header">
            <span class="mono">So‘z ${idx + 1} / ${queue.length}</span>
            <span class="mono">Urinishlar: ${lives}</span>
          </div>
          <div class="stimulus-box">
            <span style="font-size:0.9rem; color:var(--text-secondary);">Ishora: ${item.clue}</span>
            <div class="stimulus-big" style="letter-spacing:0.25em;">${display}</div>
          </div>
          <div class="numpad-row" style="max-width:560px;">
            ${ALPHABET.map((ch) => {
              const used = guessed.has(ch);
              const isHit = used && item.word.includes(ch);
              const bg = used
                ? isHit
                  ? 'background:var(--success-soft); border-color:var(--success); color:var(--success);'
                  : 'opacity:0.35;'
                : '';
              return `<button type="button" class="numpad-btn" data-ch="${ch}" ${used || solved ? 'disabled' : ''} style="${bg}">${ch}</button>`;
            }).join('')}
          </div>
          <div id="fb" class="game-feedback idle"></div>
        `;

        const fb = container.querySelector('#fb');
        container.querySelectorAll('[data-ch]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const ch = btn.getAttribute('data-ch');
            guessed.add(ch);
            if (item.word.includes(ch)) {
              engine.addCorrect(45);
              draw();
              if (item.word.split('').every((c) => guessed.has(c))) {
                engine.addBonus(100);
                setFeedback(container.querySelector('#fb'), 'correct', `Topdingiz! So‘z: ${item.word}`);
                window.setTimeout(() => {
                  idx += 1;
                  loadWord();
                }, 850);
              }
            } else {
              lives -= 1;
              engine.addWrong(15);
              draw();
              if (lives <= 0) {
                setFeedback(container.querySelector('#fb'), 'wrong', `To‘g‘ri so‘z: ${item.word}`);
                window.setTimeout(() => {
                  idx += 1;
                  loadWord();
                }, 1100);
              } else {
                setFeedback(container.querySelector('#fb'), 'wrong', `“${ch}” harfi bu so‘zda yo‘q.`);
              }
            }
          });
        });
      };

      draw();
    };

    loadWord();
  },
};
