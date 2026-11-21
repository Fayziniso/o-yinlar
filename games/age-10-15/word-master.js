import { pickOne, setFeedback } from '../helpers.js';

const WORDS = [
  { word: 'KITOB', hint: 'O‘qish va bilim olish manbai' },
  { word: 'DARYO', hint: 'Katta oqar suv' },
  { word: 'BAHOR', hint: 'Yilning eng gullagan fasli' },
  { word: 'DUNYO', hint: 'Yer yuzi, olam' },
  { word: 'BILIM', hint: 'O‘qish orqali orttiriladigan boylik' },
  { word: 'OSMON', hint: 'Bulutlar suzadigan moviy kenglik' },
  { word: 'VATAN', hint: 'Inson tug‘ilib o‘sgan yurt' },
];

export default {
  init(container, engine) {
    const targetObj = pickOne(WORDS);
    const target = targetObj.word;
    const maxRows = 6;
    const guesses = [];

    const scoreGuess = (guess) => {
      const res = Array(5).fill('absent');
      const counts = {};
      for (const ch of target) counts[ch] = (counts[ch] || 0) + 1;

      for (let i = 0; i < 5; i++) {
        if (guess[i] === target[i]) {
          res[i] = 'exact';
          counts[guess[i]] -= 1;
        }
      }
      for (let i = 0; i < 5; i++) {
        if (res[i] === 'absent' && counts[guess[i]] > 0) {
          res[i] = 'present';
          counts[guess[i]] -= 1;
        }
      }
      return res;
    };

    const draw = () => {
      const rowsHtml = [];
      for (let r = 0; r < maxRows; r++) {
        const g = guesses[r];
        const cells = [];
        for (let c = 0; c < 5; c++) {
          const ch = g ? g.word[c] : '';
          const st = g ? g.status[c] : '';
          let style = 'background:var(--bg-subtle); color:var(--text-primary); border:2px solid var(--border-hairline);';
          if (st === 'exact') style = 'background:#16a34a; color:#fff; border:2px solid #16a34a;';
          else if (st === 'present') style = 'background:#d97706; color:#fff; border:2px solid #d97706;';
          else if (st === 'absent') style = 'background:#475569; color:#fff; border:2px solid #475569;';
          cells.push(`<div class="mono" style="width:52px; height:52px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.35rem; font-weight:800; ${style}">${ch}</div>`);
        }
        rowsHtml.push(`<div style="display:flex; gap:8px;">${cells.join('')}</div>`);
      }

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Urinish: ${guesses.length} / ${maxRows}</span>
          <span>Ishora: ${targetObj.hint}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">${rowsHtml.join('')}</div>
        <form id="wmForm" class="game-input-row">
          <input type="text" id="wmInput" class="form-input" maxlength="5" placeholder="5 harfli so‘z..." autocomplete="off" style="text-transform:uppercase;" />
          <button type="submit" class="btn btn-primary">Yuborish</button>
        </form>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const form = container.querySelector('#wmForm');
      const input = container.querySelector('#wmInput');
      const fb = container.querySelector('#fb');
      input.focus();

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const word = input.value.trim().toUpperCase();
        if (!/^[A-Z]{5}$/.test(word)) {
          setFeedback(fb, 'wrong', 'Aynan 5 ta lotin harfidan iborat so‘z kiriting.');
          return;
        }
        const status = scoreGuess(word);
        guesses.push({ word, status });

        if (word === target) {
          engine.addCorrect(400 + (maxRows - guesses.length) * 80);
          draw();
          setFeedback(container.querySelector('#fb'), 'correct', `Topdingiz! So‘z: ${target}`);
          window.setTimeout(
            () => engine.finish(`“${target}” so‘zini ${guesses.length} urinishda topdingiz!`),
            850
          );
          return;
        }
        engine.addWrong(15);
        if (guesses.length >= maxRows) {
          draw();
          setFeedback(container.querySelector('#fb'), 'wrong', `Yashiringan so‘z: ${target}`);
          window.setTimeout(() => engine.finish(`Yashiringan so‘z “${target}” edi.`), 1200);
        } else {
          draw();
        }
      });
    };

    draw();
  },
};
