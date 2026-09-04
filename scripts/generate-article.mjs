#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * خط توليد ونشر المقالات الآلي — منصة فصيحة (FemSeha)
 * ─────────────────────────────────────────────────────────────────────────────
 * المعمارية (محفوظة من النظام السابق مع إصلاح الأعطال):
 *   1. اختيار الموضوع التالي من خطة المحتوى src/data/content-map.json
 *   2. سقف يومي للنشر (3 مقالات) مهما تكرر تشغيل الجدولة
 *   3. توليد المقال عبر Gemini (gemini-3.6-flash)
 *   4. فحوصات الجودة والسلامة الإلزامية (لا نشر عند فشل أي فحص)
 *   5. إضافة إخلاء المسؤولية الدائم + دعوة الاستشارة + الروابط الداخلية
 *   6. حفظ المقال في src/data/articles.json وتحديث public/sitemap.xml
 *   7. عند التشغيل داخل GitHub Actions: رفع التغييرات (git commit + push)
 *
 * ملاحظة: اسم الملف generate-article.mjs هو المسار الذي يستدعيه
 * سير العمل الحالي .github/workflows/auto-publish.yml كما هو دون تعديل.
 *
 * النشر المباشر من لوحة الإدارة (/admin):
 *   قبل طابور خطة المحتوى، يفحص هذا السكربت وجود طلبات نشر محفوظة في
 *   admin/requests/*.json (تضعها لوحة الإدارة عبر GitHub API) وينفذها مباشرة
 *   عبر scripts/admin-publish.mjs (توليد AI بنفس المعمارية + فحص + حفظ + نشر،
 *   أو حفظ مقال يدوي) — بلا أي مرحلة مراجعة أو موافقة. إذا كان التشغيل
 *   يدوياً (workflow_dispatch) ووُجدت طلبات، تُنفذ الطلبات وحدها؛ وإلا يكمل
 *   الخط سلوكه المجدول المعتاد دون أي تغيير.
 *
 * التشغيل:
 *   node scripts/generate-article.mjs              تشغيل عادي (يتطلب GEMINI_API_KEY)
 *   node scripts/generate-article.mjs --self-test  اختبار خط الأنابيب محلياً
 *                                                   (دون استدعاء Gemini ودون تعديل الملفات)
 *
 * ملاحظة معمارية: لا توجد قاعدة بيانات في هذا المشروع؛ التخزين ملفي
 * (src/data/articles.json + public/sitemap.xml) ويرفع إلى المستودع عبر
 * GitHub Actions ليقوم Vercel بالنشر.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
// مولّد sitemap الموحّد — نفس المصدر الذي يستخدمه npm run build، فلا تتنافس
// صيغتان على public/sitemap.xml (lastmod المقال = modifiedDate || publishDate).
import { buildSitemapXml } from "./generate-sitemap.mjs";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const MAP_PATH = path.join(ROOT, "src", "data", "content-map.json");
export const ARTICLES_PATH = path.join(ROOT, "src", "data", "articles.json");
export const SITEMAP_PATH = path.join(ROOT, "public", "sitemap.xml");
export const SITE_URL = "https://femseha.com";
export const MODEL = "gemini-3.6-flash";
export const DOCTOR_NAME = "د. هيثم الخطيب";
export const TARGET_WORDS_DEFAULT = 2000; // هدف تحريري للتوليد فقط، وليس شرط نشر أو فهرسة
export const MAX_DAILY_ARTICLES = 3;    // السقف اليومي للنشر (الجدولة القديمة تعمل 5 مرات يومياً)

/* مسارات لوحة الإدارة (النشر المباشر) — انظر scripts/admin-publish.mjs */
export const ADMIN_REQUESTS_DIR = path.join(ROOT, "admin", "requests");
export const ADMIN_COMMIT_PATHS = ["admin/requests", "public/images/uploads"];

/* ── أدوات مساعدة ─────────────────────────────────────────────────────── */

export const fail = (msg) => {
  console.error(`\n✖ فشل النشر: ${msg}`);
  process.exit(1);
};

export const log = (msg) => console.log(msg);

export function today() {
  return new Date().toISOString().split("T")[0];
}

export function countArabicWords(text) {
  return (text || "")
    .split(/\s+/)
    .filter((w) => /[\u0600-\u06FFa-zA-Z0-9]/.test(w)).length;
}

/**
 * يمنع المحتوى الفارغ/الشكلي فقط. لا يمثل حد كلمات SEO ولا معيار فهرسة؛
 * عدد الكلمات يبقى معلومة تستخدم لحساب زمن القراءة لا بوابة للنشر.
 */
