# FemSeha — Reusable SEO + Google Images Playbook

هذا الملف يوثق النسخة التي تم اعتمادها للموقع، حتى يمكن تطبيق نفس المنهج لاحقًا على موقع آخر بدون البدء من الصفر.

## المرجع الأساسي

- Repository: `femseha/femseha`
- Stable main commit: `9a368fe01143aca92714ffe7934305fa357764d9`
- Exact snapshot branch: `snapshot-femseha-seo-images-2026-10-08`
- Deployment target: GitHub → Cloudflare Pages → domain
- Vercel: لا نعتمد عليه في البناء أو النشر.

## ما تم تنفيذه

### 1. فهرسة الصور في Google Images
- صور مخصصة للمقالات ذات الأولوية داخل `public/images/seo/`.
- أسماء ملفات وصفية بدل الأسماء العامة.
- أبعاد الصور المخصصة: 1200×675.
- ALT طبيعي ومحدد للسياق.
- `title` للصورة الرئيسية.
- الصورة الرئيسية تظهر مباشرة داخل HTML باستخدام `<img>` وليس CSS background.

### 2. SEO للصفحات والمقالات
- `robots`: index, follow, max-image-preview:large.
- OG image وTwitter image لكل صفحة عند توفر صورة مناسبة.
- `primaryImageOfPage` في البيانات المنظمة.
- Article structured data يستخدم `image` للصورة الرئيسية.
- استبعاد الصور العامة مثل `banner.*` و`dr-haitham-hero.*` من أن تكون الصورة الرئيسية لمقال.

### 3. Image Sitemap
- السكربت: `scripts/generate-image-sitemap.mjs`
- أمر التشغيل: `npm run image-sitemap`
- البناء الكامل يشغله تلقائيًا قبل sitemap وVite.
- `robots.txt` يشير إلى:
  `https://femseha.com/image-sitemap.xml`

### 4. SSR / Prerender
- `entry-server.tsx` يمرر الصورة المناسبة للصفحة.
- `scripts/prerender.mjs` يضع الصورة الصحيحة في metadata.
- الهدف أن تكون بيانات الصورة موجودة في HTML الذي يصل لمحركات البحث.

### 5. حماية الفهرسة
- تم إصلاح مشكلة SPA catch-all التي كانت تجعل روابط غير موجودة ترجع 200.
- توجد 404 حقيقية مع `noindex,follow`.
- توجد redirects قديمة إلى الصفحات الحالية.
- Cloudflare يستخدم `public/_redirects`.

## عند تطبيق النظام على موقع جديد

1. انسخ منطق Image SEO، وليس أسماء الصفحات الخاصة بـ FemSeha.
2. أنشئ مجلد صور SEO مخصص.
3. اربط كل صفحة رئيسية بصورة واحدة واضحة وALT طبيعي.
4. أضف image sitemap مولدًا أثناء build.
5. أضف sitemap الصورة إلى robots.txt.
6. تأكد أن الصور قابلة للوصول مباشرة من Googlebot.
7. استخدم Article/WebPage structured data مع image.
8. اختبر HTML النهائي بعد build.
9. انشر فقط عبر GitHub → Cloudflare Pages.
10. بعد النشر افحص الصفحات الأساسية في Google Search Console.

## قاعدة مهمة

لا نكرر الكلمات المفتاحية داخل ALT بشكل مصطنع. الصورة والصفحة والنص المحيط بها يجب أن تكون متطابقة موضوعيًا، والهدف هو مساعدة Google على فهم الصورة وليس حشو الكلمات المفتاحية.

## الملفات الأساسية في هذا المشروع

- `src/data/image-seo-overrides.ts`
- `src/lib/seo.ts`
- `src/lib/article-media.ts`
- `src/pages/ArticleView.tsx`
- `src/pages/ClusterPage.tsx`
- `src/data/cluster-pages.ts`
- `src/entry-server.tsx`
- `scripts/prerender.mjs`
- `scripts/generate-image-sitemap.mjs`
- `public/images/seo/`
- `public/robots.txt`
- `public/_redirects`
- `public/404.html`
- `package.json`

## حالة Vercel

لا نستخدم Vercel في خطة النشر. وجود check قديم باسم Vercel في GitHub لا يعني أن النشر يعتمد عليه. المسار المعتمد هو Cloudflare Pages.
