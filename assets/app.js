const root = document.documentElement;
root.classList.add("has-js");

function readTheme() {
  try {
    return localStorage.getItem("wk-theme");
  } catch (error) {
    return null;
  }
}

function writeTheme(theme) {
  try {
    localStorage.setItem("wk-theme", theme);
  } catch (error) {
    return null;
  }
}

const storedTheme = readTheme();
const themeToggle = document.querySelector("[data-theme-toggle]");

function setTheme(theme) {
  root.dataset.theme = theme;
  writeTheme(theme);
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(theme === "light"));
    themeToggle.querySelector("[data-theme-label]").textContent =
      theme === "light" ? "Light" : "Dark";
  }
}

setTheme(storedTheme || root.dataset.theme || "dark");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });
}

const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
  );

  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("is-visible"));
}

document.querySelectorAll("[data-count]").forEach(item => {
  const rawValue = item.dataset.count || "";
  const numeric = Number(rawValue.replace(/[^0-9.-]/g, ""));

  if (!Number.isFinite(numeric)) return;

  let start = null;
  const duration = 900;
  const prefix = rawValue.trim().startsWith("$") ? "$" : "";
  const suffix = rawValue.trim().endsWith("%") ? "%" : "";
  const compact = rawValue.toLowerCase().includes("m");
  const decimals = rawValue.includes(".") ? 1 : 0;

  function frame(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = numeric * eased;
    const display = compact ? value.toFixed(decimals) + "M" : value.toFixed(decimals);
    item.textContent = prefix + display + suffix;
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
});

const vizFrames = document.querySelectorAll("[data-viz-frame]");

if (vizFrames.length) {
  const script = document.createElement("script");
  script.type = "module";
  script.src = "https://prod-useast-a.online.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js";
  document.head.appendChild(script);
}

vizFrames.forEach(frame => {
  const viz = frame.querySelector("tableau-viz");
  if (!viz) return;

  const markLoaded = () => frame.classList.add("is-loaded");
  viz.addEventListener("firstinteractive", markLoaded);
  viz.addEventListener("load", markLoaded);
  window.setTimeout(markLoaded, 3000);
});
