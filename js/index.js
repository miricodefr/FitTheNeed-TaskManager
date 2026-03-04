/**
 * index.js (Home)
 * - Displays latest tasks from Tasks page (localStorage)
 * - Fetches corporate phrase from API
 */

// LATEST ACTIVITY
const activityList = document.getElementById("activityList");

// Create display text for each task
function buildTaskText(task) {
  const priority = task.priority ? ` | ${task.priority}` : "";
  const status = task.status || "Pending";
  return `${task.name}${priority} | ${status} | Due: ${task.date}`;
}

// Render latest 5 tasks
function renderLatestActivity() {
  const tasks = getTasks();

  activityList.innerHTML = "";

  if (tasks.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-muted";
    li.textContent = "No tasks yet. Add tasks on the Tasks page.";
    activityList.appendChild(li);
    return;
  }

  // Get last 5 tasks added (newest first)
  const latest = tasks.slice(-5).reverse();

  latest.forEach((task) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = buildTaskText(task);
    activityList.appendChild(li);
  });
}

// Run when page loads
renderLatestActivity();

const boredBtn = document.getElementById("boredBtn");
const bsPhraseEl = document.getElementById("bsPhrase");
const bsStatusEl = document.getElementById("bsStatus");

// API
const CORPORATE_BS_API_URL = "https://corporatebs-generator.sameerkumar.website/";

/**
 * status message under phrase
 * @param {string} msg - message to show the user
 */
function setStatus(msg) {
  bsStatusEl.textContent = msg;
}

async function fetchCorporatePhrase() {
  try {
    boredBtn.disabled = true;
    setStatus("Loading a corporate phrase...");

    const response = await fetch(CORPORATE_BS_API_URL);

    if (!response.ok) {
      throw new Error(`API error (status: ${response.status})`);
    }

    const data = await response.json();

    const phrase = typeof data.phrase === "string" ? data.phrase : "";
    if (!phrase) {
      throw new Error("API returned an unexpected response (missing phrase).");
    }

    bsPhraseEl.textContent = phrase;
    setStatus("Loaded ");
  } catch (err) {
    bsPhraseEl.textContent =
      "Could not load a phrase right now. Please try again.";

    setStatus(`Error: ${err.message}`);
    console.error(err);
  } finally {
    boredBtn.disabled = false;
  }
}

boredBtn.addEventListener("click", fetchCorporatePhrase);