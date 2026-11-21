/**
 * BrainPlay — Shared Game Utilities (Shuffle, Random, SVG Shapes, Feedback)
 */

export function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function setFeedback(el, type, text) {
  if (!el) return;
  el.className = `game-feedback ${type}`;
  el.textContent = text || '';
}

export function renderShapeSvg(shape, color, size = 64) {
  const shapes = {
    doira: `<circle cx="50" cy="50" r="38" fill="${color}" />`,
    kvadrat: `<rect x="14" y="14" width="72" height="72" rx="8" fill="${color}" />`,
    uchburchak: `<polygon points="50,12 88,84 12,84" fill="${color}" />`,
    yulduz: `<polygon points="50,8 62,36 92,38 69,58 76,88 50,72 24,88 31,58 8,38 38,36" fill="${color}" />`,
    romb: `<polygon points="50,10 88,50 50,90 12,50" fill="${color}" />`,
    oltiburchak: `<polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="${color}" />`,
    yurak: `<path d="M50 84 C20 62 12 44 12 31 C12 18 22 10 34 10 C42 10 47 15 50 21 C53 15 58 10 66 10 C78 10 88 18 88 31 C88 44 80 62 50 84 Z" fill="${color}" />`,
    oval: `<ellipse cx="50" cy="50" rx="42" ry="26" fill="${color}" />`,
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">${shapes[shape] || shapes.doira}</svg>`;
}
