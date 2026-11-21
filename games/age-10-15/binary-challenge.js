import { randInt, setFeedback } from '../helpers.js';

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

export default {
  init(container, engine) {
    const total = 7;
    let round = 0;
    let target = 0;
    let bits = Array(8).fill(0);

    const startRound = () => {
      if (round >= total) {
        engine.finish('Ikkilik sanoq tizimini mukammal o‘zlashtirdingiz!');
        return;
      }
      target = round < 3 ? randInt(5, 31) : randInt(32, 220);
      bits = Array(8).fill(0);
      draw();
    };

    const currentSum = () => bits.reduce((acc, b, i) => acc + (b ? WEIGHTS[i] : 0), 0);

    const draw = () => {
      const sum = currentSum();
      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Bosqich ${round + 1} / ${total}</span>
          <span>8-bit Ikkilik o‘zgartirish</span>
        </div>
        <div class="stimulus-box">
          <span style="font-size:0.9rem; color:var(--text-secondary);">Maqsadli o‘nlik son:</span>
          <div class="stimulus-big">${target}</div>
          <span class="mono" style="font-size:0.95rem; color:${sum === target ? 'var(--success)' : 'var(--text-muted)'};">Joriy yig‘indi: ${sum} (${bits.join('')})</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(8, minmax(38px, 64px)); gap:8px; width:100%; max-width:600px; justify-content:center;">
          ${WEIGHTS.map(
            (w, i) => `
            <button type="button" class="choice-btn mono ${bits[i] ? 'selected' : ''}" data-i="${i}" style="min-height:78px; padding:8px 4px;">
              <span style="font-size:0.72rem; color:var(--text-muted);">${w}</span>
              <strong style="font-size:1.35rem;">${bits[i]}</strong>
            </button>`
          ).join('')}
        </div>
        <button type="button" id="submitBinBtn" class="btn btn-primary">Tekshirish</button>
        <div id="fb" class="game-feedback idle"></div>
      `;

      container.querySelectorAll('[data-i]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const i = Number(btn.getAttribute('data-i'));
          bits[i] = bits[i] ? 0 : 1;
          draw();
        });
      });

      container.querySelector('#submitBinBtn').addEventListener('click', () => {
        const fb = container.querySelector('#fb');
        if (currentSum() === target) {
          engine.addCorrect(145);
          setFeedback(fb, 'correct', `Aniq! ${target} = ${bits.join('')}₂`);
          window.setTimeout(() => {
            round += 1;
            startRound();
          }, 650);
        } else {
          engine.addWrong(20);
          setFeedback(fb, 'wrong', `Hozirgi yig‘indi ${currentSum()}, maqsad esa ${target}.`);
        }
      });
    };

    startRound();
  },
};
