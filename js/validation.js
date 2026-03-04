// validation.js

function showError(msg) {
  alert(msg);
}

// Email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateTextLimits(name, desc, maxName = 50, maxDesc = 150) {
  if (name.length > maxName) return `Task name cannot exceed ${maxName} characters.`;
  if (desc.length > maxDesc) return `Description cannot exceed ${maxDesc} characters.`;
  return null;
}

function formatDateYYYYMMDD(date) {
  return date.toISOString().split("T")[0];
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isOverdue(task) {
  return (
    task.status === "Pending" &&
    startOfDay(new Date(task.date)) < startOfDay(new Date())
  );
}