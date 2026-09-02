# SEO Master Audit — منصة FemSeha | فيم صحة
**التاريخ:** 2026-09-03 &nbsp;|&nbsp; **الفرع:** `arena/01a06428-femseha` &nbsp;|&nbsp; **الأساس:** `main` بعد دمج PR #3 (commit `bb7041a`)

> نطاق المهمة: تنظيف SEO تقني وon-page وschema وبنية محتوى، **مع الحفاظ الحرفي على التصميم المعتمد** — بلا إعادة بناء Homepage، بلا مقالات جديدة، بلا حذف URLs، بلا بيانات GSC مختلقة، وبلا أي محتوى تجاري/جرعات لأدوية Cytotec/Misoprostol.

---

## 1) الحالة قبل التنظيف (Baseline)

| البند | الحالة قبل |
|---|---|
| Build (`npm run build`) | PASS |
| TypeScript (`tsc --noEmit`) | **FAIL** — ~25 خطأ، جميعها في ملفات قديمة ميتة غير مربوطة بالتطبيق |
| SSR verify | PASS |
| SEO validator | PASS شكلي — كان يفحص وجود الملفات وعدد الكلمات فقط |
| H1 في الصفحة الرئيسية | **لا يوجد أي H1** (العناوين تبدأ من H2) |
| ALT الصور | Header: `alt="Femseha Logo"`، Home: `alt="Logo"` و`alt="بانر د. هيثم"`، Footer: `alt="Femseha"` — أوصاف غير دقيقة |
| keyword-map.json | يحتوي **أرقام GSC مختلقة** مولّدة آلياً (position 4 / 15000 impressions / 1800 clicks / 12% CTR لكل كلمة بلا استثناء) |
| محتوى المقالات | كل مقال محشو بفقرة متطابقة مكررة **6–11 مرة** لبلوغ 1500 كلمة (duplicate-content spam) |
| dateModified | Schema يرسل `dateModified = publishDate` تلقائياً (تاريخ تعديل مخترع) |
| Brand | ثلاث صيغ متضاربة: «فيم صحة | Femseha»، «Femseha | منصة د. هيثم الخطيب»، «منصة فصيحة الطبية» |
| DOCTOR.profession | خطأ إملائي: «اختص**صا**صي» |
| الروابط الداخلية (related) | 13 إشارة إلى slugs **غير منشورة** (مقالات مخططة لم تُكتب بعد) |
| useSeo() | ثغرات تسرب metadata بين التنقلات (تفاصيل §7) |
| الصور | banner.jpg.png = **2.26MB**، logo.png.png = **1.13MB** بلا أي نسخ محسنة |
| آثار قديمة | 10 صفحات + 8 مكونات + ملفا بيانات ميتة من تصميم سابق، بعضها يشير إلى دومين قديم `sehaher.com` |

---

## 2) المشاكل المكتشفة (Audit كامل)

### أ. بيانات SEO غير موثقة (حرِجة)
- `src/data/keyword-map.json`: جميع الإدخالات الـ11 تحمل نفس الأرقام حرفياً (`currentPosition: 4, impressions: 15000, clicks: 1800, ctr: 12.0%`). المصدر: سطر ثابت في `scripts/rebuild-seo-content.mjs` — **لا يوجد أي ملف/تصدير GSC في المستودع**. اعتُبرت مختلقة وأزيلت.
- حقل `searchIntent` كان مقصوصاً آلياً عند 80 محرفاً (جمل مبتورة).

### ب. حشو محتوى مكرر (حرِجة — Panda-type signal)
`scripts/expand-articles-1500.mjs` كان يكرر كتلة «إضاءات طبية إضافية وإرشادات سريرية» (المتضمنة الكلمة المفتاحية) حتى بلوغ 1500 كلمة:

| المقال | كتل الحشو | كلمات قبل | كلمات فريدة بعد |
|---|---|---|---|
| cytotec-misoprostol-saudi-riyadh-guide | 6 | 1606 | 931 |
| cytotec-gulf-kuwait-bahrain-uae-protocols | 8 | 1583 | 638 |
| pcos-symptoms-fertility-treatment | 8 | 1544 | 592 |
| delayed-period-causes-besides-pregnancy | 9 | 1607 | 527 |
| subchorionic-hematoma-pregnancy-guide | 8 | 1515 | 556 |
| nuchal-cord-pregnancy-safety-guide | 9 | 1589 | 485 |
| importance-of-regular-medical-checkups | 9 | 1506 | 426 |
| healthy-lifestyle-and-balanced-nutrition-guide | 10 | 1561 | 328 |
| how-stress-affects-physical-health | 10 | 1532 | 299 |
| summer-health-and-heat-safety-tips | 10 | 1503 | 279 |
| managing-chronic-sleep-disorders | 11 | 1624 | 274 |

