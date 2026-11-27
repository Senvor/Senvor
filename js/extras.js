// Scroll-reveal. threshold 0 + bottom margin, because a tall section can never be 15% visible on a phone.
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add("is-visible");
      io.unobserve(e.target);
    }
  }
}, { threshold: 0, rootMargin: "0px 0px -10% 0px" });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Project count, read from projects.json
try {
  const list = await (await fetch("projects.json")).json();
  const by = {};
  for (const p of list) by[p.status] = (by[p.status] || 0) + 1;
  // Non-breaking spaces keep each stat on one line ("4 in progress"), so a narrow screen only wraps between stats.
  const nb = (t) => t.replace(/ /g, "\u00a0");
  document.getElementById("project-count").textContent =
    [`${list.length} projects`, ...Object.entries(by).map(([s, n]) => `${n} ${s || "live"}`)].map(nb).join(" · ");
} catch { /* leave empty */ }

// Back-to-top button: appears after scrolling down a screen or so.
const topBtn = document.createElement("button");
topBtn.type = "button";
topBtn.className = "to-top";
topBtn.setAttribute("aria-label", "Back to top");
topBtn.textContent = "↑";
topBtn.hidden = true;
document.body.appendChild(topBtn);
const toggleTop = () => { topBtn.hidden = window.scrollY < 800; };
addEventListener("scroll", toggleTop, { passive: true });
toggleTop();
topBtn.addEventListener("click", () => {
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
});
