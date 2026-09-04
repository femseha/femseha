#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * خط النشر المباشر من لوحة الإدارة (/admin) — منصة فصيحة (FemSeha)
 * ─────────────────────────────────────────────────────────────────────────────
 * يعالج طلبات النشر المحفوظة في admin/requests/*.json (تضعها لوحة الإدارة عبر
 * GitHub API)، ويعمل بنفس معمارية الخط الآلي القائمة تماماً:
 *
 *   mode "ai"     : إدخال البيانات → توليد المقال عبر Gemini (نفس النموذج ونفس
 *                   قواعد الـ prompt والسلامة) → فحوصات الجودة → نشر مباشر.
 *   mode "manual" : المقال المكتوب يدوياً → نفس الفحوصات → نشر مباشر.
 *
 * لا يوجد Review ولا Approval ولا Draft workflow — لا أي مرحلة بين إنشاء
 * المقال والنشر. الطلب الناجح يُحذف من admin/requests ويُنشر المقال فوراً في
 * src/data/articles.json + public/sitemap.xml (نفس طريقة الحفظ الحالية)،
 * والطلب المرفوض يُعلَّم في مكانه (status: "failed" + السبب) لتعرضه اللوحة.
 *
 * القواعد المطبقة (نفس قواعد الخط الآلي — reuse حرفي من generate-article.mjs):
 *   - منع تنافس الكلمات المفتاحية (Cannibalization) — findCannibalization نفسها.
 *   - فحوصات الجودة: عدد الكلمات، طول العنوان والوصف، تفرّد الـ slug والعنوان.
 *   - فحوصات السلامة الطبية الإلزامية (SAFETY_RULES) + حارس YMYL التجاري
 *     (مطابق لـ audit-indexing.mjs ويشمل عملات الخليج) على المحتوى يدوياً كان
 *     أو مولداً: لا شراء، لا بائعين، لا أسعار، لا جرعات رقمية، لا وسائل تواصل.
 *   - الروابط الداخلية يجب أن تشير لمسارات منشورة فقط (قاعدة seo-validate).
 *   - إضافة قسم الاستشارة الرسمي والروابط الداخلية عند غيابها (finalizeContent).
 *
 * الاستدعاء:
 *   node scripts/admin-publish.mjs --process-requests   تنفيذ الطلبات المعلقة
 *       (يستدعيه scripts/generate-article.mjs تلقائياً داخل GitHub Actions)
 *   node scripts/admin-publish.mjs --self-test          اختبار كامل محلياً دون
 *       Gemini ودون لمس الملفات الحقيقية (يكتب في .self-test/admin فقط)
 *
 * ملاحظة أمنية: GEMINI_API_KEY يُقرأ من بيئة التشغيل (GitHub Secrets داخل
 * Actions) فقط — لا يصل للمتصفح ولا يُخزن في أي ملف بالمستودع.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import {
  ROOT,
  MAP_PATH,
  ARTICLES_PATH,
  SITEMAP_PATH,
  SITE_URL,
  MODEL,
  MIN_WORDS,
  TARGET_WORDS_DEFAULT,
  ADMIN_REQUESTS_DIR,
  today,
  log,
  countArabicWords,
  runSafetyChecks,
  findCannibalization,
  buildPrompt,
  generateWithGemini,
  parseGeneratedArticle,
  runQualityChecks,
  CONSULTATION_SECTION,
  persist,
} from "./generate-article.mjs";
import { buildSitemapXml } from "./generate-sitemap.mjs";

const COUNTRIES_PATH = path.join(ROOT, "src", "data", "countries.json");
const STATIC_ROUTES = ["/", "/articles", "/doctor", "/consultation", "/medical-disclaimer"];

/* ── أدوات مساعدة ─────────────────────────────────────────────────────── */

class RequestFailure extends Error {}

function describeError(error) {
  return error instanceof Error && error.message ? error.message : String(error || "سبب غير معروف");
}

function parseRequestFile(file, name) {
  const raw = fs.readFileSync(file, "utf8");
  try {
    return { file, name, req: JSON.parse(raw) };
  } catch (error) {
    return { file, name, error: `ملف طلب تالف: ${name} — ${describeError(error)}` };
  }
}

function loadCountries() {
  if (!fs.existsSync(COUNTRIES_PATH)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(COUNTRIES_PATH, "utf8"));
    return Array.isArray(data.countries) ? data.countries : [];
  } catch {
    return [];
  }
}

const isSlug = (s) => typeof s === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);

/** slug لاتيني من نص (مثل نسخة المتصفح في src/lib/article-rules.ts) */
function slugifyLatin(input, maxLen = 60) {
  const s = String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLen)
    .replace(/-+$/g, "");
  return isSlug(s) && s.length >= 3 ? s : "";
}

function uniqueSlug(base, articles) {
  const taken = new Set(articles.map((a) => a.slug));
  let slug = base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
}

function asStringArray(v, max = 10) {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => typeof x === "string" && x.trim())
    .slice(0, max)
    .map((x) => x.trim().slice(0, 80));
}

