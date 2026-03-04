// - Code aspired by previous work done by co workers and ChatGpt

/**
 * tasks.js
 * Adds:
 * - Mark Complete button
 * - Delete button
 * - Edit button (modal)
 * - Filtering (status, priority)
 * - Sorting (name/date)
 * - Summary counters
 *
 * Uses localStorage so tasks are not lost on refresh.
 */

const form = document.getElementById("taskForm");
const tableBody = document.getElementById("taskTableBody");
const dateInput = document.getElementById("taskDate");

const totalTasksEl = document.getElementById("totalTasks");
const pendingTasksEl = document.getElementById("pendingTasks");
const completedTasksEl = document.getElementById("completedTasks");

const sortSelect = document.getElementById("sortSelect");
const priorityFilter = document.getElementById("priorityFilter");

const filterAllBtn = document.getElementById("filterAll");
const filterPendingBtn = document.getElementById("filterPending");
const filterCompletedBtn = document.getElementById("filterCompleted");

// Edit modal elements
const editTaskIdEl = document.getElementById("editTaskId");
const editTaskNameEl = document.getElementById("editTaskName");
const editTaskDescEl = document.getElementById("editTaskDesc");
const editTaskDateEl = document.getElementById("editTaskDate");
const editTaskPriorityEl = document.getElementById("editTaskPriority");
const saveEditBtn = document.getElementById("saveEditBtn");

// Bootstrap modal instance (created after DOM exists)
const editModalEl = document.getElementById("editModal");
const editModal = new bootstrap.Modal(editModalEl);

// In-memory list (synced with localStorage)
let tasks = [];

// Filters / sorting state
let currentStatusFilter = "all";    // pending, completed
let currentPriorityFilter = "all";  // High, Medium, Low

/**
 * Sets min/max limits for due date:
 * - min = today
 * - max = today + 2 years
 * Works to both add and edit form
 */
function setDateLimits() {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 2);

  const minStr = formatDateYYYYMMDD(today);
  const maxStr = formatDateYYYYMMDD(maxDate);

  dateInput.min = minStr;
  dateInput.max = maxStr;

  editTaskDateEl.min = minStr;
  editTaskDateEl.max = maxStr;
}
setDateLimits();

/**
 * Checks if chosen date is inside allowed range
 */
function isDateWithinLimits(dateValue) {
  const min = new Date(dateInput.min);
  const max = new Date(dateInput.max);
  const chosen = new Date(dateValue);

  if (Number.isNaN(chosen.getTime())) return false;
  return chosen >= min && chosen <= max;
}

/**
 * Creates a unique ID for each task.
 */
function makeId() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

/**
 * Updates the summary counters
 */
function updateSummary() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const pending = total - completed;

  totalTasksEl.textContent = total;
  pendingTasksEl.textContent = pending;
  completedTasksEl.textContent = completed;
}

/**
 * Filter tasks by current filters
 */
function getFilteredTasks() {
  return tasks.filter((t) => {
    const statusOk =
      currentStatusFilter === "all" || t.status.toLowerCase() === currentStatusFilter;

    const prioOk =
      currentPriorityFilter === "all" || t.priority === currentPriorityFilter;

    return statusOk && prioOk;
  });
}

/**
 * Sort tasks based on dropdown - high to low, low to high
 */
function sortTasks(list) {
  const mode = sortSelect.value;

  const byName = (a, b) => a.name.localeCompare(b.name);
  const byDate = (a, b) => new Date(a.date) - new Date(b.date);

  const copy = [...list];

  if (mode === "name_asc") copy.sort(byName);
  if (mode === "name_desc") copy.sort((a, b) => byName(b, a));
  if (mode === "date_asc") copy.sort(byDate);
  if (mode === "date_desc") copy.sort((a, b) => byDate(b, a));

  return copy;
}

/**
 * Make active filter buttons stand out
 */
function updateFilterButtonStyles() {
  filterAllBtn.classList.toggle("active", currentStatusFilter === "all");
  filterPendingBtn.classList.toggle("active", currentStatusFilter === "pending");
  filterCompletedBtn.classList.toggle("active", currentStatusFilter === "completed");
}

/**
 * Priority badge helper
 */
