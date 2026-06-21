/**
 * Safari Bookmark Grid Component
 * Manages rendering bookmark hierarchy, navigation stacks, favicons, and collapse state.
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

    // 2. Setup widget collapse state listener
    await this.initCollapseState();

    // 3. Load active bookmarks grid
    this.render();

    // 4. Listeners
    const toggleBtn = document.getElementById('toggle-bookmarks-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleCollapse());
    }
  },

  /**
   * Initialize and apply saved widget collapse settings
   */
  async initCollapseState() {
    const isCollapsed = await storage.get('bookmarksWidgetCollapsed', false);
    const card = document.getElementById('widget-bookmarks');
    if (card) {
      if (isCollapsed) {
        card.classList.add('collapsed-state');
      } else {
        card.classList.remove('collapsed-state');
      }
    }
  },

  /**
   * Toggle collapse state of the bookmarks widget
   */
  async toggleCollapse() {
    const card = document.getElementById('widget-bookmarks');
    if (!card) return;

    const currentlyCollapsed = card.classList.contains('collapsed-state');
    const targetState = !currentlyCollapsed;

    if (targetState) {
      card.classList.add('collapsed-state');
    } else {
      card.classList.remove('collapsed-state');
    }

    await storage.set('bookmarksWidgetCollapsed', targetState);
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
        grid.innerHTML = '<div class="reminders-empty">This bookmark folder is empty</div>';
        return;
      }

      children.forEach(node => {
        const item = document.createElement('a');
        item.className = 'bookmark-card animation-scale';
        item.setAttribute('data-id', node.id);

        if (node.url) {
          // Leaf node (bookmark)
          item.href = node.url;
          const favicon = bookmarksUtil.getFaviconUrl(node.url);
          
          item.innerHTML = `
            <div class="card-icon-container">
              <img class="bookmark-favicon" src="${favicon}" alt="${node.title}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23007aff%22 stroke-width=%222%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22></circle><line x1=%222%22 y1=%2212%22 x2=%2222%22 y2=%2212%22></line><path d=%22M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z%22></path></svg>'">
            </div>
            <span class="bookmark-title" title="${node.title}">${node.title}</span>
          `;
        } else {
          // Folder node
          item.href = '#';
          item.innerHTML = `
            <div class="card-icon-container">
              <svg class="folder-icon-svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M20 18H4V8h16v10zm-3-12H9L7 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <span class="bookmark-title" title="${node.title}">${node.title}</span>
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
      grid.innerHTML = '<div class="reminders-empty">Error reading bookmarks</div>';
    }
  },

  /**
   * Push new folder ID to stack and navigate
   * @param {string} folderId 
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
    nav.innerHTML = '';

    // Render "Back" arrow
    const backBtn = document.createElement('button');
    backBtn.className = 'breadcrumb-item';
    backBtn.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 12px; height: 12px; margin-right: 4px;">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      Back
    `;
    backBtn.addEventListener('click', () => this.popFolder());
    nav.appendChild(backBtn);

    // Build breadcrumbs path
    for (let i = 0; i < this.navigationStack.length; i++) {
      const folderId = this.navigationStack[i];
      const node = await bookmarksUtil.getNode(folderId);
      
      const breadcrumb = document.createElement('button');
      breadcrumb.className = 'breadcrumb-item';
      breadcrumb.textContent = node ? node.title : 'Folder';
      
      // Click a folder in path to jump to that depth
      breadcrumb.addEventListener('click', async () => {
        this.navigationStack = this.navigationStack.slice(0, i + 1);
        await storage.set('bookmarksNavStack', this.navigationStack);
        this.render();
      });

      nav.appendChild(breadcrumb);
    }
  }
};
