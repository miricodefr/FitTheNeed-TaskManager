// Get username from URL parameter or sessionStorage
function loadUserInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  const username =
    urlParams.get("username") || sessionStorage.getItem("username") || "User";

  if (username && username !== "User") {
    sessionStorage.setItem("username", username);
  }

  document.getElementById("username").textContent = username;
}

// Load user's projects from localStorage
function loadProjects() {
  const projects = JSON.parse(localStorage.getItem("userProjects") || "[]");
  const container = document.getElementById("projectsContainer");

  if (projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>You haven't created any websites yet.</p>
        <p>Start by describing your first website above!</p>
      </div>
    `;
    return;
  }

  container.innerHTML =
    '<div class="projects-grid">' +
    projects
      .map(
        (project, index) => `
        <div class="project-card">
          <h3>${project.name}</h3>
          <p>${project.description.substring(0, 100)}${
          project.description.length > 100 ? "..." : ""
        }</p>
          <p style="font-size: 12px; color: #999;">
            Created: ${new Date(project.created).toLocaleDateString()}
          </p>
          <div class="actions">
            <button onclick="editProject(${index})">Edit</button>
            <button onclick="viewProject(${index})">View</button>
            <button onclick="deleteProject(${index})">Delete</button>
          </div>
        </div>
      `
      )
      .join("") +
    "</div>";
}

// Create a new website
async function createWebsite(event) {
  event.preventDefault();

  const description = document.getElementById("websiteDescription").value;
  const loading = document.getElementById("loading");
  const form = document.getElementById("createForm");

  // Show loading
  loading.classList.add("active");
  form.style.opacity = "0.5";
  form.style.pointerEvents = "none";

  try {
    // Simulating AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Save project to localStorage
    const projects = JSON.parse(localStorage.getItem("userProjects") || "[]");
    const newProject = {
      id: Date.now(),
      name: `Website ${projects.length + 1}`,
      description: description,
      created: new Date().toISOString(),
      status: "generated",
    };

    projects.push(newProject);
    localStorage.setItem("userProjects", JSON.stringify(projects));

    // Clear form and reload projects
    document.getElementById("websiteDescription").value = "";
    loadProjects();

    alert('Website generated successfully! Check "Your Websites" section below.');
  } catch (error) {
    alert("Error generating website. Please try again.");
    console.error(error);
  } finally {
    loading.classList.remove("active");
    form.style.opacity = "1";
    form.style.pointerEvents = "auto";
  }
}

// Edit a project
function editProject(index) {
  const projects = JSON.parse(localStorage.getItem("userProjects") || "[]");
  const project = projects[index];

  alert(
    `Editing: ${project.name}\n\nThis will open the website editor where you can modify your site.`
  );
  // Later: window.location.href = `editor.html?project=${index}`;
}

// View a project
function viewProject(index) {
  const projects = JSON.parse(localStorage.getItem("userProjects") || "[]");
  const project = projects[index];

  alert(
    `Viewing: ${project.name}\n\nThis will open a preview of your generated website.`
  );
  // Later: window.open(`preview.html?project=${index}`, "_blank");
}

// Delete a project
function deleteProject(index) {
  if (!confirm("Are you sure you want to delete this website?")) return;

  const projects = JSON.parse(localStorage.getItem("userProjects") || "[]");
  projects.splice(index, 1);
  localStorage.setItem("userProjects", JSON.stringify(projects));
  loadProjects();
}

// Logout
function logout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

// Snake button (placeholder)
function snake() {
  alert("🐍 Snake coming soon!");
  // Later: window.location.href = "snake.html";
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  loadUserInfo();
  loadProjects();

  // Attach submit handler in JS (instead of inline onsubmit)
  document.getElementById("createForm").addEventListener("submit", createWebsite);
});