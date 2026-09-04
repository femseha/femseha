#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Regression Tests — إصلاحات النشر: الصور، الروابط، حد الكلمات، الثيم الفاتح،
 * و SEO (prerender/title/description/canonical/robots/sitemap).
 * ─────────────────────────────────────────────────────────────────────────────
 * التشغيل: npm run test:publishing
 * يتطلب بناء الإنتاج لفحوصات الـprerender — إن لم يوجد dist/ يشغّل npm run build
 * تلقائياً (بناء الإنتاج نفسه، لا dev).
 * لا يلمس الملفات الحقيقية: كل محاكاة النشر تكتب في .self-test/publishing فقط.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { createServer } from "vite";

const ROOT = process.cwd();
const SANDBOX = path.join(ROOT, ".self-test", "publishing");
const DIST = path.join(ROOT, "dist");

let pass = 0;
let fail = 0;
const results = [];
function check(name, ok, extra = "") {
  if (ok) pass += 1;
  else fail += 1;
  results.push(`${ok ? "PASS" : "FAIL"}  ${ok ? "✔" : "✖"} ${name}${ok ? "" : ` — ${extra}`}`);
  console.log(results[results.length - 1]);
}
const section = (t) => console.log(`\n── ${t} ${"─".repeat(Math.max(4, 58 - t.length))}`);

/* بناء الإنتاج (مطلوب لفحوصات prerender) */
if (!fs.existsSync(path.join(DIST, "index.html"))) {
  console.log("… لا يوجد dist/ — تشغيل npm run build (بناء الإنتاج) أولاً");
  execSync("npm run build", { stdio: "inherit", cwd: ROOT });
}

const articles = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/articles.json"), "utf8"));

/* تحميل الوحدات عبر Vite SSR */
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});
const articleView = await server.ssrLoadModule("/src/pages/ArticleView.tsx");
const rules = await server.ssrLoadModule("/src/lib/article-rules.ts");
const ghPublish = await server.ssrLoadModule("/src/lib/github-publish.ts");
const seoMod = await server.ssrLoadModule("/src/lib/seo.ts");
const { renderRoute } = await server.ssrLoadModule("/scripts/ssr-entry.tsx");
const { renderToString } = await import("react-dom/server");
const React = (await import("react")).default;

