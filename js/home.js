// Homepage extras: pixel starfield behind the hero, typing line, live stats, scroll progress,
// command menu (Ctrl/Cmd+K or "/"), spotlight on cards, and the latest commit in the footer.
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };

  // ---------- scroll progress ----------
  var bar = document.querySelector(".progress");
  if (bar) {
    var upd = function () { var h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, scrollY / h) : 0) + ")"; };
    addEventListener("scroll", upd, { passive: true }); upd();
  }

  // ---------- typing line ----------
  var typed = $("typed");
  if (typed && !reduce) {
    var words = ["websites", "custom PCBs", "pixel art", "games in Godot", "physics toys", "landing pages"], w = 0, i = words[0].length, del = true;
    var tick = function () {
      var word = words[w];
      if (del) { i--; if (i <= 0) { del = false; w = (w + 1) % words.length; } }
      else { i++; if (i >= words[w].length) { del = true; typed.textContent = words[w]; return setTimeout(tick, 1600); } }
      typed.textContent = words[w].slice(0, Math.max(0, i)) || "\u200b";
      setTimeout(tick, del ? 45 : 85);
    };
    setTimeout(tick, 2200);
  }

  // ---------- pixel starfield in the hero (low-res canvas scaled up = chunky pixels) ----------
  var sky = $("sky");
  if (sky && sky.getContext) {
    var c = sky.getContext("2d"), H = 80, W = 160, stars = [], shoot = null, mx = .5, my = .5;
    // Buffer keeps the banner's aspect ratio (2/1 on phones, 12/5 on desktop) so pixels stay square.
    var fit = function () { var r = sky.getBoundingClientRect(); if (r.height) { W = Math.max(80, Math.round(H * r.width / r.height)); sky.width = W; sky.height = H; } };
    fit(); addEventListener("resize", fit, { passive: true });
    for (var k = 0; k < 90; k++) stars.push({ x: Math.random() * 220, y: Math.random() * H, z: Math.random(), p: Math.random() * 6 });
    var cssv = function (n, d) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || d; };
    var ink = cssv("--ink", "#ededed"), amb = cssv("--sky", "#6ec1ff");
    new MutationObserver(function () { ink = cssv("--ink", "#ededed"); amb = cssv("--sky", "#6ec1ff"); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    addEventListener("pointermove", function (e) { mx = e.clientX / innerWidth; my = e.clientY / innerHeight; }, { passive: true });
    var t = 0, last = 0, on = true;
    var draw = function (ts) {
      var dt = Math.min((ts - last) / 1000 || 0, .05); last = ts; t += dt;
      c.clearRect(0, 0, W, H);
      stars.forEach(function (s) {
        var ox = (mx - .5) * 8 * s.z, oy = (my - .5) * 5 * s.z;           // parallax: near stars move more
        s.x -= dt * (1 + s.z * 3); if (s.x < -2) { s.x = W + 2; s.y = Math.random() * H; }
        c.globalAlpha = (.25 + .5 * s.z) * (Math.sin(s.p + t * 2) > -.3 ? 1 : .4);
        c.fillStyle = s.z > .85 ? amb : ink;
        c.fillRect(Math.round(s.x + ox), Math.round(s.y + oy), s.z > .7 ? 2 : 1, s.z > .7 ? 2 : 1);
      });
      if (!shoot && Math.random() < dt * .25) shoot = { x: Math.random() * W, y: Math.random() * H * .4, l: 0 };
      if (shoot) {
        shoot.l += dt; c.fillStyle = amb;
        for (var q = 0; q < 10; q++) { c.globalAlpha = (1 - q / 10) * (1 - shoot.l); c.fillRect(Math.round(shoot.x + shoot.l * 90 - q * 2), Math.round(shoot.y + shoot.l * 40 - q), 1, 1); }
        if (shoot.l >= 1) shoot = null;
      }
      c.globalAlpha = 1;
      if (on && !document.hidden) requestAnimationFrame(draw);
    };
    if (reduce) draw(0);
    else {
      var go = function () { if (on && !document.hidden) { last = performance.now(); requestAnimationFrame(draw); } };
      if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { var was = on; on = e[0].isIntersecting; if (on && !was) go(); }).observe(sky);
      document.addEventListener("visibilitychange", function () { if (!document.hidden) go(); });
      go();
    }
  }

  // ---------- live stats ----------
  var countUp = function (el, n) {
    if (!el) return; if (reduce) { el.textContent = n; return; }
    var s = performance.now(); (function f(ts) { var p = Math.min(1, (ts - s) / 900); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(s);
  };
  fetch("projects.json").then(function (r) { return r.json(); }).then(function (list) {
    countUp($("st-shipped"), list.filter(function (p) { return !p.status; }).length);
    countUp($("st-wip"), list.filter(function (p) { return p.status === "in progress"; }).length);
  }).catch(function () {});
  var cached = function (key, url) {
    try { var c0 = JSON.parse(localStorage.getItem(key)); if (c0 && Date.now() - c0.t < 36e5) return Promise.resolve(c0.d); } catch (e) {}
    return fetch(url).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) { try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {} return d; });
  };
  cached("gh:user", "https://api.github.com/users/Senvor").then(function (u) { countUp($("repos"), u.public_repos); }).catch(function () {});
  cached("gh:site-commit", "https://api.github.com/repos/Senvor/Senvor/commits?per_page=1").then(function (cs) {
    var el = $("last-commit"); if (!el || !cs[0]) return;
    var d = Math.floor((Date.now() - new Date(cs[0].commit.author.date)) / 864e5);
    el.innerHTML = ""; var a = document.createElement("a"); a.href = cs[0].html_url;
    a.textContent = "Last updated " + (d < 1 ? "today" : d === 1 ? "yesterday" : d + " days ago"); el.appendChild(a);
  }).catch(function () {});

  // ---------- command menu ----------
  var pal = $("pal"), q = $("pal-q"), ul = $("pal-list"), kb = $("kbtn");
  if (!pal) return;
  var items = [];
  document.querySelectorAll("main section[id]").forEach(function (s) { var h = s.querySelector("h2"); if (h) items.push({ t: h.textContent, k: "Section", u: "#" + s.id }); });
  document.querySelectorAll(".proj").forEach(function (p) {
    var h = p.querySelector("h3"), a = p.querySelector('a[href^="projects/"]');
    if (h && a) items.push({ t: h.textContent.trim(), k: "Project", u: a.getAttribute("href") });
  });
  document.querySelectorAll("#connect .clinks a").forEach(function (a) { items.push({ t: a.textContent.trim(), k: "Profile", u: a.href }); });
  items.push({ t: "Toggle theme", k: "Action", f: function () { var b = $("theme"); if (b) b.click(); } });
  items.push({ t: "Copy email", k: "Action", f: function () { try { navigator.clipboard.writeText("senvor@lazydeveloper.org"); } catch (e) {} } });
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
  var close = function () { pal.hidden = true; };
  var run = function (it) {
    close(); if (it.f) return it.f();
    if (it.u.charAt(0) === "#") { var el = document.querySelector(it.u); if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); history.replaceState(null, "", it.u); }
    else location.href = it.u;
  };
  if (kb) { kb.addEventListener("click", open); if (!/Mac|iPhone|iPad/.test(navigator.platform)) kb.querySelector("kbd").textContent = "Ctrl K"; }
  addEventListener("keydown", function (e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
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

// ---------- restyle extras: clock, filters, More menu, active nav, sticker, copy email, GitHub activity ----------
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };

  // live clock in India (Asia/Kolkata), refreshed every minute on the minute
  var ct = $("clock-t");
  if (ct) {
    var fmt = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });
    var tickClock = function () { ct.textContent = fmt.format(new Date()); setTimeout(tickClock, 60000 - Date.now() % 60000 + 50); };
    tickClock();
  }

  // filter tabs (Work and Skills)
  document.querySelectorAll(".tabs[data-for]").forEach(function (tabs) {
    var box = $(tabs.getAttribute("data-for")); if (!box) return;
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-f]"); if (!b) return;
      var f = b.getAttribute("data-f");
      tabs.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      Array.prototype.forEach.call(box.children, function (el) {
        var show = f === "all" || el.getAttribute("data-cat") === f;
        el.hidden = !show;
        if (show && !reduce) { el.classList.remove("fadein"); void el.offsetWidth; el.classList.add("fadein"); }
      });
    });
  });

  // "More" dropdown in the nav
  var mb = $("more-btn"), mm = $("more-menu");
  if (mb && mm) {
    var setOpen = function (o) { mm.hidden = !o; mb.setAttribute("aria-expanded", o ? "true" : "false"); };
    mb.addEventListener("click", function (e) { e.stopPropagation(); setOpen(mm.hidden); });
    mm.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("click", function (e) { if (!mm.hidden && !mm.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !mm.hidden) { setOpen(false); mb.focus(); } });
  }

  // active section: 4px dot under its nav link
  var links = document.querySelectorAll("nav [data-sec]");
  if (links.length && "IntersectionObserver" in window) {
    var map = { top: "top", work: "work", connect: "connect", about: "about", skills: "skills", building: "building" };
    var mark = function (id) {
      links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("data-sec") === id); });
      if (mb) mb.classList.toggle("active", id === "about" || id === "skills" || id === "building");
    };
    var vis = {};
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { vis[x.target.id || "top"] = x.isIntersecting; });
      var order = ["top", "about", "bloodline", "connect", "building", "work", "skills", "activity", "still"], cur = null;
      order.forEach(function (id) { if (vis[id] && !cur) cur = id; });
      mark(map[cur] || null);
    }, { rootMargin: "-45% 0px -50% 0px" });
    var hero = document.querySelector(".hero"); if (hero) io.observe(hero);
    document.querySelectorAll("main section[id]").forEach(function (s) { io.observe(s); });
  }

  // draggable sticker (pointer events cover mouse, pen and touch; transform only, so no layout shift)
  var st = $("sticker");
  if (st) {
    var dx = 0, dy = 0, sx = 0, sy = 0, drag = false;
    st.addEventListener("pointerdown", function (e) { drag = true; sx = e.clientX - dx; sy = e.clientY - dy; st.classList.add("drag"); try { st.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); });
    st.addEventListener("pointermove", function (e) { if (!drag) return; dx = e.clientX - sx; dy = e.clientY - sy; st.style.setProperty("--dx", dx + "px"); st.style.setProperty("--dy", dy + "px"); });
    var end = function () { drag = false; st.classList.remove("drag"); };
    st.addEventListener("pointerup", end); st.addEventListener("pointercancel", end);
  }

  // "Copy email" button in Still here?
  var ce = $("copy-email");
  if (ce) ce.addEventListener("click", function () {
    var mail = "senvor@lazydeveloper.org", label = ce.textContent;
    var done = function () { ce.textContent = "Copied"; setTimeout(function () { ce.textContent = label; }, 2000); };
    var fb = function () { var ta = document.createElement("textarea"); ta.value = mail; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} document.body.removeChild(ta); done(); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(mail).then(done, fb); else fb();
  });

  // GitHub activity: 53 weeks x 7 days, five shades; fails quietly
  var grid = $("cgrid"), load = $("cload"), tot = $("ctotal");
  if (grid) {
    var fail = function () { if (load) load.textContent = "See my activity on GitHub"; };
    var key = "gh:contrib";
    var got = null;
    try { var c0 = JSON.parse(localStorage.getItem(key)); if (c0 && Date.now() - c0.t < 6 * 36e5) got = Promise.resolve(c0.d); } catch (e) {}
    (got || fetch("https://github-contributions-api.jogruber.de/v4/Senvor?y=last").then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) { try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {} return d; }))
      .then(function (d) {
        var days = (d && d.contributions) || []; if (!days.length) return fail();
        // 53 columns: 52 full weeks plus the current week, ending on the latest day
        var wd = new Date(days[days.length - 1].date + "T00:00:00Z").getUTCDay();
        days = days.slice(-(52 * 7 + wd + 1));
        var pad = new Date(days[0].date + "T00:00:00Z").getUTCDay();
        var frag = document.createDocumentFragment();
        for (var p = 0; p < pad; p++) { var e0 = document.createElement("i"); e0.className = "pad"; frag.appendChild(e0); }
        days.forEach(function (x) {
          var i = document.createElement("i"); i.className = "l" + Math.max(0, Math.min(4, x.level | 0));
          i.title = x.count + (x.count === 1 ? " contribution on " : " contributions on ") + x.date; frag.appendChild(i);
        });
        grid.appendChild(frag); if (load) load.remove();
        var total = d.total && (d.total.lastYear != null ? d.total.lastYear : null);
        if (total == null) total = days.reduce(function (a, x) { return a + x.count; }, 0);
        if (tot) tot.textContent = total + " contributions in the last year";
      }).catch(fail);
  }
})();
