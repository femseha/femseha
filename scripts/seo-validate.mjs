#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SEO Master Validator — منصة FemSeha | فيم صحة
 * ═══════════════════════════════════════════════════════════════════════════
 * فحص فعلي للمحتوى (لا يكتفي بوجود الملفات):
 *   - H1 مفقود / متعدد (عبر عرض SSR فعلي لكل مسار)
 *   - title مفقود / طويل / قصير / مكرر
 *   - meta description مفقود / مكرر
 *   - canonical مفقود / مكرر / غير ذاتي
 *   - ALT مفقود للصور، slugs مكررة، صفحات يتيمة
 *   - روابط داخلية مكسورة (في HTML المعروض وفي محتوى المقالات)
 *   - تطابق sitemap مع URLs المنشورة فعلياً (بالاتجاهين)
 *   - سلامة robots.txt (السماح بالمقالات والأصول، حجب /admin و /search)
 *   - وجود Schema وسلامة JSON-LD الثابت
 *   - إشارات تنافس الكلمات المفتاحية (cannibalization)
 *   - مقاييس SEO غير موثقة في keyword-map (ممنوعة بدون gscSource)
 *   - رفض المحتوى الفارغ/الشكلي + كشف الحشو المكرر داخل المقال الواحد (بلا حد كلمات)
 *   - اتساق modifiedDate (لا يُخترع، ولا يسبق publishDate)
 *
 * التشغيل: node scripts/seo-validate.mjs
 * ═══════════════════════════════════════════════════════════════════════════
 */
import fs from "fs";
import path from "path";
import { createServer } from "vite";
import { hasSubstantiveContent, internalMarkdownPaths, unsafeMarkdownLinks } from "./generate-article.mjs";

const ROOT = process.cwd();
const SITE_URL = "https://femseha.com";
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const exists = (p) => fs.existsSync(path.join(ROOT, p));

let errors = 0;
let warnings = 0;
const err = (m) => { errors++; console.error(`  ✖ ${m}`); };
const warn = (m) => { warnings++; console.warn(`  ⚠ ${m}`); };
const ok = (m) => console.log(`  ✔ ${m}`);
const section = (t) => console.log(`\n── ${t} ${"─".repeat(Math.max(4, 60 - t.length))}`);

const isIsoDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "") && !Number.isNaN(Date.parse(s));

/* ── 1) تحميل البيانات ──────────────────────────────────────────────────── */
section("تحميل البيانات");
for (const req of ["src/data/articles.json", "public/sitemap.xml", "public/robots.txt", "index.html", "src/data/keyword-map.json"]) {
  if (!exists(req)) { err(`ملف مفقود: ${req}`); }
}
if (errors) { console.error("\n✖ SEO Validation FAILED (ملفات أساسية مفقودة)."); process.exit(1); }

const articles = JSON.parse(read("src/data/articles.json"));
const keywordMapRaw = JSON.parse(read("src/data/keyword-map.json"));
const keywordEntries = Array.isArray(keywordMapRaw) ? keywordMapRaw : keywordMapRaw.keywords || [];
const sitemapXml = read("public/sitemap.xml");
const robotsTxt = read("public/robots.txt");
const indexHtml = read("index.html");
ok(`articles=${articles.length}, keywordMap=${keywordEntries.length}`);

/* ── 2) جرد المسارات المنشورة (مصدر الحقيقة: App.tsx + articles.json) ──── */
const STATIC_INDEXABLE = ["/", "/articles", "/doctor", "/consultation", "/medical-disclaimer"];
const NON_INDEXABLE = ["/admin"];
const articleRoutes = articles.map((a) => `/articles/${a.slug}`);
const indexableRoutes = [...STATIC_INDEXABLE, ...articleRoutes];
const allRoutes = [...indexableRoutes, ...NON_INDEXABLE];
const routeSet = new Set(allRoutes);

/* ── 3) فحوصات المقالات ─────────────────────────────────────────────────── */
section("المقالات: titles / descriptions / slugs / كلمات / تواريخ");
const seenTitles = new Map();
const seenSlugs = new Map();
const seenSummaries = new Map();
const seenKeywords = new Map();

