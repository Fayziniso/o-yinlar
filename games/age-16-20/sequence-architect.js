import { shuffle, setFeedback } from '../helpers.js';

const SEQUENCES = [
  { seq: [2, 6, 14, 30, 62], ans: 126, rule: '2×oldingi + 2' },
  { seq: [1, 2, 6, 24, 120], ans: 720, rule: 'Faktorial (6! = 720)' },
  { seq: [3, 5, 9, 15, 23], ans: 33, rule: 'Farqlar: +2, +4, +6, +8, +10' },
  { seq: [1, 8, 27, 64, 125], ans: 216, rule: 'Kublar: 6³ = 216' },
  { seq: [2, 5, 11, 23, 47], ans: 95, rule: '2×oldingi + 1' },
  { seq: [10, 11, 13, 17, 25], ans: 41, rule: 'Farqlar: +1, +2, +4, +8, +16' },
  { seq: [4, 9, 19, 39, 79], ans: 159, rule: '2×oldingi + 1' },
];

export default {
  init(container, engine) {
    const queue = shuffle(SEQUENCES);
    let idx = 0;

    const draw = () => {
      if (idx >= queue.length) {
        engine.finish('Sequence Architect — barcha rekurrent qatorlarni yechdingiz!');
        return;
      }
      const s = queue[idx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Qator ${idx + 1} / ${queue.length}</span>
          <span>Sequence Architect</span>
        </div>
        <div class="stimulus-box">
          <div class="stimulus-big">${s.seq.join(', ')}, ?</div>
        </div>
        <form id="seqForm" class="game-input-row">
          <input type="number" id="seqInput" class="form-input" placeholder="Keyingi son..." required />
          <button type="submit" class="btn btn-primary">Tasdiqlash</button>
        </form>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const form = container.querySelector('#seqForm');
      const input = container.querySelector('#seqInput');
      const fb = container.querySelector('#fb');
      input.focus();

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value.trim() === '') return;
        if (Number(input.value) === s.ans) {
          engine.addCorrect(160);
          setFeedback(fb, 'correct', `Aniq! Qonuniyat: ${s.rule}`);
          window.setTimeout(() => {
            idx += 1;
            draw();
          }, 800);
        } else {
          engine.addWrong(25);
          setFeedback(fb, 'wrong', 'Qo‘shni hadlar farqi yoki nisbatini tahlil qiling.');
          input.select();
        }
      });
    };

    draw();
  },
};
