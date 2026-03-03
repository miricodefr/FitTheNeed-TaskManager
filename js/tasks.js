/**
 * tasks.js
 * Adds:
 * - Mark Complete button
 * - Delete button
 * - Edit button (modal)
 * - Filtering (status + priority)
 * - Sorting (name/date)
 * - Summary counters
 *
 * Uses localStorage so tasks are not lost on refresh.
 * 
 * - Code aspired by previous work done by co workers and ChatGpt
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

// Storage key
const STORAGE_KEY = "ftn_tasks_v1";

// In-memory list (synced with localStorage)
let tasks = [];

// Filters / sorting state
let currentStatusFilter = "all";    // all | pending | completed
let currentPriorityFilter = "all";  // all | High | Medium | Low

/**
 * Converts a Date object to YYYY-MM-DD (format for input[type="date"])
 */
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

/**
 * Sets min/max limits for due date:
 * - min = today
 * - max = today + 2 years
 * We apply this both to the add form and edit form.
 */
function setDateLimits() {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 2);

  const minStr = formatDate(today);
  const maxStr = formatDate(maxDate);

  dateInput.min = minStr;
  dateInput.max = maxStr;

  editTaskDateEl.min = minStr;
  editTaskDateEl.max = maxStr;
}
setDateLimits();

/**
 * Loads tasks from localStorage safely.
 * If localStorage is empty or broken, we start with an empty array.
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error("Could not read tasks from localStorage:", err);
    return [];
  }
}

/**
 * Saves tasks to localStorage safely.
 */
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error("Could not save tasks to localStorage:", err);
  }
}

/**
 * Validates max text lengths safely
 */
function validateTextLimits(name, desc) {
  if (name.length > 50) return "Task name cannot exceed 50 characters.";
  if (desc.length > 150) return "Description cannot exceed 150 characters.";
  return null;
}

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
 * This prevents issues when deleting tasks (indexes can change).
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
 * Returns a filtered list (status and priority)
 */
function getFilteredTasks() {
  return tasks.filter((t) => {
    // Status filter
    if (currentStatusFilter === "pending" && t.status !== "Pending") return false;
    if (currentStatusFilter === "completed" && t.status !== "Completed") return false;

    // Priority filter
    if (currentPriorityFilter !== "all" && t.priority !== currentPriorityFilter) return false;

    return true;
  });
}

/**
 * Sorts tasks based on the dropdown selection
 */
