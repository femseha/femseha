#!/usr/bin/env node
/**
 * اختبار عرض فعلي لكل مسارات الموقع عبر Vite SSR loader.
 * يرصد أي انهيار (crash) في مكوّنات الصفحات قبل النشر.
 * المسارات تُشتق من مصدر المقالات الفعلي في src/data/articles.ts،
 * بما في ذلك المقالات المضافة عبر جميع دفعات SEO والـoverrides.
 * التشغيل: node scripts/ssr-verify.mjs
 */
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error'
});

let failures = 0;
const { renderRoute } = await server.ssrLoadModule('/scripts/ssr-entry.tsx');
const { articles } = await server.ssrLoadModule('/src/data/articles.ts');
const articleRoutes = articles.map((article) => `/articles/${article.slug}`);

const ROUTES = [
  '/',
  '/articles',
  ...articleRoutes,
  '/مقال-غير-موجود-اختبار',
  '/doctor',
  '/consultation',
  '/medical-disclaimer',
  '/admin',
  '/صفحة-غير-موجودة'
];

for (const route of ROUTES) {
  try {
    const html = renderRoute(route);
    const ok = typeof html === 'string' && html.length > 400;
    if (!ok) failures++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${route}  (${html.length} محارف)`);
  } catch (e) {
    failures++;
    console.log(`ERROR ${route}  →  ${e.message}`);
  }
}

// فحوصات محتوى أساسية متوافقة مع النصوص الحالية، دون ربط الاختبار بعبارات قديمة.
const home = renderRoute('/');
const checks = [
  ['الصفحة الرئيسية تعرض اسم المنصة', home.includes('FemSeha')],
  ['الصفحة الرئيسية تعرض المقالات', home.includes('/articles')],
  ['الصفحة الرئيسية تعرض محور سايتوتك السعودي', home.includes('سايتوتك في السعودية')],
  ['روابط المقالات موجودة', home.includes('/articles/cytotec-misoprostol-saudi-riyadh-guide')]
];
const articlesPage = renderRoute('/articles');
checks.push(['صفحة الأدلة تعرض عنوان المكتبة', articlesPage.includes('الأدلة السريرية والاستشارات الطبية')]);
checks.push(['صفحة الأدلة تعرض شارة المكتبة', articlesPage.includes('مكتبة طبية بإشراف طبي')]);

const targetArticle = articles.find((item) => item.slug === 'cytotec-misoprostol-saudi-riyadh-guide');
const article = renderRoute('/articles/cytotec-misoprostol-saudi-riyadh-guide');
checks.push(['صفحة المقال تعرض العنوان', Boolean(targetArticle?.title) && article.includes(targetArticle.title));
checks.push(['صفحة المقال تعرض إخلاء المسؤولية', article.includes('إخلاء مسؤولية طبية')]);
checks.push(['صفحة المقال تعرض الاستشارة', article.includes('استشارة واتساب')]);
checks.push(['صفحة المقال تعرض الروابط الداخلية', article.includes('اقرئي أيضاً')]);

const doctor = renderRoute('/doctor');
checks.push(['صفحة الطبيب تعرض الاسم', doctor.includes('د. هيثم الخطيب')]);
checks.push(['صفحة الطبيب تعرض الاختصاص', doctor.includes('جراحة النساء والتوليد')]);

const notFound = renderRoute('/صفحة-غير-موجودة');
checks.push(['صفحة 404 تعمل', notFound.includes('الصفحة غير موجودة')]);
const invalidArticle = renderRoute('/articles/مقال-غير-موجود-اختبار');
checks.push(['slug غير صحيح يعرض 404 (منع soft-404)', invalidArticle.includes('الصفحة غير موجودة')]);
checks.push([
  'slug غير صحيح لا يسقط إلى مقال آخر (لا fallback لأول مقال)',
  !targetArticle?.title || !invalidArticle.includes(targetArticle.title)
]);
const admin = renderRoute('/admin');
checks.push(['لوحة الإدارة تعرض تسجيل الدخول', admin.includes('لوحة الإدارة والتحكم')]);

for (const [name, ok] of checks) {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ✔ ${name}`);
}

await server.close();
console.log(failures === 0 ? '\nنتيجة اختبار العرض: نجاح كامل ✔' : `\nنتيجة اختبار العرض: ${failures} فشل ✖`);
process.exit(failures === 0 ? 0 : 1);
