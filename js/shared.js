/**
 * Loads an HTML file into a container element.
 * @param {string} containerId - The ID of the element where the HTML will be inserted.
 * @param {string} filePath - The path to the HTML file we want to load.
 */
function loadComponent(containerId, filePath) {
  fetch(filePath)
    .then((response) => {
      // If the file can't be found, stop and show an error in the console
      if (!response.ok) {
        throw new Error(`Could not load ${filePath} (status: ${response.status})`);
      }
      return response.text();
    })
    .then((html) => {
      // Insert the HTML into the page
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

// When the page is ready, load the shared parts
document.addEventListener("DOMContentLoaded", () => {
loadComponent("navbar", "components/navbar.html");
loadComponent("footer", "components/footer.html");
});