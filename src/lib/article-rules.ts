/**
 * قواعد المقالات المشتركة للوحة الإدارة (/admin) — نسخة المتصفح.
 *
 * ⚠ المصدر الحاسم (authoritative) لهذه القواعد هو خط النشر في الخادم:
 *   scripts/generate-article.mjs + scripts/admin-publish.mjs
 * هذه الوحدة مرآة طبق الأصل للمنطق نفسه (نفس الدوال والعتبات) لتمكين
 * الفحص الفوري في المتصفح قبل إرسال طلب النشر — ويُعاد الفحص كاملاً داخل
 * GitHub Actions قبل النشر، فلا يُنشر أي مقال لم يجتز الفحوصات هناك.
 *
 * لا تعتمد هذه الوحدة على أي API خاص بـ Node (تعمل في المتصفح وفي SSR).
 */
import countriesData from "../data/countries.json";
import { internalPath, isUnsafeLink, extractMarkdownLinks } from "./links";
import { isPublishableImageUrl, isTemporaryImageUrl } from "./image-url";
import cannibalizationExceptions from "../data/cannibalization-exceptions.json";
import type { ArticleRecord } from "../data/types";

/* ── الدول/الأسواق (src/data/countries.json — المصدر الوحيد) ───────────── */

export interface Country {
  code: string;
  name: string;
  flag: string;
  fullName: string;
  healthAuthority: string;
}

export const COUNTRIES: Country[] = countriesData.countries as Country[];

export function countryByCode(code?: string | null): Country | null {
  if (!code) return null;
  return COUNTRIES.find((c) => c.code === code) || null;
}

/** تسمية العرض في قائمة المقالات: علم + اسم، أو «عام» عند غياب الدولة */
export function countryLabel(code?: string | null): string {
  const c = countryByCode(code);
  return c ? `${c.flag} ${c.name}` : "عام";
}

/* ── التصنيفات (مطابقة لـ content-map.json — الخادم يقرأ الأسماء من المصدر) ── */

export const CATEGORIES: { id: string; name: string }[] = [
  { id: "womens-health", name: "صحة المرأة والخصوبة" },
  { id: "pregnancy-care", name: "الحمل والولادة" },
  { id: "clinical-guides", name: "إرشادات الأدوية والبروتوكولات" },
  { id: "mental-health", name: "الصحة النفسية والتوعية" },
  { id: "general-health", name: "الصحة العامة والتوعية" },
];

/* ── عتبات الجودة (مطابقة لثوابت scripts/generate-article.mjs) ─────────── */

export const LIMITS = {
  /**
   * الحد الأدنى الحقيقي للمحتوى قبل النشر.
   *
   * لا يوجد شرط «1400 كلمة» بعد اليوم: كان رقماً إجبارياً يمنع نشر مقالات قصيرة
   * صالحة تماماً. المستخدم هنا هو حد الجودة الموجود أصلاً في فحص المحتوى بالمشروع
   * (scripts/seo-validate.mjs: «محتوى قصير جداً» عند أقل من 250 كلمة) — نفس الرقم
   * ونفس المصدر، لا رقم جديد ولا شرط SEO مخترع.
   */
  MIN_WORDS: 250,
  TITLE_MIN: 20,
  TITLE_MAX: 75,
  SUMMARY_MIN: 100,
  SUMMARY_MAX: 170,
  META_DESC_MAX: 160,
} as const;

/** المسارات الثابتة القابلة للربط الداخلي (مطابقة لـ generate-sitemap.mjs) */
export const STATIC_ROUTES = ["/", "/articles", "/doctor", "/consultation", "/medical-disclaimer"];

/* ── دوال النص العربي (مطابقة حرفياً لنسخة الخادم) ─────────────────────── */

export function countWords(text: string): number {
  return (text || "")
    .split(/\s+/)
    .filter((w) => /[\u0600-\u06FFa-zA-Z0-9]/.test(w)).length;
}

