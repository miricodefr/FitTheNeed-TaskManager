/**
 * Loads an HTML file into a container element.
 * @param {string} containerId - The ID of the element where the HTML will be inserted.
 * @param {string} filePath - The path to the HTML file we want to load.
 */
function loadComponent(containerId, filePath) {
  fetch(filePath)
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

// When the page is ready load the shared parts
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("navbar", "components/navbar.html");
  loadComponent("footer", "components/footer.html");
});