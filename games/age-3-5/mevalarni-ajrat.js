import { shuffle, setFeedback } from '../helpers.js';

const ITEMS = [
  { name: 'Olma', emoji: '🍎', type: 'meva' },
  { name: 'Banan', emoji: '🍌', type: 'meva' },
  { name: 'Uzum', emoji: '🍇', type: 'meva' },
  { name: 'Qulupnay', emoji: '🍓', type: 'meva' },
  { name: 'Nok', emoji: '🍐', type: 'meva' },
  { name: 'Sabzi', emoji: '🥕', type: 'sabzavot' },
  { name: 'Bodring', emoji: '🥒', type: 'sabzavot' },
  { name: 'Pomidor', emoji: '🍅', type: 'sabzavot' },
  { name: 'Kartoshka', emoji: '🥔', type: 'sabzavot' },
  { name: 'Brokkoli', emoji: '🥦', type: 'sabzavot' },
];

export default {
  init(container, engine) {
    const queue = shuffle(ITEMS);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Meva va sabzavotlarni xatosiz saraladingiz!');
        return;
      }
      locked = false;
      const item = queue[idx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Mahsulot ${idx + 1} / ${queue.length}</span>
          <span>Savatlarga ajrating</span>
        </div>
        <div class="stimulus-box">
          <div style="font-size:4rem; line-height:1;">${item.emoji}</div>
          <div style="font-size:1.35rem; font-weight:700;">${item.name}</div>
        </div>
        <h3 class="game-prompt">Bu qaysi savatga tushadi?</h3>
        <div class="choice-grid">
          <button type="button" class="choice-btn" data-type="meva" style="min-height:92px;">
            <span style="font-size:1.8rem;">🧺</span>
            <span>Mevalar savati</span>
          </button>
          <button type="button" class="choice-btn" data-type="sabzavot" style="min-height:92px;">
            <span style="font-size:1.8rem;">🥗</span>
            <span>Sabzavotlar savati</span>
          </button>
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          if (btn.getAttribute('data-type') === item.type) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(100);
            setFeedback(fb, 'correct', `To‘g‘ri! ${item.name} — ${item.type}.`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 550);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(15);
            setFeedback(fb, 'wrong', 'Boshqa savatni tanlab ko‘ring!');
          }
        });
      });
    };

    render();
  },
};
