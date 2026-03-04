/**
 * Loads an HTML file into a container element.
 * @param {string} containerId - The ID of the element where the HTML will be inserted.
 * @param {string} filePath - The path to the HTML file we want to load.
 * @returns {Promise<void>} resolves when the component has been inserted (or rejects if fail).
 */
function loadComponent(containerId, filePath) {
  return fetch(filePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Could not load ${filePath} (status: ${response.status})`);
      }
      return response.text();
    })
    .then((html) => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = html;
      } else {
        console.warn(`Container with id="${containerId}" was not found on this page.`);
      }
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

function $(id) {
  return document.getElementById(id);
}

// Download helper (export)
function downloadTextFile(filename, text, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}


document.addEventListener("DOMContentLoaded", () => {
  // load navbar first so the toggle button exists when we init dark mode
  loadComponent("navbar", "components/navbar.html").finally(() => {
    initDarkMode();
  });

  // footer load independently
  loadComponent("footer", "components/footer.html");
});

/**
 * Toggle button text and stores preference.
 * @param {boolean} enabled
 */
function applyDarkMode(enabled) {
  const body = document.body;
  const html = document.documentElement;
  const toggle = document.getElementById("darkModeToggle");

  if (enabled) {
    body.classList.add("dark-mode");
    html.setAttribute("data-bs-theme", "dark");
    if (toggle) toggle.textContent = "Light Mode";
    localStorage.setItem("darkMode", "true");
  } else {
    body.classList.remove("dark-mode");
    html.removeAttribute("data-bs-theme");
    if (toggle) toggle.textContent = "Dark Mode";
    localStorage.setItem("darkMode", "false");
  }
}

/**
 * Read saved preference, or use system preference,
 * and connect toggle button.
 */
function initDarkMode() {
  const saved = localStorage.getItem("darkMode");
  let enabled = false;

  if (saved === "true") {
    enabled = true;
  } else if (saved === "false") {
    enabled = false;
  } else {
    // if no preference, check system
    enabled = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  applyDarkMode(enabled);

  const toggle = document.getElementById("darkModeToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      applyDarkMode(!document.body.classList.contains("dark-mode"));
    });
  }
}