try {
  /* ══ 1) الصور: اسم ملف آمن + الرابط النهائي الصحيح ══ */
  section("الصور: اسم الملف الآمن والرابط العام النهائي");

  const n1 = ghPublish.safeUploadName("صورة المقال الجديدة !!!");
  check("اسم الرفع: أحرف عربية ومسافات وعلامات تُطهَّر إلى [a-z0-9-]", /^[a-z0-9-]+\.jpg$/.test(n1) && !n1.includes("--"), n1);
  const n2 = ghPublish.safeUploadName("../../etc/passwd");
  check("اسم الرفع: path traversal ممنوع (لا .. ولا /)", /^[a-z0-9-]+\.jpg$/.test(n2) && !n2.includes("..") && !n2.includes("/"), n2);
  const n3 = ghPublish.safeUploadName("   ");
  check("اسم الرفع: الاسم الفارغ يحصل على base آمن (image)", n3.startsWith("image-"), n3);
  const n4 = ghPublish.safeUploadName("my article title");
  const n5 = ghPublish.safeUploadName("my article title");
  check("اسم الرفع: التفرد (لا اعتماد على الاسم الأصلي وحده)", n4 !== n5, `${n4} vs ${n5}`);
  check(
    "اسم الرفع: طول معقول",
    [n1, n2, n3, n4].every((x) => x.length <= 64),
    ""
  );

  const u1 = ghPublish.uploadedImageUrl("abc-123.jpg");
  check("رابط الصورة النهائي: بدون /public/ (جذر النطاق)", u1 === "https://femseha.com/images/uploads/abc-123.jpg", u1);

  /* ══ 2) الصور: تطهير الرابط المحفوظ في بيانات المقال (الخادم) ══ */
  section("الصور: sanitizeImage (النمط القديم المكسور يُصحح)");
  const { sanitizeImage } = await import("./admin-publish.mjs");
  check(
    "رابط https مع /public/ يُصحح إلى المسار العام",
    sanitizeImage("https://femseha.com/public/images/uploads/x-mtm1.jpg") === "https://femseha.com/images/uploads/x-mtm1.jpg",
    String(sanitizeImage("https://femseha.com/public/images/uploads/x-mtm1.jpg"))
  );
  check(
    "مسار داخلي /public/images/ يُصحح",
    sanitizeImage("/public/images/uploads/x.jpg") === "/images/uploads/x.jpg",
    String(sanitizeImage("/public/images/uploads/x.jpg"))
  );
  check("مسار /images/ صحيح يمر كما هو", sanitizeImage("/images/uploads/x.jpg") === "/images/uploads/x.jpg", "");
  check("blob: URL مرفوض", sanitizeImage("blob:https://example.com/x") === undefined, "");
  check("data: URL مرفوض", sanitizeImage("data:image/png;base64,AAAA") === undefined, "");
  check("مسار ملف محلي مرفوض", sanitizeImage("C:\\Users\\pic.jpg") === undefined, "");
  check("قيمة فارغة/غير نصية مرفوضة", sanitizeImage("") === undefined && sanitizeImage(null) === undefined, "");

  /* ══ 3) بيانات المقالات المنشورة: لا روابط صور مكسورة بالنمط /public/ ══ */
  section("الصور: articles.json المنشور خالٍ من نمط /public/ المكسور");
  const badImages = articles.filter((a) => a.image && /\/public\//.test(a.image));
  check("لا يوجد أي مقال منشور بصورة /public/", badImages.length === 0, badImages.map((a) => a.slug).join(", "));

  /* ══ 4) دورة كاملة: upload(نمط قديم) → persist → مقال منشور → رابط الصورة ══ */
  section("دورة النشر الكاملة: صورة + روابط → persist → مقال منشور");
  fs.rmSync(SANDBOX, { recursive: true, force: true });
  fs.mkdirSync(path.join(SANDBOX, "requests"), { recursive: true });
  const sandboxArticlesPath = path.join(SANDBOX, "articles.json");
  const sandboxSitemapPath = path.join(SANDBOX, "sitemap.xml");
  fs.copyFileSync(path.join(ROOT, "src/data/articles.json"), sandboxArticlesPath);

  const shortContent = [
    "### متابعة صحة المرأة بعد الفحص",
    "",
    "شرح تجريبي مع [اقرئي أيضاً](/articles/cytotec-misoprostol-saudi-riyadh-guide) داخل الفقرة، و**رابط مهم**: [وزارة الصحة](https://www.moh.gov.sa/) يبقى كما هو بعد النشر.",
    "",
    "* نقطة توضيحية أولى للمتابعة",
    "* نقطة توضيحية ثانية للتوثيق",
    "* نقطة توضيحية ثالثة للتقييم المباشر",
    "",
    "خلاصة تجريبية قصيرة تؤكد أن المحتوى الصالح يُنشر دون شرط طول إضافي وبأن الروابط تبقى محفوظة كما كُتبت في المحرر تماماً قبل الإرسال.",
  ].join("\n");

  fs.writeFileSync(
    path.join(SANDBOX, "requests", "req-reg-1.json"),
    JSON.stringify(
      {
        id: "req-reg-1",
        mode: "manual",
        title: "اختبار دورة النشر الكاملة للصور والروابط في المنصة التجريبي",
        primaryKeyword: "دورة النشر الكاملة التجريبية",
        secondaryKeywords: [],
        country: null,
        category: "general-health",
        image: "https://femseha.com/public/images/uploads/regression-upload.jpg",
        slug: "self-test-full-cycle",
        summary:
          "ملخص تجريبي لدورة النشر الكاملة: صورة مرفوعة بالنمط القديم وروابط داخلية وخارجية يجب أن تبقى محفوظة في المقال المنشور دون أي حذف أو كسر للروابط.",
        content: shortContent,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );
  const { processRequests } = await import("./admin-publish.mjs");
  const summary = await processRequests({
    requestsDir: path.join(SANDBOX, "requests"),
    articlesPath: sandboxArticlesPath,
    sitemapPath: sandboxSitemapPath,
    selfTest: true,
  });
  const sandboxArticles = JSON.parse(fs.readFileSync(sandboxArticlesPath, "utf8"));
  const published = sandboxArticles.find((a) => a.slug === "self-test-full-cycle");
  check("المقال التجريبي نُشر فعلاً", Boolean(published) && summary.published === 1, JSON.stringify(summary));
  check(
    "رابط الصورة المحفوظ في المقال المنشور هو الرابط العام الصحيح (بلا /public/)",
    published && published.image === "https://femseha.com/images/uploads/regression-upload.jpg",
    String(published && published.image)
  );
  check(
    "الروابط الداخلية والخارجية بقيت محفوظة بعد الحفظ والنشر",
    Boolean(
      published &&
        published.content.includes("[اقرئي أيضاً](/articles/cytotec-misoprostol-saudi-riyadh-guide)") &&
        published.content.includes("[وزارة الصحة](https://www.moh.gov.sa/)")
    ),
    ""
  );
  check(
    "المقال المنشور موجود في sitemap الـsandbox",
    fs.existsSync(sandboxSitemapPath) && fs.readFileSync(sandboxSitemapPath, "utf8").includes("/articles/self-test-full-cycle"),
    ""
  );

  /* ══ 5) حد الكلمات: إزالة 1400 + رفض الفراغ ══ */
  section("حد الكلمات: قصير صالح → نشر | فارغ → رفض");
  const mkDraft = (content) => ({
    title: "دليل تجريبي لفحص حد الكلمات الأدنى في لوحة الإدارة",
    primaryKeyword: "فحص حد الكلمات التجريبي",
    secondaryKeywords: [],
    country: null,
    category: "general-health",
    image: null,
    content,
    summary:
      "ملخص تجريبي لفحص حد الكلمات: يتحقق أن المقال القصير الصالح يمكن نشره دون شرط طول إضافي وأن المحتوى الفارغ يُرفض دائماً.",
    slug: "self-test-word-limit",
    editSlug: null,
  });
  const sixtyWords = Array.from({ length: 60 }, (_, i) => `كلمة${i + 1}`).join(" ");
  const long1400 = Array.from({ length: 1450 }, (_, i) => `كلمة${i % 97}`).join(" ");
  const tiny = Array.from({ length: 10 }, (_, i) => `كلمة${i + 1}`).join(" ");
  const e60 = rules.validateManualDraft(mkDraft(sixtyWords), articles);
  check("مقال قصير (~60 كلمة) صالح: لا أخطاء حد الكلمات", !e60.some((x) => /كلمة|فارغ/.test(x)), e60.join(" | "));
  const eLong = rules.validateManualDraft(mkDraft(long1400), articles);
  check("مقال 1400+ كلمة صالح: لا أخطاء حد الكلمات", !eLong.some((x) => /كلمة|فارغ/.test(x)), eLong.join(" | "));
  const eEmpty = rules.validateManualDraft(mkDraft("   "), articles);
  check("مقال فارغ مرفوض", eEmpty.some((x) => /فارغ/.test(x)), eEmpty.join(" | "));
  const eTiny = rules.validateManualDraft(mkDraft(tiny), articles);
  check("محتوى شبه فارغ (10 كلمات) مرفوض", eTiny.some((x) => /شبه فارغ/.test(x)), eTiny.join(" | "));
  check(
    "لم يعد هناك حد إجباري 1400 كلمة في القواعد",
    rules.LIMITS.MIN_WORDS < 1400,
    String(rules.LIMITS.MIN_WORDS)
  );

  /* ══ 6) الروابط: عرض آمن وقابل للنقر + رفض الخطير ══ */
  section("الروابط: العرض والبقاء والأمان");
  const { MemoryRouter } = await import("react-router-dom");
  const H = (s) =>
    renderToString(React.createElement(MemoryRouter, null, articleView.renderInline(s, "t")));

  const hInt = H("نص قبل [اقرئي أيضاً](/articles/cytotec-misoprostol-saudi-riyadh-guide) وبعده");
  check(
    "رابط داخلي داخل فقرة: يبقى <a> قابلاً للنقر بالنص العربي",
    hInt.includes('href="/articles/cytotec-misoprostol-saudi-riyadh-guide"') && hInt.includes("اقرئي أيضاً") && hInt.includes("نص قبل"),
    hInt.slice(0, 160)
  );

  const hExt = H("[وزارة الصحة](https://www.moh.gov.sa/)");
  check(
    "رابط خارجي https: target=_blank و rel=noopener noreferrer",
    hExt.includes('href="https://www.moh.gov.sa/"') && hExt.includes('target="_blank"') && hExt.includes('rel="noopener noreferrer"'),
    hExt.slice(0, 200)
  );

  const hBoldLink = H("**رابط مهم: [وزارة الصحة](https://www.moh.gov.sa/)**");
  check(
    "رابط داخل **عريض**: لا يتحول إلى نص (يبقى <a> داخل <strong>)",
    /<strong[^>]*>.*<a [^>]*href="https:\/\/www\.moh\.gov\.sa\/".*<\/strong>/s.test(hBoldLink),
    hBoldLink.slice(0, 220)
  );

  const hBoldWrapped = H("**[اقرئي المزيد](/articles/pcos-symptoms-fertility-treatment)**");
  check(
    "رابط ملفوف كاملاً بعريض: يبقى رابطاً لا نصاً",
    /<a [^>]*href="\/articles\/pcos-symptoms-fertility-treatment"/.test(hBoldWrapped),
    hBoldWrapped.slice(0, 220)
  );

  const hMulti = H("[الأول](https://www.moh.gov.sa/) وسيط [الثاني](/articles/doctor-page-test)");
  check(
    "أكثر من رابط في السطر: كلاهما يبقى رابطاً",
    (hMulti.match(/<a /g) || []).length === 2,
    hMulti.slice(0, 240)
  );

  const hJs = H("[اضغطي هنا](javascript:alert(1))");
  check(
    "رابط javascript: لا يُعرض كرابط قابل للنقر (نص فقط)",
    !/href="javascript:/i.test(hJs) && hJs.includes("اضغطي هنا"),
    hJs.slice(0, 160)
  );
  const hData = H("[تحميل](data:text/html;base64,PHNjcmlwdD4)");
  check("رابط data: لا يُعرض كرابط قابل للنقر", !/href="data:/i.test(hData), hData.slice(0, 160));
  const hNoScheme = H("[رابط](moh.gov.sa/page)");
  check("رابط بلا scheme لا يُعرض كرابط قابل للنقر", !/<a /.test(hNoScheme), hNoScheme.slice(0, 160));

  const dJs = rules.dangerousContentLinks("نص [اضغطي](javascript:alert(1)) و[آخر](https://ok.example.com)");
  check("validate: رابط javascript: يُكتشف في القواعد", dJs.length === 1, JSON.stringify(dJs));
  const eJs = rules.validateManualDraft(
    { ...mkDraft(sixtyWords), content: `${sixtyWords}\n\n[اضغطي هنا](javascript:alert(1))` },
    articles
  );
  check("validate: رابط غير آمن يمنع النشر من المتصفح", eJs.some((x) => /غير آمن/.test(x)), eJs.join(" | "));

  check(
    "isSafeHref: مسموح = داخلي وhttps/http وmailto/tel فقط",
    articleView.isSafeHref("/articles/x") &&
      articleView.isSafeHref("https://www.moh.gov.sa/") &&
      articleView.isSafeHref("http://example.com") &&
      articleView.isSafeHref("mailto:a@b.com") &&
      articleView.isSafeHref("tel:+966500000000") &&
      !articleView.isSafeHref("javascript:alert(1)") &&
      !articleView.isSafeHref("data:text/plain,x") &&
      !articleView.isSafeHref("vbscript:x") &&
      !articleView.isSafeHref("file:///etc/passwd") &&
      !articleView.isSafeHref("blob:https://x/y"),
    ""
  );

  check(
    "بقاء الروابط بعد النشر → ثم عرضها: الروابط المحفوظة تُعرض قابلة للنقر",
    Boolean(
      published &&
        /<a [^>]*href="https:\/\/www\.moh\.gov\.sa\/"/.test(
          renderToString(
            React.createElement(MemoryRouter, null, articleView.renderInline(published.content.split("\n").find((l) => l.includes("moh.gov.sa")) || "", "pub"))
          )
        )
    ),
    ""
  );

  /* ══ 7) الثيم الفاتح ══ */
  section("الثيم: المقالات + قائمة المقالات + الإدارة فاتحة، والرئيسية كما هي");
  const articleHtml = renderRoute(`/articles/${articles[0].slug}`);
  check("صفحة المقال: غلاف فاتح يغطي الشاشة (bg-slate-50 min-h-screen)", /min-h-screen bg-slate-50/.test(articleHtml), "");
  check("صفحة المقال: بطاقة بيضاء bg-white بحدود فاتحة", /bg-white[^"]*border-slate-200/.test(articleHtml), "");
  check("صفحة المقال: عنوان داكن text-slate-900", articleHtml.includes("text-slate-900"), "");
  // فحص منطقة المقال نفسها (<article>) — الهيدر/الفوتر المشتركان يبقيان هوية الموقع كما هي
  const articleRegion = (articleHtml.match(/<article[\s\S]*<\/article>/) || [""])[0];
  check("منطقة المقال: بلا خلفيات داكنة (bg-slate-950/900)", !/bg-slate-9(50|00)/.test(articleRegion), "");
  // نص أبيض مسموح فقط على أزرار CTA الملونة (واتساب/اتصال — هوية ثابتة)،
  // لا على العناوين أو الفقرات أو البطاقات.
  const whiteOnColoredOnly = (articleRegion.match(/class="[^"]*text-white[^"]*"/g) || []).every(
    (c) => /bg-(emerald|sky|blue)-/.test(c)
  );
  check("منطقة المقال: بلا نص أبيض على عناوين/فقرات (CTA الملون فقط)", whiteOnColoredOnly, "");
  check("صفحة المقال: نص المحتوى داكن text-slate-700", articleHtml.includes("text-slate-700"), "");
  check("صفحة المقال: روابط زرقاء واضحة text-blue-700", articleHtml.includes("text-blue-700"), "");
  check("صفحة المقال: الصورة المنشورة بالرابط الصحيح تُعرض", articleHtml.includes("images/uploads/") && !articleHtml.includes("/public/images/"), "");
  check("صفحة المقال: alt الصورة من عنوان المقال", /alt="[^"]+"/.test(articleHtml), "");

  const articlesListHtml = renderRoute("/articles");
  check("قائمة المقالات: خلفية فاتحة تغطي الشاشة وبطاقات بيضاء", /min-h-screen bg-slate-50/.test(articlesListHtml) && /bg-white/.test(articlesListHtml), "");
  const listCardsRegion = articlesListHtml;
  check("قائمة المقالات: بلا بطاقات داكنة", !/bg-slate-900 rounded-2xl/.test(listCardsRegion), "");

  const homeHtml = renderRoute("/");
  check("الصفحة الرئيسية: لم تتأثر (بانر داكن كما هو)", homeHtml.includes("bg-slate-950"), "");
  check("الصفحة الرئيسية: تعرض المقالات (اكتشاف داخلي)", homeHtml.includes("/articles/"), "");

  const adminHtml = renderRoute("/admin");
  check("لوحة الإدارة: خلفية فاتحة bg-slate-50 وبطاقة بيضاء", adminHtml.includes("bg-slate-50") && adminHtml.includes("bg-white"), "");
  check("لوحة الإدارة: تبويب نشط أزرق (هوية فاتحة)", adminHtml.includes("bg-blue-600") && !adminHtml.includes("bg-slate-900 text-white"), "");

  /* ══ 8) SEO: prerender + head + sitemap + robots ══ */
  section("SEO: HTML الخام للمقالات (prerender)");
  const target = articles[0];
  const prerenderedPath = path.join(DIST, "articles", target.slug, "index.html");
  check("dist/articles/<slug>/index.html مولود", fs.existsSync(prerenderedPath), prerenderedPath);
  const prerendered = fs.readFileSync(prerenderedPath, "utf8");
  const expectedTitle = `${target.title} | منصة فصيحة الطبية`;
  check("title المقال في HTML الخام", prerendered.includes(`<title>${expectedTitle}</title>`), "");
  check("description المقال في HTML الخام", prerendered.includes(`content="${target.summary.slice(0, 160).replace(/"/g, "&quot;")}"`), "");
  check("canonical ذاتي صحيح (ليس الرئيسية)", prerendered.includes(`rel="canonical" href="https://femseha.com/articles/${target.slug}"`), "");
  check("لا noindex في صفحة المقال", !/name="robots" content="[^"]*noindex/i.test(prerendered), "");
  check("JSON-LD MedicalWebPage بمصدر useSeo", prerendered.includes('"@type":"MedicalWebPage"') && prerendered.includes(`"url":"https://femseha.com/articles/${target.slug}"`), "");
  check("محتوى المقال موجود في HTML الخام (اكتشاف بلا JS)", prerendered.includes("<div id=\"root\">") && prerendered.includes(target.title), "");
  check("روابط داخلية ظاهرة في HTML الخام (اكتشاف الزواحف)", /href="\/articles\//.test(prerendered), "");

  const sitemapXml = fs.readFileSync(path.join(ROOT, "public/sitemap.xml"), "utf8");
  check("المقال موجود في sitemap.xml", sitemapXml.includes(`https://femseha.com/articles/${target.slug}`), "");
  const robotsTxt = fs.readFileSync(path.join(ROOT, "public/robots.txt"), "utf8");
  check(
    "robots.txt لا يمنع المقالات أو الأصول",
    robotsTxt.includes("Allow: /") && !/Disallow:\s*\/articles/.test(robotsTxt) && !/Disallow:\s*\/images/.test(robotsTxt),
    ""
  );
  check("robots.txt يمنع /admin", /Disallow:\s*\/admin/.test(robotsTxt), "");

  const adminPrerendered = fs.readFileSync(path.join(DIST, "admin", "index.html"), "utf8");
  check("/admin المولّد: noindex,nofollow كما يضبطه useSeo", /name="robots" content="noindex, nofollow"/.test(adminPrerendered), "");
  check("/admin المولّد: بلا canonical", !/rel="canonical"/.test(adminPrerendered), "");

  const homePrerendered = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
  check("الرئيسية المولّدة: canonical للرئيسية", homePrerendered.includes('rel="canonical" href="https://femseha.com/"'), "");
  check("الرئيسية المولّدة: محتوى ظاهر بلا JS", homePrerendered.includes("أحدث المقالات الطبية") || homePrerendered.includes("/articles/"), "");

  /* اتساق computeStaticHead مع useSeo (نفس المصدر) */
  seoMod.beginSsrSeoCapture();
  renderRoute(`/articles/${target.slug}`);
  const captured = seoMod.capturedSsrSeo();
  const head = seoMod.computeStaticHead(captured || {});
  check(
    "computeStaticHead: canonical ذاتي وrobots فارغ للمقال (مرآة useSeo)",
    head.canonicalUrl === `https://femseha.com/articles/${target.slug}` && head.robots === null && head.title === expectedTitle,
    JSON.stringify({ canonicalUrl: head.canonicalUrl, robots: head.robots })
  );
} finally {
  await server.close();
}

console.log(`\n═══ نتيجة اختبارات الـregression: PASS=${pass} | FAIL=${fail} ═══`);
if (fail > 0) process.exit(1);
