/**
 * Settings Panel Controller Component
 * Manages toggling settings panel drawer, updating sliders, class updates, and resets.
 */

import { storage } from '../utils/storage.js';
import { clockComponent } from './clock.js';

export const settingsComponent = {
  preferences: {},

  /**
   * Initialize settings module
   */
  async init() {
    this.preferences = {
      theme: await storage.get('theme', 'system'),
      clockFormat24: await storage.get('clockFormat24', false),
      cardSize: await storage.get('cardSize', 'medium'),
      blurAmount: await storage.get('blurAmount', 20),
      glassOpacity: await storage.get('glassOpacity', 20),
      animationsEnabled: await storage.get('animationsEnabled', true)
    };

    this.applyPreferences();
    this.populateFormInputs();
    this.setupEventListeners();
  },

  /**
   * Apply preferences settings to document classes & CSS variables
   */
  applyPreferences() {
    const body = document.body;

    // 1. Theme Configuration
    body.classList.remove('theme-system', 'theme-light', 'theme-dark');
    if (this.preferences.theme === 'system') {
      body.classList.add('theme-system');
    } else if (this.preferences.theme === 'dark') {
      body.classList.add('theme-dark');
    } else {
      body.classList.add('theme-light');
    }

    // 2. Card Size class
    body.classList.remove('card-size-small', 'card-size-medium', 'card-size-large');
    body.classList.add(`card-size-${this.preferences.cardSize}`);

    // 3. CSS variables for blur and opacity
    document.documentElement.style.setProperty('--glass-blur', `${this.preferences.blurAmount}px`);
    document.documentElement.style.setProperty('--glass-opacity-val', this.preferences.glassOpacity / 100);

    // 4. Animation transitions class
    if (this.preferences.animationsEnabled) {
      body.classList.remove('transitions-disabled');
    } else {
      body.classList.add('transitions-disabled');
    }
  },

  /**
   * Render state values to elements in settings forms
   */
  populateFormInputs() {
    const themeSelect = document.getElementById('settings-theme');
    const clockFormatSelect = document.getElementById('settings-clock-format');
    const cardSizeSelect = document.getElementById('settings-card-size');
    const blurSlider = document.getElementById('settings-blur-amount');
    const opacitySlider = document.getElementById('settings-glass-opacity');
    const animationsToggle = document.getElementById('settings-animations');

    const blurText = document.getElementById('blur-amount-val');
    const opacityText = document.getElementById('glass-opacity-val');

    if (themeSelect) themeSelect.value = this.preferences.theme;
    if (clockFormatSelect) clockFormatSelect.value = this.preferences.clockFormat24 ? '24' : '12';
    if (cardSizeSelect) cardSizeSelect.value = this.preferences.cardSize;
    
    if (blurSlider) {
      blurSlider.value = this.preferences.blurAmount;
      if (blurText) blurText.textContent = `${this.preferences.blurAmount}px`;
    }

    if (opacitySlider) {
      opacitySlider.value = this.preferences.glassOpacity;
      if (opacityText) opacityText.textContent = `${this.preferences.glassOpacity}%`;
    }

    if (animationsToggle) animationsToggle.checked = this.preferences.animationsEnabled;
  },

  /**
   * Bind event listeners for sliders and toggles
   */
  setupEventListeners() {
    const triggerBtn = document.getElementById('settings-trigger-btn');
    const closeBtn = document.getElementById('settings-close-btn');
    const drawer = document.getElementById('settings-drawer');
    const resetAllBtn = document.getElementById('reset-all-settings-btn');

    // Drawer Toggles
    if (triggerBtn && drawer) {
      triggerBtn.addEventListener('click', () => {
        drawer.classList.toggle('open-state');
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.remove('open-state');
      });
    }

    // Close settings if clicking outside drawer
    document.addEventListener('click', (e) => {
      if (drawer && drawer.classList.contains('open-state')) {
        const isClickInside = drawer.contains(e.target) || triggerBtn.contains(e.target);
        // Also check if they clicked on standard modals/dialogs to prevent closing drawer
        const isModalClick = e.target.closest('.modal-overlay') || e.target.closest('.modal-card');
        if (!isClickInside && !isModalClick) {
          drawer.classList.remove('open-state');
        }
      }
    });

    // Theme selector change
    const themeSelect = document.getElementById('settings-theme');
    if (themeSelect) {
      themeSelect.addEventListener('change', async (e) => {
        this.preferences.theme = e.target.value;
        await storage.set('theme', this.preferences.theme);
        this.applyPreferences();
      });
    }

    // Clock Format Change
    const clockFormatSelect = document.getElementById('settings-clock-format');
    if (clockFormatSelect) {
      clockFormatSelect.addEventListener('change', async (e) => {
        const is24 = e.target.value === '24';
        this.preferences.clockFormat24 = is24;
        await clockComponent.setClockFormat(is24);
      });
    }

    // Bookmark size selector
    const cardSizeSelect = document.getElementById('settings-card-size');
    if (cardSizeSelect) {
      cardSizeSelect.addEventListener('change', async (e) => {
        this.preferences.cardSize = e.target.value;
        await storage.set('cardSize', this.preferences.cardSize);
        this.applyPreferences();
      });
    }

    // Blur amount slider (change + real-time input preview)
    const blurSlider = document.getElementById('settings-blur-amount');
    const blurText = document.getElementById('blur-amount-val');
    if (blurSlider) {
      blurSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        if (blurText) blurText.textContent = `${val}px`;
        document.documentElement.style.setProperty('--glass-blur', `${val}px`);
      });
      blurSlider.addEventListener('change', async (e) => {
        this.preferences.blurAmount = parseInt(e.target.value);
        await storage.set('blurAmount', this.preferences.blurAmount);
      });
    }

    // Glass opacity slider
    const opacitySlider = document.getElementById('settings-glass-opacity');
    const opacityText = document.getElementById('glass-opacity-val');
    if (opacitySlider) {
      opacitySlider.addEventListener('input', (e) => {
        const val = e.target.value;
        if (opacityText) opacityText.textContent = `${val}%`;
        document.documentElement.style.setProperty('--glass-opacity-val', val / 100);
      });
      opacitySlider.addEventListener('change', async (e) => {
        this.preferences.glassOpacity = parseInt(e.target.value);
        await storage.set('glassOpacity', this.preferences.glassOpacity);
      });
    }

    // Animations checkbox toggle
    const animationsToggle = document.getElementById('settings-animations');
    if (animationsToggle) {
      animationsToggle.addEventListener('change', async (e) => {
        this.preferences.animationsEnabled = e.target.checked;
        await storage.set('animationsEnabled', this.preferences.animationsEnabled);
        this.applyPreferences();
      });
    }

    // Reset All Settings button click
    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', async () => {
        const confirmReset = confirm('Are you sure you want to restore defaults? This will erase notes, tasks, wallpapers, and all preferences.');
        if (confirmReset) {
          await storage.clear();
          window.location.reload();
        }
      });
    }
  }
};
