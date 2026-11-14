import { readFile, writeFile, mkdir } from "node:fs/promises";

const SITE = "https://senvor.dev";
const FIVERR = "https://www.fiverr.com/senvor/build-a-responsive-website-for-your-business-or-portfolio";
const projects = JSON.parse(await readFile("projects.json", "utf8"));
const template = await readFile("project.template.html", "utf8");

// Escape text so a stray < or " can't break the HTML.
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Which animated pixel hero a project without a photo gets.
// Per-slug overrides first, so Tapdish keeps its food art and Sound Galaxy its sound art.
const ART_BY_SLUG = { "pocket-gravity-lab": "orbit", marbew: "marbles", tapdish: "food", "sound-galaxy": "sound", "cockroach-janta-party": "roach" };
const art = (p) => ART_BY_SLUG[p.slug]
  ?? (p.category === "Web" ? "particles" : p.category === "Game" ? "life" : "pcb");
// Projects that keep their photo for cards but get an animated hero on their page.
const ANIM_HERO = new Set(["cockroach-janta-party"]);
const has = (v) => v && v.trim() && v.trim() !== "TODO";

await Promise.all(projects.map((p, i) => {
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const actions = [
    p.live && `<a class="primary" href="${esc(p.live)}">Open live site ↗</a>`,
    `<a ${p.live ? "" : 'class="primary" '}href="https://github.com/Senvor/${esc(p.repo)}">View repository ↗</a>`,
  ].filter(Boolean).join("");
  const secs = [["What I built", p.built], ["Where I got stuck", p.stuck], ["What I learned", p.learned]].filter(([, v]) => has(v));
  const n = secs.length;
  const values = {
    title: esc(p.title),
    tagline: esc(p.tagline),
    category: esc(p.category ?? "Project"),
    // Done projects carry no status tag.
    statusPill: p.status ? `<span class="pill">${esc(p.status)}</span>` : "",
    repo: esc(p.repo),
    url: `${SITE}/projects/${p.slug}/`,
    ogImage: SITE + (p.og ?? p.image ?? "/assets/og.jpg"),
    actions,
    hero: p.image && !ANIM_HERO.has(p.slug)
      ? `<figure class="pj-hero"><img src="${esc(p.image)}" alt="${esc(p.title)}" data-zoom></figure>`
      : `<div class="pj-hero art" data-art="${art(p)}" aria-hidden="true"><canvas width="240" height="100"></canvas><span>${esc(p.title)}</span></div>`,
    statusText: esc(p.status ? p.status[0].toUpperCase() + p.status.slice(1) : "Shipped"),
    toolCount: p.stack.length ? String(p.stack.length) : "—",
    demo: p.live
      ? `<section class="pj-demo"><h2><i>${String(n + 1).padStart(2, "0")}</i>Try it live</h2>` +
        `<div class="pj-frame" data-src="${esc(p.live)}"><button type="button">▶ Load the live demo</button><small>Runs ${esc(p.live.replace("https://", ""))} right here${p.slug === "sound-galaxy" ? ". Click inside it to turn on your mic" : ""}.</small></div></section>`
      : "",
    more: (() => {
      const same = projects.filter((q) => q.slug !== p.slug && q.category === p.category);
      const pool = [...same, ...projects.filter((q) => q.slug !== p.slug && q.category !== p.category)].slice(0, 3);
      return `<section class="pj-more"><h2>More ${same.length ? esc(p.category.toLowerCase()) + " " : ""}projects</h2><div class="pj-cards">` +
        pool.map((q) => `<a href="/projects/${q.slug}/">` +
          (q.image ? `<img src="${esc(q.image)}" alt="" loading="lazy">` : `<span class="tile">${esc(q.title)}</span>`) +
          `<b>${esc(q.title)}</b><small>${esc(q.tagline)}</small></a>`).join("") + `</div></section>`;
    })(),
    sections: secs.map(([h, v], k) => `<section><h2><i>${String(k + 1).padStart(2, "0")}</i>${h}</h2><p>${esc(v)}</p></section>`).join("\n      "),
    gallery: p.gallery?.length
      ? `<section><h2>Gallery</h2><div class="pj-gallery">` +
        p.gallery.map(([src, cap]) => `<figure><img src="${esc(src)}" alt="${esc(cap)}" loading="lazy" data-zoom><figcaption>${esc(cap)}</figcaption></figure>`).join("") +
        `</div></section>`
      : "",
    stackBlock: p.stack.length
      ? `<dl><dt>Built with</dt><dd><ul class="chips">${p.stack.map((s) => `<li class="solid">${esc(s)}</li>`).join("")}</ul></dd></dl>`
      : "",
    hire: p.category === "Web"
      ? `<div class="pj-hire"><p>Want a fast, responsive site like this for your business?</p><a href="${FIVERR}">Hire me on Fiverr ↗</a></div>`
      : "",
    prevNext:
      `<a rel="prev" href="/projects/${prev.slug}/"><small>← Previous</small><b>${esc(prev.title)}</b></a>` +
      `<a class="next" rel="next" href="/projects/${next.slug}/"><small>Next →</small><b>${esc(next.title)}</b></a>`,
  };

  let html = template;
  for (const [key, val] of Object.entries(values)) {
    // Function replacer on purpose: a plain string would treat "$&" or "$1" in the text as special patterns.
    html = html.replaceAll(`{{${key}}}`, () => val);
  }
  // Empty placeholders leave whitespace-only lines; tidy them so the output has no trailing spaces.
  html = html.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n");
  return mkdir(`projects/${p.slug}`, { recursive: true })
    .then(() => writeFile(`projects/${p.slug}/index.html`, html));
}));

// Sitemap for search engines.
const urls = [`${SITE}/`, ...projects.map((p) => `${SITE}/projects/${p.slug}/`)];
await writeFile("sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") + `\n</urlset>\n`);
console.log(`Built ${projects.length} project pages + sitemap.xml`);
