#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const OUTPUT = path.join(ROOT, "public", "image-sitemap.xml");
const SITE_URL = "https://femseha.com";
const sources = [
  "articles.json",
  "seo-supporting-articles.json",
  ...Array.from({ length: 11 }, (_, i) => `seo-content-batch-${String(i + 1).padStart(2, "0")}.json`)
];
const dedicatedImages = {
  "ijhad-dawai-fi-al-saudia": "/images/seo/medical-abortion-saudi-safety-guide.svg",
  "adwiyat-ijhad-alhaml-fi-al-saudia": "/images/seo/abortion-medicines-saudi-medical-guide.svg",
  "danger-signs-after-medical-abortion-saudi": "/images/seo/danger-signs-medical-abortion-saudi.svg",
  "bleeding-after-medical-abortion-saudi": "/images/seo/bleeding-after-medical-abortion-guide.svg",
  "ectopic-pregnancy-abortion-medicines-saudi": "/images/seo/ectopic-pregnancy-abortion-medicines-guide.svg",
  "pregnancy-danger-signs-emergency": "/images/seo/pregnancy-danger-signs-saudi-guide.svg",
  "home-pregnancy-test-accuracy": "/images/seo/home-pregnancy-test-guide.svg",
  "early-pregnancy-symptoms-guide": "/images/seo/early-pregnancy-symptoms-guide.svg",
  "delayed-period-causes-besides-pregnancy": "/images/seo/delayed-period-causes-guide.svg"
};
const esc = (s) => String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&apos;");
const safeSlug = (slug) => String(slug).toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,100);
const articles = [];
for (const file of sources) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) continue;
  for (const article of JSON.parse(fs.readFileSync(p,"utf8"))) {
    if (article?.slug && !articles.some(x => x.slug === article.slug)) articles.push(article);
  }
}
const entries = [
  { page: "/cytotec-saudi-arabia", image: "/images/seo/cytotec-saudi-arabia-misoprostol-medical-guide.svg" },
  ...articles.map(a => ({
    page: `/articles/${a.slug}`,
    image: dedicatedImages[a.slug] || `/images/seo/articles/${safeSlug(a.slug)}.svg`
  }))
];
const blocks = [];
const seen = new Set();
for (const entry of entries) {
  const pageUrl = new URL(entry.page, SITE_URL).href;
  const imageUrl = new URL(entry.image, SITE_URL).href;
  const key = pageUrl + "|" + imageUrl;
  if (seen.has(key)) continue;
  seen.add(key);
  const local = path.join(ROOT, "public", entry.image.replace(/^\//, ""));
  if (!fs.existsSync(local)) throw new Error(`Image sitemap asset missing: ${local}`);
  blocks.push(`  <url>\n    <loc>${esc(pageUrl)}</loc>\n    <image:image>\n      <image:loc>${esc(imageUrl)}</image:loc>\n    </image:image>\n  </url>`);
}
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${blocks.join("\n")}\n</urlset>\n`;
fs.writeFileSync(OUTPUT, xml, "utf8");
console.log(`Image sitemap generated: ${blocks.length} image-page mappings.`);
