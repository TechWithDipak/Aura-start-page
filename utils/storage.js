/**
 * Storage Utility
 * Wrapper around chrome.storage.local to support Promise-based local persistence
 */

export const storage = {
  /**
   * Get value from local storage
   * @param {string} key 
   * @param {*} defaultValue 
   * @returns {Promise<*>}
   */
  async get(key, defaultValue = null) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        if (result && result[key] !== undefined) {
          resolve(result[key]);
        } else {
          resolve(defaultValue);
        }
      });
    });
  },

  /**
   * Save value to local storage
   * @param {string} key 
   * @param {*} value 
   * @returns {Promise<void>}
   */
  async set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  },

  /**
   * Remove value from local storage
   * @param {string} key 
   * @returns {Promise<void>}
   */
  async remove(key) {
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], () => {
        resolve();
      });
    });
  },

  /**
   * Clear all stored extension data
   * @returns {Promise<void>}
   */
  async clear() {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve();
      });
    });
  }
};
