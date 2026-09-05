#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSitemapXml, STATIC_INDEXABLE, FORBIDDEN_PATHS, readSiteUrl, loadArticles } from "./generate-sitemap.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const exists = (p) => fs.existsSync(path.join(ROOT, p));
let errors = 0;
let warnings = 0;
const err = (m) => { errors++; console.error(`  ✖ ${m}`); };
const warn = (m) => { warnings++; console.warn(`  ⚠ ${m}`); };
const ok = (m) => console.log(`  ✔ ${m}`);
const section = (t) => console.log(`\n── ${t} ${"─".repeat(Math.max(4, 62 - t.length))}`);
const SITE_URL = readSiteUrl();
const STATIC_PATHS = STATIC_INDEXABLE.map((s) => s.path);

section("Sitemap: البناء والملف الملتزم به");
const pkg = JSON.parse(read("package.json"));
if (!/(node\s+scripts\/generate-sitemap\.mjs|npm\s+run\s+sitemap)\s*&&\s*vite\s+build/.test(pkg.scripts?.build || "")) err("package.json: build لا يولد sitemap قبل vite build"); else ok("npm run build يولّد sitemap قبل vite build");
if (pkg.scripts?.sitemap !== "node scripts/generate-sitemap.mjs") err("package.json: sitemap script غير صحيح");
const articles = loadArticles();
const articleRoutes = articles.map((a) => `/articles/${a.slug}`);
const indexableRoutes = [...STATIC_PATHS, ...articleRoutes];
const expectedXml = buildSitemapXml(articles, SITE_URL);
const committedXml = read("public/sitemap.xml");
if (committedXml === expectedXml) ok(`public/sitemap.xml متزامن مع المصدر (${indexableRoutes.length} URL)`); else err("public/sitemap.xml غير متزامن مع مولد sitemap");

