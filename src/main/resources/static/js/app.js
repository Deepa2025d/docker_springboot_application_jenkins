// ==========================================
// TaskFlow — Frontend Application Logic
// ==========================================

const API_BASE = '/api/tasks';

const state = {
  tasks: [],
  filter: 'ALL',
  search: '',
  editingId: null,
};

let priorityChart = null;

// ---------- DOM refs ----------
const taskListEl = document.getElementById('taskList');
const emptyStateEl = document.getElementById('emptyState');
const modalOverlay = document.getElementById('modalOverlay');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');
const toastContainer = document.getElementById('toastContainer');

// ==========================================
// Init
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  bindEvents();
  fetchTasks();

  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 400);
});

function bindEvents() {
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('openAddModal').addEventListener('click', () => openModal());
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
  taskForm.addEventListener('submit', handleFormSubmit);

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.filter = tab.dataset.filter;
      renderTasks();
    });
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    state.search = e.target.value.toLowerCase();
    renderTasks();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ==========================================
// Theme
// ==========================================
function initTheme() {
  const saved = localStorage.getItem('taskflow-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('taskflow-theme', next);
  if (priorityChart) updateChart(); // refresh chart colors implicitly via CSS vars re-read
}

// ==========================================
// API calls
// ==========================================
async function fetchTasks() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to load tasks');
    state.tasks = await res.json();
    renderTasks();
    renderStats();
  } catch (err) {
    showToast('Could not load tasks. Is the backend running?', 'error');
    console.error(err);
  }
}

async function createTask(payload) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

async function updateTask(id, payload) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

async function patchStatus(id, status) {
  const res = await fetch(`${API_BASE}/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

async function deleteTaskApi(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete task');
}

// ==========================================
// Rendering — Task list
// ==========================================
function renderTasks() {
  let filtered = state.tasks;

  if (state.filter !== 'ALL') {
    filtered = filtered.filter(t => t.status === state.filter);
  }
  if (state.search) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(state.search) ||
      (t.description || '').toLowerCase().includes(state.search)
    );
  }

  taskListEl.innerHTML = '';

  if (filtered.length === 0) {
    emptyStateEl.hidden = false;
    return;
  }
  emptyStateEl.hidden = true;

  filtered.forEach((task, i) => {
    const card = document.createElement('div');
    card.className = 'task-card' + (task.status === 'COMPLETED' ? ' completed' : '');
    card.style.animationDelay = `${i * 0.04}s`;

    const priorityClass = `badge-${task.priority.toLowerCase()}`;
    const statusLabel = task.status.replace('_', ' ');
    const dueLabel = task.dueDate ? formatDate(task.dueDate) : 'No due date';

    card.innerHTML = `
      <button class="task-check ${task.status === 'COMPLETED' ? 'checked' : ''}" data-id="${task.id}" title="Toggle complete">
        <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="task-body">
        <div class="task-top-row">
          <span class="task-title">${escapeHtml(task.title)}</span>
          <span class="badge ${priorityClass}">${task.priority}</span>
        </div>
        ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}
        <div class="task-meta">
          <span class="status-pill">${statusLabel}</span>
          <span class="due-date">
            <svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="4.5" width="17" height="15" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 9h17M8 3v3M16 3v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            ${dueLabel}
          </span>
        </div>
      </div>
      <div class="task-actions">
        <button class="edit-btn" data-id="${task.id}" title="Edit">
          <svg viewBox="0 0 24 24" fill="none"><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
        </button>
        <button class="delete-btn" data-id="${task.id}" title="Delete">
          <svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V4.5A1.5 1.5 0 0110.5 3h3A1.5 1.5 0 0115 4.5V7M6 7l1 13h10l1-13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    `;
    taskListEl.appendChild(card);
  });

  // bind row actions
  taskListEl.querySelectorAll('.task-check').forEach(btn => {
    btn.addEventListener('click', () => onToggleStatus(btn.dataset.id));
  });
  taskListEl.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.id));
  });
  taskListEl.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => onDelete(btn.dataset.id));
  });
}

// ==========================================
// Rendering — Stats + Chart
// ==========================================
function renderStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgress = state.tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const pending = state.tasks.filter(t => t.status === 'PENDING').length;

  animateNumber('statTotal', total);
  animateNumber('statProgress', inProgress);
  animateNumber('statPending', pending);
  animateNumber('statDone', completed);

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  document.getElementById('progressPercent').textContent = `${percent}%`;
  document.getElementById('progressFill').style.width = `${percent}%`;

  updateChart();
}

function updateChart() {
  const high = state.tasks.filter(t => t.priority === 'HIGH').length;
  const medium = state.tasks.filter(t => t.priority === 'MEDIUM').length;
  const low = state.tasks.filter(t => t.priority === 'LOW').length;

  const ctx = document.getElementById('priorityChart');
  const data = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [high, medium, low],
      backgroundColor: ['#f0466a', '#f5a524', '#3b82f6'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  if (priorityChart) {
    priorityChart.data = data;
    priorityChart.update();
  } else {
    priorityChart = new Chart(ctx, {
      type: 'doughnut',
      data,
      options: {
        cutout: '70%',
        plugins: { legend: { display: false } },
        animation: { duration: 600 },
      },
    });
  }

  renderLegend(high, medium, low);
}

function renderLegend(high, medium, low) {
  const legend = document.getElementById('chartLegend');
  const items = [
    { label: 'High', color: '#f0466a', count: high },
    { label: 'Medium', color: '#f5a524', count: medium },
    { label: 'Low', color: '#3b82f6', count: low },
  ];
  legend.innerHTML = items.map(i => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${i.color}"></span>
      <span>${i.label} Priority</span>
      <span class="count">${i.count}</span>
    </div>
  `).join('');
}

