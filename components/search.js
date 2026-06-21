/**
 * Search Bar Component
 * Manages the Safari-style global search bar input, URL detection, and hotkeys.
 */

export const searchComponent = {
  /**
   * Initialize search handlers
   */
  init() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    if (searchForm && searchInput) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSearch(searchInput.value.trim());
      });

      // Hotkey to focus search: '/' key
      document.addEventListener('keydown', (e) => {
        // Only trigger focus if user is not already typing in another input/textarea
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

  /**
   * Detect if string is a valid URL or IP
   * @param {string} query 
   * @returns {boolean}
   */
  isUrl(query) {
    // 1. Easy check: starts with protocol
    if (/^https?:\/\//i.test(query)) {
      return true;
    }

    // 2. Localhost checks (e.g. localhost:8080)
    if (/^localhost(:\d+)?(\/.*)?$/i.test(query)) {
      return true;
    }

    // 3. Domain validation regex (e.g. github.com, custom-domain.tech)
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
    return domainRegex.test(query);
  },

  /**
   * Perform navigation or Google Search based on text query
   * @param {string} query 
   */
  handleSearch(query) {
    if (!query) return;

    if (this.isUrl(query)) {
      // Direct navigation
      let targetUrl = query;
      if (!/^https?:\/\//i.test(query)) {
        targetUrl = 'https://' + query;
      }
      window.location.href = targetUrl;
    } else {
      // Google search query
      const encodedQuery = encodeURIComponent(query);
      window.location.href = `https://www.google.com/search?q=${encodedQuery}`;
    }
  }
};
