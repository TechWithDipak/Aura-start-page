/**
 * Wallpaper Manager Component
 * Manages preset wallpapers, custom image uploads, thumbnail selectors, and persistence.
 */

import { storage } from '../utils/storage.js';

export const wallpapersComponent = {
  presets: [
    { key: 'gradient', label: 'Mesh Gradient', url: 'assets/wallpapers/gradient.svg' },
    { key: 'abstract', label: 'macOS Sonoma', url: 'assets/wallpapers/abstract.svg' },
    { key: 'mountains', label: 'Sunset Peak', url: 'assets/wallpapers/mountains.svg' },
    { key: 'ocean', label: 'Teal Waves', url: 'assets/wallpapers/ocean.svg' },
    { key: 'aurora', label: 'Aurora Lights', url: 'assets/wallpapers/aurora.svg' },
    { key: 'forest', label: 'Misty Pines', url: 'assets/wallpapers/forest.svg' },
    { key: 'dark', label: 'Dark Obsidian', url: 'assets/wallpapers/dark.svg' }
  ],
  currentWallpaper: 'gradient',

  /**
   * Initialize Wallpaper module
   */
  async init() {
    this.currentWallpaper = await storage.get('currentWallpaper', 'gradient');
    this.applyWallpaper(this.currentWallpaper);
    this.renderSelectorGrid();
    this.setupUploadHandlers();
  },

  /**
   * Set and persist wallpaper background
   * @param {string} wallpaperValue - either preset key or base64 URL
   */
  async selectWallpaper(wallpaperValue) {
    this.currentWallpaper = wallpaperValue;
    await storage.set('currentWallpaper', wallpaperValue);
    this.applyWallpaper(wallpaperValue);
    this.updateSelectedThumbnailState();
  },

  /**
   * Apply CSS background variables/rules to container
   */
  applyWallpaper(wallpaperValue) {
    const bgContainer = document.getElementById('wallpaper-bg');
    if (!bgContainer) return;

    // Check if value is a preset key
    const preset = this.presets.find(p => p.key === wallpaperValue);
    if (preset) {
      bgContainer.style.backgroundImage = `url('${preset.url}')`;
    } else {
      // Must be a custom base64 image
      bgContainer.style.backgroundImage = `url('${wallpaperValue}')`;
    }
  },

  /**
   * Build wallpapers picker UI in Settings Panel
   */
  renderSelectorGrid() {
    const grid = document.querySelector('.wallpaper-selector-grid');
    if (!grid) return;

    grid.innerHTML = '';

    this.presets.forEach(preset => {
      const option = document.createElement('div');
      option.className = `wallpaper-option ${preset.key === this.currentWallpaper ? 'selected' : ''}`;
      option.setAttribute('data-key', preset.key);
      option.setAttribute('title', preset.label);

      option.innerHTML = `
        <div class="wallpaper-option-thumb" style="background-image: url('${preset.url}')"></div>
        <div class="wallpaper-option-label">${preset.label}</div>
      `;

      option.addEventListener('click', () => this.selectWallpaper(preset.key));
      grid.appendChild(option);
    });
  },

  /**
   * Sync active highlighted class in selector grid
   */
  updateSelectedThumbnailState() {
    const options = document.querySelectorAll('.wallpaper-option');
    options.forEach(opt => {
      const key = opt.getAttribute('data-key');
      if (key === this.currentWallpaper) {
        opt.classList.add('selected');
      } else {
        opt.classList.remove('selected');
      }
    });
  },

  /**
   * Hook file upload and reset buttons
   */
  setupUploadHandlers() {
    const uploadInput = document.getElementById('wallpaper-upload-input');
    const resetBtn = document.getElementById('reset-wallpaper-btn');

    if (uploadInput) {
      uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Size check (Base64 grows by 33%, keep file under 3MB to avoid slow storage)
        if (file.size > 3 * 1024 * 1024) {
          alert('To ensure fast load times, please choose a wallpaper image smaller than 3MB.');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Url = event.target.result;
          this.selectWallpaper(base64Url);
        };
        reader.readAsDataURL(file);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.selectWallpaper('gradient');
      });
    }
  }
};
