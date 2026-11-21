import { setFeedback } from '../helpers.js';

const ROOMS = [
  {
    name: '1-qulf: Laboratoriya seyfi',
    story: 'Stoldagi yozuv: “A = 7, B = A × 2, C = B − 5”. Seyf kodi ABC ko‘rinishida.',
    placeholder: 'Masalan: 7149',
    answer: '7149',
    reward: 'Kalit parcha #1: 4',
  },
  {
    name: '2-qulf: Ko‘zgu shifri',
    story: 'Ekranda teskari yozilgan parol ko‘rindi: “NOMSO”. Asl so‘zni katta harflarda kiriting.',
    placeholder: '5 harfli so‘z',
    answer: 'OSMON',
    reward: 'Kalit parcha #2: 8',
  },
  {
    name: '3-qulf: Elektr zanjiri',
    story: 'Chiroq yonishi uchun 24 volt kerak. 3 ta bir xil batareya ketma-ket ulandi. Har bir batareya necha volt?',
    placeholder: 'Raqam kiriting',
    answer: '8',
    reward: 'Kalit parcha #3: 2',
  },
  {
    name: '4-qulf: Asosiy chiqish eshigi',
    story: 'Oldingi bosqichlarda topilgan 3 ta kalit parchasini tartib bilan birlashtiring va eshikni oching!',
    placeholder: '3 xonali yakuniy kod',
    answer: '482',
    reward: 'Eshik ochildi!',
  },
];

export default {
  init(container, engine) {
    let stage = 0;
    const cluesFound = [];

    const draw = () => {
      if (stage >= ROOMS.length) {
        engine.finish('Barcha 4 ta qulfni ochib laboratoriyadan muvaffaqiyatli chiqdingiz!');
        return;
      }
      const r = ROOMS[stage];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Xona qulfi ${stage + 1} / ${ROOMS.length}</span>
          <span>${r.name}</span>
        </div>
        <div class="stimulus-box">
          <p style="font-size:1.08rem; font-weight:600;">${r.story}</p>
          ${cluesFound.length ? `<div class="mono" style="font-size:0.86rem; color:var(--accent-text);">Topilgan kalitlar: ${cluesFound.join(' · ')}</div>` : ''}
        </div>
        <form id="escForm" class="game-input-row">
          <input type="text" id="escInput" class="form-input" placeholder="${r.placeholder}" autocomplete="off" />
          <button type="submit" class="btn btn-primary">Ochish</button>
        </form>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const form = container.querySelector('#escForm');
      const input = container.querySelector('#escInput');
      const fb = container.querySelector('#fb');
      input.focus();

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = input.value.trim().toUpperCase();
        if (!val) return;
        if (val === r.answer) {
          engine.addCorrect(220);
          cluesFound.push(r.reward);
          setFeedback(fb, 'correct', `Qulf ochildi! ${r.reward}`);
          window.setTimeout(() => {
            stage += 1;
            draw();
          }, 900);
        } else {
          engine.addWrong(25);
          setFeedback(fb, 'wrong', 'Kod noto‘g‘ri! Yozuvni diqqat bilan qayta o‘qing.');
          input.select();
        }
      });
    };

    draw();
  },
};