/**
 * توحيد رابط صورة المقال قبل الحفظ (نسخة الخادم من src/lib/image-url.ts).
 *
 * - يرفض الروابط المؤقتة (blob:/data:/file:) والمسارات المحلية — لا تُحفظ أبداً.
 * - يصحح بادئة public/ الخاطئة: Vite ينشر public/ على جذر الموقع، فالرابط
 *   الصحيح للصورة المرفوعة هو /images/uploads/... وليس /public/images/uploads/...
 *   (هذا هو سبب ظهور صورة مكسورة 404 في الصفحة المنشورة).
 */
export function sanitizeImage(v) {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  if (!s) return undefined;
  if (/^(blob:|data:|file:|filesystem:|about:)/i.test(s) || /^[a-zA-Z]:[\\/]/.test(s)) return undefined;
  if (/^https?:\/\//i.test(s)) {
    try {
      const url = new URL(s);
      url.pathname = url.pathname.replace(/^\/public\//, "/");
      return url.href;
    } catch {
      return undefined;
    }
  }
  const path = (s.startsWith("/") ? s : `/${s}`).replace(/^\/public\//, "/");
  return /^\/images\//.test(path) ? path : undefined;
}

/** مسارات داخلية منشورة (لفحص روابط المحتوى — قاعدة seo-validate نفسها) */
function publishedRoutes(articles) {
  return new Set([...STATIC_ROUTES, ...articles.map((a) => `/articles/${a.slug}`)]);
}

/* ── روابط المحتوى (نسخة الخادم من src/lib/links.ts) ──────────────────── */

const SAFE_LINK_SCHEMES = ["http:", "https:", "mailto:", "tel:"];
const MARKDOWN_LINK_RE = /\[([^\]]+)\]\(\s*<?([^\s)>]+)>?(?:\s+"[^"]*")?\s*\)/g;

export function extractContentLinks(content) {
  const out = [];
  for (const m of String(content || "").matchAll(MARKDOWN_LINK_RE)) {
    out.push({ label: m[1], href: m[2] });
  }
  return out;
}

function resolveContentLink(raw) {
  const value = String(raw || "").trim().replace(/^<|>$/g, "").trim();
  if (!value) return { kind: "unsafe", href: "" };
  if (value.startsWith("#")) return { kind: "hash", href: value };
  if (value.startsWith("/") && !value.startsWith("//")) return { kind: "internal", href: value };
  let url;
  try {
    url = new URL(value, SITE_URL);
  } catch {
    return { kind: "unsafe", href: "" };
  }
  if (!SAFE_LINK_SCHEMES.includes(url.protocol)) return { kind: "unsafe", href: "" };
  if ((url.protocol === "http:" || url.protocol === "https:") && url.origin === new URL(SITE_URL).origin) {
    return { kind: "internal", href: `${url.pathname}${url.search}${url.hash}` };
  }
  return { kind: "external", href: url.href };
}

export function isUnsafeLinkHref(raw) {
  return resolveContentLink(raw).kind === "unsafe";
}

export function internalLinkPath(raw) {
  const r = resolveContentLink(raw);
  if (r.kind !== "internal") return null;
  return r.href.split("#")[0].split("?")[0] || "/";
}

/* ── فحوصات إضافية خاصة بلوحة الإدارة (تُطبق على AI واليدوي معاً) ──────── */

/** حارس YMYL التجاري — مطابق لقوائم scripts/audit-indexing.mjs (يشمل عملات الخليج) */
const HARD_COMMERCIAL = [
  { re: /\d[\d.,]*\s*(?:ريال|ر\.س|درهم|دينار|جنيه|دولار|kwd|sar|aed|omr|bhd|qar)/i, name: "سعر بعملة" },
  { re: /اطلب الآن|التوصيل السريع|متوفر للبيع|للطلب والشراء|أرخص سعر|سعر خاص/, name: "عبارة بيع مباشرة" },
  { re: /(?:رابط|مصدر)\s*(?:شراء|للشراء)/, name: "مصدر شراء", negatable: true },
];
const NEGATION_RE = /(لا|ليس|ليست|يمنع|المنع|بدون|دون|رفض|استبعاد|تتجنب|تجنّب)/;

export function runAdminExtraChecks(candidate, articles, excludeSlug) {
  const errors = [];
  const others = excludeSlug ? articles.filter((a) => a.slug !== excludeSlug) : articles;

  // وصف تعريفي فريد (قاعدة seo-validate: لا meta description مكرر)
  const desc = (candidate.summary || "").slice(0, 160);
  if (desc && others.some((a) => (a.summary || "").slice(0, 160) === desc)) {
    errors.push("الوصف التعريفي (meta description) مكرر مع مقال منشور آخر — يجب أن يكون فريداً.");
  }

  // عنوان مكرر حرفياً
  if (others.some((a) => a.title === candidate.title)) {
    errors.push("العنوان مكرر حرفياً مع مقال منشور آخر.");
  }

  // حارس YMYL التجاري على كامل نص المقال (عنوان + وصف + محتوى + FAQ)
  const faqText = (candidate.faq || []).flatMap((f) => [f.q, f.a]).join("\n");
  const fullText = [candidate.title, candidate.summary, candidate.content, faqText].join("\n");
  const plain = fullText.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  for (const pat of HARD_COMMERCIAL) {
    const m = pat.re.exec(plain);
    if (!m) continue;
    if (pat.negatable && NEGATION_RE.test(plain.slice(Math.max(0, m.index - 45), m.index))) continue;
    errors.push(`محتوى تجاري ممنوع (${pat.name}): "${m[0]}"`);
  }

  // روابط المحتوى: الداخلية يجب أن تشير لمسارات منشورة، والخطرة مرفوضة.
  // الروابط الخارجية الآمنة (https/mailto/tel) مسموحة ولا تُحذف ولا تُرفض.
  const routes = publishedRoutes(articles);
  for (const link of extractContentLinks(candidate.content || "")) {
    if (isUnsafeLinkHref(link.href)) {
      errors.push(`رابط غير آمن في المحتوى: ${link.href} — المسموح فقط http(s) وmailto وtel والمسارات الداخلية.`);
      continue;
    }
    const path = internalLinkPath(link.href);
    if (path && !routes.has(path) && path !== `/articles/${candidate.slug}`) {
      errors.push(`رابط داخلي مكسور في المحتوى: ${path} — يجب أن يشير لمسار منشور.`);
    }
  }

  return errors;
}

/* ── بناء الموضوع وprompt لطلب AI ─────────────────────────────────────── */

function buildAdminPrompt(req, topic, country, contentMap, articles, audience) {
  const base = buildPrompt(topic, contentMap, articles, audience);
  const extras = [
    "",
    "إضافات إلزامية خاصة بالنشر من لوحة الإدارة:",
    `- السوق/الدولة المستهدفة: ${country ? `${country.fullName} — خاطبي القارئة في هذا السوق وأشري للضوابط المحلية عبر ${country.healthAuthority} عند الحديث عن التنظيم الصحي.` : "عام (غير مرتبط بدولة محددة) — لا تربطي المحتوى بسوق محدد ولا تذكري دولة بعينها كمرجع تنظيمي."}`,
    `- الكلمة المفتاحية الرئيسية يجب أن تظهر طبيعياً في المقدمة وأحد العناوين: «${req.primaryKeyword}».`,
    `- الكلمة المفتاحية المستهدفة وحيدة لهذه الصفحة: لا تعيدي صياغة عنوان مقال منشور آخر ولا تستهدفى كلمته (منع Cannibalization ومنع صفحات Doorway المكررة).`,
    req.instructions
      ? `- تعليمات المشرف التحريرية (تُطبق بالكامل ما لم تخالف قواعد السلامة أعلاه): ${req.instructions}`
      : null,
    "- ممنوع منعاً باتاً أيضاً: تعليمات شراء الأدوية، أسماء أو أرقام بائعين، روابط شراء، أسعار أدوية الإجهاض أو أي دواء، جرعات شخصية، تعليمات استخدام ذاتي خطرة، أو توجيه القارئة لأي مصدر غير موثوق للحصول على الأدوية.",
    '- أضف في مخرجات JSON حقلاً إضافياً "slug": رابط SEO إنجليزي بحروف لاتينية صغيرة وشرطات (مثل cytotec-oman-safety-guide) يلخص الموضوع والسوق — بلا تواريخ أو أرقام عشوائية.',
  ]
    .filter(Boolean)
    .join("\n");
  return base + "\n" + extras;
}

/** مواضيع ذات صلة للروابط الداخلية: نفس الدولة أولاً ثم نفس التصنيف ثم الأحدث */
function pickRelatedSlugs(req, articles, excludeSlug, max = 4) {
  const pool = articles.filter((a) => a.slug !== excludeSlug);
  const scored = pool.map((a) => {
    let score = 0;
    if (req.country && a.country === req.country) score += 3;
    if (a.category === req.category) score += 2;
    return { slug: a.slug, score, date: a.publishDate };
  });
  scored.sort((x, y) => y.score - x.score || (x.date < y.date ? 1 : -1));
  return scored.slice(0, max).map((s) => s.slug);
}

/** تجميع المحتوى النهائي: روابط داخلية + قسم الاستشارة (دون تكراره عند التعديل) */
export function finalizeAdminContent(content, relatedSlugs, articles) {
  let out = String(content || "").trim();
  const hasInternalLinks = /\]\(\/articles\/[^)]+\)/.test(out);
  if (!hasInternalLinks) {
    const related = relatedSlugs.map((s) => articles.find((a) => a.slug === s)).filter(Boolean);
    if (related.length) {
      out += `\n\n### اقرئي أيضاً\n\n${related.map((a) => `* [${a.title}](/articles/${a.slug})`).join("\n")}`;
    }
  }
  if (!out.includes("### للاستشارة الطبية")) {
    out += CONSULTATION_SECTION;
  }
  return out;
}

