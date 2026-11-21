import { shuffle, setFeedback } from '../helpers.js';

export default {
  init(container, engine) {
    const secret = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
    const maxTries = 9;
    const attempts = [];

    const check = (guess) => {
      let bulls = 0;
      let cows = 0;
      for (let i = 0; i < 4; i++) {
        if (guess[i] === secret[i]) bulls++;
        else if (secret.includes(guess[i])) cows++;
      }
      return { bulls, cows };
    };

    const draw = () => {
      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Urinish: ${attempts.length} / ${maxTries}</span>
          <span>4 ta har xil raqam (0–9)</span>
        </div>
        <h3 class="game-prompt">4 xonali maxfiy kodni buzib oching</h3>
        <form id="cbForm" class="game-input-row">
          <input type="text" id="cbInput" class="form-input" maxlength="4" placeholder="Masalan: 1582" autocomplete="off" />
          <button type="submit" class="btn btn-primary">Tekshirish</button>
        </form>
        <div id="fb" class="game-feedback idle"></div>
        <div style="width:100%; max-width:540px; display:flex; flex-direction:column; gap:8px;">
          ${attempts
            .map(
              (a, i) => `
            <div style="display:flex; justify-content:space-between; padding:10px 14px; border-radius:10px; background:var(--bg-subtle);">
              <span class="mono" style="font-weight:700;">#${attempts.length - i} · ${a.guess.join('')}</span>
              <span style="font-size:0.86rem;">To‘g‘ri o‘rinda: <strong style="color:var(--success);">${a.bulls}</strong> · Boshqa o‘rinda: <strong style="color:var(--warning);">${a.cows}</strong></span>
            </div>`
            )
            .join('')}
        </div>
      `;

      const form = container.querySelector('#cbForm');
      const input = container.querySelector('#cbInput');
      const fb = container.querySelector('#fb');
      input.focus();

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const raw = input.value.trim();
        if (!/^\d{4}$/.test(raw)) {
          setFeedback(fb, 'wrong', 'Aynan 4 ta raqam kiriting.');
          return;
        }
        const guess = raw.split('').map(Number);
        if (new Set(guess).size < 4) {
          setFeedback(fb, 'wrong', 'Barcha 4 raqam har xil bo‘lishi kerak!');
          return;
        }
        const res = check(guess);
        attempts.unshift({ guess, ...res });
        if (res.bulls === 4) {
          engine.addCorrect(420 + (maxTries - attempts.length) * 65);
          draw();
          setFeedback(container.querySelector('#fb'), 'correct', `Kod ochildi: ${secret.join('')}`);
          window.setTimeout(() => engine.finish(`4 xonali kodni ${attempts.length} urinishda topdingiz!`), 850);
          return;
        }
        engine.addWrong(10);
        if (attempts.length >= maxTries) {
          draw();
          setFeedback(container.querySelector('#fb'), 'wrong', `Kod: ${secret.join('')}`);
          window.setTimeout(() => engine.finish(`Urinishlar tugadi. Maxfiy kod ${secret.join('')} edi.`), 1200);
        } else {
          draw();
        }
      });
    };

    draw();
  },
};
