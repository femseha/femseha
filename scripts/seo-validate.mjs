#!/usr/bin/env node
/**
 * FemSeha SEO validator.
 * Source of truth mirrors src/data/articles.ts: base articles, supporting articles,
 * batches 01-11, and effective content/source overrides.
 */
import fs from "fs";
import path from "path";

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
const iso = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "") && !Number.isNaN(Date.parse(s));
const json = (p) => JSON.parse(read(p));

const DATA_FILES = [
  "src/data/articles.json",
  "src/data/seo-supporting-articles.json",
  ...Array.from({ length: 11 }, (_, i) => `src/data/seo-content-batch-${String(i + 1).padStart(2, "0")}.json`),
];
const STATIC_INDEXABLE = ["/", "/articles", "/doctor", "/consultation", "/medical-disclaimer"];
const NON_INDEXABLE = ["/admin"];

section("تحميل مصدر الحقيقة");
for (const file of [...DATA_FILES, "src/data/seo-supporting-faq.json", "src/data/seo-cluster-links.json", "src/data/seo-pillar-overrides.json", "src/data/seo-legacy-overrides.json", "src/data/seo-content-overrides.json", "src/data/keyword-map.json", "public/sitemap.xml", "public/robots.txt", "index.html"]) {
  if (!exists(file)) err(`ملف مفقود: ${file}`);
}
if (errors) process.exit(1);

const rawArticles = DATA_FILES.flatMap((file) => {
  const value = json(file);
  return Array.isArray(value) ? value : [];
});
const unique = rawArticles.filter((a, i, list) => list.findIndex((x) => x.slug === a.slug) === i);
const faqBySlug = json("src/data/seo-supporting-faq.json");
const clusterBySlug = json("src/data/seo-cluster-links.json");
const pillarOverrides = json("src/data/seo-pillar-overrides.json");
const legacyOverrides = json("src/data/seo-legacy-overrides.json");
const contentOverrides = json("src/data/seo-content-overrides.json");
const effectiveArticles = unique.map((article) => {
  const faq = faqBySlug[article.slug];
  const pillar = pillarOverrides[article.slug];
  const legacy = legacyOverrides[article.title];
  const content = contentOverrides[article.slug];
  let out = { ...article };
  if (faq && !out.faq?.length) out.faq = faq;
  if (pillar) out = { ...out, ...(pillar.title ? { title: pillar.title } : {}), ...(pillar.summary ? { summary: pillar.summary } : {}), ...(pillar.contentAppend ? { content: `${out.content}\n\n${pillar.contentAppend}` } : {}) };
  if (legacy) out = { ...out, ...(legacy.title ? { title: legacy.title } : {}), ...(legacy.summary ? { summary: legacy.summary } : {}), ...(legacy.primaryKeyword ? { primaryKeyword: legacy.primaryKeyword } : {}), ...(legacy.contentReplace ? { content: legacy.contentReplace } : {}), ...(legacy.faqReplace ? { faq: legacy.faqReplace } : {}), ...(legacy.relatedReplace ? { related: legacy.relatedReplace } : {}) };
  if (content) out = { ...out, ...(content.contentReplace ? { content: content.contentReplace } : {}), ...(content.sources ? { sources: content.sources } : {}) };
  const cluster = clusterBySlug[out.slug];
  if (cluster?.length) out.related = [...cluster, ...(out.related || [])].filter((s, i, list) => list.indexOf(s) === i && s !== out.slug);
  return out;
});

const keywordMapRaw = json("src/data/keyword-map.json");
const keywordEntries = Array.isArray(keywordMapRaw) ? keywordMapRaw : keywordMapRaw.keywords || [];
const sitemapXml = read("public/sitemap.xml");
const robotsTxt = read("public/robots.txt");
const routeSet = new Set([...STATIC_INDEXABLE, ...effectiveArticles.map((a) => `/articles/${a.slug}`), ...NON_INDEXABLE]);
ok(`articles=${effectiveArticles.length}, keywordMap=${keywordEntries.length}, sourceFiles=${DATA_FILES.length}`);