function animateNumber(elId, target) {
  const el = document.getElementById(elId);
  const start = parseInt(el.textContent, 10) || 0;
  const duration = 500;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = Math.round(start + (target - start) * progress);
    el.textContent = value;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ==========================================
// Modal / Form
// ==========================================
function openModal(id = null) {
  state.editingId = id;
  taskForm.reset();
  document.getElementById('priority').value = 'MEDIUM';
  document.getElementById('status').value = 'PENDING';

  if (id) {
    const task = state.tasks.find(t => String(t.id) === String(id));
    if (task) {
      modalTitle.textContent = 'Edit Task';
      document.getElementById('taskId').value = task.id;
      document.getElementById('title').value = task.title;
      document.getElementById('description').value = task.description || '';
      document.getElementById('priority').value = task.priority;
      document.getElementById('status').value = task.status;
      document.getElementById('dueDate').value = task.dueDate || '';
    }
  } else {
    modalTitle.textContent = 'New Task';
    document.getElementById('taskId').value = '';
  }

  modalOverlay.classList.add('active');
  setTimeout(() => document.getElementById('title').focus(), 100);
}

function closeModal() {
  modalOverlay.classList.remove('active');
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('taskId').value;
  const payload = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    priority: document.getElementById('priority').value,
    status: document.getElementById('status').value,
    dueDate: document.getElementById('dueDate').value || null,
  };

  if (!payload.title) return;

  try {
    if (id) {
      await updateTask(id, payload);
      showToast('Task updated successfully', 'success');
    } else {
      await createTask(payload);
      showToast('Task created successfully', 'success');
    }
    closeModal();
    fetchTasks();
  } catch (err) {
    showToast('Something went wrong. Please try again.', 'error');
    console.error(err);
  }
}

async function onToggleStatus(id) {
  const task = state.tasks.find(t => String(t.id) === String(id));
  if (!task) return;
  const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
  try {
    await patchStatus(id, newStatus);
    fetchTasks();
  } catch (err) {
    showToast('Could not update task status', 'error');
  }
}

async function onDelete(id) {
  if (!confirm('Delete this task? This cannot be undone.')) return;
  try {
    await deleteTaskApi(id);
    showToast('Task deleted', 'success');
    fetchTasks();
  } catch (err) {
    showToast('Could not delete task', 'error');
  }
}

// ==========================================
// Utilities
// ==========================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