/* ── معالجة طلب AI: توليد → فحص → نشر مباشر ───────────────────────────── */

async function processAiRequest(req, ctx) {
  if (!req.title || !String(req.title).trim()) throw new RequestFailure("عنوان المقال مفقود في الطلب.");
  if (!req.primaryKeyword || !String(req.primaryKeyword).trim()) {
    throw new RequestFailure("الكلمة المفتاحية الرئيسية مفقودة في الطلب.");
  }

  const countries = ctx.countries;
  const country = req.country ? countries.find((c) => c.code === req.country) : null;
  if (req.country && !country) throw new RequestFailure(`رمز الدولة غير معروف: ${req.country}`);
  if (!ctx.contentMap.categories || !ctx.contentMap.categories[req.category]) {
    throw new RequestFailure(`التصنيف غير معروف: ${req.category || "(مفقود)"}`);
  }

  // فحص تنافس الكلمات المفتاحية قبل التوليد (نفس منطق الخط الآلي)
  const cannibal = findCannibalization({ title: req.title, primaryKeyword: req.primaryKeyword }, ctx.articles);
  if (cannibal) {
    throw new RequestFailure(
      `منع تنافس الكلمات المفتاحية: الموضوع يتنافس مع المقال المنشور «${cannibal.title}» (/articles/${cannibal.slug}) — غيّري الكلمة المفتاحية أو الزاوية.`
    );
  }

  // slug مبدئي: اقتراح اللوحة إن كان صالحاً (يُستكمل من النموذج عند غيابه)
  const requestedSlug = isSlug(req.slug || "") ? req.slug : slugifyLatin(`${req.primaryKeyword} ${req.title}`);
  const relatedSlugs = pickRelatedSlugs(req, ctx.articles, null);
  const topic = {
    slug: requestedSlug || "admin-article",
    title: String(req.title).trim(),
    primaryKeyword: String(req.primaryKeyword).trim(),
    secondaryKeywords: asStringArray(req.secondaryKeywords),
    category: req.category,
    targetWords: TARGET_WORDS_DEFAULT,
    intent: `معلوماتي (YMYL): محتوى تثقيفي وآمن حول «${req.primaryKeyword}»${country ? ` في ${country.fullName}` : ""} — بلا بيع أو أسعار أو مصادر شراء أو جرعات.`,
    angle: req.instructions
      ? String(req.instructions).trim().slice(0, 1200)
      : `دليل تثقيفي شامل عن «${req.primaryKeyword}»${country ? ` للسوق في ${country.name}` : ""}: ما هو، الاستخدامات الطبية المعتمدة، المخاطر والمحاذير، الضوابط التنظيمية، علامات الخطر، ومتى يجب التوجه للتقييم الطبي المباشر.`,
    mustCover: [
      `تعريف واضح ودقيق لموضوع «${req.primaryKeyword}» بلغة تثقيفية مسؤولة`,
      country
        ? `الضوابط التنظيمية في ${country.fullName} ودور ${country.healthAuthority}`
        : "الضوابط العامة لصرف الدواء/الخدمة طبياً (بلا ربط بدولة محددة)",
      "المخاطر والمحاذير الطبية الموثقة",
      "علامات الخطر التي تستوجب توجهاً فورياً للطوارئ أو تقييماً طبياً مباشراً",
      "التأكيد أن المحتوى تثقيفي ولا يغني عن الاستشارة الطبية الفردية",
    ],
    relatedSlugs,
  };
  const audience = country
    ? `لجمهور نسائي في ${country.fullName}`
    : "لجمهور نسائي عربي (عام غير مرتبط بسوق محدد)";

  // التوليد عبر Gemini — بنفس نموذج ومعمارية الخط الآلي (المفتاح من البيئة فقط)
  if (ctx.selfTest) {
    log("  ℹ وضع الاختبار: استخدام نص تجريبي بدلاً من Gemini.");
  } else if (!ctx.apiKey) {
    throw new RequestFailure(
      "متغير البيئة GEMINI_API_KEY غير مضبوط في بيئة التشغيل (يوجد في GitHub Secrets) — لا يمكن توليد المقال."
    );
  }

  let gen = null;
  let lastErrors = [];
  for (let attempt = 1; attempt <= 2; attempt++) {
    if (ctx.selfTest) {
      gen = selfTestGen(req, topic);
      break;
    }
    const prompt = buildAdminPrompt(req, topic, country, ctx.contentMap, ctx.articles, audience);
    log(`  … توليد المقال (محاولة ${attempt}/2)`);
    const raw = await generateWithGemini(ctx.apiKey, prompt);
    const parsed = parseGeneratedArticle(raw);
    log(`  تم استلام مسودة (${countArabicWords(parsed.content)} كلمة).`);

    const slug = resolveSlug(parsed.slug || requestedSlug, req, ctx.articles);
    const quality = runQualityChecks(parsed, { ...topic, slug }, ctx.articles);
    const extra = runAdminExtraChecks({ ...parsed, slug }, ctx.articles, null);
    lastErrors = [...quality.errors, ...extra];
    if (lastErrors.length === 0) {
      gen = { ...parsed, slug };
      break;
    }
    log(`  ملاحظات الجودة: ${lastErrors.join(" | ")}`);
    if (attempt === 2) {
      throw new RequestFailure(`المسودة لم تجتز فحوصات الجودة/السلامة بعد محاولتين: ${lastErrors.join(" | ")}`);
    }
  }

  if (ctx.selfTest) {
    const slug = resolveSlug(gen.slug || requestedSlug, req, ctx.articles);
    const quality = runQualityChecks(gen, { ...topic, slug }, ctx.articles);
    const extra = runAdminExtraChecks({ ...gen, slug }, ctx.articles, null);
    const allErrors = [...quality.errors, ...extra];
    if (allErrors.length) throw new RequestFailure(`فشل فحص الجودة/السلامة: ${allErrors.join(" | ")}`);
    gen = { ...gen, slug };
  }

  const slug = gen.slug;
  const content = finalizeAdminContent(gen.content, relatedSlugs, ctx.articles);
  const words = countArabicWords(content);
  const article = {
    id: `art-${slug}`,
    slug,
    title: String(gen.title).trim(),
    category: req.category,
    categoryName: ctx.contentMap.categories[req.category] || req.category,
    primaryKeyword: String(req.primaryKeyword).trim(),
    ...(asStringArray(req.secondaryKeywords).length ? { secondaryKeywords: asStringArray(req.secondaryKeywords) } : {}),
    ...(country ? { country: country.code } : {}),
    summary: String(gen.summary).trim(),
    publishDate: today(),
    readTime: Math.max(3, Math.round(words / 200)),
    ...(sanitizeImage(req.image) ? { image: sanitizeImage(req.image) } : {}),
    content,
    ...(Array.isArray(gen.faq) && gen.faq.length ? { faq: gen.faq } : {}),
    related: relatedSlugs.filter((s) => ctx.articles.some((a) => a.slug === s)),
  };

  ctx.articles = persist(article, ctx.articlesPath, ctx.sitemapPath, ctx.articles);
  return article;
}

