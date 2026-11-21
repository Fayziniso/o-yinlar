import { shuffle, setFeedback } from '../helpers.js';

const QUESTIONS = [
  {
    svg: '<polygon points="40,120 180,120 40,30" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3"/><text x="20" y="80" fill="var(--text-primary)" font-size="14" font-family="monospace">3</text><text x="105" y="138" fill="var(--text-primary)" font-size="14" font-family="monospace">4</text><text x="120" y="68" fill="var(--accent-text)" font-size="15" font-weight="bold" font-family="monospace">c = ?</text>',
    q: 'To‘g‘ri burchakli uchburchakning katetlari 3 va 4 bo‘lsa, gipotenuzasi (c) nechaga teng?',
    opts: ['5', '6', '7', '4.5'],
    ans: '5',
    exp: 'Pifagor teoremasi: √(3² + 4²) = √25 = 5.',
  },
  {
    svg: '<rect x="35" y="30" width="150" height="80" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3"/><text x="102" y="22" fill="var(--text-primary)" font-size="14" font-family="monospace">12 sm</text><text x="192" y="75" fill="var(--text-primary)" font-size="14" font-family="monospace">5 sm</text>',
    q: 'Tomonlari 12 sm va 5 sm bo‘lgan to‘g‘ri to‘rtburchakning yuzi nechaga teng?',
    opts: ['60 sm²', '34 sm²', '48 sm²', '72 sm²'],
    ans: '60 sm²',
    exp: 'S = a × b = 12 × 5 = 60 sm².',
  },
  {
    svg: '<polygon points="110,20 190,125 30,125" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3"/><text x="100" y="48" fill="var(--text-primary)" font-size="13" font-family="monospace">50°</text><text x="50" y="116" fill="var(--text-primary)" font-size="13" font-family="monospace">60°</text><text x="150" y="116" fill="var(--accent-text)" font-size="14" font-weight="bold" font-family="monospace">?</text>',
    q: 'Uchburchakning ikki burchagi 50° va 60° bo‘lsa, uchinchi burchak necha gradus?',
    opts: ['70°', '80°', '65°', '90°'],
    ans: '70°',
    exp: 'Ichki burchaklar yig‘indisi 180°: 180 − 50 − 60 = 70°.',
  },
  {
    svg: '<polygon points="40,120 180,120 40,30" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3"/><text x="18" y="80" fill="var(--text-primary)" font-size="14" font-family="monospace">6</text><text x="105" y="138" fill="var(--text-primary)" font-size="14" font-family="monospace">8</text><text x="120" y="68" fill="var(--accent-text)" font-size="15" font-weight="bold" font-family="monospace">c = ?</text>',
    q: 'Katetlari 6 va 8 bo‘lgan to‘g‘ri burchakli uchburchak gipotenuzasini toping:',
    opts: ['10', '12', '14', '9'],
    ans: '10',
    exp: '√(6² + 8²) = √(36 + 64) = 10.',
  },
  {
    svg: '<rect x="65" y="25" width="90" height="90" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3"/><text x="98" y="132" fill="var(--text-primary)" font-size="14" font-family="monospace">a = 9</text>',
    q: 'Tomoni 9 sm bo‘lgan kvadratning perimetri nechaga teng?',
    opts: ['36 sm', '81 sm', '18 sm', '27 sm'],
    ans: '36 sm',
    exp: 'P = 4 × a = 4 × 9 = 36 sm.',
  },
  {
    svg: '<circle cx="110" cy="75" r="52" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3"/><line x1="110" y1="75" x2="162" y2="75" stroke="var(--accent)" stroke-width="2"/><text x="126" y="68" fill="var(--text-primary)" font-size="13" font-family="monospace">r=7</text>',
    q: 'Radiusi r = 7 sm bo‘lgan doiraning diametri nechaga teng?',
    opts: ['14 sm', '21 sm', '49 sm', '3.5 sm'],
    ans: '14 sm',
    exp: 'Diametr d = 2 × r = 14 sm.',
  },
];

export default {
  init(container, engine) {
    const queue = shuffle(QUESTIONS);
    let idx = 0;
    let locked = false;

    const render = () => {
      if (idx >= queue.length) {
        engine.finish('Geometriya masalalarini a’lo darajada yechdingiz!');
        return;
      }
      locked = false;
      const q = queue[idx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Masala ${idx + 1} / ${queue.length}</span>
          <span>Geometry Challenge</span>
        </div>
        <div class="stimulus-box">
          <svg viewBox="0 0 230 150" width="230" height="150">${q.svg}</svg>
          <p style="font-weight:600; font-size:1.05rem;">${q.q}</p>
        </div>
        <div class="choice-grid">
          ${shuffle(q.opts)
            .map((o) => `<button type="button" class="choice-btn mono" data-o="${o}">${o}</button>`)
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
            engine.addCorrect(145);
            setFeedback(fb, 'correct', `To‘g‘ri! ${q.exp}`);
            window.setTimeout(() => {
              idx += 1;
              render();
            }, 850);
          } else {
            btn.classList.add('is-wrong');
            engine.addWrong(25);
            setFeedback(fb, 'wrong', 'Formulani qayta eslab hisoblang.');
          }
        });
      });
    };

    render();
  },
};
