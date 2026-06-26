/**
 * entrypoint newtab.js
 * Root controller initializing modules.
 */

import { clockComponent } from './components/clock.js';
import { searchComponent } from './components/search.js';
import { shortcutsComponent } from './components/shortcuts.js';
import { wallpapersComponent } from './components/wallpapers.js';
import { settingsComponent } from './components/settings.js';
import { bookmarksGridComponent } from './components/bookmarksGrid.js';

const app = {
  /**
   * Initialize entire dashboard extension
   */
  async init() {
    // 1. Initialize modular components
    if (clockComponent) await clockComponent.init();
    if (searchComponent) searchComponent.init();
    if (shortcutsComponent) await shortcutsComponent.init();
    if (wallpapersComponent) await wallpapersComponent.init();
    if (settingsComponent) await settingsComponent.init();
    
    if (bookmarksGridComponent) await bookmarksGridComponent.init();
  }
};

// Start application
document.addEventListener('DOMContentLoaded', () => app.init());
