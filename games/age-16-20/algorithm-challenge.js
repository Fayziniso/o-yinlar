import { shuffle, setFeedback } from '../helpers.js';

const QUESTIONS = [
  {
    q: 'Saralangan 1024 elementli massivda Binary Search (ikkilik qidiruv) eng yomon holatda ko‘pi bilan nechta solishtirish bajaradi?',
    opts: ['10–11 ta (O(log n))', '512 ta (O(n/2))', '1024 ta (O(n))', '32 ta (O(√n))'],
    ans: '10–11 ta (O(log n))',
    exp: 'log₂(1024) = 10, shuning uchun eng ko‘pi 10–11 qadam kifoya.',
  },
  {
    q: 'Merge Sort algoritmining o‘rtacha va eng yomon holatdagi vaqt murakkabligi qanday?',
    opts: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
    ans: 'O(n log n)',
    exp: 'Merge Sort har doim massivni teng yarmiga bo‘lib birlashtiradi: O(n log n).',
  },
  {
    q: 'Vaznsiz grafda ikki tugun orasidagi eng qisqa yo‘lni topish uchun qaysi qidiruv algoritmi eng mos?',
    opts: ['BFS (Eniga qidiruv)', 'DFS (Chuqurlikka qidiruv)', 'Bubble Sort', 'Binary Search'],
    ans: 'BFS (Eniga qidiruv)',
    exp: 'BFS qatlam-qatlam kengaygani uchun vaznsiz grafda eng qisqa yo‘lni kafolatlaydi.',
  },
  {
    q: 'Hash Table (Xesh jadval) da kalit bo‘yicha elementni izlashning o‘rtacha murakkabligi:',
    opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    ans: 'O(1)',
    exp: 'Yaxshi xesh-funksiya bilan elementga to‘g‘ridan-to‘g‘ri O(1) vaqtda murojaat qilinadi.',
  },
  {
    q: 'LIFO (Oxirgi kirgan — birinchi chiqadi) tamoyili qaysi ma’lumotlar tuzilmasiga tegishli?',
    opts: ['Stack (Stek)', 'Queue (Navbat)', 'Heap (Uyma)', 'Graph (Graf)'],
    ans: 'Stack (Stek)',
    exp: 'Stekda eng oxirgi qo‘shilgan element (push) birinchi olinadi (pop).',
  },
  {
    q: 'Ikki ichma-ich joylashgan 1..n tsiklning umumiy vaqt murakkabligi qanday?',
    opts: ['O(n²)', 'O(2n)', 'O(n log n)', 'O(2ⁿ)'],
    ans: 'O(n²)',
    exp: 'Har bir tashqi qadamda ichki tsikl n marta aylanadi: n × n = O(n²).',
  },
  {
    q: 'Manfiy vaznli qirralari bo‘lmagan grafda eng qisqa yo‘lni topuvchi klassik algoritm:',
    opts: ['Dijkstra algoritmi', 'Kruskal algoritmi', 'Quick Sort', 'KMP algoritmi'],
    ans: 'Dijkstra algoritmi',
    exp: 'Dijkstra algoritmi ustuvor navbat bilan manfiy bo‘lmagan vaznli graflarda optimal yo‘lni topadi.',
  },
];

export default {
  init(container, engine) {
    const queue = shuffle(QUESTIONS);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Algoritmik murakkablik va ma’lumotlar tuzilmalarida yuqori natija ko‘rsatdingiz!');
        return;
      }
      locked = false;
      const q = queue[idx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Savol ${idx + 1} / ${queue.length}</span>
          <span>Algorithm Challenge</span>
        </div>
        <div class="stimulus-box">
          <p style="font-size:1.08rem; font-weight:600;">${q.q}</p>
        </div>
        <div class="choice-grid">
          ${shuffle(q.opts)
            .map((o) => `<button type="button" class="choice-btn" data-o="${o}">${o}</button>`)
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          if (btn.getAttribute('data-o') === q.ans) {
            locked = true;
            btn.classList.add('is-correct');
            engine.addCorrect(155);
            setFeedback(fb, 'correct', `To‘g‘ri! ${q.exp}`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 950);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(25);
            setFeedback(fb, 'wrong', 'Algoritm xususiyatini qayta tahlil qiling.');
          }
        });
      });
    };

    render();
  },
};