function makePriorityBadge(priority) {
  const p = (priority || "Medium").toLowerCase();
  const cls =
    p === "high" ? "priority-high" : p === "low" ? "priority-low" : "priority-medium";

  return `<span class="badge ${cls}">${priority || "Medium"}</span>`;
}

/**
 * Render tasks in table
 */
function renderTasks() {
  updateFilterButtonStyles();
  updateSummary();

  const filtered = getFilteredTasks();
  const sorted = sortTasks(filtered);

  tableBody.innerHTML = "";

  if (!sorted.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="6" class="text-muted text-center py-4">No tasks found.</td>`;
    tableBody.appendChild(tr);
    return;
  }

  sorted.forEach((task) => {
    const tr = document.createElement("tr");

    const statusClass =
      task.status === "Completed" ? "status-completed" : "status-pending";

    tr.innerHTML = `
      <td>${task.name}</td>
      <td>${task.desc || ""}</td>
      <td>${task.date}</td>
      <td>${makePriorityBadge(task.priority)}</td>
      <td class="${statusClass}">${task.status}</td>
      <td>
        <button class="btn btn-sm btn-success me-1" data-action="complete" data-id="${task.id}">
          Mark Complete
        </button>
        <button class="btn btn-sm btn-secondary me-1" data-action="edit" data-id="${task.id}">
          Edit
        </button>
        <button class="btn btn-sm btn-danger" data-action="delete" data-id="${task.id}">
          Delete
        </button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

/**
 * Actions
 */
function markTaskComplete(taskId) {
  tasks = tasks.map((t) => (t.id === taskId ? { ...t, status: "Completed" } : t));
  setTasks(tasks);
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter((t) => t.id !== taskId);
  setTasks(tasks);
  renderTasks();
}

function openEditModal(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  editTaskIdEl.value = task.id;
  editTaskNameEl.value = task.name;
  editTaskDescEl.value = task.desc || "";
  editTaskDateEl.value = task.date;
  editTaskPriorityEl.value = task.priority || "Medium";

  editModal.show();
}

function saveEdit() {
  const taskId = editTaskIdEl.value;
  const name = editTaskNameEl.value.trim();
  const desc = editTaskDescEl.value.trim();
  const date = editTaskDateEl.value;
  const priority = editTaskPriorityEl.value;

  if (!name) return showError("Task name is required.");
  if (!date) return showError("Due date is required.");

  const error = validateTextLimits(name, desc, 50, 150);
  if (error) return showError(error);

  if (!isDateWithinLimits(date)) {
    return showError("Please select a due date between today and 2 years from today.");
  }

  tasks = tasks.map((t) =>
    t.id === taskId ? { ...t, name, desc, date, priority } : t
  );

  setTasks(tasks);
  editModal.hide();
  renderTasks();
}

/**
 * Events
 */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("taskName").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const date = document.getElementById("taskDate").value;
  const priority = document.getElementById("taskPriority").value;

  if (!name) return showError("Task name is required.");
  if (!date) return showError("Due date is required.");

  const error = validateTextLimits(name, desc, 50, 150);
  if (error) return showError(error);

  if (!isDateWithinLimits(date)) {
    return showError("Please select a due date between today and 2 years from today.");
  }

  const newTask = {
    id: makeId(),
    name,
    desc,
    date,
    priority,
    status: "Pending",
  };

  tasks.push(newTask);
  setTasks(tasks);

  form.reset();
  setDateLimits();
  renderTasks();
});

tableBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === "complete") markTaskComplete(id);
  if (action === "delete") deleteTask(id);
  if (action === "edit") openEditModal(id);
});

sortSelect.addEventListener("change", renderTasks);

priorityFilter.addEventListener("change", () => {
  currentPriorityFilter = priorityFilter.value;
  renderTasks();
});

filterAllBtn.addEventListener("click", () => {
  currentStatusFilter = "all";
  renderTasks();
});

filterPendingBtn.addEventListener("click", () => {
  currentStatusFilter = "pending";
  renderTasks();
});

filterCompletedBtn.addEventListener("click", () => {
  currentStatusFilter = "completed";
  renderTasks();
});

saveEditBtn.addEventListener("click", saveEdit);

//Innit
tasks = getTasks();
renderTasks();