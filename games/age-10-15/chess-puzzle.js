import { setFeedback } from '../helpers.js';

// Coordinates: [row 0..7 (8..1), col 0..7 (a..h)]
const PUZZLES = [
  {
    title: '1 yurishda mot (Orqa qator)',
    desc: 'Oqlar yuradi. Qora shohga bir yurishda mot qo‘ying!',
    pieces: {
      '0,6': '♚', '1,5': '♟', '1,6': '♟', '1,7': '♟',
      '7,4': '♖', '7,6': '♔',
    },
    from: '7,4',
    to: '0,4',
    explanation: 'Re8# — orqa qator moti!',
  },
  {
    title: 'Farzin bilan mot',
    desc: 'Oqlar yuradi. Shoh himoyasidagi farzin bilan mot qo‘ying!',
    pieces: {
      '0,7': '♚', '2,6': '♔', '4,5': '♕',
    },
    from: '4,5',
    to: '1,6',
    explanation: 'Qg7# — oq shoh farzinni himoya qiladi, qora shohda yurish yo‘q!',
  },
  {
    title: 'Ot vilkasi (Shoh va Farzin)',
    desc: 'Oq ot bilan bir vaqtda qora shoh va farzinga hujum qiling!',
    pieces: {
      '0,4': '♚', '0,6': '♛', '3,4': '♘', '7,4': '♔',
    },
    from: '3,4',
    to: '2,5',
    explanation: 'Nf6+! Ot ham e8 shohga, ham g8 farzinga hujum qildi!',
  },
  {
    title: 'Rux bilan 8-qator moti',
    desc: 'Oq rux bilan qora shohga bir yurishda mot qo‘ying!',
    pieces: {
      '0,6': '♚', '1,5': '♟', '1,6': '♟', '1,7': '♟',
      '7,0': '♖', '7,5': '♔',
    },
    from: '7,0',
    to: '0,0',
    explanation: 'Ra8# — 8-qator bo‘ylab toza mot!',
  },
];

export default {
  init(container, engine) {
    let idx = 0;
    let selectedSq = null;

    const draw = () => {
      if (idx >= PUZZLES.length) {
        engine.finish('Barcha shaxmat masalalarini grossmeysterdek yechdingiz!');
        return;
      }
      const p = PUZZLES[idx];
      const squares = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const key = `${r},${c}`;
          const light = (r + c) % 2 === 0;
          const piece = p.pieces[key] || '';
          const sel = selectedSq === key ? 'selected' : '';
          squares.push(
            `<button type="button" class="chess-sq ${light ? 'light' : 'dark'} ${sel}" data-sq="${key}">${piece}</button>`
          );
        }
      }

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Masala ${idx + 1} / ${PUZZLES.length}</span>
          <span>${p.title}</span>
        </div>
        <p class="game-subprompt">${p.desc}</p>
        <div class="chess-board">${squares.join('')}</div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.chess-sq').forEach((sqBtn) => {
        sqBtn.addEventListener('click', () => {
          const sq = sqBtn.getAttribute('data-sq');
          if (!selectedSq) {
            if (p.pieces[sq]) {
              selectedSq = sq;
              draw();
            }
          } else if (selectedSq === sq) {
            selectedSq = null;
            draw();
          } else {
            if (selectedSq === p.from && sq === p.to) {
              engine.addCorrect(220);
              p.pieces[p.to] = p.pieces[p.from];
              delete p.pieces[p.from];
              selectedSq = null;
              draw();
              setFeedback(container.querySelector('#fb'), 'correct', `Ajoyib yurish! ${p.explanation}`);
              window.setTimeout(() => {
                idx += 1;
                draw();
              }, 1050);
            } else {
              engine.addWrong(25);
              selectedSq = null;
              draw();
              setFeedback(container.querySelector('#fb'), 'wrong', 'Bu eng kuchli yurish emas. Qayta urinib ko‘ring!');
            }
          }
        });
      });
    };

    draw();
  },
};
