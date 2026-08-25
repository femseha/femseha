#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * خط توليد ونشر المقالات الآلي — منصة فصيحة (FemSeha)
 * ─────────────────────────────────────────────────────────────────────────────
 * المعمارية (محفوظة من النظام السابق مع إصلاح الأعطال):
 *   1. اختيار الموضوع التالي من خطة المحتوى src/data/content-map.json
 *   2. سقف يومي للنشر (3 مقالات) مهما تكرر تشغيل الجدولة
 *   3. توليد المقال عبر Gemini (gemini-2.5-flash)
 *   4. فحوصات الجودة والسلامة الإلزامية (لا نشر عند فشل أي فحص)
 *   5. إضافة إخلاء المسؤولية الدائم + دعوة الاستشارة + الروابط الداخلية
 *   6. حفظ المقال في src/data/articles.json وتحديث public/sitemap.xml
 *   7. عند التشغيل داخل GitHub Actions: رفع التغييرات (git commit + push)
 *
 * ملاحظة: اسم الملف generate-article.mjs هو المسار الذي يستدعيه
 * سير العمل الحالي .github/workflows/auto-publish.yml كما هو دون تعديل.
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

const ROOT = process.cwd();
const MAP_PATH = path.join(ROOT, "src", "data", "content-map.json");
const ARTICLES_PATH = path.join(ROOT, "src", "data", "articles.json");
const SITEMAP_PATH = path.join(ROOT, "public", "sitemap.xml");
const SITE_URL = "https://femseha.com";
const MODEL = "gemini-2.5-flash";
const DOCTOR_NAME = "د. هيثم الخطيب";
const MIN_WORDS = 1400;          // الحد الأدنى المقبول للنشر
const TARGET_WORDS_DEFAULT = 2000;
const MAX_DAILY_ARTICLES = 3;    // السقف اليومي للنشر (الجدولة القديمة تعمل 5 مرات يومياً)

/* ── أدوات مساعدة ─────────────────────────────────────────────────────── */

const fail = (msg) => {
  console.error(`\n✖ فشل النشر: ${msg}`);
  process.exit(1);
};

const log = (msg) => console.log(msg);

function today() {
  return new Date().toISOString().split("T")[0];
}

function countArabicWords(text) {
  return (text || "")
    .split(/\s+/)
    .filter((w) => /[\u0600-\u06FFa-zA-Z0-9]/.test(w)).length;
}

