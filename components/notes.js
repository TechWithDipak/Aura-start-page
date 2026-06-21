/**
 * Apple Notes Clone Widget Component
 * Manages creation, editing, deletion, pinning, text searching, and auto-saving of notes.
 */

import { storage } from '../utils/storage.js';

export const notesComponent = {
  notes: [],
  activeNoteId: null,
  saveTimeout: null,

  /**
   * Initialize Notes widget
   */
  async init() {
    this.notes = await storage.get('notes', []);
    
    // Auto select first note or show empty state
    if (this.notes.length > 0) {
      // Sort: pinned first, then by updatedAt desc
      this.sortNotes();
      this.activeNoteId = this.notes[0].id;
      this.renderNotesSidebar();
      this.renderActiveNote();
    } else {
      this.showEmptyState();
    }

    this.setupEventListeners();
  },

  /**
   * Sort notes array by pinned status and last updated timestamp
   */
  sortNotes() {
    this.notes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  },

  /**
   * Set up DOM listeners for notes actions
   */
  setupEventListeners() {
    const addNoteBtn = document.getElementById('add-note-btn');
    const createFirstNoteBtn = document.getElementById('create-first-note-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');
    const pinNoteBtn = document.getElementById('pin-note-btn');
    const notesSearchInput = document.getElementById('notes-search');
    
    const noteTitleInput = document.getElementById('note-title-input');
    const noteBodyInput = document.getElementById('note-body-input');

    if (addNoteBtn) addNoteBtn.addEventListener('click', () => this.createNewNote());
    if (createFirstNoteBtn) createFirstNoteBtn.addEventListener('click', () => this.createNewNote());
    if (deleteNoteBtn) deleteNoteBtn.addEventListener('click', () => this.deleteActiveNote());
    if (pinNoteBtn) pinNoteBtn.addEventListener('click', () => this.toggleActiveNotePin());
    
    if (notesSearchInput) {
      notesSearchInput.addEventListener('input', (e) => {
        this.renderNotesSidebar(e.target.value.trim());
      });
    }

    // Auto save on input changes
    if (noteTitleInput && noteBodyInput) {
      noteTitleInput.addEventListener('input', () => this.queueAutoSave());
      noteBodyInput.addEventListener('input', () => this.queueAutoSave());
    }

    // Hotkey hooks can be registered here too (Option+N to create a note)
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        this.createNewNote();
      }
    });
  },

  /**
   * Create a new blank note and select it
   */
  createNewNote() {
    const newNote = {
      id: 'note_' + Date.now(),
      title: 'New Note',
      body: '',
      pinned: false,
      updatedAt: new Date().toISOString()
    };

    this.notes.unshift(newNote);
    this.activeNoteId = newNote.id;
    this.sortNotes();
    this.saveNotesToStorage();
    
    // Hide empty state if showing
    const emptyState = document.getElementById('notes-empty-state');
    if (emptyState) emptyState.style.display = 'none';

    this.renderNotesSidebar();
    this.renderActiveNote();
    
    // Focus title
    const noteTitleInput = document.getElementById('note-title-input');
    if (noteTitleInput) {
      noteTitleInput.focus();
      noteTitleInput.select();
    }
  },

  /**
   * Delete the note that is currently open
   */
  deleteActiveNote() {
    if (!this.activeNoteId) return;

    this.notes = this.notes.filter(note => note.id !== this.activeNoteId);
    this.saveNotesToStorage();

    if (this.notes.length > 0) {
      this.activeNoteId = this.notes[0].id;
      this.renderNotesSidebar();
      this.renderActiveNote();
    } else {
      this.activeNoteId = null;
      this.showEmptyState();
    }
  },

  /**
   * Pin or unpin the active note
   */
  toggleActiveNotePin() {
    if (!this.activeNoteId) return;

    const note = this.notes.find(n => n.id === this.activeNoteId);
    if (note) {
      note.pinned = !note.pinned;
      note.updatedAt = new Date().toISOString();
      this.sortNotes();
      this.saveNotesToStorage();
      this.renderNotesSidebar();
      this.renderActiveNote();
    }
  },

  /**
   * Queue auto save to throttle storage writes
   */
  queueAutoSave() {
    const saveStatus = document.getElementById('note-save-status');
    if (saveStatus) {
      saveStatus.textContent = 'Saving...';
    }

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.performAutoSave();
    }, 400); // 400ms debounce
  },

  /**
   * Read form values and save to local store
   */
  async performAutoSave() {
    if (!this.activeNoteId) return;

    const noteTitleInput = document.getElementById('note-title-input');
    const noteBodyInput = document.getElementById('note-body-input');
    const saveStatus = document.getElementById('note-save-status');

    const note = this.notes.find(n => n.id === this.activeNoteId);
    if (note && noteTitleInput && noteBodyInput) {
      note.title = noteTitleInput.value.trim() || 'Untitled Note';
      note.body = noteBodyInput.value;
      note.updatedAt = new Date().toISOString();

      // Save to chrome storage
      await this.saveNotesToStorage();

      // Update sidebar title/preview without shifting order immediately to avoid layout jank while typing
      this.updateSidebarItemDetails(note);

      if (saveStatus) {
        saveStatus.textContent = 'Saved';
      }
    }
  },

  /**
   * Save notes array to storage
   */
  async saveNotesToStorage() {
    await storage.set('notes', this.notes);
  },

  /**
   * Update active note edit form contents
   */
  renderActiveNote() {
    const emptyState = document.getElementById('notes-empty-state');
    const noteTitleInput = document.getElementById('note-title-input');
    const noteBodyInput = document.getElementById('note-body-input');
    const pinNoteBtn = document.getElementById('pin-note-btn');
    const saveStatus = document.getElementById('note-save-status');

    if (emptyState) emptyState.style.display = 'none';

    const note = this.notes.find(n => n.id === this.activeNoteId);
    if (note) {
      if (noteTitleInput) noteTitleInput.value = note.title === 'New Note' ? '' : note.title;
      if (noteBodyInput) noteBodyInput.value = note.body;
      if (saveStatus) saveStatus.textContent = 'Saved';
      
      // Update pin icon styling
      if (pinNoteBtn) {
        if (note.pinned) {
          pinNoteBtn.classList.add('pinned');
          pinNoteBtn.setAttribute('title', 'Unpin Note');
        } else {
          pinNoteBtn.classList.remove('pinned');
          pinNoteBtn.setAttribute('title', 'Pin Note');
        }
      }
    }
  },

  /**
   * Update details of notes items directly in the list
   * @param {Object} note 
   */
  updateSidebarItemDetails(note) {
    const itemElem = document.querySelector(`.note-list-item[data-id="${note.id}"]`);
    if (itemElem) {
      const titleElem = itemElem.querySelector('.note-list-item-title');
      const previewElem = itemElem.querySelector('.note-list-item-preview');
      
      if (titleElem) titleElem.textContent = note.title;
      if (previewElem) previewElem.textContent = note.body || 'No additional text';
    }
  },

  /**
   * Render side listing of notes
   * @param {string} filterText 
   */
  renderNotesSidebar(filterText = '') {
    const listContainer = document.getElementById('notes-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    const filtered = this.notes.filter(note => {
      if (!filterText) return true;
      const term = filterText.toLowerCase();
      return note.title.toLowerCase().includes(term) || note.body.toLowerCase().includes(term);
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = '<div class="reminders-empty">No notes match search</div>';
      return;
    }

    filtered.forEach(note => {
      const item = document.createElement('div');
      item.className = `note-list-item ${note.id === this.activeNoteId ? 'active' : ''}`;
      item.setAttribute('data-id', note.id);

      const displayDate = new Date(note.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });

      const bodyPreview = note.body ? note.body.substring(0, 30) : 'No additional text';
      
      item.innerHTML = `
        <div class="note-list-item-title">${note.title || 'Untitled Note'}</div>
        <div class="note-list-item-preview-group">
          <span class="note-list-item-date">${displayDate}</span>
          <span class="note-list-item-preview">${bodyPreview}</span>
          ${note.pinned ? `
            <span class="note-list-item-pin-icon">
              <svg class="icon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0" style="width: 10px; height: 10px;">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              </svg>
            </span>
          ` : ''}
        </div>
      `;

      item.addEventListener('click', () => {
        // Run pending auto save before switching
        if (this.saveTimeout) {
          clearTimeout(this.saveTimeout);
          this.performAutoSave();
        }

        this.activeNoteId = note.id;
        this.renderNotesSidebar(filterText);
        this.renderActiveNote();
      });

      listContainer.appendChild(item);
    });
  },

  /**
   * Hide editor pane and show blank/empty illustration
   */
  showEmptyState() {
    const emptyState = document.getElementById('notes-empty-state');
    if (emptyState) {
      emptyState.style.display = 'flex';
    }
    
    // Hide title/body inputs in sidebar
    const titleInput = document.getElementById('note-title-input');
    const bodyInput = document.getElementById('note-body-input');
    const sidebar = document.getElementById('notes-list');

    if (titleInput) titleInput.value = '';
    if (bodyInput) bodyInput.value = '';
    if (sidebar) sidebar.innerHTML = '<div class="reminders-empty">No notes</div>';
  }
};
