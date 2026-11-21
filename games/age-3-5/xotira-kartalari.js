import { shuffle, setFeedback } from '../helpers.js';

const SYMBOLS = ['🦊', '🐼', '🦁', '🐸', '🐧', '🐝'];

export default {
  init(container, engine) {
    const deck = shuffle([...SYMBOLS, ...SYMBOLS]).map((sym, i) => ({
      idx: i,
      sym,
      flipped: false,
      matched: false,
    }));
    let selected = [];
    let busy = false;
    let found = 0;

    container.innerHTML = `
      <div class="game-round-header">
        <span>Xotira kartalari</span>
        <span id="pairMeta" class="mono">0 / ${SYMBOLS.length} juft</span>
      </div>
      <h3 class="game-prompt">6 ta hayvon juftini xotirada saqlab oching</h3>
      <div id="grid" class="memory-grid" style="grid-template-columns: repeat(4, 1fr); max-width:460px;"></div>
      <div id="fb" class="game-feedback idle"></div>
    `;

    const grid = container.querySelector('#grid');
    const meta = container.querySelector('#pairMeta');
    const fb = container.querySelector('#fb');

    const draw = () => {
      meta.textContent = `${found} / ${SYMBOLS.length} juft`;
      grid.innerHTML = deck
        .map(
          (c) => `
        <button type="button" class="memory-card ${c.flipped ? 'flipped' : ''} ${c.matched ? 'matched' : ''}" data-idx="${c.idx}" ${c.matched ? 'disabled' : ''}>
          ${c.flipped || c.matched ? c.sym : '★'}
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
      selected.push(card);
      draw();

      if (selected.length === 2) {
        busy = true;
        const [a, b] = selected;
        if (a.sym === b.sym) {
          a.matched = true;
          b.matched = true;
          found += 1;
          engine.addCorrect(130);
          setFeedback(fb, 'correct', 'Juftlik topildi!');
          selected = [];
          busy = false;
          draw();
          if (found === SYMBOLS.length) {
            window.setTimeout(() => engine.finish('Xotirangiz juda kuchli! Barcha kartalar ochildi.'), 500);
          }
        } else {
          engine.addWrong(10);
          setFeedback(fb, 'wrong', 'Yana urinib ko‘ring.');
          window.setTimeout(() => {
            a.flipped = false;
            b.flipped = false;
            selected = [];
            busy = false;
            draw();
          }, 700);
        }
      }
    });

    draw();
  },
};
