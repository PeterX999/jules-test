// Todo Application State and Functionality
const STORAGE_KEY = 'taskflow_todos_v1';

/**
 * State object holding todos array and current filter mode
 */
const state = {
  todos: loadTodos(),
  currentFilter: 'all' // 'all' | 'active' | 'done'
};

/**
 * Load todos array from localStorage
 * @returns {Array} List of todo objects
 */
function loadTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading todos from localStorage:', e);
    return [];
  }
}

/**
 * Save current state.todos array to localStorage
 */
function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
  } catch (e) {
    console.error('Error saving todos to localStorage:', e);
  }
}

/**
 * Add a new todo item
 * @param {string} text
 */
function addTodo(text) {
  const trimmedText = text.trim();
  if (!trimmedText) return;

  const newTodo = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
    text: trimmedText,
    completed: false,
    createdAt: new Date().toISOString()
  };

  state.todos.unshift(newTodo);
  saveTodos();
  render();
}

/**
 * Toggle completed state of a todo item
 * @param {string} id
 */
function toggleTodo(id) {
  state.todos = state.todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });
  saveTodos();
  render();
}

/**
 * Delete a todo item by id
 * @param {string} id
 */
function deleteTodo(id) {
  state.todos = state.todos.filter(todo => todo.id !== id);
  saveTodos();
  render();
}

/**
 * Remove all completed todo items
 */
function clearCompleted() {
  state.todos = state.todos.filter(todo => !todo.completed);
  saveTodos();
  render();
}

/**
 * Set active filter
 * @param {string} filter ('all' | 'active' | 'done')
 */
function setFilter(filter) {
  if (['all', 'active', 'done'].includes(filter)) {
    state.currentFilter = filter;
    render();
  }
}

/**
 * Filter todos based on state.currentFilter
 */
function getFilteredTodos() {
  switch (state.currentFilter) {
    case 'active':
      return state.todos.filter(todo => !todo.completed);
    case 'done':
      return state.todos.filter(todo => todo.completed);
    case 'all':
    default:
      return state.todos;
  }
}

/**
 * Render the entire UI based on current state
 */
function render() {
  const todoListEl = document.getElementById('todo-list');
  const emptyStateEl = document.getElementById('empty-state');
  const emptyStateTextEl = document.getElementById('empty-state-text');
  const itemsLeftEl = document.getElementById('items-left-count');
  const clearBtnEl = document.getElementById('clear-completed-btn');

  // Filter count elements
  const countAllEl = document.getElementById('count-all');
  const countActiveEl = document.getElementById('count-active');
  const countDoneEl = document.getElementById('count-done');

  // Compute counts
  const allCount = state.todos.length;
  const activeCount = state.todos.filter(t => !t.completed).length;
  const doneCount = state.todos.filter(t => t.completed).length;

  if (countAllEl) countAllEl.textContent = allCount;
  if (countActiveEl) countActiveEl.textContent = activeCount;
  if (countDoneEl) countDoneEl.textContent = doneCount;

  if (itemsLeftEl) {
    itemsLeftEl.textContent = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;
  }

  if (clearBtnEl) {
    clearBtnEl.style.display = doneCount > 0 ? 'inline-block' : 'none';
  }

  // Update filter tab active state
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const filter = btn.dataset.filter;
    const isActive = filter === state.currentFilter;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  const filteredTodos = getFilteredTodos();

  // Render list or empty state
  todoListEl.innerHTML = '';

  if (filteredTodos.length === 0) {
    emptyStateEl.style.display = 'flex';
    if (state.todos.length === 0) {
      emptyStateTextEl.textContent = 'No tasks yet. Add one above!';
    } else if (state.currentFilter === 'active') {
      emptyStateTextEl.textContent = 'No active tasks!';
    } else if (state.currentFilter === 'done') {
      emptyStateTextEl.textContent = 'No completed tasks yet!';
    }
  } else {
    emptyStateEl.style.display = 'none';

    filteredTodos.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      li.dataset.id = todo.id;

      li.innerHTML = `
        <label class="checkbox-container">
          <input
            type="checkbox"
            class="todo-checkbox"
            ${todo.completed ? 'checked' : ''}
            aria-label="Mark task as completed"
          />
          <span class="checkmark">
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
            </svg>
          </span>
        </label>
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button type="button" class="delete-btn" aria-label="Delete task" title="Delete task">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      `;

      // Event Listeners for Item Actions
      const checkbox = li.querySelector('.todo-checkbox');
      checkbox.addEventListener('change', () => toggleTodo(todo.id));

      const deleteBtn = li.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

      todoListEl.appendChild(li);
    });
  }
}

/**
 * Utility to escape HTML to prevent XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Initialize event listeners
 */
function init() {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const filtersContainer = document.querySelector('.filters');
  const clearBtn = document.getElementById('clear-completed-btn');

  // Handle Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = '';
    input.focus();
  });

  // Handle Filter Switch
  filtersContainer.addEventListener('click', (e) => {
    const target = e.target.closest('.filter-btn');
    if (target && target.dataset.filter) {
      setFilter(target.dataset.filter);
    }
  });

  // Handle Clear Completed
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearCompleted();
    });
  }

  // Initial render
  render();
}

// Run init when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
