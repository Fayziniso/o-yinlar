import { setFeedback } from '../helpers.js';

const STUDIES = [
  {
    title: 'Bo‘g‘ma mot (Smothered Mate)',
    desc: 'Oqlar yuradi. Oq ot bilan qora shohni o‘z donalari orasida mot qiling!',
    pieces: {
      '0,7': '♚', '0,6': '♜', '1,6': '♟', '1,7': '♟',
      '2,4': '♘', '7,6': '♔',
    },
    from: '2,4',
    to: '1,5',
    exp: 'Nf7# — klassik bo‘g‘ma mot! Shoh o‘z ruxi va piyodalari bilan o‘ralgan.',
  },
  {
    title: 'Diagonal bog‘lash va yutish',
    desc: 'Oq fil bilan qora farzinni shohga bog‘lab mutlaq ustunlikka erishing!',
    pieces: {
      '0,7': '♚', '2,5': '♛', '7,2': '♗', '7,6': '♔',
    },
    from: '7,2',
    to: '6,1',
    exp: 'Bb2! Qora farzin f6 da shohga bog‘landi va muqarrar yutqaziladi.',
  },
  {
    title: 'Arabcha mot (Rux + Ot)',
    desc: 'Oq ot f6 katakchasidan h7 va g8 ni nazorat qilmoqda. Rux bilan mot qo‘ying!',
    pieces: {
      '0,7': '♚', '2,5': '♘', '6,6': '♖', '7,1': '♔',
    },
    from: '6,6',
    to: '0,6',
    exp: 'Rg8# — klassik Arabcha mot! Ot ham ruxni himoya qiladi, ham h7 yo‘lini yopadi.',
  },
  {
    title: 'Farzin va Fil batareyasi',
    desc: 'Oq farzinni h7 ga olib borib fil himoyasida mot qo‘ying!',
    pieces: {
      '0,6': '♚', '0,5': '♜', '1,5': '♟', '1,6': '♟',
      '5,3': '♗', '3,7': '♕', '7,6': '♔',
    },
    from: '3,7',
    to: '1,7',
    exp: 'Qh7# — d3 dagi fil farzinni himoya qilgan holda hal qiluvchi mot!',
  },
];

export default {
  init(container, engine) {
    let idx = 0;
    let selected = null;
    // Clone pieces per puzzle so restart works cleanly
    const boards = STUDIES.map((s) => ({ ...s.pieces }));

    const draw = () => {
      if (idx >= STUDIES.length) {
        engine.finish('Strategic Chess etyudlarining barchasini yechdingiz!');
        return;
      }
      const st = STUDIES[idx];
      const pieces = boards[idx];
      const squares = [];

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const key = `${r},${c}`;
          const light = (r + c) % 2 === 0;
          squares.push(
            `<button type="button" class="chess-sq ${light ? 'light' : 'dark'} ${selected === key ? 'selected' : ''}" data-sq="${key}">${pieces[key] || ''}</button>`
          );
        }
      }

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Etyud ${idx + 1} / ${STUDIES.length}</span>
          <span>${st.title}</span>
        </div>
        <p class="game-subprompt">${st.desc}</p>
        <div class="chess-board">${squares.join('')}</div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      container.querySelectorAll('.chess-sq').forEach((btn) => {
        btn.addEventListener('click', () => {
          const sq = btn.getAttribute('data-sq');
          if (!selected) {
            if (pieces[sq]) {
              selected = sq;
              draw();
            }
          } else if (selected === sq) {
            selected = null;
            draw();
          } else {
            if (selected === st.from && sq === st.to) {
              pieces[st.to] = pieces[st.from];
              delete pieces[st.from];
              selected = null;
              engine.addCorrect(240);
              draw();
              setFeedback(container.querySelector('#fb'), 'correct', `Zo‘r kombinatsiya! ${st.exp}`);
              window.setTimeout(() => {
                idx += 1;
                draw();
              }, 1150);
            } else {
              selected = null;
              engine.addWrong(30);
              draw();
              setFeedback(container.querySelector('#fb'), 'wrong', 'Eng optimal strategik yurishni izlang.');
            }
          }
        });
      });
    };

    draw();
  },
};
