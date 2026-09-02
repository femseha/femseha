#!/usr/bin/env node
/**
 * اختبار عرض فعلي لكل مسارات الموقع عبر Vite SSR loader.
 * يرصد أي انهيار (crash) في مكوّنات الصفحات قبل النشر.
 * المسارات تُشتق ديناميكياً من src/data/articles.json — كل مقال جديد
 * يُفحص تلقائياً في التشغيل التالي دون تحديث يدوي لهذه القائمة.
 * التشغيل: node scripts/ssr-verify.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';

const ARTICLES_PATH = path.resolve(process.cwd(), 'src/data/articles.json');
const articlesData = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf8'));
const articleRoutes = articlesData.map((a) => `/articles/${a.slug}`);

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
const invalidArticle = renderRoute('/articles/مقال-غير-موجود-اختبار');
checks.push(['slug غير صحيح يعرض 404 (منع soft-404)', invalidArticle.includes('الصفحة غير موجودة')]);
checks.push([
  'slug غير صحيح لا يسقط إلى مقال آخر (لا fallback لأول مقال)',
  !invalidArticle.includes(articlesData[0].title)
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