### ج. Homepage
- لا H1 إطلاقاً؛ ALT الصور عامة وغير وصفية.

### د. Schema/JSON-LD
- `dateModified` مخترع (يساوي publishDate دائماً).
- `readTime` (يغذي `timeRequired` في Schema) كان محسوباً على المحتوى المحشو — لا يطابق المحتوى الظاهر.
- أسماء المؤسسة/الموقع غير موحدة بين `index.html` و`site.ts`.
- عند التنقل إلى صفحة بلا jsonLd كانت Schema الصفحة السابقة **تبقى محقونة** في `<head>`.

### هـ. useSeo() — تسرب metadata بين التنقلات
1. JSON-LD القديم لا يُزال إلا إذا مررت الصفحة الجديدة jsonLd.
2. وسم `keywords` يبقى من صفحة سابقة إلى الأبد.
3. `title`/`description` لا يُعاد ضبطهما عند غيابهما (يبقيان من الصفحة السابقة).

### و. ادعاءات غير موثقة
- شارة الهيدر «طبي معتمد»، الفوتر «المرجع الطبي السريري **المعتمد**»، شارة صفحة الأدلة «المكتبة الطبية **المعتمدة**»، وملخص مقال سايتوتك «دليل طبي سريري **معتمد**» — بلا جهة اعتماد موثقة.
- لم يُعثر على «نسبة نجاح» أو «نتائج مضمونة» أو «الأفضل» في المحتوى المنشور. ✔

### ز. آثار صفحات/كود قديم
- 21 ملفاً ميتاً (صفحات/مكونات/بيانات) من تصميم قديم، غير مستورد من التطبيق الحي، بعضها يحمل دوميناً قديماً `sehaher.com` وواجهات `useSeo` قديمة غير متوافقة — وكانت مصدر كل أخطاء TypeScript.
- ملفات مكررة في جذر المستودع: `banner.jpg.png`، `logo.png.png`، `generated-articles.ts` (نسخ من public/ و src/data/).

---

## 3) ما تم إصلاحه

| # | الإصلاح | الملفات |
|---|---|---|
| 1 | توحيد Brand إلى **«FemSeha | فيم صحة»** في `SITE.name/title` وSchema (WebSite/MedicalOrganization/publisher) و`og:site_name` — دون المساس بالشعار المرئي في الهيدر | `src/data/site.ts`, `index.html`, (`seo.ts` يقرأ من SITE) |
| 2 | تصحيح «اختصصاصي» → «اختصاصي» | `src/data/site.ts` |
| 3 | H1 حقيقي وحيد للصفحة الرئيسية: «FemSeha لصحة المرأة والحمل والخصوبة بإشراف د. هيثم الخطيب» — بوسم `sr-only` (موجود في DOM ودلالي، **صفر تأثير بصري**) | `src/pages/HomePage.tsx` |
| 4 | ALT دقيق: اللوجو «FemSeha لصحة المرأة بإشراف د. هيثم الخطيب»، البانر «د. هيثم الخطيب - استشارات طب النساء والتوليد وصحة المرأة»، لوجو الهيدر/الفوتر «شعار FemSeha | فيم صحة» | `HomePage.tsx`, `App.tsx` |
| 5 | إزالة الادعاءات: «طبي معتمد»→«بإشراف طبي»، «المرجع...المعتمد»→«مرجع طبي تثقيفي»، «المكتبة الطبية المعتمدة»→«مكتبة طبية بإشراف طبي»، «دليل طبي سريري معتمد»→«دليل طبي تثقيفي» (نص فقط، بلا تغيير تصميم) | `App.tsx`, `ArticlesPage.tsx`, `ArticleView.tsx`, `articles.json` |
| 6 | إصلاح useSeo(): تنظيف JSON-LD دائماً بين التنقلات، إزالة keywords المتسربة، ضبط title/description بقيم افتراضية | `src/lib/seo.ts` |
| 7 | دعم `modifiedDate` في `ArticleRecord` + Schema يرسل `dateModified` **فقط عند وجوده الحقيقي** (لا اختراع تواريخ) | `types.ts`, `seo.ts` |
| 8 | إزالة الحشو المكرر: كل كتلة «إضاءات طبية...» احتُفظ بنسخة **واحدة** منها (لا إعادة كتابة، لا حذف معلومات فريدة) + إعادة حساب `readTime` ليطابق المحتوى الفعلي | `articles.json` |
| 9 | إعادة بناء keyword-map كمرجع استراتيجي: `keyword/searchIntent/country/currentUrl/targetUrl/priority/action` + سياسة بيانات تمنع مقاييس GSC بلا `gscSource` — **أزيلت كل الأرقام المختلقة** | `keyword-map.json` |
| 10 | إصلاح الروابط الداخلية: `related` تشير الآن **فقط** لمقالات منشورة، موزعة حسب العناقيد (§6) | `articles.json` |
| 11 | تعطيل السكربتين التاريخيين المدمرين (حارس `FORCE_REBUILD=1`) + إزالة مولد الأرقام المختلقة من rebuild | `expand-articles-1500.mjs`, `rebuild-seo-content.mjs` |
| 12 | حذف 21 ملف كود ميت (صفحات/مكونات/بيانات التصميم القديم غير المستوردة + `generated-articles.ts` الجذري) → **صفر أخطاء TypeScript** | `src/pages/*`, `src/components/*`, `src/data/{topics,sources}.ts` |
| 13 | تفريغ المقال الوهمي `sample-medical-article` من طبقة التوافق القديمة | `src/data/generated-articles.ts` |
| 14 | صور محسنة: `banner.webp` (2.26MB→**161KB**)، `logo.webp` (1.13MB→**10KB**, 320px) عبر `<picture>` مع الإبقاء الكامل على الأصول وروابطها | `public/*.webp`, `HomePage.tsx`, `App.tsx` |
| 15 | Validator جديد يفحص المحتوى فعلياً (§9) | `scripts/seo-validate.mjs` |
| 16 | مزامنة خطة المحتوى مع الواقع: 3 مقالات منشورة أُضيفت إلى `existingCoverage` ونُقل المنشور منها خارج `queue` | `content-map.json` |

