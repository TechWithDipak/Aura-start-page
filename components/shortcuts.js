/**
 * Pinned Shortcuts (Suggestions) Component
 * Renders large suggestion cards with dynamic gradient backgrounds.
 * Supports HTML5 Drag-and-Drop and custom user additions.
 */

import { storage } from '../utils/storage.js';

// Specific branding colors/gradients for popular domains
const brandStyles = {
  'instagram.com': { bg: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff' },
  'gemini.google.com': { bg: '#ffffff', color: '#000' },
  'github.com': { bg: '#0d1117', color: '#fff' },
  'music.youtube.com': { bg: '#ff0000', color: '#fff' },
  'claude.ai': { bg: '#f2efe9', color: '#000' },
  'vercel.com': { bg: '#000000', color: '#fff' },
  'drive.google.com': { bg: '#1fa463', color: '#fff' },
  'hotstar.com': { bg: '#1056a3', color: '#fff' },
  'google.com': { bg: '#1a73e8', color: '#fff' },
  'netflix.com': { bg: '#E50914', color: '#fff' },
  'twitter.com': { bg: '#000000', color: '#fff' },
  'x.com': { bg: '#000000', color: '#fff' }
};

// Fallback gradients
const fallbackGradients = [
  'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)'
];

export const shortcutsComponent = {
  shortcuts: [],
  draggedIndex: null,

  /**
   * Initialize shortcuts
   */
  async init() {
    this.shortcuts = await storage.get('pinnedShortcuts', [
      { id: 's_0', name: 'Instagram', url: 'https://instagram.com', time: 'Social' },
      { id: 's_1', name: 'Gemini', url: 'https://gemini.google.com', time: 'AI' },
      { id: 's_2', name: 'GitHub', url: 'https://github.com', time: 'Code' },
      { id: 's_3', name: 'YouTube Music', url: 'https://music.youtube.com', time: 'Media' },
      { id: 's_4', name: 'Claude', url: 'https://claude.ai', time: 'AI' },
      { id: 's_5', name: 'Vercel', url: 'https://vercel.com', time: 'Deploy' },
      { id: 's_6', name: 'Google Drive', url: 'https://drive.google.com', time: 'Cloud' },
      { id: 's_7', name: 'Netflix', url: 'https://netflix.com', time: 'Media' },
      { id: 's_8', name: 'X / Twitter', url: 'https://x.com', time: 'Social' },
      { id: 's_9', name: 'Google', url: 'https://google.com', time: 'Search' },
      { id: 's_10', name: 'Hotstar', url: 'https://hotstar.com', time: 'Media' }
    ]);

    this.renderShortcuts();
    this.setupModal();
  },

  /**
   * Render custom quick access cards in dashboard grid
   */
  renderShortcuts() {
    const container = document.getElementById('shortcuts-grid');
    if (!container) return;

    container.innerHTML = '';

    this.shortcuts.forEach((sc, index) => {
      const card = document.createElement('a');
      card.className = 'suggestion-card';
      card.href = sc.url;
      card.setAttribute('data-id', sc.id);
      card.setAttribute('data-index', index);
      card.draggable = true;

      const domain = this.getDomain(sc.url);

      let bgStyle = brandStyles[domain] ? `background: ${brandStyles[domain].bg};` : `background: ${fallbackGradients[index % fallbackGradients.length]};`;
      let textColor = brandStyles[domain] ? brandStyles[domain].color : '#fff';
      const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=256` : '';

      card.setAttribute('style', `${bgStyle} color: ${textColor};`);

      card.innerHTML = `
        <div class="suggestion-icon-wrapper">
          <img class="suggestion-favicon" src="${faviconUrl}" alt="${sc.name}" onerror="this.style.display='none'">
        </div>
        <div class="suggestion-content">
          <span class="suggestion-title">${sc.name}</span>
          <div class="suggestion-divider" style="height: 1px; background: currentColor; opacity: 0.15; margin: 4px 0;"></div>
          <span class="suggestion-domain">${domain}</span>
          <span class="suggestion-time">${sc.time || 'Custom'}</span>
        </div>
        <div class="suggestion-actions" style="position: absolute; top: 12px; right: 12px; display: flex; gap: 8px; opacity: 0; transition: opacity 0.2s; z-index: 10;">
          <button class="edit-suggestion-btn" aria-label="Edit" style="background: rgba(0,0,0,0.5); color: #fff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; transition: transform 0.1s;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="delete-suggestion-btn" aria-label="Delete" style="background: rgba(255,59,48,0.8); color: #fff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; transition: transform 0.1s;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;

      // Drag and Drop Listeners
      card.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
      card.addEventListener('dragover', (e) => this.handleDragOver(e));
      card.addEventListener('dragenter', (e) => this.handleDragEnter(e, index));
      card.addEventListener('dragleave', (e) => this.handleDragLeave(e));
      card.addEventListener('drop', (e) => this.handleDrop(e, index));
      card.addEventListener('dragend', (e) => this.handleDragEnd(e));

      // Hover Actions Listener
      const actionsDiv = card.querySelector('.suggestion-actions');
      card.addEventListener('mouseenter', () => actionsDiv.style.opacity = '1');
      card.addEventListener('mouseleave', () => actionsDiv.style.opacity = '0');

      const editBtn = card.querySelector('.edit-suggestion-btn');
      editBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent navigating
        e.stopPropagation();
        this.openModal(sc);
      });

      const deleteBtn = card.querySelector('.delete-suggestion-btn');
      deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(`Remove ${sc.name} from suggestions?`)) {
          this.shortcuts = this.shortcuts.filter(s => s.id !== sc.id);
          await this.saveShortcuts();
          this.renderShortcuts();
        }
      });

      container.appendChild(card);
    });

    // Add "Add Suggestion" Card if less than 12
    if (this.shortcuts.length < 12) {
      const addCard = document.createElement('div');
      addCard.className = 'suggestion-card add-suggestion-card';
      addCard.innerHTML = `
        <svg class="add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      `;
      addCard.addEventListener('click', () => this.openModal());
      container.appendChild(addCard);
    }
  },

  handleDragStart(e, index) {
    this.draggedIndex = index;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      e.target.classList.add('dragging');
    }, 0);
  },

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  },

  handleDragEnter(e, index) {
    e.preventDefault();
    const target = e.currentTarget;
    if (this.draggedIndex !== index) {
      target.classList.add('drag-over');
    }
  },

  handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  },

  async handleDrop(e, targetIndex) {
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');

    if (this.draggedIndex === null || this.draggedIndex === targetIndex) return;

    // Swap items
    const draggedItem = this.shortcuts[this.draggedIndex];
    this.shortcuts.splice(this.draggedIndex, 1);
    this.shortcuts.splice(targetIndex, 0, draggedItem);

    await this.saveShortcuts();
    this.renderShortcuts();
  },

  handleDragEnd(e) {
    e.target.classList.remove('dragging');
    const cards = document.querySelectorAll('.suggestion-card');
    cards.forEach(c => c.classList.remove('drag-over'));
    this.draggedIndex = null;
  },

  setupModal() {
    this.modalOverlay = document.getElementById('suggestion-modal-overlay');
    this.modalForm = document.getElementById('suggestion-form');
    this.idInput = document.getElementById('suggestion-id');
    this.nameInput = document.getElementById('suggestion-name');
    this.urlInput = document.getElementById('suggestion-url');
    this.deleteBtn = document.getElementById('suggestion-delete-btn');

    document.getElementById('suggestion-modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('suggestion-cancel-btn').addEventListener('click', () => this.closeModal());

    this.modalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveSuggestion();
    });

    this.deleteBtn.addEventListener('click', async () => {
      await this.deleteSuggestion();
    });
  },

  openModal(suggestion = null) {
    document.getElementById('suggestion-modal-title').textContent = suggestion ? 'Edit Suggestion' : 'Add Suggestion';

    if (suggestion) {
      this.idInput.value = suggestion.id;
      this.nameInput.value = suggestion.name;
      this.urlInput.value = suggestion.url;
      this.deleteBtn.style.display = 'block';
    } else {
      this.modalForm.reset();
      this.idInput.value = '';
      this.deleteBtn.style.display = 'none';
    }

    this.modalOverlay.style.display = 'flex';
  },

  closeModal() {
    this.modalOverlay.style.display = 'none';
    this.modalForm.reset();
  },

  async saveSuggestion() {
    const id = this.idInput.value;
    const name = this.nameInput.value.trim();
    let url = this.urlInput.value.trim();

    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    if (id) {
      // Edit existing
      const index = this.shortcuts.findIndex(s => s.id === id);
      if (index !== -1) {
        this.shortcuts[index].name = name;
        this.shortcuts[index].url = url;
      }
    } else {
      // Add new
      if (this.shortcuts.length >= 12) {
        alert("Maximum 12 suggestions allowed.");
        return;
      }
      this.shortcuts.push({
        id: 's_' + Date.now(),
        name,
        url,
        time: 'Custom'
      });
    }

    await this.saveShortcuts();
    this.renderShortcuts();
    this.closeModal();
  },

  async deleteSuggestion() {
    const id = this.idInput.value;
    if (id) {
      this.shortcuts = this.shortcuts.filter(s => s.id !== id);
      await this.saveShortcuts();
      this.renderShortcuts();
      this.closeModal();
    }
  },

  async saveShortcuts() {
    await storage.set('pinnedShortcuts', this.shortcuts);
  },

  /**
   * Extract domain host from string URL
   */
  getDomain(urlString) {
    try {
      const url = new URL(urlString);
      return url.hostname.replace('www.', '');
    } catch (e) {
      return '';
    }
  }
};
