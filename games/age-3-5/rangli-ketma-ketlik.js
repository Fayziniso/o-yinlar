import { shuffle, setFeedback } from '../helpers.js';

const PALETTE = [
  { id: 'r', name: 'Qizil', hex: '#ef4444' },
  { id: 'b', name: 'Ko‘k', hex: '#2563eb' },
  { id: 'g', name: 'Yashil', hex: '#16a34a' },
  { id: 'y', name: 'Sariq', hex: '#eab308' },
];

const PATTERNS = [
  [0, 1, 0, 1, 0],
  [2, 3, 2, 3, 2],
  [0, 0, 1, 0, 0],
  [1, 2, 3, 1, 2],
  [3, 1, 3, 1, 3],
  [0, 2, 2, 0, 2],
  [1, 1, 3, 1, 1],
];

export default {
  init(container, engine) {
    let idx = 0;
    let locked = false;

    const getAnswer = (pat) => {
      if (pat[0] === pat[2] && pat[1] === pat[3]) return pat[1];
      if (pat[0] === pat[1] && pat[3] === pat[4]) return pat[2];
      if (pat[1] === pat[2] && pat[0] === pat[3]) return pat[1];
      return pat[2];
    };

    const render = () => {
      if (idx >= PATTERNS.length) {
        engine.finish('Rangli ketma-ketlik qonuniyatlarini mukammal topdingiz!');
        return;
      }
      locked = false;
      const pat = PATTERNS[idx];
      const answerIdx = getAnswer(pat);
      const answerColor = PALETTE[answerIdx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Qator ${idx + 1} / ${PATTERNS.length}</span>
          <span>Keyingi rangni toping</span>
        </div>
        <h3 class="game-prompt">So‘roq belgisi o‘rniga qaysi rang keladi?</h3>
        <div class="stimulus-box" style="flex-direction:row; flex-wrap:wrap; gap:12px;">
          ${pat
            .map(
              (cIdx) =>
                `<span style="width:48px; height:48px; border-radius:50%; background:${PALETTE[cIdx].hex}; display:inline-block;"></span>`
            )
            .join('')}
          <span style="width:48px; height:48px; border-radius:50%; border:3px dashed var(--text-muted); display:inline-flex; align-items:center; justify-content:center; font-weight:800; font-size:1.3rem;">?</span>
        </div>
        <div class="choice-grid cols-4">
          ${shuffle(PALETTE)
            .map(
              (c) => `
            <button type="button" class="choice-btn" data-id="${c.id}" style="min-height:92px;">
              <span style="width:44px; height:44px; border-radius:50%; background:${c.hex}; display:inline-block;"></span>
              <span style="font-size:0.86rem;">${c.name}</span>
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
          if (btn.getAttribute('data-id') === answerColor.id) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(120);
            setFeedback(fb, 'correct', `To‘g‘ri! Navbatdagi rang — ${answerColor.name}.`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 650);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(15);
            setFeedback(fb, 'wrong', 'Ketma-ketlikni qayta kuzating!');
          }
        });
      });
    };

    render();
  },
};
