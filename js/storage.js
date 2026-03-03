// storage.js
const TASKS_KEY = "ftn_tasks_v1";

/**
 * Safely get tasks from localStorage.
 * Always returns an array.
 */
function getTasks() {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Could not read tasks from localStorage:", err);
    return [];
  }
}

/**
 * Safely save tasks to localStorage.
 */
function setTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error("Could not save tasks to localStorage:", err);
  }
}