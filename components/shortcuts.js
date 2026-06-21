/**
 * Pinned Shortcuts & Global Keyboard Hotkeys Component
 * Manages customizable Quick Access buttons and maps system-wide hotkeys.
 */

import { storage } from '../utils/storage.js';

export const shortcutsComponent = {
  shortcuts: [],

  /**
   * Initialize shortcuts and hotkeys
   */
  async init() {
    this.shortcuts = await storage.get('pinnedShortcuts', [
      { id: 's_1', name: 'Gmail', url: 'https://mail.google.com' },
      { id: 's_2', name: 'GitHub', url: 'https://github.com' },
      { id: 's_3', name: 'LinkedIn', url: 'https://linkedin.com' },
      { id: 's_4', name: 'ChatGPT', url: 'https://chatgpt.com' },
      { id: 's_5', name: 'Notion', url: 'https://notion.so' },
      { id: 's_6', name: 'Calendar', url: 'https://calendar.google.com' }
    ]);

    this.renderShortcuts();
    this.setupEventListeners();
    this.setupGlobalHotkeys();
  },

  /**
   * Render custom quick access cards in dashboard grid
   */
  renderShortcuts() {
    const container = document.getElementById('shortcuts-grid');
    if (!container) return;

    container.innerHTML = '';

    this.shortcuts.forEach(sc => {
      const card = document.createElement('a');
      card.className = 'bookmark-card animation-scale';
      card.href = sc.url;
      card.setAttribute('data-id', sc.id);

      const domain = this.getDomain(sc.url);
      const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;

      card.innerHTML = `
        <button class="shortcut-delete-btn" title="Remove pinned shortcut" aria-label="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="card-icon-container">
          <img class="bookmark-favicon" src="${faviconUrl}" alt="${sc.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23007aff%22 stroke-width=%222%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22></circle><line x1=%222%22 y1=%2212%22 x2=%2222%22 y2=%2212%22></line><path d=%22M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z%22></path></svg>'">
        </div>
        <span class="bookmark-title">${sc.name}</span>
      `;

      // Prevent link navigation if they click delete button
      const delBtn = card.querySelector('.shortcut-delete-btn');
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.deleteShortcut(sc.id);
      });

      container.appendChild(card);
    });
  },

  /**
   * Extract domain host from string URL
   */
  getDomain(urlString) {
    try {
      const url = new URL(urlString);
      return url.hostname;
    } catch (e) {
      return '';
    }
  },

  /**
   * Hook shortcuts interactions (modal openers)
   */
  setupEventListeners() {
    const addShortcutBtn = document.getElementById('add-shortcut-btn');
    const saveShortcutBtn = document.getElementById('save-shortcut-btn');
    const closeShortcutModalBtn = document.getElementById('close-shortcut-modal-btn');
    const modal = document.getElementById('shortcut-modal');

    if (addShortcutBtn) {
      addShortcutBtn.addEventListener('click', () => {
        if (modal) modal.style.display = 'flex';
        document.getElementById('shortcut-name').focus();
      });
    }

    if (closeShortcutModalBtn) {
      closeShortcutModalBtn.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
        this.clearModalInputs();
      });
    }

    if (saveShortcutBtn) {
      saveShortcutBtn.addEventListener('click', () => this.handleAddShortcut());
    }

    // Modal key hooks
    if (modal) {
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          modal.style.display = 'none';
          this.clearModalInputs();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.handleAddShortcut();
        }
      });
    }
  },

  /**
   * Save a newly typed shortcut
   */
  async handleAddShortcut() {
    const nameInput = document.getElementById('shortcut-name');
    const urlInput = document.getElementById('shortcut-url');
    const modal = document.getElementById('shortcut-modal');

    if (!nameInput || !urlInput) return;

    const name = nameInput.value.trim();
    let url = urlInput.value.trim();

    if (!name || !url) return;

    // Autocorrect URLs lacking protocol
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const newShortcut = {
      id: 'sc_' + Date.now(),
      name: name,
      url: url
    };

    this.shortcuts.push(newShortcut);
    await storage.set('pinnedShortcuts', this.shortcuts);

    this.renderShortcuts();
    
    if (modal) modal.style.display = 'none';
    this.clearModalInputs();
  },

  /**
   * Clear textbox elements in dialog
   */
  clearModalInputs() {
    const nameInput = document.getElementById('shortcut-name');
    const urlInput = document.getElementById('shortcut-url');
    if (nameInput) nameInput.value = '';
    if (urlInput) urlInput.value = '';
  },

  /**
   * Delete shortcut card
   */
  async deleteShortcut(id) {
    this.shortcuts = this.shortcuts.filter(sc => sc.id !== id);
    await storage.set('pinnedShortcuts', this.shortcuts);
    this.renderShortcuts();
  },

  /**
   * Setup Apple system global shortcuts:
   * - Option + S: open settings
   * - Option + N: new note
   * - Option + T: new task
   */
  setupGlobalHotkeys() {
    document.addEventListener('keydown', (e) => {
      // Option + S toggle settings drawer
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const settingsDrawer = document.getElementById('settings-drawer');
        if (settingsDrawer) {
          settingsDrawer.classList.toggle('open-state');
        }
      }
    });
  }
};
