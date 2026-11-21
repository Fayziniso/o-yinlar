import { shuffle, setFeedback } from '../helpers.js';

const SYMBOLS = ['🍎', '🌻', '🦋', '🚗'];

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
    let pairsFound = 0;

    container.innerHTML = `
      <div class="game-round-header">
        <span>Juftini top</span>
        <span id="pairCounter" class="mono">0 / ${SYMBOLS.length} juft</span>
      </div>
      <h3 class="game-prompt">Bir xil rasmli kartochkalarni juftlang</h3>
      <div id="memGrid" class="memory-grid" style="grid-template-columns: repeat(4, 1fr); max-width:440px;"></div>
      <div id="fb" class="game-feedback idle"></div>
    `;

    const grid = container.querySelector('#memGrid');
    const counter = container.querySelector('#pairCounter');
    const fb = container.querySelector('#fb');

    const draw = () => {
      counter.textContent = `${pairsFound} / ${SYMBOLS.length} juft`;
      grid.innerHTML = deck
        .map(
          (card) => `
        <button type="button" class="memory-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}" data-idx="${card.idx}" ${card.matched ? 'disabled' : ''}>
          ${card.flipped || card.matched ? card.sym : '?'}
        </button>`
        )
        .join('');
    };

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.memory-card');
      if (!btn || busy) return;
      const idx = Number(btn.getAttribute('data-idx'));
      const card = deck[idx];
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
          pairsFound += 1;
          engine.addCorrect(140);
          setFeedback(fb, 'correct', 'Ajoyib juftlik topildi!');
          selected = [];
          busy = false;
          draw();
          if (pairsFound === SYMBOLS.length) {
            window.setTimeout(() => engine.finish('Barcha juftliklarni muvaffaqiyatli topdingiz!'), 500);
          }
        } else {
          engine.addWrong(10);
          setFeedback(fb, 'wrong', 'Mos kelmadi, joyini eslab qoling.');
          window.setTimeout(() => {
            a.flipped = false;
            b.flipped = false;
            selected = [];
            busy = false;
            draw();
          }, 750);
        }
      }
    });

    draw();
  },
};
