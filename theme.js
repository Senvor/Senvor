// Random theme: every visit and every refresh gets a brand-new colour palette.
// Hue, saturation and accent colours are picked at random, so the combinations never run out.
// Lightness stays fixed per role, so text always stays readable in both light and dark mode.
(function () {
  var r = document.documentElement;
  r.classList.add("js");
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  var startDark = saved ? saved === "dark"
    : !!(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);

  var rnd = Math.random;
  var h = rnd() * 360;                         // base hue
  var s = 30 + rnd() * 50;                     // base saturation 30-80%
  var a = (h + 90 + rnd() * 180) % 360;        // accent hue, away from the base
  var k = (a + 60 + rnd() * 120) % 360;        // second accent hue

  function c(H, S, L) {
    return "hsl(" + H.toFixed(1) + ", " + Math.min(100, S).toFixed(1) + "%, " + L.toFixed(1) + "%)";
  }

  var palettes = {
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

  function apply(mode) {
    var p = palettes[mode];
    for (var key in p) r.style.setProperty(key, p[key]);
    r.style.colorScheme = mode;
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", p["--bg"]);
    r.setAttribute("data-theme", mode);
  }

  window.senvorTheme = { apply: apply, hue: Math.round(h) };
  apply(startDark ? "dark" : "light");
  document.addEventListener("DOMContentLoaded", function () { apply(r.getAttribute("data-theme")); });
})();