import { shuffle, setFeedback } from '../helpers.js';

const SNIPPETS = [
  {
    code: `let s = 0;\nfor (let i = 1; i <= 5; i++) {\n  if (i % 2 === 1) s += i * 2;\n}\nconsole.log(s);`,
    opts: ['18', '15', '12', '30'],
    ans: '18',
    exp: 'Toq sonlar: 1, 3, 5 → 2 + 6 + 10 = 18.',
  },
  {
    code: `function f(n) {\n  if (n <= 1) return 1;\n  return n * f(n - 1);\n}\nconsole.log(f(5));`,
    opts: ['120', '24', '60', '15'],
    ans: '120',
    exp: 'Rekursiv faktorial: 5! = 5×4×3×2×1 = 120.',
  },
  {
    code: `const arr = [2, 4, 6, 8];\nconst res = arr.filter(x => x > 4).map(x => x / 2);\nconsole.log(res.join('-'));`,
    opts: ['3-4', '2-3-4', '6-8', '1-2'],
    ans: '3-4',
    exp: 'filter → [6, 8], map(x/2) → [3, 4], join("-") → "3-4".',
  },
  {
    code: `let a = 12, b = 5;\nlet c = (a & b) + (a | b);\nconsole.log(c);`,
    opts: ['17', '12', '15', '19'],
    ans: '17',
    exp: '12 (1100) & 5 (0101) = 4; 12 | 5 = 13; 4 + 13 = 17 (har doim a + b ga teng!).',
  },
  {
    code: `let x = 1;\nwhile (x < 20) {\n  x = x * 2 + 1;\n}\nconsole.log(x);`,
    opts: ['31', '21', '23', '63'],
    ans: '31',
    exp: '1 → 3 → 7 → 15 → 31 (20 dan katta bo‘lgach to‘xtaydi).',
  },
  {
    code: `const obj = { a: 3, b: 4 };\nconst { a: x, b: y } = obj;\nconsole.log(x ** 2 + y ** 2);`,
    opts: ['25', '14', '49', '12'],
    ans: '25',
    exp: '3² + 4² = 9 + 16 = 25.',
  },
];

export default {
  init(container, engine) {
    const queue = shuffle(SNIPPETS);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Barcha kod parchalarining natijasini aniq bashorat qildingiz!');
        return;
      }
      locked = false;
      const s = queue[idx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Kod ${idx + 1} / ${queue.length}</span>
          <span>Programming Logic</span>
        </div>
        <h3 class="game-prompt">Ushbu kod konsolga nima chiqaradi?</h3>
        <pre class="code-block">${s.code}</pre>
        <div class="choice-grid">
          ${shuffle(s.opts)
            .map((o) => `<button type="button" class="choice-btn mono" data-o="${o}" style="font-size:1.25rem;">${o}</button>`)
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          if (btn.getAttribute('data-o') === s.ans) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(165);
            setFeedback(fb, 'correct', `To‘g‘ri! ${s.exp}`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 950);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(25);
            setFeedback(fb, 'wrong', 'Qadamma-qadam qiymatlarni tekshirib chiqing.');
          }
        });
      });
    };

    render();
  },
};
