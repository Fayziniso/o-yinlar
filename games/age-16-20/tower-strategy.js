import { setFeedback } from '../helpers.js';

const COLORS = ['#1e3a8a', '#2563eb', '#0284c7', '#059669', '#d97706'];

export default {
  init(container, engine) {
    const numDisks = 5;
    const pegs = [[5, 4, 3, 2, 1], [], []];
    let selected = null;
    let moves = 0;

    const draw = () => {
      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Yurishlar: ${moves} (Optimal: 31)</span>
          <span>5 halqali Tower Strategy</span>
        </div>
        <div class="hanoi-stage">
          ${pegs
            .map(
              (stack, pIdx) => `
            <button type="button" class="hanoi-peg ${selected === pIdx ? 'selected' : ''}" data-peg="${pIdx}">
              ${stack
                .map((d) => `<div class="hanoi-disk" style="width:${30 + d * 13}%; background:${COLORS[d - 1]};">${d}</div>`)
                .join('')}
            </button>`
            )
            .join('')}
        </div>
        <div style="display:flex; justify-content:space-around; width:100%; max-width:640px; font-size:0.84rem; color:var(--text-muted);">
          <span>1-ustun</span><span>2-ustun</span><span>3-ustun (Maqsad)</span>
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('[data-peg]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-peg'));
          if (selected === null) {
            if (!pegs[idx].length) {
              setFeedback(fb, 'wrong', 'Tanlangan ustun bo‘sh.');
              return;
            }
            selected = idx;
            draw();
          } else if (selected === idx) {
            selected = null;
            draw();
          } else {
            const from = pegs[selected];
            const to = pegs[idx];
            const moving = from[from.length - 1];
            const top = to[to.length - 1];
            if (top && top < moving) {
              engine.addWrong(15);
              selected = null;
              draw();
              setFeedback(container.querySelector('#fb'), 'wrong', 'Katta halqa kichigining ustiga qo‘yilmaydi!');
              return;
            }
            to.push(from.pop());
            moves += 1;
            selected = null;
            engine.addCorrect(20);
            draw();
            if (pegs[2].length === numDisks) {
              const effBonus = Math.max(120, (55 - moves) * 20);
              engine.addBonus(effBonus);
              engine.finish(`5 halqali Tower Strategy ni ${moves} yurishda yakunladingiz (optimal: 31)!`);
            }
          }
        });
      });
    };

    draw();
  },
};
