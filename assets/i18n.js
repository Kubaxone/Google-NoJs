// ---------------------------------------------------------------------------
// i18n.js — loads a locale JSON and applies it to data-i18n elements
// ---------------------------------------------------------------------------

const SUPPORTED = ["en", "es", "pl", "temulanguange"];
const DEFAULT_LANG = "en";

// Detect preferred language: ?lang= param → localStorage → browser → default
function detectLang() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("lang") && SUPPORTED.includes(params.get("lang"))) {
    return params.get("lang");
  }
  const stored = localStorage.getItem("lang");
  if (stored && SUPPORTED.includes(stored)) return stored;

  const browser = (navigator.language || "").slice(0, 2).toLowerCase();
  if (SUPPORTED.includes(browser)) return browser;

  return DEFAULT_LANG;
}

// Fetch and parse a locale file
async function loadLocale(lang) {
  const res = await fetch(`localization/${lang}.json`);
  if (!res.ok) throw new Error(`Could not load locale: ${lang}`);
  return res.json();
}

// Apply locale strings to DOM elements with data-i18n attributes
// <button data-i18n="search_button">Google Search</button>
// <span   data-i18n-attr="title" data-i18n="clear_label">...</span>  ← sets an attribute instead
function applyLocale(strings) {
  document.documentElement.lang = strings.lang;
  document.documentElement.dir  = strings.dir || "ltr";

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key  = el.dataset.i18n;
    const attr = el.dataset.i18nAttr; // optional: set an attribute instead of textContent
    if (!(key in strings)) return;

    if (attr) {
      el.setAttribute(attr, strings[key]);
    } else {
      el.textContent = strings[key];
    }
  });

  // Special cases: anchor hrefs for the offered-in link
  document.querySelectorAll("[data-i18n-href]").forEach(el => {
    const key = el.dataset.i18nHref;
    if (strings[key]) el.href = strings[key];
  });
}

// Build the language picker UI and inject it into #lang-picker
function buildPicker(current, strings) {
  const container = document.getElementById("lang-picker");
  if (!container) return;

  const labels = { en: "English", es: "Español", pl: "Polski" };

  container.innerHTML = "";
  SUPPORTED.forEach(lang => {
    const btn = document.createElement("button");
    btn.textContent = labels[lang];
    btn.className = "lang-btn" + (lang === current ? " active" : "");
    btn.setAttribute("aria-pressed", lang === current);
    btn.addEventListener("click", () => switchLang(lang));
    container.appendChild(btn);
  });
}

// Switch to a different language without a page reload
async function switchLang(lang) {
  if (!SUPPORTED.includes(lang)) return;
  localStorage.setItem("lang", lang);

  // Update URL param without reload
  const url = new URL(window.location);
  url.searchParams.set("lang", lang);
  window.history.replaceState({}, "", url);

  const strings = await loadLocale(lang);
  applyLocale(strings);
  buildPicker(lang, strings);

  // Let search.js know the locale changed (for voice alert etc.)
  document.dispatchEvent(new CustomEvent("localeChanged", { detail: strings }));
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
async function initI18n() {
  const lang = detectLang();
  try {
    const strings = await loadLocale(lang);
    applyLocale(strings);
    buildPicker(lang, strings);
    localStorage.setItem("lang", lang);
    return strings;
  } catch (err) {
    console.warn("i18n load failed, falling back to en:", err);
    const strings = await loadLocale(DEFAULT_LANG);
    applyLocale(strings);
    buildPicker(DEFAULT_LANG, strings);
    return strings;
  }
}

// Expose globally so search.js can call it
window.i18n = { init: initI18n, switch: switchLang };
