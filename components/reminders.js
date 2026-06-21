/**
 * Apple Reminders Clone Widget Component
 * Manages adding, editing, deleting, categorizing, completing, and drag-and-drop sorting of tasks.
 */

import { storage } from '../utils/storage.js';

export const remindersComponent = {
  tasks: [],
  currentCategory: 'today', // 'today', 'upcoming', 'completed'
  draggedItemId: null,

  /**
   * Initialize reminders component
   */
  async init() {
    this.tasks = await storage.get('tasks', [
      { id: 't_1', title: 'Plan project roadmap', date: this.getTodayDateString(), completed: false, order: 0 },
      { id: 't_2', title: 'Prepare design assets', date: this.getTodayDateString(), completed: false, order: 1 },
      { id: 't_3', title: 'Write production manifest', date: this.getUpcomingDateString(2), completed: false, order: 2 }
    ]);

    this.renderStats();
    this.renderCategoryBadges();
    this.renderTaskList();
    this.setupEventListeners();
  },

  /**
   * Helper to fetch current date as YYYY-MM-DD
   */
  getTodayDateString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  },

  /**
   * Helper to fetch future date
   */
  getUpcomingDateString(daysOffset) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  },

  /**
   * Set up listeners for checklist buttons
   */
  setupEventListeners() {
    const addTaskBtn = document.getElementById('add-task-btn');
    const saveNewTaskBtn = document.getElementById('save-new-task-btn');
    const cancelNewTaskBtn = document.getElementById('cancel-new-task-btn');
    const quickAddForm = document.getElementById('quick-add-task-container');
    
    // Category pill click handlers
    const pills = document.querySelectorAll('.category-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        pills.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.getAttribute('data-category');
        this.renderTaskList();
      });
    });

    // Quick Add handlers
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => {
        if (quickAddForm) {
          quickAddForm.style.display = quickAddForm.style.display === 'none' ? 'flex' : 'none';
          document.getElementById('new-task-title').focus();
          // Set default date to today
          document.getElementById('new-task-date').value = this.getTodayDateString();
        }
      });
    }

    if (saveNewTaskBtn) {
      saveNewTaskBtn.addEventListener('click', () => this.handleAddTask());
    }

    if (cancelNewTaskBtn) {
      cancelNewTaskBtn.addEventListener('click', () => {
        if (quickAddForm) quickAddForm.style.display = 'none';
        this.clearQuickAddForm();
      });
    }

    // Enter press inside quick-add task title input
    const newTaskTitle = document.getElementById('new-task-title');
    if (newTaskTitle) {
      newTaskTitle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleAddTask();
        }
      });
    }

    // Register Alt+T shortcut to trigger new task panel
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        if (quickAddForm) {
          quickAddForm.style.display = 'flex';
          document.getElementById('new-task-title').focus();
          document.getElementById('new-task-date').value = this.getTodayDateString();
        }
      }
    });
  },

  /**
   * Process adding a new task from the UI form
   */
  async handleAddTask() {
    const titleInput = document.getElementById('new-task-title');
    const dateInput = document.getElementById('new-task-date');
    if (!titleInput) return;

    const title = titleInput.value.trim();
    if (!title) return;

    const dateVal = dateInput ? dateInput.value : this.getTodayDateString();

    const newTask = {
      id: 'task_' + Date.now(),
      title: title,
      date: dateVal,
      completed: false,
      order: this.tasks.length
    };

    this.tasks.push(newTask);
    await storage.set('tasks', this.tasks);

    this.clearQuickAddForm();
    
    // Hide panel
    const quickAddForm = document.getElementById('quick-add-task-container');
    if (quickAddForm) quickAddForm.style.display = 'none';

    // Refresh UI
    this.renderStats();
    this.renderCategoryBadges();
    this.renderTaskList();
  },

  /**
   * Clear inputs inside add task box
   */
  clearQuickAddForm() {
    const titleInput = document.getElementById('new-task-title');
    const dateInput = document.getElementById('new-task-date');
    if (titleInput) titleInput.value = '';
    if (dateInput) dateInput.value = '';
  },

  /**
   * Delete specific task
   * @param {string} taskId 
   */
  async deleteTask(taskId) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    await storage.set('tasks', this.tasks);

    this.renderStats();
    this.renderCategoryBadges();
    this.renderTaskList();
  },

  /**
   * Toggle task completion state (runs nice visual animation delay)
   * @param {string} taskId 
   */
  async toggleTaskComplete(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    
    const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
    if (taskItem) {
      if (task.completed) {
        taskItem.classList.add('completed-task');
      } else {
        taskItem.classList.remove('completed-task');
      }
    }

    // Wait briefly (300ms) for completion animation, then redraw
    setTimeout(async () => {
      await storage.set('tasks', this.tasks);
      this.renderStats();
      this.renderCategoryBadges();
      this.renderTaskList();
    }, 300);
  },

  /**
   * Check if a date string represents today
   */
  isToday(dateStr) {
    if (!dateStr) return false;
    const today = this.getTodayDateString();
    return dateStr === today;
  },

  /**
   * Check if date string represents an overdue date
   */
  isOverdue(dateStr) {
    if (!dateStr) return false;
    const today = new Date(this.getTodayDateString());
    const itemDate = new Date(dateStr);
    return itemDate < today;
  },

  /**
   * Get formatted display date for task row
   */
  getFriendlyDate(dateStr) {
    if (!dateStr) return '';
    if (this.isToday(dateStr)) return 'Today';
    
    const tomorrow = this.getUpcomingDateString(1);
    if (dateStr === tomorrow) return 'Tomorrow';

    // Format as Month Day (e.g. Jun 22)
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  },

  /**
   * Calculate categories counts and update sidebar elements
   */
  renderCategoryBadges() {
    const todayCount = this.tasks.filter(t => !t.completed && (this.isToday(t.date) || this.isOverdue(t.date))).length;
    const upcomingCount = this.tasks.filter(t => !t.completed && t.date && !this.isToday(t.date) && !this.isOverdue(t.date)).length;
    const completedCount = this.tasks.filter(t => t.completed).length;

    const bToday = document.getElementById('badge-today');
    const bUpcoming = document.getElementById('badge-upcoming');
    const bCompleted = document.getElementById('badge-completed');

    if (bToday) bToday.textContent = todayCount;
    if (bUpcoming) bUpcoming.textContent = upcomingCount;
    if (bCompleted) bCompleted.textContent = completedCount;
  },

  /**
   * Calculate percentage stats and update progress meters
   */
  renderStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    
    let percentage = 0;
    if (total > 0) {
      percentage = Math.round((completed / total) * 100);
    }

    const pBar = document.getElementById('reminders-progress-bar');
    const pText = document.getElementById('reminders-stats-text');

    if (pBar) pBar.style.width = `${percentage}%`;
    if (pText) pText.textContent = `${percentage}% completed (${completed}/${total})`;
  },

  /**
   * Render tasks list filtered by current active category tab
   */
  renderTaskList() {
    const listContainer = document.getElementById('reminders-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    // Filter based on active tab category
    let filtered = [];
    if (this.currentCategory === 'today') {
      filtered = this.tasks.filter(t => !t.completed && (this.isToday(t.date) || this.isOverdue(t.date)));
    } else if (this.currentCategory === 'upcoming') {
      filtered = this.tasks.filter(t => !t.completed && t.date && !this.isToday(t.date) && !this.isOverdue(t.date));
    } else if (this.currentCategory === 'completed') {
      filtered = this.tasks.filter(t => t.completed);
    }

    // Sort by order field
    filtered.sort((a, b) => a.order - b.order);

    if (filtered.length === 0) {
      listContainer.innerHTML = `<div class="reminders-empty">No ${this.currentCategory} reminders</div>`;
      return;
    }

    filtered.forEach(task => {
      const item = document.createElement('div');
      item.className = `task-item ${task.completed ? 'completed-task' : ''}`;
      item.setAttribute('draggable', 'true');
      item.setAttribute('data-id', task.id);

      const isOverdue = !task.completed && this.isOverdue(task.date);
      const friendlyDate = this.getFriendlyDate(task.date);

      item.innerHTML = `
        <div class="drag-handle" title="Drag to reorder">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
            <circle cx="9" cy="5" r="1"></circle>
            <circle cx="9" cy="12" r="1"></circle>
            <circle cx="9" cy="19" r="1"></circle>
            <circle cx="15" cy="5" r="1"></circle>
            <circle cx="15" cy="12" r="1"></circle>
            <circle cx="15" cy="19" r="1"></circle>
          </svg>
        </div>
        <label class="task-checkbox-container">
          <input type="checkbox" class="task-checkbox-input" ${task.completed ? 'checked' : ''}>
          <span class="task-checkbox-custom">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        </label>
        <div class="task-details">
          <span class="task-title" title="Click to edit">${task.title}</span>
          ${friendlyDate ? `<span class="task-date ${isOverdue ? 'overdue' : ''}">${friendlyDate}</span>` : ''}
        </div>
        <button class="task-delete-btn" title="Delete reminder">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      // Event: Toggle checkbox
      const checkbox = item.querySelector('.task-checkbox-input');
      checkbox.addEventListener('change', () => this.toggleTaskComplete(task.id));

      // Event: Delete task
      const deleteBtn = item.querySelector('.task-delete-btn');
      deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

      // Event: Inline edit title
      const titleSpan = item.querySelector('.task-title');
      titleSpan.addEventListener('click', () => this.startInlineEdit(task.id, titleSpan));

      // Drag and Drop Event listeners
      item.addEventListener('dragstart', (e) => this.handleDragStart(e, task.id));
      item.addEventListener('dragover', (e) => this.handleDragOver(e, item));
      item.addEventListener('dragleave', (e) => this.handleDragLeave(e, item));
      item.addEventListener('drop', (e) => this.handleDrop(e, task.id));
      item.addEventListener('dragend', () => this.handleDragEnd());

      listContainer.appendChild(item);
    });
  },

  /**
   * Replace task title span with a textbox to support immediate editing
   */
  startInlineEdit(taskId, titleSpan) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-title-input-edit';
    input.value = task.title;

    const parent = titleSpan.parentNode;
    parent.replaceChild(input, titleSpan);
    input.focus();

    const finishEdit = async () => {
      const newVal = input.value.trim();
      if (newVal && newVal !== task.title) {
        task.title = newVal;
        await storage.set('tasks', this.tasks);
      }
      this.renderTaskList();
    };

    input.addEventListener('blur', finishEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        finishEdit();
      } else if (e.key === 'Escape') {
        this.renderTaskList();
      }
    });
  },

  /* Drag and Drop event handlers */
  handleDragStart(e, taskId) {
    this.draggedItemId = taskId;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  },

  handleDragOver(e, item) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    item.classList.add('drag-over');
  },

  handleDragLeave(e, item) {
    item.classList.remove('drag-over');
  },

  async handleDrop(e, targetTaskId) {
    e.preventDefault();
    if (this.draggedItemId === targetTaskId) return;

    const draggedIndex = this.tasks.findIndex(t => t.id === this.draggedItemId);
    const targetIndex = this.tasks.findIndex(t => t.id === targetTaskId);

    if (draggedIndex > -1 && targetIndex > -1) {
      // Reorder array elements
      const [removed] = this.tasks.splice(draggedIndex, 1);
      this.tasks.splice(targetIndex, 0, removed);

      // Re-assign order fields
      this.tasks.forEach((t, index) => {
        t.order = index;
      });

      await storage.set('tasks', this.tasks);
      this.renderTaskList();
    }
  },

  handleDragEnd() {
    const items = document.querySelectorAll('.task-item');
    items.forEach(item => {
      item.classList.remove('dragging');
      item.classList.remove('drag-over');
    });
    this.draggedItemId = null;
  }
};
