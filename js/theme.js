// Theme: palettes defined in css/style.css. Dark is the default; the toggle cycles
// dark -> light -> whitewash -> olive -> bougainvillea. The choice is saved in
// localStorage and reused on every page.
(function () {
  var r = document.documentElement;
  r.classList.add("js");
  var THEMES = {
    dark:          { bg: "#0f0f0f", scheme: "dark",  name: "Dark" },
    light:         { bg: "#ffffff", scheme: "light", name: "Light" },
    whitewash:     { bg: "#f6f3ec", scheme: "light", name: "Whitewash" },
    olive:         { bg: "#1e2416", scheme: "dark",  name: "Olive Green" },
    bougainvillea: { bg: "#fdeef4", scheme: "light", name: "Bougainvillea Pink" }
  };
  var ORDER = ["dark", "light", "whitewash", "olive", "bougainvillea"];
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}

  function apply(mode) {
    if (!THEMES[mode]) mode = "dark";
    var t = THEMES[mode];
    r.setAttribute("data-theme", mode);
    r.setAttribute("data-scheme", t.scheme);
    r.style.colorScheme = t.scheme;
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", t.bg);
    var b = document.getElementById("theme");
    if (b) {
      var next = THEMES[ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]].name;
      b.setAttribute("aria-label", "Theme: " + t.name + ". Switch to " + next);
      b.setAttribute("title", "Theme: " + t.name);
    }
  }
  function set(mode) {
    var go = function () { apply(mode); try { localStorage.setItem("theme", mode); } catch (e) {} };
    var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !calm) document.startViewTransition(go); else go();
  }
  window.senvorTheme = { set: set, list: ORDER, names: THEMES };
  apply(saved);

  document.addEventListener("DOMContentLoaded", function () {
    apply(r.getAttribute("data-theme"));
    var btn = document.getElementById("theme");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var cur = ORDER.indexOf(r.getAttribute("data-theme"));
      set(ORDER[(cur + 1) % ORDER.length]);
    });
  });
})();