function resolveSlug(candidate, req, articles) {
  const base =
    isSlug(candidate || "") && candidate.length >= 3
      ? candidate
      : slugifyLatin(`${req.primaryKeyword} ${req.title}`) ||
        slugifyLatin(req.title) ||
        `guide-${today().replace(/-/g, "")}`;
  return uniqueSlug(base, articles);
}

/* ── معالجة طلب يدوي: فحص → نشر مباشر (جديد أو تعديل) ─────────────────── */

function processManualRequest(req, ctx) {
  const isEdit = Boolean(req.editSlug);
  const existing = isEdit ? ctx.articles.find((a) => a.slug === req.editSlug) : null;
  if (isEdit && !existing) throw new RequestFailure(`المقال المطلوب تعديله غير موجود: ${req.editSlug}`);

  if (!ctx.contentMap.categories || !ctx.contentMap.categories[req.category]) {
    throw new RequestFailure(`التصنيف غير معروف: ${req.category || "(مفقود)"}`);
  }
  const countries = ctx.countries;
  const country = req.country ? countries.find((c) => c.code === req.country) : null;
  if (req.country && !country) throw new RequestFailure(`رمز الدولة غير معروف: ${req.country}`);

  // الـ slug: مقفل على المقال نفسه عند التعديل (حماية الروابط وSEO القائم)
  let slug;
  if (isEdit) {
    slug = existing.slug;
  } else {
    if (!isSlug(req.slug || "")) {
      throw new RequestFailure("الـ slug مفقود أو بصيغة غير صالحة (مسموح: أحرف لاتينية صغيرة وأرقام وشرطات).");
    }
    if (ctx.articles.some((a) => a.slug === req.slug)) {
      throw new RequestFailure(`الـ slug "${req.slug}" مستخدم مسبقاً — اختاري غيره.`);
    }
    slug = req.slug;
  }

  const relatedSlugs = pickRelatedSlugs(req, ctx.articles, slug);
  const content = finalizeAdminContent(req.content, relatedSlugs, ctx.articles);
  const gen = {
    title: String(req.title || "").trim(),
    summary: String(req.summary || "").trim(),
    content,
    faq: isEdit ? existing.faq || [] : [],
  };

  // نفس فحوصات الجودة والسلامة للخط الآلي (مع استثناء المقال نفسه عند التعديل)
  const checkAgainst = isEdit ? ctx.articles.filter((a) => a.slug !== slug) : ctx.articles;
  const quality = runQualityChecks(gen, { slug }, checkAgainst);
  const extra = runAdminExtraChecks({ ...gen, slug }, checkAgainst, isEdit ? slug : null);
  const allErrors = [...quality.errors, ...extra];
  if (allErrors.length) {
    throw new RequestFailure(`فشل فحص الجودة/السلامة — المقال لن يُنشر: ${allErrors.join(" | ")}`);
  }

  // منع تنافس الكلمات المفتاحية (نفس منطق الخط الآلي — مع استثناء الذات عند التعديل)
  const cannibal = findCannibalization({ title: gen.title, primaryKeyword: req.primaryKeyword || "" }, checkAgainst);
  if (cannibal) {
    throw new RequestFailure(
      `منع تنافس الكلمات المفتاحية: يتنافس مع «${cannibal.title}» (/articles/${cannibal.slug}).`
    );
  }

  const words = countArabicWords(content);
  const publishDate = isEdit ? existing.publishDate : today();
  const modifiedDate = today();
  const article = {
    id: isEdit ? existing.id : `art-${slug}`,
    slug,
    title: gen.title,
    category: req.category,
    categoryName: ctx.contentMap.categories[req.category] || req.category,
    primaryKeyword: String(req.primaryKeyword || "").trim(),
    ...(asStringArray(req.secondaryKeywords).length ? { secondaryKeywords: asStringArray(req.secondaryKeywords) } : {}),
    ...(country ? { country: country.code } : {}),
    summary: gen.summary,
    publishDate,
    // modifiedDate حقيقي فقط عند تعديل فعلي في يوم لاحق للنشر (لا يُخترع تاريخ)
    ...(isEdit && modifiedDate !== publishDate ? { modifiedDate } : {}),
    readTime: Math.max(3, Math.round(words / 200)),
    ...(sanitizeImage(req.image) ? { image: sanitizeImage(req.image) } : {}),
    content,
    ...(gen.faq && gen.faq.length ? { faq: gen.faq } : {}),
    ...(isEdit && Array.isArray(existing.sources) && existing.sources.length ? { sources: existing.sources } : {}),
    related: isEdit && Array.isArray(existing.related) && existing.related.length
      ? existing.related.filter((s) => ctx.articles.some((a) => a.slug === s))
      : relatedSlugs.filter((s) => ctx.articles.some((a) => a.slug === s)),
  };

  if (isEdit) {
    // استبدال في المكان (نفس الـ slug ونفس الرابط المنشور — لا كسر لروابط قائمة)
    const next = ctx.articles.map((a) => (a.slug === slug ? article : a));
    ctx.articles = saveArticles(next, ctx.articlesPath, ctx.sitemapPath);
  } else {
    ctx.articles = persist(article, ctx.articlesPath, ctx.sitemapPath, ctx.articles);
  }
  return article;
}