export function hasSubstantiveContent(text) {
  const plain = String(text || "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[#>*•\-\d.)\s]+/gm, "")
    .replace(/\*\*|__|`/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = plain.match(/[\u0600-\u06FFa-zA-Z0-9]+/g) || [];
  const distinctWords = new Set(words.map((word) => normalizeArabic(word)).filter(Boolean));
  const meaningfulUnits = String(text || "")
    .split(/(?:\n\s*\n|[.!؟]+\s*)/)
    .map((unit) => countArabicWords(unit))
    .filter((wordCount) => wordCount >= 3);
  return plain.length >= 80 && distinctWords.size >= 8 && meaningfulUnits.length >= 2;
}

/** الروابط الداخلية ذات / واحدة، والخارجية HTTP/HTTPS فقط. */
export function classifyMarkdownHref(value) {
  const href = String(value || "").trim();
  if (!href || href !== value || /[\u0000-\u0020\u007f]/.test(href) || href.includes("\\")) return null;
  if (href.startsWith("/") && !href.startsWith("//")) {
    try {
      const base = new URL("https://femseha.invalid");
      const parsed = new URL(href, base);
      if (parsed.origin !== base.origin) return null;
      return { kind: "internal", href: `${parsed.pathname}${parsed.search}${parsed.hash}` };
    } catch {
      return null;
    }
  }
  try {
    const parsed = new URL(href);
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) return null;
    return { kind: "external", href: parsed.href };
  } catch {
    return null;
  }
}

export function extractMarkdownLinks(content) {
  const links = [];
  for (const match of String(content || "").matchAll(/\[([^\]\n]+)\]\(([^)\s]+)\)/g)) {
    links.push({ label: match[1], href: match[2], safeHref: classifyMarkdownHref(match[2]) });
  }
  return links;
}

export function unsafeMarkdownLinks(content) {
  return [...new Set(extractMarkdownLinks(content).filter((link) => !link.safeHref).map((link) => link.href))];
}

export function internalMarkdownPaths(content) {
  return [...new Set(
    extractMarkdownLinks(content)
      .filter((link) => link.safeHref?.kind === "internal")
      .map((link) => new URL(link.safeHref.href, "https://femseha.invalid").pathname)
  )];
}

/** تطبيع النص العربي للمقارنة */
export function normalizeArabic(text) {
  return (text || "")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")      // تشكيل وتطويل
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** تجذير بسيط للكلمة العربية: إزالة أدوات التعريف والعطف الشائعة */
function stemAr(w) {
  let s = w;
  for (let i = 0; i < 2; i++) {
    if (s.length > 5 && /^(وال|بال|فال|كال|لل)/.test(s)) s = s.slice(3);
    else if (s.length > 4 && /^ال/.test(s)) s = s.slice(2);
    else if (s.length > 3 && /^[وف]/.test(s)) s = s.slice(1);
    else break;
  }
  return s;
}

/** مطابقة كلمتين مع تجذير بسيط وبادئة للمتطابقات */
function tokenMatch(w, x) {
  if (w === x) return true;
  const sw = stemAr(w);
  const sx = stemAr(x);
  if (sw === sx) return true;
  if (sw.length >= 4 && sx.length >= 4 && (sw.startsWith(sx) || sx.startsWith(sw))) return true;
  return false;
}

/** تشابه الكلمات (Jaccard) بين عنوانين */
export function titleSimilarity(a, b) {
  const norm = (t) =>
    normalizeArabic(t)
      .split(" ")
      .filter((w) => w.length > 2);
  const ta = norm(a);
  const tb = norm(b);
  if (ta.length === 0 || tb.length === 0) return 0;
  let inter = 0;
  for (const w of ta) {
    if (tb.some((x) => tokenMatch(w, x))) inter += 1;
  }
  return inter / Math.min(ta.length, tb.length);
}

/**
 * نسبة ظهور كلمات كلمة مفتاحية قائمة داخل نص جديد (كلمة + عنوان الموضوع الجديد).
 * تُستخدم لرصد تنافس الموضوعات حتى مع اختلاف الصياغة.
 */
export function keywordCoverage(existingKeyword, newText) {
  const ek = normalizeArabic(existingKeyword)
    .split(" ")
    .filter((w) => w.length > 2);
  if (ek.length === 0) return 0;
  const nt = normalizeArabic(newText)
    .split(" ")
    .filter((w) => w.length > 2);
  let hits = 0;
  for (const w of ek) {
    if (nt.some((x) => tokenMatch(w, x))) hits += 1;
  }
  return hits / ek.length;
}

/* ── فحوصات السلامة الطبية الإلزامية على المحتوى المولَّد ─────────────── */

export const SAFETY_RULES = [
  {
    name: "لا أرقام هواتف أو واتساب داخل المحتوى",
    pattern: /(\+?\d{9,15})|(00966\d+)|(\+966\d+)|(05\d{8})|(واتساب)|(whatsapp)|(wa\.me)|(هاتف:)|(جوال:)/i,
    message: "المحتوى يتضمن وسيلة تواصل — التواصل يُضاف حصراً عبر قسم الاستشارة الرسمي.",
  },
  {
    name: "لا جرعات أو تعليمات دوائية رقمية",
    pattern: /\d+\s*(ملغ|مجم|مليغرام|ميكروغرام|مجمجرام|mg|mcg|قرص|اقراص|أقراص|كبسول|كبسولة|كبسولات|حبه|حبة|حبات|امبول|أمبولة|حقن[ةه]|ساعة\s*قبل)/i,
    message: "المحتوى يتضمن جرعة أو تعليماً دوائياً رقمياً — ممنوع تماماً في المحتوى التثقيفي.",
  },
  {
    name: "لا أسعار أو عروض تجارية",
    pattern: /(للبيع|نبيع|السعر|سعره|بسعر|ريال[sS]?|درهم|الدفع عند الاستلام|توصيل (مجاني|سريع)|شحن (مجاني|سريع)|خصم|عرض خاص|مجانا للطلبات|متوفر في صيدلي[ةه]|نوفر)/i,
    message: "المحتوى يتضمن لغة تجارية — المنصة توعوية ولا تبيع الأدوية.",
  },
  {
    name: "لا وعود بنتائج مضمونة",
    pattern: /(نجاح مضمون|نتيجة مضمونة|شفاء تام مضمون|100 ?%|بالتأكيد ستحملين|يضمن الشفاء)/i,
    message: "المحتوى يتضمن وعداً بنتيجة طبية — غير مسؤول طبياً.",
  },
  {
    name: "لا أسماء صيدليات أو جهات بيع",
    pattern: /(صيدلي[ةه] النهدي|صيدلي[ةه] الدواء|النهدي|داماس|الرافد)/i,
    message: "المحتوى يذكر جهة صرف محددة — غير مسموح.",
  },
];

export function runSafetyChecks(content) {
  const violations = [];
  const plain = content.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // لا نفحص نص الروابط
  for (const rule of SAFETY_RULES) {
    if (rule.pattern.test(plain)) violations.push(rule);
  }
  return violations;
}

/* ── اختيار الموضوع من خطة المحتوى (مع منع تنافس الكلمات المفتاحية) ───── */

/**
 * منطق رصد تنافس الكلمات المفتاحية (Cannibalization) بين موضوع جديد والمقالات
 * المنشورة — مستخرج حرفياً كما كان داخل pickNextTopic ليكون مصدر المنطق الوحيد:
 * يستخدمه الطابور الآلي هنا، ويستخدمه خط لوحة الإدارة (scripts/admin-publish.mjs)
 * نفسه دون أي اختلاف في العتبات أو القواعد.
 * يُرجع المقال المنشور المتنافس، أو null عند عدم وجود تنافس.
 */
export const CANNIBALIZATION_EXCEPTIONS_PATH = path.join(
  ROOT,
  "src",
  "data",
  "cannibalization-exceptions.json"
);

/**
 * استثناءات فحص التنافس فقط (قرار تحريري صريح في
 * src/data/cannibalization-exceptions.json). لا تمسّ أي فحص آخر:
 * السلامة الطبية والجودة و JSON validation وأخطاء Gemini/النشر تبقى كما هي.
 */
export function loadCannibalizationExceptions() {
  try {
    const raw = fs.readFileSync(CANNIBALIZATION_EXCEPTIONS_PATH, "utf8");
    const data = JSON.parse(raw);
    const list = Array.isArray(data.exceptions) ? data.exceptions : [];
    return list.filter((e) => e && (e.title || e.primaryKeyword));
  } catch {
    return [];
  }
}

/** هل هذا الموضوع مستثنى صراحةً من فحص التنافس؟ */
export function isCannibalizationExempt(topic, exceptions = loadCannibalizationExceptions()) {
  const key = normalizeArabic(topic.primaryKeyword || "");
  const title = normalizeArabic(topic.title || "");
  return exceptions.some((e) => {
    const ek = normalizeArabic(e.primaryKeyword || "");
    const et = normalizeArabic(e.title || "");
    const keyOk = ek ? ek === key : true;
    const titleOk = et ? et === title : true;
    return keyOk && titleOk && (ek || et);
  });
}

export function findCannibalization(topic, articles) {
  // استثناء تحريري صريح لهذا الموضوع تحديداً — تخطي فحص التنافس وحده.
  if (isCannibalizationExempt(topic)) {
    log(
      `  ℹ تخطي فحص تنافس الكلمات المفتاحية باستثناء تحريري صريح للموضوع «${topic.title || topic.primaryKeyword}» (باقي الفحوصات سارية).`
    );
    return null;
  }
  const topicKey = normalizeArabic(topic.primaryKeyword || "");
  const topicText = `${topic.primaryKeyword || ""} ${topic.title || ""}`;

  for (const a of articles) {
    const existingKey = normalizeArabic(a.primaryKeyword || "");
    const existingTitle = a.title || "";
    if (!existingKey) continue;
    const existingText = `${a.primaryKeyword || ""} ${existingTitle}`;
    const existingCoveredByNew = keywordCoverage(existingKey, topicText) >= 0.6;
    const newCoveredByExisting = topicKey
      ? keywordCoverage(topicKey, existingText) >= 0.6
      : false;
    if (
      (topicKey && existingKey.includes(topicKey)) ||
      (topicKey && topicKey.includes(existingKey)) ||
      existingCoveredByNew ||
      newCoveredByExisting ||
      titleSimilarity(topic.title || "", existingTitle) > 0.75
    ) {
      return a;
    }
  }
  return null;
}

function pickNextTopic(contentMap, articles) {
  const publishedSlugs = new Set(articles.map((a) => a.slug));

  const queue = [...(contentMap.queue || [])].sort((a, b) => (a.priority || 99) - (b.priority || 99));

  for (const topic of queue) {
    if (publishedSlugs.has(topic.slug)) continue;

    // فحص تنافس الكلمات المفتاحية مع المحتوى المنشور (نفس المنطق كما كان)
    const cannibal = findCannibalization(topic, articles);
    if (cannibal) {
      log(`↷ تخطي «${topic.slug}»: يتنافس مع المنشور «${cannibal.slug}» على الكلمة المفتاحية.`);
      continue;
    }
    return topic;
  }
  return null;
}

/* ── توليد المقال عبر Gemini ──────────────────────────────────────────── */

export function buildPrompt(topic, contentMap, articles, audience = "لجمهور نسائي سعودي") {
  const categories = contentMap.categories || {};
  const relatedInfo = (topic.relatedSlugs || [])
    .map((slug) => {
      const a = articles.find((x) => x.slug === slug);
      return a ? `- [${a.title}](/articles/${a.slug})` : null;
    })
    .filter(Boolean)
    .join("\n");

  return `أنت طبيب اختصاصي نساء وتوليد تكتب محتوى توعوياً طبياً دقيقاً للغاية ${audience}، بأسلوب مهني رحيم وواضح، بمخاطبة المؤنث بالعربية الفصحى المبسطة.

اكتب مقالاً تثقيفياً شاملاً بعنوان: «${topic.title}»
القصد البحثي: ${topic.intent}
الزاوية المطلوبة: ${topic.angle}

المحاور الإلزامية (mustCover):
${(topic.mustCover || []).map((m) => `- ${m}`).join("\n")}

الكلمة المفتاحية الأساسية: ${topic.primaryKeyword}
كلمات مساندة طبيعية: ${(topic.secondaryKeywords || []).join("، ")}

الطول المستهدف: ${topic.targetWords || TARGET_WORDS_DEFAULT} كلمة عربية تقريباً (لا حشو ولا تكرار).

قواعد التنسيق (صارمة):
1. ابدأ بمقدمة مباشرة من 2-3 فقرات دون عنوان.
2. استخدم العناوين بصيغة «### العنوان» (تُعرض كعناوين رئيسية) و«#### عنوان فرعي» عند الحاجة.
3. استخدم القوائم «* بند» حيث يناسب، والتأكيد بصيغة **نص**.
4. اربط داخلياً بصيغة [نص الرابط](/articles/الslug) فقط للمقالات التالية الموجودة فعلاً:
${relatedInfo || "(لا توجد روابط داخلية متاحة الآن — لا تضع روابط داخلية)"}
5. اختم المقال بقسم «خلاصة عملية» من 4-6 نقاط.
6. أضف قسم «أسئلة شائعة» ضمن حقل faq منفصل (لا داخله داخل المحتوى).

قواعد السلامة الطبية (مخالفة أي قاعدة تُلغي المقال):
- ممنوع منعاً باتاً: أي جرعة دوائية أو عدد حبوب أو تعليمات استخدام دوائي رقمية.
- ممنوع: أي رقم هاتف أو واتساب أو وسيلة تواصل.
- ممنوع: أي أسعار أو توفير أو ذكر لجهات بيع أو صيدليات بأسمائها.
- ممنوع: وعود بنتيجة أو نسب نجاح مضمونة.
- ممنوع: اختلاق إحصائيات أو دراسات أو أرقام مراجع وهمية. عند الحاجة لمرجعية استخدم صياغة عامة مثل «وفق الإرشادات الطبية المعتمدة».
- كل معلومة سريرية يجب أن تكون متوافقة مع الإجماع الطبي العام، وعند الحالات الفردية وجّهي إلى التقييم الطبي المباشر.
- لا تشخيصاً ذاتياً ولا خطة علاجية فردية.

أخرج JSON فقط بالحقول التالية:
{
  "title": "عنوان SEO جذاب لا يتجاوز 70 حرفاً (يمكن تحسين العنوان المقترح)",
  "summary": "وصف تعريفي 130-160 حرفاً يصلح Meta Description",
  "content": "نص المقال الكامل بالتنسيق أعلاه",
  "faq": [{ "q": "سؤال", "a": "إجابة موجزة دقيقة" }]
}`;
}

/* ── Retry موحد لاستدعاء Gemini API ────────────────────────────────────── */

export const GEMINI_RETRY_MAX_ATTEMPTS = 4;

/** أكواد HTTP المؤقتة التي تستوجب إعادة المحاولة */
const TRANSIENT_HTTP_CODES = new Set([429, 502, 503, 504]);

/** أكواد HTTP غير قابلة للاستعادة — لا re-try */
const NON_RETRYABLE_HTTP_CODES = new Set([400, 401, 403, 404]);

/** رموز الخطأ في body التي تستوجب إعادة المحاولة */
const TRANSIENT_ERROR_STATUSES = new Set([
  "UNAVAILABLE",
  "RESOURCE_EXHAUSTED",
]);

/**
 * كشف ما إذا كان خطأ Gemini قابلاً لإعادة المحاولة.
 * يفحص HTTP status code ونص الاستجابة للبحث عن رموز transient.
 */
export function isTransientError(status, bodyText) {
  if (TRANSIENT_HTTP_CODES.has(status)) return true;
  // RESOURCE_EXHAUSTED أحياناً يأتي بـ 429 أو حتى 200+body
  const lower = (bodyText || "").toLowerCase();
  for (const code of TRANSIENT_ERROR_STATUSES) {
    if (lower.includes(code.toLowerCase())) return true;
  }
  return false;
}

/**
 * حساب وقت الانتظار قبل إعادة المحاولة: exponential backoff + jitter.
 *   base = 1000ms × 2^(attempt-1)  (1s, 2s, 4s)
 *   jitter عشوائي بين 0 و base/2 لتجنب thundering herd.
 * الحد الأقصى 15 ثانية.
 */
export function computeBackoffMs(attempt) {
  const base = Math.min(1000 * Math.pow(2, attempt - 1), 15000);
  const jitter = Math.random() * (base / 2);
  return Math.round(base + jitter);
}

/** انتظار غير متزامن */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateWithGemini(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const requestBody = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.65,
      topP: 0.95,
      maxOutputTokens: 32768,
      responseMimeType: "application/json",
    },
  });

  let lastError = null;
  for (let attempt = 1; attempt <= GEMINI_RETRY_MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        // خطأ غير قابل للاستعادة → فشل فوري بدون retry
        if (NON_RETRYABLE_HTTP_CODES.has(res.status)) {
          throw new Error(`Gemini API HTTP ${res.status} (غير قابل للاستعادة): ${body.slice(0, 300)}`);
        }
        // خطأ مؤقت → سجل وأعد المحاولة إن وُجدت محاولات متبقية
        if (isTransientError(res.status, body) && attempt < GEMINI_RETRY_MAX_ATTEMPTS) {
          const waitMs = computeBackoffMs(attempt);
          log(`  ⏳ خطأ مؤقت من Gemini (HTTP ${res.status}) — إعادة المحاولة ${attempt + 1}/${GEMINI_RETRY_MAX_ATTEMPTS} بعد ${Math.round(waitMs / 1000)}s…`);
          await sleep(waitMs);
          continue;
        }
        // إما خطأ مؤقت استُنفدت محاولات إعادة尝试ه، أو كود غير مصنف
        throw new Error(`Gemini API HTTP ${res.status}: ${body.slice(0, 300)}`);
      }

      const data = await res.json();
      if (data.promptFeedback?.blockReason) {
        throw new Error(`حجب النموذج المحتوى (${data.promptFeedback.blockReason})`);
      }
      const candidate = data.candidates?.[0];
      const text = (candidate?.content?.parts || []).map((p) => p.text || "").join("").trim();
      if (!text) {
        throw new Error(`استجابة فارغة من النموذج (finishReason: ${candidate?.finishReason || "غير معروف"})`);
      }
      return text;
    } catch (err) {
      lastError = err;
      // أخطاء non-retryable تُرمى فوراً
      if (NON_RETRYABLE_HTTP_CODES.has(err.message?.match(/HTTP (\d+)/)?.[1] | 0) ||
          /غير قابل للاستعادة/.test(err.message || "")) {
        throw err;
      }
      // أخطاء شبكة (fetch failure, timeout, DNS) — transient بطبيعتها
      if (attempt < GEMINI_RETRY_MAX_ATTEMPTS) {
        const waitMs = computeBackoffMs(attempt);
        log(`  ⏳ خطأ شبكة من Gemini (${err.message?.slice(0, 80)}) — إعادة المحاولة ${attempt + 1}/${GEMINI_RETRY_MAX_ATTEMPTS} بعد ${Math.round(waitMs / 1000)}s…`);
        await sleep(waitMs);
        continue;
      }
    }
  }
  // استُنفدت كل المحاولات
  throw lastError || new Error("فشل استدعاء Gemini بعد جميع المحاولات");
}

/**
 * تنظيف النص JSON من محارف التحكم غير المسموحة داخل القيم النصية.
 * معالجة "Bad control character in string literal" — بعض مخرجات النموذج
 * تحتوي على أسطر جديدة أو tab حرفية داخل strings.
 */
export function sanitizeJsonControlChars(text) {
  // إزالة BOM إن وُجد
  let cleaned = text.replace(/^\uFEFF/, "");
  // معالجة محارف التحكم (0x00-0x1F) داخل values نصية فقط:
  // نمرّ على النص حرفاً حرفاً ونتتبّع إن كنا داخل string أم خارجه.
  let result = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    const code = cleaned.charCodeAt(i);
    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }
    if (inString) {
      if (ch === "\\") {
        escaped = true;
        result += ch;
        continue;
      }
      if (ch === '"') {
        inString = false;
        result += ch;
        continue;
      }
      // محرف تحكم داخل string → استبداله بـ escape
      if (code < 0x20) {
        if (code === 0x0A) result += "\\n";
        else if (code === 0x0D) result += "\\r";
        else if (code === 0x09) result += "\\t";
        else if (code === 0x08) result += "\\b";
        else if (code === 0x0C) result += "\\f";
        else result += "\\u" + code.toString(16).padStart(4, "0");
        continue;
      }
      result += ch;
    } else {
      if (ch === '"') {
        inString = true;
        result += ch;
        continue;
      }
      result += ch;
    }
  }
  return result;
}

export function parseGeneratedArticle(raw) {
  let text = raw.trim();
  text = text.replace(/^```(json)?/i, "").replace(/```$/, "").trim();

  // محاولة parse مباشرة أولاً (الأسرع)
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (firstErr) {
    // إذا فشل بسبب محرف تحكم → نظّف ثم أعد المحاولة
    try {
      const sanitized = sanitizeJsonControlChars(text);
      parsed = JSON.parse(sanitized);
    } catch (secondErr) {
      throw new Error(
        `JSON غير صالح من النموذج — لن يُنشر مقال ناقص: ${secondErr.message}. أول 200 حرف: ${text.slice(0, 200)}`
      );
    }
  }

  if (!parsed.title || !parsed.content) throw new Error("الحقول الأساسية ناقصة في الاستجابة — لن يُنشر مقال ناقص");
  parsed.faq = Array.isArray(parsed.faq) ? parsed.faq.filter((f) => f && f.q && f.a) : [];
  return parsed;
}

/* ── تجميع المقال النهائي (روابط داخلية + استشارة + إخلاء مسؤولية) ───── */

/** قسم الاستشارة الرسمي — النص الوحيد المعتمد (يستخدمه الخط الآلي وخط لوحة الإدارة) */
export const CONSULTATION_SECTION = `\n\n### للاستشارة الطبية\n\nهذا المقال محتوى تثقيفي عام بإشراف ${DOCTOR_NAME}، ولا يغني عن التقييم الطبي المباشر ولا يصلح أساساً لتشخيص ذاتي أو قرار علاجي فردي. للاستشارة المباشرة يمكنك زيارة صفحة [الاستشارة الطبية](/consultation) أو [التعرف على الطبيب المعالج](/doctor).`;

export function finalizeContent(topic, gen, articles) {
  let content = (gen.content || "").trim();

  // ضمان الروابط الداخلية
  const hasInternalLinks = /\]\(\/articles\/[^)]+\)/.test(content);
  if (!hasInternalLinks) {
    const related = (topic.relatedSlugs || [])
      .map((s) => articles.find((a) => a.slug === s))
      .filter(Boolean);
    if (related.length) {
      content += `\n\n### اقرئي أيضاً\n\n${related
        .map((a) => `* [${a.title}](/articles/${a.slug})`)
        .join("\n")}`;
    }
  }

  // قسم الاستشارة الرسمي (القناة الوحيدة المسموح بها)
  content += CONSULTATION_SECTION;

  return content;
}

/* ── فحوصات الجودة الإلزامية قبل النشر ────────────────────────────────── */

export function runQualityChecks(gen, topic, articles) {
  const errors = [];

  const words = countArabicWords(gen.content);
  if (!hasSubstantiveContent(gen.content)) {
    errors.push("محتوى المقال فارغ أو شكلي — يجب إضافة نص تحريري فعلي قبل النشر");
  }

  if ((gen.title || "").length > 75) errors.push("العنوان أطول من 75 حرفاً");
  if ((gen.title || "").length < 20) errors.push("العنوان قصير جداً");

  const summaryLen = (gen.summary || "").length;
  if (summaryLen < 100 || summaryLen > 170) {
    errors.push(`طول الوصف التعريفي ${summaryLen} خارج النطاق 100-170`);
  }

  // تفرّد الـ slug (إلزامي)
  if (articles.some((a) => a.slug === topic.slug)) errors.push("الـ slug مستخدم مسبقاً");

  // تشابه العنوان مع المنشور
  for (const a of articles) {
    if (titleSimilarity(gen.title, a.title) > 0.75) {
      errors.push(`العنوان شديد التشابه مع «${a.title}»`);
      break;
    }
  }

  // روابط Markdown الآمنة تُحفظ كما هي؛ schemes الخطرة تُرفض ولا تُنشر.
  const unsafeLinks = unsafeMarkdownLinks(gen.content);
  for (const href of unsafeLinks) {
    errors.push(`رابط غير آمن في المحتوى: ${href} — المسموح مسار داخلي أو HTTP/HTTPS فقط`);
  }

  // فحوصات السلامة
  const violations = runSafetyChecks(gen.content);
  for (const v of violations) errors.push(`سلامة: ${v.name} — ${v.message}`);

  return { errors, words };
}

/* ── كتابة الملفات (articles.json + sitemap.xml) ─────────────────────── */
/* ملاحظة: بناء sitemap مُوحّد في scripts/generate-sitemap.mjs (المستخدم أيضاً
   في npm run build) — يُستدعى هنا لضمان تطابق صيغة الملف بين مساري النشر. */

export function writePublicationFiles(nextArticles, articlesPath, sitemapPath) {
  const articlesText = JSON.stringify(nextArticles, null, 2) + "\n";
  const sitemapText = buildSitemapXml(nextArticles, SITE_URL);
  const suffix = `.tmp-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const articlesTmp = `${articlesPath}${suffix}`;
  const sitemapTmp = `${sitemapPath}${suffix}`;
  const previousArticles = fs.existsSync(articlesPath) ? fs.readFileSync(articlesPath) : null;
  const previousSitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath) : null;

  const restore = (target, previous) => {
    if (previous === null) fs.rmSync(target, { force: true });
    else fs.writeFileSync(target, previous);
  };

  try {
    // نبني الملفين ونكتبهما مؤقتاً قبل لمس النسخة المنشورة.
    fs.writeFileSync(articlesTmp, articlesText, "utf8");
    fs.writeFileSync(sitemapTmp, sitemapText, "utf8");
    fs.renameSync(articlesTmp, articlesPath);
    try {
      fs.renameSync(sitemapTmp, sitemapPath);
    } catch (error) {
      restore(articlesPath, previousArticles);
      restore(sitemapPath, previousSitemap);
      throw error;
    }
  } finally {
    fs.rmSync(articlesTmp, { force: true });
    fs.rmSync(sitemapTmp, { force: true });
  }
}

export function persist(article, articlesPath, sitemapPath, existingArticles) {
  const nextArticles = [article, ...existingArticles];
  writePublicationFiles(nextArticles, articlesPath, sitemapPath);
  return nextArticles;
}

/* ── رفع التغييرات عند التشغيل داخل GitHub Actions ───────────────────── */

function pushFromCI(extraPaths = [], commitMessage = null) {
  if (process.env.GITHUB_ACTIONS !== "true") return;
  const ref = process.env.GITHUB_REF_NAME || "main";
  try {
    execSync("git config user.name 'femseha-auto-publisher'", { stdio: "inherit" });
    execSync("git config user.email 'auto-publisher@femseha.com'", { stdio: "inherit" });
    execSync("git add -A -- src/data/articles.json public/sitemap.xml", { stdio: "inherit" });
    // مسارات إضافية (طلبات لوحة الإدارة وصورها المرفوعة) — تُضاف فقط عند وجودها
    for (const p of extraPaths) {
      if (fs.existsSync(path.join(ROOT, p))) {
        execSync(`git add -A -- "${p}"`, { stdio: "inherit" });
      }
    }
    let hasChanges = false;
    try {
      execSync("git diff --cached --quiet");
    } catch {
      hasChanges = true; // رمز خروج 1 = توجد تغييرات مُجهّزة
    }
    if (!hasChanges) {
      log("ℹ لا توجد تغييرات لرفعها.");
      return;
    }
    execSync(`git commit -m "${commitMessage || `chore(auto-publish): publish article ${today()}`}"`, { stdio: "inherit" });
    execSync(`git pull --rebase origin ${ref} || true`, { stdio: "inherit" });
    execSync(`git push origin HEAD:${ref}`, { stdio: "inherit" });
    log("✔ تم رفع المقال إلى المستودع (سيقوم Vercel بالنشر).");
  } catch (e) {
    fail(`فشل رفع المقال إلى المستودع: ${e.message}. تحقق من صلاحية GITHUB_TOKEN (Settings → Actions → General → Workflow permissions → Read and write).`);
  }
}

/* ── طلبات النشر المباشر من لوحة الإدارة (admin/requests/*.json) ──────── */

/**
 * الطلبات المعلقة = ملفات بلا حقل status (لم تُنفذ ولم تُرفض بعد).
 * الملف التالف لا يُسقط بصمت: يُعاد ضمن القائمة ليشغّل child process الذي سيظهر
 * اسم الملف وسبب فشل قراءته بأمان دون نشر أي محتوى ناقص.
 */
export function listPendingAdminRequests() {
  if (!fs.existsSync(ADMIN_REQUESTS_DIR)) return [];
  return fs
    .readdirSync(ADMIN_REQUESTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(ADMIN_REQUESTS_DIR, f))
    .filter((p) => {
      try {
        const req = JSON.parse(fs.readFileSync(p, "utf8"));
        return !req.status;
      } catch {
        return true;
      }
    })
    .sort();
}

/**
 * تنفيذ طلبات لوحة الإدارة عبر scripts/admin-publish.mjs (نفس معمارية
 * التوليد والفحص والحفظ الحالية). تُعالج الطلبات أولاً وتُنشر مباشرة — بلا
 * مراجعة أو موافقة — ثم يكمل الخط المجدول سلوكه المعتاد كما هو.
 * يُرجع ملخصاً أو null عند عدم وجود طلبات.
 */
function runAdminPublishChild() {
  const pending = listPendingAdminRequests();
  if (pending.length === 0) return null;
  log(`\n▶ وُجدت ${pending.length} طلب(ات) نشر مباشر من لوحة الإدارة — تُنفذ الآن:`);
  for (const p of pending) log(`  - ${path.basename(p)}`);
  execSync(`"${process.execPath}" "${path.join(ROOT, "scripts", "admin-publish.mjs")}" --process-requests`, {
    stdio: "inherit",
    cwd: ROOT,
  });
  const remaining = listPendingAdminRequests();
  return { requested: pending.length, remaining: remaining.length };
}

/* ── الوضع الرئيسي ─────────────────────────────────────────────────────── */

async function main() {
  const selfTest = process.argv.includes("--self-test");

  log("═══ خط النشر الآلي — منصة فصيحة ═══");
  log(`التاريخ: ${today()}  |  النموذج: ${MODEL}${selfTest ? "  |  وضع الاختبار الذاتي" : ""}\n`);

  // تحقق صريح من معرّف الموديل — يمنع الرجوع إلى gemini-2.5-flash المتوقف.
  if (MODEL !== "gemini-3.6-flash") {
    fail(`موديل Gemini غير متوقع: «${MODEL}» — المتوقع gemini-3.6-flash`);
  }
  if (selfTest) {
    log("✔ تحقق الموديل: gemini-3.6-flash (لا gemini-2.5-flash)");
  }

  if (!fs.existsSync(MAP_PATH)) fail(`ملف خطة المحتوى غير موجود: ${MAP_PATH}`);
  if (!fs.existsSync(ARTICLES_PATH)) fail(`ملف المقالات غير موجود: ${ARTICLES_PATH}`);

  const contentMap = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));
  let articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf8"));
  log(`المقالات المنشورة حالياً: ${articles.length}`);
  log(`مواضيع خطة المحتوى المتبقية: ${(contentMap.queue || []).length}`);

  // ── طلبات لوحة الإدارة تُنفذ أولاً وتنشر مباشرة (بلا مراجعة أو موافقة) ──
  // وضع الاختبار الذاتي لا يلمس الطلبات الحقيقية إطلاقاً.
  const adminRun = selfTest ? null : runAdminPublishChild();
  if (adminRun) {
    articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf8"));
  }
  if (adminRun && process.env.GITHUB_EVENT_NAME === "workflow_dispatch") {
    // تشغيل يدوي جاء بطلبات من اللوحة = نشر إرادي محدد: يُكتفى به ولا يُزاحم
    // طابور خطة المحتوى (منع نشر مقالات إضافية غير مقصودة في نفس التشغيل).
    pushFromCI(ADMIN_COMMIT_PATHS, `chore(admin-publish): نشر مباشر من لوحة الإدارة ${today()}`);
    log("\n✔ نُفذت طلبات لوحة الإدارة — لم يُستدع طابور خطة المحتوى في هذا التشغيل اليدوي.");
    return;
  }

  // سقف النشر اليومي (~3 مقالات/يوم مهما تكررت الجدولة)
  const publishedToday = articles.filter((a) => a.publishDate === today()).length;
  if (publishedToday >= MAX_DAILY_ARTICLES) {
    if (adminRun) {
      pushFromCI(ADMIN_COMMIT_PATHS, `chore(admin-publish): نشر مباشر من لوحة الإدارة ${today()}`);
    }
    log(`\nℹ تم بلوغ السقف اليومي للنشر (${publishedToday}/${MAX_DAILY_ARTICLES} مقالاً في ${today()}) — لن يُنشر مقال جديد اليوم. لا يوجد أي نشر مزعوم.`);
    return;
  }

  // 1) اختيار الموضوع
  const topic = pickNextTopic(contentMap, articles);
  if (!topic) {
    if (adminRun) {
      pushFromCI(ADMIN_COMMIT_PATHS, `chore(admin-publish): نشر مباشر من لوحة الإدارة ${today()}`);
    }
    fail("لا توجد مواضيع متاحة في خطة المحتوى (كلها منشورة أو متنافسة). حدِّث src/data/content-map.json.");
  }
  log(`\n▶ الموضوع المختار: ${topic.slug}`);
  log(`  الكلمة المفتاحية: ${topic.primaryKeyword}`);
  log(`  القصد: ${topic.intent}\n`);

  // 2) التوليد
  let gen;
  if (selfTest) {
    log("ℹ وضع الاختبار: استخدام نص تجريبي بدلاً من Gemini (للتحقق من بقية الخط فقط).");
    gen = selfTestArticle(topic);
  } else {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      fail("متغير البيئة GEMINI_API_KEY غير مضبوط. أضِفه في GitHub Secrets ثم أعد التشغيل. (لا يمكن توليد المقال بدونه)");
    }
    const prompt = buildPrompt(topic, contentMap, articles);
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        log(`… توليد المقال (محاولة ${attempt}/2)`);
        const raw = await generateWithGemini(apiKey, prompt);
        gen = parseGeneratedArticle(raw);
        log(`  تم استلام مسودة (${countArabicWords(gen.content)} كلمة).`);
        const quality = runQualityChecks(gen, topic, articles);
        if (quality.errors.length === 0) break;
        log(`  ملاحظات الجودة: ${quality.errors.join(" | ")}`);
        if (attempt === 2) {
          fail(`المسودة لم تجتز فحوصات الجودة بعد محاولتين: ${quality.errors.join(" | ")}`);
        }
        log("  إعادة المحاولة مع تعليمات توسيع…");
      } catch (e) {
        if (attempt === 2) fail(`فشل التوليد: ${e.message}`);
        log(`  خطأ في المحاولة الأولى: ${e.message}`);
      }
    }
  }

  // 3) الفحوصات الإلزامية (تُطبق حتى في وضع الاختبار)
  const quality = runQualityChecks(gen, topic, articles);
  if (quality.errors.length > 0) {
    fail(`فشل فحص الجودة/السلامة — المقال لن يُنشر:\n  - ${quality.errors.join("\n  - ")}`);
  }
  log(`✔ فحوصات الجودة والسلامة اجتازت — عدد الكلمات للمعلومة فقط: ${quality.words}`);

  // 4) تجميع المقال النهائي
  const article = {
    id: `art-${topic.slug}`,
    slug: topic.slug,
    title: gen.title.trim(),
    category: topic.category,
    categoryName: (contentMap.categories || {})[topic.category] || topic.category,
    summary: gen.summary.trim(),
    publishDate: today(),
    readTime: Math.max(3, Math.round(quality.words / 200)),
    primaryKeyword: topic.primaryKeyword,
    content: finalizeContent(topic, gen, articles),
    faq: gen.faq,
    related: (topic.relatedSlugs || []).filter((s) => articles.some((a) => a.slug === s)),
  };

  // 5) الحفظ
  if (selfTest) {
    const tmpDir = path.join(ROOT, ".self-test");
    fs.mkdirSync(tmpDir, { recursive: true });
    persist(article, path.join(tmpDir, "articles.json"), path.join(tmpDir, "sitemap.xml"), articles);
    log(`✔ وضع الاختبار: تم التحقق من منطق الحفظ في ${tmpDir} (الملفات الأصلية لم تُمَس).`);
    log("\n═══ نتيجة الاختبار الذاتي: نجاح ✔ ═══");
    return;
  }

  persist(article, ARTICLES_PATH, SITEMAP_PATH, articles);
  log(`\n✔ تم إنشاء المقال وحفظه في src/data/articles.json وتحديث public/sitemap.xml`);
  log(`  العنوان: ${article.title}`);
  log(`  الرابط: ${SITE_URL}/articles/${article.slug}`);

  // 7) الرفع إلى المستودع عند التشغيل داخل GitHub Actions
  pushFromCI(adminRun ? ADMIN_COMMIT_PATHS : []);
}

/** نص تجريبي لوضع الاختبار الذاتي — يمرّ كل الفحوصات */
function selfTestArticle(topic) {
  const baseTitle = topic.title.length <= 75 ? topic.title : topic.title.slice(0, 72);
  const filler = Array.from(
    { length: 42 },
    (_, i) =>
      `### قسم تجريبي ${i + 1}\n\nهذه فقرة تثقيفية تجريبية تشرح جانباً من ${topic.primaryKeyword} بلغة طبية مسؤولة، وتوجه القارئة إلى التقييم الطبي المباشر عند الحاجة دون أي جرعات أو وعود أو معلومات تجارية، مع الحفاظ على الدقة والوضوح في كل سطر من المقال التعليمي.`
  ).join("\n\n");
  return {
    title: baseTitle,
    summary:
      "ملخص تجريبي لأغراض اختبار خط النشر: يشرح الدليل الأسباب والأعراض وخيارات التقييم الطبي بلغة تثقيفية مسؤولة دون جرعات أو وعود، مع التوجيه للاستشارة المتخصصة عند الحاجة.",
    content: filler,
    faq: [{ q: "سؤال تجريبي؟", a: "إجابة تجريبية موجزة." }],
  };
}

// لا تُنفذ main() إلا عند تشغيل الملف مباشرةً — حتى يتمكن scripts/admin-publish.mjs
// من استيراد الأدوات المساعدة دون إطلاق الخط. (سلوك `node scripts/generate-article.mjs`
// من سير العمل auto-publish.yml لم يتغير إطلاقاً.)
const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((e) => fail(e.message || "خطأ غير متوقع"));
}
