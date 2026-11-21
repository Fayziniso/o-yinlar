import { randInt, setFeedback } from '../helpers.js';

export default {
  init(container, engine) {
    const total = 5;
    let round = 0;
    let phase = 'waiting'; // 'waiting' | 'ready' | 'result'
    let timeoutId = null;
    let startTs = 0;
    const times = [];

    const startRound = () => {
      if (round >= total) {
        const avg = Math.round(times.reduce((a, b) => a + b, 0) / Math.max(1, times.length));
        engine.finish(`5 ta sinov bo‘yicha o‘rtacha reaksiya tezligingiz: ${avg} ms!`);
        return;
      }
      phase = 'waiting';
      draw();
      timeoutId = window.setTimeout(() => {
        if (engine.state !== 'PLAYING') return;
        phase = 'ready';
        startTs = performance.now();
        draw();
      }, randInt(1300, 3400));
    };

    const draw = () => {
      let bg = '#dc2626';
      let title = 'Kuting...';
      let sub = 'Yashil rangga kirishi bilan darhol bosing!';
      if (phase === 'ready') {
        bg = '#16a34a';
        title = 'HOZIR BOSING!';
        sub = 'Tezroq!';
      }

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Urinish ${round + 1} / ${total}</span>
          <span class="mono">${times.length ? `Oxirgi: ${times[times.length - 1]} ms` : 'Tayyor turing'}</span>
        </div>
        <button type="button" id="reactPad" class="reaction-pad" style="background:${bg};">
          <span>${title}</span>
          <span style="font-size:0.95rem; font-weight:500; opacity:0.9;">${sub}</span>
        </button>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const pad = container.querySelector('#reactPad');
      const fb = container.querySelector('#fb');
      pad.addEventListener('click', () => {
        if (phase === 'waiting') {
          window.clearTimeout(timeoutId);
          engine.addWrong(25);
          setFeedback(fb, 'wrong', 'Juda erta bosdingiz! Qayta kuting...');
          timeoutId = window.setTimeout(() => startRound(), 900);
        } else if (phase === 'ready') {
          const ms = Math.max(80, Math.round(performance.now() - startTs));
          times.push(ms);
          phase = 'result';
          const pts = Math.max(80, Math.min(240, 360 - Math.round(ms * 0.55)));
          engine.addCorrect(pts);
          setFeedback(fb, 'correct', `Reaksiya vaqti: ${ms} ms (+${pts} ball)`);
          round += 1;
          timeoutId = window.setTimeout(() => startRound(), 850);
        }
      });
    };

    startRound();
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  },
};