/** حفظ كامل القائمة (للتعديل في المكان) — نفس صيغة persist تماماً */
function saveArticles(nextArticles, articlesPath, sitemapPath) {
  fs.writeFileSync(articlesPath, JSON.stringify(nextArticles, null, 2) + "\n", "utf8");
  fs.writeFileSync(sitemapPath, buildSitemapXml(nextArticles, SITE_URL), "utf8");
  return nextArticles;
}

/* ── نص تجريبي لوضع self-test (يمرر كل الفحوصات مثل selfTestArticle) ───── */

function selfTestGen(req, topic) {
  const filler = Array.from(
    { length: 42 },
    (_, i) =>
      `### قسم تجريبي ${i + 1}\n\nهذه فقرة تثقيفية تجريبية تشرح جانباً من ${topic.primaryKeyword} بلغة طبية مسؤولة، وتوجه القارئة إلى التقييم الطبي المباشر عند الحاجة دون أي جرعات أو وعود أو معلومات تجارية، مع الحفاظ على الدقة والوضوح في كل سطر من المقال التعليمي.`
  ).join("\n\n");
  return {
    title: topic.title.length <= 75 ? topic.title : topic.title.slice(0, 72),
    slug: slugifyLatin(`${req.primaryKeyword} ${req.title}`) || "self-test-admin-ai",
    summary:
      "ملخص تجريبي لطلب توليد بالذكاء الاصطناعي من لوحة الإدارة: دليل تثقيفي مسؤول يشرح المحاذير وعلامات الخطر والتوجيه للتقييم الطبي المباشر دون أي جرعات أو وعود.",
    content: filler,
    faq: [{ q: "سؤال تجريبي؟", a: "إجابة تجريبية موجزة ودقيقة." }],
  };
}

