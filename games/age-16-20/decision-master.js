import { setFeedback } from '../helpers.js';

const SCENARIOS = [
  {
    q: '1-kvartal: Asosiy server yuklamasi 3 barobar oshdi. Qanday chora ko‘rasiz?',
    choices: [
      { label: 'Bulutli infratuzilmaga sarmoya kiritish', d: { budget: -18, team: +5, quality: +20, market: +10 } },
      { label: 'Jamoani tunu-kun optimizatsiyaga jalb qilish', d: { budget: -5, team: -20, quality: +12, market: +5 } },
    ],
  },
  {
    q: '2-kvartal: Yirik hamkor tezlashtirilgan reliz so‘ramoqda, lekin testlar tugamagan.',
    choices: [
      { label: 'Sifatni saqlab muddatni 2 haftaga surish', d: { budget: -8, team: +10, quality: +15, market: -8 } },
      { label: 'Darhol chiqarib keyin patch yozish', d: { budget: +18, team: -8, quality: -22, market: +14 } },
    ],
  },
  {
    q: '3-kvartal: Raqobatchi narxni 30% tushirdi. Strategiyangiz qanday?',
    choices: [
      { label: 'Yangi innovatsion funksiya bilan qiymatni oshirish', d: { budget: -12, team: +5, quality: +16, market: +15 } },
      { label: 'Narxni tushirib reklama byudjetini oshirish', d: { budget: -20, team: 0, quality: -5, market: +22 } },
    ],
  },
  {
    q: '4-kvartal: Senior muhandislar o‘qish va konferensiyalar uchun byudjet so‘radi.',
    choices: [
      { label: 'Ta’lim fondini tasdiqlash', d: { budget: -14, team: +22, quality: +12, market: 0 } },
      { label: 'Byudjetni tejab, faqat ichki seminarlar o‘tkazish', d: { budget: +12, team: -14, quality: +4, market: 0 } },
    ],
  },
  {
    q: '5-kvartal: Yangi qo‘shni mamlakat bozoriga chiqish imkoniyati paydo bo‘ldi.',
    choices: [
      { label: 'Keng ko‘lamli ekspansiya boshlash', d: { budget: -22, team: -8, quality: -5, market: +26 } },
      { label: 'Kichik pilot loyiha bilan sinab ko‘rish', d: { budget: -6, team: +6, quality: +8, market: +12 } },
    ],
  },
  {
    q: '6-kvartal: Xavfsizlik auditida kichik zaiflik aniqlandi.',
    choices: [
      { label: 'Barcha resursni xavfsizlikni yopishga yo‘naltirish', d: { budget: -10, team: -4, quality: +22, market: -4 } },
      { label: 'Kelasi oy rejasiga qoldirish', d: { budget: +14, team: +4, quality: -24, market: -10 } },
    ],
  },
  {
    q: '7-kvartal: Investor yangi raund uchun foyda ko‘rsatkichini talab qilmoqda.',
    choices: [
      { label: 'Korporativ (B2B) obuna tarifini ishga tushirish', d: { budget: +24, team: -6, quality: +6, market: +10 } },
      { label: 'Xarajatlarni keskin qisqartirish', d: { budget: +20, team: -18, quality: -12, market: -6 } },
    ],
  },
  {
    q: '8-kvartal (Yakuniy): Yillik yirik sammitda mahsulotingizni taqdim etish.',
    choices: [
      { label: 'Haqiqiy jonli demo va ochiq natijalar taqdimoti', d: { budget: -10, team: +12, quality: +12, market: +20 } },
      { label: 'Katta reklama kampaniyasi bilan qamrovni oshirish', d: { budget: -18, team: +4, quality: 0, market: +24 } },
    ],
  },
];

export default {
  init(container, engine) {
    let qIdx = 0;
    const stats = { budget: 55, team: 55, quality: 55, market: 55 };

    const clamp = (n) => Math.max(0, Math.min(100, n));

    const draw = () => {
      if (Object.values(stats).some((v) => v <= 0)) {
        engine.addWrong(40);
        engine.finish('Ko‘rsatkichlardan biri 0 ga tushdi. Muvozanatli strategiyani qayta sinab ko‘ring!');
        return;
      }
      if (qIdx >= SCENARIOS.length) {
        const avg = Math.round((stats.budget + stats.team + stats.quality + stats.market) / 4);
        engine.addBonus(avg * 6);
        engine.finish(`8 kvartal muvaffaqiyatli boshqarildi! O‘rtacha barqarorlik indeksi: ${avg}/100.`);
        return;
      }

      const sc = SCENARIOS[qIdx];

      container.innerHTML = `
        <div class="game-round-header">
          <span class="mono">Kvartal ${qIdx + 1} / ${SCENARIOS.length}</span>
          <span>Decision Master</span>
        </div>
        <div class="meter-row">
          <div class="meter-box"><span>Byudjet</span><strong>${stats.budget}%</strong></div>
          <div class="meter-box"><span>Jamoa</span><strong>${stats.team}%</strong></div>
          <div class="meter-box"><span>Sifat</span><strong>${stats.quality}%</strong></div>
          <div class="meter-box"><span>Bozor</span><strong>${stats.market}%</strong></div>
        </div>
        <div class="stimulus-box">
          <p style="font-size:1.08rem; font-weight:600;">${sc.q}</p>
        </div>
        <div class="choice-grid">
          ${sc.choices
            .map(
              (ch, i) => `<button type="button" class="choice-btn" data-ci="${i}" style="min-height:92px;">${ch.label}</button>`
            )
            .join('')}
        </div>
        <div id="fb" class="game-feedback idle"></div>
      `;

      const fb = container.querySelector('#fb');
      container.querySelectorAll('[data-ci]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const ch = sc.choices[Number(btn.getAttribute('data-ci'))];
          stats.budget = clamp(stats.budget + ch.d.budget);
          stats.team = clamp(stats.team + ch.d.team);
          stats.quality = clamp(stats.quality + ch.d.quality);
          stats.market = clamp(stats.market + ch.d.market);
          engine.addCorrect(110);
          setFeedback(fb, 'correct', 'Qaror qabul qilindi va ko‘rsatkichlar yangilandi.');
          qIdx += 1;
          window.setTimeout(draw, 450);
        });
      });
    };

    draw();
  },
};