function sortTasks(list) {
  const mode = sortSelect.value;

  // copy array so we don't accidentally change the original list
  const arr = [...list];

  if (mode === "name_asc") {
    arr.sort((a, b) => a.name.localeCompare(b.name));
  } else if (mode === "name_desc") {
    arr.sort((a, b) => b.name.localeCompare(a.name));
  } else if (mode === "date_desc") {
    arr.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else {
    // default: date_asc (soonest)
    arr.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  return arr;
}

/**
 * Sets the active look on status filter buttons
 */
function updateFilterButtonStyles() {
  // Reset
  filterAllBtn.classList.remove("active");
  filterPendingBtn.classList.remove("active");
  filterCompletedBtn.classList.remove("active");

  // Activate one
  if (currentStatusFilter === "pending") filterPendingBtn.classList.add("active");
  else if (currentStatusFilter === "completed") filterCompletedBtn.classList.add("active");
  else filterAllBtn.classList.add("active");
}

/**
 * Helper: creates a Bootstrap badge to show priority
 */
function makePriorityBadge(priority) {
  const span = document.createElement("span");
  span.classList.add("badge");

  if (priority === "High") span.classList.add("priority-high");
  else if (priority === "Low") span.classList.add("priority-low");
  else span.classList.add("priority-medium");

  span.textContent = priority;
  return span;
}

/**
 * Render tasks into table (safe rendering)
 */
function renderTasks() {
  tableBody.innerHTML = "";

  // Update summary (summary is for ALL tasks, not filtered)
  updateSummary();

  // Filters and sorts list that we will show
  const filtered = getFilteredTasks();
  const list = sortTasks(filtered);

  if (list.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 6;
    emptyCell.className = "text-muted text-center py-4";
    emptyCell.textContent = "No tasks match your filters.";
    emptyRow.appendChild(emptyCell);
    tableBody.appendChild(emptyRow);
    return;
  }

  list.forEach((task) => {
    const row = document.createElement("tr");

    // Name
    const nameTd = document.createElement("td");
    nameTd.textContent = task.name;

    // Description
    const descTd = document.createElement("td");
    descTd.textContent = task.desc;

    // Date
    const dateTd = document.createElement("td");
    dateTd.textContent = task.date;

    // Priority badge
    const prioTd = document.createElement("td");
    prioTd.appendChild(makePriorityBadge(task.priority));

    // Status
    const statusTd = document.createElement("td");
    statusTd.textContent = task.status;
    statusTd.className = task.status === "Completed" ? "status-completed" : "status-pending";

    // Actions
    const actionsTd = document.createElement("td");

    // Edit
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-sm btn-outline-secondary me-2";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditModal(task.id));

    // Complete
    const completeBtn = document.createElement("button");
    completeBtn.type = "button";

    if (task.status === "Completed") {
      completeBtn.disabled = true;
      completeBtn.className = "btn btn-sm btn-secondary me-2";
      completeBtn.textContent = "Completed";
    } else {
      completeBtn.className = "btn btn-sm btn-success me-2";
      completeBtn.textContent = "Mark Complete";
      completeBtn.addEventListener("click", () => markTaskComplete(task.id));
    }

    // Delete
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(completeBtn);
    actionsTd.appendChild(deleteBtn);

    row.appendChild(nameTd);
    row.appendChild(descTd);
    row.appendChild(dateTd);
    row.appendChild(prioTd);
    row.appendChild(statusTd);
    row.appendChild(actionsTd);

    tableBody.appendChild(row);
  });

  updateFilterButtonStyles();
}

/**
 * Mark a task as completed by ID
 */
function markTaskComplete(taskId) {
  tasks = tasks.map((t) => (t.id === taskId ? { ...t, status: "Completed" } : t));
  saveTasks();
  renderTasks();
}

/**
 * Delete a task by ID
 */
function deleteTask(taskId) {
  const ok = confirm("Are you sure you want to delete this task?");
  if (!ok) return;

  tasks = tasks.filter((t) => t.id !== taskId);
  saveTasks();
  renderTasks();
}

/**
 * Opens the edit modal and fills it with task data
 */
function openEditModal(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  editTaskIdEl.value = task.id;
  editTaskNameEl.value = task.name;
  editTaskDescEl.value = task.desc;
  editTaskDateEl.value = task.date;
  editTaskPriorityEl.value = task.priority;

  editModal.show();
}

/**
 * Saves edits from the modal
 */
function saveEdit() {
  const taskId = editTaskIdEl.value;
  const name = editTaskNameEl.value.trim();
  const desc = editTaskDescEl.value.trim();
  const date = editTaskDateEl.value;
  const priority = editTaskPriorityEl.value;

  if (!name) {
    alert("Task name is required.");
    return;
  }

  if (!date) {
    alert("Due date is required.");
    return;
  }

  const error = validateTextLimits(name, desc);
  if (error) {
    alert(error);
    return;
  }

  // Check limits (same limits as add form)
  if (!isDateWithinLimits(date)) {
    alert("Please select a due date between today and 2 years from today.");
    return;
  }

  tasks = tasks.map((t) => {
    if (t.id === taskId) {
      return { ...t, name, desc, date, priority };
    }
    return t;
  });

  saveTasks();
  renderTasks();
  editModal.hide();
}

// Save button in modal
saveEditBtn.addEventListener("click", saveEdit);

/**
 * Handle add form submission
 */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("taskName").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const date = document.getElementById("taskDate").value;
  const priority = document.getElementById("taskPriority").value;

  if (!name) {
    alert("Task name is required.");
    return;
  }

  if (!date) {
    alert("Due date is required.");
    return;
  }

  const error = validateTextLimits(name, desc);
  if (error) {
    alert(error);
    return;
  }

  if (!isDateWithinLimits(date)) {
    alert("Please select a due date between today and 2 years from today.");
    return;
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
  saveTasks();
  renderTasks();
  form.reset();
});

/**
 * Filter button events
 */
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

/**
 * Priority filter event
 */
priorityFilter.addEventListener("change", () => {
  currentPriorityFilter = priorityFilter.value;
  renderTasks();
});

/**
 * Sort event
 */
sortSelect.addEventListener("change", renderTasks);

// Load tasks and render on first page load
tasks = loadTasks();
renderTasks();