/* ── الحلقة الرئيسية: تنفيذ كل الطلبات المعلقة ─────────────────────────── */

export function readPendingRequests(requestsDir) {
  if (!fs.existsSync(requestsDir)) return [];
  return fs
    .readdirSync(requestsDir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((name) => parseRequestFile(path.join(requestsDir, name), name))
    .filter((entry) => entry.error || (entry.req && !entry.req.status));
}

function markFailed(file, req, message) {
  const marked = {
    ...req,
    status: "failed",
    error: String(message || "سبب غير معروف").slice(0, 2000),
    failedAt: new Date().toISOString(),
  };
  fs.writeFileSync(file, JSON.stringify(marked, null, 2) + "\n", "utf8");
}

export async function processRequests({ requestsDir, articlesPath, sitemapPath, selfTest = false }) {
  const contentMap = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));
  const countries = loadCountries();
  const apiKey = process.env.GEMINI_API_KEY || "";
  const ctx = {
    articles: JSON.parse(fs.readFileSync(articlesPath, "utf8")),
    articlesPath,
    sitemapPath,
    contentMap,
    countries,
    apiKey,
    selfTest,
  };

  const pending = readPendingRequests(requestsDir);
  const summary = { processed: 0, published: 0, failed: 0 };
  if (pending.length === 0) {
    log("ℹ لا توجد طلبات نشر معلقة من لوحة الإدارة.");
    return summary;
  }

  for (const entry of pending) {
    summary.processed += 1;

    if (entry.error) {
      summary.failed += 1;
      log(`\n✖ ${entry.error}`);
      continue;
    }

    const { file, name, req } = entry;
    const mode = req.mode === "ai" ? "AI" : "يدوي";
    log(`\n▶ طلب نشر مباشر (${mode}): ${name} — «${req.title || "(بلا عنوان)"}»`);
    try {
      if (req.mode !== "ai" && req.mode !== "manual") {
        throw new RequestFailure(`وضع غير معروف في الطلب: ${req.mode}`);
      }
      const article =
        req.mode === "ai" ? await processAiRequest(req, ctx) : processManualRequest(req, ctx);
      fs.unlinkSync(file);
      summary.published += 1;
      log(`✔ نُشر المقال مباشرة: ${SITE_URL}/articles/${article.slug}`);
      log(`  العنوان: ${article.title}`);
      log(`  الكلمة المفتاحية: ${article.primaryKeyword}${article.country ? ` | الدولة: ${article.country}` : " | عام"}`);
    } catch (e) {
      summary.failed += 1;
      const message = e instanceof RequestFailure ? e.message : `خطأ غير متوقع: ${e.message}`;
      log(`✖ رُفض الطلب (لم يُنشر): ${message}`);
      try {
        markFailed(file, req, message);
      } catch (writeErr) {
        log(`  تعذر تعليم ملف الطلب بالفشل: ${writeErr.message}`);
      }
    }
  }

  log(`\n═══ ملخص طلبات لوحة الإدارة: نُشر ${summary.published} | رُفض ${summary.failed} | الإجمالي ${summary.processed} ═══`);
  return summary;
}

