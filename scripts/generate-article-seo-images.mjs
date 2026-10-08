#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const OUTPUT_DIR = path.join(ROOT, "public", "images", "seo", "articles");
const SITE_URL = "https://femseha.com";

const sources = [
  "articles.json",
  "seo-supporting-articles.json",
  ...Array.from({ length: 11 }, (_, i) => `seo-content-batch-${String(i + 1).padStart(2, "0")}.json`)
];

const dedicated = new Set([
  "ijhad-dawai-fi-al-saudia",
  "adwiyat-ijhad-alhaml-fi-al-saudia",
  "danger-signs-after-medical-abortion-saudi",
  "bleeding-after-medical-abortion-saudi",
  "ectopic-pregnancy-abortion-medicines-saudi",
  "pregnancy-danger-signs-emergency",
  "home-pregnancy-test-accuracy",
  "early-pregnancy-symptoms-guide",
  "delayed-period-causes-besides-pregnancy"
]);

const esc = (s) => String(s ?? "")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&apos;");

const safeSlug = (slug) => String(slug || "")
  .toLowerCase()
  .replace(/[^a-z0-9-]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 100);

const shortText = (title) => String(title || "دليل طبي")
  .replace(/[|:،؛—–]/g, " ")
  .trim()
  .slice(0, 62);

const articles = [];
for (const file of sources) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) continue;
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const article of data) {
    if (!article?.slug || !article?.title) continue;
    if (!articles.some((x) => x.slug === article.slug)) articles.push(article);
  }
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
let generated = 0;

for (const article of articles) {
  if (dedicated.has(article.slug)) continue;
  const filename = safeSlug(article.slug) + ".svg";
  const out = path.join(OUTPUT_DIR, filename);
  const title = shortText(article.title);
  const keyword = shortText(article.primaryKeyword || article.title);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">دليل طبي تثقيفي من FemSeha حول ${esc(keyword)}</desc>
<rect width="1200" height="675" rx="40" fill="#f8fafc"/>
<rect x="55" y="55" width="1090" height="565" rx="34" fill="#ffffff" stroke="#dbeafe" stroke-width="3"/>
<circle cx="185" cy="195" r="88" fill="#e0f2fe"/>
<path d="M135 255c20-52 52-78 75-78s55 26 75 78" fill="none" stroke="#0284c7" stroke-width="16" stroke-linecap="round"/>
<circle cx="210" cy="165" r="25" fill="#0284c7"/>
<path d="M140 325h140" stroke="#93c5fd" stroke-width="10" stroke-linecap="round"/>
<text x="1060" y="210" text-anchor="end" direction="rtl" unicode-bidi="plaintext" font-family="Noto Sans Arabic,Arial,sans-serif" font-size="42" font-weight="700" fill="#0f172a">${esc(title)}</text>
<text x="1060" y="285" text-anchor="end" direction="rtl" unicode-bidi="plaintext" font-family="Noto Sans Arabic,Arial,sans-serif" font-size="30" fill="#334155">${esc(keyword)}</text>
<rect x="470" y="365" width="590" height="125" rx="28" fill="#eff6ff"/>
<text x="765" y="420" text-anchor="middle" direction="rtl" unicode-bidi="plaintext" font-family="Noto Sans Arabic,Arial,sans-serif" font-size="27" font-weight="600" fill="#1e3a8a">دليل تثقيفي طبي</text>
<text x="765" y="462" text-anchor="middle" direction="rtl" unicode-bidi="plaintext" font-family="Noto Sans Arabic,Arial,sans-serif" font-size="21" fill="#475569">معلومات موثوقة، سلامة، ومتى تحتاجين إلى تقييم طبي</text>
<text x="1060" y="565" text-anchor="end" direction="rtl" unicode-bidi="plaintext" font-family="Noto Sans Arabic,Arial,sans-serif" font-size="22" fill="#64748b">FemSeha | فيم صحة</text>
</svg>
`;
  fs.writeFileSync(out, xml, "utf8");
  generated++;
}

console.log(`Generated ${generated} article SEO images from ${articles.length} unique articles.`);
