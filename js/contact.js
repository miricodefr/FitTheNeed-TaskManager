/**
 * contact.js
 * - Validates the contact form
 * - Shows a confirmation modal with the submitted details
 * - Prevents silly inputs (too long / empty / invalid email)
 */

const form = document.getElementById("contactForm");

// Inputs
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const subjectEl = document.getElementById("subject");
const messageEl = document.getElementById("message");

// Confirmation modal fields
const confirmName = document.getElementById("confirmName");
const confirmEmail = document.getElementById("confirmEmail");
const confirmSubject = document.getElementById("confirmSubject");
const confirmMessage = document.getElementById("confirmMessage");

// Bootstrap modal instance
const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));

//Simple email validation (good enough for coursework)
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

//Helper: show alert message
function showError(msg) {
  alert(msg);
}

//Handle submit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Trim values to avoid "spaces only" input
  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const subject = subjectEl.value.trim();
  const message = messageEl.value.trim();

  // Required checks
  if (!name) return showError("Name is required.");
  if (!email) return showError("Email is required.");
  if (!subject) return showError("Subject is required.");
  if (!message) return showError("Message is required.");

  // Length checks (extra safety even if maxlength exists)
  if (name.length > 60) return showError("Name cannot exceed 60 characters.");
  if (email.length > 80) return showError("Email cannot exceed 80 characters.");
  if (subject.length > 80) return showError("Subject cannot exceed 80 characters.");
  if (message.length > 500) return showError("Message cannot exceed 500 characters.");

  // Email format check
  if (!isValidEmail(email)) return showError("Please enter a valid email address.");

  // Fill the modal with safe text
  confirmName.textContent = name;
  confirmEmail.textContent = email;
  confirmSubject.textContent = subject;
  confirmMessage.textContent = message;

  // Show modal confirmation
  confirmModal.show();

  // Reset the form after success
  form.reset();
});