section("المقالات: البيانات الفعلية بعد تطبيق overrides");
const seenTitles = new Map();
const seenSlugs = new Set();
const seenDescriptions = new Map();
for (const a of effectiveArticles) {
  const label = a.slug || a.id || "(بدون slug)";
  if (!a.slug || !/^[a-z0-9-]+$/.test(a.slug)) err(`${label}: slug غير صالح`);
  if (seenSlugs.has(a.slug)) err(`slug مكرر: ${a.slug}`);
  seenSlugs.add(a.slug);
  if (!a.title || a.title.trim().length < 10) err(`${label}: title مفقود أو قصير`);
  else {
    if (seenTitles.has(a.title)) err(`عنوان مكرر: ${a.title}`);
    seenTitles.set(a.title, label);
    if (`${a.title} | منصة فصيحة الطبية`.length > 120) warn(`${label}: <title> طويل`);
  }
  if (!a.summary || a.summary.trim().length < 50) err(`${label}: summary مفقود أو قصير`);
  else {
    const desc = a.summary.slice(0, 160);
    if (seenDescriptions.has(desc)) err(`${label}: meta description مكرر مع ${seenDescriptions.get(desc)}`);
    seenDescriptions.set(desc, label);
  }
  if (!a.primaryKeyword) warn(`${label}: لا توجد primaryKeyword`);
  if (!iso(a.publishDate)) err(`${label}: publishDate غير صالح`);
  if (a.modifiedDate !== undefined) {
    if (!iso(a.modifiedDate)) err(`${label}: modifiedDate غير صالح`);
    else if (a.modifiedDate < a.publishDate) err(`${label}: modifiedDate يسبق publishDate`);
  }
  if (!a.content || a.content.trim().length < 250) err(`${label}: المحتوى قصير/فارغ`);
  const paragraphs = a.content.split(/\n{2,}/).map((s) => s.trim()).filter((s) => s.length > 120);
  const freq = new Map();
  for (const p of paragraphs) freq.set(p, (freq.get(p) || 0) + 1);
  for (const [p, n] of freq) if (n > 2) err(`${label}: فقرة مكررة ${n} مرات: "${p.slice(0, 60)}…"`);
  if (a.faq !== undefined) {
    if (!Array.isArray(a.faq) || !a.faq.length) err(`${label}: FAQ فارغ/غير صالح`);
    else for (const f of a.faq) if (!f.q || !f.a) err(`${label}: FAQ ناقص q/a`);
  }
  if (!Array.isArray(a.sources) || !a.sources.length) warn(`${label}: لا توجد مصادر طبية`);
  else for (const s of a.sources) if (!s.publisher || !s.title || !/^https?:\/\//.test(s.url || "")) err(`${label}: مصدر غير مكتمل`);
  for (const r of a.related || []) if (!seenSlugs.has(r) && !effectiveArticles.some((x) => x.slug === r)) err(`${label}: related غير منشور: ${r}`);
  for (const bad of ["للطلب والشراء", "اطلب الآن", "متوفر للبيع", "سعر الحبوب", "التوصيل السري"]) if ((a.content || "").includes(bad)) err(`${label}: عبارة تجارية ممنوعة: ${bad}`);
}
ok("تم فحص المحتوى الفعلي");

section("keyword-map");
const kwSeen = new Map();
const targetMap = new Map();
const forbiddenMetrics = ["impressions", "clicks", "ctr", "position", "currentPosition"];
for (const k of keywordEntries) {
  const label = k.keyword || "(بدون keyword)";
  for (const f of ["keyword", "searchIntent", "country", "currentUrl", "targetUrl", "priority", "action"]) if (!k[f]) err(`keyword-map[${label}]: حقل مفقود: ${f}`);
  for (const f of forbiddenMetrics) if (f in k && !k.gscSource) err(`keyword-map[${label}]: مقياس ${f} غير موثق بدون gscSource`);
  if (k.currentUrl && !routeSet.has(k.currentUrl)) err(`keyword-map[${label}]: currentUrl غير منشور: ${k.currentUrl}`);
  if (k.targetUrl && !routeSet.has(k.targetUrl)) err(`keyword-map[${label}]: targetUrl غير منشور: ${k.targetUrl}`);
  if (kwSeen.has(k.keyword) && kwSeen.get(k.keyword) !== k.targetUrl) warn(`keyword-map: تنافس محتمل للكلمة "${k.keyword}" بين ${kwSeen.get(k.keyword)} و ${k.targetUrl}`);
  kwSeen.set(k.keyword, k.targetUrl);
  if (k.targetUrl) {
    if (targetMap.has(k.targetUrl)) warn(`keyword-map: ${k.targetUrl} يستهدف بأكثر من كلمة — راجع اختلاف الزاوية`);
    targetMap.set(k.targetUrl, k.keyword);
  }
}
ok("تم فحص keyword-map");

section("sitemap.xml");
const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const locSet = new Set(locs);
if (locs.length !== locSet.size) err("sitemap يحتوي URLs مكررة");
const expected = new Set([...STATIC_INDEXABLE, ...effectiveArticles.map((a) => `/articles/${a.slug}`)].map((r) => r === "/" ? `${SITE_URL}/` : `${SITE_URL}${r}`));
for (const u of expected) if (!locSet.has(u)) err(`sitemap: URL منشور مفقود: ${u}`);
for (const u of locSet) if (!expected.has(u)) warn(`sitemap: URL إضافي غير معروف لمصدر المقالات: ${u}`);
ok(`sitemap URLs=${locs.length}`);

section("robots.txt");
if (!/Sitemap:\s*https:\/\/femseha\.com\/sitemap\.xml/i.test(robotsTxt)) err("robots.txt لا يشير إلى sitemap.xml");
if (!/Disallow:\s*\/admin/i.test(robotsTxt)) warn("robots.txt لا يحجب /admin");
if (!/Disallow:\s*\/search/i.test(robotsTxt)) warn("robots.txt لا يحجب /search");
ok("تم فحص robots.txt");

section("النتيجة");
console.log(`articles=${effectiveArticles.length}, sitemap=${locs.length}, errors=${errors}, warnings=${warnings}`);
if (errors) {
  console.error("\n✖ SEO Validation FAILED");
  process.exit(1);
}
console.log("\n✔ SEO Validation PASSED");
