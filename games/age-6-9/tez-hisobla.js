import { shuffle, randInt, setFeedback } from '../helpers.js';

export default {
  init(container, engine) {
    let timeLeft = 35;
    let intervalId = null;
    let current = null;

    const nextQ = () => {
      const mode = randInt(1, 3);
      let a, b, ans, text;
      if (mode === 1) {
        a = randInt(4, 25);
        b = randInt(3, 20);
        ans = a + b;
        text = `${a} + ${b} = ?`;
      } else if (mode === 2) {
        a = randInt(12, 40);
        b = randInt(3, a - 1);
        ans = a - b;
        text = `${a} − ${b} = ?`;
      } else {
        a = randInt(2, 9);
        b = randInt(2, 9);
        ans = a * b;
        text = `${a} × ${b} = ?`;
      }
      const dist = new Set();
      while (dist.size < 3) {
        const c = ans + randInt(-7, 7);
        if (c >= 0 && c !== ans) dist.add(c);
      }
      current = { text, ans, opts: shuffle([ans, ...dist]) };
      render();
    };

    const render = () => {
      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Qolgan vaqt: <strong id="blitzTimer">${timeLeft}s</strong></span>
          <span>Tez hisobla!</span>
        </div>
        <div class="stimulus-box">
          <div class="stimulus-big">${current.text}</div>
        </div>
        <div class="choice-grid">
          ${current.opts
            .map(
              (o) => `<button type="button" class="choice-btn mono" data-v="${o}" style="font-size:1.4rem;">${o}</button>`
            )
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (Number(btn.getAttribute('data-v')) === current.ans) {
            engine.addCorrect(85);
            nextQ();
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(20);
            setFeedback(fb, 'wrong', 'Noto‘g‘ri! Diqqat qiling.');
          }
        });
      });
    };

    intervalId = window.setInterval(() => {
      if (engine.state !== 'PLAYING') return;
      timeLeft -= 1;
      const el = container.querySelector('#blitzTimer');
      if (el) el.textContent = `${timeLeft}s`;
      if (timeLeft <= 0) {
        window.clearInterval(intervalId);
        engine.finish(`35 soniya ichida ${engine.correct} ta misolni to‘g‘ri yechdingiz!`);
      }
    }, 1000);

    nextQ();

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  },
};
