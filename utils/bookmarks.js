/**
 * Bookmarks API Utility
 * Fetches and navigates the native browser bookmarks tree.
 */

export const bookmarksUtil = {
  /**
   * Fetch the full browser bookmarks tree
   * @returns {Promise<chrome.bookmarks.BookmarkTreeNode[]>}
   */
  async getTree() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.getTree((tree) => {
          resolve(tree || []);
        });
      } else {
        // Fallback for development outside extension env
        resolve([
          {
            id: "root",
            title: "Root",
            children: [
              {
                id: "1",
                title: "Bookmarks Bar",
                children: [
                  { id: "10", title: "YouTube", url: "https://youtube.com" },
                  { id: "11", title: "GitHub", url: "https://github.com" },
                  { id: "12", title: "ChatGPT", url: "https://chatgpt.com" },
                  { id: "13", title: "Gmail", url: "https://mail.google.com" },
                  { id: "14", title: "LinkedIn", url: "https://linkedin.com" }
                ]
              }
            ]
          }
        ]);
      }
    });
  },

  /**
   * Get children of a specific bookmark folder ID
   * @param {string} folderId 
   * @returns {Promise<chrome.bookmarks.BookmarkTreeNode[]>}
   */
  async getFolderChildren(folderId) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.getChildren(folderId, (children) => {
          resolve(children || []);
        });
      } else {
        // Fallback folder children mock
        resolve([
          { id: "10", title: "YouTube", url: "https://youtube.com" },
          { id: "11", title: "GitHub", url: "https://github.com" },
          { id: "12", title: "ChatGPT", url: "https://chatgpt.com" }
        ]);
      }
    });
  },

  /**
   * Get a bookmark folder node details
   * @param {string} nodeId 
   * @returns {Promise<chrome.bookmarks.BookmarkTreeNode>}
   */
  async getNode(nodeId) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.get(nodeId, (nodes) => {
          resolve(nodes && nodes[0] ? nodes[0] : null);
        });
      } else {
        resolve({ id: nodeId, title: "Bookmarks Bar" });
      }
    });
  },

  /**
   * Retrieve domain from a URL string
   * @param {string} urlString 
   * @returns {string}
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
   * Get favicon URL for a given domain/URL
   * Utilizes Google's high-res favicon service.
   * @param {string} pageUrl 
   * @returns {string}
   */
  getFaviconUrl(pageUrl) {
    const domain = this.getDomain(pageUrl);
    if (!domain) return '';
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  }
};
