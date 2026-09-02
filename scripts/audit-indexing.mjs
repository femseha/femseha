#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Indexing Architecture Audit — منصة FemSeha | فيم صحة
 * ═══════════════════════════════════════════════════════════════════════════
 * تدقيق شامل لبنية الفهرسة — تحليل ثابت سريع (بلا vite) يشمل:
 *
 *   1. الأتمتة: توليد sitemap مربوط بـ npm run build + الملف المُسلَّم محدّث
 *      100% مقارنة بـ src/data/articles.json (إثبات أن أي مقال جديد يدخل تلقائياً).
 *   2. قواعد sitemap: URLs مطلقة، غير مكررة، مطابقة بالاتجاهين للمسارات المنشورة،
 *      خلوّها من /admin و/search وأي مسارات اختبار/ميتة أو doorway.
 *   3. جرد المسارات الحقيقي من App.tsx ومطابقته بجدول الفهرسة.
 *   4. robots.txt: السماح للعام، حجب /admin و/search، وسطر Sitemap صحيح.
 *   5. canonical: index.html + الصفحات الثابتة الخمس + ذاتية المقالات.
 *   6. noindex: /admin و404 وsoft-404 للمقالات غير الصحيحة، وعدم تسربه للصفحات الفهرسية.
 *   7. منع soft-404/fallback: slug غير صحيح = NotFoundPage بلا سقوط لأول مقال.
 *   8. الروابط الداخلية: رسم بياني ثابت (BFS من "/") — كشف الصفحات اليتيمة
 *      والروابط الداخلية المكسورة (بما فيها روابط محتوى المقالات).
 *   9. حارس YMYL التجاري: لا أسعار/بيع/روابط شراء (أرقام+عملات، عبارات بيع)،
 *      وتحذير عند أي جرعات رقمية — دون المساس بالتنويهات التعليمية الناقلة للمحتوى.
 *
 * التشغيل: node scripts/audit-indexing.mjs   (أو npm run seo:audit)
 */
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

/* ══ 1) الأتمتة: build hook + حداثة sitemap ═════════════════════════════ */
section("أتمتة Sitemap: الربط بالبناء وحداثة الملف");
const pkg = JSON.parse(read("package.json"));
if (!/(node\s+scripts\/generate-sitemap\.mjs|npm\s+run\s+sitemap)\s*&&\s*vite\s+build/.test(pkg.scripts?.build || "")) {
  err(`package.json: سكربت build لا يولّد sitemap قبل vite build (الموجود: "${pkg.scripts?.build}")`);
} else {
  ok(`npm run build يولّد sitemap قبل vite build`);
}
if (pkg.scripts?.sitemap !== "node scripts/generate-sitemap.mjs") err("package.json: سكربت sitemap مفقود/غير صحيح");

const articles = loadArticles();
const articleRoutes = articles.map((a) => `/articles/${a.slug}`);
const indexableRoutes = [...STATIC_PATHS, ...articleRoutes];
const expectedXml = buildSitemapXml(articles, SITE_URL);
const committedXml = read("public/sitemap.xml");
if (committedXml === expectedXml) {
  ok(`public/sitemap.xml محدّث تماماً ومطابق لـ articles.json (${indexableRoutes.length} URL)`);
} else {
  err("public/sitemap.xml لا يطابق المولَّد من articles.json — الملف المُسلَّم قديم؛ شغّل: npm run sitemap");
}

