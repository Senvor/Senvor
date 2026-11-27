// Command menu (Ctrl/Cmd+K or "/"), shared by the homepage and every project page.
// Needs #pal, #pal-q, #pal-list in the page and, optionally, a #kbtn header button.
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };
  var pal = $("pal"), q = $("pal-q"), ul = $("pal-list"), kb = $("kbtn");
  if (!pal || !q || !ul) return;
  var home = !!document.querySelector("main section[id] h2") && !!document.querySelector(".proj");
  var items = [];

  // Same list everywhere: read it from the homepage (this page, or a fetched copy of "/").
  // Links are root-relative so they work from any page.
  var collect = function (doc) {
    var out = [];
    doc.querySelectorAll("main section[id]").forEach(function (s) { var h = s.querySelector("h2"); if (h) out.push({ t: h.textContent, k: "Section", u: (home ? "#" : "/#") + s.id }); });
    doc.querySelectorAll(".proj").forEach(function (p) {
      var h = p.querySelector("h3"), a = p.querySelector('a[href^="projects/"], a[href^="/projects/"]');
      if (h && a) { var u = a.getAttribute("href"); out.push({ t: h.textContent.trim(), k: "Project", u: u.charAt(0) === "/" ? u : "/" + u }); }
    });
    doc.querySelectorAll("#connect .clinks a").forEach(function (a) { out.push({ t: a.textContent.trim(), k: "Profile", u: a.getAttribute("href") }); });
    return out;
  };
  var actions = [
    { t: "Toggle theme", k: "Action", f: function () { var b = $("theme"); if (b) b.click(); } },
    { t: "Copy email", k: "Action", f: function () { try { navigator.clipboard.writeText("senvor@lazydeveloper.org"); } catch (e) {} } }
  ];
  if (home) items = collect(document).concat(actions);
  else {
    // Fallback until (or if) the homepage list loads.
    items = [{ t: "Home", k: "Section", u: "/" }, { t: "Work", k: "Section", u: "/#work" }, { t: "Contact", k: "Section", u: "/#connect" }].concat(actions);
    fetch("/").then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (html) {
      var got = collect(new DOMParser().parseFromString(html, "text/html"));
      if (got.length) { items = got.concat(actions); if (!pal.hidden) render(); }
    }).catch(function () {});
  }

  var sel = 0, shown = [];
  var render = function () {
    var s = q.value.toLowerCase().trim();
    shown = items.filter(function (it) { return !s || (it.t + " " + it.k).toLowerCase().indexOf(s) > -1; }).slice(0, 9);
    if (sel >= shown.length) sel = 0;
    ul.innerHTML = "";
    shown.forEach(function (it, n) {
      var li = document.createElement("li"); li.setAttribute("role", "option"); li.className = n === sel ? "on" : "";
      li.innerHTML = "<span></span><small></small>"; li.firstChild.textContent = it.t; li.lastChild.textContent = it.k;
      li.addEventListener("mousemove", function () { if (sel !== n) { sel = n; render(); } });
      li.addEventListener("click", function () { run(it); });
      ul.appendChild(li);
    });
    if (!shown.length) ul.innerHTML = '<li class="none">Nothing matches</li>';
  };
  var open = function () { pal.hidden = false; q.value = ""; sel = 0; render(); setTimeout(function () { q.focus(); }, 0); };
  var close = function () { pal.hidden = true; if (document.activeElement === q) q.blur(); };
  var run = function (it) {
    close(); if (it.f) return it.f();
    if (it.u.charAt(0) === "#") { var el = document.querySelector(it.u); if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); history.replaceState(null, "", it.u); }
    else location.href = it.u;
  };
  if (kb) { kb.addEventListener("click", open); var kd = kb.querySelector("kbd"); if (kd && !/Mac|iPhone|iPad/.test(navigator.platform)) kd.textContent = "Ctrl K"; }
  addEventListener("keydown", function (e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); pal.hidden ? open() : close(); }
    else if (e.key === "/" && !typing && pal.hidden) { e.preventDefault(); open(); }
    else if (!pal.hidden) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(1, shown.length); render(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(1, shown.length); render(); }
      else if (e.key === "Enter" && shown[sel]) { e.preventDefault(); run(shown[sel]); }
    }
  });
  q.addEventListener("input", function () { sel = 0; render(); });
  pal.addEventListener("click", function (e) { if (e.target === pal) close(); });
})();