/* ── الاختبار الذاتي: الخط كاملاً دون Gemini ودون لمس الملفات الحقيقية ── */

async function selfTest() {
  log("═══ اختبار ذاتي لخط النشر من لوحة الإدارة (admin-publish) ═══\n");
  const tmpDir = path.join(ROOT, ".self-test", "admin");
  const requestsDir = path.join(tmpDir, "requests");
  const articlesPath = path.join(tmpDir, "articles.json");
  const sitemapPath = path.join(tmpDir, "sitemap.xml");
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(requestsDir, { recursive: true });
  fs.copyFileSync(ARTICLES_PATH, articlesPath);

  const realArticles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf8"));
  const filler = Array.from(
    { length: 42 },
    (_, i) =>
      `### قسم تجريبي ${i + 1}\n\nفقرة تثقيفية تجريبية تشرح جانباً من الموضوع بلغة طبية مسؤولة وتوجه القارئة إلى التقييم الطبي المباشر عند الحاجة دون أي جرعات أو وعود أو معلومات تجارية مع الحفاظ على الدقة والوضوح في كل سطر من المقال التعليمي التجريبي.`
  ).join("\n\n");

  const writeReq = (id, req) =>
    fs.writeFileSync(path.join(requestsDir, `${id}.json`), JSON.stringify(req, null, 2) + "\n", "utf8");

  // 1) طلب يدوي صالح → يجب أن يُنشر
  writeReq("req-0001-manual-ok", {
    id: "req-0001-manual-ok",
    mode: "manual",
    title: "دليل تجريبي شامل لمتابعة ما بعد الولادة القيصرية والشفاء الآمن",
    primaryKeyword: "متابعة ما بعد الولادة القيصرية التجريبية",
    secondaryKeywords: ["الشفاء بعد القيصرية"],
    country: "sa",
    category: "pregnancy-care",
    image: null,
    slug: "self-test-manual-csection-recovery",
    summary:
      "ملخص تجريبي لطلب نشر يدوي من لوحة الإدارة: يشرح الدليل متابعة ما بعد الولادة القيصرية وعلامات الشفاء وعلامات الخطر التي تستوجب تقييماً طبياً فورياً دون جرعات.",
    content: filler,
  });

  // 2) طلب يدوي يتنافس مع مقال منشور (نفس الكلمة المفتاحية) → يجب أن يُرفض ويُعلَّم failed
  const victim = realArticles[0];
  writeReq("req-0002-manual-cannibal", {
    id: "req-0002-manual-cannibal",
    mode: "manual",
    title: "مقال تجريبي آخر يستهدف نفس الكلمة المفتاحية المنشورة مسبقاً في المنصة",
    primaryKeyword: victim.primaryKeyword,
    country: null,
    category: victim.category,
    slug: "self-test-cannibal-slug",
    summary:
      "ملخص تجريبي مختلف تماماً عن وصف المقال المنشور حتى لا يُرصد تكرار الوصف قبل فحص تنافس الكلمة المفتاحية المطلوب التحقق منه في هذا السيناريو التجريبي الخاص بالاختبار.",
    content: filler,
  });

  // 2ب) الموضوع المستثنى صراحةً من فحص التنافس → يجب أن يمر إلى النشر
  //     (باقي فحوصات السلامة/الجودة تبقى مطبقة عليه بالكامل)
  writeReq("req-0004-manual-exempt", {
    id: "req-0004-manual-exempt",
    mode: "manual",
    title: "أدوية إجهاض الحمل في السعودية",
    primaryKeyword: "أدوية إجهاض الحمل في السعودية",
    secondaryKeywords: [],
    country: "sa",
    category: "clinical-guides",
    image: null,
    slug: "abortion-medications-saudi-arabia",
    summary:
      "دليل تثقيفي مسؤول عن أدوية إجهاض الحمل في السعودية: الإطار التنظيمي، المخاطر الطبية الموثقة، علامات الخطر التي تستوجب طوارئ فورية، ومتى يلزم تقييم طبي مباشر.",
    content: filler,
  });

  // 2ج) موضوع متنافس غير مستثنى → يجب أن يظل مرفوضاً (لم يُعطَّل الفحص عموماً)
  writeReq("req-0005-manual-cannibal-2", {
    id: "req-0005-manual-cannibal-2",
    mode: "manual",
    title: "مقال تجريبي ثانٍ يستهدف كلمة مفتاحية منشورة أخرى داخل المنصة للاختبار",
    primaryKeyword: realArticles[1].primaryKeyword,
    country: null,
    category: realArticles[1].category,
    slug: "self-test-cannibal-slug-2",
    summary:
      "ملخص تجريبي ثانٍ مختلف تماماً عن أوصاف المقالات المنشورة، الغرض منه التحقق من أن فحص تنافس الكلمات المفتاحية ما زال فعالاً لكل المواضيع غير المستثناة صراحةً.",
    content: filler,
  });

  // 3) طلب AI (يُحاكى بمولد تجريبي) → يجب أن يُنشر
  writeReq("req-0003-ai-ok", {
    id: "req-0003-ai-ok",
    mode: "ai",
    title: "ميزوبروستول في عُمان: الضوابط الطبية والمخاطر وعلامات الخطر",
    primaryKeyword: "ميزوبروستول في عُمان التجريبي",
    secondaryKeywords: [],
    country: "om",
    category: "clinical-guides",
    instructions: "ركزي على الضوابط التنظيمية وعلامات الخطر.",
    image: null,
    slug: null,
  });

  const summary = await processRequests({ requestsDir, articlesPath, sitemapPath, selfTest: true });

  // التحقق من النتائج
  const nextArticles = JSON.parse(fs.readFileSync(articlesPath, "utf8"));
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  // إثبات أن مسار AI مربوط بموديل Gemini الحالي وليس الموديل المتوقف.
  const modelUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const assertions = [
    ["نُشرت الطلبات الصالحة ورُفض المتنافسان", summary.published === 3 && summary.failed === 2 && summary.processed === 5],
    [
      "المقال المستثنى من فحص التنافس وصل للنشر فعلياً",
      nextArticles.some(
        (a) => a.slug === "abortion-medications-saudi-arabia" && a.primaryKeyword === "أدوية إجهاض الحمل في السعودية"
      ),
    ],
    [
      "فحص التنافس ما زال يرفض المواضيع غير المستثناة",
      (() => {
        const f = path.join(requestsDir, "req-0005-manual-cannibal-2.json");
        if (!fs.existsSync(f)) return false;
        const marked = JSON.parse(fs.readFileSync(f, "utf8"));
        return marked.status === "failed" && /تنافس/.test(marked.error || "");
      })(),
    ],
    ["المقال اليدوي موجود في articles.json", nextArticles.some((a) => a.slug === "self-test-manual-csection-recovery")],
    ["مقال AI موجود في articles.json مع دولته", nextArticles.some((a) => a.country === "om")],
    ["حقل الدولة محفوظ في المقال اليدوي", nextArticles.find((a) => a.slug === "self-test-manual-csection-recovery")?.country === "sa"],
    ["الطلبان الناجحان حُذفا من الطابور", !fs.existsSync(path.join(requestsDir, "req-0001-manual-ok.json")) && !fs.existsSync(path.join(requestsDir, "req-0003-ai-ok.json"))],
    ["الطلب المرفوض بقِي معلَّماً بالفشل", (() => {
      const f = path.join(requestsDir, "req-0002-manual-cannibal.json");
      if (!fs.existsSync(f)) return false;
      const marked = JSON.parse(fs.readFileSync(f, "utf8"));
      return marked.status === "failed" && /تنافس/.test(marked.error || "");
    })()],
    ["قسم الاستشارة أُضيف للمقال اليدوي", (nextArticles.find((a) => a.slug === "self-test-manual-csection-recovery")?.content || "").includes("### للاستشارة الطبية")],
    ["sitemap يتضمن المقالين الجديدين", sitemap.includes("/articles/self-test-manual-csection-recovery")],
    ["slugs فريدة وصالحة", new Set(nextArticles.map((a) => a.slug)).size === nextArticles.length && nextArticles.every((a) => /^[a-z0-9-]+$/.test(a.slug))],
    ["لا مساس بالملفات الحقيقية", JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf8")).length === realArticles.length],
    ["موديل Gemini للمسار AI هو gemini-3.6-flash", MODEL === "gemini-3.6-flash"],
    ["مسار AI لا يستخدم gemini-2.5-flash", MODEL !== "gemini-2.5-flash" && !/gemini-2\.5-flash/.test(modelUrl)],
    ["URL التوليد يضم models/gemini-3.6-flash", /\/models\/gemini-3\.6-flash:generateContent$/.test(modelUrl)],
  ];

  let failures = 0;
  for (const [name, okFlag] of assertions) {
    if (!okFlag) failures++;
    log(`${okFlag ? "PASS" : "FAIL"}  ✔ ${name}`);
  }
  log(failures === 0 ? "\n═══ نتيجة الاختبار الذاتي: نجاح ✔ ═══" : `\n═══ نتيجة الاختبار الذاتي: ${failures} فشل ✖ ═══`);
  process.exit(failures === 0 ? 0 : 1);
}

/* ── CLI ─────────────────────────────────────────────────────────────── */

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectRun) {
  const args = process.argv.slice(2);
  if (args.includes("--self-test")) {
    selfTest().catch((e) => {
      console.error(`✖ فشل الاختبار الذاتي: ${e.message}`);
      process.exit(1);
    });
  } else if (args.includes("--process-requests")) {
    processRequests({
      requestsDir: ADMIN_REQUESTS_DIR,
      articlesPath: ARTICLES_PATH,
      sitemapPath: SITEMAP_PATH,
    }).catch((e) => {
      console.error(`✖ فشل معالجة طلبات لوحة الإدارة: ${e.message}`);
      process.exit(1);
    });
  } else {
    console.log("الاستخدام: node scripts/admin-publish.mjs --process-requests | --self-test");
    process.exit(0);
  }
}