/* ══ 2) قواعد محتوى sitemap ═════════════════════════════════════════════ */
section("قواعد sitemap: URLs حقيقية قابلة للفهرسة فقط");
const locs = [...committedXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const locSet = new Set(locs);
if (locs.length !== locSet.size) err("sitemap: URLs مكررة");
const expectedUrls = new Set(indexableRoutes.map((r) => (r === "/" ? `${SITE_URL}/` : `${SITE_URL}${r}`)));
for (const u of expectedUrls) if (!locSet.has(u)) err(`sitemap: URL منشور مفقود: ${u}`);
for (const u of locSet) if (!expectedUrls.has(u)) err(`sitemap: URL غير منشور/غير قابل للفهرسة: ${u}`);
for (const u of locs) {
  let p = "";
  try { p = new URL(u).pathname; } catch { err(`sitemap: URL غير صالح: ${u}`); continue; }
  if (!u.startsWith(SITE_URL)) err(`sitemap: URL بعنوان غير موقع الإنتاج: ${u}`);
  for (const bad of FORBIDDEN_PATHS) if (p === bad || p.startsWith(`${bad}/`)) err(`sitemap: يتضمن مساراً محجوباً: ${u}`);
  if (/test|stag|demo|tmp|dead|copy/i.test(p)) err(`sitemap: مسار اختباري/ميت: ${u}`);
  if (p.includes("?") || p.includes("#")) err(`sitemap: URL بمعاملات/جزء: ${u}`);
  const isStatic = STATIC_PATHS.includes(p === "/" ? "/" : p.replace(/\/$/, ""));
  if (!isStatic && !p.startsWith("/articles/")) err(`sitemap: مسار خارج جدول الفهرسة (doorway/غير معروف): ${u}`);
}
// lastmod المقالات = modifiedDate || publishDate (لا تواريخ مخترعة)
for (const a of articles) {
  const expected = a.modifiedDate || a.publishDate;
  const re = new RegExp(`<loc>${SITE_URL}/articles/${a.slug}</loc>\\s*(?:<lastmod>([^<]+)</lastmod>)?`);
  const m = committedXml.match(re);
  if (!m) err(`sitemap: مقال مفقود من الفحص: ${a.slug}`);
  else if (m[1] !== expected) err(`sitemap: lastmod لمقال ${a.slug} = ${m[1] || "(فارغ)"} بينما المتوقع ${expected}`);
}
if (errors === 0) ok(`sitemap نظيف: ${locs.length} URL — لا /admin، لا /search، لا test/dead، لا doorway`);

/* ══ 3) جرد المسارات من App.tsx ═════════════════════════════════════════ */
section("جرد المسارات الفعلية (App.tsx) ومطابقة جدول الفهرسة");
const appSrc = read("src/App.tsx");
const declared = [...appSrc.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
const expectedDeclared = ["/", "/articles", "/articles/:slug", "/doctor", "/consultation", "/medical-disclaimer", "/admin", "*"];
for (const r of expectedDeclared) if (!declared.includes(r)) err(`App.tsx: مسار معلن مفقود: ${r}`);
for (const r of declared) if (!expectedDeclared.includes(r)) err(`App.tsx: مسار غير معروف في جدول الفهرسة: ${r}`);
if (errors === 0) ok(`المسارات المعلنة تطابق جدول الفهرسة (${declared.length} مسارات)`);

/* ══ 4) robots.txt ══════════════════════════════════════════════════════ */
section("robots.txt: السماح/الحجب ومرجع sitemap");
const robots = read("public/robots.txt");
const rlines = robots.split("\n").map((l) => l.trim());
if (!rlines.some((l) => /^Allow:\s*\/$/.test(l))) err("robots: قاعدة Allow: / مفقودة");
if (!rlines.some((l) => /^Disallow:\s*\/admin$/.test(l))) err("robots: قاعدة Disallow: /admin مفقودة");
if (!rlines.some((l) => /^Disallow:\s*\/search$/.test(l))) err("robots: قاعدة Disallow: /search مفقودة");
if (!rlines.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) err(`robots: سطر Sitemap: ${SITE_URL}/sitemap.xml مفقود أو غير صحيح`);
for (const l of rlines) {
  const m = l.match(/^Disallow:\s*(\S+)/);
  if (m && ["/", "/articles", "/assets", "/index.html", "/sitemap.xml", "/robots.txt"].includes(m[1])) {
    err(`robots: يحجب مساراً حيوياً عن الزحف: ${m[1]}`);
  }
}
// اتساق: لا يجوز حجب أي URL وارد في sitemap
for (const u of locs) {
  const p = new URL(u).pathname;
  for (const l of rlines) {
    const m = l.match(/^Disallow:\s*(\S+)/);
    if (m && p !== "/" && (p === m[1] || p.startsWith(`${m[1]}/`))) err(`robots/sitemap تعارض: ${p} محجوب وورد في sitemap`);
  }
}
if (errors === 0) ok("robots.txt سليم ومتسق مع sitemap");

/* ══ 5) canonical ═══════════════════════════════════════════════════════ */
section("canonical: ثابت ذاتي لكل الصفحات القابلة للفهرسة");
const indexHtml = read("index.html");
const canonMatch = indexHtml.match(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/);
if (!canonMatch) err("index.html: وسم canonical مفقود");
else if (canonMatch[1] !== `${SITE_URL}/`) err(`index.html: canonical غير صحيح: ${canonMatch[1]} (المتوقع ${SITE_URL}/)`);

const PAGE_FILES = {
  "/": "src/pages/HomePage.tsx",
  "/articles": "src/pages/ArticlesPage.tsx",
  "/doctor": "src/pages/DoctorPage.tsx",
  "/consultation": "src/pages/ConsultationPage.tsx",
  "/medical-disclaimer": "src/pages/DisclaimerPage.tsx"
};
for (const [route, file] of Object.entries(PAGE_FILES)) {
  if (!exists(file)) { err(`صفحة مفقودة: ${file}`); continue; }
  const src = read(file);
  const m = src.match(/canonicalPath:\s*['"`]([^'"`]+)['"`]/);
  if (!m) err(`${file}: canonicalPath مفقود`);
  else if (m[1] !== route) err(`${file}: canonical غير ذاتي (${m[1]} ≠ ${route})`);
}
const avSrc = read("src/pages/ArticleView.tsx");
if (!/canonicalPath:\s*article\s*\?\s*`\/articles\/\$\{article\.slug\}`/.test(avSrc)) {
  err("ArticleView.tsx: canonical المقال ليس ذاتياً (/articles/${article.slug})");
}
if (errors === 0) ok("canonical ذاتي ومطلق في index.html والصفحات الخمس وصفحات المقالات");

/* ══ 6) noindex: أين يجب وأين يجب ألا يكون ══════════════════════════════ */
section("noindex: admin و404 وsoft-404 — دون تسربه للصفحات الفهرسية");
const adminSrc = read("src/pages/AdminPage.tsx");
const nfSrc = read("src/pages/NotFoundPage.tsx");
if (!/robots:\s*['"`]noindex,\s*nofollow['"`]/.test(adminSrc)) err("AdminPage.tsx: robots noindex,nofollow مفقود");
else ok("AdminPage.tsx: noindex, nofollow ✔");
if (!/robots:\s*['"`]noindex,\s*follow['"`]/.test(nfSrc)) err("NotFoundPage.tsx: robots noindex,follow مفقود");
else if (!/noCanonical:\s*true/.test(nfSrc)) err("NotFoundPage.tsx: noCanonical مفقود (404 بلا canonical)");
else ok("NotFoundPage.tsx: noindex, follow + بلا canonical ✔");
if (!/robots:\s*article\s*\?\s*undefined\s*:\s*['"`]noindex,\s*follow['"`]/.test(avSrc)) {
  err("ArticleView.tsx: فرع slug غير الصحيح لا يضبط noindex (soft-404 قابل للفهرسة)");
} else if (!/noCanonical:\s*!article/.test(avSrc)) {
  err("ArticleView.tsx: فرع slug غير الصحيح لا يزيل canonical");
} else {
  ok("ArticleView.tsx: slug غير صحيح = noindex + بلا canonical ✔");
}
const seoSrc = read("src/lib/seo.ts");
if (!/querySelector\('meta\[name="robots"\]'\)\?\.remove\(\)/.test(seoSrc)) {
  err("seo.ts: لا يوجد تنظيف لوسم robots بين التنقلات (خطر تسرب noindex لصفحات فهرسية)");
}
for (const [route, file] of Object.entries(PAGE_FILES)) {
  if (exists(file) && /noindex/.test(read(file))) err(`${file}: صفحة فهرسية (${route}) تحمل noindex!`);
}
if (!/noindex/.test(read("src/pages/HomePage.tsx"))) ok("لا تسرب noindex لأي صفحة قابلة للفهرسة");

/* ══ 7) منع soft-404/fallback ═══════════════════════════════════════════ */
section("soft-404: slug غير الصحيح يعامل كـ 404 حقيقي");
const articlesTs = read("src/data/articles.ts");
if (/articles\[0\]/.test(articlesTs) || /articles\.find\([^)]*\)\s*\|\|\s*articles\[/.test(articlesTs)) {
  err("articles.ts: يوجد fallback إلى أول مقال في getArticleBySlug");
}
if (!/if\s*\(!article\)\s*return\s*<NotFoundPage\s*\/>;/.test(avSrc)) {
  err("ArticleView.tsx: لا يوجد `if (!article) return <NotFoundPage />` — خطر fallback أو انهيار");
}
if (errors === 0) ok("slug غير صحيح → NotFoundPage (noindex) — بلا أي سقوط لمقال آخر");

/* ══ 8) الروابط الداخلية: BFS من الجذر — لا يتيمة ولا مكسورة ═════════════ */
section("الروابط الداخلية: تغطية كاملة ولا صفحات يتيمة");
const routeSet = new Set([...indexableRoutes, "/admin"]);
// حواف الهيكل (App.tsx: شريط التنقل والفوتر) متاحة من كل مسار
const layoutEdges = new Set();
for (const m of appSrc.matchAll(/(?:to|href)="(\/[^"#?]*)"/g)) layoutEdges.add(m[1]);
// حواف خاصة بكل صفحة (الروابط الثابتة داخل ملف الصفحة)
const pageEdges = new Map(); // route -> Set(paths)
for (const [route, file] of Object.entries(PAGE_FILES)) {
  if (!exists(file)) continue;
  const set = new Set();
  for (const m of read(file).matchAll(/(?:to|href)="(\/[^"#?]*)"/g)) set.add(m[1]);
  pageEdges.set(route, set);
}
// مركز الأدلة يربط كل المقالات ديناميكياً ([...articles] + قالب /articles/${slug})
const articlesPageSrc = read("src/pages/ArticlesPage.tsx");
const articlesHubDynamic = /\/articles\/\$\{/.test(articlesPageSrc) && /articles/.test(articlesPageSrc);
if (!articlesHubDynamic) err("ArticlesPage.tsx: لا يربط المقالات ديناميكياً (/articles/${slug}) — المقالات الجديدة ستصبح يتيمة");
// حواف محتوى المقالات (روابط ماركداون داخل النص)
const contentEdges = new Map(); // article route -> Set(paths)
let contentLinks = 0;
for (const a of articles) {
  const set = new Set();
  for (const m of (a.content || "").matchAll(/\]\((\/[^\s)]+)\)/g)) { set.add(m[1]); contentLinks++; }
  contentEdges.set(`/articles/${a.slug}`, set);
}
function edgesFrom(route) {
  const out = new Set(layoutEdges);
  const base = route.startsWith("/articles/") ? "/articles" : route;
  if (pageEdges.has(base)) for (const p of pageEdges.get(base)) out.add(p);
  if (base === "/articles" && articlesHubDynamic) for (const r of articleRoutes) out.add(r);
  if (contentEdges.has(route)) for (const p of contentEdges.get(route)) out.add(p);
  if (route === "/") { /* مركز الأدلة متاح من الهيكل أصلاً */ }
  return out;
}
// BFS من "/"
const visited = new Set(["/"]);
const queue = ["/"];
while (queue.length) {
  const cur = queue.shift();
  for (const nxt of edgesFrom(cur)) {
    if (nxt === "/" || !routeSet.has(nxt)) continue;
    if (!visited.has(nxt)) { visited.add(nxt); queue.push(nxt); }
  }
}
const orphans = indexableRoutes.filter((r) => r !== "/" && !visited.has(r));
for (const o of orphans) err(`صفحة يتيمة (orphan): ${o} غير متاحة عبر روابط داخلية من الجذر`);
if (orphans.length === 0) ok(`كل الصفحات القابلة للفهرسة (${indexableRoutes.length}) متاحة داخلياً من الجذر`);
// روابط داخلية مكسورة: كل هدف ثابت يجب أن يكون مساراً منشوراً
let broken = 0;
const checkTargets = (src, label) => {
  for (const m of src.matchAll(/(?:to|href)="(\/[^"#?]*)"/g)) {
    if (!routeSet.has(m[1]) && !/\.(png|webp|jpg|svg|ico|xml|txt|css|js)$/.test(m[1])) { err(`${label}: رابط داخلي مكسور: ${m[1]}`); broken++; }
  }
};
for (const f of ["src/App.tsx", ...Object.values(PAGE_FILES), "src/pages/ArticleView.tsx", "src/pages/AdminPage.tsx"]) {
  if (exists(f)) checkTargets(read(f), f);
}
for (const [route, set] of contentEdges) {
  for (const p of set) if (!routeSet.has(p)) { err(`${route}: رابط مكسور في محتوى المقال: ${p}`); broken++; }
}
if (broken === 0) ok(`لا روابط داخلية مكسورة (شملت ${contentLinks} رابط محتوى في المقالات)`);

/* ══ 9) حارس YMYL التجاري: لا بيع/أسعار/جرعات رقمية ═════════════════════ */
section("حارس YMYL: لا أسعار ولا بيع ولا جرعات رقمية ذاتية");
const HARD_COMMERCIAL = [
  { re: /\d[\d.,]*\s*(?:ريال|ر\.س|درهم|دينار|جنيه|دولار|kwd|sar|aed)/i, name: "سعر بعملة" },
  { re: /اطلب الآن|التوصيل السريع|متوفر للبيع|للطلب والشراء|أرخص سعر|سعر خاص/, name: "عبارة بيع مباشرة" },
  { re: /(?:رابط|مصدر)\s*(?:شراء|للشراء)/, name: "مصدر شراء", negatable: true },
  { re: /\d+\s*(?:mg|mcg|µg|μg)\b|\d+\s*(?:ملغ|ميكروغرام)/i, name: "جرعة رقمية (تحذير)", soft: true }
];
// عبارات مثل «لا نوفر أي مصدر شراء» تنويهات تحذيرية مشروعة — لا تُحاسب.
// نعفها إذا سبقها نفي ضمن نافذة قريبة قبل موضع المطابقة.
const NEGATION_RE = /(لا|ليس|ليست|يمنع|المنع|بدون|دون|رفض|استبعاد|تتجنب|تجنّب)/;
function isNegatedDisclaimer(text, matchIndex) {
  return NEGATION_RE.test(text.slice(Math.max(0, matchIndex - 45), matchIndex));
}
for (const a of articles) {
  const text = [a.title, a.summary, a.content, ...(a.faq || []).flatMap((f) => [f.q, f.a])].join("\n");
  for (const pat of HARD_COMMERCIAL) {
    const m = pat.re.exec(text);
    if (!m) continue;
    if (pat.soft) {
      warn(`${a.slug}: ${pat.name} — "${m[0]}" — راجع أنها ليست تعليمات استخدام ذاتي`);
    } else if (pat.negatable && isNegatedDisclaimer(text, m.index)) {
      warn(`${a.slug}: وردت عبارة "${m[0]}" في سياق تنويه نافٍ (مقبولة) — للتأكيد البشري فقط`);
    } else {
      err(`${a.slug}: محتوى تجاري ممنوع (${pat.name}): "${m[0]}"`);
    }
  }
}
if (errors === 0) ok("لا محتوى تجاري (أسعار/بيع/روابط شراء) في أي مقال — والجرعات الرقمية غائبة");

/* ══ الخلاصة ════════════════════════════════════════════════════════════ */
console.log("\n" + "═".repeat(66));
console.log(`النتيجة: أخطاء=${errors} | تحذيرات=${warnings}`);
if (errors > 0) { console.error("✖ Indexing Audit FAILED."); process.exit(1); }
console.log("✔ Indexing Audit PASSED — بنية الفهرسة مكتملة ومؤتمتة.");
