import { shuffle, setFeedback } from '../helpers.js';

const SYMBOLS = ['🧭', '🚀', '🎨', '⚡', '🎯', '🧩', '🏆', '🌍'];

export default {
  init(container, engine) {
    const deck = shuffle([...SYMBOLS, ...SYMBOLS]).map((sym, i) => ({
      idx: i,
      sym,
      flipped: false,
      matched: false,
    }));
    let open = [];
    let busy = false;
    let found = 0;
    let moves = 0;

    container.innerHTML = `
      <div class="game-round-header">
        <span id="movesEl" class="mono">Urinishlar: 0</span>
        <span id="pairsEl" class="mono">0 / ${SYMBOLS.length} juft</span>
      </div>
      <div id="grid" class="memory-grid" style="grid-template-columns: repeat(4, 1fr); max-width:440px;"></div>
      <div id="fb" class="game-feedback idle"></div>
    `;

    const grid = container.querySelector('#grid');
    const movesEl = container.querySelector('#movesEl');
    const pairsEl = container.querySelector('#pairsEl');
    const fb = container.querySelector('#fb');

    const draw = () => {
      movesEl.textContent = `Urinishlar: ${moves}`;
      pairsEl.textContent = `${found} / ${SYMBOLS.length} juft`;
      grid.innerHTML = deck
        .map(
          (c) => `
        <button type="button" class="memory-card ${c.flipped ? 'flipped' : ''} ${c.matched ? 'matched' : ''}" data-idx="${c.idx}" ${c.matched ? 'disabled' : ''}>
          ${c.flipped || c.matched ? c.sym : '?'}
        </button>`
        )
        .join('');
    };

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.memory-card');
      if (!btn || busy) return;
      const card = deck[Number(btn.getAttribute('data-idx'))];
      if (!card || card.flipped || card.matched) return;

      card.flipped = true;
      open.push(card);
      draw();

      if (open.length === 2) {
        moves += 1;
        busy = true;
        const [a, b] = open;
        if (a.sym === b.sym) {
          a.matched = true;
          b.matched = true;
          found += 1;
          engine.addCorrect(130);
          setFeedback(fb, 'correct', 'Aniq moslik!');
          open = [];
          busy = false;
          draw();
          if (found === SYMBOLS.length) {
            const efficiencyBonus = Math.max(0, (24 - moves) * 20);
            engine.addBonus(efficiencyBonus);
            window.setTimeout(
              () => engine.finish(`Barcha 8 juftni ${moves} urinishda topdingiz!`),
              500
            );
          }
        } else {
          engine.addWrong(10);
          setFeedback(fb, 'wrong', 'Mos kelmadi.');
          window.setTimeout(() => {
            a.flipped = false;
            b.flipped = false;
            open = [];
            busy = false;
            draw();
          }, 680);
        }
      }
    });

    draw();
  },
};
