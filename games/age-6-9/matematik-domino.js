import { shuffle, randInt, setFeedback } from '../helpers.js';

export default {
  init(container, engine) {
    const total = 8;
    let round = 0;
    let currentTarget = randInt(5, 12);
    let locked = false;

    const render = () => {
      if (round >= total) {
        engine.finish('Matematik domino zanjirini to‘liq yig‘dingiz!');
        return;
      }
      locked = false;
      const a = randInt(1, currentTarget - 1);
      const b = currentTarget - a;
      const nextRight = randInt(4, 14);
      const correctTile = { left: `${a} + ${b}`, right: nextRight, ok: true };

      const wrongs = [];
      while (wrongs.length < 3) {
        const x = randInt(1, 10);
        const y = randInt(1, 10);
        if (x + y !== currentTarget) {
          wrongs.push({ left: `${x} + ${y}`, right: randInt(4, 14), ok: false });
        }
      }
      const opts = shuffle([correctTile, ...wrongs]);

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Tosh ${round + 1} / ${total}</span>
          <span>Zanjirni davom ettiring</span>
        </div>
        <h3 class="game-prompt">Chap tomoni <strong>${currentTarget}</strong> ga teng bo‘ladigan domino toshini tanlang</h3>
        <div class="stimulus-box" style="flex-direction:row; gap:16px;">
          <div style="display:inline-flex; border:2px solid var(--border-strong); border-radius:12px; overflow:hidden; background:var(--bg-surface);">
            <span class="mono" style="padding:14px 20px; background:var(--bg-subtle); font-weight:700;">···</span>
            <span class="mono" style="padding:14px 24px; font-size:1.5rem; font-weight:800; color:var(--accent-text);">${currentTarget}</span>
          </div>
          <span style="font-size:1.5rem;">→</span>
          <div style="display:inline-flex; border:2px dashed var(--accent); border-radius:12px; padding:14px 24px; font-weight:700;">? | ?</div>
        </div>
        <div class="choice-grid">
          ${opts
            .map(
              (t, i) => `
            <button type="button" class="choice-btn" data-ok="${t.ok}" data-next="${t.right}" style="flex-direction:row; justify-content:space-around; padding:14px;">
              <span class="mono" style="font-size:1.25rem; font-weight:700;">${t.left}</span>
              <span style="width:2px; height:32px; background:var(--border-strong);"></span>
              <span class="mono" style="font-size:1.25rem; color:var(--text-muted);">${t.right}</span>
            </button>`
            )
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          if (btn.getAttribute('data-ok') === 'true') {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(120);
            currentTarget = Number(btn.getAttribute('data-next'));
            setFeedback(fb, 'correct', 'Domino ulandi!');
            window.setTimeout(() => {
              round += 1;
              render();
            }, 520);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(20);
            setFeedback(fb, 'wrong', `Yig‘indi ${currentTarget} ga teng bo‘lishi kerak.`);
          }
        });
      });
    };

    render();
  },
};
