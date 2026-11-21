// node shorts.mjs → refreshes the Shorts cards in index.html from the public YouTube feed.
// No dependencies. Run by .github/workflows/shorts.yml every morning, or by hand.
// The feed only lists PUBLIC videos, so scheduled/private Shorts appear on their own once they go live.
import { readFile, writeFile } from "node:fs/promises";

const CHANNEL = "UCaQzelpWcPXXLbv-npgoQxA";
const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL}`;
const MAX = 8;
// Shorts that aren't "CS explained" (e.g. Fiverr promos) and shouldn't show here.
const SKIP = new Set(["yGfekHeYX8M"]);

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const unxml = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&amp;/g, "&");

const res = await fetch(FEED);
if (!res.ok) { console.error(`Feed answered ${res.status}; leaving index.html alone.`); process.exit(0); }
const xml = await res.text();

const shorts = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
  id: e.match(/<yt:videoId>([^<]+)/)?.[1],
  title: unxml(e.match(/<title>([^<]*)/)?.[1] ?? ""),
  link: e.match(/<link rel="alternate" href="([^"]+)"/)?.[1] ?? "",
  date: e.match(/<published>([^<]+)/)?.[1] ?? "",
}))
  .filter((v) => v.id && !SKIP.has(v.id) && (/\/shorts\//.test(v.link) || /#shorts/i.test(v.title)))
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, MAX);

if (!shorts.length) { console.error("No Shorts in the feed; leaving index.html alone."); process.exit(0); }

const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const clean = (t) => t.replace(/\s*#\w+/g, "").trim();

const cards = shorts.map((v) =>
  `      <a class="short" href="https://youtube.com/shorts/${v.id}">` +
  `<span class="sthumb"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" width="480" height="360" loading="lazy" decoding="async"><i aria-hidden="true">▶</i></span>` +
  `<b>${esc(clean(v.title))}</b><small>${fmt(v.date)}</small></a>`).join("\n");

const START = "<!-- shorts:start -->", END = "<!-- shorts:end -->";
const html = await readFile("index.html", "utf8");
const a = html.indexOf(START), b = html.indexOf(END);
if (a < 0 || b < a) throw new Error("Shorts markers not found in index.html");
const out = html.slice(0, a + START.length) + "\n" + cards + "\n      " + html.slice(b);
if (out === html) { console.log(`Shorts already up to date (${shorts.length}).`); process.exit(0); }
await writeFile("index.html", out);
console.log(`Updated Shorts: ${shorts.length} videos.`);
