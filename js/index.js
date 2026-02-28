/**
 * index.js (HOME PAGE ONLY)
 *
 * This file handles the Home page "Bored?" button.
 * When clicked, it fetches a random corporate phrase from a public API.
 *
 * API endpoint (returns JSON like: { "phrase": "..." } ):
 * https://corporatebs-generator.sameerkumar.website/
 */

const boredBtn = document.getElementById("boredBtn");
const bsPhraseEl = document.getElementById("bsPhrase");
const bsStatusEl = document.getElementById("bsStatus");

// The public API endpoint we are using
const CORPORATE_BS_API_URL = "https://corporatebs-generator.sameerkumar.website/";

/**
 * Small helper: show a status message under the phrase.
 * @param {string} msg - message to show the user
 */
function setStatus(msg) {
  bsStatusEl.textContent = msg;
}

/**
 * Fetches a phrase from the API and shows it on the page.
 * This is written defensively:
 * - disables the button while loading (prevents spam clicks)
 * - handles network/API failures
 * - handles unexpected JSON
 */
async function fetchCorporatePhrase() {
  try {
    // Disable button to stop repeated clicks during loading
    boredBtn.disabled = true;

    setStatus("Loading a corporate phrase...");

    // Call the API
    const response = await fetch(CORPORATE_BS_API_URL);

    // If the server responds with an error status (404/500/etc)
    if (!response.ok) {
      throw new Error(`API error (status: ${response.status})`);
    }

    const data = await response.json();

    // Validate the result shape
    const phrase = typeof data.phrase === "string" ? data.phrase : "";

    if (!phrase) {
      throw new Error("API returned an unexpected response (missing phrase).");
    }

    // Show the phrase safely (textContent avoids HTML injection)
    bsPhraseEl.textContent = phrase;

    setStatus("Loaded ✅");
  } catch (err) {
    // Friendly fallback for users
    bsPhraseEl.textContent =
      "Could not load a phrase right now. Please try again.";

    // Useful info for debugging
    setStatus(`Error: ${err.message}`);
    console.error(err);
  } finally {
    boredBtn.disabled = false;
  }
}

// Connect button click to the API call
boredBtn.addEventListener("click", fetchCorporatePhrase);