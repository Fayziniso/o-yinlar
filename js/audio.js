/**
 * BrainPlay — Web Audio API Synthesizer
 * Generates pleasant, non-intrusive feedback sounds without external audio dependencies.
 */

import { loadState } from './storage.js';

let audioCtx = null;

function getContext() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled() {
  const state = loadState();
  return state.settings.sound !== false;
}

function playTone(freq, duration, type = 'sine', volume = 0.12, delay = 0) {
  if (!isSoundEnabled()) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export const SoundFX = {
  click() {
    playTone(540, 0.055, 'triangle', 0.07);
  },

  correct() {
    playTone(523.25, 0.12, 'sine', 0.12, 0);
    playTone(659.25, 0.16, 'sine', 0.13, 0.07);
  },

  wrong() {
    playTone(230, 0.14, 'sawtooth', 0.08, 0);
    playTone(185, 0.18, 'sawtooth', 0.07, 0.09);
  },

  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => playTone(n, 0.22, 'triangle', 0.13, i * 0.09));
  },

  levelUp() {
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((n, i) => playTone(n, 0.25, 'sine', 0.14, i * 0.08));
  },

  /** Synthesized playful sound profiles for animal sound game */
  animal(kind) {
    if (!isSoundEnabled()) return;
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (kind === 'cat') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.linearRampToValueAtTime(920, now + 0.18);
      osc.frequency.linearRampToValueAtTime(520, now + 0.45);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (kind === 'dog') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.22);
      playTone(260, 0.16, 'sawtooth', 0.11, 0.24);
    } else if (kind === 'bird') {
      playTone(1450, 0.09, 'sine', 0.11, 0);
      playTone(1850, 0.09, 'sine', 0.11, 0.11);
      playTone(1600, 0.12, 'sine', 0.11, 0.23);
    } else if (kind === 'cow') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(145, now);
      osc.frequency.linearRampToValueAtTime(125, now + 0.55);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.62);
    } else if (kind === 'frog') {
      playTone(190, 0.1, 'square', 0.08, 0);
      playTone(280, 0.12, 'square', 0.08, 0.12);
    } else {
      // duck / sheep / lion fallback
      playTone(420, 0.12, 'triangle', 0.11, 0);
      playTone(360, 0.14, 'triangle', 0.11, 0.14);
    }
  },
};
