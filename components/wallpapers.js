/**
 * Wallpapers & Background System Component
 * Handles background image display, upload, and dynamic contrast overlays.
 */

import { storage } from '../utils/storage.js';

// Default macOS inspired wallpapers
const defaultWallpapers = [
  'https://images.unsplash.com/photo-1618172193763-c511deb635ca?q=80&w=2564&auto=format&fit=crop', // Big Sur abstract
  'https://images.unsplash.com/photo-1614531341773-3bff8b7cb3fc?q=80&w=2689&auto=format&fit=crop', // Monterey abstract
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2670&auto=format&fit=crop'  // Gradient
];

export const wallpapersComponent = {
  async init() {
    this.bindEvents();
    await this.loadWallpaper();
  },

  bindEvents() {
    const uploadInput = document.getElementById('wallpaper-upload-input');
    if (uploadInput) {
      uploadInput.addEventListener('change', (e) => this.handleUpload(e));
    }
  },

  async loadWallpaper() {
    const savedBg = await storage.get('wallpaperImage', defaultWallpapers[0]);
    this.applyWallpaper(savedBg);
    
    // Simulate Intelligent Overlay (Darken background slightly to ensure text is visible)
    const overlay = document.getElementById('wallpaper-overlay');
    if (overlay) {
      overlay.style.setProperty('--overlay-color', '#000000');
      overlay.style.setProperty('--overlay-opacity', '0.2');
    }
  },

  applyWallpaper(url) {
    const bg = document.getElementById('wallpaper-bg');
    if (bg) {
      bg.style.backgroundImage = `url('${url}')`;
    }
  },

  handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      this.applyWallpaper(dataUrl);
      await storage.set('wallpaperImage', dataUrl);
    };
    reader.readAsDataURL(file);
  }
};
