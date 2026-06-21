/**
 * entrypoint newtab.js
 * Root controller initializing modules and managing dashboard layout persistence.
 */

import { clockComponent } from './components/clock.js';
import { searchComponent } from './components/search.js';
import { shortcutsComponent } from './components/shortcuts.js';
import { wallpapersComponent } from './components/wallpapers.js';
import { settingsComponent } from './components/settings.js';
import { notesComponent } from './components/notes.js';
import { remindersComponent } from './components/reminders.js';
import { bookmarksGridComponent } from './components/bookmarksGrid.js';
import { storage } from './utils/storage.js';

const app = {
  draggedWidgetId: null,

  /**
   * Initialize entire dashboard extension
   */
  async init() {
    // 1. Initialize modular components
    await clockComponent.init();
    searchComponent.init();
    await shortcutsComponent.init();
    await wallpapersComponent.init();
    await settingsComponent.init();
    await notesComponent.init();
    await remindersComponent.init();
    await bookmarksGridComponent.init();

    // 2. Setup widget interactions
    await this.restoreWidgetLayout();
    this.setupWidgetReordering();
    this.setupWidgetResizing();
  },

  /**
   * Restore widget sorting order and saved heights from storage
   */
  async restoreWidgetLayout() {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;

    // A. Restore Reordering Order
    const savedOrder = await storage.get('widgetLayoutOrder', null);
    if (savedOrder && Array.isArray(savedOrder)) {
      // Re-append widgets in order
      savedOrder.forEach(widgetId => {
        const elem = document.getElementById(widgetId);
        if (elem) {
          grid.appendChild(elem);
        }
      });
    }

    // B. Restore Heights
    const notesHeight = await storage.get('notesWidgetHeight', null);
    const remindersHeight = await storage.get('remindersWidgetHeight', null);

    const notesWidget = document.getElementById('widget-notes');
    const remindersWidget = document.getElementById('widget-reminders');

    if (notesWidget && notesHeight) {
      notesWidget.style.height = `${notesHeight}px`;
    }
    if (remindersWidget && remindersHeight) {
      remindersWidget.style.height = `${remindersHeight}px`;
    }
  },

  /**
   * Bind HTML5 drag-and-drop for widget reordering
   */
  setupWidgetReordering() {
    const grid = document.querySelector('.dashboard-grid');
    const widgets = document.querySelectorAll('.dashboard-grid > .widget-card');

    if (!grid) return;

    widgets.forEach(widget => {
      // Make widget headers draggable
      const header = widget.querySelector('.widget-header');
      if (header) {
        header.setAttribute('draggable', 'true');
        
        header.addEventListener('dragstart', (e) => {
          this.draggedWidgetId = widget.id;
          widget.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });

        header.addEventListener('dragend', () => {
          widget.classList.remove('dragging');
          this.draggedWidgetId = null;
          this.saveWidgetLayoutOrder();
        });
      }

      widget.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (this.draggedWidgetId && this.draggedWidgetId !== widget.id) {
          widget.classList.add('drag-over');
        }
      });

      widget.addEventListener('dragleave', () => {
        widget.classList.remove('drag-over');
      });

      widget.addEventListener('drop', (e) => {
        e.preventDefault();
        widget.classList.remove('drag-over');

        if (this.draggedWidgetId && this.draggedWidgetId !== widget.id) {
          const draggedElem = document.getElementById(this.draggedWidgetId);
          const children = Array.from(grid.children);
          const draggedIndex = children.indexOf(draggedElem);
          const targetIndex = children.indexOf(widget);

          if (draggedIndex < targetIndex) {
            grid.insertBefore(draggedElem, widget.nextSibling);
          } else {
            grid.insertBefore(draggedElem, widget);
          }
        }
      });
    });
  },

  /**
   * Save sorted DOM widget IDs in chrome storage
   */
  async saveWidgetLayoutOrder() {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;

    const widgetIds = Array.from(grid.children)
      .filter(child => child.classList.contains('widget-card') || child.id === 'widget-row-bottom')
      .map(child => child.id);

    await storage.set('widgetLayoutOrder', widgetIds);
  },

  /**
   * Bind mouse drag sizing handles on notes and reminders
   */
  setupWidgetResizing() {
    // Append resizing handle triggers to resizable components
    const resizableIds = ['widget-notes', 'widget-reminders'];
    
    resizableIds.forEach(id => {
      const widget = document.getElementById(id);
      if (!widget) return;

      const handle = document.createElement('div');
      handle.className = 'resize-handle';
      widget.appendChild(handle);

      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const startHeight = widget.offsetHeight;
        const startY = e.clientY;

        const onMouseMove = (moveEvent) => {
          const deltaY = moveEvent.clientY - startY;
          const newHeight = Math.max(280, Math.min(800, startHeight + deltaY));
          widget.style.height = `${newHeight}px`;
        };

        const onMouseUp = async () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          
          // Save height to local storage
          const finalHeight = widget.offsetHeight;
          if (id === 'widget-notes') {
            await storage.set('notesWidgetHeight', finalHeight);
          } else {
            await storage.set('remindersWidgetHeight', finalHeight);
          }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });
  }
};

// Start application
document.addEventListener('DOMContentLoaded', () => app.init());