/** تطبيع النص العربي للمقارنة */
function normalizeArabic(text) {
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
function titleSimilarity(a, b) {
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
function keywordCoverage(existingKeyword, newText) {
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

const SAFETY_RULES = [
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

function runSafetyChecks(content) {
  const violations = [];
  const plain = content.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // لا نفحص نص الروابط
  for (const rule of SAFETY_RULES) {
    if (rule.pattern.test(plain)) violations.push(rule);
  }
  return violations;
}

/* ── اختيار الموضوع من خطة المحتوى (مع منع تنافس الكلمات المفتاحية) ───── */

function pickNextTopic(contentMap, articles) {
  const publishedSlugs = new Set(articles.map((a) => a.slug));
  const existingKeywords = articles.map((a) => normalizeArabic(a.primaryKeyword || ""));

  const queue = [...(contentMap.queue || [])].sort((a, b) => (a.priority || 99) - (b.priority || 99));

  for (const topic of queue) {
    if (publishedSlugs.has(topic.slug)) continue;

    // فحص تنافس الكلمات المفتاحية مع المحتوى المنشور
    const topicKey = normalizeArabic(topic.primaryKeyword || "");
    let cannibal = null;
    for (let i = 0; i < articles.length; i++) {
      const existingKey = existingKeywords[i];
      const existingTitle = articles[i].title || "";
      if (!existingKey) continue;
      const topicText = `${topic.primaryKeyword || ""} ${topic.title || ""}`;
      const existingText = `${articles[i].primaryKeyword || ""} ${existingTitle}`;
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
        cannibal = articles[i];
        break;
      }
    }
    if (cannibal) {
      log(`↷ تخطي «${topic.slug}»: يتنافس مع المنشور «${cannibal.slug}» على الكلمة المفتاحية.`);
      continue;
    }
    return topic;
  }
  return null;
}

/* ── توليد المقال عبر Gemini ──────────────────────────────────────────── */

function buildPrompt(topic, contentMap, articles) {
  const categories = contentMap.categories || {};
  const relatedInfo = (topic.relatedSlugs || [])
    .map((slug) => {
      const a = articles.find((x) => x.slug === slug);
      return a ? `- [${a.title}](/articles/${a.slug})` : null;
    })
    .filter(Boolean)
    .join("\n");

  return `أنت طبيب اختصاصي نساء وتوليد تكتب محتوى توعوياً طبياً دقيقاً للغاية لجمهور نسائي سعودي، بأسلوب مهني رحيم وواضح، بمخاطبة المؤنث بالعربية الفصحى المبسطة.

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

async function generateWithGemini(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.65,
        topP: 0.95,
        maxOutputTokens: 32768,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
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
}

function parseGeneratedArticle(raw) {
  let text = raw.trim();
  text = text.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(text);
  if (!parsed.title || !parsed.content) throw new Error("الحقول الأساسية ناقصة في الاستجابة");
  parsed.faq = Array.isArray(parsed.faq) ? parsed.faq.filter((f) => f && f.q && f.a) : [];
  return parsed;
}

/* ── تجميع المقال النهائي (روابط داخلية + استشارة + إخلاء مسؤولية) ───── */

function finalizeContent(topic, gen, articles) {
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
  content += `\n\n### للاستشارة الطبية\n\nهذا المقال محتوى تثقيفي عام بإشراف ${DOCTOR_NAME}، ولا يغني عن التقييم الطبي المباشر ولا يصلح أساساً لتشخيص ذاتي أو قرار علاجي فردي. للاستشارة المباشرة يمكنك زيارة صفحة [الاستشارة الطبية](/consultation) أو [التعرف على الطبيب المعالج](/doctor).`;

  return content;
}

/* ── فحوصات الجودة الإلزامية قبل النشر ────────────────────────────────── */

function runQualityChecks(gen, topic, articles) {
  const errors = [];

  const words = countArabicWords(gen.content);
  if (words < MIN_WORDS) {
    errors.push(`عدد الكلمات ${words} أقل من الحد الأدنى ${MIN_WORDS}`);
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

  // فحوصات السلامة
  const violations = runSafetyChecks(gen.content);
  for (const v of violations) errors.push(`سلامة: ${v.name} — ${v.message}`);

  return { errors, words };
}

/* ── كتابة الملفات (articles.json + sitemap.xml) ─────────────────────── */

function buildSitemap(articles) {
  const d = today();
  const urls = [
    `  <url>\n    <loc>${SITE_URL}/</loc>\n    <lastmod>${d}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    `  <url>\n    <loc>${SITE_URL}/articles</loc>\n    <lastmod>${d}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`,
    `  <url>\n    <loc>${SITE_URL}/doctor</loc>\n    <lastmod>${d}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    `  <url>\n    <loc>${SITE_URL}/consultation</loc>\n    <lastmod>${d}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    `  <url>\n    <loc>${SITE_URL}/medical-disclaimer</loc>\n    <lastmod>${d}</lastmod>\n    <changefreq>yearly</changefreq>\n    <priority>0.4</priority>\n  </url>`,
    ...articles.map(
      (a) =>
        `  <url>\n    <loc>${SITE_URL}/articles/${a.slug}</loc>\n    <lastmod>${a.publishDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

function persist(article, articlesPath, sitemapPath, existingArticles) {
  const nextArticles = [article, ...existingArticles];
  fs.writeFileSync(articlesPath, JSON.stringify(nextArticles, null, 2) + "\n", "utf8");
  fs.writeFileSync(sitemapPath, buildSitemap(nextArticles), "utf8");
  return nextArticles;
}

/* ── رفع التغييرات عند التشغيل داخل GitHub Actions ───────────────────── */

function pushFromCI() {
  if (process.env.GITHUB_ACTIONS !== "true") return;
  const ref = process.env.GITHUB_REF_NAME || "main";
  try {
    execSync("git config user.name 'femseha-auto-publisher'", { stdio: "inherit" });
    execSync("git config user.email 'auto-publisher@femseha.com'", { stdio: "inherit" });
    execSync("git add src/data/articles.json public/sitemap.xml", { stdio: "inherit" });
    const hasChanges =
      execSync("git status --porcelain -- src/data/articles.json public/sitemap.xml")
        .toString()
        .trim().length > 0;
    if (!hasChanges) {
      log("ℹ لا توجد تغييرات لرفعها.");
      return;
    }
    execSync(`git commit -m "chore(auto-publish): publish article ${today()}"`, { stdio: "inherit" });
    execSync(`git pull --rebase origin ${ref} || true`, { stdio: "inherit" });
    execSync(`git push origin HEAD:${ref}`, { stdio: "inherit" });
    log("✔ تم رفع المقال إلى المستودع (سيقوم Vercel بالنشر).");
  } catch (e) {
    fail(`فشل رفع المقال إلى المستودع: ${e.message}. تحقق من صلاحية GITHUB_TOKEN (Settings → Actions → General → Workflow permissions → Read and write).`);
  }
}

/* ── الوضع الرئيسي ─────────────────────────────────────────────────────── */

async function main() {
  const selfTest = process.argv.includes("--self-test");

  log("═══ خط النشر الآلي — منصة فصيحة ═══");
  log(`التاريخ: ${today()}  |  النموذج: ${MODEL}${selfTest ? "  |  وضع الاختبار الذاتي" : ""}\n`);

  if (!fs.existsSync(MAP_PATH)) fail(`ملف خطة المحتوى غير موجود: ${MAP_PATH}`);
  if (!fs.existsSync(ARTICLES_PATH)) fail(`ملف المقالات غير موجود: ${ARTICLES_PATH}`);

  const contentMap = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));
  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf8"));
  log(`المقالات المنشورة حالياً: ${articles.length}`);
  log(`مواضيع خطة المحتوى المتبقية: ${(contentMap.queue || []).length}`);

  // سقف النشر اليومي (~3 مقالات/يوم مهما تكررت الجدولة)
  const publishedToday = articles.filter((a) => a.publishDate === today()).length;
  if (publishedToday >= MAX_DAILY_ARTICLES) {
    log(`\nℹ تم بلوغ السقف اليومي للنشر (${publishedToday}/${MAX_DAILY_ARTICLES} مقالاً في ${today()}) — لن يُنشر مقال جديد اليوم. لا يوجد أي نشر مزعوم.`);
    return;
  }

  // 1) اختيار الموضوع
  const topic = pickNextTopic(contentMap, articles);
  if (!topic) {
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
  log(`✔ فحوصات الجودة: ${quality.words} كلمة (الحد الأدنى ${MIN_WORDS}) — اجتازت`);

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
  pushFromCI();
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

main().catch((e) => fail(e.message || "خطأ غير متوقع"));
