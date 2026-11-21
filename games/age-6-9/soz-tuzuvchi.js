import { shuffle, setFeedback } from '../helpers.js';

const ITEMS = [
  { word: 'BAHOR', hint: 'Gullarning ochilish fasli' },
  { word: 'YULDUZ', hint: 'Tungi osmonda porlaydi' },
  { word: 'DAFTAR', hint: 'Unga darslar yoziladi' },
  { word: 'BOLALAR', hint: 'O‘yin o‘ynashni sevuvchi kichkintoylar' },
  { word: 'DUNYO', hint: 'Biz yashayotgan katta olam' },
  { word: 'SHAMOL', hint: 'Daraxt barglarini tebratadi' },
];

export default {
  init(container, engine) {
    const queue = shuffle(ITEMS).slice(0, 5);
    let idx = 0;

    const load = () => {
      if (idx >= queue.length) {
        engine.finish('Barcha so‘zlarni harflardan to‘g‘ri tuzdingiz!');
        return;
      }
      const item = queue[idx];
      let letters = shuffle(item.word.split('').map((ch, i) => ({ id: i, ch, used: false })));
      if (letters.map((l) => l.ch).join('') === item.word) {
        letters = letters.reverse();
      }
      let built = [];

      const draw = () => {
        const answerStr = built.map((l) => l.ch).join('');
        container.innerHTML = `
          <div class="game-round-header">
            <span class="mono">So‘z ${idx + 1} / ${queue.length}</span>
            <span>Harflarni tartiblang</span>
          </div>
          <div class="stimulus-box">
            <span style="font-size:0.9rem; color:var(--text-secondary);">Ishora: ${item.hint}</span>
            <div class="stimulus-big" style="min-height:48px; letter-spacing:0.2em;">${answerStr || '·'.repeat(item.word.length)}</div>
          </div>
          <div class="numpad-row">
            ${letters
              .map(
                (l) => `
              <button type="button" class="numpad-btn" data-id="${l.id}" ${l.used ? 'disabled' : ''} style="width:52px; height:52px; font-size:1.25rem; ${l.used ? 'opacity:0.3;' : ''}">
                ${l.ch}
              </button>`
              )
              .join('')}
          </div>
          <div style="display:flex; gap:10px;">
            <button type="button" id="undoBtn" class="btn btn-secondary btn-sm">Oxirgisini o‘chirish</button>
            <button type="button" id="clearBtn" class="btn btn-ghost btn-sm">Tozalash</button>
          </div>
          <div id="fb" class="game-feedback idle"></div>
        `;

        container.querySelectorAll('[data-id]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-id'));
            const tile = letters.find((l) => l.id === id);
            if (!tile || tile.used) return;
            tile.used = true;
            built.push(tile);
            draw();
            const current = built.map((b) => b.ch).join('');
            if (current.length === item.word.length) {
              if (current === item.word) {
                engine.addCorrect(150);
                setFeedback(container.querySelector('#fb'), 'correct', `Barakalla! “${item.word}” to‘g‘ri tuzildi.`);
                window.setTimeout(() => {
                  idx += 1;
                  load();
                }, 700);
              } else {
                engine.addWrong(20);
                setFeedback(container.querySelector('#fb'), 'wrong', 'Tartib noto‘g‘ri, qayta terib ko‘ring!');
                window.setTimeout(() => {
                  letters.forEach((l) => (l.used = false));
                  built = [];
                  draw();
                }, 650);
              }
            }
          });
        });

        container.querySelector('#undoBtn').addEventListener('click', () => {
          const last = built.pop();
          if (last) last.used = false;
          draw();
        });
        container.querySelector('#clearBtn').addEventListener('click', () => {
          letters.forEach((l) => (l.used = false));
          built = [];
          draw();
        });
      };

      draw();
    };

    load();
  },
};
