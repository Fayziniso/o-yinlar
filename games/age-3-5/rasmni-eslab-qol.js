import { shuffle, setFeedback } from '../helpers.js';

const POOL = [
  { id: 'sun', emoji: '🌞', name: 'Quyosh' },
  { id: 'rocket', emoji: '🚀', name: 'Raketa' },
  { id: 'cake', emoji: '🎂', name: 'Tort' },
  { id: 'umbrella', emoji: '☂️', name: 'Soyabon' },
  { id: 'crown', emoji: '👑', name: 'Toj' },
  { id: 'balloon', emoji: '🎈', name: 'Shar' },
  { id: 'star', emoji: '⭐', name: 'Yulduz' },
  { id: 'flower', emoji: '🌷', name: 'Lola' },
  { id: 'train', emoji: '🚂', name: 'Poyezd' },
  { id: 'bell', emoji: '🔔', name: 'Qo‘ng‘iroq' },
];

export default {
  init(container, engine) {
    const total = 6;
    let round = 0;
    let timer = null;

    const startRound = () => {
      if (round >= total) {
        engine.finish('Ko‘rish xotirangiz a’lo darajada!');
        return;
      }
      const items = shuffle(POOL);
      const shown = items.slice(0, 3);
      const target = shown[0];
      const distractors = items.slice(3, 6);
      const choices = shuffle([target, ...distractors]);

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Bosqich ${round + 1} / ${total}</span>
          <span>Rasmlarni eslab qoling (3 soniya)</span>
        </div>
        <h3 class="game-prompt">Ushbu 3 ta rasmni diqqat bilan eslab qoling!</h3>
        <div class="stimulus-box" style="flex-direction:row; gap:26px; font-size:3.2rem;">
          ${shown.map((i) => `<div style="display:flex; flex-direction:column; align-items:center; gap:6px;"><span>${i.emoji}</span><span style="font-size:0.9rem; font-weight:600;">${i.name}</span></div>`).join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      timer = window.setTimeout(() => {
        let locked = false;
        container.innerHTML = `
          <div class="game-round-header">
            <span class="mono">Bosqich ${round + 1} / ${total}</span>
            <span>Xotiradan toping</span>
          </div>
          <h3 class="game-prompt">Quyidagilardan qaysi biri boya ko‘rsatildi?</h3>
          <div class="choice-grid">
            ${choices
              .map(
                (c) => `
              <button type="button" class="choice-btn" data-id="${c.id}" style="min-height:102px;">
                <span style="font-size:2.4rem;">${c.emoji}</span>
                <span>${c.name}</span>
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
            if (btn.getAttribute('data-id') === target.id) {
              locked = true;
              btn.classList.add('is-correct');
              engine.addCorrect(135);
              setFeedback(fb, 'correct', `Barakalla! ${target.name} ko‘rsatilgan edi.`);
              window.setTimeout(() => {
                round += 1;
                startRound();
              }, 700);
            } else {
              btn.classList.add('is-wrong');
              engine.addWrong(20);
              setFeedback(fb, 'wrong', 'Bu rasm yo‘q edi, yana o‘ylab ko‘ring!');
            }
          });
        });
      }, 2800);
    };

    startRound();

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  },
};