## 4) ما لم يتم إصلاحه ولماذا

| البند | السبب |
|---|---|
| **نص البانر نفسه** يحتوي «جرعة ومواصفات معتمدة — 1 حبة 200 ميكروغرام» و«طريقة استخدام حبوب سايتوتك المعتمدة» | البانر جزء من التصميم المعتمد الممنوع تغييره؛ لكن محتواه **يتعارض مع سياسة اليوم (لا جرعات)** — قرار استبداله للمالك (Phase 2، أولوية عالية) |
| المحتوى الفريد للمقالات قصير بعد إزالة الحشو (274–931 كلمة) | التوسيع = إعادة كتابة محتوى طبي، خارج نطاق المهمة («لا مقالات جديدة/لا إعادة كتابة») — Phase 2 |
| صورة كل مقال هي نفس البانر (`image: banner.jpg.png` للجميع) | تغيير الصور ممنوع؛ Phase 2: صور مميزة لكل مقال |
| نسخ الصور المكررة في جذر المستودع (`banner.jpg.png`, `logo.png.png` ~3.7MB) | ملفات ثنائية لا تؤثر على الموقع المنشور؛ تُركت لتجنب أي لمس للصور — يُنصح بإزالتها في Phase 2 |
| كلمة المرور الإدارية مكتوبة في مصدر `AdminPage.tsx` | مشكلة أمنية لا SEO؛ خارج النطاق — يجب نقلها خارج الكود (Phase 2) |
| عبارات تسويقية خفيفة في وصف الخدمات («بروتوكولات متطورة») | ضمن حدود الوصف المقبول ولم تُدرج في قائمة الادعاءات الممنوعة؛ تغييرها = تغيير محتوى تصميمي |
| `title` المقالات طويل (>70 محرفاً لبعض العناوين) | تقصيرها يتطلب تغيير H1 المقالات (إعادة كتابة) — يكتفى بتحذير Validator، Phase 2 |

---

## 5) URL Inventory (من المستودع — 16 URL قابلاً للفهرسة + 1 محجوب)

