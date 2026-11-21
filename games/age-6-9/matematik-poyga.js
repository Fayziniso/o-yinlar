import { shuffle, randInt, setFeedback } from '../helpers.js';

export default {
  init(container, engine) {
    const totalSteps = 10;
    let step = 0;
    let locked = false;

    const makeQuestion = () => {
      const op = Math.random() < 0.55 ? '+' : '-';
      let a = randInt(5, 28);
      let b = randInt(3, 19);
      if (op === '-' && b > a) [a, b] = [b, a];
      const ans = op === '+' ? a + b : a - b;
      const distractors = new Set();
      while (distractors.size < 3) {
        const cand = ans + randInt(-6, 6);
        if (cand >= 0 && cand !== ans) distractors.add(cand);
      }
      return { text: `${a} ${op} ${b} = ?`, ans, opts: shuffle([ans, ...distractors]) };
    };

    const render = () => {
      if (step >= totalSteps) {
        engine.finish('Finish chizig‘ini birinchi bo‘lib kesib o‘tdingiz!');
        return;
      }
      locked = false;
      const q = makeQuestion();
      const pct = Math.round((step / totalSteps) * 100);

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Marragacha: ${step} / ${totalSteps}</span>
          <span>Matematik poyga</span>
        </div>
        <div style="width:100%; max-width:620px;">
          <div style="position:relative; height:42px; background:var(--bg-subtle); border-radius:999px; border:1px solid var(--border-hairline); overflow:hidden;">
            <div style="height:100%; width:${pct}%; background:var(--accent-soft); transition:width 0.3s ease;"></div>
            <span style="position:absolute; left:calc(${pct}% - 10px); top:50%; transform:translateY(-50%); font-size:1.5rem; transition:left 0.3s ease;">🏎️</span>
            <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:1.3rem;">🏁</span>
          </div>
        </div>
        <div class="stimulus-box">
          <div class="stimulus-big">${q.text}</div>
        </div>
        <div class="choice-grid">
          ${q.opts
            .map(
              (o) => `<button type="button" class="choice-btn mono" data-val="${o}" style="font-size:1.35rem;">${o}</button>`
            )
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          if (Number(btn.getAttribute('data-val')) === q.ans) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(110);
            setFeedback(fb, 'correct', 'Tezlik oshdi! Oldinga!');
            window.setTimeout(() => {
              step += 1;
              render();
            }, 420);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(20);
            setFeedback(fb, 'wrong', 'Xato! Qayta hisoblang.');
          }
        });
      });
    };

    render();
  },
};
