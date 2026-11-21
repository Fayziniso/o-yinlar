import { shuffle, setFeedback } from '../helpers.js';

const COLORS = [
  { id: 'red', name: 'Qizil', hex: '#ef4444' },
  { id: 'blue', name: 'Ko‘k', hex: '#2563eb' },
  { id: 'green', name: 'Yashil', hex: '#16a34a' },
  { id: 'yellow', name: 'Sariq', hex: '#eab308' },
  { id: 'orange', name: 'To‘q sariq', hex: '#f97316' },
  { id: 'purple', name: 'Binafsha', hex: '#9333ea' },
  { id: 'pink', name: 'Pushti', hex: '#ec4899' },
  { id: 'brown', name: 'Jigarrang', hex: '#92400e' },
];

export default {
  init(container, engine) {
    const totalRounds = 8;
    const sequence = shuffle(COLORS).slice(0, totalRounds);
    let round = 0;
    let locked = false;

    const render = () => {
      if (round >= totalRounds) {
        engine.finish('Siz barcha ranglarni ajoyib ajratdingiz!');
        return;
      }
      locked = false;
      const target = sequence[round];
      const distractors = shuffle(COLORS.filter((c) => c.id !== target.id)).slice(0, 3);
      const options = shuffle([target, ...distractors]);

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Bosqich ${round + 1} / ${totalRounds}</span>
          <span>Rangni toping</span>
        </div>
        <h3 class="game-prompt">Qaysi doira <span style="color:var(--accent-text); text-decoration:underline;">${target.name}</span> rangda?</h3>
        <div class="choice-grid">
          ${options
            .map(
              (c) => `
            <button type="button" class="choice-btn" data-id="${c.id}" style="min-height:112px;">
              <span style="width:62px; height:62px; border-radius:50%; background:${c.hex}; display:inline-block; box-shadow:inset 0 -4px 0 rgba(0,0,0,0.16);"></span>
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
          const picked = btn.getAttribute('data-id');
          if (picked === target.id) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(110);
            setFeedback(fb, 'correct', `To‘g‘ri! Bu ${target.name.toLowerCase()} rang.`);
            window.setTimeout(() => {
              round += 1;
              render();
            }, 650);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(15);
            setFeedback(fb, 'wrong', 'Yana urinib ko‘ring!');
          }
        });
      });
    };

    render();
  },
};
