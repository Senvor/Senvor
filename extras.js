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
  document.getElementById("project-count").textContent =
    `${list.length} projects · ` +
    Object.entries(by).map(([s, n]) => `${n} ${s}`).join(" · ");
} catch { /* leave empty */ }
