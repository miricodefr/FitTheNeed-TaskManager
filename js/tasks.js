/**
 * tasks.js
 * For now:
 * - Adds tasks to an in-memory array
 * - Displays them in a table
 * - Adds safe limits (max characters + date range)
 */

const form = document.getElementById("taskForm");
const tableBody = document.getElementById("taskTableBody");
const dateInput = document.getElementById("taskDate");

// In-memory list (refreshing page will reset it for now)
let tasks = [];

/**
 * Converts a Date object to YYYY-MM-DD (the format required by <input type="date">)
 * @param {Date} date
 * @returns {string} formatted date
 */
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

/**
 * Sets the date input limits:
 * - Minimum = today
 * - Maximum = today + 2 years
 */
function setDateLimits() {
  const today = new Date();

  // Copy today's date and add 2 years
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 2);

  dateInput.min = formatDate(today);
  dateInput.max = formatDate(maxDate);
}

setDateLimits();

/**
 * Renders the tasks array into the table.
 * We use textContent (not innerHTML with user input)
 * to avoid any HTML injection problems.
 */
function renderTasks() {
  // Clear the table
  tableBody.innerHTML = "";

  // If there are no tasks, show a message
  if (tasks.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 4;
    emptyCell.className = "text-muted text-center py-4";
    emptyCell.textContent = "No tasks yet. Add your first task above!";
    emptyRow.appendChild(emptyCell);
    tableBody.appendChild(emptyRow);
    return;
  }

  tasks.forEach((task) => {
    const row = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.textContent = task.name;

    const descTd = document.createElement("td");
    descTd.textContent = task.desc;

    const dateTd = document.createElement("td");
    dateTd.textContent = task.date;

    const statusTd = document.createElement("td");
    statusTd.textContent = task.status;

    row.appendChild(nameTd);
    row.appendChild(descTd);
    row.appendChild(dateTd);
    row.appendChild(statusTd);

    tableBody.appendChild(row);
  });
}

// Show empty message on first load
renderTasks();

/**
 * Validates input lengths safely (even if user bypasses HTML maxlength)
 * @param {string} name
 * @param {string} desc
 * @returns {string|null} error message or null if valid
 */
function validateTextLimits(name, desc) {
  if (name.length > 50) return "Task name cannot exceed 50 characters.";
  if (desc.length > 150) return "Description cannot exceed 150 characters.";
  return null;
}

/**
 * Checks if the selected date is within allowed range.
 * @param {string} dateValue - YYYY-MM-DD
 * @returns {boolean}
 */
function isDateWithinLimits(dateValue) {
  const min = new Date(dateInput.min);
  const max = new Date(dateInput.max);
  const chosen = new Date(dateValue);

  // If date is invalid, fail
  if (Number.isNaN(chosen.getTime())) return false;

  return chosen >= min && chosen <= max;
}

/**
 * Form submit handler
 */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Read inputs and trim spaces
  const name = document.getElementById("taskName").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const date = document.getElementById("taskDate").value;

  // Basic required checks
  if (!name) {
    alert("Task name is required.");
    return;
  }

  if (!date) {
    alert("Due date is required.");
    return;
  }

  // Length checks (bulletproof even if user bypasses maxlength)
  const error = validateTextLimits(name, desc);
  if (error) {
    alert(error);
    return;
  }

  // Date range checks (today → 2 years max)
  if (!isDateWithinLimits(date)) {
    alert("Please select a due date between today and 2 years from today.");
    return;
  }

  // Create a task object
  const newTask = {
    name,
    desc,
    date,
    status: "Pending",
  };

  // Add task to the array
  tasks.push(newTask);

  // Re-render table
  renderTasks();

  // Reset form
  form.reset();
});