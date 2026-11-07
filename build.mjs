import { readFile, writeFile, mkdir } from "node:fs/promises";

const SITE = "https://senvor.dev";
const FIVERR = "https://www.fiverr.com/senvor/build-a-responsive-website-for-your-business-or-portfolio";
const projects = JSON.parse(await readFile("projects.json", "utf8"));
const template = await readFile("project.template.html", "utf8");

// Escape text so a stray < or " can't break the HTML.
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
           .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const has = (v) => v && v.trim() && v.trim() !== "TODO";

projects.forEach((p, i) => {
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const actions = [
    p.live && `<a class="primary" href="${esc(p.live)}">Open live site ↗</a>`,
    `<a ${p.live ? "" : 'class="primary" '}href="https://github.com/Senvor/${esc(p.repo)}">View repository ↗</a>`,
  ].filter(Boolean).join("");
  const values = {
    title: esc(p.title),
    tagline: esc(p.tagline),
    category: esc(p.category ?? "Project"),
    // Done projects carry no status tag.
    statusPill: p.status ? `<span class="pill">${esc(p.status)}</span>` : "",
    repo: esc(p.repo),
    url: `${SITE}/projects/${p.slug}/`,
    ogImage: SITE + (p.image ?? p.og ?? "/assets/og.jpg"),
    actions,
    hero: p.image
      ? `<figure class="pj-hero"><img src="${esc(p.image)}" alt="${esc(p.title)}"></figure>`
      : `<div class="pj-hero blank" aria-hidden="true"><span>${esc(p.title)}</span></div>`,
    sections: [["What I built", p.built], ["Where I got stuck", p.stuck], ["What I learned", p.learned]]
      .filter(([, v]) => has(v))
      .map(([h, v]) => `<section><h2>${h}</h2><p>${esc(v)}</p></section>`).join("\n      "),
    gallery: p.gallery?.length
      ? `<section><h2>Gallery</h2><div class="pj-gallery">` +
        p.gallery.map(([src, cap]) => `<figure><img src="${esc(src)}" alt="${esc(cap)}" loading="lazy"><figcaption>${esc(cap)}</figcaption></figure>`).join("") +
        `</div></section>`
      : "",
    stackBlock: p.stack.length
      ? `<dl><dt>Built with</dt><dd><ul class="chips">${p.stack.map((s) => `<li class="solid">${esc(s)}</li>`).join("")}</ul></dd></dl>`
      : "",
    hire: p.category === "Web"
      ? `<div class="pj-hire"><p>Want a fast, responsive site like this for your business?</p><a href="${FIVERR}">Hire me on Fiverr ↗</a></div>`
      : "",
    prevNext:
      `<a href="/projects/${prev.slug}/"><small>← Previous</small><b>${esc(prev.title)}</b></a>` +
      `<a class="next" href="/projects/${next.slug}/"><small>Next →</small><b>${esc(next.title)}</b></a>`,
  };

  let html = template;
  for (const [key, val] of Object.entries(values)) {
    // Function replacer on purpose: a plain string would treat "$&" or "$1" in the text as special patterns.
    html = html.replaceAll(`{{${key}}}`, () => val);
  }
  return mkdir(`projects/${p.slug}`, { recursive: true })
    .then(() => writeFile(`projects/${p.slug}/index.html`, html));
});

// Sitemap for search engines.
const urls = [`${SITE}/`, ...projects.map((p) => `${SITE}/projects/${p.slug}/`)];
await writeFile("sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") + `\n</urlset>\n`);
console.log(`Built ${projects.length} project pages + sitemap.xml`);
