/**
 * BrainPlay — Settings Page Controller (settings.html)
 */

import { loadState, resetAllData, resetProgressOnly, updateState } from './storage.js';
import {
  AGE_GROUPS,
  applyThemeAndAge,
  requireOnboarding,
  setAgeGroup,
  setUserProfile,
} from './user.js';
import { renderAppChrome, showToast } from './navigation.js';
import { SoundFX } from './audio.js';

function initSettingsPage() {
  const initialState = requireOnboarding();
  if (!initialState) return;

  renderAppChrome('settings');

  const nameInput = document.getElementById('settingsNameInput');
  const profileForm = document.getElementById('settingsProfileForm');
  const ageSelect = document.getElementById('settingsAgeSelect');
  const themeToggle = document.getElementById('themeToggleSwitch');
  const soundToggle = document.getElementById('soundToggleSwitch');
  const resetProgressBtn = document.getElementById('resetProgressBtn');
  const resetAllBtn = document.getElementById('resetAllBtn');

  // Confirmation modal elements (no window.confirm)
  const modal = document.getElementById('confirmModal');
  const modalTitle = document.getElementById('confirmModalTitle');
  const modalDesc = document.getElementById('confirmModalDesc');
  const modalCancel = document.getElementById('confirmModalCancel');
  const modalConfirm = document.getElementById('confirmModalOk');

  let pendingConfirmAction = null;

  const openConfirmModal = (title, desc, action) => {
    if (!modal) return;
    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    pendingConfirmAction = action;
    modal.hidden = false;
  };

  const closeConfirmModal = () => {
    if (!modal) return;
    modal.hidden = true;
    pendingConfirmAction = null;
  };

  if (modalCancel) modalCancel.addEventListener('click', closeConfirmModal);
  if (modalConfirm) {
    modalConfirm.addEventListener('click', () => {
      if (typeof pendingConfirmAction === 'function') pendingConfirmAction();
      closeConfirmModal();
    });
  }

  // Hydrate controls
  const syncControls = () => {
    const st = loadState();
    if (nameInput) nameInput.value = st.user.name || '';
    if (ageSelect) {
      ageSelect.innerHTML = Object.values(AGE_GROUPS)
        .map(
          (g) =>
            `<option value="${g.id}" ${g.id === st.user.ageGroup ? 'selected' : ''}>${g.range} — ${g.title}</option>`
        )
        .join('');
    }
    if (themeToggle) {
      themeToggle.setAttribute('aria-checked', String(st.settings.theme === 'dark'));
    }
    if (soundToggle) {
      soundToggle.setAttribute('aria-checked', String(st.settings.sound !== false));
    }
  };

  syncControls();

  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (nameInput?.value || '').trim();
      if (val.length < 2) {
        showToast('Ism kamida 2 ta harfdan iborat bo‘lishi kerak', 'danger');
        return;
      }
      setUserProfile(val);
      SoundFX.correct();
      renderAppChrome('settings');
      showToast('Profil ismi muvaffaqiyatli yangilandi', 'success');
    });
  }

  if (ageSelect) {
    ageSelect.addEventListener('change', (e) => {
      const nextAge = e.target.value;
      setAgeGroup(nextAge);
      SoundFX.click();
      renderAppChrome('settings');
      showToast(`Yosh guruhi ${AGE_GROUPS[nextAge].range} ga o‘zgartirildi`, 'success');
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const updated = updateState((s) => {
        s.settings.theme = s.settings.theme === 'dark' ? 'light' : 'dark';
        return s;
      });
      applyThemeAndAge(updated);
      SoundFX.click();
      syncControls();
      renderAppChrome('settings');
      showToast(updated.settings.theme === 'dark' ? 'Tungi rejim yoqildi' : 'Yorug‘ rejim yoqildi');
    });
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      const updated = updateState((s) => {
        s.settings.sound = s.settings.sound === false;
        return s;
      });
      syncControls();
      if (updated.settings.sound) SoundFX.correct();
      showToast(updated.settings.sound ? 'Ovoz effektlari yoqildi' : 'Ovoz effektlari o‘chirildi');
    });
  }

  if (resetProgressBtn) {
    resetProgressBtn.addEventListener('click', () => {
      openConfirmModal(
        'Natijalarni tozalash',
        'Barcha XP ballaringiz, rekordlaringiz, o‘yin tarixi va yutuqlaringiz nolga tushiriladi. Profil ismingiz saqlanib qoladi. Davom etasizmi?',
        () => {
          resetProgressOnly();
          renderAppChrome('settings');
          showToast('Barcha o‘yin natijalari tozalandi', 'success');
        }
      );
    });
  }

  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      openConfirmModal(
        'Hisobni to‘liq o‘chirish',
        'Ismingiz, yosh guruhingiz va barcha saqlangan ma’lumotlar o‘chiriladi hamda boshlang‘ich sahifaga qaytarilasiz.',
        () => {
          resetAllData();
          window.location.replace('./age-selection.html');
        }
      );
    });
  }
}

document.addEventListener('DOMContentLoaded', initSettingsPage);
