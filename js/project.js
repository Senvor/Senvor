// Project pages: live GitHub stats, pixel hero art, live demo loader, gallery lightbox, progress bar, keyboard nav.
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- reading progress ----------
  var bar = document.querySelector(".pj-progress");
  if (bar) {
    var upd = function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, scrollY / h) : 0) + ")";
    };
    addEventListener("scroll", upd, { passive: true }); upd();
  }

  // ---------- copy link ----------
  var share = document.querySelector(".pj-share");
  if (share) share.addEventListener("click", function () {
    var done = function () { share.textContent = "Copied ✓"; setTimeout(function () { share.textContent = "Copy link"; }, 1600); };
    if (navigator.share && matchMedia("(pointer:coarse)").matches) navigator.share({ title: document.title, url: location.href }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, done);
  });

  // ---------- arrow keys: previous / next project ----------
  addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input,textarea,select,iframe") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.querySelector(".lb.open")) return;
    var pal = document.getElementById("pal"); if (pal && !pal.hidden) return;
    var a = e.key === "ArrowLeft" ? document.querySelector('a[rel="prev"]') : e.key === "ArrowRight" ? document.querySelector('a[rel="next"]') : null;
    if (a) location.href = a.href;
  });

  // ---------- scroll reveal ----------
  var items = document.querySelectorAll(".pj-body section, .pj-stats li, .pj-cards a, .pj-hire");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el, i) { el.classList.add("rv"); el.style.transitionDelay = (i % 6) * 50 + "ms"; io.observe(el); });
  }

  // ---------- live demo, loaded only when asked ----------
  document.querySelectorAll(".pj-frame").forEach(function (box) {
    var btn = box.querySelector("button");
    btn.addEventListener("click", function () {
      // The demo runs at a real desktop size (1280x800) and is scaled down to fit, so its layout
      // looks exactly like the real site instead of squashing into a narrow column.
      var f = document.createElement("iframe"), stage = document.createElement("div");
      f.src = box.dataset.src; f.title = "Live demo"; f.allow = "microphone; autoplay; fullscreen";
      stage.className = "pj-stage"; stage.appendChild(f);
      var open = document.createElement("a"); open.className = "pj-open"; open.href = box.dataset.src; open.target = "_blank"; open.rel = "noopener"; open.textContent = "Open full size ↗";
      box.innerHTML = ""; box.appendChild(stage); box.appendChild(open); box.classList.add("on");
      var fit = function () { stage.style.transform = "scale(" + box.clientWidth / 1280 + ")"; };
      fit(); if ("ResizeObserver" in window) new ResizeObserver(fit).observe(box); else addEventListener("resize", fit);
    });
  });

  // ---------- gallery lightbox ----------
  var imgs = Array.prototype.slice.call(document.querySelectorAll("img[data-zoom]"));
  if (imgs.length) {
    var lb = document.createElement("div"); lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
    lb.innerHTML = '<button class="lb-x" aria-label="Close">×</button><button class="lb-p" aria-label="Previous image">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="lb-n" aria-label="Next image">›</button>';
    document.body.appendChild(lb);
    var cur = 0, big = lb.querySelector("img"), cap = lb.querySelector("figcaption"), last = null;
    var show = function (i) {
      cur = (i + imgs.length) % imgs.length; big.src = imgs[cur].src; big.alt = imgs[cur].alt;
      cap.textContent = imgs[cur].alt + (imgs.length > 1 ? "  ·  " + (cur + 1) + "/" + imgs.length : "");
    };
    var close = function () { lb.classList.remove("open"); document.body.style.overflow = ""; if (last) last.focus(); };
    imgs.forEach(function (im, i) {
      im.tabIndex = 0; im.setAttribute("role", "button");
      var open = function () { last = im; show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; lb.querySelector(".lb-x").focus(); };
      im.addEventListener("click", open);
      im.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-x")) close(); });
    lb.querySelector(".lb-p").addEventListener("click", function () { show(cur - 1); });
    lb.querySelector(".lb-n").addEventListener("click", function () { show(cur + 1); });
    if (imgs.length < 2) { lb.querySelector(".lb-p").hidden = true; lb.querySelector(".lb-n").hidden = true; }
    addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") show(cur - 1); else if (e.key === "ArrowRight") show(cur + 1);
    });
  }

  // ---------- GitHub: stats + recent commits (cached an hour; the public API allows ~60 calls/hour) ----------
  var OWNER = "Senvor", TTL = 36e5;
  function gh(path) {
    var key = "gh2:" + path;
    try { var c = JSON.parse(localStorage.getItem(key)); if (c && Date.now() - c.t < TTL) return Promise.resolve(c.d); } catch (e) {}
    return fetch("https://api.github.com/repos/" + OWNER + "/" + path).then(function (r) {
      if (!r.ok) throw new Error(r.status); return r.json();
    }).then(function (d) { try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {} return d; });
  }
  function ago(iso) {
    var d = Math.floor((Date.now() - new Date(iso)) / 864e5);
    if (d < 1) return "today"; if (d === 1) return "yesterday"; if (d < 30) return d + " days ago";
    var m = Math.floor(d / 30); return m < 12 ? m + " mo ago" : Math.floor(m / 12) + " y ago";
  }
  var stats = document.querySelector("[data-repo-stats]");
  if (stats) {
    var repo = stats.dataset.repoStats, set = function (k, v) { var el = stats.querySelector('[data-gh="' + k + '"]'); if (el) el.textContent = v; };
    gh(repo).then(function (r) {
      set("pushed", ago(r.pushed_at)); set("language", r.language || "—"); set("stars", "★ " + r.stargazers_count);
    }).catch(function () { set("pushed", "—"); set("language", "—"); set("stars", "—"); });
    var list = document.querySelector("[data-commits]");
    if (list) gh(repo + "/commits?per_page=5").then(function (cs) {
      list.innerHTML = "";
      if (!cs.length) { list.innerHTML = '<li class="muted">No commits yet</li>'; return; }
      cs.forEach(function (c) {
        var li = document.createElement("li"), a = document.createElement("a"), s = document.createElement("small");
        a.href = c.html_url; a.textContent = c.commit.message.split("\n")[0]; a.title = c.commit.message;
        s.textContent = ago(c.commit.author.date); li.appendChild(a); li.appendChild(s); list.appendChild(li);
      });
    }).catch(function () { list.innerHTML = '<li class="muted">Open the repository for history</li>'; });
  }

  // ---------- pixel hero art for projects without a photo ----------
  var hero = document.querySelector(".pj-hero.art");
  if (!hero) return;
  var cv = hero.querySelector("canvas"), x = cv.getContext("2d"), W = cv.width, H = cv.height, kind = hero.dataset.art;
  var css = getComputedStyle(document.documentElement);
  var AMB = css.getPropertyValue("--amber").trim() || "#ffb84d", SKY = css.getPropertyValue("--sky").trim() || "#6ec1ff";
  var R = function (a, b) { return a + Math.random() * (b - a); };
  var px = function (X, Y, c, a) { x.globalAlpha = a == null ? 1 : a; x.fillStyle = c; x.fillRect(Math.round(X), Math.round(Y), 1, 1); };
  var disc = function (X, Y, r, c, a) {
    x.globalAlpha = a == null ? 1 : a; x.fillStyle = c; X = Math.round(X); Y = Math.round(Y);
    var n = Math.round(r); for (var dy = -n; dy <= n; dy++) { var w = Math.floor(Math.sqrt(Math.max(0, (r + .25) * (r + .25) - dy * dy))); x.fillRect(X - w, Y + dy, 2 * w + 1, 1); }
  };
  var stars = []; for (var i = 0; i < 60; i++) stars.push([R(0, W), R(0, H), R(0, 6)]);
  var S = {}, t = 0;

  if (kind === "orbit") {
    S.p = [[18, .9, 1.4, "#ff7a59"], [30, .55, 2, SKY], [44, .36, 2.5, "#7cf29a"], [60, .24, 1.6, "#d58cff"]].map(function (a) { return { r: a[0], w: a[1], s: a[2], c: a[3], a: R(0, 6.28) }; });
  } else if (kind === "pcb") {
    S.traces = []; for (var k = 0; k < 10; k++) { var y0 = Math.round(R(8, H - 8)), pts = [[0, y0]], cx = 0, cy = y0;
      while (cx < W) { cx += Math.round(R(12, 40)); if (Math.random() < .5) { var ny = Math.max(6, Math.min(H - 6, cy + Math.round(R(-20, 20)))); pts.push([cx, cy]); cx += Math.abs(ny - cy); cy = ny; } pts.push([cx, cy]); }
      S.traces.push({ p: pts, o: R(0, 400), c: Math.random() < .35 ? AMB : "#3fae6a" }); }
  } else if (kind === "particles") {
    S.ps = []; for (var q = 0; q < 320; q++) S.ps.push({ a: R(0, 6.28), r: R(4, 46), w: R(.2, .9) * (Math.random() < .5 ? 1 : -1), h: R(180, 320) });
  } else if (kind === "food") {
    // Tapdish: dishes ride a counter belt, a tap cursor picks one, it hops into the bag and the count ticks up.
    S.items = []; S.n = 0; S.cur = { x: W * .62, y: 18, tap: 0 }; S.next = 1.2; S.fly = [];
    // 9x11 hand pointing down (cuff on top, curled fingers right, index finger left): o outline, c cream, s shade
    var HAND = [".ooooooo.", ".ossssso.", "occccccco", "occccccco", "occcococo", "occcococo", "occsocoo.", "occsooo..", "occso....", "occso....", ".ooo....."];
    var HAND_C = { o: "#0a0a0a", c: "#f2e6d0", s: "#d9c7a8" };
    for (var f0 = 0; f0 < 5; f0++) S.items.push({ x: f0 * 52 - 20, k: f0 % 4 });
  } else if (kind === "sound") {
    // Sound Galaxy: a spiral galaxy whose arms swell with a fake beat, an equalizer glowing underneath.
    S.st = []; for (var g0 = 0; g0 < 260; g0++) { var arm = g0 % 3; S.st.push({ arm: arm, d: R(3, 48), o: R(-.35, .35), h: 190 + arm * 60 + R(-20, 20) }); }
    S.bars = []; for (var b0 = 0; b0 < 30; b0++) S.bars.push(0);
  } else if (kind === "roach") {
    // CJP: a rally of cockroaches marches with placards; now and then a shoe stomps, they scatter, and march on unharmed.
    S.r = []; for (var r0 = 0; r0 < 14; r0++) S.r.push({ x: R(-20, W), y: R(36, 66), v: R(14, 22), ph: R(0, 6), sign: r0 % 3 === 0, vy: 0, fast: 0 });
    S.shoe = { x: 0, y: -40, st: 0, wait: 3 };
    var CJP = ["###.###.###", "#.....#.#.#", "#.....#.###", "#...#.#.#..", "###.###.#.."];
  } else if (kind === "marbles") {
    // track: pairs of points are ramps, the gap between pairs is a straight drop
    S.path = [[20, 8], [212, 24], [220, 24], [220, 40], [28, 56], [20, 56], [20, 72], [212, 88], [220, 88], [220, 112]];
    S.seg = []; S.len = 0;
    for (var k2 = 1; k2 < S.path.length; k2++) { var L2 = Math.hypot(S.path[k2][0] - S.path[k2 - 1][0], S.path[k2][1] - S.path[k2 - 1][1]); S.seg.push(L2); S.len += L2; }
    S.ms = []; for (var m = 0; m < 7; m++) S.ms.push({ s: m * S.len / 7, v: 30 + m * 5, c: "hsl(" + Math.round(m * 51) + " 80% 62%)", r: R(2.5, 3.5) });
  } else if (kind === "life") {
    S.cw = 60; S.ch = 25; S.g = []; for (var z = 0; z < S.cw * S.ch; z++) S.g.push(Math.random() < .3 ? 1 : 0); S.acc = 0;
  }

  function frame(dt) {
    t += dt; x.globalAlpha = 1; x.fillStyle = "#0a0a0a"; x.fillRect(0, 0, W, H);
    stars.forEach(function (s) { px(s[0], s[1], "#fff", Math.sin(s[2] + t * 1.5) > 0 ? .7 : .2); });
    if (kind === "orbit") {
      var c0 = W / 2, c1 = H / 2;
      disc(c0, c1, 14, AMB, .15); disc(c0, c1, 9, AMB, .35); disc(c0, c1, 5, "#fff6e0");
      S.p.forEach(function (p) {
        p.a += p.w * dt; for (var k = 1; k < 26; k++) { var b = p.a - k * .045; px(c0 + Math.cos(b) * p.r * 1.6, c1 + Math.sin(b) * p.r * .8, p.c, .7 - k * .027); }
        disc(c0 + Math.cos(p.a) * p.r * 1.6, c1 + Math.sin(p.a) * p.r * .8, p.s, p.c);
      });
    } else if (kind === "pcb") {
      S.traces.forEach(function (tr) {
        x.globalAlpha = .45; x.fillStyle = tr.c;
        for (var k = 1; k < tr.p.length; k++) { var a = tr.p[k - 1], b = tr.p[k], L = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
          for (var q = 0; q <= L; q++) x.fillRect(Math.round(a[0] + (b[0] - a[0]) * q / L), Math.round(a[1] + (b[1] - a[1]) * q / L), 1, 1); }
        var e = tr.p[tr.p.length - 1]; disc(tr.p[0][0] + 2, tr.p[0][1], 1.5, "#c9c9c9", .8);
        // a signal pulse running along the trace
        var len = 0, seg = []; for (var j = 1; j < tr.p.length; j++) { var d = Math.max(Math.abs(tr.p[j][0] - tr.p[j - 1][0]), Math.abs(tr.p[j][1] - tr.p[j - 1][1])) || 1; seg.push(d); len += d; }
        var pos = (t * 60 + tr.o) % (len + 60), acc = 0;
        for (var s2 = 0; s2 < seg.length; s2++) { if (pos <= acc + seg[s2]) { var f = (pos - acc) / seg[s2], A = tr.p[s2], B = tr.p[s2 + 1]; disc(A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f, 1.5, "#fff", 1); break; } acc += seg[s2]; }
      });
      x.globalAlpha = 1; x.fillStyle = "#1a1a1a"; x.fillRect(W / 2 - 22, H / 2 - 14, 44, 28); x.fillStyle = "#3a3a3a"; x.fillRect(W / 2 - 20, H / 2 - 12, 40, 24);
      for (var pin = 0; pin < 8; pin++) { x.fillStyle = "#c9c9c9"; x.fillRect(W / 2 - 18 + pin * 5, H / 2 - 17, 2, 3); x.fillRect(W / 2 - 18 + pin * 5, H / 2 + 14, 2, 3); }
    } else if (kind === "particles") {
      S.ps.forEach(function (p) { p.a += p.w * dt * (60 / (p.r + 20)); var r = p.r * (1 + .08 * Math.sin(t * 2 + p.h)); var X = W / 2 + Math.cos(p.a) * r * 2.2, Y = H / 2 + Math.sin(p.a) * r, c = "hsl(" + p.h + " 90% 70%)"; px(X, Y, c, 1); if (p.r < 20) px(X + 1, Y, c, .6); });
      disc(W / 2, H / 2, 3, "#fff", .9);
    } else if (kind === "food") {
      var belt = 74, sp = 26;
      // counter + belt
      x.globalAlpha = 1; x.fillStyle = "#2a2346"; x.fillRect(0, belt + 6, W, 3); x.fillStyle = "#3b3266"; x.fillRect(0, belt + 9, W, H - belt - 9);
      for (var bx = -((t * sp) % 8); bx < W; bx += 8) { x.fillStyle = "#4b4180"; x.fillRect(Math.round(bx), belt + 6, 3, 1); }
      // bag on the right with order count
      var gx = W - 30, gy = 30; x.fillStyle = "#c98a4b"; x.fillRect(gx, gy, 22, 24); x.fillStyle = "#a8703a"; x.fillRect(gx, gy, 22, 3);
      x.fillStyle = "#6b4423"; x.fillRect(gx + 6, gy - 5, 1, 5); x.fillRect(gx + 15, gy - 5, 1, 5); x.fillRect(gx + 6, gy - 5, 10, 1);
      x.fillStyle = "#fff6e0"; x.font = "8px monospace"; x.textAlign = "center"; x.fillText(String(S.n % 100), gx + 11, gy + 16);
      var drawDish = function (X, Y, k, a) {
        x.globalAlpha = a == null ? 1 : a; X = Math.round(X); Y = Math.round(Y);
        if (k === 0) { // burger
          x.fillStyle = "#e0a050"; x.fillRect(X - 6, Y - 9, 12, 3); x.fillRect(X - 5, Y - 10, 10, 1);
          x.fillStyle = "#7cf29a"; x.fillRect(X - 7, Y - 6, 14, 1); x.fillStyle = "#7a3b1e"; x.fillRect(X - 6, Y - 5, 12, 2);
          x.fillStyle = "#ffd34d"; x.fillRect(X - 6, Y - 6, 12, 1); x.fillStyle = "#e0a050"; x.fillRect(X - 6, Y - 3, 12, 2);
        } else if (k === 1) { // pizza slice
          for (var r = 0; r < 10; r++) { x.fillStyle = r < 2 ? "#d9913f" : "#ffcf5a"; x.fillRect(X - 6 + r * .6, Y - 11 + r, 12 - r * 1.2, 1); }
          x.fillStyle = "#e0453a"; x.fillRect(X - 2, Y - 7, 2, 2); x.fillRect(X + 1, Y - 5, 2, 2); x.fillRect(X - 1, Y - 3, 1, 1);
        } else if (k === 2) { // curry bowl with steam
          x.fillStyle = "#f2f2f2"; x.fillRect(X - 7, Y - 5, 14, 2); x.fillRect(X - 6, Y - 3, 12, 2); x.fillRect(X - 4, Y - 1, 8, 1);
          x.fillStyle = "#e07a2e"; x.fillRect(X - 6, Y - 6, 12, 1);
          for (var s3 = 0; s3 < 3; s3++) px(X - 3 + s3 * 3 + Math.sin(t * 4 + s3) , Y - 8 - ((t * 10 + s3 * 3) % 7), "#fff", .5);
        } else { // wrap
          x.fillStyle = "#e8c27a"; x.fillRect(X - 7, Y - 6, 14, 5); x.fillStyle = "#d4a95c"; x.fillRect(X - 7, Y - 6, 2, 5);
          x.fillStyle = "#7cf29a"; x.fillRect(X + 5, Y - 6, 2, 1); x.fillStyle = "#e0453a"; x.fillRect(X + 5, Y - 4, 2, 1);
        }
        x.globalAlpha = 1;
      };
      S.items.forEach(function (it) { it.x += sp * dt; if (it.x > W + 12) { it.x -= 5 * 52; it.k = Math.floor(R(0, 4)); it.gone = false; } if (!it.gone) drawDish(it.x, belt + 5, it.k); });
      // tap cursor: every ~1.6s it taps the dish under it, which arcs into the bag
      S.next -= dt; var c = S.cur;
      if (S.next <= 0) { S.next = 1.6;
        var pick = null; S.items.forEach(function (it) { if (!it.gone && Math.abs(it.x - c.x) < 18 && (!pick || Math.abs(it.x - c.x) < Math.abs(pick.x - c.x))) pick = it; });
        if (pick) { pick.gone = true; c.tap = .25; S.fly.push({ x0: pick.x, y0: belt + 5, k: pick.k, p: 0 }); } }
      if (c.tap > 0) c.tap -= dt;
      var cy = c.y + (c.tap > 0 ? 40 : 34) + Math.sin(t * 3) * 2;
      // pixel-art hand, index finger pointing down; the lowest fingertip pixel sits at (c.x, cy + 8), where the old cursor's tip was
      for (var hy = 0; hy < HAND.length; hy++) for (var hx = 0; hx < 9; hx++) { var hc = HAND_C[HAND[hy].charAt(hx)];
        if (hc) { x.fillStyle = hc; x.fillRect(Math.round(c.x) - 2 + hx, Math.round(cy) - 1 + hy, 1, 1); } }
      if (c.tap > 0) disc(c.x, belt - 2, 6 * (1 - c.tap / .25) + 2, AMB, .35 * c.tap / .25 + .1);
      S.fly = S.fly.filter(function (f) { f.p += dt * 1.4; var tx = gx + 11, ty = gy + 8, X = f.x0 + (tx - f.x0) * f.p, Y = f.y0 + (ty - f.y0) * f.p - Math.sin(f.p * Math.PI) * 30;
        if (f.p >= 1) { S.n++; disc(tx, gy - 8, 3, "#7cf29a", .9); return false; } drawDish(X, Y, f.k, 1); return true; });
      x.fillStyle = "#7cf29a"; x.globalAlpha = .9; x.font = "7px monospace"; x.textAlign = "left"; x.fillText("ORDER UP", 6, 12);
    } else if (kind === "sound") {
      var cx = W / 2, cy2 = H / 2 - 6, beat = Math.pow(Math.max(0, Math.sin(t * 5.2)), 6), lvl = .55 + .45 * Math.sin(t * 1.3) * Math.sin(t * .7);
      disc(cx, cy2, 7 + beat * 4, "#d58cff", .18); disc(cx, cy2, 4 + beat * 2, "#fff", .85);
      S.st.forEach(function (p) {
        var swell = 1 + beat * .25 * (1 - p.d / 48);
        var a = p.arm * 2.094 + p.d * .085 + p.o * (1 + p.d / 30) - t * (.35 + 4 / (p.d + 8));
        var X = cx + Math.cos(a) * p.d * 2.1 * swell, Y = cy2 + Math.sin(a) * p.d * .75 * swell;
        px(X, Y, "hsl(" + p.h + " 90% " + (60 + beat * 25) + "%)", .55 + beat * .45);
      });
      // equalizer bars along the bottom, fed by a fake spectrum
      for (var e = 0; e < S.bars.length; e++) {
        var target = (Math.abs(Math.sin(t * (2 + e * .37) + e)) * .6 + beat * (1 - e / S.bars.length)) * lvl * 16;
        S.bars[e] += (target - S.bars[e]) * Math.min(1, dt * 12);
        var bh = Math.max(1, Math.round(S.bars[e])), bxp = 3 + e * 8;
        for (var hh = 0; hh < bh; hh++) { x.globalAlpha = .35 + .5 * hh / 16; x.fillStyle = "hsl(" + (200 + hh * 8) + " 90% 65%)"; x.fillRect(bxp, H - 2 - hh, 6, 1); }
      }
    } else if (kind === "roach") {
      x.globalAlpha = 1; x.fillStyle = "#1a1612"; x.fillRect(0, 70, W, H - 70); x.fillStyle = "#2a241c"; x.fillRect(0, 70, W, 1);
      // banner
      x.fillStyle = AMB; x.globalAlpha = .9; x.font = "7px monospace"; x.textAlign = "left"; x.fillText("JAI COCKROACH", 6, 12);
      var sh = S.shoe;
      if (sh.st === 0) { sh.wait -= dt; if (sh.wait <= 0) { sh.st = 1; sh.x = R(40, W - 40); sh.y = -40; } }
      else if (sh.st === 1) { sh.y += 260 * dt; if (sh.y >= 52) { sh.y = 52; sh.st = 2; sh.hold = .5; sh.boom = .4;
          S.r.forEach(function (r) { var dx = r.x - sh.x; if (Math.abs(dx) < 40) { r.fast = 1.2; r.vx = (dx < 0 ? -1 : 1) * R(50, 80); r.vy = R(-20, 20); } }); } }
      else if (sh.st === 2) { sh.hold -= dt; if (sh.hold <= 0) sh.st = 3; }
      else { sh.y -= 120 * dt; if (sh.y < -40) { sh.st = 0; sh.wait = R(3, 5); } }
      S.r.sort(function (a, b) { return a.y - b.y; });
      S.r.forEach(function (r) {
        var sp = r.v; if (r.fast > 0) { r.fast -= dt; r.x += r.vx * dt; r.y = Math.max(34, Math.min(67, r.y + r.vy * dt)); sp = 40; } else r.x += sp * dt;
        if (r.x > W + 14) { r.x = -14; r.y = R(36, 66); } if (r.x < -16) r.x = W + 12;
        r.ph += dt * sp * .6; var X = Math.round(r.x), Y = Math.round(r.y), lg = Math.sin(r.ph) > 0 ? 1 : 0, face = r.fast > 0 && r.vx < 0 ? -1 : 1;
        x.globalAlpha = 1;
        if (r.sign && r.fast <= 0) { x.fillStyle = "#8a6a44"; x.fillRect(X, Y - 13, 1, 10); x.fillStyle = "#f2e6d0"; x.fillRect(X - 7, Y - 21, 15, 9);
          for (var gy2 = 0; gy2 < 5; gy2++) for (var gx2 = 0; gx2 < 11; gx2++) if (CJP[gy2].charAt(gx2) === "#") { x.fillStyle = "#c0392b"; x.fillRect(X - 5 + gx2, Y - 19 + gy2, 1, 1); } }
        x.fillStyle = "#2a1408";   // legs, three pairs, alternating
        for (var l = 0; l < 3; l++) { var lx = X - 3 + l * 3 + ((l + lg) % 2 ? 1 : -1); x.fillRect(lx, Y + 2, 1, 2); x.fillRect(lx + (lg ? 1 : -1), Y - 3, 1, 1); }
        x.fillStyle = "#6b3a1e"; x.fillRect(X - 4, Y - 2, 8, 4); x.fillRect(X - 3, Y - 3, 6, 1); x.fillRect(X - 3, Y + 2, 6, 1);
        x.fillStyle = "#9a5a2e"; x.fillRect(X - 2, Y - 2, 4, 1); x.fillStyle = "#3a1e0e"; x.fillRect(X - 1 * face, Y - 2, 1, 4);
        x.fillStyle = "#2a1408"; x.fillRect(X + 4 * face + (face < 0 ? -1 : 0), Y - 1, 2, 2);   // head
        var hx2 = X + (face > 0 ? 6 : -7); x.fillRect(hx2, Y - 2 - lg, 1, 1); x.fillRect(hx2 + face, Y - 3 - lg, 1, 1); x.fillRect(hx2 + 2 * face, Y - 4, 1, 1);
      });
      if (sh.st) { var SX = Math.round(sh.x), SY = Math.round(sh.y);   // the shoe
        x.globalAlpha = 1; x.fillStyle = "#3b2a6b"; x.fillRect(SX - 10, SY, 26, 10); x.fillRect(SX - 10, SY - 28, 12, 28);
        x.fillStyle = "#f2f2f2"; x.fillRect(SX - 12, SY + 10, 30, 4); x.fillStyle = "#c9c9c9"; x.fillRect(SX - 12, SY + 13, 30, 1);
        x.fillStyle = "#fff"; x.fillRect(SX - 2, SY + 2, 6, 1); x.fillRect(SX + 4, SY + 4, 6, 1); }
      if (sh.boom > 0) { sh.boom -= dt; disc(sh.x + 3, 64, 34 * (1 - sh.boom / .4) + 4, AMB, .3 * sh.boom / .4);
        x.globalAlpha = sh.boom / .4; x.fillStyle = "#fff"; x.font = "8px monospace"; x.textAlign = "center"; x.fillText("STOMP!", sh.x + 3, 26); }
    } else if (kind === "marbles") {
      // Marbles follow a fixed zig-zag track (ramp, drop, ramp back, drop, ...) so they can never get stuck.
      var P = S.path;
      x.globalAlpha = .9; x.fillStyle = SKY;
      for (var k = 0; k < P.length - 1; k++) { var A = P[k], B = P[k + 1], L = Math.abs(B[0] - A[0]); if (L < Math.abs(B[1] - A[1])) continue;   // ramps only
        for (var q = 0; q <= L; q++) x.fillRect(Math.round(A[0] + (B[0] - A[0]) * q / L), Math.round(A[1] + (B[1] - A[1]) * q / L) + 4, 1, 2); }
      x.fillStyle = AMB; x.fillRect(P[0][0] - 6, P[0][1] - 6, 12, 2);           // start funnel
      S.ms.forEach(function (b) {
        b.v = Math.min(b.v + 40 * dt, 90); b.s += b.v * dt;
        if (b.s > S.len) { b.s -= S.len; b.v = 15; }
        var d = b.s, X = P[0][0], Y = P[0][1];
        for (var k = 1; k < P.length; k++) { var sl = S.seg[k - 1]; if (d <= sl) { var f = d / sl; X = P[k - 1][0] + (P[k][0] - P[k - 1][0]) * f; Y = P[k - 1][1] + (P[k][1] - P[k - 1][1]) * f; break; } d -= sl; }
        disc(X, Y, b.r, b.c); px(X - b.r * .4, Y - b.r * .4, "#fff", 1);
      });
    } else if (kind === "life") {
      S.acc += dt; if (S.acc > .18) { S.acc = 0; var n = S.g.slice(), cw = S.cw, ch = S.ch;
        for (var yy2 = 0; yy2 < ch; yy2++) for (var xx2 = 0; xx2 < cw; xx2++) { var c = 0;
          for (var oy = -1; oy <= 1; oy++) for (var ox = -1; ox <= 1; ox++) if (ox || oy) c += S.g[((yy2 + oy + ch) % ch) * cw + (xx2 + ox + cw) % cw];
          var i2 = yy2 * cw + xx2; n[i2] = c === 3 || (c === 2 && S.g[i2]) ? 1 : 0; if (Math.random() < .002) n[i2] = 1; }
        S.g = n; }
      for (var i3 = 0; i3 < S.g.length; i3++) if (S.g[i3]) { x.globalAlpha = .85; x.fillStyle = (i3 % 7) ? "#7cf29a" : AMB; x.fillRect((i3 % S.cw) * 4, Math.floor(i3 / S.cw) * 4, 3, 3); }
    }
    x.globalAlpha = 1;
  }
  var last = 0, vis = true, raf = 0;
  function loop(ts) { raf = 0; var dt = Math.min((ts - last) / 1000, .05); last = ts; frame(dt); if (vis && !reduce && !document.hidden) raf = requestAnimationFrame(loop); }
  function go() { if (!raf && vis && !reduce && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } }
  frame(0);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; go(); }).observe(cv);
  document.addEventListener("visibilitychange", go); go();
})();
