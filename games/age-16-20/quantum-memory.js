import { randInt, setFeedback } from '../helpers.js';

const SYMS = ['α', 'β', 'Ω', 'Δ'];

export default {
  init(container, engine) {
    // 1-Back Dual Working Memory: compare current step with previous step (position & symbol)
    const totalSteps = 10;
    const sequence = [];
    for (let i = 0; i < totalSteps; i++) {
      if (i > 0 && Math.random() < 0.35) {
        sequence.push({
          pos: Math.random() < 0.5 ? sequence[i - 1].pos : randInt(0, 8),
          sym: Math.random() < 0.5 ? sequence[i - 1].sym : SYMS[randInt(0, SYMS.length - 1)],
        });
      } else {
        sequence.push({
          pos: randInt(0, 8),
          sym: SYMS[randInt(0, SYMS.length - 1)],
        });
      }
    }

    let step = 0;
    let answered = false;

    const render = () => {
      if (step >= totalSteps) {
        engine.finish('Quantum Memory (Dual 1-Back) mashqini yakunladingiz!');
        return;
      }
      answered = false;
      const cur = sequence[step];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Qadam ${step + 1} / ${totalSteps}</span>
          <span>Dual 1-Back Xotira</span>
        </div>
        <p class="game-subprompt">
          ${step === 0 ? 'Birinchi holatni eslab qoling va “Keyingi qadam” tugmasini bosing.' : 'Hozirgi katakcha JOYLASHUVI yoki BELGISI oldingi qadam bilan mos keladimi?'}
        </p>
        <div class="board-grid" style="grid-template-columns: repeat(3, 66px);">
          ${Array.from({ length: 9 }, (_, i) => {
            const active = i === cur.pos;
            return `<div class="board-cell ${active ? 'lit' : ''}" style="width:66px; height:66px; font-size:1.6rem;">${active ? cur.sym : ''}</div>`;
          }).join('')}
        </div>
        ${
          step === 0
            ? `<button type="button" id="firstNextBtn" class="btn btn-primary">Eslab qoldim → Keyingi</button>`
            : `<div class="choice-grid">
                <button type="button" class="choice-btn" data-ans="none">Hech biri mos emas</button>
                <button type="button" class="choice-btn" data-ans="pos">Faqat joyi mos</button>
                <button type="button" class="choice-btn" data-ans="sym">Faqat belgisi mos</button>
                <button type="button" class="choice-btn" data-ans="both">Ikkalasi ham mos</button>
              </div>`
        }
        <div id="fb" class="game-feedback idle"></div>
      `;

      if (step === 0) {
        container.querySelector('#firstNextBtn').addEventListener('click', () => {
          step += 1;
          render();
        });
        return;
      }

      const prev = sequence[step - 1];
      const posMatch = cur.pos === prev.pos;
      const symMatch = cur.sym === prev.sym;
      const expected =
        posMatch && symMatch ? 'both' : posMatch ? 'pos' : symMatch ? 'sym' : 'none';

      const fb = container.querySelector('#fb');
      container.querySelectorAll('[data-ans]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          if (btn.getAttribute('data-ans') === expected) {
            btn.classList.add('is-correct');
            engine.addCorrect(135);
            setFeedback(fb, 'correct', 'Aniq eslab qoldingiz!');
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(25);
            setFeedback(fb, 'wrong', 'Oldingi holat bilan farq bor edi.');
          }
          window.setTimeout(() => {
            step += 1;
            render();
          }, 600);
        });
      });
    };

    render();
  },
};
