/**
 * Search Bar Component
 * Manages the global search bar input, autocomplete, history, and hotkeys.
 */

import { storage } from '../utils/storage.js';

export const searchComponent = {
  history: [],
  maxHistory: 8,
  activeIndex: -1,

  /**
   * Initialize search handlers
   */
  async init() {
    this.history = await storage.get('searchHistory', []);

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const historyDropdown = document.getElementById('search-history-dropdown');
    const clearBtn = document.getElementById('search-history-clear-btn');

    if (searchForm && searchInput) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.activeIndex >= 0 && this.activeIndex < this.history.length) {
          this.handleSearch(this.history[this.activeIndex]);
        } else {
          this.handleSearch(searchInput.value.trim());
        }
      });

      searchInput.addEventListener('focus', () => {
        if (this.history.length > 0) {
          this.renderHistory();
          historyDropdown.style.display = 'block';
        }
      });

      // Hide dropdown on blur, but delay to allow clicking history items
      searchInput.addEventListener('blur', () => {
        setTimeout(() => {
          historyDropdown.style.display = 'none';
          this.activeIndex = -1;
        }, 200);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (historyDropdown.style.display === 'block' && this.history.length > 0) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.activeIndex = (this.activeIndex + 1) % this.history.length;
            this.updateActiveItem();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.activeIndex = (this.activeIndex - 1 + this.history.length) % this.history.length;
            this.updateActiveItem();
          }
        }
      });

      if (historyDropdown) {
        historyDropdown.addEventListener('mousedown', (e) => {
          // Prevent input from losing focus when interacting with any part of the dropdown
          e.preventDefault();
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.clearHistory();
          historyDropdown.style.display = 'none';
        });
      }

      // Hotkey to focus search: '/' key
      document.addEventListener('keydown', (e) => {
        const activeElem = document.activeElement;
        const isInput = activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA');
        
        if (e.key === '/' && !isInput) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
      });
    }
  },

  updateActiveItem() {
    const list = document.getElementById('search-history-list');
    if (!list) return;
    const items = list.querySelectorAll('.history-item');
    items.forEach((item, index) => {
      if (index === this.activeIndex) {
        item.classList.add('active');
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = this.history[index];
      } else {
        item.classList.remove('active');
      }
    });
  },

  renderHistory() {
    const list = document.getElementById('search-history-list');
    const dropdown = document.getElementById('search-history-dropdown');
    if (!list || !dropdown) return;

    list.innerHTML = '';
    
    if (this.history.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    this.history.forEach((query, index) => {
      const li = document.createElement('li');
      li.className = 'history-item';
      
      const icon = document.createElement('svg');
      icon.className = 'history-icon';
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('fill', 'none');
      icon.setAttribute('stroke', 'currentColor');
      icon.setAttribute('stroke-width', '2');
      icon.innerHTML = '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>';
      
      const span = document.createElement('span');
      span.className = 'history-text';
      span.textContent = query;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-history-btn';
      removeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeHistoryItem(index);
      });

      li.appendChild(icon);
      li.appendChild(span);
      li.appendChild(removeBtn);

      li.addEventListener('click', () => {
        this.handleSearch(query);
      });

      list.appendChild(li);
    });
  },

  async addHistoryItem(query) {
    if (!query) return;
    // Remove if exists to push it to the top
    this.history = this.history.filter(item => item !== query);
    this.history.unshift(query);
    
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }
    
    await storage.set('searchHistory', this.history);
  },

  async removeHistoryItem(index) {
    this.history.splice(index, 1);
    await storage.set('searchHistory', this.history);
    this.renderHistory();
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.focus();
  },

  async clearHistory() {
    this.history = [];
    await storage.set('searchHistory', this.history);
    this.renderHistory();
  },

  /**
   * Detect if string is a valid URL or IP
   */
  isUrl(query) {
    if (/^https?:\/\//i.test(query)) return true;
    if (/^localhost(:\d+)?(\/.*)?$/i.test(query)) return true;
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
    return domainRegex.test(query);
  },

  /**
   * Perform navigation or Google Search based on text query
   */
  async handleSearch(query) {
    if (!query) return;

    await this.addHistoryItem(query);

    if (this.isUrl(query)) {
      let targetUrl = query;
      if (!/^https?:\/\//i.test(query)) {
        targetUrl = 'https://' + targetUrl;
      }
      window.location.href = targetUrl;
    } else {
      const encodedQuery = encodeURIComponent(query);
      window.location.href = `https://www.google.com/search?q=${encodedQuery}`;
    }
  }
};
