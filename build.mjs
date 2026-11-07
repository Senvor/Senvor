import { readFile, writeFile, mkdir } from "node:fs/promises";

const SITE = "https://senvor.dev";
const projects = JSON.parse(await readFile("projects.json", "utf8"));
const template = await readFile("project.template.html", "utf8");

// Escape text so a stray < or " can't break the HTML.
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
           .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

for (const p of projects) {
  const values = {
    title: esc(p.title),
    tagline: esc(p.tagline),
    status: esc(p.status),
    repo: esc(p.repo),
    // Only show sections that have real text (skip empty or TODO).
    sections: [["What I built", p.built], ["Where I got stuck", p.stuck], ["What I learned", p.learned]]
      .filter(([, v]) => v && v.trim() && v.trim() !== "TODO")
      .map(([h, v]) => `<h2>${h}</h2><p>${esc(v)}</p>`).join("\n    "),
    url: `${SITE}/projects/${p.slug}/`,
    ogImage: SITE + (p.og ?? "/assets/og.jpg"),
    imageTag: p.image
      ? `<img class="shot" src="${esc(p.image)}" alt="${esc(p.title)}">`
      : "",
    stack: p.stack.map((s) => `<li class="solid">${esc(s)}</li>`).join(""),
  };

  let html = template;
  for (const [key, val] of Object.entries(values)) {
    // Function replacer on purpose: a plain string would treat "$&" or "$1" in the text as special patterns.
    html = html.replaceAll(`{{${key}}}`, () => val);
  }

  await mkdir(`projects/${p.slug}`, { recursive: true });
  await writeFile(`projects/${p.slug}/index.html`, html);
}
// Sitemap for search engines.
const urls = [`${SITE}/`, ...projects.map((p) => `${SITE}/projects/${p.slug}/`)];
await writeFile("sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") + `\n</urlset>\n`);
console.log(`Built ${projects.length} project pages + sitemap.xml`);
