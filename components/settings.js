/**
 * Settings Component
 * Handles the right-side settings drawer and preferences.
 */

import { storage } from '../utils/storage.js';

export const settingsComponent = {
  async init() {
    this.bindDrawerEvents();
    await this.loadPreferences();
  },

  bindDrawerEvents() {
    const triggerBtn = document.getElementById('settings-trigger-btn');
    const closeBtn = document.getElementById('settings-close-btn');
    const drawer = document.getElementById('settings-drawer');

    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => {
        if (drawer) drawer.classList.add('open-state');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (drawer) drawer.classList.remove('open-state');
      });
    }

    // Theme Selector
    const themeSelect = document.getElementById('settings-theme');
    if (themeSelect) {
      themeSelect.addEventListener('change', async (e) => {
        const val = e.target.value;
        this.applyTheme(val);
        await storage.set('theme', val);
      });
    }

    // Animations Toggle
    const animToggle = document.getElementById('settings-animations');
    if (animToggle) {
      animToggle.addEventListener('change', async (e) => {
        const val = e.target.checked;
        if (!val) {
          document.body.style.setProperty('--transition-spring', '0s');
          document.body.style.setProperty('--transition-normal', '0s');
          document.body.style.setProperty('--transition-fast', '0s');
        } else {
          document.body.style.removeProperty('--transition-spring');
          document.body.style.removeProperty('--transition-normal');
          document.body.style.removeProperty('--transition-fast');
        }
        await storage.set('animationsEnabled', val);
      });
    }
  },

  async loadPreferences() {
    const theme = await storage.get('theme', 'system');
    const themeSelect = document.getElementById('settings-theme');
    if (themeSelect) themeSelect.value = theme;
    this.applyTheme(theme);

    const animEnabled = await storage.get('animationsEnabled', true);
    const animToggle = document.getElementById('settings-animations');
    if (animToggle) {
      animToggle.checked = animEnabled;
      if (!animEnabled) {
        document.body.style.setProperty('--transition-spring', '0s');
        document.body.style.setProperty('--transition-normal', '0s');
        document.body.style.setProperty('--transition-fast', '0s');
      }
    }
  },

  applyTheme(theme) {
    if (theme === 'system') {
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
};
