/**
 * Clock & Date Component
 * Manages the live time, date, formatting, and dynamic greeting message.
 */

import { storage } from '../utils/storage.js';

export const clockComponent = {
  clockInterval: null,
  is24Hour: false,
  userName: 'Dipak', // Defaulting to the user name from request

  /**
   * Initialize clock updates and settings
   */
  async init() {
    this.is24Hour = await storage.get('clockFormat24', false);
    this.userName = await storage.get('userName', 'Dipak');
    
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  },

  /**
   * Set the user's name and update greeting
   * @param {string} newName 
   */
  async setUserName(newName) {
    this.userName = newName || 'Dipak';
    await storage.set('userName', this.userName);
    this.updateClock();
  },

  /**
   * Set clock format (12 or 24 hour)
   * @param {boolean} value 
   */
  async setClockFormat(value) {
    this.is24Hour = value;
    await storage.set('clockFormat24', value);
    this.updateClock();
  },

  /**
   * Perform clock render cycle
   */
  updateClock() {
    const now = new Date();
    
    // 1. Render Time
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    let ampm = '';

    if (!this.is24Hour) {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // The hour '0' should be '12'
    } else {
      hours = String(hours).padStart(2, '0');
    }

    const clockDisplay = document.getElementById('clock-text');
    const clockAmpm = document.getElementById('clock-ampm');
    
    if (clockDisplay) {
      clockDisplay.textContent = `${hours}:${minutes}`;
    }
    if (clockAmpm) {
      clockAmpm.textContent = ampm;
      clockAmpm.style.display = this.is24Hour ? 'none' : 'inline-block';
    }

    // 2. Render Date
    const dateDisplay = document.getElementById('date-text');
    if (dateDisplay) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateDisplay.textContent = now.toLocaleDateString(undefined, options);
    }

    // 3. Render Greeting
    const greetingText = document.getElementById('greeting-text');
    if (greetingText) {
      const currentHour = now.getHours();
      let greeting = 'Good Evening';

      if (currentHour < 12) {
        greeting = 'Good Morning';
      } else if (currentHour < 17) {
        greeting = 'Good Afternoon';
      }

      greetingText.textContent = `${greeting}, ${this.userName}`;
    }
  },

  /**
   * Cleanup interval on unload
   */
  destroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }
};
