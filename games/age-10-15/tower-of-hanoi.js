import { setFeedback } from '../helpers.js';

const DISK_COLORS = ['#ef4444', '#f97316', '#eab308', '#16a34a'];

export default {
  init(container, engine) {
    const numDisks = 4;
    const pegs = [[4, 3, 2, 1], [], []];
    let selectedPeg = null;
    let moves = 0;

    const draw = () => {
      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Yurishlar: ${moves} (Optimal: 15)</span>
          <span>Barcha halqalarni 3-ustunga ko‘chiring</span>
        </div>
        <div class="hanoi-stage">
          ${pegs
            .map(
              (stack, pIdx) => `
            <button type="button" class="hanoi-peg ${selectedPeg === pIdx ? 'selected' : ''}" data-peg="${pIdx}" aria-label="${pIdx + 1}-ustun">
              ${stack
                .map((disk) => {
                  const widthPct = 36 + disk * 14;
                  return `<div class="hanoi-disk" style="width:${widthPct}%; background:${DISK_COLORS[disk - 1]};">${disk}</div>`;
                })
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
          if (selectedPeg === null) {
            if (pegs[idx].length === 0) {
              setFeedback(fb, 'wrong', 'Bu ustun bo‘sh.');
              return;
            }
            selectedPeg = idx;
            draw();
          } else if (selectedPeg === idx) {
            selectedPeg = null;
            draw();
          } else {
            const fromStack = pegs[selectedPeg];
            const toStack = pegs[idx];
            const moving = fromStack[fromStack.length - 1];
            const topTarget = toStack[toStack.length - 1];
            if (topTarget && topTarget < moving) {
              engine.addWrong(15);
              selectedPeg = null;
              draw();
              setFeedback(container.querySelector('#fb'), 'wrong', 'Katta halqani kichik halqa ustiga qo‘yib bo‘lmaydi!');
              return;
            }
            toStack.push(fromStack.pop());
            moves += 1;
            selectedPeg = null;
            engine.addCorrect(25);
            draw();

            if (pegs[2].length === numDisks) {
              const bonus = Math.max(100, (30 - moves) * 25);
              engine.addBonus(bonus);
              engine.finish(`Xanoy minorasini ${moves} yurishda muvaffaqiyatli ko‘chirdingiz!`);
            }
          }
        });
      });
    };

    draw();
  },
};