export function normalizeArabic(text: string): string {
  return (text || "")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function stemAr(w: string): string {
  let s = w;
  for (let i = 0; i < 2; i++) {
    if (s.length > 5 && /^(وال|بال|فال|كال|لل)/.test(s)) s = s.slice(3);
    else if (s.length > 4 && /^ال/.test(s)) s = s.slice(2);
    else if (s.length > 3 && /^[وف]/.test(s)) s = s.slice(1);
    else break;
  }
  return s;
}

function tokenMatch(w: string, x: string): boolean {
  if (w === x) return true;
  const sw = stemAr(w);
  const sx = stemAr(x);
  if (sw === sx) return true;
  if (sw.length >= 4 && sx.length >= 4 && (sw.startsWith(sx) || sx.startsWith(sw))) return true;
  return false;
}

export function titleSimilarity(a: string, b: string): number {
  const norm = (t: string) => normalizeArabic(t).split(" ").filter((w) => w.length > 2);
  const ta = norm(a);
  const tb = norm(b);
  if (ta.length === 0 || tb.length === 0) return 0;
  let inter = 0;
  for (const w of ta) {
    if (tb.some((x) => tokenMatch(w, x))) inter += 1;
  }
  return inter / Math.min(ta.length, tb.length);
}

export function keywordCoverage(existingKeyword: string, newText: string): number {
  const ek = normalizeArabic(existingKeyword).split(" ").filter((w) => w.length > 2);
  if (ek.length === 0) return 0;
  const nt = normalizeArabic(newText).split(" ").filter((w) => w.length > 2);
  let hits = 0;
  for (const w of ek) {
    if (nt.some((x) => tokenMatch(w, x))) hits += 1;
  }
  return hits / ek.length;
}

/* ── منع تنافس الكلمات المفتاحية (Cannibalization) ─────────────────────── */

/**
 * مطابقة حرفية لمنطق pickNextTopic/findCannibalization في scripts/generate-article.mjs:
 * يعيد المقال المنشور الذي يتنافس مع الموضوع الجديد، أو null إن لا يوجد تنافس.
 * excludeSlug: لاستبعاد المقال نفسه في وضع التعديل.
 */
export interface CannibalizationException {
  title?: string;
  primaryKeyword?: string;
  reason?: string;
}

/**
 * استثناءات فحص التنافس فقط — مرآة loadCannibalizationExceptions في
 * scripts/generate-article.mjs (نفس الملف ونفس منطق المطابقة بعد التطبيع).
 * لا تعطّل أي فحص آخر (سلامة طبية، جودة، روابط، تكرار وصف…).
 */
export const CANNIBALIZATION_EXCEPTIONS: CannibalizationException[] =
  ((cannibalizationExceptions as { exceptions?: CannibalizationException[] }).exceptions || []).filter(
    (e) => e && (e.title || e.primaryKeyword)
  );

export function isCannibalizationExempt(topic: { title: string; primaryKeyword: string }): boolean {
  const key = normalizeArabic(topic.primaryKeyword || "");
  const title = normalizeArabic(topic.title || "");
  return CANNIBALIZATION_EXCEPTIONS.some((e) => {
    const ek = normalizeArabic(e.primaryKeyword || "");
    const et = normalizeArabic(e.title || "");
    const keyOk = ek ? ek === key : true;
    const titleOk = et ? et === title : true;
    return keyOk && titleOk && Boolean(ek || et);
  });
}

export function findCannibalization(
  topic: { title: string; primaryKeyword: string },
  articles: ArticleRecord[],
  excludeSlug?: string | null
): ArticleRecord | null {
  // استثناء تحريري صريح لهذا الموضوع تحديداً — تخطي فحص التنافس وحده.
  if (isCannibalizationExempt(topic)) return null;
  const topicKey = normalizeArabic(topic.primaryKeyword || "");
  const topicText = `${topic.primaryKeyword || ""} ${topic.title || ""}`;
  for (const a of articles) {
    if (excludeSlug && a.slug === excludeSlug) continue;
    const existingKey = normalizeArabic(a.primaryKeyword || "");
    const existingTitle = a.title || "";
    if (!existingKey) continue;
    const existingText = `${a.primaryKeyword || ""} ${existingTitle}`;
    const existingCoveredByNew = keywordCoverage(existingKey, topicText) >= 0.6;
    const newCoveredByExisting = topicKey ? keywordCoverage(topicKey, existingText) >= 0.6 : false;
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

/* ── الـ slug ───────────────────────────────────────────────────────────── */

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** استخراج slug لاتيني من نص (عنوان/كلمة مفتاحية) — ما لا يحرف لاتينياً يُهمل */
export function slugifyLatin(input: string, maxLen = 60): string {
  const latin = (input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const trimmed = latin.slice(0, maxLen).replace(/-+$/g, "");
  return SLUG_RE.test(trimmed) && trimmed.length >= 3 ? trimmed : "";
}

export function isSlugTaken(slug: string, articles: ArticleRecord[], excludeSlug?: string | null): boolean {
  return articles.some((a) => a.slug === slug && a.slug !== excludeSlug);
}

/* ── قواعد السلامة الطبية (مرآة SAFETY_RULES في generate-article.mjs) ──── */

export const SAFETY_PATTERNS: { name: string; re: RegExp; message: string }[] = [
  {
    name: "لا أرقام هواتف أو واتساب داخل المحتوى",
    re: /(\+?\d{9,15})|(00966\d+)|(\+966\d+)|(05\d{8})|(واتساب)|(whatsapp)|(wa\.me)|(هاتف:)|(جوال:)/i,
    message: "المحتوى يتضمن وسيلة تواصل — التواصل يُضاف حصراً عبر قسم الاستشارة الرسمي.",
  },
  {
    name: "لا جرعات أو تعليمات دوائية رقمية",
    re: /\d+\s*(ملغ|مجم|مليغرام|ميكروغرام|مجمجرام|mg|mcg|قرص|اقراص|أقراص|كبسول|كبسولة|كبسولات|حبه|حبة|حبات|امبول|أمبولة|حقن[ةه]|ساعة\s*قبل)/i,
    message: "المحتوى يتضمن جرعة أو تعليماً دوائياً رقمياً — ممنوع تماماً في المحتوى التثقيفي.",
  },
  {
    name: "لا أسعار أو عروض تجارية",
    re: /(للبيع|نبيع|السعر|سعره|بسعر|ريال[sS]?|درهم|الدفع عند الاستلام|توصيل (مجاني|سريع)|شحن (مجاني|سريع)|خصم|عرض خاص|مجانا للطلبات|متوفر في صيدلي[ةه]|نوفر)/i,
    message: "المحتوى يتضمن لغة تجارية — المنصة توعوية ولا تبيع الأدوية.",
  },
  {
    name: "لا وعود بنتائج مضمونة",
    re: /(نجاح مضمون|نتيجة مضمونة|شفاء تام مضمون|100 ?%|بالتأكيد ستحملين|يضمن الشفاء)/i,
    message: "المحتوى يتضمن وعداً بنتيجة طبية — غير مسؤول طبياً.",
  },
  {
    name: "لا أسماء صيدليات أو جهات بيع",
    re: /(صيدلي[ةه] النهدي|صيدلي[ةه] الدواء|النهدي|داماس|الرافد)/i,
    message: "المحتوى يذكر جهة صرف محددة — غير مسموح.",
  },
];

/** أنماط إضافية مطابقة لحارس YMYL في scripts/audit-indexing.mjs (تشمل عملات الخليج) */
export const COMMERCIAL_PATTERNS: { name: string; re: RegExp; negatable?: boolean }[] = [
  {
    name: "سعر بعملة",
    re: /\d[\d.,]*\s*(?:ريال|ر\.س|درهم|دينار|جنيه|دولار|kwd|sar|aed|omr|bhd|qar)/i,
  },
  {
    name: "عبارة بيع مباشرة",
    re: /اطلب الآن|التوصيل السريع|متوفر للبيع|للطلب والشراء|أرخص سعر|سعر خاص/,
  },
  {
    name: "مصدر شراء",
    re: /(?:رابط|مصدر)\s*(?:شراء|للشراء)/,
    negatable: true,
  },
];

const NEGATION_RE = /(لا|ليس|ليست|يمنع|المنع|بدون|دون|رفض|استبعاد|تتجنب|تجنّب)/;

/** فحص السلامة على نص (مطابقة لـ runSafetyChecks + الحارس التجاري، مع إعفاء التنويهات النافية) */
export function safetyViolations(text: string): string[] {
  const plain = (text || "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  const violations: string[] = [];
  for (const rule of SAFETY_PATTERNS) {
    if (rule.re.test(plain)) violations.push(`${rule.name} — ${rule.message}`);
  }
  for (const rule of COMMERCIAL_PATTERNS) {
    const m = rule.re.exec(plain);
    if (!m) continue;
    if (rule.negatable && NEGATION_RE.test(plain.slice(Math.max(0, m.index - 45), m.index))) continue;
    violations.push(`محتوى تجاري ممنوع (${rule.name}): "${m[0]}"`);
  }
  return violations;
}

/* ── الروابط الداخلية ───────────────────────────────────────────────────── */

/** روابط داخلية مكسورة في محتوى ماركداون (مطابقة لفحص seo-validate.mjs).
 *  يشمل الروابط المطلقة على نطاق الموقع نفسه (https://femseha.com/...) لأنها
 *  روابط داخلية فعلياً. الروابط الخارجية لا تُفحص هنا ولا تُحذف أبداً. */
export function brokenInternalLinks(content: string, articles: ArticleRecord[]): string[] {
  const routes = new Set([...STATIC_ROUTES, ...articles.map((a) => `/articles/${a.slug}`)]);
  const broken: string[] = [];
  for (const link of extractMarkdownLinks(content || "")) {
    const path = internalPath(link.href);
    if (path && !routes.has(path)) broken.push(path);
  }
  return broken;
}

/** روابط بمخططات خطرة (javascript:/data:/…) — تُرفض ولا تُنشر */
export function unsafeLinks(content: string): string[] {
  return extractMarkdownLinks(content || "")
    .filter((l) => isUnsafeLink(l.href))
    .map((l) => l.href);
}

/** هل يحتوي المحتوى على فقرة نصية حقيقية (وليس عناوين/قوائم فارغة أو رموزاً فقط)؟ */
export function hasRealParagraph(content: string): boolean {
  return String(content || "")
    .split("\n")
    .map((l) => l.trim())
    .some((line) => {
      if (!line) return false;
      if (/^(#{1,6}\s*|[-_*]{3,})$/.test(line)) return false;
      const text = line
        .replace(/^#{1,6}\s+/, "")
        .replace(/^[*•]\s+/, "")
        .replace(/^\d+[.)]\s+/, "")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/[*_`>#-]/g, "")
        .trim();
      return countWords(text) >= 3;
    });
}

/* ── مسودات الطلبات ─────────────────────────────────────────────────────── */

export interface AiDraft {
  title: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  country: string | null;
  category: string;
  instructions: string;
  image: string | null;
}

export interface ManualDraft {
  title: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  country: string | null;
  category: string;
  image: string | null;
  content: string;
  summary: string;
  slug: string;
  editSlug?: string | null;
}

/** تقسيم حقل الكلمات الإضافية (فواصل عربية/إنجليزية أو أسطر) */
export function parseKeywordList(raw: string): string[] {
  return (raw || "")
    .split(/[،,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** فحص رابط صورة المقال المُدخل يدوياً (الرفع من الجهاز يُفحص في github-publish) */
export function imageDraftErrors(image?: string | null): string[] {
  const value = String(image || "").trim();
  if (!value) return [];
  if (isTemporaryImageUrl(value)) {
    return ["رابط الصورة مؤقت (blob/data/مسار محلي) ولا يعمل بعد النشر — ارفع الصورة من الجهاز أو استخدم رابطاً نهائياً."];
  }
  if (!isPublishableImageUrl(value)) {
    return ["رابط الصورة غير صالح — استخدم رابط https كاملاً أو مساراً داخلياً يبدأ بـ /images/."];
  }
  return [];
}

/** فحص مسبق لطلب توليد AI — يعيد قائمة أخطاء (فارغة = جاهز للإرسال) */
export function validateAiDraft(draft: AiDraft, articles: ArticleRecord[]): string[] {
  const errors: string[] = [];
  if (!draft.title.trim()) errors.push("عنوان المقال مطلوب.");
  if (!draft.primaryKeyword.trim()) errors.push("الكلمة المفتاحية الرئيسية مطلوبة.");
  if (draft.country && !countryByCode(draft.country)) errors.push("رمز الدولة غير معروف.");
  if (!CATEGORIES.some((c) => c.id === draft.category)) errors.push("التصنيف غير معروف.");
  for (const e of imageDraftErrors(draft.image)) errors.push(e);
  if (draft.title.trim() && draft.primaryKeyword.trim()) {
    const cannibal = findCannibalization(
      { title: draft.title, primaryKeyword: draft.primaryKeyword },
      articles
    );
    if (cannibal) {
      errors.push(
        `منع تنافس الكلمات المفتاحية: هذا الموضوع يتنافس مع المقال المنشور «${cannibal.title}» (/articles/${cannibal.slug}) — غيّر الكلمة المفتاحية أو الزاوية.`
      );
    }
  }
  return errors;
}

/** فحص مسبق لمقال يدوي (جديد أو تعديل) — نفس عتبات خط النشر الآلي */
export function validateManualDraft(draft: ManualDraft, articles: ArticleRecord[]): string[] {
  const errors: string[] = [];
  const exclude = draft.editSlug || null;
  const title = draft.title.trim();

  if (title.length < LIMITS.TITLE_MIN || title.length > LIMITS.TITLE_MAX) {
    errors.push(`العنوان يجب أن يكون بين ${LIMITS.TITLE_MIN} و${LIMITS.TITLE_MAX} حرفاً (الحالي: ${title.length}).`);
  }
  const summary = draft.summary.trim();
  if (summary.length < LIMITS.SUMMARY_MIN || summary.length > LIMITS.SUMMARY_MAX) {
    errors.push(`الوصف التعريفي (Meta Description) يجب أن يكون بين ${LIMITS.SUMMARY_MIN} و${LIMITS.SUMMARY_MAX} حرفاً (الحالي: ${summary.length}).`);
  }
  if (!draft.primaryKeyword.trim()) errors.push("الكلمة المفتاحية الرئيسية مطلوبة.");
  if (draft.country && !countryByCode(draft.country)) errors.push("رمز الدولة غير معروف.");
  if (!CATEGORIES.some((c) => c.id === draft.category)) errors.push("التصنيف غير معروف.");

  // المحتوى: يُمنع الفارغ وشبه الفارغ فقط — لا شرط 1400 كلمة
  const contentText = String(draft.content || "").trim();
  const words = countWords(draft.content);
  if (!contentText) {
    errors.push("محتوى المقال فارغ — لا يمكن نشر مقال بلا محتوى.");
  } else if (!hasRealParagraph(draft.content)) {
    errors.push("محتوى المقال غير صالح للنشر — لا يحتوي على أي فقرة نصية حقيقية.");
  } else if (words < LIMITS.MIN_WORDS) {
    errors.push(
      `محتوى قصير جداً (${words} كلمة) — الحد الأدنى الفعلي للنشر ${LIMITS.MIN_WORDS} كلمة (نفس حد فحص المحتوى في المشروع).`
    );
  }

  // slug
  if (!exclude) {
    if (!draft.slug.trim()) errors.push("الـ slug مطلوب لمقال جديد (أحرف لاتينية صغيرة وأرقام وشرطات).");
    else if (!SLUG_RE.test(draft.slug.trim())) errors.push("صيغة الـ slug غير صالحة — المسموح: a-z و0-9 و- فقط.");
    else if (isSlugTaken(draft.slug.trim(), articles)) errors.push(`الـ slug "${draft.slug.trim()}" مستخدم مسبقاً — اختر غيره.`);
  }

  // العنوان الفريد
  for (const a of articles) {
    if (exclude && a.slug === exclude) continue;
    if (a.title === title) {
      errors.push(`العنوان مكرر حرفياً مع مقال منشور: «${a.title}».`);
      break;
    }
    if (titleSimilarity(title, a.title) > 0.75) {
      errors.push(`العنوان شديد التشابه مع «${a.title}» — غيّر الزاوية منعاً للتنافس.`);
      break;
    }
  }

  // منع تنافس الكلمة المفتاحية
  if (draft.primaryKeyword.trim()) {
    const cannibal = findCannibalization({ title, primaryKeyword: draft.primaryKeyword }, articles, exclude);
    if (cannibal) {
      errors.push(
        `منع تنافس الكلمات المفتاحية: الكلمة «${draft.primaryKeyword}» تتنافس مع «${cannibal.title}» (/articles/${cannibal.slug}).`
      );
    }
  }

  // الوصف الفريد
  const desc = summary.slice(0, LIMITS.META_DESC_MAX);
  for (const a of articles) {
    if (exclude && a.slug === exclude) continue;
    if (a.summary && a.summary.slice(0, LIMITS.META_DESC_MAX) === desc && desc) {
      errors.push("الوصف التعريفي مكرر مع مقال منشور آخر — يجب أن يكون فريداً.");
      break;
    }
  }

  // السلامة الطبية + التجارية
  for (const v of safetyViolations(`${title}\n${summary}\n${draft.content}`)) errors.push(`سلامة: ${v}`);

  // روابط داخلية
  const broken = brokenInternalLinks(draft.content, articles);
  if (broken.length) errors.push(`روابط داخلية مكسورة في المحتوى: ${broken.join("، ")} — يجب أن تشير لمسارات منشورة فقط.`);

  // روابط خطرة (لا تُحذف بصمت — يُرفض النشر ويُعرض السبب)
  const unsafe = unsafeLinks(draft.content);
  if (unsafe.length) {
    errors.push(`روابط غير آمنة في المحتوى: ${unsafe.join("، ")} — المسموح فقط: http(s) وmailto وtel والمسارات الداخلية.`);
  }

  // صورة المقال: يجب أن تكون رابطاً نهائياً يمكن للصفحة العامة الوصول إليه
  for (const e of imageDraftErrors(draft.image)) errors.push(e);

  return errors;
}

/** توليد معرف طلب نشر فريد */
export function newRequestId(): string {
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}-${p(now.getUTCHours())}${p(now.getUTCMinutes())}${p(now.getUTCSeconds())}`;
  const rand = Math.random().toString(36).slice(2, 8);
  return `req-${stamp}-${rand}`;
}
