import { shuffle, setFeedback } from '../helpers.js';

export default {
  init(container, engine) {
    const secret = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
    const maxAttempts = 8;
    const history = [];

    const evaluate = (guess) => {
      let exact = 0;
      let misplaced = 0;
      for (let i = 0; i < 3; i++) {
        if (guess[i] === secret[i]) exact += 1;
        else if (secret.includes(guess[i])) misplaced += 1;
      }
      return { exact, misplaced };
    };

    const draw = () => {
      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Urinishlar: ${history.length} / ${maxAttempts}</span>
          <span>3 xonali takrorlanmas raqamli kod (1–9)</span>
        </div>
        <h3 class="game-prompt">Maxfiy qulf kodini oching</h3>
        <form id="codeForm" class="game-input-row">
          <input type="text" id="codeInput" class="form-input" maxlength="3" placeholder="Masalan: 472" autocomplete="off" />
          <button type="submit" class="btn btn-primary">Tekshirish</button>
        </form>
        <div id="fb" class="game-feedback idle"></div>
        <div style="width:100%; max-width:520px; display:flex; flex-direction:column; gap:8px;">
          ${history
            .map(
              (h, i) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; border-radius:10px; background:var(--bg-subtle);">
              <span class="mono" style="font-weight:700; font-size:1.1rem;">#${i + 1} · ${h.guess.join('')}</span>
              <span style="font-size:0.88rem;">To‘g‘ri joyda: <strong>${h.exact}</strong> · Boshqa joyda: <strong>${h.misplaced}</strong></span>
            </div>`
            )
            .join('')}
        </div>
      `;

      const form = container.querySelector('#codeForm');
      const input = container.querySelector('#codeInput');
      const fb = container.querySelector('#fb');
      input.focus();

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const raw = input.value.trim();
        if (!/^[1-9]{3}$/.test(raw)) {
          setFeedback(fb, 'wrong', '1 dan 9 gacha bo‘lgan 3 ta raqam kiriting.');
          return;
        }
        const guess = raw.split('').map(Number);
        if (new Set(guess).size < 3) {
          setFeedback(fb, 'wrong', 'Raqamlar takrorlanmasligi kerak!');
          return;
        }
        const res = evaluate(guess);
        history.unshift({ guess, ...res });

        if (res.exact === 3) {
          engine.addCorrect(350 + Math.max(0, (maxAttempts - history.length) * 60));
          draw();
          setFeedback(container.querySelector('#fb'), 'correct', `Qulf ochildi! Kod: ${secret.join('')}`);
          window.setTimeout(
            () => engine.finish(`Maxfiy kodni ${history.length} urinishda ochdingiz!`),
            850
          );
          return;
        }

        engine.addWrong(10);
        if (history.length >= maxAttempts) {
          draw();
          setFeedback(container.querySelector('#fb'), 'wrong', `Urinishlar tugadi. Kod: ${secret.join('')}`);
          window.setTimeout(
            () => engine.finish(`Maxfiy kod ${secret.join('')} edi. Keyingi safar albatta ochasiz!`),
            1200
          );
        } else {
          draw();
        }
      });
    };

    draw();
  },
};
