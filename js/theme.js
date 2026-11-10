// Random theme: the first page of every visit uses the default theme;
// every refresh after that picks one of 10 hand-picked colour palettes at random
// (never the same one twice in a row).
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

  // 10 curated palettes: base hue (h), base saturation (s), accent hue (a), second accent hue (k).
  var PALETTES = [
    { name: "Midnight Amber", h: 248, s: 45, a: 38,  k: 200 },
    { name: "Forest Coral",   h: 150, s: 35, a: 12,  k: 45  },
    { name: "Ocean Gold",     h: 192, s: 50, a: 45,  k: 330 },
    { name: "Plum Mint",      h: 290, s: 40, a: 160, k: 45  },
    { name: "Ember Sky",      h: 20,  s: 30, a: 200, k: 50  },
    { name: "Rose Teal",      h: 340, s: 45, a: 175, k: 45  },
    { name: "Slate Lime",     h: 220, s: 35, a: 85,  k: 330 },
    { name: "Sage Magenta",   h: 95,  s: 25, a: 320, k: 200 },
    { name: "Wine Cyan",      h: 355, s: 50, a: 188, k: 48  },
    { name: "Lavender Peach", h: 265, s: 55, a: 25,  k: 170 }
  ];

  function roll() {
    var last = -1;
    try { last = parseInt(sessionStorage.getItem("palette"), 10); } catch (e) {}
    var i;
    do { i = Math.floor(Math.random() * PALETTES.length); } while (i === last && PALETTES.length > 1);
    try { sessionStorage.setItem("palette", String(i)); } catch (e) {}
    var P = PALETTES[i], h = P.h, s = P.s, a = P.a, k = P.k;
    hue = h;
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