section("قواعد sitemap");
const locs = [...committedXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const locSet = new Set(locs);
if (locs.length !== locSet.size) err("sitemap: URLs مكررة");
const expectedUrls = new Set(indexableRoutes.map((r) => r === "/" ? `${SITE_URL}/` : `${SITE_URL}${r}`));
for (const u of expectedUrls) if (!locSet.has(u)) err(`sitemap: URL مفقود: ${u}`);
for (const u of locSet) if (!expectedUrls.has(u)) err(`sitemap: URL غير معروف: ${u}`);
for (const u of locs) {
  let url;
  try { url = new URL(u); } catch { err(`sitemap: URL غير صالح: ${u}`); continue; }
  if (url.origin !== SITE_URL) err(`sitemap: origin غير صحيح: ${u}`);
  const p = url.pathname;
  for (const bad of FORBIDDEN_PATHS) if (p === bad || p.startsWith(`${bad}/`)) err(`sitemap: مسار محجوب: ${u}`);
  if (/(^|\/)(?:test|staging|stag|demo|tmp|dead|copy)(?:\/|$)/i.test(p)) err(`sitemap: مسار اختباري/ميت: ${u}`);
  if (url.search || url.hash) err(`sitemap: URL يحتوي query/hash: ${u}`);
  if (!STATIC_PATHS.includes(p === "/" ? "/" : p.replace(/\/$/, "")) && !p.startsWith("/articles/")) err(`sitemap: مسار خارج جدول الفهرسة: ${u}`);
}
for (const a of articles) {
  const expected = a.modifiedDate || a.publishDate;
  const re = new RegExp(`<loc>${SITE_URL}/articles/${a.slug}</loc>\\s*<lastmod>([^<]+)</lastmod>`);
  const m = committedXml.match(re);
  if (!m) err(`sitemap: lastmod مفقود/مقال مفقود: ${a.slug}`);
  else if (m[1] !== expected) err(`sitemap: lastmod غير صحيح لـ ${a.slug}: ${m[1]} ≠ ${expected}`);
}
if (!errors) ok(`sitemap نظيف: ${locs.length} URL`);

section("App routes");
const appSrc = read("src/App.tsx");
const declared = [...appSrc.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
for (const r of ["/", "/articles", "/articles/:slug", "/doctor", "/consultation", "/medical-disclaimer", "/admin", "*"]) if (!declared.includes(r)) err(`App.tsx: route مفقود: ${r}`);
if (!errors) ok(`App.tsx routes سليمة (${declared.length})`);

section("robots.txt");
const robots = read("public/robots.txt");
for (const rule of ["Allow: /", "Disallow: /admin", "Disallow: /search", `Sitemap: ${SITE_URL}/sitemap.xml`]) if (!robots.split("\n").some((l) => l.trim() === rule)) err(`robots: قاعدة مفقودة: ${rule}`);
for (const u of locs) {
  const p = new URL(u).pathname;
  for (const line of robots.split("\n")) {
    const m = line.trim().match(/^Disallow:\s*(\S+)$/);
    if (m && p !== "/" && (p === m[1] || p.startsWith(`${m[1]}/`))) err(`robots/sitemap تعارض: ${p}`);
  }
}
if (!errors) ok("robots.txt متسق مع sitemap");

section("canonical/noindex");
const indexHtml = read("index.html");
if (!indexHtml.includes(`<link rel="canonical" href="${SITE_URL}/"`)) err("index.html: canonical مفقود أو غير صحيح");
const pageFiles = {
  "/": "src/pages/HomePage.tsx",
  "/articles": "src/pages/ArticlesPage.tsx",
  "/doctor": "src/pages/DoctorPage.tsx",
  "/consultation": "src/pages/ConsultationPage.tsx",
  "/medical-disclaimer": "src/pages/DisclaimerPage.tsx"
};
for (const [route, file] of Object.entries(pageFiles)) {
  if (!exists(file)) { err(`صفحة مفقودة: ${file}`); continue; }
  const src = read(file);
  const m = src.match(/canonicalPath:\s*['"`]([^'"`]+)['"`]/);
  if (!m) err(`${file}: canonicalPath مفقود`); else if (m[1] !== route) err(`${file}: canonicalPath ${m[1]} بدل ${route}`);
}
const articleView = read("src/pages/ArticleView.tsx");
if (!/canonicalPath:\s*article\s*\?\s*`\/articles\/\$\{article\.slug\}`/.test(articleView)) err("ArticleView: canonical المقال غير ذاتي");
const admin = read("src/pages/AdminPage.tsx");
const notFound = read("src/pages/NotFoundPage.tsx");
if (!/robots:\s*['"`]noindex,\s*nofollow['"`]/.test(admin)) err("AdminPage: noindex,nofollow مفقود");
if (!/robots:\s*['"`]noindex,\s*follow['"`]/.test(notFound) || !/noCanonical:\s*true/.test(notFound)) err("NotFoundPage: noindex/noCanonical غير مكتمل");
if (!errors) ok("canonical/noindex سليمة");

section("الروابط الداخلية وYMYL");
const articleText = articles.map((a) => a.content || "").join("\n");
const knownPaths = new Set(indexableRoutes);
for (const match of articleText.matchAll(/\]\((\/[^)\s#?]+)(?:[?#][^)]*)?\)/g)) if (!knownPaths.has(match[1])) err(`رابط داخلي مكسور: ${match[1]}`);
for (const term of ["اطلب الآن", "للطلب والشراء", "متوفر للبيع", "سعر الحبوب", "التوصيل السري"]) if (articleText.includes(term)) err(`YMYL: عبارة تجارية ممنوعة: ${term}`);
if (/\b\d+(?:\.\d+)?\s*(?:mg|mcg|ملغ|ميكروغرام)\b/i.test(articleText)) warn("YMYL: توجد إشارة دوائية رقمية؛ راجعها بشرياً");
if (!errors) ok(`الروابط الداخلية سليمة (${articles.length} مقالة)`);

section("النتيجة");
console.log(`articles=${articles.length}, sitemap=${locs.length}, errors=${errors}, warnings=${warnings}`);
if (errors) { console.error("✖ Indexing Audit FAILED"); process.exit(1); }
console.log("✔ Indexing Audit PASSED");