| URL | النوع | canonical | في sitemap | ملاحظة |
|---|---|---|---|---|
| `/` | رئيسية | ذاتي ✔ | ✔ | H1 جديد sr-only |
| `/articles` | فهرس | ذاتي ✔ | ✔ | |
| `/doctor` | تعريفية | ذاتي ✔ | ✔ | |
| `/consultation` | خدمية | ذاتي ✔ | ✔ | |
| `/medical-disclaimer` | قانونية | ذاتي ✔ | ✔ | |
| `/articles/cytotec-misoprostol-saudi-riyadh-guide` | مقال (Pillar) | ذاتي ✔ | ✔ | |
| `/articles/cytotec-gulf-kuwait-bahrain-uae-protocols` | مقال (Support) | ذاتي ✔ | ✔ | |
| `/articles/pcos-symptoms-fertility-treatment` | مقال | ذاتي ✔ | ✔ | |
| `/articles/delayed-period-causes-besides-pregnancy` | مقال | ذاتي ✔ | ✔ | |
| `/articles/subchorionic-hematoma-pregnancy-guide` | مقال | ذاتي ✔ | ✔ | |
| `/articles/nuchal-cord-pregnancy-safety-guide` | مقال | ذاتي ✔ | ✔ | |
| `/articles/importance-of-regular-medical-checkups` | مقال | ذاتي ✔ | ✔ | |
| `/articles/healthy-lifestyle-and-balanced-nutrition-guide` | مقال | ذاتي ✔ | ✔ | |
| `/articles/how-stress-affects-physical-health` | مقال | ذاتي ✔ | ✔ | |
| `/articles/summer-health-and-heat-safety-tips` | مقال | ذاتي ✔ | ✔ | |
| `/articles/managing-chronic-sleep-disorders` | مقال | ذاتي ✔ | ✔ | |
| `/admin` | إدارة | — | ✖ (مقصود) | محجوب في robots ✔ |

**لم يُحذف أي URL. لم يُغيّر أي slug. لم يُنشأ أي redirect** (لا يوجد مصدر/هدف متعارض يستدعيه).

---

## 6) Cytotec Keyword Map + Cannibalization Findings

### خريطة العنقود
| الدور | URL | Primary keyword |
|---|---|---|
| **Primary pillar** | `/articles/cytotec-misoprostol-saudi-riyadh-guide` | سايتوتك في السعودية |
| **Supporting (جغرافي خليجي)** | `/articles/cytotec-gulf-kuwait-bahrain-uae-protocols` | سايتوتك في الخليج |
| Supporting (نزيف الحمل/علامات الخطر) | `/articles/subchorionic-hematoma-pregnancy-guide` | التجمع الدموي حول كيس الحمل |
| Supporting (متابعة طبية) | `/articles/importance-of-regular-medical-checkups` | أهمية الفحص الدوري |

### نتائج فحص التنافس (Cannibalization)
- **لا توجد صفحات مكررة** لموضوع Cytotec/Misoprostol في المستودع؛ صفحتان فقط بزاويتين جغرافيتين مختلفتين (SA vs GCC) وكلمتين أساسيتين مختلفتين → **لا cannibalization فعلي**، لذا **لم يُنفذ أي redirect أو canonical عابر** (كان سيكون تخميناً).
- لا توجد slugs قديمة لسايتوتك في الكود أو sitemap أو المحتوى.
- slugs مخططة ذات صلة في queue (لم تُنشأ): `abortion-medications-overview`, `ectopic-pregnancy-warning-signs`, `counterfeit-medicines-dangers` — عند نشرها يجب ربطها بالركيزة (Phase 2).
- Validator الجديد يفرض تفرد `primaryKeyword` بين المقالات وبين إدخالات keyword-map (منع تنافس مستقبلي).

### فحص YMYL/السلامة الطبية لمحتوى Cytotec ✔
المحتوى الحالي **تعليمي تحذيري بالكامل**: لا بيع، لا أسعار، لا أسماء بائعين/صيدليات، لا مصادر شراء، لا جرعات شخصية، لا تعليمات ذاتية للإجهاض، لا وعود نتائج. عبارات مثل «حبوب سايتوتك للبيع» ترد **حصراً كتحذير من البحث عنها**. Validator يفحص الآن أنماطاً تجارية ممنوعة تلقائياً.

### الربط الداخلي حسب العناقيد (المنفذ ضمن المقالات المنشورة فقط)
- **Cytotec:** Saudi pillar ↔ Gulf ↔ نزيف الحمل (subchorionic) ↔ المتابعة الطبية (checkups)
- **تأخر الدورة:** delayed-period ↔ PCOS ↔ الضغوط النفسية ↔ المتابعة الطبية
- **نزيف الحمل:** subchorionic ↔ nuchal-cord ↔ Saudi pillar ↔ المتابعة الطبية
- أُزيلت 13 إشارة `related` كانت تشير لمقالات **غير منشورة** (توثيقها أعلاه؛ تُعاد عند نشر تلك المقالات).

---

## 7) حالة الأنظمة

