import { shuffle, setFeedback } from '../helpers.js';
import { SoundFX } from '../../js/audio.js';

const ANIMALS = [
  { id: 'cat', name: 'Mushuk', emoji: '🐱', call: 'Miyov-miyov!' },
  { id: 'dog', name: 'Kuchuk', emoji: '🐶', call: 'Vov-vov!' },
  { id: 'cow', name: 'Sigir', emoji: '🐮', call: 'Muuu-muuu!' },
  { id: 'bird', name: 'Qushcha', emoji: '🐦', call: 'Chiq-chiq!' },
  { id: 'frog', name: 'Qurbaqa', emoji: '🐸', call: 'Kva-kva!' },
  { id: 'duck', name: 'O‘rdak', emoji: '🦆', call: 'G‘aq-g‘aq!' },
];

export default {
  init(container, engine) {
    const rounds = shuffle(ANIMALS);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= rounds.length) {
        engine.finish('Hayvonlar ovozini juda yaxshi bilasiz!');
        return;
      }
      locked = false;
      const target = rounds[idx];
      const options = shuffle([
        target,
        ...shuffle(ANIMALS.filter((a) => a.id !== target.id)).slice(0, 3),
      ]);

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Savol ${idx + 1} / ${rounds.length}</span>
          <span>Ovozni tinglang</span>
        </div>
        <div class="stimulus-box">
          <div class="stimulus-big" style="font-family:var(--font-display);">“${target.call}”</div>
          <button type="button" class="btn btn-primary" id="playAnimalSoundBtn">Ovozni eshitish</button>
        </div>
        <h3 class="game-prompt">Bu qaysi hayvonning ovozi?</h3>
        <div class="choice-grid">
          ${options
            .map(
              (a) => `
            <button type="button" class="choice-btn" data-id="${a.id}" style="min-height:100px;">
              <span style="font-size:2.4rem; line-height:1;">${a.emoji}</span>
              <span>${a.name}</span>
            </button>`
            )
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const playBtn = container.querySelector('#playAnimalSoundBtn');
      playBtn.addEventListener('click', () => SoundFX.animal(target.id));
      window.setTimeout(() => SoundFX.animal(target.id), 180);

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          if (btn.getAttribute('data-id') === target.id) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(120);
            setFeedback(fb, 'correct', `To‘g‘ri! ${target.name} shunday ovoz chiqaradi.`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 700);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(15);
            setFeedback(fb, 'wrong', 'Yana tinglab ko‘ring!');
          }
        });
      });
    };

    render();
  },
};
