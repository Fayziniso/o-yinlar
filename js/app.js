/**
 * BrainPlay — Onboarding Controller (index.html, age-selection.html, registration.html)
 */

import { loadState, updateState } from './storage.js';
import {
  AGE_GROUPS,
  applyThemeAndAge,
  isOnboardingComplete,
  isValidAgeGroup,
  setAgeGroup,
  setUserProfile,
} from './user.js';
import { SoundFX } from './audio.js';

const AVATAR_COLORS = ['#ea580c', '#059669', '#2563eb', '#4338ca', '#b45309', '#be123c'];

function bindOnboardingThemeButton() {
  const btn = document.getElementById('onboardingThemeBtn');
  if (!btn) return;
  const updateLabel = () => {
    const st = loadState();
    btn.textContent = st.settings.theme === 'dark' ? 'Yorug‘ rejim' : 'Tungi rejim';
  };
  updateLabel();
  btn.addEventListener('click', () => {
    SoundFX.click();
    const next = updateState((s) => {
      s.settings.theme = s.settings.theme === 'dark' ? 'light' : 'dark';
      return s;
    });
    applyThemeAndAge(next);
    updateLabel();
  });
}

export function initAgeSelectionPage({ redirectIfOnboarded = false } = {}) {
  const state = loadState();
  applyThemeAndAge(state);

  if (redirectIfOnboarded && isOnboardingComplete(state)) {
    window.location.replace('./dashboard.html');
    return;
  }

  bindOnboardingThemeButton();

  const backBtn = document.getElementById('backToDashboardLink');
  if (backBtn && isOnboardingComplete(state)) {
    backBtn.hidden = false;
  }

  const grid = document.getElementById('ageCardsGrid');
  if (!grid) return;

  const groups = Object.values(AGE_GROUPS);
  grid.innerHTML = groups
    .map(
      (g) => `
      <article class="age-card" data-group="${g.id}" tabindex="0" role="button" aria-label="${g.range} — ${g.title} guruhini tanlash">
        <div class="age-card-media">
          <img src="${g.image}" alt="${g.range} ${g.title} illyustratsiyasi" referrerpolicy="no-referrer" />
        </div>
        <div class="age-card-body">
          <span class="age-card-kicker">${g.range}</span>
          <h2 class="age-card-title">${g.title}</h2>
          <p class="age-card-desc">${g.description}</p>
          <div class="age-card-meta">15 ta maxsus o‘yin · Moslashtirilgan dizayn</div>
          <button type="button" class="btn age-card-btn" data-select-age="${g.id}">Tanlash</button>
        </div>
      </article>
    `
    )
    .join('');

  const handleSelect = (groupId) => {
    if (!isValidAgeGroup(groupId)) return;
    SoundFX.click();
    const updated = setAgeGroup(groupId);
    if (updated && updated.user.name && updated.user.name.trim().length >= 2) {
      window.location.href = './dashboard.html';
    } else {
      window.location.href = './registration.html';
    }
  };

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('[data-group]');
    if (!card) return;
    handleSelect(card.getAttribute('data-group'));
  });

  grid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('[data-group]');
      if (!card) return;
      e.preventDefault();
      handleSelect(card.getAttribute('data-group'));
    }
  });
}

export function initRegistrationPage() {
  const state = loadState();
  applyThemeAndAge(state);
  bindOnboardingThemeButton();

  if (!isValidAgeGroup(state.user.ageGroup)) {
    window.location.replace('./age-selection.html');
    return;
  }

  const group = AGE_GROUPS[state.user.ageGroup];

  const visualImg = document.getElementById('regVisualImg');
  const visualRange = document.getElementById('regVisualRange');
  const visualTitle = document.getElementById('regVisualTitle');
  const visualDesc = document.getElementById('regVisualDesc');

  if (visualImg) {
    visualImg.src = group.image;
    visualImg.alt = `${group.range} — ${group.title}`;
  }
  if (visualRange) visualRange.textContent = group.range;
  if (visualTitle) visualTitle.textContent = group.title;
  if (visualDesc) visualDesc.textContent = group.description;

  const form = document.getElementById('registrationForm');
  const nameInput = document.getElementById('playerNameInput');
  const errorEl = document.getElementById('nameError');
  const greetingEl = document.getElementById('greetingPreview');
  const pickerEl = document.getElementById('avatarPicker');

  let selectedColor = state.user.avatarColor || group.accent || AVATAR_COLORS[0];

  if (nameInput && state.user.name) {
    nameInput.value = state.user.name;
  }

  const updatePreview = () => {
    const val = (nameInput?.value || '').trim();
    if (greetingEl) {
      greetingEl.textContent =
        val.length >= 2
          ? `Salom, ${val}! ${group.title} olamiga xush kelibsiz.`
          : 'Ismingizni kiriting — siz uchun shaxsiy profil tayyorlaymiz.';
    }
    if (pickerEl) {
      const initials = val.length >= 1 ? val.slice(0, 2).toUpperCase() : 'BP';
      pickerEl.querySelectorAll('.avatar-option').forEach((btn) => {
        btn.textContent = initials;
      });
    }
  };

  if (pickerEl) {
    pickerEl.innerHTML = AVATAR_COLORS.map(
      (color) => `
      <button type="button" class="avatar-option ${color === selectedColor ? 'selected' : ''}" data-color="${color}" style="background:${color}; color:#ffffff;" aria-label="Profil rangi ${color}">BP</button>
    `
    ).join('');

    pickerEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-color]');
      if (!btn) return;
      selectedColor = btn.getAttribute('data-color');
      SoundFX.click();
      pickerEl.querySelectorAll('.avatar-option').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  }

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (errorEl) errorEl.textContent = '';
      updatePreview();
    });
    nameInput.focus();
  }

  updatePreview();

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (nameInput?.value || '').trim();
      if (!val) {
        if (errorEl) errorEl.textContent = 'Iltimos, ismingizni kiriting.';
        nameInput?.focus();
        return;
      }
      if (val.length < 2) {
        if (errorEl) errorEl.textContent = 'Ism kamida 2 ta harfdan iborat bo‘lishi kerak.';
        nameInput?.focus();
        return;
      }
      SoundFX.correct();
      setUserProfile(val, selectedColor);
      window.location.href = './dashboard.html';
    });
  }
}
