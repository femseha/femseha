#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * اختبارات الانحدار (Regression) لإصلاحات النشر:
 *   الصور (upload → persist → published URL)، الروابط (داخلية/خارجية/خطيرة)،
 *   إزالة شرط 1400 كلمة، Light Theme، وتحقق مخرجات prerender الإنتاجية.
 *
 * التشغيل: node scripts/test-publishing-fixes.mjs
 *   - يختبر المنطق المشترك عبر Vite SSR loader (نفس آلية ssr-verify).
 *   - يفحص dist/ بعد البناء (شغّله بعد `npm run build`).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import fs from "node:fs";
import path from "node:path";
import { createServer } from "vite";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const ARTICLES_PATH = path.join(ROOT, "src", "data", "articles.json");

let failures = 0;
let passes = 0;
function check(name, ok, detail = "") {
  if (ok) {
    passes++;
    console.log(`PASS  ✔ ${name}`);
  } else {
    failures++;
    console.error(`FAIL  ✖ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}
const section = (t) => console.log(`\n── ${t} ${"─".repeat(Math.max(4, 60 - t.length))}`);

/* ══ 1) قواعد روابط الصور ═════════════════════════════════════════════════ */
section("الصور: رابط النشر النهائي صحيح وآمن");

const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf8"));

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const imgMod = await server.ssrLoadModule("/src/lib/image-url.ts");
  const { uploadedImagePublicUrl, normalizePublicImageUrl, UPLOADS_REPO_DIR, UPLOADS_PUBLIC_DIR } = imgMod;

  check("مسار التخزين في المستودع هو public/images/uploads", UPLOADS_REPO_DIR === "public/images/uploads");
  check("مسار الخدمة العامة هو /images/uploads (بلا بادئة public/)", UPLOADS_PUBLIC_DIR === "/images/uploads");

  // الرابط النهائي المولّد بعد الرفع يجب ألا يحتوي /public/
  const url = uploadedImagePublicUrl("my-article-mtm1y3ps.jpg");
  check("رابط الصورة المولّد مطلق وصحيح", url === "https://femseha.com/images/uploads/my-article-mtm1y3ps.jpg", url);
  check("الرابط المولّد لا يحتوي /public/", !url.includes("/public/"));

  // إصلاح الروابط القديمة المكسورة
  const fixed = normalizePublicImageUrl("https://femseha.com/public/images/uploads/image-mtm1y3ps.jpg");
  check("تطبيع الرابط القديم /public/images/ يزيل البادئة", fixed === "https://femseha.com/images/uploads/image-mtm1y3ps.jpg", fixed);

  // رفض الروابط غير القابلة للنشر
  check("blob URL مرفوض", normalizePublicImageUrl("blob:https://femseha.com/abc-123") === null);
  check("data URL مرفوض", normalizePublicImageUrl("data:image/png;base64,iVBORw0KGgo=") === null);
  check("file path مرفوض", normalizePublicImageUrl("file:///tmp/photo.jpg") === null);
  check("مسار نسبي /images/ مقبول", normalizePublicImageUrl("/images/uploads/x.jpg") === "/images/uploads/x.jpg");
  check("رابط https خارجي سليم مقبول", normalizePublicImageUrl("https://example.com/a.jpg") === "https://example.com/a.jpg");
  check("قيمة فارغة تُرجع null", normalizePublicImageUrl("  ") === null);

  // كل صور المقالات المنشورة حالياً: إما banner (تُستبعد بصرياً) أو رابط صحيح بلا /public/
  const badPersisted = articles
    .filter((a) => a.image && /\/public\//.test(a.image))
    .map((a) => a.slug);
  check("لا توجد صورة مقال محفوظة برابط /public/ مكسور", badPersisted.length === 0, badPersisted.join(", "));

  // الصورة المرفوعة فعلياً موجودة في المستودع على مسار التخزين الصحيح
  const uploadsDir = path.join(ROOT, "public", "images", "uploads");
  const onDisk = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
  check("مجلد الصور المرفوعة موجود ويحتوي ملفات", onDisk.length > 0, onDisk.join(","));

  /* ══ 2) الروابط في المحتوى ═════════════════════════════════════════════ */
  section("الروابط: داخلية/خارجية/خطيرة (لا تُحذف، قابلة للنقر، آمنة)");

  const rules = await server.ssrLoadModule("/src/lib/article-rules.ts");

  // رابط داخلي سليم
  const internal = `مقدمة قصيرة للمقال.\n\nراجعي [دليل سايتوتك](/articles/${articles[0].slug}) للمزيد.`;
  check("رابط داخلي لمقال منشور لا يُعتبر مكسوراً", rules.brokenInternalLinks(internal, articles).length === 0);

  // رابط داخلي مكسور
  const brokenInternal = "راجعي [رابط مكسور](/articles/non-existent-slug-xyz)";
  check("رابط داخلي مكسور يُرصد", rules.brokenInternalLinks(brokenInternal, articles).includes("/articles/non-existent-slug-xyz"));

  // رابط المقال الجديد إلى ذاته مسموح وقت الإنشاء
  const selfLink = "اقرئي أيضاً: [المقال](/articles/my-brand-new-slug)";
  check("رابط المقال إلى ذاته مسموح وقت النشر الجديد",
    rules.brokenInternalLinks(selfLink, articles, "my-brand-new-slug").length === 0);

  // روابط خارجية https سليمة
  const external = "راجعي [وزارة الصحة](https://www.moh.gov.sa/) أو [الهيئة](https://www.sfda.gov.sa/)";
  check("روابط خارجية https سليمة لا تُعتبر خطيرة", rules.unsafeExternalLinks(external).length === 0);
  check("الروابط الخارجية السليمة قابلة للعرض (isSafeExternalHref)", rules.isSafeExternalHref("https://www.moh.gov.sa/") === true);

  // نص رابط بالعربية + أكثر من رابط في فقرة
  const arabicMulti = "راجعي [وزارة الصحة السعودية](https://www.moh.gov.sa/) و[منظمة الصحة](https://www.who.int/) معاً.";
  check("أكثر من رابط خارجي في فقرة عربية سليمة", rules.unsafeExternalLinks(arabicMulti).length === 0);

  // روابط خطيرة
  check("javascript: مرفوض", rules.unsafeExternalLinks("انقر [هنا](javascript:alert(1))").length === 1);
  check("data: مرفوض", rules.unsafeExternalLinks("[x](data:text/html,<script>alert(1)</script>)").length === 1);
  check("vbscript: مرفوض", rules.unsafeExternalLinks("[x](vbscript:msgbox(1))").length === 1);
  check("isSafeExternalHref يرفض javascript:", rules.isSafeExternalHref("javascript:alert(1)") === false);
  check("isSafeExternalHref يرفض data:", rules.isSafeExternalHref("data:text/html,x") === false);

  // تحقق المقال اليدوي الكامل: مقال قصير صالح مع روابط داخلية وخارجية يمر
  const shortValid = {
    title: "دليل قصير تجريبي للتحقق من قواعد النشر اليدوي",
    primaryKeyword: "كلمة مفتاحية تجريبية فريدة جداً xyz",
    secondaryKeywords: [],
    country: null,
    category: "general-health",
    image: null,
    content:
      "هذا مقال تجريبي قصير لكنه صالح للنشر، يحتوي على مقدمة وعدد كاف من الكلمات لتجاوز حارس المحتوى الفارغ.\n\n" +
      `راجعي [دليل منشور](${`/articles/${articles[0].slug}`}) و[وزارة الصحة](https://www.moh.gov.sa/) للمزيد من المعلومات الموثوقة. ` +
      "نضيف بضع جمل إضافية للتأكد من تجاوز الحد الأدنى البسيط لمنع النشر الفارغ، مع الحفاظ على محتوى تثقيفي مسؤول وآمن دون جرعات أو أسعار.",
    summary: "وصف تعريفي تجريبي فريد لا يتكرر مع أي مقال منشور في النظام حالياً على الإطلاق.",
    summary:
      "وصف تعريفي تجريبي فريد لا يتكرر مع أي مقال منشور في النظام حالياً على الإطلاق، يصف محتوى الدليل القصير الصالح للنشر.",
    slug: "short-valid-test-xyz",
  };
  const shortErrs = rules.validateManualDraft(shortValid, articles);
  check(
    "مقال قصير صالح (أقل من 1400 كلمة) مع روابط سليمة يمر الفحص",
    shortErrs.length === 0,
    shortErrs.join(" | ")
  );

  // مقال فارغ يُرفض
  const emptyErrs = rules.validateManualDraft(
    {
      ...shortValid,
      title: "عنوان تجريبي آخر مختلف تماماً للنشر الفارغ",
      content: "   ",
      slug: "empty-test-xyz",
      summary:
        "وصف تعريفي تجريبي آخر فريد لا يتكرر مع أي مقال منشور آخر في النظام حالياً، مخصص لحالة المحتوى الفارغ.",
    },
    articles
  );
  check("المحتوى الفارغ/شبه الفارغ يُرفض", emptyErrs.some((e) => e.includes("فارغ")));

  // شرط 1400 كلمة لم يعد موجوداً
  check("LIMITS.MIN_WORDS لم يعد 1400 (حارس فارغ فقط)", rules.LIMITS.MIN_WORDS !== 1400 && rules.LIMITS.MIN_WORDS <= 100, String(rules.LIMITS.MIN_WORDS));

  // مقال فيه رابط خطير يُرفض
  const unsafeErrs = rules.validateManualDraft(
    {
      ...shortValid,
      title: "عنوان تجريبي ثالث للروابط الخطيرة",
      content: shortValid.content + "\n\n[رابط خطير](javascript:alert(1))",
      slug: "unsafe-test-xyz",
      summary:
        "وصف تعريفي تجريبي ثالث فريد لا يتكرر مع أي مقال منشور آخر، مخصص لحالة رابط خارجي خطير في المحتوى.",
    },
    articles
  );
  check("مقال برابط javascript: يُرفض", unsafeErrs.some((e) => e.includes("غير آمنة")));

  /* ══ 3) عرض الصفحة: الروابط تُعرض clickable والصورة ═════════════════════ */
  section("عرض ArticleView: روابط clickable + صورة + light theme");

  const { renderRoute } = await server.ssrLoadModule("/scripts/ssr-entry.tsx");
  const articleHtml = renderRoute(`/articles/${articles[0].slug}`);

  check("صفحة المقال تُعرض المحتوى", articleHtml.includes(articles[0].title));
  check("الروابط الداخلية تُعرض كـ href (clickable)", articleHtml.includes('href="/articles/'));
  // الصورة: المقال الأول يملك صورة مرفوعة بعد الإصلاح
  if (articles[0].image && !articles[0].image.includes("banner")) {
    check("صورة المقال المنشور تستخدم الرابط الصحيح (/images/uploads/)",
      articleHtml.includes("/images/uploads/") && !articleHtml.includes("/public/images/"));
    check("صورة المقال تحمل alt", /<img[^>]*alt="[^"]+"/.test(articleHtml));
  }
  // Light theme: لا خلفية داكنة في غلاف صفحة المقال
  check("صفحة المقال: خلفية فاتحة (bg-slate-50)", articleHtml.includes("bg-slate-50"));
  check("صفحة المقال: بطاقة بيضاء (bg-white)", articleHtml.includes("bg-white"));
  check("صفحة المقال: لا تستخدم bg-slate-950 كلون خلفية", !/<article[^>]*bg-slate-9/.test(articleHtml) && !articleHtml.includes('bg-slate-950 py-12'));

  // رابط خارجي في المحتوى يُعرض بسمات الأمان
  const withExternal = renderRoute("/articles/pcos-symptoms-fertility-treatment");
  check("الروابط الخارجية تحمل rel=noopener noreferrer", withExternal.includes('rel="noopener noreferrer"'));

  // صفحة الإدارة light
  const adminHtml = renderRoute("/admin");
  check("لوحة الإدارة تُعرض", adminHtml.includes("لوحة الإدارة والتحكم"));
  check("لوحة الإدارة: خلفية فاتحة (bg-slate-50)", adminHtml.includes("bg-slate-50"));
  check("لوحة الإدارة: البطاقة بيضاء (bg-white)", adminHtml.includes("bg-white"));

  /* ══ 4) فحص مخرجات prerender الإنتاجية (إن وُجد dist) ═════════════════ */
  section("مخرجات prerender الإنتاجية (dist)");
  if (!fs.existsSync(DIST)) {
    console.log("SKIP  dist غير موجود — شغّل `npm run build` أولاً للتحقق من HTML النهائي.");
  } else {
    const a = articles[0];
    const file = path.join(DIST, "articles", a.slug, "index.html");
    check(`ملف prerender للمقال موجود (articles/${a.slug}/index.html)`, fs.existsSync(file));
    if (fs.existsSync(file)) {
      const html = fs.readFileSync(file, "utf8");
      check("HTML النهائي يحمل title المقال", html.includes(a.title) && /<title>[^<]*<\/title>/.test(html));
      check("HTML النهائي يحمل meta description المقال", html.includes('name="description"') && html.includes((a.summary || "").slice(0, 40)));
      check("canonical في HTML النهائي هو رابط المقال نفسه", html.includes(`<link rel="canonical" href="https://femseha.com/articles/${a.slug}"`));
      check("canonical ليس الرئيسية", !html.includes('<link rel="canonical" href="https://femseha.com/"'));
      check("لا noindex في صفحة مقال قابلة للفهرسة", !html.includes('name="robots" content="noindex'));
      check("JSON-LD الخاص بالمقال موجود (MedicalWebPage)", html.includes('"@type":"MedicalWebPage"'));
      check("المحتوى موجود في HTML (SSR) قبل JS", html.includes("<h1"));
      check("صورة المقال في HTML النهائي بلا /public/", html.includes("/images/uploads/") || !a.image);
    }

    const adminFile = path.join(DIST, "admin", "index.html");
    check("ملف prerender للإدارة موجود", fs.existsSync(adminFile));
    if (fs.existsSync(adminFile)) {
      const ah = fs.readFileSync(adminFile, "utf8");
      check("صفحة الإدارة noindex في HTML النهائي", ah.includes('content="noindex, nofollow"'));
      check("صفحة الإدارة بلا canonical", !ah.includes('rel="canonical"'));
    }

    const homeFile = path.join(DIST, "index.html");
    check("ملف الرئيسية index.html موجود", fs.existsSync(homeFile));
    if (fs.existsSync(homeFile)) {
      const hh = fs.readFileSync(homeFile, "utf8");
      check("الرئيسية تحمل canonical الرئيسية", hh.includes('<link rel="canonical" href="https://femseha.com/"'));
      check("الرئيسية بلا noindex", !hh.includes('name="robots" content="noindex'));
    }

    // sitemap النهائي يحتوي كل المقالات
    const sitemapFile = path.join(DIST, "sitemap.xml");
    check("sitemap.xml منسوخ إلى dist", fs.existsSync(sitemapFile));
    if (fs.existsSync(sitemapFile)) {
      const sm = fs.readFileSync(sitemapFile, "utf8");
      const missing = articles.filter((a) => !sm.includes(`/articles/${a.slug}`));
      check("كل المقالات المنشورة موجودة في sitemap", missing.length === 0, missing.map((m) => m.slug).join(","));
    }
    // robots النهائي
    const robotsFile = path.join(DIST, "robots.txt");
    check("robots.txt منسوخ إلى dist", fs.existsSync(robotsFile));
    if (fs.existsSync(robotsFile)) {
      const rb = fs.readFileSync(robotsFile, "utf8");
      check("robots يسمح بالعام (Allow: /)", /Allow:\s*\//.test(rb));
      check("robots يحجب /admin فقط (لا يحجب المقالات)", /Disallow:\s*\/admin/.test(rb) && !/Disallow:\s*\/articles/.test(rb));
    }
  }
} finally {
  await server.close();
}

console.log(`\n${"═".repeat(64)}`);
console.log(`نتيجة اختبارات إصلاحات النشر: نجاح=${passes} | فشل=${failures}`);
if (failures > 0) {
  console.error("✖ توجد اختبارات فاشلة.");
  process.exit(1);
}
console.log("✔ جميع اختبارات إصلاحات النشر ناجحة.");
