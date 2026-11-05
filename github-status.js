const OWNER = "Senvor";
const TTL = 60 * 60 * 1000; // cache each repo for an hour (GitHub's unauthenticated API allows ~60 requests/hour per IP)

async function getRepo(repo) {
  const key = `gh:${repo}`;
  try {
    const cached = JSON.parse(localStorage.getItem(key));
    if (cached && Date.now() - cached.t < TTL) return cached.data;
  } catch {}

  const res = await fetch(`https://api.github.com/repos/${OWNER}/${repo}`);
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const r = await res.json();
  const data = { pushed: r.pushed_at, stars: r.stargazers_count };

  try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), data })); } catch {}
  return data;
}

function timeAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso)) / 864e5);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months} mo ago` : `${Math.floor(months / 12)} y ago`;
}

document.querySelectorAll("[data-repo]").forEach(async (el) => {
  try {
    const d = await getRepo(el.dataset.repo);
    el.textContent = `Last pushed ${timeAgo(d.pushed)}` + (d.stars ? ` · ★ ${d.stars}` : "");
  } catch { /* leave blank; the page works fine without it */ }
});
