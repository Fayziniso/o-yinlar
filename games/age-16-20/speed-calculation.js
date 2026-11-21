import { randInt, setFeedback } from '../helpers.js';

export default {
  init(container, engine) {
    let timeLeft = 45;
    let timerId = null;
    let current = null;

    const makeProblem = () => {
      const mode = randInt(1, 4);
      if (mode === 1) {
        const a = randInt(11, 24);
        const b = randInt(3, 12);
        return { text: `${a} × ${b} = ?`, ans: a * b };
      }
      if (mode === 2) {
        const n = randInt(11, 25);
        return { text: `${n}² = ?`, ans: n * n };
      }
      if (mode === 3) {
        const pct = [10, 20, 25, 50][randInt(0, 3)];
        const base = randInt(2, 18) * 20;
        return { text: `${base} ning ${pct}% i = ?`, ans: Math.round((base * pct) / 100) };
      }
      const a = randInt(120, 480);
      const b = randInt(35, 195);
      return { text: `${a} − ${b} = ?`, ans: a - b };
    };

    const next = () => {
      current = makeProblem();
      draw();
    };

    const draw = () => {
      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Qolgan vaqt: <strong id="scTimer">${timeLeft}s</strong></span>
          <span>Speed Calculation</span>
        </div>
        <div class="stimulus-box">
          <div class="stimulus-big">${current.text}</div>
        </div>
        <form id="scForm" class="game-input-row">
          <input type="number" id="scInput" class="form-input" placeholder="Javob..." required />
          <button type="submit" class="btn btn-primary">OK</button>
        </form>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const form = container.querySelector('#scForm');
      const input = container.querySelector('#scInput');
      const fb = container.querySelector('#fb');
      input.focus();

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value.trim() === '') return;
        const val = Number(input.value);
        if (val === current.ans) {
          engine.addCorrect(110);
          next();
        } else {
          engine.addWrong(25);
          setFeedback(fb, 'wrong', 'Noto‘g‘ri! Qayta hisoblang.');
          input.select();
        }
      });
    };

    timerId = window.setInterval(() => {
      if (engine.state !== 'PLAYING') return;
      timeLeft -= 1;
      const el = container.querySelector('#scTimer');
      if (el) el.textContent = `${timeLeft}s`;
      if (timeLeft <= 0) {
        window.clearInterval(timerId);
        engine.finish(`45 soniyada ${engine.correct} ta murakkab hisobni aniq yechdingiz!`);
      }
    }, 1000);

    next();
    return () => {
      if (timerId) window.clearInterval(timerId);
    };
  },
};
