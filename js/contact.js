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

// Handle submit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const subject = subjectEl.value.trim();
  const message = messageEl.value.trim();

  if (!name) return showError("Name is required.");
  if (!email) return showError("Email is required.");
  if (!subject) return showError("Subject is required.");
  if (!message) return showError("Message is required.");

  if (name.length > 60) return showError("Name cannot exceed 60 characters.");
  if (email.length > 80) return showError("Email cannot exceed 80 characters.");
  if (subject.length > 80) return showError("Subject cannot exceed 80 characters.");
  if (message.length > 500) return showError("Message cannot exceed 500 characters.");

  if (!isValidEmail(email)) return showError("Please enter a valid email address.");

  confirmName.textContent = name;
  confirmEmail.textContent = email;
  confirmSubject.textContent = subject;
  confirmMessage.textContent = message;

  confirmModal.show();
  form.reset();
});