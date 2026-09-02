#!/usr/bin/env node
/**
 * اختبار عرض فعلي لكل مسارات الموقع عبر Vite SSR loader.
 * يرصد أي انهيار (crash) في مكوّنات الصفحات قبل النشر.
 * التشغيل: node scripts/ssr-verify.mjs
 */
import { createServer } from 'vite';

const ROUTES = [
  '/',
  '/articles',
  '/articles/cytotec-misoprostol-saudi-riyadh-guide',
  '/articles/cytotec-gulf-kuwait-bahrain-uae-protocols',
  '/articles/pcos-symptoms-fertility-treatment',
  '/articles/importance-of-regular-medical-checkups',
  '/articles/healthy-lifestyle-and-balanced-nutrition-guide',
  '/articles/how-stress-affects-physical-health',
  '/articles/summer-health-and-heat-safety-tips',
  '/articles/managing-chronic-sleep-disorders',
  '/articles/مقال-غير-موجود',
  '/doctor',
  '/consultation',
  '/medical-disclaimer',
  '/admin',
  '/صفحة-غير-موجودة'
];

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error'
});

let failures = 0;
const { renderRoute } = await server.ssrLoadModule('/scripts/ssr-entry.tsx');

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

// فحوصات محتوى أساسية
const home = renderRoute('/');
const checks = [
  ['الصفحة الرئيسية تعرض اسم المنصة', home.includes('منصة فصيحة الطبية')],
  ['الصفحة الرئيسية تعرض المقالات', home.includes('أحدث المقالات الطبية')],
  ['الصفحة الرئيسية تعرض مقال سايتوتك', home.includes('سايتوتك في السعودية والرياض')],
  ['روابط المقالات موجودة', home.includes('/articles/cytotec-misoprostol-saudi-riyadh-guide')]
];
const articles = renderRoute('/articles');
checks.push(['صفحة الأدلة تعرض عنوان المكتبة', articles.includes('الأدلة السريرية والاستشارات الطبية')]);
checks.push(['صفحة الأدلة تعرض شارة المكتبة', articles.includes('مكتبة طبية بإشراف طبي')]);
const article = renderRoute('/articles/cytotec-misoprostol-saudi-riyadh-guide');
checks.push(['صفحة المقال تعرض العنوان', article.includes('سايتوتك في السعودية والرياض')]);
checks.push(['صفحة المقال تعرض إخلاء المسؤولية', article.includes('إخلاء مسؤولية طبية')]);
checks.push(['صفحة المقال تعرض الاستشارة', article.includes('استشارة واتساب')]);
checks.push(['صفحة المقال تعرض الروابط الداخلية', article.includes('اقرئي أيضاً')]);
const doctor = renderRoute('/doctor');
checks.push(['صفحة الطبيب تعرض الاسم', doctor.includes('د. هيثم الخطيب')]);
checks.push(['صفحة الطبيب تعرض الاختصاص', doctor.includes('جراحة النساء والتوليد')]);
const notFound = renderRoute('/صفحة-غير-موجودة');
checks.push(['صفحة 404 تعمل', notFound.includes('الصفحة غير موجودة')]);
const admin = renderRoute('/admin');
checks.push(['لوحة الإدارة تعرض تسجيل الدخول', admin.includes('لوحة الإدارة والتحكم')]);

for (const [name, ok] of checks) {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ✔ ${name}`);
}

await server.close();
console.log(failures === 0 ? '\nنتيجة اختبار العرض: نجاح كامل ✔' : `\nنتيجة اختبار العرض: ${failures} فشل ✖`);
process.exit(failures === 0 ? 0 : 1);
