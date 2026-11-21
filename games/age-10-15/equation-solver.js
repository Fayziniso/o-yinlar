import { randInt, setFeedback } from '../helpers.js';

export default {
  init(container, engine) {
    const total = 8;
    let round = 0;

    const makeEq = (idx) => {
      const x = randInt(2, 14);
      if (idx % 3 === 0) {
        const a = randInt(2, 7);
        const b = randInt(3, 25);
        return { text: `${a}x + ${b} = ${a * x + b}`, x };
      }
      if (idx % 3 === 1) {
        const a = randInt(2, 6);
        const b = randInt(2, 15);
        return { text: `${a}x − ${b} = ${a * x - b}`, x };
      }
      const a = randInt(2, 5);
      const b = randInt(1, 6);
      return { text: `${a}(x + ${b}) = ${a * (x + b)}`, x };
    };

    const render = () => {
      if (round >= total) {
        engine.finish('Barcha algebraik tenglamalarni aniq yechdingiz!');
        return;
      }
      const eq = makeEq(round);

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Tenglama ${round + 1} / ${total}</span>
          <span>Noma’lum x ni toping</span>
        </div>
        <div class="stimulus-box">
          <div class="stimulus-big">${eq.text}</div>
        </div>
        <form id="eqForm" class="game-input-row">
          <input type="number" id="eqInput" class="form-input" placeholder="x = ?" required />
          <button type="submit" class="btn btn-primary">Javob</button>
        </form>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const form = container.querySelector('#eqForm');
      const input = container.querySelector('#eqInput');
      const fb = container.querySelector('#fb');
      input.focus();

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = Number(input.value);
        if (input.value.trim() === '' || Number.isNaN(val)) return;
        if (val === eq.x) {
          engine.addCorrect(135);
          setFeedback(fb, 'correct', `To‘g‘ri! x = ${eq.x}`);
          window.setTimeout(() => {
            round += 1;
            render();
          }, 550);
        } else {
          engine.addWrong(25);
          setFeedback(fb, 'wrong', 'Noto‘g‘ri. Tenglamani qayta tekshiring.');
          input.select();
        }
      });
    };

    render();
  },
};
