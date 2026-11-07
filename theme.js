// Random theme: the first page of every visit uses the default theme;
// every refresh after that gets a brand-new random colour palette.
// Hue, saturation and accent colours are picked at random, so the combinations never run out.
// Lightness stays fixed per role, so text always stays readable in both light and dark mode.
(function () {
  var r = document.documentElement;
  r.classList.add("js");
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  var startDark = saved ? saved === "dark"
    : !!(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);

  var palettes = null, hue = null;
  var first = true;
  try { first = !sessionStorage.getItem("seen"); sessionStorage.setItem("seen", "1"); } catch (e) {}

  function c(H, S, L) {
    return "hsl(" + H.toFixed(1) + ", " + Math.min(100, S).toFixed(1) + "%, " + L.toFixed(1) + "%)";
  }

  function roll() {
    var rnd = Math.random;
    var h = rnd() * 360;                         // base hue
    var s = 30 + rnd() * 50;                     // base saturation 30-80%
    var a = (h + 90 + rnd() * 180) % 360;        // accent hue, away from the base
    var k = (a + 60 + rnd() * 120) % 360;        // second accent hue
    hue = Math.round(h);
    palettes = {
      dark: {
        "--bg": c(h, s * 0.5, 9), "--panel": c(h, s * 0.45, 14), "--line": c(h, s * 0.4, 28),
        "--ink": c(h, 30, 93), "--soft": c(h, 25, 72), "--chip": c(h, s * 0.45, 19),
        "--amber": c(a, 85, 65), "--amber-text": c(a, 85, 68), "--sky": c(k, 80, 70)
      },
      light: {
        "--bg": c(h, s * 0.9, 96), "--panel": c(h, s, 99), "--line": c(h, s * 0.7, 84),
        "--ink": c(h, 45, 15), "--soft": c(h, 20, 38), "--chip": c(h, s * 0.8, 91),
        "--amber": c(a, 85, 55), "--amber-text": c(a, 90, 28), "--sky": c(k, 70, 40)
      }
    };
  }

  function apply(mode) {
    if (!palettes) { r.setAttribute("data-theme", mode); return; }   // default theme: CSS colours
    var p = palettes[mode];
    for (var key in p) r.style.setProperty(key, p[key]);
    r.style.colorScheme = mode;
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", p["--bg"]);
    r.setAttribute("data-theme", mode);
  }

  function shuffle() { roll(); apply(r.getAttribute("data-theme") || "dark"); }

  if (!first) roll();
  window.senvorTheme = { apply: apply, shuffle: shuffle, get hue() { return hue; } };
  apply(startDark ? "dark" : "light");

  // Small hint telling visitors the colours change; tap it to shuffle without reloading.
  document.addEventListener("DOMContentLoaded", function () {
    apply(r.getAttribute("data-theme"));
    if (!palettes) { var m0 = document.querySelector('meta[name="theme-color"]'); if (m0) m0.setAttribute("content", getComputedStyle(r).getPropertyValue("--bg").trim()); }
    var b = document.createElement("button");
    b.type = "button";
    b.className = "theme-hint";
    b.setAttribute("aria-label", "Shuffle the colour theme");
    b.innerHTML = "<span aria-hidden=\"true\">&#127912;</span> Refresh for new colours &middot; tap to shuffle";
    b.style.cssText = "position:fixed;left:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:20;" +
      "font:500 13px var(--body,system-ui);color:var(--ink);background:var(--panel);border:2px solid var(--line);" +
      "box-shadow:3px 3px 0 var(--line);padding:6px 12px;cursor:pointer;max-width:calc(100vw - 32px)";
    b.addEventListener("click", function () {
      var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (document.startViewTransition && !calm) document.startViewTransition(shuffle); else shuffle();
    });
    document.body.appendChild(b);
  });
})();
