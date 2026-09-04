#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * مولّد Sitemap الديناميكي — منصة FemSeha | فيم صحة
 * ═══════════════════════════════════════════════════════════════════════════
 * مصدر الحقيقة الوحيد: src/data/articles.json + جدول المسارات الثابتة أدناه.
 *
 *   - أي مقال جديد في articles.json يدخل sitemap تلقائياً (لا تحديث يدوي).
 *   - مربوط بـ npm run build (يُشتق قبل vite build) وعبر npm run sitemap.
 *   - يستخدمه خط النشر الآلي (scripts/generate-article.mjs) أيضاً — مولّد واحد
 *     للموقع كله، فلا تتنافس صيغتان على public/sitemap.xml.
 *
 * قواعد المحتوى (Indexing Policy):
 *   1) المسارات القابلة للفهرسة فقط: الصفحات العامة الثابتة + /articles/{slug}.
 *   2) مستبعد حظراً: /admin (لوحة إدارة) و /search — لا يظهران أبداً في sitemap.
 *   3) لا URLs اختبار أو ميتة: كل URL يُشتق من مسار منشور فعلياً في App.tsx
 *      أو من slug موجود في articles.json (بعد التحقق من صيغته وتفرّده).
 *   4) لا تواريخ مخترعة: lastmod للمقال = modifiedDate || publishDate فقط،
 *      وlastmod للرئيسية و/articles = أحدث تاريخ محتوى حقيقي. الصفحات الثابتة
 *      الدائمة (doctor/consultation/medical-disclaimer) بلا lastmod لعدم وجود
 *      تاريخ تعديل موثق لها — ووفق بروتوكول sitemap الحقل اختياري.
 *
 * التشغيل:
 *   node scripts/generate-sitemap.mjs            توليد/تحديث public/sitemap.xml
 *   node scripts/generate-sitemap.mjs --check    فحص فقط (لا كتابة) — يفشل عند عدم التطابق
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARTICLES_PATH = path.join(ROOT, "src", "data", "articles.json");
const SITE_TS_PATH = path.join(ROOT, "src", "data", "site.ts");
const SITEMAP_PATH = path.join(ROOT, "public", "sitemap.xml");

/** استخراج عنوان الموقع من مصدره الوحيد src/data/site.ts */
export function readSiteUrl() {
  const src = fs.readFileSync(SITE_TS_PATH, "utf8");
  const m = src.match(/url:\s*"(https?:\/\/[^"\s]+)"/);
  if (!m) throw new Error("site.ts: لم يُعثر على SITE.url — لا يمكن توليد sitemap بعنوان غير معروف");
  return m[1].replace(/\/+$/, "");
}

/** المسارات الثابتة العامة القابلة للفهرسة (مطابقة لمسارات App.tsx).
 *  lastmod: "content" = مشتق من أحدث تاريخ محتوى حقيقي | false = بلا lastmod. */
export const STATIC_INDEXABLE = [
  { path: "/", priority: "1.0", changefreq: "daily", lastmod: "content" },
  { path: "/articles", priority: "0.9", changefreq: "daily", lastmod: "content" },
  { path: "/doctor", priority: "0.8", changefreq: "monthly", lastmod: false },
  { path: "/consultation", priority: "0.8", changefreq: "monthly", lastmod: false },
  { path: "/medical-disclaimer", priority: "0.4", changefreq: "yearly", lastmod: false }
];

/** مسارات محجوبة أو غير قابلة للفهرسة — وجودها في sitemap خطأ فادح */
export const FORBIDDEN_PATHS = ["/admin", "/search"];

const isIsoDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "") && !Number.isNaN(Date.parse(s));
const escapeXml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** تحميل articles.json والتحقق من صلاحيته للاستخدام في sitemap */
export function loadArticles() {
  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf8"));
  if (!Array.isArray(articles)) throw new Error("articles.json: ليس مصفوفة");
  const seen = new Map();
  for (const a of articles) {
    const label = a.slug || a.id || "(بدون slug)";
    if (!a.slug || !/^[a-z0-9-]+$/.test(a.slug)) throw new Error(`${label}: slug مفقود أو بصيغة غير صالحة (مسموح: a-z 0-9 -)`);
    if (seen.has(a.slug)) throw new Error(`slug مكرر: ${a.slug} (موجود سابقاً في ${seen.get(a.slug)})`);
    seen.set(a.slug, label);
    if (!isIsoDate(a.publishDate)) throw new Error(`${label}: publishDate غير صالح (${a.publishDate})`);
    if (a.modifiedDate !== undefined) {
      if (!isIsoDate(a.modifiedDate)) throw new Error(`${label}: modifiedDate غير صالح (${a.modifiedDate})`);
      if (a.modifiedDate < a.publishDate) throw new Error(`${label}: modifiedDate يسبق publishDate`);
    }
  }
  return articles;
}

/** أحدث تاريخ محتوى حقيقي (أحدث modifiedDate/publishDate في المتجر) */
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

/** توليد XML كاملاً من articles.json — دالة نقية تستخدمها الأدوات الأخرى أيضاً */
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

/** حارس الاستبعاد: يتأكد أن لا مسار محجوباً أو اختبارياً يمكن أن يظهر */
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
    // لا نعتبر كلمة "test" داخل slug سليم (مثل home-pregnancy-test-accuracy) مساراً اختبارياً.
    // المنع يقتصر على مقاطع مسار اختبارية/مؤقتة مستقلة.
    if (/(^|\/)(test|stag|staging|demo|tmp|dead)(\/|$)/i.test(p)) problems.push(`مسار اختباري/ميت في sitemap: ${u}`);
    if (!allowed.has(u)) problems.push(`URL غير منشور في sitemap: ${u}`);
  }
  return problems;
}

/* ── CLI ─────────────────────────────────────────────────────────────────── */
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
    console.error("✖ sitemap.xml غير متطابق مع articles.json — شغّل: npm run sitemap");
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(SITEMAP_PATH), { recursive: true });
  const before = fs.existsSync(SITEMAP_PATH) ? fs.readFileSync(SITEMAP_PATH, "utf8") : "";
  fs.writeFileSync(SITEMAP_PATH, xml, "utf8");
  console.log(`${before === xml ? "✔" : "✔ (محدّث)"} sitemap.xml: ${count} URL = ${STATIC_INDEXABLE.length} صفحة ثابتة + ${articles.length} مقالاً — المصدر: src/data/articles.json`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) main();
