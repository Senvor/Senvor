// Theme: fixed dark/light palettes defined in css/style.css. Dark is the default;
// the visitor's choice from the toggle is saved in localStorage and reused on every page.
(function () {
  var r = document.documentElement;
  r.classList.add("js");
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  var BG = { dark: "#0f0f0f", light: "#ffffff" };

  function apply(mode) {
    mode = mode === "light" ? "light" : "dark";
    r.setAttribute("data-theme", mode);
    r.style.colorScheme = mode;
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", BG[mode]);
    var b = document.getElementById("theme");
    if (b) b.setAttribute("aria-pressed", mode === "light" ? "true" : "false");
  }
  apply(saved === "light" ? "light" : "dark");

  document.addEventListener("DOMContentLoaded", function () {
    apply(r.getAttribute("data-theme"));
    var btn = document.getElementById("theme");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = r.getAttribute("data-theme") === "dark" ? "light" : "dark";
      var go = function () { apply(next); try { localStorage.setItem("theme", next); } catch (e) {} };
      var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (document.startViewTransition && !calm) document.startViewTransition(go); else go();
    });
  });
})();
