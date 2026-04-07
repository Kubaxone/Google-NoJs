// ---------------------------------------------------------------------------
// search.js — autocomplete, clear, lucky, mic
// Runs after i18n.js. Locale strings arrive via the localeChanged event.
// ---------------------------------------------------------------------------

const SUGGESTIONS = [
  "google", "gmail", "google maps", "google translate",
  "google drive", "google docs", "google images", "google earth",
  "google scholar", "google chrome", "github", "youtube",
  "facebook", "twitter", "instagram", "amazon", "netflix",
  "wikipedia", "stackoverflow", "reddit", "openai", "chatgpt",
];

const input        = document.getElementById("q");
const list         = document.getElementById("suggestionList");
const form         = document.getElementById("searchForm");
const wrap         = document.querySelector(".search-wrap");
const clearBtn     = document.getElementById("clearBtn");
const autocomplete = document.getElementById("autocomplete");
const luckyBtn     = document.getElementById("luckyBtn");
const micBtn       = document.getElementById("micBtn");

let activeIndex  = -1;
let currentStrings = {};

// -- i18n integration -------------------------------------------------------
document.addEventListener("localeChanged", (e) => {
  currentStrings = e.detail;
});

// -- Suggest ----------------------------------------------------------------
function getSuggestions(q) {
  if (!q) return [];
  const lower = q.toLowerCase();
  return SUGGESTIONS.filter(s => s.startsWith(lower)).slice(0, 8);
}

function renderSuggestions(items) {
  list.innerHTML = "";
  activeIndex = -1;

  if (!items.length) { closeSuggestions(); return; }

  items.forEach(text => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    li.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
      </svg>
      <span>${escapeHtml(text)}</span>
    `;
    li.addEventListener("mousedown", (e) => {
      e.preventDefault();
      input.value = text;
      closeSuggestions();
      form.submit();
    });
    list.appendChild(li);
  });

  list.classList.add("open");
  wrap.classList.add("expanded");
}

function closeSuggestions() {
  list.classList.remove("open");
  wrap.classList.remove("expanded");
  activeIndex = -1;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// -- Events -----------------------------------------------------------------
input.addEventListener("input", () => {
  const q = input.value.trim();
  clearBtn.style.display = q ? "flex" : "none";
  renderSuggestions(getSuggestions(q));
});

input.addEventListener("keydown", (e) => {
  const items = list.querySelectorAll("li");
  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex = Math.min(activeIndex + 1, items.length - 1);
    highlight(items);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex = Math.max(activeIndex - 1, -1);
    highlight(items);
  } else if (e.key === "Escape") {
    closeSuggestions();
  }
});

function highlight(items) {
  items.forEach((li, i) => {
    li.style.background = i === activeIndex ? "var(--hover)" : "";
    if (i === activeIndex) input.value = li.querySelector("span").textContent;
  });
}

document.addEventListener("click", (e) => {
  if (!autocomplete.contains(e.target)) closeSuggestions();
});

input.addEventListener("focus", () => {
  if (input.value.trim()) renderSuggestions(getSuggestions(input.value.trim()));
});

clearBtn.addEventListener("click", () => {
  input.value = "";
  clearBtn.style.display = "none";
  closeSuggestions();
  input.focus();
});

// -- Lucky ------------------------------------------------------------------
luckyBtn.addEventListener("click", () => {
  const q = input.value.trim();
  if (!q) return;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}&btnI=1`, "_blank");
});

// -- Mic --------------------------------------------------------------------
micBtn.addEventListener("click", () => {
  const msg = currentStrings.voice_unavailable || "Voice search is not available in this demo.";
  alert(msg);
});

// -- Close dropdown on submit -----------------------------------------------
form.addEventListener("submit", () => closeSuggestions());

// -- Boot -------------------------------------------------------------------
// i18n.js calls initI18n() which fires localeChanged; we just need to prime
// currentStrings in case the event already fired before this script ran
// (it won't, since i18n.js is async, but this is safe fallback)
window.i18n.init().then(strings => { currentStrings = strings; });