for (const a of articles) {
  const label = a.slug || a.id || "(بدون slug)";

  // slug
  if (!a.slug || !/^[a-z0-9-]+$/.test(a.slug)) err(`${label}: slug مفقود أو بصيغة غير صالحة`);
  if (seenSlugs.has(a.slug)) err(`slug مكرر: ${a.slug}`);
  seenSlugs.set(a.slug, true);

  // title (H1 للمقال + أساس وسم title)
  if (!a.title || a.title.trim().length < 10) err(`${label}: title مفقود أو أقصر من 10 محارف`);
  else {
    if (a.title.length > 110) warn(`${label}: عنوان H1 طويل جداً (${a.title.length} محرفاً)`);
    if (seenTitles.has(a.title)) err(`عنوان مكرر بين مقالين: "${a.title.slice(0, 50)}…"`);
    seenTitles.set(a.title, label);
  }
  // وسم <title> الفعلي في ArticleView: `${title} | منصة فصيحة الطبية`
  const docTitle = `${a.title} | منصة فصيحة الطبية`;
  if (docTitle.length > 120) warn(`${label}: وسم <title> طويل (${docTitle.length}) — يُقتطع في نتائج البحث`);

  // meta description (تُشتق من summary مقصوصة إلى 160)
  if (!a.summary || a.summary.trim().length < 50) err(`${label}: summary/description مفقود أو أقصر من 50 محرفاً`);
  else {
    const desc = a.summary.slice(0, 160);
    if (seenSummaries.has(desc)) err(`${label}: meta description مكرر مع ${seenSummaries.get(desc)}`);
    seenSummaries.set(desc, label);
  }

  // primaryKeyword — تفرد لمنع cannibalization
  if (a.primaryKeyword) {
    const k = a.primaryKeyword.trim();
    if (seenKeywords.has(k)) err(`cannibalization: الكلمة المفتاحية "${k}" مستهدفة من ${seenKeywords.get(k)} و ${label}`);
    seenKeywords.set(k, label);
  } else warn(`${label}: لا توجد primaryKeyword`);

  // التواريخ
  if (!isIsoDate(a.publishDate)) err(`${label}: publishDate غير صالح (${a.publishDate})`);
  if (a.modifiedDate !== undefined) {
    if (!isIsoDate(a.modifiedDate)) err(`${label}: modifiedDate غير صالح (${a.modifiedDate})`);
    else if (a.modifiedDate < a.publishDate) err(`${label}: modifiedDate يسبق publishDate`);
    else if (a.modifiedDate === a.publishDate) warn(`${label}: modifiedDate يساوي publishDate — احذفه إن لم يوجد تعديل حقيقي`);
  }

  // لا يوجد حد كلمات أو حكم فهرسة مبني على العدد وحده؛ نرفض الفراغ/النص الشكلي فقط.
  if (!hasSubstantiveContent(a.content)) {
    err(`${label}: المحتوى فارغ أو شكلي ولا يحتوي مادة تحريرية فعلية`);
  }

  // كشف الحشو: فقرة متطابقة تتكرر أكثر من مرتين داخل المقال نفسه
  const paras = (a.content || "").split(/\n{2,}/).map((s) => s.trim()).filter((s) => s.length > 120);
  const freq = new Map();
  for (const p of paras) freq.set(p, (freq.get(p) || 0) + 1);
  for (const [p, n] of freq) if (n > 2) err(`${label}: فقرة مكررة ${n} مرات داخل المقال (حشو duplicate-content): "${p.slice(0, 40)}…"`);

  // FAQ: البنية سليمة إن وجدت (شرط لصحة FAQPage schema)
  if (a.faq !== undefined) {
    if (!Array.isArray(a.faq) || a.faq.length === 0) err(`${label}: faq موجود لكنه فارغ/غير مصفوفة — سيولّد FAQPage schema فارغاً`);
    else for (const f of a.faq) if (!f.q || !f.a) err(`${label}: عنصر FAQ ناقص q/a`);
  }

  // sources
  if (!Array.isArray(a.sources) || a.sources.length === 0) warn(`${label}: لا توجد مصادر طبية`);
  else for (const s of a.sources) if (!s.publisher || !s.title || !/^https?:\/\//.test(s.url || "")) err(`${label}: مصدر غير مكتمل/رابط غير صالح`);

  // related — يجب أن تشير إلى slugs منشورة فقط
  for (const r of a.related || []) {
    if (!seenSlugs.has(r) && !articles.some((x) => x.slug === r)) err(`${label}: related يشير إلى slug غير منشور: ${r}`);
  }

  // روابط Markdown: الداخلية يجب أن تكون منشورة وكل schemes الخطرة مرفوضة.
  for (const href of internalMarkdownPaths(a.content || "")) {
    if (!routeSet.has(href)) err(`${label}: رابط داخلي مكسور في المحتوى: ${href}`);
  }
  for (const href of unsafeMarkdownLinks(a.content || "")) {
    err(`${label}: رابط Markdown غير آمن: ${href}`);
  }

  // محتوى تجاري ممنوع (YMYL): أنماط بيع/شراء/أسعار كعرض وليس كتحذير — فحص خشن
  for (const bad of ["للطلب والشراء", "اطلب الآن", "متوفر للبيع", "سعر الحبوب", "التوصيل السري"]) {
    if ((a.content || "").includes(bad)) err(`${label}: عبارة تجارية ممنوعة: "${bad}"`);
  }
}
ok("اكتمل فحص سجلات المقالات");

/* ── 4) keyword-map: بنية + مقاييس غير موثقة + cannibalization ──────────── */
section("keyword-map: البنية والمقاييس والتنافس");
const FORBIDDEN_METRICS = ["impressions", "clicks", "ctr", "position", "currentPosition"];
const kwSeen = new Map();
const urlKw = new Map();
for (const k of keywordEntries) {
  const label = k.keyword || "(بدون keyword)";
  for (const f of ["keyword", "searchIntent", "country", "currentUrl", "targetUrl", "priority", "action"]) {
    if (!k[f]) err(`keyword-map[${label}]: حقل مفقود: ${f}`);
  }
  for (const f of FORBIDDEN_METRICS) {
    if (f in k && !k.gscSource) err(`keyword-map[${label}]: مقياس SEO غير موثق (${f}) بدون gscSource من بيانات GSC حقيقية`);
  }
  if (k.currentUrl && !routeSet.has(k.currentUrl)) err(`keyword-map[${label}]: currentUrl غير منشور: ${k.currentUrl}`);
  if (k.targetUrl && !routeSet.has(k.targetUrl)) err(`keyword-map[${label}]: targetUrl غير منشور: ${k.targetUrl}`);
  if (kwSeen.has(k.keyword)) err(`keyword-map: كلمة مكررة "${k.keyword}" (تنافس داخلي)`);
  kwSeen.set(k.keyword, k.targetUrl);
  if (k.targetUrl) {
    if (urlKw.has(k.targetUrl)) warn(`keyword-map: ${k.targetUrl} مستهدف بأكثر من كلمة رئيسية — تأكد أنها زوايا مختلفة لا تنافساً`);
    urlKw.set(k.targetUrl, k.keyword);
  }
}
// إشارة تنافس بين المقالات نفسها: تطابق target keyword مع اختلاف الصفحات تم فحصه أعلاه
ok("اكتمل فحص keyword-map");

/* ── 5) sitemap: تطابق كامل بالاتجاهين ─────────────────────────────────── */
section("sitemap.xml");
const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const locSet = new Set(locs);
if (locs.length !== locSet.size) err("sitemap: URLs مكررة داخل sitemap");
const expectedUrls = new Set(indexableRoutes.map((r) => (r === "/" ? `${SITE_URL}/` : `${SITE_URL}${r}`)));
for (const u of expectedUrls) if (!locSet.has(u)) err(`sitemap: URL منشور غير موجود في sitemap: ${u}`);
for (const u of locSet) if (!expectedUrls.has(u)) err(`sitemap: URL في sitemap غير منشور فعلياً (أو محجوب): ${u}`);
for (const bad of NON_INDEXABLE) if (locSet.has(`${SITE_URL}${bad}`)) err(`sitemap: يتضمن مساراً محجوباً: ${bad}`);
for (const m of sitemapXml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
  if (!isIsoDate(m[1].trim())) err(`sitemap: lastmod غير صالح: ${m[1]}`);
}
// اتساق lastmod للمقالات مع publishDate/modifiedDate
for (const a of articles) {
  const expected = a.modifiedDate || a.publishDate;
  const re = new RegExp(`<loc>${SITE_URL}/articles/${a.slug}</loc>\\s*<lastmod>([^<]+)</lastmod>`);
  const m = sitemapXml.match(re);
  if (m && m[1].trim() !== expected) warn(`sitemap: lastmod لمقال ${a.slug} (${m[1].trim()}) لا يطابق ${expected}`);
}
if (errors === 0) ok(`sitemap متطابق 100% مع ${expectedUrls.size} URL منشوراً`);

/* ── 6) robots.txt ──────────────────────────────────────────────────────── */
section("robots.txt");
const rlines = robotsTxt.split("\n").map((l) => l.trim());
if (!rlines.some((l) => /^Allow:\s*\/$/.test(l))) err("robots: قاعدة Allow: / مفقودة");
if (!rlines.some((l) => /^Disallow:\s*\/admin$/.test(l))) err("robots: قاعدة Disallow: /admin مفقودة");
if (!rlines.some((l) => /^Disallow:\s*\/search$/.test(l))) err("robots: قاعدة Disallow: /search مفقودة");
if (!rlines.some((l) => l === `Sitemap: ${SITE_URL}/sitemap.xml`)) err(`robots: سطر Sitemap: ${SITE_URL}/sitemap.xml مفقود`);
for (const l of rlines) {
  const m = l.match(/^Disallow:\s*(\S+)/);
  if (m && ["/", "/articles", "/assets", "/index.html"].includes(m[1])) err(`robots: يحجب مساراً حيوياً عن Google: ${m[1]}`);
}
if (errors === 0) ok("robots.txt سليم: يسمح بالمقالات والأصول ويحجب /admin و /search فقط");

/* ── 7) index.html: canonical / OG / JSON-LD الثابت ─────────────────────── */
section("index.html: الوسوم الثابتة و JSON-LD");
if (!indexHtml.includes('rel="canonical"')) err("index.html: canonical مفقود");
if (!indexHtml.includes('name="description"')) err("index.html: meta description مفقود");
if (!indexHtml.includes('property="og:site_name"')) err("index.html: og:site_name مفقود");
const ldBlocks = [...indexHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
if (ldBlocks.length === 0) err("index.html: لا توجد بيانات JSON-LD ثابتة");
const staticTypes = [];
for (const b of ldBlocks) {
  try {
    const obj = JSON.parse(b[1]);
    if (!obj["@context"] || !obj["@type"]) err("index.html: JSON-LD بلا @context/@type");
    else staticTypes.push(obj["@type"]);
  } catch (e) {
    err(`index.html: JSON-LD تالف (malformed): ${e.message}`);
  }
}
for (const t of ["MedicalOrganization", "Physician", "WebSite"]) {
  if (!staticTypes.includes(t)) err(`index.html: Schema ${t} مفقود`);
}
ok(`JSON-LD ثابت سليم: ${staticTypes.join(", ")}`);

/* ── 8) src/lib/seo.ts: منع اختراع dateModified + وجود مولدات Schema ────── */
section("src/lib/seo.ts");
const seoSrc = read("src/lib/seo.ts");
if (/dateModified:\s*article\.publishDate/.test(seoSrc)) err("seo.ts: dateModified يُملأ آلياً بـ publishDate (تاريخ تعديل مخترع)");
else ok("dateModified لا يُخترع — يُرسل فقط عند وجود modifiedDate حقيقي");
for (const fn of ["websiteJsonLd", "organizationJsonLd", "doctorJsonLd", "breadcrumbJsonLd", "articleJsonLd"]) {
  if (!seoSrc.includes(`function ${fn}`)) err(`seo.ts: مولد Schema مفقود: ${fn}`);
}
if (!/data-seo="page"/.test(seoSrc)) err("seo.ts: لا يوجد تنظيف لبيانات JSON-LD بين التنقلات");

/* ── 9) الصفحات الثابتة: useSeo (title/description/canonical) ──────────── */
section("صفحات التطبيق: useSeo و canonical ذاتي");
const PAGE_CANONICALS = {
  "src/pages/HomePage.tsx": "/",
  "src/pages/ArticlesPage.tsx": "/articles",
  "src/pages/DoctorPage.tsx": "/doctor",
  "src/pages/ConsultationPage.tsx": "/consultation",
  "src/pages/DisclaimerPage.tsx": "/medical-disclaimer",
};
const canonicalSeen = new Map();
for (const [file, route] of Object.entries(PAGE_CANONICALS)) {
  if (!exists(file)) { err(`صفحة مفقودة: ${file}`); continue; }
  const src = read(file);
  if (!src.includes("useSeo(")) { err(`${file}: لا يستدعي useSeo`); continue; }
  if (!/title:\s*['"`]/.test(src)) err(`${file}: useSeo بدون title`);
  if (!/description:\s*['"`]?/.test(src) || !src.includes("description")) err(`${file}: useSeo بدون description`);
  const m = src.match(/canonicalPath:\s*['"`]([^'"`]+)['"`]/);
  if (!m) err(`${file}: canonicalPath مفقود`);
  else {
    if (m[1] !== route) err(`${file}: canonical غير ذاتي — canonicalPath=${m[1]} بينما المسار ${route}`);
    if (canonicalSeen.has(m[1])) err(`canonical مكرر بين ${canonicalSeen.get(m[1])} و ${file}`);
    canonicalSeen.set(m[1], file);
  }
}
const avSrc = read("src/pages/ArticleView.tsx");
if (!/canonicalPath:\s*article\s*\?\s*`\/articles\/\$\{article\.slug\}`/.test(avSrc)) {
  err("ArticleView.tsx: canonical المقال ليس ذاتياً (يجب /articles/${article.slug})");
} else ok("canonical المقالات ذاتي لكل slug");
if (!avSrc.includes("FAQPage")) warn("ArticleView.tsx: لا يوجد توليد FAQPage schema");
if (!avSrc.includes("breadcrumbJsonLd")) err("ArticleView.tsx: BreadcrumbList schema مفقود");
if (!avSrc.includes("articleJsonLd")) err("ArticleView.tsx: MedicalWebPage schema مفقود");

/* ── 10) عرض SSR فعلي: H1 وحيد، ALT، روابط داخلية، صفحات يتيمة ─────────── */
section("عرض SSR فعلي لكل المسارات: H1 / ALT / الروابط / اليتم");
const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
let renderedPages = {};
try {
  const { renderRoute } = await server.ssrLoadModule("/scripts/ssr-entry.tsx");
  for (const route of allRoutes) {
    let html = "";
    try { html = renderRoute(route); } catch (e) { err(`فشل عرض المسار ${route}: ${e.message}`); continue; }
    renderedPages[route] = html;

    // H1: واحد بالضبط في الصفحات القابلة للفهرسة
    const h1s = [...html.matchAll(/<h1[\s>]/g)].length;
    if (indexableRoutes.includes(route)) {
      if (h1s === 0) err(`${route}: لا يوجد H1`);
      else if (h1s > 1) err(`${route}: H1 متعدد (${h1s})`);
    }

    // ALT: كل <img> يجب أن تحمل خاصية alt (الفارغة مسموحة للزخرفية فقط)
    for (const im of html.matchAll(/<img\b[^>]*>/g)) {
      const tag = im[0];
      if (!/\balt=/.test(tag)) err(`${route}: صورة بلا خاصية alt: ${tag.slice(0, 80)}…`);
      else if (/\balt=""/.test(tag)) warn(`${route}: صورة بـ alt فارغ (زخرفية؟): ${(tag.match(/src="([^"]*)"/) || [])[1] || ""}`);
    }

    // الروابط الداخلية
    for (const l of html.matchAll(/href="(\/[^"#?]*)"/g)) {
      const target = l[1].replace(/\/$/, "") || "/";
      if (!routeSet.has(target) && !target.startsWith("/assets") && !/\.(png|webp|jpg|xml|txt|ico)$/.test(target)) {
        err(`${route}: رابط داخلي مكسور: ${l[1]}`);
      }
    }
  }

  // صفحات يتيمة: كل مسار قابل للفهرسة يجب أن يُشار إليه من صفحة أخرى
  for (const route of indexableRoutes) {
    if (route === "/") continue;
    const linkedFrom = Object.entries(renderedPages).some(([from, html]) => from !== route && html.includes(`href="${route}"`));
    if (!linkedFrom) err(`صفحة يتيمة (orphan): ${route} لا يشير إليها أي رابط داخلي`);
  }
  ok(`عُرض ${Object.keys(renderedPages).length} مساراً فعلياً وفُحصت البنية الدلالية`);
} finally {
  await server.close();
}

/* ── النتيجة ────────────────────────────────────────────────────────────── */
console.log(`\n${"═".repeat(64)}`);
console.log(`النتيجة: أخطاء=${errors} | تحذيرات=${warnings}`);
if (errors > 0) {
  console.error("✖ SEO Validation FAILED.");
  process.exit(1);
}
console.log("✔ SEO Validation PASSED.");
