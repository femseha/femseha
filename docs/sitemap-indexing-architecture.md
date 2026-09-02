# Sitemap & Indexing Architecture — البنية المؤتمتة

> آخر تحديث: 2026-09-03 — ضمن مهمة «Automated Sitemap & Indexing Architecture — Full Site Coverage».

## المبدأ: مصدر حقيقة واحد

`src/data/articles.json` + جدول المسارات الثابتة في `scripts/generate-sitemap.mjs` هما المصدر الوحيد
الذي يُشتق منه كل ما يتعلق بالفهرسة (sitemap، الفحوصات، التدقيق). لا تحديث يدوي لأي ملف مشتق.

## المولّد الموحّد: `scripts/generate-sitemap.mjs`

- يقرأ `articles.json` ويولّد `public/sitemap.xml` — **أي مقال جديد يدخل sitemap تلقائياً**.
- مربوط بالبناء: `npm run build` = `generate-sitemap && vite build` (كذلك `npm run sitemap`
  و`npm run sitemap:check` للفحص دون كتابة).
- يستخدمه خط النشر الآلي `scripts/generate-article.mjs` (استيراد مباشر لدالة `buildSitemapXml`)
  فلا توجد صيغة ثانية تنافس على الملف.
- التحقق قبل الكتابة: slugs صالحة (`a-z0-9-`) ومتفرّدة، تواريخ ISO متسقة، ولا مسار محجوب
  (`/admin`، `/search`) أو اختباري/ميت يمكن أن يظهر.

## سياسة المحتوى في sitemap

| المسار | الفهرسة | lastmod |
|---|---|---|
| `/` و`/articles` | قابلة للفهرسة | أحدث تاريخ محتوى حقيقي (modifiedDate/publishDate) |
| `/doctor`، `/consultation`، `/medical-disclaimer` | قابلة للفهرسة | بلا lastmod — لا تاريخ تعديل موثق، ولا تُخترع تواريخ |
| `/articles/{slug}` لكل مقال | قابلة للفهرسة | `modifiedDate \|\| publishDate` فقط |
| `/admin`، `/search`، أي test/dead | محظورة — لا تدخل sitemap أبداً | — |

## robots.txt و canonical و noindex

- `robots.txt`: `Allow: /` + `Disallow: /admin` و`/search` + `Sitemap: https://femseha.com/sitemap.xml`.
- canonical ذاتي مطلق لكل صفحة قابلة للفهرسة (`index.html` + `useSeo` في كل صفحة + `/articles/{slug}`).
- noindex عبر `useSeo({ robots, noCanonical })`:
  - `/admin` → `noindex, nofollow` وبلا canonical.
  - 404 (المسار `*`) → `noindex, follow` وبلا canonical (لا canonical للرئيسية من روابط ميتة).
  - slug مقال غير صحيح → **soft-404 حقيقي**: عرض NotFoundPage + `noindex, follow` + بلا canonical،
    **دون أي fallback لأول مقال** (`getArticleBySlug` يعيد undefined فقط).
- وسم robots يُنظَّف بين التنقلات كي لا يتسرب noindex لصفحة فهرسية.

## أدوات الفحص (تُشغَّل محلياً وقبل أي نشر يدوي)

| الأمر | الغرض |
|---|---|
| `npm run build` | توليد sitemap + بناء الإنتاج (يفشل لو انتهكت قواعد المولّد) |
| `npm run typecheck` / `npx tsc --noEmit` | سلامة الأنواع |
| `npm run seo:validate` | الفحص العميق (H1/canonical/Schema/يتيمة/روابط/محتوى) عبر SSR فعلي |
| `npm run seo:ssr` | عرض فعلي لكل المسارات — **مشتق ديناميكياً من articles.json** + فحوصات soft-404 |
| `npm run seo:audit` | تدقيق بنية الفهرسة: الأتمتة، حداثة sitemap، noindex، الروابط الداخلية، حارس YMYL |
| `node scripts/generate-article.mjs --self-test` | اختبار خط النشر الآلي (يكتب في `.self-test/` فقط) |

## حارس YMYL التجاري

`seo:audit` يفشل البناء عند: أسعار بعملات، عبارات بيع مباشرة، روابط/مصادر شراء (خارج سياق التنويهات
النافية مثل «لا نوفر أي مصدر شراء»)، ويحذّر عند أي جرعات رقمية. لا doorway pages: كل مسار sitemap
إما من الصفحات الثابتة الخمس أو `/articles/{slug}` منشور.

## دورة النشر الآلي

`auto-publish.yml` → `generate-article.mjs` يضيف مقالاً لـ `articles.json` ويولّد sitemap بالصيغة
الموحدة → push → Vercel يشغّل `npm run build` (يعيد التوليد ويضمن التطابق) → النشر.
