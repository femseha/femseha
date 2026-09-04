#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * اختبارات الانحدار (Regression) لإصلاحات النشر — منصة FemSeha
 * ═══════════════════════════════════════════════════════════════════════════
 * يغطي الأعطال التي أُصلحت في هذا العمل فقط:
 *
 *   1) الصور   : upload → persist → published article → image URL (بلا 404)
 *                + فشل الرفع يوقف النشر + ALT موجود.
 *   2) المحتوى : لا شرط 1400 كلمة | مقال قصير صالح يُنشر | الفارغ مرفوض.
 *   3) الروابط : داخلية/خارجية/عربية/متعددة/داخل فقرة/بعد الحفظ والنشر،
 *                والروابط الخطرة مرفوضة ولا تُعرض كروابط.
 *   4) السمة   : صفحة المقال ولوحة الإدارة بسمة فاتحة.
 *
 * لا يستخدم أي مكتبة اختبار جديدة (نفس أسلوب scripts/test-*.mjs القائمة).
 * التشغيل: npm run test:publishing
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { renderToString } from "react-dom/server";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let passed = 0;
let failed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`PASS  ${name}`);
  } else {
    failed += 1;
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function expectThrows(name, fn, matcher) {
  try {
    await fn();
    check(name, false, "لم يُرمَ أي استثناء");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    check(name, matcher ? matcher.test(msg) : true, matcher ? `الرسالة: ${msg}` : "");
  }
}

/* ── نص اختباري ──────────────────────────────────────────────────────── */

const PARAGRAPH =
  "تحتاج المرأة إلى معلومات طبية دقيقة وواضحة عن صحتها الإنجابية، وتوضح المصادر الطبية الموثوقة أن التقييم السريري المبكر يساعد على اكتشاف المشكلات وعلاجها في وقت مناسب دون تأخير أو قلق غير مبرر.";

function contentOfWords(target) {
  let out = "### مقدمة طبية\n\n";
  while (out.split(/\s+/).filter(Boolean).length < target) out += PARAGRAPH + "\n\n";
  return out.trim();
}

const LINKS_CONTENT = [
  "### الروابط داخل المقال",
  "",
  `فقرة تحتوي على رابط داخلي [اقرئي أيضًا](/articles/pcos-symptoms-fertility-treatment) داخل النص، ورابط خارجي [وزارة الصحة](https://www.moh.gov.sa/) في الجملة نفسها.`,
  "",
  "* عنصر قائمة فيه [الهيئة العامة للغذاء والدواء](https://www.sfda.gov.sa/) بنص عربي",
  "",
  "رابط داخلي مطلق [صفحة الاستشارة](https://femseha.com/consultation) بنفس نطاق الموقع.",
  "",
  "رابط بعنوان اختياري [منظمة الصحة العالمية](https://www.who.int/ar \"WHO\") داخل الفقرة.",
  "",
  "رابط مكتوب صريحاً https://www.moh.gov.sa/Pages/Default.aspx داخل الجملة.",
  "",
  "رابط خطر [اضغطي هنا](javascript:alert(1)) يجب ألا يكون قابلاً للنقر.",
].join("\n");

/* ── تشغيل ───────────────────────────────────────────────────────────── */

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const React = (await import("react")).default;
  const { StaticRouter } = await import("react-router-dom/server.js");

  const linksMod = await server.ssrLoadModule("/src/lib/links.ts");
  const imageUrlMod = await server.ssrLoadModule("/src/lib/image-url.ts");
  const rulesMod = await server.ssrLoadModule("/src/lib/article-rules.ts");
  const publishMod = await server.ssrLoadModule("/src/lib/github-publish.ts");
  const markdownMod = await server.ssrLoadModule("/src/lib/markdown.tsx");
  const articleImageMod = await server.ssrLoadModule("/src/components/ArticleImage.tsx");
  const articlesMod = await server.ssrLoadModule("/src/data/articles.ts");
  const { renderRoute } = await server.ssrLoadModule("/scripts/ssr-entry.tsx");
  const adminPublish = await import(path.join(ROOT, "scripts", "admin-publish.mjs"));
  const generator = await import(path.join(ROOT, "scripts", "generate-article.mjs"));

  const articles = articlesMod.articles;
  const renderRouter = (element) =>
    renderToString(React.createElement(StaticRouter, { location: "/test" }, element));

  /* ═════════ 1) الصور: upload → persist → article → URL ═════════ */
  console.log("\n── الصور ──");

  const unsafeHints = [
    "../../etc/passwd",
    "صورة المقال النهائية.JPG",
    "my photo (final)%2e%2e.png",
    "",
  ];
  for (const hint of unsafeHints) {
    const name = publishMod.buildUploadFileName(hint);
    check(
      `اسم ملف آمن من «${hint || "(فارغ)"}»`,
      /^[a-z0-9][a-z0-9-]*\.jpg$/.test(name) && !name.includes("..") && !name.includes("/"),
      name
    );
  }
  const n1 = publishMod.buildUploadFileName("cytotec-guide");
  const n2 = publishMod.buildUploadFileName("cytotec-guide");
  check("أسماء الملفات فريدة لكل رفع", n1 !== n2, `${n1} / ${n2}`);

  check(
    "الرابط العام للصورة بلا بادئة public/",
    publishMod.uploadedImageUrl("x-abc.jpg") === "https://femseha.com/images/uploads/x-abc.jpg",
    publishMod.uploadedImageUrl("x-abc.jpg")
  );

  // رفع كامل مع واجهة GitHub وهمية: PUT ثم تحقق ثم الرابط النهائي
  const realFetch = globalThis.fetch;
  const stored = new Map();
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    if (init.method === "PUT") {
      const body = JSON.parse(init.body);
      const p = decodeURIComponent(u.split("/contents/")[1]);
      stored.set(p, body.content);
      return new Response(JSON.stringify({ content: { path: p } }), { status: 201 });
    }
    const p = decodeURIComponent(u.split("/contents/")[1].split("?")[0]);
    if (!stored.has(p)) return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
    return new Response(JSON.stringify({ path: p, sha: "abc123", size: 2048 }), { status: 200 });
  };

  const conn = { token: "t", owner: "femseha", repo: "femseha" };
  const bytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const uploaded = await publishMod.uploadImageBytes(conn, bytes, "adwiyat ijhad الحمل.jpg");
  check(
    "الرفع يعيد رابطاً نهائياً صحيحاً على الموقع",
    /^https:\/\/femseha\.com\/images\/uploads\/[a-z0-9-]+\.jpg$/.test(uploaded.url),
    uploaded.url
  );
  check(
    "الملف محفوظ فعلاً في public/images/uploads داخل المستودع",
    stored.has(`public/images/uploads/${uploaded.fileName}`)
  );

  await expectThrows(
    "فشل التحقق بعد الرفع يرمي خطأ (يمنع نجاح النشر)",
    async () => {
      await publishMod.verifyUploadedImage(conn, "ghost-file-does-not-exist.jpg");
    },
    /تعذر التحقق|غير موجودة/
  );

  globalThis.fetch = realFetch;

  // الحفظ (persist) — نسخة الخادم
  check(
    "الحفظ يصحح رابط public/ الخاطئ",
    adminPublish.sanitizeImage("https://femseha.com/public/images/uploads/a.jpg") ===
      "https://femseha.com/images/uploads/a.jpg"
  );
  check("الحفظ يرفض blob URL", adminPublish.sanitizeImage("blob:https://femseha.com/9f-2") === undefined);
  check("الحفظ يرفض data URL", adminPublish.sanitizeImage("data:image/png;base64,AAA") === undefined);
  check(
    "الحفظ يرفض مسار ملف محلي",
    adminPublish.sanitizeImage("C:\\Users\\me\\image.jpg") === undefined
  );
  check(
    "الحفظ يقبل الرابط النهائي للصورة المرفوعة",
    adminPublish.sanitizeImage(uploaded.url) === uploaded.url
  );

  check(
    "توحيد الرابط في الواجهة يصلح /public/ أيضاً",
    imageUrlMod.normalizeImageUrl("/public/images/uploads/a.jpg") === "/images/uploads/a.jpg"
  );
  check("رفض روابط blob في الواجهة", imageUrlMod.normalizeImageUrl("blob:xyz") === null);

  // كل صورة منشورة على نطاقنا لها ملف حقيقي (منع 404)
  const missing = [];
  for (const a of articles) {
    const url = imageUrlMod.normalizeImageUrl(a.image);
    if (!url) continue;
    let p = null;
    if (url.startsWith("https://femseha.com/")) p = url.replace("https://femseha.com/", "");
    else if (url.startsWith("/")) p = url.slice(1);
    if (!p) continue;
    if (!fs.existsSync(path.join(ROOT, "public", p))) missing.push(`${a.slug} → ${url}`);
  }
  check("كل صور المقالات المنشورة موجودة فعلاً في public/ (لا 404)", missing.length === 0, missing.join(", "));

  // العرض النهائي في صفحة المقال
  const imgHtml = renderToString(
    React.createElement(articleImageMod.default, {
      src: "https://femseha.com/public/images/uploads/a.jpg",
      title: "عنوان المقال الطبي",
    })
  );
  check(
    "صورة المقال تُعرض بالرابط الصحيح مع alt",
    imgHtml.includes('src="https://femseha.com/images/uploads/a.jpg"') &&
      imgHtml.includes('alt="عنوان المقال الطبي"'),
    imgHtml
  );
  check(
    "بلا صورة = لا وسم img (لا صورة افتراضية مضللة)",
    renderToString(React.createElement(articleImageMod.default, { src: null, title: "ت" })) === ""
  );

  /* ═════════ 2) شرط الكلمات ═════════ */
  console.log("\n── حد الكلمات ──");

  check("لا يوجد شرط 1400 كلمة في قواعد النشر", rulesMod.LIMITS.MIN_WORDS !== 1400, String(rulesMod.LIMITS.MIN_WORDS));
  check("لا يوجد شرط 1400 كلمة في خط النشر", generator.MIN_WORDS !== 1400, String(generator.MIN_WORDS));

  const baseDraft = {
    title: "دليل طبي مختصر عن متابعة الحمل المبكر",
    primaryKeyword: "متابعة الحمل المبكر بشكل صحيح",
    secondaryKeywords: [],
    country: null,
    category: "pregnancy-care",
    image: null,
    summary:
      "دليل طبي تثقيفي مختصر يشرح خطوات متابعة الحمل المبكر وعلامات الخطر التي تستدعي التقييم الطبي المباشر دون تأخير أو قلق غير مبرر للحامل.",
    slug: "short-valid-pregnancy-followup-guide",
    editSlug: null,
  };

  const shortWords = rulesMod.countWords(contentOfWords(300));
  const shortErrors = rulesMod.validateManualDraft({ ...baseDraft, content: contentOfWords(300) }, articles);
  check(
    `مقال قصير صالح (${shortWords} كلمة) قابل للنشر`,
    shortErrors.length === 0,
    shortErrors.join(" | ")
  );

  const longErrors = rulesMod.validateManualDraft({ ...baseDraft, content: contentOfWords(1450) }, articles);
  check("مقال 1400+ كلمة قابل للنشر", longErrors.length === 0, longErrors.join(" | "));

  const emptyErrors = rulesMod.validateManualDraft({ ...baseDraft, content: "   \n\n  " }, articles);
  check(
    "مقال فارغ مرفوض",
    emptyErrors.some((e) => e.includes("فارغ")),
    emptyErrors.join(" | ")
  );

  const junkErrors = rulesMod.validateManualDraft({ ...baseDraft, content: "###\n\n***\n\n* \n" }, articles);
  check(
    "محتوى شبه فارغ/غير صالح مرفوض",
    junkErrors.length > 0,
    junkErrors.join(" | ")
  );

  const serverShort = generator.runQualityChecks(
    { title: baseDraft.title, summary: baseDraft.summary, content: contentOfWords(300) },
    { slug: baseDraft.slug },
    articles
  );
  check("خط النشر يقبل المقال القصير الصالح", serverShort.errors.length === 0, serverShort.errors.join(" | "));

  const serverEmpty = generator.runQualityChecks(
    { title: baseDraft.title, summary: baseDraft.summary, content: "" },
    { slug: baseDraft.slug },
    articles
  );
  check(
    "خط النشر يرفض المقال الفارغ",
    serverEmpty.errors.some((e) => e.includes("فارغ")),
    serverEmpty.errors.join(" | ")
  );

  /* ═════════ 3) الروابط ═════════ */
  console.log("\n── الروابط ──");

  const linksHtml = renderRouter(
    React.createElement(markdownMod.ContentBlocks, { content: LINKS_CONTENT })
  );

  check(
    "رابط داخلي يبقى قابلاً للنقر",
    linksHtml.includes('href="/articles/pcos-symptoms-fertility-treatment"') &&
      linksHtml.includes("اقرئي أيضًا")
  );
  check(
    "رابط خارجي HTTPS مع target=_blank و rel آمن",
    /<a href="https:\/\/www\.moh\.gov\.sa\/" target="_blank" rel="noopener noreferrer"/.test(linksHtml)
  );
  check("نص الرابط العربي محفوظ", linksHtml.includes("وزارة الصحة") && linksHtml.includes("الهيئة العامة للغذاء والدواء"));
  check(
    "أكثر من رابط في المقال",
    (linksHtml.match(/<a /g) || []).length >= 6,
    String((linksHtml.match(/<a /g) || []).length)
  );
  check(
    "رابط داخلي مطلق على نطاق الموقع يستخدم التنقل الداخلي",
    linksHtml.includes('href="/consultation"') && !linksHtml.includes('href="https://femseha.com/consultation"')
  );
  check(
    "رابط بعنوان اختياري لا ينكسر",
    linksHtml.includes('href="https://www.who.int/ar"')
  );
  check(
    "رابط مكتوب صريحاً يصبح قابلاً للنقر",
    linksHtml.includes('href="https://www.moh.gov.sa/Pages/Default.aspx"')
  );
  check(
    "رابط javascript: لا يُعرض كرابط",
    !/href="javascript/i.test(linksHtml) && linksHtml.includes("اضغطي هنا")
  );
  const dataHtml = renderRouter(
    React.createElement(markdownMod.ContentBlocks, {
      content: "فقرة [تحميل](data:text/html;base64,PHNjcmlwdD4=) خطرة.",
    })
  );
  check("رابط data: لا يُعرض كرابط", !/href="data:/i.test(dataHtml));

  check("resolveLink يرفض javascript:", linksMod.resolveLink("javascript:alert(1)").kind === "unsafe");
  check("resolveLink يرفض vbscript:", linksMod.resolveLink("vbscript:msgbox").kind === "unsafe");
  check("resolveLink يقبل mailto:", linksMod.resolveLink("mailto:a@b.com").kind === "external");

  // بقاء الروابط بعد الحفظ (JSON) وبعد النشر (finalize + الفحوصات)
  const roundTripped = JSON.parse(JSON.stringify({ content: LINKS_CONTENT })).content;
  check("الروابط تبقى بعد الحفظ (round-trip JSON)", roundTripped === LINKS_CONTENT);

  const safeLinksContent = LINKS_CONTENT.replace(
    "رابط خطر [اضغطي هنا](javascript:alert(1)) يجب ألا يكون قابلاً للنقر.",
    "فقرة ختامية بلا روابط خطرة."
  );
  const publishedContent = adminPublish.finalizeAdminContent(safeLinksContent, [], articles);
  for (const href of [
    "/articles/pcos-symptoms-fertility-treatment",
    "https://www.moh.gov.sa/",
    "https://www.sfda.gov.sa/",
    "https://femseha.com/consultation",
  ]) {
    check(`الرابط باقٍ بعد النشر: ${href}`, publishedContent.includes(href));
  }

  const publishedHtml = renderRouter(
    React.createElement(markdownMod.ContentBlocks, { content: publishedContent })
  );
  check(
    "الروابط قابلة للنقر بعد النشر",
    publishedHtml.includes('href="https://www.moh.gov.sa/"') &&
      publishedHtml.includes('href="/articles/pcos-symptoms-fertility-treatment"')
  );

  const unsafeErrors = rulesMod.validateManualDraft(
    { ...baseDraft, content: `${contentOfWords(300)}\n\nرابط [خطر](javascript:alert(1)).` },
    articles
  );
  check(
    "النشر يرفض الروابط الخطرة (لا حذف صامت)",
    unsafeErrors.some((e) => e.includes("غير آمنة")),
    unsafeErrors.join(" | ")
  );

  const externalOk = rulesMod.validateManualDraft(
    {
      ...baseDraft,
      content: `${contentOfWords(300)}\n\nمصدر خارجي [وزارة الصحة](https://www.moh.gov.sa/) ورابط داخلي [الاستشارة الطبية](/consultation).`,
    },
    articles
  );
  check("النشر يقبل الروابط الخارجية والداخلية الصحيحة", externalOk.length === 0, externalOk.join(" | "));

  const brokenInternal = rulesMod.brokenInternalLinks(
    "نص [رابط](https://femseha.com/articles/does-not-exist) ونص [آخر](/articles/pcos-symptoms-fertility-treatment)",
    articles
  );
  check(
    "رابط داخلي مطلق مكسور يُرصد",
    brokenInternal.length === 1 && brokenInternal[0] === "/articles/does-not-exist",
    brokenInternal.join(",")
  );

  const serverLinkErrors = adminPublish.runAdminExtraChecks(
    { title: "عنوان اختباري", summary: "وصف اختباري", content: "نص [خطر](javascript:alert(1))", slug: "x" },
    articles,
    null
  );
  check(
    "خط النشر (الخادم) يرفض الروابط الخطرة",
    serverLinkErrors.some((e) => e.includes("غير آمن")),
    serverLinkErrors.join(" | ")
  );

  /* ═════════ 4) السمة الفاتحة ═════════ */
  console.log("\n── السمة الفاتحة ──");

  const articleHtml = renderRoute(`/articles/${articles[0].slug}`);
  const articleSection = articleHtml.slice(articleHtml.indexOf("<article"), articleHtml.indexOf("</article>"));
  check(
    "صفحة المقال بخلفية فاتحة (bg-white داخل bg-slate-50)",
    articleHtml.includes("bg-slate-50 min-h-[60vh]") && articleSection.includes("bg-white")
  );
  check(
    "لا خلفيات داكنة داخل بطاقة المقال",
    !/bg-slate-9\d0/.test(articleSection),
    (articleSection.match(/bg-slate-9\d0/g) || []).join(",")
  );
  check("عنوان المقال بنص داكن", articleSection.includes("text-slate-900"));
  check(
    "نص المقال داكن وليس فاتحاً",
    articleSection.includes("text-slate-700") && !articleSection.includes("text-slate-300")
  );
  check("روابط المحتوى زرقاء واضحة", articleSection.includes("text-blue-700"));

  const adminHtml = renderRoute("/admin");
  check("لوحة الإدارة بسمة فاتحة", adminHtml.includes("bg-slate-50") && adminHtml.includes("bg-white"));
  check(
    "لا خلفية داكنة في غلاف لوحة الإدارة",
    !/<main[^>]*bg-slate-9\d0/.test(adminHtml)
  );

  const cssText = fs.readFileSync(path.join(ROOT, "src", "index.css"), "utf8");
  check(
    "CSS الأساسي لم يعد يفرض خلفية داكنة",
    !cssText.includes("--color-slate-950") && cssText.includes("--color-slate-50")
  );

  const homeHtml = renderRoute("/");
  check("الصفحة الرئيسية ما زالت تعمل دون تغيير هيكلي", homeHtml.includes("أحدث المقالات الطبية"));
} finally {
  await server.close();
}

console.log(`\nالنتيجة: ${passed} ناجح / ${failed} فاشل`);
if (failed) {
  console.log("الفاشل:");
  for (const f of failures) console.log(`  ✖ ${f}`);
}
process.exit(failed === 0 ? 0 : 1);
