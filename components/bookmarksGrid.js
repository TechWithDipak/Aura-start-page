/**
 * Safari Bookmark Grid Component
 * Manages rendering bookmark hierarchy, navigation stacks, favicons.
 */

import { bookmarksUtil } from '../utils/bookmarks.js';
import { storage } from '../utils/storage.js';

export const bookmarksGridComponent = {
  navigationStack: [], // Stack of folder node IDs: e.g., ['1']
  rootFolderId: '1', // Default Bookmarks Bar ID

  /**
   * Initialize bookmark grid
   */
  async init() {
    // 1. Restore folder navigation stack or start at Bookmarks Bar
    const savedStack = await storage.get('bookmarksNavStack', [this.rootFolderId]);
    this.navigationStack = savedStack;

    // 2. Load active bookmarks grid
    this.render();
  },

  /**
   * Core bookmark render loop
   */
  async render() {
    const grid = document.getElementById('bookmarks-grid');
    if (!grid) return;

    // Get current active folder ID
    const currentFolderId = this.navigationStack[this.navigationStack.length - 1] || this.rootFolderId;

    try {
      const children = await bookmarksUtil.getFolderChildren(currentFolderId);

      // Update breadcrumbs navigation
      await this.renderBreadcrumbs();

      grid.innerHTML = '';

      if (children.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">This folder is empty</div>';
        return;
      }

      children.forEach(node => {
        const item = document.createElement('a');
        item.className = 'favourite-item';
        item.setAttribute('data-id', node.id);

        if (node.url) {
          // Leaf node (bookmark)
          item.href = node.url;

          let domain = '';
          try {
            domain = new URL(node.url).hostname;
          } catch (e) {
            domain = '';
          }

          // Google's API fetches high-res favicons securely (up to 256px)
          const favicon = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=256` : '';

          item.innerHTML = `
            <div class="favourite-icon-wrapper">
              <img class="favourite-favicon" src="${favicon}" alt="${node.title}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23ffffff%22 stroke-width=%222%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22></circle><line x1=%222%22 y1=%2212%22 x2=%2222%22 y2=%2212%22></line></svg>'">
            </div>
            <span class="favourite-title" title="${node.title}">${node.title}</span>
          `;
        } else {
          // Folder node
          item.href = '#';
          item.innerHTML = `
            <div class="favourite-icon-wrapper">
              <svg style="width: 32px; height: 32px; color: var(--text-primary);" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M20 18H4V8h16v10zm-3-12H9L7 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <span class="favourite-title" title="${node.title}">${node.title}</span>
          `;

          // Handle click to expand folder
          item.addEventListener('click', (e) => {
            e.preventDefault();
            this.pushFolder(node.id);
          });
        }

        grid.appendChild(item);
      });
    } catch (error) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">Error reading bookmarks</div>';
    }
  },

  /**
   * Push new folder ID to stack and navigate
   */
  async pushFolder(folderId) {
    this.navigationStack.push(folderId);
    await storage.set('bookmarksNavStack', this.navigationStack);
    this.render();
  },

  /**
   * Navigate back to previous folder node in stack
   */
  async popFolder() {
    if (this.navigationStack.length > 1) {
      this.navigationStack.pop();
      await storage.set('bookmarksNavStack', this.navigationStack);
      this.render();
    }
  },

  /**
   * Reset navigation stack back to Bookmarks Bar root
   */
  async resetToRoot() {
    this.navigationStack = [this.rootFolderId];
    await storage.set('bookmarksNavStack', this.navigationStack);
    this.render();
  },

  /**
   * Render folder path breadcrumbs below widget title
   */
  async renderBreadcrumbs() {
    const nav = document.getElementById('bookmarks-nav');
    if (!nav) return;

    if (this.navigationStack.length <= 1) {
      nav.style.display = 'none';
      return;
    }

    nav.style.display = 'flex';
    nav.style.gap = '8px';
    nav.style.marginBottom = '12px';
    nav.style.fontSize = '0.9rem';
    nav.style.opacity = '0.8';
    nav.innerHTML = '';

    const backBtn = document.createElement('button');
    backBtn.textContent = '← Back';
    backBtn.style.cursor = 'pointer';
    backBtn.addEventListener('click', () => this.popFolder());
    nav.appendChild(backBtn);
  }
};
