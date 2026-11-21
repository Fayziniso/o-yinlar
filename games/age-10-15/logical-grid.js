import { setFeedback } from '../helpers.js';

const CASES = [
  {
    title: 'Olimpiada ishtirokchilari',
    people: ['Aziz', 'Malika', 'Sardor', 'Laylo'],
    options: ['Matematika', 'Fizika', 'Informatika', 'Kimyo'],
    clues: [
      '1. Aziz Fizika ham, Kimyo ham tanlamagan.',
      '2. Malika aniq Fizika fanidan qatnashadi.',
      '3. Laylo Informatika tanlamagan va Matematikani yoqtirmaydi.',
      '4. Sardor Matematikani tanlagan.',
    ],
    solution: {
      Aziz: 'Informatika',
      Malika: 'Fizika',
      Sardor: 'Matematika',
      Laylo: 'Kimyo',
    },
  },
  {
    title: 'Sport to‘garaklari',
    people: ['Jasur', 'Nilufar', 'Temur', 'Zarina'],
    options: ['Shaxmat', 'Tennis', 'Suzish', 'Basketbol'],
    clues: [
      '1. Temur suzishga bormaydi va shaxmat o‘ynamaydi.',
      '2. Nilufar Shaxmat chempioni.',
      '3. Jasur Suzish to‘garagida shug‘ullanadi.',
      '4. Zarina Basketbol emas, Tennis o‘ynaydi.',
    ],
    solution: {
      Jasur: 'Suzish',
      Nilufar: 'Shaxmat',
      Temur: 'Basketbol',
      Zarina: 'Tennis',
    },
  },
];

export default {
  init(container, engine) {
    let idx = 0;

    const loadCase = () => {
      if (idx >= CASES.length) {
        engine.finish('Deduktiv mantiq jadvalini xatosiz yechdingiz!');
        return;
      }
      const c = CASES[idx];
      const picks = {};
      c.people.forEach((p) => (picks[p] = ''));

      const draw = () => {
        container.innerHTML = `
          <div class="game-round-header">
            <span class="mono">Topshiriq ${idx + 1} / ${CASES.length}</span>
            <span>${c.title}</span>
          </div>
          <div class="stimulus-box" style="align-items:flex-start; text-align:left; gap:6px;">
            <strong style="margin-bottom:4px;">Mantiqiy shartlar:</strong>
            ${c.clues.map((cl) => `<span style="font-size:0.92rem; color:var(--text-secondary);">${cl}</span>`).join('')}
          </div>
          <div style="width:100%; max-width:560px; display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px;">
            ${c.people
              .map(
                (person) => `
              <label style="display:flex; flex-direction:column; gap:6px; padding:12px; border-radius:12px; border:1px solid var(--border-hairline); background:var(--bg-canvas);">
                <strong>${person}</strong>
                <select class="form-input" data-person="${person}" style="min-height:40px; padding:6px 10px;">
                  <option value="">Tanlang...</option>
                  ${c.options.map((opt) => `<option value="${opt}" ${picks[person] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
              </label>`
              )
              .join('')}
          </div>
          <button type="button" id="checkLogicBtn" class="btn btn-primary">Yechimni tekshirish</button>
          <div id="fb" class="game-feedback idle"></div>
        `;

        container.querySelectorAll('[data-person]').forEach((sel) => {
          sel.addEventListener('change', (e) => {
            picks[sel.getAttribute('data-person')] = e.target.value;
          });
        });

        container.querySelector('#checkLogicBtn').addEventListener('click', () => {
          const fb = container.querySelector('#fb');
          if (c.people.some((p) => !picks[p])) {
            setFeedback(fb, 'wrong', 'Barcha qatnashchilar uchun tanlov qiling.');
            return;
          }
          const correct = c.people.every((p) => picks[p] === c.solution[p]);
          if (correct) {
            engine.addCorrect(320);
            setFeedback(fb, 'correct', 'Mukammal deduksiya! Barcha juftliklar to‘g‘ri.');
            window.setTimeout(() => {
              idx += 1;
              loadCase();
            }, 900);
          } else {
            engine.addWrong(30);
            setFeedback(fb, 'wrong', 'Ayrim tanlovlar shartlarga zid. Shartlarni qayta o‘qing.');
          }
        });
      };

      draw();
    };

    loadCase();
  },
};