- **Sitemap:** متطابق 100% بالاتجاهين مع الـ16 URL المنشورة (يتحقق منه Validator آلياً). `lastmod` يطابق publishDate/modifiedDate. لا URLs زائدة ولا ناقصة ولا محجوبة.
- **Robots:** `Allow: /`، `Disallow: /admin`، `Disallow: /search`، `Sitemap: https://femseha.com/sitemap.xml` — بلا أي حجب للمقالات أو assets. ✔ (لم يتغير — كان سليماً)
- **Canonical:** ذاتي لكل صفحة، فريد، ولا canonicals عابرة (لا يوجد ما يبررها). `vercel.json` rewrite للـSPA سليم (الملفات الثابتة تُخدم قبل الـrewrite).
- **Schema:** ثابت في index.html: WebSite + MedicalOrganization + Physician (JSON صالح). ديناميكي لكل مقال: MedicalWebPage (+dateModified الصادق) + BreadcrumbList + FAQPage (فقط عند وجود FAQ فعلي — الـ11 مقالاً جميعها لديها FAQ حقيقي) + Physician author/reviewedBy + MedicalOrganization publisher. لا Schema وهمي.
- **H1:** واحد بالضبط في كل صفحة قابلة للفهرسة (يتحقق منه Validator عبر عرض SSR فعلي لكل مسار).
- **ALT:** كل الصور المعروضة تحمل ALT وصفياً؛ لا صور بلا alt (فحص SSR آلي). صورة المقال تستخدم عنوان المقال كـALT.
- **الأداء:** LCP المتوقع للصفحة الرئيسية تحسن جذرياً — البانر من 2.26MB إلى 161KB WebP (−93%)، واللوجو المحمل في كل صفحة من 1.13MB إلى 10KB (−99%) مع فولباك PNG كامل للأصول وعدم كسر أي URL قديم.

## 8) قدرات الـValidator الجديد (`scripts/seo-validate.mjs`)
فحص فعلي (SSR rendering + تحليل مصادر + بيانات): H1 مفقود/متعدد لكل مسار، titles مفقودة/طويلة/قصيرة/مكررة، descriptions مفقودة/مكررة، canonical مفقود/مكرر/غير ذاتي، ALT مفقود، slugs مكررة، صفحات يتيمة، روابط داخلية مكسورة (HTML + Markdown)، تطابق sitemap بالاتجاهين، سلامة robots، وجود Schema وسلامة JSON-LD، إشارات cannibalization، **مقاييس SEO غير موثقة في keyword-map (ترفض impressions/clicks/ctr/position بلا gscSource)**، عدد كلمات، كشف فقرات الحشو المكررة، اتساق modifiedDate، وأنماط تجارية ممنوعة في محتوى YMYL.

## 9) نتائج الاختبارات النهائية

| الاختبار | النتيجة |
|---|---|
| `npm run build` (Vite) | **PASS** ✔ (bundle: 345KB / gzip 95.7KB — كان 486KB) |
| `npx tsc --noEmit` | **PASS** ✔ (كان 25+ خطأ) |
| `node scripts/seo-validate.mjs` | **PASS** ✔ — أخطاء=0، تحذيرات=10 (كلها «محتوى <800 كلمة» الموثقة لـPhase 2) |
| `node scripts/ssr-verify.mjs` | **PASS** ✔ — 16/16 مساراً + 14/14 فحص محتوى |
| Broken links / sitemap errors / canonical errors | **صفر** ✔ |

## 10) توصيات Phase 2 (بالأولوية)
1. **استبدال البانر** بنسخة بلا نص جرعات («1 حبة 200 ميكروغرام») — تعارض مباشر مع سياسة YMYL المعلنة.
2. **توسيع حقيقي** للمقالات دون 800 كلمة (خاصة عنقود سايتوتك: Gulf 638، والركيزة 931) بمحتوى طبي فريد موثق المصادر.
3. نشر مقالات الدعم المخططة وربطها بالعناقيد: علامات الخطر في الحمل، الحمل خارج الرحم، الأدوية المقلدة، اختبار الحمل المنزلي، أعراض الحمل المبكرة.
4. ربط الموقع بـGoogle Search Console وتغذية keyword-map بأرقام حقيقية عبر حقل `gscSource`.
5. Pre-rendering/SSG للمسارات الـ16 (ضمن Vite، دون Next.js) لتحسين فهرسة SPA؛ إزالة تحميل Tailwind CDN المزدوج في index.html.
6. صورة مميزة (OG/featured) لكل مقال بدل البانر الموحد + `favicon` مضغوط (219KB حالياً).
7. نقل كلمة مرور لوحة الإدارة خارج الكود المصدري.
8. حذف نسخ الصور المكررة من جذر المستودع (~3.7MB).
9. تقصير عناوين المقالات الجديدة إلى ≤70 محرفاً لوسم `<title>`.
