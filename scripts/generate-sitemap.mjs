#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * مولّد Sitemap الديناميكي — منصة FemSeha | فيم صحة
 * ═══════════════════════════════════════════════════════════════════════════
 * مصدر الحقيقة للمقالات: src/data/articles.json + المحتوى الداعم المركّز
 * في src/data/seo-supporting-articles.json + جدول المسارات الثابتة أدناه.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARTICLES_PATH = path.join(ROOT, "src", "data", "articles.json");
const SUPPORTING_ARTICLES_PATH = path.join(ROOT, "src", "data", "seo-supporting-articles.json");
const SITE_TS_PATH = path.join(ROOT, "src", "data", "site.ts");
const SITEMAP_PATH = path.join(ROOT, "public", "sitemap.xml");

export function readSiteUrl() {
  const src = fs.readFileSync(SITE_TS_PATH, "utf8");
  const m = src.match(/url:\s*"(https?:\/\/[^"\s]+)"/);
  if (!m) throw new Error("site.ts: لم يُعثر على SITE.url — لا يمكن توليد sitemap بعنوان غير معروف");
  return m[1].replace(/\/+$/, "");
}

export const STATIC_INDEXABLE = [
  { path: "/", priority: "1.0", changefreq: "daily", lastmod: "content" },
  { path: "/articles", priority: "0.9", changefreq: "daily", lastmod: "content" },
  { path: "/doctor", priority: "0.8", changefreq: "monthly", lastmod: false },
  { path: "/consultation", priority: "0.8", changefreq: "monthly", lastmod: false },
  { path: "/medical-disclaimer", priority: "0.4", changefreq: "yearly", lastmod: false }
];

export const FORBIDDEN_PATHS = ["/admin", "/search"];

const isIsoDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "") && !Number.isNaN(Date.parse(s));
const escapeXml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

function validateArticles(articles, sourceLabel) {
  if (!Array.isArray(articles)) throw new Error(`${sourceLabel}: ليس مصفوفة`);
  for (const a of articles) {
    const label = a.slug || a.id || "(بدون slug)";
    if (!a.slug || !/^[a-z0-9-]+$/.test(a.slug)) throw new Error(`${label}: slug مفقود أو بصيغة غير صالحة`);
    if (!isIsoDate(a.publishDate)) throw new Error(`${label}: publishDate غير صالح (${a.publishDate})`);
    if (a.modifiedDate !== undefined) {
      if (!isIsoDate(a.modifiedDate)) throw new Error(`${label}: modifiedDate غير صالح (${a.modifiedDate})`);
      if (a.modifiedDate < a.publishDate) throw new Error(`${label}: modifiedDate يسبق publishDate`);
    }
  }
}

/** تحميل جميع المقالات التي تظهر فعلياً في الموقع العام. */
export function loadArticles() {
  const primary = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf8"));
  const supporting = JSON.parse(fs.readFileSync(SUPPORTING_ARTICLES_PATH, "utf8"));
  validateArticles(primary, "articles.json");
  validateArticles(supporting, "seo-supporting-articles.json");

  const articles = [...primary, ...supporting];
  const seen = new Map();
  for (const a of articles) {
    const label = a.slug || a.id || "(بدون slug)";
    if (seen.has(a.slug)) throw new Error(`slug مكرر: ${a.slug} (موجود سابقاً في ${seen.get(a.slug)})`);
    seen.set(a.slug, label);
  }
  return articles;
}

function latestContentDate(articles) {
  return articles.reduce(
    (max, a) => (a.modifiedDate || a.publishDate) > max ? (a.modifiedDate || a.publishDate) : max,
    articles[0] ? articles[0].publishDate : ""
  );
}

function urlBlock({ loc, lastmod, changefreq, priority }) {
  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    ...(lastmod ? [`    <lastmod>${escapeXml(lastmod)}</lastmod>`] : []),
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>"
  ].join("\n");
}

export function buildSitemapXml(articles, siteUrl = readSiteUrl()) {
  const contentDate = latestContentDate(articles);
  const blocks = [
    ...STATIC_INDEXABLE.map((s) =>
      urlBlock({
        loc: s.path === "/" ? `${siteUrl}/` : `${siteUrl}${s.path}`,
        lastmod: s.lastmod === "content" ? contentDate : false,
        changefreq: s.changefreq,
        priority: s.priority
      })
    ),
    ...articles.map((a) =>
      urlBlock({
        loc: `${siteUrl}/articles/${a.slug}`,
        lastmod: a.modifiedDate || a.publishDate,
        changefreq: "monthly",
        priority: "0.7"
      })
    )
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${blocks.join("\n")}\n</urlset>\n`;
}

export function assertNoForbiddenUrls(xml, siteUrl) {
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const problems = [];
  const allowed = new Set([
    ...STATIC_INDEXABLE.map((s) => (s.path === "/" ? `${siteUrl}/` : `${siteUrl}${s.path}`)),
    ...locs.filter((u) => u.startsWith(`${siteUrl}/articles/`))
  ]);
  for (const u of locs) {
    const p = new URL(u).pathname;
    for (const bad of FORBIDDEN_PATHS) if (p === bad || p.startsWith(`${bad}/`)) problems.push(`مسار محجوب في sitemap: ${u}`);
    if (/(^|\/)(test|stag|staging|demo|tmp|dead)(\/|$)/i.test(p)) problems.push(`مسار اختباري/ميت في sitemap: ${u}`);
    if (!allowed.has(u)) problems.push(`URL غير منشور في sitemap: ${u}`);
  }
  return problems;
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const siteUrl = readSiteUrl();
  const articles = loadArticles();
  const xml = buildSitemapXml(articles, siteUrl);
  const problems = assertNoForbiddenUrls(xml, siteUrl);
  if (problems.length) {
    console.error("✖ فشل توليد sitemap — مخالفات:");
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  const count = STATIC_INDEXABLE.length + articles.length;
  if (checkOnly) {
    const current = fs.existsSync(SITEMAP_PATH) ? fs.readFileSync(SITEMAP_PATH, "utf8") : "";
    if (current === xml) {
      console.log(`✔ sitemap.xml محدّث (${count} URL = ${STATIC_INDEXABLE.length} صفحة ثابتة + ${articles.length} مقالاً).`);
      return;
    }
    console.error("✖ sitemap.xml غير متطابق مع بيانات المقالات — شغّل: npm run sitemap");
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(SITEMAP_PATH), { recursive: true });
  const before = fs.existsSync(SITEMAP_PATH) ? fs.readFileSync(SITEMAP_PATH, "utf8") : "";
  fs.writeFileSync(SITEMAP_PATH, xml, "utf8");
  console.log(`${before === xml ? "✔" : "✔ (محدّث)"} sitemap.xml: ${count} URL = ${STATIC_INDEXABLE.length} صفحة ثابتة + ${articles.length} مقالاً`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) main();
